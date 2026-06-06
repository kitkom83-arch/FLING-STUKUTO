"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundary");
const fixtures = require("../game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  ORO5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
  PASS,
  RUNTIME_TRAFFIC_MODE,
  VALIDATION_PASSED,
  buildOro5yRuntimeTrafficPostEnablementValidationSummary,
  validateApiBalanceRuntimeTrafficPostEnablement,
  validateApiTransactionRuntimeTrafficPostEnablement,
  validateFailClosedNoMutationRuntimeTrafficPostEnablement,
  validateNoLiveTrafficAfterRuntimeEnablement,
  validateNoMutationAfterRuntimeEnablement,
  validateOro5xRuntimeTrafficEnablementRecord,
} = helper;

const {
  buildOro5yRuntimeTrafficPostEnablementValidationFixtures,
  dbTransactionViolationFixture,
  duplicateTransactionNoDoubleMutationFixture,
  externalNetworkViolationFixture,
  happyPathRuntimeTrafficPostEnablementValidationFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallViolationFixture,
  liveTrafficEnabledViolationFixture,
  malformedPayloadStillFailClosedFixture,
  missingOro5xEnablementRecordFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_5Y =
  "docs/ORO_5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_5X = "docs/ORO_5X_RUNTIME_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro5ySmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro5yRuntimeTrafficPostEnablementValidationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro5yRuntimeTrafficPostEnablementValidationBoundarySmoke.js";
const SCRIPT = "smoke:oro-5y";
const LONG_SCRIPT =
  "smoke:oro-5y-runtime-traffic-post-enablement-validation-boundary";
const ORO5Y_SECRET_SCAN_FILES = Object.freeze([
  DOC_5Y,
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
  const doc5y = readRequired(DOC_5Y);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-5X",
    "## Post-enable validation boundary",
    "## Fail-closed no-mutation runtime traffic validation",
    "## /api/balance validation",
    "## /api/transaction validation",
    "## No-live-traffic statement",
    "## No-mutation statement",
    "## Validation output JSON",
    "## Rollback and blocker criteria",
    "nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest = true",
    "runtimeTrafficPostEnablementValidationBoundaryResult = PASS",
    "runtimeTrafficModeFromOro5x = fail_closed_no_mutation",
    "apiBalanceRuntimeTrafficMode = fail_closed_no_mutation",
    "apiTransactionRuntimeTrafficMode = fail_closed_no_mutation",
    "liveTrafficEnabled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCalled = false",
  ]) {
    assert(doc5y.includes(marker), `${DOC_5Y} missing marker ${marker}.`);
  }

  const doc5x = readRequired(DOC_5X);
  for (const marker of [
    "ORO-5Y is required after enablement",
    "runtime traffic remains only fail_closed_no_mutation",
    "live traffic remains blocked",
  ]) {
    assert(doc5x.includes(marker), `${DOC_5X} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5y", "oro-5y", DOC_5Y]) {
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
        "ORO-5Y validates post-enable behavior",
        "/api/balance = mounted in fail_closed_no_mutation only",
        "/api/transaction = mounted in fail_closed_no_mutation only",
        "not live traffic",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-5X Closed",
        "## ORO-5Y Current",
        "live traffic requires separate future authorization",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-5X closed runtime traffic enablement boundary",
        "ORO-5Y current/runtime traffic post-enablement validation boundary",
        "next phase blocked until ORO-5Y pass",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-5Y Runtime Traffic Post-Enablement Validation Boundary Coverage",
        LONG_SCRIPT,
        SCRIPT,
        "fail-closed/no-mutation post-enable validation",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_5Y].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-5Y files must not contain ${marker}.`);
  }
  for (const file of ORO5Y_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoMutationFlags(summary) {
  assert.strictEqual(summary.liveTrafficAuthorizationRequestSubmitted, false);
  assert.strictEqual(summary.liveTrafficAuthorizationDecisionIssued, false);
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
    "runtimeTrafficPostEnablementValidationBoundaryResult",
    "dependsOnOro5xRuntimeTrafficEnablementBoundary",
    "runtimeTrafficEnabledFromOro5x",
    "runtimeTrafficAllowedFromOro5x",
    "runtimeTrafficImplementedFromOro5x",
    "runtimeTrafficPatchImplementedFromOro5x",
    "runtimeTrafficModeFromOro5x",
    "runtimeTrafficPostEnablementValidationEntered",
    "runtimeTrafficPostEnablementValidationChecked",
    "runtimeTrafficPostEnablementValidationStatus",
    "apiBalancePublicAliasMounted",
    "apiTransactionPublicAliasMounted",
    "apiBalancePublicAliasMode",
    "apiTransactionPublicAliasMode",
    "apiBalanceRuntimeTrafficEnabled",
    "apiTransactionRuntimeTrafficEnabled",
    "apiBalanceRuntimeTrafficMode",
    "apiTransactionRuntimeTrafficMode",
    "apiBalancePostEnablementValidationPassed",
    "apiTransactionPostEnablementValidationPassed",
    "malformedPayloadStillFailClosed",
    "unknownUserStillFailClosed",
    "mockAuthMismatchStillFailClosed",
    "duplicateTransactionStillNoDoubleMutation",
    "unsupportedTransactionTypeStillFailClosedOrManualReview",
    "responseStillSanitized",
    "liveTrafficAuthorizationRequestSubmitted",
    "liveTrafficAuthorizationDecisionIssued",
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
    "nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest",
    "blockers",
  ];
  for (const key of expectedKeys) {
    assert(Object.prototype.hasOwnProperty.call(summary, key), `missing output field ${key}.`);
  }
  assert.deepStrictEqual(Object.keys(summary), expectedKeys);
}

function assertHappyPath(summary) {
  assertCompleteOutput(summary);
  assert.strictEqual(summary.phase, "ORO-5Y");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathRuntimeTrafficPostEnablementValidationFixture"
  );
  assert.strictEqual(summary.runtimeTrafficPostEnablementValidationBoundaryResult, PASS);
  assert.strictEqual(summary.dependsOnOro5xRuntimeTrafficEnablementBoundary, true);
  assert.strictEqual(summary.runtimeTrafficEnabledFromOro5x, true);
  assert.strictEqual(summary.runtimeTrafficAllowedFromOro5x, true);
  assert.strictEqual(summary.runtimeTrafficImplementedFromOro5x, true);
  assert.strictEqual(summary.runtimeTrafficPatchImplementedFromOro5x, true);
  assert.strictEqual(summary.runtimeTrafficModeFromOro5x, RUNTIME_TRAFFIC_MODE);
  assert.strictEqual(summary.runtimeTrafficPostEnablementValidationEntered, true);
  assert.strictEqual(summary.runtimeTrafficPostEnablementValidationChecked, true);
  assert.strictEqual(summary.runtimeTrafficPostEnablementValidationStatus, VALIDATION_PASSED);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, true);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, true);
  assert.strictEqual(summary.apiBalancePublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionPublicAliasMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiBalanceRuntimeTrafficEnabled, true);
  assert.strictEqual(summary.apiTransactionRuntimeTrafficEnabled, true);
  assert.strictEqual(summary.apiBalanceRuntimeTrafficMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.apiTransactionRuntimeTrafficMode, FAIL_CLOSED_NO_MUTATION);
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
    summary.nextPhaseRequiresSeparateLiveTrafficAuthorizationRequest,
    true
  );
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-5Y happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.runtimeTrafficPostEnablementValidationBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-5Y hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO5Y_RUNTIME_TRAFFIC_POST_ENABLEMENT_VALIDATION_STATUS,
    "object"
  );
  assert.strictEqual(typeof validateOro5xRuntimeTrafficEnablementRecord, "function");
  assert.strictEqual(
    typeof validateFailClosedNoMutationRuntimeTrafficPostEnablement,
    "function"
  );
  assert.strictEqual(typeof validateApiBalanceRuntimeTrafficPostEnablement, "function");
  assert.strictEqual(
    typeof validateApiTransactionRuntimeTrafficPostEnablement,
    "function"
  );
  assert.strictEqual(typeof validateNoLiveTrafficAfterRuntimeEnablement, "function");
  assert.strictEqual(typeof validateNoMutationAfterRuntimeEnablement, "function");
  assert.strictEqual(
    typeof buildOro5yRuntimeTrafficPostEnablementValidationSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy = buildOro5yRuntimeTrafficPostEnablementValidationSummary(
    happyPathRuntimeTrafficPostEnablementValidationFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro5xRuntimeTrafficEnablementRecord(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateFailClosedNoMutationRuntimeTrafficPostEnablement(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateApiBalanceRuntimeTrafficPostEnablement(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateApiTransactionRuntimeTrafficPostEnablement(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoLiveTrafficAfterRuntimeEnablement(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationAfterRuntimeEnablement(
      happyPathRuntimeTrafficPostEnablementValidationFixture
    ).valid,
    true
  );

  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      missingOro5xEnablementRecordFixture
    ),
    "ORO-5X runtime traffic enablement record is required"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      runtimeModeNotFailClosedNoMutationFixture
    ),
    "ORO-5X runtime traffic enablement record is required"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      liveTrafficEnabledViolationFixture
    ),
    "live traffic must remain blocked after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      walletMutationViolationFixture
    ),
    "wallet mutation must remain absent after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      ledgerMutationViolationFixture
    ),
    "ledger mutation must remain absent after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      prismaWriteViolationFixture
    ),
    "Prisma write and DB transaction must remain absent after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      dbTransactionViolationFixture
    ),
    "Prisma write and DB transaction must remain absent after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      externalNetworkViolationFixture
    ),
    "external network must remain absent after runtime enablement"
  );
  assertHeld(
    buildOro5yRuntimeTrafficPostEnablementValidationSummary(
      liveOroPlayApiCallViolationFixture
    ),
    "live OroPlay API call must remain absent after runtime enablement"
  );

  for (const positiveFixture of [
    malformedPayloadStillFailClosedFixture,
    duplicateTransactionNoDoubleMutationFixture,
    responseSanitizedFixture,
  ]) {
    const summary =
      buildOro5yRuntimeTrafficPostEnablementValidationSummary(positiveFixture);
    assertCompleteOutput(summary);
    assert.strictEqual(
      summary.runtimeTrafficPostEnablementValidationBoundaryResult,
      PASS
    );
    assert.strictEqual(summary.runtimeTrafficModeFromOro5x, RUNTIME_TRAFFIC_MODE);
    assert.strictEqual(summary.apiBalanceRuntimeTrafficMode, FAIL_CLOSED_NO_MUTATION);
    assert.strictEqual(
      summary.apiTransactionRuntimeTrafficMode,
      FAIL_CLOSED_NO_MUTATION
    );
    assert.strictEqual(summary.malformedPayloadStillFailClosed, true);
    assert.strictEqual(summary.duplicateTransactionStillNoDoubleMutation, true);
    assert.strictEqual(summary.responseStillSanitized, true);
    assertNoMutationFlags(summary);
    assert.deepStrictEqual(summary.blockers, []);
  }

  const allReports =
    buildOro5yRuntimeTrafficPostEnablementValidationFixtures().map(
      buildOro5yRuntimeTrafficPostEnablementValidationSummary
    );
  assert(allReports.length >= 13, "fixture set must cover ORO-5Y required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log("ORO-5Y runtime traffic post-enablement validation boundary smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-5Y runtime traffic post-enablement validation boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
