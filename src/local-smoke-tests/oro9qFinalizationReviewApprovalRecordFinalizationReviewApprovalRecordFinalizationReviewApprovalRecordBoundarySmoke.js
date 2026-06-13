"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");
const fixtures = require("../game-provider-mock/oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures");

const {
  CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9Q_BOUNDARY_RESULT_KEY,
  ORO9Q_NO_RUNTIME_PROOF_KEYS,
  ORO_9Q_PHASE,
  ORO_9Q_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9qDependencyChainFromOro9p,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
  buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary,
  buildOro9qSafetyFlags,
  evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  runOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
  validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9P =
  "docs/ORO_9P_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const DOC_9Q =
  "docs/ORO_9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9qSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-9q";
const DETAIL_SCRIPT =
  "smoke:oro-9q-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-boundary";
const DEPENDS_ON_ORO9P_KEY =
  "dependsOnOro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9P_PASSED_KEY =
  "oro9pActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPassed";
const VERIFIED_ORO9P_ONLY_KEY =
  "verifiedOro9pWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9P_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9p",
  "IssuedFromOro9p",
  "PassedFromOro9p",
  "RecordedFromOro9p",
]);
const ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded",
]);
const ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9Q_ACTUAL_EXECUTION_FLAGS]),
]);
const LONG_ORO9Q_FILE_PATTERNS = Object.freeze([
  "docs/ORO_9Q_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION*",
  "src/game-provider-mock/oro9qLiveTrafficActualExternalCallExecution*",
  "src/local-smoke-tests/oro9qLiveTrafficActualExternalCallExecution*",
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

function assertNoLongOro9qFilenames() {
  for (const pattern of LONG_ORO9Q_FILE_PATTERNS) {
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
  const doc9p = readRequired(DOC_9P);
  for (const marker of [
    "ORO-9Q follows ORO-9P as the finalization review approval record finalization review approval record finalization review approval record boundary.",
    NEXT_PHASE_KEY,
    DOC_9Q,
  ]) {
    assert(doc9p.includes(marker), `${DOC_9P} missing marker ${marker}.`);
  }

  const doc9q = readRequired(DOC_9Q);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9P",
    "## Finalization review approval record finalization review approval record finalization review approval record boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime activation",
    "## No runtime enablement",
    "## No runtime authorization",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No runtime finalization review approval record",
    "## No runtime finalization review approval record finalization",
    "## No runtime finalization review approval record finalization review",
    "## No runtime finalization review approval record finalization review approval",
    "## No runtime finalization review approval record finalization review approval record",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval record finalization boundary",
    "ORO-9Q = finalization review approval record finalization review approval record finalization review approval record boundary only",
    ORO_9Q_SCOPE,
    `${DEPENDS_ON_ORO9P_KEY} = true`,
    `${ORO9P_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9q.includes(marker), `${DOC_9Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9q", DOC_9Q]) {
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
        "## ORO-9Q Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Mapping",
        "ORO-9Q = finalization review approval record finalization review approval record finalization review approval record boundary only",
        ORO_9Q_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9Q Current",
        "ORO-9Q = finalization review approval record finalization review approval record finalization review approval record boundary only",
        ORO_9Q_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9Q current/finalization review approval record finalization review approval record finalization review approval record boundary",
        "ORO-9Q = finalization review approval record finalization review approval record finalization review approval record boundary only",
        "`smoke:oro-9q`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9Q Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Coverage",
        "ORO-9Q finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9Q].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9Q files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9Q]) {
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
    ORO9Q_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9P_KEY,
    ORO9P_PASSED_KEY,
    "oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9p",
    "oro9pFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9p",
    VERIFIED_ORO9P_ONLY_KEY,
    ...ORO9P_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
    ...ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9Q_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9Q_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9Q_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9P_KEY], true);
  assert.strictEqual(summary[ORO9P_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9P_ONLY_KEY], true);
  for (const key of ORO9P_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope, ORO_9Q_SCOPE);
  for (const key of ORO9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9Q_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9Q happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9Q_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9Q hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro9qSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9qDependencyChainFromOro9p, "function");
  assert.strictEqual(
    typeof buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9qFilenames();
  assertStaticSafety();

  const happy = evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(
    buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryResult()
  );
  assert.deepStrictEqual(
    validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy),
    validateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(happy)
  );
  assert.deepStrictEqual(
    runOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(happy),
    buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySummary(happy)
  );
  assert.strictEqual(buildOro9qSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(
    buildOro9qSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalOccurred,
    true
  );
  assert.strictEqual(
    buildOro9qSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordOccurred,
    true
  );
  assert.strictEqual(buildOro9qDependencyChainFromOro9p()[DEPENDS_ON_ORO9P_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9pDependencyMissingFixture,
      "missing_oro9p_finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewApprovalPresentButApprovalRecordMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordIssued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime_not_allowed_in_oro9q",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForLiveExecution_not_allowed_in_oro9q",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAppliedToRuntime_not_allowed_in_oro9q",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9q"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_approval_record_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9q"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9q"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9q"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9q"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9q"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9q"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9q"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9q"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary(input),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures().map(
      evaluateOro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary
    );
  assert.strictEqual(allReports.length, 24, "fixture set must cover ORO-9Q cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9Q finalization review approval record finalization review approval record finalization review approval record boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9Q finalization review approval record finalization review approval record finalization review approval record boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
