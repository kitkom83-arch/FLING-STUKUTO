"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures");

const {
  DECISION_RESULT,
  DECISION_STATUS,
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE,
  ORO5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  PASS,
  assertOro5wDecisionIssuedOnly,
  assertOro5wEnablementBoundaryOnlyGrant,
  assertOro5wNoExternalNetwork,
  assertOro5wNoLiveTraffic,
  assertOro5wNoRuntimeMoneyMutation,
  assertOro5wNoRuntimeTraffic,
  assertOro5wRequestSubmittedFromOro5v,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundary,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput,
  validateOro5wRuntimeTrafficAuthorizationDecisionBoundary,
} = helper;

const {
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures,
  dbTransactionDetectedFixture,
  decisionDeniedFixture,
  decisionNotIssuedFixture,
  enablementBoundaryEntryDeniedFixture,
  externalNetworkDetectedFixture,
  grantWrongScopeFixture,
  happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  liveTrafficEnabledAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  migrationDetectedFixture,
  missingRequestSubmissionFromOro5vFixture,
  prismaWriteDetectedFixture,
  publicAliasWrongModeFixture,
  requestWrongStatusFromOro5vFixture,
  runtimeTrafficAllowedAttemptFixture,
  runtimeTrafficImplementedAttemptFixture,
  sensitiveValueLeakFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5W =
  "docs/ORO_5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_5V =
  "docs/ORO_5V_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const DOC_5U =
  "docs/ORO_5U_RUNTIME_TRAFFIC_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const DOC_5T =
  "docs/ORO_5T_PUBLIC_ALIAS_POST_IMPLEMENTATION_VALIDATION_BOUNDARY.md";
const DOC_5S = "docs/ORO_5S_PUBLIC_ALIAS_IMPLEMENTATION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5wSmoke.js";
const SCRIPT = "smoke:oro-5w";
const ORO5W_SURFACE_FILES = Object.freeze([
  DOC_5W,
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5wRuntimeTrafficAuthorizationDecisionBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/runProjectCheck.js",
  ["docs/API_MAP", "P", "ING.md"].join(""),
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  DOC_5V,
  DOC_5U,
  DOC_5T,
  DOC_5S,
]);
const ORO5W_SECRET_SCAN_FILES = Object.freeze([
  DOC_5W,
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5wRuntimeTrafficAuthorizationDecisionBoundarySmoke.js",
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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function assertProtectedRuntimeFilesUntouched() {
  const changed = gitChangedFiles([
    "src/app.js",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/ledger-mock",
    "prisma",
    ".env",
  ]);
  assert.deepStrictEqual(changed, []);
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
  const doc5v = readRequired(DOC_5V);
  for (const marker of [
    "runtimeTrafficAuthorizationRequestSubmissionBoundaryResult = PASS",
    "runtimeTrafficAuthorizationRequestSubmitted = true",
    "runtimeTrafficAuthorizationRequestStatus = submitted_pending_decision",
    "runtimeTrafficAuthorizationRequestResult = submitted",
    "runtimeTrafficAuthorizationDecisionIssued = false",
    "nextPhaseRequiresRuntimeTrafficAuthorizationDecision = true",
    "ORO-5W issues the runtime traffic authorization decision record",
  ]) {
    assert(doc5v.includes(marker), `${DOC_5V} missing marker ${marker}.`);
  }

  for (const doc of [DOC_5U, DOC_5T, DOC_5S]) {
    const text = readRequired(doc);
    assert(
      text.includes("ORO-5W issues the runtime traffic authorization decision record"),
      `${doc} missing ORO-5W downstream marker.`
    );
  }

  const doc5w = readRequired(DOC_5W);
  for (const marker of [
    "## ORO-5W scope",
    "## Dependency on ORO-5V request submission",
    "runtimeTrafficAuthorizationDecisionBoundaryResult = PASS",
    "dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission = true",
    "runtimeTrafficAuthorizationRequestSubmittedFromOro5v = true",
    "runtimeTrafficAuthorizationRequestStatusFromOro5v = submitted_pending_decision",
    "runtimeTrafficAuthorizationRequestResultFromOro5v = submitted",
    "runtimeTrafficAuthorizationDecisionIssued = true",
    "runtimeTrafficAuthorizationDecisionStatus = decision_issued",
    "runtimeTrafficAuthorizationDecisionResult = approved",
    "runtimeTrafficAuthorizationRequestStatus = decision_issued",
    "runtimeTrafficAuthorizationRequestResult = approved",
    "runtimeTrafficAuthorizationRequestResolved = true",
    "runtimeTrafficAuthorizationGranted = true",
    "runtimeTrafficAuthorizationGrantScope = runtime_traffic_enablement_boundary_only",
    "runtimeTrafficEnablementAuthorized = true",
    "runtimeTrafficEnablementAuthorizationScope = runtime_traffic_enablement_boundary_only",
    "runtimeTrafficEnablementBoundaryEntryAllowed = true",
    "runtimeTrafficEnablementBoundaryEntryScope = runtime_traffic_enablement_boundary_only",
    "runtimeTrafficAllowed = false",
    "runtimeTrafficEnabled = false",
    "runtimeTrafficImplemented = false",
    "runtimeTrafficPatchImplemented = false",
    "liveTrafficAuthorizationRequestSubmitted = false",
    "liveTrafficAuthorizationDecisionIssued = false",
    "liveTrafficAllowed = false",
    "liveTrafficEnabled = false",
    "apiBalancePublicAliasMounted = true",
    "apiTransactionPublicAliasMounted = true",
    "apiBalancePublicAliasMode = fail_closed_no_mutation",
    "apiTransactionPublicAliasMode = fail_closed_no_mutation",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresRuntimeTrafficEnablementBoundary = true",
    "nextPhaseRequiresSeparateLiveTrafficApproval = true",
  ]) {
    assert(doc5w.includes(marker), `${DOC_5W} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5w", "oro-5w", DOC_5W]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  const check = readRequired("src/local-smoke-tests/runProjectCheck.js");
  for (const marker of [
    "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary.js",
    "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures.js",
    "src/local-smoke-tests/oro5wRuntimeTrafficAuthorizationDecisionBoundarySmoke.js",
    WRAPPER,
  ]) {
    assert(check.includes(marker), `runProjectCheck missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5W runtime traffic authorization decision boundary",
        "runtime_traffic_enablement_boundary_only",
        SCRIPT,
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5W Current",
        "runtime traffic authorization decision record only",
        "runtime_traffic_enablement_boundary_only",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5W current/local runtime traffic authorization decision boundary",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5W Runtime Traffic Authorization Decision Boundary Coverage", SCRIPT],
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
  ];
  const boundaryText = [
    "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundary.js",
    "src/game-provider-mock/oro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures.js",
    DOC_5W,
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5W boundary files must not contain ${marker}.`);
  }
  for (const file of ORO5W_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.runtimeTrafficImplemented, false);
  assert.strictEqual(summary.runtimeTrafficPatchImplemented, false);
  assert.strictEqual(summary.liveTrafficAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.liveTrafficAllowed, false);
  assert.strictEqual(summary.liveTrafficEnabled, false);
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
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "runtimeTrafficAuthorizationDecisionBoundaryResult",
    "dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission",
    "runtimeTrafficAuthorizationRequestSubmittedFromOro5v",
    "runtimeTrafficAuthorizationRequestStatusFromOro5v",
    "runtimeTrafficAuthorizationRequestResultFromOro5v",
    "runtimeTrafficAuthorizationDecisionBoundaryEntered",
    "runtimeTrafficAuthorizationDecisionChecked",
    "runtimeTrafficAuthorizationDecisionIssued",
    "runtimeTrafficAuthorizationDecisionStatus",
    "runtimeTrafficAuthorizationDecisionResult",
    "runtimeTrafficAuthorizationRequestStatus",
    "runtimeTrafficAuthorizationRequestResult",
    "runtimeTrafficAuthorizationRequestResolved",
    "runtimeTrafficAuthorizationGranted",
    "runtimeTrafficAuthorizationGrantScope",
    "runtimeTrafficEnablementAuthorized",
    "runtimeTrafficEnablementAuthorizationScope",
    "runtimeTrafficEnablementBoundaryEntryAllowed",
    "runtimeTrafficEnablementBoundaryEntryScope",
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "runtimeTrafficImplemented",
    "runtimeTrafficPatchImplemented",
    "liveTrafficAuthorizationRequestSubmitted",
    "liveTrafficAuthorizationDecisionIssued",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
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
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
    "secretsLeaked",
    "nextPhaseRequiresRuntimeTrafficEnablementBoundary",
    "nextPhaseRequiresSeparateLiveTrafficApproval",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-5W");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture"
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationDecisionBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission,
    true
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestSubmittedFromOro5v,
    true
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestStatusFromOro5v,
    "submitted_pending_decision"
  );
  assert.strictEqual(
    summary.runtimeTrafficAuthorizationRequestResultFromOro5v,
    "submitted"
  );
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionBoundaryEntered, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionChecked, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionStatus, DECISION_STATUS);
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionResult, DECISION_RESULT);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestStatus, DECISION_STATUS);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestResult, DECISION_RESULT);
  assert.strictEqual(summary.runtimeTrafficAuthorizationRequestResolved, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationGranted, true);
  assert.strictEqual(summary.runtimeTrafficAuthorizationGrantScope, GRANT_SCOPE);
  assert.strictEqual(summary.runtimeTrafficEnablementAuthorized, true);
  assert.strictEqual(summary.runtimeTrafficEnablementAuthorizationScope, GRANT_SCOPE);
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryEntryAllowed, true);
  assert.strictEqual(summary.runtimeTrafficEnablementBoundaryEntryScope, GRANT_SCOPE);
  assertNoMutationFlags(summary);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.nextPhaseRequiresRuntimeTrafficEnablementBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5W happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.runtimeTrafficAuthorizationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5W hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO5W_RUNTIME_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5wRuntimeTrafficAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5wRuntimeTrafficAuthorizationDecisionBoundary,
    "function"
  );
  assert.strictEqual(typeof assertOro5wRequestSubmittedFromOro5v, "function");
  assert.strictEqual(typeof assertOro5wDecisionIssuedOnly, "function");
  assert.strictEqual(typeof assertOro5wEnablementBoundaryOnlyGrant, "function");
  assert.strictEqual(typeof assertOro5wNoRuntimeTraffic, "function");
  assert.strictEqual(typeof assertOro5wNoLiveTraffic, "function");
  assert.strictEqual(typeof assertOro5wNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5wNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
    happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5wRequestSubmittedFromOro5v(happy), true);
  assert.strictEqual(assertOro5wDecisionIssuedOnly(happy), true);
  assert.strictEqual(assertOro5wEnablementBoundaryOnlyGrant(happy), true);
  assert.strictEqual(assertOro5wNoRuntimeTraffic(happy), true);
  assert.strictEqual(assertOro5wNoLiveTraffic(happy), true);
  assert.strictEqual(assertOro5wNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5wNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      missingRequestSubmissionFromOro5vFixture
    ),
    "ORO-5V runtime traffic authorization request must be submitted before ORO-5W"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      requestWrongStatusFromOro5vFixture
    ),
    "ORO-5V request must remain submitted pending decision"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(decisionNotIssuedFixture),
    "runtime traffic authorization decision must be issued and approved"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(decisionDeniedFixture),
    "runtime traffic authorization decision must be issued and approved"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(grantWrongScopeFixture),
    "runtime traffic grant must be enablement-boundary only"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      enablementBoundaryEntryDeniedFixture
    ),
    "runtime traffic grant must be enablement-boundary only"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      runtimeTrafficAllowedAttemptFixture
    ),
    "runtime traffic must remain unopened and unimplemented"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      runtimeTrafficImplementedAttemptFixture
    ),
    "runtime traffic must remain unopened and unimplemented"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      liveTrafficRequestSubmittedAttemptFixture
    ),
    "live traffic must remain outside ORO-5W"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(
      liveTrafficEnabledAttemptFixture
    ),
    "live traffic must remain outside ORO-5W"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(publicAliasWrongModeFixture),
    "public aliases must remain mounted in fail-closed no-mutation mode"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(dbTransactionDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(migrationDetectedFixture),
    "migration must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );
  assertHeld(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundary(sensitiveValueLeakFixture),
    "sensitive-shaped values must not leak"
  );

  const validation = validateOro5wRuntimeTrafficAuthorizationDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures().map(
      buildOro5wRuntimeTrafficAuthorizationDecisionBoundary
    );
  assert(allReports.length >= 20, "fixture set must cover ORO-5W required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5W runtime traffic authorization decision boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5W runtime traffic authorization decision boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
