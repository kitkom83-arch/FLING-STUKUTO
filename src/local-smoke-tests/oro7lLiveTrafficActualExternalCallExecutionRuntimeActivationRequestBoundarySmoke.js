"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary");
const fixtures = require("../game-provider-mock/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures");

const {
  READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY,
  RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
} = require("../game-provider-mock/oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate");

const {
  ORO7L_RUNTIME_ACTIVATION_REQUEST_BOUNDARY_STATUS,
  ORO_7L_PHASE,
  PASS,
  RUNTIME_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
  buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
  buildOro7lRuntimeActivationRequestBoundarySummary,
  evaluateOro7lRuntimeActivationRequestBoundary,
  validateOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
} = helper;

const {
  buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures,
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
  failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeActivationDecisionIssuedFixture,
  failRuntimeActivationRequestNotSubmittedFixture,
  failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture,
  failRuntimeEnabledFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7L =
  "docs/ORO_7L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_BOUNDARY.md";
const DOC_7K =
  "docs/ORO_7K_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_GATE.md";
const WRAPPER = "src/local-smoke-tests/oro7lSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7l";
const DETAIL_SCRIPT = "smoke:oro-7l-runtime-activation-request";
const ORO7L_SECRET_SCAN_FILES = Object.freeze([
  DOC_7L,
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
  const doc7l = readRequired(DOC_7L);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7K",
    "## Runtime enablement final activation readiness intake",
    "## Runtime activation request record",
    "## Activation-request-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7L is runtime activation request boundary only.",
    "ORO-7L does not issue runtime activation decision.",
    "ORO-7L does not activate runtime execution.",
    "ORO-7L does not enable runtime execution.",
    "ORO-7L does not permit live OroPlay API calls.",
    "ORO-7L does not mutate wallet or ledger.",
    "ORO-7L does not mount any route.",
    "ORO-7L does not expose public aliases.",
    "ORO-7L only prepares the next separate runtime activation decision boundary.",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatusFromOro7k = ready_for_separate_actual_external_call_execution_runtime_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScopeFromOro7k = runtime_enablement_final_activation_readiness_only",
    "actualExternalCallExecutionRuntimeActivationRequestPrepared = true",
    "actualExternalCallExecutionRuntimeActivationRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeActivationRequestStatus = submitted_pending_actual_external_call_execution_runtime_activation_decision",
    "actualExternalCallExecutionRuntimeActivationRequestScope = runtime_activation_request_only",
    "actualExternalCallExecutionRuntimeActivationDecisionIssued = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7l.includes(marker), `${DOC_7L} missing marker ${marker}.`);
  }

  const doc7k = readRequired(DOC_7K);
  for (const marker of [
    "ORO-7L runtime activation request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
    RUNTIME_ACTIVATION_REQUEST_ONLY,
  ]) {
    assert(doc7k.includes(marker), `${DOC_7K} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7l",
    "oro-7l",
    "ORO_7L_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ACTIVATION_REQUEST_BOUNDARY.md",
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
        "ORO-7L records actual external call execution runtime activation request boundary only",
        RUNTIME_ACTIVATION_REQUEST_ONLY,
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION,
        "actualExternalCallExecutionRuntimeActivationDecisionIssued=false",
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
        "## ORO-7L Current",
        "runtime activation request boundary only",
        "pending runtime activation decision status",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7L current/live traffic actual external call execution runtime activation request boundary",
        "runtime activation request boundary only",
        "pending runtime activation decision status",
        "`smoke:oro-7l` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7L Live Traffic Actual External Call Execution Runtime Activation Request Boundary Coverage",
        "ORO-7L boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7L].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7L files must not contain ${marker}.`);
  }
  for (const file of ORO7L_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRuntimeActivationRouteOrCallFlags(summary) {
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
    "liveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryResult",
    "dependsOnOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate",
    "oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGatePassed",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPreparedFromOro7k",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessCheckedFromOro7k",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPassedFromOro7k",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatusFromOro7k",
    "actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScopeFromOro7k",
    "actualExternalCallExecutionRuntimeActivationRequestPrepared",
    "actualExternalCallExecutionRuntimeActivationRequestSubmitted",
    "actualExternalCallExecutionRuntimeActivationRequestStatus",
    "actualExternalCallExecutionRuntimeActivationRequestScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7L_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGate,
    true
  );
  assert.strictEqual(
    summary.oro7kLiveTrafficActualExternalCallExecutionRuntimeEnablementFinalActivationReadinessGatePassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPreparedFromOro7k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessCheckedFromOro7k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessPassedFromOro7k,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessStatusFromOro7k,
    READY_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementFinalActivationReadinessScopeFromOro7k,
    RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeActivationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeActivationRequestScope,
    RUNTIME_ACTIVATION_REQUEST_ONLY
  );
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeActivationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7L happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeActivationRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7L hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7L_RUNTIME_ACTIVATION_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof evaluateOro7lRuntimeActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary,
    "function"
  );
  assert.strictEqual(
    typeof buildOro7lRuntimeActivationRequestBoundarySummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7lRuntimeActivationRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7lRuntimeActivationRequestBoundarySummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(
      failMissingOro7kRuntimeEnablementFinalActivationReadinessFixture
    ),
    "missing_oro7k_runtime_enablement_final_activation_readiness"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(
      failInvalidOro7kRuntimeEnablementFinalActivationReadinessStatusFixture
    ),
    "invalid_oro7k_runtime_enablement_final_activation_readiness_status"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(
      failRuntimeActivationRequestNotSubmittedFixture
    ),
    "runtime_activation_request_record_required_in_oro7l"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(
      failRuntimeActivationRequestSubmittedWithoutDecisionRequirementFixture
    ),
    "next_phase_runtime_activation_decision_required_after_oro7l"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(failRuntimeActivationDecisionIssuedFixture),
    "runtime_activation_decision_not_allowed_in_oro7l"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7l"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7lRuntimeActivationRequestBoundary(fixture),
      "runtime_enablement_not_allowed_in_oro7l"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7lRuntimeActivationRequestBoundary(fixture),
      "live_execution_not_allowed_in_oro7l"
    );
  }
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7l"
  );
  assertHeld(
    evaluateOro7lRuntimeActivationRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7l"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7lRuntimeActivationRequestBoundary(fixture),
      "mutation_not_allowed_in_oro7l"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7lRuntimeActivationRequestBoundary(fixture),
      "migration_or_deploy_not_allowed_in_oro7l"
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
      evaluateOro7lRuntimeActivationRequestBoundary(fixture),
      "route_enablement_not_allowed_in_oro7l"
    );
  }

  const allReports =
    buildOro7lLiveTrafficActualExternalCallExecutionRuntimeActivationRequestBoundaryFixtures().map(
      evaluateOro7lRuntimeActivationRequestBoundary
    );
  assert.strictEqual(allReports.length, 27, "fixture set must cover ORO-7L cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeActivationRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7L live traffic actual external call execution runtime activation request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7L live traffic actual external call execution runtime activation request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
