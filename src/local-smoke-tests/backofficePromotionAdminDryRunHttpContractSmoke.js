"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Module = require("module");

const ROOT = path.resolve(__dirname, "..", "..");
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const REQUEST_PATH = "/api/admin/promotions/local-smoke-promo-44/dry-run";
const SITE_CODE = "PG77";
const STATIC_FILES = [
  "package.json",
  "docs/SMOKE_COVERAGE.md",
  "docs/BACKOFFICE_DEMO_API_MAPPING.md",
  "src/routes/admin.routes.js",
  "src/app.js",
  "src/controllers/promotionAdminDryRun.controller.js",
  "src/utils/promotionAdminDryRunStagingRouteMount.js",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/fetch\(|http:|https:|axios|net\.|dns\.|child_process/i.test(text), `${label} contains a network/runtime import marker.`);
}

function buildAdminFromToken(token) {
  if (token === "smoke-admin-view") {
    return {
      id: "smoke-admin-view",
      role: "support",
      status: "active",
      allowedSiteCodes: [SITE_CODE],
      permissions: ["settings.promotion.view"],
    };
  }

  if (token === "smoke-admin-write" || token === "smoke-admin-super") {
    return {
      id: "smoke-admin-write",
      role: token === "smoke-admin-super" ? "super_admin" : "owner",
      status: "active",
      allowedSiteCodes: [SITE_CODE],
      permissions: ["settings.promotion.view", "settings.promotion.write", "settings.promotion.manage"],
    };
  }

  return null;
}

function hasPermission(admin, permission) {
  if (!admin || !permission) return false;
  if (admin.role === "owner" || admin.role === "super_admin") return true;
  const permissions = admin.permissions;
  if (Array.isArray(permissions)) return permissions.includes(permission);
  if (permissions instanceof Set) return permissions.has(permission);
  if (typeof permissions === "string") return permissions.split(/[\s,]+/).includes(permission);
  if (permissions && typeof permissions === "object") return permissions[permission] === true;
  return false;
}

function hasSiteAccess(admin, siteCode) {
  if (!admin) return false;
  if (admin.role === "owner" || admin.role === "super_admin") return true;
  const allowedSites = admin.allowedSiteCodes;
  if (Array.isArray(allowedSites)) return allowedSites.includes(siteCode);
  if (allowedSites instanceof Set) return allowedSites.has(siteCode);
  return false;
}

function makeUnauthorizedPayload(code, message) {
  return {
    success: false,
    code,
    message,
    mode: "harness_http_contract",
    routeMounted: false,
    apiCallEnabled: false,
    dryRunOnly: false,
    validateOnly: false,
    writeLocked: true,
    dbWriteEnabled: false,
    walletWriteEnabled: false,
    promotionUpdateEnabled: false,
    auditWriteEnabled: false,
    ledgerWriteEnabled: false,
    turnoverCreationEnabled: false,
    claimExecutionEnabled: false,
    providerOutboundEnabled: false,
    productionLiveEnabled: false,
    productionDeployEnabled: false,
  };
}

function loadAppWithHarness() {
  const originalLoad = Module._load;

  function smokeAdminAuth(req, res, next) {
    const header = String(req.headers.authorization || "").trim();
    const [scheme, token] = header.split(/\s+/, 2);
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json(makeUnauthorizedPayload("ADMIN_AUTH_REQUIRED", "Admin authentication required"));
    }

    const admin = buildAdminFromToken(token);
    if (!admin) {
      return res.status(401).json(makeUnauthorizedPayload("ADMIN_AUTH_REQUIRED", "Admin authentication required"));
    }

    req.admin = admin;
    return next();
  }

  async function smokeSiteResolver(req, res, next) {
    const siteCode = String(req.headers["x-site-code"] || "").trim().toUpperCase();
    if (!siteCode) {
      return res.status(404).json({
        success: false,
        code: "SITE_NOT_FOUND",
        message: "Site not found",
        routeMounted: false,
        apiCallEnabled: false,
        dryRunOnly: false,
        validateOnly: false,
      });
    }

    req.site = {
      id: `site-${siteCode.toLowerCase()}`,
      code: siteCode,
    };
    req.siteId = req.site.id;
    req.siteCode = req.site.code;
    return next();
  }

  async function smokeSiteAccess(req, res, next) {
    if (!req.admin || !req.siteId || !hasSiteAccess(req.admin, req.siteCode)) {
      return res.status(403).json({
        success: false,
        code: "SITE_ACCESS_DENIED",
        message: "You do not have access to this site",
        routeMounted: false,
        apiCallEnabled: false,
        dryRunOnly: false,
        validateOnly: false,
      });
    }

    return next();
  }

  async function smokeAdminHasPermission(admin, _siteId, permission) {
    return hasPermission(admin, permission);
  }

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "../middleware/adminAuth" || request === "./middleware/adminAuth") {
      return smokeAdminAuth;
    }

    if (request === "../middleware/siteResolver" || request === "./middleware/siteResolver") {
      return Object.assign(smokeSiteResolver, {
        resolveSiteForRequest: async (req) => {
          const siteCode = String(req.headers["x-site-code"] || "").trim().toUpperCase();
          if (!siteCode) return null;
          return {
            id: `site-${siteCode.toLowerCase()}`,
            code: siteCode,
          };
        },
        attachSiteToRequest: (req, site) => {
          req.site = site;
          req.siteId = site.id;
          req.siteCode = site.code;
        },
      });
    }

    if (request === "../middleware/siteAccess" || request === "./siteAccess") {
      return {
        adminCanAccessSite: async (admin, siteId) => Boolean(admin && siteId && hasSiteAccess(admin, SITE_CODE)),
        siteAccess: smokeSiteAccess,
        requireTargetSiteAccess: () => smokeSiteAccess,
      };
    }

    if (request === "../services/adminPermission.service") {
      return {
        PERMISSIONS: {},
        ROLES: {},
        ROLE_PERMISSIONS: {},
        PERMISSION_DETAILS: {},
        adminHasPermission: smokeAdminHasPermission,
        listPermissions: async () => [],
        listPermissionCatalog: async () => [],
        listRoles: async () => [],
        getRole: async () => null,
        updateRolePermissions: async () => ({
          before: null,
          after: null,
        }),
      };
    }

    return originalLoad.apply(this, arguments);
  };

  const appPath = path.join(ROOT, "src", "app.js");
  delete require.cache[require.resolve(appPath)];
  const app = require(appPath);

  return {
    app,
    restore() {
      Module._load = originalLoad;
      delete require.cache[require.resolve(appPath)];
    },
  };
}

async function requestJson(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: options.method || "GET",
    headers: Object.assign(
      {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Site-Code": SITE_CODE,
      },
      options.headers || {}
    ),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    redirect: "manual",
  });

  const text = await response.text();
  assertNoSecretShape(route, text);
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (_error) {
      body = null;
    }
  }

  return { response, text, body };
}

function assertCommonDryRunFlags(body) {
  assert.strictEqual(body.mode, "staging_dry_run_only");
  assert.strictEqual(body.routeMounted, true);
  assert.strictEqual(body.apiCallEnabled, true);
  assert.strictEqual(body.dryRunOnly, true);
  assert.strictEqual(body.validateOnly, true);
  assert.strictEqual(body.writeLocked, true);
  assert.strictEqual(body.dbWriteEnabled, false);
  assert.strictEqual(body.walletWriteEnabled, false);
  assert.strictEqual(body.promotionUpdateEnabled, false);
  assert.strictEqual(body.auditWriteEnabled, false);
  assert.strictEqual(body.ledgerWriteEnabled, false);
  assert.strictEqual(body.turnoverCreationEnabled, false);
  assert.strictEqual(body.claimExecutionEnabled, false);
  assert.strictEqual(body.providerOutboundEnabled, false);
  assert.strictEqual(body.productionLiveEnabled, false);
  assert.strictEqual(body.productionDeployEnabled, false);
  assert.strictEqual(body.mountedMethod, "POST");
  assert.strictEqual(body.mountedRoute, ROUTE_PATH);
  assert.strictEqual(body.permissionBoundary.currentReadPermission, "settings.promotion.view");
  assert.deepStrictEqual(body.permissionBoundary.futureDryRunPermissions, [
    "settings.promotion.write",
    "settings.promotion.manage",
  ]);
}

async function main() {
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminRoutes = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/promotionAdminDryRun.controller.js");
  const utilSource = read("src/utils/promotionAdminDryRunStagingRouteMount.js");
  const routeSmokeSource = read("src/local-smoke-tests/backofficePromotionAdminDryRunStagingRouteMountSmoke.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-http-contract",
    "backofficePromotionAdminDryRunHttpContractSmoke.js",
  ]);

  assertIncludes("coverage docs", smokeCoverage, [
    "backofficePromotionAdminDryRunHttpContractSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-http-contract",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HTTP-CONTRACT-44",
    "validateOnly",
    "walletWriteEnabled",
    "productionLiveEnabled",
  ]);

  assertIncludes("mapping docs", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HTTP-CONTRACT-44",
    "POST /api/admin/promotions/:id/dry-run",
    "validateOnly",
    "walletWriteEnabled",
    "productionLiveEnabled",
  ]);

  assertIncludes("admin route wiring", adminRoutes, [
    'router.post("/promotions/:id/dry-run"',
    "protectedSite",
    'canAny(["settings.promotion.write", "settings.promotion.manage"])',
    "promotionAdminDryRunController.promotionAdminDryRun",
  ]);

  assertIncludes("controller wiring", controllerSource, [
    "simulatePromotionAdminDryRunStagingRouteMount",
    "promotionAdminDryRun",
    "res.status(response.status).json(response.body)",
  ]);

  assertIncludes("util wiring", utilSource, [
    "validateOnly: true",
    "walletWriteEnabled: false",
    "productionLiveEnabled: false",
    "routeMounted: true",
    "apiCallEnabled: true",
    "dryRunOnly: true",
    "dbWriteEnabled: false",
    "promotionUpdateEnabled: false",
    "auditWriteEnabled: false",
    "ledgerWriteEnabled: false",
    "turnoverCreationEnabled: false",
    "claimExecutionEnabled: false",
    "providerOutboundEnabled: false",
    "productionDeployEnabled: false",
  ]);

  assertIncludes("route smoke reuse", routeSmokeSource, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-STAGING-ROUTE-MOUNT-43",
    "validatePromotionAdminWriteDryRun",
    "routeMounted: true",
  ]);

  const harness = loadAppWithHarness();
  const server = harness.app.listen();
  const port = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", () => resolve(server.address().port));
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const success = await requestJson(baseUrl, REQUEST_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer smoke-admin-write",
      },
      body: {
        before: {
          title: "Spring Promo",
          status: "active",
        },
        after: {
          title: "Spring Promo Updated",
          status: "active",
        },
        auditReason: "validate dry-run contract",
        riskAcknowledgement: true,
      },
    });

    if (success.response.status !== 200) {
      console.log(success.text);
    }
    assert.strictEqual(success.response.status, 200, "POST dry-run contract should succeed for authorized local-safe smoke admin.");
    assert(success.body && typeof success.body === "object", "POST dry-run contract should return JSON.");
    assert.strictEqual(success.body.success, true);
    assert.strictEqual(success.body.code, null);
    assert.strictEqual(success.body.message, "Promotion admin dry-run staging route mount validated successfully.");
    assert.strictEqual(success.body.validator, "validatePromotionAdminWriteDryRun");
    assert.strictEqual(success.body.promotionId, "local-smoke-promo-44");
    assertCommonDryRunFlags(success.body);

    const forbidden = await requestJson(baseUrl, REQUEST_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer smoke-admin-view",
      },
      body: {
        before: { title: "Forbidden Promo" },
        after: { title: "Forbidden Promo Updated" },
        auditReason: "forbidden permission check",
        riskAcknowledgement: true,
      },
    });

    assert.strictEqual(forbidden.response.status, 403, "POST dry-run contract should fail closed without write permission.");
    assert.strictEqual(forbidden.body.success, false);
    assert.strictEqual(forbidden.body.message, "Admin permission denied");
    assert.deepStrictEqual(forbidden.body.errors, {
      permissions: ["settings.promotion.write", "settings.promotion.manage"],
    });

    const invalid = await requestJson(baseUrl, REQUEST_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer smoke-admin-write",
      },
      body: {
        before: { title: "Invalid Promo" },
        after: { bonusValue: 25 },
        auditReason: "bonus change requires acknowledgement",
      },
    });

    assert.strictEqual(invalid.response.status, 422, "POST dry-run contract should validate payloads.");
    assert.strictEqual(invalid.body.success, false);
    assert.strictEqual(invalid.body.validator, "validatePromotionAdminWriteDryRun");
    assert.strictEqual(invalid.body.routeMounted, true);
    assert.strictEqual(invalid.body.validateOnly, true);
    assert.strictEqual(invalid.body.dbWriteEnabled, false);
    assert.strictEqual(invalid.body.walletWriteEnabled, false);
    assert.strictEqual(invalid.body.claimExecutionEnabled, false);
    assert.strictEqual(invalid.body.ledgerWriteEnabled, false);
    assert.strictEqual(invalid.body.auditWriteEnabled, false);
    assert.strictEqual(invalid.body.turnoverCreationEnabled, false);
    assert.strictEqual(invalid.body.providerOutboundEnabled, false);
    assert.strictEqual(invalid.body.productionLiveEnabled, false);

    const wrongMethod = await requestJson(baseUrl, REQUEST_PATH, {
      method: "GET",
      headers: {
        Authorization: "Bearer smoke-admin-write",
      },
    });

    assert.strictEqual(wrongMethod.response.status, 404, "GET must stay closed on the POST-only dry-run route.");
    assert.notStrictEqual(wrongMethod.response.status, 200, "GET must not be opened on the POST-only dry-run route.");

    const wrongPath = await requestJson(baseUrl, "/api/admin/promotions/local-smoke-promo-44", {
      method: "POST",
      headers: {
        Authorization: "Bearer smoke-admin-write",
      },
      body: {
        auditReason: "wrong path check",
      },
    });

    assert.strictEqual(wrongPath.response.status, 404, "Wrong path must stay closed.");
    assert.notStrictEqual(wrongPath.response.status, 200, "Wrong path must not be opened.");

    const unauth = await requestJson(baseUrl, REQUEST_PATH, {
      method: "POST",
      body: {
        auditReason: "missing auth",
      },
    });

    assert.strictEqual(unauth.response.status, 401, "Missing auth must fail closed.");

    console.log("Backoffice promotion admin dry-run HTTP contract route wiring: PASS");
    console.log("Backoffice promotion admin dry-run HTTP contract guard wiring: PASS");
    console.log("Backoffice promotion admin dry-run HTTP contract response shape: PASS");
    console.log("Backoffice promotion admin dry-run HTTP contract fail-closed method/path: PASS");
    console.log("Backoffice promotion admin dry-run HTTP contract smoke: PASS");
  } finally {
    await close(server);
    harness.restore();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
