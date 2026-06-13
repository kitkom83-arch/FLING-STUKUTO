"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");

const {
  CLOSED_ORO9L_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9L_BOUNDARY_RESULT_KEY,
  ORO9L_NO_RUNTIME_PROOF_KEYS,
  ORO_9L_PHASE,
  ORO_9L_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9lDependencyChainFromOro9k,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult,
  buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary,
  buildOro9lSafetyFlags,
  evaluateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  runOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
  validateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9K = "docs/ORO_9K_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_9L = "docs/ORO_9L_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9lSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-9l";
const DETAIL_SCRIPT =
  "smoke:oro-9l-finalization-review-approval-record-finalization-review-approval-boundary";
const DEPENDS_ON_ORO9K_KEY =
  "dependsOnOro9kActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary";
const ORO9K_PASSED_KEY =
  "oro9kActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryPassed";
const VERIFIED_ORO9K_ONLY_KEY =
  "verifiedOro9kWasFinalizationReviewApprovalRecordFinalizationReviewBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary";
const ORO9K_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9k",
  "IssuedFromOro9k",
  "PassedFromOro9k",
  "RecordedFromOro9k",
]);
const ORO9L_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecorded",
]);
const ORO9L_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9L_ACTUAL_EXECUTION_FLAGS]),
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
  const doc9k = readRequired(DOC_9K);
  for (const marker of [
    "ORO-9L follows ORO-9K as the finalization review approval record finalization review approval boundary.",
    NEXT_PHASE_KEY,
    DOC_9L,
  ]) {
    assert(doc9k.includes(marker), `${DOC_9K} missing marker ${marker}.`);
  }

  const doc9l = readRequired(DOC_9L);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9K",
    "## Finalization review approval record finalization review approval boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval record boundary",
    "ORO-9L = finalization review approval record finalization review approval boundary only",
    ORO_9L_SCOPE,
    `${DEPENDS_ON_ORO9K_KEY} = true`,
    `${ORO9K_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9l.includes(marker), `${DOC_9L} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9l", DOC_9L]) {
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
        "## ORO-9L Finalization Review Approval Record Finalization Review Approval Boundary Mapping",
        "ORO-9L = finalization review approval record finalization review approval boundary only",
        ORO_9L_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9L Current",
        "ORO-9L = finalization review approval record finalization review approval boundary only",
        ORO_9L_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9L current/finalization review approval record finalization review approval boundary",
        "ORO-9L = finalization review approval record finalization review approval boundary only",
        "`smoke:oro-9l`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9L Finalization Review Approval Record Finalization Review Approval Boundary Coverage",
        "ORO-9L finalization-review-approval-record-finalization-review-approval-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9L].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9L files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9L]) {
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
    ORO9L_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9K_KEY,
    ORO9K_PASSED_KEY,
    "oro9kFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9k",
    "oro9kFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9k",
    VERIFIED_ORO9K_ONLY_KEY,
    ...ORO9K_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalScope",
    ...ORO9L_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
    ...ORO9L_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ...ORO9L_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9L_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9L_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9K_KEY], true);
  assert.strictEqual(summary[ORO9K_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9K_ONLY_KEY], true);
  for (const key of ORO9K_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalScope, ORO_9L_SCOPE);
  for (const key of ORO9L_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9L_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9L happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9L_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9L hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult, "function");
  assert.strictEqual(typeof validateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary, "function");
  assert.strictEqual(typeof buildOro9lSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9lDependencyChainFromOro9k, "function");
  assert.strictEqual(typeof buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryResult());
  assert.deepStrictEqual(
    validateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy),
    buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySummary(happy)
  );
  assert.deepStrictEqual(runOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(happy), happy);
  assert.strictEqual(buildOro9lSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9lSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalOccurred, true);
  assert.strictEqual(buildOro9lDependencyChainFromOro9k()[DEPENDS_ON_ORO9K_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9kDependencyMissingFixture,
      "missing_oro9k_finalization_review_approval_record_finalization_review_boundary_dependency",
    ],
    [
      fixtures.failFinalizationReviewPresentButApprovalMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalIssued_required",
    ],
    [
      fixtures.failFinalizationReviewApprovalAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime_not_allowed_in_oro9l",
    ],
    [
      fixtures.failFinalizationReviewApprovalAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForLiveExecution_not_allowed_in_oro9l",
    ],
    [
      fixtures.failFinalizationReviewApprovalAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalAppliedToRuntime_not_allowed_in_oro9l",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9l"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_requires_no_runtime_finalization_review_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9l"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9l"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9l"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9l"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9l"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9l"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9l"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9l"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary(input), blocker);
  }

  const allReports =
    fixtures.buildOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures().map(
      evaluateOro9lFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary
    );
  assert.strictEqual(allReports.length, 18, "fixture set must cover ORO-9L cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-9L finalization review approval record finalization review approval boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-9L finalization review approval record finalization review approval boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
