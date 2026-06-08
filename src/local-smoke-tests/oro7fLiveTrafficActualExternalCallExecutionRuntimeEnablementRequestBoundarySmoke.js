"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");
const fixtures = require("../game-provider-mock/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures");

const {
  ACTIVATION_DECISION_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
} = require("../game-provider-mock/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

const {
  ORO7F_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY_STATUS,
  ORO_7F_PHASE,
  PASS,
  RUNTIME_ENABLEMENT_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
  buildOro7fRuntimeEnablementRequestInput,
  buildOro7fRuntimeEnablementRequestSummary,
  evaluateOro7fRuntimeEnablementRequestBoundary,
  validateOro7fRuntimeEnablementRequestContract,
} = helper;

const {
  buildOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures,
  failActualExecutionActivatedFixture,
  failActualExecutionApprovedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7eActivationDecisionFixture,
  failOro7eActivationDecisionNotIssuedFixture,
  failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture,
  failPrismaWriteAllowedFixture,
  failRouteEnabledFixture,
  failRuntimeEnabledFixture,
  failRuntimeEnablementDecisionIssuedInSamePhaseFixture,
  failRuntimeEnablementRequestNotSubmittedFixture,
  failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7F =
  "docs/ORO_7F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md";
const DOC_7E =
  "docs/ORO_7E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7fSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7f";
const ORO7F_SECRET_SCAN_FILES = Object.freeze([
  DOC_7F,
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
  const doc7f = readRequired(DOC_7F);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-7E",
    "## Runtime enablement request boundary",
    "## Why this still is not runtime enablement",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No route enablement",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionActivationDecisionStatusFromOro7e = approved_for_separate_actual_external_call_execution_runtime_enablement_request_only",
    "actualExternalCallExecutionActivationDecisionScopeFromOro7e = activation_decision_only",
    "actualExternalCallExecutionRuntimeEnablementRequestPrepared = true",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted = true",
    "actualExternalCallExecutionRuntimeEnablementRequestStatus = submitted_pending_actual_external_call_execution_runtime_enablement_decision",
    "actualExternalCallExecutionRuntimeEnablementRequestScope = runtime_enablement_request_only",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "actualExternalCallExecutionActivated = false",
    "actualExternalCallExecutionRuntimeEnabled = false",
    "actualExternalCallExecutionEnabled = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Runtime enablement request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7f.includes(marker), `${DOC_7F} missing marker ${marker}.`);
  }

  const doc7e = readRequired(DOC_7E);
  for (const marker of [
    "ORO-7F runtime enablement request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION,
    RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ]) {
    assert(doc7e.includes(marker), `${DOC_7E} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7f",
    "oro-7f",
    "ORO_7F_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY.md",
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
        "ORO-7F records actual external call execution runtime enablement request only",
        "actualExternalCallExecutionRuntimeEnablementRequestStatus uses pending runtime enablement decision status",
        RUNTIME_ENABLEMENT_REQUEST_ONLY,
        "actualExternalCallExecutionRuntimeEnablementDecisionIssued=false",
        "actualExternalCallExecutionLiveExecutionApproved=false",
        "externalCallExecutionPerformed=false",
        "externalNetworkAllowed=false",
        "liveOroPlayApiCallAllowed=false",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-7F Current",
        "runtime enablement request only",
        "pending runtime enablement decision status",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7F current/live traffic actual external call execution runtime enablement request boundary",
        "runtime enablement request only",
        "pending runtime enablement decision status",
        "`smoke:oro-7f` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7F Live Traffic Actual External Call Execution Runtime Enablement Request Boundary Coverage",
        "ORO-7F boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7F].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7F files must not contain ${marker}.`);
  }
  for (const file of ORO7F_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionExecutionRouteOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementDecisionIssued, false);
  assert.strictEqual(summary.actualExternalCallExecutionLiveExecutionApproved, false);
  assert.strictEqual(summary.actualExternalCallExecutionActivated, false);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionEnabled, false);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorized, false);
  assert.strictEqual(summary.externalCallExecutionAuthorized, false);
  assert.strictEqual(summary.externalCallExecutionPerformed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
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
    "liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult",
    "dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary",
    "oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed",
    "actualExternalCallExecutionActivationDecisionPreparedFromOro7e",
    "actualExternalCallExecutionActivationDecisionIssuedFromOro7e",
    "actualExternalCallExecutionActivationDecisionStatusFromOro7e",
    "actualExternalCallExecutionActivationDecisionScopeFromOro7e",
    "actualExternalCallExecutionRuntimeEnablementRequestPrepared",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
    "actualExternalCallExecutionRuntimeEnablementRequestStatus",
    "actualExternalCallExecutionRuntimeEnablementRequestScope",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision",
    "humanApprovalRequiredForActualExecution",
    "separateActualExecutionApprovalRequired",
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
    "secretsLeaked",
    "blockers",
  ];
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, ORO_7F_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionPreparedFromOro7e,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionIssuedFromOro7e,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionStatusFromOro7e,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionScopeFromOro7e,
    ACTIVATION_DECISION_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionRuntimeEnablementRequestScope,
    RUNTIME_ENABLEMENT_REQUEST_ONLY
  );
  assertNoDecisionExecutionRouteOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7F happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionExecutionRouteOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7F hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7F_RUNTIME_ENABLEMENT_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7fRuntimeEnablementRequestInput, "function");
  assert.strictEqual(typeof evaluateOro7fRuntimeEnablementRequestBoundary, "function");
  assert.strictEqual(typeof buildOro7fRuntimeEnablementRequestSummary, "function");
  assert.strictEqual(typeof validateOro7fRuntimeEnablementRequestContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7fRuntimeEnablementRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7fRuntimeEnablementRequestSummary(happy), happy);
  assert.deepStrictEqual(validateOro7fRuntimeEnablementRequestContract(happy), happy);

  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failMissingOro7eActivationDecisionFixture),
    "ORO-7E activation decision dependency is required"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failOro7eActivationDecisionNotIssuedFixture),
    "ORO-7E activation decision must be issued"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(
      failOro7eActivationDecisionStatusNotApprovedForRuntimeEnablementRequestFixture
    ),
    "ORO-7E activation decision must approve request-only runtime enablement"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(
      failRuntimeEnablementRequestNotSubmittedFixture
    ),
    "runtime enablement request must be submitted as request-only"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(
      failRuntimeEnablementRequestSubmittedWithoutHumanApprovalRequirementFixture
    ),
    "runtime enablement request must require separate human decision"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(
      failRuntimeEnablementDecisionIssuedInSamePhaseFixture
    ),
    "runtime enablement decision must not occur in ORO-7F"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failActualExecutionApprovedFixture),
    "ORO-7F must not approve, activate, enable, authorize, route, or execute"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failActualExecutionActivatedFixture),
    "ORO-7F must not approve, activate, enable, authorize, route, or execute"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failRuntimeEnabledFixture),
    "ORO-7F must not approve, activate, enable, authorize, route, or execute"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failRouteEnabledFixture),
    "ORO-7F must not approve, activate, enable, authorize, route, or execute"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during runtime enablement request"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during runtime enablement request"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during runtime enablement request"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during runtime enablement request"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7fRuntimeEnablementRequestBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7fLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures().map(
      evaluateOro7fRuntimeEnablementRequestBoundary
    );
  assert.strictEqual(allReports.length, 19, "fixture set must cover ORO-7F cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionExecutionRouteOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7F live traffic actual external call execution runtime enablement request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7F live traffic actual external call execution runtime enablement request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
