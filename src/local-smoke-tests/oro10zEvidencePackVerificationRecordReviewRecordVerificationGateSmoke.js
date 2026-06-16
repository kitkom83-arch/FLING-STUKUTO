"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10zEvidencePackVerificationRecordReviewRecordVerificationGate");
const fixtures = require("../game-provider-mock/oro10zEvidencePackVerificationRecordReviewRecordVerificationGateFixtures");

const {
  DEPENDS_ON_ORO10Y_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10Y_PASSED_KEY,
  ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
  ORO10Z_PHASE,
  ORO10Z_RESULT_KEY,
  ORO10Z_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10Y_ONLY_KEY,
  assertOro10zNoRuntimeAuthorization,
  buildOro10zEvidencePackVerificationRecordReviewRecord,
  buildOro10zSafetySummary,
  buildOro10zStaticVerificationRecordReviewRecordDigest,
  evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate,
  normalizeOro10zEvidencePackVerificationRecordReviewRecordInput,
  validateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10Y = "docs/ORO_10Y_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE.md";
const DOC_10Z = "docs/ORO_10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10zEvidencePackVerificationRecordReviewRecordVerificationGate.js";
const FIXTURES = "src/game-provider-mock/oro10zEvidencePackVerificationRecordReviewRecordVerificationGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10zEvidencePackVerificationRecordReviewRecordVerificationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10zSmoke.js";
const SCRIPT = "smoke:oro-10z";
const DETAIL_SCRIPT = "smoke:oro-10z:detailed";
const PASS_MESSAGE = "ORO-10Z evidence pack verification record review record verification gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10Z evidence pack verification record review record verification gate smoke: FAIL";

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

function assertNoLongOro10zFilenames() {
  const longPattern =
    /ORO_10Z_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD|REVIEW_REVIEW|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_10Z, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10Z|oro10z/.test(file));
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
  for (const file of [DOC_10Y, DOC_10Z, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10z = readRequired(DOC_10Z);
  for (const marker of [
    "# ORO-10Z Evidence Pack Verification Record Review Record Verification Gate",
    "ORO-10Y closed.",
    "ORO-10Z current.",
    "ORO-10Z continues from ORO-10Y.",
    "evidence pack verification record review record verification gate only",
    "review-record-verification-gate-only and static/mock only",
    "Static/mock review record verification source model: oro10y_static_mock_evidence_pack_verification_record_review_record.",
    "ORO-10W verification record is reference only.",
    "ORO-10V verification output is reference only.",
    "mock_verification_record_review_record_verification_prepared",
    "mock_verification_record_review_record_verified_for_review_only",
    "mock_verification_record_review_record_verification_rejected",
    "mock_verification_record_review_record_verification_changes_required",
    "mock_verification_record_review_record_verification_digest_mismatch",
    "mock_verification_record_review_record_verification_missing_prior_record",
    "mock_verification_record_review_record_verification_missing_evidence",
    "mock_verification_record_review_record_verification_incomplete",
    "mock_verification_record_review_record_verification_expired",
    "mock_verification_record_review_record_verification_conflict",
    "mock_verification_record_review_record_verification_invalid",
    "fail_closed",
    "verification record review record verification is not final approval issued",
    "verification record review record verification is not review approval decision authority",
    "verification record review record verification is not audit approval",
    "verification record review record verification is not finalization",
    "verification record review record verification is not signed runtime approval",
    "verification record review record verification is not signed approval artifact acceptance",
    "verification record review record verification is not actual signed artifact verification",
    "verification record review record verification does not authorize runtime",
    "verification record review record verification does not authorize route mount",
    "verification record review record verification does not authorize external call",
    "verification record review record verification does not authorize game launch",
    "verification record review record verification does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior record, missing evidence, incomplete, invalid, conflict, and expired review record verifications are verification_blocked or fail_closed",
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
    "static_mock_evidence_pack_verification_record_review_record_verification_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_only",
    ORO10Z_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10z.includes(marker), `${DOC_10Z} missing marker ${marker}.`);
  }

  const doc10y = readRequired(DOC_10Y);
  for (const marker of [
    "## ORO-10Z Handoff",
    "ORO-10Y closed.",
    "ORO-10Z current.",
    DOC_10Z,
    "ORO-10Z next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_gate_only",
    "ORO-10Z final approval decision evidence pack verification record review record verification is static/mock only.",
    "ORO-10Z verification record review record verification does not authorize runtime.",
  ]) {
    assert(doc10y.includes(marker), `${DOC_10Y} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10Z, SCRIPT, DETAIL_SCRIPT, "oro10z"]) {
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
        "## ORO-10Z Evidence Pack Verification Record Review Record Verification Gate Mapping",
        "ORO-10Y closed.",
        "ORO-10Z current.",
        ORO10Z_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10Z Current", "ORO-10Y closed.", "ORO-10Z current.", ORO10Z_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10Z current/evidence pack verification record review record verification gate",
        "ORO-10Y closed.",
        "`smoke:oro-10z`",
        "`smoke:oro-10z:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10Z Evidence Pack Verification Record Review Record Verification Gate Coverage",
        "ORO-10Y closed; ORO-10Z current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10Z files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10Z]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10Z_RESULT_KEY,
    DEPENDS_ON_ORO10Y_KEY,
    ORO10Y_PASSED_KEY,
    VERIFIED_ORO10Y_ONLY_KEY,
    "oro10yPhase",
    "oro10yScope",
    "oro10yClosed",
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
  assert.strictEqual(summary.phase, ORO10Z_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10Z_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10Y_KEY], true);
  assert.strictEqual(summary[ORO10Y_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10Y_ONLY_KEY], true);
  assert.strictEqual(summary.oro10yClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordGateScope, ORO10Z_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordStatus, expectedStatus);
  assert(/^oro10z-static-verification-record-review-record-verification-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordReviewRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10Z pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10Z_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordStatus,
    ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["verification_blocked", "fail_closed"].includes(summary.verificationRecordReviewRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10Z hold output", JSON.stringify(summary));
}

function runOro10zDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10zFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10Z_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10Z_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10zEvidencePackVerificationRecordReviewRecord, "function");
  assert.strictEqual(typeof buildOro10zStaticVerificationRecordReviewRecordDigest, "function");
  assert.strictEqual(typeof normalizeOro10zEvidencePackVerificationRecordReviewRecordInput, "function");
  assert.strictEqual(typeof assertOro10zNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate, "function");
  assert.strictEqual(typeof buildOro10zSafetySummary, "function");

  assertHappyPath(
    evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(fixtures.validReviewRecordPreparedFixture),
    ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(fixtures.recordedForReviewOnlyFixture),
    ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(
      fixtures.rejectedVerificationRecordReviewRecordFixture
    ),
    ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(
      fixtures.changesRequiredVerificationRecordReviewRecordFixture
    ),
    ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro10zStaticVerificationRecordReviewRecordDigest({ phase: ORO10Z_PHASE, status: "same" });
  const digestB = buildOro10zStaticVerificationRecordReviewRecordDigest({ status: "same", phase: ORO10Z_PHASE });
  assert.strictEqual(digestA, digestB, "static verification record review record digest must be deterministic.");
  assertNoSensitiveShape("ORO-10Z digest", digestA);

  const safety = buildOro10zSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordReviewRecordFixture, "verification_record_review_record_expired"],
    [fixtures.conflictingVerificationRecordReviewRecordFixture, "verification_record_review_record_conflict"],
    [fixtures.invalidPriorGateMarkerFixture, "missing_oro10y_evidence_pack_verification_record_review_gate"],
    [fixtures.missingPriorOro10yReviewFixture, "missing_oro10y_evidence_pack_verification_record_review_gate"],
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
    assertHeld(evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(input), blocker);
  }

  const redacted = evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(redacted, ORO10Z_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(
    redacted.verificationRecordReviewRecord.sanitizedEvidencePackVerificationRecordReviewRecord
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro10zEvidencePackVerificationRecordReviewRecordVerificationGateFixtures().map(
    evaluateOro10zEvidencePackVerificationRecordReviewRecordVerificationGate
  );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-10Z scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10Z fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10zDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10zDetailedSmoke,
  PASS_MESSAGE,
};
