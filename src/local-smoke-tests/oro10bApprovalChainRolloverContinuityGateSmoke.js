"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro10bApprovalChainRolloverContinuityGate");
const fixtures = require("../game-provider-mock/oro10bApprovalChainRolloverContinuityGateFixtures");

const {
  DEPENDS_ON_ORO10A_KEY,
  HOLD,
  NEXT_STEP_KEY,
  ORO10A_PASSED_KEY,
  ORO10B_PHASE,
  ORO10B_RESULT_KEY,
  ORO10B_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  VERIFIED_ORO10A_ONLY_KEY,
  buildOro10bContinuityGateRecord,
  buildOro10bContinuityGateRecordResult,
  buildOro10bSafetySummary,
  evaluateOro10bContinuityGate,
  validateOro10bContinuityGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_10A = "docs/ORO_10A_APPROVAL_CHAIN_ROLLOVER_BOUNDARY.md";
const DOC_10B = "docs/ORO_10B_APPROVAL_CHAIN_ROLLOVER_CONTINUITY_GATE.md";
const BOUNDARY = "src/game-provider-mock/oro10bApprovalChainRolloverContinuityGate.js";
const FIXTURES = "src/game-provider-mock/oro10bApprovalChainRolloverContinuityGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro10bApprovalChainRolloverContinuityGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro10bSmoke.js";
const SCRIPT = "smoke:oro-10b";
const DETAIL_SCRIPT = "smoke:oro-10b:detailed";
const PASS_MESSAGE = "ORO-10B approval chain rollover continuity gate smoke: PASS";
const FAIL_MESSAGE = "ORO-10B approval chain rollover continuity gate smoke: FAIL";

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

function assertNoLongOro10bFilenames() {
  const longPattern = /ORO_10B_.*(APPROVAL_CHAIN_ROLLOVER_CONTINUITY_REVIEW_GATE_FINALIZATION|FINALIZATION_FINALIZATION|REVIEW_REVIEW)/;
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
  assert(!scanned.includes(["p", "in", "="].join("")), `${label} includes guarded pin marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact auth shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded auth URL shape.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_10B, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc10b = readRequired(DOC_10B);
  for (const marker of [
    "# ORO-10B Approval Chain Rollover Continuity Gate",
    "ORO-10A closed.",
    "ORO-10B current.",
    "continuity review gate only",
    "approval chain rollover remains inside the safety gate chain only",
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
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc10b.includes(marker), `${DOC_10B} missing marker ${marker}.`);
  }

  const doc10a = readRequired(DOC_10A);
  for (const marker of [
    "ORO-10A closed.",
    "ORO-10B current.",
    DOC_10B,
    "nextStepRequiresSeparateContinuityApproval = true",
  ]) {
    assert(doc10a.includes(marker), `${DOC_10A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10B, SCRIPT, DETAIL_SCRIPT, "oro10b"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    ["docs/API_MAPPING.md", ["## ORO-10B Approval Chain Rollover Continuity Gate Mapping", "ORO-10A closed.", "ORO-10B current.", ORO10B_SCOPE, SCRIPT, DETAIL_SCRIPT]],
    ["docs/OROPLAY_INTEGRATION_PLAN.md", ["## ORO-10B Current", "ORO-10A closed.", "ORO-10B current.", ORO10B_SCOPE]],
    ["docs/PHASE_ROADMAP.md", ["## ORO-10B current/approval chain rollover continuity review gate", "ORO-10A closed.", "`smoke:oro-10b`", "`smoke:oro-10b:detailed`"]],
    ["docs/SMOKE_COVERAGE.md", ["## ORO-10B Approval Chain Rollover Continuity Gate Coverage", "ORO-10A closed; ORO-10B current.", SCRIPT, DETAIL_SCRIPT]],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-10B files must not contain ${marker}.`);
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_10B]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO10B_RESULT_KEY,
    DEPENDS_ON_ORO10A_KEY,
    ORO10A_PASSED_KEY,
    VERIFIED_ORO10A_ONLY_KEY,
    "oro10aStatus",
    "oro10aScope",
    "oro10aClosed",
    "continuityGateStatus",
    "continuityGateScope",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    NEXT_STEP_KEY,
    "nextStepRequiresSeparateRuntimeApproval",
    "blockers",
  ];
  for (const key of required) assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO10B_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO10B_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO10A_KEY], true);
  assert.strictEqual(summary[ORO10A_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO10A_ONLY_KEY], true);
  assert.strictEqual(summary.continuityGateScope, ORO10B_SCOPE);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_STEP_KEY], true);
  assert.strictEqual(summary.nextStepRequiresSeparateRuntimeApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-10B happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO10B_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-10B hold output", JSON.stringify(summary));
}

function runOro10bDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro10bFilenames();
  assertStaticSafety();
  assert.strictEqual(typeof helper.ORO10B_PHASE, "string");
  assert.strictEqual(typeof helper.ORO10B_STATUS, "string");
  assert.strictEqual(typeof buildOro10bContinuityGateRecord, "function");
  assert.strictEqual(typeof validateOro10bContinuityGate, "function");
  assert.strictEqual(typeof buildOro10bSafetySummary, "function");

  const happy = evaluateOro10bContinuityGate(fixtures.validContinuityGateFromOro10aFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro10bContinuityGateRecordResult());
  assertHappyPath(validateOro10bContinuityGate(buildOro10bContinuityGateRecord()));
  const safety = buildOro10bSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingPredecessorFailFixture, "missing_oro10a_predecessor"],
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
    [fixtures.longFilenameBlockedFixture, "verifiedShortOro10bFilenamesOnly_required"],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro10bContinuityGate(input), blocker);
  const allReports = fixtures.buildOro10bApprovalChainRolloverContinuityGateFixtures().map(evaluateOro10bContinuityGate);
  assert(allReports.length >= 15, "fixture set must cover requested ORO-10B scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }
  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro10bDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro10bDetailedSmoke,
  PASS_MESSAGE,
};
