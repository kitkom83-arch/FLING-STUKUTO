"use strict";

const {
  buildOro6dLiveTrafficPostEnablementValidationInput,
} = require("./oro6dLiveTrafficPostEnablementValidationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6dLiveTrafficPostEnablementValidationInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficPostEnablementValidationFixture = fixture(
  "happyPathLiveTrafficPostEnablementValidationFixture"
);

const missingOro6cEnablementRecordFixture = fixture(
  "missingOro6cEnablementRecordFixture",
  {
    oro6cEnablementEvidence: {
      dependsOnOro6cLiveTrafficEnablementBoundary: false,
      liveTrafficAllowedFromOro6c: false,
      liveTrafficEnabledFromOro6c: false,
    },
  }
);

const liveTrafficNotEnabledFixture = fixture("liveTrafficNotEnabledFixture", {
  oro6cEnablementEvidence: {
    liveTrafficAllowedFromOro6c: false,
    liveTrafficEnabledFromOro6c: false,
  },
});

const liveTrafficModeNotFailClosedNoMutationFixture = fixture(
  "liveTrafficModeNotFailClosedNoMutationFixture",
  {
    oro6cEnablementEvidence: {
      liveTrafficModeFromOro6c: "mutation_enabled",
    },
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

const malformedPayloadStillFailClosedFixture = fixture(
  "malformedPayloadStillFailClosedFixture",
  {
    requestBehaviorEvidence: { malformedPayloadStillFailClosed: true },
  }
);

const duplicateTransactionNoDoubleMutationFixture = fixture(
  "duplicateTransactionNoDoubleMutationFixture",
  {
    requestBehaviorEvidence: { duplicateTransactionStillNoDoubleMutation: true },
  }
);

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  requestBehaviorEvidence: { responseStillSanitized: true },
});

function buildOro6dLiveTrafficPostEnablementValidationFixtures() {
  return [
    happyPathLiveTrafficPostEnablementValidationFixture,
    missingOro6cEnablementRecordFixture,
    liveTrafficNotEnabledFixture,
    liveTrafficModeNotFailClosedNoMutationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    externalNetworkViolationFixture,
    liveOroPlayApiCallViolationFixture,
    malformedPayloadStillFailClosedFixture,
    duplicateTransactionNoDoubleMutationFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficPostEnablementValidationFixture,
  missingOro6cEnablementRecordFixture,
  liveTrafficNotEnabledFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  liveOroPlayApiCallViolationFixture,
  malformedPayloadStillFailClosedFixture,
  duplicateTransactionNoDoubleMutationFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro6dLiveTrafficPostEnablementValidationFixtures,
};
