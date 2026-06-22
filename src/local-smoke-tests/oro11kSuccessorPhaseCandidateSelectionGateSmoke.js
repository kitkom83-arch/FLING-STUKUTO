"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11kSuccessorPhaseCandidateSelectionGate");
const fixtures = require("../game-provider-mock/oro11kSuccessorPhaseCandidateSelectionGateFixtures");

const {
  HOLD,
  NEXT_PHASE_KEY,
  ORO11K_PHASE,
  ORO11K_RESULT_KEY,
  ORO11K_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  CANDIDATE_NEXT_PHASE_NAME,
  CANDIDATE_NEXT_PHASE_SCOPE,
  buildOro11kSafetySummary,
  evaluateOro11kSuccessorPhaseCandidateSelectionGate,
  normalizeOro11kSuccessorPhaseCandidateSelectionGateInput,
  validateOro11kSuccessorPhaseCandidateSelectionGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11kSuccessorPhaseCandidateSelectionGate.js";
const FIXTURES = "src/game-provider-mock/oro11kSuccessorPhaseCandidateSelectionGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11kSuccessorPhaseCandidateSelectionGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11kSmoke.js";
const SCRIPT = "smoke:oro-11k";
const DETAIL_SCRIPT = "smoke:oro-11k:detailed";
const PASS_MESSAGE = "ORO-11K successor phase candidate selection gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11K successor phase candidate selection gate smoke: FAIL";

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
    "ORO-11K Successor Phase Candidate Selection Gate",
    "ORO-11I closed.",
    "ORO-11J closed.",
    "ORO-11J completed its discovery gate role.",
    "ORO-11K is successor candidate selection gate only.",
    "candidate next phase remains locked after separate gate.",
    CANDIDATE_NEXT_PHASE_NAME,
    CANDIDATE_NEXT_PHASE_SCOPE,
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
    ORO11K_SCOPE,
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
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11k"]) {
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11K files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "scope",
    "result",
    ORO11K_RESULT_KEY,
    "fixtureId",
    "previousPhases",
    "candidateEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11K_PHASE);
  assert.strictEqual(summary.scope, ORO11K_SCOPE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11K_RESULT_KEY], PASS);
  assert.deepStrictEqual(summary.previousPhases, REQUIRED_PREVIOUS_PHASES);
  assert.strictEqual(summary.candidateEvidence.candidateNextPhaseName, CANDIDATE_NEXT_PHASE_NAME);
  assert.strictEqual(summary.candidateEvidence.candidateNextPhaseScope, CANDIDATE_NEXT_PHASE_SCOPE);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11K pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11K_PHASE);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11K_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11K hold output", JSON.stringify(summary));
}

function runOro11kDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11kSuccessorPhaseCandidateSelectionGateInput, "function");
  assert.strictEqual(typeof validateOro11kSuccessorPhaseCandidateSelectionGate, "function");
  assert.strictEqual(typeof buildOro11kSafetySummary, "function");

  assertHappyPath(evaluateOro11kSuccessorPhaseCandidateSelectionGate(fixtures.validOro11kSuccessorPhaseCandidateSelectionGateFixture));
  assertHappyPath(validateOro11kSuccessorPhaseCandidateSelectionGate(fixtures.validOro11kSuccessorPhaseCandidateSelectionGateFixture));

  const safety = buildOro11kSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);
  assert.strictEqual(safety[NEXT_PHASE_KEY], true, `${NEXT_PHASE_KEY} safety marker missing.`);

  const heldCases = [
    [fixtures.oro11iNotClosedFixture, "oro11i_not_closed"],
    [fixtures.oro11jNotClosedFixture, "oro11j_not_closed"],
    [fixtures.oro11jDiscoveryNotCompletedFixture, "oro11j_discovery_gate_not_completed"],
    [fixtures.candidatePhaseNotLockedFixture, "candidate_phase_not_locked_after_separate_gate"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11k"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveOroPlayApiCall_not_allowed_in_oro11k"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11k"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11kSuccessorPhaseCandidateSelectionGate(fixture), blocker);
    assertHeld(validateOro11kSuccessorPhaseCandidateSelectionGate(fixture), blocker);
  }

  const normalized = normalizeOro11kSuccessorPhaseCandidateSelectionGateInput(
    fixtures.validOro11kSuccessorPhaseCandidateSelectionGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11K_PHASE);
  assert.strictEqual(normalized.scope, ORO11K_SCOPE);
  assert.strictEqual(normalized.candidateNextPhaseName, CANDIDATE_NEXT_PHASE_NAME);
  assert.strictEqual(normalized.candidateNextPhaseScope, CANDIDATE_NEXT_PHASE_SCOPE);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11kDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11kDetailedSmoke,
};
