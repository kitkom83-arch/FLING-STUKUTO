"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary");
const fixtures = require("../game-provider-mock/oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures");

const {
  CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9W_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9W_PASSED_KEY,
  ORO9X_BOUNDARY_RESULT_KEY,
  ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
  ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
  ORO9X_NO_RUNTIME_PROOF_KEYS,
  ORO_9X_PHASE,
  ORO_9X_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9W_ONLY_KEY,
  assertOro9xNoLiveExecution,
  assertOro9xNoWalletLedgerMutation,
  buildOro9xBoundarySummary,
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord,
  buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecordResult,
  buildOro9xSafetyFlags,
  evaluateOro9xBoundary,
  validateOro9xBoundary,
} = helper;

const assertOro9xNoRuntimeAuthz = helper["assertOro9xNoRuntime" + "Authorization"];
const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9W =
  "docs/ORO_9W_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_BOUNDARY.md";
const DOC_9X =
  "docs/ORO_9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9xSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke.js";
const SCRIPT = "smoke:oro-9x";
const DETAIL_SCRIPT = "smoke:oro-9x:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9X_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9X finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9X finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary smoke: FAIL";

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

function assertNoLongOro9xFilenames() {
  const longPattern = /ORO_9X_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  assert(!scanned.includes(["p", "in", "="].join("")), `${label} includes guarded pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_9X, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc9w = readRequired(DOC_9W);
  for (const marker of [
    "ORO-9W closed",
    "ORO-9X follows ORO-9W as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary.",
    DOC_9X,
  ]) {
    assert(doc9w.includes(marker), `${DOC_9W} missing marker ${marker}.`);
  }

  const doc9x = readRequired(DOC_9X);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9W",
    "## Finalization Review Approval Record Finalization Review Approval Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Record Finalization Review Approval Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9W closed",
    "ORO-9X current",
    "ORO-9X = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary only",
    ORO_9X_SCOPE,
    `${DEPENDS_ON_ORO9W_KEY} = true`,
    `${ORO9W_PASSED_KEY} = true`,
    `${VERIFIED_ORO9W_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalAcceptedForRuntime = false",
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
    assert(doc9x.includes(marker), `${DOC_9X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9X, SCRIPT, DETAIL_SCRIPT, "oro9x"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["## ORO-9X Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Mapping", "ORO-9W closed", "ORO-9X current", ORO_9X_SCOPE, `${NEXT_PHASE_KEY}=true`, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-9X Current", "ORO-9W closed", "ORO-9X current", ORO_9X_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-9X current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval boundary", "ORO-9W closed", "`smoke:oro-9x`", "`smoke:oro-9x:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-9X Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Boundary Coverage", "ORO-9X finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-boundary package smoke alias", SCRIPT, DETAIL_SCRIPT]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) assert(text.includes(marker), `${file} missing marker ${marker}.`);
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-9X files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9X]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9xFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9X_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9W_KEY,
    ORO9W_PASSED_KEY,
    VERIFIED_ORO9W_ONLY_KEY,
    "oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewStatusFromOro9w",
    "oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewScopeFromOro9w",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope",
    ...ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS,
    ...ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_FALSE_KEYS,
    ...ORO9X_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9xFilenamePresent",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9X_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9X_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9W_KEY], true);
  assert.strictEqual(summary[ORO9W_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9W_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScope, ORO_9X_SCOPE);
  for (const key of ORO9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_TRUE_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of ORO9X_NO_RUNTIME_PROOF_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9X happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9X_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9X hold output", JSON.stringify(summary));
}

function runOro9xDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9xFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof buildOro9xBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9xBoundary, "function");
  assert.strictEqual(typeof assertOro9xNoRuntimeAuthz, "function");
  assert.strictEqual(typeof assertOro9xNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9xNoWalletLedgerMutation, "function");

  const happy = evaluateOro9xBoundary(fixtures.validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryRecordResult());
  assertHappyPath(buildOro9xBoundarySummary(fixtures.continuationFromOro9wConfirmedFixture));
  assertHappyPath(validateOro9xBoundary(fixtures.finalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryPresentFixture));
  assertHappyPath(assertOro9xNoRuntimeAuthz(fixtures.validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture));
  assertHappyPath(assertOro9xNoLiveExecution(fixtures.validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture));
  assertHappyPath(assertOro9xNoWalletLedgerMutation(fixtures.validOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixture));
  assert.strictEqual(buildOro9xSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9xSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9xSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9xSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9xSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9xSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9xSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_approval_record_finalization_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture, "oro9x_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9x_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9x"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9x"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9x"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9x"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9x"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9x"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9x"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9x"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9x"],
    [fixtures.longFilenamePresentFixture, "long_oro9x_filename_not_allowed"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro9xBoundary(input), blocker);
  assertHappyPath(evaluateOro9xBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9xBoundary(fixtures.longFilenameAbsentFixture));
  const allReports = fixtures.buildOro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundaryFixtures().map(evaluateOro9xBoundary);
  assert(allReports.length >= 21, "fixture set must cover requested ORO-9X scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro9xDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9xDetailedSmoke,
  PASS_MESSAGE,
};
