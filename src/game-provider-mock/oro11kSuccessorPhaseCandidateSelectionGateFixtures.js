"use strict";

const {
  buildOro11kDefaultInput,
  buildOro11kSafetySummary,
} = require("./oro11kSuccessorPhaseCandidateSelectionGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11kDefaultInput());
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

const validOro11kSuccessorPhaseCandidateSelectionGateFixture = buildFixture(
  "validOro11kSuccessorPhaseCandidateSelectionGateFixture"
);

const oro11iNotClosedFixture = buildFixture("oro11iNotClosedFixture", {
  candidateEvidence: {
    oro11iStatus: "current",
  },
  safetyEvidence: buildOro11kSafetySummary({
    oro11iClosed: false,
  }),
});

const oro11jNotClosedFixture = buildFixture("oro11jNotClosedFixture", {
  candidateEvidence: {
    oro11jStatus: "current",
  },
  safetyEvidence: buildOro11kSafetySummary({
    oro11jClosed: false,
  }),
});

const oro11jDiscoveryNotCompletedFixture = buildFixture("oro11jDiscoveryNotCompletedFixture", {
  candidateEvidence: {
    oro11jDisposition: "discovery_not_completed",
  },
  safetyEvidence: buildOro11kSafetySummary({
    oro11jDiscoveryGateCompleted: false,
  }),
});

const candidatePhaseNotLockedFixture = buildFixture("candidatePhaseNotLockedFixture", {
  candidateEvidence: {
    candidatePhaseStatus: "selected_without_separate_gate",
  },
  safetyEvidence: buildOro11kSafetySummary({
    candidatePhaseRequiresSeparateGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11kSafetySummary({
    runtimeImplementationDisabled: false,
    routeMountDisabled: false,
    publicAliasDisabled: false,
    apiBalanceDisabled: false,
    apiTransactionDisabled: false,
    candidatePhaseRuntimeLocked: false,
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
  safetyEvidence: buildOro11kSafetySummary({
    liveOroPlayApiCallDisabled: false,
    externalNetworkDisabled: false,
    candidatePhaseLiveExternalCallLocked: false,
    liveExecution: true,
    liveOroPlayApiCall: true,
    externalNetwork: true,
    externalCall: true,
    gameLaunch: true,
  }),
});

const mutationAccidentallyEnabledFixture = buildFixture("mutationAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11kSafetySummary({
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

function buildOro11kSuccessorPhaseCandidateSelectionGateFixtures() {
  return [
    validOro11kSuccessorPhaseCandidateSelectionGateFixture,
    oro11iNotClosedFixture,
    oro11jNotClosedFixture,
    oro11jDiscoveryNotCompletedFixture,
    candidatePhaseNotLockedFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
  ];
}

module.exports = {
  validOro11kSuccessorPhaseCandidateSelectionGateFixture,
  oro11iNotClosedFixture,
  oro11jNotClosedFixture,
  oro11jDiscoveryNotCompletedFixture,
  candidatePhaseNotLockedFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  buildOro11kSuccessorPhaseCandidateSelectionGateFixtures,
};
