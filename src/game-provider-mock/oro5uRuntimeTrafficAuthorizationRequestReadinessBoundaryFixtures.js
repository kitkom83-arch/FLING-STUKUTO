"use strict";

const {
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput,
} = require("./oro5uRuntimeTrafficAuthorizationRequestReadinessBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeTrafficAuthorizationRequestReadinessFixture = fixture(
  "happyPathRuntimeTrafficAuthorizationRequestReadinessFixture"
);

const missingOro5tValidationFixture = fixture("missingOro5tValidationFixture", {
  oro5tEvidence: {
    publicAliasPostImplementationValidationFromOro5t: false,
  },
});

const publicAliasWrongModeFixture = fixture("publicAliasWrongModeFixture", {
  oro5tEvidence: { apiBalancePublicAliasMode: "runtime_open" },
});

const readinessNotPreparedFixture = fixture("readinessNotPreparedFixture", {
  readinessEvidence: { runtimeTrafficAuthorizationRequestPrepared: false },
});

const runtimeRequestSubmittedAttemptFixture = fixture(
  "runtimeRequestSubmittedAttemptFixture",
  {
    readinessEvidence: { runtimeTrafficAuthorizationRequestSubmitted: true },
  }
);

const runtimeDecisionIssuedAttemptFixture = fixture(
  "runtimeDecisionIssuedAttemptFixture",
  {
    readinessEvidence: { runtimeTrafficAuthorizationDecisionIssued: true },
  }
);

const runtimeGrantAttemptFixture = fixture("runtimeGrantAttemptFixture", {
  readinessEvidence: {
    runtimeTrafficAuthorizationGranted: true,
    runtimeTrafficAllowed: true,
  },
});

const liveTrafficRequestSubmittedAttemptFixture = fixture(
  "liveTrafficRequestSubmittedAttemptFixture",
  {
    liveTrafficEvidence: { liveTrafficAuthorizationRequestSubmitted: true },
  }
);

const liveTrafficDecisionIssuedAttemptFixture = fixture(
  "liveTrafficDecisionIssuedAttemptFixture",
  {
    liveTrafficEvidence: { liveTrafficAuthorizationDecisionIssued: true },
  }
);

const missingEvidenceChecklistFixture = fixture("missingEvidenceChecklistFixture", {
  evidenceChecklist: { rollbackPlanPresent: false },
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

function buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures() {
  return [
    happyPathRuntimeTrafficAuthorizationRequestReadinessFixture,
    missingOro5tValidationFixture,
    publicAliasWrongModeFixture,
    readinessNotPreparedFixture,
    runtimeRequestSubmittedAttemptFixture,
    runtimeDecisionIssuedAttemptFixture,
    runtimeGrantAttemptFixture,
    liveTrafficRequestSubmittedAttemptFixture,
    liveTrafficDecisionIssuedAttemptFixture,
    missingEvidenceChecklistFixture,
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
  happyPathRuntimeTrafficAuthorizationRequestReadinessFixture,
  missingOro5tValidationFixture,
  publicAliasWrongModeFixture,
  readinessNotPreparedFixture,
  runtimeRequestSubmittedAttemptFixture,
  runtimeDecisionIssuedAttemptFixture,
  runtimeGrantAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  liveTrafficDecisionIssuedAttemptFixture,
  missingEvidenceChecklistFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  dbTransactionDetectedFixture,
  migrationDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  sensitiveValueLeakFixture,
  cloneFixture,
  buildOro5uRuntimeTrafficAuthorizationRequestReadinessBoundaryFixtures,
};
