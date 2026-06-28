const assert = require("assert");
const fs = require("fs");
const path = require("path");

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
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const runbookDoc = read("docs/PROMOTION_ADMIN_DRY_RUN_ENABLEMENT_RUNBOOK.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");
  const routeSource = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/admin.controller.js");
  const serviceSource = read("src/services/promotion.service.js");

  const scripts = [
    "smoke:backoffice-promotion-admin-dry-run-ui-preview",
    "smoke:backoffice-promotion-admin-dry-run-route-readiness",
    "smoke:backoffice-promotion-admin-dry-run-controller-readiness",
    "smoke:backoffice-promotion-admin-dry-run-service-readiness",
    "smoke:backoffice-promotion-admin-dry-run-audit-ledger-readiness",
    "smoke:backoffice-promotion-admin-dry-run-runtime-preflight",
    "smoke:backoffice-promotion-admin-dry-run-mount-authorization",
    "smoke:backoffice-promotion-admin-dry-run-enablement-runbook",
    "smoke:backoffice-promotion-admin-dry-run-housekeeping",
  ];
  const phaseMarkers = [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-PREVIEW-32",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ROUTE-READINESS-33",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CONTROLLER-READINESS-34",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-SERVICE-READINESS-35",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-AUDIT-LEDGER-READINESS-36",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-PREFLIGHT-37",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-MOUNT-AUTHORIZATION-38",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HOUSEKEEPING-40",
  ];
  const uiMarkers = [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HOUSEKEEPING-40",
    "promotion admin dry-run housekeeping",
    "housekeeping only",
    "no runtime behavior change",
    "route not mounted",
    "runtime not enabled",
    "write locked",
    "no DB write",
    "no promotion update",
    "no audit row creation",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no provider outbound",
    "no production deploy",
    "no live provider/payment/bank/SMS/slip OCR",
  ];
  const sourceMarkers = [
    "promotion admin dry-run housekeeping",
    "housekeeping only",
    "no runtime behavior change",
    "route not mounted",
    "runtime not enabled",
    "write locked",
    "no DB write",
    "no promotion update",
    "no audit row creation",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no runtime credit action",
    "no provider outbound",
    "no production deploy",
    "no live provider/payment/bank/SMS/slip OCR",
  ];

  assertIncludes("package scripts", packageJson, scripts.concat(["backofficePromotionAdminDryRunHousekeepingSmoke.js"]));
  assertIncludes("mapping doc", mappingDoc, phaseMarkers.concat(["New project.zip remains a UI/mock reference only, not a backend source"]));
  assertIncludes("smoke coverage", smokeDocs, scripts.concat(phaseMarkers).concat(["backofficePromotionAdminDryRunHousekeepingSmoke.js"]));
  assertIncludes("runbook doc headings", runbookDoc, [
    "# Promotion Admin Dry-run Enablement Runbook",
    "## Purpose",
    "## Current status",
    "## Required approvals",
    "## Required prechecks",
    "## UAT checklist",
    "## Monitoring checklist",
    "## Rollback checklist",
    "## Non-goals",
    "## Hard safety locks",
  ]);
  assert(!/\r?\n\r?\n$/.test(runbookDoc), "runbook doc must not end with a blank line.");
  assertIncludes("ui markers", adminHtml, uiMarkers);
  assertIncludes("source note markers", `${moneyDemoSource}\n${adminUiSource}`, sourceMarkers);
  assertNoSecretShape("frontend sources", `${moneyDemoSource}\n${adminUiSource}\n${adminHtml}`);
  assertNotIncludes("frontend mutation endpoint calls", `${moneyDemoSource}\n${adminUiSource}`, [
    "/api/admin/promotions/:id/dry-run",
    "PATCH /api/admin/promotions",
    "PUT /api/admin/promotions",
    "DELETE /api/admin/promotions",
  ]);
  assertNotIncludes("route/controller/service dry-run change", `${routeSource}\n${controllerSource}\n${serviceSource}`, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-HOUSEKEEPING-40",
    "promotion admin dry-run housekeeping",
    "simulatePromotionAdminDryRunHousekeeping",
    "dryRunPromotionUpdate",
  ]);
  assertNoSecretShape("route/controller/service", `${routeSource}\n${controllerSource}\n${serviceSource}`);

  console.log("Backoffice promotion admin dry-run housekeeping package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run housekeeping docs coverage: PASS");
  console.log("Backoffice promotion admin dry-run housekeeping UI markers: PASS");
  console.log("Backoffice promotion admin dry-run housekeeping source notes: PASS");
  console.log("Backoffice promotion admin dry-run housekeeping boundary scan: PASS");
  console.log("Backoffice promotion admin dry-run housekeeping smoke: PASS");
}

main();
