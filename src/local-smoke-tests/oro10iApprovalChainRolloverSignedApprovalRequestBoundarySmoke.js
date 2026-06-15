"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10iApprovalChainRolloverSignedApprovalRequestBoundary");
const fixtures = require("../game-provider-mock/oro10iApprovalChainRolloverSignedApprovalRequestBoundaryFixtures");

const {
  DEPENDS_ON_ORO10H_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10H_PASSED_KEY,
  ORO10I_PHASE,
  ORO10I_RESULT_KEY,
  ORO10I_SCOPE,
  ORO10I_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10H_ONLY_KEY,
  buildOro10iSafetySummary,
  buildOro10iSignedApprovalRequestBoundaryRecord,
  buildOro10iSignedApprovalRequestBoundaryRecordResult,
  evaluateOro10iSignedApprovalRequestBoundary,
  validateOro10iSignedApprovalRequestBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10H = "docs/ORO_10H_APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_FINALIZATION_BOUNDARY.md";
const DOC_10I = "docs/ORO_10I_APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_REQUEST_BOUNDARY.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10iApprovalChainRolloverSignedApprovalRequestBoundary.js";
const FIXTURES = "src/game-provider-mock/oro10iApprovalChainRolloverSignedApprovalRequestBoundaryFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10iApprovalChainRolloverSignedApprovalRequestBoundarySmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10iSmoke.js";
const SCRIPT = "smoke:oro-10i";
const DETAIL_SCRIPT = "smoke:oro-10i:detailed";
const PASS_MESSAGE = "ORO-10I approval chain rollover signed approval request boundary smoke: PASS";
const FAIL_MESSAGE = "ORO-10I approval chain rollover signed approval request boundary smoke: FAIL";

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

function assertNoLongOro10iFilenames() {
  const longPattern =
    /ORO_10I_.*(APPROVAL_CHAIN_ROLLOVER_SIGNED_APPROVAL_REQUEST_BOUNDARY_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|REQUEST_REQUEST)/;
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
  for (const file of [DOC_10I, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10i = readRequired(DOC_10I);
  for (const marker of [
    "# ORO-10I Approval Chain Rollover Signed Approval Request Boundary",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D closed.",
    "ORO-10E closed.",
    "ORO-10F closed.",
    "ORO-10G closed.",
    "ORO-10H closed.",
    "ORO-10I current.",
    "ORO-10I continues from ORO-10H.",
    "signed approval request boundary only",
    "signed approval request in ORO-10I is a static/mock record only",
    "ORO-10I request result is non-authorizing",
    "ORO-10I request is not runtime authorization",
    "ORO-10I request is not signed runtime approval",
    "ORO-10I request is not approval artifact intake",
    "ORO-10I request is not signed approval verification",
    "ORO-10I request is not a decision that authorizes route/runtime",
    "predecessor ORO-10H present = true",
    "ORO-10C evidence gate present = true",
    "ORO-10D review request boundary present = true",
    "ORO-10E review request submission gate present = true",
    "ORO-10F review decision intake gate present = true",
    "ORO-10G review decision validation gate present = true",
    "ORO-10H review decision finalization boundary present = true",
    "ORO-10I short filename confirmed = true",
    "signed approval request static/mock only = true",
    "request is non-authorizing = true",
    "signed runtime approval not issued = true",
    "signed approval artifact not accepted = true",
    "signed approval artifact not verified = true",
    "runtime authorization not issued = true",
    "runtime approval chain rollover not issued = true",
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
    "no_signed_approval_artifact_intake",
    "no_signed_approval_verification",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_signed_approval_request_only",
    "non_authorizing_request_only",
    ORO10I_SCOPE,
    ORO10I_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10i.includes(marker), `${DOC_10I} missing marker ${marker}.`);
  }

  const doc10h = readRequired(DOC_10H);
  for (const marker of [
    "## ORO-10I Handoff",
    "ORO-10H closed.",
    "ORO-10I current.",
    DOC_10I,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10I next phase = approval_chain_rollover_signed_approval_request_boundary_only",
    "ORO-10I signed approval request is static/mock only.",
    "ORO-10I request does not authorize runtime.",
  ]) {
    assert(doc10h.includes(marker), `${DOC_10H} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10I, SCRIPT, DETAIL_SCRIPT, "oro10i"]) {
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
        "## ORO-10I Approval Chain Rollover Signed Approval Request Boundary Mapping",
        "ORO-10H closed.",
        "ORO-10I current.",
        ORO10I_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10I Current", "ORO-10H closed.", "ORO-10I current.", ORO10I_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10I current/approval chain rollover signed approval request boundary",
        "ORO-10H closed.",
        "`smoke:oro-10i`",
        "`smoke:oro-10i:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10I Approval Chain Rollover Signed Approval Request Boundary Coverage",
        "ORO-10H closed; ORO-10I current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10I files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10I]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10I_RESULT_KEY,
    DEPENDS_ON_ORO10H_KEY,
    ORO10H_PASSED_KEY,
    VERIFIED_ORO10H_ONLY_KEY,
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
    "oro10hStatus",
    "oro10hScope",
    "oro10hClosed",
    "signedApprovalRequestBoundaryStatus",
    "signedApprovalRequestBoundaryScope",
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
  assert.strictEqual(summary.phase, ORO10I_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10I_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10H_KEY], true);
  assert.strictEqual(summary[ORO10H_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10H_ONLY_KEY], true);
  assert.strictEqual(summary.oro10cEvidenceGatePresent, true);
  assert.strictEqual(summary.oro10dReviewRequestBoundaryPresent, true);
  assert.strictEqual(summary.oro10eReviewRequestSubmissionGatePresent, true);
  assert.strictEqual(summary.oro10fReviewDecisionIntakeGatePresent, true);
  assert.strictEqual(summary.oro10gReviewDecisionValidationGatePresent, true);
  assert.strictEqual(summary.oro10hReviewDecisionFinalizationBoundaryPresent, true);
  assert.strictEqual(summary.oro10hClosed, true);
  assert.strictEqual(summary.signedApprovalRequestBoundaryScope, ORO10I_SCOPE);
  assert.strictEqual(summary.signedApprovalRequestBoundaryStatus, ORO10I_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10I happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10I_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10I hold output", JSON.stringify(summary));
}

function runOro10iDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10iFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10I_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10I_STATUS, "string");
  assert.strictEqual(typeof buildOro10iSignedApprovalRequestBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro10iSignedApprovalRequestBoundary, "function");
  assert.strictEqual(typeof buildOro10iSafetySummary, "function");

  const happy = evaluateOro10iSignedApprovalRequestBoundary(
    fixtures.validStaticMockSignedApprovalRequestBoundaryFromOro10hFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro10iSignedApprovalRequestBoundaryRecordResult());
  assertHappyPath(
    validateOro10iSignedApprovalRequestBoundary(buildOro10iSignedApprovalRequestBoundaryRecord())
  );
  const safety = buildOro10iSafetySummary();
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
    [fixtures.missingOro10cEvidenceGateFailFixture, "missing_oro10c_evidence_gate"],
    [fixtures.missingOro10dReviewRequestBoundaryFailFixture, "missing_oro10d_review_request_boundary"],
    [fixtures.missingOro10eReviewRequestSubmissionGateFailFixture, "missing_oro10e_review_request_submission_gate"],
    [fixtures.missingOro10fReviewDecisionIntakeGateFailFixture, "missing_oro10f_review_decision_intake_gate"],
    [fixtures.missingOro10gReviewDecisionValidationGateFailFixture, "missing_oro10g_review_decision_validation_gate"],
    [
      fixtures.missingOro10hReviewDecisionFinalizationBoundaryFailFixture,
      "missing_oro10h_review_decision_finalization_boundary",
    ],
    [fixtures.missingStaticSignedApprovalRequestRecordFailFixture, "missing_static_signed_approval_request_record"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.signedApprovalArtifactIntakeBlockedFixture, "verifiedNoSignedApprovalArtifactPresent_required"],
    [fixtures.signedApprovalArtifactAcceptedBlockedFixture, "verifiedNoSignedApprovalArtifactAccepted_required"],
    [fixtures.signedApprovalArtifactVerifiedBlockedFixture, "verifiedNoSignedApprovalArtifactVerified_required"],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.decisionAuthorizesRuntimeBlockedFixture, "verifiedNoDecisionAuthorizesRuntimeOccurred_required"],
    [fixtures.finalizationAuthorizesRuntimeBlockedFixture, "verifiedNoFinalizationAuthorizesRuntimeOccurred_required"],
    [fixtures.requestAuthorizesRuntimeBlockedFixture, "verifiedNoRequestAuthorizesRuntimeOccurred_required"],
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
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10iSignedApprovalRequestBoundary(input), blocker);
  const allReports = fixtures
    .buildOro10iApprovalChainRolloverSignedApprovalRequestBoundaryFixtures()
    .map(evaluateOro10iSignedApprovalRequestBoundary);
  assert(allReports.length >= 40, "fixture set must cover requested ORO-10I scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10iDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10iDetailedSmoke,
  PASS_MESSAGE,
};
