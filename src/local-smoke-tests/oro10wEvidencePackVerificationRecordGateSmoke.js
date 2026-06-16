"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10wEvidencePackVerificationRecordGate");
const fixtures = require("../game-provider-mock/oro10wEvidencePackVerificationRecordGateFixtures");

const {
  DEPENDS_ON_ORO10V_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10V_PASSED_KEY,
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS,
  ORO10W_PHASE,
  ORO10W_RESULT_KEY,
  ORO10W_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10V_ONLY_KEY,
  assertOro10wNoRuntimeAuthorization,
  buildOro10wEvidencePackVerificationRecord,
  buildOro10wSafetySummary,
  buildOro10wStaticVerificationRecordDigest,
  evaluateOro10wEvidencePackVerificationRecordGate,
  normalizeOro10wEvidencePackVerificationRecordInput,
  validateOro10wEvidencePackVerificationRecordGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10V = "docs/ORO_10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE.md";
const DOC_10W = "docs/ORO_10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10wEvidencePackVerificationRecordGate.js";
const FIXTURES = "src/game-provider-mock/oro10wEvidencePackVerificationRecordGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10wEvidencePackVerificationRecordGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10wSmoke.js";
const SCRIPT = "smoke:oro-10w";
const DETAIL_SCRIPT = "smoke:oro-10w:detailed";
const PASS_MESSAGE = "ORO-10W evidence pack verification record gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10W evidence pack verification record gate smoke: FAIL";

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

function assertNoLongOro10wFilenames() {
  const longPattern =
    /ORO_10W_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_10W, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10W|oro10w/.test(file));
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
  for (const file of [DOC_10W, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10w = readRequired(DOC_10W);
  for (const marker of [
    "# ORO-10W Evidence Pack Verification Record Gate",
    "ORO-10V closed.",
    "ORO-10W current.",
    "ORO-10W continues from ORO-10V.",
    "evidence pack verification record gate only",
    "record-gate-only and static/mock only",
    "Source model: oro10v_static_mock_final_approval_decision_evidence_pack_verification.",
    "mock_verification_record_prepared",
    "mock_verification_record_recorded_for_review_only",
    "mock_verification_record_rejected",
    "mock_verification_record_changes_required",
    "mock_verification_record_digest_mismatch",
    "mock_verification_record_missing_prior_gate",
    "mock_verification_record_missing_evidence",
    "mock_verification_record_incomplete",
    "mock_verification_record_expired",
    "mock_verification_record_conflict",
    "mock_verification_record_invalid",
    "fail_closed",
    "verification record is not final approval issued",
    "verification record is not review approval",
    "verification record is not finalization",
    "verification record is not signed runtime approval",
    "verification record is not signed approval artifact acceptance",
    "verification record is not actual signed artifact verification",
    "verification record does not authorize runtime",
    "verification record does not authorize route mount",
    "verification record does not authorize external call",
    "verification record does not authorize game launch",
    "verification record does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior gate, missing evidence, incomplete, invalid, conflict, and expired records are record_blocked or fail_closed",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_actual_external_call",
    "no_game_launch_call",
    "no_route_alias",
    "no_public_alias",
    "no_runtime_mount",
    "no_runtime_activation",
    "no_runtime_approval_chain_rollover",
    "no_runtime_review_decision",
    "no_runtime_authorization",
    "no_review_authority",
    "no_finalization",
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
    "static_mock_evidence_pack_verification_record_only",
    "non_authorizing_evidence_pack_verification_record_only",
    ORO10W_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10w.includes(marker), `${DOC_10W} missing marker ${marker}.`);
  }

  const doc10v = readRequired(DOC_10V);
  for (const marker of [
    "## ORO-10W Handoff",
    "ORO-10V closed.",
    "ORO-10W current.",
    DOC_10W,
    "ORO-10W next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_gate_only",
    "ORO-10W final approval decision evidence pack verification record is static/mock only.",
    "ORO-10W verification record does not authorize runtime.",
  ]) {
    assert(doc10v.includes(marker), `${DOC_10V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10W, SCRIPT, DETAIL_SCRIPT, "oro10w"]) {
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
        "## ORO-10W Evidence Pack Verification Record Gate Mapping",
        "ORO-10V closed.",
        "ORO-10W current.",
        ORO10W_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10W Current", "ORO-10V closed.", "ORO-10W current.", ORO10W_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10W current/evidence pack verification record gate",
        "ORO-10V closed.",
        "`smoke:oro-10w`",
        "`smoke:oro-10w:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10W Evidence Pack Verification Record Gate Coverage",
        "ORO-10V closed; ORO-10W current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10W files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10W]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10W_RESULT_KEY,
    DEPENDS_ON_ORO10V_KEY,
    ORO10V_PASSED_KEY,
    VERIFIED_ORO10V_ONLY_KEY,
    "oro10vStatus",
    "oro10vScope",
    "oro10vClosed",
    "evidencePackVerificationRecordGateScope",
    "evidencePackVerificationRecordStatus",
    "verificationRecordOutcome",
    "verificationRecord",
    "staticVerificationRecordDigest",
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
  assert.strictEqual(summary.phase, ORO10W_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10W_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10V_KEY], true);
  assert.strictEqual(summary[ORO10V_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10V_ONLY_KEY], true);
  assert.strictEqual(summary.oro10vClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordGateScope, ORO10W_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordStatus, expectedStatus);
  assert(/^oro10w-static-verification-record-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10W pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10W_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordStatus,
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["record_blocked", "fail_closed"].includes(summary.verificationRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10W hold output", JSON.stringify(summary));
}

function runOro10wDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10wFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10W_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10W_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10wEvidencePackVerificationRecord, "function");
  assert.strictEqual(typeof buildOro10wStaticVerificationRecordDigest, "function");
  assert.strictEqual(typeof normalizeOro10wEvidencePackVerificationRecordInput, "function");
  assert.strictEqual(typeof assertOro10wNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10wEvidencePackVerificationRecordGate, "function");
  assert.strictEqual(typeof buildOro10wSafetySummary, "function");

  assertHappyPath(
    evaluateOro10wEvidencePackVerificationRecordGate(fixtures.validVerificationRecordPreparedFixture),
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10wEvidencePackVerificationRecordGate(fixtures.reviewOnlyVerifiedResultRecordedFixture),
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10wEvidencePackVerificationRecordGate(fixtures.rejectedVerificationResultRecordFixture),
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10wEvidencePackVerificationRecordGate(fixtures.changesRequiredVerificationResultRecordFixture),
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro10wStaticVerificationRecordDigest({ phase: ORO10W_PHASE, status: "same" });
  const digestB = buildOro10wStaticVerificationRecordDigest({ status: "same", phase: ORO10W_PHASE });
  assert.strictEqual(digestA, digestB, "static verification record digest must be deterministic.");
  assertNoSensitiveShape("ORO-10W digest", digestA);

  const safety = buildOro10wSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationResultRecordFixture, "verification_record_expired"],
    [fixtures.conflictingVerificationResultRecordFixture, "verification_record_conflict"],
    [fixtures.invalidPriorGateMarkerFixture, "missing_oro10v_final_approval_decision_evidence_pack_verification_gate"],
    [fixtures.missingPriorGateEvidenceFixture, "missing_oro10v_final_approval_decision_evidence_pack_verification_gate"],
    [fixtures.incompleteVerificationEvidenceFixture, "incomplete_verification_record"],
    [fixtures.evidencePackDigestMismatchFixture, "verification_record_digest_mismatch"],
    [fixtures.missingVerificationStatusFixture, "missing_verification_status"],
    [fixtures.missingVerificationEvidenceFixture, "missing_verification_evidence"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.reviewAuthorityWordingAttemptBlockedFixture, "verifiedNoReviewAuthorityOccurred_required"],
    [fixtures.finalizationWordingAttemptBlockedFixture, "verifiedNoFinalizationOccurred_required"],
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
    [fixtures.gameLaunchAuthorizationAttemptBlockedFixture, "verifiedNoGameLaunchCallOccurred_required"],
    [fixtures.noWalletLedgerDbMigrationDeployMarkersFixture, "verifiedNoWalletMutationOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro10wEvidencePackVerificationRecordGate(input), blocker);
  }

  const redacted = evaluateOro10wEvidencePackVerificationRecordGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(redacted.verificationRecord.sanitizedEvidencePackVerificationRecord);
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro10wEvidencePackVerificationRecordGateFixtures().map(
    evaluateOro10wEvidencePackVerificationRecordGate
  );
  assert(allReports.length >= 23, "fixture set must cover requested ORO-10W scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10W fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10wDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10wDetailedSmoke,
  PASS_MESSAGE,
};
