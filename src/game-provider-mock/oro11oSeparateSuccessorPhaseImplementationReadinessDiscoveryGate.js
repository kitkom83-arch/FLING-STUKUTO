"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11O_PHASE = "ORO-11O";
const ORO11O_PREVIOUS_PHASE = "ORO-11N";
const ORO11O_SCOPE = "separate_successor_phase_implementation_readiness_discovery_gate_only";
const ORO11O_GATE_PURPOSE = "implementation readiness discovery";
const ORO11O_RESULT_KEY = "oro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateResult";
const ORO11O_READINESS_STATUS = "separate_successor_phase_implementation_readiness_discovered";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11mClosed",
  "oro11mWasAuthorizationDecisionGate",
  "oro11nClosed",
  "oro11nWasDecisionCloseoutConfirmationGate",
  "implementationReadinessDiscoveryGateOnly",
  "staticMockReadinessDiscoveryOnly",
  "implementationReadinessDiscoveryRecorded",
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

function buildOro11oSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11oDefaultInput() {
  return {
    id: "validOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture",
    phase: ORO11O_PHASE,
    previousPhase: ORO11O_PREVIOUS_PHASE,
    scope: ORO11O_SCOPE,
    gatePurpose: ORO11O_GATE_PURPOSE,
    readinessStatus: ORO11O_READINESS_STATUS,
    readinessEvidence: {
      oro11mStatus: "closed",
      oro11mDisposition: "authorization_decision_gate_completed",
      oro11nStatus: "closed",
      oro11nDisposition: "authorization_decision_closeout_confirmation_completed",
      readinessDisposition: "static_mock_implementation_readiness_discovery_only",
    },
    safetyEvidence: buildOro11oSafetySummary(),
  };
}

function normalizeOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateInput(input = {}) {
  const merged = deepMerge(buildOro11oDefaultInput(), isPlainObject(input) ? input : {});
  const readiness = isPlainObject(merged.readinessEvidence) ? merged.readinessEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, readiness, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11O_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11O_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11O_SCOPE),
    gatePurpose: readStringFrom(sources, "gatePurpose", ORO11O_GATE_PURPOSE),
    readinessStatus: readStringFrom(sources, "readinessStatus", ORO11O_READINESS_STATUS),
    readinessEvidence: clone(readiness),
    safetyEvidence: clone(safety),
    oro11mStatus: readStringFrom(sources, "oro11mStatus", "closed"),
    oro11mDisposition: readStringFrom(sources, "oro11mDisposition", "authorization_decision_gate_completed"),
    oro11nStatus: readStringFrom(sources, "oro11nStatus", "closed"),
    oro11nDisposition: readStringFrom(sources, "oro11nDisposition", "authorization_decision_closeout_confirmation_completed"),
    readinessDisposition: readStringFrom(sources, "readinessDisposition", "static_mock_implementation_readiness_discovery_only"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11O_PHASE) blockers.push("invalid_oro11o_phase");
  if (gate.previousPhase !== ORO11O_PREVIOUS_PHASE) blockers.push("invalid_oro11o_previous_phase");
  if (gate.scope !== ORO11O_SCOPE) blockers.push("invalid_oro11o_scope");
  if (gate.gatePurpose !== ORO11O_GATE_PURPOSE) blockers.push("invalid_oro11o_gate_purpose");
  if (gate.readinessStatus !== ORO11O_READINESS_STATUS) blockers.push("invalid_oro11o_readiness_status");
  if (gate.oro11mStatus !== "closed") blockers.push("oro11m_not_closed");
  if (gate.oro11mDisposition !== "authorization_decision_gate_completed") blockers.push("oro11m_decision_gate_not_completed");
  if (gate.oro11nStatus !== "closed") blockers.push("oro11n_not_closed");
  if (gate.oro11nDisposition !== "authorization_decision_closeout_confirmation_completed") {
    blockers.push("oro11n_closeout_confirmation_not_completed");
  }
  if (gate.readinessDisposition !== "static_mock_implementation_readiness_discovery_only") {
    blockers.push("oro11o_readiness_disposition_invalid");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11o`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11O_PHASE,
    previousPhase: pass ? gate.previousPhase : HOLD,
    scope: pass ? gate.scope : HOLD,
    gatePurpose: pass ? gate.gatePurpose : HOLD,
    readinessStatus: pass ? gate.readinessStatus : HOLD,
    result,
    [ORO11O_RESULT_KEY]: result,
    fixtureId: gate.id,
    readinessEvidence: pass ? gate.readinessEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate(input = buildOro11oDefaultInput()) {
  const gate = normalizeOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate(input = {}) {
  return evaluateOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11O_PHASE,
  ORO11O_PREVIOUS_PHASE,
  ORO11O_SCOPE,
  ORO11O_GATE_PURPOSE,
  ORO11O_RESULT_KEY,
  ORO11O_READINESS_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11oSafetySummary,
  buildOro11oDefaultInput,
  normalizeOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGateInput,
  evaluateOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate,
  validateOro11oSeparateSuccessorPhaseImplementationReadinessDiscoveryGate,
};
