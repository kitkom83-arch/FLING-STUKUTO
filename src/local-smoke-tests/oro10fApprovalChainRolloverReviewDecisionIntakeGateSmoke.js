"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10fApprovalChainRolloverReviewDecisionIntakeGate");
const fixtures = require("../game-provider-mock/oro10fApprovalChainRolloverReviewDecisionIntakeGateFixtures");

const {
  DEPENDS_ON_ORO10E_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10E_PASSED_KEY,
  ORO10F_PHASE,
  ORO10F_RESULT_KEY,
  ORO10F_SCOPE,
  ORO10F_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10E_ONLY_KEY,
  buildOro10fReviewDecisionIntakeGateRecord,
  buildOro10fReviewDecisionIntakeGateRecordResult,
  buildOro10fSafetySummary,
  evaluateOro10fReviewDecisionIntakeGate,
  validateOro10fReviewDecisionIntakeGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10E = "docs/ORO_10E_APPROVAL_CHAIN_ROLLOVER_REVIEW_REQUEST_SUBMISSION_GATE.md";
const DOC_10F = "docs/ORO_10F_APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_INTAKE_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10fApprovalChainRolloverReviewDecisionIntakeGate.js";
const FIXTURES = "src/game-provider-mock/oro10fApprovalChainRolloverReviewDecisionIntakeGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10fApprovalChainRolloverReviewDecisionIntakeGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10fSmoke.js";
const SCRIPT = "smoke:oro-10f";
const DETAIL_SCRIPT = "smoke:oro-10f:detailed";
const PASS_MESSAGE = "ORO-10F approval chain rollover review decision intake gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10F approval chain rollover review decision intake gate smoke: FAIL";

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
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function assertProtectedRuntimeFilesUntouched() {
  const protectedPaths = [
    "src/app.js",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/ledger-mock",
    "prisma",
    ".env",
    ".env.staging.example",
    "package-lock.json",
  ];
  assert.deepStrictEqual(gitOutput(["diff", "--name-only", "--", ...protectedPaths]), []);
  assert.deepStrictEqual(gitOutput(["ls-files", "--others", "--exclude-standard", "--", ...protectedPaths]), []);
}

function assertNoLongOro10fFilenames() {
  const longPattern =
    /ORO_10F_.*(APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_INTAKE_GATE_FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW|DECISION_DECISION|INTAKE_INTAKE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  assert.deepStrictEqual([...tracked, ...untracked].filter((file) => longPattern.test(file)), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken", "="].join(""),
    ["Be", "arer"].join(""),
    ["Ba", "sic"].join(""),
    ["pass", "word", "="].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["device", "Id"].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const uppercasePinMarker = ["P", "I", "N"].join("");
  assert(!new RegExp(`\\b${uppercasePinMarker}\\s*[:=]`).test(scanned), `${label} includes guarded uppercase pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10F, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10f = readRequired(DOC_10F);
  for (const marker of [
    "# ORO-10F Approval Chain Rollover Review Decision Intake Gate",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D closed.",
    "ORO-10E closed.",
    "ORO-10F current.",
    "review decision intake gate only",
    "review decision intake is a static/mock record only",
    "ORO-10F is not signed approval.",
    "ORO-10F is not runtime approval.",
    "ORO-10F is not a decision that authorizes route/runtime.",
    "predecessor ORO-10E present = true",
    "ORO-10C evidence gate present = true",
    "ORO-10D review request boundary present = true",
    "ORO-10E review request submission gate present = true",
    "review decision intake static/mock only = true",
    "runtime review decision not issued = true",
    "runtime authorization not issued = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_runtime_review_decision",
    "no_runtime_authorization",
    "static_mock_review_decision_intake_only",
    "no_signed_runtime_approval",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_route_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    ORO10F_SCOPE,
    ORO10F_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10f.includes(marker), `${DOC_10F} missing marker ${marker}.`);
  }

  const doc10e = readRequired(DOC_10E);
  for (const marker of [
    "ORO-10E closed.",
    "ORO-10F current.",
    DOC_10F,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10F next phase = approval_chain_rollover_review_decision_intake_gate_only",
  ]) {
    assert(doc10e.includes(marker), `${DOC_10E} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10F, SCRIPT, DETAIL_SCRIPT, "oro10f"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [API_MAP_FILE, ["## ORO-10F Approval Chain Rollover Review Decision Intake Gate Mapping", "ORO-10E closed.", "ORO-10F current.", ORO10F_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10F Current", "ORO-10E closed.", "ORO-10F current.", ORO10F_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10F current/approval chain rollover review decision intake gate", "ORO-10E closed.", "`smoke:oro-10f`", "`smoke:oro-10f:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10F Approval Chain Rollover Review Decision Intake Gate Coverage", "ORO-10E closed; ORO-10F current.", SCRIPT, DETAIL_SCRIPT]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) assert(text.includes(marker), `${file} missing marker ${marker}.`);
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
    ["process", ".", "env"].join(""),
    ["net", ".", "connect"].join(""),
    ["XML", "Http", "Request"].join(""),
  ];
  const text = [BOUNDARY, FIXTURES, SMOKE, WRAPPER].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10F files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10F]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10F_RESULT_KEY,
    DEPENDS_ON_ORO10E_KEY,
    ORO10E_PASSED_KEY,
    VERIFIED_ORO10E_ONLY_KEY,
    "dependsOnOro10aApprovalChainRolloverBoundary",
    "dependsOnOro10bApprovalChainRolloverContinuityGate",
    "dependsOnOro10cApprovalChainRolloverEvidenceGate",
    "dependsOnOro10dApprovalChainRolloverReviewRequestBoundary",
    "oro10cEvidenceGatePresent",
    "oro10dReviewRequestBoundaryPresent",
    "oro10eStatus",
    "oro10eScope",
    "oro10eClosed",
    "reviewDecisionIntakeGateStatus",
    "reviewDecisionIntakeGateScope",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateApproval",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10F_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10F_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10E_KEY], true);
  assert.strictEqual(summary[ORO10E_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10E_ONLY_KEY], true);
  assert.strictEqual(summary.oro10cEvidenceGatePresent, true);
  assert.strictEqual(summary.oro10dReviewRequestBoundaryPresent, true);
  assert.strictEqual(summary.oro10eClosed, true);
  assert.strictEqual(summary.reviewDecisionIntakeGateScope, ORO10F_SCOPE);
  assert.strictEqual(summary.reviewDecisionIntakeGateStatus, ORO10F_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10F happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10F_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10F hold output", JSON.stringify(summary));
}

function runOro10fDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10fFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10F_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10F_STATUS, "string");
  assert.strictEqual(typeof buildOro10fReviewDecisionIntakeGateRecord, "function");
  assert.strictEqual(typeof validateOro10fReviewDecisionIntakeGate, "function");
  assert.strictEqual(typeof buildOro10fSafetySummary, "function");

  const happy = evaluateOro10fReviewDecisionIntakeGate(fixtures.validReviewDecisionIntakeGateFromOro10eFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10fReviewDecisionIntakeGateRecordResult());
  assertHappyPath(validateOro10fReviewDecisionIntakeGate(buildOro10fReviewDecisionIntakeGateRecord()));
  const safety = buildOro10fSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10bPredecessorFailFixture, "missing_oro10b_predecessor"],
    [fixtures.missingOro10cPredecessorFailFixture, "missing_oro10c_predecessor"],
    [fixtures.missingOro10dPredecessorFailFixture, "missing_oro10d_predecessor"],
    [fixtures.missingOro10ePredecessorFailFixture, "missing_oro10e_predecessor"],
    [fixtures.missingOro10cEvidenceGateFailFixture, "missing_oro10c_evidence_gate"],
    [fixtures.missingOro10dReviewRequestBoundaryFailFixture, "missing_oro10d_review_request_boundary"],
    [fixtures.missingOro10eReviewRequestSubmissionGateFailFixture, "missing_oro10e_review_request_submission_gate"],
    [fixtures.missingStaticReviewDecisionIntakeRecordFailFixture, "missing_static_review_decision_intake_record"],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.decisionAuthorizesRuntimeBlockedFixture, "verifiedNoDecisionAuthorizesRuntimeOccurred_required"],
    [fixtures.runtimeAuthorizationBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicCallbackAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.walletMutationBlockedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationBlockedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.prismaWriteBlockedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionBlockedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationBlockedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployBlockedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretLikeValueBlockedFixture, "verifiedNoSecretLikeValuePresent_required"],
    [fixtures.longFilenameBlockedFixture, "noLongFilenameConfirmed_required"],
    [fixtures.missingSeparateNextApprovalBlockedFixture, "next_phase_separate_approval_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10fReviewDecisionIntakeGate(input), blocker);
  const allReports = fixtures.buildOro10fApprovalChainRolloverReviewDecisionIntakeGateFixtures().map(evaluateOro10fReviewDecisionIntakeGate);
  assert(allReports.length >= 28, "fixture set must cover requested ORO-10F scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10fDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10fDetailedSmoke,
  PASS_MESSAGE,
};
