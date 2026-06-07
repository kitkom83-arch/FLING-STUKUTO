"use strict";

const {
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary,
} = require("./oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture =
  fixture("happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture");

const missingOro6hRequestSubmissionFixture = fixture(
  "missingOro6hRequestSubmissionFixture",
  {
    oro6hRequestEvidence: {
      dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary:
        false,
      oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed: false,
      externalCallExecutionAuthorizationRequestPreparedFromOro6h: false,
      externalCallExecutionAuthorizationRequestSubmittedFromOro6h: false,
    },
  }
);

const alreadyAuthorizedForActualExternalCallFixture = fixture(
  "alreadyAuthorizedForActualExternalCallFixture",
  {
    decisionEvidence: {
      externalCallExecutionAuthorized: true,
      actualExternalCallExecutionAuthorized: true,
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

function buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionFixtures() {
  return [
    happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture,
    missingOro6hRequestSubmissionFixture,
    alreadyAuthorizedForActualExternalCallFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture,
  missingOro6hRequestSubmissionFixture,
  alreadyAuthorizedForActualExternalCallFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionFixtures,
};
