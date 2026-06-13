"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");

const {
  CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9P_BOUNDARY_RESULT_KEY,
  ORO9P_NO_RUNTIME_PROOF_KEYS,
  ORO_9P_PHASE,
  ORO_9P_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9pDependencyChainFromOro9o,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
  buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
  buildOro9pSafetyFlags,
  evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9O =
  "docs/ORO_9O_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_9P =
  "docs/ORO_9P_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9pSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-9p";
const DETAIL_SCRIPT =
  "smoke:oro-9p-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary";
const DEPENDS_ON_ORO9O_KEY =
  "dependsOnOro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9O_PASSED_KEY =
  "oro9oActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9O_ONLY_KEY =
  "verifiedOro9oWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9O_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9o",
  "IssuedFromOro9o",
  "PassedFromOro9o",
  "RecordedFromOro9o",
]);
const ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9P_ACTUAL_EXECUTION_FLAGS]),
]);
const LONG_ORO9P_FILE_PATTERNS = Object.freeze([
  "docs/ORO_9P_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION*",
  "src/game-provider-mock/oro9pLiveTrafficActualExternalCallExecution*",
  "src/local-smoke-tests/oro9pLiveTrafficActualExternalCallExecution*",
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

function assertNoLongOro9pFilenames() {
  for (const pattern of LONG_ORO9P_FILE_PATTERNS) {
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
  const doc9o = readRequired(DOC_9O);
  for (const marker of [
    "ORO-9P follows ORO-9O as the finalization review approval record finalization review approval record finalization review approval boundary.",
    NEXT_PHASE_KEY,
    DOC_9P,
  ]) {
    assert(doc9o.includes(marker), `${DOC_9O} missing marker ${marker}.`);
  }

  const doc9p = readRequired(DOC_9P);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9O",
    "## Finalization review approval record finalization review approval record finalization review approval boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No runtime finalization review approval record",
    "## No runtime finalization review approval record finalization",
    "## No runtime finalization review approval record finalization review",
    "## No runtime finalization review approval record finalization review approval",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval record boundary",
    "ORO-9P = finalization review approval record finalization review approval record finalization review approval boundary only",
    ORO_9P_SCOPE,
    `${DEPENDS_ON_ORO9O_KEY} = true`,
    `${ORO9O_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9p.includes(marker), `${DOC_9P} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9p", DOC_9P]) {
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
        "## ORO-9P Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Mapping",
        "ORO-9P = finalization review approval record finalization review approval record finalization review approval boundary only",
        ORO_9P_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9P Current",
        "ORO-9P = finalization review approval record finalization review approval record finalization review approval boundary only",
        ORO_9P_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9P current/finalization review approval record finalization review approval record finalization review approval boundary",
        "ORO-9P = finalization review approval record finalization review approval record finalization review approval boundary only",
        "`smoke:oro-9p`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9P Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Coverage",
        "ORO-9P finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9P].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9P files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9P]) {
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
    ORO9P_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9O_KEY,
    ORO9O_PASSED_KEY,
    "oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9o",
    "oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9o",
    VERIFIED_ORO9O_ONLY_KEY,
    ...ORO9O_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
    ...ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
    ...ORO9P_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ...ORO9P_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9P_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9P_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9O_KEY], true);
  assert.strictEqual(summary[ORO9O_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9O_ONLY_KEY], true);
  for (const key of ORO9O_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope, ORO_9P_SCOPE);
  for (const key of ORO9P_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9P_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9P happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9P_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9P hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(typeof validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary, "function");
  assert.strictEqual(typeof buildOro9pSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9pDependencyChainFromOro9o, "function");
  assert.strictEqual(
    typeof buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9pFilenames();
  assertStaticSafety();

  const happy = evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult());
  assert.deepStrictEqual(
    validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy),
    validateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy)
  );
  assert.deepStrictEqual(
    runOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy),
    buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(happy)
  );
  assert.strictEqual(buildOro9pSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9pSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred, true);
  assert.strictEqual(
    buildOro9pSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred,
    true
  );
  assert.strictEqual(buildOro9pDependencyChainFromOro9o()[DEPENDS_ON_ORO9O_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9oDependencyMissingFixture,
      "missing_oro9o_finalization_review_approval_record_finalization_review_approval_record_finalization_review_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewPresentButApprovalMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalIssued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime_not_allowed_in_oro9p",
    ],
    [
      fixtures.failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution_not_allowed_in_oro9p",
    ],
    [
      fixtures.failFinalizationReviewApprovalAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime_not_allowed_in_oro9p",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9p"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9p"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9p"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9p"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9p"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9p"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9p"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9p"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9p"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures().map(
      evaluateOro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary
    );
  assert.strictEqual(allReports.length, 23, "fixture set must cover ORO-9P cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9P finalization review approval record finalization review approval record finalization review approval boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9P finalization review approval record finalization review approval record finalization review approval boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
