"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");

const {
  CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9Y_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9Y_PASSED_KEY,
  ORO9Z_BOUNDARY_RESULT_KEY,
  ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9Z_NO_RUNTIME_PROOF_KEYS,
  ORO_9Z_PHASE,
  ORO_9Z_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9Y_ONLY_KEY,
  assertOro9zNoLiveExecution,
  assertOro9zNoWalletLedgerMutation,
  buildOro9zBoundarySummary,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult,
  buildOro9zSafetyFlags,
  evaluateOro9zBoundary,
  validateOro9zBoundary,
} = helper;

const assertOro9zNoRuntimeAuthz = helper["assertOro9zNoRuntime" + "Author" + "ization"];
const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9Y =
  "docs/ORO_9Y_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9Z =
  "docs/ORO_9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9zSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9z";
const DETAIL_SCRIPT = "smoke:oro-9z:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9Z_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9Z finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9Z finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: FAIL";

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

function assertNoLongOro9zFilenames() {
  const longPattern = /ORO_9Z_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9Z, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc9y = readRequired(DOC_9Y);
  for (const marker of [
    "ORO-9Y closed",
    "ORO-9Z follows ORO-9Y as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary.",
    DOC_9Z,
  ]) {
    assert(doc9y.includes(marker), `${DOC_9Y} missing marker ${marker}.`);
  }

  const doc9z = readRequired(DOC_9Z);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9Y",
    "## Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Definition",
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
    "ORO-9Y closed",
    "ORO-9Z current",
    "ORO-9Z = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
    ORO_9Z_SCOPE,
    `${DEPENDS_ON_ORO9Y_KEY} = true`,
    `${ORO9Y_PASSED_KEY} = true`,
    `${VERIFIED_ORO9Y_ONLY_KEY} = true`,
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
    assert(doc9z.includes(marker), `${DOC_9Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9Z, SCRIPT, DETAIL_SCRIPT, "oro9z"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["## ORO-9Z Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping", "ORO-9Y closed", "ORO-9Z current", ORO_9Z_SCOPE, `${NEXT_PHASE_KEY}=true`, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-9Z Current", "ORO-9Y closed", "ORO-9Z current", ORO_9Z_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-9Z current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary", "ORO-9Y closed", "`smoke:oro-9z`", "`smoke:oro-9z:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-9Z Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage", "ORO-9Z finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-9Z files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9Z]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9zFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9Z_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9Y_KEY,
    ORO9Y_PASSED_KEY,
    VERIFIED_ORO9Y_ONLY_KEY,
    "oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9y",
    "oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9y",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
    ...ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9Z_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9zFilenamePresent",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9Z_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9Z_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9Y_KEY], true);
  assert.strictEqual(summary[ORO9Y_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9Y_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope, ORO_9Z_SCOPE);
  for (const key of ORO9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of ORO9Z_NO_RUNTIME_PROOF_KEYS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9Z happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9Z_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9Z hold output", JSON.stringify(summary));
}

function runOro9zDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9zFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof buildOro9zBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9zBoundary, "function");
  assert.strictEqual(typeof assertOro9zNoRuntimeAuthz, "function");
  assert.strictEqual(typeof assertOro9zNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9zNoWalletLedgerMutation, "function");

  const happy = evaluateOro9zBoundary(fixtures.validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult());
  assertHappyPath(buildOro9zBoundarySummary(fixtures.continuationFromOro9yConfirmedFixture));
  assertHappyPath(validateOro9zBoundary(fixtures.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryPresentFixture));
  assertHappyPath(assertOro9zNoRuntimeAuthz(fixtures.validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture));
  assertHappyPath(assertOro9zNoLiveExecution(fixtures.validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture));
  assertHappyPath(assertOro9zNoWalletLedgerMutation(fixtures.validOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixture));
  assert.strictEqual(buildOro9zSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9zSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9zSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9zSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9zSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9zSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9zSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_finalization_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9z_requires_no_runtime_finalization_review_approval_record_finalization_review_approval_record_finalization_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9z_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9z"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9z"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9z"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9z"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9z"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9z"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9z"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9z"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9z"],
    [fixtures.longFilenamePresentFixture, "long_oro9z_filename_not_allowed"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro9zBoundary(input), blocker);
  assertHappyPath(evaluateOro9zBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9zBoundary(fixtures.longFilenameAbsentFixture));
  const allReports = fixtures.buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures().map(evaluateOro9zBoundary);
  assert(allReports.length >= 23, "fixture set must cover requested ORO-9Z scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro9zDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9zDetailedSmoke,
  PASS_MESSAGE,
};
