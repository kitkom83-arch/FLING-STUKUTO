"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10vFinalApprovalDecisionEvidencePackVerificationGate");
const fixtures = require("../game-provider-mock/oro10vFinalApprovalDecisionEvidencePackVerificationGateFixtures");

const {
  DEPENDS_ON_ORO10U_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10U_PASSED_KEY,
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS,
  ORO10V_PHASE,
  ORO10V_RESULT_KEY,
  ORO10V_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10U_ONLY_KEY,
  assertOro10vNoRuntimeAuthorization,
  buildOro10vEvidencePackVerificationEvidence,
  buildOro10vSafetySummary,
  buildOro10vStaticEvidencePackVerificationDigest,
  evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate,
  normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput,
  validateOro10vFinalApprovalDecisionEvidencePackVerificationGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10U = "docs/ORO_10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE.md";
const DOC_10V = "docs/ORO_10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10vFinalApprovalDecisionEvidencePackVerificationGate.js";
const FIXTURES = "src/game-provider-mock/oro10vFinalApprovalDecisionEvidencePackVerificationGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10vFinalApprovalDecisionEvidencePackVerificationGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10vSmoke.js";
const SCRIPT = "smoke:oro-10v";
const DETAIL_SCRIPT = "smoke:oro-10v:detailed";
const PASS_MESSAGE = "ORO-10V final approval decision evidence pack verification gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10V final approval decision evidence pack verification gate smoke: FAIL";

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

function assertNoLongOro10vFilenames() {
  const longPattern =
    /ORO_10V_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|VERIFICATION_VERIFICATION|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_10V, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10V|oro10v/.test(file));
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
  for (const file of [DOC_10V, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10v = readRequired(DOC_10V);
  for (const marker of [
    "# ORO-10V Final Approval Decision Evidence Pack Verification Gate",
    "ORO-10U closed.",
    "ORO-10V current.",
    "ORO-10V continues from ORO-10U.",
    "evidence-pack-verification-only and static/mock only",
    "Source model: oro10u_static_mock_final_approval_decision_evidence_pack.",
    "mock_evidence_pack_verification_prepared",
    "mock_evidence_pack_verified_for_review_only",
    "mock_evidence_pack_verification_failed",
    "mock_evidence_pack_digest_mismatch",
    "mock_evidence_pack_evidence_missing",
    "mock_evidence_pack_incomplete",
    "mock_evidence_pack_expired",
    "mock_evidence_pack_conflict",
    "mock_evidence_pack_invalid",
    "fail_closed",
    "ORO-10V verified_for_review_only is not final approval issued.",
    "ORO-10V evidence pack verification pass is not signed runtime approval.",
    "ORO-10V evidence pack verification digest is not actual signed artifact verification.",
    "ORO-10V evidence pack verification does not authorize runtime.",
    "ORO-10V evidence pack verification does not authorize route mount.",
    "ORO-10V evidence pack verification does not authorize external call.",
    "ORO-10V evidence pack verification does not authorize game launch.",
    "ORO-10V evidence pack verification does not authorize runtime approval chain rollover.",
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
    "no_signed_runtime_approval",
    "no_signed_approval_artifact_accepted",
    "no_actual_signed_approval_artifact_verified",
    "no_signed_approval_artifact_acceptance",
    "no_actual_signed_approval_artifact_verification",
    "no_final_approval_issued",
    "no_final_approval_decision_runtime_authorization",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "static_mock_final_approval_decision_evidence_pack_verification_only",
    "non_authorizing_decision_evidence_pack_verification_only",
    ORO10V_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10v.includes(marker), `${DOC_10V} missing marker ${marker}.`);
  }

  const doc10u = readRequired(DOC_10U);
  for (const marker of [
    "## ORO-10V Handoff",
    "ORO-10U closed.",
    "ORO-10V current.",
    DOC_10V,
    "ORO-10V next phase = approval_chain_rollover_final_approval_decision_evidence_pack_verification_gate_only",
    "ORO-10V final approval decision evidence pack verification is static/mock only.",
    "ORO-10V evidence pack verification does not authorize runtime.",
  ]) {
    assert(doc10u.includes(marker), `${DOC_10U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10V, SCRIPT, DETAIL_SCRIPT, "oro10v"]) {
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
        "## ORO-10V Final Approval Decision Evidence Pack Verification Gate Mapping",
        "ORO-10U closed.",
        "ORO-10V current.",
        ORO10V_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10V Current", "ORO-10U closed.", "ORO-10V current.", ORO10V_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10V current/final approval decision evidence pack verification gate",
        "ORO-10U closed.",
        "`smoke:oro-10v`",
        "`smoke:oro-10v:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10V Final Approval Decision Evidence Pack Verification Gate Coverage",
        "ORO-10U closed; ORO-10V current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10V files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10V]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10V_RESULT_KEY,
    DEPENDS_ON_ORO10U_KEY,
    ORO10U_PASSED_KEY,
    VERIFIED_ORO10U_ONLY_KEY,
    "oro10uStatus",
    "oro10uScope",
    "oro10uClosed",
    "finalApprovalDecisionEvidencePackVerificationGateScope",
    "finalApprovalDecisionEvidencePackVerificationStatus",
    "evidencePackVerificationOutcome",
    "evidencePackVerificationEvidence",
    "staticEvidencePackVerificationDigest",
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
  assert.strictEqual(summary.phase, ORO10V_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10V_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10U_KEY], true);
  assert.strictEqual(summary[ORO10U_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10U_ONLY_KEY], true);
  assert.strictEqual(summary.oro10uClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionEvidencePackVerificationGateScope, ORO10V_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionEvidencePackVerificationStatus, expectedStatus);
  assert(/^oro10v-static-evidence-pack-verification-digest-[a-f0-9]{8}$/.test(summary.staticEvidencePackVerificationDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10V pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10V_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.finalApprovalDecisionEvidencePackVerificationStatus,
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["evidence_pack_verification_blocked", "fail_closed"].includes(summary.evidencePackVerificationOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10V hold output", JSON.stringify(summary));
}

function runOro10vDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10vFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10V_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10V_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10vEvidencePackVerificationEvidence, "function");
  assert.strictEqual(typeof buildOro10vStaticEvidencePackVerificationDigest, "function");
  assert.strictEqual(typeof normalizeOro10vFinalApprovalDecisionEvidencePackVerificationInput, "function");
  assert.strictEqual(typeof assertOro10vNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10vFinalApprovalDecisionEvidencePackVerificationGate, "function");
  assert.strictEqual(typeof buildOro10vSafetySummary, "function");

  assertHappyPath(
    evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(
      fixtures.validEvidencePackVerificationPreparedFixture
    ),
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(fixtures.reviewOnlyVerifiedEvidencePackFixture),
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY
  );
  assertHappyPath(
    evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(fixtures.rejectedEvidencePackVerificationFixture),
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10vFinalApprovalDecisionEvidencePackVerificationGate(
      fixtures.changesRequiredEvidencePackVerificationFixture
    ),
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED
  );

  const digestA = buildOro10vStaticEvidencePackVerificationDigest({ phase: ORO10V_PHASE, status: "same" });
  const digestB = buildOro10vStaticEvidencePackVerificationDigest({ status: "same", phase: ORO10V_PHASE });
  assert.strictEqual(digestA, digestB, "static evidence pack verification digest must be deterministic.");
  assertNoSensitiveShape("ORO-10V digest", digestA);

  const safety = buildOro10vSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredEvidencePackVerificationFixture, "evidence_pack_expired"],
    [fixtures.conflictingEvidencePackVerificationFixture, "evidence_pack_conflict"],
    [fixtures.invalidEvidencePackIdFixture, "invalid_evidence_pack_id"],
    [fixtures.missingEvidencePackEvidenceFixture, "missing_evidence_pack_evidence"],
    [fixtures.incompleteEvidencePackFixture, "incomplete_evidence_pack"],
    [fixtures.evidencePackDigestMismatchFixture, "evidence_pack_digest_mismatch"],
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
    assertHeld(evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(input), blocker);
  }

  const redacted = evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate(
    fixtures.secretShapedFieldsAreRedactedFixture
  );
  assertHappyPath(redacted, ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(
    redacted.evidencePackVerificationEvidence.sanitizedEvidencePackVerificationEvidence
  );
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(redactedText.includes("guardedCredentialMarkerRedacted"), "guarded field name must be neutralized.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-two"), "client marker fixture value must not leak.");
  assert(!redactedText.includes("guarded-credential-marker-redacted-three"), "device marker fixture value must not leak.");

  const allReports = fixtures.buildOro10vFinalApprovalDecisionEvidencePackVerificationGateFixtures().map(
    evaluateOro10vFinalApprovalDecisionEvidencePackVerificationGate
  );
  assert(allReports.length >= 19, "fixture set must cover requested ORO-10V scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10V fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10vDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10vDetailedSmoke,
  PASS_MESSAGE,
};
