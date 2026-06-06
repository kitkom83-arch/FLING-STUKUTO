"use strict";

const {
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput,
} = require("./oro5vRuntimeTrafficAuthorizationRequestSubmissionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture = fixture(
  "happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture"
);

const missingReadinessFromOro5uFixture = fixture("missingReadinessFromOro5uFixture", {
  oro5uReadinessEvidence: {
    runtimeTrafficAuthorizationRequestReadyFromOro5u: false,
    runtimeTrafficAuthorizationRequestPreparedFromOro5u: false,
  },
});

const publicAliasWrongModeFixture = fixture("publicAliasWrongModeFixture", {
  oro5uReadinessEvidence: { apiTransactionPublicAliasMode: "runtime_open" },
});

const runtimeRequestNotSubmittedFixture = fixture("runtimeRequestNotSubmittedFixture", {
  submissionEvidence: { runtimeTrafficAuthorizationRequestSubmitted: false },
});

const runtimeRequestWrongScopeFixture = fixture("runtimeRequestWrongScopeFixture", {
  submissionEvidence: {
    runtimeTrafficAuthorizationRequestScope: "runtime_traffic_enablement_request",
  },
});

const runtimeDecisionIssuedAttemptFixture = fixture(
  "runtimeDecisionIssuedAttemptFixture",
  {
    decisionEvidence: { runtimeTrafficAuthorizationDecisionIssued: true },
  }
);

const runtimeGrantAttemptFixture = fixture("runtimeGrantAttemptFixture", {
  decisionEvidence: {
    runtimeTrafficAuthorizationGranted: true,
    runtimeTrafficAllowed: true,
  },
});

const runtimeTrafficEnabledAttemptFixture = fixture(
  "runtimeTrafficEnabledAttemptFixture",
  {
    decisionEvidence: { runtimeTrafficEnabled: true },
  }
);

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

function buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures() {
  return [
    happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture,
    missingReadinessFromOro5uFixture,
    publicAliasWrongModeFixture,
    runtimeRequestNotSubmittedFixture,
    runtimeRequestWrongScopeFixture,
    runtimeDecisionIssuedAttemptFixture,
    runtimeGrantAttemptFixture,
    runtimeTrafficEnabledAttemptFixture,
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
  happyPathRuntimeTrafficAuthorizationRequestSubmittedFixture,
  missingReadinessFromOro5uFixture,
  publicAliasWrongModeFixture,
  runtimeRequestNotSubmittedFixture,
  runtimeRequestWrongScopeFixture,
  runtimeDecisionIssuedAttemptFixture,
  runtimeGrantAttemptFixture,
  runtimeTrafficEnabledAttemptFixture,
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
  buildOro5vRuntimeTrafficAuthorizationRequestSubmissionBoundaryFixtures,
};
