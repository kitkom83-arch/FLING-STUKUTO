"use strict";

const {
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate,
} = require("./oro6mLiveTrafficActualExternalCallExecutionReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6mLiveTrafficActualExternalCallExecutionReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture");

const missingOro6lActualExecutionDecisionFixture = fixture(
  "missingOro6lActualExecutionDecisionFixture",
  {
    oro6lDecisionEvidence: {
      dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary:
        false,
      oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed: false,
      actualExternalCallExecutionAuthorizationDecisionPreparedFromOro6l: false,
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l: false,
    },
  }
);

const oro6lActualExecutionDecisionNotIssuedFixture = fixture(
  "oro6lActualExecutionDecisionNotIssuedFixture",
  {
    oro6lDecisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6l: false,
    },
  }
);

const oro6lDecisionStatusWrongFixture = fixture("oro6lDecisionStatusWrongFixture", {
  oro6lDecisionEvidence: {
    actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l: "approved",
  },
});

const oro6lDecisionScopeWrongFixture = fixture("oro6lDecisionScopeWrongFixture", {
  oro6lDecisionEvidence: {
    actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l:
      "actual_execution",
  },
});

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    oro6lDecisionEvidence: {
      actualExternalCallExecutionAuthorizedFromOro6l: true,
      externalCallExecutionAuthorizedFromOro6l: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    enablementEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    enablementEvidence: {
      externalCallExecutionPerformed: true,
    },
  }
);

const enablementRequestAlreadySubmittedFixture = fixture(
  "enablementRequestAlreadySubmittedFixture",
  {
    enablementEvidence: {
      actualExternalCallExecutionEnablementRequestPrepared: true,
      actualExternalCallExecutionEnablementRequestSubmitted: true,
      actualExternalCallExecutionEnablementDecisionStatus: "pending",
    },
  }
);

const externalNetworkAccidentallyAllowedFixture = fixture(
  "externalNetworkAccidentallyAllowedFixture",
  {
    safetyEvidence: {
      externalNetworkAllowed: true,
    },
  }
);

const liveOroPlayCallAccidentallyAllowedFixture = fixture(
  "liveOroPlayCallAccidentallyAllowedFixture",
  {
    safetyEvidence: {
      liveOroPlayApiCallAllowed: true,
    },
  }
);

const walletMutationAccidentallyAllowedFixture = fixture(
  "walletMutationAccidentallyAllowedFixture",
  {
    safetyEvidence: {
      [["wallet", "MutationAllowed"].join("")]: true,
    },
  }
);

const ledgerMutationAccidentallyAllowedFixture = fixture(
  "ledgerMutationAccidentallyAllowedFixture",
  {
    safetyEvidence: {
      [["ledger", "MutationAllowed"].join("")]: true,
    },
  }
);

const prismaWriteAccidentallyAllowedFixture = fixture(
  "prismaWriteAccidentallyAllowedFixture",
  {
    safetyEvidence: {
      prismaWriteAllowed: true,
    },
  }
);

const secretLeakShapeFixture = fixture("secretLeakShapeFixture", {
  safetyEvidence: {
    secretsLeaked: true,
  },
});

function buildOro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture,
    missingOro6lActualExecutionDecisionFixture,
    oro6lActualExecutionDecisionNotIssuedFixture,
    oro6lDecisionStatusWrongFixture,
    oro6lDecisionScopeWrongFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyPerformedFixture,
    enablementRequestAlreadySubmittedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionReadinessGateFixture,
  missingOro6lActualExecutionDecisionFixture,
  oro6lActualExecutionDecisionNotIssuedFixture,
  oro6lDecisionStatusWrongFixture,
  oro6lDecisionScopeWrongFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  enablementRequestAlreadySubmittedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6mLiveTrafficActualExternalCallExecutionReadinessGateFixtures,
};
