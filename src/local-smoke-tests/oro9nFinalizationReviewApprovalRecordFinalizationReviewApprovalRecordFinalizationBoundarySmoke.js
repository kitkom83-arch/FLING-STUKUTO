"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");

const {
  CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9N_BOUNDARY_RESULT_KEY,
  ORO9N_NO_RUNTIME_PROOF_KEYS,
  ORO_9N_PHASE,
  ORO_9N_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9nDependencyChainFromOro9m,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult,
  buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary,
  buildOro9nSafetyFlags,
  evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  runOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
  validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9M = "docs/ORO_9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9N =
  "docs/ORO_9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9nSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9n";
const DETAIL_SCRIPT =
  "smoke:oro-9n-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary";
const DEPENDS_ON_ORO9M_KEY =
  "dependsOnOro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9M_PASSED_KEY =
  "oro9mActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPassed";
const VERIFIED_ORO9M_ONLY_KEY =
  "verifiedOro9mWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9M_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9m",
  "IssuedFromOro9m",
  "PassedFromOro9m",
  "RecordedFromOro9m",
]);
const ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded",
]);
const ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9N_ACTUAL_EXECUTION_FLAGS]),
]);
const LONG_ORO9N_FILE_PATTERNS = Object.freeze([
  "docs/ORO_9N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION*",
  "src/game-provider-mock/oro9nLiveTrafficActualExternalCallExecution*",
  "src/local-smoke-tests/oro9nLiveTrafficActualExternalCallExecution*",
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

function assertNoLongOro9nFilenames() {
  for (const pattern of LONG_ORO9N_FILE_PATTERNS) {
    assert.deepStrictEqual(gitOutput(["ls-files", "--others", "--exclude-standard", "--", pattern]), []);
    assert.deepStrictEqual(gitOutput(["ls-files", "--", pattern]), []);
  }
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken"].join(""),
    ["Be", "arer"].join(""),
    ["Ba", "sic"].join(""),
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
  const doc9m = readRequired(DOC_9M);
  for (const marker of [
    "ORO-9N follows ORO-9M as the finalization review approval record finalization review approval record finalization boundary.",
    NEXT_PHASE_KEY,
    DOC_9N,
  ]) {
    assert(doc9m.includes(marker), `${DOC_9M} missing marker ${marker}.`);
  }

  const doc9n = readRequired(DOC_9N);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9M",
    "## Finalization review approval record finalization review approval record boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No runtime finalization review approval record",
    "## No runtime finalization review approval record finalization",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval record finalization boundary",
    "ORO-9N = finalization review approval record finalization review approval record finalization boundary only",
    ORO_9N_SCOPE,
    `${DEPENDS_ON_ORO9M_KEY} = true`,
    `${ORO9M_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred = true",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9n.includes(marker), `${DOC_9N} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9n", DOC_9N]) {
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
        "## ORO-9N Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping",
        "ORO-9N = finalization review approval record finalization review approval record finalization boundary only",
        ORO_9N_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9N Current",
        "ORO-9N = finalization review approval record finalization review approval record finalization boundary only",
        ORO_9N_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9N current/finalization review approval record finalization review approval record finalization boundary",
        "ORO-9N = finalization review approval record finalization review approval record finalization boundary only",
        "`smoke:oro-9n`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9N Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage",
        "ORO-9N finalization-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9N].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9N files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9N]) {
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
    ORO9N_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9M_KEY,
    ORO9M_PASSED_KEY,
    "oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9m",
    "oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9m",
    VERIFIED_ORO9M_ONLY_KEY,
    ...ORO9M_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
    ...ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9N_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9N_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9N_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9M_KEY], true);
  assert.strictEqual(summary[ORO9M_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9M_ONLY_KEY], true);
  for (const key of ORO9M_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope, ORO_9N_SCOPE);
  for (const key of ORO9N_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9N_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9N happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9N_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9N hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro9nSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9nDependencyChainFromOro9m, "function");
  assert.strictEqual(
    typeof buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9nFilenames();
  assertStaticSafety();

  const happy = evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryResult());
  assert.deepStrictEqual(
    validateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(happy),
    buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySummary(happy)
  );
  assert.deepStrictEqual(runOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(happy), happy);
  assert.strictEqual(buildOro9nSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9nSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred, true);
  assert.strictEqual(
    buildOro9nSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred,
    true
  );
  assert.strictEqual(buildOro9nDependencyChainFromOro9m()[DEPENDS_ON_ORO9M_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9mDependencyMissingFixture,
      "missing_oro9m_finalization_review_approval_record_finalization_review_approval_record_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewApprovalPresentButRecordMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationIssued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime_not_allowed_in_oro9n",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForLiveExecution_not_allowed_in_oro9n",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAppliedToRuntime_not_allowed_in_oro9n",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9n"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_approval_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_requires_no_runtime_finalization_review_approval_record_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9n"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9n"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9n"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9n"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9n"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9n"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9n"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9n"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary(input), blocker);
  }

  const allReports =
    fixtures.buildOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures().map(
      evaluateOro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary
    );
  assert.strictEqual(allReports.length, 20, "fixture set must cover ORO-9N cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9N finalization review approval record finalization review approval record finalization boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9N finalization review approval record finalization review approval record finalization boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}

