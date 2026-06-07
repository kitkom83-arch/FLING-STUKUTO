"use strict";

const {
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary,
} = require("./oro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture");

const missingOro6tActivationRequestFixture = fixture(
  "missingOro6tActivationRequestFixture",
  {
    oro6tActivationRequestEvidence: {
      dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary:
        false,
      oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed:
        false,
    },
  }
);

const oro6tActivationRequestNotSubmittedFixture = fixture(
  "oro6tActivationRequestNotSubmittedFixture",
  {
    oro6tActivationRequestEvidence: {
      actualExternalCallExecutionActivationRequestPreparedFromOro6t: false,
      actualExternalCallExecutionActivationRequestSubmittedFromOro6t: false,
    },
  }
);

const oro6tActivationRequestStatusWrongFixture = fixture(
  "oro6tActivationRequestStatusWrongFixture",
  {
    oro6tActivationRequestEvidence: {
      actualExternalCallExecutionActivationRequestStatusFromOro6t: "submitted",
    },
  }
);

const activationDecisionAlreadyIssuedFixture = fixture(
  "activationDecisionAlreadyIssuedFixture",
  {
    oro6tActivationRequestEvidence: {
      actualExternalCallExecutionActivationDecisionIssuedFromOro6t: true,
      actualExternalCallExecutionActivationDecisionStatusFromOro6t:
        "approved_for_activation_readiness_only",
    },
  }
);

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    activationDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    activationDecisionEvidence: {
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

function buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture,
    missingOro6tActivationRequestFixture,
    oro6tActivationRequestNotSubmittedFixture,
    oro6tActivationRequestStatusWrongFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture,
  missingOro6tActivationRequestFixture,
  oro6tActivationRequestNotSubmittedFixture,
  oro6tActivationRequestStatusWrongFixture,
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
  buildOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryFixtures,
};
