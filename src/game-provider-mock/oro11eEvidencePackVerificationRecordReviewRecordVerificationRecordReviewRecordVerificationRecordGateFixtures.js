"use strict";

const {
  ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS,
  ORO11E_PHASE,
  ORO11E_SCOPE,
  buildOro11eSafetySummary,
  buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest,
} = require("./oro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");
const guardedKeyFour = ["database", "Connection", "Marker"].join("");

const DEFAULT_SOURCE_VERIFICATION_ID = "oro11d-static-evidence-pack-review-record-verification";
const DEFAULT_VERIFICATION_RECORD_ID = "oro11e-static-evidence-pack-verification-record";

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

function statusFrom(record = {}, overrides = {}) {
  return (
    record.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus ||
    overrides.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus ||
    ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
}

function digestFor(record = {}, overrides = {}) {
  return buildOro11eStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordDigest({
    phase: ORO11E_PHASE,
    scope: ORO11E_SCOPE,
    sourceOro11dReviewRecordVerificationId:
      record.sourceOro11dReviewRecordVerificationId || DEFAULT_SOURCE_VERIFICATION_ID,
    verificationRecordId:
      record.verificationRecordReviewRecordVerificationRecordId || DEFAULT_VERIFICATION_RECORD_ID,
    status: statusFrom(record, overrides),
    disposition: record.verificationRecordDisposition || "prepared_for_static_verification_record_only",
  });
}

function buildFixture(id, overrides = {}) {
  const initialRecord = isPlainObject(overrides.verificationRecordEvidence) ? overrides.verificationRecordEvidence : {};
  const initialDigest = digestFor(initialRecord, overrides);
  const base = {
    id,
    priorVerificationEvidence: {
      dependsOnOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate: true,
      oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGatePassed: true,
      verifiedOro11dWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateOnly: true,
      oro11dPhase: "ORO-11D",
      oro11dScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_gate_only",
      oro11dClosed: true,
      oro11dReviewRecordVerificationStatus:
        "mock_verification_record_review_record_verification_record_review_record_verification_prepared",
    },
    verificationRecordEvidence: {
      phase: ORO11E_PHASE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateScope: ORO11E_SCOPE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
        ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
      sourceOro11dReviewRecordVerificationId: DEFAULT_SOURCE_VERIFICATION_ID,
      verificationRecordReviewRecordVerificationRecordId: DEFAULT_VERIFICATION_RECORD_ID,
      evidencePackVerificationRecordReviewRecordVerificationRecordSourceModel:
        "oro11d_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record_verification",
      oro11dReviewRecordVerificationPresent: true,
      oro11cReviewRecordReferenceOnlyPresent: true,
      oro11bReviewReferenceOnlyPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorVerificationEvidencePresent: true,
      verificationRecordEvidencePresent: true,
      verificationRecordStatusPresent: true,
      verificationRecordMetadataPresent: true,
      verificationRecordComplete: true,
      verificationRecordIntegrityChecked: true,
      verificationRecordExpired: false,
      verificationRecordConflict: false,
      verificationRecordDisposition: "prepared_for_static_verification_record_only",
      expectedStaticVerificationRecordDigest: initialDigest,
      providedStaticVerificationRecordDigest: initialDigest,
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
    safetyEvidence: buildOro11eSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedRecord = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const finalDigest = digestFor(mergedRecord, merged);
  const overrideRecord = isPlainObject(overrides.verificationRecordEvidence) ? overrides.verificationRecordEvidence : {};
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "expectedStaticVerificationRecordDigest")) {
    merged.verificationRecordEvidence.expectedStaticVerificationRecordDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "providedStaticVerificationRecordDigest")) {
    merged.verificationRecordEvidence.providedStaticVerificationRecordDigest =
      merged.verificationRecordEvidence.expectedStaticVerificationRecordDigest;
  }
  return Object.freeze(merged);
}

const validOro11dVerificationResultRecordPreparedFixture = buildFixture(
  "validOro11dVerificationResultRecordPreparedFixture"
);

const reviewOnlyVerificationResultRecordedForReviewOnlyFixture = buildFixture(
  "reviewOnlyVerificationResultRecordedForReviewOnlyFixture",
  {
    verificationRecordEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
        ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
      verificationRecordDisposition: "recorded_for_review_only",
    },
  }
);

const rejectedVerificationRecordFixture = buildFixture("rejectedVerificationRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
    verificationRecordDisposition: "rejected_recorded_for_review_only",
  },
});

const changesRequiredVerificationRecordFixture = buildFixture("changesRequiredVerificationRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
    verificationRecordDisposition: "changes_required_recorded_for_review_only",
  },
});

const expiredVerificationRecordFixture = buildFixture("expiredVerificationRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
    verificationRecordExpired: true,
  },
});

const conflictingVerificationRecordFixture = buildFixture("conflictingVerificationRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
    verificationRecordConflict: true,
  },
});

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  priorVerificationEvidence: {
    oro11dScope: "not_oro11d_review_record_verification_gate",
    verifiedOro11dWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateOnly: false,
  },
});

const missingPriorOro11dVerificationFixture = buildFixture("missingPriorOro11dVerificationFixture", {
  priorVerificationEvidence: {
    dependsOnOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate: false,
    oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGatePassed: false,
    verifiedOro11dWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateOnly: false,
    oro11dClosed: false,
  },
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_VERIFICATION,
    oro11dReviewRecordVerificationPresent: false,
    priorVerificationEvidencePresent: false,
  },
});

const incompleteVerificationResultFixture = buildFixture("incompleteVerificationResultFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
    verificationRecordComplete: false,
    verificationRecordIntegrityChecked: false,
  },
});

const verificationDigestMismatchFixture = buildFixture("verificationDigestMismatchFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordDigest: "oro11e-static-verification-record-digest-ffffffff",
  },
});

const missingVerificationRecordEvidenceFixture = buildFixture("missingVerificationRecordEvidenceFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordStatus:
      ORO11E_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
    verificationRecordEvidencePresent: false,
  },
});

const missingVerificationRecordStatusFixture = buildFixture("missingVerificationRecordStatusFixture", {
  verificationRecordEvidence: {
    verificationRecordStatusPresent: false,
  },
});

const missingVerificationRecordMetadataFixture = buildFixture("missingVerificationRecordMetadataFixture", {
  verificationRecordEvidence: {
    verificationRecordMetadataPresent: false,
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
  verificationRecordEvidence: {
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

function buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFixtures() {
  return [
    validOro11dVerificationResultRecordPreparedFixture,
    reviewOnlyVerificationResultRecordedForReviewOnlyFixture,
    rejectedVerificationRecordFixture,
    changesRequiredVerificationRecordFixture,
    expiredVerificationRecordFixture,
    conflictingVerificationRecordFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11dVerificationFixture,
    incompleteVerificationResultFixture,
    verificationDigestMismatchFixture,
    missingVerificationRecordEvidenceFixture,
    missingVerificationRecordStatusFixture,
    missingVerificationRecordMetadataFixture,
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
  validOro11dVerificationResultRecordPreparedFixture,
  reviewOnlyVerificationResultRecordedForReviewOnlyFixture,
  rejectedVerificationRecordFixture,
  changesRequiredVerificationRecordFixture,
  expiredVerificationRecordFixture,
  conflictingVerificationRecordFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11dVerificationFixture,
  incompleteVerificationResultFixture,
  verificationDigestMismatchFixture,
  missingVerificationRecordEvidenceFixture,
  missingVerificationRecordStatusFixture,
  missingVerificationRecordMetadataFixture,
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
  buildOro11eEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordGateFixtures,
};
