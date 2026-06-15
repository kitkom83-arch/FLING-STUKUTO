"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary");
const fixtures = require("../game-provider-mock/oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryFixtures");

const {
  DEPENDS_ON_ORO10N_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10N_PASSED_KEY,
  ORO10O_PHASE,
  ORO10O_RESULT_KEY,
  ORO10O_SCOPE,
  ORO10O_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10N_ONLY_KEY,
  buildOro10oReviewFinalizationApprovalRequestBoundary,
  buildOro10oReviewFinalizationApprovalRequestBoundaryResult,
  buildOro10oSafetySummary,
  evaluateOro10oReviewFinalizationApprovalRequestBoundary,
  validateOro10oReviewFinalizationApprovalRequestBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10N =
  "docs/ORO_10N_APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_FINALIZATION_BOUNDARY.md";
const DOC_10O =
  "docs/ORO_10O_APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_FINALIZATION_APPROVAL_REQUEST_BOUNDARY.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY =
  "src/game-provider-mock/oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundarySmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10oSmoke.js";
const SCRIPT = "smoke:oro-10o";
const DETAIL_SCRIPT = "smoke:oro-10o:detailed";
const PASS_MESSAGE =
  "ORO-10O approval chain rollover signed approval artifact verification record review finalization approval request boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-10O approval chain rollover signed approval artifact verification record review finalization approval request boundary smoke: FAIL";

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

function assertNoLongOro10oFilenames() {
  const longPattern =
    /ORO_10O_.*(APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_FINALIZATION_APPROVAL_REQUEST_BOUNDARY_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|ARTIFACT_ARTIFACT|VERIFICATION_VERIFICATION|RECORD_RECORD|REVIEW_REVIEW|REQUEST_REQUEST)/;
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
  for (const file of [DOC_10O, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10o = readRequired(DOC_10O);
  for (const marker of [
    "# ORO-10O Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Approval Request Boundary",
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
    "ORO-10O current.",
    "ORO-10O continues from ORO-10N.",
    "approval request boundary only",
    "approval request in ORO-10O is a static/mock record only",
    "ORO-10O approval request result is non-authorizing",
    "approval request submission has not been performed",
    "final approval has not been issued",
    "signed runtime approval has not been issued",
    "signed approval artifact has not been accepted",
    "signed approval artifact has not actually been verified",
    "ORO-10N review finalization boundary present = true",
    "ORO-10O short filename confirmed = true",
    "approval request static/mock only = true",
    "approval request is non-authorizing = true",
    "approvalRequestSubmitted = false",
    "finalApprovalIssued = false",
    "approvalRequestAuthorizesRuntime = false",
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
    "no_signed_approval_artifact_acceptance",
    "no_actual_signed_approval_artifact_verification",
    "no_approval_request_submission",
    "no_final_approval_issued",
    "no_approval_request_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_approval_request_only",
    "non_authorizing_approval_request_only",
    ORO10O_SCOPE,
    ORO10O_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10o.includes(marker), `${DOC_10O} missing marker ${marker}.`);
  }

  const doc10n = readRequired(DOC_10N);
  for (const marker of [
    "## ORO-10O Handoff",
    "ORO-10N closed.",
    "ORO-10O current.",
    DOC_10O,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10O next phase = approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_approval_request_boundary_only",
    "ORO-10O approval request is static/mock only.",
    "ORO-10O approval request does not authorize runtime.",
  ]) {
    assert(doc10n.includes(marker), `${DOC_10N} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10O, SCRIPT, DETAIL_SCRIPT, "oro10o"]) {
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
        "## ORO-10O Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Approval Request Boundary Mapping",
        "ORO-10N closed.",
        "ORO-10O current.",
        ORO10O_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10O Current", "ORO-10N closed.", "ORO-10O current.", ORO10O_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10O current/approval chain rollover signed approval artifact verification record review finalization approval request boundary",
        "ORO-10N closed.",
        "`smoke:oro-10o`",
        "`smoke:oro-10o:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10O Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Approval Request Boundary Coverage",
        "ORO-10N closed; ORO-10O current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10O files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10O]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10O_RESULT_KEY,
    DEPENDS_ON_ORO10N_KEY,
    ORO10N_PASSED_KEY,
    VERIFIED_ORO10N_ONLY_KEY,
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
    "staticSignedApprovalArtifactVerificationRecordPresent",
    "staticSignedApprovalArtifactVerificationRecordReviewPresent",
    "staticSignedApprovalArtifactVerificationRecordReviewFinalizationPresent",
    "oro10nStatus",
    "oro10nScope",
    "oro10nClosed",
    "approvalRequestBoundaryStatus",
    "approvalRequestBoundaryScope",
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
  assert.strictEqual(summary.phase, ORO10O_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10O_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10N_KEY], true);
  assert.strictEqual(summary[ORO10N_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10N_ONLY_KEY], true);
  assert.strictEqual(summary.oro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryPresent, true);
  assert.strictEqual(summary.oro10nClosed, true);
  assert.strictEqual(summary.approvalRequestBoundaryScope, ORO10O_SCOPE);
  assert.strictEqual(summary.approvalRequestBoundaryStatus, ORO10O_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10O happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10O_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10O hold output", JSON.stringify(summary));
}

function runOro10oDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10oFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10O_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10O_STATUS, "string");
  assert.strictEqual(typeof buildOro10oReviewFinalizationApprovalRequestBoundary, "function");
  assert.strictEqual(typeof validateOro10oReviewFinalizationApprovalRequestBoundary, "function");
  assert.strictEqual(typeof buildOro10oSafetySummary, "function");

  const happy = evaluateOro10oReviewFinalizationApprovalRequestBoundary(
    fixtures.validStaticMockApprovalRequestBoundaryFromOro10nFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro10oReviewFinalizationApprovalRequestBoundaryResult());
  assertHappyPath(validateOro10oReviewFinalizationApprovalRequestBoundary(buildOro10oReviewFinalizationApprovalRequestBoundary()));
  const safety = buildOro10oSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10nPredecessorFailFixture, "missing_oro10n_predecessor"],
    [fixtures.missingOro10nReviewFinalizationBoundaryFailFixture, "missing_oro10n_review_finalization_boundary"],
    [fixtures.missingStaticApprovalRequestRecordFailFixture, "missing_static_approval_request_record"],
    [fixtures.approvalRequestSubmittedBlockedFixture, "verifiedNoApprovalRequestSubmitted_required"],
    [fixtures.finalApprovalIssuedBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.signedApprovalArtifactAcceptedBlockedFixture, "verifiedNoSignedApprovalArtifactAccepted_required"],
    [fixtures.signedApprovalArtifactVerifiedBlockedFixture, "verifiedNoSignedApprovalArtifactVerified_required"],
    [
      fixtures.actualSignedApprovalVerificationBlockedFixture,
      "verifiedNoActualSignedApprovalArtifactVerificationOccurred_required",
    ],
    [
      fixtures.approvalRequestAuthorizesRuntimeBlockedFixture,
      "verifiedNoApprovalRequestAuthorizesRuntimeOccurred_required",
    ],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.runtimeAuthorizationBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.gameLaunchCallBlockedFixture, "verifiedNoGameLaunchCallOccurred_required"],
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
  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro10oReviewFinalizationApprovalRequestBoundary(input), blocker);
  }
  const allReports = fixtures
    .buildOro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundaryFixtures()
    .map(evaluateOro10oReviewFinalizationApprovalRequestBoundary);
  assert(allReports.length >= 29, "fixture set must cover requested ORO-10O scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10oDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10oDetailedSmoke,
  PASS_MESSAGE,
};
