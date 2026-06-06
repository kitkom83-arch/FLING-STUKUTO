"use strict";

const {
  buildOro5rPublicAliasAuthorizationDecisionBoundaryInput,
} = require("./oro5rPublicAliasAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5rPublicAliasAuthorizationDecisionBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPublicAliasAuthorizationDecisionApprovedFixture = fixture(
  "happyPathPublicAliasAuthorizationDecisionApprovedFixture"
);

const missingRequestSubmissionFromOro5qFixture = fixture(
  "missingRequestSubmissionFromOro5qFixture",
  {
    oro5qRequestEvidence: {
      publicAliasAuthorizationRequestSubmittedFromOro5q: false,
      publicAliasAuthorizationRequestStatusFromOro5q: "not_submitted",
    },
  }
);

const decisionDeniedFixture = fixture("decisionDeniedFixture", {
  decisionEvidence: {
    publicAliasAuthorizationDecisionResult: "denied",
    publicAliasAuthorizationRequestResult: "denied",
    publicAliasAuthorizationGranted: false,
  },
});

const publicAliasImplementedAttemptRejectedFixture = fixture(
  "publicAliasImplementedAttemptRejectedFixture",
  {
    implementationEvidence: {
      publicAliasImplemented: true,
      publicAliasPatchImplemented: true,
    },
  }
);

const apiBalancePublicAliasMountedAttemptRejectedFixture = fixture(
  "apiBalancePublicAliasMountedAttemptRejectedFixture",
  {
    implementationEvidence: {
      apiBalancePublicAliasMounted: true,
      apiBalancePublicAliasActive: true,
    },
  }
);

const apiTransactionPublicAliasMountedAttemptRejectedFixture = fixture(
  "apiTransactionPublicAliasMountedAttemptRejectedFixture",
  {
    implementationEvidence: {
      apiTransactionPublicAliasMounted: true,
      apiTransactionPublicAliasActive: true,
    },
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

const externalNetworkDetectedFixture = fixture("externalNetworkDetectedFixture", {
  safetyEvidence: { externalNetworkCalled: true },
});

const liveOroPlayCallDetectedFixture = fixture("liveOroPlayCallDetectedFixture", {
  safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
});

function buildOro5rPublicAliasAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathPublicAliasAuthorizationDecisionApprovedFixture,
    missingRequestSubmissionFromOro5qFixture,
    decisionDeniedFixture,
    publicAliasImplementedAttemptRejectedFixture,
    apiBalancePublicAliasMountedAttemptRejectedFixture,
    apiTransactionPublicAliasMountedAttemptRejectedFixture,
    runtimeTrafficDetectedFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPublicAliasAuthorizationDecisionApprovedFixture,
  missingRequestSubmissionFromOro5qFixture,
  decisionDeniedFixture,
  publicAliasImplementedAttemptRejectedFixture,
  apiBalancePublicAliasMountedAttemptRejectedFixture,
  apiTransactionPublicAliasMountedAttemptRejectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  cloneFixture,
  buildOro5rPublicAliasAuthorizationDecisionBoundaryFixtures,
};
