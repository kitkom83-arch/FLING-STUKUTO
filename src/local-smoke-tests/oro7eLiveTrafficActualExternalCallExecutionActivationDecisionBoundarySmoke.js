"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures");

const {
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION,
  ACTIVATION_REQUEST_ONLY,
} = require("../game-provider-mock/oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary");

const {
  ACTIVATION_DECISION_ONLY,
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
  ORO7E_ACTIVATION_DECISION_BOUNDARY_STATUS,
  ORO_7E_PHASE,
  PASS,
  buildOro7eActivationDecisionInput,
  buildOro7eActivationDecisionSummary,
  evaluateOro7eActivationDecisionBoundary,
  validateOro7eActivationDecisionContract,
} = helper;

const {
  buildOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures,
  failActivationDecisionApprovesActualExecutionFixture,
  failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture,
  failActivationDecisionNotIssuedFixture,
  failActualExecutionActivatedFixture,
  failActualExecutionApprovedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7dActivationRequestFixture,
  failOro7dActivationRequestNotSubmittedFixture,
  failOro7dActivationRequestStatusNotPendingDecisionFixture,
  failPrismaWriteAllowedFixture,
  failRuntimeEnabledFixture,
  failRuntimeEnablementRequestSubmittedInSamePhaseFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7E =
  "docs/ORO_7E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION_BOUNDARY.md";
const DOC_7D =
  "docs/ORO_7D_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7eSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7e";
const ORO7E_SECRET_SCAN_FILES = Object.freeze([
  DOC_7E,
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
  const doc7e = readRequired(DOC_7E);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-7D",
    "## Activation decision boundary",
    "## Why this still is not actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionActivationDecisionPrepared = true",
    "actualExternalCallExecutionActivationDecisionIssued = true",
    "actualExternalCallExecutionActivationDecisionStatus = approved_for_separate_actual_external_call_execution_runtime_enablement_request_only",
    "actualExternalCallExecutionActivationDecisionScope = activation_decision_only",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Activation decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7e.includes(marker), `${DOC_7E} missing marker ${marker}.`);
  }

  const doc7d = readRequired(DOC_7D);
  for (const marker of [
    "ORO-7E activation decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY,
    ACTIVATION_DECISION_ONLY,
  ]) {
    assert(doc7d.includes(marker), `${DOC_7D} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7e",
    "oro-7e",
    "ORO_7E_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_ACTIVATION_DECISION_BOUNDARY.md",
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
        "ORO-7E records actual external call execution activation decision only",
        "actualExternalCallExecutionActivationDecisionStatus uses runtime enablement request-only approval",
        ACTIVATION_DECISION_ONLY,
        "actualExternalCallExecutionRuntimeEnablementRequestSubmitted=false",
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
        "## ORO-7E Current",
        "activation decision only",
        "runtime enablement request-only approval status",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7E current/live traffic actual external call execution activation decision boundary",
        "activation decision only",
        "runtime enablement request-only approval status",
        "`smoke:oro-7e` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7E Live Traffic Actual External Call Execution Activation Decision Boundary Coverage",
        "ORO-7E boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7E].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7E files must not contain ${marker}.`);
  }
  for (const file of ORO7E_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRequestExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionRuntimeEnablementRequestSubmitted, false);
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
    "liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult",
    "dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary",
    "oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed",
    "actualExternalCallExecutionActivationRequestPreparedFromOro7d",
    "actualExternalCallExecutionActivationRequestSubmittedFromOro7d",
    "actualExternalCallExecutionActivationRequestStatusFromOro7d",
    "actualExternalCallExecutionActivationRequestScopeFromOro7d",
    "actualExternalCallExecutionActivationDecisionPrepared",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionActivationDecisionStatus",
    "actualExternalCallExecutionActivationDecisionScope",
    "actualExternalCallExecutionRuntimeEnablementRequestSubmitted",
    "actualExternalCallExecutionRuntimeEnablementDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest",
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
  assert.strictEqual(summary.phase, ORO_7E_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7dLiveTrafficActualExternalCallExecutionActivationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestPreparedFromOro7d,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestSubmittedFromOro7d,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestStatusFromOro7d,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationRequestScopeFromOro7d,
    ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionActivationDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_RUNTIME_ENABLEMENT_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionActivationDecisionScope,
    ACTIVATION_DECISION_ONLY
  );
  assertNoRequestExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7E happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRequestExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7E hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7E_ACTIVATION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7eActivationDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro7eActivationDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro7eActivationDecisionSummary, "function");
  assert.strictEqual(typeof validateOro7eActivationDecisionContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7eActivationDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7eActivationDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro7eActivationDecisionContract(happy), happy);

  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failMissingOro7dActivationRequestFixture),
    "ORO-7D activation request dependency is required"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failOro7dActivationRequestNotSubmittedFixture),
    "ORO-7D activation request must be submitted"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(
      failOro7dActivationRequestStatusNotPendingDecisionFixture
    ),
    "ORO-7D activation request must be pending decision"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failActivationDecisionNotIssuedFixture),
    "activation decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(
      failActivationDecisionNotApprovedForRuntimeEnablementRequestFixture
    ),
    "activation decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(
      failActivationDecisionApprovesActualExecutionFixture
    ),
    "activation decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(
      failRuntimeEnablementRequestSubmittedInSamePhaseFixture
    ),
    "runtime enablement request and decision must not occur in ORO-7E"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failActualExecutionApprovedFixture),
    "ORO-7E must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failActualExecutionActivatedFixture),
    "ORO-7E must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failRuntimeEnabledFixture),
    "ORO-7E must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during activation decision"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during activation decision"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during activation decision"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during activation decision"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7eActivationDecisionBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures().map(
      evaluateOro7eActivationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 19, "fixture set must cover ORO-7E cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRequestExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7E live traffic actual external call execution activation decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7E live traffic actual external call execution activation decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
