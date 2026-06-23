"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate");
const fixtures = require("../game-provider-mock/oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixtures");

const {
  HOLD,
  ORO11Q_DECISION_STATUS,
  ORO11Q_GATE_PURPOSE,
  ORO11Q_PHASE,
  ORO11Q_PREVIOUS_PHASE,
  ORO11Q_RESULT_KEY,
  ORO11Q_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  buildOro11qSafetySummary,
  evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate,
  normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput,
  validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate.js";
const FIXTURES = "src/game-provider-mock/oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11qSmoke.js";
const SCRIPT = "smoke:oro-11q";
const DETAIL_SCRIPT = "smoke:oro-11q:detailed";
const PASS_MESSAGE = "ORO-11Q separate successor phase implementation readiness decision gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11Q separate successor phase implementation readiness decision gate smoke: FAIL";

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
    ["api", "Key", "="].join(""),
    ["private", "Key", "="].join(""),
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
    "ORO-11Q Separate Successor Phase Implementation Readiness Decision Gate",
    "ORO-11O closed implementation readiness discovery already.",
    "ORO-11P closed implementation readiness review already.",
    `Previous phase from ORO-11Q: ${ORO11Q_PREVIOUS_PHASE}.`,
    "ORO-11Q Separate Successor Phase Implementation Readiness Decision Gate is implementation readiness decision only.",
    "ORO-11Q is decision recording before implementation and is not implementation itself.",
    ORO11Q_GATE_PURPOSE,
    ORO11Q_SCOPE,
    ORO11Q_DECISION_STATUS,
    "ORO-11Q is not runtime implementation.",
    "ORO-11Q is not live execution.",
    "ORO-11Q does not approve route mount.",
    "ORO-11Q does not approve public alias.",
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
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11q"]) {
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11Q files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "previousPhase",
    "scope",
    "gatePurpose",
    "decisionStatus",
    "result",
    ORO11Q_RESULT_KEY,
    "fixtureId",
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
  assert.strictEqual(summary.phase, ORO11Q_PHASE);
  assert.strictEqual(summary.previousPhase, ORO11Q_PREVIOUS_PHASE);
  assert.strictEqual(summary.scope, ORO11Q_SCOPE);
  assert.strictEqual(summary.gatePurpose, ORO11Q_GATE_PURPOSE);
  assert.strictEqual(summary.decisionStatus, ORO11Q_DECISION_STATUS);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11Q_RESULT_KEY], PASS);
  assert.strictEqual(summary.decisionEvidence.oro11oDisposition, "implementation_readiness_discovery_completed");
  assert.strictEqual(summary.decisionEvidence.oro11pDisposition, "implementation_readiness_review_completed");
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11Q pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11Q_PHASE);
  assert.strictEqual(summary.previousPhase, HOLD);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.gatePurpose, HOLD);
  assert.strictEqual(summary.decisionStatus, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11Q_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11Q hold output", JSON.stringify(summary));
}

function runOro11qDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput, "function");
  assert.strictEqual(typeof validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate, "function");
  assert.strictEqual(typeof buildOro11qSafetySummary, "function");

  assertHappyPath(
    evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(
      fixtures.validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture
    )
  );
  assertHappyPath(
    validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(
      fixtures.validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture
    )
  );

  const safety = buildOro11qSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.oro11pNotClosedFixture, "oro11p_not_closed"],
    [fixtures.oro11pDispositionMismatchFixture, "oro11p_readiness_review_not_completed"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11q"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveExecution_not_allowed_in_oro11q"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11q"],
    [fixtures.credentialMaterialDetectedFixture, "credentialMaterial_not_allowed_in_oro11q"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(fixture), blocker);
    assertHeld(validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(fixture), blocker);
  }

  const normalized = normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput(
    fixtures.validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11Q_PHASE);
  assert.strictEqual(normalized.previousPhase, ORO11Q_PREVIOUS_PHASE);
  assert.strictEqual(normalized.scope, ORO11Q_SCOPE);
  assert.strictEqual(normalized.gatePurpose, ORO11Q_GATE_PURPOSE);
  assert.strictEqual(normalized.decisionStatus, ORO11Q_DECISION_STATUS);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11qDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11qDetailedSmoke,
};