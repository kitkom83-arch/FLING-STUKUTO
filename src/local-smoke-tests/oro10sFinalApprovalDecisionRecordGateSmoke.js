"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10sFinalApprovalDecisionRecordGate");
const fixtures = require("../game-provider-mock/oro10sFinalApprovalDecisionRecordGateFixtures");

const {
  DEPENDS_ON_ORO10R_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10R_PASSED_KEY,
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS,
  ORO10S_PHASE,
  ORO10S_RESULT_KEY,
  ORO10S_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10R_ONLY_KEY,
  assertOro10sNoRuntimeAuthorization,
  buildOro10sDecisionRecordEvidencePack,
  buildOro10sSafetySummary,
  buildOro10sStaticDecisionRecordDigest,
  evaluateOro10sFinalApprovalDecisionRecordGate,
  normalizeOro10sFinalApprovalDecisionRecordInput,
  validateOro10sFinalApprovalDecisionRecordGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10R = "docs/ORO_10R_FINAL_APPROVAL_DECISION_REVIEW_GATE.md";
const DOC_10S = "docs/ORO_10S_FINAL_APPROVAL_DECISION_RECORD_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10sFinalApprovalDecisionRecordGate.js";
const FIXTURES = "src/game-provider-mock/oro10sFinalApprovalDecisionRecordGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10sFinalApprovalDecisionRecordGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10sSmoke.js";
const SCRIPT = "smoke:oro-10s";
const DETAIL_SCRIPT = "smoke:oro-10s:detailed";
const PASS_MESSAGE = "ORO-10S final approval decision record gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10S final approval decision record gate smoke: FAIL";

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

function assertNoLongOro10sFilenames() {
  const longPattern =
    /ORO_10S_.*(FINAL_APPROVAL_DECISION_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|RECORD_RECORD)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [
    "docs/ORO_10S_FINAL_APPROVAL_DECISION_RECORD_GATE.md",
    BOUNDARY,
    FIXTURES,
    SMOKE,
    WRAPPER,
  ];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10S|oro10s/.test(file));
  assert.deepStrictEqual([...tracked, ...untracked].filter((file) => longPattern.test(file)), []);
  assert.deepStrictEqual(actual.filter((file) => !expected.includes(file)), []);
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
  for (const file of [DOC_10S, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10s = readRequired(DOC_10S);
  for (const marker of [
    "# ORO-10S Final Approval Decision Record Gate",
    "ORO-10R closed.",
    "ORO-10S current.",
    "ORO-10S continues from ORO-10R.",
    "final approval decision record gate only",
    "record-only static/mock decision record",
    "mock_record_prepared",
    "mock_record_review_only_accepted",
    "mock_record_rejected",
    "mock_record_changes_required",
    "mock_record_expired",
    "mock_record_conflict",
    "mock_record_invalid",
    "fail_closed",
    "Record accepted is not final approval issued",
    "Record prepared is not signed runtime approval",
    "Record review pass does not authorize runtime",
    "Record digest is not signed approval artifact verification",
    "Decision record does not authorize route mount",
    "Decision record does not authorize external call",
    "Decision record does not authorize game launch",
    "Decision record does not authorize runtime approval chain rollover",
    "invalid/conflict/expired records are record_blocked or fail_closed",
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
    "no_signed_approval_artifact_accepted",
    "no_final_approval_issued",
    "no_final_approval_decision_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_final_approval_decision_record_only",
    "non_authorizing_decision_record_only",
    ORO10S_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10s.includes(marker), `${DOC_10S} missing marker ${marker}.`);
  }

  const doc10r = readRequired(DOC_10R);
  for (const marker of [
    "## ORO-10S Handoff",
    "ORO-10R closed.",
    "ORO-10S current.",
    DOC_10S,
    "ORO-10S next phase = approval_chain_rollover_final_approval_decision_record_gate_only",
    "ORO-10S final approval decision record is static/mock only.",
    "ORO-10S final approval decision record does not authorize runtime.",
  ]) {
    assert(doc10r.includes(marker), `${DOC_10R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10S, SCRIPT, DETAIL_SCRIPT, "oro10s"]) {
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
        "## ORO-10S Final Approval Decision Record Gate Mapping",
        "ORO-10R closed.",
        "ORO-10S current.",
        ORO10S_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10S Current", "ORO-10R closed.", "ORO-10S current.", ORO10S_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10S current/final approval decision record gate",
        "ORO-10R closed.",
        "`smoke:oro-10s`",
        "`smoke:oro-10s:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10S Final Approval Decision Record Gate Coverage",
        "ORO-10R closed; ORO-10S current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10S files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10S]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10S_RESULT_KEY,
    DEPENDS_ON_ORO10R_KEY,
    ORO10R_PASSED_KEY,
    VERIFIED_ORO10R_ONLY_KEY,
    "oro10rStatus",
    "oro10rScope",
    "oro10rClosed",
    "finalApprovalDecisionRecordGateScope",
    "finalApprovalDecisionRecordStatus",
    "decisionRecordOutcome",
    "decisionRecordEvidencePack",
    "staticDecisionRecordDigest",
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
  assert.strictEqual(summary.phase, ORO10S_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10S_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10R_KEY], true);
  assert.strictEqual(summary[ORO10R_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10R_ONLY_KEY], true);
  assert.strictEqual(summary.oro10rClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionRecordGateScope, ORO10S_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionRecordStatus, expectedStatus);
  assert(/^oro10s-static-record-digest-[a-f0-9]{8}$/.test(summary.staticDecisionRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10S pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10S_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary.finalApprovalDecisionRecordStatus, ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.FAIL_CLOSED);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["record_blocked", "fail_closed"].includes(summary.decisionRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10S hold output", JSON.stringify(summary));
}

function runOro10sDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10sFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10S_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10S_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10sDecisionRecordEvidencePack, "function");
  assert.strictEqual(typeof buildOro10sStaticDecisionRecordDigest, "function");
  assert.strictEqual(typeof normalizeOro10sFinalApprovalDecisionRecordInput, "function");
  assert.strictEqual(typeof assertOro10sNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10sFinalApprovalDecisionRecordGate, "function");
  assert.strictEqual(typeof buildOro10sSafetySummary, "function");

  assertHappyPath(
    evaluateOro10sFinalApprovalDecisionRecordGate(fixtures.validReviewedDecisionRecordPreparedFixture),
    ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10sFinalApprovalDecisionRecordGate(fixtures.reviewOnlyAcceptedDecisionRecordFixture),
    ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED
  );
  assertHappyPath(
    evaluateOro10sFinalApprovalDecisionRecordGate(fixtures.rejectedDecisionRecordFixture),
    ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10sFinalApprovalDecisionRecordGate(fixtures.changesRequiredDecisionRecordFixture),
    ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro10sStaticDecisionRecordDigest({ phase: ORO10S_PHASE, status: "same" });
  const digestB = buildOro10sStaticDecisionRecordDigest({ status: "same", phase: ORO10S_PHASE });
  assert.strictEqual(digestA, digestB, "static record digest must be deterministic.");
  assertNoSensitiveShape("ORO-10S digest", digestA);

  const safety = buildOro10sSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredDecisionRecordFixture, "decision_review_evidence_expired"],
    [fixtures.conflictingDecisionRecordFixture, "decision_review_evidence_conflict"],
    [fixtures.invalidReviewDecisionIdFixture, "invalid_review_decision_id"],
    [fixtures.missingDecisionReviewEvidenceFixture, "missing_decision_review_evidence"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.signedRuntimeApprovalWordingAttemptBlockedFixture, "signedRuntimeApprovalNotIssued_required"],
    [
      fixtures.signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
      "signedApprovalArtifactAcceptanceNotIssued_required",
    ],
    [fixtures.routeMountAuthorizationAttemptBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.externalCallAuthorizationAttemptBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.noWalletLedgerDbMigrationDeployMarkersFixture, "verifiedNoWalletMutationOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10sFinalApprovalDecisionRecordGate(input), blocker);

  const redacted = evaluateOro10sFinalApprovalDecisionRecordGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(redacted.decisionRecordEvidencePack.sanitizedDecisionRecordEvidence);
  assert(redactedText.includes("[REDACTED]"), "secret-shaped fixture values must be redacted.");
  assert(!redactedText.includes("redacted-value-a"), "token-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-b"), "client-secret-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-c"), "device-id-like fixture value must not leak.");

  const allReports = fixtures.buildOro10sFinalApprovalDecisionRecordGateFixtures().map(
    evaluateOro10sFinalApprovalDecisionRecordGate
  );
  assert(allReports.length >= 16, "fixture set must cover requested ORO-10S scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10S fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10sDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10sDetailedSmoke,
  PASS_MESSAGE,
};
