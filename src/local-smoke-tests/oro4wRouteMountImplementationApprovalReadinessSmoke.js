"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro4wRouteMountImplementationApprovalReadiness");
const fixtures = require("../game-provider-mock/oro4wRouteMountImplementationApprovalReadinessFixtures");
const oro4v = require("../game-provider-mock/oro4vRouteMountApprovalBoundary");

const {
  IMPLEMENTATION_READINESS_RECORDED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS,
  PASS,
  STATIC_INTERNAL_METADATA_ONLY,
  buildOro4wRouteMountImplementationApprovalInput,
  buildOro4wRouteMountImplementationApprovalSummary,
  buildOro4wSeparateImplementationApprovalGate,
  evaluateOro4wRouteMountImplementationApprovalReadiness,
  validateOro4wRouteMountImplementationApprovalReadiness,
} = helper;

const {
  attemptedDbTransactionFixture,
  attemptedExternalNetworkFixture,
  attemptedLedgerMutationFixture,
  attemptedMigrationFixture,
  attemptedPrismaWriteFixture,
  attemptedRouteControllerRuntimeChangeFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro4wRouteMountImplementationApprovalFixtures,
  expressMountAllowedTrueFixture,
  expressMountImplementedTrueFixture,
  happyPathReadinessRecordedMountNotImplementedFixture,
  missingOro4vApprovalBoundaryFixture,
  oro4vApprovalBoundaryFailedFixture,
  publicAliasAllowedTrueFixture,
  readinessCorrectlyRequiresNextExplicitApprovalFixture,
  readinessIncorrectlyTreatedAsImplementationApprovalFixture,
  routeMountAuthorizationAccidentallyAuthorizedFixture,
  runtimeTrafficAllowedTrueFixture,
  secretShapedOutputFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_READINESS.md";
const ORO4V_DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4wSmoke.js";
const SCRIPT = "smoke:oro-4w";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4V_DOC,
  "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadiness.js",
  "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadinessFixtures.js",
  "src/local-smoke-tests/oro4wRouteMountImplementationApprovalReadinessSmoke.js",
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
    assert(!serialized.includes(marker), `summary leaked sensitive field marker ${marker}.`);
  }
}

function assertNoActiveRouteMountInApp() {
  const app = readRequired("src/app.js");
  for (const route of [
    "/api/oroplay/balance",
    "/api/oroplay/transaction",
    "/api/balance",
    "/api/transaction",
  ]) {
    assert(!app.includes(route), `src/app.js must not contain ${route}.`);
  }
}

function assertNoRuntimeImplementationText() {
  const helperText = readRequired(
    "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadiness.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro4wRouteMountImplementationApprovalReadinessFixtures.js"
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
    assert(!combined.includes(marker), `ORO-4W files must not contain ${marker}.`);
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
    "## ORO-4W scope",
    "## Input from ORO-4V",
    "## Implementation approval readiness rules",
    "## Separate implementation approval gate",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4V route mount approval boundary has been recorded",
    "ORO-4W prepares a separate implementation approval readiness boundary",
    "ORO-4W does not edit src/app.js",
    "ORO-4W does not mount Express route",
    "ORO-4W does not enable public alias",
    "ORO-4W does not allow runtime traffic",
    "ORO-4W does not mutate wallet/ledger",
    "ORO-4W does not write Prisma/DB",
    "ORO-4W does not call live OroPlay API",
    "ORO-4W does not authorize real route mount execution",
    "routeMountAuthorization remains not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro4vDoc = readRequired(ORO4V_DOC);
  for (const marker of [
    "ORO-4V route mount approval boundary",
    "routeMountAuthorization remains not_authorized_for_mount",
    "ORO-4W implementation approval readiness",
  ]) {
    assert(oro4vDoc.includes(marker), `${ORO4V_DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4w"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4W implementation approval readiness",
        "ORO-4W separate implementation approval gate",
        "nextPhaseRequiresExplicitImplementationApproval=true",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4W Current",
        "implementation approval readiness recorded",
        "nextPhaseRequiresSeparateExecutionApproval=true",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4W implementation approval readiness",
        "ORO-4W separate implementation approval gate",
        "smoke:oro-4w",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4W Route Mount Implementation Approval Readiness Coverage",
        SCRIPT,
        "implementation approval readiness recorded",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertOro4vApprovalBoundary() {
  const summary = oro4v.evaluateOro4vRouteMountApprovalBoundary();
  assert.strictEqual(summary.routeMountApprovalBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-4W");
  assert.strictEqual(summary.implementationApprovalReadinessResult, PASS);
  assert.strictEqual(summary.implementationApprovalReadinessRecorded, true);
  assert.strictEqual(summary.implementationApprovalStatus, IMPLEMENTATION_READINESS_RECORDED);
  assert.strictEqual(summary.implementationApprovalGranted, false);
  assert.strictEqual(summary.implementationApprovalReadinessMode, STATIC_INTERNAL_METADATA_ONLY);
  assert.strictEqual(summary.oro4vApprovalBoundaryRecorded, true);
  assert.strictEqual(summary.routeMountApprovalBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.srcAppJsEditAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.nextPhaseRequiresExplicitImplementationApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateExecutionApproval, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.implementationApprovalReadinessResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.implementationApprovalGranted, false);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro4wRouteMountImplementationApprovalFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathReadinessRecordedMountNotImplementedFixture",
    "missingOro4vApprovalBoundaryFixture",
    "oro4vApprovalBoundaryFailedFixture",
    "routeMountAuthorizationAccidentallyAuthorizedFixture",
    "expressMountAllowedTrueFixture",
    "expressMountImplementedTrueFixture",
    "publicAliasAllowedTrueFixture",
    "runtimeTrafficAllowedTrueFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedRouteControllerRuntimeChangeFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedDbTransactionFixture",
    "attemptedMigrationFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "readinessIncorrectlyTreatedAsImplementationApprovalFixture",
    "readinessCorrectlyRequiresNextExplicitApprovalFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_4W_ROUTE_MOUNT_IMPLEMENTATION_APPROVAL_STATUS, "object");
  assert.strictEqual(typeof buildOro4wRouteMountImplementationApprovalInput, "function");
  assert.strictEqual(
    typeof evaluateOro4wRouteMountImplementationApprovalReadiness,
    "function"
  );
  assert.strictEqual(typeof buildOro4wSeparateImplementationApprovalGate, "function");
  assert.strictEqual(typeof buildOro4wRouteMountImplementationApprovalSummary, "function");
  assert.strictEqual(
    typeof validateOro4wRouteMountImplementationApprovalReadiness,
    "function"
  );

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertOro4vApprovalBoundary();
  assertNoActiveRouteMountInApp();
  assertNoRuntimeImplementationText();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4wRouteMountImplementationApprovalReadiness(
    happyPathReadinessRecordedMountNotImplementedFixture
  ));
  assertHappyPath(buildOro4wRouteMountImplementationApprovalSummary(
    readinessCorrectlyRequiresNextExplicitApprovalFixture
  ));

  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(missingOro4vApprovalBoundaryFixture),
    "ORO-4V approval boundary is required"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(oro4vApprovalBoundaryFailedFixture),
    "ORO-4V route mount approval boundary result must be PASS"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(
      routeMountAuthorizationAccidentallyAuthorizedFixture
    ),
    "route mount authorization must remain not authorized"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(expressMountAllowedTrueFixture),
    "Express mount must remain not allowed"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(expressMountImplementedTrueFixture),
    "Express mount must remain not implemented"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(publicAliasAllowedTrueFixture),
    "public alias must remain not allowed"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(runtimeTrafficAllowedTrueFixture),
    "runtime traffic must remain not allowed"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedSrcAppJsEditFixture),
    "readiness must not edit src/app.js"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(
      attemptedRouteControllerRuntimeChangeFixture
    ),
    "readiness must not change runtime route or controller"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedWalletMutationFixture),
    "readiness must not try wallet mutation"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedLedgerMutationFixture),
    "readiness must not try ledger mutation"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedPrismaWriteFixture),
    "readiness must not try Prisma write"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedDbTransactionFixture),
    "readiness must not try DB transaction"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedMigrationFixture),
    "readiness must not try migration"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(attemptedExternalNetworkFixture),
    "readiness must not try external network"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(secretShapedOutputFixture),
    "readiness output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro4wRouteMountImplementationApprovalReadiness(
      readinessIncorrectlyTreatedAsImplementationApprovalFixture
    ),
    "readiness must not grant implementation execution directly"
  );

  const gate = buildOro4wSeparateImplementationApprovalGate();
  assert.strictEqual(gate.implementationApprovalReadinessRecorded, true);
  assert.strictEqual(gate.implementationApprovalGranted, false);
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);

  const validation = validateOro4wRouteMountImplementationApprovalReadiness();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4wRouteMountImplementationApprovalFixtures().map(
    evaluateOro4wRouteMountImplementationApprovalReadiness
  );
  assert(allReports.length >= 19, "fixture set must cover ORO-4W required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.implementationApprovalGranted, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.expressMountImplemented, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.walletMutationAllowed, false);
    assert.strictEqual(report.ledgerMutationAllowed, false);
    assert.strictEqual(report.prismaWriteAllowed, false);
    assert.strictEqual(report.dbTransactionAllowed, false);
    assert.strictEqual(report.migrationAllowed, false);
    assert.strictEqual(report.externalNetworkAllowed, false);
    assert.strictEqual(report.nextPhaseRequiresExplicitImplementationApproval, true);
    assert.strictEqual(report.nextPhaseRequiresSeparateExecutionApproval, true);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4W implementation approval readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4W implementation approval readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
