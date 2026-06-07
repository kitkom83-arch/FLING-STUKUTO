"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundary");
const fixtures = require("../game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundaryFixtures");

const {
  EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
  EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
  FAIL_CLOSED_NO_MUTATION,
  ORO6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
  PASS,
  buildLiveTrafficExternalCallAuthorizationRequest,
  buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary,
  validateLiveTrafficExternalCallAuthorizationRequestBoundary,
  validateNoExternalNetworkDuringRequest,
  validateNoLiveOroPlayApiCallDuringRequest,
  validateNoMutationDuringExternalCallRequest,
  validateOro6dLiveTrafficPostEnablementValidationRecord,
} = helper;

const {
  buildOro6eLiveTrafficExternalCallAuthorizationRequestFixtures,
  dbTransactionViolationFixture,
  externalNetworkAlreadyAllowedViolationFixture,
  externalNetworkCalledViolationFixture,
  happyPathLiveTrafficExternalCallAuthorizationRequestFixture,
  ledgerMutationViolationFixture,
  liveOroPlayApiCallAllowedViolationFixture,
  liveOroPlayApiCallCalledViolationFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  missingHumanApprovalRequirementFixture,
  missingOro6dValidationRecordFixture,
  oro6dValidationNotPassedFixture,
  prismaWriteViolationFixture,
  responseSanitizedFixture,
  walletMutationViolationFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_6E =
  "docs/ORO_6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_BOUNDARY.md";
const DOC_6D =
  "docs/ORO_6D_LIVE_TRAFFIC_POST_ENABLEMENT_VALIDATION_BOUNDARY.md";
const DOC_6C = "docs/ORO_6C_LIVE_TRAFFIC_ENABLEMENT_BOUNDARY.md";
const WRAPPER = "src/local-smoke-tests/oro6eSmoke.js";
const BOUNDARY =
  "src/game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oro6eLiveTrafficExternalCallAuthorizationRequestBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oro6eLiveTrafficExternalCallAuthorizationRequestBoundarySmoke.js";
const SCRIPT = "smoke:oro-6e";
const LONG_SCRIPT =
  "smoke:oro-6e-live-traffic-external-call-authorization-request-boundary";
const ORO6E_SECRET_SCAN_FILES = Object.freeze([
  DOC_6E,
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
  const doc6e = readRequired(DOC_6E);
  for (const marker of [
    "## Purpose",
    "## Non-goals",
    "## Dependency on ORO-6D",
    "## External/live OroPlay call authorization request boundary",
    "## No-external-network statement",
    "## No-live-OroPlay-call statement",
    "## No-mutation statement",
    "## Request output JSON",
    "## Rollback and blocker criteria",
    "next phase requires separate external call authorization decision",
    "liveTrafficExternalCallAuthorizationRequestBoundaryResult = PASS",
    "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true",
    "oro6dLiveTrafficPostEnablementValidationPassed = true",
    "liveTrafficAllowedFromOro6d = true",
    "liveTrafficEnabledFromOro6d = true",
    "liveTrafficModeFromOro6d = fail_closed_no_mutation",
    "externalCallAuthorizationRequestPrepared = true",
    "externalCallAuthorizationRequestSubmitted = true",
    "externalCallAuthorizationDecisionIssued = false",
    "externalNetworkAllowed = false",
    "externalNetworkCalled = false",
    "liveOroPlayApiCallAllowed = false",
    "liveOroPlayApiCalled = false",
    "walletMutationPerformed = false",
    "ledgerMutationPerformed = false",
    "prismaWritePerformed = false",
    "dbTransactionPerformed = false",
    "secretsLeaked = false",
  ]) {
    assert(doc6e.includes(marker), `${DOC_6E} missing marker ${marker}.`);
  }

  const doc6d = readRequired(DOC_6D);
  for (const marker of [
    "ORO-6E is required for external/live OroPlay call authorization request",
    "ORO-6D does not allow external network or live OroPlay API calls",
  ]) {
    assert(doc6d.includes(marker), `${DOC_6D} missing marker ${marker}.`);
  }

  const doc6c = readRequired(DOC_6C);
  for (const marker of [
    "live traffic remains fail_closed_no_mutation",
    "external/live OroPlay call still blocked",
  ]) {
    assert(doc6c.includes(marker), `${DOC_6C} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[LONG_SCRIPT], `node ${SMOKE}`);
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro6e", "oro-6e", DOC_6E]) {
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
        "ORO-6E submits external/live call authorization request only",
        "no outgoing live OroPlay API call yet",
        "no wallet/ledger mutation",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-6D Closed",
        "## ORO-6E Current",
        "external/live OroPlay call decision still pending",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-6D closed live traffic post-enablement validation boundary",
        "ORO-6E current/live traffic external call authorization request boundary",
        "next phase blocked until external call authorization decision",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-6E Live Traffic External Call Authorization Request Boundary Coverage",
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
  const boundaryText = [BOUNDARY, FIXTURES, DOC_6E].map(readRequired).join("\n");
  for (const marker of unsafeRuntimePatterns) {
    assert(!boundaryText.includes(marker), `ORO-6E files must not contain ${marker}.`);
  }
  for (const file of ORO6E_SECRET_SCAN_FILES) {
    assertNoSensitiveShape(file, readRequired(file));
  }
}

function assertNoDecisionOrCallFlags(summary) {
  assert.strictEqual(summary.externalCallAuthorizationDecisionIssued, false);
  assert.strictEqual(
    summary.externalCallAuthorizationDecisionStatus,
    EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS
  );
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
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
  assert.strictEqual(summary.secretsLeaked, false);
}

function assertCompleteOutput(summary) {
  const expectedKeys = [
    "phase",
    "fixtureId",
    "liveTrafficExternalCallAuthorizationRequestBoundaryResult",
    "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary",
    "oro6dLiveTrafficPostEnablementValidationPassed",
    "liveTrafficAllowedFromOro6d",
    "liveTrafficEnabledFromOro6d",
    "liveTrafficModeFromOro6d",
    "externalCallAuthorizationRequestPrepared",
    "externalCallAuthorizationRequestSubmitted",
    "externalCallAuthorizationRequestStatus",
    "humanApprovalRequired",
    "separateExternalCallDecisionRequired",
    "nextPhaseRequiresExternalCallAuthorizationDecision",
    "externalCallAuthorizationDecisionIssued",
    "externalCallAuthorizationDecisionStatus",
    "externalNetworkAllowed",
    "externalNetworkCalled",
    "liveOroPlayApiCallAllowed",
    "liveOroPlayApiCalled",
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
  assert.strictEqual(summary.phase, "ORO-6E");
  assert.strictEqual(
    summary.fixtureId,
    "happyPathLiveTrafficExternalCallAuthorizationRequestFixture"
  );
  assert.strictEqual(
    summary.liveTrafficExternalCallAuthorizationRequestBoundaryResult,
    PASS
  );
  assert.strictEqual(
    summary.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary,
    true
  );
  assert.strictEqual(summary.oro6dLiveTrafficPostEnablementValidationPassed, true);
  assert.strictEqual(summary.liveTrafficAllowedFromOro6d, true);
  assert.strictEqual(summary.liveTrafficEnabledFromOro6d, true);
  assert.strictEqual(summary.liveTrafficModeFromOro6d, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.externalCallAuthorizationRequestPrepared, true);
  assert.strictEqual(summary.externalCallAuthorizationRequestSubmitted, true);
  assert.strictEqual(
    summary.externalCallAuthorizationRequestStatus,
    EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS
  );
  assert.strictEqual(summary.humanApprovalRequired, true);
  assert.strictEqual(summary.separateExternalCallDecisionRequired, true);
  assert.strictEqual(
    summary.nextPhaseRequiresExternalCallAuthorizationDecision,
    true
  );
  assertNoDecisionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assert.deepStrictEqual(summary.blockers, []);
  assertNoSensitiveShape("ORO-6E happy output", JSON.stringify(summary));
}

function assertHeld(summary, blocker) {
  assert.strictEqual(
    summary.liveTrafficExternalCallAuthorizationRequestBoundaryResult,
    "HOLD"
  );
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assertNoDecisionOrCallFlags(summary);
  assertNoMutationFlags(summary);
  assertNoSensitiveShape("ORO-6E hold output", JSON.stringify(summary));
}

function main() {
  assert.strictEqual(
    typeof ORO6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
    "object"
  );
  assert.strictEqual(
    typeof validateOro6dLiveTrafficPostEnablementValidationRecord,
    "function"
  );
  assert.strictEqual(
    typeof buildLiveTrafficExternalCallAuthorizationRequest,
    "function"
  );
  assert.strictEqual(
    typeof validateLiveTrafficExternalCallAuthorizationRequestBoundary,
    "function"
  );
  assert.strictEqual(typeof validateNoExternalNetworkDuringRequest, "function");
  assert.strictEqual(typeof validateNoLiveOroPlayApiCallDuringRequest, "function");
  assert.strictEqual(typeof validateNoMutationDuringExternalCallRequest, "function");
  assert.strictEqual(
    typeof buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary,
    "function"
  );

  assertDocsAndRegistration();
  assertProtectedRuntimeFilesUntouched();
  assertStaticSafety();

  const happy =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    );
  assertHappyPath(happy);
  assert.strictEqual(
    validateOro6dLiveTrafficPostEnablementValidationRecord(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateLiveTrafficExternalCallAuthorizationRequestBoundary(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoExternalNetworkDuringRequest(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoLiveOroPlayApiCallDuringRequest(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    validateNoMutationDuringExternalCallRequest(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).valid,
    true
  );
  assert.strictEqual(
    buildLiveTrafficExternalCallAuthorizationRequest(
      happyPathLiveTrafficExternalCallAuthorizationRequestFixture
    ).responseSanitized,
    true
  );

  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      missingOro6dValidationRecordFixture
    ),
    "ORO-6D post-enablement validation record is required"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      oro6dValidationNotPassedFixture
    ),
    "ORO-6D post-enablement validation record is required"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      liveTrafficModeNotFailClosedNoMutationFixture
    ),
    "ORO-6D post-enablement validation record is required"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      externalNetworkAlreadyAllowedViolationFixture
    ),
    "external network must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      externalNetworkCalledViolationFixture
    ),
    "external network must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      liveOroPlayApiCallAllowedViolationFixture
    ),
    "live OroPlay API call must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      liveOroPlayApiCallCalledViolationFixture
    ),
    "live OroPlay API call must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      walletMutationViolationFixture
    ),
    "wallet mutation must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      ledgerMutationViolationFixture
    ),
    "ledger mutation must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      prismaWriteViolationFixture
    ),
    "Prisma write and DB transaction must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      dbTransactionViolationFixture
    ),
    "Prisma write and DB transaction must remain absent during external call request"
  );
  assertHeld(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      missingHumanApprovalRequirementFixture
    ),
    "human approval and separate external call decision are required"
  );

  const responseFixtureSummary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
      responseSanitizedFixture
    );
  assertCompleteOutput(responseFixtureSummary);
  assert.strictEqual(
    responseFixtureSummary.liveTrafficExternalCallAuthorizationRequestBoundaryResult,
    PASS
  );
  assertNoDecisionOrCallFlags(responseFixtureSummary);
  assertNoMutationFlags(responseFixtureSummary);
  assert.deepStrictEqual(responseFixtureSummary.blockers, []);

  const allReports =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestFixtures().map(
      buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary
    );
  assert(allReports.length >= 14, "fixture set must cover ORO-6E required cases.");
  for (const report of allReports) {
    assertCompleteOutput(report);
    assertNoDecisionOrCallFlags(report);
    assertNoMutationFlags(report);
  }

  console.log(JSON.stringify(happy, null, 2));
  console.log(
    "ORO-6E live traffic external call authorization request boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-6E live traffic external call authorization request boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
