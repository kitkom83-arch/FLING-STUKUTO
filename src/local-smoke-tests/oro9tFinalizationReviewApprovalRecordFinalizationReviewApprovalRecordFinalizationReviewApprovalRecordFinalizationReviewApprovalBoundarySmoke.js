"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");

const {
  CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9S_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9S_PASSED_KEY,
  ORO9T_BOUNDARY_RESULT_KEY,
  ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
  ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
  ORO9T_NO_RUNTIME_PROOF_KEYS,
  ORO_9T_PHASE,
  ORO_9T_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9S_ONLY_KEY,
  assertOro9tNoLiveExecution,
  assertOro9tNoRuntimeAuthorization,
  assertOro9tNoWalletLedgerMutation,
  buildOro9tBoundarySummary,
  buildOro9tFinalizationReviewApprovalBoundaryRecord,
  buildOro9tFinalizationReviewApprovalBoundaryRecordResult,
  buildOro9tSafetyFlags,
  evaluateOro9tBoundary,
  validateOro9tBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9S =
  "docs/ORO_9S_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_9T =
  "docs/ORO_9T_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9tSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-9t";
const DETAIL_SCRIPT = "smoke:oro-9t:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9T_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9T finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9T finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary smoke: FAIL";

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

function assertNoLongOro9tFilenames() {
  const longPattern = /ORO_9T_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const marker of guardedMarkers) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  }
  for (const marker of [["p", "in", "="].join("")]) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
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
  for (const file of [DOC_9T, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9s = readRequired(DOC_9S);
  for (const marker of [
    "ORO-9S closed",
    "ORO-9T follows ORO-9S as the finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary.",
    DOC_9T,
  ]) {
    assert(doc9s.includes(marker), `${DOC_9S} missing marker ${marker}.`);
  }

  const doc9t = readRequired(DOC_9T);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9S",
    "## Finalization Review Approval Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9S closed",
    "ORO-9T current",
    "ORO-9T = finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary only",
    ORO_9T_SCOPE,
    `${DEPENDS_ON_ORO9S_KEY} = true`,
    `${ORO9S_PASSED_KEY} = true`,
    `${VERIFIED_ORO9S_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
    "verifiedNoExternalNetworkOccurred = true",
    "verifiedNoLiveOroPlayApiCallOccurred = true",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "prismaWriteAllowed = false",
    "dbTransactionAllowed = false",
    "migrationAllowed = false",
    "deployAllowed = false",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9t.includes(marker), `${DOC_9T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9T, SCRIPT, DETAIL_SCRIPT, "oro9t"]) {
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
        "## ORO-9T Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Mapping",
        "ORO-9S closed",
        "ORO-9T current",
        "ORO-9T = finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary only",
        ORO_9T_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9T Current",
        "ORO-9S closed",
        "ORO-9T current",
        "ORO-9T = finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary only",
        ORO_9T_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9T current/finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary",
        "ORO-9S closed",
        "ORO-9T = finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary only",
        "`smoke:oro-9t`",
        "`smoke:oro-9t:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9T Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Coverage",
        "ORO-9T finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary package smoke alias",
        SCRIPT,
        DETAIL_SCRIPT,
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
  for (const marker of unsafeRuntimePatterns) {
    assert(!text.includes(marker), `ORO-9T files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9T]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9tFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9T_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9S_KEY,
    ORO9S_PASSED_KEY,
    VERIFIED_ORO9S_ONLY_KEY,
    "oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9s",
    "oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9s",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
    ...ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
    ...ORO9T_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ...ORO9T_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9tFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9T_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9T_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9S_KEY], true);
  assert.strictEqual(summary[ORO9S_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9S_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope, ORO_9T_SCOPE);
  for (const key of ORO9T_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9T_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9T happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9T_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9T hold output", JSON.stringify(summary));
}

function runOro9tDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9tFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9tBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9tFinalizationReviewApprovalBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9tBoundary, "function");
  assert.strictEqual(typeof assertOro9tNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof assertOro9tNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9tNoWalletLedgerMutation, "function");

  const happy = evaluateOro9tBoundary(fixtures.validOro9tFinalizationReviewApprovalBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9tFinalizationReviewApprovalBoundaryRecordResult());
  assertHappyPath(buildOro9tBoundarySummary(fixtures.continuationFromOro9sConfirmedFixture));
  assertHappyPath(validateOro9tBoundary(fixtures.finalizationReviewApprovalBoundaryPresentFixture));
  assertHappyPath(assertOro9tNoRuntimeAuthorization(fixtures.validOro9tFinalizationReviewApprovalBoundaryFixture));
  assertHappyPath(assertOro9tNoLiveExecution(fixtures.validOro9tFinalizationReviewApprovalBoundaryFixture));
  assertHappyPath(assertOro9tNoWalletLedgerMutation(fixtures.validOro9tFinalizationReviewApprovalBoundaryFixture));

  assert.strictEqual(buildOro9tSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9tSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9tSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9tSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9tSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9tSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9tSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9t_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9t_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9t_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9t_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9t"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9t"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9t"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9t"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9t"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9t"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9t"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9t"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9t"],
    [fixtures.longFilenamePresentFixture, "long_oro9t_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9tBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9tBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9tBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9tFinalizationReviewApprovalBoundaryFixtures().map(evaluateOro9tBoundary);
  assert(allReports.length >= 17, "fixture set must cover requested ORO-9T scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  if (options.print !== false) {
    console.log(PASS_MESSAGE);
  }
}

if (require.main === module) {
  try {
    runOro9tDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9tDetailedSmoke,
  PASS_MESSAGE,
};
