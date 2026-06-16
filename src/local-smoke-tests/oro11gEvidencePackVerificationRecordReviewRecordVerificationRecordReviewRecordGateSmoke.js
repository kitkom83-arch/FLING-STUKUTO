"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate");
const fixtures = require("../game-provider-mock/oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures");

const {
  DEPENDS_ON_ORO11F_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO11F_PASSED_KEY,
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO11G_PHASE,
  ORO11G_RESULT_KEY,
  ORO11G_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO11F_ONLY_KEY,
  assertOro11gNoRuntimeAuthorization,
  buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord,
  buildOro11gSafetySummary,
  buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest,
  evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
  normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput,
  validateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11F =
  "docs/ORO_11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE.md";
const DOC_11G =
  "docs/ORO_11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY =
  "src/game-provider-mock/oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate.js";
const FIXTURES =
  "src/game-provider-mock/oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11gSmoke.js";
const SCRIPT = "smoke:oro-11g";
const DETAIL_SCRIPT = "smoke:oro-11g:detailed";
const PASS_MESSAGE =
  "ORO-11G evidence pack verification record review record verification record review record gate smoke: PASS";
const FAIL_MESSAGE =
  "ORO-11G evidence pack verification record review record verification record review record gate smoke: FAIL";

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

function assertNoLongOro11gFilenames() {
  const repeatedPattern =
    /ORO_11G_.*(FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD_RECORD_RECORD|REVIEW_REVIEW_REVIEW_REVIEW|GATE_GATE|AUDIT_AUDIT)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_11G, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_11G|oro11g/.test(file));
  assert.deepStrictEqual([...tracked, ...untracked].filter((file) => repeatedPattern.test(file)), []);
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
    ["DATABASE", "_", "URL", "="].join(""),
    ["device", "Id", "="].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const uppercasePinMarker = ["P", "I", "N"].join("");
  assert(!new RegExp(`\\b${uppercasePinMarker}\\s*[:=]`).test(scanned), `${label} includes guarded uppercase marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact guarded shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded guarded URL shape.`);
}

function assertNoExactGuardedMarkerInOro11gFiles() {
  const exactHeader = ["Author", "ization", ":"].join("");
  const credentialSchemes = [["Be", "arer"].join(""), ["Ba", "sic"].join("")];
  for (const file of [DOC_11G, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    const text = readRequired(file);
    assert(!text.includes(exactHeader), `${file} must not contain exact guarded header marker.`);
    for (const marker of credentialSchemes) assert(!text.includes(marker), `${file} must not contain guarded scheme marker.`);
  }
}

function assertDocsAndRegistration() {
  for (const file of [DOC_11F, DOC_11G, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc11g = readRequired(DOC_11G);
  for (const marker of [
    "# ORO-11G Evidence Pack Verification Record Review Record Verification Record Review Record Gate",
    "ORO-11F closed.",
    "ORO-11G current.",
    ORO11G_SCOPE,
    "verification-record-review-record-gate-only / static/mock only",
    "ORO-11F verification record review as source must be present.",
    "ORO-11E verification record reference only must be present.",
    "ORO-11D review record verification reference only must be present.",
    "ORO-11C review record reference only must be present.",
    "ORO-11B review reference only must be present.",
    "ORO-11A verification record reference only must be present.",
    "ORO-10Z verification result reference only must be present.",
    "ORO-10Y review record reference only must be present.",
    "ORO-10X review reference only must be present.",
    "ORO-10W record reference only must be present.",
    "ORO-10V verification output reference only must be present.",
    "mock_verification_record_review_record_verification_record_review_record_prepared",
    "mock_verification_record_review_record_verification_record_review_recorded_for_review_only",
    "mock_verification_record_review_record_verification_record_review_record_rejected",
    "mock_verification_record_review_record_verification_record_review_record_changes_required",
    "mock_verification_record_review_record_verification_record_review_record_digest_mismatch",
    "mock_verification_record_review_record_verification_record_review_record_missing_prior_review",
    "mock_verification_record_review_record_verification_record_review_record_missing_evidence",
    "mock_verification_record_review_record_verification_record_review_record_incomplete",
    "mock_verification_record_review_record_verification_record_review_record_expired",
    "mock_verification_record_review_record_verification_record_review_record_conflict",
    "mock_verification_record_review_record_verification_record_review_record_invalid",
    "fail_closed",
    "verification record review record is not final approval issued",
    "verification record review record is not review approval decision authority",
    "verification record review record is not audit approval",
    "verification record review record is not finalization",
    "verification record review record is not signed runtime approval",
    "verification record review record is not signed approval artifact acceptance",
    "verification record review record is not actual signed artifact verification",
    "verification record review record does not authorize runtime",
    "verification record review record does not authorize route mount",
    "verification record review record does not authorize external call",
    "verification record review record does not authorize game launch",
    "verification record review record does not authorize runtime approval chain rollover",
    "digest mismatch, missing prior review, missing evidence, incomplete, invalid, conflict, and expired verification record review records are record_blocked or fail_closed",
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
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_record_review_record_only",
    SCRIPT,
    DETAIL_SCRIPT,
    "Next phase requires separate gate.",
  ]) {
    assert(doc11g.includes(marker), `${DOC_11G} missing marker ${marker}.`);
  }

  const doc11f = readRequired(DOC_11F);
  for (const marker of [
    "## ORO-11G Handoff",
    "ORO-11G current.",
    DOC_11G,
    ORO11G_SCOPE,
    "ORO-11G verification record review record does not authorize runtime.",
  ]) {
    assert(doc11f.includes(marker), `${DOC_11F} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11G, SCRIPT, DETAIL_SCRIPT, "oro11g"]) {
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
        "## ORO-11G Evidence Pack Verification Record Review Record Verification Record Review Record Gate Mapping",
        "ORO-11F closed.",
        "ORO-11G current.",
        ORO11G_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11G Current", "ORO-11F closed.", "ORO-11G current.", ORO11G_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-11G current/evidence pack verification record review record verification record review record gate",
        "ORO-11F closed.",
        "`smoke:oro-11g`",
        "`smoke:oro-11g:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-11G Evidence Pack Verification Record Review Record Verification Record Review Record Gate Coverage",
        "ORO-11F closed; ORO-11G current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11G files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11G]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO11G_RESULT_KEY,
    DEPENDS_ON_ORO11F_KEY,
    ORO11F_PASSED_KEY,
    VERIFIED_ORO11F_ONLY_KEY,
    "oro11fPhase",
    "oro11fScope",
    "oro11fClosed",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus",
    "verificationRecordReviewRecordOutcome",
    "verificationRecordReviewRecord",
    "staticVerificationRecordReviewRecordDigest",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateGate",
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary, expectedStatus) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11G_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11G_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO11F_KEY], true);
  assert.strictEqual(summary[ORO11F_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO11F_ONLY_KEY], true);
  assert.strictEqual(summary.oro11fClosed, true);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope, ORO11G_SCOPE);
  assert.strictEqual(summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus, expectedStatus);
  assert(/^oro11g-static-verification-record-review-record-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordReviewRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateGate, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11G pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO11G_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus,
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["record_blocked", "fail_closed"].includes(summary.verificationRecordReviewRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11G hold output", JSON.stringify(summary));
}

function runOro11gDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11gFilenames();
  assertNoExactGuardedMarkerInOro11gFiles();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO11G_PHASE, "string");
  assert.strictEqual(typeof helper.ORO11G_SCOPE, "string");
  assert.strictEqual(
    typeof helper.ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord, "function");
  assert.strictEqual(typeof buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest, "function");
  assert.strictEqual(typeof normalizeOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordInput, "function");
  assert.strictEqual(typeof assertOro11gNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate, "function");
  assert.strictEqual(typeof buildOro11gSafetySummary, "function");

  assertHappyPath(
    evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
      fixtures.validOro11fVerificationRecordReviewRecordPreparedFixture
    ),
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
      fixtures.reviewOnlyResultRecordedForReviewOnlyFixture
    ),
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
      fixtures.rejectedVerificationRecordReviewRecordFixture
    ),
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
      fixtures.changesRequiredVerificationRecordReviewRecordFixture
    ),
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest({
    phase: ORO11G_PHASE,
    status: "same",
  });
  const digestB = buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest({
    status: "same",
    phase: ORO11G_PHASE,
  });
  assert.strictEqual(digestA, digestB, "static verification record review record digest must be deterministic.");
  assertNoSensitiveShape("ORO-11G digest", digestA);

  const safety = buildOro11gSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordReviewRecordFixture, "verification_record_review_record_expired"],
    [fixtures.conflictingVerificationRecordReviewRecordFixture, "verification_record_review_record_conflict"],
    [fixtures.invalidPriorGateMarkerFixture, "missing_oro11f_verification_record_review"],
    [fixtures.missingPriorOro11fReviewFixture, "missing_oro11f_verification_record_review"],
    [fixtures.incompleteVerificationRecordReviewFixture, "incomplete_verification_record_review_record"],
    [fixtures.verificationRecordReviewDigestMismatchFixture, "verification_record_review_record_digest_mismatch"],
    [fixtures.missingReviewRecordEvidenceFixture, "missing_verification_record_review_record_evidence"],
    [fixtures.missingReviewRecordStatusFixture, "missing_verification_record_review_record_status"],
    [fixtures.missingReviewRecordMetadataFixture, "missing_verification_record_review_record_metadata"],
    [fixtures.runtimeAuthorizationWordingAttemptBlockedFixture, "verifiedNoRuntimeAuthorizationOccurred_required"],
    [fixtures.finalApprovalIssuedWordingAttemptBlockedFixture, "verifiedNoFinalApprovalIssued_required"],
    [fixtures.reviewDecisionAuthorityWordingAttemptBlockedFixture, "verifiedNoReviewAuthorityOccurred_required"],
    [fixtures.auditAuthorityWordingAttemptBlockedFixture, "auditAuthorityNotIssued_required"],
    [fixtures.finalizationWordingAttemptBlockedFixture, "verifiedNoFinalizationOccurred_required"],
    [fixtures.signedRuntimeApprovalWordingAttemptBlockedFixture, "signedRuntimeApprovalNotIssued_required"],
    [fixtures.signedApprovalArtifactAcceptedWordingAttemptBlockedFixture, "signedApprovalArtifactAcceptanceNotIssued_required"],
    [fixtures.actualSignedArtifactVerifiedWordingAttemptBlockedFixture, "actualSignedApprovalArtifactVerificationNotIssued_required"],
    [fixtures.routeMountAuthorizationAttemptBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.externalCallAuthorizationAttemptBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.gameLaunchAuthorizationAttemptBlockedFixture, "verifiedNoGameLaunchCallOccurred_required"],
    [fixtures.noWalletLedgerDbMigrationDeployMarkersFixture, "verifiedNoWalletMutationOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(input), blocker);
  }

  const redacted = evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(
    redacted,
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED
  );
  const redactedText = JSON.stringify(
    redacted.verificationRecordReviewRecord
      .sanitizedEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecord
  );
  assert(redactedText.includes("[REDACTED]"), "guarded fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-value-one"), "guarded fixture value must not leak.");
  assert(!redactedText.includes("guarded-value-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-value-three"), "device marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-value-four"), "database marker fixture value must not leak.");

  const allReports =
    fixtures.buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures().map(
      evaluateOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate
    );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-11G scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11G fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11gDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11gDetailedSmoke,
  PASS_MESSAGE,
};
