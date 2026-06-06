"use strict";

const {
  buildOro5yRuntimeTrafficPostEnablementValidationInput,
} = require("./oro5yRuntimeTrafficPostEnablementValidationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5yRuntimeTrafficPostEnablementValidationInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeTrafficPostEnablementValidationFixture = fixture(
  "happyPathRuntimeTrafficPostEnablementValidationFixture"
);

const missingOro5xEnablementRecordFixture = fixture(
  "missingOro5xEnablementRecordFixture",
  {
    oro5xEnablementEvidence: {
      dependsOnOro5xRuntimeTrafficEnablementBoundary: false,
      runtimeTrafficEnabledFromOro5x: false,
      runtimeTrafficAllowedFromOro5x: false,
    },
  }
);

const runtimeModeNotFailClosedNoMutationFixture = fixture(
  "runtimeModeNotFailClosedNoMutationFixture",
  {
    oro5xEnablementEvidence: {
      runtimeTrafficModeFromOro5x: "mutation_enabled",
    },
  }
);

const liveTrafficEnabledViolationFixture = fixture(
  "liveTrafficEnabledViolationFixture",
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
  safetyEvidence: { dbTransactionPerformed: true },
});

const externalNetworkViolationFixture = fixture("externalNetworkViolationFixture", {
  safetyEvidence: { externalNetworkCalled: true },
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

function buildOro5yRuntimeTrafficPostEnablementValidationFixtures() {
  return [
    happyPathRuntimeTrafficPostEnablementValidationFixture,
    missingOro5xEnablementRecordFixture,
    runtimeModeNotFailClosedNoMutationFixture,
    liveTrafficEnabledViolationFixture,
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
  happyPathRuntimeTrafficPostEnablementValidationFixture,
  missingOro5xEnablementRecordFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  liveTrafficEnabledViolationFixture,
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
  buildOro5yRuntimeTrafficPostEnablementValidationFixtures,
};
