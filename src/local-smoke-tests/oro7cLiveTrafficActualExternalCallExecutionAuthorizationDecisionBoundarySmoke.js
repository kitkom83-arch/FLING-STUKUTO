"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures");

const {
  AUTHORIZATION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
} = require("../game-provider-mock/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
  AUTHORIZATION_DECISION_ONLY,
  ORO7C_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  ORO_7C_PHASE,
  PASS,
  buildOro7cAuthorizationDecisionInput,
  buildOro7cAuthorizationDecisionSummary,
  evaluateOro7cAuthorizationDecisionBoundary,
  validateOro7cAuthorizationDecisionContract,
} = helper;

const {
  buildOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures,
  failActivationRequestSubmittedInSamePhaseFixture,
  failActualExecutionApprovedFixture,
  failAuthorizationDecisionApprovesActualExecutionFixture,
  failAuthorizationDecisionNotApprovedForActivationRequestFixture,
  failAuthorizationDecisionNotIssuedFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7bAuthorizationRequestFixture,
  failOro7bAuthorizationRequestNotSubmittedFixture,
  failOro7bAuthorizationRequestStatusNotPendingDecisionFixture,
  failPrismaWriteAllowedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7C =
  "docs/ORO_7C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_7B =
  "docs/ORO_7B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7cSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7c";
const ORO7C_SECRET_SCAN_FILES = Object.freeze([
  DOC_7C,
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
  const doc7c = readRequired(DOC_7C);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-7B",
    "## Authorization decision boundary",
    "## Why this still is not actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionAuthorizationDecisionPrepared = true",
    "actualExternalCallExecutionAuthorizationDecisionIssued = true",
    "actualExternalCallExecutionAuthorizationDecisionStatus = approved_for_separate_actual_external_call_execution_activation_request_only",
    "actualExternalCallExecutionAuthorizationDecisionScope = authorization_decision_only",
    "actualExternalCallExecutionActivationRequestSubmitted = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Authorization decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7c.includes(marker), `${DOC_7C} missing marker ${marker}.`);
  }

  const doc7b = readRequired(DOC_7B);
  for (const marker of [
    "ORO-7C authorization decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
    AUTHORIZATION_DECISION_ONLY,
  ]) {
    assert(doc7b.includes(marker), `${DOC_7B} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7c",
    "oro-7c",
    "ORO_7C_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_DECISION_BOUNDARY.md",
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
        "ORO-7C records actual external call execution authorization decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
        AUTHORIZATION_DECISION_ONLY,
        "actualExternalCallExecutionActivationRequestSubmitted=false",
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
        "## ORO-7C Current",
        "authorization decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7C current/live traffic actual external call execution authorization decision boundary",
        "authorization decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY,
        "`smoke:oro-7c` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7C Live Traffic Actual External Call Execution Authorization Decision Boundary Coverage",
        "ORO-7C boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7C].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7C files must not contain ${marker}.`);
  }
  for (const file of ORO7C_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoActivationExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionActivationRequestSubmitted, false);
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
    "liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult",
    "dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary",
    "oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed",
    "actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b",
    "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b",
    "actualExternalCallExecutionAuthorizationRequestStatusFromOro7b",
    "actualExternalCallExecutionAuthorizationRequestScopeFromOro7b",
    "actualExternalCallExecutionAuthorizationDecisionPrepared",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionAuthorizationDecisionStatus",
    "actualExternalCallExecutionAuthorizationDecisionScope",
    "actualExternalCallExecutionActivationRequestSubmitted",
    "actualExternalCallExecutionActivationDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest",
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
  assert.strictEqual(summary.phase, ORO_7C_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestStatusFromOro7b,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestScopeFromOro7b,
    AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_ACTIVATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationDecisionScope,
    AUTHORIZATION_DECISION_ONLY
  );
  assertNoActivationExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionActivationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7C happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoActivationExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7C hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7C_AUTHORIZATION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7cAuthorizationDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro7cAuthorizationDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro7cAuthorizationDecisionSummary, "function");
  assert.strictEqual(typeof validateOro7cAuthorizationDecisionContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7cAuthorizationDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7cAuthorizationDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro7cAuthorizationDecisionContract(happy), happy);

  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failMissingOro7bAuthorizationRequestFixture),
    "ORO-7B authorization request dependency is required"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failOro7bAuthorizationRequestNotSubmittedFixture),
    "ORO-7B authorization request must be submitted"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(
      failOro7bAuthorizationRequestStatusNotPendingDecisionFixture
    ),
    "ORO-7B authorization request must be pending decision"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failAuthorizationDecisionNotIssuedFixture),
    "authorization decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(
      failAuthorizationDecisionNotApprovedForActivationRequestFixture
    ),
    "authorization decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(
      failAuthorizationDecisionApprovesActualExecutionFixture
    ),
    "authorization decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failActivationRequestSubmittedInSamePhaseFixture),
    "activation request and decision must not occur in ORO-7C"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failActualExecutionApprovedFixture),
    "ORO-7C must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during authorization decision"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during authorization decision"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during authorization decision"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during authorization decision"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7cAuthorizationDecisionBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures().map(
      evaluateOro7cAuthorizationDecisionBoundary
    );
  assert.strictEqual(allReports.length, 17, "fixture set must cover ORO-7C cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoActivationExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7C live traffic actual external call execution authorization decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7C live traffic actual external call execution authorization decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
