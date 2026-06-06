"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundary");
const fixtures = require("../game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundaryFixtures");

const {
  LIVE_TRAFFIC_DECISION_RESULT,
  LIVE_TRAFFIC_DECISION_STATUS,
  ORO6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  buildLiveTrafficAuthorizationDecision,
  buildOro6aLiveTrafficAuthorizationDecisionSummary,
  validateLiveTrafficAuthorizationDecisionBoundary,
  validateNoLiveTrafficEnabledDuringDecision,
  validateNoMutationDuringLiveTrafficDecision,
  validateOro5zLiveTrafficAuthorizationRequestRecord,
} = helper;

const {
  buildOro6aLiveTrafficAuthorizationDecisionFixtures,
  dbTransactionViolationFixture,
  decisionMissingSeparateEnablementRequirementFixture,
  externalNetworkViolationFixture,
  happyPathLiveTrafficAuthorizationDecisionFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  missingOro5zRequestRecordFixture,
  oro5zRequestNotSubmittedFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6A = "docs/ORO_6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md";
const DOC_5Z = "docs/ORO_5Z_LIVE_TRAFFIC_AUTHORIZATION_REQUEST_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6aSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6aLiveTrafficAuthorizationDecisionBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6aLiveTrafficAuthorizationDecisionBoundarySmoke.js";
const SCRIPT = "smoke:oro-6a";
const LONG_SCRIPT = "smoke:oro-6a-live-traffic-authorization-decision-boundary";
const ORO6A_SECRET_SCAN_FILES = Object.freeze([
  DOC_6A,
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
  const doc6a = readRequired(DOC_6A);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-5Z",
    "## Live traffic authorization decision boundary",
    "## No-live-enable statement",
    "## No-mutation statement",
    "## No external network and no live OroPlay call statement",
    "## Decision output JSON",
    "## Rollback and blocker criteria",
    "next phase requires separate live traffic enablement boundary",
    "liveTrafficAuthorizationDecisionBoundaryResult = PASS",
    "dependsOnOro5zLiveTrafficAuthorizationRequestBoundary = true",
    "oro5zLiveTrafficAuthorizationRequestSubmitted = true",
    "runtimeTrafficModeFromOro5z = fail_closed_no_mutation",
    "liveTrafficAuthorizationDecisionIssued = true",
    "liveTrafficAuthorizationDecisionStatus = decision_issued",
    "liveTrafficAuthorizationDecisionResult = approved",
    "liveTrafficAllowed = false",
    "liveTrafficEnabled = false",
    "separateLiveTrafficEnablementRequired = true",
    "nextPhaseRequiresLiveTrafficEnablementBoundary = true",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
  ]) {
    assert(doc6a.includes(marker), `${DOC_6A} missing marker ${marker}.`);
  }

  const doc5z = readRequired(DOC_5Z);
  for (const marker of [
    "ORO-6A is required for live traffic authorization decision",
    "ORO-5Z does not approve or enable live traffic",
  ]) {
    assert(doc5z.includes(marker), `${DOC_5Z} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6a", "oro-6a", DOC_6A]) {
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
        "ORO-6A issues decision only",
        "still not live traffic",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5Z Closed",
        "## ORO-6A Current",
        "live traffic enablement still pending future boundary",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5Z closed live traffic authorization request boundary",
        "ORO-6A current/live traffic authorization decision boundary",
        "next phase blocked until live traffic enablement boundary",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6A Live Traffic Authorization Decision Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6A].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6A files must not contain ${marker}.`);
  }
  for (const file of ORO6A_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
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
    "liveTrafficAuthorizationDecisionBoundaryResult",
    "dependsOnOro5zLiveTrafficAuthorizationRequestBoundary",
    "oro5zLiveTrafficAuthorizationRequestSubmitted",
    "runtimeTrafficEnabledFromOro5z",
    "runtimeTrafficModeFromOro5z",
    "liveTrafficAuthorizationDecisionIssued",
    "liveTrafficAuthorizationDecisionStatus",
    "liveTrafficAuthorizationDecisionResult",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
    "separateLiveTrafficEnablementRequired",
    "nextPhaseRequiresLiveTrafficEnablementBoundary",
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
  assert.strictEqual(summary.phase, "ORO-6A");
  assert.strictEqual(summary.fixtureId, "happyPathLiveTrafficAuthorizationDecisionFixture");
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionBoundaryResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro5zLiveTrafficAuthorizationRequestBoundary,
    true
  );
  assert.strictEqual(summary.oro5zLiveTrafficAuthorizationRequestSubmitted, true);
  assert.strictEqual(summary.runtimeTrafficEnabledFromOro5z, true);
  assert.strictEqual(summary.runtimeTrafficModeFromOro5z, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.liveTrafficAuthorizationDecisionStatus,
    LIVE_TRAFFIC_DECISION_STATUS
  );
  assert.strictEqual(
    summary.liveTrafficAuthorizationDecisionResult,
    LIVE_TRAFFIC_DECISION_RESULT
  );
  assert.strictEqual(summary.separateLiveTrafficEnablementRequired, true);
  assert.strictEqual(summary.nextPhaseRequiresLiveTrafficEnablementBoundary, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6A happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6A hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_STATUS, "object");
  assert.strictEqual(typeof validateOro5zLiveTrafficAuthorizationRequestRecord, "function");
  assert.strictEqual(typeof buildLiveTrafficAuthorizationDecision, "function");
  assert.strictEqual(typeof validateLiveTrafficAuthorizationDecisionBoundary, "function");
  assert.strictEqual(typeof validateNoLiveTrafficEnabledDuringDecision, "function");
  assert.strictEqual(typeof validateNoMutationDuringLiveTrafficDecision, "function");
  assert.strictEqual(typeof buildOro6aLiveTrafficAuthorizationDecisionSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro6aLiveTrafficAuthorizationDecisionSummary(
    happyPathLiveTrafficAuthorizationDecisionFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro5zLiveTrafficAuthorizationRequestRecord(
      happyPathLiveTrafficAuthorizationDecisionFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateLiveTrafficAuthorizationDecisionBoundary(
      happyPathLiveTrafficAuthorizationDecisionFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoLiveTrafficEnabledDuringDecision(
      happyPathLiveTrafficAuthorizationDecisionFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationDuringLiveTrafficDecision(
      happyPathLiveTrafficAuthorizationDecisionFixture
    ).valid,
    true
  );
  assert.strictEqual(
    buildLiveTrafficAuthorizationDecision(happyPathLiveTrafficAuthorizationDecisionFixture)
      .responseSanitized,
    true
  );

  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(
      missingOro5zRequestRecordFixture
    ),
    "ORO-5Z live traffic authorization request record is required"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(
      oro5zRequestNotSubmittedFixture
    ),
    "ORO-5Z live traffic authorization request record is required"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(
      runtimeModeNotFailClosedNoMutationFixture
    ),
    "ORO-5Z live traffic authorization request record is required"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(
      liveTrafficAlreadyEnabledViolationFixture
    ),
    "live traffic must remain disabled until enablement boundary"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(walletMutationViolationFixture),
    "wallet mutation must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(ledgerMutationViolationFixture),
    "ledger mutation must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(prismaWriteViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(dbTransactionViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(externalNetworkViolationFixture),
    "external network must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(liveOroPlayApiCallViolationFixture),
    "live OroPlay API call must remain absent during live traffic decision"
  );
  assertHeld(
    buildOro6aLiveTrafficAuthorizationDecisionSummary(
      decisionMissingSeparateEnablementRequirementFixture
    ),
    "separate live traffic enablement boundary is required"
  );

  const responseFixtureSummary =
    buildOro6aLiveTrafficAuthorizationDecisionSummary(responseSanitizedFixture);
  assertCompleteOutput(responseFixtureSummary);
  assert.strictEqual(responseFixtureSummary.liveTrafficAuthorizationDecisionBoundaryResult, PASS);
  assertNoMutationFlags(responseFixtureSummary);
  assert.deepStrictEqual(responseFixtureSummary.blockers, []);

  const allReports =
    buildOro6aLiveTrafficAuthorizationDecisionFixtures().map(
      buildOro6aLiveTrafficAuthorizationDecisionSummary
    );
  assert(allReports.length >= 13, "fixture set must cover ORO-6A required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-6A live traffic authorization decision boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-6A live traffic authorization decision boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
