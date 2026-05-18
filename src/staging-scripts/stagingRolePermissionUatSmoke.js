const {
  SAFE_EXTERNAL_MODES,
  ensureApiPath,
  evaluateStagingSafety,
  inspectBaseUrl,
} = require("./stagingSafety");

const DEFAULT_BASE_URL = "https://stukuto-real-core-staging.onrender.com/api";
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.STAGING_DEMO_ADMIN_EMAIL || process.env.STAGING_DEMO_ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.STAGING_DEMO_ADMIN_PASSWORD || "";
const NO_PERMISSION_USERNAME =
  process.env.STAGING_NO_PERMISSION_ADMIN_EMAIL || process.env.STAGING_NO_PERMISSION_ADMIN_USERNAME || "";
const NO_PERMISSION_PASSWORD = process.env.STAGING_NO_PERMISSION_ADMIN_PASSWORD || "";
const PROTECTED_ROLES = new Set(["owner", "super_admin"]);
const SAFE_ROLE_NAME = safeStagingRoleName(process.env.STAGING_SAFE_ROLE_NAME || "staging_safe_role");
const SAFE_ROLE_ADMIN_USERNAME =
  process.env.STAGING_SAFE_ROLE_ADMIN_EMAIL || process.env.STAGING_SAFE_ROLE_ADMIN_USERNAME || "";
const SAFE_ROLE_ADMIN_PASSWORD = process.env.STAGING_SAFE_ROLE_ADMIN_PASSWORD || "";
const REQUIRED_CATALOG_KEYS = [
  "wheel.view",
  "wheel.claims.view",
  "wheel.reports.view",
  "admin.roles.view",
  "admin.roles.update",
  "admin.audit.view",
];
const TEMPORARY_PERMISSION_CANDIDATES = [
  "wheel.claims.view",
  "wheel.spins.view",
  "wheel.campaign.view",
  "wheel.rewards.view",
];
const issuedAuthValues = new Set();

function safeStagingRoleName(value) {
  const role = String(value || "staging_safe_role").trim().toLowerCase();
  if (!/^[a-z0-9_:-]{3,64}$/.test(role)) return "staging_safe_role";
  if (PROTECTED_ROLES.has(role) || role === "admin.manage") return "staging_safe_role";
  if (!/(staging|stage|demo|test|sandbox|qa|uat)/i.test(role)) return "staging_safe_role";
  return role;
}

function configuredBaseUrl() {
  return ensureApiPath(process.env.BASE_URL || DEFAULT_BASE_URL);
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isStagingApiUrl(baseUrl) {
  const parsed = new URL(baseUrl);
  const tokens = tokenize(`${parsed.hostname} ${parsed.pathname}`);
  return parsed.protocol === "https:" && tokens.some((token) => ["stage", "staging", "qa", "sandbox"].includes(token));
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 8)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function sanitizeStringForLog(value) {
  let safe = String(value);
  for (const sensitiveValue of sensitiveEnvValues()) {
    safe = safe.split(sensitiveValue).join("[redacted]");
  }
  return safe
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]")
    .replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, "[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+/gi, "[redacted]")
    .replace(/password/gi, "credential")
    .replace(/token/gi, "credential")
    .replace(/secret/gi, "credential")
    .replace(/authorization/gi, "credential")
    .replace(/database_url/gi, "database-redacted");
}

function sanitizeForLog(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        const safeKey = sanitizeStringForLog(key);
        if (/(password|token|secret|authorization|refresh|session|database|api_?key|jwt)/i.test(key)) {
          return [safeKey, "[redacted]"];
        }
        return [safeKey, sanitizeForLog(item)];
      })
    );
  }
  if (typeof value === "string") return sanitizeStringForLog(value);
  return value;
}

function safePayloadSummary(payload) {
  const serialized = JSON.stringify(sanitizeForLog(payload));
  return serialized.length > 800 ? `${serialized.slice(0, 800)}...` : serialized;
}

function printSafeBoundary() {
  console.log("no production DB used");
  console.log("no real provider/payment/bank/SMS/Slip OCR used");
  console.log("no real money payout");
}

function skipMissingDemoAdmin() {
  console.log("Staging role permission UAT smoke: SKIPPED by safety guard");
  console.log("reason: missing STAGING_DEMO_ADMIN_EMAIL or STAGING_DEMO_ADMIN_PASSWORD env");
  printSafeBoundary();
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
    if (!allowedToken && /(password|token|secret|authorization|refresh|session|jwt)/i.test(normalized)) {
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
  const allowAuthToken = Boolean(options.allowAuthToken && response.status >= 200 && response.status < 300);
  assertNoLeaks(options.label || path, payload, { allowAuthToken });

  if (options.expectedStatuses && !options.expectedStatuses.includes(response.status)) {
    throw new Error(
      `${options.label || path} returned ${response.status}, expected ${options.expectedStatuses.join(" or ")}. Sanitized response body: ${safePayloadSummary(payload)}`
    );
  }
  if (options.expectSuccess === false) {
    if (!payload || payload.success !== false) {
      throw new Error(`${options.label || path} returned unexpected success payload.`);
    }
    return { status: response.status, payload, data: payload.data };
  }
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(
      `${options.label || path} blocked with ${response.status}: ${payload && payload.message ? sanitizeStringForLog(payload.message) : "request failed"}`
    );
  }
  return { status: response.status, payload, data: payload.data };
}

function assertHealth(result) {
  if (result.status !== 200 || !result.data || result.data.ok !== true || result.data.status !== "ok") {
    throw new Error(`Health returned ${result.status}, expected 200 ok.`);
  }
  if (result.data.databaseConnected !== true) {
    throw new Error("Health databaseConnected must be true for role permission UAT.");
  }
  if (!result.data.environment || String(result.data.environment.appEnv || "").toLowerCase() !== "staging") {
    throw new Error("Health environment.appEnv must be staging.");
  }
  for (const [name, mode] of Object.entries(result.data.externalModes || {})) {
    const normalized = String(mode).toLowerCase();
    if (!SAFE_EXTERNAL_MODES.has(normalized) || normalized === "live") {
      throw new Error(`Health external mode ${name} must not be live.`);
    }
  }
}

async function loginAdmin(baseUrl, username, password, label) {
  const result = await apiRequest(baseUrl, "/admin/auth/login", {
    method: "POST",
    allowAuthToken: true,
    label,
    body: { username, password },
  });
  if (result.status !== 200 || !result.data || typeof result.data.token !== "string") {
    throw new Error(`${label} returned ${result.status}, expected 200 with token.`);
  }
  issuedAuthValues.add(result.data.token);
  return result.data.token;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
}

function rolePermissions(roleDetail) {
  const permissions = roleDetail && roleDetail.permissions;
  requireArray(permissions, "role permissions");
  return [...permissions];
}

function normalizedPermissions(permissions) {
  return [...new Set(permissions || [])].sort();
}

function assertPermissionsEqual(label, actual, expected) {
  assertArrayEqual(label, normalizedPermissions(actual), normalizedPermissions(expected));
}

function assertArrayEqual(label, actual, expected) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${label} mismatch. expected=${right} actual=${left}`);
}

function findCatalogKeys(catalog) {
  requireArray(catalog, "permission catalog");
  return new Set(catalog.map((item) => item && item.key).filter(Boolean));
}

function safeRoleFixtureEnvComplete() {
  return Boolean(SAFE_ROLE_ADMIN_USERNAME && SAFE_ROLE_ADMIN_PASSWORD);
}

function chooseReadableSafeRole(roles, currentRole, { requireFixtureRole = false } = {}) {
  const requested = process.env.STAGING_ROLE_PERMISSION_TEST_ROLE || SAFE_ROLE_NAME;
  if (requested) {
    const role = roles.find((item) => item && item.role === requested);
    if (!role && requireFixtureRole) throw new Error("STAGING_SAFE_ROLE_NAME was not found in the staging role catalog. Run staging:seed-demo after setting the safe role fixture env.");
    if (role && PROTECTED_ROLES.has(role.role)) throw new Error("STAGING_SAFE_ROLE_NAME must not be owner or super_admin.");
    if (role) return role;
  }

  if (requireFixtureRole) {
    throw new Error("Staging safe role fixture env is present, but the safe role was unavailable.");
  }

  const legacyRequested = process.env.STAGING_ROLE_PERMISSION_TEST_ROLE;
  if (legacyRequested) {
    const role = roles.find((item) => item && item.role === legacyRequested);
    if (!role) throw new Error("STAGING_ROLE_PERMISSION_TEST_ROLE was not found in the staging role catalog.");
    if (PROTECTED_ROLES.has(role.role)) throw new Error("STAGING_ROLE_PERMISSION_TEST_ROLE must not be owner or super_admin.");
    return role;
  }

  const preferred = ["support", "viewer", "graphic", "finance"];
  for (const roleName of preferred) {
    const role = roles.find((item) => item && item.role === roleName);
    if (role && !PROTECTED_ROLES.has(role.role) && role.role !== currentRole) return role;
  }
  return roles.find((item) => item && item.role && !PROTECTED_ROLES.has(item.role) && item.role !== currentRole) || null;
}

function chooseWritableSafeRole(roles, currentRole, options = {}) {
  const readable = chooseReadableSafeRole(roles, currentRole, options);
  if (!readable) return null;
  if (Number(readable.adminCount || 0) <= 0) {
    if (options.requireFixtureRole) {
      throw new Error("Staging safe role has no assigned admins. Run staging:seed-demo after setting the safe role fixture env.");
    }
    return null;
  }
  return readable;
}

function nextTemporaryPermissions(originalPermissions, catalogKeys) {
  for (const key of TEMPORARY_PERMISSION_CANDIDATES) {
    if (!catalogKeys.has(key)) continue;
    if (!originalPermissions.includes(key)) return [...originalPermissions, key].sort();
  }
  const removable = originalPermissions.find((key) => key !== "admin.roles.update" && key !== "admin.roles.view");
  if (removable) return originalPermissions.filter((key) => key !== removable);
  return null;
}

async function expectSafeFailure(baseUrl, path, options) {
  const result = await apiRequest(baseUrl, path, {
    ...options,
    expectedStatuses: options.expectedStatuses || [400, 401, 403],
    expectSuccess: false,
  });
  console.log(`${options.label}: PASS (${result.status})`);
  return result;
}

async function runNoPermissionNegative(baseUrl, targetRole) {
  if (!NO_PERMISSION_USERNAME || !NO_PERMISSION_PASSWORD) {
    console.log("role permission no-permission negative: SKIPPED");
    console.log("reason: missing STAGING_NO_PERMISSION_ADMIN_EMAIL/USERNAME or STAGING_NO_PERMISSION_ADMIN_PASSWORD env");
    return;
  }
  const authValue = await loginAdmin(
    baseUrl,
    NO_PERMISSION_USERNAME,
    NO_PERMISSION_PASSWORD,
    "staging no-permission admin login"
  );
  await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(targetRole)}/permissions`, {
    method: "PATCH",
    authValue,
    expectedStatuses: [403],
    label: "role permission no-permission negative",
    body: {
      permissions: ["members.view"],
      reason: "staging role permission UAT no permission negative",
    },
  });
}

async function runRolePermissionNegatives(baseUrl, authValue, targetRole) {
  await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(targetRole)}/permissions`, {
    method: "PATCH",
    expectedStatuses: [401],
    label: "role permission no-auth negative",
    body: {
      permissions: ["members.view"],
      reason: "staging role permission UAT unauth negative",
    },
  });
  await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(targetRole)}/permissions`, {
    method: "PATCH",
    authValue,
    expectedStatuses: [400, 403],
    label: "role permission missing reason negative",
    body: { permissions: ["members.view"] },
  });
  await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(targetRole)}/permissions`, {
    method: "PATCH",
    authValue,
    expectedStatuses: [400, 403],
    label: "role permission invalid key negative",
    body: {
      permissions: ["members.view", "owner.override.phase_g"],
      reason: "staging role permission UAT invalid key negative",
    },
  });
  await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(targetRole)}/permissions`, {
    method: "PATCH",
    authValue,
    expectedStatuses: [400, 403],
    label: "role permission admin.manage forbidden negative",
    body: {
      permissions: ["members.view", "admin.manage"],
      reason: "staging role permission UAT admin manage forbidden negative",
    },
  });

  for (const protectedRole of ["owner", "super_admin"]) {
    await expectSafeFailure(baseUrl, `/admin/roles/${encodeURIComponent(protectedRole)}/permissions`, {
      method: "PATCH",
      authValue,
      expectedStatuses: [400, 403],
      label: `${protectedRole} role matrix protected negative`,
      body: {
        permissions: ["members.view"],
        reason: `staging role permission UAT ${protectedRole} protected negative`,
      },
    });
  }
}

async function runValidMinimalChange(baseUrl, authValue, role, catalogKeys) {
  const original = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}`, {
    authValue,
    label: "role detail before valid minimal change",
  });
  const originalPermissions = rolePermissions(original.data);
  const temporaryPermissions = nextTemporaryPermissions(originalPermissions, catalogKeys);
  if (!temporaryPermissions) {
    console.log("role permission valid minimal change: SKIPPED");
    console.log("reason: no safe temporary permission delta could be selected");
    return false;
  }
  if (temporaryPermissions.includes("admin.manage")) {
    throw new Error("Valid minimal change attempted to grant admin.manage.");
  }

  let changed = false;
  try {
    const update = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}/permissions`, {
      method: "PATCH",
      authValue,
      label: "role permission valid minimal change",
      body: {
        permissions: temporaryPermissions,
        reason: "staging role permission UAT temporary update",
      },
    });
    requireArray(update.data && update.data.permissions, "updated role permissions");
    const afterUpdate = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}`, {
      authValue,
      label: "role detail after valid minimal change",
    });
    assertPermissionsEqual("Role permissions after valid minimal change", rolePermissions(afterUpdate.data), temporaryPermissions);
    changed = true;
    console.log("role permission valid minimal change: PASS");
  } finally {
    if (changed) {
      await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}/permissions`, {
        method: "PATCH",
        authValue,
        label: "role permission restore",
        body: {
          permissions: originalPermissions,
          reason: "staging role permission UAT restore",
        },
      });
      const afterRestore = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(role)}`, {
        authValue,
        label: "role detail after restore",
      });
      assertPermissionsEqual("Role permissions after restore", rolePermissions(afterRestore.data), originalPermissions);
      await apiRequest(baseUrl, "/admin/permissions/me", {
        authValue,
        label: "demo admin permissions after restore",
      });
      console.log("role permission restore: PASS");
    }
  }

  return true;
}

async function assertAuditLog(baseUrl, authValue, role) {
  const audit = await apiRequest(
    baseUrl,
    `/admin/audit-logs?action=${encodeURIComponent("admin.role.permissions.update")}&limit=50`,
    {
      authValue,
      label: "role permission audit log",
    }
  );
  const rows = audit.data && Array.isArray(audit.data.rows) ? audit.data.rows : [];
  const match = rows.find(
    (row) =>
      row &&
      row.action === "admin.role.permissions.update" &&
      row.targetId === role &&
      row.metadata &&
      (row.metadata.reason === "staging role permission UAT temporary update" ||
        row.metadata.reason === "staging role permission UAT restore")
  );
  if (!match) {
    throw new Error("Role permission update audit log was not found for the staging UAT role.");
  }
  console.log("role permission audit log: PASS");
}

async function main() {
  try {
    const safety = evaluateStagingSafety(process.env, {
      requireDatabaseUrl: false,
      allowSkipSafe: true,
    });
    if (safety.failed) {
      throw new Error(`Staging role permission UAT safety guard: BLOCKED\n- ${safety.failReasons.join("\n- ")}`);
    }

    const baseUrl = configuredBaseUrl();
    const target = inspectBaseUrl("BASE_URL", baseUrl);
    if (!target.ok) throw new Error(target.reason);
    if (!isStagingApiUrl(baseUrl)) {
      throw new Error("BASE_URL must be an HTTPS staging/QA/sandbox API URL for this role permission UAT smoke.");
    }

    console.log("Staging role permission UAT safety guard: PASS");
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      skipMissingDemoAdmin();
      return;
    }

    const health = await apiRequest(baseUrl, "/health", { label: "health" });
    assertHealth(health);
    console.log("Health/database/mode contract: PASS");

    const authValue = await loginAdmin(baseUrl, ADMIN_USERNAME, ADMIN_PASSWORD, "staging demo admin login");
    console.log("Demo admin auth: PASS");

    const me = await apiRequest(baseUrl, "/admin/permissions/me", {
      authValue,
      label: "current admin permissions",
    });
    requireArray(me.data && me.data.permissions, "current admin permissions");
    console.log("GET /api/admin/permissions/me: PASS");

    const catalog = await apiRequest(baseUrl, "/admin/permissions/catalog", {
      authValue,
      label: "permission catalog",
    });
    const catalogKeys = findCatalogKeys(catalog.data);
    for (const key of REQUIRED_CATALOG_KEYS) {
      if (!catalogKeys.has(key)) throw new Error(`Permission catalog missing ${key}.`);
    }
    console.log("GET /api/admin/permissions/catalog: PASS");

    const roles = await apiRequest(baseUrl, "/admin/roles", {
      authValue,
      label: "role list",
    });
    requireArray(roles.data, "role list");
    console.log("GET /api/admin/roles: PASS");

    const currentRole = me.data && me.data.role;
    const readableRole = chooseReadableSafeRole(roles.data, currentRole);
    if (!readableRole) {
      console.log("GET /api/admin/roles/:role: SKIPPED");
      console.log("reason: no non-owner/super_admin role was available in the role catalog");
      printSafeBoundary();
      return;
    }

    const roleDetail = await apiRequest(baseUrl, `/admin/roles/${encodeURIComponent(readableRole.role)}`, {
      authValue,
      label: "safe role detail",
    });
    rolePermissions(roleDetail.data);
    console.log(`GET /api/admin/roles/:role: PASS (${readableRole.role})`);

    await runRolePermissionNegatives(baseUrl, authValue, readableRole.role);
    await runNoPermissionNegative(baseUrl, readableRole.role);

    const writableRole = chooseWritableSafeRole(roles.data, currentRole, {
      requireFixtureRole: safeRoleFixtureEnvComplete(),
    });
    if (!writableRole) {
      console.log("role permission valid minimal change: SKIPPED");
      console.log("reason: no safe non-owner/super_admin staging role with assigned admins was available");
    } else {
      const changed = await runValidMinimalChange(baseUrl, authValue, writableRole.role, catalogKeys);
      if (changed) await assertAuditLog(baseUrl, authValue, writableRole.role);
    }

    console.log("Response leak scan: PASS");
    printSafeBoundary();
    console.log("Staging role permission UAT smoke: PASS");
  } catch (error) {
    console.error("Staging role permission UAT smoke: FAIL");
    console.error(sanitizeStringForLog(error.message));
    printSafeBoundary();
    process.exitCode = 1;
  }
}

main();
