"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11mSeparateSuccessorPhaseAuthorizationDecisionGate");
const fixtures = require("../game-provider-mock/oro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixtures");

const {
  HOLD,
  ORO11M_PHASE,
  ORO11M_SCOPE,
  ORO11M_RESULT_KEY,
  ORO11M_DECISION_STATUS,
  PASS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_PREVIOUS_CANDIDATE_NAME,
  buildOro11mSafetySummary,
  evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate,
  normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput,
  validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11mSeparateSuccessorPhaseAuthorizationDecisionGate.js";
const FIXTURES = "src/game-provider-mock/oro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11mSeparateSuccessorPhaseAuthorizationDecisionGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11mSmoke.js";
const SCRIPT = "smoke:oro-11m";
const DETAIL_SCRIPT = "smoke:oro-11m:detailed";
const PASS_MESSAGE = "ORO-11M separate successor phase authorization decision gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11M separate successor phase authorization decision gate smoke: FAIL";

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
    "ORO-11M Separate Successor Phase Authorization Decision Gate",
    "ORO-11I closed.",
    "ORO-11J closed.",
    "ORO-11K closed.",
    "ORO-11L closed.",
    "ORO-11L was authorization request gate only.",
    REQUIRED_PREVIOUS_CANDIDATE_NAME,
    "ORO-11M is authorization decision gate only.",
    ORO11M_SCOPE,
    ORO11M_DECISION_STATUS,
    "ORO-11M is not runtime implementation.",
    "ORO-11M is not live execution.",
    "ORO-11M does not approve external call execution.",
    "ORO-11M does not approve route mount.",
    "ORO-11M does not approve public alias.",
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
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11m"]) {
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11M files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "scope",
    "decisionStatus",
    "result",
    ORO11M_RESULT_KEY,
    "fixtureId",
    "previousPhases",
    "decisionEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11M_PHASE);
  assert.strictEqual(summary.scope, ORO11M_SCOPE);
  assert.strictEqual(summary.decisionStatus, ORO11M_DECISION_STATUS);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11M_RESULT_KEY], PASS);
  assert.deepStrictEqual(summary.previousPhases, REQUIRED_PREVIOUS_PHASES);
  assert.strictEqual(summary.decisionEvidence.oro11lCandidatePhaseName, REQUIRED_PREVIOUS_CANDIDATE_NAME);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11M pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11M_PHASE);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.decisionStatus, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11M_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11M hold output", JSON.stringify(summary));
}

function runOro11mDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput, "function");
  assert.strictEqual(typeof validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate, "function");
  assert.strictEqual(typeof buildOro11mSafetySummary, "function");

  assertHappyPath(
    evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(
      fixtures.validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture
    )
  );
  assertHappyPath(
    validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(
      fixtures.validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture
    )
  );

  const safety = buildOro11mSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.oro11iNotClosedFixture, "oro11i_not_closed"],
    [fixtures.oro11jNotClosedFixture, "oro11j_not_closed"],
    [fixtures.oro11kNotClosedFixture, "oro11k_not_closed"],
    [fixtures.oro11lNotClosedFixture, "oro11l_not_closed"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11m"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveExecution_not_allowed_in_oro11m"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11m"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(fixture), blocker);
    assertHeld(validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(fixture), blocker);
  }

  const normalized = normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput(
    fixtures.validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11M_PHASE);
  assert.strictEqual(normalized.scope, ORO11M_SCOPE);
  assert.strictEqual(normalized.decisionStatus, ORO11M_DECISION_STATUS);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11mDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11mDetailedSmoke,
};
