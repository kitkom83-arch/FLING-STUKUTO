"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10rFinalApprovalDecisionReviewGate");
const fixtures = require("../game-provider-mock/oro10rFinalApprovalDecisionReviewGateFixtures");

const {
  DEPENDS_ON_ORO10Q_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10Q_PASSED_KEY,
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS,
  ORO10R_PHASE,
  ORO10R_RESULT_KEY,
  ORO10R_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10Q_ONLY_KEY,
  assertOro10rNoRuntimeAuthorization,
  buildOro10rDecisionReviewEvidencePack,
  buildOro10rSafetySummary,
  evaluateOro10rFinalApprovalDecisionReviewGate,
  normalizeOro10rFinalApprovalDecisionReviewInput,
  validateOro10rFinalApprovalDecisionReviewGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10Q = "docs/ORO_10Q_FINAL_APPROVAL_DECISION_INTAKE_GATE.md";
const DOC_10R = "docs/ORO_10R_FINAL_APPROVAL_DECISION_REVIEW_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10rFinalApprovalDecisionReviewGate.js";
const FIXTURES = "src/game-provider-mock/oro10rFinalApprovalDecisionReviewGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10rFinalApprovalDecisionReviewGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10rSmoke.js";
const SCRIPT = "smoke:oro-10r";
const DETAIL_SCRIPT = "smoke:oro-10r:detailed";
const PASS_MESSAGE = "ORO-10R final approval decision review gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10R final approval decision review gate smoke: FAIL";

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

function assertNoLongOro10rFilenames() {
  const longPattern =
    /ORO_10R_.*(FINAL_APPROVAL_DECISION_REVIEW_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|REVIEW_REVIEW)/;
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
    ["client", "S", "ecret", "="].join(""),
    ["DATABASE", "_URL", "="].join(""),
    ["device", "Id", "="].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const uppercasePinMarker = ["P", "I", "N"].join("");
  assert(!new RegExp(`\\b${uppercasePinMarker}\\s*[:=]`).test(scanned), `${label} includes guarded uppercase pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10R, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10r = readRequired(DOC_10R);
  for (const marker of [
    "# ORO-10R Final Approval Decision Review Gate",
    "ORO-10Q closed.",
    "ORO-10R current.",
    "ORO-10R continues from ORO-10Q.",
    "final approval decision review gate only",
    "reviews, classifies, and validates final approval decision intake in static/mock form only",
    "mock_decision_received_for_review",
    "mock_decision_approved_for_review_only",
    "mock_decision_rejected",
    "mock_decision_changes_required",
    "mock_decision_expired",
    "mock_decision_conflict",
    "mock_decision_invalid",
    "fail_closed",
    "approval_for_review_only is not runtime approval",
    "Review pass is not final approval issued",
    "Decision intake is not activation",
    "Decision review does not authorize route mount",
    "Decision review does not authorize external call",
    "Decision review does not authorize game launch",
    "Runtime authorization wording attempts must be blocked.",
    "Final approval issued wording attempts must be blocked.",
    "Signed runtime approval wording attempts must be blocked.",
    "invalid/conflict/expired reviews are review_blocked or fail_closed",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_actual_external_call",
    "no_game_launch_call",
    "no_route_alias",
    "no_public_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_runtime_review_decision",
    "no_runtime_authorization",
    "no_signed_runtime_approval",
    "no_final_approval_issued",
    "no_final_approval_decision_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_final_approval_decision_review_only",
    "non_authorizing_decision_review_only",
    ORO10R_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10r.includes(marker), `${DOC_10R} missing marker ${marker}.`);
  }

  const doc10q = readRequired(DOC_10Q);
  for (const marker of [
    "## ORO-10R Handoff",
    "ORO-10Q closed.",
    "ORO-10R current.",
    DOC_10R,
    "ORO-10R next phase = approval_chain_rollover_final_approval_decision_review_gate_only",
    "ORO-10R final approval decision review is static/mock only.",
    "ORO-10R final approval decision review does not authorize runtime.",
  ]) {
    assert(doc10q.includes(marker), `${DOC_10Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10R, SCRIPT, DETAIL_SCRIPT, "oro10r"]) {
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
        "## ORO-10R Final Approval Decision Review Gate Mapping",
        "ORO-10Q closed.",
        "ORO-10R current.",
        ORO10R_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10R Current", "ORO-10Q closed.", "ORO-10R current.", ORO10R_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10R current/final approval decision review gate",
        "ORO-10Q closed.",
        "`smoke:oro-10r`",
        "`smoke:oro-10r:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10R Final Approval Decision Review Gate Coverage",
        "ORO-10Q closed; ORO-10R current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10R files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10R]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10R_RESULT_KEY,
    DEPENDS_ON_ORO10Q_KEY,
    ORO10Q_PASSED_KEY,
    VERIFIED_ORO10Q_ONLY_KEY,
    "oro10qStatus",
    "oro10qScope",
    "oro10qClosed",
    "finalApprovalDecisionReviewGateScope",
    "finalApprovalDecisionReviewStatus",
    "decisionReviewOutcome",
    "decisionReviewEvidencePack",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateApproval",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary, expectedStatus) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10R_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10R_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10Q_KEY], true);
  assert.strictEqual(summary[ORO10Q_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10Q_ONLY_KEY], true);
  assert.strictEqual(summary.oro10qClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionReviewGateScope, ORO10R_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionReviewStatus, expectedStatus);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10R pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10R_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary.finalApprovalDecisionReviewStatus, ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.FAIL_CLOSED);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["review_blocked", "fail_closed"].includes(summary.decisionReviewOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10R hold output", JSON.stringify(summary));
}

function runOro10rDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10rFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10R_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10R_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10rDecisionReviewEvidencePack, "function");
  assert.strictEqual(typeof normalizeOro10rFinalApprovalDecisionReviewInput, "function");
  assert.strictEqual(typeof assertOro10rNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10rFinalApprovalDecisionReviewGate, "function");
  assert.strictEqual(typeof buildOro10rSafetySummary, "function");

  assertHappyPath(
    evaluateOro10rFinalApprovalDecisionReviewGate(fixtures.validDecisionReceivedForReviewFixture),
    ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW
  );
  assertHappyPath(
    evaluateOro10rFinalApprovalDecisionReviewGate(fixtures.approvedForReviewOnlyDecisionFixture),
    ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10rFinalApprovalDecisionReviewGate(fixtures.rejectedDecisionFixture),
    ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10rFinalApprovalDecisionReviewGate(fixtures.changesRequiredDecisionFixture),
    ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CHANGES_REQUIRED
  );

  const safety = buildOro10rSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredDecisionFixture, "decision_evidence_expired"],
    [fixtures.conflictingDecisionFixture, "decision_evidence_conflict"],
    [fixtures.invalidDecisionIdFixture, "invalid_decision_id"],
    [fixtures.missingDecisionEvidenceFixture, "missing_decision_evidence"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.signedRuntimeApprovalWordingAttemptBlockedFixture, "signedRuntimeApprovalNotIssued_required"],
    [fixtures.routeMountAuthorizationAttemptBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.externalCallAuthorizationAttemptBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.noWalletLedgerDbMigrationDeployMarkersFixture, "verifiedNoWalletMutationOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10rFinalApprovalDecisionReviewGate(input), blocker);

  const redacted = evaluateOro10rFinalApprovalDecisionReviewGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW);
  const redactedText = JSON.stringify(redacted.decisionReviewEvidencePack.sanitizedDecisionReviewEvidence);
  assert(redactedText.includes("[REDACTED]"), "secret-shaped fixture values must be redacted.");
  assert(!redactedText.includes("redacted-value-a"), "token-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-b"), "client-secret-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-c"), "device-id-like fixture value must not leak.");

  const allReports = fixtures.buildOro10rFinalApprovalDecisionReviewGateFixtures().map(
    evaluateOro10rFinalApprovalDecisionReviewGate
  );
  assert(allReports.length >= 15, "fixture set must cover requested ORO-10R scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10R fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10rDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10rDetailedSmoke,
  PASS_MESSAGE,
};
