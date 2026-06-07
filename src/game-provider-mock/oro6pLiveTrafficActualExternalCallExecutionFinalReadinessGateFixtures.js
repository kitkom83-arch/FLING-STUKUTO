"use strict";

const {
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate,
} = require("./oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture"
  );

const missingOro6oEnablementDecisionFixture = fixture(
  "missingOro6oEnablementDecisionFixture",
  {
    oro6oEnablementDecisionEvidence: {
      dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary:
        false,
      oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed: false,
      actualExternalCallExecutionEnablementDecisionPreparedFromOro6o: false,
      actualExternalCallExecutionEnablementDecisionIssuedFromOro6o: false,
    },
  }
);

const oro6oEnablementDecisionNotIssuedFixture = fixture(
  "oro6oEnablementDecisionNotIssuedFixture",
  {
    oro6oEnablementDecisionEvidence: {
      actualExternalCallExecutionEnablementDecisionIssuedFromOro6o: false,
    },
  }
);

const oro6oDecisionStatusWrongFixture = fixture(
  "oro6oDecisionStatusWrongFixture",
  {
    oro6oEnablementDecisionEvidence: {
      actualExternalCallExecutionEnablementDecisionStatusFromOro6o: "approved",
    },
  }
);

const oro6oDecisionScopeWrongFixture = fixture(
  "oro6oDecisionScopeWrongFixture",
  {
    oro6oEnablementDecisionEvidence: {
      actualExternalCallExecutionEnablementDecisionScopeFromOro6o:
        "runtime_enablement",
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    finalReadinessGateEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    finalReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    finalReadinessGateEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    finalReadinessGateEvidence: {
      externalCallExecutionPerformed: true,
    },
  }
);

const runtimeEnablementRequestAlreadySubmittedFixture = fixture(
  "runtimeEnablementRequestAlreadySubmittedFixture",
  {
    finalReadinessGateEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestPrepared: true,
      actualExternalCallExecutionRuntimeEnablementRequestSubmitted: true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatus: "pending",
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

function buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture,
    missingOro6oEnablementDecisionFixture,
    oro6oEnablementDecisionNotIssuedFixture,
    oro6oDecisionStatusWrongFixture,
    oro6oDecisionScopeWrongFixture,
    actualExternalCallExecutionAlreadyEnabledFixture,
    actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
    actualExternalCallExecutionAlreadyAuthorizedFixture,
    actualExternalCallExecutionAlreadyPerformedFixture,
    runtimeEnablementRequestAlreadySubmittedFixture,
    externalNetworkAccidentallyAllowedFixture,
    liveOroPlayCallAccidentallyAllowedFixture,
    walletMutationAccidentallyAllowedFixture,
    ledgerMutationAccidentallyAllowedFixture,
    prismaWriteAccidentallyAllowedFixture,
    secretLeakShapeFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficActualExternalCallExecutionFinalReadinessGateFixture,
  missingOro6oEnablementDecisionFixture,
  oro6oEnablementDecisionNotIssuedFixture,
  oro6oDecisionStatusWrongFixture,
  oro6oDecisionScopeWrongFixture,
  actualExternalCallExecutionAlreadyEnabledFixture,
  actualExternalCallExecutionRuntimeAlreadyEnabledFixture,
  actualExternalCallExecutionAlreadyAuthorizedFixture,
  actualExternalCallExecutionAlreadyPerformedFixture,
  runtimeEnablementRequestAlreadySubmittedFixture,
  externalNetworkAccidentallyAllowedFixture,
  liveOroPlayCallAccidentallyAllowedFixture,
  walletMutationAccidentallyAllowedFixture,
  ledgerMutationAccidentallyAllowedFixture,
  prismaWriteAccidentallyAllowedFixture,
  secretLeakShapeFixture,
  cloneFixture,
  buildOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGateFixtures,
};
