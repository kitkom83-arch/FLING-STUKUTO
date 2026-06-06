"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  LIVE_TRAFFIC_DECISION_STATUS,
  LIVE_TRAFFIC_REQUEST_STATUS,
  ORO5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  buildLiveTrafficAuthorizationRequest,
  buildOro5zLiveTrafficAuthorizationRequestSummary,
  validateLiveTrafficAuthorizationRequestBoundary,
  validateNoLiveTrafficEnabledDuringRequest,
  validateNoMutationDuringLiveTrafficRequest,
  validateOro5yPostEnablementValidationRecord,
} = helper;

const {
  buildOro5zLiveTrafficAuthorizationRequestFixtures,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  happyPathLiveTrafficAuthorizationRequestFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  missingHumanApprovalRequirementFixture,
  missingOro5yValidationRecordFixture,
  oro5yNotPassedFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5Z = "docs/ORO_5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_5Y =
  "docs/ORO_5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_5X = "docs/ORO_5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5zSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro5zLiveTrafficAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro5zLiveTrafficAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-5z";
const LONG_SCRIPT = "smoke:oro-5z-live-traffic-authorization-request-boundary";
const ORO5Z_SECRET_SCAN_FILES = Object.freeze([
  DOC_5Z,
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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const doc5z = readRequired(DOC_5Z);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-5Y",
    "## Live traffic authorization request boundary",
    "## No-live-enable statement",
    "## No-mutation statement",
    "## No external network and no live OroPlay call statement",
    "## Request output JSON",
    "## Rollback and blocker criteria",
    "next phase requires separate live traffic authorization decision",
    "liveTrafficAuthorizationRequestBoundaryResult = PASS",
    "dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary = true",
    "oro5yRuntimeTrafficPostEnablementValidationPassed = true",
    "runtimeTrafficModeFromOro5y = fail_closed_no_mutation",
    "liveTrafficAuthorizationRequestSubmitted = true",
    "liveTrafficAuthorizationDecisionIssued = false",
    "liveTrafficAllowed = false",
    "liveTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
  ]) {
    assert(doc5z.includes(marker), `${DOC_5Z} missing marker ${marker}.`);
  }

  const doc5y = readRequired(DOC_5Y);
  for (const marker of [
    "ORO-5Z is required for separate live traffic authorization request",
    "ORO-5Y does not approve live traffic",
  ]) {
    assert(doc5y.includes(marker), `${DOC_5Y} missing marker ${marker}.`);
  }

  const doc5x = readRequired(DOC_5X);
  for (const marker of [
    "runtime traffic remains fail_closed_no_mutation",
    "live traffic still requires separate request and decision",
  ]) {
    assert(doc5x.includes(marker), `${DOC_5X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5z", "oro-5z", DOC_5Z]) {
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
        "/api/balance and /api/transaction remain fail_closed_no_mutation",
        "ORO-5Z submits live traffic authorization request only",
        "not live traffic",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5Y Closed",
        "## ORO-5Z Current",
        "live traffic decision still pending",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5Y closed runtime traffic post-enablement validation boundary",
        "ORO-5Z current/live traffic authorization request boundary",
        "next phase blocked until live traffic authorization decision",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5Z Live Traffic Authorization Request Boundary Coverage",
        LONG_SCRIPT,
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
  ];
  const boundaryText = [BOUNDARY, FIXTURES, DOC_5Z].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5Z files must not contain ${marker}.`);
  }
  for (const file of ORO5Z_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionIssued, false);
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionStatus, LIVE_TRAFFIC_DECISION_STATUS);
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
    "liveTrafficAuthorizationRequestBoundaryResult",
    "dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary",
    "oro5yRuntimeTrafficPostEnablementValidationPassed",
    "runtimeTrafficEnabledFromOro5y",
    "runtimeTrafficModeFromOro5y",
    "liveTrafficAuthorizationRequestPrepared",
    "liveTrafficAuthorizationRequestSubmitted",
    "liveTrafficAuthorizationRequestStatus",
    "humanApprovalRequired",
    "separateLiveTrafficDecisionRequired",
    "nextPhaseRequiresLiveTrafficAuthorizationDecision",
    "liveTrafficAuthorizationDecisionIssued",
    "liveTrafficAuthorizationDecisionStatus",
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
    "secretsLeaked",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-5Z");
  assert.strictEqual(summary.fixtureId, "happyPathLiveTrafficAuthorizationRequestFixture");
  assert.strictEqual(summary.liveTrafficAuthorizationRequestBoundaryResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary,
    true
  );
  assert.strictEqual(summary.oro5yRuntimeTrafficPostEnablementValidationPassed, true);
  assert.strictEqual(summary.runtimeTrafficEnabledFromOro5y, true);
  assert.strictEqual(summary.runtimeTrafficModeFromOro5y, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.liveTrafficAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.liveTrafficAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.liveTrafficAuthorizationRequestStatus,
    LIVE_TRAFFIC_REQUEST_STATUS
  );
  assert.strictEqual(summary.humanApprovalRequired, true);
  assert.strictEqual(summary.separateLiveTrafficDecisionRequired, true);
  assert.strictEqual(summary.nextPhaseRequiresLiveTrafficAuthorizationDecision, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5Z happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.liveTrafficAuthorizationRequestBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5Z hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_STATUS, "object");
  assert.strictEqual(typeof validateOro5yPostEnablementValidationRecord, "function");
  assert.strictEqual(typeof buildLiveTrafficAuthorizationRequest, "function");
  assert.strictEqual(typeof validateLiveTrafficAuthorizationRequestBoundary, "function");
  assert.strictEqual(typeof validateNoLiveTrafficEnabledDuringRequest, "function");
  assert.strictEqual(typeof validateNoMutationDuringLiveTrafficRequest, "function");
  assert.strictEqual(typeof buildOro5zLiveTrafficAuthorizationRequestSummary, "function");
  assert.strictEqual(FAIL_CLOSED_NO_MUTATION, RUNTIME_TRAFFIC_MODE);

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro5zLiveTrafficAuthorizationRequestSummary(
    happyPathLiveTrafficAuthorizationRequestFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro5yPostEnablementValidationRecord(
      happyPathLiveTrafficAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateLiveTrafficAuthorizationRequestBoundary(
      happyPathLiveTrafficAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoLiveTrafficEnabledDuringRequest(
      happyPathLiveTrafficAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationDuringLiveTrafficRequest(
      happyPathLiveTrafficAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    buildLiveTrafficAuthorizationRequest(happyPathLiveTrafficAuthorizationRequestFixture)
      .responseSanitized,
    true
  );

  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(
      missingOro5yValidationRecordFixture
    ),
    "ORO-5Y post-enablement validation record is required"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(oro5yNotPassedFixture),
    "ORO-5Y post-enablement validation record is required"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(
      runtimeModeNotFailClosedNoMutationFixture
    ),
    "ORO-5Y post-enablement validation record is required"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(
      liveTrafficAlreadyEnabledViolationFixture
    ),
    "live traffic must remain disabled while request waits for decision"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(walletMutationViolationFixture),
    "wallet mutation must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(ledgerMutationViolationFixture),
    "ledger mutation must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(prismaWriteViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(dbTransactionViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(externalNetworkViolationFixture),
    "external network must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(liveOroPlayApiCallViolationFixture),
    "live OroPlay API call must remain absent during live traffic request"
  );
  assertHeld(
    buildOro5zLiveTrafficAuthorizationRequestSummary(
      missingHumanApprovalRequirementFixture
    ),
    "human approval and separate live traffic decision are required"
  );

  const responseFixtureSummary =
    buildOro5zLiveTrafficAuthorizationRequestSummary(responseSanitizedFixture);
  assertCompleteOutput(responseFixtureSummary);
  assert.strictEqual(responseFixtureSummary.liveTrafficAuthorizationRequestBoundaryResult, PASS);
  assertNoMutationFlags(responseFixtureSummary);
  assert.deepStrictEqual(responseFixtureSummary.blockers, []);

  const allReports =
    buildOro5zLiveTrafficAuthorizationRequestFixtures().map(
      buildOro5zLiveTrafficAuthorizationRequestSummary
    );
  assert(allReports.length >= 13, "fixture set must cover ORO-5Z required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5Z live traffic authorization request boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-5Z live traffic authorization request boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
