"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
} = require("../game-provider-mock/oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary");

const {
  ORO7N_PHASE,
  ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
  PASS,
  buildOro7nRuntimeActivationFinalReadinessGate,
  buildOro7nRuntimeActivationFinalReadinessSummary,
  evaluateOro7nRuntimeActivationFinalReadinessGate,
  validateOro7nRuntimeActivationFinalReadinessGate,
} = helper;

const {
  buildOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures,
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
  failExternalNetworkCalledFixture,
  failInvalidOro7mRuntimeActivationDecisionStatusFixture,
  failLedgerMutationAllowedFixture,
  failLedgerMutationPerformedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCalledFixture,
  failMigrationAllowedFixture,
  failMissingOro7mRuntimeActivationDecisionFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeActivationFinalReadinessMissingFixture,
  failRuntimeActivationFinalReadinessScopeMismatchFixture,
  failRuntimeEnabledFixture,
  failSensitiveOutputFixture,
  failWalletMutationAllowedFixture,
  failWalletMutationPerformedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7N =
  "docs/ORO_7N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_GATE.md";
const DOC_7M =
  "docs/ORO_7M_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7nSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7n";
const DETAIL_SCRIPT = "smoke:oro-7n-runtime-activation-final-readiness";
const ORO7N_SCAN_FILES = Object.freeze([DOC_7N, BOUNDARY, FIXTURES, SMOKE, WRAPPER]);

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
  const doc7n = readRequired(DOC_7N);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7M",
    "## Runtime activation decision intake",
    "## Runtime activation final readiness gate",
    "## Final-readiness-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7N is runtime activation final readiness gate only.",
    "ORO-7N does not activate runtime execution.",
    "ORO-7N does not enable runtime execution.",
    "ORO-7N does not approve live execution.",
    "ORO-7N does not permit live OroPlay API calls.",
    "ORO-7N does not mutate wallet or ledger.",
    "ORO-7N does not mount any route.",
    "ORO-7N does not expose public aliases.",
    "actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m = approved_for_separate_actual_external_call_execution_runtime_activation_final_readiness_only",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessScope = runtime_activation_final_readiness_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionLiveExecuted = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7n.includes(marker), `${DOC_7N} missing marker ${marker}.`);
  }

  const doc7m = readRequired(DOC_7M);
  for (const marker of [
    "ORO-7N runtime activation final readiness gate is required next",
    ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
  ]) {
    assert(doc7m.includes(marker), `${DOC_7M} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7n",
    "oro-7n",
    "ORO_7N_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_GATE.md",
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
        "ORO-7N records actual external call execution runtime activation final readiness gate only",
        ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE,
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY,
        "actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared=true",
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
        "## ORO-7N Current",
        "runtime activation final readiness gate only",
        "runtime activation stays separate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7N current/live traffic actual external call execution runtime activation final readiness gate",
        "runtime activation final readiness gate only",
        "`smoke:oro-7n` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7N Live Traffic Actual External Call Execution Runtime Activation Final Readiness Gate Coverage",
        "ORO-7N boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7N].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7N files must not contain ${marker}.`);
  }
  for (const file of ORO7N_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateResult",
    "dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary",
    "oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m",
    "actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessPassed",
    "actualExternalCallExecutionRuntimeActivationFinalReadinessScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO7N_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7mLiveTrafficActualExternalCallExecutionRuntimeActivationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationDecisionIssuedFromOro7m,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationDecisionStatusFromOro7m,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_FINAL_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationFinalReadinessPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationFinalReadinessPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationFinalReadinessScope,
    ORO7N_RUNTIME_ACTIVATION_FINAL_READINESS_SCOPE
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequestOrExecutionApproval,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7N happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7N hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof buildOro7nRuntimeActivationFinalReadinessGate, "function");
  assert.strictEqual(typeof evaluateOro7nRuntimeActivationFinalReadinessGate, "function");
  assert.strictEqual(typeof validateOro7nRuntimeActivationFinalReadinessGate, "function");
  assert.strictEqual(typeof buildOro7nRuntimeActivationFinalReadinessSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7nRuntimeActivationFinalReadinessGate(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7nRuntimeActivationFinalReadinessSummary(happy), happy);
  assert.deepStrictEqual(validateOro7nRuntimeActivationFinalReadinessGate(happy), happy);

  assertHeld(
    evaluateOro7nRuntimeActivationFinalReadinessGate(
      failMissingOro7mRuntimeActivationDecisionFixture
    ),
    "missing_oro7m_runtime_activation_decision"
  );
  assertHeld(
    evaluateOro7nRuntimeActivationFinalReadinessGate(
      failInvalidOro7mRuntimeActivationDecisionStatusFixture
    ),
    "invalid_oro7m_runtime_activation_decision_status"
  );
  for (const fixture of [
    failRuntimeActivationFinalReadinessMissingFixture,
    failRuntimeActivationFinalReadinessScopeMismatchFixture,
  ]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "runtime_activation_final_readiness_record_required_in_oro7n"
    );
  }
  assertHeld(
    evaluateOro7nRuntimeActivationFinalReadinessGate(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7n"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "runtime_enablement_not_allowed_in_oro7n"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "live_execution_not_allowed_in_oro7n"
    );
  }
  for (const fixture of [failExternalNetworkAllowedFixture, failExternalNetworkCalledFixture]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "external_network_not_allowed_in_oro7n"
    );
  }
  assertHeld(
    evaluateOro7nRuntimeActivationFinalReadinessGate(failLiveOroPlayApiCalledFixture),
    "live_oroplay_api_call_not_allowed_in_oro7n"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failWalletMutationPerformedFixture,
    failLedgerMutationAllowedFixture,
    failLedgerMutationPerformedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "mutation_not_allowed_in_oro7n"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "migration_or_deploy_not_allowed_in_oro7n"
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
      evaluateOro7nRuntimeActivationFinalReadinessGate(fixture),
      "route_enablement_not_allowed_in_oro7n"
    );
  }
  assertHeld(
    evaluateOro7nRuntimeActivationFinalReadinessGate(failSensitiveOutputFixture),
    "sensitive_output_not_allowed_in_oro7n"
  );

  const allReports =
    buildOro7nLiveTrafficActualExternalCallExecutionRuntimeActivationFinalReadinessGateFixtures().map(
      evaluateOro7nRuntimeActivationFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 30, "fixture set must cover ORO-7N cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7N live traffic actual external call execution runtime activation final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7N live traffic actual external call execution runtime activation final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
