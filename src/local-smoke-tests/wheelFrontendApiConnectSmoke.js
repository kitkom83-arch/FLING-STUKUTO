const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/WHEEL_GAME_V1_FRONTEND_API_CONNECT.md";
const COVERAGE = "docs/SMOKE_COVERAGE.md";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertNoSecretShapedValues(label, text) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const databaseUrlAssignment = new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=`, "i");
  const authSchemeLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const apiKeyShape = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!databaseUrlAssignment.test(scanned), `${label} contains database URL assignment text.`);
  assert(!authSchemeLiteral.test(scanned), `${label} contains auth scheme marker.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!jwtLike.test(scanned), `${label} contains dotted credential-shaped text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long token-like text.`);
}

function assertRunbook() {
  const text = readRequired(DOC);
  assertIncludes("Wheel frontend API connect doc", text, [
    "VITE_WHEEL_API_MODE=api",
    "VITE_WHEEL_API_BASE_URL=http://127.0.0.1:4000/api",
    "VITE_WHEEL_DEMO_MEMBER_ENABLED=true",
    "VITE_WHEEL_DEMO_MEMBER_ID=demo_member",
    "GET /api/member/wheel/config",
    "POST /api/member/wheel/spin",
    "GET /api/member/wheel/history",
    "GET /api/member/wheel/my-rewards",
    "/member/wheel/config",
    "/member/wheel/spin",
    "/member/wheel/history?limit=20",
    "/member/wheel/my-rewards?limit=20",
    "success/data",
    "campaignId",
    "remainingSpinsToday",
    "remainingSpins",
    "memberBalance",
    "balanceAfter",
    "rewards",
    "prizeIndex",
    "rewardId",
    "reward.label/type/amount/displayValue",
    "history",
    "my-rewards",
    "member_reward_wallet_entries",
    "npm run smoke:wheel",
  ]);

  assertNormalizedIncludes("Wheel frontend API connect safety", text, [
    "Frontend spin requests must send only",
    "Frontend requests must not submit",
    "The backend is the source of truth",
    "Verify The Frontend Does Not Randomize",
    "no production DB",
    "no real money",
    "no live API",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no migration",
    "no Prisma schema change",
    "no lucky-wheel-game.zip committed",
    "no node_modules committed",
    "no dist committed",
  ]);

  assertNoSecretShapedValues(DOC, text);
}

function assertPackageScript() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:wheel-frontend-api-connect"],
    "node src/local-smoke-tests/wheelFrontendApiConnectSmoke.js",
    "package.json missing wheel frontend API connect smoke script."
  );
}

function assertCoverageDoc() {
  const text = readRequired(COVERAGE);
  assertIncludes("Smoke coverage", text, [
    "smoke:wheel-frontend-api-connect",
    "docs/WHEEL_GAME_V1_FRONTEND_API_CONNECT.md",
    "VITE_WHEEL_API_BASE_URL=http://127.0.0.1:4000/api",
  ]);
  assertNormalizedIncludes("Smoke coverage safety", text, [
    "does not use network",
    "does not use DB",
    "does not call live API",
  ]);
}

function main() {
  assertRunbook();
  console.log("Wheel frontend API connect runbook contract markers: PASS");

  assertPackageScript();
  console.log("Wheel frontend API connect package script: PASS");

  assertCoverageDoc();
  console.log("Wheel frontend API connect smoke coverage entry: PASS");

  console.log("Wheel frontend API connect smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Wheel frontend API connect smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
