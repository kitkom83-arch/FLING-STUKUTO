"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundaryFixtures");

const {
  NOT_AUTHORIZED_FOR_MOUNT,
  ORO_4U_FINAL_PRE_MOUNT_DECISION_STATUS,
  PASS,
  STATIC_INTERNAL_METADATA_ONLY,
  buildOro4uDecisionSummary,
  buildOro4uFinalPreMountDecisionInput,
  buildOro4uRouteMountAuthorizationDecision,
  evaluateOro4uFinalPreMountAuthorizationDecision,
  validateOro4uFinalPreMountDecisionBoundary,
} = helper;

const {
  attemptedExpressMountAuthorizationFixture,
  attemptedLedgerMutationFixture,
  attemptedPrismaWriteFixture,
  attemptedPublicAliasAuthorizationFixture,
  attemptedRuntimeTrafficAuthorizationFixture,
  attemptedWalletMutationFixture,
  buildOro4uFinalPreMountDecisionFixtures,
  externalNetworkAttemptFixture,
  finalDecisionIssuedSeparateRouteApprovalRequiredFixture,
  happyPathDecisionRecordedMountNotAuthorizedFixture,
  missingDecisionTimestampFixture,
  missingOro4tRequestSubmissionFixture,
  missingPrivateArtifactHashRegistryFixture,
  missingReviewerFixture,
  missingSignedApprovalRecordFixture,
  secretShapedOutputFixture,
  staleDecisionTimestampFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_4U_FINAL_PRE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro4uSmoke.js";
const SCRIPT = "smoke:oro-4u";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  "src/game-provider-mock/oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundary.js",
  "src/game-provider-mock/oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundaryFixtures.js",
  "src/local-smoke-tests/oroplayCallbackStagingRouteFinalPreMountAuthorizationDecisionBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "docs/API_MAPPING.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_FINAL_DECISION_REVIEW_BOUNDARY.md",
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
    "## ORO-4U scope",
    "## Input from ORO-4T",
    "## Final pre-mount authorization decision rules",
    "## Decision result contract",
    "## Route mount authorization boundary",
    "## Explicit no-mount boundary",
    "## Safety boundary",
    "## Required evidence checks",
    "## Failure / hold decisions",
    "## Next phase requirements",
    "finalPreMountAuthorizationDecisionPrepared = true",
    "finalPreMountAuthorizationDecisionIssued = true",
    "static/internal metadata only",
    "final decision does not automatically mount route",
    "separate route mount approval is still required",
    "routeMountAuthorization remains not_authorized_for_mount",
    "expressMountAllowed = false",
    "publicAliasAllowed = false",
    "runtimeTrafficAllowed = false",
    "no src/app.js change",
    "no Express mount",
    "no wallet/ledger mutation",
    "no Prisma write",
    "no live OroPlay API call",
    "no real money",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro4u"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4U final pre-mount decision boundary",
        "finalPreMountAuthorizationDecisionIssued=true",
        "routeMountAuthorization=not_authorized_for_mount",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4U Current",
        "decision recorded but mount still not authorized",
        "separate route mount approval remains required",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4U: final pre-mount decision boundary",
        "ORO-4U current/local pending",
        "not authorized for mount",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4U Final Pre-Mount Decision Boundary Coverage",
        SCRIPT,
        "static/internal metadata only",
      ],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_FINAL_DECISION_REVIEW_BOUNDARY.md",
      [
        "ORO-4U follow-up boundary",
        "final decision may be issued only as static/internal metadata",
        "route mount remains blocked without separate approval",
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
  assert.strictEqual(summary.phase, "ORO-4U");
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionBoundaryResult, PASS);
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionIssued, true);
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionIssuedMode, STATIC_INTERNAL_METADATA_ONLY);
  assert.strictEqual(summary.finalDecisionStaticInternalMetadataOnly, true);
  assert.strictEqual(summary.mountAuthorizationRequestSubmitted, true);
  assert.strictEqual(summary.mountAuthorizationRequestSubmissionMode, STATIC_INTERNAL_METADATA_ONLY);
  assert.strictEqual(summary.externalMountAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.ownerSignedApprovalArtifactPrivateHashRegistered, true);
  assert.strictEqual(summary.signedApprovalRecordPresent, true);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.separateRouteMountApprovalRequired, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateAuthorization, true);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoUndefinedOrNan(summary);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.finalPreMountAuthorizationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(summary.expressMountAllowed, false);
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assertResultHasNoSensitiveFields(summary);
}

function main() {
  assert.strictEqual(typeof ORO_4U_FINAL_PRE_MOUNT_DECISION_STATUS, "object");
  assert.strictEqual(typeof buildOro4uFinalPreMountDecisionInput, "function");
  assert.strictEqual(typeof evaluateOro4uFinalPreMountAuthorizationDecision, "function");
  assert.strictEqual(typeof buildOro4uRouteMountAuthorizationDecision, "function");
  assert.strictEqual(typeof buildOro4uDecisionSummary, "function");
  assert.strictEqual(typeof validateOro4uFinalPreMountDecisionBoundary, "function");

  assertDocsAndRegistration();
  assertNoActiveRouteMountInApp();
  assertChangedFilesStaticSafety();

  assertHappyPath(evaluateOro4uFinalPreMountAuthorizationDecision(
    happyPathDecisionRecordedMountNotAuthorizedFixture
  ));
  assertHappyPath(buildOro4uDecisionSummary(
    finalDecisionIssuedSeparateRouteApprovalRequiredFixture
  ));

  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(missingOro4tRequestSubmissionFixture),
    "mount authorization request submission is required"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(missingSignedApprovalRecordFixture),
    "signed approval record is required"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(missingPrivateArtifactHashRegistryFixture),
    "private artifact hash registry is required"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(missingReviewerFixture),
    "final decision reviewer is required"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(missingDecisionTimestampFixture),
    "final decision timestamp is required"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedExpressMountAuthorizationFixture),
    "decision must not authorize Express mount directly"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedPublicAliasAuthorizationFixture),
    "decision must not enable public alias"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedRuntimeTrafficAuthorizationFixture),
    "decision must not enable runtime traffic"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedWalletMutationFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.walletMutationAllowed"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedLedgerMutationFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.ledgerMutationAllowed"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(attemptedPrismaWriteFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.prismaWriteAllowed"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(externalNetworkAttemptFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.externalNetworkAttempted"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(secretShapedOutputFixture),
    "decision output contains secret-shaped marker"
  );
  assertHeld(
    evaluateOro4uFinalPreMountAuthorizationDecision(staleDecisionTimestampFixture),
    "final decision timestamp must be after request submission"
  );

  const routeDecision = buildOro4uRouteMountAuthorizationDecision();
  assert.strictEqual(routeDecision.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(routeDecision.expressMountAllowed, false);
  assert.strictEqual(routeDecision.publicAliasAllowed, false);
  assert.strictEqual(routeDecision.runtimeTrafficAllowed, false);
  assert.strictEqual(routeDecision.separateRouteMountApprovalRequired, true);

  const validation = validateOro4uFinalPreMountDecisionBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const allReports = buildOro4uFinalPreMountDecisionFixtures().map(
    evaluateOro4uFinalPreMountAuthorizationDecision
  );
  assert(allReports.length >= 16, "fixture set must cover ORO-4U required cases.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.walletMutationAllowed, false);
    assert.strictEqual(report.ledgerMutationAllowed, false);
    assert.strictEqual(report.prismaWriteAllowed, false);
    assert.strictEqual(report.externalNetworkAllowed, false);
    assertResultHasNoSensitiveFields(report);
  }

  console.log("ORO-4U final pre-mount decision boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4U final pre-mount decision boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
