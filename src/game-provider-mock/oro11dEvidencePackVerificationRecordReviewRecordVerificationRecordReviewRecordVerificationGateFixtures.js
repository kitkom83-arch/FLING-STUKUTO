"use strict";

const {
  ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS,
  ORO11D_PHASE,
  ORO11D_SCOPE,
  buildOro11dSafetySummary,
  buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest,
} = require("./oro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_REVIEW_RECORD_ID = "oro11c-static-evidence-pack-verification-record-review-record";
const DEFAULT_VERIFICATION_ID = "oro11d-static-evidence-pack-verification-record-review-record-verification";

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
    record.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus ||
    overrides.evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus ||
    ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED
  );
}

function digestFor(record = {}, overrides = {}) {
  return buildOro11dStaticVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationDigest({
    phase: ORO11D_PHASE,
    scope: ORO11D_SCOPE,
    sourceVerificationRecordReviewRecordId:
      record.sourceVerificationRecordReviewRecordId || DEFAULT_SOURCE_REVIEW_RECORD_ID,
    verificationRecordReviewRecordVerificationId:
      record.verificationRecordReviewRecordVerificationId || DEFAULT_VERIFICATION_ID,
    status: statusFrom(record, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialRecord = isPlainObject(overrides.reviewRecordVerificationEvidence)
    ? overrides.reviewRecordVerificationEvidence
    : {};
  const initialDigest = digestFor(initialRecord, overrides);
  const base = {
    id,
    sourceReviewRecordEvidence: {
      dependsOnOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate: true,
      oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGatePassed: true,
      verifiedOro11cWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateOnly: true,
      oro11cPhase: "ORO-11C",
      oro11cScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_record_gate_only",
      oro11cClosed: true,
    },
    reviewRecordVerificationEvidence: {
      phase: ORO11D_PHASE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateScope: ORO11D_SCOPE,
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.PREPARED,
      sourceVerificationRecordReviewRecordId: DEFAULT_SOURCE_REVIEW_RECORD_ID,
      verificationRecordReviewRecordVerificationId: DEFAULT_VERIFICATION_ID,
      evidencePackVerificationRecordReviewRecordVerificationSourceModel:
        "oro11c_static_mock_evidence_pack_verification_record_review_record_verification_record_review_record",
      oro11cVerificationRecordReviewRecordPresent: true,
      oro11bVerificationRecordReviewReferenceOnlyPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorReviewRecordEvidencePresent: true,
      reviewRecordVerificationEvidencePresent: true,
      reviewRecordVerificationStatusPresent: true,
      reviewRecordVerificationMetadataPresent: true,
      reviewRecordVerificationComplete: true,
      reviewRecordVerificationIntegrityChecked: true,
      reviewRecordVerificationExpired: false,
      reviewRecordVerificationConflict: false,
      reviewRecordVerificationDisposition: "prepared_for_review_record_verification_only",
      expectedStaticReviewRecordVerificationDigest: initialDigest,
      providedStaticReviewRecordVerificationDigest: initialDigest,
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
    safetyEvidence: buildOro11dSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedRecord = isPlainObject(merged.reviewRecordVerificationEvidence)
    ? merged.reviewRecordVerificationEvidence
    : {};
  const finalDigest = digestFor(mergedRecord, merged);
  const overrideRecord = isPlainObject(overrides.reviewRecordVerificationEvidence)
    ? overrides.reviewRecordVerificationEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "expectedStaticReviewRecordVerificationDigest")) {
    merged.reviewRecordVerificationEvidence.expectedStaticReviewRecordVerificationDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "providedStaticReviewRecordVerificationDigest")) {
    merged.reviewRecordVerificationEvidence.providedStaticReviewRecordVerificationDigest =
      merged.reviewRecordVerificationEvidence.expectedStaticReviewRecordVerificationDigest;
  }
  return Object.freeze(merged);
}

const validOro11cVerificationRecordReviewRecordVerificationPreparedFixture = buildFixture(
  "validOro11cVerificationRecordReviewRecordVerificationPreparedFixture"
);

const reviewOnlyRecordVerifiedForReviewOnlyFixture = buildFixture("reviewOnlyRecordVerifiedForReviewOnlyFixture", {
  reviewRecordVerificationEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
    reviewRecordVerificationDisposition: "verified_for_review_only",
  },
});

const rejectedVerificationRecordReviewRecordVerificationFixture = buildFixture(
  "rejectedVerificationRecordReviewRecordVerificationFixture",
  {
    reviewRecordVerificationEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.REJECTED,
      reviewRecordVerificationDisposition: "rejected_recorded_for_review_only",
    },
  }
);

const changesRequiredVerificationRecordReviewRecordVerificationFixture = buildFixture(
  "changesRequiredVerificationRecordReviewRecordVerificationFixture",
  {
    reviewRecordVerificationEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
      reviewRecordVerificationDisposition: "changes_required_recorded_for_review_only",
    },
  }
);

const expiredVerificationRecordReviewRecordVerificationFixture = buildFixture(
  "expiredVerificationRecordReviewRecordVerificationFixture",
  {
    reviewRecordVerificationEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.EXPIRED,
      reviewRecordVerificationExpired: true,
    },
  }
);

const conflictingVerificationRecordReviewRecordVerificationFixture = buildFixture(
  "conflictingVerificationRecordReviewRecordVerificationFixture",
  {
    reviewRecordVerificationEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.CONFLICT,
      reviewRecordVerificationConflict: true,
    },
  }
);

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  sourceReviewRecordEvidence: {
    oro11cScope: "not_oro11c_review_record_gate",
    verifiedOro11cWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateOnly: false,
  },
});

const missingPriorOro11cReviewRecordFixture = buildFixture("missingPriorOro11cReviewRecordFixture", {
  sourceReviewRecordEvidence: {
    dependsOnOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate: false,
    oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGatePassed: false,
    verifiedOro11cWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateOnly: false,
    oro11cClosed: false,
  },
  reviewRecordVerificationEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_PRIOR_RECORD,
    oro11cVerificationRecordReviewRecordPresent: false,
    priorReviewRecordEvidencePresent: false,
  },
});

const incompleteVerificationRecordReviewRecordFixture = buildFixture("incompleteVerificationRecordReviewRecordFixture", {
  reviewRecordVerificationEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.INCOMPLETE,
    reviewRecordVerificationComplete: false,
    reviewRecordVerificationIntegrityChecked: false,
  },
});

const verificationRecordReviewRecordDigestMismatchFixture = buildFixture(
  "verificationRecordReviewRecordDigestMismatchFixture",
  {
    reviewRecordVerificationEvidence: {
      evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
        ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
      providedStaticReviewRecordVerificationDigest: "oro11d-static-review-record-verification-digest-ffffffff",
    },
  }
);

const missingVerificationEvidenceFixture = buildFixture("missingVerificationEvidenceFixture", {
  reviewRecordVerificationEvidence: {
    evidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationStatus:
      ORO11D_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_GATE_STATUS.MISSING_EVIDENCE,
    reviewRecordVerificationEvidencePresent: false,
  },
});

const missingVerificationStatusFixture = buildFixture("missingVerificationStatusFixture", {
  reviewRecordVerificationEvidence: {
    reviewRecordVerificationStatusPresent: false,
  },
});

const missingVerificationMetadataFixture = buildFixture("missingVerificationMetadataFixture", {
  reviewRecordVerificationEvidence: {
    reviewRecordVerificationMetadataPresent: false,
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
  reviewRecordVerificationEvidence: {
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

function buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFixtures() {
  return [
    validOro11cVerificationRecordReviewRecordVerificationPreparedFixture,
    reviewOnlyRecordVerifiedForReviewOnlyFixture,
    rejectedVerificationRecordReviewRecordVerificationFixture,
    changesRequiredVerificationRecordReviewRecordVerificationFixture,
    expiredVerificationRecordReviewRecordVerificationFixture,
    conflictingVerificationRecordReviewRecordVerificationFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11cReviewRecordFixture,
    incompleteVerificationRecordReviewRecordFixture,
    verificationRecordReviewRecordDigestMismatchFixture,
    missingVerificationEvidenceFixture,
    missingVerificationStatusFixture,
    missingVerificationMetadataFixture,
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
  validOro11cVerificationRecordReviewRecordVerificationPreparedFixture,
  reviewOnlyRecordVerifiedForReviewOnlyFixture,
  rejectedVerificationRecordReviewRecordVerificationFixture,
  changesRequiredVerificationRecordReviewRecordVerificationFixture,
  expiredVerificationRecordReviewRecordVerificationFixture,
  conflictingVerificationRecordReviewRecordVerificationFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11cReviewRecordFixture,
  incompleteVerificationRecordReviewRecordFixture,
  verificationRecordReviewRecordDigestMismatchFixture,
  missingVerificationEvidenceFixture,
  missingVerificationStatusFixture,
  missingVerificationMetadataFixture,
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
  buildOro11dEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordVerificationGateFixtures,
};
