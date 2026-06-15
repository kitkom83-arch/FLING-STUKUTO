"use strict";

const {
  ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS,
  ORO10V_PHASE,
  ORO10V_SCOPE,
  buildOro10vSafetySummary,
  buildOro10vStaticEvidencePackVerificationDigest,
} = require("./oro10vFinalApprovalDecisionEvidencePackVerificationGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["review", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret", "Marker"].join("");
const guardedKeyThree = ["device", "Id", "Marker"].join("");

const DEFAULT_SOURCE_EVIDENCE_PACK_ID = "oro10u-static-evidence-pack";
const DEFAULT_VERIFICATION_ID = "oro10v-static-evidence-pack-verification";

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

function statusFrom(evidence = {}, overrides = {}) {
  return (
    evidence.finalApprovalDecisionEvidencePackVerificationStatus ||
    overrides.finalApprovalDecisionEvidencePackVerificationStatus ||
    ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED
  );
}

function digestFor(evidence = {}, overrides = {}) {
  return buildOro10vStaticEvidencePackVerificationDigest({
    phase: ORO10V_PHASE,
    scope: ORO10V_SCOPE,
    sourceEvidencePackId: evidence.sourceEvidencePackId || DEFAULT_SOURCE_EVIDENCE_PACK_ID,
    verificationId: evidence.evidencePackVerificationId || DEFAULT_VERIFICATION_ID,
    status: statusFrom(evidence, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialEvidence = isPlainObject(overrides.evidencePackVerificationEvidence)
    ? overrides.evidencePackVerificationEvidence
    : {};
  const initialDigest = digestFor(initialEvidence, overrides);
  const base = {
    id,
    evidencePackVerificationEvidence: {
      phase: ORO10V_PHASE,
      finalApprovalDecisionEvidencePackVerificationGateScope: ORO10V_SCOPE,
      finalApprovalDecisionEvidencePackVerificationStatus:
        ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.PREPARED,
      sourceEvidencePackId: DEFAULT_SOURCE_EVIDENCE_PACK_ID,
      evidencePackVerificationId: DEFAULT_VERIFICATION_ID,
      evidencePackSourceModel: "oro10u_static_mock_final_approval_decision_evidence_pack",
      oro10uEvidencePackEvidencePresent: true,
      evidencePackMetadataPresent: true,
      evidencePackContentPresent: true,
      evidencePackComplete: true,
      evidencePackExpired: false,
      evidencePackConflict: false,
      evidencePackVerificationDisposition: "prepared_for_review_only",
      expectedStaticEvidencePackVerificationDigest: initialDigest,
      providedStaticEvidencePackVerificationDigest: initialDigest,
    },
    runtimeDecisionEvidence: {
      finalApprovalIssued: false,
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
    safetyEvidence: buildOro10vSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedEvidence = isPlainObject(merged.evidencePackVerificationEvidence)
    ? merged.evidencePackVerificationEvidence
    : {};
  const finalDigest = digestFor(mergedEvidence, merged);
  const overrideEvidence = isPlainObject(overrides.evidencePackVerificationEvidence)
    ? overrides.evidencePackVerificationEvidence
    : {};
  if (!Object.prototype.hasOwnProperty.call(overrideEvidence, "expectedStaticEvidencePackVerificationDigest")) {
    merged.evidencePackVerificationEvidence.expectedStaticEvidencePackVerificationDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overrideEvidence, "providedStaticEvidencePackVerificationDigest")) {
    merged.evidencePackVerificationEvidence.providedStaticEvidencePackVerificationDigest =
      merged.evidencePackVerificationEvidence.expectedStaticEvidencePackVerificationDigest;
  }
  return Object.freeze(merged);
}

const validEvidencePackVerificationPreparedFixture = buildFixture("validEvidencePackVerificationPreparedFixture");

const reviewOnlyVerifiedEvidencePackFixture = buildFixture("reviewOnlyVerifiedEvidencePackFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.VERIFIED_FOR_REVIEW_ONLY,
    evidencePackVerificationDisposition: "verified_for_review_only",
  },
});

const rejectedEvidencePackVerificationFixture = buildFixture("rejectedEvidencePackVerificationFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.REJECTED,
    evidencePackVerificationDisposition: "rejected_for_review_only",
  },
});

const changesRequiredEvidencePackVerificationFixture = buildFixture("changesRequiredEvidencePackVerificationFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CHANGES_REQUIRED,
    evidencePackVerificationDisposition: "changes_required_for_review_only",
  },
});

const expiredEvidencePackVerificationFixture = buildFixture("expiredEvidencePackVerificationFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EXPIRED,
    evidencePackExpired: true,
  },
});

const conflictingEvidencePackVerificationFixture = buildFixture("conflictingEvidencePackVerificationFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.CONFLICT,
    evidencePackConflict: true,
  },
});

const invalidEvidencePackIdFixture = buildFixture("invalidEvidencePackIdFixture", {
  evidencePackVerificationEvidence: {
    sourceEvidencePackId: "bad",
  },
});

const missingEvidencePackEvidenceFixture = buildFixture("missingEvidencePackEvidenceFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.EVIDENCE_MISSING,
    oro10uEvidencePackEvidencePresent: false,
  },
});

const incompleteEvidencePackFixture = buildFixture("incompleteEvidencePackFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.INCOMPLETE,
    evidencePackComplete: false,
    evidencePackContentPresent: false,
  },
});

const evidencePackDigestMismatchFixture = buildFixture("evidencePackDigestMismatchFixture", {
  evidencePackVerificationEvidence: {
    finalApprovalDecisionEvidencePackVerificationStatus:
      ORO10V_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_VERIFICATION_GATE_STATUS.DIGEST_MISMATCH,
    providedStaticEvidencePackVerificationDigest: "oro10v-static-evidence-pack-verification-digest-ffffffff",
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

const secretShapedFieldsAreRedactedFixture = buildFixture("secretShapedFieldsAreRedactedFixture", {
  evidencePackVerificationEvidence: {
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

function buildOro10vFinalApprovalDecisionEvidencePackVerificationGateFixtures() {
  return [
    validEvidencePackVerificationPreparedFixture,
    reviewOnlyVerifiedEvidencePackFixture,
    rejectedEvidencePackVerificationFixture,
    changesRequiredEvidencePackVerificationFixture,
    expiredEvidencePackVerificationFixture,
    conflictingEvidencePackVerificationFixture,
    invalidEvidencePackIdFixture,
    missingEvidencePackEvidenceFixture,
    incompleteEvidencePackFixture,
    evidencePackDigestMismatchFixture,
    runtimeAuthorizationWordingAttemptBlockedFixture,
    finalApprovalIssuedWordingAttemptBlockedFixture,
    signedRuntimeApprovalWordingAttemptBlockedFixture,
    signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
    actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
    routeMountAuthorizationAttemptBlockedFixture,
    externalCallAuthorizationAttemptBlockedFixture,
    secretShapedFieldsAreRedactedFixture,
    noWalletLedgerDbMigrationDeployMarkersFixture,
  ];
}

module.exports = {
  validEvidencePackVerificationPreparedFixture,
  reviewOnlyVerifiedEvidencePackFixture,
  rejectedEvidencePackVerificationFixture,
  changesRequiredEvidencePackVerificationFixture,
  expiredEvidencePackVerificationFixture,
  conflictingEvidencePackVerificationFixture,
  invalidEvidencePackIdFixture,
  missingEvidencePackEvidenceFixture,
  incompleteEvidencePackFixture,
  evidencePackDigestMismatchFixture,
  runtimeAuthorizationWordingAttemptBlockedFixture,
  finalApprovalIssuedWordingAttemptBlockedFixture,
  signedRuntimeApprovalWordingAttemptBlockedFixture,
  signedApprovalArtifactAcceptedWordingAttemptBlockedFixture,
  actualSignedArtifactVerifiedWordingAttemptBlockedFixture,
  routeMountAuthorizationAttemptBlockedFixture,
  externalCallAuthorizationAttemptBlockedFixture,
  secretShapedFieldsAreRedactedFixture,
  noWalletLedgerDbMigrationDeployMarkersFixture,
  buildOro10vFinalApprovalDecisionEvidencePackVerificationGateFixtures,
};
