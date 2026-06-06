"use strict";

const {
  buildOro5zLiveTrafficAuthorizationRequestInput,
} = require("./oro5zLiveTrafficAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5zLiveTrafficAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficAuthorizationRequestFixture = fixture(
  "happyPathLiveTrafficAuthorizationRequestFixture"
);

const missingOro5yValidationRecordFixture = fixture(
  "missingOro5yValidationRecordFixture",
  {
    oro5yValidationEvidence: {
      dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary: false,
      oro5yRuntimeTrafficPostEnablementValidationPassed: false,
    },
  }
);

const oro5yNotPassedFixture = fixture("oro5yNotPassedFixture", {
  oro5yValidationEvidence: {
    oro5yRuntimeTrafficPostEnablementValidationPassed: false,
  },
});

const runtimeModeNotFailClosedNoMutationFixture = fixture(
  "runtimeModeNotFailClosedNoMutationFixture",
  {
    oro5yValidationEvidence: {
      runtimeTrafficModeFromOro5y: "mutation_enabled",
    },
  }
);

const liveTrafficAlreadyEnabledViolationFixture = fixture(
  "liveTrafficAlreadyEnabledViolationFixture",
  {
    decisionEvidence: { liveTrafficEnabled: true },
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

const missingHumanApprovalRequirementFixture = fixture(
  "missingHumanApprovalRequirementFixture",
  {
    requestEvidence: {
      humanApprovalRequired: false,
      separateLiveTrafficDecisionRequired: false,
    },
  }
);

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  requestEvidence: { responseSanitized: true },
});

function buildOro5zLiveTrafficAuthorizationRequestFixtures() {
  return [
    happyPathLiveTrafficAuthorizationRequestFixture,
    missingOro5yValidationRecordFixture,
    oro5yNotPassedFixture,
    runtimeModeNotFailClosedNoMutationFixture,
    liveTrafficAlreadyEnabledViolationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    externalNetworkViolationFixture,
    liveOroPlayApiCallViolationFixture,
    missingHumanApprovalRequirementFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficAuthorizationRequestFixture,
  missingOro5yValidationRecordFixture,
  oro5yNotPassedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  liveOroPlayApiCallViolationFixture,
  missingHumanApprovalRequirementFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro5zLiveTrafficAuthorizationRequestFixtures,
};
