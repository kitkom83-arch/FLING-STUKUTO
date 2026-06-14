"use strict";

const {
  buildOro10aApprovalChainRolloverRecord,
} = require("./oro10aApprovalChainRolloverBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro10aApprovalChainRolloverRecord({
      id,
      ...overrides,
    })
  );
}

const validOro10aApprovalChainRolloverBoundaryFixture = fixture("validOro10aApprovalChainRolloverBoundaryFixture");
const continuationFromOro9zConfirmedFixture = fixture("continuationFromOro9zConfirmedFixture");
const oro9SeriesClosureAcknowledgedFixture = fixture("oro9SeriesClosureAcknowledgedFixture");
const oro10SeriesStartAcknowledgedFixture = fixture("oro10SeriesStartAcknowledgedFixture");
const approvalChainRolloverBoundaryPresentFixture = fixture("approvalChainRolloverBoundaryPresentFixture");
const runtimeApprovalChainRolloverNotAuthorizedFixture = fixture("runtimeApprovalChainRolloverNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeApprovalChainRolloverOccurred: false,
    runtimeApprovalChainRolloverAllowed: true,
    runtimeApprovalChainRolloverPerformed: true,
  },
});
const liveExecutionNotAuthorizedFixture = fixture("liveExecutionNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoLiveExecutionOccurred: false,
    liveExecutionAllowed: true,
    liveExecutionPerformed: true,
  },
});
const liveOroPlayApiCallNotAuthorizedFixture = fixture("liveOroPlayApiCallNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoLiveOroPlayApiCallOccurred: false,
    liveOroPlayApiCallAllowed: true,
    liveOroPlayApiCalled: true,
  },
});
const routeAliasNotAuthorizedFixture = fixture("routeAliasNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoRouteAliasOccurred: false,
    routeAliasAllowed: true,
    routeEnablementAllowed: true,
    publicCallbackAliasAllowed: true,
  },
});
const runtimeMountNotAuthorizedFixture = fixture("runtimeMountNotAuthorizedFixture", {
  safetyEvidence: {
    verifiedNoRuntimeMountOccurred: false,
    expressMountAllowed: true,
    runtimeMountAllowed: true,
  },
});
const walletMutationNotAuthorizedFixture = fixture("walletMutationNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoWalletMutationOccurred: false, walletMutationAllowed: true, walletMutationPerformed: true },
});
const ledgerMutationNotAuthorizedFixture = fixture("ledgerMutationNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoLedgerMutationOccurred: false, ledgerMutationAllowed: true, ledgerMutationPerformed: true },
});
const prismaWriteNotAuthorizedFixture = fixture("prismaWriteNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoPrismaWriteOccurred: false, prismaWriteAllowed: true, prismaWritePerformed: true },
});
const dbTransactionNotAuthorizedFixture = fixture("dbTransactionNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoDbTransactionOccurred: false, dbTransactionAllowed: true, dbTransactionPerformed: true },
});
const migrationNotAuthorizedFixture = fixture("migrationNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoMigrationOccurred: false, migrationAllowed: true, migrationPerformed: true },
});
const deployNotAuthorizedFixture = fixture("deployNotAuthorizedFixture", {
  safetyEvidence: { verifiedNoDeployOccurred: false, deployAllowed: true, deployPerformed: true },
});
const secretShapedValuesAbsentFixture = fixture("secretShapedValuesAbsentFixture", {
  safetyEvidence: { hardcodedCredentialMaterialPresent: false, sensitiveOutputPresent: false },
});
const secretShapedValuesPresentFixture = fixture("secretShapedValuesPresentFixture", {
  safetyEvidence: {
    verifiedNoHardcodedCredentialMaterial: false,
    hardcodedCredentialMaterialPresent: true,
    sensitiveOutputPresent: true,
  },
});
const longFilenameAbsentFixture = fixture("longFilenameAbsentFixture", {
  safetyEvidence: { verifiedShortOro10aFilenamesOnly: true, longOro10aFilenamePresent: false },
});
const longFilenamePresentFixture = fixture("longFilenamePresentFixture", {
  safetyEvidence: { verifiedShortOro10aFilenamesOnly: false, longOro10aFilenamePresent: true },
});

function buildOro10aApprovalChainRolloverBoundaryFixtures() {
  return [
    validOro10aApprovalChainRolloverBoundaryFixture,
    continuationFromOro9zConfirmedFixture,
    oro9SeriesClosureAcknowledgedFixture,
    oro10SeriesStartAcknowledgedFixture,
    approvalChainRolloverBoundaryPresentFixture,
    runtimeApprovalChainRolloverNotAuthorizedFixture,
    liveExecutionNotAuthorizedFixture,
    liveOroPlayApiCallNotAuthorizedFixture,
    routeAliasNotAuthorizedFixture,
    runtimeMountNotAuthorizedFixture,
    walletMutationNotAuthorizedFixture,
    ledgerMutationNotAuthorizedFixture,
    prismaWriteNotAuthorizedFixture,
    dbTransactionNotAuthorizedFixture,
    migrationNotAuthorizedFixture,
    deployNotAuthorizedFixture,
    secretShapedValuesAbsentFixture,
    secretShapedValuesPresentFixture,
    longFilenameAbsentFixture,
    longFilenamePresentFixture,
  ].map(cloneFixture);
}

module.exports = {
  validOro10aApprovalChainRolloverBoundaryFixture,
  continuationFromOro9zConfirmedFixture,
  oro9SeriesClosureAcknowledgedFixture,
  oro10SeriesStartAcknowledgedFixture,
  approvalChainRolloverBoundaryPresentFixture,
  runtimeApprovalChainRolloverNotAuthorizedFixture,
  liveExecutionNotAuthorizedFixture,
  liveOroPlayApiCallNotAuthorizedFixture,
  routeAliasNotAuthorizedFixture,
  runtimeMountNotAuthorizedFixture,
  walletMutationNotAuthorizedFixture,
  ledgerMutationNotAuthorizedFixture,
  prismaWriteNotAuthorizedFixture,
  dbTransactionNotAuthorizedFixture,
  migrationNotAuthorizedFixture,
  deployNotAuthorizedFixture,
  secretShapedValuesAbsentFixture,
  secretShapedValuesPresentFixture,
  longFilenameAbsentFixture,
  longFilenamePresentFixture,
  cloneFixture,
  buildOro10aApprovalChainRolloverBoundaryFixtures,
};
