"use strict";

const {
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate,
} = require("./oro6jLiveTrafficExternalCallPreExecutionReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6jLiveTrafficExternalCallPreExecutionReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture =
  fixture("happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture");

const missingOro6iDecisionFixture = fixture("missingOro6iDecisionFixture", {
  oro6iDecisionEvidence: {
    dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary:
      false,
    oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed: false,
    externalCallExecutionAuthorizationDecisionPreparedFromOro6i: false,
    externalCallExecutionAuthorizationDecisionIssuedFromOro6i: false,
  },
});

const oro6iDecisionNotIssuedFixture = fixture("oro6iDecisionNotIssuedFixture", {
  oro6iDecisionEvidence: {
    externalCallExecutionAuthorizationDecisionIssuedFromOro6i: false,
    externalCallExecutionAuthorizationDecisionStatusFromOro6i: "pending",
  },
});

const oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture = fixture(
  "oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture",
  {
    oro6iDecisionEvidence: {
      externalCallExecutionAuthorizationDecisionStatusFromOro6i: "approved",
      externalCallExecutionAuthorizationDecisionScopeFromOro6i:
        "actual_external_call_execution",
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    actualExecutionAuthorizationEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExecutionAuthorizationRequestAlreadySubmittedFixture = fixture(
  "actualExecutionAuthorizationRequestAlreadySubmittedFixture",
  {
    actualExecutionAuthorizationEvidence: {
      actualExternalCallExecutionAuthorizationRequestPrepared: true,
      actualExternalCallExecutionAuthorizationRequestSubmitted: true,
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

function buildOro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures() {
  return [
    happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture,
    missingOro6iDecisionFixture,
    oro6iDecisionNotIssuedFixture,
    oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExecutionAuthorizationRequestAlreadySubmittedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallPreExecutionReadinessGateFixture,
  missingOro6iDecisionFixture,
  oro6iDecisionNotIssuedFixture,
  oro6iDecisionStatusNotPreExecutionReadinessOnlyFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExecutionAuthorizationRequestAlreadySubmittedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6jLiveTrafficExternalCallPreExecutionReadinessGateFixtures,
};
