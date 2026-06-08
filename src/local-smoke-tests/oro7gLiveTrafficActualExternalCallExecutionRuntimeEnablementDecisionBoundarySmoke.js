"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures");

const {
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
} = require("../game-provider-mock/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
  ORO7G_RUNTIME_ENABLEMENT_DECISION_BOUNDARY_STATUS,
  ORO_7G_PHASE,
  PASS,
  RUNTIME_ENABLEMENT_DECISION_ONLY,
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
  buildOro7gRuntimeEnablementDecisionBoundarySummary,
  evaluateOro7gRuntimeEnablementDecisionBoundary,
  validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
} = helper;

const {
  buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures,
  failActualExecutionActivatedFixture,
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
  failLedgerMutationAllowedFixture,
  failLiveExecutedFixture,
  failLiveExecutionApprovedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7fRuntimeEnablementRequestFixture,
  failOro7fRuntimeEnablementRequestNotSubmittedFixture,
  failPrismaWriteAllowedFixture,
  failPublicAliasAllowedFixture,
  failRouteEnablementAllowedFixture,
  failRuntimeEnabledFixture,
  failRuntimeEnablementDecisionNotIssuedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7G =
  "docs/ORO_7G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md";
const DOC_7F =
  "docs/ORO_7F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7gSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7g";
const DETAIL_SCRIPT = "smoke:oro-7g-runtime-enable-decision";
const ORO7G_SECRET_SCAN_FILES = Object.freeze([
  DOC_7G,
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
  const doc7g = readRequired(DOC_7G);
  for (const marker of [
    "## Phase summary",
    "## Depends on ORO-7F",
    "## Runtime enablement request intake",
    "## Runtime enablement decision record",
    "## Decision-only boundary",
    "## Explicit non-enablement rules",
    "## Forbidden runtime/live actions",
    "## Route/API alias prohibition",
    "## Wallet/Ledger/Prisma/DB mutation prohibition",
    "## Validation checklist",
    "## Next phase requirement",
    "## Safety confirmation",
    "ORO-7G is runtime enablement decision boundary only.",
    "ORO-7G does not enable runtime execution.",
    "ORO-7G does not activate external calls.",
    "ORO-7G does not permit live OroPlay API calls.",
    "ORO-7G does not mutate wallet or ledger.",
    "ORO-7G does not mount any route.",
    "ORO-7G does not expose public aliases.",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_enablement_final_readiness_only",
    "actualExternalCallExecutionRuntimeEnablementDecisionScope = runtime_enablement_decision_only",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness = true",
  ]) {
    assert(doc7g.includes(marker), `${DOC_7G} missing marker ${marker}.`);
  }

  const doc7f = readRequired(DOC_7F);
  for (const marker of [
    "ORO-7G runtime enablement decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY,
    RUNTIME_ENABLEMENT_DECISION_ONLY,
  ]) {
    assert(doc7f.includes(marker), `${DOC_7F} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);
  assert.strictEqual(pkg.scripts[DETAIL_SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7g",
    "oro-7g",
    "ORO_7G_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_DECISION_BOUNDARY.md",
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
        "ORO-7G records actual external call execution runtime enablement decision only",
        "runtime_enablement_decision_only",
        "approved_for_separate_actual_external_call_execution_runtime_enablement_final_readiness_only",
        "actualExternalCallExecutionRuntimeEnabled=false",
        "liveOroPlayApiCallAllowed=false",
        "routeEnablementAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7G Current",
        "runtime enablement decision boundary only",
        "final readiness only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7G current/live traffic actual external call execution runtime enablement decision boundary",
        "runtime enablement decision boundary only",
        "`smoke:oro-7g` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7G Live Traffic Actual External Call Execution Runtime Enablement Decision Boundary Coverage",
        "ORO-7G boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7G].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7G files must not contain ${marker}.`);
  }
  for (const file of ORO7G_SECRET_SCAN_FILES) {
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult",
    "dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary",
    "oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed",
    "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f",
    "actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f",
    "actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f",
    "actualExternalCallExecutionRuntimeEnablementDecisionPrepared",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionRuntimeEnablementDecisionStatus",
    "actualExternalCallExecutionRuntimeEnablementDecisionScope",
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
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7G_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro7f,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro7f,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro7f,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestScopeFromOro7f,
    RUNTIME_ENABLEMENT_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_FINAL_READINESS_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementDecisionScope,
    RUNTIME_ENABLEMENT_DECISION_ONLY
  );
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementFinalReadiness,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7G happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRuntimeExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7G hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7G_RUNTIME_ENABLEMENT_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(
    typeof buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof evaluateOro7gRuntimeEnablementDecisionBoundary, "function");
  assert.strictEqual(
    typeof validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro7gRuntimeEnablementDecisionBoundarySummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7gRuntimeEnablementDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7gRuntimeEnablementDecisionBoundarySummary(happy), happy);
  assert.deepStrictEqual(
    validateOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary(happy),
    happy
  );

  assertHeld(
    evaluateOro7gRuntimeEnablementDecisionBoundary(
      failMissingOro7fRuntimeEnablementRequestFixture
    ),
    "missing_oro7f_runtime_enablement_request"
  );
  assertHeld(
    evaluateOro7gRuntimeEnablementDecisionBoundary(
      failOro7fRuntimeEnablementRequestNotSubmittedFixture
    ),
    "missing_oro7f_runtime_enablement_request"
  );
  assertHeld(
    evaluateOro7gRuntimeEnablementDecisionBoundary(
      failRuntimeEnablementDecisionNotIssuedFixture
    ),
    "runtime_enablement_decision_record_required_in_oro7g"
  );
  for (const fixture of [
    failRuntimeEnabledFixture,
    failActualExecutionActivatedFixture,
    failActualExecutionEnabledFixture,
    failActualExecutionAuthorizedFixture,
  ]) {
    assertHeld(
      evaluateOro7gRuntimeEnablementDecisionBoundary(fixture),
      "runtime_enablement_not_allowed_in_oro7g"
    );
  }
  for (const fixture of [failLiveExecutionApprovedFixture, failLiveExecutedFixture]) {
    assertHeld(
      evaluateOro7gRuntimeEnablementDecisionBoundary(fixture),
      "live_execution_not_allowed_in_oro7g"
    );
  }
  assertHeld(
    evaluateOro7gRuntimeEnablementDecisionBoundary(failExternalNetworkAllowedFixture),
    "external_network_not_allowed_in_oro7g"
  );
  assertHeld(
    evaluateOro7gRuntimeEnablementDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live_oroplay_api_call_not_allowed_in_oro7g"
  );
  for (const fixture of [
    failWalletMutationAllowedFixture,
    failLedgerMutationAllowedFixture,
    failPrismaWriteAllowedFixture,
    failDbTransactionAllowedFixture,
  ]) {
    assertHeld(
      evaluateOro7gRuntimeEnablementDecisionBoundary(fixture),
      "mutation_not_allowed_in_oro7g"
    );
  }
  for (const fixture of [failMigrationAllowedFixture, failDeployAllowedFixture]) {
    assertHeld(
      evaluateOro7gRuntimeEnablementDecisionBoundary(fixture),
      "migration_or_deploy_not_allowed_in_oro7g"
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
      evaluateOro7gRuntimeEnablementDecisionBoundary(fixture),
      "route_or_alias_not_allowed_in_oro7g"
    );
  }

  const allReports =
    buildOro7gLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures().map(
      evaluateOro7gRuntimeEnablementDecisionBoundary
    );
  assert.strictEqual(allReports.length, 25, "fixture set must cover ORO-7G cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRuntimeExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7G live traffic actual external call execution runtime enablement decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7G live traffic actual external call execution runtime enablement decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
