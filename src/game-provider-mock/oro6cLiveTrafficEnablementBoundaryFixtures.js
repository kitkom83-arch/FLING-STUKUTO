"use strict";

const {
  buildOro6cLiveTrafficEnablementInput,
} = require("./oro6cLiveTrafficEnablementBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro6cLiveTrafficEnablementInput({
      id,
      ...overrides,
    })
  );
}

const happyPathLiveTrafficEnablementFailClosedFixture = fixture(
  "happyPathLiveTrafficEnablementFailClosedFixture"
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

const oro6aDecisionNotApprovedFixture = fixture(
  "oro6aDecisionNotApprovedFixture",
  {
    oro6aDecisionEvidence: {
      oro6aLiveTrafficAuthorizationDecisionResult: "denied",
    },
  }
);

const missingOro6bReadinessRecordFixture = fixture(
  "missingOro6bReadinessRecordFixture",
  {
    oro6bReadinessEvidence: {
      dependsOnOro6bLiveTrafficEnablementReadinessBoundary: false,
      oro6bLiveTrafficEnablementReadinessChecked: false,
    },
  }
);

const oro6bReadinessNotReadyFixture = fixture(
  "oro6bReadinessNotReadyFixture",
  {
    oro6bReadinessEvidence: {
      oro6bLiveTrafficEnablementReadinessStatus: "not_ready",
    },
  }
);

const runtimeModeNotFailClosedNoMutationFixture = fixture(
  "runtimeModeNotFailClosedNoMutationFixture",
  {
    oro6bReadinessEvidence: {
      runtimeTrafficModeFromOro6b: "mutation_enabled",
    },
  }
);

const liveTrafficModeNotFailClosedNoMutationFixture = fixture(
  "liveTrafficModeNotFailClosedNoMutationFixture",
  {
    enablementEvidence: {
      liveTrafficMode: "mutation_enabled",
    },
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

const responseSanitizedFixture = fixture("responseSanitizedFixture", {
  enablementEvidence: { responseSanitized: true },
});

function buildOro6cLiveTrafficEnablementFixtures() {
  return [
    happyPathLiveTrafficEnablementFailClosedFixture,
    missingOro6aDecisionRecordFixture,
    oro6aDecisionNotApprovedFixture,
    missingOro6bReadinessRecordFixture,
    oro6bReadinessNotReadyFixture,
    runtimeModeNotFailClosedNoMutationFixture,
    liveTrafficModeNotFailClosedNoMutationFixture,
    walletMutationViolationFixture,
    ledgerMutationViolationFixture,
    prismaWriteViolationFixture,
    dbTransactionViolationFixture,
    externalNetworkViolationFixture,
    liveOroPlayApiCallViolationFixture,
    responseSanitizedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathLiveTrafficEnablementFailClosedFixture,
  missingOro6aDecisionRecordFixture,
  oro6aDecisionNotApprovedFixture,
  missingOro6bReadinessRecordFixture,
  oro6bReadinessNotReadyFixture,
  runtimeModeNotFailClosedNoMutationFixture,
  liveTrafficModeNotFailClosedNoMutationFixture,
  walletMutationViolationFixture,
  ledgerMutationViolationFixture,
  prismaWriteViolationFixture,
  dbTransactionViolationFixture,
  externalNetworkViolationFixture,
  liveOroPlayApiCallViolationFixture,
  responseSanitizedFixture,
  cloneFixture,
  buildOro6cLiveTrafficEnablementFixtures,
};
