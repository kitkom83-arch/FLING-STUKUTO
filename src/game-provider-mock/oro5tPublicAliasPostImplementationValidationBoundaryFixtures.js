"use strict";

const {
  buildOro5tPublicAliasPostImplementationValidationBoundaryInput,
} = require("./oro5tPublicAliasPostImplementationValidationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5tPublicAliasPostImplementationValidationBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPublicAliasPostImplementationValidationFixture = fixture(
  "happyPathPublicAliasPostImplementationValidationFixture"
);

const missingOro5sImplementationFixture = fixture("missingOro5sImplementationFixture", {
  oro5sEvidence: {
    publicAliasImplementationFromOro5s: false,
  },
});

const balanceAliasMissingFixture = fixture("balanceAliasMissingFixture", {
  validationEvidence: { apiBalancePublicAliasMounted: false },
});

const transactionAliasMissingFixture = fixture("transactionAliasMissingFixture", {
  validationEvidence: { apiTransactionPublicAliasMounted: false },
});

const balanceAliasWrongModeFixture = fixture("balanceAliasWrongModeFixture", {
  validationEvidence: { apiBalancePublicAliasMode: "runtime_open" },
});

const transactionAliasWrongModeFixture = fixture("transactionAliasWrongModeFixture", {
  validationEvidence: { apiTransactionPublicAliasMode: "runtime_open" },
});

const malformedPayloadNotFailClosedFixture = fixture("malformedPayloadNotFailClosedFixture", {
  validationEvidence: { malformedPayloadFailClosed: false },
});

const unknownUserNotFailClosedFixture = fixture("unknownUserNotFailClosedFixture", {
  validationEvidence: { unknownUserFailClosed: false },
});

const mockAuthMismatchNotFailClosedFixture = fixture("mockAuthMismatchNotFailClosedFixture", {
  validationEvidence: { mockAuthMismatchFailClosed: false },
});

const duplicateTransactionMutatesTwiceFixture = fixture("duplicateTransactionMutatesTwiceFixture", {
  validationEvidence: { duplicateTransactionNoDoubleMutation: false },
});

const unsupportedTransactionTypeAcceptedFixture = fixture(
  "unsupportedTransactionTypeAcceptedFixture",
  {
    validationEvidence: { unsupportedTransactionTypeFailClosedOrManualReview: false },
  }
);

const responseNotSanitizedFixture = fixture("responseNotSanitizedFixture", {
  validationEvidence: { responseSanitized: false },
});

const runtimeTrafficApprovalIssuedFixture = fixture("runtimeTrafficApprovalIssuedFixture", {
  safetyEvidence: { runtimeTrafficApprovalIssued: true },
});

const liveTrafficApprovalIssuedFixture = fixture("liveTrafficApprovalIssuedFixture", {
  safetyEvidence: { liveTrafficApprovalIssued: true },
});

const walletMutationDetectedFixture = fixture("walletMutationDetectedFixture", {
  safetyEvidence: { [["wallet", "MutationPerformed"].join("")]: true },
});

const ledgerMutationDetectedFixture = fixture("ledgerMutationDetectedFixture", {
  safetyEvidence: { [["ledger", "MutationPerformed"].join("")]: true },
});

const prismaWriteDetectedFixture = fixture("prismaWriteDetectedFixture", {
  safetyEvidence: { [["prisma", "WritePerformed"].join("")]: true },
});

const dbTransactionDetectedFixture = fixture("dbTransactionDetectedFixture", {
  safetyEvidence: { dbTransactionPerformed: true },
});

const externalNetworkDetectedFixture = fixture("externalNetworkDetectedFixture", {
  safetyEvidence: { externalNetworkCalled: true },
});

const liveOroPlayCallDetectedFixture = fixture("liveOroPlayCallDetectedFixture", {
  safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
});

const sensitiveValueLeakFixture = fixture("sensitiveValueLeakFixture", {
  safetyEvidence: { secretsLeaked: true },
});

function buildOro5tPublicAliasPostImplementationValidationBoundaryFixtures() {
  return [
    happyPathPublicAliasPostImplementationValidationFixture,
    missingOro5sImplementationFixture,
    balanceAliasMissingFixture,
    transactionAliasMissingFixture,
    balanceAliasWrongModeFixture,
    transactionAliasWrongModeFixture,
    malformedPayloadNotFailClosedFixture,
    unknownUserNotFailClosedFixture,
    mockAuthMismatchNotFailClosedFixture,
    duplicateTransactionMutatesTwiceFixture,
    unsupportedTransactionTypeAcceptedFixture,
    responseNotSanitizedFixture,
    runtimeTrafficApprovalIssuedFixture,
    liveTrafficApprovalIssuedFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    dbTransactionDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
    sensitiveValueLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPublicAliasPostImplementationValidationFixture,
  missingOro5sImplementationFixture,
  balanceAliasMissingFixture,
  transactionAliasMissingFixture,
  balanceAliasWrongModeFixture,
  transactionAliasWrongModeFixture,
  malformedPayloadNotFailClosedFixture,
  unknownUserNotFailClosedFixture,
  mockAuthMismatchNotFailClosedFixture,
  duplicateTransactionMutatesTwiceFixture,
  unsupportedTransactionTypeAcceptedFixture,
  responseNotSanitizedFixture,
  runtimeTrafficApprovalIssuedFixture,
  liveTrafficApprovalIssuedFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  dbTransactionDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  sensitiveValueLeakFixture,
  cloneFixture,
  buildOro5tPublicAliasPostImplementationValidationBoundaryFixtures,
};
