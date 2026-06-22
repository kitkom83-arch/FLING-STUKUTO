"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11jNextPhaseDiscoveryGate");
const fixtures = require("../game-provider-mock/oro11jNextPhaseDiscoveryGateFixtures");

const {
  HOLD,
  NEXT_PHASE_KEY,
  ORO11J_PHASE,
  ORO11J_RESULT_KEY,
  ORO11J_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  buildOro11jSafetySummary,
  evaluateOro11jNextPhaseDiscoveryGate,
  normalizeOro11jNextPhaseDiscoveryGateInput,
  validateOro11jNextPhaseDiscoveryGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11jNextPhaseDiscoveryGate.js";
const FIXTURES = "src/game-provider-mock/oro11jNextPhaseDiscoveryGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11jNextPhaseDiscoveryGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11jSmoke.js";
const SCRIPT = "smoke:oro-11j";
const DETAIL_SCRIPT = "smoke:oro-11j:detailed";
const PASS_MESSAGE = "ORO-11J next phase discovery gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11J next phase discovery gate smoke: FAIL";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function assertProtectedRuntimeFilesUntouched() {
  const protectedPaths = [
    "src/app.js",
    "src/routes",
    "src/controllers",
    "src/services",
    "prisma",
    ".env",
    ".env.staging.example",
    "package-lock.json",
  ];
  assert.deepStrictEqual(gitOutput(["diff", "--name-only", "--", ...protectedPaths]), []);
  assert.deepStrictEqual(gitOutput(["ls-files", "--others", "--exclude-standard", "--", ...protectedPaths]), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken", "="].join(""),
    ["pass", "word", "="].join(""),
    ["client", "S", "ecret", "="].join(""),
    ["DATABASE", "_", "URL", "="].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const guardedSchemes = [["Be", "arer"].join(""), ["Ba", "sic"].join("")];
  for (const marker of guardedSchemes) assert(!scanned.includes(marker), `${label} includes guarded scheme marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact guarded shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded guarded URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const requiredDocMarkers = [
    "ORO-11J Next Phase Discovery Gate",
    "ORO-11I closed.",
    "ORO-11J did not exist before this discovery gate.",
    "post-ORO-11I next phase was unnamed and required a separate gate.",
    "ORO-11J is discovery gate only.",
    "no_runtime_implementation",
    "no_route_mount",
    "no_public_alias",
    "no_api_balance",
    "no_api_transaction",
    "no_live_oroplay_api_call",
    "no_external_network",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_migration",
    "no_deploy",
    "no_production_db",
    "no_real_money",
    "no_secret_token_password_clientSecret",
    ORO11J_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ];

  for (const file of [
    "docs/PHASE_ROADMAP.md",
    "docs/OROPLAY_INTEGRATION_PLAN.md",
    "docs/API_MAPPING.md",
    "docs/SMOKE_COVERAGE.md",
  ]) {
    const text = readRequired(file);
    for (const marker of requiredDocMarkers) assert(text.includes(marker), `${file} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11j"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }
}

function assertStaticSafety() {
  const unsafeRuntimePatterns = [
    ["Prisma", "Client"].join(""),
    ["prisma", "."].join(""),
    [".", "create", "("].join(""),
    [".", "update", "("].join(""),
    [".", "delete", "("].join(""),
    ["$", "transaction"].join(""),
    ["h", "ttp", ".", "request"].join(""),
    ["h", "ttps", ".", "request"].join(""),
    ["fet", "ch("].join(""),
    ["net", ".", "connect"].join(""),
  ];
  const text = [BOUNDARY, FIXTURES, SMOKE, WRAPPER].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11J files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "scope",
    "result",
    ORO11J_RESULT_KEY,
    "fixtureId",
    "previousPhases",
    "discoveryEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11J_PHASE);
  assert.strictEqual(summary.scope, ORO11J_SCOPE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11J_RESULT_KEY], PASS);
  assert.deepStrictEqual(summary.previousPhases, REQUIRED_PREVIOUS_PHASES);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11J pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11J_PHASE);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11J_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11J hold output", JSON.stringify(summary));
}

function runOro11jDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11jNextPhaseDiscoveryGateInput, "function");
  assert.strictEqual(typeof validateOro11jNextPhaseDiscoveryGate, "function");
  assert.strictEqual(typeof buildOro11jSafetySummary, "function");

  assertHappyPath(evaluateOro11jNextPhaseDiscoveryGate(fixtures.validOro11jNextPhaseDiscoveryGateFixture));
  assertHappyPath(validateOro11jNextPhaseDiscoveryGate(fixtures.validOro11jNextPhaseDiscoveryGateFixture));

  const safety = buildOro11jSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);
  assert.strictEqual(safety[NEXT_PHASE_KEY], true, `${NEXT_PHASE_KEY} safety marker missing.`);

  const heldCases = [
    [fixtures.oro11iNotClosedFixture, "oro11i_not_closed"],
    [fixtures.oro11jPreexistedFixture, "oro11j_preexisted_before_gate"],
    [fixtures.namedNextPhaseBeforeOro11jFixture, "post_oro11i_next_phase_not_unnamed_separate_gate"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11j"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveOroPlayApiCall_not_allowed_in_oro11j"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11j"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11jNextPhaseDiscoveryGate(fixture), blocker);
    assertHeld(validateOro11jNextPhaseDiscoveryGate(fixture), blocker);
  }

  const normalized = normalizeOro11jNextPhaseDiscoveryGateInput(
    fixtures.validOro11jNextPhaseDiscoveryGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11J_PHASE);
  assert.strictEqual(normalized.scope, ORO11J_SCOPE);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11jDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11jDetailedSmoke,
};
