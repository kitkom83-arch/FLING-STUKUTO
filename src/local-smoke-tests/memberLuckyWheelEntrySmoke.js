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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertStaticRouteWiring() {
  const appSource = readRequired("src/app.js");
  assertIncludes("Express Lucky Wheel route wiring", appSource, [
    "memberLuckyWheelUiDir",
    '/member/lucky-wheel',
    'apps", "lucky-wheel-game", "dist',
    "Lucky Wheel build is unavailable. Run npm run build --prefix apps/lucky-wheel-game.",
  ]);
}

function assertMemberEntryUi() {
  const html = readRequired("src/money-demo-ui/member.html");
  const appJs = readRequired("src/money-demo-ui/app.js");
  const styles = readRequired("src/money-demo-ui/styles.css");

  assertIncludes("Member entry HTML", html, [
    "open-member-lucky-wheel",
    "เล่นกงล้อ",
    "/member/lucky-wheel/",
    "Lucky Wheel V1",
  ]);
  assertIncludes("Member entry app", appJs, [
    'const WHEEL_MEMBER_ROUTE = "/member/lucky-wheel/";',
    'const WHEEL_AUTH_STORAGE_KEY = "pg77_member_token";',
    "function syncLuckyWheelMemberToken(token)",
    "window.location.assign(WHEEL_MEMBER_ROUTE);",
  ]);
  assertIncludes("Member entry styles", styles, [
    ".game-entry-grid",
    ".game-entry-tile",
    ".game-entry-link.secondary-link",
  ]);
}

function assertWheelFrontendBuildBase() {
  const viteConfig = readRequired("apps/lucky-wheel-game/vite.config.ts");
  const ui = readRequired("apps/lucky-wheel-game/src/ui/mountGameUi.ts");

  assertIncludes("Lucky Wheel Vite config", viteConfig, [
    "base: command === 'build' ? '/member/lucky-wheel/' : '/'",
  ]);
  assertIncludes("Lucky Wheel member return link", ui, [
    'href="/member-money-demo/"',
    "Return and tap Refresh Data after a spin to refresh the wallet view.",
  ]);
}

function assertRunbook() {
  const text = readRequired(RUNBOOK);
  assertIncludes("Member entry runbook", text, [
    "WHEEL-GAME-V1-MEMBER-ENTRY-14",
    "/member-money-demo/",
    "/member/lucky-wheel/",
    "npm run build --prefix apps/lucky-wheel-game",
    "npm run build:member-lucky-wheel",
    "real member token handoff",
    "pg77-money-demo:member:member-session",
    "pg77_member_token",
    "X-Site-Code: PG77",
    "{ campaignId }",
  ]);
  assertNormalizedIncludes("Member entry runbook safety", text, [
    "no PG77-member-demo.zip copied",
    "no backend wheel API contract change",
    "no production DB",
    "no live API/provider/payment/bank/SMS/Slip OCR",
    "no migration or Prisma schema change",
    "no node_modules, dist, or .env.local committed",
    "no deploy",
  ]);
}

function assertPackageAndCoverage() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["build:member-lucky-wheel"],
    "npm run build --prefix apps/lucky-wheel-game",
    "package.json missing build:member-lucky-wheel script."
  );
  assert.strictEqual(
    pkg.scripts["smoke:member-wheel-entry"],
    "node src/local-smoke-tests/memberLuckyWheelEntrySmoke.js",
    "package.json missing smoke:member-wheel-entry script."
  );

  const coverage = readRequired(COVERAGE);
  assertIncludes("Smoke coverage", coverage, [
    "smoke:member-wheel-entry",
    "docs/WHEEL_GAME_V1_MEMBER_ENTRY_RUNBOOK.md",
    "/member/lucky-wheel/",
    "real member token handoff",
  ]);
}

function main() {
  assertStaticRouteWiring();
  console.log("Member Lucky Wheel route wiring: PASS");

  assertMemberEntryUi();
  console.log("Member Lucky Wheel entry UI contract: PASS");

  assertWheelFrontendBuildBase();
  console.log("Lucky Wheel build base and return path contract: PASS");

  assertRunbook();
  console.log("Member Lucky Wheel runbook contract: PASS");

  assertPackageAndCoverage();
  console.log("Member Lucky Wheel package and smoke coverage contract: PASS");

  console.log("Member Lucky Wheel entry smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Member Lucky Wheel entry smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
