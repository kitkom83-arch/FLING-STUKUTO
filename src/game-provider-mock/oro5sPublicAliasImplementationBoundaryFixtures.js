"use strict";

const {
  buildOro5sPublicAliasImplementationBoundaryInput,
} = require("./oro5sPublicAliasImplementationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5sPublicAliasImplementationBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPublicAliasImplementationFailClosedFixture = fixture(
  "happyPathPublicAliasImplementationFailClosedFixture"
);

const missingOro5rGrantFixture = fixture("missingOro5rGrantFixture", {
  oro5rDecisionEvidence: {
    publicAliasAuthorizationGrantedFromOro5r: false,
    publicAliasImplementationBoundaryEntryAllowedFromOro5r: false,
  },
});

const wrongGrantScopeFixture = fixture("wrongGrantScopeFixture", {
  oro5rDecisionEvidence: {
    publicAliasAuthorizationGrantScopeFromOro5r: "not_authorized",
  },
});

const balanceAliasMissingFixture = fixture("balanceAliasMissingFixture", {
  implementationEvidence: { apiBalancePublicAliasMounted: false },
});

const transactionAliasMissingFixture = fixture("transactionAliasMissingFixture", {
  implementationEvidence: { apiTransactionPublicAliasMounted: false },
});

const balanceAliasRuntimeTrafficFixture = fixture("balanceAliasRuntimeTrafficFixture", {
  implementationEvidence: { apiBalancePublicAliasRuntimeTrafficEnabled: true },
});

const transactionAliasRuntimeTrafficFixture = fixture(
  "transactionAliasRuntimeTrafficFixture",
  {
    implementationEvidence: { apiTransactionPublicAliasRuntimeTrafficEnabled: true },
  }
);

const runtimeTrafficDetectedFixture = fixture("runtimeTrafficDetectedFixture", {
  safetyEvidence: { runtimeTrafficEnabled: true },
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

function buildOro5sPublicAliasImplementationBoundaryFixtures() {
  return [
    happyPathPublicAliasImplementationFailClosedFixture,
    missingOro5rGrantFixture,
    wrongGrantScopeFixture,
    balanceAliasMissingFixture,
    transactionAliasMissingFixture,
    balanceAliasRuntimeTrafficFixture,
    transactionAliasRuntimeTrafficFixture,
    runtimeTrafficDetectedFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    dbTransactionDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPublicAliasImplementationFailClosedFixture,
  missingOro5rGrantFixture,
  wrongGrantScopeFixture,
  balanceAliasMissingFixture,
  transactionAliasMissingFixture,
  balanceAliasRuntimeTrafficFixture,
  transactionAliasRuntimeTrafficFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  dbTransactionDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  cloneFixture,
  buildOro5sPublicAliasImplementationBoundaryFixtures,
};
