"use strict";

const {
  buildOro11wDefaultInput,
  buildOro11wSafetySummary,
} = require("./oro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11wDefaultInput());
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

const validOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture = buildFixture(
  "validOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture"
);

const oro11uNotClosedFixture = buildFixture("oro11uNotClosedFixture", {
  reviewEvidence: {
    oro11uStatus: "current",
  },
  safetyEvidence: buildOro11wSafetySummary({
    oro11uClosed: false,
  }),
});

const oro11vNotClosedFixture = buildFixture("oro11vNotClosedFixture", {
  reviewEvidence: {
    oro11vStatus: "current",
  },
  safetyEvidence: buildOro11wSafetySummary({
    oro11vClosed: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11wSafetySummary({
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
  safetyEvidence: buildOro11wSafetySummary({
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
  safetyEvidence: buildOro11wSafetySummary({
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
  safetyEvidence: buildOro11wSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixtures() {
  return [
    validOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture,
    oro11uNotClosedFixture,
    oro11vNotClosedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture,
  oro11uNotClosedFixture,
  oro11vNotClosedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixtures,
};