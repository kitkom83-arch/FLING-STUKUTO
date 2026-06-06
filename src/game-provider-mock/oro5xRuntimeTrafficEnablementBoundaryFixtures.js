"use strict";

const {
  buildOro5xRuntimeTrafficEnablementBoundaryInput,
} = require("./oro5xRuntimeTrafficEnablementBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5xRuntimeTrafficEnablementBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeTrafficEnablementFailClosedFixture = fixture(
  "happyPathRuntimeTrafficEnablementFailClosedFixture"
);

const missingDecisionGrantFromOro5wFixture = fixture(
  "missingDecisionGrantFromOro5wFixture",
  {
    oro5wDecisionEvidence: {
      runtimeTrafficAuthorizationGrantedFromOro5w: false,
      runtimeTrafficEnablementAuthorizedFromOro5w: false,
    },
  }
);

const wrongGrantScopeFromOro5wFixture = fixture("wrongGrantScopeFromOro5wFixture", {
  oro5wDecisionEvidence: {
    runtimeTrafficAuthorizationGrantScopeFromOro5w: "runtime_traffic_open",
  },
});

const enablementBoundaryNotEnteredFixture = fixture(
  "enablementBoundaryNotEnteredFixture",
  {
    enablementEvidence: {
      runtimeTrafficEnablementBoundaryEntered: false,
    },
  }
);

const runtimeTrafficNotEnabledFixture = fixture("runtimeTrafficNotEnabledFixture", {
  enablementEvidence: {
    runtimeTrafficAllowed: false,
    runtimeTrafficEnabled: false,
  },
});

const runtimeTrafficWrongModeFixture = fixture("runtimeTrafficWrongModeFixture", {
  enablementEvidence: { runtimeTrafficMode: "mutation_enabled" },
});

const publicAliasMissingFixture = fixture("publicAliasMissingFixture", {
  publicAliasEvidence: { apiBalancePublicAliasMounted: false },
});

const publicAliasWrongModeFixture = fixture("publicAliasWrongModeFixture", {
  publicAliasEvidence: { apiTransactionPublicAliasMode: "runtime_open" },
});

const aliasRuntimeTrafficNotEnabledFixture = fixture(
  "aliasRuntimeTrafficNotEnabledFixture",
  {
    publicAliasEvidence: {
      apiBalanceRuntimeTrafficEnabled: false,
    },
  }
);

const aliasRuntimeTrafficWrongModeFixture = fixture(
  "aliasRuntimeTrafficWrongModeFixture",
  {
    publicAliasEvidence: {
      apiTransactionRuntimeTrafficMode: "mutation_enabled",
    },
  }
);

const malformedPayloadNotFailClosedFixture = fixture(
  "malformedPayloadNotFailClosedFixture",
  {
    requestBehaviorEvidence: { malformedPayloadFailClosed: false },
  }
);

const duplicateTransactionMutationFixture = fixture(
  "duplicateTransactionMutationFixture",
  {
    requestBehaviorEvidence: { duplicateTransactionNoDoubleMutation: false },
  }
);

const responseNotSanitizedFixture = fixture("responseNotSanitizedFixture", {
  requestBehaviorEvidence: { responseSanitized: false },
});

const liveTrafficRequestSubmittedAttemptFixture = fixture(
  "liveTrafficRequestSubmittedAttemptFixture",
  {
    liveTrafficEvidence: { liveTrafficAuthorizationRequestSubmitted: true },
  }
);

const liveTrafficEnabledAttemptFixture = fixture("liveTrafficEnabledAttemptFixture", {
  liveTrafficEvidence: { liveTrafficEnabled: true },
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

const migrationDetectedFixture = fixture("migrationDetectedFixture", {
  safetyEvidence: { migrationPerformed: true },
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

function buildOro5xRuntimeTrafficEnablementBoundaryFixtures() {
  return [
    happyPathRuntimeTrafficEnablementFailClosedFixture,
    missingDecisionGrantFromOro5wFixture,
    wrongGrantScopeFromOro5wFixture,
    enablementBoundaryNotEnteredFixture,
    runtimeTrafficNotEnabledFixture,
    runtimeTrafficWrongModeFixture,
    publicAliasMissingFixture,
    publicAliasWrongModeFixture,
    aliasRuntimeTrafficNotEnabledFixture,
    aliasRuntimeTrafficWrongModeFixture,
    malformedPayloadNotFailClosedFixture,
    duplicateTransactionMutationFixture,
    responseNotSanitizedFixture,
    liveTrafficRequestSubmittedAttemptFixture,
    liveTrafficEnabledAttemptFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    dbTransactionDetectedFixture,
    migrationDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
    sensitiveValueLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathRuntimeTrafficEnablementFailClosedFixture,
  missingDecisionGrantFromOro5wFixture,
  wrongGrantScopeFromOro5wFixture,
  enablementBoundaryNotEnteredFixture,
  runtimeTrafficNotEnabledFixture,
  runtimeTrafficWrongModeFixture,
  publicAliasMissingFixture,
  publicAliasWrongModeFixture,
  aliasRuntimeTrafficNotEnabledFixture,
  aliasRuntimeTrafficWrongModeFixture,
  malformedPayloadNotFailClosedFixture,
  duplicateTransactionMutationFixture,
  responseNotSanitizedFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  liveTrafficEnabledAttemptFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  dbTransactionDetectedFixture,
  migrationDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  sensitiveValueLeakFixture,
  cloneFixture,
  buildOro5xRuntimeTrafficEnablementBoundaryFixtures,
};
