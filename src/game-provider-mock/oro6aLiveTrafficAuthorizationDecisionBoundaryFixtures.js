"use strict";

const {
  buildOro6aLiveTrafficAuthorizationDecisionInput,
} = require("./oro6aLiveTrafficAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6aLiveTrafficAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficAuthorizationDecisionFixture = fixture(
  "happyPathLiveTrafficAuthorizationDecisionFixture"
);

const missingOro5zRequestRecordFixture = fixture(
  "missingOro5zRequestRecordFixture",
  {
    oro5zRequestEvidence: {
      dependsOnOro5zLiveTrafficAuthorizationRequestBoundary: false,
      oro5zLiveTrafficAuthorizationRequestSubmitted: false,
    },
  }
);

const oro5zRequestNotSubmittedFixture = fixture(
  "oro5zRequestNotSubmittedFixture",
  {
    oro5zRequestEvidence: {
      oro5zLiveTrafficAuthorizationRequestSubmitted: false,
    },
  }
);

const runtimeModeNotFailClosedNoMutationFixture = fixture(
  "runtimeModeNotFailClosedNoMutationFixture",
  {
    oro5zRequestEvidence: {
      runtimeTrafficModeFromOro5z: "mutation_enabled",
    },
  }
);

const liveTrafficAlreadyEnabledViolationFixture = fixture(
  "liveTrafficAlreadyEnabledViolationFixture",
  {
    liveTrafficEvidence: { liveTrafficEnabled: true },
  }
);

const walletMutationViolationFixture = fixture("walletMutationViolationFixture", {
  safetyEvidence: { [["wallet", "MutationPerformed"].join("")]: true },
});

const ledgerMutationViolationFixture = fixture("ledgerMutationViolationFixture", {
  safetyEvidence: { [["ledger", "MutationPerformed"].join("")]: true },
});

const prismaWriteViolationFixture = fixture("prismaWriteViolationFixture", {
  safetyEvidence: { [["prisma", "WritePerformed"].join("")]: true },
});

const dbTransactionViolationFixture = fixture("dbTransactionViolationFixture", {
  safetyEvidence: { [["db", "TransactionPerformed"].join("")]: true },
});

const externalNetworkViolationFixture = fixture("externalNetworkViolationFixture", {
  safetyEvidence: { [["external", "NetworkCalled"].join("")]: true },
});

const liveOroPlayApiCallViolationFixture = fixture(
  "liveOroPlayApiCallViolationFixture",
  {
    safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
  }
);

const decisionMissingSeparateEnablementRequirementFixture = fixture(
  "decisionMissingSeparateEnablementRequirementFixture",
  {
    liveTrafficEvidence: {
      separateLiveTrafficEnablementRequired: false,
      nextPhaseRequiresLiveTrafficEnablementBoundary: false,
    },
  }
);

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  decisionEvidence: { responseSanitized: true },
});

function buildOro6aLiveTrafficAuthorizationDecisionFixtures() {
  return [
    happyPathLiveTrafficAuthorizationDecisionFixture,
    missingOro5zRequestRecordFixture,
    oro5zRequestNotSubmittedFixture,
    runtimeModeNotFailClosedNoMutationFixture,
    liveTrafficAlreadyEnabledViolationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    externalNetworkViolationFixture,
    liveOroPlayApiCallViolationFixture,
    decisionMissingSeparateEnablementRequirementFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficAuthorizationDecisionFixture,
  missingOro5zRequestRecordFixture,
  oro5zRequestNotSubmittedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  liveOroPlayApiCallViolationFixture,
  decisionMissingSeparateEnablementRequirementFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro6aLiveTrafficAuthorizationDecisionFixtures,
};
