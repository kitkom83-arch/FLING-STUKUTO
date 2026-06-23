"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11S_PHASE = "ORO-11S";
const ORO11S_PREVIOUS_PHASE = "ORO-11R";
const ORO11S_SCOPE = "separate_successor_phase_runtime_implementation_authorization_request_gate_only";
const ORO11S_GATE_PURPOSE = "runtime implementation authorization request";
const ORO11S_RESULT_KEY = "oro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateResult";
const ORO11S_REQUEST_STATUS = "separate_successor_phase_runtime_implementation_authorization_requested";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11qClosed",
  "oro11qWasImplementationReadinessDecisionGate",
  "oro11rClosed",
  "oro11rWasImplementationReadinessDecisionCloseoutConfirmationGate",
  "runtimeImplementationAuthorizationRequestGateOnly",
  "runtimeImplementationAuthorizationRequested",
  "runtimeImplementationNotYetApproved",
  "runtimeImplementationDisabled",
  "liveExecutionDisabled",
  "routeMountNotApproved",
  "publicAliasNotApproved",
  "docsStaticMockLocalSmokeOnly",
  "apiBalanceDisabled",
  "apiTransactionDisabled",
  "liveOroPlayApiCallDisabled",
  "externalNetworkDisabled",
  "walletMutationDisabled",
  "ledgerMutationDisabled",
  "prismaWriteDisabled",
  "migrationDisabled",
  "deployDisabled",
  "productionDbDisabled",
  "realMoneyDisabled",
  "credentialMaterialAbsent",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeImplementation",
  "runtimeImplementationApproved",
  "runtimeRouteController",
  "expressMount",
  "routeMount",
  "publicAlias",
  "apiBalanceActiveRoute",
  "apiTransactionActiveRoute",
  "liveExecution",
  "liveOroPlayApiCall",
  "externalNetwork",
  "externalCall",
  "walletMutation",
  "ledgerMutation",
  "prismaWrite",
  "dbTransaction",
  "migration",
  "deploy",
  "productionDb",
  "realMoney",
  "payout",
  "autoCredit",
  "gameLaunch",
  "credentialMaterial",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, overrides) {
  if (!isPlainObject(overrides)) return clone(base);
  const output = clone(base);
  for (const [key, value] of Object.entries(overrides)) {
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? deepMerge(output[key], value) : clone(value);
  }
  return output;
}

function flagsFor(keys, value) {
  return keys.reduce((flags, key) => {
    flags[key] = value;
    return flags;
  }, {});
}

function readBooleanFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  }
  return fallback;
}

function readStringFrom(sources, key, fallback) {
  for (const source of sources) {
    if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) return source[key];
  }
  return fallback;
}

function buildOro11sSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11sDefaultInput() {
  return {
    id: "validOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture",
    phase: ORO11S_PHASE,
    previousPhase: ORO11S_PREVIOUS_PHASE,
    scope: ORO11S_SCOPE,
    gatePurpose: ORO11S_GATE_PURPOSE,
    requestStatus: ORO11S_REQUEST_STATUS,
    requestEvidence: {
      oro11qStatus: "closed",
      oro11qDisposition: "implementation_readiness_decision_recorded",
      oro11rStatus: "closed",
      oro11rDisposition: "implementation_readiness_decision_closeout_confirmed",
      authorizationRequestDisposition: "static_mock_runtime_implementation_authorization_request_only",
    },
    safetyEvidence: buildOro11sSafetySummary(),
  };
}

function normalizeOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateInput(input = {}) {
  const merged = deepMerge(buildOro11sDefaultInput(), isPlainObject(input) ? input : {});
  const request = isPlainObject(merged.requestEvidence) ? merged.requestEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, request, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11S_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11S_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11S_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11S_GATE_PURPOSE),
    requestStatus: readStringFrom(sources, "requestStatus", ORO11S_REQUEST_STATUS),
    requestEvidence: clone(request),
    safetyEvidence: clone(safety),
    oro11qStatus: readStringFrom(sources, "oro11qStatus", "closed"),
    oro11qDisposition: readStringFrom(sources, "oro11qDisposition", "implementation_readiness_decision_recorded"),
    oro11rStatus: readStringFrom(sources, "oro11rStatus", "closed"),
    oro11rDisposition: readStringFrom(sources, "oro11rDisposition", "implementation_readiness_decision_closeout_confirmed"),
    authorizationRequestDisposition: readStringFrom(
      sources,
      "authorizationRequestDisposition",
      "static_mock_runtime_implementation_authorization_request_only"
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11S_PHASE) blockers.push("invalid_oro11s_phase");
  if (gate.previousPhase !== ORO11S_PREVIOUS_PHASE) blockers.push("invalid_oro11s_previous_phase");
  if (gate.scope !== ORO11S_SCOPE) blockers.push("invalid_oro11s_scope");
  if (gate.gatePurpose !== ORO11S_GATE_PURPOSE) blockers.push("invalid_oro11s_gate_purpose");
  if (gate.requestStatus !== ORO11S_REQUEST_STATUS) blockers.push("invalid_oro11s_request_status");
  if (gate.oro11qStatus !== "closed") blockers.push("oro11q_not_closed");
  if (gate.oro11qDisposition !== "implementation_readiness_decision_recorded") {
    blockers.push("oro11q_readiness_decision_not_recorded");
  }
  if (gate.oro11rStatus !== "closed") blockers.push("oro11r_not_closed");
  if (gate.oro11rDisposition !== "implementation_readiness_decision_closeout_confirmed") {
    blockers.push("oro11r_closeout_confirmation_not_confirmed");
  }
  if (gate.authorizationRequestDisposition !== "static_mock_runtime_implementation_authorization_request_only") {
    blockers.push("oro11s_authorization_request_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11s`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11S_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    requestStatus: pass ? gate.requestStatus : HOLD,
    result,
    [ORO11S_RESULT_KEY]: result,
    fixtureId: gate.id,
    requestEvidence: pass ? gate.requestEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate(
  input = buildOro11sDefaultInput()
) {
  const gate = normalizeOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate(input = {}) {
  return evaluateOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11S_PHASE,
  ORO11S_PREVIOUS_PHASE,
  ORO11S_SCOPE,
  ORO11S_GATE_PURPOSE,
  ORO11S_RESULT_KEY,
  ORO11S_REQUEST_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11sSafetySummary,
  buildOro11sDefaultInput,
  normalizeOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGateInput,
  evaluateOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate,
  validateOro11sSeparateSuccessorPhaseRuntimeImplementationAuthorizationRequestGate,
};