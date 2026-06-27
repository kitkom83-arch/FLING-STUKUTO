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

function assertAdminRoutes() {
  const routes = readRequired("src/routes/admin.routes.js");

  assertIncludes("Admin wheel routes", routes, [
    'router.get("/wheel/config", protectedSite, canAny(["wheel.view", "wheel.campaign.view"]), asyncHandler(wheelController.adminConfig));',
    'router.patch("/wheel/campaign", protectedSite, can("wheel.campaign.update"), asyncHandler(wheelController.updateCampaign));',
    'router.post("/wheel/rewards", protectedSite, canAny(["wheel.reward.create", "wheel.rewards.create"]), asyncHandler(wheelController.createReward));',
    'router.patch("/wheel/rewards/:id", protectedSite, canWheelRewardUpdate, asyncHandler(wheelController.updateReward));',
  ]);
}

function assertAdminUiLoadSaveFlow() {
  const adminUi = readRequired("src/admin-wheel-ui/app.js");

  assertIncludes("Admin wheel UI load/save markers", adminUi, [
    "async function loadConfig() {",
    'const data = await api("/admin/wheel/config");',
    "async function saveCampaign(event) {",
    'await api("/admin/wheel/campaign", {',
    "await loadConfig();",
    "async function saveReward(event) {",
    'await api("/admin/wheel/rewards", {',
    'await api(`/admin/wheel/rewards/${encodeURIComponent(state.editingReward.id)}`, {',
    "function renderSourceVisibility() {",
  ]);

  assertNormalizedIncludes("Admin wheel local/mock-safe marker", adminUi, [
    "local/mock-safe config",
    "no real money",
    "no live provider",
  ]);

  assertNotIncludes("Admin wheel UI must not call member spin", adminUi, [
    "/member/wheel/spin",
    "/api/member/wheel/spin",
  ]);
}

function assertSharedBackendSource() {
  const service = readRequired("src/services/wheel.service.js");
  const controller = readRequired("src/controllers/wheel.controller.js");

  assertIncludes("Wheel shared backend source", service, [
    'const DEFAULT_CAMPAIGN_ID = "wheel_main";',
    "async function activeCampaign(siteId, campaignId = DEFAULT_CAMPAIGN_ID, tx = prisma) {",
    "const campaign = await activeCampaign(siteId, campaignId);",
    "const campaign = await activeCampaign(siteId, campaignId, tx);",
    "async function adminConfig(siteId) {",
    "where: { id: DEFAULT_CAMPAIGN_ID, siteId }",
  ]);

  assertIncludes("Wheel controller source usage", controller, [
    "await wheelService.getMemberConfig({",
    "await wheelService.spin({",
    "await wheelService.adminConfig(req.siteId)",
  ]);
}

function assertMemberSpinContract() {
  const memberApi = readRequired("apps/lucky-wheel-game/src/game/services/wheelApi.ts");
  const memberUi = readRequired("apps/lucky-wheel-game/src/ui/mountGameUi.ts");
  const adminUi = readRequired("src/admin-wheel-ui/app.js");

  assert(/\bbody:\s*\{\s*campaignId\s*\}/s.test(memberApi), "Member wheel spin payload must remain { campaignId } only.");

  const spinCallMatch = memberApi.match(/apiRequest<ApiSpinResponse>\('\/member\/wheel\/spin',\s*\{[\s\S]*?\n\s*\}\);/);
  assert(spinCallMatch, "Member wheel spin request block must exist.");
  assertNotIncludes("Member wheel spin request block", spinCallMatch[0], [
    "rewardId",
    "prizeIndex",
    "rewardValue",
    "probabilityWeight",
    "walletCreditAmount",
  ]);

  const adminWriteBlocks = Array.from(adminUi.matchAll(/await api\((?:`[^`]+`|"\/admin\/wheel\/[^"]+"),\s*\{[\s\S]*?\n\s*\}\);/g)).map((match) => match[0]);
  assert(adminWriteBlocks.length > 0, "Admin wheel write request blocks must exist.");
  for (const block of adminWriteBlocks) {
    assertNotIncludes("Admin UI write payload block", block, [
      "rewardId:",
      "prizeIndex:",
      "walletCreditAmount",
    ]);
  }

  assertNotIncludes("Member UI frontend-selected reward markers", memberUi, [
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

function assertPackageAndDocs() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:admin-wheel-campaign-edit"],
    "node src/local-smoke-tests/adminWheelCampaignEditSmoke.js",
    "package.json missing smoke:admin-wheel-campaign-edit script."
  );

  const coverage = readRequired(COVERAGE);
  assertIncludes("Smoke coverage entry", coverage, [
    "adminWheelCampaignEditSmoke.js",
    "smoke:admin-wheel-campaign-edit",
    "Admin Lucky Wheel campaign edit contract smoke",
  ]);
  assertIncludes("Smoke coverage section", coverage, [
    "## 17B. smoke:admin-wheel-campaign-edit Coverage",
    "Confirms Admin Lucky Wheel UI saves campaign edits through `PATCH /api/admin/wheel/campaign`.",
    "Confirms Admin Lucky Wheel UI does not call `/member/wheel/spin` or `/api/member/wheel/spin`.",
  ]);
}

function main() {
  assertAdminRoutes();
  console.log("Admin wheel existing config/update routes: PASS");

  assertAdminUiLoadSaveFlow();
  console.log("Admin wheel UI load/save markers: PASS");

  assertSharedBackendSource();
  console.log("Admin/member wheel shared backend source: PASS");

  assertMemberSpinContract();
  console.log("Member wheel spin payload contract preserved: PASS");

  assertNoTokenLeak();
  console.log("Admin/member frontend no token render/log markers: PASS");

  assertPackageAndDocs();
  console.log("Admin wheel campaign edit package/docs wiring: PASS");

  console.log("Admin wheel campaign edit smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Admin wheel campaign edit smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
