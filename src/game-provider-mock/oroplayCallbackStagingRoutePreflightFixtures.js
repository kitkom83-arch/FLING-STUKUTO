"use strict";

const baseDocumentation = Object.freeze({
  callbackAuthDocumented: true,
  requestEnvelopeDocumented: true,
  responseEnvelopeDocumented: true,
  idempotencyDocumented: true,
  rollbackDocumented: true,
  stagingFlagDocumented: true,
  observabilityDocumented: true,
  uatChecklistDocumented: true,
});

const baseRollback = Object.freeze({
  disableStagingFlag: true,
  removeRouteMount: true,
  keepFailClosedBehavior: true,
  preserveSanitizedLogs: true,
  stopExternalTraffic: true,
  verifyNoWalletLedgerMutationOccurred: true,
  runTargetedSmoke: true,
  runSafeCi: true,
});

function buildBaseFixture(id) {
  return {
    id,
    phase: "ORO-4G",
    expressMount: false,
    runtimeWiredToLiveRoute: false,
    routeActive: false,
    publicAliasActive: false,
    publicAliasAllowed: false,
    proposedAliases: [],
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
    liveOroPlayCall: false,
    credentialLeakDetected: false,
    secretShapedFixtureDetected: false,
    sanitizedMarkers: ["mock-auth-marker", "mock-callback-credential-marker", "redacted-auth-preview"],
    documentation: { ...baseDocumentation },
    rollback: { ...baseRollback },
  };
}

const cleanPreflightFixture = Object.freeze(buildBaseFixture("cleanPreflightFixture"));

const blockedPublicAliasFixture = Object.freeze({
  ...buildBaseFixture("blockedPublicAliasFixture"),
  proposedAliases: ["/api/balance", "/api/transaction"],
});

const blockedExpressMountFixture = Object.freeze({
  ...buildBaseFixture("blockedExpressMountFixture"),
  expressMount: true,
});

const blockedWalletMutationFixture = Object.freeze({
  ...buildBaseFixture("blockedWalletMutationFixture"),
  walletMutation: true,
});

const blockedLedgerMutationFixture = Object.freeze({
  ...buildBaseFixture("blockedLedgerMutationFixture"),
  ledgerMutation: true,
});

const blockedPrismaWriteFixture = Object.freeze({
  ...buildBaseFixture("blockedPrismaWriteFixture"),
  prismaWrite: true,
});

const blockedCredentialLeakFixture = Object.freeze({
  ...buildBaseFixture("blockedCredentialLeakFixture"),
  credentialLeakDetected: true,
  leakMarker: "mock-callback-credential-marker",
});

const rollbackReadyFixture = Object.freeze({
  ...buildBaseFixture("rollbackReadyFixture"),
  rollback: { ...baseRollback },
});

const blockedExternalNetworkFixture = Object.freeze({
  ...buildBaseFixture("blockedExternalNetworkFixture"),
  externalNetwork: true,
});

const blockedLiveOroPlayCallFixture = Object.freeze({
  ...buildBaseFixture("blockedLiveOroPlayCallFixture"),
  liveOroPlayCall: true,
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildOroPlayCallbackStagingRoutePreflightFixtures() {
  return [
    cleanPreflightFixture,
    blockedPublicAliasFixture,
    blockedExpressMountFixture,
    blockedWalletMutationFixture,
    blockedLedgerMutationFixture,
    blockedPrismaWriteFixture,
    blockedCredentialLeakFixture,
    rollbackReadyFixture,
    blockedExternalNetworkFixture,
    blockedLiveOroPlayCallFixture,
  ].map(cloneFixture);
}

module.exports = {
  cleanPreflightFixture,
  blockedPublicAliasFixture,
  blockedExpressMountFixture,
  blockedWalletMutationFixture,
  blockedLedgerMutationFixture,
  blockedPrismaWriteFixture,
  blockedCredentialLeakFixture,
  rollbackReadyFixture,
  blockedExternalNetworkFixture,
  blockedLiveOroPlayCallFixture,
  cloneFixture,
  buildOroPlayCallbackStagingRoutePreflightFixtures,
};
