"use strict";

const {
  buildOro11qDefaultInput,
  buildOro11qSafetySummary,
} = require("./oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11qDefaultInput());
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

const validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture = buildFixture(
  "validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture"
);

const oro11pNotClosedFixture = buildFixture("oro11pNotClosedFixture", {
  decisionEvidence: {
    oro11pStatus: "current",
  },
  safetyEvidence: buildOro11qSafetySummary({
    oro11pClosed: false,
  }),
});

const oro11pDispositionMismatchFixture = buildFixture("oro11pDispositionMismatchFixture", {
  decisionEvidence: {
    oro11pDisposition: "implementation_readiness_review_pending",
  },
  safetyEvidence: buildOro11qSafetySummary({
    oro11pWasImplementationReadinessReviewGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11qSafetySummary({
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
  safetyEvidence: buildOro11qSafetySummary({
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
  safetyEvidence: buildOro11qSafetySummary({
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
  safetyEvidence: buildOro11qSafetySummary({
    credentialMaterialAbsent: false,
    credentialMaterial: true,
  }),
});

function buildOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixtures() {
  return [
    validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture,
    oro11pNotClosedFixture,
    oro11pDispositionMismatchFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
    credentialMaterialDetectedFixture,
  ];
}

module.exports = {
  validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture,
  oro11pNotClosedFixture,
  oro11pDispositionMismatchFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  credentialMaterialDetectedFixture,
  buildOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixtures,
};