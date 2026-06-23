"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11V_PHASE = "ORO-11V";
const ORO11V_PREVIOUS_PHASE = "ORO-11U";
const ORO11V_SCOPE = "separate_successor_phase_runtime_implementation_readiness_discovery_gate_only";
const ORO11V_GATE_PURPOSE = "runtime implementation readiness discovery";
const ORO11V_RESULT_KEY = "oro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateResult";
const ORO11V_READINESS_STATUS = "separate_successor_phase_runtime_implementation_readiness_discovered";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11tClosed",
  "oro11tWasRuntimeImplementationAuthorizationDecisionGate",
  "oro11uClosed",
  "oro11uWasRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate",
  "runtimeImplementationReadinessDiscoveryGateOnly",
  "preRuntimeImplementationReadinessOnly",
  "runtimeImplementationReadinessDiscovered",
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

function buildOro11vSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11vDefaultInput() {
  return {
    id: "validOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture",
    phase: ORO11V_PHASE,
    previousPhase: ORO11V_PREVIOUS_PHASE,
    scope: ORO11V_SCOPE,
    gatePurpose: ORO11V_GATE_PURPOSE,
    readinessStatus: ORO11V_READINESS_STATUS,
    readinessEvidence: {
      oro11tStatus: "closed",
      oro11tDisposition: "runtime_implementation_authorization_decision_recorded",
      oro11uStatus: "closed",
      oro11uDisposition: "runtime_implementation_authorization_decision_closeout_confirmed",
      readinessDisposition: "static_mock_runtime_implementation_readiness_discovery_only",
    },
    safetyEvidence: buildOro11vSafetySummary(),
  };
}

function normalizeOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateInput(input = {}) {
  const merged = deepMerge(buildOro11vDefaultInput(), isPlainObject(input) ? input : {});
  const readiness = isPlainObject(merged.readinessEvidence) ? merged.readinessEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, readiness, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11V_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11V_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11V_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11V_GATE_PURPOSE),
    readinessStatus: readStringFrom(sources, "readinessStatus", ORO11V_READINESS_STATUS),
    readinessEvidence: clone(readiness),
    safetyEvidence: clone(safety),
    oro11tStatus: readStringFrom(sources, "oro11tStatus", "closed"),
    oro11tDisposition: readStringFrom(sources, "oro11tDisposition", "runtime_implementation_authorization_decision_recorded"),
    oro11uStatus: readStringFrom(sources, "oro11uStatus", "closed"),
    oro11uDisposition: readStringFrom(
      sources,
      "oro11uDisposition",
      "runtime_implementation_authorization_decision_closeout_confirmed"
    ),
    readinessDisposition: readStringFrom(
      sources,
      "readinessDisposition",
      "static_mock_runtime_implementation_readiness_discovery_only"
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11V_PHASE) blockers.push("invalid_oro11v_phase");
  if (gate.previousPhase !== ORO11V_PREVIOUS_PHASE) blockers.push("invalid_oro11v_previous_phase");
  if (gate.scope !== ORO11V_SCOPE) blockers.push("invalid_oro11v_scope");
  if (gate.gatePurpose !== ORO11V_GATE_PURPOSE) blockers.push("invalid_oro11v_gate_purpose");
  if (gate.readinessStatus !== ORO11V_READINESS_STATUS) blockers.push("invalid_oro11v_readiness_status");
  if (gate.oro11tStatus !== "closed") blockers.push("oro11t_not_closed");
  if (gate.oro11tDisposition !== "runtime_implementation_authorization_decision_recorded") {
    blockers.push("oro11t_runtime_implementation_authorization_decision_not_recorded");
  }
  if (gate.oro11uStatus !== "closed") blockers.push("oro11u_not_closed");
  if (gate.oro11uDisposition !== "runtime_implementation_authorization_decision_closeout_confirmed") {
    blockers.push("oro11u_runtime_implementation_authorization_decision_closeout_not_confirmed");
  }
  if (gate.readinessDisposition !== "static_mock_runtime_implementation_readiness_discovery_only") {
    blockers.push("oro11v_readiness_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11v`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11V_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    readinessStatus: pass ? gate.readinessStatus : HOLD,
    result,
    [ORO11V_RESULT_KEY]: result,
    fixtureId: gate.id,
    readinessEvidence: pass ? gate.readinessEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate(
  input = buildOro11vDefaultInput()
) {
  const gate = normalizeOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate(input = {}) {
  return evaluateOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11V_PHASE,
  ORO11V_PREVIOUS_PHASE,
  ORO11V_SCOPE,
  ORO11V_GATE_PURPOSE,
  ORO11V_RESULT_KEY,
  ORO11V_READINESS_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11vSafetySummary,
  buildOro11vDefaultInput,
  normalizeOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGateInput,
  evaluateOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate,
  validateOro11vSeparateSuccessorPhaseRuntimeImplementationReadinessDiscoveryGate,
};