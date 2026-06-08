"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures");
const {
  ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
} = require("../game-provider-mock/oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate");

const {
  ORO7U_PHASE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
  PASS,
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestSummary,
  evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
  validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
} = helper;

const {
  buildOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures,
  failApiBalanceAliasFixture,
  failApiOroplayBalanceRouteFixture,
  failApiOroplayTransactionRouteFixture,
  failApiTransactionAliasFixture,
  failDbTransactionFixture,
  failDeployFixture,
  failExpressMountFixture,
  failExternalNetworkAllowedCalledFixture,
  failLedgerMutationFixture,
  failLiveExecutedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationFixture,
  failMissingOro7tPostDecisionReadinessFixture,
  failOro7tPostDecisionReadinessScopeMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7U =
  "docs/ORO_7U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_7T =
  "docs/ORO_7T_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7uSmoke.js";
const GATE =
  "src/game-provider-mock/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7u";
const DETAIL_SCRIPT =
  "smoke:oro-7u-runtime-activation-execution-final-authorization-request";
const ORO7U_SCAN_FILES = Object.freeze([DOC_7U, GATE, FIXTURES, SMOKE, WRAPPER]);

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
  const guardedMarkers = [
    ["to", "ken"].join(""),
    ["be", "arer"].join(""),
    ["pass", "word"].join(""),
    ["client", "S", "ecret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
    ["private", " ", "key"].join(""),
  ];
  for (const marker of guardedMarkers) {
    assert(!scanned.includes(marker), `${label} includes guarded marker ${marker}.`);
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
  const doc7u = readRequired(DOC_7U);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7T",
    "## Runtime activation execution final authorization request record",
    "## Final-authorization-request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7U is runtime activation execution final authorization request only.",
    "ORO-7U does not activate runtime execution.",
    "ORO-7U does not enable runtime execution.",
    "ORO-7U does not authorize live execution.",
    "ORO-7U does not execute live traffic.",
    "ORO-7U does not permit live OroPlay API calls.",
    "ORO-7U does not mutate wallet or ledger.",
    "ORO-7U does not mount any route.",
    "ORO-7U does not expose public aliases.",
    "dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate = true",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t = true",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t = runtime_activation_execution_post_decision_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus = submitted_pending_actual_external_call_execution_runtime_activation_execution_final_authorization_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope = runtime_activation_execution_final_authorization_request_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7u.includes(marker), `${DOC_7U} missing marker ${marker}.`);
  }

  const doc7t = readRequired(DOC_7T);
  for (const marker of [
    "ORO-7U is the separate runtime activation execution final authorization request after ORO-7T.",
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
  ]) {
    assert(doc7t.includes(marker), `${DOC_7T} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7u",
    "oro-7u",
    "ORO_7U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_BOUNDARY.md",
  ]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [GATE, FIXTURES, SMOKE, WRAPPER]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-7U records actual external call execution runtime activation execution final authorization request only",
        ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE,
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted=true",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "actualExternalCallExecutionActivated=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        SCRIPT,
        DETAIL_SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7U Current",
        "runtime activation execution final authorization request only",
        "final authorization decision stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7U current/live traffic actual external call execution runtime activation execution final authorization request boundary",
        "runtime activation execution final authorization request only",
        "`smoke:oro-7u` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7U Live Traffic Actual External Call Execution Runtime Activation Execution Final Authorization Request Boundary Coverage",
        "ORO-7U final-authorization-request-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7U].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7U files must not contain ${marker}.`);
  }
  for (const file of ORO7U_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionRouteOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryResult",
    "dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate",
    "oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t",
    "actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7U_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7tLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessPassedFromOro7t,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionPostDecisionReadinessScopeFromOro7t,
    ORO7T_RUNTIME_ACTIVATION_EXECUTION_POST_DECISION_READINESS_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatus,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScope,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7U happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7U hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
    happyPathRuntimeActivationExecutionFinalAuthorizationRequestFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7uRuntimeActivationExecutionFinalAuthorizationRequestSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(happy),
    happy
  );

  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failMissingOro7tPostDecisionReadinessFixture
    ),
    "missing_oro7t_runtime_activation_execution_post_decision_readiness"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failOro7tPostDecisionReadinessScopeMismatchFixture
    ),
    "invalid_oro7t_runtime_activation_execution_post_decision_readiness_scope"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failLiveExecutedFixture
    ),
    "live_execution_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failExternalNetworkAllowedCalledFixture
    ),
    "external_network_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failWalletMutationFixture
    ),
    "wallet_mutation_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failLedgerMutationFixture
    ),
    "ledger_mutation_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failPrismaWriteFixture
    ),
    "prisma_write_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failDbTransactionFixture
    ),
    "db_transaction_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failMigrationFixture
    ),
    "migration_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failDeployFixture
    ),
    "deploy_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failRouteEnablementFixture
    ),
    "route_enablement_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failExpressMountFixture
    ),
    "express_mount_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failPublicAliasFixture
    ),
    "public_alias_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failApiBalanceAliasFixture
    ),
    "api_balance_alias_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7u"
  );
  assertHeld(
    evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7u"
  );

  const allReports =
    buildOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryFixtures().map(
      evaluateOro7uRuntimeActivationExecutionFinalAuthorizationRequestBoundary
    );
  assert.strictEqual(allReports.length, 22, "fixture set must cover ORO-7U cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7U live traffic actual external call execution runtime activation execution final authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7U live traffic actual external call execution runtime activation execution final authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
