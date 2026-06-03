"use strict";

const baseChecks = Object.freeze({
  routeCandidateDescriptorExists: true,
  internalShadowHarnessExists: true,
  dryRunGateExists: true,
  balanceCallbackContractReviewed: true,
  transactionCallbackContractReviewed: true,
  duplicateTransactionIdempotencyReviewed: true,
  insufficientBalanceBehaviorReviewed: true,
  finishedRoundBehaviorReviewed: true,
  sanitizedLogBoundaryReviewed: true,
  secretLeakGuardReviewed: true,
  srcAppJsNotChanged: true,
  expressMountAbsent: true,
  publicAliasAbsent: true,
  externalNetworkAbsent: true,
  walletMutationAbsent: true,
  ledgerMutationAbsent: true,
  prismaWriteAbsent: true,
  migrationAbsent: true,
  runtimeTrafficAbsent: true,
});

const baseSafety = Object.freeze({
  srcAppJsNotChanged: true,
  expressMountAbsent: true,
  publicAliasAbsent: true,
  runtimeTrafficAbsent: true,
  walletMutationAbsent: true,
  ledgerMutationAbsent: true,
  prismaWriteAbsent: true,
  externalNetworkAbsent: true,
  migrationAbsent: true,
});

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4J",
    checks: { ...baseChecks },
    safety: { ...baseSafety },
    trace: {
      routeCandidates: ["POST /api/oroplay/balance", "POST /api/oroplay/transaction"],
      invocationMode: "direct-call mock invocation",
      harnessMode: "internal shadow only",
      logBoundary: "sanitized trace only",
    },
    expected: {
      result: "PASS",
      mountDecision: "manual_review_required",
    },
  };
}

const happyPathFixture = Object.freeze(baseFixture("happyPathFixture"));

const missingShadowHarnessFixture = Object.freeze({
  ...baseFixture("missingShadowHarnessFixture"),
  checks: {
    ...baseChecks,
    internalShadowHarnessExists: false,
  },
  expected: {
    result: "FAIL",
    mountDecision: "blocked",
    blocker: "internalShadowHarnessExists",
  },
});

const accidentalExpressMountFixture = Object.freeze({
  ...baseFixture("accidentalExpressMountFixture"),
  checks: {
    ...baseChecks,
    expressMountAbsent: false,
  },
  safety: {
    ...baseSafety,
    expressMountAbsent: false,
  },
  trace: {
    routeCandidate: "POST /api/oroplay/balance",
    attemptedState: "express mount present",
  },
  expected: {
    result: "FAIL",
    mountDecision: "blocked",
    blocker: "expressMountAbsent",
  },
});

const publicAliasFixture = Object.freeze({
  ...baseFixture("publicAliasFixture"),
  checks: {
    ...baseChecks,
    publicAliasAbsent: false,
  },
  safety: {
    ...baseSafety,
    publicAliasAbsent: false,
  },
  trace: {
    blockedAliases: ["POST /api/balance", "POST /api/transaction"],
    attemptedState: "public alias present",
  },
  expected: {
    result: "FAIL",
    mountDecision: "blocked",
    blocker: "publicAliasAbsent",
  },
});

const mutationFixture = Object.freeze({
  ...baseFixture("mutationFixture"),
  checks: {
    ...baseChecks,
    walletMutationAbsent: false,
    ledgerMutationAbsent: false,
  },
  safety: {
    ...baseSafety,
    walletMutationAbsent: false,
    ledgerMutationAbsent: false,
  },
  trace: {
    attemptedState: "mock mutation flags present",
  },
  expected: {
    result: "FAIL",
    mountDecision: "blocked",
    blockers: ["walletMutationAbsent", "ledgerMutationAbsent"],
  },
});

const secretLikeTraceFixture = Object.freeze({
  ...baseFixture("secretLikeTraceFixture"),
  trace: {
    authorization: "mock-auth-header-value",
    token: "mock-token-value",
    clientSecret: "mock-client-credential-value",
    password: "mock-password-value",
    databaseUrl: "mock-database-url-value",
    privateKey: "mock-private-key-value",
    apiKey: "mock-api-key-value",
    cookie: "mock-cookie-value",
    nested: {
      setCookie: "mock-set-cookie-value",
      bearerPreview: "mock-bearer-value",
    },
  },
  expected: {
    result: "PASS",
    mountDecision: "manual_review_required",
    sanitized: true,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildMountDecisionReadinessGateFixtures() {
  return [
    happyPathFixture,
    missingShadowHarnessFixture,
    accidentalExpressMountFixture,
    publicAliasFixture,
    mutationFixture,
    secretLikeTraceFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathFixture,
  missingShadowHarnessFixture,
  accidentalExpressMountFixture,
  publicAliasFixture,
  mutationFixture,
  secretLikeTraceFixture,
  cloneFixture,
  buildMountDecisionReadinessGateFixtures,
};
