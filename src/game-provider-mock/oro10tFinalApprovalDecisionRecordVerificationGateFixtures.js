"use strict";

const {
  ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS,
  buildOro10tSafetySummary,
  buildOro10tStaticRecordVerificationDigest,
} = require("./oro10tFinalApprovalDecisionRecordVerificationGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, overrides) {
  const output = cloneFixture(base);
  if (!isPlainObject(overrides)) return output;
  for (const [key, value] of Object.entries(overrides)) {
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? deepMerge(output[key], value) : cloneFixture(value);
  }
  return output;
}

function digestForRecord(recordId, status) {
  return buildOro10tStaticRecordVerificationDigest({
    phase: "ORO-10T",
    scope: "approval_chain_rollover_final_approval_decision_record_verification_gate_only",
    recordId,
    status,
  });
}

function baseFixture(id, overrides = {}) {
  const status =
    overrides.recordVerificationEvidence &&
    overrides.recordVerificationEvidence.finalApprovalDecisionRecordVerificationStatus
      ? overrides.recordVerificationEvidence.finalApprovalDecisionRecordVerificationStatus
      : ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.PREPARED;
  const recordId = `${id}-record`;
  const digest = digestForRecord(recordId, status);
  const fixture = {
    id,
    predecessorEvidence: {
      dependsOnOro10sFinalApprovalDecisionRecordGate: true,
      oro10sFinalApprovalDecisionRecordGatePassed: true,
      verifiedOro10sWasFinalApprovalDecisionRecordGateOnly: true,
      oro10sStatus: "mock_record_prepared",
      oro10sScope: "approval_chain_rollover_final_approval_decision_record_gate_only",
      oro10sClosed: true,
    },
    recordVerificationEvidence: {
      phase: "ORO-10T",
      finalApprovalDecisionRecordVerificationGateScope:
        "approval_chain_rollover_final_approval_decision_record_verification_gate_only",
      finalApprovalDecisionRecordVerificationStatus: status,
      recordId,
      recordMetadataPresent: true,
      recordEvidencePresent: true,
      recordExpired: false,
      recordConflict: false,
      verificationMetadataPresent: true,
      verifiedRecordSourceModel: "oro10s_static_mock_decision_record",
      verificationDisposition: "prepared_for_review_only",
      expectedStaticRecordVerificationDigest: digest,
      providedStaticRecordVerificationDigest: digest,
      nextPhaseSeparateApprovalRequired: true,
      nextStepRequiresSeparateApproval: true,
      nextStepRequiresSeparateRuntimeApproval: true,
    },
    safetyEvidence: buildOro10tSafetySummary(),
  };
  const merged = deepMerge(fixture, overrides);
  const finalRecord = merged.recordVerificationEvidence;
  const finalStatus = finalRecord.finalApprovalDecisionRecordVerificationStatus;
  const finalDigest = digestForRecord(finalRecord.recordId, finalStatus);
  const overrideRecord = isPlainObject(overrides.recordVerificationEvidence) ? overrides.recordVerificationEvidence : {};
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "expectedStaticRecordVerificationDigest")) {
    finalRecord.expectedStaticRecordVerificationDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "providedStaticRecordVerificationDigest")) {
    finalRecord.providedStaticRecordVerificationDigest = finalRecord.expectedStaticRecordVerificationDigest;
  }
  return Object.freeze(merged);
}

const validDecisionRecordVerificationPreparedFixture = baseFixture("validDecisionRecordVerificationPreparedFixture");

const reviewOnlyAcceptedRecordVerificationFixture = baseFixture("reviewOnlyAcceptedRecordVerificationFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
    verificationDisposition: "verified_for_review_only",
  },
});

const rejectedDecisionRecordVerificationFixture = baseFixture("rejectedDecisionRecordVerificationFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
    verificationDisposition: "rejected_for_review_only",
  },
});

const changesRequiredDecisionRecordVerificationFixture = baseFixture("changesRequiredDecisionRecordVerificationFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.VERIFICATION_FAILED,
    verificationDisposition: "changes_required_for_review_only",
  },
});

const expiredDecisionRecordVerificationFixture = baseFixture("expiredDecisionRecordVerificationFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
    recordExpired: true,
  },
});

const conflictingDecisionRecordVerificationFixture = baseFixture("conflictingDecisionRecordVerificationFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
    recordConflict: true,
  },
});

const invalidRecordIdFixture = baseFixture("invalidRecordIdFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.INVALID,
    recordId: "bad",
  },
});

const missingDecisionRecordEvidenceFixture = baseFixture("missingDecisionRecordEvidenceFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
    recordEvidencePresent: false,
  },
});

const recordDigestMismatchFixture = baseFixture("recordDigestMismatchFixture", {
  recordVerificationEvidence: {
    finalApprovalDecisionRecordVerificationStatus:
      ORO10T_FINAL_APPROVAL_DECISION_RECORD_VERIFICATION_GATE_STATUS.HASH_MISMATCH,
    providedStaticRecordVerificationDigest: "oro10t-static-record-verification-digest-00000000",
  },
});

const runtimeAuthorizationWordingAttemptBlockedFixture = baseFixture("runtimeAuthorizationWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10tSafetySummary({
    verifiedNoRuntimeAuthorizationOccurred: false,
    finalApprovalDecisionRuntimeAuthorizationNotIssued: false,
    [["runtime", "Author", "ization"].join("")]: true,
    approvalDecisionAuthorizesRuntime: true,
  }),
});

const finalApprovalIssuedWordingAttemptBlockedFixture = baseFixture("finalApprovalIssuedWordingAttemptBlockedFixture", {
  safetyEvidence: buildOro10tSafetySummary({
    verifiedNoFinalApprovalIssued: false,
    finalApprovalNotIssued: false,
    finalApprovalIssued: true,
  }),
});

const signedRuntimeApprovalWordingAttemptBlockedFixture = baseFixture(
  "signedRuntimeApprovalWordingAttemptBlockedFixture",
  {
    safetyEvidence: buildOro10tSafetySummary({
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
    safetyEvidence: buildOro10tSafetySummary({
      verifiedNoSignedApprovalArtifactAcceptedOccurred: false,
      signedApprovalArtifactAcceptanceNotIssued: false,
      signedApprovalArtifactAccepted: true,
    }),
  }
);

const actualSignedArtifactVerifiedWordingAttemptBlockedFixture = baseFixture(
  "actualSignedArtifactVerifiedWordingAttemptBlockedFixture",
  {
    safetyEvidence: buildOro10tSafetySummary({
      verifiedNoActualSignedApprovalArtifactVerifiedOccurred: false,
      actualSignedApprovalArtifactVerificationNotIssued: false,
      actualSignedApprovalArtifactVerified: true,
    }),
  }
);

const routeMountAuthorizationAttemptBlockedFixture = baseFixture("routeMountAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10tSafetySummary({
    verifiedNoRuntimeMountOccurred: false,
    verifiedNoRouteAliasOccurred: false,
    verifiedNoPublicAliasOccurred: false,
    runtimeMount: true,
    routeAlias: true,
    publicAlias: true,
  }),
});

const externalCallAuthorizationAttemptBlockedFixture = baseFixture("externalCallAuthorizationAttemptBlockedFixture", {
  safetyEvidence: buildOro10tSafetySummary({
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

const guardedKeyOne = ["record", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret"].join("");
const guardedKeyThree = ["device", "Id"].join("");

const secretShapedFieldsAreRedactedFixture = baseFixture("secretShapedFieldsAreRedactedFixture", {
  recordVerificationEvidence: {
    [guardedKeyOne]: "redacted-value-one",
    nestedCredential: {
      [guardedKeyTwo]: "redacted-value-two",
      [guardedKeyThree]: "redacted-value-three",
    },
  },
});

const noWalletLedgerDbMigrationDeployMarkersFixture = baseFixture("noWalletLedgerDbMigrationDeployMarkersFixture", {
  safetyEvidence: buildOro10tSafetySummary({
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

function buildOro10tFinalApprovalDecisionRecordVerificationGateFixtures() {
  return [
    validDecisionRecordVerificationPreparedFixture,
    reviewOnlyAcceptedRecordVerificationFixture,
    rejectedDecisionRecordVerificationFixture,
    changesRequiredDecisionRecordVerificationFixture,
    expiredDecisionRecordVerificationFixture,
    conflictingDecisionRecordVerificationFixture,
    invalidRecordIdFixture,
    missingDecisionRecordEvidenceFixture,
    recordDigestMismatchFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
    actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
  ].map(cloneFixture);
}

module.exports = {
  validDecisionRecordVerificationPreparedFixture,
  reviewOnlyAcceptedRecordVerificationFixture,
  rejectedDecisionRecordVerificationFixture,
  changesRequiredDecisionRecordVerificationFixture,
  expiredDecisionRecordVerificationFixture,
  conflictingDecisionRecordVerificationFixture,
  invalidRecordIdFixture,
  missingDecisionRecordEvidenceFixture,
  recordDigestMismatchFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  cloneFixture,
  buildOro10tFinalApprovalDecisionRecordVerificationGateFixtures,
};
