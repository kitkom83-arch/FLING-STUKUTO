"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures");

const {
  CLOSED_ORO9O_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  HOLD,
  ORO9O_BOUNDARY_RESULT_KEY,
  ORO9O_NO_RUNTIME_PROOF_KEYS,
  ORO_9O_PHASE,
  ORO_9O_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  buildOro9oDependencyChainFromOro9n,
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult,
  buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary,
  buildOro9oSafetyFlags,
  evaluateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  runOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
  validateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9N =
  "docs/ORO_9N_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_9O =
  "docs/ORO_9O_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9oSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-9o";
const DETAIL_SCRIPT =
  "smoke:oro-9o-finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary";
const DEPENDS_ON_ORO9N_KEY =
  "dependsOnOro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9N_PASSED_KEY =
  "oro9nActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9N_ONLY_KEY =
  "verifiedOro9nWasFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryOnly";
const NEXT_PHASE_KEY =
  "nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary";
const ORO9N_DEPENDENCY_KEYS = Object.freeze([
  "PreparedFromOro9n",
  "IssuedFromOro9n",
  "PassedFromOro9n",
  "RecordedFromOro9n",
]);
const ORO9O_FINALIZATION_REVIEW_TRUE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded",
]);
const ORO9O_FINALIZATION_REVIEW_FALSE_KEYS = Object.freeze([
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized",
  "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized",
]);
const SEPARATE_REQUIREMENT_KEYS = Object.freeze([
  "humanApprovalRequiredForActualExecution",
  "separateActualExecutionApprovalRequired",
]);
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9O_ACTUAL_EXECUTION_FLAGS]),
]);
const LONG_ORO9O_FILE_PATTERNS = Object.freeze([
  "docs/ORO_9O_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION*",
  "src/game-provider-mock/oro9oLiveTrafficActualExternalCallExecution*",
  "src/local-smoke-tests/oro9oLiveTrafficActualExternalCallExecution*",
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

function assertNoLongOro9oFilenames() {
  for (const pattern of LONG_ORO9O_FILE_PATTERNS) {
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
  const doc9n = readRequired(DOC_9N);
  for (const marker of [
    "ORO-9O follows ORO-9N as the finalization review approval record finalization review approval record finalization review boundary.",
    NEXT_PHASE_KEY,
    DOC_9O,
  ]) {
    assert(doc9n.includes(marker), `${DOC_9N} missing marker ${marker}.`);
  }

  const doc9o = readRequired(DOC_9O);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-9N",
    "## Finalization review approval record finalization review approval record finalization review boundary only",
    "## No actual execution",
    "## No live execution",
    "## No runtime acceptance",
    "## No runtime finalization",
    "## No runtime finalization review",
    "## No runtime finalization review approval",
    "## No runtime finalization review approval record",
    "## No runtime finalization review approval record finalization",
    "## No runtime finalization review approval record finalization review",
    "## No wallet or ledger mutation",
    "## No external network",
    "## No live OroPlay call",
    "## No route alias",
    "## No migration or deploy",
    "## Safety false flag table",
    "## Validation checklist",
    "## Next phase requires separate finalization review approval boundary",
    "ORO-9O = finalization review approval record finalization review approval record finalization review boundary only",
    ORO_9O_SCOPE,
    `${DEPENDS_ON_ORO9N_KEY} = true`,
    `${ORO9N_PASSED_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPassed = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRecorded = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedRuntimeMutation = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAuthorizedLiveExecution = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewRuntimeFinalized = false",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewLiveExecutionFinalized = false",
    "verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred = true",
    `${NEXT_PHASE_KEY} = true`,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9o.includes(marker), `${DOC_9O} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, DETAIL_SCRIPT, "oro9o", DOC_9O]) {
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
        "## ORO-9O Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Mapping",
        "ORO-9O = finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9O_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9O Current",
        "ORO-9O = finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9O_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9O current/finalization review approval record finalization review approval record finalization review boundary",
        "ORO-9O = finalization review approval record finalization review approval record finalization review boundary only",
        "`smoke:oro-9o`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9O Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Coverage",
        "ORO-9O finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_9O].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-9O files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9O]) {
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
    ORO9O_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9N_KEY,
    ORO9N_PASSED_KEY,
    "oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9n",
    "oro9nFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9n",
    VERIFIED_ORO9N_ONLY_KEY,
    ...ORO9N_DEPENDENCY_KEYS,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope",
    ...ORO9O_FINALIZATION_REVIEW_TRUE_KEYS,
    ...ORO9O_FINALIZATION_REVIEW_FALSE_KEYS,
    ...ORO9O_NO_RUNTIME_PROOF_KEYS,
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
  assert.strictEqual(summary.phase, ORO_9O_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9O_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathActualLiveExecutionFinalExecutionCompletionRecordReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture"
  );
  assert.strictEqual(summary[DEPENDS_ON_ORO9N_KEY], true);
  assert.strictEqual(summary[ORO9N_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9N_ONLY_KEY], true);
  for (const key of ORO9N_DEPENDENCY_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope, ORO_9O_SCOPE);
  for (const key of ORO9O_FINALIZATION_REVIEW_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9O_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  for (const key of SEPARATE_REQUIREMENT_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9O happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9O_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9O hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult,
    "function"
  );
  assert.strictEqual(
    typeof validateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro9oSafetyFlags, "function");
  assert.strictEqual(typeof buildOro9oDependencyChainFromOro9n, "function");
  assert.strictEqual(
    typeof buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9oFilenames();
  assertStaticSafety();

  const happy = evaluateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(
    fixtures.happyPathFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture
  );
  assertHappyPath(happy);
  assertHappyPath(buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryResult());
  assert.deepStrictEqual(
    validateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(happy),
    buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySummary(happy)
  );
  assert.deepStrictEqual(runOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(happy), happy);
  assert.strictEqual(buildOro9oSafetyFlags().actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(buildOro9oSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationOccurred, true);
  assert.strictEqual(buildOro9oSafetyFlags().verifiedNoRuntimeFinalizationReviewApprovalRecordFinalizationReviewOccurred, true);
  assert.strictEqual(buildOro9oDependencyChainFromOro9n()[DEPENDS_ON_ORO9N_KEY], true);

  const heldCases = [
    [
      fixtures.failOro9nDependencyMissingFixture,
      "missing_oro9n_finalization_review_approval_record_finalization_review_approval_record_finalization_boundary_dependency",
    ],
    [
      fixtures.failFinalizationPresentButFinalizationReviewMissingFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewIssued_required",
    ],
    [
      fixtures.failFinalizationReviewAcceptedForRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime_not_allowed_in_oro9o",
    ],
    [
      fixtures.failFinalizationReviewAcceptedForLiveExecutionFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForLiveExecution_not_allowed_in_oro9o",
    ],
    [
      fixtures.failFinalizationReviewAppliedToRuntimeFixture,
      "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAppliedToRuntime_not_allowed_in_oro9o",
    ],
    [fixtures.failActualExecutionAttemptedFixture, "actualExternalCallExecutionLiveExecuted_not_allowed_in_oro9o"],
    [
      fixtures.failRuntimeAcceptanceAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_acceptance_proof",
    ],
    [
      fixtures.failRuntimeFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_review_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_review_approval_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_review_approval_record_proof",
    ],
    [
      fixtures.failRuntimeFinalizationReviewApprovalRecordFinalizationAttemptedFixture,
      "finalization_review_approval_record_finalization_review_approval_record_finalization_review_requires_no_runtime_finalization_review_approval_record_finalization_proof",
    ],
    [fixtures.failLiveOroPlayApiCallAttemptedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9o"],
    [fixtures.failExternalNetworkAttemptedFixture, "externalNetworkAllowed_not_allowed_in_oro9o"],
    [fixtures.failWalletMutationAttemptedFixture, "walletMutationAllowed_not_allowed_in_oro9o"],
    [fixtures.failLedgerMutationAttemptedFixture, "ledgerMutationAllowed_not_allowed_in_oro9o"],
    [fixtures.failPrismaOrDbMutationAttemptedFixture, "prismaWriteAllowed_not_allowed_in_oro9o"],
    [fixtures.failRouteAliasAttemptedFixture, "routeEnablementAllowed_not_allowed_in_oro9o"],
    [fixtures.failDeployMigrationAttemptedFixture, "deployAllowed_not_allowed_in_oro9o"],
    [fixtures.failSensitiveShapedFixture, "sensitive_output_not_allowed_in_oro9o"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary(input),
      blocker
    );
  }

  const allReports =
    fixtures.buildOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures().map(
      evaluateOro9oFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary
    );
  assert.strictEqual(allReports.length, 21, "fixture set must cover ORO-9O cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-9O finalization review approval record finalization review approval record finalization review boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-9O finalization review approval record finalization review approval record finalization review boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
