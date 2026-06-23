"use strict";

const {
  buildOro11tDefaultInput,
  buildOro11tSafetySummary,
} = require("./oro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11tDefaultInput());
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

const validOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture = buildFixture(
  "validOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture"
);

const oro11sNotClosedFixture = buildFixture("oro11sNotClosedFixture", {
  decisionEvidence: {
    oro11sStatus: "current",
  },
  safetyEvidence: buildOro11tSafetySummary({
    oro11sClosed: false,
  }),
});

const oro11sDispositionMismatchFixture = buildFixture("oro11sDispositionMismatchFixture", {
  decisionEvidence: {
    oro11sDisposition: "runtime_implementation_authorization_request_pending",
  },
  safetyEvidence: buildOro11tSafetySummary({
    oro11sWasRuntimeImplementationAuthorizationRequestGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11tSafetySummary({
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
  safetyEvidence: buildOro11tSafetySummary({
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
  safetyEvidence: buildOro11tSafetySummary({
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
  safetyEvidence: buildOro11tSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixtures() {
  return [
    validOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture,
    oro11sNotClosedFixture,
    oro11sDispositionMismatchFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture,
  oro11sNotClosedFixture,
  oro11sDispositionMismatchFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixtures,
};
