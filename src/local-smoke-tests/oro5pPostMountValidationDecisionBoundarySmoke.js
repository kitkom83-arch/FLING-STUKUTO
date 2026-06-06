"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5pPostMountValidationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5pPostMountValidationDecisionBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  ORO5P_POST_MOUNT_VALIDATION_DECISION_BOUNDARY_STATUS,
  PASS,
  READINESS_SCOPE,
  READINESS_STATUS,
  assertOro5pNoExternalNetwork,
  assertOro5pNoPublicAliasDecision,
  assertOro5pNoPublicAliasImplementation,
  assertOro5pNoPublicAliasRequestSubmission,
  assertOro5pNoRuntimeMoneyMutation,
  assertOro5pPostMountValidationPassed,
  buildOro5pPostMountValidationDecisionBoundary,
  buildOro5pPostMountValidationDecisionBoundaryInput,
  buildOro5pSafetyLockSummary,
  validateOro5pPostMountValidationDecisionBoundary,
} = helper;

const {
  buildOro5pPostMountValidationDecisionBoundaryFixtures,
  externalNetworkDetectedFixture,
  happyPathPostMountValidationDecisionPublicAliasReadinessFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  missingPostMountValidationFixture,
  prismaWriteDetectedFixture,
  publicAliasDecisionIssuedAttemptRejectedFixture,
  publicAliasGrantedAttemptRejectedFixture,
  publicAliasImplementedAttemptRejectedFixture,
  publicAliasRequestSubmittedAttemptRejectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5O = "docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md";
const DOC_5P =
  "docs/ORO_5P_POST_MOUNT_VALIDATION_DECISION_PUBLIC_ALIAS_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md";
const APP = "src/app.js";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const WRAPPER = "src/local-smoke-tests/oro5pSmoke.js";
const SCRIPT = "smoke:oro-5p";
const ORO5P_SURFACE_FILES = Object.freeze([
  DOC_5P,
  "src/game-provider-mock/oro5pPostMountValidationDecisionBoundary.js",
  "src/game-provider-mock/oro5pPostMountValidationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5pPostMountValidationDecisionBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  ["docs/API_MAP", "P", "ING.md"].join(""),
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  DOC_5O,
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
    assert(!changed.has(forbidden), `${forbidden} must not be modified by ORO-5P.`);
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
  const doc5o = readRequired(DOC_5O);
  for (const marker of [
    "postMountValidationBoundaryResult = PASS",
    "internalOroPlayMountVerified = true",
    "failClosedRouteVerificationPassed = true",
  ]) {
    assert(doc5o.includes(marker), `${DOC_5O} missing marker ${marker}.`);
  }

  const doc5p = readRequired(DOC_5P);
  for (const marker of [
    "## ORO-5P scope",
    "## Dependency on ORO-5O post-mount validation",
    "## Post-mount validation decision record",
    "## Public alias authorization request readiness",
    "publicAliasAuthorizationRequestReadinessPrepared = true",
    "publicAliasAuthorizationRequestSubmitted = false",
    "publicAliasAuthorizationDecisionIssued = false",
    "publicAliasAuthorizationGranted = false",
    "apiBalancePublicAliasMounted = false",
    "apiTransactionPublicAliasMounted = false",
    "runtimeTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresPublicAliasAuthorizationRequestSubmission = true",
    "nextPhaseRequiresPublicAliasAuthorizationDecision = true",
    "nextPhaseRequiresPublicAliasImplementationBoundary = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
  ]) {
    assert(doc5p.includes(marker), `${DOC_5P} missing marker ${marker}.`);
  }

  const forbiddenDocPhrases = [
    "request submitted",
    "decision issued for public alias",
    "public alias granted",
    "public alias implemented",
    "runtime traffic enabled",
  ];
  for (const phrase of forbiddenDocPhrases) {
    assert(!doc5p.toLowerCase().includes(`oro-5p ${phrase}`), `${DOC_5P} overstates scope.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5p", "oro-5p"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5P post-mount validation decision boundary",
        "public alias authorization request readiness only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5P Current", "public alias authorization request readiness only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5P current/local pending post-mount validation decision boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5P Post-Mount Validation Decision Boundary Coverage", SCRIPT],
    ],
    [DOC_5O, ["ORO-5P issues the post-mount validation decision record"]],
    ["docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
    ["docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
    ["docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
    [
      [
        "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
        "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5P records the ORO-5O validation decision"],
    ],
    ["docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
    ["docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
    ["docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5P records the ORO-5O validation decision"]],
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

  for (const file of ORO5P_SURFACE_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }

  const oro5pHelperText = readRequired(
    "src/game-provider-mock/oro5pPostMountValidationDecisionBoundary.js"
  );
  const oro5pFixtureText = readRequired(
    "src/game-provider-mock/oro5pPostMountValidationDecisionBoundaryFixtures.js"
  );
  const boundaryText = `${oro5pHelperText}\n${oro5pFixtureText}`;
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5P boundary files must not contain ${marker}.`);
  }

  for (const [label, text] of [
    ["src/app.js", readRequired(APP)],
    ["ORO-5P surface", ORO5P_SURFACE_FILES.map(readRequired).join("\n")],
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
  assert.strictEqual(summary.publicAliasAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.publicAliasAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.publicAliasAuthorizationGranted, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
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
    "postMountValidationDecisionBoundaryResult",
    "postMountValidationDecisionBoundaryEntered",
    "postMountValidationDecisionChecked",
    "postMountValidationDecisionIssued",
    "postMountValidationDecisionStatus",
    "postMountValidationDecisionResult",
    "dependsOnOro5oPostMountValidation",
    "oro5oPostMountValidationPassed",
    "internalOroPlayMountVerifiedFromOro5o",
    "failClosedRouteVerificationPassedFromOro5o",
    "routeMountPatchImplementedFromOro5n",
    "routeMountPatchImplementationScope",
    "srcAppChangedInOro5p",
    "runtimeRouteControllerChangedInOro5p",
    "publicAliasAuthorizationRequestReadinessPrepared",
    "publicAliasAuthorizationRequestReadinessStatus",
    "publicAliasAuthorizationRequestScope",
    "publicAliasAuthorizationRequestSubmitted",
    "publicAliasAuthorizationDecisionIssued",
    "publicAliasAuthorizationGranted",
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
    "nextPhaseRequiresPublicAliasAuthorizationRequestSubmission",
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
  assert.strictEqual(summary.phase, "ORO-5P");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathPostMountValidationDecisionPublicAliasReadinessFixture"
  );
  assert.strictEqual(summary.postMountValidationDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.postMountValidationDecisionBoundaryEntered, true);
  assert.strictEqual(summary.postMountValidationDecisionChecked, true);
  assert.strictEqual(summary.postMountValidationDecisionIssued, true);
  assert.strictEqual(summary.postMountValidationDecisionStatus, "decision_issued");
  assert.strictEqual(summary.postMountValidationDecisionResult, "validated_passed");
  assert.strictEqual(summary.dependsOnOro5oPostMountValidation, true);
  assert.strictEqual(summary.oro5oPostMountValidationPassed, true);
  assert.strictEqual(summary.internalOroPlayMountVerifiedFromOro5o, true);
  assert.strictEqual(summary.failClosedRouteVerificationPassedFromOro5o, true);
  assert.strictEqual(summary.routeMountPatchImplementedFromOro5n, true);
  assert.strictEqual(summary.routeMountPatchImplementationScope, INTERNAL_FAIL_CLOSED_SCOPE);
  assert.strictEqual(summary.srcAppChangedInOro5p, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5p, false);
  assert.strictEqual(summary.publicAliasAuthorizationRequestReadinessPrepared, true);
  assert.strictEqual(summary.publicAliasAuthorizationRequestReadinessStatus, READINESS_STATUS);
  assert.strictEqual(summary.publicAliasAuthorizationRequestScope, READINESS_SCOPE);
  assert.strictEqual(summary.oroplayInternalCallbackRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMounted, true);
  assert.strictEqual(summary.oroplayTransactionRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.oroplayTransactionRouteMode, FAIL_CLOSED_NO_MUTATION);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasAuthorizationRequestSubmission, true);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasAuthorizationDecision, true);
  assert.strictEqual(summary.nextPhaseRequiresPublicAliasImplementationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.postMountValidationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.srcAppChangedInOro5p, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5p, false);
  assertHeldGates(summary);
  assertResultHasNoSensitiveFields(summary);
}

function main() {
  assert.strictEqual(typeof ORO5P_POST_MOUNT_VALIDATION_DECISION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro5pPostMountValidationDecisionBoundaryInput, "function");
  assert.strictEqual(typeof buildOro5pPostMountValidationDecisionBoundary, "function");
  assert.strictEqual(typeof validateOro5pPostMountValidationDecisionBoundary, "function");
  assert.strictEqual(typeof buildOro5pSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5pPostMountValidationPassed, "function");
  assert.strictEqual(typeof assertOro5pNoPublicAliasRequestSubmission, "function");
  assert.strictEqual(typeof assertOro5pNoPublicAliasDecision, "function");
  assert.strictEqual(typeof assertOro5pNoPublicAliasImplementation, "function");
  assert.strictEqual(typeof assertOro5pNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5pNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertForbiddenRuntimeFilesUntouched();
  assertNoPublicAliasMounts();
  assertStaticSafety();

  const happy = buildOro5pPostMountValidationDecisionBoundary(
    happyPathPostMountValidationDecisionPublicAliasReadinessFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5pPostMountValidationPassed(happy), true);
  assert.strictEqual(assertOro5pNoPublicAliasRequestSubmission(happy), true);
  assert.strictEqual(assertOro5pNoPublicAliasDecision(happy), true);
  assert.strictEqual(assertOro5pNoPublicAliasImplementation(happy), true);
  assert.strictEqual(assertOro5pNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5pNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(missingPostMountValidationFixture),
    "ORO-5O post-mount validation must pass before ORO-5P"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(
      publicAliasRequestSubmittedAttemptRejectedFixture
    ),
    "public alias authorization request must not be submitted in ORO-5P"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(
      publicAliasDecisionIssuedAttemptRejectedFixture
    ),
    "public alias authorization decision must not be issued in ORO-5P"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(
      publicAliasGrantedAttemptRejectedFixture
    ),
    "public alias authorization must not be granted in ORO-5P"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(
      publicAliasImplementedAttemptRejectedFixture
    ),
    "public aliases must not be implemented or active in ORO-5P"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(runtimeTrafficDetectedFixture),
    "runtime and live traffic must remain disabled"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5pPostMountValidationDecisionBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );

  const validation = validateOro5pPostMountValidationDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5pSafetyLockSummary();
  assert.strictEqual(safety.publicAliasAuthorizationRequestSubmitted, false);
  assert.strictEqual(safety.publicAliasAuthorizationDecisionIssued, false);
  assert.strictEqual(safety.publicAliasImplemented, false);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.externalNetworkCalled, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports = buildOro5pPostMountValidationDecisionBoundaryFixtures().map(
    buildOro5pPostMountValidationDecisionBoundary
  );
  assert(allReports.length >= 12, "fixture set must cover ORO-5P required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertHeldGates(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5P post-mount validation decision boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5P post-mount validation decision boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
