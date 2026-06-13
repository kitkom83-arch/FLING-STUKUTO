"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures");

const {
  CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9K_BOUNDARY_RESULT_KEY,
  ORO9K_NO_RUNTIME_PROOF_KEYS,
  ORO_9K_PHASE,
  ORO_9K_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9kDependencyChainFromOro9j,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult,
  buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
  buildOro9kSafetyFlags,
  evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  runOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9J = "docs/ORO_9J_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_9K = "docs/ORO_9K_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9kSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9kFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-9k";
const DETAIL_SCRIPT =
  "smoke:oro-9k-finalization-review-approval-record-finalization-review-boundary";
const DEPENDS_ON_ORO9J_KEY =
  "dependsOnOro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9J_PASSED_KEY =
  "oro9jActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9J_ONLY_KEY =
  "verifiedOro9jWasFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9J_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9j",
  "IssuedFromOro9j",
  "PassedFromOro9j",
  "RecordedFromOro9j",
]);
const ORO9K_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9K_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9K_ACTUAL_EXECUTION_FLAGS]),
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
  const doc9j = readRequired(DOC_9J);
  for (const marker of [
    "ORO-9K follows ORO-9J as the finalization review approval record finalization review boundary.",
    NEXT_PHASE_KEY,
    DOC_9K,
  ]) {
    assert(doc9j.includes(marker), `${DOC_9J} missing marker ${marker}.`);
  }

  const doc9k = readRequired(DOC_9K);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9J",
    "## Finalization review approval record finalization review boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval boundary",
    "ORO-9K = finalization review approval record finalization review boundary only",
    ORO_9K_SCOPE,
    `${DEPENDS_ON_ORO9J_KEY} = true`,
    `${ORO9J_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9k.includes(marker), `${DOC_9K} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9k", DOC_9K]) {
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
        "## ORO-9K Finalization Review Approval Record Finalization Review Boundary Mapping",
        "ORO-9K = finalization review approval record finalization review boundary only",
        ORO_9K_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9K Current",
        "ORO-9K = finalization review approval record finalization review boundary only",
        ORO_9K_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9K current/finalization review approval record finalization review boundary",
        "ORO-9K = finalization review approval record finalization review boundary only",
        "`smoke:oro-9k`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9K Finalization Review Approval Record Finalization Review Boundary Coverage",
        "ORO-9K finalization-review-approval-record-finalization-review-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9K].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9K files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9K]) {
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
    ORO9K_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9J_KEY,
    ORO9J_PASSED_KEY,
    "oro9jFinalizationReviewApprovalRecordFinalizationStatusFromOro9j",
    "oro9jFinalizationReviewApprovalRecordFinalizationScopeFromOro9j",
    VERIFIED_ORO9J_ONLY_KEY,
    ...ORO9J_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewStatus",
    "finalizationReviewApprovalRecordFinalizationReviewScope",
    ...ORO9K_FINALIZATION_REVIEW_TRUE_KEYS,
    ...ORO9K_FINALIZATION_REVIEW_FALSE_KEYS,
    ...ORO9K_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9K_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9K_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9J_KEY], true);
  assert.strictEqual(summary[ORO9J_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9J_ONLY_KEY], true);
  for (const key of ORO9J_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewScope, ORO_9K_SCOPE);
  for (const key of ORO9K_FINALIZATION_REVIEW_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9K_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9K happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9K_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9K hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult, "function");
  assert.strictEqual(typeof validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary, "function");
  assert.strictEqual(typeof buildOro9kSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9kDependencyChainFromOro9j, "function");
  assert.strictEqual(typeof buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult());
  assert.deepStrictEqual(
    validateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(happy),
    buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(happy)
  );
  assert.deepStrictEqual(runOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(happy), happy);
  assert.strictEqual(buildOro9kSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9kSafetyFlags().verifiedNoRuntimeFinalizationReviewOccurred, true);
  assert.strictEqual(buildOro9kDependencyChainFromOro9j()[DEPENDS_ON_ORO9J_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9jDependencyMissingFixture,
      "missing_oro9j_finalization_review_approval_record_finalization_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewApprovalRecordFinalizationPresentButFinalizationReviewMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewIssued_required",
    ],
    [
      fixtures.failFinalizationReviewAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime_not_allowed_in_oro9k",
    ],
    [
      fixtures.failFinalizationReviewAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution_not_allowed_in_oro9k",
    ],
    [
      fixtures.failFinalizationReviewAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime_not_allowed_in_oro9k",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9k"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9k"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9k"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9k"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9k"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9k"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9k"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9k"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9k"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary(input), blocker);
  }

  const allReports =
    fixtures.buildOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures().map(
      evaluateOro9kFinalizationReviewApprovalRecordFinalizationReviewBoundary
    );
  assert.strictEqual(allReports.length, 17, "fixture set must cover ORO-9K cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-9K finalization review approval record finalization review boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-9K finalization review approval record finalization review boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
