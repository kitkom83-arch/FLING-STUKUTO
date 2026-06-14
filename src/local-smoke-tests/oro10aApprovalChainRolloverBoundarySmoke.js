"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10aApprovalChainRolloverBoundary");
const fixtures = require("../game-provider-mock/oro10aApprovalChainRolloverBoundaryFixtures");

const {
  DEPENDS_ON_ORO9Z_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10A_BOUNDARY_RESULT_KEY,
  ORO9Z_PASSED_KEY,
  ORO_10A_PHASE,
  ORO_10A_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO9Z_CLOSED_KEY,
  assertOro10aNoLiveExecution,
  assertOro10aNoWalletLedgerMutation,
  buildOro10aApprovalChainRolloverRecord,
  buildOro10aApprovalChainRolloverRecordResult,
  buildOro10aBoundarySummary,
  buildOro10aSafetyFlags,
  evaluateOro10aBoundary,
  validateOro10aBoundary,
} = helper;

const assertOro10aNoRuntimeAuthz = helper["assertOro10aNoRuntime" + "Author" + "ization"];
const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9Z =
  "docs/ORO_9Z_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const DOC_10A = "docs/ORO_10A_APPROVAL_CHAIN_ROLLOVER_BOUNDARY.md";
const BOUNDARY = "src/game-provider-mock/oro10aApprovalChainRolloverBoundary.js";
const FIXTURES = "src/game-provider-mock/oro10aApprovalChainRolloverBoundaryFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10aApprovalChainRolloverBoundarySmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10aSmoke.js";
const SCRIPT = "smoke:oro-10a";
const DETAIL_SCRIPT = "smoke:oro-10a:detailed";
const PASS_MESSAGE = "ORO-10A approval chain rollover boundary smoke: PASS";
const FAIL_MESSAGE = "ORO-10A approval chain rollover boundary smoke: FAIL";

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

function assertNoLongOro10aFilenames() {
  const longPattern = /ORO_10A_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_10A, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10a = readRequired(DOC_10A);
  for (const marker of [
    "# ORO-10A Approval Chain Rollover Boundary",
    "ORO-9Z closed.",
    "ORO-10A current.",
    "ORO-10A starts the ORO-10 series",
    "approval chain rollover boundary only",
    "verifiedNoLiveExecutionOccurred = true",
    "verifiedNoLiveOroPlayApiCallOccurred = true",
    "verifiedNoRouteAliasOccurred = true",
    "verifiedNoRuntimeMountOccurred = true",
    "verifiedNoWalletMutationOccurred = true",
    "verifiedNoLedgerMutationOccurred = true",
    "verifiedNoPrismaWriteOccurred = true",
    "verifiedNoDbTransactionOccurred = true",
    "verifiedNoMigrationOccurred = true",
    "verifiedNoDeployOccurred = true",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10a.includes(marker), `${DOC_10A} missing marker ${marker}.`);
  }

  const doc9z = readRequired(DOC_9Z);
  for (const marker of [
    "ORO-9Z closed.",
    "ORO-10A current.",
    DOC_10A,
    "nextPhaseRequiresSeparateApprovalChainRolloverReview = true",
  ]) {
    assert(doc9z.includes(marker), `${DOC_9Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10A, SCRIPT, DETAIL_SCRIPT, "oro10a"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["## ORO-10A Approval Chain Rollover Boundary Mapping", "ORO-9Z closed.", "ORO-10A current.", ORO_10A_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10A Current", "ORO-9Z closed.", "ORO-10A current.", ORO_10A_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10A current/approval chain rollover boundary", "ORO-9Z closed.", "`smoke:oro-10a`", "`smoke:oro-10a:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10A Approval Chain Rollover Boundary Coverage", "ORO-9Z closed; ORO-10A current.", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10A files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10A]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10A_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9Z_KEY,
    ORO9Z_PASSED_KEY,
    VERIFIED_ORO9Z_CLOSED_KEY,
    "oro9zStatus",
    "oro9zScope",
    "oro9zClosed",
    "approvalChainRolloverStatus",
    "approvalChainRolloverScope",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForRuntimeRollover",
    "separateRuntimeApprovalRequired",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_10A_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10A_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9Z_KEY], true);
  assert.strictEqual(summary[ORO9Z_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9Z_CLOSED_KEY], true);
  assert.strictEqual(summary.approvalChainRolloverScope, ORO_10A_SCOPE);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForRuntimeRollover, true);
  assert.strictEqual(summary.separateRuntimeApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10A happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10A_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10A hold output", JSON.stringify(summary));
}

function runOro10aDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10aFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof buildOro10aBoundarySummary, "function");
  assert.strictEqual(typeof buildOro10aApprovalChainRolloverRecord, "function");
  assert.strictEqual(typeof validateOro10aBoundary, "function");
  assert.strictEqual(typeof assertOro10aNoRuntimeAuthz, "function");
  assert.strictEqual(typeof assertOro10aNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro10aNoWalletLedgerMutation, "function");

  const happy = evaluateOro10aBoundary(fixtures.validOro10aApprovalChainRolloverBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10aApprovalChainRolloverRecordResult());
  assertHappyPath(buildOro10aBoundarySummary(fixtures.continuationFromOro9zConfirmedFixture));
  assertHappyPath(validateOro10aBoundary(fixtures.oro9SeriesClosureAcknowledgedFixture));
  assertHappyPath(validateOro10aBoundary(fixtures.oro10SeriesStartAcknowledgedFixture));
  assertHappyPath(validateOro10aBoundary(fixtures.approvalChainRolloverBoundaryPresentFixture));
  assertHappyPath(assertOro10aNoRuntimeAuthz(fixtures.validOro10aApprovalChainRolloverBoundaryFixture));
  assertHappyPath(assertOro10aNoLiveExecution(fixtures.validOro10aApprovalChainRolloverBoundaryFixture));
  assertHappyPath(assertOro10aNoWalletLedgerMutation(fixtures.validOro10aApprovalChainRolloverBoundaryFixture));
  assert.strictEqual(buildOro10aSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro10aSafetyFlags().runtimeMountAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro10aSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeApprovalChainRolloverNotAuthorizedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.liveExecutionNotAuthorizedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "verifiedNoLiveOroPlayApiCallOccurred_required"],
    [fixtures.routeAliasNotAuthorizedFixture, "verifiedNoRouteAliasOccurred_required"],
    [fixtures.runtimeMountNotAuthorizedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.walletMutationNotAuthorizedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.prismaWriteNotAuthorizedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionNotAuthorizedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationNotAuthorizedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployNotAuthorizedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretShapedValuesPresentFixture, "verifiedNoHardcodedCredentialMaterial_required"],
    [fixtures.longFilenamePresentFixture, "verifiedShortOro10aFilenamesOnly_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10aBoundary(input), blocker);
  assertHappyPath(evaluateOro10aBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro10aBoundary(fixtures.longFilenameAbsentFixture));
  const allReports = fixtures.buildOro10aApprovalChainRolloverBoundaryFixtures().map(evaluateOro10aBoundary);
  assert(allReports.length >= 18, "fixture set must cover requested ORO-10A scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10aDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10aDetailedSmoke,
  PASS_MESSAGE,
};
