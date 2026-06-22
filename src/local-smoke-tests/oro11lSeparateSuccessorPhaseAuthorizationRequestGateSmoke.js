"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11lSeparateSuccessorPhaseAuthorizationRequestGate");
const fixtures = require("../game-provider-mock/oro11lSeparateSuccessorPhaseAuthorizationRequestGateFixtures");

const {
  HOLD,
  ORO11L_PHASE,
  ORO11L_SCOPE,
  ORO11L_RESULT_KEY,
  ORO11L_REQUEST_STATUS,
  PASS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_CANDIDATE_NAME,
  buildOro11lSafetySummary,
  evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate,
  normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput,
  validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11lSeparateSuccessorPhaseAuthorizationRequestGate.js";
const FIXTURES = "src/game-provider-mock/oro11lSeparateSuccessorPhaseAuthorizationRequestGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11lSeparateSuccessorPhaseAuthorizationRequestGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11lSmoke.js";
const SCRIPT = "smoke:oro-11l";
const DETAIL_SCRIPT = "smoke:oro-11l:detailed";
const PASS_MESSAGE = "ORO-11L separate successor phase authorization request gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11L separate successor phase authorization request gate smoke: FAIL";

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
    "ORO-11L Separate Successor Phase Authorization Request Gate",
    "ORO-11I closed.",
    "ORO-11J closed.",
    "ORO-11K closed.",
    "ORO-11K selected ORO-11L as the next candidate phase.",
    REQUIRED_CANDIDATE_NAME,
    "ORO-11L is authorization request gate only.",
    "ORO-11L is not approval granted.",
    "ORO-11L is not runtime implementation.",
    "ORO-11L is not live execution.",
    "ORO-11L does not approve external call.",
    "ORO-11L does not approve route mount.",
    "ORO-11L does not approve public alias.",
    ORO11L_SCOPE,
    ORO11L_REQUEST_STATUS,
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
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11l"]) {
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11L files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "scope",
    "requestStatus",
    "result",
    ORO11L_RESULT_KEY,
    "fixtureId",
    "previousPhases",
    "requestEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11L_PHASE);
  assert.strictEqual(summary.scope, ORO11L_SCOPE);
  assert.strictEqual(summary.requestStatus, ORO11L_REQUEST_STATUS);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11L_RESULT_KEY], PASS);
  assert.deepStrictEqual(summary.previousPhases, REQUIRED_PREVIOUS_PHASES);
  assert.strictEqual(summary.requestEvidence.oro11kCandidatePhaseName, REQUIRED_CANDIDATE_NAME);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11L pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11L_PHASE);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.requestStatus, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11L_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11L hold output", JSON.stringify(summary));
}

function runOro11lDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput, "function");
  assert.strictEqual(typeof validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate, "function");
  assert.strictEqual(typeof buildOro11lSafetySummary, "function");

  assertHappyPath(
    evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(
      fixtures.validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture
    )
  );
  assertHappyPath(
    validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(
      fixtures.validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture
    )
  );

  const safety = buildOro11lSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.oro11iNotClosedFixture, "oro11i_not_closed"],
    [fixtures.oro11jNotClosedFixture, "oro11j_not_closed"],
    [fixtures.oro11kNotClosedFixture, "oro11k_not_closed"],
    [fixtures.approvalGrantedFixture, "notApprovalGranted_required"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11l"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveExecution_not_allowed_in_oro11l"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11l"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(fixture), blocker);
    assertHeld(validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(fixture), blocker);
  }

  const normalized = normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput(
    fixtures.validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11L_PHASE);
  assert.strictEqual(normalized.scope, ORO11L_SCOPE);
  assert.strictEqual(normalized.requestStatus, ORO11L_REQUEST_STATUS);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11lDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11lDetailedSmoke,
};
