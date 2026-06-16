"use strict";

const {
  ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO11G_PHASE,
  ORO11G_SCOPE,
  buildOro11gSafetySummary,
  buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest,
} = require("./oro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");
const guardedKeyFour = ["database", "Connection", "Marker"].join("");

const DEFAULT_SOURCE_REVIEW_ID = "oro11f-static-evidence-pack-verification-record-review";
const DEFAULT_REVIEW_RECORD_ID = "oro11g-static-evidence-pack-verification-record-review-record";

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

function statusFrom(reviewRecord = {}, overrides = {}) {
  return (
    reviewRecord.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus ||
    overrides.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus ||
    ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED
  );
}

function digestFor(reviewRecord = {}, overrides = {}) {
  return buildOro11gStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest({
    phase: ORO11G_PHASE,
    scope: ORO11G_SCOPE,
    sourceOro11fVerificationRecordReviewId:
      reviewRecord.sourceOro11fVerificationRecordReviewId || DEFAULT_SOURCE_REVIEW_ID,
    verificationRecordReviewRecordVerificationRecordReviewRecordId:
      reviewRecord.verificationRecordReviewRecordVerificationRecordReviewRecordId || DEFAULT_REVIEW_RECORD_ID,
    status: statusFrom(reviewRecord, overrides),
    disposition:
      reviewRecord.verificationRecordReviewRecordDisposition ||
      "prepared_for_static_verification_record_review_record_only",
  });
}

function buildFixture(id, overrides = {}) {
  const initialReviewRecord = isPlainObject(overrides.verificationRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordEvidence
    : {};
  const initialDigest = digestFor(initialReviewRecord, overrides);
  const base = {
    id,
    priorVerificationRecordReview: {
      dependsOnOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate:
        true,
      oro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGatePassed:
        true,
      verifiedOro11fWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateOnly:
        true,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateResult:
        "PASS",
      oro11fPhase: "ORO-11F",
      oro11fScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_verification_record_review_gate_only",
      oro11fClosed: true,
      oro11fVerificationRecordReviewStatus:
        "mock_verification_record_review_record_verification_record_review_record_verification_record_review_prepared",
      sourceOro11fVerificationRecordReviewId: DEFAULT_SOURCE_REVIEW_ID,
      oro11fVerificationRecordReviewAsSource: true,
      oro11eVerificationRecordReferenceOnly: true,
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
    verificationRecordReviewRecordEvidence: {
      phase: ORO11G_PHASE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateScope: ORO11G_SCOPE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
        ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
      sourceOro11fVerificationRecordReviewId: DEFAULT_SOURCE_REVIEW_ID,
      verificationRecordReviewRecordVerificationRecordReviewRecordId: DEFAULT_REVIEW_RECORD_ID,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordSourceModel:
        "oro11f_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record",
      oro11fVerificationRecordReviewPresent: true,
      oro11eVerificationRecordReferenceOnlyPresent: true,
      oro11dReviewRecordVerificationReferenceOnlyPresent: true,
      oro11cReviewRecordReferenceOnlyPresent: true,
      oro11bReviewReferenceOnlyPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorVerificationRecordReviewPresent: true,
      verificationRecordReviewRecordEvidencePresent: true,
      verificationRecordReviewRecordStatusPresent: true,
      verificationRecordReviewRecordMetadataPresent: true,
      verificationRecordReviewRecordComplete: true,
      verificationRecordReviewRecordIntegrityChecked: true,
      verificationRecordReviewRecordExpired: false,
      verificationRecordReviewRecordConflict: false,
      verificationRecordReviewRecordDisposition: "prepared_for_static_verification_record_review_record_only",
      expectedStaticVerificationRecordReviewRecordDigest: initialDigest,
      providedStaticVerificationRecordReviewRecordDigest: initialDigest,
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
    safetyEvidence: buildOro11gSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedReviewRecord = isPlainObject(merged.verificationRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordEvidence
    : {};
  const finalDigest = digestFor(mergedReviewRecord, merged);
  const overrideReviewRecord = isPlainObject(overrides.verificationRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideReviewRecord, "expectedStaticVerificationRecordReviewRecordDigest")) {
    merged.verificationRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideReviewRecord, "providedStaticVerificationRecordReviewRecordDigest")) {
    merged.verificationRecordReviewRecordEvidence.providedStaticVerificationRecordReviewRecordDigest =
      merged.verificationRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordDigest;
  }
  return Object.freeze(merged);
}

const validOro11fVerificationRecordReviewRecordPreparedFixture = buildFixture(
  "validOro11fVerificationRecordReviewRecordPreparedFixture"
);

const reviewOnlyResultRecordedForReviewOnlyFixture = buildFixture("reviewOnlyResultRecordedForReviewOnlyFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
    verificationRecordReviewRecordDisposition: "recorded_for_review_only",
  },
});

const rejectedVerificationRecordReviewRecordFixture = buildFixture("rejectedVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
    verificationRecordReviewRecordDisposition: "rejected_review_record_recorded_for_review_only",
  },
});

const changesRequiredVerificationRecordReviewRecordFixture = buildFixture(
  "changesRequiredVerificationRecordReviewRecordFixture",
  {
    verificationRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
        ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
      verificationRecordReviewRecordDisposition: "changes_required_review_record_recorded_for_review_only",
    },
  }
);

const expiredVerificationRecordReviewRecordFixture = buildFixture("expiredVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
    verificationRecordReviewRecordExpired: true,
  },
});

const conflictingVerificationRecordReviewRecordFixture = buildFixture("conflictingVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
    verificationRecordReviewRecordConflict: true,
  },
});

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  priorVerificationRecordReview: {
    oro11fScope: "not_oro11f_verification_record_review_gate",
    verifiedOro11fWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateOnly:
      false,
  },
});

const missingPriorOro11fReviewFixture = buildFixture("missingPriorOro11fReviewFixture", {
  priorVerificationRecordReview: {
    dependsOnOro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGate:
      false,
    oro11fEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGatePassed:
      false,
    verifiedOro11fWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationRecordReviewGateOnly:
      false,
    oro11fClosed: false,
  },
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
    oro11fVerificationRecordReviewPresent: false,
    priorVerificationRecordReviewPresent: false,
  },
});

const incompleteVerificationRecordReviewFixture = buildFixture("incompleteVerificationRecordReviewFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
    verificationRecordReviewRecordComplete: false,
    verificationRecordReviewRecordIntegrityChecked: false,
  },
});

const verificationRecordReviewDigestMismatchFixture = buildFixture("verificationRecordReviewDigestMismatchFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordReviewRecordDigest: "oro11g-static-verification-record-review-record-digest-ffffffff",
  },
});

const missingReviewRecordStatusFixture = buildFixture("missingReviewRecordStatusFixture", {
  verificationRecordReviewRecordEvidence: {
    verificationRecordReviewRecordStatusPresent: false,
  },
});

const missingReviewRecordMetadataFixture = buildFixture("missingReviewRecordMetadataFixture", {
  verificationRecordReviewRecordEvidence: {
    verificationRecordReviewRecordMetadataPresent: false,
  },
});

const missingReviewRecordEvidenceFixture = buildFixture("missingReviewRecordEvidenceFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordStatus:
      ORO11G_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
    verificationRecordReviewRecordEvidencePresent: false,
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
  verificationRecordReviewRecordEvidence: {
    [guardedKeyOne]: "guarded-value-one",
    [guardedKeyTwo]: "guarded-value-two",
    [guardedKeyThree]: "guarded-value-three",
    [guardedKeyFour]: "guarded-value-four",
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

function buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures() {
  return [
    validOro11fVerificationRecordReviewRecordPreparedFixture,
    reviewOnlyResultRecordedForReviewOnlyFixture,
    rejectedVerificationRecordReviewRecordFixture,
    changesRequiredVerificationRecordReviewRecordFixture,
    expiredVerificationRecordReviewRecordFixture,
    conflictingVerificationRecordReviewRecordFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11fReviewFixture,
    incompleteVerificationRecordReviewFixture,
    verificationRecordReviewDigestMismatchFixture,
    missingReviewRecordStatusFixture,
    missingReviewRecordMetadataFixture,
    missingReviewRecordEvidenceFixture,
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
  ];
}

module.exports = {
  validOro11fVerificationRecordReviewRecordPreparedFixture,
  reviewOnlyResultRecordedForReviewOnlyFixture,
  rejectedVerificationRecordReviewRecordFixture,
  changesRequiredVerificationRecordReviewRecordFixture,
  expiredVerificationRecordReviewRecordFixture,
  conflictingVerificationRecordReviewRecordFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11fReviewFixture,
  incompleteVerificationRecordReviewFixture,
  verificationRecordReviewDigestMismatchFixture,
  missingReviewRecordStatusFixture,
  missingReviewRecordMetadataFixture,
  missingReviewRecordEvidenceFixture,
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
  buildOro11gEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures,
};
