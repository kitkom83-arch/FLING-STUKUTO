"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate");
const fixtures = require("../game-provider-mock/oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGateFixtures");

const {
  DEPENDS_ON_ORO10Z_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10Z_PASSED_KEY,
  ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
  ORO11A_PHASE,
  ORO11A_RESULT_KEY,
  ORO11A_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10Z_ONLY_KEY,
  assertOro11aNoRuntimeAuthorization,
  buildOro11aEvidencePackVerificationRecordReviewRecord,
  buildOro11aSafetySummary,
  buildOro11aStaticVerificationRecordReviewRecordDigest,
  evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate,
  normalizeOro11aEvidencePackVerificationRecordReviewRecordInput,
  validateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10Z = "docs/ORO_10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE.md";
const DOC_11A = "docs/ORO_11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate.js";
const FIXTURES = "src/game-provider-mock/oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11aSmoke.js";
const SCRIPT = "smoke:oro-11a";
const DETAIL_SCRIPT = "smoke:oro-11a:detailed";
const PASS_MESSAGE = "ORO-11A evidence pack verification record review record verification record gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11A evidence pack verification record review record verification record gate smoke: FAIL";

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

function assertNoLongOro11aFilenames() {
  const longPattern =
    /ORO_11A_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD|REVIEW_REVIEW|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_11A, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_11A|oro11a/.test(file));
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
  for (const file of [DOC_10Z, DOC_11A, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10z = readRequired(DOC_11A);
  for (const marker of [
    "# ORO-11A Evidence Pack Verification Record Review Record Verification Record Gate",
    "ORO-10Z closed.",
    "ORO-11A current.",
    "ORO-11A continues from ORO-10Z.",
    "evidence pack verification record review record verification record gate only",
    "verification-record-gate-only / static/mock only",
    "Static/mock verification record source model: oro10z_static_mock_evidence_pack_verification_record_review_record.",
    "ORO-10Z verification result as source must be present.",
    "ORO-10Y review record reference only must be present.",
    "ORO-10X review reference only must be present.",
    "ORO-10W verification record is reference only.",
    "ORO-10V verification output is reference only.",
    "mock_verification_record_review_record_verification_record_prepared",
    "mock_verification_record_review_record_verification_recorded_for_review_only",
    "mock_verification_record_review_record_verification_record_rejected",
    "mock_verification_record_review_record_verification_record_changes_required",
    "mock_verification_record_review_record_verification_record_digest_mismatch",
    "mock_verification_record_review_record_verification_record_missing_prior_verification",
    "mock_verification_record_review_record_verification_record_missing_evidence",
    "mock_verification_record_review_record_verification_record_incomplete",
    "mock_verification_record_review_record_verification_record_expired",
    "mock_verification_record_review_record_verification_record_conflict",
    "mock_verification_record_review_record_verification_record_invalid",
    "fail_closed",
    "verification record is not final approval issued",
    "verification record is not review approval decision authority",
    "verification record is not audit approval",
    "verification record is not finalization",
    "verification record is not signed runtime approval",
    "verification record is not signed approval artifact acceptance",
    "verification record is not actual signed artifact verification",
    "verification record does not authorize runtime",
    "verification record does not authorize route mount",
    "verification record does not authorize external call",
    "verification record does not authorize game launch",
    "verification record does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior verification, missing evidence, incomplete, invalid, conflict, and expired verification records are record_blocked or fail_closed",
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
    "no_review_decision_authority",
    "no_audit_authority",
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
    "static_mock_evidence_pack_verification_record_review_record_verification_record_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_record_only",
    ORO11A_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10z.includes(marker), `${DOC_11A} missing marker ${marker}.`);
  }

  const doc10y = readRequired(DOC_10Z);
  for (const marker of [
    "## ORO-11A Handoff",
    "ORO-10Z closed.",
    "ORO-11A current.",
    DOC_11A,
    "ORO-11A next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_gate_only",
    "ORO-11A final approval decision evidence pack verification record review record verification record is static/mock only.",
    "ORO-11A verification record review record verification record does not authorize runtime.",
  ]) {
    assert(doc10y.includes(marker), `${DOC_10Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11A, SCRIPT, DETAIL_SCRIPT, "oro11a"]) {
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
        "## ORO-11A Evidence Pack Verification Record Review Record Verification Record Gate Mapping",
        "ORO-10Z closed.",
        "ORO-11A current.",
        ORO11A_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11A Current", "ORO-10Z closed.", "ORO-11A current.", ORO11A_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-11A current/evidence pack verification record review record verification record gate",
        "ORO-10Z closed.",
        "`smoke:oro-11a`",
        "`smoke:oro-11a:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-11A Evidence Pack Verification Record Review Record Verification Record Gate Coverage",
        "ORO-10Z closed; ORO-11A current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11A files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11A]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO11A_RESULT_KEY,
    DEPENDS_ON_ORO10Z_KEY,
    ORO10Z_PASSED_KEY,
    VERIFIED_ORO10Z_ONLY_KEY,
    "oro10zPhase",
    "oro10zScope",
    "oro10zClosed",
    "evidencePackVerificationRecordReviewRecordGateScope",
    "evidencePackVerificationRecordReviewRecordStatus",
    "verificationRecordReviewRecordOutcome",
    "verificationRecordReviewRecord",
    "staticVerificationRecordReviewRecordDigest",
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
  assert.strictEqual(summary.phase, ORO11A_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11A_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10Z_KEY], true);
  assert.strictEqual(summary[ORO10Z_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10Z_ONLY_KEY], true);
  assert.strictEqual(summary.oro10zClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordGateScope, ORO11A_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordStatus, expectedStatus);
  assert(/^oro11a-static-verification-record-review-record-verification-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordReviewRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11A pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO11A_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordStatus,
    ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["verification_blocked", "fail_closed"].includes(summary.verificationRecordReviewRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11A hold output", JSON.stringify(summary));
}

function runOro11aDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11aFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO11A_PHASE, "string");
  assert.strictEqual(typeof helper.ORO11A_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro11aEvidencePackVerificationRecordReviewRecord, "function");
  assert.strictEqual(typeof buildOro11aStaticVerificationRecordReviewRecordDigest, "function");
  assert.strictEqual(typeof normalizeOro11aEvidencePackVerificationRecordReviewRecordInput, "function");
  assert.strictEqual(typeof assertOro11aNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate, "function");
  assert.strictEqual(typeof buildOro11aSafetySummary, "function");

  assertHappyPath(
    evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(fixtures.validReviewRecordPreparedFixture),
    ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(fixtures.recordedForReviewOnlyFixture),
    ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.rejectedVerificationRecordReviewRecordFixture
    ),
    ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.changesRequiredVerificationRecordReviewRecordFixture
    ),
    ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro11aStaticVerificationRecordReviewRecordDigest({ phase: ORO11A_PHASE, status: "same" });
  const digestB = buildOro11aStaticVerificationRecordReviewRecordDigest({ status: "same", phase: ORO11A_PHASE });
  assert.strictEqual(digestA, digestB, "static verification record review record digest must be deterministic.");
  assertNoSensitiveShape("ORO-11A digest", digestA);

  const safety = buildOro11aSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordReviewRecordFixture, "verification_record_review_record_expired"],
    [fixtures.conflictingVerificationRecordReviewRecordFixture, "verification_record_review_record_conflict"],
    [
      fixtures.invalidPriorGateMarkerFixture,
      "missing_oro10z_evidence_pack_verification_record_review_record_verification_gate",
    ],
    [
      fixtures.missingPriorOro10zReviewFixture,
      "missing_oro10z_evidence_pack_verification_record_review_record_verification_gate",
    ],
    [fixtures.incompleteVerificationRecordReviewFixture, "incomplete_verification_record_review_record"],
    [fixtures.verificationRecordReviewDigestMismatchFixture, "verification_record_review_record_digest_mismatch"],
    [fixtures.missingReviewRecordEvidenceFixture, "missing_review_record_evidence"],
    [fixtures.missingReviewRecordStatusFixture, "missing_review_record_status"],
    [fixtures.missingReviewRecordMetadataFixture, "missing_review_record_metadata"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.reviewDecisionAuthorityWordingAttemptBlockedFixture, "verifiedNoReviewAuthorityOccurred_required"],
    [fixtures.auditAuthorityWordingAttemptBlockedFixture, "auditAuthorityNotIssued_required"],
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
    assertHeld(evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(input), blocker);
  }

  const redacted = evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(redacted, ORO11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(
    redacted.verificationRecordReviewRecord.sanitizedEvidencePackVerificationRecordReviewRecord
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGateFixtures().map(
    evaluateOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate
  );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-11A scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11A fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11aDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11aDetailedSmoke,
  PASS_MESSAGE,
};
