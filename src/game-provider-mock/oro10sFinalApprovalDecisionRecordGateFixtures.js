"use strict";

const {
  ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS,
  buildOro10sSafetySummary,
} = require("./oro10sFinalApprovalDecisionRecordGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function baseFixture(id, overrides = {}) {
  return Object.freeze({
    id,
    predecessorEvidence: {
      dependsOnOro10rFinalApprovalDecisionReviewGate: true,
      oro10rFinalApprovalDecisionReviewGatePassed: true,
      verifiedOro10rWasFinalApprovalDecisionReviewGateOnly: true,
      oro10rStatus: "mock_decision_received_for_review",
      oro10rScope: "approval_chain_rollover_final_approval_decision_review_gate_only",
      oro10rClosed: true,
    },
    decisionRecordEvidence: {
      phase: "ORO-10S",
      finalApprovalDecisionRecordGateScope: "approval_chain_rollover_final_approval_decision_record_gate_only",
      finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.PREPARED,
      reviewDecisionId: `${id}-reviewed-decision`,
      decisionReviewEvidencePresent: true,
      decisionReviewEvidenceConflicts: false,
      decisionReviewEvidenceExpired: false,
      nextPhaseSeparateApprovalRequired: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    safetyEvidence: buildOro10sSafetySummary(),
    ...overrides,
  });
}

const validReviewedDecisionRecordPreparedFixture = baseFixture("validReviewedDecisionRecordPreparedFixture");

const reviewOnlyAcceptedDecisionRecordFixture = baseFixture("reviewOnlyAcceptedDecisionRecordFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REVIEW_ONLY_ACCEPTED,
  },
});

const rejectedDecisionRecordFixture = baseFixture("rejectedDecisionRecordFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.REJECTED,
  },
});

const changesRequiredDecisionRecordFixture = baseFixture("changesRequiredDecisionRecordFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
  },
});

const expiredDecisionRecordFixture = baseFixture("expiredDecisionRecordFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.EXPIRED,
    decisionReviewEvidenceExpired: true,
  },
});

const conflictingDecisionRecordFixture = baseFixture("conflictingDecisionRecordFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.CONFLICT,
    decisionReviewEvidenceConflicts: true,
  },
});

const invalidReviewDecisionIdFixture = baseFixture("invalidReviewDecisionIdFixture", {
  decisionRecordEvidence: {
    finalApprovalDecisionRecordStatus: ORO10S_FINAL_APPROVAL_DECISION_RECORD_GATE_STATUS.INVALID,
    reviewDecisionId: "bad",
  },
});

const missingDecisionReviewEvidenceFixture = baseFixture("missingDecisionReviewEvidenceFixture", {
  decisionRecordEvidence: {
    decisionReviewEvidencePresent: false,
  },
});

const runtimeAuthorizationWordingAttemptBlockedFixture = baseFixture("runtimeAuthorizationWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10sSafetySummary({
    verifiedNoRuntimeAuthorizationOccurred: false,
    finalApprovalDecisionRuntimeAuthorizationNotIssued: false,
    "runtimeAuthorization": true,
    approvalDecisionAuthorizesRuntime: true,
  }),
});

const finalApprovalIssuedWordingAttemptBlockedFixture = baseFixture("finalApprovalIssuedWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10sSafetySummary({
    verifiedNoFinalApprovalIssued: false,
    finalApprovalNotIssued: false,
    finalApprovalIssued: true,
  }),
});

const signedRuntimeApprovalWordingAttemptBlockedFixture = baseFixture(
  "signedRuntimeApprovalWordingAttemptBlockedFixture",
  {
    safetyEvidence: buildOro10sSafetySummary({
      verifiedNoSignedRuntimeApprovalOccurred: false,
      signedRuntimeApprovalNotIssued: false,
      signedRuntimeApproval: true,
      signedApproval: true,
    }),
  }
);

const signedApprovalArtifactAcceptedWordingAttemptBlockedFixture = baseFixture(
  "signedApprovalArtifactAcceptedWordingAttemptBlockedFixture",
  {
    safetyEvidence: buildOro10sSafetySummary({
      verifiedNoSignedApprovalArtifactAcceptedOccurred: false,
      signedApprovalArtifactAcceptanceNotIssued: false,
      signedApprovalArtifactAccepted: true,
    }),
  }
);

const routeMountAuthorizationAttemptBlockedFixture = baseFixture("routeMountAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10sSafetySummary({
    verifiedNoRuntimeMountOccurred: false,
    verifiedNoRouteAliasOccurred: false,
    verifiedNoPublicAliasOccurred: false,
    runtimeMount: true,
    routeAlias: true,
    publicAlias: true,
  }),
});

const externalCallAuthorizationAttemptBlockedFixture = baseFixture("externalCallAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10sSafetySummary({
    verifiedNoActualExternalCallOccurred: false,
    verifiedNoExternalNetworkOccurred: false,
    verifiedNoLiveOroPlayApiCallOccurred: false,
    verifiedNoGameLaunchCallOccurred: false,
    actualExternalCall: true,
    externalCall: true,
    externalNetworkCalled: true,
    liveOroPlayApiCallAllowed: true,
    liveOroPlayApiCalled: true,
    gameLaunchCall: true,
  }),
});

const secretShapedFieldsAreRedactedFixture = baseFixture("secretShapedFieldsAreRedactedFixture", {
  decisionRecordEvidence: {
    recordToken: "redacted-value-a",
    nestedCredential: {
      clientSecret: "redacted-value-b",
      deviceId: "redacted-value-c",
    },
  },
});

const noWalletLedgerDbMigrationDeployMarkersFixture = baseFixture("noWalletLedgerDbMigrationDeployMarkersFixture", {
  safetyEvidence: buildOro10sSafetySummary({
    verifiedNoWalletMutationOccurred: false,
    verifiedNoLedgerMutationOccurred: false,
    verifiedNoDbRuntimeFlowOccurred: false,
    verifiedNoPrismaWriteOccurred: false,
    verifiedNoDbTransactionOccurred: false,
    verifiedNoMigrationOccurred: false,
    verifiedNoDeployOccurred: false,
    walletMutation: true,
    ledgerMutation: true,
    dbRuntimeFlow: true,
    prismaWrite: true,
    dbTransaction: true,
    migration: true,
    deploy: true,
  }),
});

function buildOro10sFinalApprovalDecisionRecordGateFixtures() {
  return [
    validReviewedDecisionRecordPreparedFixture,
    reviewOnlyAcceptedDecisionRecordFixture,
    rejectedDecisionRecordFixture,
    changesRequiredDecisionRecordFixture,
    expiredDecisionRecordFixture,
    conflictingDecisionRecordFixture,
    invalidReviewDecisionIdFixture,
    missingDecisionReviewEvidenceFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
  ].map(cloneFixture);
}

module.exports = {
  validReviewedDecisionRecordPreparedFixture,
  reviewOnlyAcceptedDecisionRecordFixture,
  rejectedDecisionRecordFixture,
  changesRequiredDecisionRecordFixture,
  expiredDecisionRecordFixture,
  conflictingDecisionRecordFixture,
  invalidReviewDecisionIdFixture,
  missingDecisionReviewEvidenceFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  cloneFixture,
  buildOro10sFinalApprovalDecisionRecordGateFixtures,
};
