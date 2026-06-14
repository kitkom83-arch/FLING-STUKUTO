"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10dApprovalChainRolloverReviewRequestBoundary");
const fixtures = require("../game-provider-mock/oro10dApprovalChainRolloverReviewRequestBoundaryFixtures");

const {
  DEPENDS_ON_ORO10C_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10C_PASSED_KEY,
  ORO10D_PHASE,
  ORO10D_RESULT_KEY,
  ORO10D_SCOPE,
  ORO10D_STATUS,
  ORO10D_REVIEW_DECISION_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10C_ONLY_KEY,
  buildOro10dReviewRequestBoundaryRecord,
  buildOro10dReviewRequestBoundaryRecordResult,
  buildOro10dSafetySummary,
  evaluateOro10dReviewRequestBoundary,
  validateOro10dReviewRequestBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10C = "docs/ORO_10C_APPROVAL_CHAIN_ROLLOVER_EVIDENCE_GATE.md";
const DOC_10D = "docs/ORO_10D_APPROVAL_CHAIN_ROLLOVER_REVIEW_REQUEST_BOUNDARY.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10dApprovalChainRolloverReviewRequestBoundary.js";
const FIXTURES = "src/game-provider-mock/oro10dApprovalChainRolloverReviewRequestBoundaryFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10dApprovalChainRolloverReviewRequestBoundarySmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10dSmoke.js";
const SCRIPT = "smoke:oro-10d";
const DETAIL_SCRIPT = "smoke:oro-10d:detailed";
const PASS_MESSAGE = "ORO-10D approval chain rollover review request boundary smoke: PASS";
const FAIL_MESSAGE = "ORO-10D approval chain rollover review request boundary smoke: FAIL";

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

function assertNoLongOro10dFilenames() {
  const longPattern = /ORO_10D_.*(FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW|REQUEST_REQUEST|APPROVAL_APPROVAL)/;
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
  const uppercasePinMarker = ["P", "I", "N"].join("");
  assert(!new RegExp(`\\b${uppercasePinMarker}\\s*[:=]`).test(scanned), `${label} includes guarded uppercase pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10D, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10d = readRequired(DOC_10D);
  for (const marker of [
    "# ORO-10D Approval Chain Rollover Review Request Boundary",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D current.",
    "review request boundary only",
    "ORO-10D is not review decision.",
    "ORO-10D is not signed approval.",
    "ORO-10D is not runtime approval.",
    "ORO-10D is not runtime approval chain rollover.",
    "predecessor ORO-10C present = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_review_decision",
    "no_signed_approval",
    "no_live_execution",
    "no_actual_external_call",
    "no_live_oroplay_api_call",
    "no_route_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_db_runtime_flow",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    ORO10D_SCOPE,
    ORO10D_STATUS,
    ORO10D_REVIEW_DECISION_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10d.includes(marker), `${DOC_10D} missing marker ${marker}.`);
  }

  const doc10c = readRequired(DOC_10C);
  for (const marker of [
    "ORO-10C closed.",
    "ORO-10D current.",
    DOC_10D,
    "nextPhaseSeparateReviewDecisionRequired = true",
    "ORO-10D next phase = approval_chain_rollover_review_request_boundary_only",
  ]) {
    assert(doc10c.includes(marker), `${DOC_10C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10D, SCRIPT, DETAIL_SCRIPT, "oro10d"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [API_MAP_FILE, ["## ORO-10D Approval Chain Rollover Review Request Boundary Mapping", "ORO-10C closed.", "ORO-10D current.", ORO10D_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10D Current", "ORO-10C closed.", "ORO-10D current.", ORO10D_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10D current/approval chain rollover review request boundary", "ORO-10C closed.", "`smoke:oro-10d`", "`smoke:oro-10d:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10D Approval Chain Rollover Review Request Boundary Coverage", "ORO-10C closed; ORO-10D current.", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10D files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10D]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10D_RESULT_KEY,
    DEPENDS_ON_ORO10C_KEY,
    ORO10C_PASSED_KEY,
    VERIFIED_ORO10C_ONLY_KEY,
    "dependsOnOro10aApprovalChainRolloverBoundary",
    "dependsOnOro10bApprovalChainRolloverContinuityGate",
    "oro10cStatus",
    "oro10cScope",
    "oro10cClosed",
    "reviewRequestStatus",
    "reviewRequestScope",
    "reviewDecisionStatus",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateReviewDecision",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10D_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10D_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10C_KEY], true);
  assert.strictEqual(summary[ORO10C_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10C_ONLY_KEY], true);
  assert.strictEqual(summary.oro10cClosed, true);
  assert.strictEqual(summary.reviewRequestScope, ORO10D_SCOPE);
  assert.strictEqual(summary.reviewRequestStatus, ORO10D_STATUS);
  assert.strictEqual(summary.reviewDecisionStatus, ORO10D_REVIEW_DECISION_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateReviewDecision, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10D happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10D_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10D hold output", JSON.stringify(summary));
}

function runOro10dDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10dFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10D_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10D_STATUS, "string");
  assert.strictEqual(typeof buildOro10dReviewRequestBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro10dReviewRequestBoundary, "function");
  assert.strictEqual(typeof buildOro10dSafetySummary, "function");

  const happy = evaluateOro10dReviewRequestBoundary(fixtures.validReviewRequestBoundaryFromOro10cFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10dReviewRequestBoundaryRecordResult());
  assertHappyPath(validateOro10dReviewRequestBoundary(buildOro10dReviewRequestBoundaryRecord()));
  const safety = buildOro10dSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10cPredecessorFailFixture, "missing_oro10c_predecessor"],
    [fixtures.missingReviewRequestFailFixture, "approvalChainRolloverReviewRequestBoundaryPresent_required"],
    [fixtures.reviewDecisionBlockedFixture, "review_decision_status_must_remain_pending"],
    [fixtures.signedApprovalBlockedFixture, "verifiedNoSignedApprovalOccurred_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalBlockedFixture, "verifiedNoRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicCallbackAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.walletMutationBlockedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationBlockedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.dbRuntimeFlowBlockedFixture, "verifiedNoDbRuntimeFlowOccurred_required"],
    [fixtures.prismaWriteBlockedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionBlockedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationBlockedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployBlockedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretLikeValueBlockedFixture, "verifiedNoSecretLikeValuePresent_required"],
    [fixtures.longFilenameBlockedFixture, "noLongFilenameConfirmed_required"],
    [fixtures.missingSeparateReviewDecisionBlockedFixture, "next_phase_separate_review_decision_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10dReviewRequestBoundary(input), blocker);
  const allReports = fixtures.buildOro10dApprovalChainRolloverReviewRequestBoundaryFixtures().map(evaluateOro10dReviewRequestBoundary);
  assert(allReports.length >= 22, "fixture set must cover requested ORO-10D scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10dDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10dDetailedSmoke,
  PASS_MESSAGE,
};
