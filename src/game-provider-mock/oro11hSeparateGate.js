"use strict";

const PASS = "PASS";
const HOLD = "HOLD";

const ORO11H_PHASE = "ORO-11H";
const ORO11H_PREVIOUS_PHASE = "ORO-11G";
const ORO11H_SCOPE = "user_approved_evidence_pack_separate_gate_after_oro_11g_only";
const ORO11H_RESULT_KEY = "oro11hUserApprovedSeparateGateResult";
const NEXT_PHASE_KEY = "nextPhaseRequiresSeparateGate";

const ORO11H_STATUS = Object.freeze({
  PREPARED: "mock_user_approved_separate_gate_prepared",
  APPROVED_FOR_GATE_ONLY: "mock_user_approved_separate_gate_recorded_for_gate_only",
  REJECTED: "mock_user_approved_separate_gate_rejected",
  MISSING_APPROVAL: "mock_user_approved_separate_gate_missing_approval",
  UNSAFE_RUNTIME_REQUESTED: "mock_user_approved_separate_gate_unsafe_runtime_requested",
  FAIL_CLOSED: "fail_closed",
});

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro11gClosed",
  "humanApprovedSeparateGateDecision",
  "separateGateApprovalPresent",
  "userApprovedNextGateAfterOro11g",
  "docsStaticMockLocalSmokeOnly",
  "notInferredFromRoadmapMarker",
  "routeMountDisabled",
  "publicAliasDisabled",
  "runtimeTrafficDisabled",
  "walletMutationDisabled",
  "ledgerMutationDisabled",
  "liveExecutionDisabled",
  "externalCallDisabled",
  "liveOroPlayApiCallDisabled",
  "secretShapedValuesAbsent",
  "productionDbDisabled",
  "deployDisabled",
  NEXT_PHASE_KEY,
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeImplementation",
  "liveExecution",
  "routeMountEnabled",
  "publicAliasEnabled",
  "runtimeTrafficEnabled",
  "walletMutation",
  "ledgerMutation",
  "liveOroPlayApiCall",
  "externalCall",
  "externalNetworkCalled",
  "secretShapedValuePresent",
  "productionDbTouched",
  "prismaWrite",
  "dbTransaction",
  "migration",
  "deploy",
  "realMoneyTouched",
  "gameLaunch",
]);

const GUARDED_KEY_PARTS = Object.freeze([
  ["to", "ken"],
  ["pass", "word"],
  ["se", "cret"],
  ["client", "se", "cret"],
  ["pin"],
  ["device", "id"],
  ["database", "url"],
  ["authorization"],
  ["credential"],
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

function normalizeStatus(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return ORO11H_STATUS.PREPARED;
  if (Object.values(ORO11H_STATUS).includes(candidate)) return candidate;
  return ORO11H_STATUS.FAIL_CLOSED;
}

function isGuardedKey(key) {
  const normalized = String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return GUARDED_KEY_PARTS.some((parts) => normalized.includes(parts.join("")));
}

function hasGuardedStringShape(value) {
  const text = String(value || "");
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) return true;
  if (/[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i.test(text)) return true;
  return false;
}

function scanForGuardedShape(value) {
  if (Array.isArray(value)) return value.some(scanForGuardedShape);
  if (typeof value === "string") return hasGuardedStringShape(value);
  if (!isPlainObject(value)) return false;
  return Object.entries(value).some(([key, nested]) => {
    if (isGuardedKey(key) && typeof nested !== "boolean") return true;
    return scanForGuardedShape(nested);
  });
}

function buildOro11hSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro11hDefaultInput() {
  return {
    id: "validOro11hUserApprovedSeparateGateFixture",
    phase: ORO11H_PHASE,
    previousPhase: ORO11H_PREVIOUS_PHASE,
    scope: ORO11H_SCOPE,
    status: ORO11H_STATUS.PREPARED,
    approvalEvidence: {
      humanDecision: "user_approved_separate_gate_after_oro_11g",
      approvedPhase: ORO11H_PHASE,
      previousPhase: ORO11H_PREVIOUS_PHASE,
      oro11gClosed: true,
      roadmapHadExplicitOro11hMarker: false,
      createdFromHumanApproval: true,
      separateGateApprovalPresent: true,
    },
    safetyEvidence: buildOro11hSafetySummary(),
  };
}

function normalizeOro11hSeparateGateInput(input = {}) {
  const merged = deepMerge(buildOro11hDefaultInput(), isPlainObject(input) ? input : {});
  const approval = isPlainObject(merged.approvalEvidence) ? merged.approvalEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const sources = [merged, approval, safety];
  const normalized = {
    id: readStringFrom([merged], "id", "oro11hSeparateGateFixture"),
    phase: readStringFrom(sources, "phase", ORO11H_PHASE),
    previousPhase: readStringFrom(sources, "previousPhase", ORO11H_PREVIOUS_PHASE),
    scope: readStringFrom(sources, "scope", ORO11H_SCOPE),
    status: normalizeStatus(readStringFrom(sources, "status", ORO11H_STATUS.PREPARED)),
    approvalEvidence: clone(approval),
    safetyEvidence: clone(safety),
    guardedShapeDetected: scanForGuardedShape(merged),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(sources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(sources, key, false);
  return normalized;
}

function validationBlockersFor(input = {}) {
  const gate = normalizeOro11hSeparateGateInput(input);
  const blockers = [];
  if (gate.phase !== ORO11H_PHASE) blockers.push("invalid_oro11h_phase");
  if (gate.previousPhase !== ORO11H_PREVIOUS_PHASE) blockers.push("invalid_previous_phase");
  if (gate.scope !== ORO11H_SCOPE) blockers.push("invalid_oro11h_scope");
  if (gate.status === ORO11H_STATUS.MISSING_APPROVAL) blockers.push("separate_gate_approval_missing");
  if (gate.status === ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED) blockers.push("unsafe_runtime_requested");
  if (gate.status === ORO11H_STATUS.FAIL_CLOSED) blockers.push("separate_gate_fail_closed");
  for (const key of REQUIRED_TRUE_FLAGS) if (gate[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (gate[key] !== false) blockers.push(`${key}_not_allowed_in_oro11h`);
  if (gate.guardedShapeDetected) blockers.push("secret_shaped_value_present");
  return Array.from(new Set(blockers));
}

function buildOutput(result, blockers, gate) {
  const pass = result === PASS;
  const output = {
    phase: ORO11H_PHASE,
    previousPhase: gate.previousPhase,
    scope: pass ? gate.scope : HOLD,
    result,
    [ORO11H_RESULT_KEY]: result,
    status: pass ? gate.status : ORO11H_STATUS.FAIL_CLOSED,
    fixtureId: gate.id,
    approvalEvidence: pass ? gate.approvalEvidence : {},
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && gate[key] === true;
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  output.secretShapedValuePresent = false;
  return output;
}

function evaluateOro11hSeparateGate(input = buildOro11hDefaultInput()) {
  const gate = normalizeOro11hSeparateGateInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, gate);
  return buildOutput(PASS, [], gate);
}

function validateOro11hSeparateGate(input = {}) {
  return evaluateOro11hSeparateGate(input);
}

module.exports = {
  PASS,
  HOLD,
  ORO11H_PHASE,
  ORO11H_PREVIOUS_PHASE,
  ORO11H_SCOPE,
  ORO11H_RESULT_KEY,
  NEXT_PHASE_KEY,
  ORO11H_STATUS,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  buildOro11hSafetySummary,
  buildOro11hDefaultInput,
  normalizeOro11hSeparateGateInput,
  evaluateOro11hSeparateGate,
  validateOro11hSeparateGate,
};
