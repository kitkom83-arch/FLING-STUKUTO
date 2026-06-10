"use strict";

const {
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary,
} = require("./oro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundary(
      {
        id,
        ...overrides,
      }
    )
  );
}

const happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture = fixture(
  "happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture"
);

const failOro8bFinalExecutionDecisionNotPassedFixture = fixture(
  "failOro8bFinalExecutionDecisionNotPassedFixture",
  {
    oro8bActualLiveExecutionAuthorizationDecisionEvidence: {
      dependsOnOro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundary:
        false,
      oro8bLiveTrafficActualExternalCallExecutionActualLiveExecutionAuthorizationDecisionBoundaryPassed:
        false,
      oro8bActualLiveExecutionAuthorizationDecisionPassed: false,
    },
  }
);

const failOro8bFinalExecutionDecisionNotIssuedFixture = fixture(
  "failOro8bFinalExecutionDecisionNotIssuedFixture",
  {
    oro8bActualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionIssuedFromOro8b: false,
    },
  }
);

const failOro8bFinalExecutionDecisionStatusMismatchFixture = fixture(
  "failOro8bFinalExecutionDecisionStatusMismatchFixture",
  {
    oro8bActualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionStatusFromOro8b: "approved_to_execute_now",
    },
  }
);

const failOro8bFinalExecutionDecisionScopeMismatchFixture = fixture(
  "failOro8bFinalExecutionDecisionScopeMismatchFixture",
  {
    oro8bActualLiveExecutionAuthorizationDecisionEvidence: {
      actualLiveExecutionAuthorizationDecisionScopeFromOro8b:
        "actual_live_execution_authorization_decision_scope_mismatch",
    },
  }
);

const failFinalExecutionGateNotPreparedFixture = fixture(
  "failFinalExecutionGateNotPreparedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGatePrepared: false,
    },
  }
);

const failFinalExecutionGateNotIssuedFixture = fixture(
  "failFinalExecutionGateNotIssuedFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateIssued: false,
    },
  }
);

const failFinalExecutionGateStatusMismatchFixture = fixture(
  "failFinalExecutionGateStatusMismatchFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateStatus:
        "approved_for_runtime_activation_execution_authorization_only",
    },
  }
);

const failFinalExecutionGateScopeMismatchFixture = fixture(
  "failFinalExecutionGateScopeMismatchFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      actualLiveExecutionFinalExecutionGateScope:
        "actual_live_execution_final_execution_gate_scope_mismatch",
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

const failHumanApprovalMissingFixture = fixture(
  "failHumanApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      humanApprovalRequiredForActualExecution: false,
    },
  }
);

const failSeparateActualExecutionApprovalMissingFixture = fixture(
  "failSeparateActualExecutionApprovalMissingFixture",
  {
    actualLiveExecutionFinalExecutionGateEvidence: {
      separateActualExecutionApprovalRequired: false,
    },
  }
);

const failSensitiveOutputFixture = fixture("failSensitiveOutputFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundaryFixtures() {
  return [
    happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture,
    failOro8bFinalExecutionDecisionNotPassedFixture,
    failOro8bFinalExecutionDecisionNotIssuedFixture,
    failOro8bFinalExecutionDecisionStatusMismatchFixture,
    failOro8bFinalExecutionDecisionScopeMismatchFixture,
    failFinalExecutionGateNotPreparedFixture,
    failFinalExecutionGateNotIssuedFixture,
    failFinalExecutionGateStatusMismatchFixture,
    failFinalExecutionGateScopeMismatchFixture,
    failRouteEnablementFixture,
    failExternalNetworkCalledFixture,
    failWalletMutationFixture,
    failHumanApprovalMissingFixture,
    failSeparateActualExecutionApprovalMissingFixture,
    failSensitiveOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualLiveExecutionFinalExecutionGateBoundaryFixture,
  failOro8bFinalExecutionDecisionNotPassedFixture,
  failOro8bFinalExecutionDecisionNotIssuedFixture,
  failOro8bFinalExecutionDecisionStatusMismatchFixture,
  failOro8bFinalExecutionDecisionScopeMismatchFixture,
  failFinalExecutionGateNotPreparedFixture,
  failFinalExecutionGateNotIssuedFixture,
  failFinalExecutionGateStatusMismatchFixture,
  failFinalExecutionGateScopeMismatchFixture,
  failRouteEnablementFixture,
  failExternalNetworkCalledFixture,
  failWalletMutationFixture,
  failHumanApprovalMissingFixture,
  failSeparateActualExecutionApprovalMissingFixture,
  failSensitiveOutputFixture,
  cloneFixture,
  buildOro8cLiveTrafficActualExternalCallExecutionActualLiveExecutionFinalExecutionGateBoundaryFixtures,
};
