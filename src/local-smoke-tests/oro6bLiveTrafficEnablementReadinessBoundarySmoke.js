"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundary");
const fixtures = require("../game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundaryFixtures");

const {
  LIVE_TRAFFIC_DECISION_RESULT,
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  ORO6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  buildLiveTrafficEnablementReadinessRecord,
  buildOro6bLiveTrafficEnablementReadinessSummary,
  validateLiveTrafficEnablementReadinessBoundary,
  validateNoLiveTrafficEnabledDuringReadiness,
  validateNoMutationDuringLiveTrafficReadiness,
  validateOro6aLiveTrafficAuthorizationDecisionRecord,
} = helper;

const {
  buildOro6bLiveTrafficEnablementReadinessFixtures,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  happyPathLiveTrafficEnablementReadinessFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  missingOro6aDecisionRecordFixture,
  oro6aDecisionNotApprovedFixture,
  oro6aDecisionNotIssuedFixture,
  prismaWriteViolationFixture,
  readinessMissingSeparateEnablementRequirementFixture,
  responseSanitizedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6B = "docs/ORO_6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_BOUNDARY.md";
const DOC_6A = "docs/ORO_6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6bSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6bLiveTrafficEnablementReadinessBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6bLiveTrafficEnablementReadinessBoundarySmoke.js";
const SCRIPT = "smoke:oro-6b";
const LONG_SCRIPT = "smoke:oro-6b-live-traffic-enablement-readiness-boundary";
const ORO6B_SECRET_SCAN_FILES = Object.freeze([
  DOC_6B,
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
  const doc6b = readRequired(DOC_6B);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6A",
    "## Live traffic enablement readiness boundary",
    "## No-live-enable statement",
    "## No-mutation statement",
    "## No external network and no live OroPlay call statement",
    "## Readiness output JSON",
    "## Rollback and blocker criteria",
    "next phase requires separate live traffic enablement boundary",
    "liveTrafficEnablementReadinessBoundaryResult = PASS",
    "dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary = true",
    "oro6aLiveTrafficAuthorizationDecisionIssued = true",
    "oro6aLiveTrafficAuthorizationDecisionResult = approved",
    "runtimeTrafficModeFromOro6a = fail_closed_no_mutation",
    "liveTrafficEnablementReadinessChecked = true",
    "liveTrafficEnablementReadinessStatus = ready_for_enablement_boundary",
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
    assert(doc6b.includes(marker), `${DOC_6B} missing marker ${marker}.`);
  }

  const doc6a = readRequired(DOC_6A);
  for (const marker of [
    "ORO-6B is required for pre-enablement readiness",
    "ORO-6A does not enable live traffic",
  ]) {
    assert(doc6a.includes(marker), `${DOC_6A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6b", "oro-6b", DOC_6B]) {
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
        "ORO-6B checks live traffic enablement readiness only",
        "still not live traffic",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6A Closed",
        "## ORO-6B Current",
        "live traffic enablement still pending future boundary",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6A closed live traffic authorization decision boundary",
        "ORO-6B current/live traffic enablement readiness boundary",
        "next phase blocked until live traffic enablement boundary",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6B Live Traffic Enablement Readiness Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6B].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6B files must not contain ${marker}.`);
  }
  for (const file of ORO6B_SECRET_SCAN_FILES) {
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
    "liveTrafficEnablementReadinessBoundaryResult",
    "dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary",
    "oro6aLiveTrafficAuthorizationDecisionIssued",
    "oro6aLiveTrafficAuthorizationDecisionResult",
    "runtimeTrafficEnabledFromOro6a",
    "runtimeTrafficModeFromOro6a",
    "liveTrafficEnablementReadinessChecked",
    "liveTrafficEnablementReadinessStatus",
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
  assert.strictEqual(summary.phase, "ORO-6B");
  assert.strictEqual(summary.fixtureId, "happyPathLiveTrafficEnablementReadinessFixture");
  assert.strictEqual(summary.liveTrafficEnablementReadinessBoundaryResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(summary.oro6aLiveTrafficAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.oro6aLiveTrafficAuthorizationDecisionResult,
    LIVE_TRAFFIC_DECISION_RESULT
  );
  assert.strictEqual(summary.runtimeTrafficEnabledFromOro6a, true);
  assert.strictEqual(summary.runtimeTrafficModeFromOro6a, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.liveTrafficEnablementReadinessChecked, true);
  assert.strictEqual(
    summary.liveTrafficEnablementReadinessStatus,
    LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
  );
  assert.strictEqual(summary.separateLiveTrafficEnablementRequired, true);
  assert.strictEqual(summary.nextPhaseRequiresLiveTrafficEnablementBoundary, true);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6B happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.liveTrafficEnablementReadinessBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6B hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS, "object");
  assert.strictEqual(typeof validateOro6aLiveTrafficAuthorizationDecisionRecord, "function");
  assert.strictEqual(typeof buildLiveTrafficEnablementReadinessRecord, "function");
  assert.strictEqual(typeof validateLiveTrafficEnablementReadinessBoundary, "function");
  assert.strictEqual(typeof validateNoLiveTrafficEnabledDuringReadiness, "function");
  assert.strictEqual(typeof validateNoMutationDuringLiveTrafficReadiness, "function");
  assert.strictEqual(typeof buildOro6bLiveTrafficEnablementReadinessSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro6bLiveTrafficEnablementReadinessSummary(
    happyPathLiveTrafficEnablementReadinessFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro6aLiveTrafficAuthorizationDecisionRecord(
      happyPathLiveTrafficEnablementReadinessFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateLiveTrafficEnablementReadinessBoundary(
      happyPathLiveTrafficEnablementReadinessFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoLiveTrafficEnabledDuringReadiness(
      happyPathLiveTrafficEnablementReadinessFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationDuringLiveTrafficReadiness(
      happyPathLiveTrafficEnablementReadinessFixture
    ).valid,
    true
  );
  assert.strictEqual(
    buildLiveTrafficEnablementReadinessRecord(happyPathLiveTrafficEnablementReadinessFixture)
      .responseSanitized,
    true
  );

  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      missingOro6aDecisionRecordFixture
    ),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      oro6aDecisionNotIssuedFixture
    ),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      oro6aDecisionNotApprovedFixture
    ),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      runtimeModeNotFailClosedNoMutationFixture
    ),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      liveTrafficAlreadyEnabledViolationFixture
    ),
    "live traffic must remain disabled during readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(walletMutationViolationFixture),
    "wallet mutation must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(ledgerMutationViolationFixture),
    "ledger mutation must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(prismaWriteViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(dbTransactionViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(externalNetworkViolationFixture),
    "external network must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(liveOroPlayApiCallViolationFixture),
    "live OroPlay API call must remain absent during live traffic readiness"
  );
  assertHeld(
    buildOro6bLiveTrafficEnablementReadinessSummary(
      readinessMissingSeparateEnablementRequirementFixture
    ),
    "separate live traffic enablement boundary is required"
  );

  const responseFixtureSummary =
    buildOro6bLiveTrafficEnablementReadinessSummary(responseSanitizedFixture);
  assertCompleteOutput(responseFixtureSummary);
  assert.strictEqual(responseFixtureSummary.liveTrafficEnablementReadinessBoundaryResult, PASS);
  assertNoMutationFlags(responseFixtureSummary);
  assert.deepStrictEqual(responseFixtureSummary.blockers, []);

  const allReports =
    buildOro6bLiveTrafficEnablementReadinessFixtures().map(
      buildOro6bLiveTrafficEnablementReadinessSummary
    );
  assert(allReports.length >= 14, "fixture set must cover ORO-6B required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-6B live traffic enablement readiness boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-6B live traffic enablement readiness boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
