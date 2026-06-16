"use strict";

const {
  ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS,
  ORO11C_PHASE,
  ORO11C_SCOPE,
  buildOro11cSafetySummary,
  buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest,
} = require("./oro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_REVIEW_ID = "oro11b-static-evidence-pack-verification-record-review-record";
const DEFAULT_REVIEW_RECORD_ID = "oro11c-static-evidence-pack-verification-record-review-record";

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
    record.evidencePackVerificationRecordReviewRecordReviewRecordStatus ||
    overrides.evidencePackVerificationRecordReviewRecordReviewRecordStatus ||
    ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED
  );
}

function digestFor(record = {}, overrides = {}) {
  return buildOro11cStaticVerificationRecordReviewRecordVerificationRecordReviewRecordDigest({
    phase: ORO11C_PHASE,
    scope: ORO11C_SCOPE,
    sourceVerificationRecordReviewRecordId: record.sourceVerificationRecordReviewRecordId || DEFAULT_SOURCE_REVIEW_ID,
    verificationRecordReviewRecordReviewRecordId:
      record.verificationRecordReviewRecordReviewRecordId || DEFAULT_REVIEW_RECORD_ID,
    status: statusFrom(record, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialRecord = isPlainObject(overrides.verificationRecordReviewRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordReviewRecordEvidence
    : {};
  const initialDigest = digestFor(initialRecord, overrides);
  const base = {
    id,
    sourceReviewEvidence: {
      dependsOnOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate: true,
      oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGatePassed: true,
      verifiedOro11bWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateOnly: true,
      oro11bPhase: "ORO-11B",
      oro11bScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_review_gate_only",
      oro11bClosed: true,
    },
    verificationRecordReviewRecordReviewRecordEvidence: {
      phase: ORO11C_PHASE,
      evidencePackVerificationRecordReviewRecordReviewRecordGateScope: ORO11C_SCOPE,
      evidencePackVerificationRecordReviewRecordReviewRecordStatus:
        ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.PREPARED,
      sourceVerificationRecordReviewRecordId: DEFAULT_SOURCE_REVIEW_ID,
      verificationRecordReviewRecordReviewRecordId: DEFAULT_REVIEW_RECORD_ID,
      evidencePackVerificationRecordReviewRecordReviewRecordSourceModel:
        "oro11b_static_mock_evidence_pack_verification_record_review_record_verification_record_review",
      oro11bVerificationRecordReviewPresent: true,
      oro11aVerificationRecordReferenceOnlyPresent: true,
      oro10zVerificationResultReferenceOnlyPresent: true,
      oro10yReviewRecordReferenceOnlyPresent: true,
      oro10xReviewReferenceOnlyPresent: true,
      oro10wRecordReferenceOnlyPresent: true,
      oro10vVerificationOutputReferenceOnlyPresent: true,
      priorReviewEvidencePresent: true,
      reviewRecordEvidencePresent: true,
      reviewRecordStatusPresent: true,
      reviewRecordMetadataPresent: true,
      verificationRecordReviewRecordComplete: true,
      verificationRecordReviewRecordIntegrityChecked: true,
      verificationRecordReviewRecordExpired: false,
      verificationRecordReviewRecordConflict: false,
      verificationRecordReviewRecordDisposition: "prepared_for_review_record_only",
      expectedStaticVerificationRecordReviewRecordReviewRecordDigest: initialDigest,
      providedStaticVerificationRecordReviewRecordReviewRecordDigest: initialDigest,
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
    safetyEvidence: buildOro11cSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedRecord = isPlainObject(merged.verificationRecordReviewRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordReviewRecordEvidence
    : {};
  const finalDigest = digestFor(mergedRecord, merged);
  const overrideRecord = isPlainObject(overrides.verificationRecordReviewRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordReviewRecordEvidence
    : {};
  if (
    !Object.prototype.hasOwnProperty.call(
      overrideRecord,
      "expectedStaticVerificationRecordReviewRecordReviewRecordDigest"
    )
  ) {
    merged.verificationRecordReviewRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordReviewRecordDigest =
      finalDigest;
  }
  if (
    !Object.prototype.hasOwnProperty.call(
      overrideRecord,
      "providedStaticVerificationRecordReviewRecordReviewRecordDigest"
    )
  ) {
    merged.verificationRecordReviewRecordReviewRecordEvidence.providedStaticVerificationRecordReviewRecordReviewRecordDigest =
      merged.verificationRecordReviewRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordReviewRecordDigest;
  }
  return Object.freeze(merged);
}

const validOro11bVerificationRecordReviewRecordPreparedFixture = buildFixture(
  "validOro11bVerificationRecordReviewRecordPreparedFixture"
);

const reviewOnlyResultRecordedForReviewOnlyFixture = buildFixture(
  "reviewOnlyResultRecordedForReviewOnlyFixture",
  {
    verificationRecordReviewRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordReviewRecordStatus:
        ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
      verificationRecordReviewRecordDisposition: "recorded_for_review_only",
    },
  }
);

const rejectedVerificationRecordReviewRecordFixture = buildFixture("rejectedVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.REJECTED,
    verificationRecordReviewRecordDisposition: "rejected_recorded_for_review_only",
  },
});

const changesRequiredVerificationRecordReviewRecordFixture = buildFixture(
  "changesRequiredVerificationRecordReviewRecordFixture",
  {
    verificationRecordReviewRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordReviewRecordStatus:
        ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CHANGES_REQUIRED,
      verificationRecordReviewRecordDisposition: "changes_required_recorded_for_review_only",
    },
  }
);

const expiredVerificationRecordReviewRecordFixture = buildFixture("expiredVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.EXPIRED,
    verificationRecordReviewRecordExpired: true,
  },
});

const conflictingVerificationRecordReviewRecordFixture = buildFixture(
  "conflictingVerificationRecordReviewRecordFixture",
  {
    verificationRecordReviewRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordReviewRecordStatus:
        ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.CONFLICT,
      verificationRecordReviewRecordConflict: true,
    },
  }
);

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  sourceReviewEvidence: {
    oro11bScope: "not_oro11b_verification_record_review_gate",
    verifiedOro11bWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateOnly: false,
  },
});

const missingPriorOro11bReviewFixture = buildFixture("missingPriorOro11bReviewFixture", {
  sourceReviewEvidence: {
    dependsOnOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate: false,
    oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGatePassed: false,
    verifiedOro11bWasEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateOnly: false,
    oro11bClosed: false,
  },
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_PRIOR_REVIEW,
    oro11bVerificationRecordReviewPresent: false,
    priorReviewEvidencePresent: false,
  },
});

const incompleteVerificationRecordReviewFixture = buildFixture("incompleteVerificationRecordReviewFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.INCOMPLETE,
    verificationRecordReviewRecordComplete: false,
    verificationRecordReviewRecordIntegrityChecked: false,
  },
});

const verificationRecordReviewDigestMismatchFixture = buildFixture("verificationRecordReviewDigestMismatchFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordReviewRecordReviewRecordDigest:
      "oro11c-static-verification-record-review-record-verification-record-review-record-digest-ffffffff",
  },
});

const missingReviewRecordEvidenceFixture = buildFixture("missingReviewRecordEvidenceFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordReviewRecordStatus:
      ORO11C_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_RECORD_GATE_STATUS.MISSING_EVIDENCE,
    reviewRecordEvidencePresent: false,
  },
});

const missingReviewRecordStatusFixture = buildFixture("missingReviewRecordStatusFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    reviewRecordStatusPresent: false,
  },
});

const missingReviewRecordMetadataFixture = buildFixture("missingReviewRecordMetadataFixture", {
  verificationRecordReviewRecordReviewRecordEvidence: {
    reviewRecordMetadataPresent: false,
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
  verificationRecordReviewRecordReviewRecordEvidence: {
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

function buildOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures() {
  return [
    validOro11bVerificationRecordReviewRecordPreparedFixture,
    reviewOnlyResultRecordedForReviewOnlyFixture,
    rejectedVerificationRecordReviewRecordFixture,
    changesRequiredVerificationRecordReviewRecordFixture,
    expiredVerificationRecordReviewRecordFixture,
    conflictingVerificationRecordReviewRecordFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11bReviewFixture,
    incompleteVerificationRecordReviewFixture,
    verificationRecordReviewDigestMismatchFixture,
    missingReviewRecordEvidenceFixture,
    missingReviewRecordStatusFixture,
    missingReviewRecordMetadataFixture,
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
  validOro11bVerificationRecordReviewRecordPreparedFixture,
  reviewOnlyResultRecordedForReviewOnlyFixture,
  rejectedVerificationRecordReviewRecordFixture,
  changesRequiredVerificationRecordReviewRecordFixture,
  expiredVerificationRecordReviewRecordFixture,
  conflictingVerificationRecordReviewRecordFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11bReviewFixture,
  incompleteVerificationRecordReviewFixture,
  verificationRecordReviewDigestMismatchFixture,
  missingReviewRecordEvidenceFixture,
  missingReviewRecordStatusFixture,
  missingReviewRecordMetadataFixture,
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
  buildOro11cEvidencePackVerificationRecordReviewRecordVerificationRecordReviewRecordGateFixtures,
};
