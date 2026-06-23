"use strict";

const {
  buildOro11sDefaultInput,
  buildOro11sSafetySummary,
} = require("./oro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11sDefaultInput());
  merged.id = id;
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === "object" && !Array.isArray(value) && merged[key] && typeof merged[key] === "object") {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }
  return Object.freeze(merged);
}

const validOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture = buildFixture(
  "validOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture"
);

const oro11rNotClosedFixture = buildFixture("oro11rNotClosedFixture", {
  requestEvidence: {
    oro11rStatus: "current",
  },
  safetyEvidence: buildOro11sSafetySummary({
    oro11rClosed: false,
  }),
});

const oro11rDispositionMismatchFixture = buildFixture("oro11rDispositionMismatchFixture", {
  requestEvidence: {
    oro11rDisposition: "implementation_readiness_decision_closeout_pending",
  },
  safetyEvidence: buildOro11sSafetySummary({
    oro11rWasImplementationReadinessDecisionCloseoutConfirmationGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11sSafetySummary({
    runtimeImplementationNotYetApproved: false,
    runtimeImplementationDisabled: false,
    routeMountNotApproved: false,
    publicAliasNotApproved: false,
    apiBalanceDisabled: false,
    apiTransactionDisabled: false,
    runtimeImplementation: true,
    runtimeImplementationApproved: true,
    runtimeRouteController: true,
    expressMount: true,
    routeMount: true,
    publicAlias: true,
    apiBalanceActiveRoute: true,
    apiTransactionActiveRoute: true,
  }),
});

const liveExternalAccidentallyEnabledFixture = buildFixture("liveExternalAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11sSafetySummary({
    liveExecutionDisabled: false,
    liveOroPlayApiCallDisabled: false,
    externalNetworkDisabled: false,
    liveExecution: true,
    externalCall: true,
    liveOroPlayApiCall: true,
    externalNetwork: true,
    gameLaunch: true,
  }),
});

const mutationAccidentallyEnabledFixture = buildFixture("mutationAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11sSafetySummary({
    walletMutationDisabled: false,
    ledgerMutationDisabled: false,
    prismaWriteDisabled: false,
    migrationDisabled: false,
    deployDisabled: false,
    productionDbDisabled: false,
    realMoneyDisabled: false,
    walletMutation: true,
    ledgerMutation: true,
    prismaWrite: true,
    dbTransaction: true,
    migration: true,
    deploy: true,
    productionDb: true,
    realMoney: true,
    payout: true,
    autoCredit: true,
  }),
});

const credentialMaterialDetectedFixture = buildFixture("credentialMaterialDetectedFixture", {
  safetyEvidence: buildOro11sSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixtures() {
  return [
    validOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture,
    oro11rNotClosedFixture,
    oro11rDispositionMismatchFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture,
  oro11rNotClosedFixture,
  oro11rDispositionMismatchFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixtures,
};