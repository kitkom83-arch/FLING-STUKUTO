"use strict";

const {
  buildOro11lDefaultInput,
  buildOro11lSafetySummary,
} = require("./oro11lSeparateSuccessorPhaseAuthorizationRequestGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11lDefaultInput());
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

const validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture = buildFixture(
  "validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture"
);

const oro11iNotClosedFixture = buildFixture("oro11iNotClosedFixture", {
  requestEvidence: {
    oro11iStatus: "current",
  },
  safetyEvidence: buildOro11lSafetySummary({
    oro11iClosed: false,
  }),
});

const oro11jNotClosedFixture = buildFixture("oro11jNotClosedFixture", {
  requestEvidence: {
    oro11jStatus: "current",
  },
  safetyEvidence: buildOro11lSafetySummary({
    oro11jClosed: false,
  }),
});

const oro11kNotClosedFixture = buildFixture("oro11kNotClosedFixture", {
  requestEvidence: {
    oro11kStatus: "current",
  },
  safetyEvidence: buildOro11lSafetySummary({
    oro11kClosed: false,
  }),
});

const approvalGrantedFixture = buildFixture("approvalGrantedFixture", {
  safetyEvidence: buildOro11lSafetySummary({
    notApprovalGranted: false,
    approvalGranted: true,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11lSafetySummary({
    runtimeImplementationNotApproved: false,
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
  safetyEvidence: buildOro11lSafetySummary({
    liveExecutionNotApproved: false,
    externalCallNotApproved: false,
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
  safetyEvidence: buildOro11lSafetySummary({
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

function buildOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixtures() {
  return [
    validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture,
    oro11iNotClosedFixture,
    oro11jNotClosedFixture,
    oro11kNotClosedFixture,
    approvalGrantedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
  ];
}

module.exports = {
  validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture,
  oro11iNotClosedFixture,
  oro11jNotClosedFixture,
  oro11kNotClosedFixture,
  approvalGrantedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  buildOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixtures,
};
