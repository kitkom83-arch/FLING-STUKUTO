const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const RUNBOOK = "docs/WHEEL_GAME_V1_MEMBER_ENTRY_RUNBOOK.md";
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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertNormalizedIncludes(label, text, markers) {
  const scanned = normalize(text);
  for (const marker of markers) {
    assert(scanned.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertRunbook() {
  const text = readRequired(RUNBOOK);
  assertIncludes("Member entry runbook browser result", text, [
    "## Browser Manual Result",
    "WHEEL-GAME-V1-MEMBER-SPIN-E2E-15",
    "`Session Status` becomes `ready`",
    "`SPIN` returns a backend-selected reward result",
    "Back to Member Demo",
    "no new red error",
  ]);
  assertIncludes("Member entry runbook local startup", text, [
    "## How To Open Local Server Safely",
    "## Required Env For Local Server",
    "## PostgreSQL Local Note",
    "127.0.0.1:4000/member-money-demo/",
    "NODE_ENV=development-local",
    "APP_ENV=local-test",
    "local-only `JWT_SECRET`",
    "127.0.0.1:5432",
  ]);
  assertIncludes("Member entry runbook manual check", text, [
    "## Manual Check",
    "1. Open `/member-money-demo/`.",
    "2. Click `Clear Session`.",
    "3. Click `Re-Login`.",
    "4. Click `เล่นกงล้อ`.",
    "5. Press `SPIN`.",
    "6. Open `My Rewards` and confirm the reward list reflects the backend-selected result when the result is not `no_reward`.",
    "7. Open `History` and confirm the latest spin row matches the backend-selected result.",
    "8. Click `Back to Member Demo`.",
    "9. Confirm Console no red error.",
  ]);
  assertIncludes("Member entry runbook non-blockers", text, [
    "## Known Non-Blocker",
    "Phaser console banner",
    "Chrome DevTools Thai notification",
    "Vite chunk size warning",
    "npm audit warning for local game dependency",
  ]);
}

function assertFrontendContract() {
  const wheelApi = readRequired("apps/lucky-wheel-game/src/game/services/wheelApi.ts");
  const scene = readRequired("apps/lucky-wheel-game/src/phaser/scenes/LuckyWheelScene.ts");
  const main = readRequired("apps/lucky-wheel-game/src/main.ts");
  const memberApp = readRequired("src/money-demo-ui/app.js");
  const memberHtml = readRequired("src/money-demo-ui/member.html");

  assertIncludes("Lucky Wheel API endpoints", wheelApi, [
    "apiRequest<ApiWheelConfig>('/member/wheel/config')",
    "apiRequest<ApiSpinResponse>('/member/wheel/spin', {",
    "apiRequest<ApiHistoryRecord[]>('/member/wheel/history?limit=20')",
    "apiRequest<ApiRewardRecord[]>('/member/wheel/my-rewards?limit=20')",
  ]);
  assert(/\bbody:\s*\{\s*campaignId\s*\}/s.test(wheelApi), "Lucky Wheel spin payload must remain { campaignId } only.");
  const spinCallMatch = wheelApi.match(/apiRequest<ApiSpinResponse>\('\/member\/wheel\/spin',\s*\{[\s\S]*?\n\s*\}\);/);
  assert(spinCallMatch, "Lucky Wheel spin request block must exist.");
  assertNotIncludes("Lucky Wheel spin request block", spinCallMatch[0], [
    "rewardId",
    "prizeIndex",
    "rewardValue",
    "probabilityWeight",
  ]);

  assertIncludes("Lucky Wheel token handoff markers", wheelApi, [
    "const AUTH_TOKEN_STORAGE_KEY = import.meta.env.VITE_WHEEL_AUTH_TOKEN_STORAGE_KEY || 'pg77_member_token';",
    "throw new WheelApiError('Member session unavailable. Please sign in again.');",
    "return { Authorization: `Bearer ${token}` };",
  ]);
  assertIncludes("Member entry token bridge markers", memberApp, [
    'const WHEEL_AUTH_STORAGE_KEY = "pg77_member_token";',
    "function syncLuckyWheelMemberToken(token)",
    "window.location.assign(WHEEL_MEMBER_ROUTE);",
  ]);
  assertIncludes("Member entry CTA markers", memberHtml, [
    'id="open-member-lucky-wheel"',
    "เล่นกงล้อ",
  ]);

  assertIncludes("Backend source of truth markers", scene, [
    "const result = await spinWheel(this.currentState.campaignId);",
    "await this.spinToPrize(result.prizeIndex);",
    "const [config, history, rewards] = await Promise.all([getWheelConfig(), getWheelHistory(), getMyRewards()]);",
  ]);
  assertIncludes("Main Lucky Wheel hydration markers", main, [
    "const [history, rewards] = await Promise.all([getWheelHistory(), getMyRewards()]);",
    "luckyWheelStore.replaceHistory(history);",
    "luckyWheelStore.replaceRewards(rewards);",
  ]);
}

function assertNoTokenLeakMarkers() {
  const wheelApi = readRequired("apps/lucky-wheel-game/src/game/services/wheelApi.ts");
  const memberApp = readRequired("src/money-demo-ui/app.js");
  const memberHtml = readRequired("src/money-demo-ui/member.html");
  const combined = [wheelApi, memberApp, memberHtml].join("\n");

  assert(!/console\.(log|debug|info|warn|error)\s*\([^)]*token/i.test(combined), "Frontend files must not log token values.");
  assert(!/innerHTML\s*=\s*[^;\n]*token/i.test(combined), "Frontend files must not render token values with innerHTML.");
  assert(!/textContent\s*=\s*[^;\n]*token/i.test(combined), "Frontend files must not render token values with textContent.");
  assert(!/Authorization[^`'\n]*Bearer \${config\.token}/.test(memberHtml), "Member HTML must not expose authorization header text.");
}

function assertNoSilentDemoFallback() {
  const runbook = readRequired(RUNBOOK);
  const wheelApi = readRequired("apps/lucky-wheel-game/src/game/services/wheelApi.ts");

  assertNormalizedIncludes("Runbook fail-closed auth wording", runbook, [
    "must not silently fall back to demo member mode",
  ]);
  assertIncludes("Wheel API fail-closed auth wording", wheelApi, [
    "Member session unavailable. Please sign in again.",
  ]);
}

function assertPackageAndCoverage() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:member-wheel-spin-e2e"],
    "node src/local-smoke-tests/memberLuckyWheelSpinE2eSmoke.js",
    "package.json missing smoke:member-wheel-spin-e2e script."
  );

  const coverage = readRequired(COVERAGE);
  assertIncludes("Smoke coverage table", coverage, [
    "memberLuckyWheelSpinE2eSmoke.js",
    "smoke:member-wheel-spin-e2e",
    "spin payload `{ campaignId }` only",
    "no silent demo fallback for `/member/lucky-wheel/`",
  ]);
  assertIncludes("Smoke coverage section", coverage, [
    "## 18C. smoke:member-wheel-spin-e2e Coverage",
    "`npm run smoke:member-wheel-spin-e2e` is a docs/source contract smoke:",
  ]);
}

function main() {
  assertRunbook();
  console.log("Member Lucky Wheel spin E2E runbook coverage: PASS");

  assertFrontendContract();
  console.log("Member Lucky Wheel spin E2E frontend contract: PASS");

  assertNoTokenLeakMarkers();
  console.log("Member Lucky Wheel spin E2E no token leak markers: PASS");

  assertNoSilentDemoFallback();
  console.log("Member Lucky Wheel spin E2E fail-closed auth markers: PASS");

  assertPackageAndCoverage();
  console.log("Member Lucky Wheel spin E2E package and coverage wiring: PASS");

  console.log("Member Lucky Wheel spin E2E smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Member Lucky Wheel spin E2E smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
