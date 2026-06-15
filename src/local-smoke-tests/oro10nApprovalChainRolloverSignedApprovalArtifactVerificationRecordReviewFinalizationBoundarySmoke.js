"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryFixtures");

const {
  DEPENDS_ON_ORO10M_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10M_PASSED_KEY,
  ORO10N_PHASE,
  ORO10N_RESULT_KEY,
  ORO10N_SCOPE,
  ORO10N_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10M_ONLY_KEY,
  buildOro10nSafetySummary,
  buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
  buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryResult,
  evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
  validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10M =
  "docs/ORO_10M_APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_GATE.md";
const DOC_10N =
  "docs/ORO_10N_APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_FINALIZATION_BOUNDARY.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY =
  "src/game-provider-mock/oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundarySmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10nSmoke.js";
const SCRIPT = "smoke:oro-10n";
const DETAIL_SCRIPT = "smoke:oro-10n:detailed";
const PASS_MESSAGE =
  "ORO-10N approval chain rollover signed approval artifact verification record review finalization boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-10N approval chain rollover signed approval artifact verification record review finalization boundary smoke: FAIL";

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

function assertNoLongOro10nFilenames() {
  const longPattern =
    /ORO_10N_.*(APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_ARTIFACT_VERIFICATION_RECORD_REVIEW_FINALIZATION_BOUNDARY_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|ARTIFACT_ARTIFACT|VERIFICATION_VERIFICATION|RECORD_RECORD|REVIEW_REVIEW)/;
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
  for (const file of [DOC_10N, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10n = readRequired(DOC_10N);
  for (const marker of [
    "# ORO-10N Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Boundary",
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
    "ORO-10N current.",
    "ORO-10N continues from ORO-10M.",
    "signed approval artifact verification record review finalization boundary only",
    "review finalization in ORO-10N is a static/mock record only",
    "ORO-10N review finalization result is non-authorizing",
    "ORO-10N review finalization is not runtime authorization",
    "ORO-10N review finalization is not signed runtime approval",
    "ORO-10N review finalization is not actual artifact acceptance",
    "ORO-10N review finalization is not actual artifact verification",
    "predecessor ORO-10M present = true",
    "ORO-10M signed approval artifact verification record review gate present = true",
    "ORO-10N short filename confirmed = true",
    "signed approval artifact verification record review finalization static/mock only = true",
    "review finalization is non-authorizing = true",
    "signed runtime approval not issued = true",
    "signed approval artifact not accepted = true",
    "signed approval artifact not actually verified = true",
    "verificationRecordAuthorizesRuntime = false",
    "verificationRecordReviewAuthorizesRuntime = false",
    "reviewFinalizationAuthorizesRuntime = false",
    "runtime authorization not issued = true",
    "runtime approval chain rollover not issued = true",
    "no external call evidence = true",
    "no game launch call evidence = true",
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
    "no_verification_record_runtime_authorization",
    "no_verification_record_review_runtime_authorization",
    "no_review_finalization_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_signed_approval_artifact_verification_record_review_finalization_only",
    "non_authorizing_review_finalization_only",
    ORO10N_SCOPE,
    ORO10N_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10n.includes(marker), `${DOC_10N} missing marker ${marker}.`);
  }

  const doc10m = readRequired(DOC_10M);
  for (const marker of [
    "## ORO-10N Handoff",
    "ORO-10M closed.",
    "ORO-10N current.",
    DOC_10N,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10N next phase = approval_chain_rollover_signed_approval_artifact_verification_record_review_finalization_boundary_only",
    "ORO-10N signed approval artifact verification record review finalization is static/mock only.",
    "ORO-10N review finalization does not authorize runtime.",
  ]) {
    assert(doc10m.includes(marker), `${DOC_10M} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10N, SCRIPT, DETAIL_SCRIPT, "oro10n"]) {
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
        "## ORO-10N Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Boundary Mapping",
        "ORO-10M closed.",
        "ORO-10N current.",
        ORO10N_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10N Current", "ORO-10M closed.", "ORO-10N current.", ORO10N_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10N current/approval chain rollover signed approval artifact verification record review finalization boundary",
        "ORO-10M closed.",
        "`smoke:oro-10n`",
        "`smoke:oro-10n:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10N Approval Chain Rollover Signed Approval Artifact Verification Record Review Finalization Boundary Coverage",
        "ORO-10M closed; ORO-10N current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10N files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10N]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10N_RESULT_KEY,
    DEPENDS_ON_ORO10M_KEY,
    ORO10M_PASSED_KEY,
    VERIFIED_ORO10M_ONLY_KEY,
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
    "staticSignedApprovalArtifactVerificationRecordPresent",
    "staticSignedApprovalArtifactVerificationRecordReviewPresent",
    "oro10mStatus",
    "oro10mScope",
    "oro10mClosed",
    "signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus",
    "signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope",
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
  assert.strictEqual(summary.phase, ORO10N_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10N_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10M_KEY], true);
  assert.strictEqual(summary[ORO10M_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10M_ONLY_KEY], true);
  assert.strictEqual(summary.oro10mSignedApprovalArtifactVerificationRecordReviewGatePresent, true);
  assert.strictEqual(summary.oro10mClosed, true);
  assert.strictEqual(summary.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryScope, ORO10N_SCOPE);
  assert.strictEqual(summary.signedApprovalArtifactVerificationRecordReviewFinalizationBoundaryStatus, ORO10N_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10N happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10N_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10N hold output", JSON.stringify(summary));
}

function runOro10nDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10nFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10N_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10N_STATUS, "string");
  assert.strictEqual(typeof buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary, "function");
  assert.strictEqual(typeof validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary, "function");
  assert.strictEqual(typeof buildOro10nSafetySummary, "function");

  const happy = evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(
    fixtures.validStaticMockSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryFromOro10mFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryResult());
  assertHappyPath(
    validateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(
      buildOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary()
    )
  );
  const safety = buildOro10nSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10bPredecessorFailFixture, "missing_oro10b_predecessor"],
    [fixtures.missingOro10cPredecessorFailFixture, "missing_oro10c_predecessor"],
    [fixtures.missingOro10dPredecessorFailFixture, "missing_oro10d_predecessor"],
    [fixtures.missingOro10ePredecessorFailFixture, "missing_oro10e_predecessor"],
    [fixtures.missingOro10fPredecessorFailFixture, "missing_oro10f_predecessor"],
    [fixtures.missingOro10gPredecessorFailFixture, "missing_oro10g_predecessor"],
    [fixtures.missingOro10hPredecessorFailFixture, "missing_oro10h_predecessor"],
    [fixtures.missingOro10iPredecessorFailFixture, "missing_oro10i_predecessor"],
    [fixtures.missingOro10jPredecessorFailFixture, "missing_oro10j_predecessor"],
    [fixtures.missingOro10kPredecessorFailFixture, "missing_oro10k_predecessor"],
    [fixtures.missingOro10lPredecessorFailFixture, "missing_oro10l_predecessor"],
    [fixtures.missingOro10mPredecessorFailFixture, "missing_oro10m_predecessor"],
    [fixtures.missingOro10cEvidenceGateFailFixture, "missing_oro10c_evidence_gate"],
    [fixtures.missingOro10dReviewRequestBoundaryFailFixture, "missing_oro10d_review_request_boundary"],
    [fixtures.missingOro10eReviewRequestSubmissionGateFailFixture, "missing_oro10e_review_request_submission_gate"],
    [fixtures.missingOro10fReviewDecisionIntakeGateFailFixture, "missing_oro10f_review_decision_intake_gate"],
    [fixtures.missingOro10gReviewDecisionValidationGateFailFixture, "missing_oro10g_review_decision_validation_gate"],
    [
      fixtures.missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
      "missing_oro10h_review_decision_finalization_boundary",
    ],
    [fixtures.missingOro10iSignedApprovalRequestBoundaryFailFixture, "missing_oro10i_signed_approval_request_boundary"],
    [
      fixtures.missingOro10jSignedApprovalArtifactIntakeGateFailFixture,
      "missing_oro10j_signed_approval_artifact_intake_gate",
    ],
    [
      fixtures.missingOro10kSignedApprovalArtifactVerificationGateFailFixture,
      "missing_oro10k_signed_approval_artifact_verification_gate",
    ],
    [
      fixtures.missingOro10lSignedApprovalArtifactVerificationRecordBoundaryFailFixture,
      "missing_oro10l_signed_approval_artifact_verification_record_boundary",
    ],
    [
      fixtures.missingOro10mSignedApprovalArtifactVerificationRecordReviewGateFailFixture,
      "missing_oro10m_signed_approval_artifact_verification_record_review_gate",
    ],
    [
      fixtures.missingStaticSignedApprovalArtifactVerificationRecordReviewFinalizationFailFixture,
      "missing_static_signed_approval_artifact_verification_record_review_finalization",
    ],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.signedApprovalArtifactAcceptedBlockedFixture, "verifiedNoSignedApprovalArtifactAccepted_required"],
    [fixtures.signedApprovalArtifactVerifiedBlockedFixture, "verifiedNoSignedApprovalArtifactVerified_required"],
    [
      fixtures.actualSignedApprovalVerificationBlockedFixture,
      "verifiedNoActualSignedApprovalArtifactVerificationOccurred_required",
    ],
    [
      fixtures.verificationRecordAuthorizesRuntimeBlockedFixture,
      "verifiedNoVerificationRecordAuthorizesRuntimeOccurred_required",
    ],
    [
      fixtures.verificationRecordReviewAuthorizesRuntimeBlockedFixture,
      "verifiedNoVerificationRecordReviewAuthorizesRuntimeOccurred_required",
    ],
    [
      fixtures.reviewFinalizationAuthorizesRuntimeBlockedFixture,
      "verifiedNoReviewFinalizationAuthorizesRuntimeOccurred_required",
    ],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.decisionAuthorizesRuntimeBlockedFixture, "verifiedNoDecisionAuthorizesRuntimeOccurred_required"],
    [fixtures.finalizationAuthorizesRuntimeBlockedFixture, "verifiedNoFinalizationAuthorizesRuntimeOccurred_required"],
    [fixtures.requestAuthorizesRuntimeBlockedFixture, "verifiedNoRequestAuthorizesRuntimeOccurred_required"],
    [fixtures.artifactIntakeAuthorizesRuntimeBlockedFixture, "verifiedNoArtifactIntakeAuthorizesRuntimeOccurred_required"],
    [fixtures.artifactVerificationAuthorizesRuntimeBlockedFixture, "verifiedNoArtifactVerificationAuthorizesRuntimeOccurred_required"],
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
    assertHeld(evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary(input), blocker);
  }
  const allReports = fixtures
    .buildOro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundaryFixtures()
    .map(evaluateOro10nSignedApprovalArtifactVerificationRecordReviewFinalizationBoundary);
  assert(allReports.length >= 55, "fixture set must cover requested ORO-10N scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10nDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10nDetailedSmoke,
  PASS_MESSAGE,
};
