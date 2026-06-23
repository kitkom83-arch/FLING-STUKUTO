"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11R_PHASE = "ORO-11R";
const ORO11R_PREVIOUS_PHASE = "ORO-11Q";
const ORO11R_SCOPE = "separate_successor_phase_implementation_readiness_decision_closeout_confirmation_gate_only";
const ORO11R_GATE_PURPOSE = "implementation readiness decision closeout confirmation";
const ORO11R_RESULT_KEY = "oro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateResult";
const ORO11R_CLOSEOUT_STATUS = "separate_successor_phase_implementation_readiness_decision_closeout_confirmed";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11pClosed",
  "oro11pWasImplementationReadinessReviewGate",
  "oro11qClosed",
  "oro11qWasImplementationReadinessDecisionGate",
  "implementationReadinessDecisionCloseoutConfirmationGateOnly",
  "preImplementationReadinessDecisionCloseoutOnly",
  "implementationReadinessDecisionCloseoutConfirmed",
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

function buildOro11rSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11rDefaultInput() {
  return {
    id: "validOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture",
    phase: ORO11R_PHASE,
    previousPhase: ORO11R_PREVIOUS_PHASE,
    scope: ORO11R_SCOPE,
    gatePurpose: ORO11R_GATE_PURPOSE,
    closeoutStatus: ORO11R_CLOSEOUT_STATUS,
    closeoutEvidence: {
      oro11pStatus: "closed",
      oro11pDisposition: "implementation_readiness_review_completed",
      oro11qStatus: "closed",
      oro11qDisposition: "implementation_readiness_decision_recorded",
      closeoutDisposition: "static_mock_implementation_readiness_decision_closeout_confirmation_only",
    },
    safetyEvidence: buildOro11rSafetySummary(),
  };
}

function normalizeOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateInput(input = {}) {
  const merged = deepMerge(buildOro11rDefaultInput(), isPlainObject(input) ? input : {});
  const closeout = isPlainObject(merged.closeoutEvidence) ? merged.closeoutEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, closeout, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11R_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11R_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11R_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11R_GATE_PURPOSE),
    closeoutStatus: readStringFrom(sources, "closeoutStatus", ORO11R_CLOSEOUT_STATUS),
    closeoutEvidence: clone(closeout),
    safetyEvidence: clone(safety),
    oro11pStatus: readStringFrom(sources, "oro11pStatus", "closed"),
    oro11pDisposition: readStringFrom(sources, "oro11pDisposition", "implementation_readiness_review_completed"),
    oro11qStatus: readStringFrom(sources, "oro11qStatus", "closed"),
    oro11qDisposition: readStringFrom(sources, "oro11qDisposition", "implementation_readiness_decision_recorded"),
    closeoutDisposition: readStringFrom(sources, "closeoutDisposition", "static_mock_implementation_readiness_decision_closeout_confirmation_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11R_PHASE) blockers.push("invalid_oro11r_phase");
  if (gate.previousPhase !== ORO11R_PREVIOUS_PHASE) blockers.push("invalid_oro11r_previous_phase");
  if (gate.scope !== ORO11R_SCOPE) blockers.push("invalid_oro11r_scope");
  if (gate.gatePurpose !== ORO11R_GATE_PURPOSE) blockers.push("invalid_oro11r_gate_purpose");
  if (gate.closeoutStatus !== ORO11R_CLOSEOUT_STATUS) blockers.push("invalid_oro11r_closeout_status");
  if (gate.oro11pStatus !== "closed") blockers.push("oro11p_not_closed");
  if (gate.oro11pDisposition !== "implementation_readiness_review_completed") {
    blockers.push("oro11p_readiness_review_not_completed");
  }
  if (gate.oro11qStatus !== "closed") blockers.push("oro11q_not_closed");
  if (gate.oro11qDisposition !== "implementation_readiness_decision_recorded") {
    blockers.push("oro11q_readiness_decision_not_recorded");
  }
  if (gate.closeoutDisposition !== "static_mock_implementation_readiness_decision_closeout_confirmation_only") {
    blockers.push("oro11r_closeout_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11r`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11R_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    closeoutStatus: pass ? gate.closeoutStatus : HOLD,
    result,
    [ORO11R_RESULT_KEY]: result,
    fixtureId: gate.id,
    closeoutEvidence: pass ? gate.closeoutEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate(
  input = buildOro11rDefaultInput()
) {
  const gate = normalizeOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate(input = {}) {
  return evaluateOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11R_PHASE,
  ORO11R_PREVIOUS_PHASE,
  ORO11R_SCOPE,
  ORO11R_GATE_PURPOSE,
  ORO11R_RESULT_KEY,
  ORO11R_CLOSEOUT_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11rSafetySummary,
  buildOro11rDefaultInput,
  normalizeOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGateInput,
  evaluateOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate,
  validateOro11rSeparateSuccessorPhaseImplementationReadinessDecisionCloseoutConfirmationGate,
};