"use strict";

const baseDocumentation = Object.freeze({
  callbackAuthBoundaryDocumented: true,
  requestEnvelopeDocumented: true,
  responseEnvelopeDocumented: true,
  transactionIdempotencyDocumented: true,
  duplicateTransactionFailClosedDocumented: true,
  insufficientBalanceFailClosedDocumented: true,
  invalidUserFailClosedDocumented: true,
  malformedPayloadFailClosedDocumented: true,
  sanitizedLogPreviewDocumented: true,
  rollbackDocumented: true,
  observabilityDocumented: true,
  uatSignoffSeparated: true,
});

const baseRollback = Object.freeze({
  keepRouteUnmounted: true,
  disableStagingFlag: true,
  keepPublicAliasesBlocked: true,
  keepFailClosedBehavior: true,
  preserveSanitizedLogsOnly: true,
  stopDryRunDescriptorPromotion: true,
  verifyNoWalletLedgerMutationOccurred: true,
  verifyNoPrismaWriteOccurred: true,
  runTargetedSmoke: true,
  runSafeCiBeforeLaterPhase: true,
});

function buildBaseFixture(id) {
  return {
    id,
    phase: "ORO-4H",
    gateMode: "DRY_RUN_ONLY",
    expressMounted: false,
    routeActive: false,
    publicAliasActive: false,
    publicAliasAllowed: false,
    proposedAliases: [],
    srcAppChangeRequired: false,
    changedFiles: [],
    runtimeTraffic: false,
    runtimeTrafficAllowed: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
    liveOroPlayCall: false,
    credentialLeakDetected: false,
    secretShapedFixtureDetected: false,
    sanitizedMarkers: [
      "mock-auth-marker",
      "mock-callback-credential-marker",
      "redacted-auth-preview",
      "sanitized-callback-envelope",
      "neutral-dry-run-auth-marker",
    ],
    documentation: { ...baseDocumentation },
    rollback: { ...baseRollback },
  };
}

const cleanDryRunGateFixture = Object.freeze(buildBaseFixture("cleanDryRunGateFixture"));

const blockedPublicAliasDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedPublicAliasDryRunFixture"),
  proposedAliases: ["/api/balance", "/api/transaction"],
});

const blockedExpressMountDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedExpressMountDryRunFixture"),
  expressMounted: true,
});

const blockedActiveRouteDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedActiveRouteDryRunFixture"),
  routeActive: true,
});

const blockedSrcAppChangeDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedSrcAppChangeDryRunFixture"),
  srcAppChangeRequired: true,
  changedFiles: ["src/app.js"],
});

const blockedWalletMutationDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedWalletMutationDryRunFixture"),
  walletMutation: true,
});

const blockedLedgerMutationDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedLedgerMutationDryRunFixture"),
  ledgerMutation: true,
});

const blockedPrismaWriteDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedPrismaWriteDryRunFixture"),
  prismaWrite: true,
});

const blockedExternalNetworkDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedExternalNetworkDryRunFixture"),
  externalNetwork: true,
});

const blockedLiveOroPlayCallDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedLiveOroPlayCallDryRunFixture"),
  liveOroPlayCall: true,
});

const blockedCredentialLeakDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedCredentialLeakDryRunFixture"),
  credentialLeakDetected: true,
  leakMarker: "neutral-dry-run-auth-marker",
});

const blockedMissingIdempotencyDryRunFixture = Object.freeze({
  ...buildBaseFixture("blockedMissingIdempotencyDryRunFixture"),
  documentation: {
    ...baseDocumentation,
    transactionIdempotencyDocumented: false,
  },
});

const rollbackMissingDryRunFixture = Object.freeze({
  ...buildBaseFixture("rollbackMissingDryRunFixture"),
  documentation: {
    ...baseDocumentation,
    rollbackDocumented: false,
  },
  rollback: {
    ...baseRollback,
    keepRouteUnmounted: false,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildOroPlayCallbackStagingRouteDryRunGateFixtures() {
  return [
    cleanDryRunGateFixture,
    blockedPublicAliasDryRunFixture,
    blockedExpressMountDryRunFixture,
    blockedActiveRouteDryRunFixture,
    blockedSrcAppChangeDryRunFixture,
    blockedWalletMutationDryRunFixture,
    blockedLedgerMutationDryRunFixture,
    blockedPrismaWriteDryRunFixture,
    blockedExternalNetworkDryRunFixture,
    blockedLiveOroPlayCallDryRunFixture,
    blockedCredentialLeakDryRunFixture,
    blockedMissingIdempotencyDryRunFixture,
    rollbackMissingDryRunFixture,
  ].map(cloneFixture);
}

module.exports = {
  cleanDryRunGateFixture,
  blockedPublicAliasDryRunFixture,
  blockedExpressMountDryRunFixture,
  blockedActiveRouteDryRunFixture,
  blockedSrcAppChangeDryRunFixture,
  blockedWalletMutationDryRunFixture,
  blockedLedgerMutationDryRunFixture,
  blockedPrismaWriteDryRunFixture,
  blockedExternalNetworkDryRunFixture,
  blockedLiveOroPlayCallDryRunFixture,
  blockedCredentialLeakDryRunFixture,
  blockedMissingIdempotencyDryRunFixture,
  rollbackMissingDryRunFixture,
  cloneFixture,
  buildOroPlayCallbackStagingRouteDryRunGateFixtures,
};
