"use strict";

const {
  buildOro11iDefaultInput,
  buildOro11iSafetySummary,
} = require("./oro11iCloseoutWordingAlignmentGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11iDefaultInput());
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

const validOro11iCloseoutWordingAlignmentGateFixture = buildFixture(
  "validOro11iCloseoutWordingAlignmentGateFixture"
);

const staleOro11gCurrentWordingFixture = buildFixture("staleOro11gCurrentWordingFixture", {
  closeoutEvidence: {
    oro11gStatus: "current",
    staleOro11gCurrentWordingResolved: false,
  },
  safetyEvidence: buildOro11iSafetySummary({
    oro11gClosed: false,
    staleOro11gCurrentWordingResolved: false,
  }),
});

const staleOro11hCurrentWordingFixture = buildFixture("staleOro11hCurrentWordingFixture", {
  closeoutEvidence: {
    oro11hStatus: "current",
    staleOro11hCurrentWordingResolved: false,
  },
  safetyEvidence: buildOro11iSafetySummary({
    oro11hClosed: false,
    staleOro11hCurrentWordingResolved: false,
  }),
});

const missingSeparateGateLockFixture = buildFixture("missingSeparateGateLockFixture", {
  closeoutEvidence: {
    nextPhaseStatus: "unnamed_without_gate",
  },
  safetyEvidence: buildOro11iSafetySummary({
    nextPhaseRequiresSeparateGate: false,
  }),
});

const runtimeAccidentallyEnabledFixture = buildFixture("runtimeAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11iSafetySummary({
    runtimeRoutesDisabled: false,
    publicAliasesDisabled: false,
    runtimeRouteController: true,
    expressMount: true,
    publicAlias: true,
    apiBalanceActiveRoute: true,
    apiTransactionActiveRoute: true,
  }),
});

const liveExternalMoneyAccidentallyEnabledFixture = buildFixture("liveExternalMoneyAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11iSafetySummary({
    liveExecutionDisabled: false,
    externalCallDisabled: false,
    realMoneyDisabled: false,
    liveExecution: true,
    externalCall: true,
    liveOroPlayApiCall: true,
    realMoney: true,
    payout: true,
    autoCredit: true,
    gameLaunch: true,
  }),
});

const mutationAccidentallyEnabledFixture = buildFixture("mutationAccidentallyEnabledFixture", {
  safetyEvidence: buildOro11iSafetySummary({
    walletMutationDisabled: false,
    ledgerMutationDisabled: false,
    walletMutation: true,
    ledgerMutation: true,
    prismaWrite: true,
    dbTransaction: true,
    migration: true,
    deploy: true,
  }),
});

function buildOro11iCloseoutWordingAlignmentGateFixtures() {
  return [
    validOro11iCloseoutWordingAlignmentGateFixture,
    staleOro11gCurrentWordingFixture,
    staleOro11hCurrentWordingFixture,
    missingSeparateGateLockFixture,
    runtimeAccidentallyEnabledFixture,
    liveExternalMoneyAccidentallyEnabledFixture,
    mutationAccidentallyEnabledFixture,
  ];
}

module.exports = {
  validOro11iCloseoutWordingAlignmentGateFixture,
  staleOro11gCurrentWordingFixture,
  staleOro11hCurrentWordingFixture,
  missingSeparateGateLockFixture,
  runtimeAccidentallyEnabledFixture,
  liveExternalMoneyAccidentallyEnabledFixture,
  mutationAccidentallyEnabledFixture,
  buildOro11iCloseoutWordingAlignmentGateFixtures,
};
