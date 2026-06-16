"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11hSeparateGate");
const fixtures = require("../game-provider-mock/oro11hSeparateGateFixtures");

const {
  HOLD,
  NEXT_PHASE_KEY,
  ORO11H_PHASE,
  ORO11H_PREVIOUS_PHASE,
  ORO11H_RESULT_KEY,
  ORO11H_SCOPE,
  ORO11H_STATUS,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_TRUE_FLAGS,
  buildOro11hSafetySummary,
  evaluateOro11hSeparateGate,
  normalizeOro11hSeparateGateInput,
  validateOro11hSeparateGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11G = "docs/ORO_11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE.md";
const DOC_11H = "docs/ORO_11H_SEPARATE_GATE.md";
const BOUNDARY = "src/game-provider-mock/oro11hSeparateGate.js";
const FIXTURES = "src/game-provider-mock/oro11hSeparateGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11hSeparateGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11hSmoke.js";
const SCRIPT = "smoke:oro-11h";
const DETAIL_SCRIPT = "smoke:oro-11h:detailed";
const PASS_MESSAGE = "ORO-11H user-approved separate gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11H user-approved separate gate smoke: FAIL";

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
    "prisma",
    ".env",
    ".env.staging.example",
    "package-lock.json",
  ];
  assert.deepStrictEqual(gitOutput(["diff", "--name-only", "--", ...protectedPaths]), []);
  assert.deepStrictEqual(gitOutput(["ls-files", "--others", "--exclude-standard", "--", ...protectedPaths]), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const guardedMarkers = [
    ["to", "ken", "="].join(""),
    ["pass", "word", "="].join(""),
    ["client", "S", "ecret", "="].join(""),
    ["DATABASE", "_", "URL", "="].join(""),
    ["device", "Id", "="].join(""),
    ["Author", "ization", ":"].join(""),
  ];
  for (const marker of guardedMarkers) assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  const guardedSchemes = [["Be", "arer"].join(""), ["Ba", "sic"].join("")];
  for (const marker of guardedSchemes) assert(!scanned.includes(marker), `${label} includes guarded scheme marker.`);
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), `${label} includes compact guarded shape.`);
  assert(!/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned), `${label} includes embedded guarded URL shape.`);
}

function assertNoLongOro11hFilenames() {
  const files = gitOutput(["ls-files"]).concat(gitOutput(["ls-files", "--others", "--exclude-standard"]));
  const oro11hFiles = files.filter((file) => /ORO_11H|oro11h/.test(file));
  const expected = [DOC_11H, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  assert.deepStrictEqual(oro11hFiles.filter((file) => !expected.includes(file)), []);
  for (const file of oro11hFiles) assert(file.length <= 80, `${file} must stay compact.`);
}

function assertDocsAndRegistration() {
  for (const file of [DOC_11G, DOC_11H, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc11h = readRequired(DOC_11H);
  for (const marker of [
    "# ORO-11H User-Approved Evidence Pack Separate Gate",
    "ORO-11G closed.",
    "ORO-11H current.",
    "explicit human-approved separate gate decision after ORO-11G",
    "ORO-11H was not inferred from an existing roadmap marker.",
    ORO11H_SCOPE,
    "ORO-11H is not runtime implementation.",
    "ORO-11H is not live execution.",
    "ORO-11H does not mount a route.",
    "ORO-11H does not create or enable a public alias.",
    "ORO-11H does not enable runtime traffic.",
    "ORO-11H does not mutate wallet or ledger state.",
    "ORO-11H does not call OroPlay.",
    "ORO-11H does not use real client secret material.",
    "ORO-11H does not touch production DB.",
    "ORO-11H does not deploy.",
    "next phase requires a separate gate again.",
    SCRIPT,
    DETAIL_SCRIPT,
    "Next phase requires separate gate.",
  ]) {
    assert(doc11h.includes(marker), `${DOC_11H} missing marker ${marker}.`);
  }

  const doc11g = readRequired(DOC_11G);
  assert(doc11g.includes("Next phase requires separate gate."), `${DOC_11G} must retain separate gate handoff.`);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11H, SCRIPT, DETAIL_SCRIPT, "oro11h"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["## ORO-11H User-Approved Separate Gate Mapping", "ORO-11G closed.", "ORO-11H current.", ORO11H_SCOPE, SCRIPT, DETAIL_SCRIPT],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11H Current", "ORO-11G closed.", "ORO-11H current.", ORO11H_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["## ORO-11H current/user-approved evidence pack separate gate", "ORO-11G closed.", "`smoke:oro-11h`", "`smoke:oro-11h:detailed`"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["## ORO-11H User-Approved Separate Gate Coverage", "ORO-11G closed; ORO-11H current.", SCRIPT, DETAIL_SCRIPT],
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
    ["net", ".", "connect"].join(""),
  ];
  const text = [BOUNDARY, FIXTURES, SMOKE, WRAPPER].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11H files must not contain ${marker}.`);
  for (const file of [DOC_11H, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertClosedFlags(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "previousPhase",
    "scope",
    "result",
    ORO11H_RESULT_KEY,
    "status",
    "fixtureId",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary, status) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11H_PHASE);
  assert.strictEqual(summary.previousPhase, ORO11H_PREVIOUS_PHASE);
  assert.strictEqual(summary.scope, ORO11H_SCOPE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11H_RESULT_KEY], PASS);
  assert.strictEqual(summary.status, status);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  assertClosedFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11H pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11H_PHASE);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11H_RESULT_KEY], HOLD);
  assert.strictEqual(summary.status, ORO11H_STATUS.FAIL_CLOSED);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-11H hold output", JSON.stringify(summary));
}

function runOro11hDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11hFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11hSeparateGateInput, "function");
  assert.strictEqual(typeof validateOro11hSeparateGate, "function");
  assert.strictEqual(typeof buildOro11hSafetySummary, "function");

  assertHappyPath(
    evaluateOro11hSeparateGate(fixtures.validOro11hUserApprovedSeparateGateFixture),
    ORO11H_STATUS.PREPARED
  );
  assertHappyPath(validateOro11hSeparateGate(fixtures.approvedForGateOnlyFixture), ORO11H_STATUS.APPROVED_FOR_GATE_ONLY);
  assertHappyPath(evaluateOro11hSeparateGate(fixtures.rejectedGateRecordFixture), ORO11H_STATUS.REJECTED);

  const safety = buildOro11hSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);

  const heldCases = [
    [fixtures.missingApprovalFixture, "separate_gate_approval_missing"],
    [fixtures.previousPhaseNotClosedFixture, "oro11gClosed_required"],
    [fixtures.routeMountEnabledFixture, "routeMountEnabled_not_allowed_in_oro11h"],
    [fixtures.publicAliasEnabledFixture, "publicAliasEnabled_not_allowed_in_oro11h"],
    [fixtures.runtimeTrafficEnabledFixture, "runtimeTrafficEnabled_not_allowed_in_oro11h"],
    [fixtures.walletMutationFixture, "walletMutation_not_allowed_in_oro11h"],
    [fixtures.ledgerMutationFixture, "ledgerMutation_not_allowed_in_oro11h"],
    [fixtures.liveExecutionFixture, "liveExecution_not_allowed_in_oro11h"],
    [fixtures.externalCallFixture, "externalCall_not_allowed_in_oro11h"],
    [fixtures.guardedShapeFixture, "secret_shaped_value_present"],
    [fixtures.nextGateMissingFixture, `${NEXT_PHASE_KEY}_required`],
  ];
  for (const [input, blocker] of heldCases) assertHeld(evaluateOro11hSeparateGate(input), blocker);

  const allReports = fixtures.buildOro11hSeparateGateFixtures().map(evaluateOro11hSeparateGate);
  assert(allReports.length >= 12, "fixture set must cover ORO-11H gate and safety cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
    assertNoSensitiveShape("ORO-11H fixture report", JSON.stringify(report));
  }

  if (options.print !== false) console.log(PASS_MESSAGE);
}

if (require.main === module) {
  try {
    runOro11hDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro11hDetailedSmoke,
  PASS_MESSAGE,
};
