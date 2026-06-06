"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6cLiveTrafficEnablementBoundary");
const fixtures = require("../game-provider-mock/oro6cLiveTrafficEnablementBoundaryFixtures");

const {
  LIVE_TRAFFIC_DECISION_RESULT,
  LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS,
  LIVE_TRAFFIC_MODE,
  ORO6C_LIVE_TRAFFIC_ENABLEMENT_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  buildLiveTrafficEnablementRecord,
  buildOro6cLiveTrafficEnablementSummary,
  validateFailClosedNoMutationLiveTrafficEnablement,
  validateLiveTrafficEnablementBoundary,
  validateNoMutationDuringLiveTrafficEnablement,
  validateOro6aLiveTrafficAuthorizationDecisionRecord,
  validateOro6bLiveTrafficEnablementReadinessRecord,
} = helper;

const {
  buildOro6cLiveTrafficEnablementFixtures,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  happyPathLiveTrafficEnablementFailClosedFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  missingOro6aDecisionRecordFixture,
  missingOro6bReadinessRecordFixture,
  oro6aDecisionNotApprovedFixture,
  oro6bReadinessNotReadyFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const DOC_6B = "docs/ORO_6B_LIVE_TRAFFIC_ENABLEMENT_READINESS_BOUNDARY.md";
const DOC_6A = "docs/ORO_6A_LIVE_TRAFFIC_AUTHORIZATION_DECISION_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6cSmoke.js";
const BOUNDARY = "src/game-provider-mock/oro6cLiveTrafficEnablementBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6cLiveTrafficEnablementBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6cLiveTrafficEnablementBoundarySmoke.js";
const SCRIPT = "smoke:oro-6c";
const LONG_SCRIPT = "smoke:oro-6c-live-traffic-enablement-boundary";
const ORO6C_SECRET_SCAN_FILES = Object.freeze([
  DOC_6C,
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
  const doc6c = readRequired(DOC_6C);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6A",
    "## Dependency on ORO-6B",
    "## Live traffic enablement boundary",
    "## Fail-closed no-mutation live traffic gate",
    "## No-mutation statement",
    "## No external network and no live OroPlay call statement",
    "## Enablement output JSON",
    "## Rollback and blocker criteria",
    "next phase requires live traffic post-enablement validation",
    "liveTrafficEnablementBoundaryResult = PASS",
    "dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary = true",
    "dependsOnOro6bLiveTrafficEnablementReadinessBoundary = true",
    "oro6aLiveTrafficAuthorizationDecisionIssued = true",
    "oro6aLiveTrafficAuthorizationDecisionResult = approved",
    "oro6bLiveTrafficEnablementReadinessChecked = true",
    "oro6bLiveTrafficEnablementReadinessStatus = ready_for_enablement_boundary",
    "runtimeTrafficEnabledFromOro6b = true",
    "runtimeTrafficModeFromOro6b = fail_closed_no_mutation",
    "liveTrafficEnablementBoundaryEntered = true",
    "liveTrafficEnablementBoundaryChecked = true",
    "liveTrafficAllowed = true",
    "liveTrafficEnabled = true",
    "liveTrafficMode = fail_closed_no_mutation",
    "nextPhaseRequiresLiveTrafficPostEnablementValidation = true",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
  ]) {
    assert(doc6c.includes(marker), `${DOC_6C} missing marker ${marker}.`);
  }

  const doc6b = readRequired(DOC_6B);
  for (const marker of [
    "ORO-6C is required for live traffic enablement boundary",
    "ORO-6B does not enable live traffic",
  ]) {
    assert(doc6b.includes(marker), `${DOC_6B} missing marker ${marker}.`);
  }

  const doc6a = readRequired(DOC_6A);
  for (const marker of [
    "ORO-6C is required after ORO-6B readiness",
    "ORO-6A decision alone does not enable live traffic",
  ]) {
    assert(doc6a.includes(marker), `${DOC_6A} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6c", "oro-6c", DOC_6C]) {
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
        "/api/balance and /api/transaction live traffic remains fail_closed_no_mutation",
        "ORO-6C enables liveTraffic only as fail_closed_no_mutation boundary",
        "no wallet/ledger mutation",
        "no live OroPlay outgoing call",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6B Closed",
        "## ORO-6C Current",
        "live traffic post-enablement validation required next",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6B closed live traffic enablement readiness boundary",
        "ORO-6C current/live traffic enablement boundary",
        "next phase blocked until live traffic post-enablement validation",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6C Live Traffic Enablement Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6C].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6C files must not contain ${marker}.`);
  }
  for (const file of ORO6C_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
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
    "liveTrafficEnablementBoundaryResult",
    "dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary",
    "dependsOnOro6bLiveTrafficEnablementReadinessBoundary",
    "oro6aLiveTrafficAuthorizationDecisionIssued",
    "oro6aLiveTrafficAuthorizationDecisionResult",
    "oro6bLiveTrafficEnablementReadinessChecked",
    "oro6bLiveTrafficEnablementReadinessStatus",
    "runtimeTrafficEnabledFromOro6b",
    "runtimeTrafficModeFromOro6b",
    "liveTrafficEnablementBoundaryEntered",
    "liveTrafficEnablementBoundaryChecked",
    "liveTrafficAllowed",
    "liveTrafficEnabled",
    "liveTrafficMode",
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
    "nextPhaseRequiresLiveTrafficPostEnablementValidation",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-6C");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficEnablementFailClosedFixture"
  );
  assert.strictEqual(summary.liveTrafficEnablementBoundaryResult, PASS);
  assert.strictEqual(
    summary.dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary,
    true
  );
  assert.strictEqual(
    summary.dependsOnOro6bLiveTrafficEnablementReadinessBoundary,
    true
  );
  assert.strictEqual(summary.oro6aLiveTrafficAuthorizationDecisionIssued, true);
  assert.strictEqual(
    summary.oro6aLiveTrafficAuthorizationDecisionResult,
    LIVE_TRAFFIC_DECISION_RESULT
  );
  assert.strictEqual(summary.oro6bLiveTrafficEnablementReadinessChecked, true);
  assert.strictEqual(
    summary.oro6bLiveTrafficEnablementReadinessStatus,
    LIVE_TRAFFIC_ENABLEMENT_READINESS_STATUS
  );
  assert.strictEqual(summary.runtimeTrafficEnabledFromOro6b, true);
  assert.strictEqual(summary.runtimeTrafficModeFromOro6b, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.liveTrafficEnablementBoundaryEntered, true);
  assert.strictEqual(summary.liveTrafficEnablementBoundaryChecked, true);
  assert.strictEqual(summary.liveTrafficAllowed, true);
  assert.strictEqual(summary.liveTrafficEnabled, true);
  assert.strictEqual(summary.liveTrafficMode, LIVE_TRAFFIC_MODE);
  assert.strictEqual(
    summary.nextPhaseRequiresLiveTrafficPostEnablementValidation,
    true
  );
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6C happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.liveTrafficEnablementBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6C hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(typeof ORO6C_LIVE_TRAFFIC_ENABLEMENT_STATUS, "object");
  assert.strictEqual(typeof validateOro6aLiveTrafficAuthorizationDecisionRecord, "function");
  assert.strictEqual(typeof validateOro6bLiveTrafficEnablementReadinessRecord, "function");
  assert.strictEqual(typeof buildLiveTrafficEnablementRecord, "function");
  assert.strictEqual(typeof validateLiveTrafficEnablementBoundary, "function");
  assert.strictEqual(typeof validateFailClosedNoMutationLiveTrafficEnablement, "function");
  assert.strictEqual(typeof validateNoMutationDuringLiveTrafficEnablement, "function");
  assert.strictEqual(typeof buildOro6cLiveTrafficEnablementSummary, "function");

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro6cLiveTrafficEnablementSummary(
    happyPathLiveTrafficEnablementFailClosedFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro6aLiveTrafficAuthorizationDecisionRecord(
      happyPathLiveTrafficEnablementFailClosedFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateOro6bLiveTrafficEnablementReadinessRecord(
      happyPathLiveTrafficEnablementFailClosedFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateLiveTrafficEnablementBoundary(
      happyPathLiveTrafficEnablementFailClosedFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateFailClosedNoMutationLiveTrafficEnablement(
      happyPathLiveTrafficEnablementFailClosedFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationDuringLiveTrafficEnablement(
      happyPathLiveTrafficEnablementFailClosedFixture
    ).valid,
    true
  );
  assert.strictEqual(
    buildLiveTrafficEnablementRecord(happyPathLiveTrafficEnablementFailClosedFixture)
      .responseSanitized,
    true
  );

  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(missingOro6aDecisionRecordFixture),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(oro6aDecisionNotApprovedFixture),
    "ORO-6A approved live traffic decision record is required"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(missingOro6bReadinessRecordFixture),
    "ORO-6B live traffic enablement readiness record is required"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(oro6bReadinessNotReadyFixture),
    "ORO-6B live traffic enablement readiness record is required"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(runtimeModeNotFailClosedNoMutationFixture),
    "runtime traffic must remain fail_closed_no_mutation"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(
      liveTrafficModeNotFailClosedNoMutationFixture
    ),
    "live traffic enablement must be fail_closed_no_mutation only"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(walletMutationViolationFixture),
    "wallet mutation must remain absent during live traffic enablement"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(ledgerMutationViolationFixture),
    "ledger mutation must remain absent during live traffic enablement"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(prismaWriteViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic enablement"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(dbTransactionViolationFixture),
    "Prisma write and DB transaction must remain absent during live traffic enablement"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(externalNetworkViolationFixture),
    "external network must remain absent during live traffic enablement"
  );
  assertHeld(
    buildOro6cLiveTrafficEnablementSummary(liveOroPlayApiCallViolationFixture),
    "live OroPlay API call must remain absent during live traffic enablement"
  );

  const responseFixtureSummary =
    buildOro6cLiveTrafficEnablementSummary(responseSanitizedFixture);
  assertCompleteOutput(responseFixtureSummary);
  assert.strictEqual(responseFixtureSummary.liveTrafficEnablementBoundaryResult, PASS);
  assertNoMutationFlags(responseFixtureSummary);
  assert.deepStrictEqual(responseFixtureSummary.blockers, []);

  const allReports =
    buildOro6cLiveTrafficEnablementFixtures().map(
      buildOro6cLiveTrafficEnablementSummary
    );
  assert(allReports.length >= 14, "fixture set must cover ORO-6C required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-6C live traffic enablement boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-6C live traffic enablement boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
