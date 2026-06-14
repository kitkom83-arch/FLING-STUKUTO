"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10gApprovalChainRolloverReviewDecisionValidationGate");
const fixtures = require("../game-provider-mock/oro10gApprovalChainRolloverReviewDecisionValidationGateFixtures");

const {
  DEPENDS_ON_ORO10F_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10F_PASSED_KEY,
  ORO10G_PHASE,
  ORO10G_RESULT_KEY,
  ORO10G_SCOPE,
  ORO10G_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10F_ONLY_KEY,
  buildOro10gReviewDecisionValidationGateRecord,
  buildOro10gReviewDecisionValidationGateRecordResult,
  buildOro10gSafetySummary,
  evaluateOro10gReviewDecisionValidationGate,
  validateOro10gReviewDecisionValidationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10F = "docs/ORO_10F_APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_INTAKE_GATE.md";
const DOC_10G = "docs/ORO_10G_APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_VALIDATION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10gApprovalChainRolloverReviewDecisionValidationGate.js";
const FIXTURES = "src/game-provider-mock/oro10gApprovalChainRolloverReviewDecisionValidationGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10gApprovalChainRolloverReviewDecisionValidationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10gSmoke.js";
const SCRIPT = "smoke:oro-10g";
const DETAIL_SCRIPT = "smoke:oro-10g:detailed";
const PASS_MESSAGE = "ORO-10G approval chain rollover review decision validation gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10G approval chain rollover review decision validation gate smoke: FAIL";

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

function assertNoLongOro10gFilenames() {
  const longPattern =
    /ORO_10G_.*(APPROVAL_CHAIN_ROLLOVER_REVIEW_DECISION_VALIDATION_GATE_FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW|DECISION_DECISION|VALIDATION_VALIDATION)/;
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
  for (const file of [DOC_10G, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10g = readRequired(DOC_10G);
  for (const marker of [
    "# ORO-10G Approval Chain Rollover Review Decision Validation Gate",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C closed.",
    "ORO-10D closed.",
    "ORO-10E closed.",
    "ORO-10F closed.",
    "ORO-10G current.",
    "review decision validation gate only",
    "review decision validation is a static/mock record only",
    "validation result is not runtime authorization",
    "validation result is not signed runtime approval",
    "validation result is not a decision that authorizes route/runtime",
    "predecessor ORO-10F present = true",
    "ORO-10C evidence gate present = true",
    "ORO-10D review request boundary present = true",
    "ORO-10E review request submission gate present = true",
    "ORO-10F review decision intake gate present = true",
    "review decision validation static/mock only = true",
    "non-authorizing validation only = true",
    "runtime review decision not issued = true",
    "runtime authorization not issued = true",
    "runtime approval chain rollover not issued = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_runtime_review_decision",
    "no_runtime_authorization",
    "static_mock_review_decision_validation_only",
    "non_authorizing_validation_only",
    "no_signed_runtime_approval",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_route_alias",
    "no_public_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    ORO10G_SCOPE,
    ORO10G_STATUS,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10g.includes(marker), `${DOC_10G} missing marker ${marker}.`);
  }

  const doc10f = readRequired(DOC_10F);
  for (const marker of [
    "ORO-10F closed.",
    "ORO-10G current.",
    DOC_10G,
    "nextPhaseSeparateApprovalRequired = true",
    "ORO-10G next phase = approval_chain_rollover_review_decision_validation_gate_only",
  ]) {
    assert(doc10f.includes(marker), `${DOC_10F} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10G, SCRIPT, DETAIL_SCRIPT, "oro10g"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      API_MAP_FILE,
      [
        "## ORO-10G Approval Chain Rollover Review Decision Validation Gate Mapping",
        "ORO-10F closed.",
        "ORO-10G current.",
        ORO10G_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10G Current", "ORO-10F closed.", "ORO-10G current.", ORO10G_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10G current/approval chain rollover review decision validation gate",
        "ORO-10F closed.",
        "`smoke:oro-10g`",
        "`smoke:oro-10g:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10G Approval Chain Rollover Review Decision Validation Gate Coverage",
        "ORO-10F closed; ORO-10G current.",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10G files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10G]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10G_RESULT_KEY,
    DEPENDS_ON_ORO10F_KEY,
    ORO10F_PASSED_KEY,
    VERIFIED_ORO10F_ONLY_KEY,
    "dependsOnOro10aApprovalChainRolloverBoundary",
    "dependsOnOro10bApprovalChainRolloverContinuityGate",
    "dependsOnOro10cApprovalChainRolloverEvidenceGate",
    "dependsOnOro10dApprovalChainRolloverReviewRequestBoundary",
    "dependsOnOro10eApprovalChainRolloverReviewRequestSubmissionGate",
    "oro10cEvidenceGatePresent",
    "oro10dReviewRequestBoundaryPresent",
    "oro10eReviewRequestSubmissionGatePresent",
    "oro10fReviewDecisionIntakeGatePresent",
    "oro10fStatus",
    "oro10fScope",
    "oro10fClosed",
    "reviewDecisionValidationGateStatus",
    "reviewDecisionValidationGateScope",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateApproval",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10G_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10G_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10F_KEY], true);
  assert.strictEqual(summary[ORO10F_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10F_ONLY_KEY], true);
  assert.strictEqual(summary.oro10cEvidenceGatePresent, true);
  assert.strictEqual(summary.oro10dReviewRequestBoundaryPresent, true);
  assert.strictEqual(summary.oro10eReviewRequestSubmissionGatePresent, true);
  assert.strictEqual(summary.oro10fReviewDecisionIntakeGatePresent, true);
  assert.strictEqual(summary.oro10fClosed, true);
  assert.strictEqual(summary.reviewDecisionValidationGateScope, ORO10G_SCOPE);
  assert.strictEqual(summary.reviewDecisionValidationGateStatus, ORO10G_STATUS);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10G happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10G_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10G hold output", JSON.stringify(summary));
}

function runOro10gDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10gFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10G_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10G_STATUS, "string");
  assert.strictEqual(typeof buildOro10gReviewDecisionValidationGateRecord, "function");
  assert.strictEqual(typeof validateOro10gReviewDecisionValidationGate, "function");
  assert.strictEqual(typeof buildOro10gSafetySummary, "function");

  const happy = evaluateOro10gReviewDecisionValidationGate(fixtures.validReviewDecisionValidationGateFromOro10fFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10gReviewDecisionValidationGateRecordResult());
  assertHappyPath(validateOro10gReviewDecisionValidationGate(buildOro10gReviewDecisionValidationGateRecord()));
  const safety = buildOro10gSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10bPredecessorFailFixture, "missing_oro10b_predecessor"],
    [fixtures.missingOro10cPredecessorFailFixture, "missing_oro10c_predecessor"],
    [fixtures.missingOro10dPredecessorFailFixture, "missing_oro10d_predecessor"],
    [fixtures.missingOro10ePredecessorFailFixture, "missing_oro10e_predecessor"],
    [fixtures.missingOro10fPredecessorFailFixture, "missing_oro10f_predecessor"],
    [fixtures.missingOro10cEvidenceGateFailFixture, "missing_oro10c_evidence_gate"],
    [fixtures.missingOro10dReviewRequestBoundaryFailFixture, "missing_oro10d_review_request_boundary"],
    [fixtures.missingOro10eReviewRequestSubmissionGateFailFixture, "missing_oro10e_review_request_submission_gate"],
    [fixtures.missingOro10fReviewDecisionIntakeGateFailFixture, "missing_oro10f_review_decision_intake_gate"],
    [fixtures.missingStaticReviewDecisionValidationRecordFailFixture, "missing_static_review_decision_validation_record"],
    [fixtures.runtimeReviewDecisionBlockedFixture, "verifiedNoRuntimeReviewDecisionOccurred_required"],
    [fixtures.decisionAuthorizesRuntimeBlockedFixture, "verifiedNoDecisionAuthorizesRuntimeOccurred_required"],
    [fixtures.runtimeAuthorizationBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicAliasOccurred_required"],
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
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10gReviewDecisionValidationGate(input), blocker);
  const allReports = fixtures
    .buildOro10gApprovalChainRolloverReviewDecisionValidationGateFixtures()
    .map(evaluateOro10gReviewDecisionValidationGate);
  assert(allReports.length >= 30, "fixture set must cover requested ORO-10G scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10gDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10gDetailedSmoke,
  PASS_MESSAGE,
};
