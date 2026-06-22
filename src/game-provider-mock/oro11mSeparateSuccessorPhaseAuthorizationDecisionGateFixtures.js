"use strict";

const {
  buildOro11mDefaultInput,
  buildOro11mSafetySummary,
} = require("./oro11mSeparateSuccessorPhaseAuthorizationDecisionGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11mDefaultInput());
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

const validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture = buildFixture(
  "validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture"
);

const oro11iNotClosedFixture = buildFixture("oro11iNotClosedFixture", {
  decisionEvidence: {
    oro11iStatus: "current",
  },
  safetyEvidence: buildOro11mSafetySummary({
    oro11iClosed: false,
  }),
});

const oro11jNotClosedFixture = buildFixture("oro11jNotClosedFixture", {
  decisionEvidence: {
    oro11jStatus: "current",
  },
  safetyEvidence: buildOro11mSafetySummary({
    oro11jClosed: false,
  }),
});

const oro11kNotClosedFixture = buildFixture("oro11kNotClosedFixture", {
  decisionEvidence: {
    oro11kStatus: "current",
  },
  safetyEvidence: buildOro11mSafetySummary({
    oro11kClosed: false,
  }),
});

const oro11lNotClosedFixture = buildFixture("oro11lNotClosedFixture", {
  decisionEvidence: {
    oro11lStatus: "current",
  },
  safetyEvidence: buildOro11mSafetySummary({
    oro11lClosed: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11mSafetySummary({
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
  safetyEvidence: buildOro11mSafetySummary({
    liveExecutionDisabled: false,
    externalCallExecutionNotApproved: false,
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
  safetyEvidence: buildOro11mSafetySummary({
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

function buildOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixtures() {
  return [
    validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture,
    oro11iNotClosedFixture,
    oro11jNotClosedFixture,
    oro11kNotClosedFixture,
    oro11lNotClosedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
  ];
}

module.exports = {
  validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture,
  oro11iNotClosedFixture,
  oro11jNotClosedFixture,
  oro11kNotClosedFixture,
  oro11lNotClosedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  buildOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixtures,
};
