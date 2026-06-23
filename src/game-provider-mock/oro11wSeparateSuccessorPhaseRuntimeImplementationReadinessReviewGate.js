"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11W_PHASE = "ORO-11W";
const ORO11W_PREVIOUS_PHASE = "ORO-11V";
const ORO11W_SCOPE = "separate_successor_phase_runtime_implementation_readiness_review_gate_only";
const ORO11W_GATE_PURPOSE = "runtime implementation readiness review";
const ORO11W_RESULT_KEY = "oro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateResult";
const ORO11W_REVIEW_STATUS = "separate_successor_phase_runtime_implementation_readiness_reviewed";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11uClosed",
  "oro11uWasRuntimeImplementationAuthorizationDecisionCloseoutConfirmationGate",
  "oro11vClosed",
  "oro11vWasRuntimeImplementationReadinessDiscoveryGate",
  "runtimeImplementationReadinessReviewGateOnly",
  "preRuntimeImplementationReadinessReviewOnly",
  "runtimeImplementationReadinessReviewed",
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

function buildOro11wSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11wDefaultInput() {
  return {
    id: "validOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture",
    phase: ORO11W_PHASE,
    previousPhase: ORO11W_PREVIOUS_PHASE,
    scope: ORO11W_SCOPE,
    gatePurpose: ORO11W_GATE_PURPOSE,
    reviewStatus: ORO11W_REVIEW_STATUS,
    reviewEvidence: {
      oro11uStatus: "closed",
      oro11uDisposition: "runtime_implementation_authorization_decision_closeout_confirmed",
      oro11vStatus: "closed",
      oro11vDisposition: "runtime_implementation_readiness_discovery_completed",
      reviewDisposition: "static_mock_runtime_implementation_readiness_review_only",
    },
    safetyEvidence: buildOro11wSafetySummary(),
  };
}

function normalizeOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateInput(input = {}) {
  const merged = deepMerge(buildOro11wDefaultInput(), isPlainObject(input) ? input : {});
  const review = isPlainObject(merged.reviewEvidence) ? merged.reviewEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, review, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11W_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11W_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11W_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11W_GATE_PURPOSE),
    reviewStatus: readStringFrom(sources, "reviewStatus", ORO11W_REVIEW_STATUS),
    reviewEvidence: clone(review),
    safetyEvidence: clone(safety),
    oro11uStatus: readStringFrom(sources, "oro11uStatus", "closed"),
    oro11uDisposition: readStringFrom(
      sources,
      "oro11uDisposition",
      "runtime_implementation_authorization_decision_closeout_confirmed"
    ),
    oro11vStatus: readStringFrom(sources, "oro11vStatus", "closed"),
    oro11vDisposition: readStringFrom(sources, "oro11vDisposition", "runtime_implementation_readiness_discovery_completed"),
    reviewDisposition: readStringFrom(sources, "reviewDisposition", "static_mock_runtime_implementation_readiness_review_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11W_PHASE) blockers.push("invalid_oro11w_phase");
  if (gate.previousPhase !== ORO11W_PREVIOUS_PHASE) blockers.push("invalid_oro11w_previous_phase");
  if (gate.scope !== ORO11W_SCOPE) blockers.push("invalid_oro11w_scope");
  if (gate.gatePurpose !== ORO11W_GATE_PURPOSE) blockers.push("invalid_oro11w_gate_purpose");
  if (gate.reviewStatus !== ORO11W_REVIEW_STATUS) blockers.push("invalid_oro11w_review_status");
  if (gate.oro11uStatus !== "closed") blockers.push("oro11u_not_closed");
  if (gate.oro11uDisposition !== "runtime_implementation_authorization_decision_closeout_confirmed") {
    blockers.push("oro11u_runtime_implementation_authorization_decision_closeout_not_confirmed");
  }
  if (gate.oro11vStatus !== "closed") blockers.push("oro11v_not_closed");
  if (gate.oro11vDisposition !== "runtime_implementation_readiness_discovery_completed") {
    blockers.push("oro11v_runtime_implementation_readiness_discovery_not_completed");
  }
  if (gate.reviewDisposition !== "static_mock_runtime_implementation_readiness_review_only") {
    blockers.push("oro11w_review_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11w`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11W_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    reviewStatus: pass ? gate.reviewStatus : HOLD,
    result,
    [ORO11W_RESULT_KEY]: result,
    fixtureId: gate.id,
    reviewEvidence: pass ? gate.reviewEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate(
  input = buildOro11wDefaultInput()
) {
  const gate = normalizeOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate(input = {}) {
  return evaluateOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11W_PHASE,
  ORO11W_PREVIOUS_PHASE,
  ORO11W_SCOPE,
  ORO11W_GATE_PURPOSE,
  ORO11W_RESULT_KEY,
  ORO11W_REVIEW_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11wSafetySummary,
  buildOro11wDefaultInput,
  normalizeOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGateInput,
  evaluateOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate,
  validateOro11wSeparateSuccessorPhaseRuntimeImplementationReadinessReviewGate,
};