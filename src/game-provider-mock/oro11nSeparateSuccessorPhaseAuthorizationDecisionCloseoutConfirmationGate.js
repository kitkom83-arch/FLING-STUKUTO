"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11N_PHASE = "ORO-11N";
const ORO11N_PREVIOUS_PHASE = "ORO-11M";
const ORO11N_SCOPE = "separate_successor_phase_authorization_decision_closeout_confirmation_gate_only";
const ORO11N_GATE_PURPOSE = "authorization decision closeout confirmation";
const ORO11N_RESULT_KEY = "oro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateResult";
const ORO11N_CLOSEOUT_STATUS = "separate_successor_phase_authorization_decision_closeout_confirmed";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11mClosed",
  "oro11mWasAuthorizationDecisionGate",
  "postDecisionCloseoutConfirmationGateOnly",
  "staticMockCloseoutOnly",
  "closeoutConfirmationRecorded",
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

function buildOro11nSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11nDefaultInput() {
  return {
    id: "validOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateFixture",
    phase: ORO11N_PHASE,
    previousPhase: ORO11N_PREVIOUS_PHASE,
    scope: ORO11N_SCOPE,
    gatePurpose: ORO11N_GATE_PURPOSE,
    closeoutStatus: ORO11N_CLOSEOUT_STATUS,
    closeoutEvidence: {
      oro11mStatus: "closed",
      oro11mDisposition: "authorization_decision_gate_completed",
      closeoutDisposition: "static_mock_closeout_confirmation_only",
    },
    safetyEvidence: buildOro11nSafetySummary(),
  };
}

function normalizeOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateInput(input = {}) {
  const merged = deepMerge(buildOro11nDefaultInput(), isPlainObject(input) ? input : {});
  const closeout = isPlainObject(merged.closeoutEvidence) ? merged.closeoutEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, closeout, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11N_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11N_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11N_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11N_GATE_PURPOSE),
    closeoutStatus: readStringFrom(sources, "closeoutStatus", ORO11N_CLOSEOUT_STATUS),
    closeoutEvidence: clone(closeout),
    safetyEvidence: clone(safety),
    oro11mStatus: readStringFrom(sources, "oro11mStatus", "closed"),
    oro11mDisposition: readStringFrom(sources, "oro11mDisposition", "authorization_decision_gate_completed"),
    closeoutDisposition: readStringFrom(sources, "closeoutDisposition", "static_mock_closeout_confirmation_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11N_PHASE) blockers.push("invalid_oro11n_phase");
  if (gate.previousPhase !== ORO11N_PREVIOUS_PHASE) blockers.push("invalid_oro11n_previous_phase");
  if (gate.scope !== ORO11N_SCOPE) blockers.push("invalid_oro11n_scope");
  if (gate.gatePurpose !== ORO11N_GATE_PURPOSE) blockers.push("invalid_oro11n_gate_purpose");
  if (gate.closeoutStatus !== ORO11N_CLOSEOUT_STATUS) blockers.push("invalid_oro11n_closeout_status");
  if (gate.oro11mStatus !== "closed") blockers.push("oro11m_not_closed");
  if (gate.oro11mDisposition !== "authorization_decision_gate_completed") blockers.push("oro11m_decision_gate_not_completed");
  if (gate.closeoutDisposition !== "static_mock_closeout_confirmation_only") blockers.push("oro11n_closeout_disposition_invalid");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11n`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11N_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    closeoutStatus: pass ? gate.closeoutStatus : HOLD,
    result,
    [ORO11N_RESULT_KEY]: result,
    fixtureId: gate.id,
    closeoutEvidence: pass ? gate.closeoutEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGate(
  input = buildOro11nDefaultInput()
) {
  const gate = normalizeOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGate(input = {}) {
  return evaluateOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11N_PHASE,
  ORO11N_PREVIOUS_PHASE,
  ORO11N_SCOPE,
  ORO11N_GATE_PURPOSE,
  ORO11N_RESULT_KEY,
  ORO11N_CLOSEOUT_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11nSafetySummary,
  buildOro11nDefaultInput,
  normalizeOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateInput,
  evaluateOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGate,
  validateOro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGate,
};
