"use strict";

const {
  APPROVED_TO_CALL_NOW,
  buildOro6gLiveTrafficExternalCallReadinessGateInput,
} = require("./oro6gLiveTrafficExternalCallReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6gLiveTrafficExternalCallReadinessGateInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallReadinessGateFixture = fixture(
  "happyPathLiveTrafficExternalCallReadinessGateFixture"
);

const oro6fDecisionMissingFixture = fixture("oro6fDecisionMissingFixture", {
  oro6fDecisionEvidence: {
    dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary: false,
    oro6fLiveTrafficExternalCallAuthorizationDecisionPassed: false,
    externalCallAuthorizationDecisionPreparedFromOro6f: false,
    externalCallAuthorizationDecisionRecordedFromOro6f: false,
    externalCallAuthorizationDecisionIssuedFromOro6f: false,
  },
});

const oro6fDecisionNotApprovedForReadinessOnlyFixture = fixture(
  "oro6fDecisionNotApprovedForReadinessOnlyFixture",
  {
    oro6fDecisionEvidence: {
      externalCallAuthorizationDecisionStatusFromOro6f: APPROVED_TO_CALL_NOW,
    },
  }
);

const oro6fExecutionAlreadyAuthorizedFixture = fixture(
  "oro6fExecutionAlreadyAuthorizedFixture",
  {
    oro6fDecisionEvidence: {
      externalCallExecutionAuthorizedFromOro6f: true,
    },
  }
);

const oro6fReadinessGateNotAllowedFixture = fixture(
  "oro6fReadinessGateNotAllowedFixture",
  {
    oro6fDecisionEvidence: {
      externalCallReadinessGateAllowedFromOro6f: false,
    },
  }
);

const oro6fSeparateExecutionDecisionMissingFixture = fixture(
  "oro6fSeparateExecutionDecisionMissingFixture",
  {
    oro6fDecisionEvidence: {
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f: false,
    },
  }
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

const executionAuthorizationRequestSubmittedFixture = fixture(
  "executionAuthorizationRequestSubmittedFixture",
  {
    readinessGateEvidence: {
      externalCallExecutionAuthorizationRequestSubmitted: true,
    },
  }
);

const externalCallExecutionAuthorizedFixture = fixture(
  "externalCallExecutionAuthorizedFixture",
  {
    readinessGateEvidence: {
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

function buildOro6gLiveTrafficExternalCallReadinessGateFixtures() {
  return [
    happyPathLiveTrafficExternalCallReadinessGateFixture,
    oro6fDecisionMissingFixture,
    oro6fDecisionNotApprovedForReadinessOnlyFixture,
    oro6fExecutionAlreadyAuthorizedFixture,
    oro6fReadinessGateNotAllowedFixture,
    oro6fSeparateExecutionDecisionMissingFixture,
    oro6eRequestMissingFixture,
    oro6eRequestNotSubmittedFixture,
    oro6dValidationFailedFixture,
    liveTrafficModeMismatchFixture,
    executionAuthorizationRequestSubmittedFixture,
    externalCallExecutionAuthorizedFixture,
    externalNetworkAllowedFixture,
    liveOroPlayApiCallAllowedFixture,
    mutationAttemptFixture,
    secretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallReadinessGateFixture,
  oro6fDecisionMissingFixture,
  oro6fDecisionNotApprovedForReadinessOnlyFixture,
  oro6fExecutionAlreadyAuthorizedFixture,
  oro6fReadinessGateNotAllowedFixture,
  oro6fSeparateExecutionDecisionMissingFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6dValidationFailedFixture,
  liveTrafficModeMismatchFixture,
  executionAuthorizationRequestSubmittedFixture,
  externalCallExecutionAuthorizedFixture,
  externalNetworkAllowedFixture,
  liveOroPlayApiCallAllowedFixture,
  mutationAttemptFixture,
  secretLeakFixture,
  cloneFixture,
  buildOro6gLiveTrafficExternalCallReadinessGateFixtures,
};
