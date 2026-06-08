"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary");
const fixtures = require("../game-provider-mock/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
} = require("../game-provider-mock/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");

const {
  ACTIVATION_REQUEST_ONLY,
  ORO7D_ACTIVATION_REQUEST_BOUNDARY_STATUS,
  ORO_7D_PHASE,
  PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  buildOro7dActivationRequestInput,
  buildOro7dActivationRequestSummary,
  evaluateOro7dActivationRequestBoundary,
  validateOro7dActivationRequestContract,
} = helper;

const {
  buildOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures,
  failActivationDecisionIssuedInSamePhaseFixture,
  failActivationRequestNotSubmittedFixture,
  failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failActualExecutionActivatedFixture,
  failActualExecutionApprovedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7cAuthorizationDecisionFixture,
  failOro7cAuthorizationDecisionNotIssuedFixture,
  failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture,
  failPrismaWriteAllowedFixture,
  failRuntimeEnabledFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7D =
  "docs/ORO_7D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md";
const DOC_7C =
  "docs/ORO_7C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7dSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7d";
const ORO7D_SECRET_SCAN_FILES = Object.freeze([
  DOC_7D,
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
  const doc7d = readRequired(DOC_7D);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-7C",
    "## Activation request boundary",
    "## Why this still is not actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionActivationRequestPrepared = true",
    "actualExternalCallExecutionActivationRequestSubmitted = true",
    "actualExternalCallExecutionActivationRequestStatus = submitted_pending_actual_external_call_execution_activation_decision",
    "actualExternalCallExecutionActivationRequestScope = activation_request_only",
    "actualExternalCallExecutionActivationDecisionIssued = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Activation request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7d.includes(marker), `${DOC_7D} missing marker ${marker}.`);
  }

  const doc7c = readRequired(DOC_7C);
  for (const marker of [
    "ORO-7D activation request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
    ACTIVATION_REQUEST_ONLY,
  ]) {
    assert(doc7c.includes(marker), `${DOC_7C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7d",
    "oro-7d",
    "ORO_7D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md",
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
        "ORO-7D records actual external call execution activation request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
        ACTIVATION_REQUEST_ONLY,
        "actualExternalCallExecutionActivationDecisionIssued=false",
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
        "## ORO-7D Current",
        "activation request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7D current/live traffic actual external call execution activation request boundary",
        "activation request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
        "`smoke:oro-7d` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7D Live Traffic Actual External Call Execution Activation Request Boundary Coverage",
        "ORO-7D boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7D].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7D files must not contain ${marker}.`);
  }
  for (const file of ORO7D_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssued, false);
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
    "liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult",
    "dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary",
    "oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed",
    "actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c",
    "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c",
    "actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c",
    "actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c",
    "actualExternalCallExecutionActivationRequestPrepared",
    "actualExternalCallExecutionActivationRequestSubmitted",
    "actualExternalCallExecutionActivationRequestStatus",
    "actualExternalCallExecutionActivationRequestScope",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision",
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
  assert.strictEqual(summary.phase, ORO_7D_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c,
    AUTHORIZATION_DECISION_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestScope,
    ACTIVATION_REQUEST_ONLY
  );
  assertNoDecisionExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7D happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7D hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7D_ACTIVATION_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7dActivationRequestInput, "function");
  assert.strictEqual(typeof evaluateOro7dActivationRequestBoundary, "function");
  assert.strictEqual(typeof buildOro7dActivationRequestSummary, "function");
  assert.strictEqual(typeof validateOro7dActivationRequestContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7dActivationRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7dActivationRequestSummary(happy), happy);
  assert.deepStrictEqual(validateOro7dActivationRequestContract(happy), happy);

  assertHeld(
    evaluateOro7dActivationRequestBoundary(failMissingOro7cAuthorizationDecisionFixture),
    "ORO-7C authorization decision dependency is required"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(
      failOro7cAuthorizationDecisionNotIssuedFixture
    ),
    "ORO-7C authorization decision must be issued"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(
      failOro7cAuthorizationDecisionStatusNotApprovedForActivationRequestFixture
    ),
    "ORO-7C authorization decision must approve activation request only"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failActivationRequestNotSubmittedFixture),
    "activation request must be request-only and submitted"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(
      failActivationRequestSubmittedWithoutHumanApprovalRequirementFixture
    ),
    "activation request must require separate activation decision"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failActivationDecisionIssuedInSamePhaseFixture),
    "activation decision must not occur in ORO-7D"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failActualExecutionApprovedFixture),
    "ORO-7D must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failActualExecutionActivatedFixture),
    "ORO-7D must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failRuntimeEnabledFixture),
    "ORO-7D must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during activation request"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during activation request"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during activation request"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during activation request"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7dActivationRequestBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures().map(
      evaluateOro7dActivationRequestBoundary
    );
  assert.strictEqual(allReports.length, 18, "fixture set must cover ORO-7D cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7D live traffic actual external call execution activation request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7D live traffic actual external call execution activation request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
