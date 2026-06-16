"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate");
const fixtures = require("../game-provider-mock/oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFixtures");

const {
  DEPENDS_ON_ORO11C_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO11C_PASSED_KEY,
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
  ORO11D_PHASE,
  ORO11D_RESULT_KEY,
  ORO11D_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO11C_ONLY_KEY,
  assertOro11dNoRuntimeAuthorization,
  buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationEvidence,
  buildOro11dSafetySummary,
  buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest,
  evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate,
  normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput,
  validateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11C = "docs/ORO_11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE.md";
const DOC_11D =
  "docs/ORO_11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY =
  "src/game-provider-mock/oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate.js";
const FIXTURES =
  "src/game-provider-mock/oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11dSmoke.js";
const SCRIPT = "smoke:oro-11d";
const DETAIL_SCRIPT = "smoke:oro-11d:detailed";
const PASS_MESSAGE =
  "ORO-11D evidence pack verification record review record verification record review record verification gate smoke: PASS";
const FAIL_MESSAGE =
  "ORO-11D evidence pack verification record review record verification record review record verification gate smoke: FAIL";

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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function assertNoLongOro11dFilenames() {
  const longPattern =
    /ORO_11D_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD_RECORD|REVIEW_REVIEW_REVIEW|GATE_GATE|AUDIT_AUDIT)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_11D, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_11D|oro11d/.test(file));
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
  for (const file of [DOC_11C, DOC_11D, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc11d = readRequired(DOC_11D);
  for (const marker of [
    "# ORO-11D Evidence Pack Verification Record Review Record Verification Record Review Record Verification Gate",
    "ORO-11C closed.",
    "ORO-11D current.",
    "ORO-11D continues from ORO-11C.",
    "evidence pack verification record review record verification record review record verification gate only",
    "review-record-verification-gate-only / static/mock only",
    "Static/mock review record verification source model: oro11c_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record.",
    "ORO-11C verification record review record as source must be present.",
    "ORO-11B verification record review reference only must be present.",
    "ORO-11A verification record reference only must be present.",
    "ORO-10Z verification result reference only must be present.",
    "ORO-10Y review record reference only must be present.",
    "ORO-10X review reference only must be present.",
    "ORO-10W record reference only must be present.",
    "ORO-10V verification output reference only must be present.",
    "mock_verification_record_review_record_verification_record_review_record_verification_prepared",
    "mock_verification_record_review_record_verification_record_review_record_verified_for_review_only",
    "mock_verification_record_review_record_verification_record_review_record_verification_rejected",
    "mock_verification_record_review_record_verification_record_review_record_verification_changes_required",
    "mock_verification_record_review_record_verification_record_review_record_verification_digest_mismatch",
    "mock_verification_record_review_record_verification_record_review_record_verification_missing_prior_record",
    "mock_verification_record_review_record_verification_record_review_record_verification_missing_evidence",
    "mock_verification_record_review_record_verification_record_review_record_verification_incomplete",
    "mock_verification_record_review_record_verification_record_review_record_verification_expired",
    "mock_verification_record_review_record_verification_record_review_record_verification_conflict",
    "mock_verification_record_review_record_verification_record_review_record_verification_invalid",
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
    "digest mismatch, missing prior record, missing evidence, incomplete, invalid, conflict, and expired verification records are verification_blocked or fail_closed",
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
    "static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_verification_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_record_review_record_verification_only",
    ORO11D_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc11d.includes(marker), `${DOC_11D} missing marker ${marker}.`);
  }

  const doc11c = readRequired(DOC_11C);
  for (const marker of [
    "## ORO-11D Handoff",
    "ORO-11C closed.",
    "ORO-11D current.",
    DOC_11D,
    "ORO-11D next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_gate_only",
    "ORO-11D final approval decision evidence pack verification record review record verification record review record verification is static/mock only.",
    "ORO-11D verification record review record verification record review record verification does not authorize runtime.",
  ]) {
    assert(doc11c.includes(marker), `${DOC_11C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11D, SCRIPT, DETAIL_SCRIPT, "oro11d"]) {
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
        "## ORO-11D Evidence Pack Verification Record Review Record Verification Record Review Record Verification Gate Mapping",
        "ORO-11C closed.",
        "ORO-11D current.",
        ORO11D_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11D Current", "ORO-11C closed.", "ORO-11D current.", ORO11D_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-11D current/evidence pack verification record review record verification record review record verification gate",
        "ORO-11C closed.",
        "`smoke:oro-11d`",
        "`smoke:oro-11d:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-11D Evidence Pack Verification Record Review Record Verification Record Review Record Verification Gate Coverage",
        "ORO-11C closed; ORO-11D current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11D files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11D]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO11D_RESULT_KEY,
    DEPENDS_ON_ORO11C_KEY,
    ORO11C_PASSED_KEY,
    VERIFIED_ORO11C_ONLY_KEY,
    "oro11cPhase",
    "oro11cScope",
    "oro11cClosed",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus",
    "reviewRecordVerificationOutcome",
    "reviewRecordVerification",
    "staticReviewRecordVerificationDigest",
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
  assert.strictEqual(summary.phase, ORO11D_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11D_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO11C_KEY], true);
  assert.strictEqual(summary[ORO11C_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO11C_ONLY_KEY], true);
  assert.strictEqual(summary.oro11cClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope, ORO11D_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus, expectedStatus);
  assert(/^oro11d-static-review-record-verification-digest-[a-f0-9]{8}$/.test(summary.staticReviewRecordVerificationDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11D pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO11D_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus,
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["verification_blocked", "fail_closed"].includes(summary.reviewRecordVerificationOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11D hold output", JSON.stringify(summary));
}

function runOro11dDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11dFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO11D_PHASE, "string");
  assert.strictEqual(typeof helper.ORO11D_SCOPE, "string");
  assert.strictEqual(
    typeof helper.ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationEvidence,
    "function"
  );
  assert.strictEqual(
    typeof buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest,
    "function"
  );
  assert.strictEqual(
    typeof normalizeOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationInput,
    "function"
  );
  assert.strictEqual(typeof assertOro11dNoRuntimeAuthorization, "function");
  assert.strictEqual(
    typeof validateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate,
    "function"
  );
  assert.strictEqual(typeof buildOro11dSafetySummary, "function");

  assertHappyPath(
    evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
      fixtures.validOro11cVerificationRecordReviewRecordVerificationPreparedFixture
    ),
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
      fixtures.reviewOnlyRecordVerifiedForReviewOnlyFixture
    ),
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
      fixtures.rejectedVerificationRecordReviewRecordVerificationFixture
    ),
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
      fixtures.changesRequiredVerificationRecordReviewRecordVerificationFixture
    ),
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest({
    phase: ORO11D_PHASE,
    status: "same",
  });
  const digestB = buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest({
    status: "same",
    phase: ORO11D_PHASE,
  });
  assert.strictEqual(digestA, digestB, "static review record verification digest must be deterministic.");
  assertNoSensitiveShape("ORO-11D digest", digestA);

  const safety = buildOro11dSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordReviewRecordVerificationFixture, "review_record_verification_expired"],
    [fixtures.conflictingVerificationRecordReviewRecordVerificationFixture, "review_record_verification_conflict"],
    [
      fixtures.invalidPriorGateMarkerFixture,
      "missing_oro11c_evidence_pack_verification_record_review_record_verification_record_review_record_gate",
    ],
    [
      fixtures.missingPriorOro11cReviewRecordFixture,
      "missing_oro11c_evidence_pack_verification_record_review_record_verification_record_review_record_gate",
    ],
    [fixtures.incompleteVerificationRecordReviewRecordFixture, "incomplete_review_record_verification"],
    [fixtures.verificationRecordReviewRecordDigestMismatchFixture, "review_record_verification_digest_mismatch"],
    [fixtures.missingVerificationEvidenceFixture, "missing_review_record_verification_evidence"],
    [fixtures.missingVerificationStatusFixture, "missing_review_record_verification_status"],
    [fixtures.missingVerificationMetadataFixture, "missing_review_record_verification_metadata"],
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
    assertHeld(
      evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(input),
      blocker
    );
  }

  const redacted = evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(
    redacted,
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED
  );
  const redactedText = JSON.stringify(
    redacted.reviewRecordVerification.sanitizedEvidencePackVerificationRecordReviewRecordVerification
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports =
    fixtures.buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFixtures().map(
      evaluateOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate
    );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-11D scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11D fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11dDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11dDetailedSmoke,
  PASS_MESSAGE,
};
