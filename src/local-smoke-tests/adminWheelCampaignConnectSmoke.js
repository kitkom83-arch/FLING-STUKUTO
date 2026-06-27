const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const COVERAGE = "docs/SMOKE_COVERAGE.md";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} contains forbidden marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const normalized = String(text || "").toLowerCase().replace(/\s+/g, " ");
  for (const marker of markers) {
    assert(normalized.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertAdminSourceVisibility() {
  const adminUi = readRequired("src/admin-wheel-ui/app.js");

  assertIncludes("Admin wheel source visibility markers", adminUi, [
    'const ADMIN_SOURCE_OF_TRUTH_MARKER = "Backend/admin source only";',
    'const ADMIN_PRIZE_LIST_MARKER = "Prize list from GET /api/admin/wheel/config";',
    'const MEMBER_SOURCE_LINK_MARKER = "Same backend source used by member config and member spin flow.";',
    'const LOCAL_SAFE_CONFIG_MARKER = "local/mock-safe config";',
    "function renderSourceVisibility() {",
    "Active campaign",
    "reward id",
    "campaign ",
  ]);
}

function assertSharedBackendSource() {
  const service = readRequired("src/services/wheel.service.js");
  const controller = readRequired("src/controllers/wheel.controller.js");

  assertIncludes("Wheel service shared campaign source", service, [
    'const DEFAULT_CAMPAIGN_ID = "wheel_main";',
    "async function activeCampaign(siteId, campaignId = DEFAULT_CAMPAIGN_ID, tx = prisma) {",
    "const campaign = await activeCampaign(siteId, campaignId);",
    "const campaign = await activeCampaign(siteId, campaignId, tx);",
    "async function adminConfig(siteId) {",
    "where: { id: DEFAULT_CAMPAIGN_ID, siteId }",
    "include: { rewards: { orderBy: { sortOrder: \"asc\" } } }",
  ]);

  assertIncludes("Wheel controller shared service usage", controller, [
    "await wheelService.getMemberConfig({",
    "await wheelService.spin({",
    "await wheelService.adminConfig(req.siteId)",
  ]);
}

function assertMemberSpinContract() {
  const wheelApi = readRequired("apps/lucky-wheel-game/src/game/services/wheelApi.ts");
  const memberUi = readRequired("apps/lucky-wheel-game/src/ui/mountGameUi.ts");
  const adminUi = readRequired("src/admin-wheel-ui/app.js");

  assert(/\bbody:\s*\{\s*campaignId\s*\}/s.test(wheelApi), "Member wheel spin payload must remain { campaignId } only.");
  const spinCallMatch = wheelApi.match(/apiRequest<ApiSpinResponse>\('\/member\/wheel\/spin',\s*\{[\s\S]*?\n\s*\}\);/);
  assert(spinCallMatch, "Member wheel spin request block must exist.");
  assertNotIncludes("Member wheel spin request block", spinCallMatch[0], [
    "rewardId",
    "prizeIndex",
    "rewardValue",
    "probabilityWeight",
  ]);

  assertNotIncludes("Admin wheel UI must not choose member result", adminUi, [
    "/member/wheel/spin",
    "Math.random",
    "force reward",
    "force spin",
    "set prizeIndex",
  ]);
  assertNotIncludes("Member wheel UI must not use frontend result selection", memberUi, [
    "Math.random",
    "mock result",
    "frontend-selected reward",
  ]);
}

function assertNoTokenLeak() {
  const adminUi = readRequired("src/admin-wheel-ui/app.js");
  const memberUi = readRequired("apps/lucky-wheel-game/src/ui/mountGameUi.ts");
  const combined = [adminUi, memberUi].join("\n");

  const consoleTokenPattern = /console\.(log|debug|info|warn|error)\s*\([^)]*(token|secret|password|session)/i;
  const htmlTokenPattern = /(innerHTML|textContent)\s*=\s*[^;\n]*(token|secret|password|session)/i;

  assert(!consoleTokenPattern.test(combined), "Frontend files must not log token/session markers.");
  assert(!htmlTokenPattern.test(combined), "Frontend files must not render token/session markers.");
}

function assertSafeRuntimeBoundaries() {
  const service = readRequired("src/services/wheel.service.js");
  const adminUi = readRequired("src/admin-wheel-ui/app.js");

  assertIncludes("Wheel safe runtime markers", service, [
    'const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox", "disabled"]);',
    'const LIVE_APP_ENVS = new Set(["prod", "production", "live"]);',
    "Lucky Wheel is blocked outside staging/mock mode",
    "must be mock, sandbox, or disabled for Lucky Wheel MVP",
  ]);

  assertNormalizedIncludes("Admin wheel local-safe wording", adminUi, [
    "no real money",
    "no live provider",
    "local/mock-safe config",
  ]);
}

function assertPackageAndDocs() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:admin-wheel-campaign-connect"],
    "node src/local-smoke-tests/adminWheelCampaignConnectSmoke.js",
    "package.json missing smoke:admin-wheel-campaign-connect script."
  );

  const coverage = readRequired(COVERAGE);
  assertIncludes("Smoke coverage entry", coverage, [
    "adminWheelCampaignConnectSmoke.js",
    "smoke:admin-wheel-campaign-connect",
    "admin/member campaign-prize source linkage",
  ]);
  assertIncludes("Smoke coverage section", coverage, [
    "## 17A. smoke:admin-wheel-campaign-connect Coverage",
    "Same backend source used by member config and member spin flow.",
  ]);
}

function main() {
  assertAdminSourceVisibility();
  console.log("Admin wheel campaign source visibility: PASS");

  assertSharedBackendSource();
  console.log("Admin/member wheel shared backend source: PASS");

  assertMemberSpinContract();
  console.log("Member wheel spin contract preserved: PASS");

  assertNoTokenLeak();
  console.log("Admin/member frontend no token render/log markers: PASS");

  assertSafeRuntimeBoundaries();
  console.log("Lucky Wheel local-safe runtime markers: PASS");

  assertPackageAndDocs();
  console.log("Admin wheel campaign connect package/docs wiring: PASS");

  console.log("Admin wheel campaign connect smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Admin wheel campaign connect smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
