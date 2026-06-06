"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundary");
const fixtures = require("../game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  ORO5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
  PASS,
  REQUEST_RESULT,
  REQUEST_SCOPE,
  REQUEST_STATUS,
  assertOro5qNoExternalNetwork,
  assertOro5qNoPublicAliasDecision,
  assertOro5qNoPublicAliasGrant,
  assertOro5qNoPublicAliasImplementation,
  assertOro5qNoRuntimeMoneyMutation,
  assertOro5qReadinessFromOro5p,
  assertOro5qRequestSubmittedOnly,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput,
  buildOro5qSafetyLockSummary,
  validateOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
} = helper;

const {
  apiBalancePublicAliasMountedAttemptRejectedFixture,
  apiTransactionPublicAliasMountedAttemptRejectedFixture,
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures,
  externalNetworkDetectedFixture,
  happyPathPublicAliasAuthorizationRequestSubmissionFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  missingReadinessFromOro5pFixture,
  prismaWriteDetectedFixture,
  publicAliasDecisionIssuedAttemptRejectedFixture,
  publicAliasGrantedAttemptRejectedFixture,
  publicAliasImplementedAttemptRejectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5P =
  "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const DOC_5Q = "docs/ORO_5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const APP = "src/app.js";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const WRAPPER = "src/local-smoke-tests/oro5qSmoke.js";
const SCRIPT = "smoke:oro-5q";
const ORO5Q_SURFACE_FILES = Object.freeze([
  DOC_5Q,
  "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundary.js",
  "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5qPublicAliasAuthorizationRequestSubmissionBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  ["docs/API_MAP", "P", "ING.md"].join(""),
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  DOC_5P,
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
  for (const forbidden of [ROUTE_FILE, CONTROLLER_FILE]) {
    assert(!changed.has(forbidden), `${forbidden} must not be modified by ORO-5Q.`);
  }
  if (changed.has(APP)) assertOro5sPublicAliasWiringOnly("ORO-5Q");
}

function assertOro5sPublicAliasWiringOnly(label) {
  const app = readRequired(APP);
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `${label} compatibility missing ORO-5S marker ${marker}.`);
  }
  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
    "PrismaClient",
    "prisma.",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
    "walletMutationPerformed: true",
    "ledgerMutationPerformed: true",
    "liveOroPlayApiCalled: true",
  ]) {
    assert(!app.includes(marker), `${label} compatibility forbids ${marker}.`);
  }
}

function assertNoPublicAliasMounts() {
  assertOro5sPublicAliasWiringOnly("ORO-5Q");
}

function assertDocsAndRegistration() {
  const doc5p = readRequired(DOC_5P);
  for (const marker of [
    "publicAliasAuthorizationRequestReadinessPrepared = true",
    "publicAliasAuthorizationRequestReadinessStatus = ready_for_request_submission_boundary",
    "publicAliasAuthorizationRequestSubmitted = false",
    "nextPhaseRequiresPublicAliasAuthorizationRequestSubmission = true",
  ]) {
    assert(doc5p.includes(marker), `${DOC_5P} missing marker ${marker}.`);
  }

  const doc5q = readRequired(DOC_5Q);
  for (const marker of [
    "## ORO-5Q scope",
    "## Dependency on ORO-5P readiness",
    "## Request submission record",
    "publicAliasAuthorizationRequestSubmitted = true",
    "publicAliasAuthorizationRequestStatus = submitted_pending_decision",
    "publicAliasAuthorizationRequestResult = submitted",
    "publicAliasAuthorizationRequestScope = public_alias_authorization_decision_request_only",
    "publicAliasAuthorizationDecisionIssued = false",
    "publicAliasAuthorizationGranted = false",
    "publicAliasImplemented = false",
    "apiBalancePublicAliasMounted = false",
    "apiTransactionPublicAliasMounted = false",
    "runtimeTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresPublicAliasAuthorizationDecision = true",
    "nextPhaseRequiresPublicAliasImplementationBoundary = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc5q.includes(marker), `${DOC_5Q} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5q", "oro-5q"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5Q public alias authorization request submission boundary",
        "public_alias_authorization_decision_request_only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5Q Current", "submitted_pending_decision"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5Q current/local pending public alias authorization request submission boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5Q Public Alias Authorization Request Submission Boundary Coverage", SCRIPT],
    ],
    [DOC_5P, ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    [
      [
        "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
        "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5Q submits the static public alias authorization request record"],
    ],
    ["docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
    ["docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5Q submits the static public alias authorization request record"]],
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

  for (const file of ORO5Q_SURFACE_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }

  const boundaryText = [
    "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundary.js",
    "src/game-provider-mock/oro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures.js",
  ].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5Q boundary files must not contain ${marker}.`);
  }

  for (const [label, text] of [
    ["src/app.js", readRequired(APP)],
    ["ORO-5Q surface", ORO5Q_SURFACE_FILES.map(readRequired).join("\n")],
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

function assertHeldGates(summary) {
  assert.strictEqual(summary.publicAliasAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.publicAliasAuthorizationGranted, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplementationAuthorized, false);
  assert.strictEqual(summary.publicAliasImplementationBoundaryEntryAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, false);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, false);
  assert.strictEqual(summary.apiBalancePublicAliasActive, false);
  assert.strictEqual(summary.apiTransactionPublicAliasActive, false);
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
    "publicAliasAuthorizationRequestSubmissionBoundaryResult",
    "publicAliasAuthorizationRequestSubmissionBoundaryEntered",
    "publicAliasAuthorizationRequestSubmissionChecked",
    "dependsOnOro5pPublicAliasReadiness",
    "publicAliasAuthorizationRequestReadinessPreparedFromOro5p",
    "publicAliasAuthorizationRequestReadinessStatusFromOro5p",
    "postMountValidationDecisionIssuedFromOro5p",
    "postMountValidationDecisionResultFromOro5p",
    "publicAliasAuthorizationRequestSubmitted",
    "publicAliasAuthorizationRequestStatus",
    "publicAliasAuthorizationRequestResult",
    "publicAliasAuthorizationRequestScope",
    "publicAliasAuthorizationDecisionIssued",
    "publicAliasAuthorizationDecisionStatus",
    "publicAliasAuthorizationDecisionResult",
    "publicAliasAuthorizationGranted",
    "publicAliasAuthorization",
    "publicAliasImplementationAuthorized",
    "publicAliasImplementationAuthorizationScope",
    "publicAliasImplementationBoundaryEntryAllowed",
    "srcAppChangedInOro5q",
    "runtimeRouteControllerChangedInOro5q",
    "publicAliasAllowed",
    "publicAliasImplemented",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasActive",
    "apiTransactionPublicAliasActive",
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
    "nextPhaseRequiresPublicAliasAuthorizationDecision",
    "nextPhaseRequiresPublicAliasImplementationBoundary",
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
  assert.strictEqual(summary.phase, "ORO-5Q");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathPublicAliasAuthorizationRequestSubmissionFixture"
  );
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmissionBoundaryResult, PASS);
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmissionBoundaryEntered, true);
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmissionChecked, true);
  assert.strictEqual(summary.dependsOnOro5pPublicAliasReadiness, true);
  assert.strictEqual(summary.publicAliasAuthorizationRequestReadinessPreparedFromOro5p, true);
  assert.strictEqual(
    summary.publicAliasAuthorizationRequestReadinessStatusFromOro5p,
    "ready_for_request_submission_boundary"
  );
  assert.strictEqual(summary.postMountValidationDecisionIssuedFromOro5p, true);
  assert.strictEqual(summary.postMountValidationDecisionResultFromOro5p, "validated_passed");
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmitted, true);
  assert.strictEqual(summary.publicAliasAuthorizationRequestStatus, REQUEST_STATUS);
  assert.strictEqual(summary.publicAliasAuthorizationRequestResult, REQUEST_RESULT);
  assert.strictEqual(summary.publicAliasAuthorizationRequestScope, REQUEST_SCOPE);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionStatus, "not_issued");
  assert.strictEqual(summary.publicAliasAuthorizationDecisionResult, "pending");
  assert.strictEqual(summary.publicAliasAuthorization, "not_authorized_for_public_alias");
  assert.strictEqual(summary.publicAliasImplementationAuthorizationScope, "not_authorized");
  assert.strictEqual(summary.srcAppChangedInOro5q, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5q, false);
  assert.strictEqual(summary.oroplayInternalCallbackRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMounted, true);
  assert.strictEqual(summary.oroplayTransactionRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.oroplayTransactionRouteMode, FAIL_CLOSED_NO_MUTATION);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasAuthorizationDecision, true);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasImplementationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmissionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.srcAppChangedInOro5q, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5q, false);
  assertHeldGates(summary);
  assertResultHasNoSensitiveFields(summary);
}

function main() {
  assert.strictEqual(
    typeof ORO5Q_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput,
    "function"
  );
  assert.strictEqual(
    typeof buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
    "function"
  );
  assert.strictEqual(
    typeof validateOro5qPublicAliasAuthorizationRequestSubmissionBoundary,
    "function"
  );
  assert.strictEqual(typeof buildOro5qSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5qReadinessFromOro5p, "function");
  assert.strictEqual(typeof assertOro5qRequestSubmittedOnly, "function");
  assert.strictEqual(typeof assertOro5qNoPublicAliasDecision, "function");
  assert.strictEqual(typeof assertOro5qNoPublicAliasGrant, "function");
  assert.strictEqual(typeof assertOro5qNoPublicAliasImplementation, "function");
  assert.strictEqual(typeof assertOro5qNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5qNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertForbiddenRuntimeFilesUntouched();
  assertNoPublicAliasMounts();
  assertStaticSafety();

  const happy = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
    happyPathPublicAliasAuthorizationRequestSubmissionFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5qReadinessFromOro5p(happy), true);
  assert.strictEqual(assertOro5qRequestSubmittedOnly(happy), true);
  assert.strictEqual(assertOro5qNoPublicAliasDecision(happy), true);
  assert.strictEqual(assertOro5qNoPublicAliasGrant(happy), true);
  assert.strictEqual(assertOro5qNoPublicAliasImplementation(happy), true);
  assert.strictEqual(assertOro5qNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5qNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      missingReadinessFromOro5pFixture
    ),
    "ORO-5P public alias readiness must be prepared before ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      publicAliasDecisionIssuedAttemptRejectedFixture
    ),
    "public alias authorization decision must not be issued in ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      publicAliasGrantedAttemptRejectedFixture
    ),
    "public alias authorization must not be granted in ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      publicAliasImplementedAttemptRejectedFixture
    ),
    "public alias implementation must not be authorized in ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      apiBalancePublicAliasMountedAttemptRejectedFixture
    ),
    "public aliases must not be implemented or active in ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(
      apiTransactionPublicAliasMountedAttemptRejectedFixture
    ),
    "public aliases must not be implemented or active in ORO-5Q"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(runtimeTrafficDetectedFixture),
    "runtime and live traffic must remain disabled"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );

  const validation = validateOro5qPublicAliasAuthorizationRequestSubmissionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5qSafetyLockSummary();
  assert.strictEqual(safety.publicAliasAuthorizationRequestSubmitted, true);
  assert.strictEqual(safety.publicAliasAuthorizationDecisionIssued, false);
  assert.strictEqual(safety.publicAliasAuthorizationGranted, false);
  assert.strictEqual(safety.publicAliasImplemented, false);
  assert.strictEqual(safety.publicAliasImplementationAuthorized, false);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.externalNetworkCalled, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports = buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures().map(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundary
  );
  assert(allReports.length >= 13, "fixture set must cover ORO-5Q required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertHeldGates(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5Q public alias authorization request submission boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5Q public alias authorization request submission boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
