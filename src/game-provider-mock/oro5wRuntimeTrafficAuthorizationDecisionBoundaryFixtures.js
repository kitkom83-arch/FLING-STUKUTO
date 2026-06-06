"use strict";

const {
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput,
} = require("./oro5wRuntimeTrafficAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture = fixture(
  "happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture"
);

const missingRequestSubmissionFromOro5vFixture = fixture(
  "missingRequestSubmissionFromOro5vFixture",
  {
    oro5vSubmissionEvidence: {
      runtimeTrafficAuthorizationRequestSubmittedFromOro5v: false,
      runtimeTrafficAuthorizationRequestStatusFromOro5v: "not_submitted",
    },
  }
);

const requestWrongStatusFromOro5vFixture = fixture(
  "requestWrongStatusFromOro5vFixture",
  {
    oro5vSubmissionEvidence: {
      runtimeTrafficAuthorizationRequestStatusFromOro5v: "decision_issued",
    },
  }
);

const decisionNotIssuedFixture = fixture("decisionNotIssuedFixture", {
  decisionEvidence: {
    runtimeTrafficAuthorizationDecisionIssued: false,
  },
});

const decisionDeniedFixture = fixture("decisionDeniedFixture", {
  decisionEvidence: {
    runtimeTrafficAuthorizationDecisionResult: "denied",
    runtimeTrafficAuthorizationRequestResult: "denied",
    runtimeTrafficAuthorizationGranted: false,
  },
});

const grantWrongScopeFixture = fixture("grantWrongScopeFixture", {
  decisionEvidence: {
    runtimeTrafficAuthorizationGrantScope: "runtime_traffic_open",
    runtimeTrafficEnablementAuthorizationScope: "runtime_traffic_open",
  },
});

const enablementBoundaryEntryDeniedFixture = fixture(
  "enablementBoundaryEntryDeniedFixture",
  {
    decisionEvidence: {
      runtimeTrafficEnablementBoundaryEntryAllowed: false,
    },
  }
);

const runtimeTrafficAllowedAttemptFixture = fixture(
  "runtimeTrafficAllowedAttemptFixture",
  {
    runtimeEvidence: {
      runtimeTrafficAllowed: true,
      runtimeTrafficEnabled: true,
    },
  }
);

const runtimeTrafficImplementedAttemptFixture = fixture(
  "runtimeTrafficImplementedAttemptFixture",
  {
    runtimeEvidence: {
      runtimeTrafficImplemented: true,
      runtimeTrafficPatchImplemented: true,
    },
  }
);

const liveTrafficRequestSubmittedAttemptFixture = fixture(
  "liveTrafficRequestSubmittedAttemptFixture",
  {
    liveTrafficEvidence: {
      liveTrafficAuthorizationRequestSubmitted: true,
    },
  }
);

const liveTrafficEnabledAttemptFixture = fixture("liveTrafficEnabledAttemptFixture", {
  liveTrafficEvidence: {
    liveTrafficEnabled: true,
  },
});

const publicAliasWrongModeFixture = fixture("publicAliasWrongModeFixture", {
  oro5vSubmissionEvidence: {
    apiTransactionPublicAliasMode: "runtime_open",
  },
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

function buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture,
    missingRequestSubmissionFromOro5vFixture,
    requestWrongStatusFromOro5vFixture,
    decisionNotIssuedFixture,
    decisionDeniedFixture,
    grantWrongScopeFixture,
    enablementBoundaryEntryDeniedFixture,
    runtimeTrafficAllowedAttemptFixture,
    runtimeTrafficImplementedAttemptFixture,
    liveTrafficRequestSubmittedAttemptFixture,
    liveTrafficEnabledAttemptFixture,
    publicAliasWrongModeFixture,
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
  happyPathRuntimeTrafficAuthorizationDecisionApprovedFixture,
  missingRequestSubmissionFromOro5vFixture,
  requestWrongStatusFromOro5vFixture,
  decisionNotIssuedFixture,
  decisionDeniedFixture,
  grantWrongScopeFixture,
  enablementBoundaryEntryDeniedFixture,
  runtimeTrafficAllowedAttemptFixture,
  runtimeTrafficImplementedAttemptFixture,
  liveTrafficRequestSubmittedAttemptFixture,
  liveTrafficEnabledAttemptFixture,
  publicAliasWrongModeFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  dbTransactionDetectedFixture,
  migrationDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  sensitiveValueLeakFixture,
  cloneFixture,
  buildOro5wRuntimeTrafficAuthorizationDecisionBoundaryFixtures,
};
