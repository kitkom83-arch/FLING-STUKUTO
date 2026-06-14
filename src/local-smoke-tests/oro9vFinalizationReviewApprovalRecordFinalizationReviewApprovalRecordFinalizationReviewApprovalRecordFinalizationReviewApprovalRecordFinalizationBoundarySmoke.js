"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");
const fixtures = require("../game-provider-mock/oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures");

const {
  CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS,
  CLOSED_RUNTIME_AND_SAFETY_FLAGS,
  DEPENDS_ON_ORO9U_KEY,
  HOLD,
  NEXT_PHASE_KEY,
  ORO9U_PASSED_KEY,
  ORO9V_BOUNDARY_RESULT_KEY,
  ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS,
  ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS,
  ORO9V_NO_RUNTIME_PROOF_KEYS,
  ORO_9V_PHASE,
  ORO_9V_SCOPE,
  PASS,
  REQUESTED_FALSE_FLAGS,
  VERIFIED_ORO9U_ONLY_KEY,
  assertOro9vNoLiveExecution,
  assertOro9vNoRuntimeAuthorization,
  assertOro9vNoWalletLedgerMutation,
  buildOro9vBoundarySummary,
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult,
  buildOro9vSafetyFlags,
  evaluateOro9vBoundary,
  validateOro9vBoundary,
} = helper;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_9U =
  "docs/ORO_9U_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_BOUNDARY.md";
const DOC_9V =
  "docs/ORO_9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro9vSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke.js";
const SCRIPT = "smoke:oro-9v";
const DETAIL_SCRIPT = "smoke:oro-9v:detailed";
const FALSE_FLAGS = Object.freeze([
  ...new Set([...CLOSED_RUNTIME_AND_SAFETY_FLAGS, ...CLOSED_ORO9V_ACTUAL_EXECUTION_FLAGS]),
]);
const PASS_MESSAGE =
  "ORO-9V finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: PASS";
const FAIL_MESSAGE =
  "ORO-9V finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary smoke: FAIL";

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

function assertNoLongOro9vFilenames() {
  const longPattern = /ORO_9V_.*(LIVE_TRAFFIC|ACTUAL_EXTERNAL|FINAL_EXECUTION|COMPLETION_RECORD)/;
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
  for (const file of [DOC_9V, BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    readRequired(file);
  }

  const doc9u = readRequired(DOC_9U);
  for (const marker of [
    "ORO-9U closed",
    "ORO-9V follows ORO-9U as the finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary.",
    DOC_9V,
  ]) {
    assert(doc9u.includes(marker), `${DOC_9U} missing marker ${marker}.`);
  }

  const doc9v = readRequired(DOC_9V);
  for (const marker of [
    "## Scope",
    "## Continuation from ORO-9U",
    "## Finalization Review Approval Record Finalization Boundary Definition",
    "## Approval Record Chain Status",
    "## Finalization Review Approval Record Finalization Extension",
    "## Explicit Non-Runtime Statement",
    "## No Actual Live Execution",
    "## No Live OroPlay Call",
    "## No Route Alias",
    "## No Wallet Or Ledger Mutation",
    "## No Prisma Write Or DB Transaction",
    "## No Migration Or Deploy",
    "## Rollback And No-Op",
    "## Next Phase Readiness Note",
    "ORO-9U closed",
    "ORO-9V current",
    "ORO-9V = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
    ORO_9V_SCOPE,
    `${DEPENDS_ON_ORO9U_KEY} = true`,
    `${ORO9U_PASSED_KEY} = true`,
    `${VERIFIED_ORO9U_ONLY_KEY} = true`,
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationPrepared = true",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationAcceptedForRuntime = false",
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
    assert(doc9v.includes(marker), `${DOC_9V} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9V, SCRIPT, DETAIL_SCRIPT, "oro9v"]) {
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
        "## ORO-9V Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Mapping",
        "ORO-9U closed",
        "ORO-9V current",
        "ORO-9V = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        ORO_9V_SCOPE,
        `${NEXT_PHASE_KEY}=true`,
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-9V Current",
        "ORO-9U closed",
        "ORO-9V current",
        "ORO-9V = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        ORO_9V_SCOPE,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "## ORO-9V current/finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary",
        "ORO-9U closed",
        "ORO-9V = finalization review approval record finalization review approval record finalization review approval record finalization review approval record finalization boundary only",
        "`smoke:oro-9v`",
        "`smoke:oro-9v:detailed`",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "## ORO-9V Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Review Approval Record Finalization Boundary Coverage",
        "ORO-9V finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-review-approval-record-finalization-boundary package smoke alias",
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
    assert(!text.includes(marker), `ORO-9V files must not contain ${marker}.`);
  }
  for (const file of [BOUNDARY, FIXTURES, SMOKE, WRAPPER, DOC_9V]) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertClosedFlags(summary) {
  for (const key of FALSE_FLAGS) {
    assert.strictEqual(summary[key], false, `${key} must stay false.`);
  }
  assert.strictEqual(summary.sensitiveOutputPresent, false);
  assert.strictEqual(summary.longOro9vFilenamePresent, false);
}

function assertCompleteOutput(summary) {
  const required = [
    "phase",
    "result",
    "fixtureId",
    ORO9V_BOUNDARY_RESULT_KEY,
    DEPENDS_ON_ORO9U_KEY,
    ORO9U_PASSED_KEY,
    VERIFIED_ORO9U_ONLY_KEY,
    "oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordStatusFromOro9u",
    "oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordScopeFromOro9u",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationStatus",
    "finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope",
    ...ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS,
    ...ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_FALSE_KEYS,
    ...ORO9V_NO_RUNTIME_PROOF_KEYS,
    ...REQUESTED_FALSE_FLAGS,
    ...FALSE_FLAGS,
    NEXT_PHASE_KEY,
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "sensitiveOutputPresent",
    "longOro9vFilenamePresent",
    "blockers",
  ];
  for (const key of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing key ${key}.`);
  }
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_9V_PHASE);
  assert.strictEqual(summary.result, PASS);
  assert.strictEqual(summary[ORO9V_BOUNDARY_RESULT_KEY], PASS);
  assert.strictEqual(summary[DEPENDS_ON_ORO9U_KEY], true);
  assert.strictEqual(summary[ORO9U_PASSED_KEY], true);
  assert.strictEqual(summary[VERIFIED_ORO9U_ONLY_KEY], true);
  assert.strictEqual(summary.finalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationScope, ORO_9V_SCOPE);
  for (const key of ORO9V_FINALIZATION_REVIEW_APPROVAL_RECORD_FINALIZATION_TRUE_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  for (const key of ORO9V_NO_RUNTIME_PROOF_KEYS) {
    assert.strictEqual(summary[key], true, `${key} must be true.`);
  }
  assertClosedFlags(summary);
  assert.strictEqual(summary[NEXT_PHASE_KEY], true);
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-9V happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary[ORO9V_BOUNDARY_RESULT_KEY], HOLD);
  assert.strictEqual(summary.result, HOLD);
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertClosedFlags(summary);
  assertNoSensitiveShape("ORO-9V hold output", JSON.stringify(summary));
}

function runOro9vDetailedSmoke(options = {}) {
  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertNoLongOro9vFilenames();
  assertStaticSafety();

  assert.strictEqual(typeof buildOro9vBoundarySummary, "function");
  assert.strictEqual(typeof buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecord, "function");
  assert.strictEqual(typeof validateOro9vBoundary, "function");
  assert.strictEqual(typeof assertOro9vNoRuntimeAuthorization, "function");
  assert.strictEqual(typeof assertOro9vNoLiveExecution, "function");
  assert.strictEqual(typeof assertOro9vNoWalletLedgerMutation, "function");

  const happy = evaluateOro9vBoundary(fixtures.validOro9vFinalizationReviewApprovalRecordFinalizationBoundaryFixture);
  assertHappyPath(happy);
  assertHappyPath(buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryRecordResult());
  assertHappyPath(buildOro9vBoundarySummary(fixtures.continuationFromOro9uConfirmedFixture));
  assertHappyPath(validateOro9vBoundary(fixtures.finalizationReviewApprovalRecordFinalizationBoundaryPresentFixture));
  assertHappyPath(assertOro9vNoRuntimeAuthorization(fixtures.validOro9vFinalizationReviewApprovalRecordFinalizationBoundaryFixture));
  assertHappyPath(assertOro9vNoLiveExecution(fixtures.validOro9vFinalizationReviewApprovalRecordFinalizationBoundaryFixture));
  assertHappyPath(assertOro9vNoWalletLedgerMutation(fixtures.validOro9vFinalizationReviewApprovalRecordFinalizationBoundaryFixture));

  assert.strictEqual(buildOro9vSafetyFlags().liveOroPlayApiCalled, false);
  assert.strictEqual(buildOro9vSafetyFlags().walletMutationAllowed, false);
  assert.strictEqual(buildOro9vSafetyFlags().ledgerMutationAllowed, false);
  assert.strictEqual(buildOro9vSafetyFlags().prismaWriteAllowed, false);
  assert.strictEqual(buildOro9vSafetyFlags().dbTransactionAllowed, false);
  assert.strictEqual(buildOro9vSafetyFlags().migrationAllowed, false);
  assert.strictEqual(buildOro9vSafetyFlags().deployAllowed, false);

  const heldCases = [
    [fixtures.runtimeFinalizationNotAuthorizedFixture, "oro9v_requires_no_runtime_finalization_proof"],
    [fixtures.runtimeFinalizationReviewNotAuthorizedFixture, "oro9v_requires_no_runtime_finalization_review_proof"],
    [fixtures.runtimeFinalizationReviewApprovalNotAuthorizedFixture, "oro9v_requires_no_runtime_finalization_review_approval_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordNotAuthorizedFixture, "oro9v_requires_no_runtime_finalization_review_approval_record_proof"],
    [fixtures.runtimeFinalizationReviewApprovalRecordFinalizationNotAuthorizedFixture, "oro9v_requires_no_runtime_finalization_review_approval_record_finalization_proof"],
    [fixtures.liveExecutionNotAuthorizedFixture, "oro9v_requires_no_actual_execution_route_or_alias_proof"],
    [fixtures.liveOroPlayApiCallNotAuthorizedFixture, "liveOroPlayApiCallAllowed_not_allowed_in_oro9v"],
    [fixtures.routeAliasNotAuthorizedFixture, "routeEnablementAllowed_not_allowed_in_oro9v"],
    [fixtures.walletMutationNotAuthorizedFixture, "walletMutationAllowed_not_allowed_in_oro9v"],
    [fixtures.ledgerMutationNotAuthorizedFixture, "ledgerMutationAllowed_not_allowed_in_oro9v"],
    [fixtures.prismaWriteNotAuthorizedFixture, "prismaWriteAllowed_not_allowed_in_oro9v"],
    [fixtures.dbTransactionNotAuthorizedFixture, "dbTransactionAllowed_not_allowed_in_oro9v"],
    [fixtures.migrationNotAuthorizedFixture, "migrationAllowed_not_allowed_in_oro9v"],
    [fixtures.deployNotAuthorizedFixture, "deployAllowed_not_allowed_in_oro9v"],
    [fixtures.secretShapedValuesPresentFixture, "sensitive_output_not_allowed_in_oro9v"],
    [fixtures.longFilenamePresentFixture, "long_oro9v_filename_not_allowed"],
  ];

  for (const [input, blocker] of heldCases) {
    assertHeld(evaluateOro9vBoundary(input), blocker);
  }

  assertHappyPath(evaluateOro9vBoundary(fixtures.secretShapedValuesAbsentFixture));
  assertHappyPath(evaluateOro9vBoundary(fixtures.longFilenameAbsentFixture));

  const allReports = fixtures.buildOro9vFinalizationReviewApprovalRecordFinalizationBoundaryFixtures().map(evaluateOro9vBoundary);
  assert(allReports.length >= 19, "fixture set must cover requested ORO-9V scenarios.");
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
    runOro9vDetailedSmoke();
  } catch (error) {
    console.error(FAIL_MESSAGE);
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runOro9vDetailedSmoke,
  PASS_MESSAGE,
};
