"use strict";

const {
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary,
} = require("./oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture"
  );

const missingOro6nEnablementRequestFixture = fixture(
  "missingOro6nEnablementRequestFixture",
  {
    oro6nEnablementRequestEvidence: {
      dependsOnOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary:
        false,
      oro6nLiveTrafficActualExternalCallExecutionEnablementRequestPassed: false,
      actualExternalCallExecutionEnablementRequestPreparedFromOro6n: false,
      actualExternalCallExecutionEnablementRequestSubmittedFromOro6n: false,
    },
  }
);

const oro6nEnablementRequestNotSubmittedFixture = fixture(
  "oro6nEnablementRequestNotSubmittedFixture",
  {
    oro6nEnablementRequestEvidence: {
      actualExternalCallExecutionEnablementRequestSubmittedFromOro6n: false,
    },
  }
);

const oro6nEnablementRequestStatusWrongFixture = fixture(
  "oro6nEnablementRequestStatusWrongFixture",
  {
    oro6nEnablementRequestEvidence: {
      actualExternalCallExecutionEnablementRequestStatusFromOro6n: "draft",
    },
  }
);

const enablementDecisionAlreadyIssuedFixture = fixture(
  "enablementDecisionAlreadyIssuedFixture",
  {
    oro6nEnablementRequestEvidence: {
      actualExternalCallExecutionEnablementDecisionIssuedFromOro6n: true,
      actualExternalCallExecutionEnablementDecisionStatusFromOro6n: "approved",
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    decisionEvidence: {
      actualExternalCallExecutionEnabled: true,
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

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
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

function buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture,
    missingOro6nEnablementRequestFixture,
    oro6nEnablementRequestNotSubmittedFixture,
    oro6nEnablementRequestStatusWrongFixture,
    enablementDecisionAlreadyIssuedFixture,
    actualExternalCallExecutionAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionAlreadyPerformedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionEnablementDecisionFixture,
  missingOro6nEnablementRequestFixture,
  oro6nEnablementRequestNotSubmittedFixture,
  oro6nEnablementRequestStatusWrongFixture,
  enablementDecisionAlreadyIssuedFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundaryFixtures,
};
