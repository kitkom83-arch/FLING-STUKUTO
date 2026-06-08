"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate");
const fixtures = require("../game-provider-mock/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
} = require("../game-provider-mock/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");

const {
  ORO7H_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE_STATUS,
  ORO_7H_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
  buildOro7hRuntimeEnablementFinalReadinessGateSummary,
  evaluateOro7hRuntimeEnablementFinalReadinessGate,
  validateOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
} = helper;

const {
  buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures,
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
  failFinalReadinessNotPassedFixture,
  failInvalidOro7gRuntimeEnablementDecisionStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7gRuntimeEnablementDecisionFixture,
  failOro7gRuntimeEnablementDecisionNotIssuedFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7H =
  "docs/ORO_7H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE.md";
const DOC_7G =
  "docs/ORO_7G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7hSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7h";
const DETAIL_SCRIPT = "smoke:oro-7h-runtime-enable-final-readiness";
const ORO7H_SECRET_SCAN_FILES = Object.freeze([
  DOC_7H,
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
  const doc7h = readRequired(DOC_7H);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7G",
    "## Runtime enablement decision intake",
    "## Final readiness gate",
    "## Readiness-only boundary",
    "## Explicit non-enablement rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7H is runtime enablement final readiness gate only.",
    "ORO-7H does not enable runtime execution.",
    "ORO-7H does not activate external calls.",
    "ORO-7H does not permit live OroPlay API calls.",
    "ORO-7H does not mutate wallet or ledger.",
    "ORO-7H does not mount any route.",
    "ORO-7H does not expose public aliases.",
    "ORO-7H only prepares the next separate runtime enablement activation request boundary.",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus = ready_for_separate_actual_external_call_execution_runtime_enablement_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessScope = runtime_enablement_final_readiness_only",
  ]) {
    assert(doc7h.includes(marker), `${DOC_7H} missing marker ${marker}.`);
  }

  const doc7g = readRequired(DOC_7G);
  for (const marker of [
    "ORO-7H runtime enablement final readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
    RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  ]) {
    assert(doc7g.includes(marker), `${DOC_7G} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7h",
    "oro-7h",
    "ORO_7H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE.md",
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
        "ORO-7H records actual external call execution runtime enablement final readiness gate only",
        "runtime_enablement_final_readiness_only",
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
        "actualExternalCallExecutionRuntimeEnabled=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7H Current",
        "runtime enablement final readiness gate only",
        "activation request boundary",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7H current/live traffic actual external call execution runtime enablement final readiness gate",
        "runtime enablement final readiness gate only",
        "`smoke:oro-7h` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7H Live Traffic Actual External Call Execution Runtime Enablement Final Readiness Gate Coverage",
        "ORO-7H boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7H].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7H files must not contain ${marker}.`);
  }
  for (const file of ORO7H_SECRET_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateResult",
    "dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary",
    "oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g",
    "actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7H_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro7g,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro7g,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro7g,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro7g,
    RUNTIME_ENABLEMENT_DECISION_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessChecked, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessPassed, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessScope,
    RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7H happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7H hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7H_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
    "function"
  );
  assert.strictEqual(typeof evaluateOro7hRuntimeEnablementFinalReadinessGate, "function");
  assert.strictEqual(
    typeof validateOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro7hRuntimeEnablementFinalReadinessGateSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7hRuntimeEnablementFinalReadinessGate(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7hRuntimeEnablementFinalReadinessGateSummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate(happy),
    happy
  );

  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(
      failMissingOro7gRuntimeEnablementDecisionFixture
    ),
    "missing_oro7g_runtime_enablement_decision"
  );
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(
      failOro7gRuntimeEnablementDecisionNotIssuedFixture
    ),
    "missing_oro7g_runtime_enablement_decision"
  );
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(
      failInvalidOro7gRuntimeEnablementDecisionStatusFixture
    ),
    "invalid_oro7g_runtime_enablement_decision_status"
  );
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(failFinalReadinessNotPassedFixture),
    "runtime_enablement_final_readiness_record_required_in_oro7h"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7hRuntimeEnablementFinalReadinessGate(fixture),
      "runtime_enablement_not_allowed_in_oro7h"
    );
  }
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7h"
  );
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7hRuntimeEnablementFinalReadinessGate(fixture),
      "live_execution_not_allowed_in_oro7h"
    );
  }
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7h"
  );
  assertHeld(
    evaluateOro7hRuntimeEnablementFinalReadinessGate(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7h"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7hRuntimeEnablementFinalReadinessGate(fixture),
      "mutation_not_allowed_in_oro7h"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7hRuntimeEnablementFinalReadinessGate(fixture),
      "migration_or_deploy_not_allowed_in_oro7h"
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
      evaluateOro7hRuntimeEnablementFinalReadinessGate(fixture),
      "route_enablement_not_allowed_in_oro7h"
    );
  }

  const allReports =
    buildOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGateFixtures().map(
      evaluateOro7hRuntimeEnablementFinalReadinessGate
    );
  assert.strictEqual(allReports.length, 26, "fixture set must cover ORO-7H cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7H live traffic actual external call execution runtime enablement final readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7H live traffic actual external call execution runtime enablement final readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
