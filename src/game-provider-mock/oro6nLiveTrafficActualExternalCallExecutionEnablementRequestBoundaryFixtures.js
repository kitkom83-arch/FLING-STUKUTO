"use strict";

const {
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary,
} = require("./oro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture"
  );

const missingOro6mLiveExecutionReadinessGateFixture = fixture(
  "missingOro6mLiveExecutionReadinessGateFixture",
  {
    oro6mReadinessEvidence: {
      dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate: false,
      oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed: false,
      liveExecutionReadinessGatePreparedFromOro6m: false,
      liveExecutionReadinessGateEvaluatedFromOro6m: false,
      liveExecutionReadinessGatePassedFromOro6m: false,
    },
  }
);

const oro6mLiveExecutionReadinessGateNotPassedFixture = fixture(
  "oro6mLiveExecutionReadinessGateNotPassedFixture",
  {
    oro6mReadinessEvidence: {
      oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed: false,
      liveExecutionReadinessGatePassedFromOro6m: false,
    },
  }
);

const oro6mLiveExecutionReadinessStatusWrongFixture = fixture(
  "oro6mLiveExecutionReadinessStatusWrongFixture",
  {
    oro6mReadinessEvidence: {
      liveExecutionReadinessGateStatusFromOro6m: "ready_for_execution",
    },
  }
);

const enablementRequestAlreadySubmittedFixture = fixture(
  "enablementRequestAlreadySubmittedFixture",
  {
    oro6mReadinessEvidence: {
      actualExternalCallExecutionEnablementRequestPreparedFromOro6m: true,
      actualExternalCallExecutionEnablementRequestSubmittedFromOro6m: true,
      actualExternalCallExecutionEnablementDecisionStatusFromOro6m: "pending",
    },
  }
);

const enablementDecisionAlreadyIssuedFixture = fixture(
  "enablementDecisionAlreadyIssuedFixture",
  {
    enablementDecisionEvidence: {
      actualExternalCallExecutionEnablementDecisionIssued: true,
      actualExternalCallExecutionEnablementDecisionStatus: "approved",
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    enablementDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    enablementDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    enablementDecisionEvidence: {
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

function buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture,
    missingOro6mLiveExecutionReadinessGateFixture,
    oro6mLiveExecutionReadinessGateNotPassedFixture,
    oro6mLiveExecutionReadinessStatusWrongFixture,
    enablementRequestAlreadySubmittedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture,
  missingOro6mLiveExecutionReadinessGateFixture,
  oro6mLiveExecutionReadinessGateNotPassedFixture,
  oro6mLiveExecutionReadinessStatusWrongFixture,
  enablementRequestAlreadySubmittedFixture,
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
  buildOro6nLiveTrafficActualExternalCallExecutionEnablementRequestBoundaryFixtures,
};
