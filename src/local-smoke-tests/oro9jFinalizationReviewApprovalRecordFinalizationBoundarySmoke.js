"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9jFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9jFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");

const {
  CLOSED_ORO9J_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9J_BOUNDARY_RESULT_KEY,
  ORO9J_NO_RUNTIME_PROOF_KEYS,
  ORO_9J_PHASE,
  ORO_9J_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9jDependencyChainFromOro9i,
  buildOro9jFinalizationReviewApprovalRecordFinalizationBoundaryResult,
  buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
  buildOro9jSafetyFlags,
  evaluateOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9jFinalizationReviewApprovalRecordFinalizationBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9I =
  "docs/ORO_9I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9J =
  "docs/ORO_9J_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9jSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9jFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9jFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9jFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9j";
const DETAIL_SCRIPT =
  "smoke:oro-9j-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary";
const DEPENDS_ON_ORO9I_KEY =
  "dependsOnOro9iActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9I_PASSED_KEY =
  "oro9iActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9I_ONLY_KEY =
  "verifiedOro9iWasFinalizationReviewApprovalRecordBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9I_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9i",
  "IssuedFromOro9i",
  "PassedFromOro9i",
  "RecordedFromOro9i",
]);
const ORO9J_FINALIZATION_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9J_FINALIZATION_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRequired",
  "separateActualExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9J_ACTUAL_EXECUTION_FLAGS]),
]);

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

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken"].join(""),
    ["Be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of guardedMarkers) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  }
  for (const marker of [["P", "IN"].join("")]) {
    assert(!new RegExp(`\\b${marker}\\b`).test(scanned), `${label} includes guarded marker ${marker}.`);
  }
  assert(
    !/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned),
    `${label} includes compact auth shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes embedded auth URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc9i = readRequired(DOC_9I);
  for (const marker of [
    "ORO-9J follows ORO-9I as the separate finalization review approval record finalization boundary.",
    `${NEXT_PHASE_KEY} = true`,
  ]) {
    assert(doc9i.includes(marker), `${DOC_9I} missing marker ${marker}.`);
  }

  const doc9j = readRequired(DOC_9J);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9I",
    "## Finalization review approval record finalization boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance or runtime finalization",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review boundary",
    "ORO-9J = finalization review approval record finalization boundary only",
    ORO_9J_SCOPE,
    `${DEPENDS_ON_ORO9I_KEY} = true`,
    `${ORO9I_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationPrepared = true",
    "finalizationReviewApprovalRecordFinalizationIssued = true",
    "finalizationReviewApprovalRecordFinalizationPassed = true",
    "finalizationReviewApprovalRecordFinalizationRecorded = true",
    "finalizationReviewApprovalRecordFinalizationAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordRuntimeFinalized = false",
    "finalizationReviewApprovalRecordLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9j.includes(marker), `${DOC_9J} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro9j",
    "ORO_9J_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "## ORO-9J Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping",
        "ORO-9J = finalization review approval record finalization boundary only",
        ORO_9J_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9J Current",
        "ORO-9J = finalization review approval record finalization boundary only",
        ORO_9J_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9J current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary",
        "ORO-9J = finalization review approval record finalization boundary only",
        "`smoke:oro-9j`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9J Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage",
        "ORO-9J actual live execution final execution completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias",
        SCRIPT,
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertStaticSafety() {
  const unsafeRuntimePatterns = [
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "http.request",
    "https.request",
    "fetch(",
    ["process", "env"].join("."),
  ];
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9J].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9J files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9J]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9J_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9I_KEY,
    ORO9I_PASSED_KEY,
    "oro9iFinalizationReviewApprovalRecordStatusFromOro9i",
    "oro9iFinalizationReviewApprovalRecordScopeFromOro9i",
    VERIFIED_ORO9I_ONLY_KEY,
    ...ORO9I_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationStatus",
    "finalizationReviewApprovalRecordFinalizationScope",
    ...ORO9J_FINALIZATION_TRUE_KEYS,
    ...ORO9J_FINALIZATION_FALSE_KEYS,
    ...ORO9J_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    ...SEPARATE_REQUIREMENT_KEYS,
    "sensitiveOutputPresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9J_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9J_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9I_KEY], true);
  assert.strictEqual(summary[ORO9I_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9I_ONLY_KEY], true);
  for (const key of ORO9I_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationScope, ORO_9J_SCOPE);
  for (const key of ORO9J_FINALIZATION_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9J_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9J happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9J_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9J hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro9jFinalizationReviewApprovalRecordFinalizationBoundaryResult, "function");
  assert.strictEqual(typeof validateOro9jFinalizationReviewApprovalRecordFinalizationBoundary, "function");
  assert.strictEqual(typeof buildOro9jSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9jDependencyChainFromOro9i, "function");
  assert.strictEqual(
    typeof buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture
    );
  assertHappyPath(happy);
  assertHappyPath(buildOro9jFinalizationReviewApprovalRecordFinalizationBoundaryResult());
  assert.deepStrictEqual(
    validateOro9jFinalizationReviewApprovalRecordFinalizationBoundary(happy),
    buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(
      happy
    )
  );
  assert.deepStrictEqual(
    runOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
      happy
    ),
    happy
  );
  assert.strictEqual(buildOro9jSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9jSafetyFlags().verifiedNoRuntimeAcceptanceOccurred, true);
  assert.strictEqual(buildOro9jSafetyFlags().verifiedNoRuntimeFinalizationOccurred, true);
  assert.strictEqual(buildOro9jDependencyChainFromOro9i()[DEPENDS_ON_ORO9I_KEY], true);

  const heldCases = [
    [fixtures.failOro9iDependencyMissingFixture, "missing_oro9i_finalization_review_approval_record_boundary_dependency"],
    [
      fixtures.failFinalizationReviewApprovalRecordFinalizationMissingFixture,
      "finalizationReviewApprovalRecordFinalizationIssued_required",
    ],
    [
      fixtures.failApprovalRecordFinalizationAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationAcceptedForRuntime_not_allowed_in_oro9j",
    ],
    [
      fixtures.failApprovalRecordFinalizationAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution_not_allowed_in_oro9j",
    ],
    [
      fixtures.failApprovalRecordFinalizationAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationAppliedToRuntime_not_allowed_in_oro9j",
    ],
    [
      fixtures.failActualExecutionAttemptedFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9j",
    ],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_requires_no_runtime_finalization_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9j"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9j"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9j"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9j"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9j"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro9j"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9j"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9j"],
    [fixtures.failSecretShapedFixture, "sensitive_output_not_allowed_in_oro9j"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures().map(
      evaluateOro9jLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary
    );
  assert.strictEqual(allReports.length, 18, "fixture set must cover ORO-9J cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9J live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9J live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
