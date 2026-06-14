"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10eApprovalChainRolloverReviewRequestSubmissionGate");
const fixtures = require("../game-provider-mock/oro10eApprovalChainRolloverReviewRequestSubmissionGateFixtures");

const {
  DEPENDS_ON_ORO10D_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10D_PASSED_KEY,
  ORO10E_PHASE,
  ORO10E_RESULT_KEY,
  ORO10E_SCOPE,
  ORO10E_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10D_ONLY_KEY,
  buildOro10eReviewRequestSubmissionGateRecord,
  buildOro10eReviewRequestSubmissionGateRecordResult,
  buildOro10eSafetySummary,
  evaluateOro10eReviewRequestSubmissionGate,
  validateOro10eReviewRequestSubmissionGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10D = "docs/ORO_10D_APPROVAL_CHAIN_ROLLOVER_REVIEW_REQUEST_BOUNDARY.md";
const DOC_10E = "docs/ORO_10E_APPROVAL_CHAIN_ROLLOVER_REVIEW_REQUEST_SUBMISSION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10eApprovalChainRolloverReviewRequestSubmissionGate.js";
const FIXTURES = "src/game-provider-mock/oro10eApprovalChainRolloverReviewRequestSubmissionGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10eApprovalChainRolloverReviewRequestSubmissionGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10eSmoke.js";
const SCRIPT = "smoke:oro-10e";
const DETAIL_SCRIPT = "smoke:oro-10e:detailed";
const REVIEW_DECISION_PENDING = "pending_separate_review_decision";
const PASS_MESSAGE = "ORO-10E approval chain rollover review request submission gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10E approval chain rollover review request submission gate smoke: FAIL";

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

function assertNoLongOro10eFilenames() {
  const longPattern =
    /ORO_10E_.*(APPROVAL_CHAIN_ROLLOVER_REVIEW_REQUEST_SUBMISSION_GATE_FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW|REQUEST_REQUEST|SUBMISSION_SUBMISSION)/;
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
  for (const file of [DOC_10E, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10e = readRequired(DOC_10E);
  for (const marker of [
    "# ORO-10E Approval Chain Rollover Review Request Submission Gate",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D closed.",
    "ORO-10E current.",
    "review request submission gate only",
    "review request submission is a static/mock record only",
    "ORO-10E is not review decision.",
    "ORO-10E is not signed approval.",
    "ORO-10E is not runtime approval.",
    "ORO-10E is not runtime approval chain rollover.",
    "predecessor ORO-10D present = true",
    "ORO-10C evidence gate present = true",
    "ORO-10D review request boundary present = true",
    "review request prepared only in ORO-10D = true",
    "review request submitted as static/mock record only in ORO-10E = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_review_decision",
    "no_runtime_review_submission",
    "static_mock_review_request_submission_only",
    "no_signed_runtime_approval",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_route_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    ORO10E_SCOPE,
    ORO10E_STATUS,
    REVIEW_DECISION_PENDING,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10e.includes(marker), `${DOC_10E} missing marker ${marker}.`);
  }

  const doc10d = readRequired(DOC_10D);
  for (const marker of [
    "ORO-10D closed.",
    "ORO-10E current.",
    DOC_10E,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10E next phase = approval_chain_rollover_review_request_submission_gate_only",
  ]) {
    assert(doc10d.includes(marker), `${DOC_10D} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10E, SCRIPT, DETAIL_SCRIPT, "oro10e"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [API_MAP_FILE, ["## ORO-10E Approval Chain Rollover Review Request Submission Gate Mapping", "ORO-10D closed.", "ORO-10E current.", ORO10E_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10E Current", "ORO-10D closed.", "ORO-10E current.", ORO10E_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10E current/approval chain rollover review request submission gate", "ORO-10D closed.", "`smoke:oro-10e`", "`smoke:oro-10e:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10E Approval Chain Rollover Review Request Submission Gate Coverage", "ORO-10D closed; ORO-10E current.", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10E files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10E]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10E_RESULT_KEY,
    DEPENDS_ON_ORO10D_KEY,
    ORO10D_PASSED_KEY,
    VERIFIED_ORO10D_ONLY_KEY,
    "dependsOnOro10aApprovalChainRolloverBoundary",
    "dependsOnOro10bApprovalChainRolloverContinuityGate",
    "dependsOnOro10cApprovalChainRolloverEvidenceGate",
    "oro10cEvidenceGatePresent",
    "oro10dStatus",
    "oro10dScope",
    "oro10dClosed",
    "reviewRequestSubmissionGateStatus",
    "reviewRequestSubmissionGateScope",
    "reviewDecisionStatus",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateApproval",
    "nextStepRequiresSeparateReviewDecision",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10E_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10E_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10D_KEY], true);
  assert.strictEqual(summary[ORO10D_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10D_ONLY_KEY], true);
  assert.strictEqual(summary.oro10cEvidenceGatePresent, true);
  assert.strictEqual(summary.oro10dClosed, true);
  assert.strictEqual(summary.reviewRequestSubmissionGateScope, ORO10E_SCOPE);
  assert.strictEqual(summary.reviewRequestSubmissionGateStatus, ORO10E_STATUS);
  assert.strictEqual(summary.reviewDecisionStatus, REVIEW_DECISION_PENDING);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateReviewDecision, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10E happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10E_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10E hold output", JSON.stringify(summary));
}

function runOro10eDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10eFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10E_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10E_STATUS, "string");
  assert.strictEqual(typeof buildOro10eReviewRequestSubmissionGateRecord, "function");
  assert.strictEqual(typeof validateOro10eReviewRequestSubmissionGate, "function");
  assert.strictEqual(typeof buildOro10eSafetySummary, "function");

  const happy = evaluateOro10eReviewRequestSubmissionGate(fixtures.validReviewRequestSubmissionGateFromOro10dFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10eReviewRequestSubmissionGateRecordResult());
  assertHappyPath(validateOro10eReviewRequestSubmissionGate(buildOro10eReviewRequestSubmissionGateRecord()));
  const safety = buildOro10eSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10bPredecessorFailFixture, "missing_oro10b_predecessor"],
    [fixtures.missingOro10cPredecessorFailFixture, "missing_oro10c_predecessor"],
    [fixtures.missingOro10dPredecessorFailFixture, "missing_oro10d_predecessor"],
    [fixtures.missingOro10cEvidenceGateFailFixture, "missing_oro10c_evidence_gate"],
    [fixtures.missingOro10dReviewRequestBoundaryFailFixture, "missing_oro10d_review_request_boundary"],
    [fixtures.runtimeReviewRequestSubmissionBlockedFixture, "verifiedNoRuntimeReviewSubmissionOccurred_required"],
    [fixtures.reviewDecisionIssuedBlockedFixture, "review_decision_status_must_remain_pending"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicCallbackAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.walletMutationBlockedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationBlockedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.prismaWriteBlockedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionBlockedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationBlockedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployBlockedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretLikeValueBlockedFixture, "verifiedNoSecretLikeValuePresent_required"],
    [fixtures.longFilenameBlockedFixture, "noLongFilenameConfirmed_required"],
    [fixtures.missingSeparateNextApprovalBlockedFixture, "next_phase_separate_approval_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10eReviewRequestSubmissionGate(input), blocker);
  const allReports = fixtures.buildOro10eApprovalChainRolloverReviewRequestSubmissionGateFixtures().map(evaluateOro10eReviewRequestSubmissionGate);
  assert(allReports.length >= 24, "fixture set must cover requested ORO-10E scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10eDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10eDetailedSmoke,
  PASS_MESSAGE,
};
