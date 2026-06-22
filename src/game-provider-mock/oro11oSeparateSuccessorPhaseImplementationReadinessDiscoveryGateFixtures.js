"use strict";

const {
  buildOro11oDefaultInput,
  buildOro11oSafetySummary,
} = require("./oro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11oDefaultInput());
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

const validOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture = buildFixture(
  "validOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture"
);

const oro11mNotClosedFixture = buildFixture("oro11mNotClosedFixture", {
  readinessEvidence: {
    oro11mStatus: "current",
  },
  safetyEvidence: buildOro11oSafetySummary({
    oro11mClosed: false,
  }),
});

const oro11nNotClosedFixture = buildFixture("oro11nNotClosedFixture", {
  readinessEvidence: {
    oro11nStatus: "current",
  },
  safetyEvidence: buildOro11oSafetySummary({
    oro11nClosed: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11oSafetySummary({
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
  safetyEvidence: buildOro11oSafetySummary({
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
  safetyEvidence: buildOro11oSafetySummary({
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
  safetyEvidence: buildOro11oSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixtures() {
  return [
    validOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture,
    oro11mNotClosedFixture,
    oro11nNotClosedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture,
  oro11mNotClosedFixture,
  oro11nNotClosedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixtures,
};
