"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
} = require("../game-provider-mock/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary");

const {
  AUTHORIZATION_REQUEST_ONLY,
  ORO7B_AUTHORIZATION_REQUEST_BOUNDARY_STATUS,
  ORO_7B_PHASE,
  PASS,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
  buildOro7bAuthorizationRequestInput,
  buildOro7bAuthorizationRequestSummary,
  evaluateOro7bAuthorizationRequestBoundary,
  validateOro7bAuthorizationRequestContract,
} = helper;

const {
  buildOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures,
  failActualExecutionApprovedFixture,
  failAuthorizationDecisionIssuedInSamePhaseFixture,
  failAuthorizationRequestNotSubmittedFixture,
  failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro7aFinalExecutionDecisionFixture,
  failOro7aFinalExecutionDecisionNotIssuedFixture,
  failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture,
  failPrismaWriteAllowedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7B =
  "docs/ORO_7B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_7A =
  "docs/ORO_7A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7bSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-7b";
const ORO7B_SECRET_SCAN_FILES = Object.freeze([
  DOC_7B,
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
  const doc7b = readRequired(DOC_7B);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-7A",
    "## Authorization request boundary",
    "## Why this still is not actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionAuthorizationRequestPrepared = true",
    "actualExternalCallExecutionAuthorizationRequestSubmitted = true",
    "actualExternalCallExecutionAuthorizationRequestStatus = submitted_pending_actual_external_call_execution_authorization_decision",
    "actualExternalCallExecutionAuthorizationRequestScope = authorization_request_only",
    "actualExternalCallExecutionAuthorizationDecisionIssued = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Authorization request output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7b.includes(marker), `${DOC_7B} missing marker ${marker}.`);
  }

  const doc7a = readRequired(DOC_7A);
  for (const marker of [
    "ORO-7B authorization request boundary is required next",
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
    AUTHORIZATION_REQUEST_ONLY,
  ]) {
    assert(doc7a.includes(marker), `${DOC_7A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7b",
    "oro-7b",
    "ORO_7B_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_AUTHORIZATION_REQUEST_BOUNDARY.md",
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
        "ORO-7B records actual external call execution authorization request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
        AUTHORIZATION_REQUEST_ONLY,
        "actualExternalCallExecutionAuthorizationDecisionIssued=false",
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
        "## ORO-7B Current",
        "authorization request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7B current/live traffic actual external call execution authorization request boundary",
        "authorization request only",
        SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION,
        "`smoke:oro-7b` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7B Live Traffic Actual External Call Execution Authorization Request Boundary Coverage",
        "ORO-7B boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7B].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7B files must not contain ${marker}.`);
  }
  for (const file of ORO7B_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationDecisionIssued, false);
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
    "liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult",
    "dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary",
    "oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed",
    "actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a",
    "actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a",
    "actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a",
    "actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a",
    "actualExternalCallExecutionAuthorizationRequestPrepared",
    "actualExternalCallExecutionAuthorizationRequestSubmitted",
    "actualExternalCallExecutionAuthorizationRequestStatus",
    "actualExternalCallExecutionAuthorizationRequestScope",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision",
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
  assert.strictEqual(summary.phase, ORO_7B_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a,
    true
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a,
    FINAL_EXECUTION_DECISION_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestStatus,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionAuthorizationRequestScope,
    AUTHORIZATION_REQUEST_ONLY
  );
  assertNoDecisionExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7B happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7B hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7B_AUTHORIZATION_REQUEST_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7bAuthorizationRequestInput, "function");
  assert.strictEqual(typeof evaluateOro7bAuthorizationRequestBoundary, "function");
  assert.strictEqual(typeof buildOro7bAuthorizationRequestSummary, "function");
  assert.strictEqual(typeof validateOro7bAuthorizationRequestContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7bAuthorizationRequestBoundary(
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7bAuthorizationRequestSummary(happy), happy);
  assert.deepStrictEqual(validateOro7bAuthorizationRequestContract(happy), happy);

  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failMissingOro7aFinalExecutionDecisionFixture),
    "ORO-7A final execution decision dependency is required"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failOro7aFinalExecutionDecisionNotIssuedFixture),
    "ORO-7A final execution decision must be issued"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(
      failOro7aFinalExecutionDecisionStatusNotApprovedForAuthorizationRequestFixture
    ),
    "ORO-7A final execution decision must approve separate authorization request only"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failAuthorizationRequestNotSubmittedFixture),
    "authorization request must be request-only and pending decision"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(
      failAuthorizationRequestSubmittedWithoutHumanApprovalRequirementFixture
    ),
    "authorization request must require separate human approval"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failAuthorizationDecisionIssuedInSamePhaseFixture),
    "authorization decision must not be issued in ORO-7B"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failActualExecutionApprovedFixture),
    "ORO-7B must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during authorization request"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during authorization request"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during authorization request"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during authorization request"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7bAuthorizationRequestBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures().map(
      evaluateOro7bAuthorizationRequestBoundary
    );
  assert.strictEqual(allReports.length, 16, "fixture set must cover ORO-7B cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7B live traffic actual external call execution authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7B live traffic actual external call execution authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
