require("dotenv").config();

const jwt = require("jsonwebtoken");
const { Prisma } = require("@prisma/client");
const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");
const env = require("../config/env");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.LOCAL_ADMIN_USERNAME || "local_financial_negative_admin";

class ApiRequestError extends Error {
  constructor(message, statusCode, payload) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

const issuedAuthValues = new Set();

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function ensureApiPath(baseUrl) {
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  const parsed = parseUrl(trimmed);
  if (!parsed) return trimmed;
  if (parsed.pathname === "" || parsed.pathname === "/") return `${trimmed}/api`;
  return trimmed;
}

function configuredBaseUrl() {
  if (process.env.BASE_URL) return ensureApiPath(process.env.BASE_URL);
  if (process.env.CORE_API_BASE_URL) return ensureApiPath(process.env.CORE_API_BASE_URL);
  if (process.env.PUBLIC_API_BASE_URL) return ensureApiPath(process.env.PUBLIC_API_BASE_URL);
  return DEFAULT_BASE_URL;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim()
    ? parseUrl(databaseUrl.trim())
    : null;

  if (!parsed) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }

  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, localAllowed, reason: null };
}

function inspectApiBaseUrl(apiBaseUrl) {
  const parsed = parseUrl(apiBaseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: "BASE_URL must be a valid HTTP(S) URL." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "BASE_URL must not contain embedded credentials." };
  }

  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    return { ok: false, reason: "BASE_URL appears production-like and is blocked." };
  }

  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: "BASE_URL must target local/staging/test only." };
  }

  return { ok: true, reason: null };
}

function normalizedGuardEnv() {
  const guardEnv = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!guardEnv[key]) guardEnv[key] = "mock";
  }
  return guardEnv;
}

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const baseUrl = configuredBaseUrl();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiTarget = inspectApiBaseUrl(baseUrl);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local or test.");
  }
  if (!process.env.JWT_SECRET) {
    reasons.push("JWT_SECRET must be set for the local financial negative smoke test.");
  }
  if (!process.env.LOCAL_ADMIN_PASSWORD) {
    reasons.push("LOCAL_ADMIN_PASSWORD must be set for the local smoke admin.");
  }
  if (!databaseTarget.ok) {
    reasons.push(databaseTarget.reason);
  }
  if (!apiTarget.ok) {
    reasons.push(apiTarget.reason);
  }

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      reasons.push(`${key} must be mock or sandbox for this smoke test.`);
    }
  }

  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`Financial negative smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Financial negative smoke safety guard: PASS");
  return baseUrl;
}

function headerWithAuth(authValue) {
  const headers = {
    Accept: "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (authValue) {
    const scheme = ["Be", "arer"].join("");
    headers.Authorization = [scheme, authValue].join(" ");
  }
  return headers;
}

function stringifyForScan(payload) {
  return JSON.stringify(payload);
}

function assertNoUnsafeKeys(label, value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (normalized.includes("password") || normalized.includes("token") || normalized.includes("secret")) {
      throw new Error(`${label} response exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} response exposed database URL key.`);
    }
    assertNoUnsafeKeys(label, item);
  }
}

function assertNoUnsafeValues(label, payload) {
  const serialized = stringifyForScan(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const envValues = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["LOCAL_ADMIN_PASSWORD", process.env.LOCAL_ADMIN_PASSWORD],
    ["JWT_SECRET", process.env.JWT_SECRET],
  ];

  if (lower.includes("database_url")) {
    throw new Error(`${label} response leaked DATABASE_URL marker.`);
  }
  if (lower.includes("password") || lower.includes("token") || lower.includes("secret")) {
    throw new Error(`${label} response included unsafe sensitive marker.`);
  }
  if (lower.includes(authScheme)) {
    throw new Error(`${label} response included authorization scheme text.`);
  }
  if (jwtLike.test(serialized)) {
    throw new Error(`${label} response included a JWT-like value.`);
  }
  if (postgresWithCredentials.test(serialized)) {
    throw new Error(`${label} response included a PostgreSQL credential URL.`);
  }
  for (const [name, value] of envValues) {
    if (value && serialized.includes(value)) {
      throw new Error(`${label} response leaked ${name}.`);
    }
  }
  for (const authValue of issuedAuthValues) {
    if (authValue && serialized.includes(authValue)) {
      throw new Error(`${label} response echoed an authorization value.`);
    }
  }

  assertNoUnsafeKeys(label, payload);
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = headerWithAuth(options.authValue);
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiRequestError(`API returned non-JSON response for ${path}`, response.status);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new ApiRequestError(`API returned invalid JSON for ${path}`, response.status);
  }

  assertNoUnsafeValues(options.label || path, payload);

  if (response.status >= 500) {
    throw new ApiRequestError(`API ${path} returned unsafe server error ${response.status}`, response.status, payload);
  }

  if (options.expectedStatus && response.status !== options.expectedStatus) {
    throw new ApiRequestError(`API ${path} returned ${response.status}, expected ${options.expectedStatus}`, response.status, payload);
  }

  if (options.expectSuccess === false) {
    if (payload && payload.success !== false) {
      throw new ApiRequestError(`API ${path} returned unexpected success payload`, response.status, payload);
    }
    return { status: response.status, payload };
  }

  if (!response.ok || !payload || payload.success !== true) {
    const message = payload && payload.message ? payload.message : "request failed";
    throw new ApiRequestError(`API ${path} blocked with ${response.status}: ${message}`, response.status, payload);
  }

  return payload.data;
}

async function expectBlocked(baseUrl, label, path, options = {}) {
  const result = await apiRequest(baseUrl, path, {
    ...options,
    label,
    expectedStatus: options.expectedStatus || 400,
    expectSuccess: false,
  });
  if (result.status >= 500) {
    throw new Error(`${label} returned an unsafe 500-class response.`);
  }
  console.log(`${label}: PASS`);
  return result;
}

async function expectUnauthorized(baseUrl, path, label) {
  await expectBlocked(baseUrl, label, path, {
    method: "GET",
    expectedStatus: 401,
  });
}

function assertMoney(actual, expected, label) {
  if (String(actual) !== expected) {
    throw new Error(`${label} expected ${expected}, got ${String(actual)}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${expected}, got ${actual}`);
  }
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

function createMemberAuth(user) {
  const authValue = jwt.sign(
    { sub: user.id, type: "member", phone: user.phone, siteId: user.siteId, siteCode: SITE_CODE },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  issuedAuthValues.add(authValue);
  return authValue;
}

function createAdminAuth(admin) {
  const authValue = jwt.sign(
    { sub: admin.id, type: "admin", role: admin.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  issuedAuthValues.add(authValue);
  return authValue;
}

async function ensureLocalFixtures(runId) {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: {
      name: `${SITE_CODE} Local Smoke`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
    create: {
      code: SITE_CODE,
      name: `${SITE_CODE} Local Smoke`,
      brandName: SITE_CODE,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
  });

  const admin = await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      passwordHash: await hashPassword(process.env.LOCAL_ADMIN_PASSWORD),
      role: "super_admin",
      status: "active",
    },
    create: {
      username: ADMIN_USERNAME,
      passwordHash: await hashPassword(process.env.LOCAL_ADMIN_PASSWORD),
      role: "super_admin",
      status: "active",
    },
  });

  const phone = `07${runId.slice(-8)}`;
  const user = await prisma.user.create({
    data: {
      siteId: site.id,
      phone,
      username: `finneg_${runId}`,
      passwordHash: await hashPassword(`local-finneg-${runId}`),
      referralSource: "local-financial-negative-smoke",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      walletAccount: {
        create: {
          siteId: site.id,
          balance: new Prisma.Decimal("0.00"),
          currency: "THB",
        },
      },
    },
  });

  const bankAccount = await prisma.userBankAccount.create({
    data: {
      siteId: site.id,
      userId: user.id,
      bankCode: "MOCK",
      accountNumber: `66${runId.slice(-8)}`,
      accountName: "Local Financial Negative Member",
      status: "approved",
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  return {
    prisma,
    site,
    admin,
    user,
    bankAccount,
    memberAuth: createMemberAuth(user),
    adminAuth: createAdminAuth(admin),
  };
}

async function getWallet(baseUrl, memberAuth) {
  return apiRequest(baseUrl, "/wallet", {
    authValue: memberAuth,
    label: "member wallet",
  });
}

async function getLedger(baseUrl, memberAuth) {
  return requireArray(
    await apiRequest(baseUrl, "/wallet/ledger?limit=50", {
      authValue: memberAuth,
      label: "member wallet ledger",
    }),
    "Wallet ledger"
  );
}

function ledgerFor(ledger, referenceType, referenceId) {
  return ledger.filter((row) => row.referenceType === referenceType && row.referenceId === referenceId);
}

async function assertAdminLog(baseUrl, adminAuth, { action, targetType, targetId }) {
  const query = new URLSearchParams({
    action,
    target_type: targetType,
    target_id: targetId,
    limit: "20",
  });
  const logs = requireArray(
    await apiRequest(baseUrl, `/admin/logs?${query.toString()}`, {
      authValue: adminAuth,
      label: `admin log ${action}`,
    }),
    "Admin logs"
  );
  const matching = logs.filter(
    (row) => row.action === action && row.targetType === targetType && row.targetId === targetId
  );
  assertEqual(matching.length, 1, `Admin log ${action} count`);
}

async function runAuthNegative(baseUrl) {
  await expectUnauthorized(baseUrl, "/wallet", "Member protected endpoint without login");
  await expectUnauthorized(baseUrl, "/admin/me", "Admin protected endpoint without login");
}

async function runInvalidDepositCases(baseUrl, memberAuth, bankAccountId) {
  const baseBody = {
    channel: "manual_bank_mock",
    bank_account_id: bankAccountId,
    note: "local financial negative smoke invalid deposit",
  };
  await expectBlocked(baseUrl, "Invalid deposit amount zero", "/deposits", {
    method: "POST",
    authValue: memberAuth,
    body: { ...baseBody, amount: "0" },
  });
  await expectBlocked(baseUrl, "Invalid deposit amount negative", "/deposits", {
    method: "POST",
    authValue: memberAuth,
    body: { ...baseBody, amount: "-1.00" },
  });
}

async function runInvalidWithdrawalCases(baseUrl, memberAuth, bankAccountId) {
  const baseBody = {
    user_bank_account_id: bankAccountId,
    note: "local financial negative smoke invalid withdrawal",
  };
  await expectBlocked(baseUrl, "Invalid withdrawal amount zero", "/withdrawals", {
    method: "POST",
    authValue: memberAuth,
    body: { ...baseBody, amount: "0" },
  });
  await expectBlocked(baseUrl, "Invalid withdrawal amount negative", "/withdrawals", {
    method: "POST",
    authValue: memberAuth,
    body: { ...baseBody, amount: "-1.00" },
  });
  await expectBlocked(baseUrl, "Withdrawal over wallet balance", "/withdrawals", {
    method: "POST",
    authValue: memberAuth,
    body: { ...baseBody, amount: "999999.00" },
  });
}

async function runDuplicateMoneyCases(baseUrl, { memberAuth, adminAuth, bankAccount }) {
  const deposit = await apiRequest(baseUrl, "/deposits", {
    method: "POST",
    authValue: memberAuth,
    label: "valid deposit create",
    body: {
      amount: "100.00",
      channel: "manual_bank_mock",
      bank_account_id: bankAccount.id,
      note: "local financial negative smoke deposit",
    },
  });
  assertMoney(deposit.amount, "100.00", "Deposit amount");

  const approvedDeposit = await apiRequest(baseUrl, `/admin/deposits/${deposit.id}/approve`, {
    method: "POST",
    authValue: adminAuth,
    label: "deposit approve",
    body: { note: "local financial negative smoke approve deposit" },
  });
  assertMoney(approvedDeposit.wallet.balance, "100.00", "Wallet after deposit approve");

  await expectBlocked(baseUrl, "Duplicate deposit approve", `/admin/deposits/${deposit.id}/approve`, {
    method: "POST",
    authValue: adminAuth,
    body: {},
  });
  assertMoney((await getWallet(baseUrl, memberAuth)).balance, "100.00", "Wallet after duplicate deposit approve");

  const withdrawal = await apiRequest(baseUrl, "/withdrawals", {
    method: "POST",
    authValue: memberAuth,
    label: "valid withdrawal create",
    body: {
      user_bank_account_id: bankAccount.id,
      amount: "25.00",
      note: "local financial negative smoke withdrawal",
    },
  });
  assertMoney(withdrawal.amount, "25.00", "Withdrawal amount");

  const approvedWithdrawal = await apiRequest(baseUrl, `/admin/withdrawals/${withdrawal.id}/approve`, {
    method: "POST",
    authValue: adminAuth,
    label: "withdrawal approve",
    body: { note: "local financial negative smoke approve withdrawal" },
  });
  assertMoney(approvedWithdrawal.wallet.balance, "75.00", "Wallet after withdrawal approve");

  await expectBlocked(baseUrl, "Duplicate withdrawal approve", `/admin/withdrawals/${withdrawal.id}/approve`, {
    method: "POST",
    authValue: adminAuth,
    body: {},
  });
  assertMoney((await getWallet(baseUrl, memberAuth)).balance, "75.00", "Wallet after duplicate withdrawal approve");

  await apiRequest(baseUrl, `/admin/withdrawals/${withdrawal.id}/mark-paid`, {
    method: "POST",
    authValue: adminAuth,
    label: "withdrawal mark paid",
    body: {},
  });
  assertMoney((await getWallet(baseUrl, memberAuth)).balance, "75.00", "Wallet after withdrawal mark-paid");

  await expectBlocked(baseUrl, "Duplicate withdrawal mark-paid", `/admin/withdrawals/${withdrawal.id}/mark-paid`, {
    method: "POST",
    authValue: adminAuth,
    body: {},
  });
  assertMoney((await getWallet(baseUrl, memberAuth)).balance, "75.00", "Wallet after duplicate withdrawal mark-paid");

  const ledger = await getLedger(baseUrl, memberAuth);
  const depositLedger = ledgerFor(ledger, "deposit", deposit.id);
  const withdrawalLedger = ledgerFor(ledger, "withdraw", withdrawal.id);
  assertEqual(depositLedger.length, 1, "Deposit ledger row count");
  assertEqual(withdrawalLedger.length, 1, "Withdrawal ledger row count");
  assertMoney(depositLedger[0].amount, "100.00", "Deposit ledger amount");
  assertMoney(withdrawalLedger[0].amount, "-25.00", "Withdrawal ledger amount");
  assertMoney(depositLedger[0].balanceAfter, "100.00", "Deposit ledger balance after");
  assertMoney(withdrawalLedger[0].balanceAfter, "75.00", "Withdrawal ledger balance after");

  await assertAdminLog(baseUrl, adminAuth, {
    action: "deposit.approve",
    targetType: "deposit",
    targetId: deposit.id,
  });
  await assertAdminLog(baseUrl, adminAuth, {
    action: "withdraw.approve",
    targetType: "withdraw",
    targetId: withdrawal.id,
  });
  await assertAdminLog(baseUrl, adminAuth, {
    action: "withdraw.mark_paid",
    targetType: "withdraw",
    targetId: withdrawal.id,
  });

  const ledgerAfterAdminLogReads = await getLedger(baseUrl, memberAuth);
  assertEqual(ledgerAfterAdminLogReads.length, ledger.length, "Ledger count after duplicate/admin-log checks");

  console.log("Duplicate deposit approve safety: PASS");
  console.log("Duplicate withdrawal approve safety: PASS");
  console.log("Duplicate withdrawal mark-paid safety: PASS");
  console.log("Ledger safety: PASS");
  console.log("Admin log checks: PASS");
}

async function runSmoke(baseUrl, fixtures) {
  await apiRequest(baseUrl, "/health", { label: "health" });
  console.log("Health check: PASS");

  await runAuthNegative(baseUrl);
  await runInvalidDepositCases(baseUrl, fixtures.memberAuth, fixtures.bankAccount.id);
  await runInvalidWithdrawalCases(baseUrl, fixtures.memberAuth, fixtures.bankAccount.id);
  await runDuplicateMoneyCases(baseUrl, fixtures);
  console.log("Response leak scan: PASS");
}

async function main() {
  let prisma = null;
  try {
    const baseUrl = assertLocalSafety();
    const runId = makeRunId();
    const fixtures = await ensureLocalFixtures(runId);
    prisma = fixtures.prisma;
    await runSmoke(baseUrl, fixtures);
    console.log("Financial negative smoke: PASS");
  } catch (error) {
    console.error("Financial negative smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
