"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures");

const {
  RUNTIME_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
} = require("../game-provider-mock/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
  ORO7M_RUNTIME_ACTIVATION_DECISION_BOUNDARY_STATUS,
  ORO_7M_PHASE,
  PASS,
  RUNTIME_ACTIVATION_DECISION_ONLY,
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
  buildOro7mRuntimeActivationDecisionBoundarySummary,
  evaluateOro7mRuntimeActivationDecisionBoundary,
  validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
} = helper;

const {
  buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures,
  failActualExecutionAuthorizedFixture,
  failActualExecutionEnabledFixture,
  failApiBalanceAliasAllowedFixture,
  failApiOroplayBalanceRouteAllowedFixture,
  failApiOroplayTransactionRouteAllowedFixture,
  failApiTransactionAliasAllowedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExpressMountAllowedFixture,
  failExternalNetworkAllowedFixture,
  failInvalidOro7lRuntimeActivationRequestStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7lRuntimeActivationRequestFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeActivationDecisionMissingFixture,
  failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture,
  failRuntimeEnabledFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7M =
  "docs/ORO_7M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION_BOUNDARY.md";
const DOC_7L =
  "docs/ORO_7L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7mSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7m";
const DETAIL_SCRIPT = "smoke:oro-7m-runtime-activation-decision";
const ORO7M_SECRET_SCAN_FILES = Object.freeze([
  DOC_7M,
  BOUNDARY,
  FIXTURES,
  SMOKE,
  WRAPPER,
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function gitChangedFiles(paths = []) {
  const args = ["diff", "--name-only"];
  if (paths.length > 0) args.push("--", ...paths);
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git diff --name-only failed: ${result.stderr}`);
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function gitUntrackedFiles(paths = []) {
  const args = ["ls-files", "--others", "--exclude-standard"];
  if (paths.length > 0) args.push("--", ...paths);
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git ls-files failed: ${result.stderr}`);
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
  assert.deepStrictEqual(gitChangedFiles(protectedPaths), []);
  assert.deepStrictEqual(gitUntrackedFiles(protectedPaths), []);
}

function assertNoSensitiveShape(label, text) {
  const scanned = String(text || "");
  const joinedMarkers = [
    ["to", "ken"].join(""),
    ["be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of joinedMarkers) {
    assert(!scanned.includes(marker), `${label} includes sensitive marker ${marker}.`);
  }
  assert(
    !/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned),
    `${label} includes compact credential shape.`
  );
  assert(
    !/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(scanned),
    `${label} includes credential URL shape.`
  );
}

function assertDocsAndRegistration() {
  const doc7m = readRequired(DOC_7M);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7L",
    "## Runtime activation request intake",
    "## Runtime activation decision record",
    "## Activation-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7M is runtime activation decision boundary only.",
    "ORO-7M does not activate runtime execution.",
    "ORO-7M does not enable runtime execution.",
    "ORO-7M does not permit live OroPlay API calls.",
    "ORO-7M does not mutate wallet or ledger.",
    "ORO-7M does not mount any route.",
    "ORO-7M does not expose public aliases.",
    "ORO-7M only prepares the next separate runtime activation final readiness gate.",
    "actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l = submitted_pending_actual_external_call_execution_runtime_activation_decision",
    "actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l = runtime_activation_request_only",
    "actualExternalCallExecutionRuntimeActivationDecisionPrepared = true",
    "actualExternalCallExecutionRuntimeActivationDecisionIssued = true",
    "actualExternalCallExecutionRuntimeActivationDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_activation_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationDecisionScope = runtime_activation_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7m.includes(marker), `${DOC_7M} missing marker ${marker}.`);
  }

  const doc7l = readRequired(DOC_7L);
  for (const marker of [
    "ORO-7M runtime activation decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
    RUNTIME_ACTIVATION_DECISION_ONLY,
  ]) {
    assert(doc7l.includes(marker), `${DOC_7L} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7m",
    "oro-7m",
    "ORO_7M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_DECISION_BOUNDARY.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [BOUNDARY, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-7M records actual external call execution runtime activation decision boundary only",
        RUNTIME_ACTIVATION_DECISION_ONLY,
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
        "actualExternalCallExecutionRuntimeActivationDecisionIssued=true",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7M Current",
        "runtime activation decision boundary only",
        "final readiness gate remains separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7M current/live traffic actual external call execution runtime activation decision boundary",
        "runtime activation decision boundary only",
        "final readiness gate remains separate",
        "`smoke:oro-7m` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7M Live Traffic Actual External Call Execution Runtime Activation Decision Boundary Coverage",
        "ORO-7M boundary-specific package smoke alias",
        SCRIPT,
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
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "http.request",
    "https.request",
    "fetch(",
    "process.env",
  ];
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7M].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7M files must not contain ${marker}.`);
  }
  for (const file of ORO7M_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeActivationRouteOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivated, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorized, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApproved, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecuted, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
  assert.strictEqual(summary.routeEnablementAllowed, false);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.apiBalanceAliasAllowed, false);
  assert.strictEqual(summary.apiTransactionAliasAllowed, false);
  assert.strictEqual(summary.apiOroplayBalanceRouteAllowed, false);
  assert.strictEqual(summary.apiOroplayTransactionRouteAllowed, false);
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.walletMutationPerformed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationPerformed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.prismaWritePerformed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.dbTransactionPerformed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.migrationPerformed, false);
  assert.strictEqual(summary.deployAllowed, false);
  assert.strictEqual(summary.deployPerformed, false);
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "liveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryResult",
    "dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary",
    "oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l",
    "actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l",
    "actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l",
    "actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l",
    "actualExternalCallExecutionRuntimeActivationDecisionPrepared",
    "actualExternalCallExecutionRuntimeActivationDecisionIssued",
    "actualExternalCallExecutionRuntimeActivationDecisionStatus",
    "actualExternalCallExecutionRuntimeActivationDecisionScope",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionLiveExecuted",
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "walletMutationAllowed",
    "walletMutationPerformed",
    "ledgerMutationAllowed",
    "ledgerMutationPerformed",
    "prismaWriteAllowed",
    "prismaWritePerformed",
    "dbTransactionAllowed",
    "dbTransactionPerformed",
    "migrationAllowed",
    "migrationPerformed",
    "deployAllowed",
    "deployPerformed",
    "routeEnablementAllowed",
    "expressMountAllowed",
    "publicAliasAllowed",
    "apiBalanceAliasAllowed",
    "apiTransactionAliasAllowed",
    "apiOroplayBalanceRouteAllowed",
    "apiOroplayTransactionRouteAllowed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7M_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestPreparedFromOro7l,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestSubmittedFromOro7l,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestStatusFromOro7l,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestScopeFromOro7l,
    RUNTIME_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationDecisionScope,
    RUNTIME_ACTIVATION_DECISION_ONLY
  );
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationFinalReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7M happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7M hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7M_RUNTIME_ACTIVATION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7mRuntimeActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7mRuntimeActivationDecisionBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7mRuntimeActivationDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7mRuntimeActivationDecisionBoundarySummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(
      failMissingOro7lRuntimeActivationRequestFixture
    ),
    "missing_oro7l_runtime_activation_request"
  );
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(
      failInvalidOro7lRuntimeActivationRequestStatusFixture
    ),
    "invalid_oro7l_runtime_activation_request_status"
  );
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(failRuntimeActivationDecisionMissingFixture),
    "runtime_activation_decision_record_required_in_oro7m"
  );
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(
      failRuntimeActivationDecisionWithoutFinalReadinessRequirementFixture
    ),
    "next_phase_runtime_activation_final_readiness_required_after_oro7m"
  );
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7m"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7mRuntimeActivationDecisionBoundary(fixture),
      "runtime_enablement_not_allowed_in_oro7m"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7mRuntimeActivationDecisionBoundary(fixture),
      "live_execution_not_allowed_in_oro7m"
    );
  }
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7m"
  );
  assertHeld(
    evaluateOro7mRuntimeActivationDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7m"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7mRuntimeActivationDecisionBoundary(fixture),
      "mutation_not_allowed_in_oro7m"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7mRuntimeActivationDecisionBoundary(fixture),
      "migration_or_deploy_not_allowed_in_oro7m"
    );
  }
  for (const fixture of [
    failRouteEnablementAllowedFixture,
    failExpressMountAllowedFixture,
    failPublicAliasAllowedFixture,
    failApiBalanceAliasAllowedFixture,
    failApiTransactionAliasAllowedFixture,
    failApiOroplayBalanceRouteAllowedFixture,
    failApiOroplayTransactionRouteAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7mRuntimeActivationDecisionBoundary(fixture),
      "route_enablement_not_allowed_in_oro7m"
    );
  }

  const allReports =
    buildOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryFixtures().map(
      evaluateOro7mRuntimeActivationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 26, "fixture set must cover ORO-7M cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeActivationRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7M live traffic actual external call execution runtime activation decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7M live traffic actual external call execution runtime activation decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
