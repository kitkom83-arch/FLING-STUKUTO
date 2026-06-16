"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro11iCloseoutWordingAlignmentGate");
const fixtures = require("../game-provider-mock/oro11iCloseoutWordingAlignmentGateFixtures");

const {
  HOLD,
  NEXT_PHASE_KEY,
  ORO11I_PHASE,
  ORO11I_RESULT_KEY,
  ORO11I_SCOPE,
  PASS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  buildOro11iSafetySummary,
  evaluateOro11iCloseoutWordingAlignmentGate,
  normalizeOro11iCloseoutWordingAlignmentGateInput,
  validateOro11iCloseoutWordingAlignmentGate,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_11G = "docs/ORO_11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE.md";
const DOC_11H = "docs/ORO_11H_SEPARATE_GATE.md";
const DOC_11I = "docs/ORO_11I_CLOSEOUT_WORDING_ALIGNMENT_GATE.md";
const BOUNDARY = "src/game-provider-mock/oro11iCloseoutWordingAlignmentGate.js";
const FIXTURES = "src/game-provider-mock/oro11iCloseoutWordingAlignmentGateFixtures.js";
const SMOKE = "src/local-smoke-tests/oro11iCloseoutWordingAlignmentGateSmoke.js";
const WRAPPER = "src/local-smoke-tests/oro11iSmoke.js";
const SCRIPT = "smoke:oro-11i";
const DETAIL_SCRIPT = "smoke:oro-11i:detailed";
const PASS_MESSAGE = "ORO-11I closeout wording alignment gate smoke: PASS";
const FAIL_MESSAGE = "ORO-11I closeout wording alignment gate smoke: FAIL";

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

function visibleLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<!--"));
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

function assertNoLongOro11iFilenames() {
  const files = gitOutput(["ls-files"]).concat(gitOutput(["ls-files", "--others", "--exclude-standard"]));
  const oro11iFiles = files.filter((file) => /ORO_11I|oro11i/.test(file));
  const expected = [DOC_11I, BOUNDARY, FIXTURES, SMOKE, WRAPPER];
  assert.deepStrictEqual(oro11iFiles.filter((file) => !expected.includes(file)), []);
  for (const file of oro11iFiles) assert(file.length <= 80, `${file} must stay compact.`);
}

function assertLegacyCurrentMarkerOnlyInComment(file, marker) {
  const lines = readRequired(file).split(/\r?\n/);
  for (const line of lines) {
    if (line.includes(marker)) assert(line.trim().startsWith("<!--"), `${file} has rendered stale marker ${marker}.`);
  }
}

function assertNoRenderedStaleCurrentWording() {
  const files = [
    DOC_11G,
    DOC_11H,
    "docs/API_MAPPING.md",
    "docs/OROPLAY_INTEGRATION_PLAN.md",
    "docs/PHASE_ROADMAP.md",
    "docs/SMOKE_COVERAGE.md",
  ];
  for (const file of files) {
    assertLegacyCurrentMarkerOnlyInComment(file, "ORO-11G current.");
    assertLegacyCurrentMarkerOnlyInComment(file, "ORO-11H current.");
  }

  const integration = visibleLines(readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"));
  assert(!integration.includes("## ORO-11G Current"), "ORO-11G integration heading must no longer render as current.");
  assert(!integration.includes("## ORO-11H Current"), "ORO-11H integration heading must no longer render as current.");

  const roadmap = visibleLines(readRequired("docs/PHASE_ROADMAP.md"));
  assert(
    !roadmap.includes("## ORO-11G current/evidence pack verification record review record verification record review record gate"),
    "ORO-11G roadmap heading must no longer render as current."
  );
  assert(
    !roadmap.includes("## ORO-11H current/user-approved evidence pack separate gate"),
    "ORO-11H roadmap heading must no longer render as current."
  );
}

function assertDocsAndRegistration() {
  for (const file of [DOC_11G, DOC_11H, DOC_11I, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) readRequired(file);

  const doc11i = readRequired(DOC_11I);
  for (const marker of [
    "# ORO-11I Closeout Wording Alignment Gate",
    "ORO-11I is closeout wording alignment only.",
    "ORO-11G closed.",
    "ORO-11H closed.",
    "Stale rendered current wording for ORO-11G and ORO-11H was resolved by this gate.",
    "Next phase remains unnamed.",
    "Next phase requires separate gate.",
    ORO11I_SCOPE,
    "no_runtime_route_controller",
    "no_api_balance",
    "no_api_transaction",
    "no_live_oroplay_api_call",
    "no_wallet_mutation",
    "no_ledger_mutation",
    "no_prisma_write",
    "no_migration",
    "no_deploy",
    "no_real_money",
    "no_payout",
    "no_auto_credit",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc11i.includes(marker), `${DOC_11I} missing marker ${marker}.`);
  }

  for (const file of [DOC_11G, DOC_11H]) {
    const text = readRequired(file);
    assert(text.includes("ORO-11I closeout wording alignment"), `${file} missing ORO-11I closeout note.`);
  }

  assertNoRenderedStaleCurrentWording();

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_11I, SCRIPT, DETAIL_SCRIPT, "oro11i"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }
  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      ["## ORO-11I Closeout Wording Alignment Gate Mapping", "ORO-11G closed.", "ORO-11H closed.", ORO11I_SCOPE, SCRIPT, DETAIL_SCRIPT],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-11I Closeout Wording Alignment Gate", "ORO-11G closed.", "ORO-11H closed.", ORO11I_SCOPE],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["## ORO-11I closeout wording alignment gate", "ORO-11G closed.", "ORO-11H closed.", "`smoke:oro-11i`", "`smoke:oro-11i:detailed`"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["## ORO-11I Closeout Wording Alignment Gate Coverage", "ORO-11G closed; ORO-11H closed.", SCRIPT, DETAIL_SCRIPT],
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
  for (const marker of unsafeRuntimePatterns) assert(!text.includes(marker), `ORO-11I files must not contain ${marker}.`);
  for (const file of [DOC_11I, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) assertNoSensitiveShape(file, readRequired(file));
}

function assertCompleteOutput(summary) {
  for (const key of [
    "phase",
    "scope",
    "result",
    ORO11I_RESULT_KEY,
    "fixtureId",
    "previousPhases",
    "closeoutEvidence",
    ...REQUIRED_TRUE_FLAGS,
    ...REQUIRED_FALSE_FLAGS,
    "blockers",
  ]) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11I_PHASE);
  assert.strictEqual(summary.scope, ORO11I_SCOPE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO11I_RESULT_KEY], PASS);
  assert.deepStrictEqual(summary.previousPhases, REQUIRED_PREVIOUS_PHASES);
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(summary[key], true, `${key} must be true.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must be false.`);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-11I pass output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO11I_PHASE);
  assert.strictEqual(summary.scope, HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert.strictEqual(summary[ORO11I_RESULT_KEY], HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(summary[key], false, `${key} must stay false.`);
  assertNoSensitiveShape("ORO-11I hold output", JSON.stringify(summary));
}

function runOro11iDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro11iFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof normalizeOro11iCloseoutWordingAlignmentGateInput, "function");
  assert.strictEqual(typeof validateOro11iCloseoutWordingAlignmentGate, "function");
  assert.strictEqual(typeof buildOro11iSafetySummary, "function");

  assertHappyPath(evaluateOro11iCloseoutWordingAlignmentGate(fixtures.validOro11iCloseoutWordingAlignmentGateFixture));
  assertHappyPath(validateOro11iCloseoutWordingAlignmentGate(fixtures.validOro11iCloseoutWordingAlignmentGateFixture));

  const safety = buildOro11iSafetySummary();
  for (const key of REQUIRED_TRUE_FLAGS) assert.strictEqual(safety[key], true, `${key} safety marker missing.`);
  for (const key of REQUIRED_FALSE_FLAGS) assert.strictEqual(safety[key], false, `${key} safety marker must be false.`);
  assert.strictEqual(safety[NEXT_PHASE_KEY], true, `${NEXT_PHASE_KEY} safety marker missing.`);

  const heldCases = [
    [fixtures.staleOro11gCurrentWordingFixture, "oro11g_not_closed"],
    [fixtures.staleOro11hCurrentWordingFixture, "oro11h_not_closed"],
    [fixtures.missingSeparateGateLockFixture, "nextPhaseRequiresSeparateGate_required"],
    [fixtures.runtimeAccidentallyEnabledFixture, "runtimeRouteController_not_allowed_in_oro11i"],
    [fixtures.liveExternalMoneyAccidentallyEnabledFixture, "liveExecution_not_allowed_in_oro11i"],
    [fixtures.mutationAccidentallyEnabledFixture, "walletMutation_not_allowed_in_oro11i"],
  ];
  for (const [fixture, blocker] of heldCases) {
    assertHeld(evaluateOro11iCloseoutWordingAlignmentGate(fixture), blocker);
    assertHeld(validateOro11iCloseoutWordingAlignmentGate(fixture), blocker);
  }

  const normalized = normalizeOro11iCloseoutWordingAlignmentGateInput(
    fixtures.validOro11iCloseoutWordingAlignmentGateFixture
  );
  assert.strictEqual(normalized.phase, ORO11I_PHASE);
  assert.strictEqual(normalized.scope, ORO11I_SCOPE);

  if (options.print !== false) console.log(PASS_MESSAGE);
  return true;
}

if (require.main === module) {
  try {
    runOro11iDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

module.exports = {
  PASS_MESSAGE,
  runOro11iDetailedSmoke,
};
