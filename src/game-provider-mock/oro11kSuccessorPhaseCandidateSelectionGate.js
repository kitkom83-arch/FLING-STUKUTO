"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11K_PHASE = "ORO-11K";
const ORO11K_SCOPE = "successor_phase_candidate_selection_gate_only";
const ORO11K_RESULT_KEY = "oro11kSuccessorPhaseCandidateSelectionGateResult";

const REQUIRED_PREVIOUS_PHASES = Object.freeze(["ORO-11I", "ORO-11J"]);
const NEXT_PHASE_KEY = "candidatePhaseRequiresSeparateGate";
const CANDIDATE_NEXT_PHASE_NAME = "ORO-11L Separate Successor Phase Authorization Request Gate";
const CANDIDATE_NEXT_PHASE_SCOPE = "separate_successor_phase_authorization_request_gate_only";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11iClosed",
  "oro11jClosed",
  "oro11jDiscoveryGateCompleted",
  "successorCandidateSelectionGateOnly",
  "candidatePhaseSelected",
  NEXT_PHASE_KEY,
  "candidatePhaseRuntimeLocked",
  "candidatePhaseLiveExternalCallLocked",
  "docsStaticMockLocalSmokeOnly",
  "runtimeImplementationDisabled",
  "routeMountDisabled",
  "publicAliasDisabled",
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

function buildOro11kSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11kDefaultInput() {
  return {
    id: "validOro11kSuccessorPhaseCandidateSelectionGateFixture",
    phase: ORO11K_PHASE,
    scope: ORO11K_SCOPE,
    previousPhases: [...REQUIRED_PREVIOUS_PHASES],
    candidateEvidence: {
      oro11iStatus: "closed",
      oro11jStatus: "closed",
      oro11jDisposition: "discovery_gate_completed",
      candidateNextPhaseName: CANDIDATE_NEXT_PHASE_NAME,
      candidateNextPhaseScope: CANDIDATE_NEXT_PHASE_SCOPE,
      candidatePhaseStatus: "selected_requires_separate_gate",
    },
    safetyEvidence: buildOro11kSafetySummary(),
  };
}

function normalizeOro11kSuccessorPhaseCandidateSelectionGateInput(input = {}) {
  const merged = deepMerge(buildOro11kDefaultInput(), isPlainObject(input) ? input : {});
  const candidate = isPlainObject(merged.candidateEvidence) ? merged.candidateEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, candidate, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11kSuccessorPhaseCandidateSelectionGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11K_PHASE),
    scope: readStringFrom(sources, "scope", ORO11K_SCOPE),
    previousPhases: Array.isArray(merged.previousPhases) ? [...merged.previousPhases] : [],
    candidateEvidence: clone(candidate),
    safetyEvidence: clone(safety),
    oro11iStatus: readStringFrom(sources, "oro11iStatus", "closed"),
    oro11jStatus: readStringFrom(sources, "oro11jStatus", "closed"),
    oro11jDisposition: readStringFrom(sources, "oro11jDisposition", "discovery_gate_completed"),
    candidateNextPhaseName: readStringFrom(sources, "candidateNextPhaseName", CANDIDATE_NEXT_PHASE_NAME),
    candidateNextPhaseScope: readStringFrom(sources, "candidateNextPhaseScope", CANDIDATE_NEXT_PHASE_SCOPE),
    candidatePhaseStatus: readStringFrom(sources, "candidatePhaseStatus", "selected_requires_separate_gate"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11kSuccessorPhaseCandidateSelectionGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11K_PHASE) blockers.push("invalid_oro11k_phase");
  if (gate.scope !== ORO11K_SCOPE) blockers.push("invalid_oro11k_scope");
  for (const phase of REQUIRED_PREVIOUS_PHASES) {
    if (!gate.previousPhases.includes(phase)) blockers.push(`missing_previous_phase_${phase.toLowerCase().replace("-", "")}`);
  }
  if (gate.oro11iStatus !== "closed") blockers.push("oro11i_not_closed");
  if (gate.oro11jStatus !== "closed") blockers.push("oro11j_not_closed");
  if (gate.oro11jDisposition !== "discovery_gate_completed") blockers.push("oro11j_discovery_gate_not_completed");
  if (gate.candidateNextPhaseName !== CANDIDATE_NEXT_PHASE_NAME) blockers.push("unexpected_candidate_next_phase_name");
  if (gate.candidateNextPhaseScope !== CANDIDATE_NEXT_PHASE_SCOPE) blockers.push("unexpected_candidate_next_phase_scope");
  if (gate.candidatePhaseStatus !== "selected_requires_separate_gate") blockers.push("candidate_phase_not_locked_after_separate_gate");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11k`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11K_PHASE,
    scope: pass ? gate.scope : HOLD,
    result,
    [ORO11K_RESULT_KEY]: result,
    fixtureId: gate.id,
    previousPhases: pass ? gate.previousPhases : [],
    candidateEvidence: pass ? gate.candidateEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11kSuccessorPhaseCandidateSelectionGate(input = buildOro11kDefaultInput()) {
  const gate = normalizeOro11kSuccessorPhaseCandidateSelectionGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11kSuccessorPhaseCandidateSelectionGate(input = {}) {
  return evaluateOro11kSuccessorPhaseCandidateSelectionGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11K_PHASE,
  ORO11K_SCOPE,
  ORO11K_RESULT_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  CANDIDATE_NEXT_PHASE_NAME,
  CANDIDATE_NEXT_PHASE_SCOPE,
  buildOro11kSafetySummary,
  buildOro11kDefaultInput,
  normalizeOro11kSuccessorPhaseCandidateSelectionGateInput,
  evaluateOro11kSuccessorPhaseCandidateSelectionGate,
  validateOro11kSuccessorPhaseCandidateSelectionGate,
};
