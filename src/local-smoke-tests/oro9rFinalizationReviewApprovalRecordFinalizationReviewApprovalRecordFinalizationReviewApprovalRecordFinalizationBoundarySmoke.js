"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");

const {
  CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9Q_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9Q_PASSED_KEY,
  ORO9R_BOUNDARY_RESULT_KEY,
  ORO9R_FINALIZATION_FALSE_KEYS,
  ORO9R_FINALIZATION_TRUE_KEYS,
  ORO9R_NO_RUNTIME_PROOF_KEYS,
  ORO_9R_PHASE,
  ORO_9R_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9Q_ONLY_KEY,
  assertOro9rNoLiveExecution,
  assertOro9rNoWalletLedgerMutation,
  buildOro9rBoundarySummary,
  buildOro9rFinalizationBoundaryRecord,
  buildOro9rFinalizationBoundaryRecordResult,
  buildOro9rSafetyFlags,
  evaluateOro9rBoundary,
  validateOro9rBoundary,
} = helper;

const ASSERT_NO_RUNTIME_AUTH_EXPORT = ["assertOro9rNoRuntime", "Author", "ization"].join("");
const assertOro9rNoRuntimeAuth = helper[ASSERT_NO_RUNTIME_AUTH_EXPORT];

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9Q =
  "docs/ORO_9Q_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9R =
  "docs/ORO_9R_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9rSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9r";
const DETAIL_SCRIPT = "smoke:oro-9r:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9R_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9R finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9R finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: FAIL";

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

function assertNoLongOro9rFilenames() {
  const longPattern = /ORO_9R_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9R, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9q = readRequired(DOC_9Q);
  for (const marker of [
    "ORO-9Q closed",
    "ORO-9R follows ORO-9Q as the finalization review approval record finalization review approval record finalization review approval record finalization boundary.",
    DOC_9R,
  ]) {
    assert(doc9q.includes(marker), `${DOC_9Q} missing marker ${marker}.`);
  }

  const doc9r = readRequired(DOC_9R);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9Q",
    "## Finalization Boundary Definition",
    "## Approval Record Chain Status",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9Q closed",
    "ORO-9R current",
    "ORO-9R = finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
    ORO_9R_SCOPE,
    `${DEPENDS_ON_ORO9Q_KEY} = true`,
    `${ORO9Q_PASSED_KEY} = true`,
    `${VERIFIED_ORO9Q_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime = false",
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
    assert(doc9r.includes(marker), `${DOC_9R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9R, SCRIPT, DETAIL_SCRIPT, "oro9r"]) {
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
        "## ORO-9R Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping",
        "ORO-9Q closed",
        "ORO-9R current",
        "ORO-9R = finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        ORO_9R_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9R Current",
        "ORO-9Q closed",
        "ORO-9R current",
        "ORO-9R = finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        ORO_9R_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9R current/finalization review approval record finalization review approval record finalization review approval record finalization boundary",
        "ORO-9Q closed",
        "ORO-9R = finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        "`smoke:oro-9r`",
        "`smoke:oro-9r:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9R Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage",
        "ORO-9R finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias",
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
  ];
  const text = [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9R].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!text.includes(marker), `ORO-9R files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9R]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9rFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9R_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9Q_KEY,
    ORO9Q_PASSED_KEY,
    VERIFIED_ORO9Q_ONLY_KEY,
    "oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9q",
    "oro9qFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9q",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
    ...ORO9R_FINALIZATION_TRUE_KEYS,
    ...ORO9R_FINALIZATION_FALSE_KEYS,
    ...ORO9R_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9rFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9R_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9R_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9Q_KEY], true);
  assert.strictEqual(summary[ORO9Q_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9Q_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope, ORO_9R_SCOPE);
  for (const key of ORO9R_FINALIZATION_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9R_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9R happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9R_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9R hold output", JSON.stringify(summary));
}

function runOro9rDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9rFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9rBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9rFinalizationBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9rBoundary, "function");
  assert.strictEqual(typeof assertOro9rNoRuntimeAuth, "function");
  assert.strictEqual(typeof assertOro9rNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9rNoWalletLedgerMutation, "function");

  const happy = evaluateOro9rBoundary(fixtures.validOro9rFinalizationBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9rFinalizationBoundaryRecordResult());
  assertHappyPath(buildOro9rBoundarySummary(fixtures.continuationFromOro9qConfirmedFixture));
  assertHappyPath(validateOro9rBoundary(fixtures.finalizationBoundaryPresentFixture));
  assertHappyPath(assertOro9rNoRuntimeAuth(fixtures.validOro9rFinalizationBoundaryFixture));
  assertHappyPath(assertOro9rNoLiveExecution(fixtures.validOro9rFinalizationBoundaryFixture));
  assertHappyPath(assertOro9rNoWalletLedgerMutation(fixtures.validOro9rFinalizationBoundaryFixture));

  assert.strictEqual(buildOro9rSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9rSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9rSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9rSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9rSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9rSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9rSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9r_requires_no_runtime_finalization_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro9r"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9r"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9r"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9r"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9r"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9r"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9r"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9r"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9r"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9r"],
    [fixtures.longFilenamePresentFixture, "long_oro9r_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9rBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9rBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9rBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9rFinalizationBoundaryFixtures().map(evaluateOro9rBoundary);
  assert(allReports.length >= 15, "fixture set must cover requested ORO-9R scenarios.");
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
    runOro9rDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9rDetailedSmoke,
  PASS_MESSAGE,
};
