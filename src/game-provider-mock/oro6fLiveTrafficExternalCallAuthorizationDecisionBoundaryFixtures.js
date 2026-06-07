"use strict";

const {
  APPROVED_TO_CALL_NOW,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput,
} = require("./oro6fLiveTrafficExternalCallAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6fLiveTrafficExternalCallAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallAuthorizationDecisionFixture = fixture(
  "happyPathLiveTrafficExternalCallAuthorizationDecisionFixture"
);

const oro6eRequestMissingFixture = fixture("oro6eRequestMissingFixture", {
  oro6eRequestEvidence: {
    dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary: false,
    oro6eLiveTrafficExternalCallAuthorizationRequestPassed: false,
    externalCallAuthorizationRequestPreparedFromOro6e: false,
    externalCallAuthorizationRequestSubmittedFromOro6e: false,
  },
});

const oro6eRequestNotSubmittedFixture = fixture(
  "oro6eRequestNotSubmittedFixture",
  {
    oro6eRequestEvidence: {
      externalCallAuthorizationRequestSubmittedFromOro6e: false,
    },
  }
);

const oro6eRequestStatusNotPendingDecisionFixture = fixture(
  "oro6eRequestStatusNotPendingDecisionFixture",
  {
    oro6eRequestEvidence: {
      externalCallAuthorizationRequestStatusFromOro6e: "draft",
    },
  }
);

const oro6dValidationFailedFixture = fixture("oro6dValidationFailedFixture", {
  oro6dValidationEvidence: {
    oro6dLiveTrafficPostEnablementValidationPassed: false,
  },
});

const liveTrafficModeMismatchFixture = fixture(
  "liveTrafficModeMismatchFixture",
  {
    oro6dValidationEvidence: {
      liveTrafficModeFromOro6d: "mutation_enabled",
    },
  }
);

const decisionApprovesExecutionNowFixture = fixture(
  "decisionApprovesExecutionNowFixture",
  {
    decisionEvidence: {
      externalCallAuthorizationDecisionStatus: APPROVED_TO_CALL_NOW,
      externalCallExecutionAuthorized: true,
    },
  }
);

const externalNetworkAllowedFixture = fixture("externalNetworkAllowedFixture", {
  safetyEvidence: { externalNetworkAllowed: true },
});

const liveOroPlayApiCallAllowedFixture = fixture(
  "liveOroPlayApiCallAllowedFixture",
  {
    safetyEvidence: { liveOroPlayApiCallAllowed: true },
  }
);

const mutationAttemptFixture = fixture("mutationAttemptFixture", {
  safetyEvidence: {
    [["wallet", "MutationPerformed"].join("")]: true,
  },
});

const secretLeakFixture = fixture("secretLeakFixture", {
  safetyEvidence: { secretsLeaked: true },
});

function buildOro6fLiveTrafficExternalCallAuthorizationDecisionFixtures() {
  return [
    happyPathLiveTrafficExternalCallAuthorizationDecisionFixture,
    oro6eRequestMissingFixture,
    oro6eRequestNotSubmittedFixture,
    oro6eRequestStatusNotPendingDecisionFixture,
    oro6dValidationFailedFixture,
    liveTrafficModeMismatchFixture,
    decisionApprovesExecutionNowFixture,
    externalNetworkAllowedFixture,
    liveOroPlayApiCallAllowedFixture,
    mutationAttemptFixture,
    secretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallAuthorizationDecisionFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6eRequestStatusNotPendingDecisionFixture,
  oro6dValidationFailedFixture,
  liveTrafficModeMismatchFixture,
  decisionApprovesExecutionNowFixture,
  externalNetworkAllowedFixture,
  liveOroPlayApiCallAllowedFixture,
  mutationAttemptFixture,
  secretLeakFixture,
  cloneFixture,
  buildOro6fLiveTrafficExternalCallAuthorizationDecisionFixtures,
};
