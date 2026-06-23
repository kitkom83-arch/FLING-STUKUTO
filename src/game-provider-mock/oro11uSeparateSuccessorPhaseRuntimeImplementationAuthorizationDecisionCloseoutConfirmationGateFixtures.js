"use strict";

const {
  buildOro11uDefaultInput,
  buildOro11uSafetySummary,
} = require("./oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11uDefaultInput());
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

const validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture = buildFixture(
  "validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture"
);

const oro11tNotClosedFixture = buildFixture("oro11tNotClosedFixture", {
  closeoutEvidence: {
    oro11tStatus: "current",
  },
  safetyEvidence: buildOro11uSafetySummary({
    oro11tClosed: false,
  }),
});

const oro11tDispositionMismatchFixture = buildFixture("oro11tDispositionMismatchFixture", {
  closeoutEvidence: {
    oro11tDisposition: "runtime_implementation_authorization_decision_pending",
  },
  safetyEvidence: buildOro11uSafetySummary({
    oro11tWasRuntimeImplementationAuthorizationDecisionGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11uSafetySummary({
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
  safetyEvidence: buildOro11uSafetySummary({
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
  safetyEvidence: buildOro11uSafetySummary({
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
  safetyEvidence: buildOro11uSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixtures() {
  return [
    validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture,
    oro11tNotClosedFixture,
    oro11tDispositionMismatchFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture,
  oro11tNotClosedFixture,
  oro11tDispositionMismatchFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixtures,
};