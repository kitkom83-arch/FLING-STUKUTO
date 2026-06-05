"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5nRouteMountImplementationBoundary");
const fixtures = require("../game-provider-mock/oro5nRouteMountImplementationBoundaryFixtures");
const {
  buildOroplayCallbackStubResponse,
  buildOroplayCallbackStubRouteSummary,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  ORO5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_STATUS,
  PASS,
  buildOro5nRouteMountImplementationBoundary,
  validateOro5nRouteMountImplementationBoundary,
  buildOro5nSafetyLockSummary,
  assertOro5nNoPublicAlias,
  assertOro5nNoRuntimeMoneyMutation,
} = helper;

const {
  buildOro5nRouteMountImplementationBoundaryFixtures,
  controllerBehaviorChangeAttemptRejectedFixture,
  happyPathInternalFailClosedMountFixture,
  missingAuthorizationFixture,
  publicAliasAttemptRejectedFixture,
  runtimeTrafficAttemptRejectedFixture,
  walletMutationAttemptRejectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md";
const APP = "src/app.js";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const ORO5M_DOC = "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md";
const ORO5L_DOC =
  "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md";
const ORO5K_DOC = [
  "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
  "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
].join("");
const ORO5J_DOC = "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md";
const ORO5I_DOC =
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md";
const ORO5H_DOC =
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5nSmoke.js";
const SCRIPT = "smoke:oro-5n";
const STATIC_SAFETY_FILES = Object.freeze([
  APP,
  DOC,
  ORO5M_DOC,
  ORO5L_DOC,
  ORO5K_DOC,
  ORO5J_DOC,
  ORO5I_DOC,
  ORO5H_DOC,
  "src/game-provider-mock/oro5nRouteMountImplementationBoundary.js",
  "src/game-provider-mock/oro5nRouteMountImplementationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5nRouteMountImplementationBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "docs/API_MAPPING.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertResultHasNoSensitiveFields(value) {
  const forbidden = [
    ["to", "ken"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    "PIN",
    ["device", "Id"].join(""),
  ];
  const serialized = JSON.stringify(value);
  for (const marker of forbidden) {
    assert(!serialized.includes(marker), `summary leaked sensitive marker ${marker}.`);
  }
}

function assertChangedFilesStaticSafety() {
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];

  for (const file of STATIC_SAFETY_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertNoUnsafeRuntimeText() {
  const app = readRequired(APP);
  const route = readRequired(ROUTE_FILE);
  const controller = readRequired(CONTROLLER_FILE);
  const helperText = readRequired(
    "src/game-provider-mock/oro5nRouteMountImplementationBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5nRouteMountImplementationBoundaryFixtures.js"
  );
  const runtimeCombined = `${app}\n${route}\n${controller}`;
  const newCombined = `${helperText}\n${fixtureText}`;

  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]) {
    assert(!runtimeCombined.includes(marker), `public alias must not exist: ${marker}.`);
  }

  for (const marker of [
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert(!newCombined.includes(marker), `ORO-5N files must not contain ${marker}.`);
  }

  for (const marker of [
    "walletMutationPerformed: true",
    "ledgerMutationPerformed: true",
    "prismaWritePerformed: true",
    "dbTransactionPerformed: true",
    "liveOroPlayApiCalled: true",
  ]) {
    assert(!newCombined.includes(marker), `ORO-5N files must not perform ${marker}.`);
  }

  for (const liveUrl of [/https?:\/\/[^"'\s]*oroplay/i, /oroplay.*https?:\/\//i]) {
    assert(!liveUrl.test(runtimeCombined), "runtime files must not include live OroPlay URL.");
    assert(!liveUrl.test(newCombined), "ORO-5N files must not include live OroPlay URL.");
  }
}

function assertAppMount() {
  const app = readRequired(APP);
  assert(
    app.includes('const oroplayCallbackStubRoutes = require("./routes/oroplayCallbackStub.routes");'),
    "src/app.js must require the existing fail-closed OroPlay callback stub router."
  );
  assert(
    app.includes('app.use("/api/oroplay", oroplayCallbackStubRoutes);'),
    "src/app.js must mount the existing stub only under /api/oroplay."
  );
  assert(
    app.includes("ORO-5N: internal fail-closed OroPlay callback staging mount only"),
    "src/app.js must carry the ORO-5N controlled mount marker."
  );
  assert(!app.includes('app.use("/api/balance"'), "src/app.js must not mount /api/balance.");
  assert(
    !app.includes('app.use("/api/transaction"'),
    "src/app.js must not mount /api/transaction."
  );
  assert(
    !app.includes('app.post("/api/balance"'),
    "src/app.js must not post /api/balance."
  );
  assert(
    !app.includes('app.post("/api/transaction"'),
    "src/app.js must not post /api/transaction."
  );
}

function assertFailClosedRoutePreserved() {
  const route = readRequired(ROUTE_FILE);
  const controller = readRequired(CONTROLLER_FILE);
  assert(route.includes('router.post("/balance"'), "balance route must stay mounted in router.");
  assert(
    route.includes('router.post("/transaction"'),
    "transaction route must stay mounted in router."
  );
  assert(
    controller.includes("sendFailClosedStub"),
    "controller must still use fail-closed stub sender."
  );
  assert(
    controller.includes("statusCode = stubEnabled ? 501 : 503"),
    "controller must still return fail-closed 501/503 status."
  );

  const routeSummary = buildOroplayCallbackStubRouteSummary();
  assert.strictEqual(routeSummary.mount, "/api/oroplay");
  assert.strictEqual(routeSummary.defaultBehavior, "fail-closed");
  assert.strictEqual(routeSummary.activeAliases, false);

  const response = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  assert.strictEqual(response.success, false);
  assert.strictEqual(response.result, "fail_closed");
  assert.strictEqual(validateOroplayCallbackStubSafety(response).ok, true);
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## ORO-5N scope",
    "## Input from ORO-5M",
    "## Internal fail-closed staging mount",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Wallet / ledger / Prisma write boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "routeMountImplementationBoundaryResult = PASS",
    "routeMountPatchImplementationScope = internal_fail_closed_oroplay_callback_staging_mount_only",
    "oroplayBalanceRouteMode = fail_closed_no_mutation",
    "apiBalancePublicAliasMounted = false",
    "runtimeTrafficEnabled = false",
    "walletMutationAllowed = false",
    "liveOroPlayApiCallAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5n", "oro-5n"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5N route mount implementation boundary",
        "internal fail-closed OroPlay callback staging mount only",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5N Current", "internal fail-closed OroPlay callback staging mount only"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5N current/local pending route mount implementation boundary",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5N Route Mount Implementation Boundary Coverage", SCRIPT],
    ],
    [ORO5M_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
    [ORO5L_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
    [ORO5K_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
    [ORO5J_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
    [ORO5I_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
    [ORO5H_DOC, ["ORO-5N implements internal fail-closed route mount boundary"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHeldGates(summary) {
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, false);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, false);
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

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5N");
  assert.strictEqual(summary.routeMountImplementationBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountImplementationBoundaryEntered, true);
  assert.strictEqual(summary.routeMountImplementationAuthorizedFromOro5m, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, "approved");
  assert.strictEqual(
    summary.routeMountAuthorizationGrantScope,
    "route_mount_implementation_boundary_only"
  );
  assert.strictEqual(summary.routeMountPatchImplemented, true);
  assert.strictEqual(summary.routeMountPatchImplementationScope, INTERNAL_FAIL_CLOSED_SCOPE);
  assert.strictEqual(summary.srcAppChanged, true);
  assert.strictEqual(
    summary.srcAppChangeScope,
    "internal_oroplay_callback_staging_mount_only"
  );
  assert.strictEqual(summary.expressMountAllowed, true);
  assert.strictEqual(summary.expressMountImplemented, true);
  assert.strictEqual(summary.expressMountScope, INTERNAL_FAIL_CLOSED_SCOPE);
  assert.strictEqual(summary.oroplayInternalCallbackRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMounted, true);
  assert.strictEqual(summary.oroplayTransactionRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.oroplayTransactionRouteMode, FAIL_CLOSED_NO_MUTATION);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresPostMountValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.routeMountImplementationBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assertHeldGates(summary);
  assertResultHasNoSensitiveFields(summary);
}

function main() {
  assert.strictEqual(typeof ORO5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro5nRouteMountImplementationBoundary, "function");
  assert.strictEqual(typeof validateOro5nRouteMountImplementationBoundary, "function");
  assert.strictEqual(typeof buildOro5nSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5nNoPublicAlias, "function");
  assert.strictEqual(typeof assertOro5nNoRuntimeMoneyMutation, "function");

  assertDocsAndRegistration();
  assertAppMount();
  assertFailClosedRoutePreserved();
  assertNoUnsafeRuntimeText();
  assertChangedFilesStaticSafety();

  const happy = buildOro5nRouteMountImplementationBoundary(
    happyPathInternalFailClosedMountFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5nNoPublicAlias(happy), true);
  assert.strictEqual(assertOro5nNoRuntimeMoneyMutation(happy), true);

  assertHeld(
    buildOro5nRouteMountImplementationBoundary(missingAuthorizationFixture),
    "ORO-5M authorization decision is required"
  );
  assertHeld(
    buildOro5nRouteMountImplementationBoundary(publicAliasAttemptRejectedFixture),
    "public aliases must not be requested"
  );
  assertHeld(
    buildOro5nRouteMountImplementationBoundary(runtimeTrafficAttemptRejectedFixture),
    "runtime traffic must not be requested"
  );
  assertHeld(
    buildOro5nRouteMountImplementationBoundary(walletMutationAttemptRejectedFixture),
    "wallet and ledger mutation must not be requested"
  );
  assertHeld(
    buildOro5nRouteMountImplementationBoundary(
      controllerBehaviorChangeAttemptRejectedFixture
    ),
    "route/controller behavior change must not be requested"
  );

  const validation = validateOro5nRouteMountImplementationBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5nSafetyLockSummary();
  assert.strictEqual(safety.publicAliasImplemented, false);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports =
    buildOro5nRouteMountImplementationBoundaryFixtures().map(
      buildOro5nRouteMountImplementationBoundary
    );
  assert(allReports.length >= 6, "fixture set must cover ORO-5N required cases.");
  for (const report of allReports) {
    assertHeldGates(report);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-5N route mount implementation boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5N route mount implementation boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
