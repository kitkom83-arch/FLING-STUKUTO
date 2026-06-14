"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary");
const fixtures = require("../game-provider-mock/oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures");

const {
  CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9T_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9T_PASSED_KEY,
  ORO9U_BOUNDARY_RESULT_KEY,
  ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
  ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
  ORO9U_NO_RUNTIME_PROOF_KEYS,
  ORO_9U_PHASE,
  ORO_9U_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9T_ONLY_KEY,
  assertOro9uNoLiveExecution,
  assertOro9uNoRuntimeAuthorization,
  assertOro9uNoWalletLedgerMutation,
  buildOro9uBoundarySummary,
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecord,
  buildOro9uFinalizationReviewApprovalRecordBoundaryRecordResult,
  buildOro9uSafetyFlags,
  evaluateOro9uBoundary,
  validateOro9uBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9T =
  "docs/ORO_9T_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_BOUNDARY.md";
const DOC_9U =
  "docs/ORO_9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9uSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke.js";
const SCRIPT = "smoke:oro-9u";
const DETAIL_SCRIPT = "smoke:oro-9u:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9U_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9U finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9U finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary smoke: FAIL";

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

function assertNoLongOro9uFilenames() {
  const longPattern = /ORO_9U_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const marker of guardedMarkers) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  }
  for (const marker of [["p", "in", "="].join("")]) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
  }
  assert(
    !/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned),
    `${label} includes compact auth shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes embedded auth URL shape.`
  );
}

function assertDocsAndRegistration() {
  for (const file of [DOC_9U, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9t = readRequired(DOC_9T);
  for (const marker of [
    "ORO-9T closed",
    "ORO-9U follows ORO-9T as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary.",
    DOC_9U,
  ]) {
    assert(doc9t.includes(marker), `${DOC_9T} missing marker ${marker}.`);
  }

  const doc9u = readRequired(DOC_9U);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9T",
    "## Finalization Review Approval Record Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Record Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9T closed",
    "ORO-9U current",
    "ORO-9U = finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary only",
    ORO_9U_SCOPE,
    `${DEPENDS_ON_ORO9T_KEY} = true`,
    `${ORO9T_PASSED_KEY} = true`,
    `${VERIFIED_ORO9T_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordAcceptedForRuntime = false",
    "verifiedNoExternalNetworkOccurred = true",
    "verifiedNoLiveOroPlayApiCallOccurred = true",
    "walletMutationAllowed = false",
    "ledgerMutationAllowed = false",
    "prismaWriteAllowed = false",
    "dbTransactionAllowed = false",
    "migrationAllowed = false",
    "deployAllowed = false",
    SCRIPT,
    DETAIL_SCRIPT,
  ]) {
    assert(doc9u.includes(marker), `${DOC_9U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9U, SCRIPT, DETAIL_SCRIPT, "oro9u"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "## ORO-9U Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Mapping",
        "ORO-9T closed",
        "ORO-9U current",
        "ORO-9U = finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary only",
        ORO_9U_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9U Current",
        "ORO-9T closed",
        "ORO-9U current",
        "ORO-9U = finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary only",
        ORO_9U_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9U current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary",
        "ORO-9T closed",
        "ORO-9U = finalization review approval record finalization review approval record finalization review approval record finalization review approval record boundary only",
        "`smoke:oro-9u`",
        "`smoke:oro-9u:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9U Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Boundary Coverage",
        "ORO-9U finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-boundary package smoke alias",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
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
  for (const marker of unsafeRuntimePatterns) {
    assert(!text.includes(marker), `ORO-9U files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9U]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9uFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9U_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9T_KEY,
    ORO9T_PASSED_KEY,
    VERIFIED_ORO9T_ONLY_KEY,
    "oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalStatusFromOro9t",
    "oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalScopeFromOro9t",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope",
    ...ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS,
    ...ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FALSE_KEYS,
    ...ORO9U_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9uFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9U_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9U_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9T_KEY], true);
  assert.strictEqual(summary[ORO9T_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9T_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScope, ORO_9U_SCOPE);
  for (const key of ORO9U_FINALIZATION_REVIEW_APPROVAL_RECORD_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9U_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9U happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9U_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9U hold output", JSON.stringify(summary));
}

function runOro9uDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9uFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9uBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9uFinalizationReviewApprovalRecordBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9uBoundary, "function");
  assert.strictEqual(typeof assertOro9uNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof assertOro9uNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9uNoWalletLedgerMutation, "function");

  const happy = evaluateOro9uBoundary(fixtures.validOro9uFinalizationReviewApprovalRecordBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9uFinalizationReviewApprovalRecordBoundaryRecordResult());
  assertHappyPath(buildOro9uBoundarySummary(fixtures.continuationFromOro9tConfirmedFixture));
  assertHappyPath(validateOro9uBoundary(fixtures.finalizationReviewApprovalRecordBoundaryPresentFixture));
  assertHappyPath(assertOro9uNoRuntimeAuthorization(fixtures.validOro9uFinalizationReviewApprovalRecordBoundaryFixture));
  assertHappyPath(assertOro9uNoLiveExecution(fixtures.validOro9uFinalizationReviewApprovalRecordBoundaryFixture));
  assertHappyPath(assertOro9uNoWalletLedgerMutation(fixtures.validOro9uFinalizationReviewApprovalRecordBoundaryFixture));

  assert.strictEqual(buildOro9uSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9uSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9uSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9uSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9uSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9uSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9uSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9u_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9u_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9u_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9u_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9u_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9u"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9u"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9u"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9u"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9u"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9u"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9u"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9u"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9u"],
    [fixtures.longFilenamePresentFixture, "long_oro9u_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9uBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9uBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9uBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9uFinalizationReviewApprovalRecordBoundaryFixtures().map(evaluateOro9uBoundary);
  assert(allReports.length >= 18, "fixture set must cover requested ORO-9U scenarios.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertClosedFlags(report);
  }

  if (options.print !== false) {
    console.log(PASS_MESSAGE);
  }
}

if (require.main === module) {
  try {
    runOro9uDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9uDetailedSmoke,
  PASS_MESSAGE,
};
