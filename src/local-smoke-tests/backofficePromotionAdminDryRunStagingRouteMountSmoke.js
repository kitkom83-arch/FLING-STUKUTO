const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { simulatePromotionAdminDryRunStagingRouteMount } = require("../utils/promotionAdminDryRunStagingRouteMount");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!/fetch\(|http:|https:|axios|net\.|dns\.|child_process/i.test(text), `${label} contains a network/runtime import marker.`);
}

function extractConstantSnippet(text, constantName) {
  const marker = `const ${constantName} =`;
  const start = text.indexOf(marker);
  assert(start !== -1, `missing constant: ${constantName}`);
  const end = text.indexOf(";\n", start);
  assert(end !== -1, `unterminated constant: ${constantName}`);
  return text.slice(start, end + 1);
}

function extractSectionSnippet(text, markerAttribute) {
  const start = text.indexOf(markerAttribute);
  assert(start !== -1, `missing marker attribute: ${markerAttribute}`);
  const sectionStart = text.lastIndexOf("<section", start);
  assert(sectionStart !== -1, `missing section start for marker: ${markerAttribute}`);
  const end = text.indexOf("</section>", start);
  assert(end !== -1, `missing section end for marker: ${markerAttribute}`);
  return text.slice(sectionStart, end + "</section>".length);
}

function makeRequest(changes, actorOverrides, method = "POST", pathValue = "/api/admin/promotions/:id/dry-run") {
  const base = {
    title: "New Year Promo",
    type: "deposit",
    status: "active",
    minDeposit: 100,
    maxDeposit: 500,
    bonusType: "fixed",
    bonusValue: 20,
    turnoverMultiplier: 3,
    maxWithdraw: 200,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-01-31T23:59:59.000Z",
  };

  return {
    method,
    path: pathValue,
    params: { id: "promo-123" },
    body: {
      before: Object.assign({}, base),
      after: Object.assign({}, base, changes.after || {}),
      auditReason: changes.auditReason,
      riskAcknowledgement: changes.riskAcknowledgement,
    },
    actor: Object.assign(
      {
        id: "admin-77",
        role: "finance",
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      actorOverrides || {}
    ),
    headers: {
      "x-site-code": "PG77",
    },
  };
}

function assertCommonResponseFlags(response) {
  assert.strictEqual(response.body.mode, "staging_dry_run_only");
  assert.strictEqual(response.body.routeMounted, true);
  assert.strictEqual(response.body.apiCallEnabled, true);
  assert.strictEqual(response.body.dryRunOnly, true);
  assert.strictEqual(response.body.writeLocked, true);
  assert.strictEqual(response.body.dbWriteEnabled, false);
  assert.strictEqual(response.body.promotionUpdateEnabled, false);
  assert.strictEqual(response.body.auditWriteEnabled, false);
  assert.strictEqual(response.body.ledgerWriteEnabled, false);
  assert.strictEqual(response.body.turnoverCreationEnabled, false);
  assert.strictEqual(response.body.claimExecutionEnabled, false);
  assert.strictEqual(response.body.providerOutboundEnabled, false);
  assert.strictEqual(response.body.productionDeployEnabled, false);
  assert.strictEqual(response.body.mountedMethod, "POST");
  assert.strictEqual(response.body.mountedRoute, "/api/admin/promotions/:id/dry-run");
  assert.strictEqual(response.body.permissionBoundary.currentReadPermission, "settings.promotion.view");
  assert.deepStrictEqual(response.body.permissionBoundary.futureDryRunPermissions, ["settings.promotion.write", "settings.promotion.manage"]);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminRoutes = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/promotionAdminDryRun.controller.js");
  const utilSource = read("src/utils/promotionAdminDryRunStagingRouteMount.js");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-staging-route-mount",
    "backofficePromotionAdminDryRunStagingRouteMountSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunStagingRouteMountSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-staging-route-mount",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-STAGING-ROUTE-MOUNT-43",
    "mounted dry-run only",
    "routeMounted",
    "apiCallEnabled",
    "dbWriteEnabled",
    "productionDeployEnabled",
  ]);

  assertIncludes("mapping doc phase", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-STAGING-ROUTE-MOUNT-43",
    "actual mounted local-safe POST `/api/admin/promotions/:id/dry-run` endpoint",
    "routeMounted: true",
    "productionDeployEnabled: false",
    "New project.zip remains a UI/mock reference only, not a backend source",
  ]);

  assertIncludes("route wiring", adminRoutes, [
    'router.post("/promotions/:id/dry-run"',
    "protectedSite",
    'canAny(["settings.promotion.write", "settings.promotion.manage"])',
    "promotionAdminDryRunController.promotionAdminDryRun",
  ]);
  assertNotIncludes("route writes", adminRoutes, [
    'router.post("/promotions",',
    'router.patch("/promotions",',
    'router.put("/promotions",',
    'router.delete("/promotions",',
    'router.get("/promotions/:id/dry-run"',
    "POST /api/promotions/:id/claim",
  ]);

  assertIncludes("controller source", controllerSource, [
    "simulatePromotionAdminDryRunStagingRouteMount",
    "promotionAdminDryRun",
    "res.status(response.status).json(response.body)",
  ]);
  assertNotIncludes("controller forbidden imports", controllerSource, [
    "require(\"../config/prisma\")",
    "require(\"../services/",
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
  ]);

  assertIncludes("util source", utilSource, [
    "validatePromotionAdminWriteDryRun",
    "staging_dry_run_only",
    "routeMounted: true",
    "apiCallEnabled: true",
    "dryRunOnly: true",
    "dbWriteEnabled: false",
    "productionDeployEnabled: false",
    "PROMOTION_DRY_RUN_FORBIDDEN",
    "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
    "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
    "PROMOTION_DRY_RUN_METHOD_NOT_ALLOWED",
    "PROMOTION_DRY_RUN_ROUTE_NOT_MOUNTED",
  ]);
  assertNotIncludes("util forbidden imports", utilSource, [
    "require(\"../config/prisma\")",
    "require(\"../controllers/",
    "require(\"../services/",
    "fetch(",
    "axios",
    "http:",
    "https:",
    "net.",
    "dns.",
    "express",
  ]);

  assertIncludes("ui markers", [adminHtml, moneyDemoSource, adminUiSource].join("\n"), [
    "promotion admin dry-run staging route mount",
    "route mounted for dry-run only",
    "POST /api/admin/promotions/:id/dry-run",
    "staging/local-safe dry-run only",
    "no DB write",
    "no promotion update",
    "no audit row creation",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no runtime credit action",
    "no provider outbound",
    "no production deploy",
    "write locked",
    "production disabled",
  ]);

  assertNotIncludes("frontend auto-call", moneyDemoSource + "\n" + adminUiSource, [
    'fetch("/api/admin/promotions/:id/dry-run"',
    'apiRequest("/admin/promotions/:id/dry-run"',
  ]);

  const validWrite = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { title: "New Year Promo Updated" },
        auditReason: "title refresh",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(validWrite.status, 200);
  assert.strictEqual(validWrite.body.success, true);
  assert.strictEqual(validWrite.body.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(validWrite.body.routeMounted, true);
  assert.strictEqual(validWrite.body.apiCallEnabled, true);
  assert.strictEqual(validWrite.body.dryRunOnly, true);
  assert.strictEqual(validWrite.body.writeLocked, true);
  assert.strictEqual(validWrite.body.dbWriteEnabled, false);
  assert.strictEqual(validWrite.body.promotionId, "promo-123");
  assertCommonResponseFlags(validWrite);

  const forbidden = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { title: "Denied Promo" },
        auditReason: "should not matter",
      },
      {
        permissions: ["settings.promotion.view"],
      }
    )
  );
  assert.strictEqual(forbidden.status, 403);
  assert.strictEqual(forbidden.body.success, false);
  assert.strictEqual(forbidden.body.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(forbidden);

  const missingAuditReason = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { title: "Missing Audit Promo" },
        auditReason: "   ",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(missingAuditReason.status, 422);
  assert.strictEqual(missingAuditReason.body.code, "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED");
  assertCommonResponseFlags(missingAuditReason);

  const missingRiskAck = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { bonusValue: 25 },
        auditReason: "bonus change",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );
  assert.strictEqual(missingRiskAck.status, 422);
  assert.strictEqual(missingRiskAck.body.code, "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED");
  assertCommonResponseFlags(missingRiskAck);

  const wrongMethod = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { title: "Wrong Method Promo" },
        auditReason: "method check",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      "GET"
    )
  );
  assert.strictEqual(wrongMethod.status, 405);
  assert.strictEqual(wrongMethod.body.routeMounted, false);
  assert.strictEqual(wrongMethod.body.apiCallEnabled, false);
  assert.strictEqual(wrongMethod.body.dryRunOnly, false);

  const wrongPath = simulatePromotionAdminDryRunStagingRouteMount(
    makeRequest(
      {
        after: { title: "Wrong Path Promo" },
        auditReason: "path check",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      "POST",
      "/api/admin/promotions"
    )
  );
  assert.strictEqual(wrongPath.status, 404);
  assert.strictEqual(wrongPath.body.routeMounted, false);
  assert.strictEqual(wrongPath.body.apiCallEnabled, false);
  assert.strictEqual(wrongPath.body.dryRunOnly, false);

  for (const [label, text] of [
    ["controller source", controllerSource],
    ["util source", utilSource],
    ["admin routes", adminRoutes],
    [
      "admin HTML staging route mount panel",
      extractSectionSnippet(
        adminHtml,
        'data-promotion-admin-dry-run-staging-route-mount-marker="BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-STAGING-ROUTE-MOUNT-43"'
      ),
    ],
    [
      "money demo staging note",
      extractConstantSnippet(moneyDemoSource, "PROMOTION_ADMIN_DRY_RUN_STAGING_ROUTE_MOUNT_NOTE"),
    ],
    [
      "admin UI staging note",
      extractConstantSnippet(adminUiSource, "PROMOTION_ADMIN_DRY_RUN_STAGING_ROUTE_MOUNT_NOTE"),
    ],
  ]) {
    assertNoSecretShape(label, text);
  }

  console.log("Backoffice promotion admin dry-run staging route mount package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run staging route mount route wiring: PASS");
  console.log("Backoffice promotion admin dry-run staging route mount controller/util wiring: PASS");
  console.log("Backoffice promotion admin dry-run staging route mount response flags: PASS");
  console.log("Backoffice promotion admin dry-run staging route mount safety scan: PASS");
  console.log("Backoffice promotion admin dry-run staging route mount smoke: PASS");
}

main();
