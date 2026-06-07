"use strict";

const {
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary,
} = require("./oro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture =
  fixture("happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture");

const missingOro6wLiveExecutionRequestFixture = fixture(
  "missingOro6wLiveExecutionRequestFixture",
  {
    oro6wLiveExecutionRequestEvidence: {
      dependsOnOro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestBoundary:
        false,
      oro6wLiveTrafficActualExternalCallExecutionLiveExecutionRequestPassed:
        false,
    },
  }
);

const oro6wLiveExecutionRequestNotSubmittedFixture = fixture(
  "oro6wLiveExecutionRequestNotSubmittedFixture",
  {
    oro6wLiveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6w: false,
    },
  }
);

const oro6wLiveExecutionRequestStatusWrongFixture = fixture(
  "oro6wLiveExecutionRequestStatusWrongFixture",
  {
    oro6wLiveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionRequestStatusFromOro6w: "submitted",
    },
  }
);

const liveExecutionDecisionAlreadyIssuedFixture = fixture(
  "liveExecutionDecisionAlreadyIssuedFixture",
  {
    oro6wLiveExecutionRequestEvidence: {
      actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6w: true,
    },
  }
);

const liveExecutionAlreadyApprovedFixture = fixture(
  "liveExecutionAlreadyApprovedFixture",
  {
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionLiveExecutionApproved: true,
    },
  }
);

const actualExternalCallExecutionAlreadyActivatedFixture = fixture(
  "actualExternalCallExecutionAlreadyActivatedFixture",
  {
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionActivated: true,
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    liveExecutionDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    liveExecutionDecisionEvidence: {
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

function buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture,
    missingOro6wLiveExecutionRequestFixture,
    oro6wLiveExecutionRequestNotSubmittedFixture,
    oro6wLiveExecutionRequestStatusWrongFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionLiveExecutionDecisionFixture,
  missingOro6wLiveExecutionRequestFixture,
  oro6wLiveExecutionRequestNotSubmittedFixture,
  oro6wLiveExecutionRequestStatusWrongFixture,
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
  buildOro6xLiveTrafficActualExternalCallExecutionLiveExecutionDecisionBoundaryFixtures,
};
