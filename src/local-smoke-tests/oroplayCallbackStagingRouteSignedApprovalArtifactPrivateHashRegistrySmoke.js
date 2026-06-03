"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PRIVATE_OFF_REPO,
  SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD,
  buildSignedApprovalArtifactPrivateHashRegistryInput,
  evaluateSignedApprovalArtifactPrivateHashRegistry,
  normalizeSignedApprovalArtifactSha256Chunks,
  validateSignedApprovalArtifactPrivateHashRegistry,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry");
const {
  acceptedAsMountAuthorizationFixture,
  artifactCommittedToRepoFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  baselineOwnerSignedApprovalArtifactPrivateHashFixture,
  buildSignedApprovalArtifactPrivateHashRegistryFixtures,
  chatApprovalOnlyFixture,
  finalDecisionIssuedPrematureFixture,
  fullHashLiteralFixture,
  invalidHashChunkFixture,
  localAbsolutePathFixture,
  missingHashChunksFixture,
  mockArtifactOnlyFixture,
  mountAuthorizationRequestSubmittedPrematureFixture,
  plainTextApprovalOnlyFixture,
  signatureCommittedToRepoFixture,
  signedApprovalRecordPrematureFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistryFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY.md";
const HARNESS =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistry.js";
const FIXTURES =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalArtifactPrivateHashRegistrySmoke.js";
const SCRIPT =
  "smoke:oroplay-callback-staging-route-signed-approval-artifact-private-hash-registry";
const ARTIFACT_FILE_NAME = "PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf";
const STATIC_SAFETY_FILES = Object.freeze([
  DOC,
  HARNESS,
  FIXTURES,
  SMOKE,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "docs/API_MAPPING.md",
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function changedAndNewFiles() {
  return STATIC_SAFETY_FILES.slice();
}

function walkRepoFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "test-results") continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkRepoFiles(absolutePath, output);
    } else {
      output.push(absolutePath);
    }
  }
  return output;
}

function reportFor(fixture) {
  return evaluateSignedApprovalArtifactPrivateHashRegistry(fixture);
}

function assertNoUndefinedOrNan(value) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("undefined"), "result must not include undefined.");
  assert(!serialized.includes("NaN"), "result must not include NaN.");
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
    assert(!serialized.includes(marker), `result leaked sensitive field marker ${marker}.`);
  }
}

function assertHappyPath(report) {
  assert.strictEqual(report.phase, "ORO-4R");
  assert.strictEqual(report.gate, GATE);
  assert.strictEqual(report.signedApprovalArtifactPrivateHashRegistryResult, PASS);
  assert.strictEqual(report.documentId, "PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001");
  assert.strictEqual(report.artifactFileName, ARTIFACT_FILE_NAME);
  assert.strictEqual(report.artifactStorage, PRIVATE_OFF_REPO);
  assert.strictEqual(
    report.sanitizedPrivateStorageRef,
    "private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf"
  );
  assert(report.sanitizedPrivateStorageRef.startsWith("private://"));
  assert(!report.sanitizedPrivateStorageRef.includes(["C:", "Users"].join("\\")));
  assert.strictEqual(report.ownerSignedApprovalArtifactPrivateHashRegistered, true);
  assert.strictEqual(report.actualSignedApprovalArtifactPresent, true);
  assert.strictEqual(report.actualSignedApprovalArtifactStorage, PRIVATE_OFF_REPO);
  assert.strictEqual(report.signedApprovalArtifactCommittedToRepo, false);
  assert.strictEqual(report.signatureCommittedToRepo, false);
  assert.strictEqual(report.signedApprovalArtifactHashChunksPresent, true);
  assert.strictEqual(report.signedApprovalArtifactHashFormatValid, true);
  assert.strictEqual(report.signedApprovalArtifactNormalizedHashLength, 64);
  assert.strictEqual(report.signedApprovalArtifactIntakeRecordPresent, true);
  assert.strictEqual(report.signedApprovalArtifactAcceptedForIntake, true);
  assert.strictEqual(report.signedApprovalArtifactAcceptedAsMountAuthorization, false);
  assert.strictEqual(report.signedApprovalRecordPresent, false);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.mountAuthorizationEvidencePackPrepared, true);
  assert.strictEqual(report.mountAuthorizationEvidencePackSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.preMountAuthorization, SIGNED_ARTIFACT_HASH_REGISTERED_PENDING_APPROVAL_RECORD);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assert.strictEqual(report.humanAuthorizationRequired, true);
  assert.strictEqual(report.separateRouteMountApprovalRequired, true);
  assert.strictEqual(report.nextPhaseRequiresSeparateAuthorization, true);
  assert.deepStrictEqual(report.removedMountBlockers, ["missing_actual_signed_approval_artifact"]);
  assert(report.remainingMountBlockers.includes("missing_signed_approval_record"));
  assert(report.remainingMountBlockers.includes("final_pre_mount_authorization_decision_not_issued"));
  assert(report.remainingMountBlockers.includes("mount_authorization_request_not_submitted"));
  assert(report.remainingMountBlockers.includes("route_mount_authorization_not_granted"));
  assert.deepStrictEqual(report.blockers, []);
  assertNoUndefinedOrNan(report);
  assertResultHasNoSensitiveFields(report);
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.signedApprovalArtifactPrivateHashRegistryResult, "FAIL");
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(report.signedApprovalArtifactAcceptedAsMountAuthorization, false);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assertResultHasNoSensitiveFields(report);
}

function assertBaselineHashChunks() {
  const input = buildSignedApprovalArtifactPrivateHashRegistryInput();
  const chunks = input.documentMetadata.sha256Chunks;
  assert.strictEqual(chunks.length, 8, "SHA256 chunks must have 8 chunks.");
  for (const chunk of chunks) {
    assert(/^[0-9A-F]{8}$/.test(chunk), `invalid SHA256 chunk ${chunk}.`);
  }
  const normalized = normalizeSignedApprovalArtifactSha256Chunks(chunks);
  assert.strictEqual(normalized.length, 64, "normalized SHA256 must have length 64.");
  assert(/^[0-9A-F]{64}$/.test(normalized), "normalized SHA256 must be valid hex.");
}

function assertNoActiveRouteMountInApp() {
  const app = readRequired("src/app.js");
  for (const route of ["/api/oroplay/balance", "/api/oroplay/transaction", "/api/balance", "/api/transaction"]) {
    assert(!app.includes(route), `src/app.js must not contain ${route}.`);
  }
}

function assertNoTrackedApprovalPdf() {
  const repoFiles = walkRepoFiles(ROOT);
  assert(!repoFiles.some((file) => path.basename(file) === ARTIFACT_FILE_NAME), "approval PDF must not exist in repo.");
  assert(
    !repoFiles.some((file) => /ORO-4Q.*OWNER_SIGNED_APPROVAL.*\.pdf$/i.test(file)),
    "approval PDF must not exist in repo."
  );
}

function assertChangedFilesStaticSafety() {
  const files = changedAndNewFiles();
  const privatePathPattern = new RegExp(
    ["C:", "Users", "ADMIN", "OneDrive"].join("[\\\\/]") + ".*PG77-approvals",
    "i"
  );
  const fullShaPattern = /\b[0-9a-fA-F]{64}\b/;
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /DATABASE_URL\s*=\s*\S+/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];

  for (const file of files) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    assert(!privatePathPattern.test(text), `${file} contains local absolute private path.`);
    assert(!fullShaPattern.test(text), `${file} contains full SHA256 literal.`);
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## Phase ORO-4R scope",
    "## Relationship to ORO-4Q",
    "## Owner signed approval artifact private storage boundary",
    "## Private artifact hash registry",
    "## Sanitized artifact metadata",
    "## SHA256 chunked registry rule",
    "## No PDF in repository rule",
    "## No signature in repository rule",
    "## No local absolute path in repository rule",
    "## Actual signed approval artifact present as private/off-repo evidence",
    "## Signed approval artifact intake record present",
    "## Signed approval record still pending",
    "## Mount authorization still not approved",
    "## Final pre-mount decision not-issued boundary",
    "## Route mount still not authorized",
    "## Safety boundary",
    "## Next phase requirement",
    "ORO-4R is not route mount approval.",
    "ORO-4R is a private artifact hash registry boundary only.",
    "ORO-4R must not commit or store the signed PDF.",
    "ORO-4R must not issue final pre-mount authorization",
    "ORO-4R must not submit mount authorization request",
    "ORO-4R must not enable route mount",
    "ORO-4R must not enable Express mount",
    "ORO-4R must not enable runtime traffic",
    "ORO-4R must not accept chat approval or plain text approval as signed approval artifact.",
    "ORO-4R records only owner-provided private artifact metadata and SHA256 chunks.",
    "documentId: PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001",
    `artifactFileName: ${ARTIFACT_FILE_NAME}`,
    "artifactStorage: private_off_repo",
    "sanitizedPrivateStorageRef: private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
    "artifactCommittedToRepo: false",
    "signatureCommittedToRepo: false",
    "ownerIdentity: stored_in_private_artifact_only",
    "approvalOwnerRole: Project Owner / Sole Owner",
    "approvalDate: 2026-06-03",
    "baselineCommit: f97bdb7b109b55aa28960c0c1e544a95279f1386",
    "baselineSafeCiRunId: 26891982447",
    "sha256Chunks: E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE",
    "signedApprovalArtifactPrivateHashRegistryResult: PASS",
    "ownerSignedApprovalArtifactPrivateHashRegistered: true",
    "actualSignedApprovalArtifactPresent: true",
    "actualSignedApprovalArtifactStorage: private_off_repo",
    "signedApprovalArtifactCommittedToRepo: false",
    "signatureCommittedToRepo: false",
    "signedApprovalArtifactHashChunksPresent: true",
    "signedApprovalArtifactHashFormatValid: true",
    "signedApprovalArtifactIntakeRecordPresent: true",
    "signedApprovalArtifactAcceptedForIntake: true",
    "signedApprovalArtifactAcceptedAsMountAuthorization: false",
    "signedApprovalRecordPresent: false",
    "finalPreMountAuthorizationDecisionPrepared: true",
    "finalPreMountAuthorizationDecisionIssued: false",
    "mountAuthorizationEvidencePackPrepared: true",
    "mountAuthorizationEvidencePackSubmitted: false",
    "mountAuthorizationRequestSubmitted: false",
    "preMountAuthorization: signed_artifact_hash_registered_pending_approval_record",
    "routeMountAuthorization: not_authorized_for_mount",
    "expressMountAllowed: false",
    "publicAliasAllowed: false",
    "runtimeTrafficAllowed: false",
    "humanAuthorizationRequired: true",
    "separateRouteMountApprovalRequired: true",
    "nextPhaseRequiresSeparateAuthorization: true",
    "`missing_actual_signed_approval_artifact`",
    "`missing_signed_approval_record`",
    "`final_pre_mount_authorization_decision_not_issued`",
    "`mount_authorization_request_not_submitted`",
    "`route_mount_authorization_not_granted`",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${SMOKE}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [DOC, HARNESS, FIXTURES, SMOKE, SCRIPT]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      "docs/API_MAPPING.md",
      [
        "ORO-4R callback staging route signed approval artifact private hash registry",
        "ORO-4R registers private artifact hash chunks only",
        "POST /api/oroplay/balance` and `POST /api/oroplay/transaction` remain not mounted",
        "POST /api/balance` and `POST /api/transaction` remain without public alias",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-4R Current", "still requires a separate signed approval record", "still requires mount authorization request submission"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-4R current/private signed approval artifact hash registry", "not authorized for mount"],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4R OroPlay Callback Staging Route Signed Approval Artifact Private Hash Registry Coverage",
        SCRIPT,
        "static/mock/private-hash-registry/no-mount smoke",
      ],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_AUTHORIZATION_HOLD_GATE.md",
      [
        "ORO-4R is a private artifact hash registry boundary after ORO-4Q",
        "Removed by ORO-4R: `missing_actual_signed_approval_artifact`",
        "`route_mount_authorization_not_granted`",
      ],
    ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function main() {
  assert.strictEqual(typeof evaluateSignedApprovalArtifactPrivateHashRegistry, "function");
  assert.strictEqual(typeof validateSignedApprovalArtifactPrivateHashRegistry, "function");

  assertDocsAndRegistration();
  assertNoActiveRouteMountInApp();
  assertNoTrackedApprovalPdf();
  assertChangedFilesStaticSafety();
  assertBaselineHashChunks();

  assertHappyPath(reportFor(baselineOwnerSignedApprovalArtifactPrivateHashFixture));

  assertFailed(reportFor(missingHashChunksFixture), "signed approval artifact hash chunks missing");
  assertFailed(reportFor(invalidHashChunkFixture), "signed approval artifact hash chunk format invalid");
  assertFailed(
    reportFor(fullHashLiteralFixture),
    "full SHA256 literal must not be stored in registry metadata output"
  );
  assertFailed(reportFor(localAbsolutePathFixture), "local absolute private artifact path must not be recorded");
  assertFailed(reportFor(artifactCommittedToRepoFixture), "signed approval artifact must not be committed to repo");
  assertFailed(reportFor(signatureCommittedToRepoFixture), "signature must not be committed to repo");
  assertFailed(
    reportFor(acceptedAsMountAuthorizationFixture),
    "signed approval artifact cannot be accepted as mount authorization"
  );
  assertFailed(
    reportFor(signedApprovalRecordPrematureFixture),
    "signed approval record cannot be present before separate signed approval record phase"
  );
  assertFailed(
    reportFor(finalDecisionIssuedPrematureFixture),
    "final pre-mount authorization decision must not be issued in ORO-4R"
  );
  assertFailed(
    reportFor(mountAuthorizationRequestSubmittedPrematureFixture),
    "mount authorization request must not be submitted in ORO-4R"
  );
  assertFailed(reportFor(attemptedExpressMountFixture), "Express mount is not allowed in ORO-4R");
  assertFailed(reportFor(attemptedPublicAliasFixture), "public alias is not allowed in ORO-4R");
  assertFailed(reportFor(attemptedRuntimeTrafficFixture), "runtime traffic is not allowed in ORO-4R");
  assertFailed(reportFor(chatApprovalOnlyFixture), "chat approval cannot be counted as signed approval artifact");
  assertFailed(
    reportFor(plainTextApprovalOnlyFixture),
    "plain text approval cannot be counted as signed approval artifact"
  );
  assertFailed(
    reportFor(mockArtifactOnlyFixture),
    "mock artifact cannot be accepted as actual signed approval artifact"
  );

  const allReports = buildSignedApprovalArtifactPrivateHashRegistryFixtures().map(reportFor);
  assert(allReports.length >= 17, "fixture set must include required ORO-4R scenarios.");
  for (const report of allReports) {
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
    assertResultHasNoSensitiveFields(report);
  }

  const validation = validateSignedApprovalArtifactPrivateHashRegistry(
    baselineOwnerSignedApprovalArtifactPrivateHashFixture
  );
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);
  assert.deepStrictEqual(validation.removedMountBlockers, ["missing_actual_signed_approval_artifact"]);
  assert(validation.remainingMountBlockers.includes("missing_signed_approval_record"));

  console.log("ORO-4R OroPlay callback staging route signed approval artifact private hash registry smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4R OroPlay callback staging route signed approval artifact private hash registry smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
