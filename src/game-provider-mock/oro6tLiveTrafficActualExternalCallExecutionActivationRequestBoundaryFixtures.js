"use strict";

const {
  buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary,
} = require("./oro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture");

const missingOro6sRuntimeFinalReadinessGateFixture = fixture(
  "missingOro6sRuntimeFinalReadinessGateFixture",
  {
    oro6sRuntimeFinalReadinessGateEvidence: {
      dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate:
        false,
      oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed:
        false,
    },
  }
);

const oro6sRuntimeFinalReadinessGateNotPassedFixture = fixture(
  "oro6sRuntimeFinalReadinessGateNotPassedFixture",
  {
    oro6sRuntimeFinalReadinessGateEvidence: {
      runtimeFinalReadinessGatePassedFromOro6s: false,
    },
  }
);

const oro6sRuntimeFinalReadinessStatusWrongFixture = fixture(
  "oro6sRuntimeFinalReadinessStatusWrongFixture",
  {
    oro6sRuntimeFinalReadinessGateEvidence: {
      runtimeFinalReadinessGateStatusFromOro6s: "not_ready",
    },
  }
);

const activationRequestAlreadySubmittedFixture = fixture(
  "activationRequestAlreadySubmittedFixture",
  {
    oro6sRuntimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionActivationRequestPreparedFromOro6s: true,
      actualExternalCallExecutionActivationRequestSubmittedFromOro6s: true,
      actualExternalCallExecutionActivationDecisionStatusFromOro6s: "pending",
    },
  }
);

const activationDecisionAlreadyIssuedFixture = fixture(
  "activationDecisionAlreadyIssuedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionActivationDecisionIssued: true,
      actualExternalCallExecutionActivationDecisionStatus: "approved",
    },
  }
);

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    activationRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    activationRequestEvidence: {
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

function buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture,
    missingOro6sRuntimeFinalReadinessGateFixture,
    oro6sRuntimeFinalReadinessGateNotPassedFixture,
    oro6sRuntimeFinalReadinessStatusWrongFixture,
    activationRequestAlreadySubmittedFixture,
    activationDecisionAlreadyIssuedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture,
  missingOro6sRuntimeFinalReadinessGateFixture,
  oro6sRuntimeFinalReadinessGateNotPassedFixture,
  oro6sRuntimeFinalReadinessStatusWrongFixture,
  activationRequestAlreadySubmittedFixture,
  activationDecisionAlreadyIssuedFixture,
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
  buildOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixtures,
};
