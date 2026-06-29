const SAFE_LOCAL_ADMIN_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_LOCAL_ADMIN_APP_ENV = "local-test";
const LOCAL_DEMO_ADMIN_USERNAME = "local_money_flow_admin";
const LOCAL_DEMO_ADMIN_PASSWORD = "local-demo-admin-code-not-real";
const LOCAL_DEMO_ADMIN_ID_PREFIX = "local-demo-admin";
const LOCAL_DEMO_SITE_ID_PREFIX = "local-demo-site";
const LOCAL_DEMO_ADMIN_CREATED_AT = new Date("2026-01-01T00:00:00.000Z");

function localAdminLoginAllowed() {
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const appEnv = String(process.env.APP_ENV || "").trim().toLowerCase();
  return SAFE_LOCAL_ADMIN_NODE_ENVS.has(nodeEnv) && appEnv === SAFE_LOCAL_ADMIN_APP_ENV;
}

function localAdminDemoPasswordMatches(password) {
  const envPassword = String(process.env.LOCAL_ADMIN_PASSWORD || "").trim();
  return password === LOCAL_DEMO_ADMIN_PASSWORD || (envPassword && password === envPassword);
}

function localAdminDemoUsernameMatches(username) {
  return username === LOCAL_DEMO_ADMIN_USERNAME || username === "admin";
}

function buildLocalDemoAdmin(username, extra = {}) {
  const resolvedUsername = username === "admin" ? LOCAL_DEMO_ADMIN_USERNAME : String(username || LOCAL_DEMO_ADMIN_USERNAME).trim() || LOCAL_DEMO_ADMIN_USERNAME;
  return {
    id: `${LOCAL_DEMO_ADMIN_ID_PREFIX}:${resolvedUsername}`,
    username: resolvedUsername,
    role: "super_admin",
    status: "active",
    createdAt: LOCAL_DEMO_ADMIN_CREATED_AT,
    lastLoginAt: null,
    ...extra,
  };
}

function isLocalDemoAdminTokenAllowed(payload) {
  return localAdminLoginAllowed() && payload && payload.type === "admin-local" && payload.local === true;
}

function buildLocalDemoAdminFromToken(payload) {
  if (!payload || !payload.sub) return null;
  return buildLocalDemoAdmin(payload.username || LOCAL_DEMO_ADMIN_USERNAME, {
    id: String(payload.sub),
    role: payload.role || "super_admin",
    status: payload.status || "active",
    createdAt: payload.createdAt ? new Date(payload.createdAt) : LOCAL_DEMO_ADMIN_CREATED_AT,
    lastLoginAt: payload.lastLoginAt ? new Date(payload.lastLoginAt) : null,
  });
}

function buildLocalDemoSite(siteCode = "PG77") {
  const resolvedSiteCode = String(siteCode || "PG77").trim().toUpperCase() || "PG77";
  return {
    id: `${LOCAL_DEMO_SITE_ID_PREFIX}:${resolvedSiteCode}`,
    code: resolvedSiteCode,
    name: `${resolvedSiteCode} Local Demo`,
    brandName: resolvedSiteCode,
    status: "active",
    setting: null,
    theme: null,
  };
}

module.exports = {
  LOCAL_DEMO_ADMIN_USERNAME,
  LOCAL_DEMO_ADMIN_PASSWORD,
  SAFE_LOCAL_ADMIN_NODE_ENVS,
  SAFE_LOCAL_ADMIN_APP_ENV,
  localAdminLoginAllowed,
  localAdminDemoPasswordMatches,
  localAdminDemoUsernameMatches,
  buildLocalDemoAdmin,
  isLocalDemoAdminTokenAllowed,
  buildLocalDemoAdminFromToken,
  buildLocalDemoSite,
};
