"use strict";

const baseEvidenceSources = Object.freeze({
  routeWiringDesign: {
    present: true,
    phase: "ORO-4F",
    artifact: "Staging Route Wiring Design Contract",
  },
  routePreflight: {
    present: true,
    phase: "ORO-4G",
    artifact: "Staging Route Mount Readiness Checklist",
  },
  dryRunGate: {
    present: true,
    phase: "ORO-4H",
    artifact: "Staging Route Dry-Run Gate",
  },
  internalShadowHarness: {
    present: true,
    phase: "ORO-4I",
    artifact: "Internal Shadow Harness",
  },
  mountDecisionGate: {
    present: true,
    phase: "ORO-4J",
    artifact: "Mount Decision Readiness Gate",
    mountDecision: "manual_review_required",
  },
  humanMountReviewEvidencePack: {
    present: true,
    phase: "ORO-4K",
    artifact: "Human Mount Review Evidence Pack",
    evidencePackResult: "PASS",
    mountApproval: "pending_human_approval",
  },
  authorizationBoundary: {
    present: true,
    phase: "ORO-4L",
    artifact: "Human Approval Record / Pre-Mount Authorization Boundary",
    authorizationBoundaryResult: "PASS",
    humanApprovalRecordTemplatePresent: true,
    signedHumanApprovalRecordPresent: false,
    preMountAuthorization: "pending_manual_authorization",
  },
  staticSafetyChecks: {
    present: true,
    artifact: "No-mount static safety checks",
  },
});

const baseStaticSafetyChecks = Object.freeze({
  srcAppJsChangeAbsent: true,
  expressMountAbsent: true,
  publicAliasAbsent: true,
  activeRouteAbsent: true,
  httpListenerAbsent: true,
  runtimeTrafficAbsent: true,
  walletMutationAbsent: true,
  ledgerMutationAbsent: true,
  prismaWriteAbsent: true,
  dbTransactionAbsent: true,
  externalNetworkAbsent: true,
  liveOroPlayApiCallAbsent: true,
  migrationAbsent: true,
  realMoneyAbsent: true,
});

const baseSignedApprovalIntakeContract = Object.freeze({
  present: true,
  fields: [
    "recordType",
    "phaseReference",
    "projectName",
    "repository",
    "branch",
    "reviewerName",
    "reviewerRole",
    "reviewDate",
    "evidencePackCommit",
    "evidencePackSafeCiRunId",
    "preMountBoundaryCommit",
    "preMountBoundarySafeCiRunId",
    "reviewedPhases",
    "decision",
    "requiredConditionsBeforeMount",
    "rollbackOwner",
    "abortCriteriaAcknowledged",
    "noRealMoneyAcknowledged",
    "noLiveProviderAcknowledged",
    "noRuntimeWalletMutationAcknowledged",
    "noRuntimeLedgerMutationAcknowledged",
    "separatePhaseRequiredAcknowledged",
    "separateExplicitAuthorizationRequiredAcknowledged",
    "signatureMethod",
    "signatureTimestamp",
    "signedRecordReference",
  ],
  decisionOptions: [
    "changes_requested",
    "not_authorized_for_mount",
    "pending_signed_approval_record_review",
  ],
});

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4M",
    evidenceSources: JSON.parse(JSON.stringify(baseEvidenceSources)),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    signedApprovalIntakeContract: JSON.parse(JSON.stringify(baseSignedApprovalIntakeContract)),
    signedApprovalRecordCandidate: {
      present: false,
      status: "absent",
    },
    chatApprovalPhraseCandidate: {
      present: false,
      status: "absent",
    },
    attemptedAuthorizationStates: {},
    trace: {
      boundaryMode: "static mock signed approval intake gate",
      evidencePackCommit: "6259202b3660eb2de19b1de746269339ac14ea7b",
      evidencePackSafeCiRunId: "26869544430",
      finalBoundary: "pending signed approval record",
    },
    expected: {
      signedApprovalIntakeGateResult: "PASS",
      signedApprovalIntakeContractPresent: true,
      signedApprovalRecordPresent: false,
      signedApprovalRecordVerified: false,
      signedApprovalIntakeStatus: "verification_pack_passed_pending_human_record",
      preMountAuthorization: "pending_signed_approval_record",
      routeMountAuthorization: "not_authorized_for_mount",
      humanAuthorizationRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
      blockers: [],
    },
  };
}

const happyPathSignedApprovalIntakeGateFixture = Object.freeze(
  baseFixture("happyPathSignedApprovalIntakeGateFixture")
);

const missingOro4lAuthorizationBoundaryFixture = Object.freeze({
  ...baseFixture("missingOro4lAuthorizationBoundaryFixture"),
  evidenceSources: {
    ...baseEvidenceSources,
    authorizationBoundary: {
      present: false,
      phase: "ORO-4L",
    },
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "missing ORO-4L authorization boundary",
  },
});

const missingSignedApprovalIntakeContractFixture = Object.freeze({
  ...baseFixture("missingSignedApprovalIntakeContractFixture"),
  signedApprovalIntakeContract: {
    present: false,
    fields: [],
    decisionOptions: [],
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    signedApprovalIntakeStatus: "intake_contract_missing",
    blocker: "missing signed approval intake contract",
  },
});

const chatApprovalPhraseFixture = Object.freeze({
  ...baseFixture("chatApprovalPhraseFixture"),
  chatApprovalPhraseCandidate: {
    present: true,
    status: "received",
    phraseKind: "chat_message",
    sample: "okay to start this phase",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    signedApprovalRecordVerified: false,
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "chat approval is not accepted as signed record",
  },
});

const vagueApprovalPhraseFixture = Object.freeze({
  ...baseFixture("vagueApprovalPhraseFixture"),
  chatApprovalPhraseCandidate: {
    present: true,
    status: "received",
    vague: true,
    sample: "looks fine",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    signedApprovalRecordVerified: false,
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "vague approval phrase rejected",
  },
});

const mockSignedApprovalCandidateFixture = Object.freeze({
  ...baseFixture("mockSignedApprovalCandidateFixture"),
  signedApprovalRecordCandidate: {
    present: true,
    status: "received",
    kind: "mock_candidate",
    mock: true,
  },
  trace: {
    candidateMode: "mock placeholder only",
  },
  expected: {
    signedApprovalRecordPresent: true,
    signedApprovalRecordVerified: false,
    signedApprovalIntakeStatus: "candidate_record_received_for_review",
    routeMountAuthorization: "not_authorized_for_mount",
    note: "mock candidate is not actual authorization",
  },
});

const actualSignedApprovalAttemptedFixture = Object.freeze({
  ...baseFixture("actualSignedApprovalAttemptedFixture"),
  signedApprovalRecordCandidate: {
    present: true,
    status: "received",
    kind: "actual",
    actual: true,
  },
  trace: {
    attemptedState: "actual signed approval attempted",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    signedApprovalRecordVerified: false,
    preMountAuthorization: "not_authorized_for_mount",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "actual signed approval record not accepted in ORO-4M static/mock gate",
  },
});

const accidentalExpressMountFixture = Object.freeze({
  ...baseFixture("accidentalExpressMountFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    expressMountAbsent: false,
  },
  trace: {
    attemptedState: "express mount present",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "express mount present",
  },
});

const publicAliasFixture = Object.freeze({
  ...baseFixture("publicAliasFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    publicAliasAbsent: false,
  },
  trace: {
    attemptedState: "public alias present",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "public alias present",
  },
});

const runtimeMutationFixture = Object.freeze({
  ...baseFixture("runtimeMutationFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    walletMutationAbsent: false,
    ledgerMutationAbsent: false,
  },
  trace: {
    attemptedState: "mock runtime mutation flags present",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blockers: ["walletMutation present", "ledgerMutation present"],
  },
});

const externalNetworkFixture = Object.freeze({
  ...baseFixture("externalNetworkFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    externalNetworkAbsent: false,
  },
  trace: {
    attemptedState: "externalNetwork present",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "externalNetwork present",
  },
});

const prismaWriteFixture = Object.freeze({
  ...baseFixture("prismaWriteFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    prismaWriteAbsent: false,
  },
  trace: {
    attemptedState: "prismaWrite present",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "prismaWrite present",
  },
});

const forbiddenAuthorizationStateFixture = Object.freeze({
  ...baseFixture("forbiddenAuthorizationStateFixture"),
  attemptedAuthorizationStates: {
    routeMountAuthorization: "route_mount_authorized",
  },
  trace: {
    attemptedState: "forbidden route mount authorization state",
  },
  expected: {
    signedApprovalIntakeGateResult: "FAIL",
    routeMountAuthorization: "not_authorized_for_mount",
    blocker: "forbidden route mount authorization state",
  },
});

const secretLikeTrace = {};
secretLikeTrace[["author", "ization"].join("")] = ["mock", "auth", "header", "value"].join("-");
secretLikeTrace[["bear", "er"].join("")] = ["mock", "bearer", "value"].join("-");
secretLikeTrace[["bas", "ic"].join("")] = ["mock", "basic", "value"].join("-");
secretLikeTrace[["to", "ken"].join("")] = ["mock", "token", "value"].join("-");
secretLikeTrace[["client", "Secret"].join("")] = ["mock", "client", "credential", "value"].join("-");
secretLikeTrace[["pass", "word"].join("")] = ["mock", "password", "value"].join("-");
secretLikeTrace[["database", "Url"].join("")] = ["mock", "database", "url", "value"].join("-");
secretLikeTrace[["private", "Key"].join("")] = ["mock", "private", "key", "value"].join("-");
secretLikeTrace[["api", "Key"].join("")] = ["mock", "api", "key", "value"].join("-");
secretLikeTrace[["coo", "kie"].join("")] = ["mock", "cookie", "value"].join("-");
secretLikeTrace[["set", "Cookie"].join("")] = ["mock", "set", "cookie", "value"].join("-");
secretLikeTrace[["x", "Api", "Key"].join("")] = ["mock", "x", "api", "key", "value"].join("-");
secretLikeTrace[["sign", "ature"].join("")] = ["mock", "signature", "value"].join("-");
secretLikeTrace[["signed", "Approval"].join("")] = ["mock", "approval", "placeholder", "value"].join("-");
secretLikeTrace[["approval", "Signature"].join("")] = ["mock", "signature", "value"].join("-");
secretLikeTrace[["signed", "Record", "Reference"].join("")] = ["mock", "signed", "record", "reference"].join("-");
secretLikeTrace[["signature", "Method"].join("")] = "mock-method";
secretLikeTrace.nested = {
  safeContext: "static mock fixture",
};

const secretLikeTraceFixture = Object.freeze({
  ...baseFixture("secretLikeTraceFixture"),
  trace: secretLikeTrace,
  expected: {
    signedApprovalIntakeGateResult: "PASS",
    sanitized: true,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildSignedApprovalIntakeGateFixtures() {
  return [
    happyPathSignedApprovalIntakeGateFixture,
    missingOro4lAuthorizationBoundaryFixture,
    missingSignedApprovalIntakeContractFixture,
    chatApprovalPhraseFixture,
    vagueApprovalPhraseFixture,
    mockSignedApprovalCandidateFixture,
    actualSignedApprovalAttemptedFixture,
    accidentalExpressMountFixture,
    publicAliasFixture,
    runtimeMutationFixture,
    externalNetworkFixture,
    prismaWriteFixture,
    forbiddenAuthorizationStateFixture,
    secretLikeTraceFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathSignedApprovalIntakeGateFixture,
  missingOro4lAuthorizationBoundaryFixture,
  missingSignedApprovalIntakeContractFixture,
  chatApprovalPhraseFixture,
  vagueApprovalPhraseFixture,
  mockSignedApprovalCandidateFixture,
  actualSignedApprovalAttemptedFixture,
  accidentalExpressMountFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  externalNetworkFixture,
  prismaWriteFixture,
  forbiddenAuthorizationStateFixture,
  secretLikeTraceFixture,
  cloneFixture,
  buildSignedApprovalIntakeGateFixtures,
};
