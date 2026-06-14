"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary");
const fixtures = require("../game-provider-mock/oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures");

const {
  CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9V_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9V_PASSED_KEY,
  ORO9W_BOUNDARY_RESULT_KEY,
  ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS,
  ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS,
  ORO9W_NO_RUNTIME_PROOF_KEYS,
  ORO_9W_PHASE,
  ORO_9W_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9V_ONLY_KEY,
  assertOro9wNoLiveExecution,
  assertOro9wNoWalletLedgerMutation,
  buildOro9wBoundarySummary,
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord,
  buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecordResult,
  buildOro9wSafetyFlags,
  evaluateOro9wBoundary,
  validateOro9wBoundary,
} = helper;

const assertOro9wNoRuntimeAuthz = helper["assertOro9wNoRuntime" + "Authorization"];
const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9V =
  "docs/ORO_9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_9W =
  "docs/ORO_9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9wSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke.js";
const SCRIPT = "smoke:oro-9w";
const DETAIL_SCRIPT = "smoke:oro-9w:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9W_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9W finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9W finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary smoke: FAIL";

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

function assertNoLongOro9wFilenames() {
  const longPattern = /ORO_9W_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9W, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9v = readRequired(DOC_9V);
  for (const marker of [
    "ORO-9V closed",
    "ORO-9W follows ORO-9V as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary.",
    DOC_9W,
  ]) {
    assert(doc9v.includes(marker), `${DOC_9V} missing marker ${marker}.`);
  }

  const doc9w = readRequired(DOC_9W);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9V",
    "## Finalization Review Approval Record Finalization Review Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Record Finalization Review Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9V closed",
    "ORO-9W current",
    "ORO-9W = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
    ORO_9W_SCOPE,
    `${DEPENDS_ON_ORO9V_KEY} = true`,
    `${ORO9V_PASSED_KEY} = true`,
    `${VERIFIED_ORO9V_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewAcceptedForRuntime = false",
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
    assert(doc9w.includes(marker), `${DOC_9W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9W, SCRIPT, DETAIL_SCRIPT, "oro9w"]) {
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
        "## ORO-9W Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Mapping",
        "ORO-9V closed",
        "ORO-9W current",
        "ORO-9W = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9W_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9W Current",
        "ORO-9V closed",
        "ORO-9W current",
        "ORO-9W = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        ORO_9W_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9W current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary",
        "ORO-9V closed",
        "ORO-9W = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review boundary only",
        "`smoke:oro-9w`",
        "`smoke:oro-9w:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9W Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Boundary Coverage",
        "ORO-9W finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-boundary package smoke alias",
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
    assert(!text.includes(marker), `ORO-9W files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9W]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9wFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9W_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9V_KEY,
    ORO9V_PASSED_KEY,
    VERIFIED_ORO9V_ONLY_KEY,
    "oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatusFromOro9v",
    "oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScopeFromOro9v",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope",
    ...ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS,
    ...ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_FALSE_KEYS,
    ...ORO9W_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9wFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9W_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9W_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9V_KEY], true);
  assert.strictEqual(summary[ORO9V_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9V_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScope, ORO_9W_SCOPE);
  for (const key of ORO9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9W_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9W happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9W_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9W hold output", JSON.stringify(summary));
}

function runOro9wDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9wFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9wBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9wBoundary, "function");
  assert.strictEqual(typeof assertOro9wNoRuntimeAuthz, "function");
  assert.strictEqual(typeof assertOro9wNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9wNoWalletLedgerMutation, "function");

  const happy = evaluateOro9wBoundary(fixtures.validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryRecordResult());
  assertHappyPath(buildOro9wBoundarySummary(fixtures.continuationFromOro9vConfirmedFixture));
  assertHappyPath(validateOro9wBoundary(fixtures.finalizationReviewApprovalRecordFinalizationReviewBoundaryPresentFixture));
  assertHappyPath(assertOro9wNoRuntimeAuthz(fixtures.validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture));
  assertHappyPath(assertOro9wNoLiveExecution(fixtures.validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture));
  assertHappyPath(assertOro9wNoWalletLedgerMutation(fixtures.validOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixture));

  assert.strictEqual(buildOro9wSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9wSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9wSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9wSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9wSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9wSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9wSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_review_approval_record_finalization_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture, "oro9w_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9w_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9w"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9w"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9w"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9w"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9w"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9w"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9w"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9w"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9w"],
    [fixtures.longFilenamePresentFixture, "long_oro9w_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9wBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9wBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9wBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9wFinalizationReviewApprovalRecordFinalizationReviewBoundaryFixtures().map(evaluateOro9wBoundary);
  assert(allReports.length >= 20, "fixture set must cover requested ORO-9W scenarios.");
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
    runOro9wDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9wDetailedSmoke,
  PASS_MESSAGE,
};
