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
  sanitizedShadowTraceDocumented: true,
  rollbackDocumented: true,
  observabilityDocumented: true,
  uatSignoffSeparated: true,
});

const baseRollback = Object.freeze({
  keepRouteUnmounted: true,
  keepPublicAliasesBlocked: true,
  disableStagingFlag: true,
  stopShadowDescriptorPromotion: true,
  keepFailClosedBehavior: true,
  preserveSanitizedLogsOnly: true,
  verifyNoWalletLedgerMutationOccurred: true,
  verifyNoPrismaWriteOccurred: true,
  verifyNoSideEffectOccurred: true,
  runTargetedSmoke: true,
  runSafeCiBeforeLaterPhase: true,
});

function balanceRequestEnvelope() {
  return {
    method: "POST",
    path: "/api/oroplay/balance",
    invocationMode: "direct-call mock invocation",
    authBoundary: "neutral-shadow-auth-marker",
    body: {
      userRef: "sanitized-user-reference",
      requestKind: "balance",
    },
  };
}

function transactionRequestEnvelope(transactionType) {
  return {
    method: "POST",
    path: "/api/oroplay/transaction",
    invocationMode: "direct-call mock invocation",
    authBoundary: "internal-shadow-credential-marker",
    body: {
      userRef: "sanitized-user-reference",
      roundRef: "sanitized-round-reference",
      transactionRef: `sanitized-${transactionType}-reference`,
      transactionType,
      amountState: "static-amount-preview",
    },
  };
}

function buildBaseFixture(id) {
  return {
    id,
    phase: "ORO-4I",
    harnessMode: "INTERNAL_SHADOW_ONLY",
    expressMounted: false,
    routeActive: false,
    httpListener: false,
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
    dbTransaction: false,
    externalNetwork: false,
    liveOroPlayCall: false,
    sideEffectDetected: false,
    credentialLeakDetected: false,
    secretShapedFixtureDetected: false,
    sanitizedMarkers: [
      "mock-auth-marker",
      "mock-callback-credential-marker",
      "redacted-auth-preview",
      "sanitized-callback-envelope",
      "neutral-shadow-auth-marker",
      "internal-shadow-credential-marker",
    ],
    documentation: { ...baseDocumentation },
    rollback: { ...baseRollback },
    shadowInvocations: [
      balanceRequestEnvelope(),
      transactionRequestEnvelope("bet"),
      transactionRequestEnvelope("win"),
    ],
  };
}

const cleanInternalShadowHarnessFixture = Object.freeze(buildBaseFixture("cleanInternalShadowHarnessFixture"));

const balanceShadowInvocationFixture = Object.freeze({
  id: "balanceShadowInvocationFixture",
  phase: "ORO-4I",
  expectedCandidate: "POST /api/oroplay/balance",
  requestEnvelope: balanceRequestEnvelope(),
  expectedResponseEnvelope: "sanitized-balance-response-envelope",
  expectedSideEffects: "NONE",
});

const transactionBetShadowInvocationFixture = Object.freeze({
  id: "transactionBetShadowInvocationFixture",
  phase: "ORO-4I",
  expectedCandidate: "POST /api/oroplay/transaction",
  requestEnvelope: transactionRequestEnvelope("bet"),
  expectedResponseEnvelope: "sanitized-transaction-response-envelope",
  expectedSideEffects: "NONE",
});

const transactionWinShadowInvocationFixture = Object.freeze({
  id: "transactionWinShadowInvocationFixture",
  phase: "ORO-4I",
  expectedCandidate: "POST /api/oroplay/transaction",
  requestEnvelope: transactionRequestEnvelope("win"),
  expectedResponseEnvelope: "sanitized-transaction-response-envelope",
  expectedSideEffects: "NONE",
});

const blockedPublicAliasShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedPublicAliasShadowFixture"),
  proposedAliases: ["/api/balance", "/api/transaction"],
});

const blockedExpressMountShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedExpressMountShadowFixture"),
  expressMounted: true,
});

const blockedActiveRouteShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedActiveRouteShadowFixture"),
  routeActive: true,
});

const blockedHttpListenerShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedHttpListenerShadowFixture"),
  httpListener: true,
});

const blockedRuntimeTrafficShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedRuntimeTrafficShadowFixture"),
  runtimeTraffic: true,
});

const blockedSrcAppChangeShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedSrcAppChangeShadowFixture"),
  srcAppChangeRequired: true,
  changedFiles: ["src/app.js"],
});

const blockedWalletMutationShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedWalletMutationShadowFixture"),
  walletMutation: true,
});

const blockedLedgerMutationShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedLedgerMutationShadowFixture"),
  ledgerMutation: true,
});

const blockedPrismaWriteShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedPrismaWriteShadowFixture"),
  prismaWrite: true,
});

const blockedDbTransactionShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedDbTransactionShadowFixture"),
  dbTransaction: true,
});

const blockedExternalNetworkShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedExternalNetworkShadowFixture"),
  externalNetwork: true,
});

const blockedLiveOroPlayCallShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedLiveOroPlayCallShadowFixture"),
  liveOroPlayCall: true,
});

const blockedSideEffectShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedSideEffectShadowFixture"),
  sideEffectDetected: true,
});

const blockedCredentialLeakShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedCredentialLeakShadowFixture"),
  credentialLeakDetected: true,
  leakMarker: "neutral-shadow-auth-marker",
});

const blockedMissingIdempotencyShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedMissingIdempotencyShadowFixture"),
  documentation: {
    ...baseDocumentation,
    transactionIdempotencyDocumented: false,
  },
});

const blockedMissingSanitizedTraceShadowFixture = Object.freeze({
  ...buildBaseFixture("blockedMissingSanitizedTraceShadowFixture"),
  documentation: {
    ...baseDocumentation,
    sanitizedShadowTraceDocumented: false,
  },
});

const rollbackMissingShadowFixture = Object.freeze({
  ...buildBaseFixture("rollbackMissingShadowFixture"),
  documentation: {
    ...baseDocumentation,
    rollbackDocumented: false,
  },
  rollback: {
    ...baseRollback,
    keepRouteUnmounted: false,
    verifyNoSideEffectOccurred: false,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildOroPlayCallbackStagingRouteInternalShadowHarnessFixtures() {
  return [
    cleanInternalShadowHarnessFixture,
    blockedPublicAliasShadowFixture,
    blockedExpressMountShadowFixture,
    blockedActiveRouteShadowFixture,
    blockedHttpListenerShadowFixture,
    blockedRuntimeTrafficShadowFixture,
    blockedSrcAppChangeShadowFixture,
    blockedWalletMutationShadowFixture,
    blockedLedgerMutationShadowFixture,
    blockedPrismaWriteShadowFixture,
    blockedDbTransactionShadowFixture,
    blockedExternalNetworkShadowFixture,
    blockedLiveOroPlayCallShadowFixture,
    blockedSideEffectShadowFixture,
    blockedCredentialLeakShadowFixture,
    blockedMissingIdempotencyShadowFixture,
    blockedMissingSanitizedTraceShadowFixture,
    rollbackMissingShadowFixture,
  ].map(cloneFixture);
}

module.exports = {
  cleanInternalShadowHarnessFixture,
  balanceShadowInvocationFixture,
  transactionBetShadowInvocationFixture,
  transactionWinShadowInvocationFixture,
  blockedPublicAliasShadowFixture,
  blockedExpressMountShadowFixture,
  blockedActiveRouteShadowFixture,
  blockedHttpListenerShadowFixture,
  blockedRuntimeTrafficShadowFixture,
  blockedSrcAppChangeShadowFixture,
  blockedWalletMutationShadowFixture,
  blockedLedgerMutationShadowFixture,
  blockedPrismaWriteShadowFixture,
  blockedDbTransactionShadowFixture,
  blockedExternalNetworkShadowFixture,
  blockedLiveOroPlayCallShadowFixture,
  blockedSideEffectShadowFixture,
  blockedCredentialLeakShadowFixture,
  blockedMissingIdempotencyShadowFixture,
  blockedMissingSanitizedTraceShadowFixture,
  rollbackMissingShadowFixture,
  cloneFixture,
  buildOroPlayCallbackStagingRouteInternalShadowHarnessFixtures,
};
