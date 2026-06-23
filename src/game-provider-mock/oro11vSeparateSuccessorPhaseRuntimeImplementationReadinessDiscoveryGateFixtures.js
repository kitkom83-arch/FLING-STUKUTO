"use strict";

const {
  buildOro11vDefaultInput,
  buildOro11vSafetySummary,
} = require("./oro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11vDefaultInput());
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

const validOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture = buildFixture(
  "validOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture"
);

const oro11tNotClosedFixture = buildFixture("oro11tNotClosedFixture", {
  readinessEvidence: {
    oro11tStatus: "current",
  },
  safetyEvidence: buildOro11vSafetySummary({
    oro11tClosed: false,
  }),
});

const oro11uNotClosedFixture = buildFixture("oro11uNotClosedFixture", {
  readinessEvidence: {
    oro11uStatus: "current",
  },
  safetyEvidence: buildOro11vSafetySummary({
    oro11uClosed: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11vSafetySummary({
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
  safetyEvidence: buildOro11vSafetySummary({
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
  safetyEvidence: buildOro11vSafetySummary({
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
  safetyEvidence: buildOro11vSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixtures() {
  return [
    validOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture,
    oro11tNotClosedFixture,
    oro11uNotClosedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture,
  oro11tNotClosedFixture,
  oro11uNotClosedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixtures,
};