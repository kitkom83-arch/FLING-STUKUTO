"use strict";

const PHASE = "ORO-4I";
const NAME = "Staging Route Wiring Internal Shadow Harness";
const HARNESS_MODE = "INTERNAL_SHADOW_ONLY";
const INTERNAL_SHADOW_PASS = "INTERNAL_SHADOW_PASS";
const BLOCKED = "BLOCKED";
const SHADOW_ONLY = "SHADOW_ONLY";
const MOUNT_BLOCKED_BY_PHASE = "MOUNT_BLOCKED_BY_PHASE";
const PUBLIC_ALIAS_BLOCKED_BY_PHASE = "PUBLIC_ALIAS_BLOCKED_BY_PHASE";
const NO_RUNTIME_TRAFFIC = "NO_RUNTIME_TRAFFIC";
const NO_SIDE_EFFECT = "NO_SIDE_EFFECT";

const ROUTE_CANDIDATES = Object.freeze([
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/balance",
    candidateOnly: true,
    staticRouteDescriptorOnly: true,
    internalShadowInvocationOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/transaction",
    candidateOnly: true,
    staticRouteDescriptorOnly: true,
    internalShadowInvocationOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
]);

const BLOCKED_ALIASES = Object.freeze([
  Object.freeze({
    method: "POST",
    path: "/api/balance",
    blocked: true,
    active: false,
    mounted: false,
    public: false,
  }),
  Object.freeze({
    method: "POST",
    path: "/api/transaction",
    blocked: true,
    active: false,
    mounted: false,
    public: false,
  }),
]);

const DOCUMENTATION_GATES = Object.freeze([
  Object.freeze({ gate: "callbackAuthBoundaryDocumented", field: "callbackAuthBoundaryDocumented" }),
  Object.freeze({ gate: "requestEnvelopeDocumented", field: "requestEnvelopeDocumented" }),
  Object.freeze({ gate: "responseEnvelopeDocumented", field: "responseEnvelopeDocumented" }),
  Object.freeze({ gate: "transactionIdempotencyDocumented", field: "transactionIdempotencyDocumented" }),
  Object.freeze({
    gate: "duplicateTransactionFailClosedDocumented",
    field: "duplicateTransactionFailClosedDocumented",
  }),
  Object.freeze({
    gate: "insufficientBalanceFailClosedDocumented",
    field: "insufficientBalanceFailClosedDocumented",
  }),
  Object.freeze({ gate: "invalidUserFailClosedDocumented", field: "invalidUserFailClosedDocumented" }),
  Object.freeze({ gate: "malformedPayloadFailClosedDocumented", field: "malformedPayloadFailClosedDocumented" }),
  Object.freeze({ gate: "sanitizedShadowTraceDocumented", field: "sanitizedShadowTraceDocumented" }),
  Object.freeze({ gate: "observabilityDocumented", field: "observabilityDocumented" }),
  Object.freeze({ gate: "uatSignoffSeparated", field: "uatSignoffSeparated" }),
]);

const ROLLBACK_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "keepRouteUnmounted", label: "keep route unmounted" }),
  Object.freeze({ key: "keepPublicAliasesBlocked", label: "keep public aliases blocked" }),
  Object.freeze({ key: "disableStagingFlag", label: "disable staging flag" }),
  Object.freeze({ key: "stopShadowDescriptorPromotion", label: "stop shadow descriptor promotion" }),
  Object.freeze({ key: "keepFailClosedBehavior", label: "keep fail-closed behavior" }),
  Object.freeze({ key: "preserveSanitizedLogsOnly", label: "preserve sanitized logs only" }),
  Object.freeze({
    key: "verifyNoWalletLedgerMutationOccurred",
    label: "verify no wallet/ledger mutation occurred",
  }),
  Object.freeze({ key: "verifyNoPrismaWriteOccurred", label: "verify no Prisma write occurred" }),
  Object.freeze({ key: "verifyNoSideEffectOccurred", label: "verify no side effect occurred" }),
  Object.freeze({ key: "runTargetedSmoke", label: "run targeted smoke" }),
  Object.freeze({ key: "runSafeCiBeforeLaterPhase", label: "run Safe CI before any later phase" }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
}

function collectStringValues(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStringValues(entry, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectStringValues(entry, output);
  }
  return output;
}

function secretShapePatterns() {
  return [
    new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
    new RegExp(`${["Ba", "sic"].join("")}\\s+[A-Za-z0-9+/=]{12,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["DATABASE", "_URL"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["pass", "word"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["client", "Secret"].join("")}\\s*[:=]`, "i"),
    new RegExp(["-----BEGIN", " PRIVATE KEY-----"].join(""), "i"),
  ];
}

function hasSecretShapedString(value) {
  const strings = collectStringValues(value);
  const patterns = secretShapePatterns();
  return strings.some((entry) => patterns.some((pattern) => pattern.test(entry)));
}

function normalizeChangedFile(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "");
}

function routeCandidateFor(method, pathValue) {
  return ROUTE_CANDIDATES.find((route) => route.method === method && route.path === pathValue) || null;
}

function inferCandidateType(pathValue, body) {
  if (pathValue === "/api/oroplay/balance") return "balance";
  if (pathValue === "/api/oroplay/transaction") return String((body && body.transactionType) || "transaction");
  return "unknown";
}

function sanitizeRequestEnvelope(envelope) {
  const source = envelope && typeof envelope === "object" ? envelope : {};
  const method = String(source.method || "POST").toUpperCase();
  const pathValue = String(source.path || "");
  const body = source.body && typeof source.body === "object" ? source.body : {};
  const candidate = routeCandidateFor(method, pathValue);

  return {
    method,
    path: pathValue,
    routeCandidate: candidate
      ? {
          method: candidate.method,
          path: candidate.path,
          candidateOnly: true,
          mounted: false,
          active: false,
          public: false,
        }
      : null,
    candidateType: inferCandidateType(pathValue, body),
    invocationMode: "direct-call mock invocation",
    authBoundary: "redacted-auth-preview",
    envelopeShape: "sanitized-callback-envelope",
  };
}

function buildResponseEnvelope(requestSummary) {
  if (!requestSummary.routeCandidate) {
    return {
      statusCode: 409,
      status: BLOCKED,
      envelopeShape: "sanitized-callback-envelope",
      reason: "candidate route is not in the static descriptor",
      sideEffects: "NONE",
    };
  }

  if (requestSummary.path === "/api/oroplay/balance") {
    return {
      statusCode: 200,
      status: SHADOW_ONLY,
      envelopeShape: "sanitized-balance-response-envelope",
      balanceState: "STATIC_BALANCE_PREVIEW_ONLY",
      sideEffects: "NONE",
    };
  }

  return {
    statusCode: 200,
    status: SHADOW_ONLY,
    envelopeShape: "sanitized-transaction-response-envelope",
    transactionState: "STATIC_TRANSACTION_PREVIEW_ONLY",
    idempotency: "DOCUMENTED",
    duplicateBehavior: "FAIL_CLOSED_DOCUMENTED",
    sideEffects: "NONE",
  };
}

function runOroPlayCallbackInternalShadowInvocation(requestEnvelope) {
  const requestSummary = sanitizeRequestEnvelope(requestEnvelope);
  const responseEnvelope = buildResponseEnvelope(requestSummary);
  const sideEffectAssertion = {
    sideEffects: "NONE",
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    dbTransaction: false,
    externalNetwork: false,
    runtimeTraffic: false,
  };

  return {
    phase: PHASE,
    harnessMode: HARNESS_MODE,
    shadowStatus: responseEnvelope.status === BLOCKED ? BLOCKED : SHADOW_ONLY,
    invocationMode: "direct-call mock invocation",
    requestEnvelope: requestSummary,
    responseEnvelope,
    sanitizedShadowTrace: {
      traceId: `ORO-4I-${requestSummary.candidateType.toUpperCase()}-SHADOW`,
      authPreview: "redacted-auth-preview",
      requestEnvelope: "sanitized-callback-envelope",
      responseEnvelope: responseEnvelope.envelopeShape,
      sideEffects: "NONE",
    },
    sideEffectAssertion,
    expressMounted: false,
    routeActive: false,
    httpListener: false,
    runtimeTraffic: false,
    externalNetwork: false,
    ok: responseEnvelope.status !== BLOCKED,
  };
}

function normalizeFixture(fixture) {
  const source = fixture && typeof fixture === "object" ? fixture : {};
  const changedFiles = normalizeList(source.changedFiles).map(normalizeChangedFile);

  return {
    id: source.id || "unnamed-internal-shadow-fixture",
    expressMounted: source.expressMounted === true || source.expressMount === true,
    routeActive: source.routeActive === true,
    httpListener: source.httpListener === true,
    publicAliasActive: source.publicAliasActive === true,
    publicAliasAllowed: source.publicAliasAllowed === true,
    proposedAliases: normalizeList(source.proposedAliases),
    srcAppChangeRequired: source.srcAppChangeRequired === true,
    changedFiles,
    runtimeTraffic: source.runtimeTraffic === true,
    runtimeTrafficAllowed: source.runtimeTrafficAllowed === true,
    walletMutation: source.walletMutation === true,
    ledgerMutation: source.ledgerMutation === true,
    prismaWrite: source.prismaWrite === true,
    dbTransaction: source.dbTransaction === true,
    externalNetwork: source.externalNetwork === true,
    liveOroPlayCall: source.liveOroPlayCall === true,
    sideEffectDetected: source.sideEffectDetected === true,
    credentialLeakDetected: source.credentialLeakDetected === true,
    secretShapedFixtureDetected: source.secretShapedFixtureDetected === true || hasSecretShapedString(source),
    documentation: source.documentation && typeof source.documentation === "object" ? source.documentation : {},
    rollback: source.rollback && typeof source.rollback === "object" ? source.rollback : {},
    shadowInvocations: Array.isArray(source.shadowInvocations) ? source.shadowInvocations : [],
  };
}

function gateResult(name, passed, evidence, notes) {
  return {
    name,
    status: passed ? "PASS" : BLOCKED,
    passed,
    evidence,
    notes,
  };
}

function evaluateNoPublicAlias(fixture) {
  const proposedBlockedAliases = fixture.proposedAliases.filter((pathValue) =>
    BLOCKED_ALIASES.some((alias) => alias.path === pathValue)
  );
  const passed =
    proposedBlockedAliases.length === 0 && fixture.publicAliasAllowed !== true && fixture.publicAliasActive !== true;

  return gateResult(
    "noPublicAlias",
    passed,
    {
      blockedAliases: clone(BLOCKED_ALIASES),
      proposedBlockedAliases,
      publicAliasAttempted: proposedBlockedAliases.length > 0,
      publicAliasAllowedAttempted: fixture.publicAliasAllowed,
      publicAliasMountedAttempted: fixture.publicAliasActive,
    },
    passed ? "No public alias is proposed or active." : "Public alias proposal is blocked by phase."
  );
}

function evaluateRollbackReadiness(fixture) {
  const requirements = ROLLBACK_REQUIREMENTS.map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    status: fixture.rollback[requirement.key] === true ? "PASS" : BLOCKED,
    passed: fixture.rollback[requirement.key] === true,
  }));

  return {
    status: requirements.every((item) => item.passed) ? "PASS" : BLOCKED,
    requirements,
  };
}

function evaluateShadowInvocations(fixture) {
  return fixture.shadowInvocations.map((requestEnvelope) =>
    runOroPlayCallbackInternalShadowInvocation(requestEnvelope)
  );
}

function buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixtureInput) {
  const fixture = normalizeFixture(fixtureInput);
  const rollback = evaluateRollbackReadiness(fixture);
  const srcAppChanged = fixture.changedFiles.includes("src/app.js");
  const shadowInvocations = evaluateShadowInvocations(fixture);
  const failedShadowInvocations = shadowInvocations.filter((entry) => entry.ok !== true);
  const gates = [
    gateResult(
      "noExpressMount",
      fixture.expressMounted !== true,
      { expressMountAttempted: fixture.expressMounted },
      "ORO-4I cannot mount Express routes."
    ),
    evaluateNoPublicAlias(fixture),
    gateResult(
      "noActiveRoute",
      fixture.routeActive !== true,
      { routeActivationAttempted: fixture.routeActive },
      "Route candidates must remain inactive."
    ),
    gateResult(
      "noHttpListener",
      fixture.httpListener !== true,
      { httpListenerAttempted: fixture.httpListener },
      "ORO-4I cannot create or require an HTTP listener."
    ),
    gateResult(
      "noSrcAppChangeRequired",
      fixture.srcAppChangeRequired !== true && srcAppChanged !== true,
      {
        srcAppChangeRequired: fixture.srcAppChangeRequired,
        srcAppJsChanged: srcAppChanged,
      },
      "ORO-4I must not require or include src/app.js changes."
    ),
    gateResult(
      "noRuntimeTraffic",
      fixture.runtimeTraffic !== true && fixture.runtimeTrafficAllowed !== true,
      {
        runtimeTrafficAttempted: fixture.runtimeTraffic,
        runtimeTrafficAllowedAttempted: fixture.runtimeTrafficAllowed,
      },
      "Runtime traffic is blocked in ORO-4I."
    ),
    gateResult(
      "noRuntimeWalletMutation",
      fixture.walletMutation !== true,
      { walletMutationAttempted: fixture.walletMutation },
      "Wallet mutation is blocked in internal shadow."
    ),
    gateResult(
      "noRuntimeLedgerMutation",
      fixture.ledgerMutation !== true,
      { ledgerMutationAttempted: fixture.ledgerMutation },
      "Ledger mutation is blocked in internal shadow."
    ),
    gateResult(
      "noPrismaWrite",
      fixture.prismaWrite !== true,
      { prismaWriteAttempted: fixture.prismaWrite },
      "Prisma writes are blocked in internal shadow."
    ),
    gateResult(
      "noDbTransaction",
      fixture.dbTransaction !== true,
      { dbTransactionAttempted: fixture.dbTransaction },
      "DB transactions are blocked in internal shadow."
    ),
    gateResult(
      "noExternalNetwork",
      fixture.externalNetwork !== true,
      { externalNetworkAttempted: fixture.externalNetwork },
      "External network is blocked in internal shadow."
    ),
    gateResult(
      "noLiveOroPlayCall",
      fixture.liveOroPlayCall !== true,
      { liveOroPlayCallAttempted: fixture.liveOroPlayCall },
      "Live OroPlay calls are blocked in internal shadow."
    ),
    gateResult(
      "noSideEffect",
      fixture.sideEffectDetected !== true && failedShadowInvocations.length === 0,
      {
        sideEffectDetected: fixture.sideEffectDetected,
        failedShadowInvocationCount: failedShadowInvocations.length,
      },
      "Internal shadow invocation must remain side-effect free."
    ),
    gateResult(
      "noCredentialLeak",
      fixture.credentialLeakDetected !== true,
      { credentialLeakDetected: fixture.credentialLeakDetected },
      "Credential-like values must not be present or echoed."
    ),
    gateResult(
      "noSecretShapedFixture",
      fixture.secretShapedFixtureDetected !== true,
      { secretShapedFixtureDetected: fixture.secretShapedFixtureDetected },
      "Fixtures must use neutral markers only."
    ),
  ];

  for (const docGate of DOCUMENTATION_GATES) {
    gates.push(
      gateResult(
        docGate.gate,
        fixture.documentation[docGate.field] === true,
        { documented: fixture.documentation[docGate.field] === true },
        `${docGate.gate} must be documented for internal shadow evidence.`
      )
    );
  }

  gates.push(
    gateResult(
      "rollbackDocumented",
      fixture.documentation.rollbackDocumented === true && rollback.status === "PASS",
      {
        documented: fixture.documentation.rollbackDocumented === true,
        rollbackStatus: rollback.status,
      },
      "Rollback and abort readiness must be documented for internal shadow evidence."
    )
  );

  const blockedGates = gates.filter((gate) => !gate.passed);
  const shadowStatus = blockedGates.length > 0 ? BLOCKED : INTERNAL_SHADOW_PASS;

  return {
    phase: PHASE,
    name: NAME,
    fixtureId: fixture.id,
    harnessMode: HARNESS_MODE,
    shadowStatus,
    mountStatus: MOUNT_BLOCKED_BY_PHASE,
    publicAliasStatus: PUBLIC_ALIAS_BLOCKED_BY_PHASE,
    runtimeTrafficStatus: NO_RUNTIME_TRAFFIC,
    sideEffectStatus: NO_SIDE_EFFECT,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    externalNetworkAllowed: false,
    sideEffectsAllowed: false,
    routeActive: false,
    liveRouteActive: false,
    httpListener: false,
    routeCandidates: clone(ROUTE_CANDIDATES),
    blockedAliases: clone(BLOCKED_ALIASES),
    shadowInvocations,
    gates,
    rollback,
    safety: {
      internalShadowOnly: true,
      staticRouteDescriptorOnly: true,
      directCallMockInvocationOnly: true,
      sanitizedShadowTraceOnly: true,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      externalNetworkAllowed: false,
      sideEffectsAllowed: false,
      liveRouteAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      dbTransactionAllowed: false,
      liveOroPlayCallAllowed: false,
    },
    ok: blockedGates.length === 0,
    blockedGateNames: blockedGates.map((gate) => gate.name),
  };
}

function evaluateOroPlayCallbackStagingRouteInternalShadowHarness(fixtureInput) {
  return buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(fixtureInput);
}

function summarizeOroPlayCallbackInternalShadowHarness(reportOrFixture) {
  const report =
    reportOrFixture && Array.isArray(reportOrFixture.gates)
      ? reportOrFixture
      : buildOroPlayCallbackStagingRouteInternalShadowHarnessReport(reportOrFixture);

  return {
    phase: report.phase,
    name: report.name,
    harnessMode: report.harnessMode,
    shadowStatus: report.shadowStatus,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    externalNetworkAllowed: false,
    sideEffectsAllowed: false,
    routeCandidatesActive: report.routeCandidates.some((route) => route.active === true),
    publicAliasesActive: report.blockedAliases.some((alias) => alias.active === true || alias.mounted === true),
    blockedGateCount: report.blockedGateNames.length,
    blockedGateNames: report.blockedGateNames.slice(),
  };
}

module.exports = {
  PHASE,
  NAME,
  HARNESS_MODE,
  INTERNAL_SHADOW_PASS,
  BLOCKED,
  SHADOW_ONLY,
  MOUNT_BLOCKED_BY_PHASE,
  PUBLIC_ALIAS_BLOCKED_BY_PHASE,
  NO_RUNTIME_TRAFFIC,
  NO_SIDE_EFFECT,
  ROUTE_CANDIDATES,
  BLOCKED_ALIASES,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRouteInternalShadowHarnessReport,
  evaluateOroPlayCallbackStagingRouteInternalShadowHarness,
  runOroPlayCallbackInternalShadowInvocation,
  summarizeOroPlayCallbackInternalShadowHarness,
};
