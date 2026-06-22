"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11M_PHASE = "ORO-11M";
const ORO11M_SCOPE = "separate_successor_phase_authorization_decision_gate_only";
const ORO11M_RESULT_KEY = "oro11mSeparateSuccessorPhaseAuthorizationDecisionGateResult";
const ORO11M_DECISION_STATUS = "separate_successor_phase_authorization_decision_recorded";

const REQUIRED_PREVIOUS_PHASES = Object.freeze(["ORO-11I", "ORO-11J", "ORO-11K", "ORO-11L"]);
const REQUIRED_PREVIOUS_CANDIDATE_NAME = "ORO-11L Separate Successor Phase Authorization Request Gate";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11iClosed",
  "oro11jClosed",
  "oro11kClosed",
  "oro11lClosed",
  "oro11lWasAuthorizationRequestGate",
  "authorizationDecisionGateOnly",
  "decisionRecorded",
  "runtimeImplementationDisabled",
  "liveExecutionDisabled",
  "externalCallExecutionNotApproved",
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

function buildOro11mSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11mDefaultInput() {
  return {
    id: "validOro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture",
    phase: ORO11M_PHASE,
    scope: ORO11M_SCOPE,
    decisionStatus: ORO11M_DECISION_STATUS,
    previousPhases: [...REQUIRED_PREVIOUS_PHASES],
    decisionEvidence: {
      oro11iStatus: "closed",
      oro11jStatus: "closed",
      oro11kStatus: "closed",
      oro11lStatus: "closed",
      oro11lDisposition: "authorization_request_gate_completed",
      oro11lCandidatePhaseName: REQUIRED_PREVIOUS_CANDIDATE_NAME,
      decisionDisposition: "authorization_decision_recorded_only",
    },
    safetyEvidence: buildOro11mSafetySummary(),
  };
}

function normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput(input = {}) {
  const merged = deepMerge(buildOro11mDefaultInput(), isPlainObject(input) ? input : {});
  const decision = isPlainObject(merged.decisionEvidence) ? merged.decisionEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, decision, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11mSeparateSuccessorPhaseAuthorizationDecisionGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11M_PHASE),
    scope: readStringFrom(sources, "scope", ORO11M_SCOPE),
    decisionStatus: readStringFrom(sources, "decisionStatus", ORO11M_DECISION_STATUS),
    previousPhases: Array.isArray(merged.previousPhases) ? [...merged.previousPhases] : [],
    decisionEvidence: clone(decision),
    safetyEvidence: clone(safety),
    oro11iStatus: readStringFrom(sources, "oro11iStatus", "closed"),
    oro11jStatus: readStringFrom(sources, "oro11jStatus", "closed"),
    oro11kStatus: readStringFrom(sources, "oro11kStatus", "closed"),
    oro11lStatus: readStringFrom(sources, "oro11lStatus", "closed"),
    oro11lDisposition: readStringFrom(sources, "oro11lDisposition", "authorization_request_gate_completed"),
    oro11lCandidatePhaseName: readStringFrom(sources, "oro11lCandidatePhaseName", REQUIRED_PREVIOUS_CANDIDATE_NAME),
    decisionDisposition: readStringFrom(sources, "decisionDisposition", "authorization_decision_recorded_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11M_PHASE) blockers.push("invalid_oro11m_phase");
  if (gate.scope !== ORO11M_SCOPE) blockers.push("invalid_oro11m_scope");
  if (gate.decisionStatus !== ORO11M_DECISION_STATUS) blockers.push("invalid_oro11m_decision_status");
  for (const phase of REQUIRED_PREVIOUS_PHASES) {
    if (!gate.previousPhases.includes(phase)) blockers.push(`missing_previous_phase_${phase.toLowerCase().replace("-", "")}`);
  }
  if (gate.oro11iStatus !== "closed") blockers.push("oro11i_not_closed");
  if (gate.oro11jStatus !== "closed") blockers.push("oro11j_not_closed");
  if (gate.oro11kStatus !== "closed") blockers.push("oro11k_not_closed");
  if (gate.oro11lStatus !== "closed") blockers.push("oro11l_not_closed");
  if (gate.oro11lDisposition !== "authorization_request_gate_completed") blockers.push("oro11l_request_gate_not_completed");
  if (gate.oro11lCandidatePhaseName !== REQUIRED_PREVIOUS_CANDIDATE_NAME) blockers.push("oro11l_candidate_phase_name_mismatch");
  if (gate.decisionDisposition !== "authorization_decision_recorded_only") blockers.push("oro11m_decision_disposition_invalid");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11m`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11M_PHASE,
    scope: pass ? gate.scope : HOLD,
    decisionStatus: pass ? gate.decisionStatus : HOLD,
    result,
    [ORO11M_RESULT_KEY]: result,
    fixtureId: gate.id,
    previousPhases: pass ? gate.previousPhases : [],
    decisionEvidence: pass ? gate.decisionEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(
  input = buildOro11mDefaultInput()
) {
  const gate = normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(input = {}) {
  return evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11M_PHASE,
  ORO11M_SCOPE,
  ORO11M_RESULT_KEY,
  ORO11M_DECISION_STATUS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_PREVIOUS_CANDIDATE_NAME,
  buildOro11mSafetySummary,
  buildOro11mDefaultInput,
  normalizeOro11mSeparateSuccessorPhaseAuthorizationDecisionGateInput,
  evaluateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate,
  validateOro11mSeparateSuccessorPhaseAuthorizationDecisionGate,
};
