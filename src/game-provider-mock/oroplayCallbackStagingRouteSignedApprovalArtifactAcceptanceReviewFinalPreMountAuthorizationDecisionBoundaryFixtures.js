"use strict";

const {
  buildFinalPreMountAuthorizationDecisionBoundaryContract,
  buildMockSignedApprovalArtifactAcceptanceReviewFixture,
  buildSignedApprovalArtifactAcceptanceReviewContract,
} = require("./oroplayCallbackStagingRouteSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundary");

const baseEvidenceSources = Object.freeze({
  signedApprovalArtifactIntakeBoundary: {
    present: true,
    phase: "ORO-4O",
    artifact: "Signed Approval Record Artifact Intake / Pre-Mount Human Approval Evidence Boundary",
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
  },
  signedApprovalRecordReviewBoundary: {
    present: true,
    phase: "ORO-4N",
    artifact: "Signed Approval Record Review / Mount Authorization Request Boundary",
    signedApprovalRecordReviewBoundaryResult: "PASS",
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    mountAuthorizationRequestSubmitted: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
  signedApprovalIntakeGate: {
    present: true,
    phase: "ORO-4M",
    artifact: "Signed Approval Intake Gate",
    signedApprovalRecordPresent: false,
    signedApprovalRecordVerified: false,
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

const baseSignedApprovalArtifactAcceptanceReviewContract = Object.freeze(
  buildSignedApprovalArtifactAcceptanceReviewContract()
);
const baseFinalPreMountAuthorizationDecisionBoundaryContract = Object.freeze(
  buildFinalPreMountAuthorizationDecisionBoundaryContract()
);

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4P",
    evidenceSources: cloneFixture(baseEvidenceSources),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    signedApprovalArtifactAcceptanceReviewContract: cloneFixture(baseSignedApprovalArtifactAcceptanceReviewContract),
    finalPreMountAuthorizationDecisionBoundaryContract: cloneFixture(
      baseFinalPreMountAuthorizationDecisionBoundaryContract
    ),
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
    mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture(),
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
    finalPreMountAuthorizationDecisionPack: {
      prepared: true,
      issued: false,
      status: "prepared_not_issued",
    },
    attemptedAuthorizationStates: {},
    reviewedAt: "2026-06-03T00:00:00.000Z",
    trace: {
      boundaryMode: "static mock artifact acceptance review and final pre-mount decision boundary",
      sourcePhase: "ORO-4O",
      finalBoundary: "pending actual signed approval artifact",
    },
    expected: {
      signedApprovalArtifactAcceptanceReviewBoundaryResult: "PASS",
      signedApprovalArtifactAcceptanceReviewContractPresent: true,
      finalPreMountAuthorizationDecisionBoundaryPresent: true,
      actualSignedApprovalArtifactPresent: false,
      signedApprovalRecordPresent: false,
      signedApprovalArtifactAccepted: false,
      signedApprovalArtifactVerified: false,
      mockSignedApprovalArtifactReviewOnly: true,
      acceptanceReviewStatus: "review_boundary_passed_pending_actual_signed_approval_artifact",
      finalPreMountAuthorizationDecisionPrepared: true,
      finalPreMountAuthorizationDecisionIssued: false,
      finalPreMountAuthorizationDecisionStatus: "decision_pack_prepared_pending_actual_signed_approval_artifact",
      mountAuthorizationEvidencePackPrepared: true,
      mountAuthorizationEvidencePackSubmitted: false,
      mountAuthorizationRequestSubmitted: false,
      preMountAuthorization: "pending_actual_signed_approval_artifact",
      routeMountAuthorization: "not_authorized_for_mount",
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
      blockers: [],
    },
  };
}

const oro4oArtifactIntakeBoundaryExistsNoActualSignedApprovalArtifactFixture = Object.freeze(
  baseFixture("oro4oArtifactIntakeBoundaryExistsNoActualSignedApprovalArtifactFixture")
);

const chatApprovalMustNotCountAsSignedArtifactFixture = Object.freeze({
  ...baseFixture("chatApprovalMustNotCountAsSignedArtifactFixture"),
  chatApprovalCandidate: {
    present: true,
    kind: "chat_message",
    message: "approve final pre-mount decision",
  },
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "chat approval is not signed approval artifact",
  },
});

const plainTextApprovalWithoutSignatureMustNotCountFixture = Object.freeze({
  ...baseFixture("plainTextApprovalWithoutSignatureMustNotCountFixture"),
  plainTextApprovalCandidate: {
    present: true,
    kind: "plain_text",
    value: "okay to mount after review",
  },
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "plain text approval is not signed approval artifact",
  },
});

const mockSignedApprovalArtifactMetadataReviewOnlyFixture = Object.freeze({
  ...baseFixture("mockSignedApprovalArtifactMetadataReviewOnlyFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture(),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "PASS",
    mockSignedApprovalArtifactReviewOnly: true,
    mockSignedApprovalArtifactSchemaOnly: true,
    mockSignedApprovalArtifactMetadataOnly: true,
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const malformedArtifactMetadataFailsSchemaFixture = Object.freeze({
  ...baseFixture("malformedArtifactMetadataFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    artifactType: "malformed_mock_artifact_metadata",
    malformed: true,
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "malformed signed approval artifact review metadata schema",
  },
});

const missingSignerIdentityFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignerIdentityFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    signerIdentity: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: signerIdentity",
  },
});

const missingSignedAtFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignedAtFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    signedAt: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: signedAt",
  },
});

const missingApprovalScopeFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingApprovalScopeFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    approvalScope: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: approvalScope",
  },
});

const missingArtifactDigestFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingArtifactDigestFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    artifactDigest: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: artifactDigest",
  },
});

const invalidArtifactDigestFormatFailsSchemaFixture = Object.freeze({
  ...baseFixture("invalidArtifactDigestFormatFailsSchemaFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    artifactDigest: "not-a-sha256-digest",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "invalid mock signed approval artifact digest format",
  },
});

const missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture = Object.freeze({
  ...baseFixture("missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    acceptanceReviewerIdentity: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: acceptanceReviewerIdentity",
  },
});

const missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture = Object.freeze({
  ...baseFixture("missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    finalDecisionReviewerIdentity: "",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed approval artifact review field: finalDecisionReviewerIdentity",
  },
});

const staleSignedAtTimestampFailsAcceptanceReviewValidationFixture = Object.freeze({
  ...baseFixture("staleSignedAtTimestampFailsAcceptanceReviewValidationFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    signedAt: "2026-01-01T00:00:00.000Z",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "stale signed approval artifact timestamp",
  },
});

const routeMountScopeMockArtifactStillNotAcceptedFixture = Object.freeze({
  ...baseFixture("routeMountScopeMockArtifactStillNotAcceptedFixture"),
  mockSignedApprovalArtifact: buildMockSignedApprovalArtifactAcceptanceReviewFixture({
    approvalScope: "route_mount_scope_review_only",
  }),
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "PASS",
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
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "mount authorization evidence pack is not mount authorization",
  },
});

const finalPreMountDecisionPreparedNotIssuedFixture = Object.freeze({
  ...baseFixture("finalPreMountDecisionPreparedNotIssuedFixture"),
  finalPreMountAuthorizationDecisionPack: {
    prepared: true,
    issued: false,
    status: "prepared_not_issued",
  },
  expected: {
    finalPreMountAuthorizationDecisionPrepared: true,
    finalPreMountAuthorizationDecisionIssued: false,
  },
});

const finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture = Object.freeze({
  ...baseFixture("finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture"),
  finalPreMountAuthorizationDecisionPack: {
    prepared: true,
    issued: true,
    status: "issued",
  },
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    blocker: "final pre-mount authorization decision cannot be issued without actual signed approval artifact",
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

const expressMountAllowedRemainsFalseFixture = Object.freeze({
  ...baseFixture("expressMountAllowedRemainsFalseFixture"),
  expected: {
    expressMountAllowed: false,
  },
});

const publicAliasAllowedRemainsFalseFixture = Object.freeze({
  ...baseFixture("publicAliasAllowedRemainsFalseFixture"),
  expected: {
    publicAliasAllowed: false,
  },
});

const runtimeTrafficAllowedRemainsFalseFixture = Object.freeze({
  ...baseFixture("runtimeTrafficAllowedRemainsFalseFixture"),
  expected: {
    runtimeTrafficAllowed: false,
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
  safeContext: "static mock acceptance review decision boundary fixture",
};

const noSecretShapedValueMarkersFixture = Object.freeze({
  ...baseFixture("noSecretShapedValueMarkersFixture"),
  trace: secretLikeTrace,
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "PASS",
    sanitized: true,
  },
});

const happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture = Object.freeze(
  baseFixture("happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture")
);

const actualSignedApprovalArtifactAttemptFixture = Object.freeze({
  ...baseFixture("actualSignedApprovalArtifactAttemptFixture"),
  actualSignedApprovalArtifact: {
    present: true,
    actual: true,
    kind: "actual",
  },
  expected: {
    signedApprovalArtifactAcceptanceReviewBoundaryResult: "FAIL",
    signedApprovalArtifactAccepted: false,
    signedApprovalArtifactVerified: false,
    blocker: "actual signed approval artifact not accepted in ORO-4P acceptance review boundary",
  },
});

function buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures() {
  return [
    oro4oArtifactIntakeBoundaryExistsNoActualSignedApprovalArtifactFixture,
    chatApprovalMustNotCountAsSignedArtifactFixture,
    plainTextApprovalWithoutSignatureMustNotCountFixture,
    mockSignedApprovalArtifactMetadataReviewOnlyFixture,
    malformedArtifactMetadataFailsSchemaFixture,
    missingSignerIdentityFailsSchemaFixture,
    missingSignedAtFailsSchemaFixture,
    missingApprovalScopeFailsSchemaFixture,
    missingArtifactDigestFailsSchemaFixture,
    invalidArtifactDigestFormatFailsSchemaFixture,
    missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture,
    missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture,
    staleSignedAtTimestampFailsAcceptanceReviewValidationFixture,
    routeMountScopeMockArtifactStillNotAcceptedFixture,
    evidencePackPreparedNotSubmittedFixture,
    evidencePackCannotApproveMountWithoutActualArtifactFixture,
    finalPreMountDecisionPreparedNotIssuedFixture,
    finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture,
    mountAuthorizationRequestRemainsNotSubmittedFixture,
    routeMountAuthorizationRemainsBlockedFixture,
    expressMountAllowedRemainsFalseFixture,
    publicAliasAllowedRemainsFalseFixture,
    runtimeTrafficAllowedRemainsFalseFixture,
    separateRouteMountApprovalRequiredFixture,
    noSrcAppJsExpressMountPublicAliasMarkersFixture,
    noWalletLedgerMutationMarkersFixture,
    noPrismaWriteDbTransactionMarkersFixture,
    noSecretShapedValueMarkersFixture,
    happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture,
    actualSignedApprovalArtifactAttemptFixture,
  ].map(cloneFixture);
}

module.exports = {
  oro4oArtifactIntakeBoundaryExistsNoActualSignedApprovalArtifactFixture,
  chatApprovalMustNotCountAsSignedArtifactFixture,
  plainTextApprovalWithoutSignatureMustNotCountFixture,
  mockSignedApprovalArtifactMetadataReviewOnlyFixture,
  malformedArtifactMetadataFailsSchemaFixture,
  missingSignerIdentityFailsSchemaFixture,
  missingSignedAtFailsSchemaFixture,
  missingApprovalScopeFailsSchemaFixture,
  missingArtifactDigestFailsSchemaFixture,
  invalidArtifactDigestFormatFailsSchemaFixture,
  missingAcceptanceReviewerIdentityFailsAcceptanceReviewValidationFixture,
  missingFinalDecisionReviewerIdentityFailsDecisionValidationFixture,
  staleSignedAtTimestampFailsAcceptanceReviewValidationFixture,
  routeMountScopeMockArtifactStillNotAcceptedFixture,
  evidencePackPreparedNotSubmittedFixture,
  evidencePackCannotApproveMountWithoutActualArtifactFixture,
  finalPreMountDecisionPreparedNotIssuedFixture,
  finalPreMountDecisionCannotBeIssuedWithoutActualArtifactFixture,
  mountAuthorizationRequestRemainsNotSubmittedFixture,
  routeMountAuthorizationRemainsBlockedFixture,
  expressMountAllowedRemainsFalseFixture,
  publicAliasAllowedRemainsFalseFixture,
  runtimeTrafficAllowedRemainsFalseFixture,
  separateRouteMountApprovalRequiredFixture,
  noSrcAppJsExpressMountPublicAliasMarkersFixture,
  noWalletLedgerMutationMarkersFixture,
  noPrismaWriteDbTransactionMarkersFixture,
  noSecretShapedValueMarkersFixture,
  happyPathAcceptanceReviewDecisionBoundaryPassedPendingActualSignedApprovalArtifactFixture,
  actualSignedApprovalArtifactAttemptFixture,
  cloneFixture,
  buildSignedApprovalArtifactAcceptanceReviewFinalPreMountAuthorizationDecisionBoundaryFixtures,
};
