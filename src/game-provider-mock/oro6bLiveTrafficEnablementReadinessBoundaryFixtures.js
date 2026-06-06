"use strict";

const {
  buildOro6bLiveTrafficEnablementReadinessInput,
} = require("./oro6bLiveTrafficEnablementReadinessBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6bLiveTrafficEnablementReadinessInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficEnablementReadinessFixture = fixture(
  "happyPathLiveTrafficEnablementReadinessFixture"
);

const missingOro6aDecisionRecordFixture = fixture(
  "missingOro6aDecisionRecordFixture",
  {
    oro6aDecisionEvidence: {
      dependsOnOro6aLiveTrafficAuthorizationDecisionBoundary: false,
      oro6aLiveTrafficAuthorizationDecisionIssued: false,
    },
  }
);

const oro6aDecisionNotIssuedFixture = fixture(
  "oro6aDecisionNotIssuedFixture",
  {
    oro6aDecisionEvidence: {
      oro6aLiveTrafficAuthorizationDecisionIssued: false,
    },
  }
);

const oro6aDecisionNotApprovedFixture = fixture(
  "oro6aDecisionNotApprovedFixture",
  {
    oro6aDecisionEvidence: {
      oro6aLiveTrafficAuthorizationDecisionResult: "denied",
    },
  }
);

const runtimeModeNotFailClosedNoMutationFixture = fixture(
  "runtimeModeNotFailClosedNoMutationFixture",
  {
    oro6aDecisionEvidence: {
      runtimeTrafficModeFromOro6a: "mutation_enabled",
    },
  }
);

const liveTrafficAlreadyEnabledViolationFixture = fixture(
  "liveTrafficAlreadyEnabledViolationFixture",
  {
    liveTrafficEvidence: { liveTrafficEnabled: true },
  }
);

const walletMutationViolationFixture = fixture("walletMutationViolationFixture", {
  safetyEvidence: { [["wallet", "MutationPerformed"].join("")]: true },
});

const ledgerMutationViolationFixture = fixture("ledgerMutationViolationFixture", {
  safetyEvidence: { [["ledger", "MutationPerformed"].join("")]: true },
});

const prismaWriteViolationFixture = fixture("prismaWriteViolationFixture", {
  safetyEvidence: { [["prisma", "WritePerformed"].join("")]: true },
});

const dbTransactionViolationFixture = fixture("dbTransactionViolationFixture", {
  safetyEvidence: { [["db", "TransactionPerformed"].join("")]: true },
});

const externalNetworkViolationFixture = fixture("externalNetworkViolationFixture", {
  safetyEvidence: { [["external", "NetworkCalled"].join("")]: true },
});

const liveOroPlayApiCallViolationFixture = fixture(
  "liveOroPlayApiCallViolationFixture",
  {
    safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
  }
);

const readinessMissingSeparateEnablementRequirementFixture = fixture(
  "readinessMissingSeparateEnablementRequirementFixture",
  {
    liveTrafficEvidence: {
      separateLiveTrafficEnablementRequired: false,
      nextPhaseRequiresLiveTrafficEnablementBoundary: false,
    },
  }
);

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  readinessEvidence: { responseSanitized: true },
});

function buildOro6bLiveTrafficEnablementReadinessFixtures() {
  return [
    happyPathLiveTrafficEnablementReadinessFixture,
    missingOro6aDecisionRecordFixture,
    oro6aDecisionNotIssuedFixture,
    oro6aDecisionNotApprovedFixture,
    runtimeModeNotFailClosedNoMutationFixture,
    liveTrafficAlreadyEnabledViolationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    externalNetworkViolationFixture,
    liveOroPlayApiCallViolationFixture,
    readinessMissingSeparateEnablementRequirementFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficEnablementReadinessFixture,
  missingOro6aDecisionRecordFixture,
  oro6aDecisionNotIssuedFixture,
  oro6aDecisionNotApprovedFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  liveTrafficAlreadyEnabledViolationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  liveOroPlayApiCallViolationFixture,
  readinessMissingSeparateEnablementRequirementFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro6bLiveTrafficEnablementReadinessFixtures,
};
