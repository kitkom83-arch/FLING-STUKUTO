"use strict";

const {
  buildOro11pDefaultInput,
  buildOro11pSafetySummary,
} = require("./oro11pSeparateSuccessorPhaseImplementationReadinessReviewGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11pDefaultInput());
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

const validOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture = buildFixture(
  "validOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture"
);

const oro11nNotClosedFixture = buildFixture("oro11nNotClosedFixture", {
  reviewEvidence: {
    oro11nStatus: "current",
  },
  safetyEvidence: buildOro11pSafetySummary({
    oro11nClosed: false,
  }),
});

const oro11oNotClosedFixture = buildFixture("oro11oNotClosedFixture", {
  reviewEvidence: {
    oro11oStatus: "current",
  },
  safetyEvidence: buildOro11pSafetySummary({
    oro11oClosed: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11pSafetySummary({
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
  safetyEvidence: buildOro11pSafetySummary({
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
  safetyEvidence: buildOro11pSafetySummary({
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
  safetyEvidence: buildOro11pSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixtures() {
  return [
    validOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture,
    oro11nNotClosedFixture,
    oro11oNotClosedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture,
  oro11nNotClosedFixture,
  oro11oNotClosedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixtures,
};
