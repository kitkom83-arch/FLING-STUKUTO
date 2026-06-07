"use strict";

const {
  buildOro6eLiveTrafficExternalCallAuthorizationRequestInput,
} = require("./oro6eLiveTrafficExternalCallAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6eLiveTrafficExternalCallAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallAuthorizationRequestFixture = fixture(
  "happyPathLiveTrafficExternalCallAuthorizationRequestFixture"
);

const missingOro6dValidationRecordFixture = fixture(
  "missingOro6dValidationRecordFixture",
  {
    oro6dValidationEvidence: {
      dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: false,
      oro6dLiveTrafficPostEnablementValidationPassed: false,
      nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest: false,
    },
  }
);

const oro6dValidationNotPassedFixture = fixture(
  "oro6dValidationNotPassedFixture",
  {
    oro6dValidationEvidence: {
      oro6dLiveTrafficPostEnablementValidationPassed: false,
    },
  }
);

const liveTrafficModeNotFailClosedNoMutationFixture = fixture(
  "liveTrafficModeNotFailClosedNoMutationFixture",
  {
    oro6dValidationEvidence: {
      liveTrafficModeFromOro6d: "mutation_enabled",
    },
  }
);

const externalNetworkAlreadyAllowedViolationFixture = fixture(
  "externalNetworkAlreadyAllowedViolationFixture",
  {
    safetyEvidence: { externalNetworkAllowed: true },
  }
);

const externalNetworkCalledViolationFixture = fixture(
  "externalNetworkCalledViolationFixture",
  {
    safetyEvidence: { [["external", "NetworkCalled"].join("")]: true },
  }
);

const liveOroPlayApiCallAllowedViolationFixture = fixture(
  "liveOroPlayApiCallAllowedViolationFixture",
  {
    safetyEvidence: { liveOroPlayApiCallAllowed: true },
  }
);

const liveOroPlayApiCallCalledViolationFixture = fixture(
  "liveOroPlayApiCallCalledViolationFixture",
  {
    safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
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

const missingHumanApprovalRequirementFixture = fixture(
  "missingHumanApprovalRequirementFixture",
  {
    requestEvidence: {
      humanApprovalRequired: false,
      separateExternalCallDecisionRequired: false,
    },
  }
);

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  requestEvidence: { responseSanitized: true },
});

function buildOro6eLiveTrafficExternalCallAuthorizationRequestFixtures() {
  return [
    happyPathLiveTrafficExternalCallAuthorizationRequestFixture,
    missingOro6dValidationRecordFixture,
    oro6dValidationNotPassedFixture,
    liveTrafficModeNotFailClosedNoMutationFixture,
    externalNetworkAlreadyAllowedViolationFixture,
    externalNetworkCalledViolationFixture,
    liveOroPlayApiCallAllowedViolationFixture,
    liveOroPlayApiCallCalledViolationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    missingHumanApprovalRequirementFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallAuthorizationRequestFixture,
  missingOro6dValidationRecordFixture,
  oro6dValidationNotPassedFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  externalNetworkAlreadyAllowedViolationFixture,
  externalNetworkCalledViolationFixture,
  liveOroPlayApiCallAllowedViolationFixture,
  liveOroPlayApiCallCalledViolationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  missingHumanApprovalRequirementFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro6eLiveTrafficExternalCallAuthorizationRequestFixtures,
};
