"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundaryFixtures");

const {
  DECISION_RESULT,
  DECISION_STATUS,
  FAIL_CLOSED_NO_MUTATION,
  GRANT_SCOPE,
  ORO5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
  PASS,
  assertOro5rDecisionIssuedOnly,
  assertOro5rImplementationBoundaryOnlyGrant,
  assertOro5rNoExternalNetwork,
  assertOro5rNoPublicAliasImplementation,
  assertOro5rNoRuntimeMoneyMutation,
  assertOro5rNoRuntimeTraffic,
  assertOro5rRequestSubmittedFromOro5q,
  buildOro5rPublicAliasAuthorizationDecisionBoundary,
  buildOro5rPublicAliasAuthorizationDecisionBoundaryInput,
  buildOro5rSafetyLockSummary,
  validateOro5rPublicAliasAuthorizationDecisionBoundary,
} = helper;

const {
  apiBalancePublicAliasMountedAttemptRejectedFixture,
  apiTransactionPublicAliasMountedAttemptRejectedFixture,
  buildOro5rPublicAliasAuthorizationDecisionBoundaryFixtures,
  decisionDeniedFixture,
  externalNetworkDetectedFixture,
  happyPathPublicAliasAuthorizationDecisionApprovedFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  missingRequestSubmissionFromOro5qFixture,
  prismaWriteDetectedFixture,
  publicAliasImplementedAttemptRejectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5Q = "docs/ORO_5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const DOC_5R = "docs/ORO_5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY.md";
const APP = "src/app.js";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const WRAPPER = "src/local-smoke-tests/oro5rSmoke.js";
const SCRIPT = "smoke:oro-5r";
const ORO5R_SURFACE_FILES = Object.freeze([
  DOC_5R,
  "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5rPublicAliasAuthorizationDecisionBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  ["docs/API_MAP", "P", "ING.md"].join(""),
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  DOC_5Q,
  [
    "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_",
    "PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  ].join(""),
  "docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md",
  "docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md",
  "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md",
  "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
  [
    "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
    "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  ].join(""),
  "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md",
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md",
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function gitChangedFiles() {
  const result = spawnSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git diff --name-only failed: ${result.stderr}`);
  return new Set(
    result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function assertForbiddenRuntimeFilesUntouched() {
  const changed = gitChangedFiles();
  for (const forbidden of [APP, ROUTE_FILE, CONTROLLER_FILE]) {
    assert(!changed.has(forbidden), `${forbidden} must not be modified by ORO-5R.`);
  }
}

function assertNoPublicAliasMounts() {
  const app = readRequired(APP);
  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]) {
    assert(!app.includes(marker), `src/app.js must not contain ${marker}.`);
  }
}

function assertDocsAndRegistration() {
  const doc5q = readRequired(DOC_5Q);
  for (const marker of [
    "publicAliasAuthorizationRequestSubmitted = true",
    "publicAliasAuthorizationRequestStatus = submitted_pending_decision",
    "publicAliasAuthorizationRequestResult = submitted",
    "publicAliasAuthorizationRequestScope = public_alias_authorization_decision_request_only",
    "ORO-5R issues the static public alias authorization decision record",
  ]) {
    assert(doc5q.includes(marker), `${DOC_5Q} missing marker ${marker}.`);
  }

  const doc5r = readRequired(DOC_5R);
  for (const marker of [
    "## ORO-5R scope",
    "## Dependency on ORO-5Q request submission",
    "## Public alias authorization decision record",
    "publicAliasAuthorizationDecisionIssued = true",
    "publicAliasAuthorizationDecisionStatus = decision_issued",
    "publicAliasAuthorizationDecisionResult = approved",
    "publicAliasAuthorizationGranted = true",
    "publicAliasAuthorizationGrantScope = public_alias_implementation_boundary_only",
    "publicAliasAuthorizationRequestStatus = decision_issued",
    "publicAliasAuthorizationRequestResult = approved",
    "publicAliasAuthorizationRequestResolved = true",
    "publicAliasImplementationAuthorized = true",
    "publicAliasImplementationBoundaryEntryAllowed = true",
    "publicAliasImplemented = false",
    "apiBalancePublicAliasMounted = false",
    "apiTransactionPublicAliasMounted = false",
    "srcAppChangedInOro5r = false",
    "runtimeRouteControllerChangedInOro5r = false",
    "runtimeTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresPublicAliasImplementationBoundary = true",
    "nextPhaseRequiresPostAliasValidationBoundary = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc5r.includes(marker), `${DOC_5R} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5r", "oro-5r"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5R public alias authorization decision boundary",
        "public_alias_implementation_boundary_only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5R Current", "decision_issued", "public_alias_implementation_boundary_only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5R current/local public alias authorization decision boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5R Public Alias Authorization Decision Boundary Coverage", SCRIPT],
    ],
    [DOC_5Q, ["ORO-5R issues the static public alias authorization decision record"]],
    [
      [
        "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_",
        "PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5R issues the static public alias authorization decision record"],
    ],
    ["docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    ["docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    ["docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    ["docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    [
      [
        "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
        "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5R issues the static public alias authorization decision record"],
    ],
    ["docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    ["docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
    ["docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5R issues the static public alias authorization decision record"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertStaticSafety() {
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];
  const unsafeRuntimePatterns = [
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "http.request",
    "https.request",
  ];

  for (const file of ORO5R_SURFACE_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }

  const boundaryText = [
    "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundary.js",
    "src/game-provider-mock/oro5rPublicAliasAuthorizationDecisionBoundaryFixtures.js",
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5R boundary files must not contain ${marker}.`);
  }

  for (const [label, text] of [
    ["src/app.js", readRequired(APP)],
    ["ORO-5R surface", ORO5R_SURFACE_FILES.map(readRequired).join("\n")],
  ]) {
    for (const line of text.split(/\r?\n/)) {
      if (!/https?:\/\//i.test(line)) continue;
      assert(!/oroplay/i.test(line), `${label} must not include live OroPlay URL.`);
    }
  }
}

function assertResultHasNoSensitiveFields(value) {
  const forbiddenMarkers = [
    ["to", "ken"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
  ];
  const serialized = JSON.stringify(value);
  for (const marker of forbiddenMarkers) {
    assert(!serialized.includes(marker), `summary leaked sensitive marker ${marker}.`);
  }
}

function assertImplementationAbsent(summary) {
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.publicAliasPatchImplemented, false);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, false);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, false);
  assert.strictEqual(summary.apiBalancePublicAliasActive, false);
  assert.strictEqual(summary.apiTransactionPublicAliasActive, false);
  assert.strictEqual(summary.expressMountAllowedInOro5r, false);
  assert.strictEqual(summary.expressMountImplementedInOro5r, false);
}

function assertSafetyLocks(summary) {
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
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
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "publicAliasAuthorizationDecisionBoundaryResult",
    "publicAliasAuthorizationDecisionBoundaryEntered",
    "publicAliasAuthorizationDecisionChecked",
    "dependsOnOro5qPublicAliasAuthorizationRequestSubmission",
    "publicAliasAuthorizationRequestSubmittedFromOro5q",
    "publicAliasAuthorizationRequestStatusFromOro5q",
    "publicAliasAuthorizationRequestResultFromOro5q",
    "publicAliasAuthorizationDecisionIssued",
    "publicAliasAuthorizationDecisionStatus",
    "publicAliasAuthorizationDecisionResult",
    "publicAliasAuthorizationRequestStatus",
    "publicAliasAuthorizationRequestResult",
    "publicAliasAuthorizationRequestResolved",
    "publicAliasAuthorizationGranted",
    "publicAliasAuthorizationGrantScope",
    "publicAliasAuthorization",
    "publicAliasImplementationAuthorized",
    "publicAliasImplementationAuthorizationScope",
    "publicAliasImplementationBoundaryEntryAllowed",
    "publicAliasImplementationBoundaryEntryScope",
    "srcAppChangedInOro5r",
    "runtimeRouteControllerChangedInOro5r",
    "publicAliasImplemented",
    "publicAliasPatchImplemented",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasActive",
    "apiTransactionPublicAliasActive",
    "expressMountAllowedInOro5r",
    "expressMountImplementedInOro5r",
    "oroplayInternalCallbackRouteMounted",
    "oroplayBalanceRouteMounted",
    "oroplayTransactionRouteMounted",
    "oroplayBalanceRouteMode",
    "oroplayTransactionRouteMode",
    "runtimeTrafficAllowed",
    "runtimeTrafficEnabled",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
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
    "nextPhaseRequiresPublicAliasImplementationBoundary",
    "nextPhaseRequiresPostAliasValidationBoundary",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval",
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
  assert.strictEqual(summary.phase, "ORO-5R");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathPublicAliasAuthorizationDecisionApprovedFixture"
  );
  assert.strictEqual(summary.publicAliasAuthorizationDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionBoundaryEntered, true);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionChecked, true);
  assert.strictEqual(
    summary.dependsOnOro5qPublicAliasAuthorizationRequestSubmission,
    true
  );
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmittedFromOro5q, true);
  assert.strictEqual(
    summary.publicAliasAuthorizationRequestStatusFromOro5q,
    "submitted_pending_decision"
  );
  assert.strictEqual(summary.publicAliasAuthorizationRequestResultFromOro5q, "submitted");
  assert.strictEqual(summary.publicAliasAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionStatus, DECISION_STATUS);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionResult, DECISION_RESULT);
  assert.strictEqual(summary.publicAliasAuthorizationRequestStatus, DECISION_STATUS);
  assert.strictEqual(summary.publicAliasAuthorizationRequestResult, DECISION_RESULT);
  assert.strictEqual(summary.publicAliasAuthorizationRequestResolved, true);
  assert.strictEqual(summary.publicAliasAuthorizationGranted, true);
  assert.strictEqual(summary.publicAliasAuthorizationGrantScope, GRANT_SCOPE);
  assert.strictEqual(
    summary.publicAliasAuthorization,
    "authorized_for_public_alias_implementation_boundary_only"
  );
  assert.strictEqual(summary.publicAliasImplementationAuthorized, true);
  assert.strictEqual(summary.publicAliasImplementationAuthorizationScope, GRANT_SCOPE);
  assert.strictEqual(summary.publicAliasImplementationBoundaryEntryAllowed, true);
  assert.strictEqual(summary.publicAliasImplementationBoundaryEntryScope, GRANT_SCOPE);
  assert.strictEqual(summary.srcAppChangedInOro5r, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5r, false);
  assertImplementationAbsent(summary);
  assert.strictEqual(summary.oroplayInternalCallbackRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMounted, true);
  assert.strictEqual(summary.oroplayTransactionRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.oroplayTransactionRouteMode, FAIL_CLOSED_NO_MUTATION);
  assertSafetyLocks(summary);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasImplementationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresPostAliasValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.publicAliasAuthorizationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.srcAppChangedInOro5r, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5r, false);
  assertImplementationAbsent(summary);
  assertSafetyLocks(summary);
  assertResultHasNoSensitiveFields(summary);
}

function main() {
  assert.strictEqual(
    typeof ORO5R_PUBLIC_ALIAS_AUTHORIZATION_DECISION_BOUNDARY_STATUS,
    "object"
  );
  assert.strictEqual(typeof buildOro5rPublicAliasAuthorizationDecisionBoundaryInput, "function");
  assert.strictEqual(typeof buildOro5rPublicAliasAuthorizationDecisionBoundary, "function");
  assert.strictEqual(typeof validateOro5rPublicAliasAuthorizationDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro5rSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5rRequestSubmittedFromOro5q, "function");
  assert.strictEqual(typeof assertOro5rDecisionIssuedOnly, "function");
  assert.strictEqual(typeof assertOro5rImplementationBoundaryOnlyGrant, "function");
  assert.strictEqual(typeof assertOro5rNoPublicAliasImplementation, "function");
  assert.strictEqual(typeof assertOro5rNoRuntimeTraffic, "function");
  assert.strictEqual(typeof assertOro5rNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5rNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertForbiddenRuntimeFilesUntouched();
  assertNoPublicAliasMounts();
  assertStaticSafety();

  const happy = buildOro5rPublicAliasAuthorizationDecisionBoundary(
    happyPathPublicAliasAuthorizationDecisionApprovedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5rRequestSubmittedFromOro5q(happy), true);
  assert.strictEqual(assertOro5rDecisionIssuedOnly(happy), true);
  assert.strictEqual(assertOro5rImplementationBoundaryOnlyGrant(happy), true);
  assert.strictEqual(assertOro5rNoPublicAliasImplementation(happy), true);
  assert.strictEqual(assertOro5rNoRuntimeTraffic(happy), true);
  assert.strictEqual(assertOro5rNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5rNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(
      missingRequestSubmissionFromOro5qFixture
    ),
    "ORO-5Q public alias authorization request must be submitted before ORO-5R"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(decisionDeniedFixture),
    "public alias authorization decision must be issued and approved"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(
      publicAliasImplementedAttemptRejectedFixture
    ),
    "public alias implementation and public mounts must remain absent in ORO-5R"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(
      apiBalancePublicAliasMountedAttemptRejectedFixture
    ),
    "public alias implementation and public mounts must remain absent in ORO-5R"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(
      apiTransactionPublicAliasMountedAttemptRejectedFixture
    ),
    "public alias implementation and public mounts must remain absent in ORO-5R"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(runtimeTrafficDetectedFixture),
    "runtime and live traffic must remain disabled"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5rPublicAliasAuthorizationDecisionBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );

  const validation = validateOro5rPublicAliasAuthorizationDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5rSafetyLockSummary();
  assert.strictEqual(safety.publicAliasAuthorizationDecisionIssued, true);
  assert.strictEqual(safety.publicAliasAuthorizationGranted, true);
  assert.strictEqual(safety.publicAliasAuthorizationGrantScope, GRANT_SCOPE);
  assert.strictEqual(safety.publicAliasImplementationAuthorized, true);
  assert.strictEqual(safety.publicAliasImplementationBoundaryEntryAllowed, true);
  assert.strictEqual(safety.publicAliasImplemented, false);
  assert.strictEqual(safety.publicAliasPatchImplemented, false);
  assert.strictEqual(safety.apiBalancePublicAliasMounted, false);
  assert.strictEqual(safety.apiTransactionPublicAliasMounted, false);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.externalNetworkCalled, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports = buildOro5rPublicAliasAuthorizationDecisionBoundaryFixtures().map(
    buildOro5rPublicAliasAuthorizationDecisionBoundary
  );
  assert(allReports.length >= 12, "fixture set must cover ORO-5R required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertImplementationAbsent(report);
    assertSafetyLocks(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5R public alias authorization decision boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5R public alias authorization decision boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
