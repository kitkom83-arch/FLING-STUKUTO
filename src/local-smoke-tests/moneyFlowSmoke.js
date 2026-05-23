require("dotenv").config();

const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["staging", "test", "development-local"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const SITE_CODE = process.env.LOCAL_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = "local_money_flow_admin";
const MEMBER_PASSWORD = "localSmokeMember123";
const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

class ApiRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
  }
}

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
  return DEFAULT_API_BASE_URL;
}

function requestPathForBase(apiBaseUrl, path) {
  const normalizedPath = String(path || "");
  const parsed = parseUrl(apiBaseUrl);
  if (parsed && parsed.pathname.replace(/\/+$/, "") === "/api" && normalizedPath === "/api") return "";
  if (parsed && parsed.pathname.replace(/\/+$/, "") === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath.slice(4);
  }
  return normalizedPath;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim()
    ? parseUrl(databaseUrl.trim())
    : null;

  if (!parsed) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL must use PostgreSQL. Value is not printed.",
    };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }

  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  const localAllowed = isLoopbackHost(parsed.hostname);
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

  const host = parsed.hostname;
  if (hasAnyToken(host, PRODUCTION_MARKERS)) {
    return { ok: false, reason: "BASE_URL appears production-like and is blocked." };
  }

  if (!isLoopbackHost(host) && !hasAnyToken(host, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: "BASE_URL must target local/staging/test only." };
  }

  return { ok: true, reason: null };
}

function normalizedGuardEnv() {
  const env = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!env[key]) env[key] = "mock";
  }
  return env;
}

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const apiBaseUrl = configuredBaseUrl();
  const apiTarget = inspectApiBaseUrl(apiBaseUrl);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());

  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be staging, test, or development-local.");
  }
  if (!process.env.JWT_SECRET) {
    reasons.push("JWT_SECRET must be set for the local smoke test.");
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
    throw new Error(`Local money-flow smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("Local money-flow smoke safety guard: PASS");
  return apiBaseUrl;
}

function requireString(value, label) {
  if (typeof value !== "string" || !value) {
    throw new Error(`${label} was missing from API response.`);
  }
  return value;
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

async function apiRequest(apiBaseUrl, path, options = {}) {
  const headers = {
    Accept: "application/json",
    "X-Site-Code": SITE_CODE,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = ["Bearer", options.token].join(" ");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${requestPathForBase(apiBaseUrl, path)}`, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new ApiRequestError(`API returned non-JSON response for ${path}`, response.status);
  }

  if (!response.ok || !payload || payload.success !== true) {
    const message = payload && payload.message ? payload.message : "request failed";
    throw new ApiRequestError(`API ${path} blocked with ${response.status}: ${message}`, response.status);
  }

  return payload.data;
}

async function expectApiBlocked(label, action) {
  try {
    await action();
  } catch (error) {
    if (error instanceof ApiRequestError && error.statusCode >= 400) {
      console.log(`${label}: PASS`);
      return;
    }
    throw error;
  }

  throw new Error(`${label}: expected API to block duplicate operation`);
}

async function assertAdminLog(apiBaseUrl, adminToken, { action, targetType, targetId }) {
  const query = new URLSearchParams({
    action,
    target_type: targetType,
    target_id: targetId,
    limit: "20",
  });
  const logs = await apiRequest(apiBaseUrl, `/api/admin/logs?${query.toString()}`, {
    token: adminToken,
  });
  const matching = logs.filter(
    (row) => row.action === action && row.targetType === targetType && row.targetId === targetId
  );
  assertEqual(matching.length, 1, `Admin log ${action} count`);
}

function makeRunId() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${Date.now()}${random}`;
}

async function ensureLocalFixtures() {
  const prisma = require("../config/prisma");
  const { hashPassword } = require("../utils/password");

  const existingSite = await prisma.site.findUnique({ where: { code: SITE_CODE } });
  if (!existingSite) {
    await prisma.site.create({
      data: {
        code: SITE_CODE,
        name: `${SITE_CODE} Local Smoke`,
        brandName: SITE_CODE,
        status: "active",
      },
    });
  } else if (existingSite.status !== "active") {
    throw new Error(`Site ${SITE_CODE} exists but is not active.`);
  }

  const passwordHash = await hashPassword(process.env.LOCAL_ADMIN_PASSWORD);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      passwordHash,
      role: "super_admin",
      status: "active",
    },
    create: {
      username: ADMIN_USERNAME,
      passwordHash,
      role: "super_admin",
      status: "active",
    },
  });

  return prisma;
}

async function runSmoke(apiBaseUrl) {
  const adminLogin = await apiRequest(apiBaseUrl, "/api/admin/auth/login", {
    method: "POST",
    body: {
      username: ADMIN_USERNAME,
      password: process.env.LOCAL_ADMIN_PASSWORD,
    },
  });
  const adminToken = requireString(adminLogin.token, "Admin token");
  console.log("Admin login: PASS");

  const runId = makeRunId();
  const memberPhone = `09${runId.slice(-8)}`;
  const accountNumber = `88${runId.slice(-8)}`;
  const memberRegister = await apiRequest(apiBaseUrl, "/api/auth/register", {
    method: "POST",
    body: {
      phone: memberPhone,
      username: `smoke_${runId}`,
      password: MEMBER_PASSWORD,
      bank_code: "MOCK",
      bank_account_number: accountNumber,
      bank_account_name: "Local Smoke Member",
      referral_source: "local-money-flow-smoke",
      accept_bonus: false,
      accept_terms: true,
    },
  });
  const memberToken = requireString(memberRegister.token, "Member token");
  console.log("Member register: PASS");

  const bankAccounts = await apiRequest(apiBaseUrl, "/api/bank-accounts", {
    token: memberToken,
  });
  const bankAccount = bankAccounts.find((item) => item.accountNumber === accountNumber);
  if (!bankAccount) throw new Error("Registered member bank account was not found.");
  assertEqual(bankAccount.status, "pending", "Bank account status after register");
  console.log("Bank account pending: PASS");

  const approvedBankAccount = await apiRequest(apiBaseUrl, `/api/admin/bank-accounts/${bankAccount.id}/approve`, {
    method: "POST",
    token: adminToken,
    body: {},
  });
  assertEqual(approvedBankAccount.status, "approved", "Bank account status after approval");
  console.log("Bank account approve: PASS");

  const deposit = await apiRequest(apiBaseUrl, "/api/deposits", {
    method: "POST",
    token: memberToken,
    body: {
      amount: "100.00",
      channel: "manual_bank_mock",
      bank_account_id: bankAccount.id,
      note: "local money-flow smoke deposit",
    },
  });
  assertMoney(deposit.amount, "100.00", "Deposit amount");
  console.log("Deposit create: PASS");

  const approvedDeposit = await apiRequest(apiBaseUrl, `/api/admin/deposits/${deposit.id}/approve`, {
    method: "POST",
    token: adminToken,
    body: { note: "local money-flow smoke approve deposit" },
  });
  assertMoney(approvedDeposit.wallet.balance, "100.00", "Wallet after deposit");
  console.log("Deposit approve: PASS");

  await expectApiBlocked("Duplicate deposit approve guard", () =>
    apiRequest(apiBaseUrl, `/api/admin/deposits/${deposit.id}/approve`, {
      method: "POST",
      token: adminToken,
      body: {},
    })
  );

  const walletAfterDeposit = await apiRequest(apiBaseUrl, "/api/wallet", { token: memberToken });
  assertMoney(walletAfterDeposit.balance, "100.00", "Wallet check after deposit");

  const withdrawal = await apiRequest(apiBaseUrl, "/api/withdrawals", {
    method: "POST",
    token: memberToken,
    body: {
      user_bank_account_id: bankAccount.id,
      amount: "10.00",
      note: "local money-flow smoke withdrawal",
    },
  });
  assertMoney(withdrawal.amount, "10.00", "Withdrawal amount");
  console.log("Withdrawal create: PASS");

  const approvedWithdrawal = await apiRequest(apiBaseUrl, `/api/admin/withdrawals/${withdrawal.id}/approve`, {
    method: "POST",
    token: adminToken,
    body: { note: "local money-flow smoke approve withdrawal" },
  });
  assertMoney(approvedWithdrawal.wallet.balance, "90.00", "Wallet after withdrawal approve");
  console.log("Withdrawal approve: PASS");

  await expectApiBlocked("Duplicate withdrawal approve guard", () =>
    apiRequest(apiBaseUrl, `/api/admin/withdrawals/${withdrawal.id}/approve`, {
      method: "POST",
      token: adminToken,
      body: {},
    })
  );

  await apiRequest(apiBaseUrl, `/api/admin/withdrawals/${withdrawal.id}/mark-paid`, {
    method: "POST",
    token: adminToken,
    body: {},
  });
  console.log("Withdrawal mark-paid: PASS");

  await expectApiBlocked("Duplicate withdrawal mark-paid guard", () =>
    apiRequest(apiBaseUrl, `/api/admin/withdrawals/${withdrawal.id}/mark-paid`, {
      method: "POST",
      token: adminToken,
      body: {},
    })
  );

  const walletFinal = await apiRequest(apiBaseUrl, "/api/wallet", { token: memberToken });
  assertMoney(walletFinal.balance, "90.00", "Final wallet");

  const ledger = await apiRequest(apiBaseUrl, "/api/wallet/ledger?limit=20", {
    token: memberToken,
  });
  const depositLedger = ledger.filter((row) => row.referenceType === "deposit" && row.referenceId === deposit.id);
  const withdrawLedger = ledger.filter((row) => row.referenceType === "withdraw" && row.referenceId === withdrawal.id);
  assertEqual(depositLedger.length, 1, "Deposit ledger row count");
  assertEqual(withdrawLedger.length, 1, "Withdraw ledger row count");
  assertMoney(depositLedger[0].amount, "100.00", "Deposit ledger amount");
  assertMoney(withdrawLedger[0].amount, "-10.00", "Withdraw ledger amount");
  assertEqual(ledger.length, 2, "Wallet ledger total count");

  const ledgerAfterDuplicates = await apiRequest(apiBaseUrl, "/api/wallet/ledger?limit=20", {
    token: memberToken,
  });
  assertEqual(ledgerAfterDuplicates.length, ledger.length, "Ledger count after duplicate attempts");

  await assertAdminLog(apiBaseUrl, adminToken, {
    action: "deposit.approve",
    targetType: "deposit",
    targetId: deposit.id,
  });
  await assertAdminLog(apiBaseUrl, adminToken, {
    action: "withdraw.approve",
    targetType: "withdraw",
    targetId: withdrawal.id,
  });
  await assertAdminLog(apiBaseUrl, adminToken, {
    action: "withdraw.mark_paid",
    targetType: "withdraw",
    targetId: withdrawal.id,
  });

  console.log("Wallet final balance: PASS");
  console.log("Wallet ledger checks: PASS");
  console.log("Admin log checks: PASS");
}

async function main() {
  let prisma = null;
  try {
    const apiBaseUrl = assertLocalSafety();
    await apiRequest(apiBaseUrl, "/health");
    console.log("Health check: PASS");
    prisma = await ensureLocalFixtures();
    await runSmoke(apiBaseUrl);
    console.log("Local money-flow smoke: PASS");
  } catch (error) {
    console.error("Local money-flow smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
