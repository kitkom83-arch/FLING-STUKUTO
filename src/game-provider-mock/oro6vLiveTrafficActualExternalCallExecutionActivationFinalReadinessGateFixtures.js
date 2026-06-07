"use strict";

const {
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate,
} = require("./oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture"
  );

const missingOro6uActivationDecisionFixture = fixture(
  "missingOro6uActivationDecisionFixture",
  {
    oro6uActivationDecisionEvidence: {
      dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary:
        false,
      oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed:
        false,
    },
  }
);

const oro6uActivationDecisionNotIssuedFixture = fixture(
  "oro6uActivationDecisionNotIssuedFixture",
  {
    oro6uActivationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionPreparedFromOro6u: false,
      actualExternalCallExecutionActivationDecisionIssuedFromOro6u: false,
    },
  }
);

const oro6uActivationDecisionStatusWrongFixture = fixture(
  "oro6uActivationDecisionStatusWrongFixture",
  {
    oro6uActivationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionStatusFromOro6u:
        "approved_for_activation",
    },
  }
);

const oro6uActivationDecisionScopeWrongFixture = fixture(
  "oro6uActivationDecisionScopeWrongFixture",
  {
    oro6uActivationDecisionEvidence: {
      actualExternalCallExecutionActivationDecisionScopeFromOro6u:
        "activation",
    },
  }
);

const liveExecutionRequestAlreadySubmittedFixture = fixture(
  "liveExecutionRequestAlreadySubmittedFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionLiveExecutionRequestPrepared: true,
      actualExternalCallExecutionLiveExecutionRequestSubmitted: true,
    },
  }
);

const liveExecutionDecisionAlreadyIssuedFixture = fixture(
  "liveExecutionDecisionAlreadyIssuedFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionLiveExecutionDecisionIssued: true,
      actualExternalCallExecutionLiveExecutionDecisionStatus: "approved",
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    liveExecutionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    liveExecutionEvidence: {
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

function buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture,
    missingOro6uActivationDecisionFixture,
    oro6uActivationDecisionNotIssuedFixture,
    oro6uActivationDecisionStatusWrongFixture,
    oro6uActivationDecisionScopeWrongFixture,
    liveExecutionRequestAlreadySubmittedFixture,
    liveExecutionDecisionAlreadyIssuedFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixture,
  missingOro6uActivationDecisionFixture,
  oro6uActivationDecisionNotIssuedFixture,
  oro6uActivationDecisionStatusWrongFixture,
  oro6uActivationDecisionScopeWrongFixture,
  liveExecutionRequestAlreadySubmittedFixture,
  liveExecutionDecisionAlreadyIssuedFixture,
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
  buildOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGateFixtures,
};
