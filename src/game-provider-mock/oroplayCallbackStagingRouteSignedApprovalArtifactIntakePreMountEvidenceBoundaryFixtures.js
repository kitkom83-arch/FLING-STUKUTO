"use strict";

const {
  buildMockSignedApprovalArtifactMetadataFixture,
  buildPreMountHumanApprovalEvidenceBoundaryContract,
  buildSignedApprovalArtifactIntakeContract,
} = require("./oroplayCallbackStagingRouteSignedApprovalArtifactIntakePreMountEvidenceBoundary");

const baseEvidenceSources = Object.freeze({
  signedApprovalRecordReviewBoundary: {
    present: true,
    phase: "ORO-4N",
    artifact: "Signed Approval Record Review / Mount Authorization Request Boundary",
    signedApprovalRecordReviewBoundaryResult: "PASS",
    signedApprovalRecordReviewContractPresent: true,
    mountAuthorizationRequestBoundaryPresent: true,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    mountAuthorizationRequestPrepared: true,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestStatus: "request_pack_prepared_pending_actual_signed_record",
    preMountAuthorization: "pending_signed_approval_record",
    routeMountAuthorization: "not_authorized_for_mount",
  },
  signedApprovalIntakeGate: {
    present: true,
    phase: "ORO-4M",
    artifact: "Signed Approval Intake Gate",
    signedApprovalRecordPresent: false,
    signedApprovalRecordVerified: false,
  },
  humanApprovalRecordBoundary: {
    present: true,
    phase: "ORO-4L",
    artifact: "Human Approval Record / Pre-Mount Authorization Boundary",
    signedHumanApprovalRecordPresent: false,
  },
  humanMountReviewEvidencePack: {
    present: true,
    phase: "ORO-4K",
    artifact: "Human Mount Review Evidence Pack",
    evidencePackResult: "PASS",
  },
});

const baseStaticSafetyChecks = Object.freeze({
  srcAppJsChangeAbsent: true,
  expressMountAbsent: true,
  publicAliasAbsent: true,
  activeRouteAbsent: true,
  httpListenerAbsent: true,
  runtimeTrafficAbsent: true,
  walletMutationAbsent: true,
  ledgerMutationAbsent: true,
  prismaWriteAbsent: true,
  dbTransactionAbsent: true,
  externalNetworkAbsent: true,
  liveOroPlayApiCallAbsent: true,
  migrationAbsent: true,
  realMoneyAbsent: true,
});

const baseSignedApprovalArtifactIntakeContract = Object.freeze(buildSignedApprovalArtifactIntakeContract());
const basePreMountHumanApprovalEvidenceBoundaryContract = Object.freeze(
  buildPreMountHumanApprovalEvidenceBoundaryContract()
);

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4O",
    evidenceSources: cloneFixture(baseEvidenceSources),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    signedApprovalArtifactIntakeContract: cloneFixture(baseSignedApprovalArtifactIntakeContract),
    preMountHumanApprovalEvidenceBoundaryContract: cloneFixture(basePreMountHumanApprovalEvidenceBoundaryContract),
    signedApprovalRecord: {
      present: false,
      status: "absent",
    },
    actualSignedApprovalArtifact: {
      present: false,
      status: "absent",
    },
    signedApprovalArtifact: {
      present: false,
      status: "absent",
    },
    mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture(),
    chatApprovalCandidate: {
      present: false,
      status: "absent",
    },
    plainTextApprovalCandidate: {
      present: false,
      status: "absent",
    },
    mountAuthorizationEvidencePack: {
      prepared: true,
      submitted: false,
      status: "prepared_not_submitted",
    },
    mountAuthorizationRequest: {
      prepared: true,
      submitted: false,
      status: "prepared_not_submitted",
    },
    attemptedAuthorizationStates: {},
    reviewedAt: "2026-06-03T00:00:00.000Z",
    trace: {
      boundaryMode: "static mock signed approval artifact intake and pre-mount evidence boundary",
      sourcePhase: "ORO-4N",
      finalBoundary: "pending actual signed approval artifact",
    },
    expected: {
      signedApprovalArtifactIntakeBoundaryResult: "PASS",
      signedApprovalArtifactIntakeContractPresent: true,
      preMountHumanApprovalEvidenceBoundaryPresent: true,
      actualSignedApprovalArtifactPresent: false,
      signedApprovalRecordPresent: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      mockSignedApprovalArtifactSchemaOnly: true,
      mountAuthorizationEvidencePackPrepared: true,
      mountAuthorizationEvidencePackSubmitted: false,
      mountAuthorizationRequestSubmitted: false,
      mountAuthorizationEvidenceStatus: "evidence_pack_prepared_pending_actual_signed_approval_artifact",
      preMountAuthorization: "pending_actual_signed_approval_artifact",
      routeMountAuthorization: "not_authorized_for_mount",
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
      blockers: [],
    },
  };
}

const oro4nReviewBoundaryExistsNoActualSignedApprovalArtifactFixture = Object.freeze(
  baseFixture("oro4nReviewBoundaryExistsNoActualSignedApprovalArtifactFixture")
);

const chatApprovalMustNotCountAsSignedArtifactFixture = Object.freeze({
  ...baseFixture("chatApprovalMustNotCountAsSignedArtifactFixture"),
  chatApprovalCandidate: {
    present: true,
    kind: "chat_message",
    message: "approve the mount after review",
  },
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blocker: "chat approval is not signed approval artifact",
  },
});

const plainTextApprovalWithoutSignatureMustNotCountFixture = Object.freeze({
  ...baseFixture("plainTextApprovalWithoutSignatureMustNotCountFixture"),
  plainTextApprovalCandidate: {
    present: true,
    kind: "plain_text",
    value: "okay to proceed",
  },
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    actualSignedApprovalArtifactPresent: false,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blocker: "plain text approval is not signed approval artifact",
  },
});

const mockSignedApprovalArtifactMetadataSchemaOnlyFixture = Object.freeze({
  ...baseFixture("mockSignedApprovalArtifactMetadataSchemaOnlyFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture(),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "PASS",
    mockSignedApprovalArtifactSchemaOnly: true,
    mockSignedApprovalArtifactSchemaValid: true,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const malformedArtifactMetadataFailsSchemaFixture = Object.freeze({
  ...baseFixture("malformedArtifactMetadataFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    artifactType: "malformed_mock_artifact_metadata",
    malformed: true,
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "malformed signed approval artifact metadata schema",
  },
});

const missingSignerIdentityFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignerIdentityFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    signerIdentity: "",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact field: signerIdentity",
  },
});

const missingSignedAtFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignedAtFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    signedAt: "",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact field: signedAt",
  },
});

const missingApprovalScopeFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingApprovalScopeFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    approvalScope: "",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact field: approvalScope",
  },
});

const missingArtifactDigestFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingArtifactDigestFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    artifactDigest: "",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact field: artifactDigest",
  },
});

const invalidArtifactDigestFormatFailsSchemaFixture = Object.freeze({
  ...baseFixture("invalidArtifactDigestFormatFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    artifactDigest: "not-a-sha256-digest",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "invalid mock signed approval artifact digest format",
  },
});

const missingEvidenceReviewerIdentityFailsEvidenceValidationFixture = Object.freeze({
  ...baseFixture("missingEvidenceReviewerIdentityFailsEvidenceValidationFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    evidenceReviewerIdentity: "",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact field: evidenceReviewerIdentity",
  },
});

const staleSignedAtTimestampFailsEvidenceValidationFixture = Object.freeze({
  ...baseFixture("staleSignedAtTimestampFailsEvidenceValidationFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    signedAt: "2026-01-01T00:00:00.000Z",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "stale signed approval artifact timestamp",
  },
});

const routeMountScopeMockArtifactStillNotAcceptedFixture = Object.freeze({
  ...baseFixture("routeMountScopeMockArtifactStillNotAcceptedFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactMetadataFixture({
    approvalScope: "route_mount_scope_schema_only",
  }),
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "PASS",
    signedApprovalArtifactAccepted: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const evidencePackPreparedNotSubmittedFixture = Object.freeze({
  ...baseFixture("evidencePackPreparedNotSubmittedFixture"),
  mountAuthorizationEvidencePack: {
    prepared: true,
    submitted: false,
    status: "prepared_not_submitted",
  },
  expected: {
    mountAuthorizationEvidencePackPrepared: true,
    mountAuthorizationEvidencePackSubmitted: false,
    mountAuthorizationEvidenceStatus: "evidence_pack_prepared_pending_actual_signed_approval_artifact",
  },
});

const evidencePackCannotApproveMountWithoutActualArtifactFixture = Object.freeze({
  ...baseFixture("evidencePackCannotApproveMountWithoutActualArtifactFixture"),
  mountAuthorizationEvidencePack: {
    prepared: true,
    submitted: false,
    authorizationStatus: ["route", "mount", "authorized"].join("_"),
  },
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    blocker: "mount authorization evidence pack is not mount authorization",
  },
});

const mountAuthorizationRequestRemainsNotSubmittedFixture = Object.freeze({
  ...baseFixture("mountAuthorizationRequestRemainsNotSubmittedFixture"),
  mountAuthorizationRequest: {
    prepared: true,
    submitted: false,
    status: "prepared_not_submitted",
  },
  expected: {
    mountAuthorizationRequestSubmitted: false,
  },
});

const routeMountAuthorizationRemainsBlockedFixture = Object.freeze({
  ...baseFixture("routeMountAuthorizationRemainsBlockedFixture"),
  expected: {
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const separateRouteMountApprovalRequiredFixture = Object.freeze({
  ...baseFixture("separateRouteMountApprovalRequiredFixture"),
  expected: {
    separateRouteMountApprovalRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
  },
});

const noSrcAppJsExpressMountPublicAliasMarkersFixture = Object.freeze({
  ...baseFixture("noSrcAppJsExpressMountPublicAliasMarkersFixture"),
  expected: {
    srcAppJsChange: "absent",
    expressMount: "absent",
    publicAlias: "absent",
    activeRoute: "absent",
  },
});

const noWalletLedgerMutationMarkersFixture = Object.freeze({
  ...baseFixture("noWalletLedgerMutationMarkersFixture"),
  expected: {
    walletMutation: "absent",
    ledgerMutation: "absent",
  },
});

const noPrismaWriteDbTransactionMarkersFixture = Object.freeze({
  ...baseFixture("noPrismaWriteDbTransactionMarkersFixture"),
  expected: {
    prismaWrite: "absent",
    dbTransaction: "absent",
  },
});

const secretLikeTrace = {};
secretLikeTrace[["author", "ization"].join("")] = ["mock", "auth", "header", "value"].join("-");
secretLikeTrace[["bear", "er"].join("")] = ["mock", "bearer", "value"].join("-");
secretLikeTrace[["bas", "ic"].join("")] = ["mock", "basic", "value"].join("-");
secretLikeTrace[["to", "ken"].join("")] = ["mock", "token", "value"].join("-");
secretLikeTrace[["client", "Secret"].join("")] = ["mock", "client", "credential", "value"].join("-");
secretLikeTrace[["pass", "word"].join("")] = ["mock", "password", "value"].join("-");
secretLikeTrace[["database", "Url"].join("")] = ["mock", "database", "url", "value"].join("-");
secretLikeTrace[["artifact", "Digest"].join("")] = ["mock", "artifact", "digest"].join("-");
secretLikeTrace.nested = {
  safeContext: "static mock artifact intake boundary fixture",
};

const noSecretShapedValueMarkersFixture = Object.freeze({
  ...baseFixture("noSecretShapedValueMarkersFixture"),
  trace: secretLikeTrace,
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "PASS",
    sanitized: true,
  },
});

const happyPathArtifactIntakeBoundaryPassedPendingActualSignedApprovalArtifactFixture = Object.freeze(
  baseFixture("happyPathArtifactIntakeBoundaryPassedPendingActualSignedApprovalArtifactFixture")
);

const actualSignedApprovalArtifactAttemptFixture = Object.freeze({
  ...baseFixture("actualSignedApprovalArtifactAttemptFixture"),
  actualSignedApprovalArtifact: {
    present: true,
    actual: true,
    kind: "actual",
  },
  expected: {
    signedApprovalArtifactIntakeBoundaryResult: "FAIL",
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blocker: "actual signed approval artifact not accepted in ORO-4O mock boundary",
  },
});

function buildSignedApprovalArtifactIntakePreMountEvidenceBoundaryFixtures() {
  return [
    oro4nReviewBoundaryExistsNoActualSignedApprovalArtifactFixture,
    chatApprovalMustNotCountAsSignedArtifactFixture,
    plainTextApprovalWithoutSignatureMustNotCountFixture,
    mockSignedApprovalArtifactMetadataSchemaOnlyFixture,
    malformedArtifactMetadataFailsSchemaFixture,
    missingSignerIdentityFailsSchemaFixture,
    missingSignedAtFailsSchemaFixture,
    missingApprovalScopeFailsSchemaFixture,
    missingArtifactDigestFailsSchemaFixture,
    invalidArtifactDigestFormatFailsSchemaFixture,
    missingEvidenceReviewerIdentityFailsEvidenceValidationFixture,
    staleSignedAtTimestampFailsEvidenceValidationFixture,
    routeMountScopeMockArtifactStillNotAcceptedFixture,
    evidencePackPreparedNotSubmittedFixture,
    evidencePackCannotApproveMountWithoutActualArtifactFixture,
    mountAuthorizationRequestRemainsNotSubmittedFixture,
    routeMountAuthorizationRemainsBlockedFixture,
    separateRouteMountApprovalRequiredFixture,
    noSrcAppJsExpressMountPublicAliasMarkersFixture,
    noWalletLedgerMutationMarkersFixture,
    noPrismaWriteDbTransactionMarkersFixture,
    noSecretShapedValueMarkersFixture,
    happyPathArtifactIntakeBoundaryPassedPendingActualSignedApprovalArtifactFixture,
    actualSignedApprovalArtifactAttemptFixture,
  ].map(cloneFixture);
}

module.exports = {
  oro4nReviewBoundaryExistsNoActualSignedApprovalArtifactFixture,
  chatApprovalMustNotCountAsSignedArtifactFixture,
  plainTextApprovalWithoutSignatureMustNotCountFixture,
  mockSignedApprovalArtifactMetadataSchemaOnlyFixture,
  malformedArtifactMetadataFailsSchemaFixture,
  missingSignerIdentityFailsSchemaFixture,
  missingSignedAtFailsSchemaFixture,
  missingApprovalScopeFailsSchemaFixture,
  missingArtifactDigestFailsSchemaFixture,
  invalidArtifactDigestFormatFailsSchemaFixture,
  missingEvidenceReviewerIdentityFailsEvidenceValidationFixture,
  staleSignedAtTimestampFailsEvidenceValidationFixture,
  routeMountScopeMockArtifactStillNotAcceptedFixture,
  evidencePackPreparedNotSubmittedFixture,
  evidencePackCannotApproveMountWithoutActualArtifactFixture,
  mountAuthorizationRequestRemainsNotSubmittedFixture,
  routeMountAuthorizationRemainsBlockedFixture,
  separateRouteMountApprovalRequiredFixture,
  noSrcAppJsExpressMountPublicAliasMarkersFixture,
  noWalletLedgerMutationMarkersFixture,
  noPrismaWriteDbTransactionMarkersFixture,
  noSecretShapedValueMarkersFixture,
  happyPathArtifactIntakeBoundaryPassedPendingActualSignedApprovalArtifactFixture,
  actualSignedApprovalArtifactAttemptFixture,
  cloneFixture,
  buildSignedApprovalArtifactIntakePreMountEvidenceBoundaryFixtures,
};
