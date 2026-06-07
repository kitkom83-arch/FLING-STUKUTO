"use strict";

const {
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary,
} = require("./oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture");

const missingOro6jPreExecutionReadinessGateFixture = fixture(
  "missingOro6jPreExecutionReadinessGateFixture",
  {
    oro6jPreExecutionReadinessGateEvidence: {
      dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate: false,
      oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed: false,
      preExecutionReadinessGatePreparedFromOro6j: false,
      preExecutionReadinessGateEvaluatedFromOro6j: false,
      preExecutionReadinessGatePassedFromOro6j: false,
    },
  }
);

const oro6jPreExecutionReadinessGateNotPassedFixture = fixture(
  "oro6jPreExecutionReadinessGateNotPassedFixture",
  {
    oro6jPreExecutionReadinessGateEvidence: {
      preExecutionReadinessGatePassedFromOro6j: false,
    },
  }
);

const oro6jPreExecutionReadinessStatusWrongFixture = fixture(
  "oro6jPreExecutionReadinessStatusWrongFixture",
  {
    oro6jPreExecutionReadinessGateEvidence: {
      preExecutionReadinessGateStatusFromOro6j: "not_ready",
    },
  }
);

const actualExecutionAuthorizationRequestAlreadySubmittedFixture = fixture(
  "actualExecutionAuthorizationRequestAlreadySubmittedFixture",
  {
    oro6jPreExecutionReadinessGateEvidence: {
      actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j: true,
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    decisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionDecisionAlreadyIssuedFixture = fixture(
  "actualExternalCallExecutionDecisionAlreadyIssuedFixture",
  {
    decisionEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssued: true,
      actualExternalCallExecutionAuthorizationDecisionStatus: "approved",
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

function buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture,
    missingOro6jPreExecutionReadinessGateFixture,
    oro6jPreExecutionReadinessGateNotPassedFixture,
    oro6jPreExecutionReadinessStatusWrongFixture,
    actualExecutionAuthorizationRequestAlreadySubmittedFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionDecisionAlreadyIssuedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture,
  missingOro6jPreExecutionReadinessGateFixture,
  oro6jPreExecutionReadinessGateNotPassedFixture,
  oro6jPreExecutionReadinessStatusWrongFixture,
  actualExecutionAuthorizationRequestAlreadySubmittedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionDecisionAlreadyIssuedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixtures,
};
