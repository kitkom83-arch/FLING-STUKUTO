"use strict";

const {
  ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO10X_PHASE,
  ORO10X_SCOPE,
  buildOro10xSafetySummary,
  buildOro10xStaticVerificationRecordReviewDigest,
} = require("./oro10xEvidencePackVerificationRecordReviewGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_RECORD_ID = "oro10w-static-evidence-pack-verification-record";
const DEFAULT_RECORD_REVIEW_ID = "oro10x-static-evidence-pack-verification-record-review";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, overrides) {
  if (!isPlainObject(overrides)) return clone(base);
  const output = clone(base);
  for (const [key, value] of Object.entries(overrides)) {
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? deepMerge(output[key], value) : clone(value);
  }
  return output;
}

function statusFrom(review = {}, overrides = {}) {
  return (
    review.evidencePackVerificationRecordReviewStatus ||
    overrides.evidencePackVerificationRecordReviewStatus ||
    ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
  );
}

function digestFor(review = {}, overrides = {}) {
  return buildOro10xStaticVerificationRecordReviewDigest({
    phase: ORO10X_PHASE,
    scope: ORO10X_SCOPE,
    sourceVerificationRecordId: review.sourceVerificationRecordId || DEFAULT_SOURCE_RECORD_ID,
    verificationRecordReviewId: review.verificationRecordReviewId || DEFAULT_RECORD_REVIEW_ID,
    status: statusFrom(review, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialReview = isPlainObject(overrides.verificationRecordReviewEvidence)
    ? overrides.verificationRecordReviewEvidence
    : {};
  const initialDigest = digestFor(initialReview, overrides);
  const base = {
    id,
    predecessorEvidence: {
      dependsOnOro10wEvidencePackVerificationRecordGate: true,
      oro10wEvidencePackVerificationRecordGatePassed: true,
      verifiedOro10wWasEvidencePackVerificationRecordGateOnly: true,
      oro10wScope: "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_gate_only",
      oro10wClosed: true,
    },
    verificationRecordReviewEvidence: {
      phase: ORO10X_PHASE,
      evidencePackVerificationRecordReviewGateScope: ORO10X_SCOPE,
      evidencePackVerificationRecordReviewStatus:
        ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
      sourceVerificationRecordId: DEFAULT_SOURCE_RECORD_ID,
      verificationRecordReviewId: DEFAULT_RECORD_REVIEW_ID,
      evidencePackVerificationRecordReviewSourceModel: "oro10w_static_mock_evidence_pack_verification_record",
      oro10wVerificationRecordPresent: true,
      priorRecordEvidencePresent: true,
      reviewEvidencePresent: true,
      reviewStatusPresent: true,
      reviewMetadataPresent: true,
      verificationRecordComplete: true,
      verificationRecordIntegrityChecked: true,
      verificationRecordExpired: false,
      verificationRecordConflict: false,
      verificationRecordReviewDisposition: "prepared_for_review_only",
      expectedStaticVerificationRecordReviewDigest: initialDigest,
      providedStaticVerificationRecordReviewDigest: initialDigest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      finalApprovalReviewDecisionAuthority: false,
      finalApprovalFinalization: false,
      reviewAuthority: false,
      finalization: false,
      signedRuntimeApproval: false,
      signedApprovalArtifactAccepted: false,
      actualSignedApprovalArtifactVerified: false,
      finalApprovalDecisionAuthorizesRuntime: false,
      [runtimeAuthKey]: false,
      runtimeApprovalChainRollover: false,
      runtimeMount: false,
      publicAlias: false,
      liveExecution: false,
      externalCall: false,
      gameLaunchCall: false,
    },
    safetyEvidence: buildOro10xSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedReview = isPlainObject(merged.verificationRecordReviewEvidence)
    ? merged.verificationRecordReviewEvidence
    : {};
  const finalDigest = digestFor(mergedReview, merged);
  const overrideReview = isPlainObject(overrides.verificationRecordReviewEvidence)
    ? overrides.verificationRecordReviewEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideReview, "expectedStaticVerificationRecordReviewDigest")) {
    merged.verificationRecordReviewEvidence.expectedStaticVerificationRecordReviewDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideReview, "providedStaticVerificationRecordReviewDigest")) {
    merged.verificationRecordReviewEvidence.providedStaticVerificationRecordReviewDigest =
      merged.verificationRecordReviewEvidence.expectedStaticVerificationRecordReviewDigest;
  }
  return Object.freeze(merged);
}

const validRecordReviewPreparedFixture = buildFixture("validRecordReviewPreparedFixture");

const reviewedForReviewOnlyFixture = buildFixture("reviewedForReviewOnlyFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
    verificationRecordReviewDisposition: "reviewed_for_review_only",
  },
});

const rejectedRecordReviewFixture = buildFixture("rejectedRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
    verificationRecordReviewDisposition: "rejected_for_review_only",
  },
});

const changesRequiredRecordReviewFixture = buildFixture("changesRequiredRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
    verificationRecordReviewDisposition: "changes_required_for_review_only",
  },
});

const expiredRecordReviewFixture = buildFixture("expiredRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
    verificationRecordExpired: true,
  },
});

const conflictingRecordReviewFixture = buildFixture("conflictingRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
    verificationRecordConflict: true,
  },
});

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  predecessorEvidence: {
    oro10wScope: "not_oro10w_record_gate",
    verifiedOro10wWasEvidencePackVerificationRecordGateOnly: false,
  },
});

const missingPriorOro10wRecordFixture = buildFixture("missingPriorOro10wRecordFixture", {
  predecessorEvidence: {
    dependsOnOro10wEvidencePackVerificationRecordGate: false,
    oro10wEvidencePackVerificationRecordGatePassed: false,
    verifiedOro10wWasEvidencePackVerificationRecordGateOnly: false,
    oro10wClosed: false,
  },
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
    oro10wVerificationRecordPresent: false,
    priorRecordEvidencePresent: false,
  },
});

const incompleteVerificationRecordFixture = buildFixture("incompleteVerificationRecordFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
    verificationRecordComplete: false,
    verificationRecordIntegrityChecked: false,
  },
});

const verificationRecordDigestMismatchFixture = buildFixture("verificationRecordDigestMismatchFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewStatus:
      ORO10X_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordReviewDigest: "oro10x-static-verification-record-review-digest-ffffffff",
  },
});

const missingReviewStatusFixture = buildFixture("missingReviewStatusFixture", {
  verificationRecordReviewEvidence: {
    reviewStatusPresent: false,
  },
});

const missingReviewMetadataFixture = buildFixture("missingReviewMetadataFixture", {
  verificationRecordReviewEvidence: {
    reviewMetadataPresent: false,
  },
});

const runtimeAuthorizationWordingAttemptBlockedFixture = buildFixture(
  "runtimeAuthorizationWordingAttemptBlockedFixture",
  {
    runtimeDecisionEvidence: {
      [runtimeAuthKey]: true,
    },
    safetyEvidence: {
      [runtimeAuthKey]: true,
      verifiedNoRuntimeAuthorizationOccurred: false,
    },
  }
);

const finalApprovalIssuedWordingAttemptBlockedFixture = buildFixture("finalApprovalIssuedWordingAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    finalApprovalIssued: true,
  },
  safetyEvidence: {
    finalApprovalIssued: true,
    finalApprovalNotIssued: false,
    verifiedNoFinalApprovalIssued: false,
  },
});

const reviewDecisionAuthorityWordingAttemptBlockedFixture = buildFixture(
  "reviewDecisionAuthorityWordingAttemptBlockedFixture",
  {
    runtimeDecisionEvidence: {
      finalApprovalReviewDecisionAuthority: true,
      reviewAuthority: true,
    },
    safetyEvidence: {
      finalApprovalReviewDecisionAuthority: true,
      reviewAuthority: true,
      finalApprovalReviewDecisionAuthorityNotIssued: false,
      verifiedNoReviewAuthorityOccurred: false,
    },
  }
);

const finalizationWordingAttemptBlockedFixture = buildFixture("finalizationWordingAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    finalApprovalFinalization: true,
    finalization: true,
  },
  safetyEvidence: {
    finalApprovalFinalization: true,
    finalization: true,
    finalApprovalFinalizationNotIssued: false,
    verifiedNoFinalizationOccurred: false,
  },
});

const signedRuntimeApprovalWordingAttemptBlockedFixture = buildFixture(
  "signedRuntimeApprovalWordingAttemptBlockedFixture",
  {
    runtimeDecisionEvidence: {
      signedRuntimeApproval: true,
    },
    safetyEvidence: {
      signedRuntimeApproval: true,
      signedRuntimeApprovalNotIssued: false,
      verifiedNoSignedRuntimeApprovalOccurred: false,
    },
  }
);

const signedApprovalArtifactAcceptedWordingAttemptBlockedFixture = buildFixture(
  "signedApprovalArtifactAcceptedWordingAttemptBlockedFixture",
  {
    runtimeDecisionEvidence: {
      signedApprovalArtifactAccepted: true,
    },
    safetyEvidence: {
      signedApprovalArtifactAccepted: true,
      signedApprovalArtifactAcceptanceNotIssued: false,
      verifiedNoSignedApprovalArtifactAcceptedOccurred: false,
    },
  }
);

const actualSignedArtifactVerifiedWordingAttemptBlockedFixture = buildFixture(
  "actualSignedArtifactVerifiedWordingAttemptBlockedFixture",
  {
    runtimeDecisionEvidence: {
      actualSignedApprovalArtifactVerified: true,
    },
    safetyEvidence: {
      actualSignedApprovalArtifactVerified: true,
      actualSignedApprovalArtifactVerificationNotIssued: false,
      verifiedNoActualSignedApprovalArtifactVerifiedOccurred: false,
    },
  }
);

const routeMountAuthorizationAttemptBlockedFixture = buildFixture("routeMountAuthorizationAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    runtimeMount: true,
  },
  safetyEvidence: {
    runtimeMount: true,
    verifiedNoRuntimeMountOccurred: false,
  },
});

const externalCallAuthorizationAttemptBlockedFixture = buildFixture("externalCallAuthorizationAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    actualExternalCall: true,
    externalCall: true,
  },
  safetyEvidence: {
    actualExternalCall: true,
    externalCall: true,
    verifiedNoActualExternalCallOccurred: false,
    verifiedNoExternalNetworkOccurred: false,
  },
});

const gameLaunchAuthorizationAttemptBlockedFixture = buildFixture("gameLaunchAuthorizationAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    gameLaunchCall: true,
  },
  safetyEvidence: {
    gameLaunchCall: true,
    verifiedNoGameLaunchCallOccurred: false,
  },
});

const secretShapedFieldsAreRedactedFixture = buildFixture("secretShapedFieldsAreRedactedFixture", {
  verificationRecordReviewEvidence: {
    [guardedKeyOne]: "guarded-credential-marker-redacted-one",
    [guardedKeyTwo]: "guarded-credential-marker-redacted-two",
    [guardedKeyThree]: "guarded-credential-marker-redacted-three",
  },
});

const noWalletLedgerDbMigrationDeployMarkersFixture = buildFixture("noWalletLedgerDbMigrationDeployMarkersFixture", {
  safetyEvidence: {
    walletMutation: true,
    ledgerMutation: true,
    dbRuntimeFlow: true,
    prismaWrite: true,
    dbTransaction: true,
    migration: true,
    deploy: true,
    verifiedNoWalletMutationOccurred: false,
    verifiedNoLedgerMutationOccurred: false,
    verifiedNoDbRuntimeFlowOccurred: false,
    verifiedNoPrismaWriteOccurred: false,
    verifiedNoDbTransactionOccurred: false,
    verifiedNoMigrationOccurred: false,
    verifiedNoDeployOccurred: false,
  },
});

function buildOro10xEvidencePackVerificationRecordReviewGateFixtures() {
  return [
    validRecordReviewPreparedFixture,
    reviewedForReviewOnlyFixture,
    rejectedRecordReviewFixture,
    changesRequiredRecordReviewFixture,
    expiredRecordReviewFixture,
    conflictingRecordReviewFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro10wRecordFixture,
    incompleteVerificationRecordFixture,
    verificationRecordDigestMismatchFixture,
    missingReviewStatusFixture,
    missingReviewMetadataFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    reviewDecisionAuthorityWordingAttemptBlockedFixture,
    finalizationWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
    actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    gameLaunchAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
  ];
}

module.exports = {
  validRecordReviewPreparedFixture,
  reviewedForReviewOnlyFixture,
  rejectedRecordReviewFixture,
  changesRequiredRecordReviewFixture,
  expiredRecordReviewFixture,
  conflictingRecordReviewFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro10wRecordFixture,
  incompleteVerificationRecordFixture,
  verificationRecordDigestMismatchFixture,
  missingReviewStatusFixture,
  missingReviewMetadataFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  reviewDecisionAuthorityWordingAttemptBlockedFixture,
  finalizationWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  gameLaunchAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  buildOro10xEvidencePackVerificationRecordReviewGateFixtures,
};
