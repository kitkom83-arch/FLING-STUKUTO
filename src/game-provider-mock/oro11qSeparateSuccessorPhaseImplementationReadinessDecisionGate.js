"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11Q_PHASE = "ORO-11Q";
const ORO11Q_PREVIOUS_PHASE = "ORO-11P";
const ORO11Q_SCOPE = "separate_successor_phase_implementation_readiness_decision_gate_only";
const ORO11Q_GATE_PURPOSE = "implementation readiness decision";
const ORO11Q_RESULT_KEY = "oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateResult";
const ORO11Q_DECISION_STATUS = "separate_successor_phase_implementation_readiness_decision_recorded";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11oClosed",
  "oro11oWasImplementationReadinessDiscoveryGate",
  "oro11pClosed",
  "oro11pWasImplementationReadinessReviewGate",
  "implementationReadinessDecisionGateOnly",
  "preImplementationReadinessDecisionOnly",
  "implementationReadinessDecisionRecorded",
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

function buildOro11qSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11qDefaultInput() {
  return {
    id: "validOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture",
    phase: ORO11Q_PHASE,
    previousPhase: ORO11Q_PREVIOUS_PHASE,
    scope: ORO11Q_SCOPE,
    gatePurpose: ORO11Q_GATE_PURPOSE,
    decisionStatus: ORO11Q_DECISION_STATUS,
    decisionEvidence: {
      oro11oStatus: "closed",
      oro11oDisposition: "implementation_readiness_discovery_completed",
      oro11pStatus: "closed",
      oro11pDisposition: "implementation_readiness_review_completed",
      decisionDisposition: "static_mock_implementation_readiness_decision_only",
    },
    safetyEvidence: buildOro11qSafetySummary(),
  };
}

function normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput(input = {}) {
  const merged = deepMerge(buildOro11qDefaultInput(), isPlainObject(input) ? input : {});
  const decision = isPlainObject(merged.decisionEvidence) ? merged.decisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, decision, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11Q_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11Q_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11Q_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11Q_GATE_PURPOSE),
    decisionStatus: readStringFrom(sources, "decisionStatus", ORO11Q_DECISION_STATUS),
    decisionEvidence: clone(decision),
    safetyEvidence: clone(safety),
    oro11oStatus: readStringFrom(sources, "oro11oStatus", "closed"),
    oro11oDisposition: readStringFrom(sources, "oro11oDisposition", "implementation_readiness_discovery_completed"),
    oro11pStatus: readStringFrom(sources, "oro11pStatus", "closed"),
    oro11pDisposition: readStringFrom(sources, "oro11pDisposition", "implementation_readiness_review_completed"),
    decisionDisposition: readStringFrom(sources, "decisionDisposition", "static_mock_implementation_readiness_decision_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11Q_PHASE) blockers.push("invalid_oro11q_phase");
  if (gate.previousPhase !== ORO11Q_PREVIOUS_PHASE) blockers.push("invalid_oro11q_previous_phase");
  if (gate.scope !== ORO11Q_SCOPE) blockers.push("invalid_oro11q_scope");
  if (gate.gatePurpose !== ORO11Q_GATE_PURPOSE) blockers.push("invalid_oro11q_gate_purpose");
  if (gate.decisionStatus !== ORO11Q_DECISION_STATUS) blockers.push("invalid_oro11q_decision_status");
  if (gate.oro11oStatus !== "closed") blockers.push("oro11o_not_closed");
  if (gate.oro11oDisposition !== "implementation_readiness_discovery_completed") {
    blockers.push("oro11o_readiness_discovery_not_completed");
  }
  if (gate.oro11pStatus !== "closed") blockers.push("oro11p_not_closed");
  if (gate.oro11pDisposition !== "implementation_readiness_review_completed") {
    blockers.push("oro11p_readiness_review_not_completed");
  }
  if (gate.decisionDisposition !== "static_mock_implementation_readiness_decision_only") {
    blockers.push("oro11q_decision_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11q`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11Q_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    decisionStatus: pass ? gate.decisionStatus : HOLD,
    result,
    [ORO11Q_RESULT_KEY]: result,
    fixtureId: gate.id,
    decisionEvidence: pass ? gate.decisionEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(
  input = buildOro11qDefaultInput()
) {
  const gate = normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(input = {}) {
  return evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11Q_PHASE,
  ORO11Q_PREVIOUS_PHASE,
  ORO11Q_SCOPE,
  ORO11Q_GATE_PURPOSE,
  ORO11Q_RESULT_KEY,
  ORO11Q_DECISION_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11qSafetySummary,
  buildOro11qDefaultInput,
  normalizeOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGateInput,
  evaluateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate,
  validateOro11qSeparateSuccessorPhaseImplementationReadinessDecisionGate,
};