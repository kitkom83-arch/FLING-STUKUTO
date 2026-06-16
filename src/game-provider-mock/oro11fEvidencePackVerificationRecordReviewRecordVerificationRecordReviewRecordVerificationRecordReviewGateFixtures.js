"use strict";

const {
  ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO11F_PHASE,
  ORO11F_SCOPE,
  buildOro11fSafetySummary,
  buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest,
} = require("./oro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");
const guardedKeyFour = ["database", "Connection", "Marker"].join("");

const DEFAULT_SOURCE_VERIFICATION_RECORD_ID = "oro11e-static-evidence-pack-verification-record";
const DEFAULT_VERIFICATION_RECORD_REVIEW_ID = "oro11f-static-evidence-pack-verification-record-review";

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
    review.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus ||
    overrides.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus ||
    ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
  );
}

function digestFor(review = {}, overrides = {}) {
  return buildOro11fStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewDigest({
    phase: ORO11F_PHASE,
    scope: ORO11F_SCOPE,
    sourceOro11eVerificationRecordId:
      review.sourceOro11eVerificationRecordId || DEFAULT_SOURCE_VERIFICATION_RECORD_ID,
    verificationRecordReviewId:
      review.verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId ||
      DEFAULT_VERIFICATION_RECORD_REVIEW_ID,
    status: statusFrom(review, overrides),
    disposition: review.verificationRecordReviewDisposition || "prepared_for_static_verification_record_review_only",
  });
}

function buildFixture(id, overrides = {}) {
  const initialReview = isPlainObject(overrides.verificationRecordReviewEvidence)
    ? overrides.verificationRecordReviewEvidence
    : {};
  const initialDigest = digestFor(initialReview, overrides);
  const base = {
    id,
    priorVerificationRecord: {
      dependsOnOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate:
        true,
      oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGatePassed: true,
      verifiedOro11eWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateOnly:
        true,
      oro11ePhase: "ORO-11E",
      oro11eScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record_gate_only",
      oro11eClosed: true,
      oro11eVerificationRecordStatus:
        "mock_verification_record_review_record_verification_record_review_record_verification_record_prepared",
      sourceOro11eVerificationRecordId: DEFAULT_SOURCE_VERIFICATION_RECORD_ID,
      oro11eVerificationRecordAsSource: true,
      oro11dReviewRecordVerificationReferenceOnly: true,
      oro11cReviewRecordReferenceOnly: true,
      oro11bReviewReferenceOnly: true,
      oro11aVerificationRecordReferenceOnly: true,
      oro10zVerificationResultReferenceOnly: true,
      oro10yReviewRecordReferenceOnly: true,
      oro10xReviewReferenceOnly: true,
      oro10wRecordReferenceOnly: true,
      oro10vVerificationOutputReferenceOnly: true,
    },
    verificationRecordReviewEvidence: {
      phase: ORO11F_PHASE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateScope:
        ORO11F_SCOPE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
        ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
      sourceOro11eVerificationRecordId: DEFAULT_SOURCE_VERIFICATION_RECORD_ID,
      verificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewId:
        DEFAULT_VERIFICATION_RECORD_REVIEW_ID,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewSourceModel:
        "oro11e_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record",
      oro11eVerificationRecordPresent: true,
      oro11dReviewRecordVerificationReferenceOnlyPresent: true,
      oro11cReviewRecordReferenceOnlyPresent: true,
      oro11bReviewReferenceOnlyPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorVerificationRecordPresent: true,
      verificationRecordReviewEvidencePresent: true,
      verificationRecordReviewStatusPresent: true,
      verificationRecordReviewMetadataPresent: true,
      verificationRecordReviewComplete: true,
      verificationRecordReviewIntegrityChecked: true,
      verificationRecordReviewExpired: false,
      verificationRecordReviewConflict: false,
      verificationRecordReviewDisposition: "prepared_for_static_verification_record_review_only",
      expectedStaticVerificationRecordReviewDigest: initialDigest,
      providedStaticVerificationRecordReviewDigest: initialDigest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
      finalApprovalReviewDecisionAuthority: false,
      auditAuthority: false,
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
    safetyEvidence: buildOro11fSafetySummary(),
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

const validOro11eVerificationRecordReviewPreparedFixture = buildFixture(
  "validOro11eVerificationRecordReviewPreparedFixture"
);

const reviewOnlyVerificationRecordReviewedForReviewOnlyFixture = buildFixture(
  "reviewOnlyVerificationRecordReviewedForReviewOnlyFixture",
  {
    verificationRecordReviewEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
        ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REVIEWED_FOR_REVIEW_ONLY,
      verificationRecordReviewDisposition: "reviewed_for_review_only",
    },
  }
);

const rejectedVerificationRecordReviewFixture = buildFixture("rejectedVerificationRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
    verificationRecordReviewDisposition: "rejected_review_recorded_for_review_only",
  },
});

const changesRequiredVerificationRecordReviewFixture = buildFixture(
  "changesRequiredVerificationRecordReviewFixture",
  {
    verificationRecordReviewEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
        ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
      verificationRecordReviewDisposition: "changes_required_review_recorded_for_review_only",
    },
  }
);

const expiredVerificationRecordReviewFixture = buildFixture("expiredVerificationRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
    verificationRecordReviewExpired: true,
  },
});

const conflictingVerificationRecordReviewFixture = buildFixture("conflictingVerificationRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
    verificationRecordReviewConflict: true,
  },
});

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  priorVerificationRecord: {
    oro11eScope: "not_oro11e_verification_record_gate",
    verifiedOro11eWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateOnly:
      false,
  },
});

const missingPriorOro11eVerificationRecordFixture = buildFixture("missingPriorOro11eVerificationRecordFixture", {
  priorVerificationRecord: {
    dependsOnOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate:
      false,
    oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGatePassed: false,
    verifiedOro11eWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateOnly:
      false,
    oro11eClosed: false,
  },
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
    oro11eVerificationRecordPresent: false,
    priorVerificationRecordPresent: false,
  },
});

const incompleteVerificationRecordReviewFixture = buildFixture("incompleteVerificationRecordReviewFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
    verificationRecordReviewComplete: false,
    verificationRecordReviewIntegrityChecked: false,
  },
});

const verificationRecordReviewDigestMismatchFixture = buildFixture("verificationRecordReviewDigestMismatchFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordReviewDigest: "oro11f-static-verification-record-review-digest-ffffffff",
  },
});

const missingVerificationRecordReviewEvidenceFixture = buildFixture("missingVerificationRecordReviewEvidenceFixture", {
  verificationRecordReviewEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewStatus:
      ORO11F_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
    verificationRecordReviewEvidencePresent: false,
  },
});

const missingVerificationRecordReviewStatusFixture = buildFixture("missingVerificationRecordReviewStatusFixture", {
  verificationRecordReviewEvidence: {
    verificationRecordReviewStatusPresent: false,
  },
});

const missingVerificationRecordReviewMetadataFixture = buildFixture("missingVerificationRecordReviewMetadataFixture", {
  verificationRecordReviewEvidence: {
    verificationRecordReviewMetadataPresent: false,
  },
});

const runtimeAuthorizationWordingAttemptBlockedFixture = buildFixture("runtimeAuthorizationWordingAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    [runtimeAuthKey]: true,
  },
  safetyEvidence: {
    [runtimeAuthKey]: true,
    verifiedNoRuntimeAuthorizationOccurred: false,
  },
});

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

const auditAuthorityWordingAttemptBlockedFixture = buildFixture("auditAuthorityWordingAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    auditAuthority: true,
    auditApproved: true,
  },
  safetyEvidence: {
    auditAuthority: true,
    auditApproved: true,
    auditAuthorityNotIssued: false,
    verifiedNoAuditAuthorityOccurred: false,
  },
});

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
    publicAlias: true,
  },
  safetyEvidence: {
    runtimeMount: true,
    publicAlias: true,
    verifiedNoRuntimeMountOccurred: false,
    verifiedNoPublicAliasOccurred: false,
  },
});

const externalCallAuthorizationAttemptBlockedFixture = buildFixture("externalCallAuthorizationAttemptBlockedFixture", {
  runtimeDecisionEvidence: {
    actualExternalCall: true,
    externalCall: true,
    externalNetworkCalled: true,
  },
  safetyEvidence: {
    actualExternalCall: true,
    externalCall: true,
    externalNetworkCalled: true,
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
    [guardedKeyFour]: "guarded-credential-marker-redacted-four",
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

const liveExecutionAttemptBlockedFixture = buildFixture("liveExecutionAttemptBlockedFixture", {
  safetyEvidence: {
    liveExecution: true,
    liveOroPlayApiCallCalled: true,
    verifiedNoLiveExecutionOccurred: false,
    verifiedNoLiveOroPlayApiCallOccurred: false,
  },
});

function buildOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateFixtures() {
  return [
    validOro11eVerificationRecordReviewPreparedFixture,
    reviewOnlyVerificationRecordReviewedForReviewOnlyFixture,
    rejectedVerificationRecordReviewFixture,
    changesRequiredVerificationRecordReviewFixture,
    expiredVerificationRecordReviewFixture,
    conflictingVerificationRecordReviewFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11eVerificationRecordFixture,
    incompleteVerificationRecordReviewFixture,
    verificationRecordReviewDigestMismatchFixture,
    missingVerificationRecordReviewEvidenceFixture,
    missingVerificationRecordReviewStatusFixture,
    missingVerificationRecordReviewMetadataFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    reviewDecisionAuthorityWordingAttemptBlockedFixture,
    auditAuthorityWordingAttemptBlockedFixture,
    finalizationWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
    actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    gameLaunchAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
    liveExecutionAttemptBlockedFixture,
  ];
}

module.exports = {
  validOro11eVerificationRecordReviewPreparedFixture,
  reviewOnlyVerificationRecordReviewedForReviewOnlyFixture,
  rejectedVerificationRecordReviewFixture,
  changesRequiredVerificationRecordReviewFixture,
  expiredVerificationRecordReviewFixture,
  conflictingVerificationRecordReviewFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11eVerificationRecordFixture,
  incompleteVerificationRecordReviewFixture,
  verificationRecordReviewDigestMismatchFixture,
  missingVerificationRecordReviewEvidenceFixture,
  missingVerificationRecordReviewStatusFixture,
  missingVerificationRecordReviewMetadataFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  reviewDecisionAuthorityWordingAttemptBlockedFixture,
  auditAuthorityWordingAttemptBlockedFixture,
  finalizationWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  gameLaunchAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  liveExecutionAttemptBlockedFixture,
  buildOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateFixtures,
};
