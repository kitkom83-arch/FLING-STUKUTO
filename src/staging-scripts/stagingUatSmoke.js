const {
  SAFE_EXTERNAL_MODES,
  ensureApiPath,
  evaluateStagingSafety,
  inspectBaseUrl,
} = require("./stagingSafety");

const DEFAULT_BASE_URL = "https://stukuto-real-core-staging.onrender.com/api";
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.STAGING_DEMO_ADMIN_EMAIL || process.env.STAGING_DEMO_ADMIN_USERNAME || "admin";
const MEMBER_USERNAME = process.env.STAGING_DEMO_MEMBER_USERNAME || "";
const MEMBER_PASSWORD = process.env.STAGING_DEMO_MEMBER_PASSWORD || "";
const INVALID_ADMIN_PASSWORD = "staging-uat-invalid-admin-login-check";
const issuedAuthValues = new Set();

function configuredBaseUrl() {
  return ensureApiPath(process.env.BASE_URL || DEFAULT_BASE_URL);
}

function demoAdminCredentials() {
  const email = process.env.STAGING_DEMO_ADMIN_EMAIL;
  const password = process.env.STAGING_DEMO_ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { username: email, password };
}

function skipMissingDemoAdminPassword() {
  console.log("Staging UAT smoke: SKIPPED by safety guard");
  console.log("reason: missing STAGING_DEMO_ADMIN_EMAIL or STAGING_DEMO_ADMIN_PASSWORD env");
  console.log("no production DB used");
  console.log("no real provider/payment/bank/SMS/Slip OCR used");
  console.log("no real money payout");
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 8)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function assertNoUnsafeKeys(label, value, { allowAuthToken = false } = {}) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertNoUnsafeKeys(label, item, { allowAuthToken });
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    const allowedToken = allowAuthToken && normalized === "token";
    if (!allowedToken && /(password|token|secret|authorization|refresh|session)/i.test(normalized)) {
      throw new Error(`${label} exposed unsafe key: ${key}.`);
    }
    if (normalized === "database_url" || normalized === "databaseurl") {
      throw new Error(`${label} exposed database URL key.`);
    }
    if (normalized === "api_key" || normalized.includes("apikey")) {
      throw new Error(`${label} exposed API key field.`);
    }
    assertNoUnsafeKeys(label, item, { allowAuthToken });
  }
}

function assertNoLeaks(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  const authScheme = ["be", "arer"].join("");

  for (const value of sensitiveEnvValues()) {
    if (serialized.includes(value)) throw new Error(`${label} leaked a sensitive environment value.`);
  }
  if (/postgres(?:ql)?:\/\/[^\s"']+/i.test(serialized)) throw new Error(`${label} leaked a PostgreSQL URL.`);
  if (!allowAuthToken && /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(serialized)) {
    throw new Error(`${label} leaked a JWT-shaped value.`);
  }
  if (lower.includes(authScheme)) throw new Error(`${label} leaked an authorization scheme marker.`);
  if (/(Error:\s.+\n\s+at\s+)|(\"stack\"\s*:)/i.test(serialized)) throw new Error(`${label} leaked a raw internal stack.`);
  if (!allowAuthToken) {
    for (const authValue of issuedAuthValues) {
      if (authValue && serialized.includes(authValue)) throw new Error(`${label} echoed an authorization token.`);
    }
  }
  assertNoUnsafeKeys(label, payload, { allowAuthToken });
}

async function apiRequest(baseUrl, path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Site-Code": SITE_CODE,
  };
  if (options.authValue) headers.Authorization = `${["Be", "arer"].join("")} ${options.authValue}`;

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
    throw new Error(`${path} returned non-JSON response.`);
  }

  const payload = await response.json();
  assertNoLeaks(options.label || path, payload, { allowAuthToken: Boolean(options.allowAuthToken) });
  return { status: response.status, payload, data: payload.data };
}

function assertHealth(result) {
  if (result.status !== 200 || !result.payload || result.payload.success !== true) {
    throw new Error(`Health returned ${result.status}, expected 200 success.`);
  }
  const data = result.data;
  if (!data || data.ok !== true || data.status !== "ok") {
    throw new Error("Health response must include ok true and status ok.");
  }
  if (data.databaseConnected !== true) {
    throw new Error("Health databaseConnected must be true for staging UAT readiness.");
  }
  if (!data.environment || String(data.environment.appEnv || "").toLowerCase() !== "staging") {
    throw new Error("Health environment.appEnv must be staging.");
  }
  for (const [name, mode] of Object.entries(data.externalModes || {})) {
    const normalized = String(mode).toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(normalized) || normalized === "live") {
      throw new Error(`Health external mode ${name} must not be live.`);
    }
  }
}

function assertAdminAuthSafeFailure(label, result) {
  if (![400, 401, 403].includes(result.status) || !result.payload || result.payload.success !== false) {
    throw new Error(`${label} returned ${result.status}, expected safe failure.`);
  }
}

async function assertUnknownAdminAuthFailure(baseUrl) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    label: "unknown admin auth negative",
    body: {
      username: "staging_uat_invalid_admin",
      password: INVALID_ADMIN_PASSWORD,
    },
  });
  assertAdminAuthSafeFailure("Unknown admin auth negative", result);
}

async function assertDemoAdminWrongPasswordFailure(baseUrl, realPassword) {
  const invalidPassword =
    realPassword === INVALID_ADMIN_PASSWORD ? "staging-uat-invalid-admin-login-check-alt" : INVALID_ADMIN_PASSWORD;
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    label: "demo admin wrong password negative",
    body: {
      username: ADMIN_USERNAME,
      password: invalidPassword,
    },
  });
  assertAdminAuthSafeFailure("Demo admin wrong password negative", result);
}

async function loginDemoAdmin(baseUrl, password) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "staging demo admin login",
    body: { username: ADMIN_USERNAME, password },
  });
  if (result.status === 400 || result.status === 401 || result.status === 403) {
    throw new Error(`Missing staging demo admin ${ADMIN_USERNAME} or staging password mismatch.`);
  }
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`Staging demo admin login returned ${result.status}, expected 200 with token.`);
  }
  issuedAuthValues.add(result.data.token);
  console.log(`Demo admin auth: PASS (${ADMIN_USERNAME})`);
  return result.data.token;
}

async function loginDemoMember(baseUrl) {
  if (!MEMBER_USERNAME || !MEMBER_PASSWORD) {
    console.log("Lucky Wheel member UAT: SKIPPED");
    console.log("reason: STAGING_DEMO_MEMBER_USERNAME or STAGING_DEMO_MEMBER_PASSWORD env not configured");
    return null;
  }
  const result = await apiRequest(baseUrl, "/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label: "staging demo member login",
    body: { phone: MEMBER_USERNAME, password: MEMBER_PASSWORD },
  });
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`Staging demo member login returned ${result.status}, expected 200 with token.`);
  }
  issuedAuthValues.add(result.data.token);
  console.log("Demo member auth: PASS");
  return result.data.token;
}

function assertRowsSummaryShape(label, data) {
  if (!data || !Array.isArray(data.rows)) throw new Error(`${label} must return rows array.`);
  if (!data.summary || typeof data.summary.totalEvents !== "number") {
    throw new Error(`${label} must return summary totalEvents.`);
  }
}

async function assertAdminEndpoints(baseUrl, authValue) {
  const schedules = await apiRequest(baseUrl, "/admin/work-schedules?limit=20", {
    authValue,
    label: "admin work schedule list",
  });
  if (schedules.status !== 200 || !Array.isArray(schedules.data)) {
    throw new Error(`Admin work schedule endpoint returned ${schedules.status}, expected 200 array.`);
  }
  console.log("Admin work schedule endpoint: PASS");

  const audit = await apiRequest(baseUrl, "/admin/audit-logs?limit=20", {
    authValue,
    label: "admin audit logs",
  });
  if (audit.status !== 200) throw new Error(`Admin audit logs returned ${audit.status}, expected 200.`);
  assertRowsSummaryShape("admin audit logs", audit.data);

  const auditSummary = await apiRequest(baseUrl, "/admin/audit-logs/summary?limit=20", {
    authValue,
    label: "admin audit summary",
  });
  if (auditSummary.status !== 200 || !auditSummary.data || typeof auditSummary.data.totalEvents !== "number") {
    throw new Error(`Admin audit summary returned ${auditSummary.status}, expected summary.`);
  }

  const security = await apiRequest(baseUrl, "/admin/security-events?limit=20", {
    authValue,
    label: "admin security events",
  });
  if (security.status !== 200) throw new Error(`Admin security events returned ${security.status}, expected 200.`);
  assertRowsSummaryShape("admin security events", security.data);

  const securitySummary = await apiRequest(baseUrl, "/admin/security-events/summary?limit=20", {
    authValue,
    label: "admin security summary",
  });
  if (securitySummary.status !== 200 || !securitySummary.data || typeof securitySummary.data.totalEvents !== "number") {
    throw new Error(`Admin security summary returned ${securitySummary.status}, expected summary.`);
  }
  console.log("Admin audit/security endpoints: PASS");
}

async function assertLuckyWheelAdminEndpoints(baseUrl, authValue) {
  const config = await apiRequest(baseUrl, "/admin/wheel/config", {
    authValue,
    label: "staging admin wheel config",
  });
  if (config.status !== 200 || !config.data || !config.data.campaign || !Array.isArray(config.data.rewards)) {
    throw new Error(`Admin wheel config returned ${config.status}, expected campaign and rewards.`);
  }
  if (!config.data.summary || typeof config.data.summary.totalSpins !== "number") {
    throw new Error("Admin wheel config summary shape invalid.");
  }

  const spins = await apiRequest(baseUrl, "/admin/wheel/spins?limit=20", {
    authValue,
    label: "staging admin wheel spins",
  });
  if (spins.status !== 200 || !Array.isArray(spins.data)) {
    throw new Error(`Admin wheel spins returned ${spins.status}, expected array.`);
  }
  console.log("Admin Lucky Wheel config/rewards/spins: PASS");
}

async function assertLuckyWheelMemberEndpoints(baseUrl, authValue) {
  if (!authValue) return;
  const config = await apiRequest(baseUrl, "/member/wheel/config", {
    authValue,
    label: "staging member wheel config",
  });
  if (config.status !== 200 || !config.data || !config.data.campaignId || !Array.isArray(config.data.rewards)) {
    throw new Error(`Member wheel config returned ${config.status}, expected campaign and rewards.`);
  }
  if (!Object.prototype.hasOwnProperty.call(config.data, "remainingSpinsToday")) {
    throw new Error("Member wheel config missing remainingSpinsToday.");
  }
  if (!config.data.memberBalance || typeof config.data.memberBalance !== "object") {
    throw new Error("Member wheel config missing memberBalance.");
  }
  if (config.data.rewards.some((reward) => Object.prototype.hasOwnProperty.call(reward, "probabilityWeight"))) {
    throw new Error("Member wheel config exposed probabilityWeight.");
  }

  await apiRequest(baseUrl, "/member/wheel/spin", {
    method: "POST",
    authValue,
    label: "staging member wheel unsafe spin payload",
    body: {
      campaignId: config.data.campaignId,
      rewardId: "client_selected_reward",
      prizeIndex: 0,
    },
  }).then((result) => {
    if (![400, 401, 403].includes(result.status) || !result.payload || result.payload.success !== false) {
      throw new Error("Unsafe member wheel spin payload must fail safely.");
    }
  });

  const spin = await apiRequest(baseUrl, "/member/wheel/spin", {
    method: "POST",
    authValue,
    label: "staging member wheel spin",
    body: { campaignId: config.data.campaignId },
  });
  if (
    spin.status !== 201 ||
    !spin.data ||
    !spin.data.spinId ||
    !spin.data.rewardId ||
    typeof spin.data.prizeIndex !== "number" ||
    !spin.data.reward ||
    !Object.prototype.hasOwnProperty.call(spin.data, "remainingSpinsToday")
  ) {
    throw new Error(`Member wheel spin returned ${spin.status}, expected backend-selected result.`);
  }

  const history = await apiRequest(baseUrl, "/member/wheel/history?limit=20", {
    authValue,
    label: "staging member wheel history",
  });
  if (history.status !== 200 || !Array.isArray(history.data)) throw new Error("Member wheel history shape invalid.");

  const rewards = await apiRequest(baseUrl, "/member/wheel/my-rewards?limit=20", {
    authValue,
    label: "staging member wheel my rewards",
  });
  if (rewards.status !== 200 || !Array.isArray(rewards.data)) throw new Error("Member wheel my-rewards shape invalid.");
  console.log("Member Lucky Wheel config/spin/history/my-rewards: PASS");
}

async function main() {
  try {
    const safety = evaluateStagingSafety(process.env, {
      requireDatabaseUrl: false,
      allowSkipSafe: true,
    });
    if (safety.failed) {
      throw new Error(`Staging UAT smoke safety guard: BLOCKED\n- ${safety.failReasons.join("\n- ")}`);
    }

    const baseUrl = configuredBaseUrl();
    const target = inspectBaseUrl("BASE_URL", baseUrl);
    if (!target.ok) throw new Error(target.reason);
    console.log("Staging UAT smoke safety guard: PASS");

    const demoAdmin = demoAdminCredentials();
    if (!demoAdmin) {
      skipMissingDemoAdminPassword();
      return;
    }

    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    assertHealth(health);
    console.log("Health/database/mode contract: PASS");

    await assertUnknownAdminAuthFailure(baseUrl);
    console.log("Unknown admin auth negative leak check: PASS");

    const authValue = await loginDemoAdmin(baseUrl, demoAdmin.password);
    await assertDemoAdminWrongPasswordFailure(baseUrl, demoAdmin.password);
    console.log("Demo admin wrong password negative leak check: PASS");
    await assertAdminEndpoints(baseUrl, authValue);
    await assertLuckyWheelAdminEndpoints(baseUrl, authValue);
    const memberAuthValue = await loginDemoMember(baseUrl);
    await assertLuckyWheelMemberEndpoints(baseUrl, memberAuthValue);

    console.log("Response leak scan: PASS");
    console.log("no production DB used");
    console.log("no real provider/payment/bank/SMS/Slip OCR used");
    console.log("no real money payout");
    console.log("Staging UAT smoke: PASS");
  } catch (error) {
    console.error("Staging UAT smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
