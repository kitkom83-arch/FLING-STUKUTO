"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary");
const fixtures = require("../game-provider-mock/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures");

const {
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
} = require("../game-provider-mock/oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate");

const {
  ORO7I_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_BOUNDARY_STATUS,
  ORO_7I_PHASE,
  PASS,
  RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
  buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
  buildOro7iRuntimeEnablementActivationRequestBoundarySummary,
  evaluateOro7iRuntimeEnablementActivationRequestBoundary,
  validateOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
} = helper;

const {
  buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures,
  failActivationDecisionIssuedFixture,
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
  failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7hRuntimeEnablementFinalReadinessFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failRuntimeEnablementActivationRequestNotSubmittedFixture,
  failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7I =
  "docs/ORO_7I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_BOUNDARY.md";
const DOC_7H =
  "docs/ORO_7H_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7iSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7i";
const DETAIL_SCRIPT = "smoke:oro-7i-runtime-enable-activation-request";
const ORO7I_SECRET_SCAN_FILES = Object.freeze([
  DOC_7I,
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
  const doc7i = readRequired(DOC_7I);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7H",
    "## Runtime enablement final readiness intake",
    "## Activation request record",
    "## Activation-request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7I is runtime enablement activation request boundary only.",
    "ORO-7I does not issue activation decision.",
    "ORO-7I does not enable runtime execution.",
    "ORO-7I does not activate external calls.",
    "ORO-7I does not permit live OroPlay API calls.",
    "ORO-7I does not mutate wallet or ledger.",
    "ORO-7I does not mount any route.",
    "ORO-7I does not expose public aliases.",
    "ORO-7I only prepares the next separate runtime enablement activation decision boundary.",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessStatusFromOro7h = ready_for_separate_actual_external_call_execution_runtime_enablement_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessScopeFromOro7h = runtime_enablement_final_readiness_only",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestPrepared = true",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestStatus = submitted_pending_actual_external_call_execution_runtime_enablement_activation_decision",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestScope = runtime_enablement_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7i.includes(marker), `${DOC_7I} missing marker ${marker}.`);
  }

  const doc7h = readRequired(DOC_7H);
  for (const marker of [
    "ORO-7I runtime enablement activation request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
    RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  ]) {
    assert(doc7h.includes(marker), `${DOC_7H} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7i",
    "oro-7i",
    "ORO_7I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_BOUNDARY.md",
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
        "ORO-7I records actual external call execution runtime enablement activation request boundary only",
        RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
        "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued=false",
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
        "## ORO-7I Current",
        "runtime enablement activation request boundary only",
        "pending runtime enablement activation decision status",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7I current/live traffic actual external call execution runtime enablement activation request boundary",
        "runtime enablement activation request boundary only",
        "pending runtime enablement activation decision status",
        "`smoke:oro-7i` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7I Live Traffic Actual External Call Execution Runtime Enablement Activation Request Boundary Coverage",
        "ORO-7I boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7I].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7I files must not contain ${marker}.`);
  }
  for (const file of ORO7I_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeActivationRouteOrCallFlags(summary) {
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued,
    false
  );
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryResult",
    "dependsOnOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate",
    "oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGatePassed",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessPreparedFromOro7h",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessCheckedFromOro7h",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessPassedFromOro7h",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessStatusFromOro7h",
    "actualExternalCallExecutionRuntimeEnablementFinalReadinessScopeFromOro7h",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestPrepared",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestSubmitted",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestStatus",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestScope",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7I_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7hLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessPreparedFromOro7h,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessCheckedFromOro7h,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessPassedFromOro7h,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessStatusFromOro7h,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalReadinessScopeFromOro7h,
    RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestSubmitted,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestScope,
    RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
  );
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementActivationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7I happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7I hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7I_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7iRuntimeEnablementActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7iRuntimeEnablementActivationRequestBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7iRuntimeEnablementActivationRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7iRuntimeEnablementActivationRequestBoundarySummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(
      failMissingOro7hRuntimeEnablementFinalReadinessFixture
    ),
    "missing_oro7h_runtime_enablement_final_readiness"
  );
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(
      failInvalidOro7hRuntimeEnablementFinalReadinessStatusFixture
    ),
    "invalid_oro7h_runtime_enablement_final_readiness_status"
  );
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(
      failRuntimeEnablementActivationRequestNotSubmittedFixture
    ),
    "runtime_enablement_activation_request_record_required_in_oro7i"
  );
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(
      failRuntimeEnablementActivationRequestSubmittedWithoutDecisionRequirementFixture
    ),
    "next_phase_activation_decision_required_after_oro7i"
  );
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(failActivationDecisionIssuedFixture),
    "activation_decision_not_allowed_in_oro7i"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7iRuntimeEnablementActivationRequestBoundary(fixture),
      "runtime_enablement_not_allowed_in_oro7i"
    );
  }
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7i"
  );
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7iRuntimeEnablementActivationRequestBoundary(fixture),
      "live_execution_not_allowed_in_oro7i"
    );
  }
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7i"
  );
  assertHeld(
    evaluateOro7iRuntimeEnablementActivationRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7i"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7iRuntimeEnablementActivationRequestBoundary(fixture),
      "mutation_not_allowed_in_oro7i"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7iRuntimeEnablementActivationRequestBoundary(fixture),
      "migration_or_deploy_not_allowed_in_oro7i"
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
      evaluateOro7iRuntimeEnablementActivationRequestBoundary(fixture),
      "route_enablement_not_allowed_in_oro7i"
    );
  }

  const allReports =
    buildOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryFixtures().map(
      evaluateOro7iRuntimeEnablementActivationRequestBoundary
    );
  assert.strictEqual(allReports.length, 27, "fixture set must cover ORO-7I cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeActivationRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7I live traffic actual external call execution runtime enablement activation request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7I live traffic actual external call execution runtime enablement activation request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
