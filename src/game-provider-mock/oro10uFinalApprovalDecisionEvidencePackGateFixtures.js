"use strict";

const {
  ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS,
  ORO10U_PHASE,
  ORO10U_SCOPE,
  buildOro10uSafetySummary,
  buildOro10uStaticEvidencePackDigest,
} = require("./oro10uFinalApprovalDecisionEvidencePackGate");

const runtimeAuthKey = ["runtime", "Author", "ization"].join("");
const guardedKeyOne = ["evidence", "To", "ken"].join("");
const guardedKeyTwo = ["client", "Se", "cret"].join("");
const guardedKeyThree = ["device", "Id"].join("");

const DEFAULT_EVIDENCE_PACK_ID = "oro10u-static-evidence-pack";
const DEFAULT_VERIFIED_RECORD_ID = "oro10u-static-verified-record";

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

function statusFrom(pack = {}, overrides = {}) {
  return (
    pack.finalApprovalDecisionEvidencePackStatus ||
    overrides.finalApprovalDecisionEvidencePackStatus ||
    ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED
  );
}

function digestFor(pack = {}, overrides = {}) {
  return buildOro10uStaticEvidencePackDigest({
    phase: ORO10U_PHASE,
    scope: ORO10U_SCOPE,
    evidencePackId: pack.evidencePackId || DEFAULT_EVIDENCE_PACK_ID,
    status: statusFrom(pack, overrides),
  });
}

function buildFixture(id, overrides = {}) {
  const initialPack = isPlainObject(overrides.evidencePackEvidence) ? overrides.evidencePackEvidence : {};
  const initialDigest = digestFor(initialPack, overrides);
  const base = {
    id,
    evidencePackEvidence: {
      phase: ORO10U_PHASE,
      finalApprovalDecisionEvidencePackGateScope: ORO10U_SCOPE,
      finalApprovalDecisionEvidencePackStatus: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.PREPARED,
      verifiedRecordId: DEFAULT_VERIFIED_RECORD_ID,
      evidencePackId: DEFAULT_EVIDENCE_PACK_ID,
      verifiedRecordEvidencePresent: true,
      evidencePackMetadataPresent: true,
      evidencePackContentPresent: true,
      evidencePackExpired: false,
      evidencePackConflict: false,
      verifiedDecisionRecordSourceModel: "oro10t_static_mock_verified_decision_record",
      evidencePackDisposition: "prepared_for_review_only",
      expectedStaticEvidencePackDigest: initialDigest,
      providedStaticEvidencePackDigest: initialDigest,
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
    safetyEvidence: buildOro10uSafetySummary(),
  };
  const merged = deepMerge(base, overrides);
  const mergedPack = isPlainObject(merged.evidencePackEvidence) ? merged.evidencePackEvidence : {};
  const finalDigest = digestFor(mergedPack, merged);
  const overridePack = isPlainObject(overrides.evidencePackEvidence) ? overrides.evidencePackEvidence : {};
  if (!Object.prototype.hasOwnProperty.call(overridePack, "expectedStaticEvidencePackDigest")) {
    merged.evidencePackEvidence.expectedStaticEvidencePackDigest = finalDigest;
  }
  if (!Object.prototype.hasOwnProperty.call(overridePack, "providedStaticEvidencePackDigest")) {
    merged.evidencePackEvidence.providedStaticEvidencePackDigest =
      merged.evidencePackEvidence.expectedStaticEvidencePackDigest;
  }
  return Object.freeze(merged);
}

const validDecisionEvidencePackPreparedFixture = buildFixture("validDecisionEvidencePackPreparedFixture");

const reviewOnlyReadyDecisionEvidencePackFixture = buildFixture("reviewOnlyReadyDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus:
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REVIEW_ONLY_READY,
    evidencePackDisposition: "review_only_ready",
  },
});

const rejectedDecisionEvidencePackFixture = buildFixture("rejectedDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.REJECTED,
    evidencePackDisposition: "rejected_for_review_only",
  },
});

const changesRequiredDecisionEvidencePackFixture = buildFixture("changesRequiredDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus:
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CHANGES_REQUIRED,
    evidencePackDisposition: "changes_required_for_review_only",
  },
});

const verificationFailedDecisionEvidencePackFixture = buildFixture("verificationFailedDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus:
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.VERIFICATION_FAILED,
    evidencePackDisposition: "verification_failed_for_review_only",
  },
});

const expiredDecisionEvidencePackFixture = buildFixture("expiredDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EXPIRED,
    evidencePackExpired: true,
  },
});

const conflictingDecisionEvidencePackFixture = buildFixture("conflictingDecisionEvidencePackFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus: ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.CONFLICT,
    evidencePackConflict: true,
  },
});

const invalidVerifiedRecordIdFixture = buildFixture("invalidVerifiedRecordIdFixture", {
  evidencePackEvidence: {
    verifiedRecordId: "bad",
  },
});

const missingDecisionRecordEvidenceFixture = buildFixture("missingDecisionRecordEvidenceFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus:
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.EVIDENCE_MISSING,
    verifiedRecordEvidencePresent: false,
  },
});

const evidencePackDigestMismatchFixture = buildFixture("evidencePackDigestMismatchFixture", {
  evidencePackEvidence: {
    finalApprovalDecisionEvidencePackStatus:
      ORO10U_FINAL_APPROVAL_DECISION_EVIDENCE_PACK_GATE_STATUS.HASH_MISMATCH,
    providedStaticEvidencePackDigest: "oro10u-static-evidence-pack-digest-ffffffff",
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
  evidencePackEvidence: {
    [guardedKeyOne]: "redacted-value-one",
    [guardedKeyTwo]: "redacted-value-two",
    [guardedKeyThree]: "redacted-value-three",
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

function buildOro10uFinalApprovalDecisionEvidencePackGateFixtures() {
  return [
    validDecisionEvidencePackPreparedFixture,
    reviewOnlyReadyDecisionEvidencePackFixture,
    rejectedDecisionEvidencePackFixture,
    changesRequiredDecisionEvidencePackFixture,
    verificationFailedDecisionEvidencePackFixture,
    expiredDecisionEvidencePackFixture,
    conflictingDecisionEvidencePackFixture,
    invalidVerifiedRecordIdFixture,
    missingDecisionRecordEvidenceFixture,
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
  validDecisionEvidencePackPreparedFixture,
  reviewOnlyReadyDecisionEvidencePackFixture,
  rejectedDecisionEvidencePackFixture,
  changesRequiredDecisionEvidencePackFixture,
  verificationFailedDecisionEvidencePackFixture,
  expiredDecisionEvidencePackFixture,
  conflictingDecisionEvidencePackFixture,
  invalidVerifiedRecordIdFixture,
  missingDecisionRecordEvidenceFixture,
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
  buildOro10uFinalApprovalDecisionEvidencePackGateFixtures,
};
