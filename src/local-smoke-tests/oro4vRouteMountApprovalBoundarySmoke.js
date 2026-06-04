"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro4vRouteMountApprovalBoundary");
const fixtures = require("../game-provider-mock/oro4vRouteMountApprovalBoundaryFixtures");

const {
  APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED,
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4V_ROUTE_MOUNT_APPROVAL_STATUS,
  PASS,
  STATIC_INTERNAL_METADATA_ONLY,
  buildOro4vExpressMountAuthorizationGate,
  buildOro4vRouteMountApprovalInput,
  buildOro4vRouteMountApprovalSummary,
  evaluateOro4vRouteMountApprovalBoundary,
  validateOro4vRouteMountApprovalBoundary,
} = helper;

const {
  approvalBoundaryRecordedSeparateImplementationRequiredFixture,
  attemptedExpressMountAuthorizationFixture,
  attemptedExpressMountImplementationFixture,
  attemptedExternalNetworkFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedSrcAppJsEditFixture,
  attemptedWalletMutationFixture,
  buildOro4vRouteMountApprovalFixtures,
  happyPathApprovalBoundaryRecordedMountNotImplementedFixture,
  missingApprovalTimestampFixture,
  missingOro4tRequestSubmissionFixture,
  missingOro4uFinalDecisionFixture,
  missingPrivateArtifactHashRegistryFixture,
  missingRouteMountReviewerFixture,
  missingSignedApprovalRecordFixture,
  secretShapedOutputFixture,
  staleApprovalTimestampFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4V_ROUTE_MOUNT_APPROVAL_BOUNDARY.md";
const ORO4U_DOC = "docs/ORO_4U_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4vSmoke.js";
const SCRIPT = "smoke:oro-4v";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  ORO4U_DOC,
  "src/game-provider-mock/oro4vRouteMountApprovalBoundary.js",
  "src/game-provider-mock/oro4vRouteMountApprovalBoundaryFixtures.js",
  "src/local-smoke-tests/oro4vRouteMountApprovalBoundarySmoke.js",
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

function assertChangedFilesStaticSafety() {
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];
  const fullShaPattern = /\b[0-9a-fA-F]{64}\b/;

  for (const file of STATIC_SAFETY_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    assert(!fullShaPattern.test(text), `${file} contains full SHA256 literal.`);
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## ORO-4V scope",
    "## Input from ORO-4U",
    "## Separate route mount approval rules",
    "## Explicit Express mount authorization gate",
    "## Approval result contract",
    "## No actual Express mount boundary",
    "## Public alias boundary",
    "## Runtime traffic boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "ORO-4U final decision has been recorded",
    "ORO-4V creates a separate route mount approval boundary",
    "ORO-4V does not edit src/app.js",
    "ORO-4V does not mount Express route",
    "ORO-4V does not enable public alias",
    "ORO-4V does not allow runtime traffic",
    "ORO-4V does not mutate wallet/ledger",
    "ORO-4V does not write Prisma/DB",
    "future actual mount requires a separate implementation phase",
    "routeMountAuthorization remains not_authorized_for_mount",
    "expressMountAllowed = false",
    "expressMountImplemented = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const oro4u = readRequired(ORO4U_DOC);
  for (const marker of [
    "finalPreMountAuthorizationDecisionIssued = true",
    "routeMountAuthorization = not_authorized_for_mount",
    "ORO-4V follow-up",
  ]) {
    assert(oro4u.includes(marker), `${ORO4U_DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4v"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4V route mount approval boundary",
        "routeMountAuthorization=not_authorized_for_mount",
        "expressMountAllowed=false",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4V Current",
        "approval boundary recorded but mount not implemented",
        "nextPhaseRequiresSeparateImplementationApproval=true",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4V route mount approval boundary",
        "ORO-4V current/local pending",
        "smoke:oro-4v",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4V Route Mount Approval Boundary Coverage",
        SCRIPT,
        "approval boundary recorded but mount not implemented",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-4V");
  assert.strictEqual(summary.routeMountApprovalBoundaryResult, PASS);
  assert.strictEqual(summary.routeMountApprovalBoundaryPresent, true);
  assert.strictEqual(summary.approvalBoundaryStaticInternalMetadataOnly, true);
  assert.strictEqual(
    summary.routeMountApprovalStatus,
    APPROVAL_BOUNDARY_RECORDED_MOUNT_NOT_IMPLEMENTED
  );
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.mountAuthorizationRequestSubmitted, true);
  assert.strictEqual(summary.signedApprovalRecordPresent, true);
  assert.strictEqual(summary.ownerSignedApprovalArtifactPrivateHashRegistered, true);
  assert.strictEqual(summary.routeMountReviewerPresent, true);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.srcAppJsEditAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.separateImplementationPhaseRequired, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateImplementationApproval, true);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.routeMountApprovalBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.expressMountImplemented, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assertResultHasNoSensitiveFields(summary);
}

function assertFixtureCoverage() {
  const allFixtures = buildOro4vRouteMountApprovalFixtures();
  const ids = new Set(allFixtures.map((entry) => entry.id));
  for (const id of [
    "happyPathApprovalBoundaryRecordedMountNotImplementedFixture",
    "missingOro4uFinalDecisionFixture",
    "missingOro4tRequestSubmissionFixture",
    "missingSignedApprovalRecordFixture",
    "missingPrivateArtifactHashRegistryFixture",
    "missingRouteMountReviewerFixture",
    "missingApprovalTimestampFixture",
    "attemptedSrcAppJsEditFixture",
    "attemptedExpressMountImplementationFixture",
    "attemptedPublicAliasAuthorizationFixture",
    "attemptedRuntimeTrafficAuthorizationFixture",
    "attemptedWalletMutationFixture",
    "attemptedLedgerMutationFixture",
    "attemptedPrismaWriteFixture",
    "attemptedExternalNetworkFixture",
    "secretShapedOutputFixture",
    "staleApprovalTimestampFixture",
    "approvalBoundaryRecordedSeparateImplementationRequiredFixture",
  ]) {
    assert(ids.has(id), `fixture set missing ${id}.`);
  }
}

function main() {
  assert.strictEqual(typeof ORO_4V_ROUTE_MOUNT_APPROVAL_STATUS, "object");
  assert.strictEqual(typeof buildOro4vRouteMountApprovalInput, "function");
  assert.strictEqual(typeof evaluateOro4vRouteMountApprovalBoundary, "function");
  assert.strictEqual(typeof buildOro4vExpressMountAuthorizationGate, "function");
  assert.strictEqual(typeof buildOro4vRouteMountApprovalSummary, "function");
  assert.strictEqual(typeof validateOro4vRouteMountApprovalBoundary, "function");

  assertDocsAndRegistration();
  assertFixtureCoverage();
  assertNoActiveRouteMountInApp();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4vRouteMountApprovalBoundary(
    happyPathApprovalBoundaryRecordedMountNotImplementedFixture
  ));
  assertHappyPath(buildOro4vRouteMountApprovalSummary(
    approvalBoundaryRecordedSeparateImplementationRequiredFixture
  ));

  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingOro4uFinalDecisionFixture),
    "ORO-4U final decision is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingOro4tRequestSubmissionFixture),
    "ORO-4T mount request submission is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingSignedApprovalRecordFixture),
    "signed approval record is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingPrivateArtifactHashRegistryFixture),
    "private artifact hash registry is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingRouteMountReviewerFixture),
    "route mount reviewer is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(missingApprovalTimestampFixture),
    "approval timestamp is required"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedSrcAppJsEditFixture),
    "approval must not edit src/app.js"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedExpressMountAuthorizationFixture),
    "approval must not authorize Express mount directly"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedExpressMountImplementationFixture),
    "approval must not implement Express mount"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedPublicAliasAuthorizationFixture),
    "approval must not enable public alias"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedRuntimeTrafficAuthorizationFixture),
    "approval must not enable runtime traffic"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedWalletMutationFixture),
    "approval must not try wallet mutation"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedLedgerMutationFixture),
    "approval must not try ledger mutation"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedPrismaWriteFixture),
    "approval must not try Prisma write"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(attemptedExternalNetworkFixture),
    "approval must not try external network"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(secretShapedOutputFixture),
    "approval output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro4vRouteMountApprovalBoundary(staleApprovalTimestampFixture),
    "approval timestamp must be after ORO-4U final decision"
  );

  const gate = buildOro4vExpressMountAuthorizationGate();
  assert.strictEqual(gate.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(gate.expressMountAllowed, false);
  assert.strictEqual(gate.expressMountImplemented, false);
  assert.strictEqual(gate.publicAliasAllowed, false);
  assert.strictEqual(gate.runtimeTrafficAllowed, false);
  assert.strictEqual(gate.separateImplementationPhaseRequired, true);

  const validation = validateOro4vRouteMountApprovalBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4vRouteMountApprovalFixtures().map(
    evaluateOro4vRouteMountApprovalBoundary
  );
  assert(allReports.length >= 18, "fixture set must cover ORO-4V required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.expressMountImplemented, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.walletMutationAllowed, false);
    assert.strictEqual(report.ledgerMutationAllowed, false);
    assert.strictEqual(report.prismaWriteAllowed, false);
    assert.strictEqual(report.externalNetworkAllowed, false);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4V route mount approval boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4V route mount approval boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
