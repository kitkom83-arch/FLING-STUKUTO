"use strict";

const {
  buildOro11jDefaultInput,
  buildOro11jSafetySummary,
} = require("./oro11jNextPhaseDiscoveryGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11jDefaultInput());
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

const validOro11jNextPhaseDiscoveryGateFixture = buildFixture(
  "validOro11jNextPhaseDiscoveryGateFixture"
);

const oro11iNotClosedFixture = buildFixture("oro11iNotClosedFixture", {
  discoveryEvidence: {
    oro11iStatus: "current",
  },
  safetyEvidence: buildOro11jSafetySummary({
    oro11iClosed: false,
  }),
});

const oro11jPreexistedFixture = buildFixture("oro11jPreexistedFixture", {
  discoveryEvidence: {
    oro11jPreexistingStatus: "present_before_gate",
  },
  safetyEvidence: buildOro11jSafetySummary({
    oro11jDidNotPreexist: false,
  }),
});

const namedNextPhaseBeforeOro11jFixture = buildFixture("namedNextPhaseBeforeOro11jFixture", {
  discoveryEvidence: {
    postOro11iNextPhaseStatus: "named_without_separate_gate",
  },
  safetyEvidence: buildOro11jSafetySummary({
    postOro11iNextPhaseWasUnnamed: false,
    nextPhaseRequiresSeparateGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11jSafetySummary({
    runtimeImplementationDisabled: false,
    routeMountDisabled: false,
    publicAliasDisabled: false,
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
  safetyEvidence: buildOro11jSafetySummary({
    liveOroPlayApiCallDisabled: false,
    externalNetworkDisabled: false,
    liveExecution: true,
    liveOroPlayApiCall: true,
    externalNetwork: true,
    externalCall: true,
    gameLaunch: true,
  }),
});

const mutationAccidentallyEnabledFixture = buildFixture("mutationAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11jSafetySummary({
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

function buildOro11jNextPhaseDiscoveryGateFixtures() {
  return [
    validOro11jNextPhaseDiscoveryGateFixture,
    oro11iNotClosedFixture,
    oro11jPreexistedFixture,
    namedNextPhaseBeforeOro11jFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
  ];
}

module.exports = {
  validOro11jNextPhaseDiscoveryGateFixture,
  oro11iNotClosedFixture,
  oro11jPreexistedFixture,
  namedNextPhaseBeforeOro11jFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  buildOro11jNextPhaseDiscoveryGateFixtures,
};
