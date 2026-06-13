"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures");

const {
  CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9R_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9R_PASSED_KEY,
  ORO9S_BOUNDARY_RESULT_KEY,
  ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
  ORO9S_FINALIZATION_REVIEW_TRUE_KEYS,
  ORO9S_NO_RUNTIME_PROOF_KEYS,
  ORO_9S_PHASE,
  ORO_9S_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9R_ONLY_KEY,
  assertOro9sNoLiveExecution,
  assertOro9sNoWalletLedgerMutation,
  buildOro9sBoundarySummary,
  buildOro9sFinalizationReviewBoundaryRecord,
  buildOro9sFinalizationReviewBoundaryRecordResult,
  buildOro9sSafetyFlags,
  evaluateOro9sBoundary,
  validateOro9sBoundary,
} = helper;

const ASSERT_NO_RUNTIME_AUTH_EXPORT = ["assertOro9sNoRuntime", "Author", "ization"].join("");
const assertOro9sNoRuntimeAuth = helper[ASSERT_NO_RUNTIME_AUTH_EXPORT];

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9R =
  "docs/ORO_9R_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_9S =
  "docs/ORO_9S_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9sSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-9s";
const DETAIL_SCRIPT = "smoke:oro-9s:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9S_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9S finalization review approval record finalization review approval record finalization review approval record finalization review boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9S finalization review approval record finalization review approval record finalization review approval record finalization review boundary smoke: FAIL";

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

function assertNoLongOro9sFilenames() {
  const longPattern = /ORO_9S_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9S, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9r = readRequired(DOC_9R);
  for (const marker of [
    "ORO-9R closed",
    "ORO-9S follows ORO-9R as the finalization review approval record finalization review approval record finalization review approval record finalization review boundary.",
    DOC_9S,
  ]) {
    assert(doc9r.includes(marker), `${DOC_9R} missing marker ${marker}.`);
  }

  const doc9s = readRequired(DOC_9S);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9R",
    "## Finalization Review Boundary Definition",
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
    "ORO-9R closed",
    "ORO-9S current",
    "ORO-9S = finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
    ORO_9S_SCOPE,
    `${DEPENDS_ON_ORO9R_KEY} = true`,
    `${ORO9R_PASSED_KEY} = true`,
    `${VERIFIED_ORO9R_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime = false",
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
    assert(doc9s.includes(marker), `${DOC_9S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9S, SCRIPT, DETAIL_SCRIPT, "oro9s"]) {
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
        "## ORO-9S Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Mapping",
        "ORO-9R closed",
        "ORO-9S current",
        "ORO-9S = finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9S_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9S Current",
        "ORO-9R closed",
        "ORO-9S current",
        "ORO-9S = finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9S_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9S current/finalization review approval record finalization review approval record finalization review approval record finalization review boundary",
        "ORO-9R closed",
        "ORO-9S = finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        "`smoke:oro-9s`",
        "`smoke:oro-9s:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9S Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Coverage",
        "ORO-9S finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary package smoke alias",
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
  const text = [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9S].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!text.includes(marker), `ORO-9S files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9S]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9sFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9S_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9R_KEY,
    ORO9R_PASSED_KEY,
    VERIFIED_ORO9R_ONLY_KEY,
    "oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9r",
    "oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9r",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope",
    ...ORO9S_FINALIZATION_REVIEW_TRUE_KEYS,
    ...ORO9S_FINALIZATION_REVIEW_FALSE_KEYS,
    ...ORO9S_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9sFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9S_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9S_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9R_KEY], true);
  assert.strictEqual(summary[ORO9R_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9R_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope, ORO_9S_SCOPE);
  for (const key of ORO9S_FINALIZATION_REVIEW_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9S_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9S happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9S_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9S hold output", JSON.stringify(summary));
}

function runOro9sDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9sFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9sBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9sFinalizationReviewBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9sBoundary, "function");
  assert.strictEqual(typeof assertOro9sNoRuntimeAuth, "function");
  assert.strictEqual(typeof assertOro9sNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9sNoWalletLedgerMutation, "function");

  const happy = evaluateOro9sBoundary(fixtures.validOro9sFinalizationReviewBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9sFinalizationReviewBoundaryRecordResult());
  assertHappyPath(buildOro9sBoundarySummary(fixtures.continuationFromOro9rConfirmedFixture));
  assertHappyPath(validateOro9sBoundary(fixtures.finalizationReviewBoundaryPresentFixture));
  assertHappyPath(assertOro9sNoRuntimeAuth(fixtures.validOro9sFinalizationReviewBoundaryFixture));
  assertHappyPath(assertOro9sNoLiveExecution(fixtures.validOro9sFinalizationReviewBoundaryFixture));
  assertHappyPath(assertOro9sNoWalletLedgerMutation(fixtures.validOro9sFinalizationReviewBoundaryFixture));

  assert.strictEqual(buildOro9sSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9sSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9sSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9sSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9sSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9sSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9sSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9s_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9s_requires_no_runtime_finalization_review_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "actualExternalCallExecutionLiveExecutionApproved_not_allowed_in_oro9s"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9s"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9s"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9s"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9s"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9s"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9s"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9s"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9s"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9s"],
    [fixtures.longFilenamePresentFixture, "long_oro9s_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9sBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9sBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9sBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9sFinalizationReviewBoundaryFixtures().map(evaluateOro9sBoundary);
  assert(allReports.length >= 16, "fixture set must cover requested ORO-9S scenarios.");
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
    runOro9sDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9sDetailedSmoke,
  PASS_MESSAGE,
};
