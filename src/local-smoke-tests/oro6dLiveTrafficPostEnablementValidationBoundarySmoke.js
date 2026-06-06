"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundary");
const fixtures = require("../game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  ORO6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
  PASS,
  VALIDATION_PASSED,
  buildOro6dLiveTrafficPostEnablementValidationSummary,
  validateApiBalanceLiveTrafficPostEnablement,
  validateApiTransactionLiveTrafficPostEnablement,
  validateFailClosedNoMutationLiveTrafficPostEnablement,
  validateNoExternalOrLiveOroPlayAfterLiveTrafficEnablement,
  validateNoMutationAfterLiveTrafficEnablement,
  validateOro6cLiveTrafficEnablementRecord,
} = helper;

const {
  buildOro6dLiveTrafficPostEnablementValidationFixtures,
  dbTransactionViolationFixture,
  duplicateTransactionNoDoubleMutationFixture,
  externalNetworkViolationFixture,
  happyPathLiveTrafficPostEnablementValidationFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  liveTrafficNotEnabledFixture,
  malformedPayloadStillFailClosedFixture,
  missingOro6cEnablementRecordFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6D =
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6dSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6dLiveTrafficPostEnablementValidationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6dLiveTrafficPostEnablementValidationBoundarySmoke.js";
const SCRIPT = "smoke:oro-6d";
const LONG_SCRIPT =
  "smoke:oro-6d-live-traffic-post-enablement-validation-boundary";
const ORO6D_SECRET_SCAN_FILES = Object.freeze([
  DOC_6D,
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
  const doc6d = readRequired(DOC_6D);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6C",
    "## Post-enable validation boundary",
    "## Fail-closed no-mutation live traffic validation",
    "## /api/balance validation",
    "## /api/transaction validation",
    "## No-mutation statement",
    "## No external network and no live OroPlay call statement",
    "## Validation output JSON",
    "## Rollback and blocker criteria",
    "next phase requires separate external/live OroPlay call authorization request",
    "liveTrafficPostEnablementValidationBoundaryResult = PASS",
    "dependsOnOro6cLiveTrafficEnablementBoundary = true",
    "liveTrafficAllowedFromOro6c = true",
    "liveTrafficEnabledFromOro6c = true",
    "liveTrafficModeFromOro6c = fail_closed_no_mutation",
    "liveTrafficPostEnablementValidationStatus = validation_passed",
    "apiBalanceLiveTrafficMode = fail_closed_no_mutation",
    "apiTransactionLiveTrafficMode = fail_closed_no_mutation",
    "apiBalancePostEnablementValidationPassed = true",
    "apiTransactionPostEnablementValidationPassed = true",
    "malformedPayloadStillFailClosed = true",
    "unknownUserStillFailClosed = true",
    "mockAuthMismatchStillFailClosed = true",
    "duplicateTransactionStillNoDoubleMutation = true",
    "unsupportedTransactionTypeStillFailClosedOrManualReview = true",
    "responseStillSanitized = true",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
    "nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest = true",
  ]) {
    assert(doc6d.includes(marker), `${DOC_6D} missing marker ${marker}.`);
  }

  const doc6c = readRequired(DOC_6C);
  for (const marker of [
    "ORO-6D is required after enablement",
    "live traffic remains fail_closed_no_mutation",
    "external/live OroPlay call still blocked",
  ]) {
    assert(doc6c.includes(marker), `${DOC_6C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6d", "oro-6d", DOC_6D]) {
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
        "/api/balance and /api/transaction live traffic = fail_closed_no_mutation only",
        "ORO-6D validates post-enable behavior",
        "no wallet/ledger mutation",
        "no live OroPlay outgoing call",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6C Closed",
        "## ORO-6D Current",
        "external/live OroPlay call authorization still pending future boundary",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6C closed live traffic enablement boundary",
        "ORO-6D current/live traffic post-enablement validation boundary",
        "next phase blocked until external/live OroPlay call authorization request",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6D Live Traffic Post-Enablement Validation Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6D].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6D files must not contain ${marker}.`);
  }
  for (const file of ORO6D_SECRET_SCAN_FILES) {
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
    "liveTrafficPostEnablementValidationBoundaryResult",
    "dependsOnOro6cLiveTrafficEnablementBoundary",
    "liveTrafficAllowedFromOro6c",
    "liveTrafficEnabledFromOro6c",
    "liveTrafficModeFromOro6c",
    "liveTrafficPostEnablementValidationEntered",
    "liveTrafficPostEnablementValidationChecked",
    "liveTrafficPostEnablementValidationStatus",
    "apiBalanceLiveTrafficEnabled",
    "apiTransactionLiveTrafficEnabled",
    "apiBalanceLiveTrafficMode",
    "apiTransactionLiveTrafficMode",
    "apiBalancePostEnablementValidationPassed",
    "apiTransactionPostEnablementValidationPassed",
    "malformedPayloadStillFailClosed",
    "unknownUserStillFailClosed",
    "mockAuthMismatchStillFailClosed",
    "duplicateTransactionStillNoDoubleMutation",
    "unsupportedTransactionTypeStillFailClosedOrManualReview",
    "responseStillSanitized",
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
    "nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-6D");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficPostEnablementValidationFixture"
  );
  assert.strictEqual(summary.liveTrafficPostEnablementValidationBoundaryResult, PASS);
  assert.strictEqual(summary.dependsOnOro6cLiveTrafficEnablementBoundary, true);
  assert.strictEqual(summary.liveTrafficAllowedFromOro6c, true);
  assert.strictEqual(summary.liveTrafficEnabledFromOro6c, true);
  assert.strictEqual(summary.liveTrafficModeFromOro6c, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.liveTrafficPostEnablementValidationEntered, true);
  assert.strictEqual(summary.liveTrafficPostEnablementValidationChecked, true);
  assert.strictEqual(summary.liveTrafficPostEnablementValidationStatus, VALIDATION_PASSED);
  assert.strictEqual(summary.apiBalanceLiveTrafficEnabled, true);
  assert.strictEqual(summary.apiTransactionLiveTrafficEnabled, true);
  assert.strictEqual(summary.apiBalanceLiveTrafficMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionLiveTrafficMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiBalancePostEnablementValidationPassed, true);
  assert.strictEqual(summary.apiTransactionPostEnablementValidationPassed, true);
  assert.strictEqual(summary.malformedPayloadStillFailClosed, true);
  assert.strictEqual(summary.unknownUserStillFailClosed, true);
  assert.strictEqual(summary.mockAuthMismatchStillFailClosed, true);
  assert.strictEqual(summary.duplicateTransactionStillNoDoubleMutation, true);
  assert.strictEqual(
    summary.unsupportedTransactionTypeStillFailClosedOrManualReview,
    true
  );
  assert.strictEqual(summary.responseStillSanitized, true);
  assertNoMutationFlags(summary);
  assert.strictEqual(
    summary.nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6D happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficPostEnablementValidationBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6D hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
    "object"
  );
  assert.strictEqual(typeof validateOro6cLiveTrafficEnablementRecord, "function");
  assert.strictEqual(
    typeof validateFailClosedNoMutationLiveTrafficPostEnablement,
    "function"
  );
  assert.strictEqual(typeof validateApiBalanceLiveTrafficPostEnablement, "function");
  assert.strictEqual(
    typeof validateApiTransactionLiveTrafficPostEnablement,
    "function"
  );
  assert.strictEqual(typeof validateNoMutationAfterLiveTrafficEnablement, "function");
  assert.strictEqual(
    typeof validateNoExternalOrLiveOroPlayAfterLiveTrafficEnablement,
    "function"
  );
  assert.strictEqual(
    typeof buildOro6dLiveTrafficPostEnablementValidationSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro6dLiveTrafficPostEnablementValidationSummary(
    happyPathLiveTrafficPostEnablementValidationFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro6cLiveTrafficEnablementRecord(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateFailClosedNoMutationLiveTrafficPostEnablement(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateApiBalanceLiveTrafficPostEnablement(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateApiTransactionLiveTrafficPostEnablement(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationAfterLiveTrafficEnablement(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoExternalOrLiveOroPlayAfterLiveTrafficEnablement(
      happyPathLiveTrafficPostEnablementValidationFixture
    ).valid,
    true
  );

  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      missingOro6cEnablementRecordFixture
    ),
    "ORO-6C live traffic enablement record is required"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      liveTrafficNotEnabledFixture
    ),
    "ORO-6C live traffic enablement record is required"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      liveTrafficModeNotFailClosedNoMutationFixture
    ),
    "ORO-6C live traffic enablement record is required"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      walletMutationViolationFixture
    ),
    "wallet mutation must remain absent after live traffic enablement"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      ledgerMutationViolationFixture
    ),
    "ledger mutation must remain absent after live traffic enablement"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      prismaWriteViolationFixture
    ),
    "Prisma write and DB transaction must remain absent after live traffic enablement"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      dbTransactionViolationFixture
    ),
    "Prisma write and DB transaction must remain absent after live traffic enablement"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      externalNetworkViolationFixture
    ),
    "external network must remain absent after live traffic enablement"
  );
  assertHeld(
    buildOro6dLiveTrafficPostEnablementValidationSummary(
      liveOroPlayApiCallViolationFixture
    ),
    "live OroPlay API call must remain absent after live traffic enablement"
  );

  for (const positiveFixture of [
    malformedPayloadStillFailClosedFixture,
    duplicateTransactionNoDoubleMutationFixture,
    responseSanitizedFixture,
  ]) {
    const summary =
      buildOro6dLiveTrafficPostEnablementValidationSummary(positiveFixture);
    assertCompleteOutput(summary);
    assert.strictEqual(
      summary.liveTrafficPostEnablementValidationBoundaryResult,
      PASS
    );
    assert.strictEqual(summary.liveTrafficModeFromOro6c, FAIL_CLOSED_NO_MUTATION);
    assert.strictEqual(summary.apiBalanceLiveTrafficMode, FAIL_CLOSED_NO_MUTATION);
    assert.strictEqual(
      summary.apiTransactionLiveTrafficMode,
      FAIL_CLOSED_NO_MUTATION
    );
    assert.strictEqual(summary.malformedPayloadStillFailClosed, true);
    assert.strictEqual(summary.duplicateTransactionStillNoDoubleMutation, true);
    assert.strictEqual(summary.responseStillSanitized, true);
    assertNoMutationFlags(summary);
    assert.deepStrictEqual(summary.blockers, []);
  }

  const allReports =
    buildOro6dLiveTrafficPostEnablementValidationFixtures().map(
      buildOro6dLiveTrafficPostEnablementValidationSummary
    );
  assert(allReports.length >= 13, "fixture set must cover ORO-6D required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6D live traffic post-enablement validation boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6D live traffic post-enablement validation boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
