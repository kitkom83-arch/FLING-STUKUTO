"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10uFinalApprovalDecisionEvidencePackGate");
const fixtures = require("../game-provider-mock/oro10uFinalApprovalDecisionEvidencePackGateFixtures");

const {
  DEPENDS_ON_ORO10T_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10T_PASSED_KEY,
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS,
  ORO10U_PHASE,
  ORO10U_RESULT_KEY,
  ORO10U_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10T_ONLY_KEY,
  assertOro10uNoRuntimeAuthorization,
  buildOro10uDecisionEvidencePack,
  buildOro10uSafetySummary,
  buildOro10uStaticEvidencePackDigest,
  evaluateOro10uFinalApprovalDecisionEvidencePackGate,
  normalizeOro10uFinalApprovalDecisionEvidencePackInput,
  validateOro10uFinalApprovalDecisionEvidencePackGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10T = "docs/ORO_10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE.md";
const DOC_10U = "docs/ORO_10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10uFinalApprovalDecisionEvidencePackGate.js";
const FIXTURES = "src/game-provider-mock/oro10uFinalApprovalDecisionEvidencePackGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10uFinalApprovalDecisionEvidencePackGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10uSmoke.js";
const SCRIPT = "smoke:oro-10u";
const DETAIL_SCRIPT = "smoke:oro-10u:detailed";
const PASS_MESSAGE = "ORO-10U final approval decision evidence pack gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10U final approval decision evidence pack gate smoke: FAIL";

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

function assertNoLongOro10uFilenames() {
  const longPattern =
    /ORO_10U_.*(FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_FINALIZATION|FINALIZATION_FINALIZATION|APPROVAL_APPROVAL|DECISION_DECISION|EVIDENCE_EVIDENCE|PACK_PACK|GATE_GATE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  const expected = [DOC_10U, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  const actual = [...tracked, ...untracked].filter((file) => /ORO_10U|oro10u/.test(file));
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
  for (const file of [DOC_10U, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10u = readRequired(DOC_10U);
  for (const marker of [
    "# ORO-10U Final Approval Decision Evidence Pack Gate",
    "ORO-10T closed.",
    "ORO-10U current.",
    "ORO-10U continues from ORO-10T.",
    "decision evidence pack gate only",
    "evidence-pack-only static/mock decision record",
    "mock_evidence_pack_prepared",
    "mock_evidence_pack_review_only_ready",
    "mock_evidence_pack_rejected",
    "mock_evidence_pack_changes_required",
    "mock_evidence_pack_verification_failed",
    "mock_evidence_pack_hash_mismatch",
    "mock_evidence_pack_evidence_missing",
    "mock_evidence_pack_expired",
    "mock_evidence_pack_conflict",
    "mock_evidence_pack_invalid",
    "fail_closed",
    "evidence pack prepared is not final approval issued",
    "evidence pack ready is not signed runtime approval",
    "evidence digest is not actual signed artifact verification",
    "evidence pack does not authorize runtime",
    "evidence pack does not authorize route mount",
    "evidence pack does not authorize external call",
    "evidence pack does not authorize game launch",
    "evidence pack does not authorize runtime approval chain rollover",
    "hash mismatch, missing evidence, invalid, conflict, and expired packs are evidence_pack_blocked or fail_closed",
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
    "static_mock_final_approval_decision_evidence_pack_only",
    "non_authorizing_decision_evidence_pack_only",
    ORO10U_SCOPE,
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10u.includes(marker), `${DOC_10U} missing marker ${marker}.`);
  }

  const doc10t = readRequired(DOC_10T);
  for (const marker of [
    "## ORO-10U Handoff",
    "ORO-10T closed.",
    "ORO-10U current.",
    DOC_10U,
    "ORO-10U next phase = approval_chain_rollover_final_approval_decision_evidence_pack_gate_only",
    "ORO-10U final approval decision evidence pack is static/mock only.",
    "ORO-10U evidence pack does not authorize runtime.",
  ]) {
    assert(doc10t.includes(marker), `${DOC_10T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10U, SCRIPT, DETAIL_SCRIPT, "oro10u"]) {
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
        "## ORO-10U Final Approval Decision Evidence Pack Gate Mapping",
        "ORO-10T closed.",
        "ORO-10U current.",
        ORO10U_SCOPE,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-10U Current", "ORO-10T closed.", "ORO-10U current.", ORO10U_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-10U current/final approval decision evidence pack gate",
        "ORO-10T closed.",
        "`smoke:oro-10u`",
        "`smoke:oro-10u:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-10U Final Approval Decision Evidence Pack Gate Coverage",
        "ORO-10T closed; ORO-10U current.",
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10U files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10U]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10U_RESULT_KEY,
    DEPENDS_ON_ORO10T_KEY,
    ORO10T_PASSED_KEY,
    VERIFIED_ORO10T_ONLY_KEY,
    "oro10tStatus",
    "oro10tScope",
    "oro10tClosed",
    "finalApprovalDecisionEvidencePackGateScope",
    "finalApprovalDecisionEvidencePackStatus",
    "evidencePackOutcome",
    "decisionEvidencePack",
    "staticEvidencePackDigest",
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
  assert.strictEqual(summary.phase, ORO10U_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10U_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10T_KEY], true);
  assert.strictEqual(summary[ORO10T_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10T_ONLY_KEY], true);
  assert.strictEqual(summary.oro10tClosed, true);
  assert.strictEqual(summary.finalApprovalDecisionEvidencePackGateScope, ORO10U_SCOPE);
  assert.strictEqual(summary.finalApprovalDecisionEvidencePackStatus, expectedStatus);
  assert(/^oro10u-static-evidence-pack-digest-[a-f0-9]{8}$/.test(summary.staticEvidencePackDigest));
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateApproval, true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10U pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10U_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(
    summary.finalApprovalDecisionEvidencePackStatus,
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.FAIL_CLOSED
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert(["evidence_pack_blocked", "fail_closed"].includes(summary.evidencePackOutcome));
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10U hold output", JSON.stringify(summary));
}

function runOro10uDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10uFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10U_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10U_SCOPE, "string");
  assert.strictEqual(typeof helper.ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS, "object");
  assert.strictEqual(typeof buildOro10uDecisionEvidencePack, "function");
  assert.strictEqual(typeof buildOro10uStaticEvidencePackDigest, "function");
  assert.strictEqual(typeof normalizeOro10uFinalApprovalDecisionEvidencePackInput, "function");
  assert.strictEqual(typeof assertOro10uNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof validateOro10uFinalApprovalDecisionEvidencePackGate, "function");
  assert.strictEqual(typeof buildOro10uSafetySummary, "function");

  assertHappyPath(
    evaluateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.validDecisionEvidencePackPreparedFixture),
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED
  );
  assertHappyPath(
    evaluateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.reviewOnlyReadyDecisionEvidencePackFixture),
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY
  );
  assertHappyPath(
    evaluateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.rejectedDecisionEvidencePackFixture),
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REJECTED
  );
  assertHappyPath(
    validateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.changesRequiredDecisionEvidencePackFixture),
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CHANGES_REQUIRED
  );
  assertHappyPath(
    evaluateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.verificationFailedDecisionEvidencePackFixture),
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED
  );

  const digestA = buildOro10uStaticEvidencePackDigest({ phase: ORO10U_PHASE, status: "same" });
  const digestB = buildOro10uStaticEvidencePackDigest({ status: "same", phase: ORO10U_PHASE });
  assert.strictEqual(digestA, digestB, "static evidence pack digest must be deterministic.");
  assertNoSensitiveShape("ORO-10U digest", digestA);

  const safety = buildOro10uSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.expiredDecisionEvidencePackFixture, "evidence_pack_expired"],
    [fixtures.conflictingDecisionEvidencePackFixture, "evidence_pack_conflict"],
    [fixtures.invalidVerifiedRecordIdFixture, "invalid_verified_record_id"],
    [fixtures.missingDecisionRecordEvidenceFixture, "missing_decision_record_evidence"],
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
    assertHeld(evaluateOro10uFinalApprovalDecisionEvidencePackGate(input), blocker);
  }

  const redacted = evaluateOro10uFinalApprovalDecisionEvidencePackGate(fixtures.secretShapedFieldsAreRedactedFixture);
  assertHappyPath(redacted, ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED);
  const redactedText = JSON.stringify(redacted.decisionEvidencePack.sanitizedEvidencePack);
  assert(redactedText.includes("[REDACTED]"), "credential-like fixture values must be redacted.");
  assert(!redactedText.includes("redacted-value-one"), "credential-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-two"), "client-secret-like fixture value must not leak.");
  assert(!redactedText.includes("redacted-value-three"), "device-id-like fixture value must not leak.");

  const allReports = fixtures.buildOro10uFinalApprovalDecisionEvidencePackGateFixtures().map(
    evaluateOro10uFinalApprovalDecisionEvidencePackGate
  );
  assert(allReports.length >= 18, "fixture set must cover requested ORO-10U scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-10U fixture report", JSON.stringify(report));
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10uDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10uDetailedSmoke,
  PASS_MESSAGE,
};
