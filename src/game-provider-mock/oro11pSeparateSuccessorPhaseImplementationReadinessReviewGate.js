"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11P_PHASE = "ORO-11P";
const ORO11P_PREVIOUS_PHASE = "ORO-11O";
const ORO11P_SCOPE = "separate_successor_phase_implementation_readiness_review_gate_only";
const ORO11P_GATE_PURPOSE = "implementation readiness review";
const ORO11P_RESULT_KEY = "oro11pSeparateSuccessorPhaseImplementationReadinessReviewGateResult";
const ORO11P_REVIEW_STATUS = "separate_successor_phase_implementation_readiness_reviewed";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11nClosed",
  "oro11nWasDecisionCloseoutConfirmationGate",
  "oro11oClosed",
  "oro11oWasImplementationReadinessDiscoveryGate",
  "implementationReadinessReviewGateOnly",
  "preImplementationReadinessReviewOnly",
  "implementationReadinessReviewed",
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

function buildOro11pSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11pDefaultInput() {
  return {
    id: "validOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture",
    phase: ORO11P_PHASE,
    previousPhase: ORO11P_PREVIOUS_PHASE,
    scope: ORO11P_SCOPE,
    gatePurpose: ORO11P_GATE_PURPOSE,
    reviewStatus: ORO11P_REVIEW_STATUS,
    reviewEvidence: {
      oro11nStatus: "closed",
      oro11nDisposition: "authorization_decision_closeout_confirmation_completed",
      oro11oStatus: "closed",
      oro11oDisposition: "implementation_readiness_discovery_completed",
      reviewDisposition: "static_mock_implementation_readiness_review_only",
    },
    safetyEvidence: buildOro11pSafetySummary(),
  };
}

function normalizeOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateInput(input = {}) {
  const merged = deepMerge(buildOro11pDefaultInput(), isPlainObject(input) ? input : {});
  const review = isPlainObject(merged.reviewEvidence) ? merged.reviewEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, review, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11pSeparateSuccessorPhaseImplementationReadinessReviewGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11P_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11P_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11P_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11P_GATE_PURPOSE),
    reviewStatus: readStringFrom(sources, "reviewStatus", ORO11P_REVIEW_STATUS),
    reviewEvidence: clone(review),
    safetyEvidence: clone(safety),
    oro11nStatus: readStringFrom(sources, "oro11nStatus", "closed"),
    oro11nDisposition: readStringFrom(sources, "oro11nDisposition", "authorization_decision_closeout_confirmation_completed"),
    oro11oStatus: readStringFrom(sources, "oro11oStatus", "closed"),
    oro11oDisposition: readStringFrom(sources, "oro11oDisposition", "implementation_readiness_discovery_completed"),
    reviewDisposition: readStringFrom(sources, "reviewDisposition", "static_mock_implementation_readiness_review_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11P_PHASE) blockers.push("invalid_oro11p_phase");
  if (gate.previousPhase !== ORO11P_PREVIOUS_PHASE) blockers.push("invalid_oro11p_previous_phase");
  if (gate.scope !== ORO11P_SCOPE) blockers.push("invalid_oro11p_scope");
  if (gate.gatePurpose !== ORO11P_GATE_PURPOSE) blockers.push("invalid_oro11p_gate_purpose");
  if (gate.reviewStatus !== ORO11P_REVIEW_STATUS) blockers.push("invalid_oro11p_review_status");
  if (gate.oro11nStatus !== "closed") blockers.push("oro11n_not_closed");
  if (gate.oro11nDisposition !== "authorization_decision_closeout_confirmation_completed") {
    blockers.push("oro11n_closeout_confirmation_not_completed");
  }
  if (gate.oro11oStatus !== "closed") blockers.push("oro11o_not_closed");
  if (gate.oro11oDisposition !== "implementation_readiness_discovery_completed") {
    blockers.push("oro11o_readiness_discovery_not_completed");
  }
  if (gate.reviewDisposition !== "static_mock_implementation_readiness_review_only") {
    blockers.push("oro11p_review_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11p`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11P_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    reviewStatus: pass ? gate.reviewStatus : HOLD,
    result,
    [ORO11P_RESULT_KEY]: result,
    fixtureId: gate.id,
    reviewEvidence: pass ? gate.reviewEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11pSeparateSuccessorPhaseImplementationReadinessReviewGate(input = buildOro11pDefaultInput()) {
  const gate = normalizeOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11pSeparateSuccessorPhaseImplementationReadinessReviewGate(input = {}) {
  return evaluateOro11pSeparateSuccessorPhaseImplementationReadinessReviewGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11P_PHASE,
  ORO11P_PREVIOUS_PHASE,
  ORO11P_SCOPE,
  ORO11P_GATE_PURPOSE,
  ORO11P_RESULT_KEY,
  ORO11P_REVIEW_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11pSafetySummary,
  buildOro11pDefaultInput,
  normalizeOro11pSeparateSuccessorPhaseImplementationReadinessReviewGateInput,
  evaluateOro11pSeparateSuccessorPhaseImplementationReadinessReviewGate,
  validateOro11pSeparateSuccessorPhaseImplementationReadinessReviewGate,
};
