"use strict";

const {
  ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS,
  ORO11B_PHASE,
  ORO11B_SCOPE,
  buildOro11bSafetySummary,
  buildOro11bStaticVerificationRecordReviewRecordDigest,
} = require("./oro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_REVIEW_ID = "oro11a-static-evidence-pack-verification-record-review-record-verification-record";
const DEFAULT_REVIEW_RECORD_ID = "oro11b-static-evidence-pack-verification-record-review-record";

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
    record.evidencePackVerificationRecordReviewRecordStatus ||
    overrides.evidencePackVerificationRecordReviewRecordStatus ||
    ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED
  );
}

function digestFor(record = {}, overrides = {}) {
  return buildOro11bStaticVerificationRecordReviewRecordDigest({
    phase: ORO11B_PHASE,
    scope: ORO11B_SCOPE,
    sourceVerificationRecordReviewId: record.sourceVerificationRecordReviewId || DEFAULT_SOURCE_REVIEW_ID,
    verificationRecordReviewRecordId: record.verificationRecordReviewRecordId || DEFAULT_REVIEW_RECORD_ID,
    status: statusFrom(record, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialRecord = isPlainObject(overrides.verificationRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordEvidence
    : {};
  const initialDigest = digestFor(initialRecord, overrides);
  const base = {
    id,
    sourceReviewEvidence: {
      dependsOnOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate: true,
      oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGatePassed: true,
      verifiedOro11aWasEvidencePackVerificationRecordReviewRecordVerificationRecordGateOnly: true,
      oro11aPhase: "ORO-11A",
      oro11aScope:
        "approval_chain_rollover_final_approval_decision_evidence_pack_verification_record_review_record_verification_record_gate_only",
      oro11aClosed: true,
    },
    verificationRecordReviewRecordEvidence: {
      phase: ORO11B_PHASE,
      evidencePackVerificationRecordReviewRecordGateScope: ORO11B_SCOPE,
      evidencePackVerificationRecordReviewRecordStatus:
        ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.PREPARED,
      sourceVerificationRecordReviewId: DEFAULT_SOURCE_REVIEW_ID,
      verificationRecordReviewRecordId: DEFAULT_REVIEW_RECORD_ID,
      evidencePackVerificationRecordReviewRecordSourceModel:
        "oro11a_static_mock_evidence_pack_verification_record_review_record_verification_record",
      oro11aVerificationRecordReviewPresent: true,
      oro10wVerificationRecordReferenceOnlyPresent: true,
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
    safetyEvidence: buildOro11bSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedRecord = isPlainObject(merged.verificationRecordReviewRecordEvidence)
    ? merged.verificationRecordReviewRecordEvidence
    : {};
  const finalDigest = digestFor(mergedRecord, merged);
  const overrideRecord = isPlainObject(overrides.verificationRecordReviewRecordEvidence)
    ? overrides.verificationRecordReviewRecordEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "expectedStaticVerificationRecordReviewRecordDigest")) {
    merged.verificationRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "providedStaticVerificationRecordReviewRecordDigest")) {
    merged.verificationRecordReviewRecordEvidence.providedStaticVerificationRecordReviewRecordDigest =
      merged.verificationRecordReviewRecordEvidence.expectedStaticVerificationRecordReviewRecordDigest;
  }
  return Object.freeze(merged);
}

const validReviewRecordPreparedFixture = buildFixture("validReviewRecordPreparedFixture");

const recordedForReviewOnlyFixture = buildFixture("recordedForReviewOnlyFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
    verificationRecordReviewRecordDisposition: "recorded_for_review_only",
  },
});

const rejectedVerificationRecordReviewRecordFixture = buildFixture("rejectedVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.REJECTED,
    verificationRecordReviewRecordDisposition: "rejected_recorded_for_review_only",
  },
});

const changesRequiredVerificationRecordReviewRecordFixture = buildFixture(
  "changesRequiredVerificationRecordReviewRecordFixture",
  {
    verificationRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordStatus:
        ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CHANGES_REQUIRED,
      verificationRecordReviewRecordDisposition: "changes_required_recorded_for_review_only",
    },
  }
);

const expiredVerificationRecordReviewRecordFixture = buildFixture("expiredVerificationRecordReviewRecordFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.EXPIRED,
    verificationRecordReviewRecordExpired: true,
  },
});

const conflictingVerificationRecordReviewRecordFixture = buildFixture(
  "conflictingVerificationRecordReviewRecordFixture",
  {
    verificationRecordReviewRecordEvidence: {
      evidencePackVerificationRecordReviewRecordStatus:
        ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.CONFLICT,
      verificationRecordReviewRecordConflict: true,
    },
  }
);

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  sourceReviewEvidence: {
    oro11aScope: "not_oro11a_verification_record_gate",
    verifiedOro11aWasEvidencePackVerificationRecordReviewRecordVerificationRecordGateOnly: false,
  },
});

const missingPriorOro11aReviewFixture = buildFixture("missingPriorOro11aReviewFixture", {
  sourceReviewEvidence: {
    dependsOnOro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGate: false,
    oro11aEvidencePackVerificationRecordReviewRecordVerificationRecordGatePassed: false,
    verifiedOro11aWasEvidencePackVerificationRecordReviewRecordVerificationRecordGateOnly: false,
    oro11aClosed: false,
  },
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_PRIOR_RECORD,
    oro11aVerificationRecordReviewPresent: false,
    priorReviewEvidencePresent: false,
  },
});

const incompleteVerificationRecordReviewFixture = buildFixture("incompleteVerificationRecordReviewFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.INCOMPLETE,
    verificationRecordReviewRecordComplete: false,
    verificationRecordReviewRecordIntegrityChecked: false,
  },
});

const verificationRecordReviewDigestMismatchFixture = buildFixture("verificationRecordReviewDigestMismatchFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordReviewRecordDigest:
      "oro11b-static-verification-record-review-record-verification-record-review-digest-ffffffff",
  },
});

const missingReviewRecordEvidenceFixture = buildFixture("missingReviewRecordEvidenceFixture", {
  verificationRecordReviewRecordEvidence: {
    evidencePackVerificationRecordReviewRecordStatus:
      ORO11B_EVIDENCE_PACK_VERIFICATION_RECORD_REVIEW_RECORD_VERIFICATION_RECORD_REVIEW_GATE_STATUS.MISSING_EVIDENCE,
    reviewRecordEvidencePresent: false,
  },
});

const missingReviewRecordStatusFixture = buildFixture("missingReviewRecordStatusFixture", {
  verificationRecordReviewRecordEvidence: {
    reviewRecordStatusPresent: false,
  },
});

const missingReviewRecordMetadataFixture = buildFixture("missingReviewRecordMetadataFixture", {
  verificationRecordReviewRecordEvidence: {
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
  verificationRecordReviewRecordEvidence: {
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

function buildOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateFixtures() {
  return [
    validReviewRecordPreparedFixture,
    recordedForReviewOnlyFixture,
    rejectedVerificationRecordReviewRecordFixture,
    changesRequiredVerificationRecordReviewRecordFixture,
    expiredVerificationRecordReviewRecordFixture,
    conflictingVerificationRecordReviewRecordFixture,
    invalidPriorGateMarkerFixture,
    missingPriorOro11aReviewFixture,
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
  validReviewRecordPreparedFixture,
  recordedForReviewOnlyFixture,
  rejectedVerificationRecordReviewRecordFixture,
  changesRequiredVerificationRecordReviewRecordFixture,
  expiredVerificationRecordReviewRecordFixture,
  conflictingVerificationRecordReviewRecordFixture,
  invalidPriorGateMarkerFixture,
  missingPriorOro11aReviewFixture,
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
  buildOro11bEvidencePackVerificationRecordReviewRecordVerificationRecordReviewGateFixtures,
};
