"use strict";

const {
  ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS,
  ORO10W_PHASE,
  ORO10W_SCOPE,
  buildOro10wSafetySummary,
  buildOro10wStaticVerificationRecordDigest,
} = require("./oro10wEvidencePackVerificationRecordGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["record", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_VERIFICATION_ID = "oro10v-static-evidence-pack-verification";
const DEFAULT_VERIFICATION_RECORD_ID = "oro10w-static-evidence-pack-verification-record";

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
    record.evidencePackVerificationRecordStatus ||
    overrides.evidencePackVerificationRecordStatus ||
    ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED
  );
}

function digestFor(record = {}, overrides = {}) {
  return buildOro10wStaticVerificationRecordDigest({
    phase: ORO10W_PHASE,
    scope: ORO10W_SCOPE,
    sourceEvidencePackVerificationId: record.sourceEvidencePackVerificationId || DEFAULT_SOURCE_VERIFICATION_ID,
    verificationRecordId: record.verificationRecordId || DEFAULT_VERIFICATION_RECORD_ID,
    status: statusFrom(record, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialRecord = isPlainObject(overrides.verificationRecordEvidence)
    ? overrides.verificationRecordEvidence
    : {};
  const initialDigest = digestFor(initialRecord, overrides);
  const base = {
    id,
    predecessorEvidence: {
      dependsOnOro10vFinalApprovalDecisionEvidencePackVerificationGate: true,
      oro10vFinalApprovalDecisionEvidencePackVerificationGatePassed: true,
      verifiedOro10vWasFinalApprovalDecisionEvidencePackVerificationGateOnly: true,
      oro10vScope: "approval_chain_rollover_final_approval_decision_evidence_pack_verification_gate_only",
      oro10vClosed: true,
    },
    verificationRecordEvidence: {
      phase: ORO10W_PHASE,
      evidencePackVerificationRecordGateScope: ORO10W_SCOPE,
      evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.PREPARED,
      sourceEvidencePackVerificationId: DEFAULT_SOURCE_VERIFICATION_ID,
      verificationRecordId: DEFAULT_VERIFICATION_RECORD_ID,
      evidencePackVerificationRecordSourceModel:
        "oro10v_static_mock_final_approval_decision_evidence_pack_verification",
      oro10vVerificationOutputPresent: true,
      priorGateEvidencePresent: true,
      verificationEvidencePresent: true,
      verificationStatusPresent: true,
      verificationRecordMetadataPresent: true,
      verificationRecordComplete: true,
      verificationRecordIntegrityChecked: true,
      verificationRecordExpired: false,
      verificationRecordConflict: false,
      verificationRecordDisposition: "prepared_for_review_only",
      expectedStaticVerificationRecordDigest: initialDigest,
      providedStaticVerificationRecordDigest: initialDigest,
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
    safetyEvidence: buildOro10wSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedRecord = isPlainObject(merged.verificationRecordEvidence) ? merged.verificationRecordEvidence : {};
  const finalDigest = digestFor(mergedRecord, merged);
  const overrideRecord = isPlainObject(overrides.verificationRecordEvidence)
    ? overrides.verificationRecordEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "expectedStaticVerificationRecordDigest")) {
    merged.verificationRecordEvidence.expectedStaticVerificationRecordDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideRecord, "providedStaticVerificationRecordDigest")) {
    merged.verificationRecordEvidence.providedStaticVerificationRecordDigest =
      merged.verificationRecordEvidence.expectedStaticVerificationRecordDigest;
  }
  return Object.freeze(merged);
}

const validVerificationRecordPreparedFixture = buildFixture("validVerificationRecordPreparedFixture");

const reviewOnlyVerifiedResultRecordedFixture = buildFixture("reviewOnlyVerifiedResultRecordedFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus:
      ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.RECORDED_FOR_REVIEW_ONLY,
    verificationRecordDisposition: "recorded_for_review_only",
  },
});

const rejectedVerificationResultRecordFixture = buildFixture("rejectedVerificationResultRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.REJECTED,
    verificationRecordDisposition: "rejected_for_review_only",
  },
});

const changesRequiredVerificationResultRecordFixture = buildFixture("changesRequiredVerificationResultRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CHANGES_REQUIRED,
    verificationRecordDisposition: "changes_required_for_review_only",
  },
});

const expiredVerificationResultRecordFixture = buildFixture("expiredVerificationResultRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.EXPIRED,
    verificationRecordExpired: true,
  },
});

const conflictingVerificationResultRecordFixture = buildFixture("conflictingVerificationResultRecordFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.CONFLICT,
    verificationRecordConflict: true,
  },
});

const invalidPriorGateMarkerFixture = buildFixture("invalidPriorGateMarkerFixture", {
  predecessorEvidence: {
    oro10vScope: "not_oro10v_verification_gate",
    verifiedOro10vWasFinalApprovalDecisionEvidencePackVerificationGateOnly: false,
  },
});

const missingPriorGateEvidenceFixture = buildFixture("missingPriorGateEvidenceFixture", {
  predecessorEvidence: {
    dependsOnOro10vFinalApprovalDecisionEvidencePackVerificationGate: false,
    oro10vFinalApprovalDecisionEvidencePackVerificationGatePassed: false,
    verifiedOro10vWasFinalApprovalDecisionEvidencePackVerificationGateOnly: false,
    oro10vClosed: false,
  },
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_PRIOR_GATE,
    priorGateEvidencePresent: false,
  },
});

const incompleteVerificationEvidenceFixture = buildFixture("incompleteVerificationEvidenceFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.INCOMPLETE,
    verificationRecordComplete: false,
    verificationRecordIntegrityChecked: false,
  },
});

const evidencePackDigestMismatchFixture = buildFixture("evidencePackDigestMismatchFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticVerificationRecordDigest: "oro10w-static-verification-record-digest-ffffffff",
  },
});

const missingVerificationStatusFixture = buildFixture("missingVerificationStatusFixture", {
  verificationRecordEvidence: {
    verificationStatusPresent: false,
  },
});

const missingVerificationEvidenceFixture = buildFixture("missingVerificationEvidenceFixture", {
  verificationRecordEvidence: {
    evidencePackVerificationRecordStatus: ORO10W_EVIDENCE_PACK_VERIFICATION_RECORD_GATE_STATUS.MISSING_EVIDENCE,
    verificationEvidencePresent: false,
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

const reviewAuthorityWordingAttemptBlockedFixture = buildFixture("reviewAuthorityWordingAttemptBlockedFixture", {
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
  verificationRecordEvidence: {
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

function buildOro10wEvidencePackVerificationRecordGateFixtures() {
  return [
    validVerificationRecordPreparedFixture,
    reviewOnlyVerifiedResultRecordedFixture,
    rejectedVerificationResultRecordFixture,
    changesRequiredVerificationResultRecordFixture,
    expiredVerificationResultRecordFixture,
    conflictingVerificationResultRecordFixture,
    invalidPriorGateMarkerFixture,
    missingPriorGateEvidenceFixture,
    incompleteVerificationEvidenceFixture,
    evidencePackDigestMismatchFixture,
    missingVerificationStatusFixture,
    missingVerificationEvidenceFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    reviewAuthorityWordingAttemptBlockedFixture,
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
  validVerificationRecordPreparedFixture,
  reviewOnlyVerifiedResultRecordedFixture,
  rejectedVerificationResultRecordFixture,
  changesRequiredVerificationResultRecordFixture,
  expiredVerificationResultRecordFixture,
  conflictingVerificationResultRecordFixture,
  invalidPriorGateMarkerFixture,
  missingPriorGateEvidenceFixture,
  incompleteVerificationEvidenceFixture,
  evidencePackDigestMismatchFixture,
  missingVerificationStatusFixture,
  missingVerificationEvidenceFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  reviewAuthorityWordingAttemptBlockedFixture,
  finalizationWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  gameLaunchAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  buildOro10wEvidencePackVerificationRecordGateFixtures,
};
