"use strict";

const {
  buildOro11rDefaultInput,
  buildOro11rSafetySummary,
} = require("./oro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11rDefaultInput());
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

const validOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture = buildFixture(
  "validOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture"
);

const oro11qNotClosedFixture = buildFixture("oro11qNotClosedFixture", {
  closeoutEvidence: {
    oro11qStatus: "current",
  },
  safetyEvidence: buildOro11rSafetySummary({
    oro11qClosed: false,
  }),
});

const oro11qDispositionMismatchFixture = buildFixture("oro11qDispositionMismatchFixture", {
  closeoutEvidence: {
    oro11qDisposition: "implementation_readiness_decision_pending",
  },
  safetyEvidence: buildOro11rSafetySummary({
    oro11qWasImplementationReadinessDecisionGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11rSafetySummary({
    runtimeImplementationDisabled: false,
    routeMountNotApproved: false,
    publicAliasNotApproved: false,
    apiBalanceDisabled: false,
    apiTransactionDisabled: false,
    runtimeImplementation: true,
    runtimeRouteController: true,
    expressMount: true,
    routeMount: true,
    publicAlias: true,
    apiBalanceActiveRoute: true,
    apiTransactionActiveRoute: true,
  }),
});

const liveExternalAccidentallyEnabledFixture = buildFixture("liveExternalAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11rSafetySummary({
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
  safetyEvidence: buildOro11rSafetySummary({
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
  safetyEvidence: buildOro11rSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixtures() {
  return [
    validOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture,
    oro11qNotClosedFixture,
    oro11qDispositionMismatchFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture,
  oro11qNotClosedFixture,
  oro11qDispositionMismatchFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixtures,
};