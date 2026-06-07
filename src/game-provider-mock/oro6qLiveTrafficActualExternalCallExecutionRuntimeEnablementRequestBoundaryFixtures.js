"use strict";

const {
  buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary,
} = require("./oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture"
  );

const missingOro6pFinalReadinessGateFixture = fixture(
  "missingOro6pFinalReadinessGateFixture",
  {
    oro6pFinalReadinessGateEvidence: {
      dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate:
        false,
      oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed: false,
      finalLiveExecutionReadinessGatePreparedFromOro6p: false,
      finalLiveExecutionReadinessGateEvaluatedFromOro6p: false,
      finalLiveExecutionReadinessGatePassedFromOro6p: false,
    },
  }
);

const oro6pFinalReadinessGateNotPassedFixture = fixture(
  "oro6pFinalReadinessGateNotPassedFixture",
  {
    oro6pFinalReadinessGateEvidence: {
      finalLiveExecutionReadinessGatePassedFromOro6p: false,
    },
  }
);

const oro6pFinalReadinessStatusWrongFixture = fixture(
  "oro6pFinalReadinessStatusWrongFixture",
  {
    oro6pFinalReadinessGateEvidence: {
      finalLiveExecutionReadinessGateStatusFromOro6p: "not_ready",
    },
  }
);

const runtimeEnablementRequestAlreadySubmittedFixture = fixture(
  "runtimeEnablementRequestAlreadySubmittedFixture",
  {
    oro6pFinalReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p: true,
      actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p: true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p:
        "pending",
    },
  }
);

const runtimeEnablementDecisionAlreadyIssuedFixture = fixture(
  "runtimeEnablementDecisionAlreadyIssuedFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionIssued: true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus: "approved",
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    runtimeEnablementRequestEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    runtimeEnablementRequestEvidence: {
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

function buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture,
    missingOro6pFinalReadinessGateFixture,
    oro6pFinalReadinessGateNotPassedFixture,
    oro6pFinalReadinessStatusWrongFixture,
    runtimeEnablementRequestAlreadySubmittedFixture,
    runtimeEnablementDecisionAlreadyIssuedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture,
  missingOro6pFinalReadinessGateFixture,
  oro6pFinalReadinessGateNotPassedFixture,
  oro6pFinalReadinessStatusWrongFixture,
  runtimeEnablementRequestAlreadySubmittedFixture,
  runtimeEnablementDecisionAlreadyIssuedFixture,
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
  buildOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixtures,
};
