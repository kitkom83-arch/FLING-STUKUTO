"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11T_PHASE = "ORO-11T";
const ORO11T_PREVIOUS_PHASE = "ORO-11S";
const ORO11T_SCOPE = "separate_successor_phase_runtime_implementation_authorization_decision_gate_only";
const ORO11T_GATE_PURPOSE = "runtime implementation authorization decision";
const ORO11T_RESULT_KEY = "oro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateResult";
const ORO11T_DECISION_STATUS = "separate_successor_phase_runtime_implementation_authorization_decision_recorded";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11rClosed",
  "oro11rWasImplementationReadinessDecisionCloseoutConfirmationGate",
  "oro11sClosed",
  "oro11sWasRuntimeImplementationAuthorizationRequestGate",
  "runtimeImplementationAuthorizationDecisionGateOnly",
  "runtimeImplementationAuthorizationDecisionRecorded",
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

function buildOro11tSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11tDefaultInput() {
  return {
    id: "validOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture",
    phase: ORO11T_PHASE,
    previousPhase: ORO11T_PREVIOUS_PHASE,
    scope: ORO11T_SCOPE,
    gatePurpose: ORO11T_GATE_PURPOSE,
    decisionStatus: ORO11T_DECISION_STATUS,
    decisionEvidence: {
      oro11rStatus: "closed",
      oro11rDisposition: "implementation_readiness_decision_closeout_confirmed",
      oro11sStatus: "closed",
      oro11sDisposition: "runtime_implementation_authorization_requested",
      authorizationDecisionDisposition: "static_mock_runtime_implementation_authorization_decision_only",
    },
    safetyEvidence: buildOro11tSafetySummary(),
  };
}

function normalizeOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateInput(input = {}) {
  const merged = deepMerge(buildOro11tDefaultInput(), isPlainObject(input) ? input : {});
  const decision = isPlainObject(merged.decisionEvidence) ? merged.decisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, decision, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11T_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11T_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11T_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11T_GATE_PURPOSE),
    decisionStatus: readStringFrom(sources, "decisionStatus", ORO11T_DECISION_STATUS),
    decisionEvidence: clone(decision),
    safetyEvidence: clone(safety),
    oro11rStatus: readStringFrom(sources, "oro11rStatus", "closed"),
    oro11rDisposition: readStringFrom(sources, "oro11rDisposition", "implementation_readiness_decision_closeout_confirmed"),
    oro11sStatus: readStringFrom(sources, "oro11sStatus", "closed"),
    oro11sDisposition: readStringFrom(sources, "oro11sDisposition", "runtime_implementation_authorization_requested"),
    authorizationDecisionDisposition: readStringFrom(
      sources,
      "authorizationDecisionDisposition",
      "static_mock_runtime_implementation_authorization_decision_only"
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11T_PHASE) blockers.push("invalid_oro11t_phase");
  if (gate.previousPhase !== ORO11T_PREVIOUS_PHASE) blockers.push("invalid_oro11t_previous_phase");
  if (gate.scope !== ORO11T_SCOPE) blockers.push("invalid_oro11t_scope");
  if (gate.gatePurpose !== ORO11T_GATE_PURPOSE) blockers.push("invalid_oro11t_gate_purpose");
  if (gate.decisionStatus !== ORO11T_DECISION_STATUS) blockers.push("invalid_oro11t_decision_status");
  if (gate.oro11rStatus !== "closed") blockers.push("oro11r_not_closed");
  if (gate.oro11rDisposition !== "implementation_readiness_decision_closeout_confirmed") {
    blockers.push("oro11r_closeout_confirmation_not_confirmed");
  }
  if (gate.oro11sStatus !== "closed") blockers.push("oro11s_not_closed");
  if (gate.oro11sDisposition !== "runtime_implementation_authorization_requested") {
    blockers.push("oro11s_authorization_request_not_recorded");
  }
  if (gate.authorizationDecisionDisposition !== "static_mock_runtime_implementation_authorization_decision_only") {
    blockers.push("oro11t_authorization_decision_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11t`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11T_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    decisionStatus: pass ? gate.decisionStatus : HOLD,
    result,
    [ORO11T_RESULT_KEY]: result,
    fixtureId: gate.id,
    decisionEvidence: pass ? gate.decisionEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate(
  input = buildOro11tDefaultInput()
) {
  const gate = normalizeOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate(input = {}) {
  return evaluateOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11T_PHASE,
  ORO11T_PREVIOUS_PHASE,
  ORO11T_SCOPE,
  ORO11T_GATE_PURPOSE,
  ORO11T_RESULT_KEY,
  ORO11T_DECISION_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11tSafetySummary,
  buildOro11tDefaultInput,
  normalizeOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGateInput,
  evaluateOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate,
  validateOro11tSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionGate,
};
