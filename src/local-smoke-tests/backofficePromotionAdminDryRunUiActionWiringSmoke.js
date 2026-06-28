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

function assertNotMatch(label, text, patterns) {
  for (const pattern of patterns) {
    assert(!pattern.test(text), `${label} matched forbidden pattern: ${pattern}`);
  }
}

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = new RegExp("Bear" + "er\\s+");
  const keyLiteral = new RegExp("\\b" + "s" + "k-");
  const envLiteral = new RegExp("DATABASE" + "_URL\\s*=");
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!bearerLiteral.test(text), `${label} contains a bearer literal.`);
  assert(!keyLiteral.test(text), `${label} contains a secret-key-like literal.`);
  assert(!envLiteral.test(text), `${label} contains a DATABASE_URL assignment literal.`);
}

function main() {
  const packageJson = read("package.json");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminUiSource = read("src/admin-ui/app.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-ui-action-wiring",
    "backofficePromotionAdminDryRunUiActionWiringSmoke.js",
  ]);

  assertIncludes("smoke docs", smokeDocs, [
    "backofficePromotionAdminDryRunUiActionWiringSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-ui-action-wiring",
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-ACTION-WIRING-45",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-ACTION-WIRING-45",
    "POST `/api/admin/promotions/:id/dry-run`",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
  ]);

  assertIncludes("admin HTML UI action panel", adminHtml, [
    'data-promotion-admin-dry-run-ui-action-wiring-marker="BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-ACTION-WIRING-45"',
    "Promotion Admin Dry-run UI Action",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
    "admin-promotion-dry-run-route-mounted",
    "admin-promotion-dry-run-api-enabled",
    "admin-promotion-dry-run-db-write-enabled",
    "admin-promotion-dry-run-wallet-write-enabled",
    "admin-promotion-dry-run-promotion-update-enabled",
    "admin-promotion-dry-run-audit-write-enabled",
    "admin-promotion-dry-run-ledger-write-enabled",
    "admin-promotion-dry-run-turnover-enabled",
    "admin-promotion-dry-run-claim-enabled",
    "admin-promotion-dry-run-provider-enabled",
    "admin-promotion-dry-run-production-live-enabled",
    "admin-promotion-dry-run-production-deploy-enabled",
    "Dry-run</th>",
  ]);

  assertIncludes("money demo source", moneyDemoSource, [
    "PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE",
    "`/admin/promotions/${encodeURIComponent(form.promotionId)}/dry-run`",
    'method: "POST"',
    "returnPayload: true",
    "Dry-run promotion",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
    "routeMounted",
    "apiCallEnabled",
    "dryRunOnly",
    "validateOnly",
    "writeLocked",
    "dbWriteEnabled",
    "walletWriteEnabled",
    "promotionUpdateEnabled",
    "auditWriteEnabled",
    "ledgerWriteEnabled",
    "turnoverCreationEnabled",
    "claimExecutionEnabled",
    "providerOutboundEnabled",
    "productionLiveEnabled",
    "productionDeployEnabled",
    "fail-closed",
  ]);

  assertIncludes("admin UI guard context", adminUiSource, [
    "PROMOTION_ADMIN_DRY_RUN_STAGING_ROUTE_MOUNT_NOTE",
    "POST /api/admin/promotions/:id/dry-run",
    "no DB write",
    "no promotion update",
    "no provider outbound",
    "no production deploy",
  ]);

  assertNotMatch("money demo forbidden promotion CRUD runtime", moneyDemoSource, [
    /apiRequest\(\s*`?\/admin\/promotions`?\s*,\s*\{[\s\S]{0,120}method:\s*"POST"/,
    /apiRequest\(\s*`?\/admin\/promotions\/\$\{[^}]+\}`?\s*,\s*\{[\s\S]{0,120}method:\s*"PATCH"/,
    /apiRequest\(\s*`?\/admin\/promotions\/\$\{[^}]+\}`?\s*,\s*\{[\s\S]{0,120}method:\s*"PUT"/,
    /apiRequest\(\s*`?\/admin\/promotions\/\$\{[^}]+\}`?\s*,\s*\{[\s\S]{0,120}method:\s*"DELETE"/,
    /apiRequest\(\s*["'`]\/promotions\/[^"'`]*\/claim["'`]\s*,\s*\{[\s\S]{0,120}method:\s*"POST"/,
  ]);

  for (const [label, text] of [
    ["package.json", packageJson],
    ["docs/SMOKE_COVERAGE.md", smokeDocs],
    ["docs/BACKOFFICE_DEMO_API_MAPPING.md", mappingDoc],
    ["src/money-demo-ui/admin.html", adminHtml],
    ["src/money-demo-ui/app.js", moneyDemoSource],
  ]) {
    assertNoSecretShape(label, text);
  }

  console.log("Backoffice promotion admin dry-run UI action wiring package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run UI action wiring endpoint and method markers: PASS");
  console.log("Backoffice promotion admin dry-run UI action wiring safety flags: PASS");
  console.log("Backoffice promotion admin dry-run UI action wiring forbidden runtime scan: PASS");
  console.log("Backoffice promotion admin dry-run UI action wiring secret scan: PASS");
  console.log("Backoffice promotion admin dry-run UI action wiring smoke: PASS");
}

main();
