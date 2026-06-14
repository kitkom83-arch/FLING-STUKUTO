"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");
const fixtures = require("../game-provider-mock/oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures");

const {
  CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9X_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9X_PASSED_KEY,
  ORO9Y_BOUNDARY_RESULT_KEY,
  ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9Y_NO_RUNTIME_PROOF_KEYS,
  ORO_9Y_PHASE,
  ORO_9Y_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9X_ONLY_KEY,
  assertOro9yNoLiveExecution,
  assertOro9yNoWalletLedgerMutation,
  buildOro9yBoundarySummary,
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord,
  buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult,
  buildOro9ySafetyFlags,
  evaluateOro9yBoundary,
  validateOro9yBoundary,
} = helper;

const assertOro9yNoRuntimeAuthz = helper["assertOro9yNoRuntime" + "Author" + "ization"];
const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9X =
  "docs/ORO_9X_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const DOC_9Y =
  "docs/ORO_9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9ySmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-9y";
const DETAIL_SCRIPT = "smoke:oro-9y:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9Y_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9Y finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9Y finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary smoke: FAIL";

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

function assertNoLongOro9yFilenames() {
  const longPattern = /ORO_9Y_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9Y, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc9x = readRequired(DOC_9X);
  for (const marker of [
    "ORO-9X closed",
    "ORO-9Y follows ORO-9X as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary.",
    DOC_9Y,
  ]) {
    assert(doc9x.includes(marker), `${DOC_9X} missing marker ${marker}.`);
  }

  const doc9y = readRequired(DOC_9Y);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9X",
    "## Finalization Review Approval Record Finalization Review Approval Record Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Record Finalization Review Approval Record Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9X closed",
    "ORO-9Y current",
    "ORO-9Y = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary only",
    ORO_9Y_SCOPE,
    `${DEPENDS_ON_ORO9X_KEY} = true`,
    `${ORO9X_PASSED_KEY} = true`,
    `${VERIFIED_ORO9X_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime = false",
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
    assert(doc9y.includes(marker), `${DOC_9Y} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9Y, SCRIPT, DETAIL_SCRIPT, "oro9y"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["## ORO-9Y Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Mapping", "ORO-9X closed", "ORO-9Y current", ORO_9Y_SCOPE, `${NEXT_PHASE_KEY}=true`, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-9Y Current", "ORO-9X closed", "ORO-9Y current", ORO_9Y_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-9Y current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary", "ORO-9X closed", "`smoke:oro-9y`", "`smoke:oro-9y:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-9Y Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Coverage", "ORO-9Y finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-boundary package smoke alias", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-9Y files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9Y]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9yFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9Y_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9X_KEY,
    ORO9X_PASSED_KEY,
    VERIFIED_ORO9X_ONLY_KEY,
    "oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9x",
    "oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9x",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
    ...ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9Y_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9yFilenamePresent",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9Y_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9Y_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9X_KEY], true);
  assert.strictEqual(summary[ORO9X_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9X_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope, ORO_9Y_SCOPE);
  for (const key of ORO9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of ORO9Y_NO_RUNTIME_PROOF_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9Y happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9Y_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9Y hold output", JSON.stringify(summary));
}

function runOro9yDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9yFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof buildOro9yBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9yBoundary, "function");
  assert.strictEqual(typeof assertOro9yNoRuntimeAuthz, "function");
  assert.strictEqual(typeof assertOro9yNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9yNoWalletLedgerMutation, "function");

  const happy = evaluateOro9yBoundary(fixtures.validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryRecordResult());
  assertHappyPath(buildOro9yBoundarySummary(fixtures.continuationFromOro9xConfirmedFixture));
  assertHappyPath(validateOro9yBoundary(fixtures.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryPresentFixture));
  assertHappyPath(assertOro9yNoRuntimeAuthz(fixtures.validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture));
  assertHappyPath(assertOro9yNoLiveExecution(fixtures.validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture));
  assertHappyPath(assertOro9yNoWalletLedgerMutation(fixtures.validOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixture));
  assert.strictEqual(buildOro9ySafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9ySafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9ySafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9ySafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9ySafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9ySafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9ySafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_record_finalization_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9y_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9y_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9y"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9y"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9y"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9y"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9y"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9y"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9y"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9y"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9y"],
    [fixtures.longFilenamePresentFixture, "long_oro9y_filename_not_allowed"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro9yBoundary(input), blocker);
  assertHappyPath(evaluateOro9yBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9yBoundary(fixtures.longFilenameAbsentFixture));
  const allReports = fixtures.buildOro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures().map(evaluateOro9yBoundary);
  assert(allReports.length >= 22, "fixture set must cover requested ORO-9Y scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro9yDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9yDetailedSmoke,
  PASS_MESSAGE,
};
