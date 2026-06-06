"use strict";

const {
  buildOro5pPostMountValidationDecisionBoundaryInput,
} = require("./oro5pPostMountValidationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5pPostMountValidationDecisionBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPostMountValidationDecisionPublicAliasReadinessFixture = fixture(
  "happyPathPostMountValidationDecisionPublicAliasReadinessFixture"
);

const missingPostMountValidationFixture = fixture("missingPostMountValidationFixture", {
  oro5oPostMountValidationEvidence: {
    oro5oPostMountValidationPassed: false,
    internalOroPlayMountVerifiedFromOro5o: false,
  },
});

const publicAliasRequestSubmittedAttemptRejectedFixture = fixture(
  "publicAliasRequestSubmittedAttemptRejectedFixture",
  {
    readinessEvidence: { publicAliasAuthorizationRequestSubmitted: true },
  }
);

const publicAliasDecisionIssuedAttemptRejectedFixture = fixture(
  "publicAliasDecisionIssuedAttemptRejectedFixture",
  {
    readinessEvidence: { publicAliasAuthorizationDecisionIssued: true },
  }
);

const publicAliasGrantedAttemptRejectedFixture = fixture(
  "publicAliasGrantedAttemptRejectedFixture",
  {
    readinessEvidence: {
      publicAliasAuthorizationGranted: true,
      publicAliasAllowed: true,
    },
  }
);

const publicAliasImplementedAttemptRejectedFixture = fixture(
  "publicAliasImplementedAttemptRejectedFixture",
  {
    readinessEvidence: {
      publicAliasImplemented: true,
      apiBalancePublicAliasMounted: true,
      apiBalancePublicAliasActive: true,
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

function buildOro5pPostMountValidationDecisionBoundaryFixtures() {
  return [
    happyPathPostMountValidationDecisionPublicAliasReadinessFixture,
    missingPostMountValidationFixture,
    publicAliasRequestSubmittedAttemptRejectedFixture,
    publicAliasDecisionIssuedAttemptRejectedFixture,
    publicAliasGrantedAttemptRejectedFixture,
    publicAliasImplementedAttemptRejectedFixture,
    runtimeTrafficDetectedFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathPostMountValidationDecisionPublicAliasReadinessFixture,
  missingPostMountValidationFixture,
  publicAliasRequestSubmittedAttemptRejectedFixture,
  publicAliasDecisionIssuedAttemptRejectedFixture,
  publicAliasGrantedAttemptRejectedFixture,
  publicAliasImplementedAttemptRejectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  cloneFixture,
  buildOro5pPostMountValidationDecisionBoundaryFixtures,
};
