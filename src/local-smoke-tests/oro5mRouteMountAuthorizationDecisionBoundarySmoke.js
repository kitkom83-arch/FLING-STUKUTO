"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundaryFixtures");

const {
  APPROVED,
  AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  DECISION_ISSUED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_STATUS,
  PASS,
  PENDING_DECISION,
  ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
  buildOro5mRouteMountAuthorizationDecisionInput,
  evaluateOro5mRouteMountAuthorizationDecision,
  buildOro5mRouteMountAuthorizationDecisionRecord,
  buildOro5mRouteMountImplementationStillHeldGate,
  buildOro5mExpressMountStillHeldGate,
  buildOro5mPublicAliasStillHeldGate,
  buildOro5mRuntimeTrafficStillHeldGate,
  buildOro5mRouteMountAuthorizationDecisionSummary,
  validateOro5mRouteMountAuthorizationDecision,
} = helper;

const {
  buildOro5mRouteMountAuthorizationDecisionFixtures,
  dbTransactionAllowedUnexpectedlyFixture,
  decisionAlreadyIssuedFixture,
  expressMountAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  happyPathRouteMountAuthorizationDecisionFixture,
  implementationAlreadyAuthorizedUnexpectedlyFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  missingOro5lRequestFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  requestEvidenceMissingFixture,
  requestNotSubmittedFixture,
  requestWrongStatusFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountAlreadyGrantedFixture,
  routePatchAlreadyImplementedUnexpectedlyFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  srcAppChangedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  wrongRequestScopeFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md";
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
const WRAPPER = "src/local-smoke-tests/oro5mSmoke.js";
const SCRIPT = "smoke:oro-5m";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO5L_DOC,
  ORO5K_DOC,
  ORO5J_DOC,
  ORO5I_DOC,
  ORO5H_DOC,
  "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oro5mRouteMountAuthorizationDecisionBoundarySmoke.js",
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

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "summary must not include undefined.");
  assert(!serialized.includes("NaN"), "summary must not include NaN.");
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

function assertNoSrcAppJsEditMarkers() {
  const app = readRequired("src/app.js");
  for (const marker of [
    "ORO-5M",
    "oro5m",
    "routeMountAuthorizationDecisionBoundary",
  ]) {
    assert(!app.includes(marker), `src/app.js must not include ${marker}.`);
  }
}

function assertOro5sPublicAliasWiringOnly() {
  const app = readRequired("src/app.js");
  for (const marker of [
    'handleOroplayBalanceStub,',
    'handleOroplayTransactionStub,',
    "app.post('/api/balance', handleOroplayBalanceStub);",
    "app.post('/api/transaction', handleOroplayTransactionStub);",
    'app.use("/api/oroplay", oroplayCallbackStubRoutes);',
  ]) {
    assert(app.includes(marker), `src/app.js missing ORO-5S fail-closed marker ${marker}.`);
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
  ]) {
    assert(!app.includes(marker), `src/app.js contains unsafe ORO-5S alias marker ${marker}.`);
  }
}

function assertNoActiveRouteMountInApp() {
  assertOro5sPublicAliasWiringOnly();
}

function assertNoRuntimeImplementationText() {
  const helperText = readRequired(
    "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5mRouteMountAuthorizationDecisionBoundaryFixtures.js"
  );
  const combined = `${helperText}\n${fixtureText}`;
  for (const marker of [
    "app.use(",
    "express.Router",
    "router.post",
    "PrismaClient",
    "prisma.",
    "fetch(",
    "http.request",
    "https.request",
  ]) {
    assert(!combined.includes(marker), `ORO-5M files must not contain ${marker}.`);
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

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## ORO-5M scope",
    "## Input from ORO-5L",
    "## Route mount authorization decision rules",
    "## Decision issued / implementation still held boundary",
    "## Route mount implementation still held gate",
    "## No Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Wallet / ledger / Prisma write boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-5L submitted route mount authorization request",
    "ORO-5M issues route mount authorization decision only",
    "ORO-5M may grant permission to proceed to a future route mount implementation boundary",
    "routeMountAuthorizationDecisionBoundaryEntered = true",
    "routeMountAuthorizationDecisionChecked = true",
    "routeMountAuthorizationDecisionIssued = true",
    "routeMountAuthorizationDecisionStatus = decision_issued",
    "routeMountAuthorizationDecisionResult = approved",
    "routeMountAuthorizationGranted = true",
    "routeMountAuthorizationGrantScope = route_mount_implementation_boundary_only",
    "routeMountAuthorization = authorized_for_route_mount_implementation_boundary_only",
    "routeMountImplementationBoundaryEntryAllowed = true",
    "routeMountPatchImplemented = false",
    "expressMountAllowed = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "walletMutationAllowed = false",
    "prismaWriteAllowed = false",
    "liveOroPlayApiCallAllowed = false",
    "nextPhaseRequiresRouteMountImplementationBoundary = true",
    "nextPhaseRequiresSeparatePublicAliasApproval = true",
    "nextPhaseRequiresSeparateRuntimeTrafficApproval = true",
    "nextPhaseRequiresPostMountValidationBoundary = true",
    "nextPhaseRequiresSeparateLiveTrafficApproval = true",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5m", "oro-5m"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-5M route mount authorization decision",
        "ORO-5M issues route mount authorization decision",
        "ORO-5M grants only permission to proceed to route mount implementation boundary",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5M Current",
        "ORO-5M issues route mount authorization decision",
        "routeMountAuthorizationDecisionStatus=decision_issued",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5M current/local pending route mount authorization decision",
        "ORO-5L closed",
        SCRIPT,
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5M Route Mount Authorization Decision Coverage",
        SCRIPT,
        "decision issued / implementation still held",
      ],
    ],
    [ORO5L_DOC, ["ORO-5M issues route mount authorization decision"]],
    [ORO5K_DOC, ["ORO-5M issues route mount authorization decision"]],
    [ORO5J_DOC, ["ORO-5M issues route mount authorization decision"]],
    [ORO5I_DOC, ["ORO-5M issues route mount authorization decision"]],
    [ORO5H_DOC, ["ORO-5M issues route mount authorization decision"]],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertStillHeldGates(summary) {
  assert.strictEqual(summary.routeMountPatchImplemented, false);
  assert.strictEqual(summary.runtimeActualPatchImplementationImplemented, false);
  assert.strictEqual(summary.srcAppChanged, false);
  assert.strictEqual(summary.runtimeRoutePatched, false);
  assert.strictEqual(summary.runtimeRouteControllerChanged, false);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
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

function assertNextPhaseFlags(summary) {
  assert.strictEqual(summary.nextPhaseRequiresRouteMountImplementationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresPostMountValidationBoundary, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5M");
  assert.strictEqual(summary.routeMountAuthorizationDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountAuthorizationDecisionBoundaryEntered, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionChecked, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.routeMountAuthorizationDecisionStatus, DECISION_ISSUED);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, APPROVED);
  assert.strictEqual(summary.routeMountAuthorizationGranted, true);
  assert.strictEqual(
    summary.routeMountAuthorizationGrantScope,
    ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
  );
  assert.strictEqual(
    summary.routeMountAuthorization,
    AUTHORIZED_FOR_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
  );
  assert.strictEqual(summary.routeMountAuthorizationRequestStatus, DECISION_ISSUED);
  assert.strictEqual(summary.routeMountAuthorizationRequestResult, APPROVED);
  assert.strictEqual(summary.routeMountAuthorizationRequestResolved, true);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, true);
  assert.strictEqual(
    summary.routeMountPatchImplementationAuthorizationScope,
    ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
  );
  assert.strictEqual(summary.routeMountImplementationBoundaryEntryAllowed, true);
  assert.strictEqual(
    summary.routeMountImplementationBoundaryEntryScope,
    ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY
  );
  assertStillHeldGates(summary);
  assertNextPhaseFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.routeMountAuthorizationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.routeMountAuthorizationDecisionResult, PENDING_DECISION);
  assert.strictEqual(summary.routeMountAuthorizationGranted, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.routeMountPatchImplementationAuthorized, false);
  assert.strictEqual(summary.routeMountImplementationBoundaryEntryAllowed, false);
  assertStillHeldGates(summary);
  assertNextPhaseFlags(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro5mRouteMountAuthorizationDecisionFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathRouteMountAuthorizationDecisionFixture",
    "missingOro5lRequestFixture",
    "requestNotSubmittedFixture",
    "requestWrongStatusFixture",
    "wrongRequestScopeFixture",
    "requestEvidenceMissingFixture",
    "decisionAlreadyIssuedFixture",
    "routeMountAlreadyGrantedFixture",
    "implementationAlreadyAuthorizedUnexpectedlyFixture",
    "routePatchAlreadyImplementedUnexpectedlyFixture",
    "runtimeActualImplementationAlreadyImplementedFixture",
    "runtimeRoutePatchedUnexpectedlyFixture",
    "srcAppChangedUnexpectedlyFixture",
    "routeControllerChangedUnexpectedlyFixture",
    "expressMountAllowedUnexpectedlyFixture",
    "publicAliasAllowedUnexpectedlyFixture",
    "runtimeTrafficAllowedUnexpectedlyFixture",
    "walletMutationAllowedUnexpectedlyFixture",
    "ledgerMutationAllowedUnexpectedlyFixture",
    "prismaWriteAllowedUnexpectedlyFixture",
    "dbTransactionAllowedUnexpectedlyFixture",
    "migrationAllowedUnexpectedlyFixture",
    "externalNetworkAllowedUnexpectedlyFixture",
    "liveOroPlayApiCallAllowedUnexpectedlyFixture",
    "secretShapedOutputFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_STATUS, "object");
  assert.strictEqual(typeof buildOro5mRouteMountAuthorizationDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro5mRouteMountAuthorizationDecision, "function");
  assert.strictEqual(typeof buildOro5mRouteMountAuthorizationDecisionRecord, "function");
  assert.strictEqual(typeof buildOro5mRouteMountImplementationStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5mExpressMountStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5mPublicAliasStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5mRuntimeTrafficStillHeldGate, "function");
  assert.strictEqual(typeof buildOro5mRouteMountAuthorizationDecisionSummary, "function");
  assert.strictEqual(typeof validateOro5mRouteMountAuthorizationDecision, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoSrcAppJsEditMarkers();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(
    evaluateOro5mRouteMountAuthorizationDecision(
      happyPathRouteMountAuthorizationDecisionFixture
    )
  );

  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(missingOro5lRequestFixture),
    "ORO-5L request is required"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(requestNotSubmittedFixture),
    "route mount authorization request must be submitted"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(requestWrongStatusFixture),
    "route mount authorization request must be pending decision"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(wrongRequestScopeFixture),
    "route mount authorization request scope must be decision request only"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(requestEvidenceMissingFixture),
    "route mount authorization request evidence is required"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(decisionAlreadyIssuedFixture),
    "route mount authorization decision must not already be issued"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(routeMountAlreadyGrantedFixture),
    "route mount authorization must not already be granted"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(
      implementationAlreadyAuthorizedUnexpectedlyFixture
    ),
    "route mount implementation must not already be authorized"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(
      routePatchAlreadyImplementedUnexpectedlyFixture
    ),
    "route mount patch must not be implemented"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(
      runtimeActualImplementationAlreadyImplementedFixture
    ),
    "runtime actual patch implementation must not already be implemented"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(runtimeRoutePatchedUnexpectedlyFixture),
    "runtime route must not be patched"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(srcAppChangedUnexpectedlyFixture),
    "src/app.js must not be changed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(routeControllerChangedUnexpectedlyFixture),
    "runtime route or controller must not be changed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(expressMountAllowedUnexpectedlyFixture),
    "Express mount must remain not allowed or implemented"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(publicAliasAllowedUnexpectedlyFixture),
    "public alias must remain not allowed or implemented"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(runtimeTrafficAllowedUnexpectedlyFixture),
    "runtime traffic must remain not allowed or enabled"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(walletMutationAllowedUnexpectedlyFixture),
    "wallet mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(ledgerMutationAllowedUnexpectedlyFixture),
    "ledger mutation must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(prismaWriteAllowedUnexpectedlyFixture),
    "Prisma write must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(dbTransactionAllowedUnexpectedlyFixture),
    "DB transaction must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(migrationAllowedUnexpectedlyFixture),
    "migration must remain not allowed or performed"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(externalNetworkAllowedUnexpectedlyFixture),
    "external network must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(liveOroPlayApiCallAllowedUnexpectedlyFixture),
    "live OroPlay API call must remain not allowed or called"
  );
  assertHeld(
    evaluateOro5mRouteMountAuthorizationDecision(secretShapedOutputFixture),
    "route mount authorization decision input contains secret-shaped marker"
  );

  const record = buildOro5mRouteMountAuthorizationDecisionRecord();
  assert.strictEqual(record.routeMountAuthorizationDecisionIssued, true);
  assert.strictEqual(record.routeMountAuthorizationDecisionStatus, DECISION_ISSUED);
  assert.strictEqual(record.routeMountAuthorizationDecisionResult, APPROVED);
  assert.strictEqual(record.routeMountPatchImplementationAuthorized, true);

  const implementationGate = buildOro5mRouteMountImplementationStillHeldGate();
  assert.strictEqual(implementationGate.routeMountPatchImplemented, false);
  assert.strictEqual(implementationGate.srcAppChanged, false);

  const expressGate = buildOro5mExpressMountStillHeldGate();
  assert.strictEqual(expressGate.expressMountAllowed, false);

  const aliasGate = buildOro5mPublicAliasStillHeldGate();
  assert.strictEqual(aliasGate.publicAliasAllowed, false);

  const trafficGate = buildOro5mRuntimeTrafficStillHeldGate();
  assert.strictEqual(trafficGate.runtimeTrafficAllowed, false);
  assert.strictEqual(trafficGate.liveOroPlayApiCallAllowed, false);

  const validation = validateOro5mRouteMountAuthorizationDecision();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports =
    buildOro5mRouteMountAuthorizationDecisionFixtures().map(
      evaluateOro5mRouteMountAuthorizationDecision
    );
  assert(allReports.length >= 25, "fixture set must cover ORO-5M required cases.");
  for (const report of allReports) {
    const isPass = report.routeMountAuthorizationDecisionBoundaryResult === PASS;
    assert.strictEqual(report.routeMountAuthorizationDecisionIssued, isPass);
    assert.strictEqual(report.routeMountAuthorizationGranted, isPass);
    assert.strictEqual(report.routeMountPatchImplementationAuthorized, isPass);
    assertStillHeldGates(report);
    assertNextPhaseFlags(report);
    assertResultHasNoSensitiveFields(report);
  }

  assert.strictEqual(DECISION_ISSUED, "decision_issued");
  assert.strictEqual(APPROVED, "approved");
  assert.strictEqual(
    ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY_ONLY,
    "route_mount_implementation_boundary_only"
  );

  console.log("ORO-5M route mount authorization decision smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5M route mount authorization decision smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
