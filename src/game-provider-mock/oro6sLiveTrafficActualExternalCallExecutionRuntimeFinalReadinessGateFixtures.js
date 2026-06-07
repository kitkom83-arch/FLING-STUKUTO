"use strict";

const {
  buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate,
} = require("./oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture");

const missingOro6rRuntimeEnablementDecisionFixture = fixture(
  "missingOro6rRuntimeEnablementDecisionFixture",
  {
    oro6rRuntimeEnablementDecisionEvidence: {
      dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary:
        false,
      oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed:
        false,
    },
  }
);

const oro6rRuntimeEnablementDecisionNotIssuedFixture = fixture(
  "oro6rRuntimeEnablementDecisionNotIssuedFixture",
  {
    oro6rRuntimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionPreparedFromOro6r: false,
      actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6r: false,
    },
  }
);

const oro6rDecisionStatusWrongFixture = fixture(
  "oro6rDecisionStatusWrongFixture",
  {
    oro6rRuntimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r:
        "approved",
    },
  }
);

const oro6rDecisionScopeWrongFixture = fixture(
  "oro6rDecisionScopeWrongFixture",
  {
    oro6rRuntimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r:
        "runtime_execution",
    },
  }
);

const actualExternalCallExecutionActivationRequestAlreadySubmittedFixture =
  fixture("actualExternalCallExecutionActivationRequestAlreadySubmittedFixture", {
    runtimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionActivationRequestPrepared: true,
      actualExternalCallExecutionActivationRequestSubmitted: true,
      actualExternalCallExecutionActivationDecisionStatus: "pending",
    },
  });

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    runtimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    runtimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    runtimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    runtimeFinalReadinessGateEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    runtimeFinalReadinessGateEvidence: {
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

function buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture,
    missingOro6rRuntimeEnablementDecisionFixture,
    oro6rRuntimeEnablementDecisionNotIssuedFixture,
    oro6rDecisionStatusWrongFixture,
    oro6rDecisionScopeWrongFixture,
    actualExternalCallExecutionActivationRequestAlreadySubmittedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixture,
  missingOro6rRuntimeEnablementDecisionFixture,
  oro6rRuntimeEnablementDecisionNotIssuedFixture,
  oro6rDecisionStatusWrongFixture,
  oro6rDecisionScopeWrongFixture,
  actualExternalCallExecutionActivationRequestAlreadySubmittedFixture,
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
  buildOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGateFixtures,
};
