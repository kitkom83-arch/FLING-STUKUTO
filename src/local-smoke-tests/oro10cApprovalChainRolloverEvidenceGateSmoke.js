"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10cApprovalChainRolloverEvidenceGate");
const fixtures = require("../game-provider-mock/oro10cApprovalChainRolloverEvidenceGateFixtures");

const {
  DEPENDS_ON_ORO10A_KEY,
  DEPENDS_ON_ORO10B_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO10A_PASSED_KEY,
  ORO10B_PASSED_KEY,
  ORO10C_PHASE,
  ORO10C_RESULT_KEY,
  ORO10C_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10B_ONLY_KEY,
  buildOro10cEvidenceGateRecord,
  buildOro10cEvidenceGateRecordResult,
  buildOro10cSafetySummary,
  evaluateOro10cEvidenceGate,
  validateOro10cEvidenceGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10B = "docs/ORO_10B_APPROVAL_CHAIN_ROLLOVER_CONTINUITY_GATE.md";
const DOC_10C = "docs/ORO_10C_APPROVAL_CHAIN_ROLLOVER_EVIDENCE_GATE.md";
const API_MAP_FILE = ["docs/API_MAP", "P", "ING.md"].join("");
const BOUNDARY = "src/game-provider-mock/oro10cApprovalChainRolloverEvidenceGate.js";
const FIXTURES = "src/game-provider-mock/oro10cApprovalChainRolloverEvidenceGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10cApprovalChainRolloverEvidenceGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10cSmoke.js";
const SCRIPT = "smoke:oro-10c";
const DETAIL_SCRIPT = "smoke:oro-10c:detailed";
const PASS_MESSAGE = "ORO-10C approval chain rollover evidence gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10C approval chain rollover evidence gate smoke: FAIL";

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

function assertNoLongOro10cFilenames() {
  const longPattern = /ORO_10C_.*(APPROVAL_CHAIN_ROLLOVER_EVIDENCE_GATE_FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW|EVIDENCE_EVIDENCE)/;
  const tracked = gitOutput(["ls-files"]);
  const untracked = gitOutput(["ls-files", "--others", "--exclude-standard"]);
  assert.deepStrictEqual([...tracked, ...untracked].filter((file) => longPattern.test(file)), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken", "="].join(""),
    ["Be", "arer"].join(""),
    ["Ba", "sic"].join(""),
    ["pass", "word", "="].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["device", "Id"].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const uppercasePinMarker = ["P", "I", "N"].join("");
  assert(!new RegExp(`\\b${uppercasePinMarker}\\s*[:=]`).test(scanned), `${label} includes guarded uppercase pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10C, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10c = readRequired(DOC_10C);
  for (const marker of [
    "# ORO-10C Approval Chain Rollover Evidence Gate",
    "ORO-10A closed.",
    "ORO-10B closed.",
    "ORO-10C current.",
    "evidence gate only",
    "predecessor ORO-10A present = true",
    "predecessor ORO-10B present = true",
    "Safe CI required after commit/push in closeout only = true",
    "no_live_execution",
    "no_live_oroplay_api_call",
    "no_route_alias",
    "no_runtime_mount",
    "no_runtime_approval_chain_rollover",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_db_transaction",
    "no_migration",
    "no_deploy",
    "no_signed_runtime_approval",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10c.includes(marker), `${DOC_10C} missing marker ${marker}.`);
  }

  const doc10b = readRequired(DOC_10B);
  for (const marker of [
    "ORO-10B closed.",
    "ORO-10C current.",
    DOC_10C,
    "nextPhaseSeparateApprovalRequired = true",
  ]) {
    assert(doc10b.includes(marker), `${DOC_10B} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10C, SCRIPT, DETAIL_SCRIPT, "oro10c"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [API_MAP_FILE, ["## ORO-10C Approval Chain Rollover Evidence Gate Mapping", "ORO-10B closed.", "ORO-10C current.", ORO10C_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10C Current", "ORO-10B closed.", "ORO-10C current.", ORO10C_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10C current/approval chain rollover evidence gate", "ORO-10B closed.", "`smoke:oro-10c`", "`smoke:oro-10c:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10C Approval Chain Rollover Evidence Gate Coverage", "ORO-10B closed; ORO-10C current.", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10C files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10C]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10C_RESULT_KEY,
    DEPENDS_ON_ORO10A_KEY,
    DEPENDS_ON_ORO10B_KEY,
    ORO10A_PASSED_KEY,
    ORO10B_PASSED_KEY,
    VERIFIED_ORO10B_ONLY_KEY,
    "oro10bStatus",
    "oro10bScope",
    "oro10bClosed",
    "evidenceGateStatus",
    "evidenceGateScope",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10C_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10C_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10A_KEY], true);
  assert.strictEqual(summary[DEPENDS_ON_ORO10B_KEY], true);
  assert.strictEqual(summary[ORO10A_PASSED_KEY], true);
  assert.strictEqual(summary[ORO10B_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10B_ONLY_KEY], true);
  assert.strictEqual(summary.evidenceGateScope, ORO10C_SCOPE);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10C happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10C_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10C hold output", JSON.stringify(summary));
}

function runOro10cDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10cFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10C_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10C_STATUS, "string");
  assert.strictEqual(typeof buildOro10cEvidenceGateRecord, "function");
  assert.strictEqual(typeof validateOro10cEvidenceGate, "function");
  assert.strictEqual(typeof buildOro10cSafetySummary, "function");

  const happy = evaluateOro10cEvidenceGate(fixtures.validEvidenceGateFromOro10bFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10cEvidenceGateRecordResult());
  assertHappyPath(validateOro10cEvidenceGate(buildOro10cEvidenceGateRecord()));
  const safety = buildOro10cSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingOro10aPredecessorFailFixture, "missing_oro10a_predecessor"],
    [fixtures.missingOro10bPredecessorFailFixture, "missing_oro10b_predecessor"],
    [fixtures.missingEvidenceRecordFailFixture, "approvalChainRolloverEvidenceGatePresent_required"],
    [fixtures.signedRuntimeApprovalBlockedFixture, "verifiedNoSignedRuntimeApprovalOccurred_required"],
    [fixtures.runtimeApprovalChainRolloverBlockedFixture, "verifiedNoRuntimeApprovalChainRolloverOccurred_required"],
    [fixtures.runtimeMountBlockedFixture, "verifiedNoRuntimeMountOccurred_required"],
    [fixtures.publicAliasBlockedFixture, "verifiedNoPublicCallbackAliasOccurred_required"],
    [fixtures.liveExecutionBlockedFixture, "verifiedNoLiveExecutionOccurred_required"],
    [fixtures.externalCallBlockedFixture, "verifiedNoActualExternalCallOccurred_required"],
    [fixtures.walletMutationBlockedFixture, "verifiedNoWalletMutationOccurred_required"],
    [fixtures.ledgerMutationBlockedFixture, "verifiedNoLedgerMutationOccurred_required"],
    [fixtures.prismaWriteBlockedFixture, "verifiedNoPrismaWriteOccurred_required"],
    [fixtures.dbTransactionBlockedFixture, "verifiedNoDbTransactionOccurred_required"],
    [fixtures.migrationBlockedFixture, "verifiedNoMigrationOccurred_required"],
    [fixtures.deployBlockedFixture, "verifiedNoDeployOccurred_required"],
    [fixtures.secretLikeValueBlockedFixture, "verifiedNoSecretLikeValuePresent_required"],
    [fixtures.longFilenameBlockedFixture, "noLongFilenameConfirmed_required"],
    [fixtures.missingSeparateNextApprovalBlockedFixture, "next_phase_separate_approval_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10cEvidenceGate(input), blocker);
  const allReports = fixtures.buildOro10cApprovalChainRolloverEvidenceGateFixtures().map(evaluateOro10cEvidenceGate);
  assert(allReports.length >= 19, "fixture set must cover requested ORO-10C scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10cDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10cDetailedSmoke,
  PASS_MESSAGE,
};
