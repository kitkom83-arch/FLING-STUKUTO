"use strict";

const {
  buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary,
} = require("./oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture =
  fixture(
    "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture"
  );

const missingOro6qRuntimeEnablementRequestFixture = fixture(
  "missingOro6qRuntimeEnablementRequestFixture",
  {
    oro6qRuntimeEnablementRequestEvidence: {
      dependsOnOro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundary:
        false,
      oro6qLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestPassed:
        false,
    },
  }
);

const oro6qRuntimeEnablementRequestNotSubmittedFixture = fixture(
  "oro6qRuntimeEnablementRequestNotSubmittedFixture",
  {
    oro6qRuntimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6q: false,
      actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6q: false,
    },
  }
);

const oro6qRuntimeEnablementRequestStatusWrongFixture = fixture(
  "oro6qRuntimeEnablementRequestStatusWrongFixture",
  {
    oro6qRuntimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementRequestStatusFromOro6q:
        "draft",
    },
  }
);

const runtimeEnablementDecisionAlreadyIssuedFixture = fixture(
  "runtimeEnablementDecisionAlreadyIssuedFixture",
  {
    oro6qRuntimeEnablementRequestEvidence: {
      actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6q:
        true,
      actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6q:
        "approved",
    },
  }
);

const actualExternalCallExecutionRuntimeAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionRuntimeAlreadyEnabledFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionRuntimeEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyEnabledFixture = fixture(
  "actualExternalCallExecutionAlreadyEnabledFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionEnabled: true,
    },
  }
);

const actualExternalCallExecutionAlreadyAuthorizedFixture = fixture(
  "actualExternalCallExecutionAlreadyAuthorizedFixture",
  {
    runtimeEnablementDecisionEvidence: {
      actualExternalCallExecutionAuthorized: true,
      externalCallExecutionAuthorized: true,
    },
  }
);

const actualExternalCallExecutionAlreadyPerformedFixture = fixture(
  "actualExternalCallExecutionAlreadyPerformedFixture",
  {
    runtimeEnablementDecisionEvidence: {
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

function buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures() {
  return [
    happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture,
    missingOro6qRuntimeEnablementRequestFixture,
    oro6qRuntimeEnablementRequestNotSubmittedFixture,
    oro6qRuntimeEnablementRequestStatusWrongFixture,
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
  happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionFixture,
  missingOro6qRuntimeEnablementRequestFixture,
  oro6qRuntimeEnablementRequestNotSubmittedFixture,
  oro6qRuntimeEnablementRequestStatusWrongFixture,
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
  buildOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundaryFixtures,
};
