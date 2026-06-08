"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures");
const {
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
  ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
} = require("../game-provider-mock/oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary");

const {
  ORO7V_PHASE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
  ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
  PASS,
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionSummary,
  evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
  validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
} = helper;

const {
  buildOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures,
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
  failMissingOro7uFinalAuthorizationRequestFixture,
  failOro7uFinalAuthorizationRequestScopeMismatchFixture,
  failOro7uFinalAuthorizationRequestStatusMismatchFixture,
  failPrismaWriteFixture,
  failPublicAliasFixture,
  failRouteEnablementFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationFixture,
  happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7V =
  "docs/ORO_7V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_7U =
  "docs/ORO_7U_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7vSmoke.js";
const GATE =
  "src/game-provider-mock/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7v";
const DETAIL_SCRIPT =
  "smoke:oro-7v-runtime-activation-execution-final-authorization-decision";
const ORO7V_SCAN_FILES = Object.freeze([DOC_7V, GATE, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7v = readRequired(DOC_7V);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7U",
    "## Runtime activation execution final authorization decision record",
    "## Final-authorization-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7V is runtime activation execution final authorization decision only.",
    "ORO-7V does not activate runtime execution.",
    "ORO-7V does not enable runtime execution.",
    "ORO-7V does not authorize actual execution.",
    "ORO-7V does not approve live execution.",
    "ORO-7V does not execute live traffic.",
    "ORO-7V does not permit live OroPlay API calls.",
    "ORO-7V does not mutate wallet or ledger.",
    "ORO-7V does not mount any route.",
    "ORO-7V does not expose public aliases.",
    "dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u = submitted_pending_actual_external_call_execution_runtime_activation_execution_final_authorization_decision",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u = runtime_activation_execution_final_authorization_request_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued = true",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_activation_execution_authorized_execution_readiness_only",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope = runtime_activation_execution_final_authorization_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7v.includes(marker), `${DOC_7V} missing marker ${marker}.`);
  }

  const doc7u = readRequired(DOC_7U);
  for (const marker of [
    "ORO-7V is the separate runtime activation execution final authorization decision after ORO-7U.",
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
  ]) {
    assert(doc7u.includes(marker), `${DOC_7U} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7v",
    "oro-7v",
    "ORO_7V_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_BOUNDARY.md",
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
        "ORO-7V records actual external call execution runtime activation execution final authorization decision only",
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE,
        ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS,
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE,
        ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS,
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared=true",
        "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued=true",
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
        "## ORO-7V Current",
        "runtime activation execution final authorization decision only",
        "authorized execution readiness stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7V current/live traffic actual external call execution runtime activation execution final authorization decision boundary",
        "runtime activation execution final authorization decision only",
        "`smoke:oro-7v` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7V Live Traffic Actual External Call Execution Runtime Activation Execution Final Authorization Decision Boundary Coverage",
        "ORO-7V final-authorization-decision-specific package smoke alias",
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
  const gateText = [GATE, FIXTURES, DOC_7V].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!gateText.includes(marker), `ORO-7V files must not contain ${marker}.`);
  }
  for (const file of ORO7V_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryResult",
    "dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary",
    "oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus",
    "actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7V_PHASE);
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7uLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestPreparedFromOro7u,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestSubmittedFromOro7u,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestStatusFromOro7u,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationRequestScopeFromOro7u,
    ORO7U_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_REQUEST_SCOPE
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionStatus,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_STATUS
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionScope,
    ORO7V_RUNTIME_ACTIVATION_EXECUTION_FINAL_AUTHORIZATION_DECISION_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationExecutionAuthorizedExecutionReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7V happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7V hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
    happyPathRuntimeActivationExecutionFinalAuthorizationDecisionFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(
    buildOro7vRuntimeActivationExecutionFinalAuthorizationDecisionSummary(happy),
    happy
  );
  assert.deepStrictEqual(
    validateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(happy),
    happy
  );

  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failMissingOro7uFinalAuthorizationRequestFixture
    ),
    "missing_oro7u_runtime_activation_execution_final_authorization_request"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failOro7uFinalAuthorizationRequestStatusMismatchFixture
    ),
    "invalid_oro7u_runtime_activation_execution_final_authorization_request_status"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failOro7uFinalAuthorizationRequestScopeMismatchFixture
    ),
    "invalid_oro7u_runtime_activation_execution_final_authorization_request_scope"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failRuntimeActivatedFixture
    ),
    "runtime_activation_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failRuntimeEnabledFixture
    ),
    "runtime_enablement_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failLiveExecutedFixture
    ),
    "live_execution_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failExternalNetworkAllowedCalledFixture
    ),
    "external_network_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failLiveOroPlayApiCalledFixture
    ),
    "live_oroplay_api_call_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failWalletMutationFixture
    ),
    "wallet_mutation_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failLedgerMutationFixture
    ),
    "ledger_mutation_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failPrismaWriteFixture
    ),
    "prisma_write_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failDbTransactionFixture
    ),
    "db_transaction_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failMigrationFixture
    ),
    "migration_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failDeployFixture
    ),
    "deploy_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failRouteEnablementFixture
    ),
    "route_enablement_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failExpressMountFixture
    ),
    "express_mount_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failPublicAliasFixture
    ),
    "public_alias_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failApiBalanceAliasFixture
    ),
    "api_balance_alias_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failApiTransactionAliasFixture
    ),
    "api_transaction_alias_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failApiOroplayBalanceRouteFixture
    ),
    "api_oroplay_balance_route_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failApiOroplayTransactionRouteFixture
    ),
    "api_oroplay_transaction_route_not_allowed_in_oro7v"
  );
  assertHeld(
    evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary(
      failSensitiveOutputFixture
    ),
    "sensitive_output_not_allowed_in_oro7v"
  );

  const allReports =
    buildOro7vLiveTrafficActualExternalCallExecutionRuntimeActivationExecutionFinalAuthorizationDecisionBoundaryFixtures().map(
      evaluateOro7vRuntimeActivationExecutionFinalAuthorizationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 23, "fixture set must cover ORO-7V cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7V live traffic actual external call execution runtime activation execution final authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7V live traffic actual external call execution runtime activation execution final authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
