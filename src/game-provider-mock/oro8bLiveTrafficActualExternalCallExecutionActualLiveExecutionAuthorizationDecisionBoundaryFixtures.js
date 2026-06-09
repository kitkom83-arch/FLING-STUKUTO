"use strict";

const {
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary,
} = require("./oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture = fixture(
  "happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture"
);

const failOro8aAuthorizationRequestNotPassedFixture = fixture(
  "failOro8aAuthorizationRequestNotPassedFixture",
  {
    oro8aActualLiveExecutionAuthorizationRequestEvidence: {
      dependsOnOro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundary:
        false,
      oro8aLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationRequestBoundaryPassed:
        false,
      oro8aActualLiveExecutionAuthorizationRequestPassed: false,
    },
  }
);

const failOro8aAuthorizationRequestNotSubmittedFixture = fixture(
  "failOro8aAuthorizationRequestNotSubmittedFixture",
  {
    oro8aActualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestSubmittedFromOro8a: false,
    },
  }
);

const failOro8aAuthorizationRequestStatusMismatchFixture = fixture(
  "failOro8aAuthorizationRequestStatusMismatchFixture",
  {
    oro8aActualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestStatusFromOro8a: "held_for_review",
    },
  }
);

const failOro8aAuthorizationRequestScopeMismatchFixture = fixture(
  "failOro8aAuthorizationRequestScopeMismatchFixture",
  {
    oro8aActualLiveExecutionAuthorizationRequestEvidence: {
      actualLiveExecutionAuthorizationRequestScopeFromOro8a:
        "actual_live_execution_authorization_request_scope_mismatch",
    },
  }
);

const failAuthorizationDecisionNotIssuedFixture = fixture(
  "failAuthorizationDecisionNotIssuedFixture",
  {
    actualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionIssued: false,
    },
  }
);

const failAuthorizationDecisionStatusMismatchFixture = fixture(
  "failAuthorizationDecisionStatusMismatchFixture",
  {
    actualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionStatus: "approved_to_execute_now",
    },
  }
);

const failAuthorizationDecisionScopeMismatchFixture = fixture(
  "failAuthorizationDecisionScopeMismatchFixture",
  {
    actualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionScope:
        "actual_live_execution_authorization_decision_scope_mismatch",
    },
  }
);

const failRouteEnablementFixture = fixture("failRouteEnablementFixture", {
  safetyEvidence: {
    routeEnablementAllowed: true,
  },
});

const failExternalNetworkCalledFixture = fixture("failExternalNetworkCalledFixture", {
  safetyEvidence: {
    externalNetworkAllowed: true,
    externalNetworkCalled: true,
  },
});

const failWalletMutationFixture = fixture("failWalletMutationFixture", {
  safetyEvidence: {
    walletMutationAllowed: true,
    walletMutationPerformed: true,
  },
});

const failLiveExecutedFixture = fixture("failLiveExecutedFixture", {
  actualLiveExecutionAuthorizationDecisionEvidence: {
    actualExternalCallExecutionLiveExecuted: true,
  },
});

const failNextFinalExecutionGateMissingFixture = fixture(
  "failNextFinalExecutionGateMissingFixture",
  {
    actualLiveExecutionAuthorizationDecisionEvidence: {
      nextPhaseRequiresSeparateActualLiveExecutionFinalExecutionGate: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture,
    failOro8aAuthorizationRequestNotPassedFixture,
    failOro8aAuthorizationRequestNotSubmittedFixture,
    failOro8aAuthorizationRequestStatusMismatchFixture,
    failOro8aAuthorizationRequestScopeMismatchFixture,
    failAuthorizationDecisionNotIssuedFixture,
    failAuthorizationDecisionStatusMismatchFixture,
    failAuthorizationDecisionScopeMismatchFixture,
    failRouteEnablementFixture,
    failExternalNetworkCalledFixture,
    failWalletMutationFixture,
    failLiveExecutedFixture,
    failNextFinalExecutionGateMissingFixture,
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionAuthorizationDecisionBoundaryFixture,
  failOro8aAuthorizationRequestNotPassedFixture,
  failOro8aAuthorizationRequestNotSubmittedFixture,
  failOro8aAuthorizationRequestStatusMismatchFixture,
  failOro8aAuthorizationRequestScopeMismatchFixture,
  failAuthorizationDecisionNotIssuedFixture,
  failAuthorizationDecisionStatusMismatchFixture,
  failAuthorizationDecisionScopeMismatchFixture,
  failRouteEnablementFixture,
  failExternalNetworkCalledFixture,
  failWalletMutationFixture,
  failLiveExecutedFixture,
  failNextFinalExecutionGateMissingFixture,
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryFixtures,
};
