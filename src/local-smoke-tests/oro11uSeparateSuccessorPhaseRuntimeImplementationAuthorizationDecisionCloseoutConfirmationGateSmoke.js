"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate");
const fixtures = require("../game-provider-mock/oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixtures");

const {
  HOLD,
  ORO11U_CLOSEOUT_STATUS,
  ORO11U_GATE_PURPOSE,
  ORO11U_PHASE,
  ORO11U_PREVIOUS_PHASE,
  ORO11U_RESULT_KEY,
  ORO11U_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  buildOro11uSafetySummary,
  evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate,
  normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput,
  validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const BOUNDARY = "src/game-provider-mock/oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate.js";
const FIXTURES = "src/game-provider-mock/oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11uSmoke.js";
const SCRIPT = "smoke:oro-11u";
const DETAIL_SCRIPT = "smoke:oro-11u:detailed";
const PASS_MESSAGE = "ORO-11U separate successor phase runtime implementation authorization decision closeout confirmation gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11U separate successor phase runtime implementation authorization decision closeout confirmation gate smoke: FAIL";

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
    "ORO-11U Separate Successor Phase Runtime Implementation Authorization Decision Closeout Confirmation Gate",
    "ORO-11S closed runtime implementation authorization request already.",
    "ORO-11T closed runtime implementation authorization decision already.",
    `Previous phase from ORO-11U: ${ORO11U_PREVIOUS_PHASE}.`,
    "ORO-11U is runtime implementation authorization decision closeout confirmation only.",
    "ORO-11U confirms the runtime implementation authorization decision closeout before runtime implementation and does not implement runtime.",
    "ORO-11U does not approve runtime implementation.",
    "ORO-11U does not activate live execution.",
    ORO11U_GATE_PURPOSE,
    ORO11U_SCOPE,
    ORO11U_CLOSEOUT_STATUS,
    "ORO-11U is not runtime implementation.",
    "ORO-11U is not live execution.",
    "ORO-11U does not approve route mount.",
    "ORO-11U does not approve public alias.",
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
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro11u"]) {
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11U files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "previousPhase",
    "scope",
    "gatePurpose",
    "closeoutStatus",
    "result",
    ORO11U_RESULT_KEY,
    "fixtureId",
    "closeoutEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11U_PHASE);
  assert.strictEqual(summary.previousPhase, ORO11U_PREVIOUS_PHASE);
  assert.strictEqual(summary.scope, ORO11U_SCOPE);
  assert.strictEqual(summary.gatePurpose, ORO11U_GATE_PURPOSE);
  assert.strictEqual(summary.closeoutStatus, ORO11U_CLOSEOUT_STATUS);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11U_RESULT_KEY], PASS);
  assert.strictEqual(summary.closeoutEvidence.oro11sDisposition, "runtime_implementation_authorization_requested");
  assert.strictEqual(summary.closeoutEvidence.oro11tDisposition, "runtime_implementation_authorization_decision_recorded");
  assert.strictEqual(summary.closeoutEvidence.closeoutDisposition, "static_mock_runtime_implementation_authorization_decision_closeout_confirmation_only");
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11U pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11U_PHASE);
  assert.strictEqual(summary.previousPhase, HOLD);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.gatePurpose, HOLD);
  assert.strictEqual(summary.closeoutStatus, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11U_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11U hold output", JSON.stringify(summary));
}

function runOro11uDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput, "function");
  assert.strictEqual(typeof validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate, "function");
  assert.strictEqual(typeof buildOro11uSafetySummary, "function");

  assertHappyPath(
    evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(
      fixtures.validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture
    )
  );
  assertHappyPath(
    validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(
      fixtures.validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture
    )
  );

  const safety = buildOro11uSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.oro11tNotClosedFixture, "oro11t_not_closed"],
    [fixtures.oro11tDispositionMismatchFixture, "oro11t_authorization_decision_not_recorded"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeImplementation_not_allowed_in_oro11u"],
    [fixtures.liveExternalAccidentallyEnabledFixture, "liveExecution_not_allowed_in_oro11u"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11u"],
    [fixtures.credentialMaterialDetectedFixture, "credentialMaterial_not_allowed_in_oro11u"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(fixture), blocker);
    assertHeld(validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(fixture), blocker);
  }

  const normalized = normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput(
    fixtures.validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11U_PHASE);
  assert.strictEqual(normalized.previousPhase, ORO11U_PREVIOUS_PHASE);
  assert.strictEqual(normalized.scope, ORO11U_SCOPE);
  assert.strictEqual(normalized.gatePurpose, ORO11U_GATE_PURPOSE);
  assert.strictEqual(normalized.closeoutStatus, ORO11U_CLOSEOUT_STATUS);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11uDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11uDetailedSmoke,
};