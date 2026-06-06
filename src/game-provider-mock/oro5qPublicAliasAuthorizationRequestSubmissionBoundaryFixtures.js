"use strict";

const {
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput,
} = require("./oro5qPublicAliasAuthorizationRequestSubmissionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPublicAliasAuthorizationRequestSubmissionFixture = fixture(
  "happyPathPublicAliasAuthorizationRequestSubmissionFixture"
);

const missingReadinessFromOro5pFixture = fixture("missingReadinessFromOro5pFixture", {
  oro5pReadinessEvidence: {
    publicAliasAuthorizationRequestReadinessPreparedFromOro5p: false,
    publicAliasAuthorizationRequestReadinessStatusFromOro5p: "not_ready",
  },
});

const publicAliasDecisionIssuedAttemptRejectedFixture = fixture(
  "publicAliasDecisionIssuedAttemptRejectedFixture",
  {
    decisionEvidence: { publicAliasAuthorizationDecisionIssued: true },
  }
);

const publicAliasGrantedAttemptRejectedFixture = fixture(
  "publicAliasGrantedAttemptRejectedFixture",
  {
    decisionEvidence: {
      publicAliasAuthorizationGranted: true,
      publicAliasAllowed: true,
    },
  }
);

const publicAliasImplementedAttemptRejectedFixture = fixture(
  "publicAliasImplementedAttemptRejectedFixture",
  {
    decisionEvidence: {
      publicAliasImplementationAuthorized: true,
      publicAliasImplementationBoundaryEntryAllowed: true,
      publicAliasImplemented: true,
    },
  }
);

const apiBalancePublicAliasMountedAttemptRejectedFixture = fixture(
  "apiBalancePublicAliasMountedAttemptRejectedFixture",
  {
    decisionEvidence: {
      apiBalancePublicAliasMounted: true,
      apiBalancePublicAliasActive: true,
    },
  }
);

const apiTransactionPublicAliasMountedAttemptRejectedFixture = fixture(
  "apiTransactionPublicAliasMountedAttemptRejectedFixture",
  {
    decisionEvidence: {
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

function buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures() {
  return [
    happyPathPublicAliasAuthorizationRequestSubmissionFixture,
    missingReadinessFromOro5pFixture,
    publicAliasDecisionIssuedAttemptRejectedFixture,
    publicAliasGrantedAttemptRejectedFixture,
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
  happyPathPublicAliasAuthorizationRequestSubmissionFixture,
  missingReadinessFromOro5pFixture,
  publicAliasDecisionIssuedAttemptRejectedFixture,
  publicAliasGrantedAttemptRejectedFixture,
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
  buildOro5qPublicAliasAuthorizationRequestSubmissionBoundaryFixtures,
};
