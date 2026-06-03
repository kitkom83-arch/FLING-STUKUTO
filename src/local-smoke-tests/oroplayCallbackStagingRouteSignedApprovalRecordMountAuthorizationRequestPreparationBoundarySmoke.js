"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  GATE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PASS,
  PREPARED_NOT_SUBMITTED,
  PRIVATE_OFF_REPO,
  SIGNED_APPROVAL_RECORD_CREATED_PENDING_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION,
  buildSignedApprovalRecordMountAuthorizationRequestPreparationInput,
  evaluateSignedApprovalRecordMountAuthorizationRequestPreparation,
  normalizeSignedApprovalRecordArtifactSha256Chunks,
  validateSignedApprovalRecordMountAuthorizationRequestPreparation,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundary");
const {
  artifactCommittedToRepoFixture,
  attemptedExpressMountFixture,
  attemptedPublicAliasFixture,
  attemptedRuntimeTrafficFixture,
  baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture,
  buildSignedApprovalRecordMountAuthorizationRequestPreparationFixtures,
  finalDecisionIssuedPrematureFixture,
  fullHashLiteralFixture,
  invalidHashChunkFixture,
  ledgerMutationAllowedFixture,
  localAbsolutePathFixture,
  missingArtifactHashRegistryFixture,
  missingHashChunksFixture,
  mountAuthorizationRequestNotPreparedFixture,
  mountAuthorizationRequestSubmittedPrematureFixture,
  mountAuthorizationRequestSubmissionAllowedFixture,
  signatureCommittedToRepoFixture,
  signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture,
  signedApprovalRecordMissingFixture,
  walletMutationAllowedFixture,
} = require("../game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundaryFixtures");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC =
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_RECORD_MOUNT_AUTHORIZATION_REQUEST_PREPARATION_BOUNDARY.md";
const HARNESS =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundary.js";
const FIXTURES =
  "src/game-provider-mock/oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundaryFixtures.js";
const SMOKE =
  "src/local-smoke-tests/oroplayCallbackStagingRouteSignedApprovalRecordMountAuthorizationRequestPreparationBoundarySmoke.js";
const SCRIPT =
  "smoke:oroplay-callback-staging-route-signed-approval-record-mount-authorization-request-preparation-boundary";
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
  "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function readGitIndexText() {
  const gitPath = path.join(ROOT, ".git");
  let gitDirectory = gitPath;
  if (fs.existsSync(gitPath) && fs.statSync(gitPath).isFile()) {
    const gitFile = fs.readFileSync(gitPath, "utf8");
    const match = gitFile.match(/^gitdir:\s*(.+)$/m);
    assert(match, ".git file must point to a gitdir.");
    gitDirectory = path.resolve(ROOT, match[1].trim());
  }
  const indexPath = path.join(gitDirectory, "index");
  assert(fs.existsSync(indexPath), "git index must exist for tracked-file PDF check.");
  return fs.readFileSync(indexPath).toString("latin1");
}

function reportFor(fixture) {
  return evaluateSignedApprovalRecordMountAuthorizationRequestPreparation(fixture);
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
  assert.strictEqual(report.phase, "ORO-4S");
  assert.strictEqual(report.gate, GATE);
  assert.strictEqual(report.signedApprovalRecordMountAuthorizationRequestPreparationResult, PASS);
  assert.strictEqual(report.documentId, "PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001");
  assert.strictEqual(report.artifactFileName, ARTIFACT_FILE_NAME);
  assert.strictEqual(report.artifactStorage, PRIVATE_OFF_REPO);
  assert.strictEqual(
    report.sanitizedPrivateStorageRef,
    "private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf"
  );
  assert(report.sanitizedPrivateStorageRef.startsWith("private://"));
  assert(!report.sanitizedPrivateStorageRef.includes(["C:", "Users"].join("\\")));
  assert.strictEqual(report.signedApprovalRecordId, "PG77-ORO-4S-SIGNED-APPROVAL-RECORD-2026-06-03-001");
  assert.strictEqual(report.signedApprovalRecordType, "owner_signed_approval_artifact_hash_record");
  assert.strictEqual(report.signedApprovalRecordSource, "private_artifact_hash_registry");
  assert.strictEqual(report.signedApprovalRecordStorage, "repo_metadata_only");
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
  assert.strictEqual(report.signedApprovalRecordCreated, true);
  assert.strictEqual(report.signedApprovalRecordPresent, true);
  assert.strictEqual(report.signedApprovalRecordVerifiedForIntake, true);
  assert.strictEqual(report.signedApprovalRecordAcceptedForMountRequestPreparation, true);
  assert.strictEqual(report.signedApprovalRecordAcceptedAsRouteMountAuthorization, false);
  assert.strictEqual(
    report.mountAuthorizationRequestId,
    "PG77-ORO-4S-MOUNT-AUTHORIZATION-REQUEST-DRAFT-2026-06-03-001"
  );
  assert.strictEqual(report.mountAuthorizationRequestPrepared, true);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmissionAllowed, false);
  assert.strictEqual(report.mountAuthorizationRequestStatus, PREPARED_NOT_SUBMITTED);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionPrepared, true);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(
    report.preMountAuthorization,
    SIGNED_APPROVAL_RECORD_CREATED_PENDING_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION
  );
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assert.strictEqual(report.humanAuthorizationRequired, true);
  assert.strictEqual(report.separateRouteMountApprovalRequired, true);
  assert.strictEqual(report.nextPhaseRequiresSeparateAuthorization, true);
  assert(report.removedMountBlockers.includes("missing_actual_signed_approval_artifact"));
  assert(report.removedMountBlockers.includes("missing_signed_approval_record"));
  assert(report.remainingMountBlockers.includes("final_pre_mount_authorization_decision_not_issued"));
  assert(report.remainingMountBlockers.includes("mount_authorization_request_not_submitted"));
  assert(report.remainingMountBlockers.includes("route_mount_authorization_not_granted"));
  assert.deepStrictEqual(report.blockers, []);
  assertNoUndefinedOrNan(report);
  assertResultHasNoSensitiveFields(report);
}

function assertFailed(report, blocker) {
  assert.strictEqual(report.signedApprovalRecordMountAuthorizationRequestPreparationResult, "FAIL");
  assert(report.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(report.signedApprovalArtifactAcceptedAsMountAuthorization, false);
  assert.strictEqual(report.signedApprovalRecordAcceptedAsRouteMountAuthorization, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
  assert.strictEqual(report.mountAuthorizationRequestSubmissionAllowed, false);
  assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
  assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
  assert.strictEqual(report.expressMountAllowed, false);
  assert.strictEqual(report.publicAliasAllowed, false);
  assert.strictEqual(report.runtimeTrafficAllowed, false);
  assertResultHasNoSensitiveFields(report);
}

function assertBaselineHashChunks() {
  const input = buildSignedApprovalRecordMountAuthorizationRequestPreparationInput();
  const chunks = input.artifactRegistryMetadata.sha256Chunks;
  assert.strictEqual(chunks.length, 8, "SHA256 chunks must have 8 chunks.");
  for (const chunk of chunks) {
    assert(/^[0-9A-F]{8}$/.test(chunk), `invalid SHA256 chunk ${chunk}.`);
  }
  const normalized = normalizeSignedApprovalRecordArtifactSha256Chunks(chunks);
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
  const indexText = readGitIndexText();
  assert(!indexText.includes(ARTIFACT_FILE_NAME), "approval PDF must not be tracked.");
  assert(!/ORO-4Q.*OWNER_SIGNED_APPROVAL.*\.pdf/i.test(indexText), "approval PDF must not be tracked.");
}

function assertChangedFilesStaticSafety() {
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

  for (const file of STATIC_SAFETY_FILES) {
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
    "## Phase ORO-4S scope",
    "## Relationship to ORO-4R",
    "## Signed approval artifact private hash registry reference",
    "## Signed approval record creation boundary",
    "## Mount authorization request preparation boundary",
    "## No request submission rule",
    "## No final decision issued rule",
    "## No route mount authorization rule",
    "## No PDF in repository rule",
    "## No signature in repository rule",
    "## No local absolute path in repository rule",
    "## Signed approval record metadata",
    "## Mount authorization request draft metadata",
    "## Safety boundary",
    "## Remaining blockers",
    "## Next phase requirement",
    "ORO-4S is not route mount approval.",
    "ORO-4S creates a signed approval record metadata boundary only.",
    "ORO-4S prepares a mount authorization request package only.",
    "ORO-4S must not submit the mount authorization request.",
    "ORO-4S must not issue final pre-mount authorization.",
    "ORO-4S must not enable route mount.",
    "ORO-4S must not enable Express mount.",
    "ORO-4S must not enable runtime traffic.",
    "ORO-4S must not commit the signed approval PDF.",
    "ORO-4S must not commit a signature.",
    "ORO-4S records only sanitized metadata and hash chunks.",
    "documentId: PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001",
    `artifactFileName: ${ARTIFACT_FILE_NAME}`,
    "artifactStorage: private_off_repo",
    "sanitizedPrivateStorageRef: private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf",
    "artifactCommittedToRepo: false",
    "signatureCommittedToRepo: false",
    "baselineCommit: f97bdb7b109b55aa28960c0c1e544a95279f1386",
    "baselineSafeCiRunId: 26891982447",
    "artifactRegistryCommit: 957b4d2941af642a51f001d0b74c51cf76db28cb",
    "artifactRegistrySafeCiRunId: 26904110250",
    "sha256Chunks: E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE",
    "signedApprovalRecordId: PG77-ORO-4S-SIGNED-APPROVAL-RECORD-2026-06-03-001",
    "signedApprovalRecordType: owner_signed_approval_artifact_hash_record",
    "signedApprovalRecordSource: private_artifact_hash_registry",
    "signedApprovalRecordStorage: repo_metadata_only",
    "signedApprovalRecordCreated: true",
    "signedApprovalRecordPresent: true",
    "signedApprovalRecordVerifiedForIntake: true",
    "signedApprovalRecordAcceptedForMountRequestPreparation: true",
    "signedApprovalRecordAcceptedAsRouteMountAuthorization: false",
    "mountAuthorizationRequestId: PG77-ORO-4S-MOUNT-AUTHORIZATION-REQUEST-DRAFT-2026-06-03-001",
    "mountAuthorizationRequestPrepared: true",
    "mountAuthorizationRequestSubmitted: false",
    "mountAuthorizationRequestSubmissionAllowed: false",
    "mountAuthorizationRequestStatus: prepared_not_submitted",
    "signedApprovalRecordMountAuthorizationRequestPreparationResult: PASS",
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
    "finalPreMountAuthorizationDecisionPrepared: true",
    "finalPreMountAuthorizationDecisionIssued: false",
    "preMountAuthorization: signed_approval_record_created_pending_mount_authorization_request_submission",
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
        "ORO-4S callback staging route signed approval record mount authorization request preparation boundary",
        "/api/oroplay/balance` and `/api/oroplay/transaction` remain not mounted",
        "/api/balance` and `/api/transaction` still have no public alias",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      [
        "## ORO-4S Current",
        "signed approval record metadata and prepares a mount authorization request draft only",
        "still requires separate mount authorization request submission and final decision issuance",
      ],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      [
        "ORO-4S current/signed approval record request preparation",
        "not authorized for mount",
      ],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      [
        "ORO-4S OroPlay Callback Staging Route Signed Approval Record Mount Authorization Request Preparation Boundary Coverage",
        SCRIPT,
        "static/mock/signed-approval-record/request-preparation/no-mount smoke",
      ],
    ],
    [
      "docs/OROPLAY_CALLBACK_STAGING_ROUTE_SIGNED_APPROVAL_ARTIFACT_PRIVATE_HASH_REGISTRY.md",
      [
        "ORO-4S is a signed approval record creation boundary after ORO-4R",
        "Removed by ORO-4S: `missing_signed_approval_record`",
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
  assert.strictEqual(typeof evaluateSignedApprovalRecordMountAuthorizationRequestPreparation, "function");
  assert.strictEqual(typeof validateSignedApprovalRecordMountAuthorizationRequestPreparation, "function");

  assertDocsAndRegistration();
  assertNoActiveRouteMountInApp();
  assertNoTrackedApprovalPdf();
  assertChangedFilesStaticSafety();
  assertBaselineHashChunks();

  assertHappyPath(reportFor(baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture));

  assertFailed(
    reportFor(missingArtifactHashRegistryFixture),
    "owner signed approval artifact private hash registry missing"
  );
  assertFailed(reportFor(missingHashChunksFixture), "signed approval artifact hash chunks missing");
  assertFailed(reportFor(invalidHashChunkFixture), "signed approval artifact hash chunk format invalid");
  assertFailed(
    reportFor(fullHashLiteralFixture),
    "full SHA256 literal must not be stored in registry metadata output"
  );
  assertFailed(reportFor(localAbsolutePathFixture), "local absolute private artifact path must not be recorded");
  assertFailed(reportFor(artifactCommittedToRepoFixture), "signed approval artifact must not be committed to repo");
  assertFailed(reportFor(signatureCommittedToRepoFixture), "signature must not be committed to repo");
  assertFailed(reportFor(signedApprovalRecordMissingFixture), "signed approval record must be created");
  assertFailed(
    reportFor(signedApprovalRecordAcceptedAsRouteMountAuthorizationFixture),
    "signed approval record cannot be accepted as route mount authorization"
  );
  assertFailed(
    reportFor(mountAuthorizationRequestNotPreparedFixture),
    "mount authorization request draft must be prepared"
  );
  assertFailed(
    reportFor(mountAuthorizationRequestSubmittedPrematureFixture),
    "mount authorization request must not be submitted in ORO-4S"
  );
  assertFailed(
    reportFor(mountAuthorizationRequestSubmissionAllowedFixture),
    "mount authorization request submission must not be allowed in ORO-4S"
  );
  assertFailed(
    reportFor(finalDecisionIssuedPrematureFixture),
    "final pre-mount authorization decision must not be issued in ORO-4S"
  );
  assertFailed(reportFor(attemptedExpressMountFixture), "Express mount is not allowed in ORO-4S");
  assertFailed(reportFor(attemptedPublicAliasFixture), "public alias is not allowed in ORO-4S");
  assertFailed(reportFor(attemptedRuntimeTrafficFixture), "runtime traffic is not allowed in ORO-4S");
  assertFailed(
    reportFor(walletMutationAllowedFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.walletMutationAllowed"
  );
  assertFailed(
    reportFor(ledgerMutationAllowedFixture),
    "forbidden runtime authorization marker present: attemptedAuthorizationStates.ledgerMutationAllowed"
  );

  const allReports = buildSignedApprovalRecordMountAuthorizationRequestPreparationFixtures().map(reportFor);
  assert(allReports.length >= 19, "fixture set must include required ORO-4S scenarios.");
  for (const report of allReports) {
    assert.strictEqual(report.signedApprovalArtifactAcceptedAsMountAuthorization, false);
    assert.strictEqual(report.signedApprovalRecordAcceptedAsRouteMountAuthorization, false);
    assert.strictEqual(report.routeMountAuthorization, NOT_AUTHORIZED_FOR_MOUNT);
    assert.strictEqual(report.expressMountAllowed, false);
    assert.strictEqual(report.publicAliasAllowed, false);
    assert.strictEqual(report.runtimeTrafficAllowed, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmitted, false);
    assert.strictEqual(report.mountAuthorizationRequestSubmissionAllowed, false);
    assert.strictEqual(report.finalPreMountAuthorizationDecisionIssued, false);
    assertResultHasNoSensitiveFields(report);
  }

  const validation = validateSignedApprovalRecordMountAuthorizationRequestPreparation(
    baselineSignedApprovalRecordMountAuthorizationRequestPreparationFixture
  );
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);
  assert(validation.removedMountBlockers.includes("missing_actual_signed_approval_artifact"));
  assert(validation.removedMountBlockers.includes("missing_signed_approval_record"));
  assert(validation.remainingMountBlockers.includes("final_pre_mount_authorization_decision_not_issued"));
  assert(validation.remainingMountBlockers.includes("mount_authorization_request_not_submitted"));
  assert(validation.remainingMountBlockers.includes("route_mount_authorization_not_granted"));

  console.log(
    "ORO-4S OroPlay callback staging route signed approval record mount authorization request preparation boundary smoke: PASS"
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ORO-4S OroPlay callback staging route signed approval record mount authorization request preparation boundary smoke: FAIL"
  );
  console.error(error.message);
  process.exitCode = 1;
}
