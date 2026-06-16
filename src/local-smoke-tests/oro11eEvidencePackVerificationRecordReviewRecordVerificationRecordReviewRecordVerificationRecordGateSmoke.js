"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate");
const fixtures = require("../game-provider-mock/oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFixtures");

const {
  DEPENDS_ON_ORO11D_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO11D_PASSED_KEY,
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
  ORO11E_PHASE,
  ORO11E_RESULT_KEY,
  ORO11E_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO11D_ONLY_KEY,
  assertOro11eNoRuntimeAuthorization,
  buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecord,
  buildOro11eSafetySummary,
  buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest,
  evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate,
  normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput,
  validateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11D =
  "docs/ORO_11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE.md";
const DOC_11E =
  "docs/ORO_11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY =
  "src/game-provider-mock/oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate.js";
const FIXTURES =
  "src/game-provider-mock/oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11eSmoke.js";
const SCRIPT = "smoke:oro-11e";
const DETAIL_SCRIPT = "smoke:oro-11e:detailed";
const PASS_MESSAGE =
  "ORO-11E evidence pack verification record review record verification record review record verification record gate smoke: PASS";
const FAIL_MESSAGE =
  "ORO-11E evidence pack verification record review record verification record review record verification record gate smoke: FAIL";

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

function assertNoLongOro11eFilenames() {
  const repeatedPattern =
    /ORO_11E_.*(FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION_VERIFICATION|RECORD_RECORD_RECORD_RECORD_RECORD|REVIEW_REVIEW_REVIEW|GATE_GATE|AUDIT_AUDIT)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_11E, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_11E|oro11e/.test(file));
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
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded credential URL shape.`);
}

function assertNoExactGuardedMarkerInOro11eFiles() {
  const exactHeader = ["Author", "ization", ":"].join("");
  const credentialSchemes = [["Be", "arer"].join(""), ["Ba", "sic"].join("")];
  for (const file of [DOC_11E, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    const text = readRequired(file);
    assert(!text.includes(exactHeader), `${file} must not contain exact guarded header marker.`);
    for (const marker of credentialSchemes) assert(!text.includes(marker), `${file} must not contain guarded scheme marker.`);
  }
}

function assertDocsAndRegistration() {
  for (const file of [DOC_11D, DOC_11E, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc11e = readRequired(DOC_11E);
  for (const marker of [
    "# ORO-11E Evidence Pack Verification Record Review Record Verification Record Review Record Verification Record Gate",
    "ORO-11D closed.",
    "ORO-11E current.",
    ORO11E_SCOPE,
    "verification-record-gate-only / static/mock only",
    "ORO-11D review record verification as source must be present.",
    "ORO-11C review record reference only must be present.",
    "ORO-11B review reference only must be present.",
    "ORO-11A verification record reference only must be present.",
    "ORO-10Z verification result reference only must be present.",
    "ORO-10Y review record reference only must be present.",
    "ORO-10X review reference only must be present.",
    "ORO-10W record reference only must be present.",
    "ORO-10V verification output reference only must be present.",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_prepared",
    "mock_verification_record_review_record_verification_record_review_record_verification_recorded_for_review_only",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_rejected",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_changes_required",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_digest_mismatch",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_missing_prior_verification",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_missing_evidence",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_incomplete",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_expired",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_conflict",
    "mock_verification_record_review_record_verification_record_review_record_verification_record_invalid",
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
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_evidence_pack_verification_record_review_record_verification_record_only",
    "non_authorizing_evidence_pack_verification_record_review_record_verification_record_only",
    SCRIPT,
    DETAIL_SCRIPT,
    "Next phase requires separate gate.",
  ]) {
    assert(doc11e.includes(marker), `${DOC_11E} missing marker ${marker}.`);
  }

  const doc11d = readRequired(DOC_11D);
  for (const marker of [
    "## ORO-11E Handoff",
    "ORO-11E current.",
    DOC_11E,
    ORO11E_SCOPE,
    "ORO-11E verification record does not authorize runtime.",
  ]) {
    assert(doc11d.includes(marker), `${DOC_11D} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11E, SCRIPT, DETAIL_SCRIPT, "oro11e"]) {
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
        "## ORO-11E Evidence Pack Verification Record Review Record Verification Record Review Record Verification Record Gate Mapping",
        "ORO-11D closed.",
        "ORO-11E current.",
        ORO11E_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11E Current", "ORO-11D closed.", "ORO-11E current.", ORO11E_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-11E current/evidence pack verification record review record verification record review record verification record gate",
        "ORO-11D closed.",
        "`smoke:oro-11e`",
        "`smoke:oro-11e:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-11E Evidence Pack Verification Record Review Record Verification Record Review Record Verification Record Gate Coverage",
        "ORO-11D closed; ORO-11E current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11E files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11E]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO11E_RESULT_KEY,
    DEPENDS_ON_ORO11D_KEY,
    ORO11D_PASSED_KEY,
    VERIFIED_ORO11D_ONLY_KEY,
    "oro11dPhase",
    "oro11dScope",
    "oro11dClosed",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope",
    "evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus",
    "verificationRecordOutcome",
    "verificationRecord",
    "staticVerificationRecordDigest",
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
  assert.strictEqual(summary.phase, ORO11E_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11E_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO11D_KEY], true);
  assert.strictEqual(summary[ORO11D_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO11D_ONLY_KEY], true);
  assert.strictEqual(summary.oro11dClosed, true);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope,
    ORO11E_SCOPE
  );
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus,
    expectedStatus
  );
  assert(/^oro11e-static-verification-record-digest-[a-f0-9]{8}$/.test(summary.staticVerificationRecordDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateGate, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11E pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO11E_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus,
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["record_blocked", "fail_closed"].includes(summary.verificationRecordOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11E hold output", JSON.stringify(summary));
}

function runOro11eDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11eFilenames();
  assertNoExactGuardedMarkerInOro11eFiles();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO11E_PHASE, "string");
  assert.strictEqual(typeof helper.ORO11E_SCOPE, "string");
  assert.strictEqual(
    typeof helper.ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecord,
    "function"
  );
  assert.strictEqual(
    typeof buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest,
    "function"
  );
  assert.strictEqual(
    typeof normalizeOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordInput,
    "function"
  );
  assert.strictEqual(typeof assertOro11eNoRuntimeAuthorization, "function");
  assert.strictEqual(
    typeof validateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate,
    "function"
  );
  assert.strictEqual(typeof buildOro11eSafetySummary, "function");

  assertHappyPath(
    evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.validOro11dVerificationResultRecordPreparedFixture
    ),
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.reviewOnlyVerificationResultRecordedForReviewOnlyFixture
    ),
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.rejectedVerificationRecordFixture
    ),
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
      fixtures.changesRequiredVerificationRecordFixture
    ),
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest({
    phase: ORO11E_PHASE,
    status: "same",
  });
  const digestB = buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest({
    status: "same",
    phase: ORO11E_PHASE,
  });
  assert.strictEqual(digestA, digestB, "static verification record digest must be deterministic.");
  assertNoSensitiveShape("ORO-11E digest", digestA);

  const safety = buildOro11eSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredVerificationRecordFixture, "verification_record_expired"],
    [fixtures.conflictingVerificationRecordFixture, "verification_record_conflict"],
    [fixtures.invalidPriorGateMarkerFixture, "missing_oro11d_review_record_verification"],
    [fixtures.missingPriorOro11dVerificationFixture, "missing_oro11d_review_record_verification"],
    [fixtures.incompleteVerificationResultFixture, "incomplete_verification_record"],
    [fixtures.verificationDigestMismatchFixture, "verification_record_digest_mismatch"],
    [fixtures.missingVerificationRecordEvidenceFixture, "missing_verification_record_evidence"],
    [fixtures.missingVerificationRecordStatusFixture, "missing_verification_record_status"],
    [fixtures.missingVerificationRecordMetadataFixture, "missing_verification_record_metadata"],
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
    [fixtures.liveExecutionAttemptBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
  ];
  for (const [input, blocker] of heldCases) {
    assertHeld(
      evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(input),
      blocker
    );
  }

  const redacted = evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(
    redacted,
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
  const redactedText = JSON.stringify(
    redacted.verificationRecord.sanitizedEvidencePackVerificationRecordReviewRecordVerificationRecord
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "guarded fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-four"), "database marker fixture value must not leak.");

  const allReports =
    fixtures.buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFixtures().map(
      evaluateOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate
    );
  assert(allReports.length >= 25, "fixture set must cover requested ORO-11E scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11E fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11eDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11eDetailedSmoke,
  PASS_MESSAGE,
};
