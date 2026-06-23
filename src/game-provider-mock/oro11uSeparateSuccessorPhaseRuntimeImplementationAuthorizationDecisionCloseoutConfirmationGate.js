"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11U_PHASE = "ORO-11U";
const ORO11U_PREVIOUS_PHASE = "ORO-11T";
const ORO11U_SCOPE = "separate_successor_phase_runtime_implementation_authorization_decision_closeout_confirmation_gate_only";
const ORO11U_GATE_PURPOSE = "runtime implementation authorization decision closeout confirmation";
const ORO11U_RESULT_KEY = "oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateResult";
const ORO11U_CLOSEOUT_STATUS = "separate_successor_phase_runtime_implementation_authorization_decision_closeout_confirmed";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11sClosed",
  "oro11sWasRuntimeImplementationAuthorizationRequestGate",
  "oro11tClosed",
  "oro11tWasRuntimeImplementationAuthorizationDecisionGate",
  "runtimeImplementationAuthorizationDecisionCloseoutConfirmationGateOnly",
  "preRuntimeImplementationAuthorizationDecisionCloseoutOnly",
  "runtimeImplementationAuthorizationDecisionCloseoutConfirmed",
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

function buildOro11uSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11uDefaultInput() {
  return {
    id: "validOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture",
    phase: ORO11U_PHASE,
    previousPhase: ORO11U_PREVIOUS_PHASE,
    scope: ORO11U_SCOPE,
    gatePurpose: ORO11U_GATE_PURPOSE,
    closeoutStatus: ORO11U_CLOSEOUT_STATUS,
    closeoutEvidence: {
      oro11sStatus: "closed",
      oro11sDisposition: "runtime_implementation_authorization_requested",
      oro11tStatus: "closed",
      oro11tDisposition: "runtime_implementation_authorization_decision_recorded",
      closeoutDisposition: "static_mock_runtime_implementation_authorization_decision_closeout_confirmation_only",
    },
    safetyEvidence: buildOro11uSafetySummary(),
  };
}

function normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput(
  input = {}
) {
  const merged = deepMerge(buildOro11uDefaultInput(), isPlainObject(input) ? input : {});
  const closeout = isPlainObject(merged.closeoutEvidence) ? merged.closeoutEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, closeout, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11U_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11U_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11U_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11U_GATE_PURPOSE),
    closeoutStatus: readStringFrom(sources, "closeoutStatus", ORO11U_CLOSEOUT_STATUS),
    closeoutEvidence: clone(closeout),
    safetyEvidence: clone(safety),
    oro11sStatus: readStringFrom(sources, "oro11sStatus", "closed"),
    oro11sDisposition: readStringFrom(sources, "oro11sDisposition", "runtime_implementation_authorization_requested"),
    oro11tStatus: readStringFrom(sources, "oro11tStatus", "closed"),
    oro11tDisposition: readStringFrom(sources, "oro11tDisposition", "runtime_implementation_authorization_decision_recorded"),
    closeoutDisposition: readStringFrom(
      sources,
      "closeoutDisposition",
      "static_mock_runtime_implementation_authorization_decision_closeout_confirmation_only"
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11U_PHASE) blockers.push("invalid_oro11u_phase");
  if (gate.previousPhase !== ORO11U_PREVIOUS_PHASE) blockers.push("invalid_oro11u_previous_phase");
  if (gate.scope !== ORO11U_SCOPE) blockers.push("invalid_oro11u_scope");
  if (gate.gatePurpose !== ORO11U_GATE_PURPOSE) blockers.push("invalid_oro11u_gate_purpose");
  if (gate.closeoutStatus !== ORO11U_CLOSEOUT_STATUS) blockers.push("invalid_oro11u_closeout_status");
  if (gate.oro11sStatus !== "closed") blockers.push("oro11s_not_closed");
  if (gate.oro11sDisposition !== "runtime_implementation_authorization_requested") {
    blockers.push("oro11s_authorization_request_not_recorded");
  }
  if (gate.oro11tStatus !== "closed") blockers.push("oro11t_not_closed");
  if (gate.oro11tDisposition !== "runtime_implementation_authorization_decision_recorded") {
    blockers.push("oro11t_authorization_decision_not_recorded");
  }
  if (gate.closeoutDisposition !== "static_mock_runtime_implementation_authorization_decision_closeout_confirmation_only") {
    blockers.push("oro11u_closeout_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11u`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11U_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    closeoutStatus: pass ? gate.closeoutStatus : HOLD,
    result,
    [ORO11U_RESULT_KEY]: result,
    fixtureId: gate.id,
    closeoutEvidence: pass ? gate.closeoutEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(
  input = buildOro11uDefaultInput()
) {
  const gate = normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(input = {}) {
  return evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11U_PHASE,
  ORO11U_PREVIOUS_PHASE,
  ORO11U_SCOPE,
  ORO11U_GATE_PURPOSE,
  ORO11U_RESULT_KEY,
  ORO11U_CLOSEOUT_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11uSafetySummary,
  buildOro11uDefaultInput,
  normalizeOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGateInput,
  evaluateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate,
  validateOro11uSeparateSuccessorPhaseRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate,
};