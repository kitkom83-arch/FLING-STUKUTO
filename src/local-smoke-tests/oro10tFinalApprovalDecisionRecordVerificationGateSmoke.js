"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10tFinalApprovalDecisionRecordVerificationGate");
const fixtures = require("../game-provider-mock/oro10tFinalApprovalDecisionRecordVerificationGateFixtures");

const {
  DEPENDS_ON_ORO10S_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10S_PASSED_KEY,
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS,
  ORO10T_PHASE,
  ORO10T_RESULT_KEY,
  ORO10T_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10S_ONLY_KEY,
  assertOro10tNoRuntimeAuthorization,
  buildOro10tRecordVerificationEvidencePack,
  buildOro10tSafetySummary,
  buildOro10tStaticRecordVerificationDigest,
  evaluateOro10tFinalApprovalDecisionRecordVerificationGate,
  normalizeOro10tFinalApprovalDecisionRecordVerificationInput,
  validateOro10tFinalApprovalDecisionRecordVerificationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10S = "docs/ORO_10S_FINAL_APPROVAL_DECISION_RECORD_GATE.md";
const DOC_10T = "docs/ORO_10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10tFinalApprovalDecisionRecordVerificationGate.js";
const FIXTURES = "src/game-provider-mock/oro10tFinalApprovalDecisionRecordVerificationGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10tFinalApprovalDecisionRecordVerificationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10tSmoke.js";
const SCRIPT = "smoke:oro-10t";
const DETAIL_SCRIPT = "smoke:oro-10t:detailed";
const PASS_MESSAGE = "ORO-10T final approval decision record verification gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10T final approval decision record verification gate smoke: FAIL";

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

function assertNoLongOro10tFilenames() {
  const longPattern =
    /ORO_10T_.*(FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|RECORD_RECORD|VERIFICATION_VERIFICATION)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [
    DOC_10T,
    BOUNDARY,
    FIXTURES,
    SMOKE,
    WRAPPER,
  ];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10T|oro10t/.test(file));
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
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded credential URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10T, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10t = readRequired(DOC_10T);
  for (const marker of [
    "# ORO-10T Final Approval Decision Record Verification Gate",
    "ORO-10S closed.",
    "ORO-10T current.",
    "ORO-10T continues from ORO-10S.",
    "decision record verification gate only",
    "verification-only static/mock decision record",
    "mock_record_verification_prepared",
    "mock_record_verified_for_review_only",
    "mock_record_verification_failed",
    "mock_record_hash_mismatch",
    "mock_record_evidence_missing",
    "mock_record_expired",
    "mock_record_conflict",
    "mock_record_invalid",
    "fail_closed",
    "verified_for_review_only is not final approval issued",
    "record verification pass is not signed runtime approval",
    "record verification digest is not actual signed artifact verification",
    "record verification does not authorize runtime",
    "record verification does not authorize route mount",
    "record verification does not authorize external call",
    "record verification does not authorize game launch",
    "record verification does not authorize runtime approval chain rollover",
    "hash mismatch, missing evidence, invalid, conflict, and expired records are verification_blocked or fail_closed",
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
    "no_actual_signed_approval_artifact_verified",
    "no_final_approval_issued",
    "no_final_approval_decision_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_final_approval_decision_record_verification_only",
    "non_authorizing_decision_record_verification_only",
    ORO10T_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10t.includes(marker), `${DOC_10T} missing marker ${marker}.`);
  }

  const doc10s = readRequired(DOC_10S);
  for (const marker of [
    "## ORO-10T Handoff",
    "ORO-10S closed.",
    "ORO-10T current.",
    DOC_10T,
    "ORO-10T next phase = approval_chain_rollover_final_approval_decision_record_verification_gate_only",
    "ORO-10T final approval decision record verification is static/mock only.",
    "ORO-10T record verification does not authorize runtime.",
  ]) {
    assert(doc10s.includes(marker), `${DOC_10S} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10T, SCRIPT, DETAIL_SCRIPT, "oro10t"]) {
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
        "## ORO-10T Final Approval Decision Record Verification Gate Mapping",
        "ORO-10S closed.",
        "ORO-10T current.",
        ORO10T_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10T Current", "ORO-10S closed.", "ORO-10T current.", ORO10T_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10T current/final approval decision record verification gate",
        "ORO-10S closed.",
        "`smoke:oro-10t`",
        "`smoke:oro-10t:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10T Final Approval Decision Record Verification Gate Coverage",
        "ORO-10S closed; ORO-10T current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10T files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10T]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10T_RESULT_KEY,
    DEPENDS_ON_ORO10S_KEY,
    ORO10S_PASSED_KEY,
    VERIFIED_ORO10S_ONLY_KEY,
    "oro10sStatus",
    "oro10sScope",
    "oro10sClosed",
    "finalApprovalDecisionRecordVerificationGateScope",
    "finalApprovalDecisionRecordVerificationStatus",
    "recordVerificationOutcome",
    "recordVerificationEvidencePack",
    "staticRecordVerificationDigest",
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
  assert.strictEqual(summary.phase, ORO10T_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10T_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10S_KEY], true);
  assert.strictEqual(summary[ORO10S_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10S_ONLY_KEY], true);
  assert.strictEqual(summary.oro10sClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionRecordVerificationGateScope, ORO10T_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionRecordVerificationStatus, expectedStatus);
  assert(/^oro10t-static-record-verification-digest-[a-f0-9]{8}$/.test(summary.staticRecordVerificationDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10T pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10T_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.finalApprovalDecisionRecordVerificationStatus,
    ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["verification_blocked", "fail_closed"].includes(summary.recordVerificationOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10T hold output", JSON.stringify(summary));
}

function runOro10tDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10tFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10T_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10T_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10tRecordVerificationEvidencePack, "function");
  assert.strictEqual(typeof buildOro10tStaticRecordVerificationDigest, "function");
  assert.strictEqual(typeof normalizeOro10tFinalApprovalDecisionRecordVerificationInput, "function");
  assert.strictEqual(typeof assertOro10tNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10tFinalApprovalDecisionRecordVerificationGate, "function");
  assert.strictEqual(typeof buildOro10tSafetySummary, "function");

  assertHappyPath(
    evaluateOro10tFinalApprovalDecisionRecordVerificationGate(fixtures.validDecisionRecordVerificationPreparedFixture),
    ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10tFinalApprovalDecisionRecordVerificationGate(fixtures.reviewOnlyAcceptedRecordVerificationFixture),
    ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10tFinalApprovalDecisionRecordVerificationGate(fixtures.rejectedDecisionRecordVerificationFixture),
    ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED
  );
  assertHappyPath(
    validateOro10tFinalApprovalDecisionRecordVerificationGate(fixtures.changesRequiredDecisionRecordVerificationFixture),
    ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED
  );

  const digestA = buildOro10tStaticRecordVerificationDigest({ phase: ORO10T_PHASE, status: "same" });
  const digestB = buildOro10tStaticRecordVerificationDigest({ status: "same", phase: ORO10T_PHASE });
  assert.strictEqual(digestA, digestB, "static record verification digest must be deterministic.");
  assertNoSensitiveShape("ORO-10T digest", digestA);

  const safety = buildOro10tSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredDecisionRecordVerificationFixture, "record_expired"],
    [fixtures.conflictingDecisionRecordVerificationFixture, "record_conflict"],
    [fixtures.invalidRecordIdFixture, "invalid_record_id"],
    [fixtures.missingDecisionRecordEvidenceFixture, "missing_record_evidence"],
    [fixtures.recordDigestMismatchFixture, "record_digest_mismatch"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.signedRuntimeApprovalWordingAttemptBlockedFixture, "signedRuntimeApprovalNotIssued_required"],
    [
      fixtures.signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
      "signedApprovalArtifactAcceptanceNotIssued_required",
    ],
    [
      fixtures.actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
      "actualSignedApprovalArtifactVerificationNotIssued_required",
    ],
    [fixtures.routeMountAuthorizationAttemptBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.externalCallAuthorizationAttemptBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.noWalletLedgerDbMigrationDeployMarkersFixture, "verifiedNoWalletMutationOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro10tFinalApprovalDecisionRecordVerificationGate(input), blocker);
  }

  const redacted = evaluateOro10tFinalApprovalDecisionRecordVerificationGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(redacted.recordVerificationEvidencePack.sanitizedRecordVerificationEvidence);
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(!redactedText.includes("redacted-value-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-two"), "client-secret-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-three"), "device-id-like fixture value must not leak.");

  const allReports = fixtures.buildOro10tFinalApprovalDecisionRecordVerificationGateFixtures().map(
    evaluateOro10tFinalApprovalDecisionRecordVerificationGate
  );
  assert(allReports.length >= 18, "fixture set must cover requested ORO-10T scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10T fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10tDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10tDetailedSmoke,
  PASS_MESSAGE,
};
