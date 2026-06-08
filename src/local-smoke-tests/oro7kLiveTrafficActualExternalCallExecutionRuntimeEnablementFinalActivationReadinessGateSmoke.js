"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate");
const fixtures = require("../game-provider-mock/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
} = require("../game-provider-mock/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary");

const {
  ORO7K_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_GATE_STATUS,
  ORO_7K_PHASE,
  PASS,
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
  buildOro7kRuntimeEnablementFinalActivationReadinessGateSummary,
  evaluateOro7kRuntimeEnablementFinalActivationReadinessGate,
  validateOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
} = helper;

const {
  buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures,
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
  failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7jRuntimeEnablementActivationDecisionFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeActivationDecisionIssuedFixture,
  failRuntimeActivationRequestSubmittedFixture,
  failRuntimeEnabledFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7K =
  "docs/ORO_7K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_GATE.md";
const DOC_7J =
  "docs/ORO_7J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7kSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate.js";
const FIXTURES =
  "src/game-provider-mock/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateSmoke.js";
const SCRIPT = "smoke:oro-7k";
const DETAIL_SCRIPT = "smoke:oro-7k-runtime-enable-final-activation-readiness";
const ORO7K_SECRET_SCAN_FILES = Object.freeze([
  DOC_7K,
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
  const doc7k = readRequired(DOC_7K);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7J",
    "## Runtime enablement activation decision intake",
    "## Final activation readiness gate",
    "## Final-activation-readiness-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7K is runtime enablement final activation readiness gate only.",
    "ORO-7K does not submit runtime activation request.",
    "ORO-7K does not issue runtime activation decision.",
    "ORO-7K does not activate runtime execution.",
    "ORO-7K does not enable runtime execution.",
    "ORO-7K does not permit live OroPlay API calls.",
    "ORO-7K does not mutate wallet or ledger.",
    "ORO-7K does not mount any route.",
    "ORO-7K does not expose public aliases.",
    "ORO-7K only prepares the next separate runtime activation request boundary.",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatus = ready_for_separate_actual_external_call_execution_runtime_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScope = runtime_enablement_final_activation_readiness_only",
  ]) {
    assert(doc7k.includes(marker), `${DOC_7K} missing marker ${marker}.`);
  }

  const doc7j = readRequired(DOC_7J);
  for (const marker of [
    "ORO-7K runtime enablement final activation readiness gate is required next",
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY,
    RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  ]) {
    assert(doc7j.includes(marker), `${DOC_7J} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7k",
    "oro-7k",
    "ORO_7K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_GATE.md",
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
        "ORO-7K records actual external call execution runtime enablement final activation readiness gate only",
        RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
        READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY,
        "actualExternalCallExecutionRuntimeActivationRequestSubmitted=false",
        "actualExternalCallExecutionRuntimeActivationDecisionIssued=false",
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
        "## ORO-7K Current",
        "runtime enablement final activation readiness gate only",
        "runtime activation request boundary",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7K current/live traffic actual external call execution runtime enablement final activation readiness gate",
        "runtime enablement final activation readiness gate only",
        "`smoke:oro-7k` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7K Live Traffic Actual External Call Execution Runtime Enablement Final Activation Readiness Gate Coverage",
        "ORO-7K boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7K].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7K files must not contain ${marker}.`);
  }
  for (const file of ORO7K_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeExecutionRouteOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationRequestSubmitted, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationDecisionIssued, false);
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateResult",
    "dependsOnOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary",
    "oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryPassed",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionPreparedFromOro7j",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssuedFromOro7j",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionStatusFromOro7j",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionScopeFromOro7j",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPrepared",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessChecked",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPassed",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatus",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScope",
    "actualExternalCallExecutionRuntimeActivationRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationDecisionIssued",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequest",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7K_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionPreparedFromOro7j,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionIssuedFromOro7j,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionStatusFromOro7j,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionScopeFromOro7j,
    RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessChecked,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatus,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScope,
    RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7K happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7K hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7K_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_GATE_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
    "function"
  );
  assert.strictEqual(typeof evaluateOro7kRuntimeEnablementFinalActivationReadinessGate, "function");
  assert.strictEqual(
    typeof validateOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
    "function"
  );
  assert.strictEqual(typeof buildOro7kRuntimeEnablementFinalActivationReadinessGateSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7kRuntimeEnablementFinalActivationReadinessGateSummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(
      failMissingOro7jRuntimeEnablementActivationDecisionFixture
    ),
    "missing_oro7j_runtime_enablement_activation_decision"
  );
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(
      failInvalidOro7jRuntimeEnablementActivationDecisionStatusFixture
    ),
    "invalid_oro7j_runtime_enablement_activation_decision_status"
  );
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(
      failRuntimeActivationRequestSubmittedFixture
    ),
    "runtime_activation_request_not_allowed_in_oro7k"
  );
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(
      failRuntimeActivationDecisionIssuedFixture
    ),
    "runtime_activation_decision_not_allowed_in_oro7k"
  );
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7k"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(fixture),
      "runtime_enablement_not_allowed_in_oro7k"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(fixture),
      "live_execution_not_allowed_in_oro7k"
    );
  }
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7k"
  );
  assertHeld(
    evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7k"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(fixture),
      "mutation_not_allowed_in_oro7k"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(fixture),
      "migration_or_deploy_not_allowed_in_oro7k"
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
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate(fixture),
      "route_enablement_not_allowed_in_oro7k"
    );
  }

  const allReports =
    buildOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGateFixtures().map(
      evaluateOro7kRuntimeEnablementFinalActivationReadinessGate
    );
  assert.strictEqual(allReports.length, 26, "fixture set must cover ORO-7K cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7K live traffic actual external call execution runtime enablement final activation readiness gate smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7K live traffic actual external call execution runtime enablement final activation readiness gate smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
