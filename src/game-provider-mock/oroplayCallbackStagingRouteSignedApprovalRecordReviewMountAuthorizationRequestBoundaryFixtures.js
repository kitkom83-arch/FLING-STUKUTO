"use strict";

const {
  buildMockSignedApprovalRecordReviewFixture,
  buildMountAuthorizationRequestBoundaryContract,
  buildSignedApprovalRecordReviewContract,
} = require("./oroplayCallbackStagingRouteSignedApprovalRecordReviewMountAuthorizationRequestBoundary");

const baseEvidenceSources = Object.freeze({
  signedApprovalIntakeGate: {
    present: true,
    phase: "ORO-4M",
    artifact: "Signed Approval Intake Gate",
    signedApprovalIntakeGateResult: "PASS",
    signedApprovalRecordPresent: false,
    signedApprovalRecordVerified: false,
    preMountAuthorization: "pending_signed_approval_record",
    routeMountAuthorization: "not_authorized_for_mount",
  },
  routeWiringDesign: {
    present: true,
    phase: "ORO-4F",
    artifact: "Staging Route Wiring Design Contract",
  },
  routePreflight: {
    present: true,
    phase: "ORO-4G",
    artifact: "Staging Route Mount Readiness Checklist",
  },
  dryRunGate: {
    present: true,
    phase: "ORO-4H",
    artifact: "Staging Route Dry-Run Gate",
  },
  internalShadowHarness: {
    present: true,
    phase: "ORO-4I",
    artifact: "Internal Shadow Harness",
  },
  mountDecisionGate: {
    present: true,
    phase: "ORO-4J",
    artifact: "Mount Decision Readiness Gate",
    mountDecision: "manual_review_required",
  },
  humanMountReviewEvidencePack: {
    present: true,
    phase: "ORO-4K",
    artifact: "Human Mount Review Evidence Pack",
    evidencePackResult: "PASS",
  },
  authorizationBoundary: {
    present: true,
    phase: "ORO-4L",
    artifact: "Human Approval Record / Pre-Mount Authorization Boundary",
    signedHumanApprovalRecordPresent: false,
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

const baseSignedApprovalRecordReviewContract = Object.freeze(buildSignedApprovalRecordReviewContract());
const baseMountAuthorizationRequestBoundaryContract = Object.freeze(buildMountAuthorizationRequestBoundaryContract());

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4N",
    evidenceSources: cloneFixture(baseEvidenceSources),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    signedApprovalRecordReviewContract: cloneFixture(baseSignedApprovalRecordReviewContract),
    mountAuthorizationRequestBoundaryContract: cloneFixture(baseMountAuthorizationRequestBoundaryContract),
    signedApprovalRecord: {
      present: false,
      status: "absent",
    },
    actualSignedApprovalRecord: {
      present: false,
      status: "absent",
    },
    mockSignedRecord: {
      present: false,
      status: "absent",
    },
    chatApprovalCandidate: {
      present: false,
      status: "absent",
    },
    plainTextApprovalCandidate: {
      present: false,
      status: "absent",
    },
    mountAuthorizationRequest: {
      prepared: true,
      submitted: false,
      status: "prepared_not_submitted",
    },
    attemptedAuthorizationStates: {},
    reviewedAt: "2026-06-03T00:00:00.000Z",
    trace: {
      boundaryMode: "static mock signed approval record review and request boundary",
      sourcePhase: "ORO-4M",
      finalBoundary: "pending actual signed approval record",
    },
    expected: {
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
      humanAuthorizationRequired: true,
      separateRouteMountApprovalRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
      blockers: [],
    },
  };
}

const oro4mIntakeGateExistsNoActualSignedRecordFixture = Object.freeze(
  baseFixture("oro4mIntakeGateExistsNoActualSignedRecordFixture")
);

const chatApprovalMustNotCountFixture = Object.freeze({
  ...baseFixture("chatApprovalMustNotCountFixture"),
  chatApprovalCandidate: {
    present: true,
    kind: "chat_message",
    message: "approve this route mount request",
  },
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    blocker: "chat approval is not signed approval record",
  },
});

const plainTextApprovalWithoutSignatureFixture = Object.freeze({
  ...baseFixture("plainTextApprovalWithoutSignatureFixture"),
  plainTextApprovalCandidate: {
    present: true,
    kind: "plain_text",
    value: "okay to proceed",
  },
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    blocker: "plain text approval is not signed approval record",
  },
});

const mockSignedRecordSchemaOnlyFixture = Object.freeze({
  ...baseFixture("mockSignedRecordSchemaOnlyFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture(),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "PASS",
    mockSignedRecordSchemaValid: true,
    signedApprovalRecordPresent: false,
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const malformedSignedRecordFailsSchemaFixture = Object.freeze({
  ...baseFixture("malformedSignedRecordFailsSchemaFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    recordType: "malformed_mock_record",
    malformed: true,
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "malformed signed record schema",
  },
});

const missingSignerIdentityFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignerIdentityFailsSchemaFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    signerIdentity: "",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed record field: signerIdentity",
  },
});

const missingSignedAtFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingSignedAtFailsSchemaFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    signedAt: "",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed record field: signedAt",
  },
});

const missingApprovalScopeFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingApprovalScopeFailsSchemaFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    approvalScope: "",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed record field: approvalScope",
  },
});

const missingApprovalArtifactHashFailsSchemaFixture = Object.freeze({
  ...baseFixture("missingApprovalArtifactHashFailsSchemaFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    approvalArtifactHash: "",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed record field: approvalArtifactHash",
  },
});

const missingReviewerIdentityFailsReviewFixture = Object.freeze({
  ...baseFixture("missingReviewerIdentityFailsReviewFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    reviewerIdentity: "",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "missing mock signed record field: reviewerIdentity",
  },
});

const staleTimestampFailsReviewFixture = Object.freeze({
  ...baseFixture("staleTimestampFailsReviewFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    signedAt: "2026-01-01T00:00:00.000Z",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "stale signed record timestamp",
  },
});

const routeMountScopeMockRecordNotActualFixture = Object.freeze({
  ...baseFixture("routeMountScopeMockRecordNotActualFixture"),
  mockSignedRecord: buildMockSignedApprovalRecordReviewFixture({
    approvalScope: "route_mount_scope_review_only",
  }),
  expected: {
    signedApprovalRecordReviewBoundaryResult: "PASS",
    signedApprovalRecordAccepted: false,
    routeMountAuthorization: "not_authorized_for_mount",
  },
});

const requestPackPreparedNotSubmittedFixture = Object.freeze({
  ...baseFixture("requestPackPreparedNotSubmittedFixture"),
  mountAuthorizationRequest: {
    prepared: true,
    submitted: false,
    status: "prepared_not_submitted",
  },
  expected: {
    mountAuthorizationRequestPrepared: true,
    mountAuthorizationRequestSubmitted: false,
    mountAuthorizationRequestStatus: "request_pack_prepared_pending_actual_signed_record",
  },
});

const requestCannotAuthorizeWithoutActualRecordFixture = Object.freeze({
  ...baseFixture("requestCannotAuthorizeWithoutActualRecordFixture"),
  mountAuthorizationRequest: {
    prepared: true,
    submitted: false,
    authorizationStatus: ["route", "mount", "authorized"].join("_"),
  },
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    blocker: "mount authorization request is not authorization",
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

const noExpressMountOrPublicAliasMarkersFixture = Object.freeze({
  ...baseFixture("noExpressMountOrPublicAliasMarkersFixture"),
  expected: {
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

const noPrismaWriteOrDbTransactionMarkersFixture = Object.freeze({
  ...baseFixture("noPrismaWriteOrDbTransactionMarkersFixture"),
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
secretLikeTrace[["approval", "Artifact", "Hash"].join("")] = ["mock", "artifact", "hash"].join("-");
secretLikeTrace.nested = {
  safeContext: "static mock boundary fixture",
};

const noSecretShapedValueMarkersFixture = Object.freeze({
  ...baseFixture("noSecretShapedValueMarkersFixture"),
  trace: secretLikeTrace,
  expected: {
    signedApprovalRecordReviewBoundaryResult: "PASS",
    sanitized: true,
  },
});

const happyPathRequestBoundaryPassedPendingActualSignedRecordFixture = Object.freeze(
  baseFixture("happyPathRequestBoundaryPassedPendingActualSignedRecordFixture")
);

const actualSignedApprovalRecordAttemptFixture = Object.freeze({
  ...baseFixture("actualSignedApprovalRecordAttemptFixture"),
  actualSignedApprovalRecord: {
    present: true,
    actual: true,
    kind: "actual",
  },
  expected: {
    signedApprovalRecordReviewBoundaryResult: "FAIL",
    signedApprovalRecordAccepted: false,
    signedApprovalRecordVerified: false,
    blocker: "actual signed approval record not accepted in ORO-4N mock boundary",
  },
});

function buildSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures() {
  return [
    oro4mIntakeGateExistsNoActualSignedRecordFixture,
    chatApprovalMustNotCountFixture,
    plainTextApprovalWithoutSignatureFixture,
    mockSignedRecordSchemaOnlyFixture,
    malformedSignedRecordFailsSchemaFixture,
    missingSignerIdentityFailsSchemaFixture,
    missingSignedAtFailsSchemaFixture,
    missingApprovalScopeFailsSchemaFixture,
    missingApprovalArtifactHashFailsSchemaFixture,
    missingReviewerIdentityFailsReviewFixture,
    staleTimestampFailsReviewFixture,
    routeMountScopeMockRecordNotActualFixture,
    requestPackPreparedNotSubmittedFixture,
    requestCannotAuthorizeWithoutActualRecordFixture,
    routeMountAuthorizationRemainsBlockedFixture,
    separateRouteMountApprovalRequiredFixture,
    noExpressMountOrPublicAliasMarkersFixture,
    noWalletLedgerMutationMarkersFixture,
    noPrismaWriteOrDbTransactionMarkersFixture,
    noSecretShapedValueMarkersFixture,
    happyPathRequestBoundaryPassedPendingActualSignedRecordFixture,
    actualSignedApprovalRecordAttemptFixture,
  ].map(cloneFixture);
}

module.exports = {
  oro4mIntakeGateExistsNoActualSignedRecordFixture,
  chatApprovalMustNotCountFixture,
  plainTextApprovalWithoutSignatureFixture,
  mockSignedRecordSchemaOnlyFixture,
  malformedSignedRecordFailsSchemaFixture,
  missingSignerIdentityFailsSchemaFixture,
  missingSignedAtFailsSchemaFixture,
  missingApprovalScopeFailsSchemaFixture,
  missingApprovalArtifactHashFailsSchemaFixture,
  missingReviewerIdentityFailsReviewFixture,
  staleTimestampFailsReviewFixture,
  routeMountScopeMockRecordNotActualFixture,
  requestPackPreparedNotSubmittedFixture,
  requestCannotAuthorizeWithoutActualRecordFixture,
  routeMountAuthorizationRemainsBlockedFixture,
  separateRouteMountApprovalRequiredFixture,
  noExpressMountOrPublicAliasMarkersFixture,
  noWalletLedgerMutationMarkersFixture,
  noPrismaWriteOrDbTransactionMarkersFixture,
  noSecretShapedValueMarkersFixture,
  happyPathRequestBoundaryPassedPendingActualSignedRecordFixture,
  actualSignedApprovalRecordAttemptFixture,
  cloneFixture,
  buildSignedApprovalRecordReviewMountAuthorizationRequestBoundaryFixtures,
};
