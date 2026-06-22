"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11J_PHASE = "ORO-11J";
const ORO11J_SCOPE = "next_phase_discovery_gate_only";
const ORO11J_RESULT_KEY = "oro11jNextPhaseDiscoveryGateResult";

const REQUIRED_PREVIOUS_PHASES = Object.freeze(["ORO-11I"]);
const NEXT_PHASE_KEY = "nextPhaseRequiresSeparateGate";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11iClosed",
  "oro11jDidNotPreexist",
  "postOro11iNextPhaseWasUnnamed",
  NEXT_PHASE_KEY,
  "discoveryGateOnly",
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

function buildOro11jSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11jDefaultInput() {
  return {
    id: "validOro11jNextPhaseDiscoveryGateFixture",
    phase: ORO11J_PHASE,
    scope: ORO11J_SCOPE,
    previousPhases: [...REQUIRED_PREVIOUS_PHASES],
    discoveryEvidence: {
      oro11iStatus: "closed",
      oro11jPreexistingStatus: "absent_before_gate",
      postOro11iNextPhaseStatus: "unnamed_requires_separate_gate",
      discoveryDisposition: "record_discovery_only",
    },
    safetyEvidence: buildOro11jSafetySummary(),
  };
}

function normalizeOro11jNextPhaseDiscoveryGateInput(input = {}) {
  const merged = deepMerge(buildOro11jDefaultInput(), isPlainObject(input) ? input : {});
  const discovery = isPlainObject(merged.discoveryEvidence) ? merged.discoveryEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, discovery, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11jNextPhaseDiscoveryGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11J_PHASE),
    scope: readStringFrom(sources, "scope", ORO11J_SCOPE),
    previousPhases: Array.isArray(merged.previousPhases) ? [...merged.previousPhases] : [],
    discoveryEvidence: clone(discovery),
    safetyEvidence: clone(safety),
    oro11iStatus: readStringFrom(sources, "oro11iStatus", "closed"),
    oro11jPreexistingStatus: readStringFrom(sources, "oro11jPreexistingStatus", "absent_before_gate"),
    postOro11iNextPhaseStatus: readStringFrom(
      sources,
      "postOro11iNextPhaseStatus",
      "unnamed_requires_separate_gate"
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11jNextPhaseDiscoveryGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11J_PHASE) blockers.push("invalid_oro11j_phase");
  if (gate.scope !== ORO11J_SCOPE) blockers.push("invalid_oro11j_scope");
  for (const phase of REQUIRED_PREVIOUS_PHASES) {
    if (!gate.previousPhases.includes(phase)) blockers.push(`missing_previous_phase_${phase.toLowerCase().replace("-", "")}`);
  }
  if (gate.oro11iStatus !== "closed") blockers.push("oro11i_not_closed");
  if (gate.oro11jPreexistingStatus !== "absent_before_gate") blockers.push("oro11j_preexisted_before_gate");
  if (gate.postOro11iNextPhaseStatus !== "unnamed_requires_separate_gate") {
    blockers.push("post_oro11i_next_phase_not_unnamed_separate_gate");
  }
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11j`);
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11J_PHASE,
    scope: pass ? gate.scope : HOLD,
    result,
    [ORO11J_RESULT_KEY]: result,
    fixtureId: gate.id,
    previousPhases: pass ? gate.previousPhases : [],
    discoveryEvidence: pass ? gate.discoveryEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro11jNextPhaseDiscoveryGate(input = buildOro11jDefaultInput()) {
  const gate = normalizeOro11jNextPhaseDiscoveryGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11jNextPhaseDiscoveryGate(input = {}) {
  return evaluateOro11jNextPhaseDiscoveryGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11J_PHASE,
  ORO11J_SCOPE,
  ORO11J_RESULT_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_PREVIOUS_PHASES,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11jSafetySummary,
  buildOro11jDefaultInput,
  normalizeOro11jNextPhaseDiscoveryGateInput,
  evaluateOro11jNextPhaseDiscoveryGate,
  validateOro11jNextPhaseDiscoveryGate,
};
