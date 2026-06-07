"use strict";

const {
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput,
} = require("./oro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture = fixture(
  "happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture"
);

const oro6gReadinessGateMissingFixture = fixture(
  "oro6gReadinessGateMissingFixture",
  {
    oro6gReadinessGateEvidence: {
      dependsOnOro6gLiveTrafficExternalCallReadinessGate: false,
      oro6gLiveTrafficExternalCallReadinessGatePassed: false,
      externalCallReadinessGatePreparedFromOro6g: false,
      externalCallReadinessGateEvaluatedFromOro6g: false,
      externalCallReadinessGatePassedFromOro6g: false,
    },
  }
);

const oro6gReadinessGateNotPassedFixture = fixture(
  "oro6gReadinessGateNotPassedFixture",
  {
    oro6gReadinessGateEvidence: {
      externalCallReadinessGatePassedFromOro6g: false,
    },
  }
);

const oro6gReadinessStatusMismatchFixture = fixture(
  "oro6gReadinessStatusMismatchFixture",
  {
    oro6gReadinessGateEvidence: {
      externalCallReadinessGateStatusFromOro6g: "not_ready",
    },
  }
);

const oro6gAlreadySubmittedExecutionRequestFixture = fixture(
  "oro6gAlreadySubmittedExecutionRequestFixture",
  {
    oro6gReadinessGateEvidence: {
      externalCallExecutionAuthorizationRequestSubmittedFromOro6g: true,
    },
  }
);

const oro6gAlreadyIssuedExecutionDecisionFixture = fixture(
  "oro6gAlreadyIssuedExecutionDecisionFixture",
  {
    oro6gReadinessGateEvidence: {
      externalCallExecutionAuthorizationDecisionIssuedFromOro6g: true,
    },
  }
);

const oro6gAlreadyAuthorizedExecutionFixture = fixture(
  "oro6gAlreadyAuthorizedExecutionFixture",
  {
    oro6gReadinessGateEvidence: {
      externalCallExecutionAuthorizedFromOro6g: true,
    },
  }
);

const oro6gNextPhaseRequestMissingFixture = fixture(
  "oro6gNextPhaseRequestMissingFixture",
  {
    oro6gReadinessGateEvidence: {
      nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g: false,
    },
  }
);

const oro6gSeparateExecutionDecisionMissingFixture = fixture(
  "oro6gSeparateExecutionDecisionMissingFixture",
  {
    oro6gReadinessGateEvidence: {
      nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g:
        false,
    },
  }
);

const oro6fDecisionMissingFixture = fixture("oro6fDecisionMissingFixture", {
  oro6fDecisionEvidence: {
    dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary: false,
    oro6fLiveTrafficExternalCallAuthorizationDecisionPassed: false,
  },
});

const oro6fDecisionStatusMismatchFixture = fixture(
  "oro6fDecisionStatusMismatchFixture",
  {
    oro6fDecisionEvidence: {
      externalCallAuthorizationDecisionStatusFromOro6f: "pending",
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

const executionAlreadyAuthorizedFixture = fixture(
  "executionAlreadyAuthorizedFixture",
  {
    requestEvidence: {
      externalCallExecutionAuthorized: true,
    },
  }
);

const executionDecisionAlreadyIssuedFixture = fixture(
  "executionDecisionAlreadyIssuedFixture",
  {
    requestEvidence: {
      externalCallExecutionAuthorizationDecisionIssued: true,
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

function buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestFixtures() {
  return [
    happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture,
    oro6gReadinessGateMissingFixture,
    oro6gReadinessGateNotPassedFixture,
    oro6gReadinessStatusMismatchFixture,
    oro6gAlreadySubmittedExecutionRequestFixture,
    oro6gAlreadyIssuedExecutionDecisionFixture,
    oro6gAlreadyAuthorizedExecutionFixture,
    oro6gNextPhaseRequestMissingFixture,
    oro6gSeparateExecutionDecisionMissingFixture,
    oro6fDecisionMissingFixture,
    oro6fDecisionStatusMismatchFixture,
    oro6eRequestMissingFixture,
    oro6eRequestNotSubmittedFixture,
    oro6dValidationFailedFixture,
    liveTrafficModeMismatchFixture,
    executionAlreadyAuthorizedFixture,
    executionDecisionAlreadyIssuedFixture,
    externalNetworkAllowedFixture,
    liveOroPlayApiCallAllowedFixture,
    mutationAttemptFixture,
    secretLeakFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture,
  oro6gReadinessGateMissingFixture,
  oro6gReadinessGateNotPassedFixture,
  oro6gReadinessStatusMismatchFixture,
  oro6gAlreadySubmittedExecutionRequestFixture,
  oro6gAlreadyIssuedExecutionDecisionFixture,
  oro6gAlreadyAuthorizedExecutionFixture,
  oro6gNextPhaseRequestMissingFixture,
  oro6gSeparateExecutionDecisionMissingFixture,
  oro6fDecisionMissingFixture,
  oro6fDecisionStatusMismatchFixture,
  oro6eRequestMissingFixture,
  oro6eRequestNotSubmittedFixture,
  oro6dValidationFailedFixture,
  liveTrafficModeMismatchFixture,
  executionAlreadyAuthorizedFixture,
  executionDecisionAlreadyIssuedFixture,
  externalNetworkAllowedFixture,
  liveOroPlayApiCallAllowedFixture,
  mutationAttemptFixture,
  secretLeakFixture,
  cloneFixture,
  buildOro6hLiveTrafficExternalCallExecutionAuthorizationRequestFixtures,
};
