"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11L_PHASE = "ORO-11L";
const ORO11L_SCOPE = "separate_successor_phase_authorization_request_gate_only";
const ORO11L_RESULT_KEY = "oro11lSeparateSuccessorPhaseAuthorizationRequestGateResult";
const ORO11L_REQUEST_STATUS = "submitted_pending_separate_successor_phase_authorization_decision";

const REQUIRED_PREVIOUS_PHASES = Object.freeze(["ORO-11I", "ORO-11J", "ORO-11K"]);
const REQUIRED_CANDIDATE_NAME = "ORO-11L Separate Successor Phase Authorization Request Gate";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11iClosed",
  "oro11jClosed",
  "oro11kClosed",
  "oro11kSelectedOro11lCandidate",
  "authorizationRequestGateOnly",
  "requestSubmittedPendingDecision",
  "notApprovalGranted",
  "runtimeImplementationNotApproved",
  "liveExecutionNotApproved",
  "externalCallNotApproved",
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
  "approvalGranted",
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

function buildOro11lSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11lDefaultInput() {
  return {
    id: "validOro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture",
    phase: ORO11L_PHASE,
    scope: ORO11L_SCOPE,
    requestStatus: ORO11L_REQUEST_STATUS,
    previousPhases: [...REQUIRED_PREVIOUS_PHASES],
    requestEvidence: {
      oro11iStatus: "closed",
      oro11jStatus: "closed",
      oro11kStatus: "closed",
      oro11kCandidatePhaseName: REQUIRED_CANDIDATE_NAME,
      requestDisposition: "authorization_request_submitted_only",
    },
    safetyEvidence: buildOro11lSafetySummary(),
  };
}

function normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput(input = {}) {
  const merged = deepMerge(buildOro11lDefaultInput(), isPlainObject(input) ? input : {});
  const request = isPlainObject(merged.requestEvidence) ? merged.requestEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, request, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11lSeparateSuccessorPhaseAuthorizationRequestGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11L_PHASE),
    scope: readStringFrom(sources, "scope", ORO11L_SCOPE),
    requestStatus: readStringFrom(sources, "requestStatus", ORO11L_REQUEST_STATUS),
    previousPhases: Array.isArray(merged.previousPhases) ? [...merged.previousPhases] : [],
    requestEvidence: clone(request),
    safetyEvidence: clone(safety),
    oro11iStatus: readStringFrom(sources, "oro11iStatus", "closed"),
    oro11jStatus: readStringFrom(sources, "oro11jStatus", "closed"),
    oro11kStatus: readStringFrom(sources, "oro11kStatus", "closed"),
    oro11kCandidatePhaseName: readStringFrom(sources, "oro11kCandidatePhaseName", REQUIRED_CANDIDATE_NAME),
    requestDisposition: readStringFrom(sources, "requestDisposition", "authorization_request_submitted_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11L_PHASE) blockers.push("invalid_oro11l_phase");
  if (gate.scope !== ORO11L_SCOPE) blockers.push("invalid_oro11l_scope");
  if (gate.requestStatus !== ORO11L_REQUEST_STATUS) blockers.push("invalid_oro11l_request_status");
  for (const phase of REQUIRED_PREVIOUS_PHASES) {
    if (!gate.previousPhases.includes(phase)) blockers.push(`missing_previous_phase_${phase.toLowerCase().replace("-", "")}`);
  }
  if (gate.oro11iStatus !== "closed") blockers.push("oro11i_not_closed");
  if (gate.oro11jStatus !== "closed") blockers.push("oro11j_not_closed");
  if (gate.oro11kStatus !== "closed") blockers.push("oro11k_not_closed");
  if (gate.oro11kCandidatePhaseName !== REQUIRED_CANDIDATE_NAME) blockers.push("oro11k_candidate_phase_name_mismatch");
  if (gate.requestDisposition !== "authorization_request_submitted_only") blockers.push("oro11l_request_disposition_invalid");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11l`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11L_PHASE,
    scope: pass ? gate.scope : HOLD,
    requestStatus: pass ? gate.requestStatus : HOLD,
    result,
    [ORO11L_RESULT_KEY]: result,
    fixtureId: gate.id,
    previousPhases: pass ? gate.previousPhases : [],
    requestEvidence: pass ? gate.requestEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(input = buildOro11lDefaultInput()) {
  const gate = normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(input = {}) {
  return evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11L_PHASE,
  ORO11L_SCOPE,
  ORO11L_RESULT_KEY,
  ORO11L_REQUEST_STATUS,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  REQUIRED_CANDIDATE_NAME,
  buildOro11lSafetySummary,
  buildOro11lDefaultInput,
  normalizeOro11lSeparateSuccessorPhaseAuthorizationRequestGateInput,
  evaluateOro11lSeparateSuccessorPhaseAuthorizationRequestGate,
  validateOro11lSeparateSuccessorPhaseAuthorizationRequestGate,
};
