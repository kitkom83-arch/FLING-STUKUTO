"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate");
const fixtures = require("../game-provider-mock/oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateFixtures");

const {
  DEPENDS_ON_ORO11A_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO11A_PASSED_KEY,
  ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO11B_PHASE,
  ORO11B_RESULT_KEY,
  ORO11B_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO11A_ONLY_KEY,
  assertOro11bNoRuntimeAuthorization,
  buildOro11bEvidencePackVerificationRecordReviewRecord,
  buildOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewEvidence,
  buildOro11bSafetySummary,
  buildOro11bStaticVerificationRecordReviewRecordDigest,
  buildOro11bStaticVerificationRecordReviewRecordVerificationRecordReviewDigest,
  evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate,
  normalizeOro11bEvidencePackVerificationRecordReviewRecordInput,
  normalizeOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewInput,
  validateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11A = "docs/ORO_11A_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE.md";
const DOC_11B = "docs/ORO_11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate.js";
const FIXTURES = "src/game-provider-mock/oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11bSmoke.js";
const SCRIPT = "smoke:oro-11b";
const DETAIL_SCRIPT = "smoke:oro-11b:detailed";
const PASS_MESSAGE = "ORO-11B evidence pack verification record review record verification record review gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11B evidence pack verification record review record verification record review gate smoke: FAIL";

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

function assertNoLongOro11bFilenames() {
  const longPattern =
    /ORO_11B_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD|REVIEW_REVIEW|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_11B, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_11B|oro11b/.test(file));
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
  for (const file of [DOC_11A, DOC_11B, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10z = readRequired(DOC_11B);
  for (const marker of [
    "# ORO-11B Evidence Pack Verification Record Review Record Verification Record Review Gate",
    "ORO-11A closed.",
    "ORO-11B current.",
    "ORO-11B continues from ORO-11A.",
    "evidence pack verification record review record verification record review gate only",
    "verification-record-review-gate-only / static/mock only",
    "Static/mock verification record review source model: oro11a_static_mock_evidence_pack_verification_record_review_record_verification_record.",
    "ORO-11A verification record as source must be present.",
    "ORO-10Z verification result reference only must be present.",
    "ORO-10Y review record reference only must be present.",
    "ORO-10X review reference only must be present.",
    "ORO-10W verification record is reference only.",
    "ORO-10V verification output is reference only.",
    "mock_verification_record_review_record_verification_record_review_prepared",
    "mock_verification_record_review_record_verification_record_reviewed_for_review_only",
    "mock_verification_record_review_record_verification_record_review_rejected",
    "mock_verification_record_review_record_verification_record_review_changes_required",
    "mock_verification_record_review_record_verification_record_review_digest_mismatch",
    "mock_verification_record_review_record_verification_record_review_missing_prior_record",
    "mock_verification_record_review_record_verification_record_review_missing_evidence",
    "mock_verification_record_review_record_verification_record_review_incomplete",
    "mock_verification_record_review_record_verification_record_review_expired",
    "mock_verification_record_review_record_verification_record_review_conflict",
    "mock_verification_record_review_record_verification_record_review_invalid",
    "fail_closed",
    "verification record review is not final approval issued",
    "verification record review is not review approval decision authority",
    "verification record review is not audit approval",
    "verification record review is not finalization",
    "verification record review is not signed runtime approval",
    "verification record review is not signed approval artifact acceptance",
    "verification record review is not actual signed artifact verification",
    "verification record review does not authorize runtime",
    "verification record review does not authorize route mount",
    "verification record review does not authorize external call",
    "verification record review does not authorize game launch",
    "verification record review does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior record, missing evidence, incomplete, invalid, conflict, and expired verification record reviews are review_blocked or fail_closed",
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
    "static_mock_evidence_pack_verification_record_review_record_verification_record_review_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_record_review_only",
    ORO11B_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10z.includes(marker), `${DOC_11B} missing marker ${marker}.`);
  }

  const doc10y = readRequired(DOC_11A);
  for (const marker of [
    "## ORO-11B Handoff",
    "ORO-11A closed.",
    "ORO-11B current.",
    DOC_11B,
    "ORO-11B next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_gate_only",
    "ORO-11B final approval decision evidence pack verification record review record verification record review is static/mock only.",
    "ORO-11B verification record review record verification record review does not authorize runtime.",
  ]) {
    assert(doc10y.includes(marker), `${DOC_11A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11B, SCRIPT, DETAIL_SCRIPT, "oro11b"]) {
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
        "## ORO-11B Evidence Pack Verification Record Review Record Verification Record Review Gate Mapping",
        "ORO-11A closed.",
        "ORO-11B current.",
        ORO11B_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11B Current", "ORO-11A closed.", "ORO-11B current.", ORO11B_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-11B current/evidence pack verification record review record verification record review gate",
        "ORO-11A closed.",
        "`smoke:oro-11b`",
        "`smoke:oro-11b:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-11B Evidence Pack Verification Record Review Record Verification Record Review Gate Coverage",
        "ORO-11A closed; ORO-11B current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11B files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11B]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO11B_RESULT_KEY,
    DEPENDS_ON_ORO11A_KEY,
    ORO11A_PASSED_KEY,
    VERIFIED_ORO11A_ONLY_KEY,
    "oro11aPhase",
    "oro11aScope",
    "oro11aClosed",
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
  assert.strictEqual(summary.phase, ORO11B_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11B_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO11A_KEY], true);
  assert.strictEqual(summary[ORO11A_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO11A_ONLY_KEY], true);
  assert.strictEqual(summary.oro11aClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordGateScope, ORO11B_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordStatus, expectedStatus);
  assert(/^oro11b-static-verification-record-review-record-verification-record-review-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordReviewRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11B pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO11B_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordStatus,
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["review_blocked", "fail_closed"].includes(summary.verificationRecordReviewRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11B hold output", JSON.stringify(summary));
}

function runOro11bDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11bFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO11B_PHASE, "string");
  assert.strictEqual(typeof helper.ORO11B_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro11bEvidencePackVerificationRecordReviewRecord, "function");
  assert.strictEqual(typeof buildOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewEvidence, "function");
  assert.strictEqual(typeof buildOro11bStaticVerificationRecordReviewRecordDigest, "function");
  assert.strictEqual(typeof buildOro11bStaticVerificationRecordReviewRecordVerificationRecordReviewDigest, "function");
  assert.strictEqual(typeof normalizeOro11bEvidencePackVerificationRecordReviewRecordInput, "function");
  assert.strictEqual(typeof normalizeOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewInput, "function");
  assert.strictEqual(typeof assertOro11bNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate, "function");
  assert.strictEqual(typeof buildOro11bSafetySummary, "function");

  assertHappyPath(
    evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(fixtures.validReviewRecordPreparedFixture),
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(fixtures.recordedForReviewOnlyFixture),
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(
      fixtures.rejectedVerificationRecordReviewRecordFixture
    ),
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(
      fixtures.changesRequiredVerificationRecordReviewRecordFixture
    ),
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro11bStaticVerificationRecordReviewRecordDigest({ phase: ORO11B_PHASE, status: "same" });
  const digestB = buildOro11bStaticVerificationRecordReviewRecordDigest({ status: "same", phase: ORO11B_PHASE });
  assert.strictEqual(digestA, digestB, "static verification record review record digest must be deterministic.");
  assertNoSensitiveShape("ORO-11B digest", digestA);

  const safety = buildOro11bSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordReviewRecordFixture, "verification_record_review_record_expired"],
    [fixtures.conflictingVerificationRecordReviewRecordFixture, "verification_record_review_record_conflict"],
    [
      fixtures.invalidPriorGateMarkerFixture,
      "missing_oro11a_evidence_pack_verification_record_review_record_verification_record_gate",
    ],
    [
      fixtures.missingPriorOro11aReviewFixture,
      "missing_oro11a_evidence_pack_verification_record_review_record_verification_record_gate",
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
    assertHeld(evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(input), blocker);
  }

  const redacted = evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(redacted, ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(
    redacted.verificationRecordReviewRecord.sanitizedEvidencePackVerificationRecordReviewRecord
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateFixtures().map(
    evaluateOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate
  );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-11B scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11B fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11bDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11bDetailedSmoke,
  PASS_MESSAGE,
};
