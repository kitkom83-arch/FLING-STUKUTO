"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10qFinalApprovalDecisionIntakeGate");
const fixtures = require("../game-provider-mock/oro10qFinalApprovalDecisionIntakeGateFixtures");

const {
  DEPENDS_ON_ORO10P_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10P_PASSED_KEY,
  ORO10Q_PHASE,
  ORO10Q_RESULT_KEY,
  ORO10Q_SCOPE,
  ORO10Q_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10P_ONLY_KEY,
  buildOro10qFinalApprovalDecisionIntakeGate,
  buildOro10qFinalApprovalDecisionIntakeGateResult,
  buildOro10qSafetySummary,
  evaluateOro10qFinalApprovalDecisionIntakeGate,
  validateOro10qFinalApprovalDecisionIntakeGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10P = "docs/ORO_10P_FINAL_APPROVAL_REQUEST_SUBMISSION_GATE.md";
const DOC_10Q = "docs/ORO_10Q_FINAL_APPROVAL_DECISION_INTAKE_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10qFinalApprovalDecisionIntakeGate.js";
const FIXTURES = "src/game-provider-mock/oro10qFinalApprovalDecisionIntakeGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10qFinalApprovalDecisionIntakeGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10qSmoke.js";
const SCRIPT = "smoke:oro-10q";
const DETAIL_SCRIPT = "smoke:oro-10q:detailed";
const PASS_MESSAGE = "ORO-10Q final approval decision intake gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10Q final approval decision intake gate smoke: FAIL";

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

function assertNoLongOro10qFilenames() {
  const longPattern =
    /ORO_10Q_.*(FINAL_APPROVAL_DECISION_INTAKE_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|INTAKE_INTAKE)/;
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
  for (const file of [DOC_10Q, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10q = readRequired(DOC_10Q);
  for (const marker of [
    "# ORO-10Q Final Approval Decision Intake Gate",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D closed.",
    "ORO-10E closed.",
    "ORO-10F closed.",
    "ORO-10G closed.",
    "ORO-10H closed.",
    "ORO-10I closed.",
    "ORO-10J closed.",
    "ORO-10K closed.",
    "ORO-10L closed.",
    "ORO-10M closed.",
    "ORO-10N closed.",
    "ORO-10O closed.",
    "ORO-10P closed.",
    "ORO-10Q current.",
    "ORO-10Q continues from ORO-10P.",
    "final approval decision intake gate only",
    "final approval decision intake in ORO-10Q is a static/mock record only",
    "ORO-10Q decision intake result is non-authorizing",
    "final approval has not been issued",
    "signed runtime approval has not been issued",
    "ORO-10O approval request boundary present = true",
    "ORO-10P final approval request submission gate present = true",
    "ORO-10Q short filename confirmed = true",
    "final approval decision intake static/mock only = true",
    "decision intake is non-authorizing = true",
    "finalApprovalIssued = false",
    "approvalDecisionAuthorizesRuntime = false",
    "finalApprovalDecisionAuthorizesRuntime = false",
    "runtime approval chain rollover not issued = true",
    "no secret-shaped value evidence = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_actual_external_call",
    "no_game_launch_call",
    "no_route_alias",
    "no_public_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_runtime_review_decision",
    "no_runtime_authorization",
    "no_signed_runtime_approval",
    "no_final_approval_issued",
    "no_final_approval_decision_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_final_approval_decision_intake_only",
    "non_authorizing_decision_intake_only",
    ORO10Q_SCOPE,
    ORO10Q_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10q.includes(marker), `${DOC_10Q} missing marker ${marker}.`);
  }

  const doc10p = readRequired(DOC_10P);
  for (const marker of [
    "## ORO-10Q Handoff",
    "ORO-10P closed.",
    "ORO-10Q current.",
    DOC_10Q,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10Q next phase = approval_chain_rollover_final_approval_decision_intake_gate_only",
    "ORO-10Q final approval decision intake is static/mock only.",
    "ORO-10Q final approval decision intake does not authorize runtime.",
  ]) {
    assert(doc10p.includes(marker), `${DOC_10P} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10Q, SCRIPT, DETAIL_SCRIPT, "oro10q"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      API_MAP_FILE,
      [
        "## ORO-10Q Final Approval Decision Intake Gate Mapping",
        "ORO-10P closed.",
        "ORO-10Q current.",
        ORO10Q_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10Q Current", "ORO-10P closed.", "ORO-10Q current.", ORO10Q_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10Q current/final approval decision intake gate",
        "ORO-10P closed.",
        "`smoke:oro-10q`",
        "`smoke:oro-10q:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10Q Final Approval Decision Intake Gate Coverage",
        "ORO-10P closed; ORO-10Q current.",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10Q files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10Q]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10Q_RESULT_KEY,
    DEPENDS_ON_ORO10P_KEY,
    ORO10P_PASSED_KEY,
    VERIFIED_ORO10P_ONLY_KEY,
    "dependsOnOro10aApprovalChainRolloverBoundary",
    "dependsOnOro10bApprovalChainRolloverContinuityGate",
    "dependsOnOro10cApprovalChainRolloverEvidenceGate",
    "dependsOnOro10dApprovalChainRolloverReviewRequestBoundary",
    "dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate",
    "dependsOnOro10fApprovalChainRolloverReviewDecisionIntakeGate",
    "dependsOnOro10gApprovalChainRolloverReviewDecisionValidationGate",
    "oro10cEvidenceGatePresent",
    "oro10dReviewRequestBoundaryPresent",
    "oro10eReviewRequestSubmissionGatePresent",
    "oro10fReviewDecisionIntakeGatePresent",
    "oro10gReviewDecisionValidationGatePresent",
    "oro10hReviewDecisionFinalizationBoundaryPresent",
    "oro10iSignedApprovalRequestBoundaryPresent",
    "oro10jSignedApprovalArtifactIntakeGatePresent",
    "oro10kSignedApprovalArtifactVerificationGatePresent",
    "oro10lSignedApprovalArtifactVerificationRecordBoundaryPresent",
    "oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent",
    "oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent",
    "oro10oApprovalRequestBoundaryPresent",
    "oro10pFinalApprovalRequestSubmissionGatePresent",
    "staticApprovalRequestRecordPresent",
    "staticFinalApprovalRequestSubmissionRecordPresent",
    "oro10pStatus",
    "oro10pScope",
    "oro10pClosed",
    "finalApprovalDecisionIntakeGateStatus",
    "finalApprovalDecisionIntakeGateScope",
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
  assert.strictEqual(summary.phase, ORO10Q_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10Q_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10P_KEY], true);
  assert.strictEqual(summary[ORO10P_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10P_ONLY_KEY], true);
  assert.strictEqual(summary.oro10oApprovalRequestBoundaryPresent, true);
  assert.strictEqual(summary.oro10pFinalApprovalRequestSubmissionGatePresent, true);
  assert.strictEqual(summary.oro10pClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionIntakeGateScope, ORO10Q_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionIntakeGateStatus, ORO10Q_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10Q happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10Q_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10Q hold output", JSON.stringify(summary));
}

function runOro10qDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10qFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10Q_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10Q_STATUS, "string");
  assert.strictEqual(typeof buildOro10qFinalApprovalDecisionIntakeGate, "function");
  assert.strictEqual(typeof validateOro10qFinalApprovalDecisionIntakeGate, "function");
  assert.strictEqual(typeof buildOro10qSafetySummary, "function");

  const happy = evaluateOro10qFinalApprovalDecisionIntakeGate(
    fixtures.validStaticMockFinalApprovalDecisionIntakeGateFromOro10pFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro10qFinalApprovalDecisionIntakeGateResult());
  assertHappyPath(validateOro10qFinalApprovalDecisionIntakeGate(buildOro10qFinalApprovalDecisionIntakeGate()));
  const safety = buildOro10qSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10pPredecessorFailFixture, "missing_oro10p_predecessor"],
    [fixtures.missingOro10oApprovalRequestBoundaryFailFixture, "missing_oro10o_approval_request_boundary"],
    [
      fixtures.missingOro10pFinalApprovalRequestSubmissionGateFailFixture,
      "missing_oro10p_final_approval_request_submission_gate",
    ],
    [
      fixtures.missingStaticFinalApprovalDecisionIntakeRecordFailFixture,
      "missing_static_final_approval_decision_intake_record",
    ],
    [fixtures.finalApprovalIssuedBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [
      fixtures.approvalDecisionAuthorizesRuntimeBlockedFixture,
      "verifiedNoApprovalDecisionAuthorizesRuntimeOccurred_required",
    ],
    [
      fixtures.finalApprovalDecisionAuthorizesRuntimeBlockedFixture,
      "verifiedNoFinalApprovalDecisionAuthorizesRuntimeOccurred_required",
    ],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.runtimeAuthorizationBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.runtimeApprovalBlockedFixture, "verifiedNoRuntimeApprovalOccurred_required"],
    [fixtures.runtimeActivationBlockedFixture, "verifiedNoRuntimeActivationOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.liveOroPlayApiCallBlockedFixture, "verifiedNoLiveOroPlayApiCallOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.gameLaunchCallBlockedFixture, "verifiedNoGameLaunchCallOccurred_required"],
    [fixtures.walletMutationBlockedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationBlockedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.dbRuntimeFlowBlockedFixture, "verifiedNoDbRuntimeFlowOccurred_required"],
    [fixtures.prismaWriteBlockedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionBlockedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationBlockedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployBlockedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretLikeValueBlockedFixture, "verifiedNoSecretLikeValuePresent_required"],
    [fixtures.longFilenameBlockedFixture, "noLongFilenameConfirmed_required"],
    [fixtures.missingSeparateNextApprovalBlockedFixture, "next_phase_separate_approval_required"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro10qFinalApprovalDecisionIntakeGate(input), blocker);
  }
  const allReports = fixtures.buildOro10qFinalApprovalDecisionIntakeGateFixtures().map(
    evaluateOro10qFinalApprovalDecisionIntakeGate
  );
  assert(allReports.length >= 31, "fixture set must cover requested ORO-10Q scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10qDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10qDetailedSmoke,
  PASS_MESSAGE,
};
