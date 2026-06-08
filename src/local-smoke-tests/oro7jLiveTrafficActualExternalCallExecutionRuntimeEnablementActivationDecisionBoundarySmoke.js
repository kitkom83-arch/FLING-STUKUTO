"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixtures");

const {
  RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION,
} = require("../game-provider-mock/oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
  ORO7J_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY_STATUS,
  ORO_7J_PHASE,
  PASS,
  RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
  buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
  buildOro7jRuntimeEnablementActivationDecisionBoundarySummary,
  evaluateOro7jRuntimeEnablementActivationDecisionBoundary,
  validateOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
} = helper;

const {
  buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixtures,
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
  failInvalidOro7iRuntimeEnablementActivationRequestStatusFixture,
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7iRuntimeEnablementActivationRequestFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeActivatedFixture,
  failRuntimeEnabledFixture,
  failRuntimeEnablementActivationDecisionNotIssuedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7J =
  "docs/ORO_7J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY.md";
const DOC_7I =
  "docs/ORO_7I_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7jSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7j";
const DETAIL_SCRIPT = "smoke:oro-7j-runtime-enable-activation-decision";
const ORO7J_SECRET_SCAN_FILES = Object.freeze([
  DOC_7J,
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
  const doc7j = readRequired(DOC_7J);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7I",
    "## Runtime enablement activation request intake",
    "## Activation decision record",
    "## Activation-decision-only boundary",
    "## Explicit non-activation rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7J is runtime enablement activation decision boundary only.",
    "ORO-7J does not activate runtime execution.",
    "ORO-7J does not enable runtime execution.",
    "ORO-7J does not permit live OroPlay API calls.",
    "ORO-7J does not mutate wallet or ledger.",
    "ORO-7J does not mount any route.",
    "ORO-7J does not expose public aliases.",
    "ORO-7J only prepares the next separate runtime enablement final activation readiness gate.",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i = true",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i = submitted_pending_actual_external_call_execution_runtime_enablement_activation_decision",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i = runtime_enablement_activation_request_only",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_enablement_final_activation_readiness_only",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionScope = runtime_enablement_activation_decision_only",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionActivated = false",
    "liveOroPlayApiCallAllowed = false",
    "routeEnablementAllowed = false",
  ]) {
    assert(doc7j.includes(marker), `${DOC_7J} missing marker ${marker}.`);
  }

  const doc7i = readRequired(DOC_7I);
  for (const marker of [
    "ORO-7J runtime enablement activation decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
    RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
  ]) {
    assert(doc7i.includes(marker), `${DOC_7I} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7j",
    "oro-7j",
    "ORO_7J_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY.md",
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
        "ORO-7J records actual external call execution runtime enablement activation decision only",
        RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY,
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY,
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
        "## ORO-7J Current",
        "runtime enablement activation decision boundary only",
        "final activation readiness gate",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7J current/live traffic actual external call execution runtime enablement activation decision boundary",
        "runtime enablement activation decision boundary only",
        "`smoke:oro-7j` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7J Live Traffic Actual External Call Execution Runtime Enablement Activation Decision Boundary Coverage",
        "ORO-7J boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7J].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7J files must not contain ${marker}.`);
  }
  for (const file of ORO7J_SECRET_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryResult",
    "dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary",
    "oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i",
    "actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus",
    "actualExternalCallExecutionRuntimeEnablementActivationDecisionScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7J_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7iLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestPreparedFromOro7i,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestSubmittedFromOro7i,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestStatusFromOro7i,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationRequestScopeFromOro7i,
    RUNTIME_ENABLEMENT_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionPrepared,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionIssued,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_ACTIVATION_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementActivationDecisionScope,
    RUNTIME_ENABLEMENT_ACTIVATION_DECISION_ONLY
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalActivationReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7J happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7J hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7J_RUNTIME_ENABLEMENT_ACTIVATION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof evaluateOro7jRuntimeEnablementActivationDecisionBoundary, "function");
  assert.strictEqual(
    typeof validateOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro7jRuntimeEnablementActivationDecisionBoundarySummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7jRuntimeEnablementActivationDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7jRuntimeEnablementActivationDecisionBoundarySummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundary(
      happy
    ),
    happy
  );

  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(
      failMissingOro7iRuntimeEnablementActivationRequestFixture
    ),
    "missing_oro7i_runtime_enablement_activation_request"
  );
  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(
      failInvalidOro7iRuntimeEnablementActivationRequestStatusFixture
    ),
    "invalid_oro7i_runtime_enablement_activation_request_status"
  );
  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(
      failRuntimeEnablementActivationDecisionNotIssuedFixture
    ),
    "runtime_enablement_activation_decision_record_required_in_oro7j"
  );
  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(failRuntimeActivatedFixture),
    "runtime_activation_not_allowed_in_oro7j"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary(fixture),
      "runtime_enablement_not_allowed_in_oro7j"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary(fixture),
      "live_execution_not_allowed_in_oro7j"
    );
  }
  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7j"
  );
  assertHeld(
    evaluateOro7jRuntimeEnablementActivationDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7j"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary(fixture),
      "mutation_not_allowed_in_oro7j"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary(fixture),
      "migration_or_deploy_not_allowed_in_oro7j"
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
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary(fixture),
      "route_enablement_not_allowed_in_oro7j"
    );
  }

  const allReports =
    buildOro7jLiveTrafficActualExternalCallExecutionRuntimeEnablementActivationDecisionBoundaryFixtures().map(
      evaluateOro7jRuntimeEnablementActivationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 25, "fixture set must cover ORO-7J cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7J live traffic actual external call execution runtime enablement activation decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7J live traffic actual external call execution runtime enablement activation decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
