"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10xEvidencePackVerificationRecordReviewGate");
const fixtures = require("../game-provider-mock/oro10xEvidencePackVerificationRecordReviewGateFixtures");

const {
  DEPENDS_ON_ORO10W_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10W_PASSED_KEY,
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO10X_PHASE,
  ORO10X_RESULT_KEY,
  ORO10X_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10W_ONLY_KEY,
  assertOro10xNoRuntimeAuthorization,
  buildOro10xEvidencePackVerificationRecordReviewEvidence,
  buildOro10xSafetySummary,
  buildOro10xStaticVerificationRecordReviewDigest,
  evaluateOro10xEvidencePackVerificationRecordReviewGate,
  normalizeOro10xEvidencePackVerificationRecordReviewInput,
  validateOro10xEvidencePackVerificationRecordReviewGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10W = "docs/ORO_10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE.md";
const DOC_10X = "docs/ORO_10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10xEvidencePackVerificationRecordReviewGate.js";
const FIXTURES = "src/game-provider-mock/oro10xEvidencePackVerificationRecordReviewGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10xEvidencePackVerificationRecordReviewGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10xSmoke.js";
const SCRIPT = "smoke:oro-10x";
const DETAIL_SCRIPT = "smoke:oro-10x:detailed";
const PASS_MESSAGE = "ORO-10X evidence pack verification record review gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10X evidence pack verification record review gate smoke: FAIL";

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

function assertNoLongOro10xFilenames() {
  const longPattern =
    /ORO_10X_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD|REVIEW_REVIEW|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_10X, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10X|oro10x/.test(file));
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
  for (const file of [DOC_10W, DOC_10X, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10x = readRequired(DOC_10X);
  for (const marker of [
    "# ORO-10X Evidence Pack Verification Record Review Gate",
    "ORO-10W closed.",
    "ORO-10X current.",
    "ORO-10X continues from ORO-10W.",
    "evidence pack verification record review gate only",
    "record-review-gate-only and static/mock only",
    "Source model: oro10w_static_mock_evidence_pack_verification_record.",
    "mock_verification_record_review_prepared",
    "mock_verification_record_reviewed_for_review_only",
    "mock_verification_record_review_rejected",
    "mock_verification_record_review_changes_required",
    "mock_verification_record_review_digest_mismatch",
    "mock_verification_record_review_missing_prior_record",
    "mock_verification_record_review_missing_evidence",
    "mock_verification_record_review_incomplete",
    "mock_verification_record_review_expired",
    "mock_verification_record_review_conflict",
    "mock_verification_record_review_invalid",
    "fail_closed",
    "verification record review is not final approval issued",
    "verification record review is not review approval decision authority",
    "verification record review is not finalization",
    "verification record review is not signed runtime approval",
    "verification record review is not signed approval artifact acceptance",
    "verification record review is not actual signed artifact verification",
    "verification record review does not authorize runtime",
    "verification record review does not authorize route mount",
    "verification record review does not authorize external call",
    "verification record review does not authorize game launch",
    "verification record review does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior record, missing evidence, incomplete, invalid, conflict, and expired reviews are review_blocked or fail_closed",
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
    "static_mock_evidence_pack_verification_record_review_only",
    "non_authorizing_evidence_pack_verification_record_review_only",
    ORO10X_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10x.includes(marker), `${DOC_10X} missing marker ${marker}.`);
  }

  const doc10w = readRequired(DOC_10W);
  for (const marker of [
    "## ORO-10X Handoff",
    "ORO-10W closed.",
    "ORO-10X current.",
    DOC_10X,
    "ORO-10X next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_gate_only",
    "ORO-10X final approval decision evidence pack verification record review is static/mock only.",
    "ORO-10X verification record review does not authorize runtime.",
  ]) {
    assert(doc10w.includes(marker), `${DOC_10W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10X, SCRIPT, DETAIL_SCRIPT, "oro10x"]) {
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
        "## ORO-10X Evidence Pack Verification Record Review Gate Mapping",
        "ORO-10W closed.",
        "ORO-10X current.",
        ORO10X_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10X Current", "ORO-10W closed.", "ORO-10X current.", ORO10X_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10X current/evidence pack verification record review gate",
        "ORO-10W closed.",
        "`smoke:oro-10x`",
        "`smoke:oro-10x:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10X Evidence Pack Verification Record Review Gate Coverage",
        "ORO-10W closed; ORO-10X current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10X files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10X]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10X_RESULT_KEY,
    DEPENDS_ON_ORO10W_KEY,
    ORO10W_PASSED_KEY,
    VERIFIED_ORO10W_ONLY_KEY,
    "oro10wStatus",
    "oro10wScope",
    "oro10wClosed",
    "evidencePackVerificationRecordReviewGateScope",
    "evidencePackVerificationRecordReviewStatus",
    "verificationRecordReviewOutcome",
    "verificationRecordReview",
    "staticVerificationRecordReviewDigest",
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
  assert.strictEqual(summary.phase, ORO10X_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10X_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10W_KEY], true);
  assert.strictEqual(summary[ORO10W_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10W_ONLY_KEY], true);
  assert.strictEqual(summary.oro10wClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewGateScope, ORO10X_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewStatus, expectedStatus);
  assert(/^oro10x-static-verification-record-review-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordReviewDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10X pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10X_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewStatus,
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["review_blocked", "fail_closed"].includes(summary.verificationRecordReviewOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10X hold output", JSON.stringify(summary));
}

function runOro10xDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10xFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10X_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10X_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10xEvidencePackVerificationRecordReviewEvidence, "function");
  assert.strictEqual(typeof buildOro10xStaticVerificationRecordReviewDigest, "function");
  assert.strictEqual(typeof normalizeOro10xEvidencePackVerificationRecordReviewInput, "function");
  assert.strictEqual(typeof assertOro10xNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10xEvidencePackVerificationRecordReviewGate, "function");
  assert.strictEqual(typeof buildOro10xSafetySummary, "function");

  assertHappyPath(
    evaluateOro10xEvidencePackVerificationRecordReviewGate(fixtures.validRecordReviewPreparedFixture),
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10xEvidencePackVerificationRecordReviewGate(fixtures.reviewedForReviewOnlyFixture),
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10xEvidencePackVerificationRecordReviewGate(fixtures.rejectedRecordReviewFixture),
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10xEvidencePackVerificationRecordReviewGate(fixtures.changesRequiredRecordReviewFixture),
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro10xStaticVerificationRecordReviewDigest({ phase: ORO10X_PHASE, status: "same" });
  const digestB = buildOro10xStaticVerificationRecordReviewDigest({ status: "same", phase: ORO10X_PHASE });
  assert.strictEqual(digestA, digestB, "static verification record review digest must be deterministic.");
  assertNoSensitiveShape("ORO-10X digest", digestA);

  const safety = buildOro10xSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredRecordReviewFixture, "verification_record_review_expired"],
    [fixtures.conflictingRecordReviewFixture, "verification_record_review_conflict"],
    [fixtures.invalidPriorGateMarkerFixture, "missing_oro10w_evidence_pack_verification_record_gate"],
    [fixtures.missingPriorOro10wRecordFixture, "missing_oro10w_evidence_pack_verification_record_gate"],
    [fixtures.incompleteVerificationRecordFixture, "incomplete_verification_record_review"],
    [fixtures.verificationRecordDigestMismatchFixture, "verification_record_review_digest_mismatch"],
    [fixtures.missingReviewStatusFixture, "missing_review_status"],
    [fixtures.missingReviewMetadataFixture, "missing_review_metadata"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.reviewDecisionAuthorityWordingAttemptBlockedFixture, "verifiedNoReviewAuthorityOccurred_required"],
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
    assertHeld(evaluateOro10xEvidencePackVerificationRecordReviewGate(input), blocker);
  }

  const redacted = evaluateOro10xEvidencePackVerificationRecordReviewGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(
    redacted.verificationRecordReview.sanitizedEvidencePackVerificationRecordReview
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro10xEvidencePackVerificationRecordReviewGateFixtures().map(
    evaluateOro10xEvidencePackVerificationRecordReviewGate
  );
  assert(allReports.length >= 24, "fixture set must cover requested ORO-10X scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10X fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10xDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10xDetailedSmoke,
  PASS_MESSAGE,
};
