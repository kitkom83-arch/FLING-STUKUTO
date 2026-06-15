"use strict";

const {
  ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS,
  buildOro10rSafetySummary,
} = require("./oro10rFinalApprovalDecisionReviewGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function baseFixture(id, overrides = {}) {
  return Object.freeze({
    id,
    predecessorEvidence: {
      dependsOnOro10qFinalApprovalDecisionIntakeGate: true,
      oro10qFinalApprovalDecisionIntakeGatePassed: true,
      verifiedOro10qWasFinalApprovalDecisionIntakeGateOnly: true,
      oro10qStatus:
        "approval_chain_rollover_final_approval_decision_intake_gate_intaken_pending_separate_final_approval_validation_for_static_contract_only",
      oro10qScope: "approval_chain_rollover_final_approval_decision_intake_gate_only",
      oro10qClosed: true,
    },
    decisionReviewEvidence: {
      phase: "ORO-10R",
      finalApprovalDecisionReviewGateScope: "approval_chain_rollover_final_approval_decision_review_gate_only",
      finalApprovalDecisionReviewStatus:
        ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.RECEIVED_FOR_REVIEW,
      decisionId: `${id}-decision-review`,
      decisionEvidencePresent: true,
      decisionEvidenceConflicts: false,
      decisionEvidenceExpired: false,
      nextPhaseSeparateApprovalRequired: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    safetyEvidence: buildOro10rSafetySummary(),
    ...overrides,
  });
}

const validDecisionReceivedForReviewFixture = baseFixture("validDecisionReceivedForReviewFixture");

const approvedForReviewOnlyDecisionFixture = baseFixture("approvedForReviewOnlyDecisionFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus:
      ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.APPROVED_FOR_REVIEW_ONLY,
  },
});

const rejectedDecisionFixture = baseFixture("rejectedDecisionFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.REJECTED,
  },
});

const changesRequiredDecisionFixture = baseFixture("changesRequiredDecisionFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
  },
});

const expiredDecisionFixture = baseFixture("expiredDecisionFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.EXPIRED,
    decisionEvidenceExpired: true,
  },
});

const conflictingDecisionFixture = baseFixture("conflictingDecisionFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.CONFLICT,
    decisionEvidenceConflicts: true,
  },
});

const invalidDecisionIdFixture = baseFixture("invalidDecisionIdFixture", {
  decisionReviewEvidence: {
    finalApprovalDecisionReviewStatus: ORO10R_FINAL_APPROVAL_DECISION_REVIEW_GATE_STATUS.INVALID,
    decisionId: "bad",
  },
});

const missingDecisionEvidenceFixture = baseFixture("missingDecisionEvidenceFixture", {
  decisionReviewEvidence: {
    decisionEvidencePresent: false,
  },
});

const runtimeAuthorizationWordingAttemptBlockedFixture = baseFixture("runtimeAuthorizationWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10rSafetySummary({
    verifiedNoRuntimeAuthorizationOccurred: false,
    finalApprovalDecisionRuntimeAuthorizationNotIssued: false,
    "runtimeAuthorization": true,
    approvalDecisionAuthorizesRuntime: true,
  }),
});

const finalApprovalIssuedWordingAttemptBlockedFixture = baseFixture("finalApprovalIssuedWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10rSafetySummary({
    verifiedNoFinalApprovalIssued: false,
    finalApprovalNotIssued: false,
    finalApprovalIssued: true,
  }),
});

const signedRuntimeApprovalWordingAttemptBlockedFixture = baseFixture(
  "signedRuntimeApprovalWordingAttemptBlockedFixture",
  {
    safetyEvidence: buildOro10rSafetySummary({
      verifiedNoSignedRuntimeApprovalOccurred: false,
      signedRuntimeApprovalNotIssued: false,
      signedRuntimeApproval: true,
      signedApproval: true,
    }),
  }
);

const routeMountAuthorizationAttemptBlockedFixture = baseFixture("routeMountAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10rSafetySummary({
    verifiedNoRuntimeMountOccurred: false,
    verifiedNoRouteAliasOccurred: false,
    verifiedNoPublicAliasOccurred: false,
    runtimeMount: true,
    routeAlias: true,
    publicAlias: true,
  }),
});

const externalCallAuthorizationAttemptBlockedFixture = baseFixture("externalCallAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10rSafetySummary({
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
  decisionReviewEvidence: {
    reviewerToken: "redacted-value-a",
    nestedCredential: {
      clientSecret: "redacted-value-b",
      deviceId: "redacted-value-c",
    },
  },
});

const noWalletLedgerDbMigrationDeployMarkersFixture = baseFixture("noWalletLedgerDbMigrationDeployMarkersFixture", {
  safetyEvidence: buildOro10rSafetySummary({
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

function buildOro10rFinalApprovalDecisionReviewGateFixtures() {
  return [
    validDecisionReceivedForReviewFixture,
    approvedForReviewOnlyDecisionFixture,
    rejectedDecisionFixture,
    changesRequiredDecisionFixture,
    expiredDecisionFixture,
    conflictingDecisionFixture,
    invalidDecisionIdFixture,
    missingDecisionEvidenceFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
  ].map(cloneFixture);
}

module.exports = {
  validDecisionReceivedForReviewFixture,
  approvedForReviewOnlyDecisionFixture,
  rejectedDecisionFixture,
  changesRequiredDecisionFixture,
  expiredDecisionFixture,
  conflictingDecisionFixture,
  invalidDecisionIdFixture,
  missingDecisionEvidenceFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  cloneFixture,
  buildOro10rFinalApprovalDecisionReviewGateFixtures,
};
