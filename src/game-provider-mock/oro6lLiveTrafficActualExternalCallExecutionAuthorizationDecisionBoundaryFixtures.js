"use strict";

const {
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary,
} = require("./oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture");

const missingOro6kActualExecutionAuthorizationRequestFixture = fixture(
  "missingOro6kActualExecutionAuthorizationRequestFixture",
  {
    oro6kRequestEvidence: {
      dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary:
        false,
      oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed: false,
      actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k: false,
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k: false,
    },
  }
);

const oro6kActualExecutionAuthorizationRequestNotSubmittedFixture = fixture(
  "oro6kActualExecutionAuthorizationRequestNotSubmittedFixture",
  {
    oro6kRequestEvidence: {
      actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k: false,
    },
  }
);

const oro6kRequestStatusWrongFixture = fixture("oro6kRequestStatusWrongFixture", {
  oro6kRequestEvidence: {
    actualExternalCallExecutionAuthorizationRequestStatusFromOro6k: "pending",
  },
});

const actualExecutionDecisionAlreadyIssuedFixture = fixture(
  "actualExecutionDecisionAlreadyIssuedFixture",
  {
    oro6kRequestEvidence: {
      actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k: true,
      actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k: "approved",
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

const externalCallExecutionAccidentallyPerformedFixture = fixture(
  "externalCallExecutionAccidentallyPerformedFixture",
  {
    decisionEvidence: {
      externalCallExecutionPerformed: true,
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

function buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture,
    missingOro6kActualExecutionAuthorizationRequestFixture,
    oro6kActualExecutionAuthorizationRequestNotSubmittedFixture,
    oro6kRequestStatusWrongFixture,
    actualExecutionDecisionAlreadyIssuedFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    externalCallExecutionAccidentallyPerformedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture,
  missingOro6kActualExecutionAuthorizationRequestFixture,
  oro6kActualExecutionAuthorizationRequestNotSubmittedFixture,
  oro6kRequestStatusWrongFixture,
  actualExecutionDecisionAlreadyIssuedFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  externalCallExecutionAccidentallyPerformedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixtures,
};
