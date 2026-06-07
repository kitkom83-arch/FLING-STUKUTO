"use strict";

const {
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary,
} = require("./oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture");

const missingOro6vActivationFinalReadinessGateFixture = fixture(
  "missingOro6vActivationFinalReadinessGateFixture",
  {
    oro6vActivationFinalReadinessEvidence: {
      dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate:
        false,
      oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed:
        false,
    },
  }
);

const oro6vActivationFinalReadinessGateNotPassedFixture = fixture(
  "oro6vActivationFinalReadinessGateNotPassedFixture",
  {
    oro6vActivationFinalReadinessEvidence: {
      activationFinalReadinessGatePassedFromOro6v: false,
    },
  }
);

const oro6vActivationFinalReadinessStatusWrongFixture = fixture(
  "oro6vActivationFinalReadinessStatusWrongFixture",
  {
    oro6vActivationFinalReadinessEvidence: {
      activationFinalReadinessGateStatusFromOro6v: "ready_for_live_execution",
    },
  }
);

const liveExecutionRequestAlreadySubmittedFixture = fixture(
  "liveExecutionRequestAlreadySubmittedFixture",
  {
    oro6vActivationFinalReadinessEvidence: {
      actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v: true,
      actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v: true,
    },
  }
);

const liveExecutionDecisionAlreadyIssuedFixture = fixture(
  "liveExecutionDecisionAlreadyIssuedFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionDecisionIssued: true,
    },
  }
);

const liveExecutionAlreadyApprovedFixture = fixture(
  "liveExecutionAlreadyApprovedFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    liveExecutionRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    liveExecutionRequestEvidence: {
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

function buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture,
    missingOro6vActivationFinalReadinessGateFixture,
    oro6vActivationFinalReadinessGateNotPassedFixture,
    oro6vActivationFinalReadinessStatusWrongFixture,
    liveExecutionRequestAlreadySubmittedFixture,
    liveExecutionDecisionAlreadyIssuedFixture,
    liveExecutionAlreadyApprovedFixture,
    actualExternalCallExecutionAlreadyActivatedFixture,
    actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture,
  missingOro6vActivationFinalReadinessGateFixture,
  oro6vActivationFinalReadinessGateNotPassedFixture,
  oro6vActivationFinalReadinessStatusWrongFixture,
  liveExecutionRequestAlreadySubmittedFixture,
  liveExecutionDecisionAlreadyIssuedFixture,
  liveExecutionAlreadyApprovedFixture,
  actualExternalCallExecutionAlreadyActivatedFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
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
  buildOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryFixtures,
};
