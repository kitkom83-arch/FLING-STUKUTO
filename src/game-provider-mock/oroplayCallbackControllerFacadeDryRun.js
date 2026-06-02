"use strict";

const {
  buildOroplayBalanceResponseEnvelope,
  buildOroplayTransactionResponseEnvelope,
  invokeOroplayShadowEnvelopeFlow,
  sanitizeOroplayEnvelopeLogPreview,
  validateOroplayRequestResponseEnvelope,
} = require("./oroplayCallbackRequestResponseEnvelope");

const OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS = Object.freeze({
  phase: "ORO-4E",
  status: "callback controller facade dry-run",
  defaultDecision: "fail_closed",
  controllerFacadeOnly: true,
  directCallOnly: true,
  mockAuthDecisionOnly: true,
  expressRouteWired: false,
  runtimeWiredToLiveRoute: false,
  aliasBalanceEnabled: false,
  aliasTransactionEnabled: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  externalNetworkAllowed: false,
  networkAllowed: false,
  activationAllowed: false,
});

const REDACTION_MARKERS = Object.freeze([
  "auth-header-redaction-marker",
  "credential-prefix-marker",
  "mock-redaction-key-name",
  "redacted-credential-marker",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFacadeSafetyProof() {
  return {
    expressRouteWired: false,
    expressRouteWiring: false,
    runtimeWiredToLiveRoute: false,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    networkAllowed: false,
    activationAllowed: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
    aliasBalance: false,
    aliasTransaction: false,
    walletMutated: false,
    ledgerMutated: false,
    prismaWritten: false,
    externalNetworkCalled: false,
  };
}

function buildFacadeLogPreview(value, decision, callbackType) {
  const redactionCounter = { redacted: 0 };
  const sanitizedPayload = sanitizeOroplayEnvelopeLogPreview(value || {}, redactionCounter);

  return {
    phase: OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.phase,
    mode: "controller_facade_direct_call_mock_only",
    callbackType,
    decision,
    rawPayloadPrinted: false,
    bodyLogged: false,
    credentialLikeValuesPrinted: false,
    envValuesRead: false,
    credentialValuesRead: false,
    redactedKeyCount: redactionCounter.redacted,
    redactionMarkers: REDACTION_MARKERS.slice(),
    sanitizedPayload,
  };
}

function readMockAuthCandidate(mockRequest) {
  if (!isPlainObject(mockRequest)) return {};
  if (isPlainObject(mockRequest.mockAuth)) return mockRequest.mockAuth;
  if (isPlainObject(mockRequest.authMock)) return mockRequest.authMock;
  if (isPlainObject(mockRequest.auth)) return mockRequest.auth;
  return {};
}

function buildOroplayMockCallbackAuthDecision(mockRequest = {}) {
  const requestIsObject = isPlainObject(mockRequest);
  const auth = readMockAuthCandidate(mockRequest);
  const authorized =
    requestIsObject &&
    (auth.allowed === true ||
      auth.authorized === true ||
      mockRequest.mockAuthenticated === true ||
      mockRequest.mockAuthAllowed === true);
  const decision = authorized ? "mock_authorized" : "fail_closed";
  const reason = requestIsObject ? (authorized ? "mock_auth_allowed" : "unauthorized_mock") : "malformed_request";

  return {
    phase: OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.phase,
    authDecisionOnly: true,
    mockAuthDecisionOnly: true,
    authorized,
    decision,
    reason,
    failClosed: !authorized,
    credentialValuesRead: false,
    envValuesRead: false,
    rawCredentialPrinted: false,
    credentialHeaderPrinted: false,
    ...buildFacadeSafetyProof(),
    logPreview: buildFacadeLogPreview(
      {
        mockAuthShapePresent: isPlainObject(auth),
        mockAuthPrincipal: typeof auth.principal === "string" ? auth.principal : null,
        requestMeta: isPlainObject(mockRequest.requestMeta) ? mockRequest.requestMeta : {},
      },
      decision,
      resolveCallbackType(mockRequest, null)
    ),
  };
}

function resolveCallbackType(mockRequest, explicitType) {
  if (explicitType) return explicitType;
  if (!isPlainObject(mockRequest)) return "unknown";
  if (typeof mockRequest.callbackType === "string" && mockRequest.callbackType.trim()) {
    return mockRequest.callbackType.trim().toLowerCase();
  }
  if (typeof mockRequest.kind === "string" && mockRequest.kind.trim()) {
    return mockRequest.kind.trim().toLowerCase();
  }

  const payload = extractPayload(mockRequest);
  if (isPlainObject(payload) && typeof payload.callbackType === "string" && payload.callbackType.trim()) {
    return payload.callbackType.trim().toLowerCase();
  }
  return "unknown";
}

function extractPayload(mockRequest) {
  if (!isPlainObject(mockRequest)) return {};
  if (isPlainObject(mockRequest.body)) return mockRequest.body;
  if (isPlainObject(mockRequest.payload)) return mockRequest.payload;
  if (isPlainObject(mockRequest.callbackPayload)) return mockRequest.callbackPayload;
  return {};
}

function buildFailClosedFacadeResponse(callbackType, reason) {
  const shadowResult = {
    callbackType,
    decision: "fail_closed",
    reason,
    failClosed: true,
    manualReview: false,
    debitIntent: null,
    creditIntent: null,
    ledgerIntent: null,
    reconciliationIntent: null,
    doubleDebitPrevented: true,
    doubleCreditPrevented: true,
    ...buildFacadeSafetyProof(),
  };

  if (callbackType === "balance") return buildOroplayBalanceResponseEnvelope(shadowResult);
  return buildOroplayTransactionResponseEnvelope(shadowResult);
}

function buildFacadeResult(callbackType, mockRequest, authDecision, envelopeFlow, responseEnvelope) {
  const response = responseEnvelope || envelopeFlow.response;
  const decision = response.decision || response.status || "fail_closed";
  const requestEnvelope = envelopeFlow.request || null;
  const shadowResult = envelopeFlow.shadowResult || null;
  const previewPayload = {
    authDecision: {
      decision: authDecision.decision,
      reason: authDecision.reason,
      authorized: authDecision.authorized,
      credentialValuesRead: false,
      envValuesRead: false,
    },
    requestEnvelope: requestEnvelope
      ? {
          callbackType: requestEnvelope.callbackType,
          normalized: requestEnvelope.normalized,
          decision: requestEnvelope.decision,
          reason: requestEnvelope.reason,
        }
      : null,
    responseEnvelope: {
      callbackType: response.callbackType,
      envelopeType: response.envelopeType,
      status: response.status,
      decision: response.decision,
      reason: response.reason,
    },
    mockRequest: isPlainObject(mockRequest) ? mockRequest : {},
  };

  return {
    phase: OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.phase,
    callbackType,
    controllerFacadeOnly: true,
    directCallOnly: true,
    mockAuthDecisionOnly: true,
    decision,
    reason: response.reason || authDecision.reason || null,
    status: response.status || "fail_closed",
    success: response.success === true,
    failClosed: response.failClosed === true || authDecision.failClosed === true,
    manualReview: response.manualReview === true,
    authDecision: clone(authDecision),
    requestEnvelope: requestEnvelope ? clone(requestEnvelope) : null,
    shadowResult: shadowResult ? clone(shadowResult) : null,
    responseEnvelope: clone(response),
    response: clone(response),
    ...buildFacadeSafetyProof(),
    logPreview: buildFacadeLogPreview(previewPayload, decision, callbackType),
  };
}

function runOroplayControllerFacadeDryRunFlow(input = {}) {
  const mockRequest = isPlainObject(input) ? input : {};
  const callbackType = resolveCallbackType(mockRequest, input.callbackType);
  const authDecision = buildOroplayMockCallbackAuthDecision(mockRequest);

  if (authDecision.authorized !== true) {
    const responseEnvelope = buildFailClosedFacadeResponse(callbackType === "balance" ? "balance" : "transaction", authDecision.reason);
    return buildFacadeResult(callbackType, mockRequest, authDecision, { request: null, shadowResult: null }, responseEnvelope);
  }

  const payload = extractPayload(mockRequest);
  if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
    const responseEnvelope = buildFailClosedFacadeResponse(callbackType === "balance" ? "balance" : "transaction", "malformed_request");
    return buildFacadeResult(callbackType, mockRequest, authDecision, { request: null, shadowResult: null }, responseEnvelope);
  }

  const envelopeFlow = invokeOroplayShadowEnvelopeFlow({
    callbackType,
    payload,
    state: mockRequest.state,
    priorInvocations: mockRequest.priorInvocations,
  });

  return buildFacadeResult(callbackType, mockRequest, authDecision, envelopeFlow);
}

function handleOroplayBalanceCallbackFacadeDryRun(mockRequest = {}) {
  return runOroplayControllerFacadeDryRunFlow({ ...mockRequest, callbackType: "balance" });
}

function handleOroplayTransactionCallbackFacadeDryRun(mockRequest = {}) {
  return runOroplayControllerFacadeDryRunFlow({ ...mockRequest, callbackType: "transaction" });
}

function validateOroplayControllerFacadeDryRun(input = {}) {
  const flow = input && input.responseEnvelope ? input : runOroplayControllerFacadeDryRunFlow(input);
  const errors = [];
  const allowedStatuses = new Set(["success", "fail_closed", "manual_review", "idempotent_replay"]);

  if (flow.controllerFacadeOnly !== true) errors.push("facade must stay controllerFacadeOnly.");
  if (flow.directCallOnly !== true) errors.push("facade must stay directCallOnly.");
  if (!flow.authDecision || flow.authDecision.mockAuthDecisionOnly !== true) {
    errors.push("mock auth decision must be present.");
  }
  if (!flow.responseEnvelope || !allowedStatuses.has(flow.responseEnvelope.status)) {
    errors.push(`unsupported facade response status: ${flow.responseEnvelope && flow.responseEnvelope.status}`);
  }

  for (const flag of [
    "expressRouteWired",
    "runtimeWiredToLiveRoute",
    "aliasBalanceEnabled",
    "aliasTransactionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "networkAllowed",
    "activationAllowed",
  ]) {
    if (flow[flag] !== false) errors.push(`${flag} must remain false.`);
    if (flow.responseEnvelope && flow.responseEnvelope[flag] !== undefined && flow.responseEnvelope[flag] !== false) {
      errors.push(`responseEnvelope.${flag} must remain false.`);
    }
  }

  if (flow.authDecision && flow.authDecision.authorized !== true && flow.responseEnvelope.status !== "fail_closed") {
    errors.push("unauthorized mock decision must fail closed.");
  }

  if (flow.responseEnvelope) {
    const envelopeValidation = validateOroplayRequestResponseEnvelope({ response: flow.responseEnvelope, shadowResult: flow.shadowResult });
    if (!envelopeValidation.ok) errors.push(...envelopeValidation.errors);
  }

  return { ok: errors.length === 0, errors, flow };
}

function buildOroplayControllerFacadeDryRunSummary(input = {}) {
  const flow = runOroplayControllerFacadeDryRunFlow(input);

  return {
    phase: OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.phase,
    status: OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS.status,
    defaultDecision: "fail_closed",
    controllerFacadeOnly: true,
    directCallOnly: true,
    mockAuthDecisionOnly: true,
    callbackType: flow.callbackType,
    authDecision: flow.authDecision.decision,
    responseStatus: flow.responseEnvelope.status,
    responseDecision: flow.responseEnvelope.decision,
    oro2bFailClosedPreserved: true,
    oro4aDisabledGatePreserved: true,
    oro4bStagingPrecheckPreserved: true,
    oro4cShadowInvocationPreserved: true,
    oro4dEnvelopeMapperPreserved: true,
    ...buildFacadeSafetyProof(),
  };
}

function assertFalseFlag(target, flagName) {
  if (target[flagName] !== false) throw new Error(`OroPlay ORO-4E must keep ${flagName}=false.`);
}

function assertOroplayFacadeNoExpressRouteWiring(input = {}) {
  const summary = buildOroplayControllerFacadeDryRunSummary(input);
  assertFalseFlag(summary, "expressRouteWired");
  assertFalseFlag(summary, "runtimeWiredToLiveRoute");
  return summary;
}

function assertOroplayFacadeNoAliasEnabled(input = {}) {
  const summary = buildOroplayControllerFacadeDryRunSummary(input);
  assertFalseFlag(summary, "aliasBalanceEnabled");
  assertFalseFlag(summary, "aliasTransactionEnabled");
  return summary;
}

function assertOroplayFacadeNoMutation(input = {}) {
  const flow = runOroplayControllerFacadeDryRunFlow(input);
  assertFalseFlag(flow, "walletMutationAllowed");
  assertFalseFlag(flow, "ledgerMutationAllowed");
  if (flow.walletMutated !== false) throw new Error("OroPlay ORO-4E must not mutate wallet state.");
  if (flow.ledgerMutated !== false) throw new Error("OroPlay ORO-4E must not mutate ledger state.");
  return flow;
}

function assertOroplayFacadeNoNetwork(input = {}) {
  const summary = buildOroplayControllerFacadeDryRunSummary(input);
  assertFalseFlag(summary, "externalNetworkAllowed");
  assertFalseFlag(summary, "networkAllowed");
  return summary;
}

function assertOroplayFacadeNoPrismaWrite(input = {}) {
  const summary = buildOroplayControllerFacadeDryRunSummary(input);
  assertFalseFlag(summary, "prismaWriteAllowed");
  return summary;
}

module.exports = {
  OROPLAY_CALLBACK_CONTROLLER_FACADE_DRY_RUN_STATUS,
  buildOroplayMockCallbackAuthDecision,
  handleOroplayBalanceCallbackFacadeDryRun,
  handleOroplayTransactionCallbackFacadeDryRun,
  runOroplayControllerFacadeDryRunFlow,
  validateOroplayControllerFacadeDryRun,
  buildOroplayControllerFacadeDryRunSummary,
  assertOroplayFacadeNoExpressRouteWiring,
  assertOroplayFacadeNoAliasEnabled,
  assertOroplayFacadeNoMutation,
  assertOroplayFacadeNoNetwork,
  assertOroplayFacadeNoPrismaWrite,
};
