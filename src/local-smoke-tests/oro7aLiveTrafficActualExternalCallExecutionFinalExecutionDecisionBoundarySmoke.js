"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary");
const fixtures = require("../game-provider-mock/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures");

const {
  FINAL_EXECUTION_REQUEST_ONLY,
  SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION,
} = require("../game-provider-mock/oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary");

const {
  APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
  FINAL_EXECUTION_DECISION_ONLY,
  ORO7A_FINAL_EXECUTION_DECISION_BOUNDARY_STATUS,
  ORO_7A_PHASE,
  PASS,
  buildOro7aFinalExecutionDecisionInput,
  buildOro7aFinalExecutionDecisionSummary,
  evaluateOro7aFinalExecutionDecisionBoundary,
  validateOro7aFinalExecutionDecisionContract,
} = helper;

const {
  buildOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures,
  failActualExecutionApprovedFixture,
  failAuthorizationRequestSubmittedInSamePhaseFixture,
  failDbTransactionAllowedFixture,
  failDeployAllowedFixture,
  failExternalNetworkAllowedFixture,
  failFinalExecutionDecisionApprovesActualExecutionFixture,
  failFinalExecutionDecisionNotIssuedFixture,
  failLedgerMutationAllowedFixture,
  failLiveOroPlayApiCallAllowedFixture,
  failMigrationAllowedFixture,
  failMissingOro6zFinalExecutionRequestFixture,
  failOro6zFinalExecutionRequestNotSubmittedFixture,
  failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture,
  failPrismaWriteAllowedFixture,
  failWalletMutationAllowedFixture,
  happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_7A =
  "docs/ORO_7A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md";
const DOC_6Z =
  "docs/ORO_6Z_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL_EXECUTION_FINAL_EXECUTION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro7aSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-7a";
const ORO7A_SECRET_SCAN_FILES = Object.freeze([
  DOC_7A,
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
  const doc7a = readRequired(DOC_7A);
  for (const marker of [
    "## Purpose",
    "## Dependency on ORO-6Z",
    "## Final execution decision boundary",
    "## Why this still is not actual execution",
    "## Still-no-external-call safety",
    "## No real money",
    "## No wallet/ledger/Prisma mutation",
    "## No external network",
    "## No live OroPlay call",
    "## Next phase expectations",
    "actualExternalCallExecutionFinalExecutionDecisionPrepared = true",
    "actualExternalCallExecutionFinalExecutionDecisionIssued = true",
    "actualExternalCallExecutionFinalExecutionDecisionStatus = approved_for_separate_actual_external_call_execution_authorization_request_only",
    "actualExternalCallExecutionFinalExecutionDecisionScope = final_execution_decision_only",
    "actualExternalCallExecutionAuthorizationRequestSubmitted = false",
    "actualExternalCallExecutionLiveExecutionApproved = false",
    "externalNetworkAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "## Final execution decision output JSON",
    "## Rollback and blocker rules",
  ]) {
    assert(doc7a.includes(marker), `${DOC_7A} missing marker ${marker}.`);
  }

  const doc6z = readRequired(DOC_6Z);
  for (const marker of [
    "ORO-7A final execution decision boundary is required next",
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
    FINAL_EXECUTION_DECISION_ONLY,
  ]) {
    assert(doc6z.includes(marker), `${DOC_6Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [
    WRAPPER,
    SCRIPT,
    "oro7a",
    "oro-7a",
    "ORO_7A_LIVE_TRAFFIC_ACTUAL_EXTERNAL_CALL",
    "EXECUTION_FINAL_EXECUTION_DECISION_BOUNDARY.md",
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
        "ORO-7A records actual external call execution final execution decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
        FINAL_EXECUTION_DECISION_ONLY,
        "actualExternalCallExecutionAuthorizationRequestSubmitted=false",
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
        "## ORO-7A Current",
        "final execution decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-7A current/live traffic actual external call execution final execution decision boundary",
        "final execution decision only",
        APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY,
        "`smoke:oro-7a` registration",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-7A Live Traffic Actual External Call Execution Final Execution Decision Boundary Coverage",
        "ORO-7A boundary-specific package smoke alias",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_7A].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-7A files must not contain ${marker}.`);
  }
  for (const file of ORO7A_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoRequestApprovalExecutionOrCallFlags(summary) {
  assert.strictEqual(summary.actualExternalCallExecutionAuthorizationRequestSubmitted, false);
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
    "liveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryResult",
    "dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary",
    "oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed",
    "actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z",
    "actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z",
    "actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z",
    "actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z",
    "actualExternalCallExecutionFinalExecutionDecisionPrepared",
    "actualExternalCallExecutionFinalExecutionDecisionIssued",
    "actualExternalCallExecutionFinalExecutionDecisionStatus",
    "actualExternalCallExecutionFinalExecutionDecisionScope",
    "actualExternalCallExecutionAuthorizationRequestSubmitted",
    "actualExternalCallExecutionAuthorizationDecisionIssued",
    "actualExternalCallExecutionLiveExecutionApproved",
    "actualExternalCallExecutionActivated",
    "actualExternalCallExecutionRuntimeEnabled",
    "actualExternalCallExecutionEnabled",
    "actualExternalCallExecutionAuthorized",
    "externalCallExecutionAuthorized",
    "externalCallExecutionPerformed",
    "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest",
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
  assert.strictEqual(summary.phase, ORO_7A_PHASE);
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture"
  );
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundary,
    true
  );
  assert.strictEqual(
    summary.oro6zLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryPassed,
    true
  );
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionRequestPreparedFromOro6z, true);
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionRequestSubmittedFromOro6z, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionRequestStatusFromOro6z,
    SUBMITTED_PENDING_ACTUAL_EXTERNAL_CALL_EXECUTION_DECISION
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionRequestScopeFromOro6z,
    FINAL_EXECUTION_REQUEST_ONLY
  );
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionDecisionPrepared, true);
  assert.strictEqual(summary.actualExternalCallExecutionFinalExecutionDecisionIssued, true);
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionStatus,
    APPROVED_FOR_SEPARATE_ACTUAL_EXTERNAL_CALL_EXECUTION_AUTHORIZATION_REQUEST_ONLY
  );
  assert.strictEqual(
    summary.actualExternalCallExecutionFinalExecutionDecisionScope,
    FINAL_EXECUTION_DECISION_ONLY
  );
  assertNoRequestApprovalExecutionOrCallFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationRequest,
    true
  );
  assert.strictEqual(summary.humanApprovalRequiredForActualExecution, true);
  assert.strictEqual(summary.separateActualExecutionApprovalRequired, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-7A happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoRequestApprovalExecutionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-7A hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO7A_FINAL_EXECUTION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro7aFinalExecutionDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro7aFinalExecutionDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro7aFinalExecutionDecisionSummary, "function");
  assert.strictEqual(typeof validateOro7aFinalExecutionDecisionContract, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = evaluateOro7aFinalExecutionDecisionBoundary(
    happyPathLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixture
  );
  assertHappyPath(happy);
  assert.deepStrictEqual(buildOro7aFinalExecutionDecisionSummary(happy), happy);
  assert.deepStrictEqual(validateOro7aFinalExecutionDecisionContract(happy), happy);

  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failMissingOro6zFinalExecutionRequestFixture),
    "ORO-6Z final execution request dependency is required"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failOro6zFinalExecutionRequestNotSubmittedFixture),
    "ORO-6Z final execution request must be submitted"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(
      failOro6zFinalExecutionRequestStatusNotPendingDecisionFixture
    ),
    "ORO-6Z final execution request must be pending decision"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failFinalExecutionDecisionNotIssuedFixture),
    "final execution decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(
      failFinalExecutionDecisionApprovesActualExecutionFixture
    ),
    "final execution decision must be decision-only and issued"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failAuthorizationRequestSubmittedInSamePhaseFixture),
    "authorization request and decision must not occur in ORO-7A"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failActualExecutionApprovedFixture),
    "ORO-7A must not approve, activate, enable, authorize, or execute"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failExternalNetworkAllowedFixture),
    "external network must remain absent during final decision"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failLiveOroPlayApiCallAllowedFixture),
    "live OroPlay API call must remain absent during final decision"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failWalletMutationAllowedFixture),
    "wallet mutation must remain absent during final decision"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failLedgerMutationAllowedFixture),
    "ledger mutation must remain absent during final decision"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failPrismaWriteAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failDbTransactionAllowedFixture),
    "data write and DB transaction must remain absent"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failMigrationAllowedFixture),
    "migration and deploy must remain absent"
  );
  assertHeld(
    evaluateOro7aFinalExecutionDecisionBoundary(failDeployAllowedFixture),
    "migration and deploy must remain absent"
  );

  const allReports =
    buildOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryFixtures().map(
      evaluateOro7aFinalExecutionDecisionBoundary
    );
  assert.strictEqual(allReports.length, 16, "fixture set must cover ORO-7A cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoRequestApprovalExecutionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-7A live traffic actual external call execution final execution decision boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-7A live traffic actual external call execution final execution decision boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
