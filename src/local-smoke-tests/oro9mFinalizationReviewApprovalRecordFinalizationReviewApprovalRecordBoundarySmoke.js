"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");
const fixtures = require("../game-provider-mock/oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures");

const {
  CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9M_BOUNDARY_RESULT_KEY,
  ORO9M_NO_RUNTIME_PROOF_KEYS,
  ORO_9M_PHASE,
  ORO_9M_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9mDependencyChainFromOro9l,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
  buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
  buildOro9mSafetyFlags,
  evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  runOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9L = "docs/ORO_9L_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const DOC_9M = "docs/ORO_9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9mSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-9m";
const DETAIL_SCRIPT =
  "smoke:oro-9m-finalization-review-approval-record-finalization-review-approval-record-boundary";
const DEPENDS_ON_ORO9L_KEY =
  "dependsOnOro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9L_PASSED_KEY =
  "oro9lActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9L_ONLY_KEY =
  "verifiedOro9lWasFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9L_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9l",
  "IssuedFromOro9l",
  "PassedFromOro9l",
  "RecordedFromOro9l",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9M_ACTUAL_EXECUTION_FLAGS]),
]);
const LONG_ORO9M_FILE_PATTERNS = Object.freeze([
  "docs/ORO_9M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION*",
  "src/game-provider-mock/oro9mLiveTrafficActualExternalCallExecution*",
  "src/local-smoke-tests/oro9mLiveTrafficActualExternalCallExecution*",
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

function assertNoLongOro9mFilenames() {
  for (const pattern of LONG_ORO9M_FILE_PATTERNS) {
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
  const doc9l = readRequired(DOC_9L);
  for (const marker of [
    "ORO-9M follows ORO-9L as the finalization review approval record finalization review approval record boundary.",
    NEXT_PHASE_KEY,
    DOC_9M,
  ]) {
    assert(doc9l.includes(marker), `${DOC_9L} missing marker ${marker}.`);
  }

  const doc9m = readRequired(DOC_9M);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9L",
    "## Finalization review approval record finalization review approval record boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No runtime finalization review approval record",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval record finalization boundary",
    "ORO-9M = finalization review approval record finalization review approval record boundary only",
    ORO_9M_SCOPE,
    `${DEPENDS_ON_ORO9L_KEY} = true`,
    `${ORO9L_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9m.includes(marker), `${DOC_9M} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9m", DOC_9M]) {
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
        "## ORO-9M Finalization Review Approval Record Finalization Review Approval Record Boundary Mapping",
        "ORO-9M = finalization review approval record finalization review approval record boundary only",
        ORO_9M_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9M Current",
        "ORO-9M = finalization review approval record finalization review approval record boundary only",
        ORO_9M_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9M current/finalization review approval record finalization review approval record boundary",
        "ORO-9M = finalization review approval record finalization review approval record boundary only",
        "`smoke:oro-9m`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9M Finalization Review Approval Record Finalization Review Approval Record Boundary Coverage",
        "ORO-9M finalization-review-approval-record-finalization-review-approval-record-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9M].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9M files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9M]) {
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
    ORO9M_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9L_KEY,
    ORO9L_PASSED_KEY,
    "oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9l",
    "oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9l",
    VERIFIED_ORO9L_ONLY_KEY,
    ...ORO9L_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
    ...ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9M_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9M_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9M_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9L_KEY], true);
  assert.strictEqual(summary[ORO9L_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9L_ONLY_KEY], true);
  for (const key of ORO9L_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope, ORO_9M_SCOPE);
  for (const key of ORO9M_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9M_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9M happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9M_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9M hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro9mSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9mDependencyChainFromOro9l, "function");
  assert.strictEqual(
    typeof buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9mFilenames();
  assertStaticSafety();

  const happy = evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult());
  assert.deepStrictEqual(
    validateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(happy),
    buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(happy)
  );
  assert.deepStrictEqual(runOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(happy), happy);
  assert.strictEqual(buildOro9mSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9mSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordOccurred, true);
  assert.strictEqual(buildOro9mDependencyChainFromOro9l()[DEPENDS_ON_ORO9L_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9lDependencyMissingFixture,
      "missing_oro9l_finalization_review_approval_record_finalization_review_approval_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewApprovalPresentButRecordMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime_not_allowed_in_oro9m",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution_not_allowed_in_oro9m",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime_not_allowed_in_oro9m",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9m"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9m"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9m"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9m"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9m"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9m"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9m"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9m"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9m"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input), blocker);
  }

  const allReports =
    fixtures.buildOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures().map(
      evaluateOro9mFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary
    );
  assert.strictEqual(allReports.length, 19, "fixture set must cover ORO-9M cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9M finalization review approval record finalization review approval record boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9M finalization review approval record finalization review approval record boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
