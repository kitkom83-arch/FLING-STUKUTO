"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11I_PHASE = "ORO-11I";
const ORO11I_SCOPE = "closeout_wording_alignment_gate_only";
const ORO11I_RESULT_KEY = "oro11iCloseoutWordingAlignmentGateResult";

const REQUIRED_PREVIOUS_PHASES = Object.freeze(["ORO-11G", "ORO-11H"]);
const NEXT_PHASE_KEY = "nextPhaseRequiresSeparateGate";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11gClosed",
  "oro11hClosed",
  "staleOro11gCurrentWordingResolved",
  "staleOro11hCurrentWordingResolved",
  "nextPhaseUnnamed",
  NEXT_PHASE_KEY,
  "runtimeRoutesDisabled",
  "publicAliasesDisabled",
  "walletMutationDisabled",
  "ledgerMutationDisabled",
  "liveExecutionDisabled",
  "externalCallDisabled",
  "realMoneyDisabled",
  "docsStaticMockLocalSmokeOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeImplementation",
  "runtimeRouteController",
  "expressMount",
  "publicAlias",
  "apiBalanceActiveRoute",
  "apiTransactionActiveRoute",
  "walletMutation",
  "ledgerMutation",
  "liveExecution",
  "externalCall",
  "liveOroPlayApiCall",
  "realMoney",
  "payout",
  "autoCredit",
  "prismaWrite",
  "dbTransaction",
  "migration",
  "deploy",
  "gameLaunch",
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

function buildOro11iSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11iDefaultInput() {
  return {
    id: "validOro11iCloseoutWordingAlignmentGateFixture",
    phase: ORO11I_PHASE,
    scope: ORO11I_SCOPE,
    previousPhases: [...REQUIRED_PREVIOUS_PHASES],
    closeoutEvidence: {
      oro11gStatus: "closed",
      oro11hStatus: "closed",
      staleOro11gCurrentWordingResolved: true,
      staleOro11hCurrentWordingResolved: true,
      nextPhaseStatus: "unnamed_requires_separate_gate",
    },
    safetyEvidence: buildOro11iSafetySummary(),
  };
}

function normalizeOro11iCloseoutWordingAlignmentGateInput(input = {}) {
  const merged = deepMerge(buildOro11iDefaultInput(), isPlainObject(input) ? input : {});
  const closeout = isPlainObject(merged.closeoutEvidence) ? merged.closeoutEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, closeout, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11iCloseoutWordingAlignmentFixture"),
    phase: readStringFrom(sources, "phase", ORO11I_PHASE),
    scope: readStringFrom(sources, "scope", ORO11I_SCOPE),
    previousPhases: Array.isArray(merged.previousPhases) ? [...merged.previousPhases] : [],
    closeoutEvidence: clone(closeout),
    safetyEvidence: clone(safety),
    oro11gStatus: readStringFrom(sources, "oro11gStatus", "closed"),
    oro11hStatus: readStringFrom(sources, "oro11hStatus", "closed"),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11iCloseoutWordingAlignmentGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11I_PHASE) blockers.push("invalid_oro11i_phase");
  if (gate.scope !== ORO11I_SCOPE) blockers.push("invalid_oro11i_scope");
  for (const phase of REQUIRED_PREVIOUS_PHASES) {
    if (!gate.previousPhases.includes(phase)) blockers.push(`missing_previous_phase_${phase.toLowerCase().replace("-", "")}`);
  }
  if (gate.oro11gStatus !== "closed") blockers.push("oro11g_not_closed");
  if (gate.oro11hStatus !== "closed") blockers.push("oro11h_not_closed");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11i`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11I_PHASE,
    scope: pass ? gate.scope : HOLD,
    result,
    [ORO11I_RESULT_KEY]: result,
    fixtureId: gate.id,
    previousPhases: pass ? gate.previousPhases : [],
    closeoutEvidence: pass ? gate.closeoutEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11iCloseoutWordingAlignmentGate(input = buildOro11iDefaultInput()) {
  const gate = normalizeOro11iCloseoutWordingAlignmentGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11iCloseoutWordingAlignmentGate(input = {}) {
  return evaluateOro11iCloseoutWordingAlignmentGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11I_PHASE,
  ORO11I_SCOPE,
  ORO11I_RESULT_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11iSafetySummary,
  buildOro11iDefaultInput,
  normalizeOro11iCloseoutWordingAlignmentGateInput,
  evaluateOro11iCloseoutWordingAlignmentGate,
  validateOro11iCloseoutWordingAlignmentGate,
};
