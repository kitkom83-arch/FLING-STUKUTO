"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures");

const {
  CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  NO_RUNTIME_PROOF_KEYS,
  ORO9G_BOUNDARY_RESULT_KEY,
  ORO_9G_PHASE,
  ORO_9G_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9gDependencyChainFromOro9f,
  buildOro9gFinalizationReviewBoundaryResult,
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
  buildOro9gSafetyFlags,
  evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  runOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9gFinalizationReviewBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9F =
  "docs/ORO_9F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_9G =
  "docs/ORO_9G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9gSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-9g";
const DETAIL_SCRIPT =
  "smoke:oro-9g-actual-live-execution-final-execution-completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary";
const ORO9F_PREFIX =
  "actualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalization";
const ORO9G_PREFIX = `${ORO9F_PREFIX}Review`;
const DEPENDS_ON_ORO9F_KEY =
  "dependsOnOro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9F_PASSED_KEY =
  "oro9fActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9F_ONLY_KEY =
  "verifiedOro9fWasCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9F_FROM_KEYS = Object.freeze([
  "PreparedFromOro9f",
  "IssuedFromOro9f",
  "PassedFromOro9f",
  "RecordedFromOro9f",
]);
const ORO9G_REVIEW_KEYS = Object.freeze(["Prepared", "Issued", "Passed", "Recorded"]);
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
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9G_ACTUAL_EXECUTION_FLAGS]),
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
  const doc9f = readRequired(DOC_9F);
  for (const marker of [
    "ORO-9G follows ORO-9F as the separate actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review boundary.",
    `${NEXT_PHASE_KEY} = true`,
  ]) {
    assert(doc9f.includes(marker), `${DOC_9F} missing marker ${marker}.`);
  }

  const doc9g = readRequired(DOC_9G);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9F",
    "## Finalization review boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate approval",
    "ORO-9G = finalization review boundary only",
    ORO_9G_SCOPE,
    `${DEPENDS_ON_ORO9F_KEY} = true`,
    `${ORO9F_PASSED_KEY} = true`,
    `${ORO9G_PREFIX}Prepared = true`,
    `${ORO9G_PREFIX}Issued = true`,
    `${ORO9G_PREFIX}Passed = true`,
    `${ORO9G_PREFIX}Recorded = true`,
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9g.includes(marker), `${DOC_9G} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    DETAIL_SCRIPT,
    "oro9g",
    "ORO_9G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "ACTUAL_LIVE_EXECUTION_FINAL_EXECUTION_COMPLETION_RECORD_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md",
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
        "## ORO-9G Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Mapping",
        "ORO-9G = finalization review boundary only",
        ORO_9G_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9G Current",
        "ORO-9G = finalization review boundary only",
        ORO_9G_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9G current/live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review boundary",
        "ORO-9G = finalization review boundary only",
        "`smoke:oro-9g`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9G Live Traffic Actual External Call Execution Actual Live Execution Final Execution Completion Record Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Coverage",
        "ORO-9G actual live execution final execution completion-record-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9G].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9G files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9G]) {
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
    ORO9G_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9F_KEY,
    ORO9F_PASSED_KEY,
    ...ORO9F_FROM_KEYS.map((key) => `${ORO9F_PREFIX}${key}`),
    `${ORO9F_PREFIX}StatusFromOro9f`,
    `${ORO9F_PREFIX}ScopeFromOro9f`,
    ...ORO9G_REVIEW_KEYS.map((key) => `${ORO9G_PREFIX}${key}`),
    `${ORO9G_PREFIX}Status`,
    `${ORO9G_PREFIX}Scope`,
    VERIFIED_ORO9F_ONLY_KEY,
    ...NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9G_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9G_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9F_KEY], true);
  assert.strictEqual(summary[ORO9F_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9F_ONLY_KEY], true);
  for (const key of ORO9F_FROM_KEYS) {
    assert.strictEqual(summary[`${ORO9F_PREFIX}${key}`], true);
  }
  for (const key of ORO9G_REVIEW_KEYS) {
    assert.strictEqual(summary[`${ORO9G_PREFIX}${key}`], true);
  }
  assert.strictEqual(summary[`${ORO9G_PREFIX}Scope`], ORO_9G_SCOPE);
  for (const key of NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9G happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9G_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9G hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro9gFinalizationReviewBoundaryResult, "function");
  assert.strictEqual(typeof validateOro9gFinalizationReviewBoundary, "function");
  assert.strictEqual(typeof buildOro9gSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9gDependencyChainFromOro9f, "function");
  assert.strictEqual(
    typeof buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
      fixtures.happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture
    );
  assertHappyPath(happy);
  assertHappyPath(buildOro9gFinalizationReviewBoundaryResult());
  assert.deepStrictEqual(
    validateOro9gFinalizationReviewBoundary(happy),
    buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(
      happy
    )
  );
  assert.deepStrictEqual(
    runOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
      happy
    ),
    happy
  );
  assert.strictEqual(buildOro9gSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9gDependencyChainFromOro9f()[DEPENDS_ON_ORO9F_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9fDependencyMissingFixture,
      "missing_oro9f_actual_live_execution_final_execution_completion_record_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency",
    ],
    [
      fixtures.failActualExecutionAttemptedFixture,
      "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9g",
    ],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "actualExternalCallExecutionRuntimeEnabled_not_allowed_in_oro9g",
    ],
    [
      fixtures.failLiveOroPlayApiCallAttemptedFixture,
      "liveOroPlayApiCallAllowed_not_allowed_in_oro9g",
    ],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9g"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9g"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9g"],
    [fixtures.failPrismaWriteAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9g"],
    [fixtures.failDbTransactionAttemptedFixture, "dbTransactionAllowed_not_allowed_in_oro9g"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9g"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9g"],
    [fixtures.failSecretShapedFixture, "sensitive_output_not_allowed_in_oro9g"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
        input
      ),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures().map(
      evaluateOro9gLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary
    );
  assert.strictEqual(allReports.length, 13, "fixture set must cover ORO-9G cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9G live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9G live traffic actual external call execution actual live execution final execution completion record review approval record finalization review approval record finalization review approval record finalization review boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
