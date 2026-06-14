"use strict";

const {
  HOLD,
  ORO_10A_SCOPE,
  ORO_10A_STATUS,
  PASS,
  buildOro10aApprovalChainRolloverRecord,
  validateOro10aBoundary,
} = require("./oro10aApprovalChainRolloverBoundary");

const ORO10B_PHASE = "ORO-10B";
const ORO10B_SCOPE = "approval_chain_rollover_continuity_review_gate_only";
const ORO10B_STATUS = "approval_chain_rollover_continuity_review_gate_passed_for_static_contract_only";
const ORO10B_RESULT_KEY = "approvalChainRolloverContinuityGateResult";
const DEPENDS_ON_ORO10A_KEY = "dependsOnOro10aApprovalChainRolloverBoundary";
const ORO10A_PASSED_KEY = "oro10aApprovalChainRolloverBoundaryPassed";
const VERIFIED_ORO10A_ONLY_KEY = "verifiedOro10aWasApprovalChainRolloverBoundaryOnly";
const NEXT_STEP_KEY = "nextStepRequiresSeparateContinuityApproval";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "continuationFromOro10aConfirmed",
  "oro10ChainStartedFromOro9zConfirmed",
  "approvalChainRolloverContinuityGatePresent",
  "continuityReviewPrepared",
  "continuityReviewIssued",
  "continuityReviewPassed",
  "continuityReviewRecorded",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "verifiedNoRuntimeApprovalOccurred",
  "verifiedNoRuntimeActivationOccurred",
  "verifiedNoRuntimeEnablementOccurred",
  "verifiedNoRuntimeAuthzOccurred",
  "verifiedNoRuntimeAcceptanceOccurred",
  "verifiedNoRuntimeFinalizationOccurred",
  "verifiedNoRuntimeApprovalChainRolloverOccurred",
  "verifiedNoRuntimeMountOccurred",
  "verifiedNoRouteAliasOccurred",
  "verifiedNoPublicCallbackAliasOccurred",
  "verifiedNoLiveExecutionOccurred",
  "verifiedNoActualExternalCallOccurred",
  "verifiedNoExternalNetworkOccurred",
  "verifiedNoLiveOroPlayApiCallOccurred",
  "verifiedNoWalletMutationOccurred",
  "verifiedNoLedgerMutationOccurred",
  "verifiedNoPrismaWriteOccurred",
  "verifiedNoDbTransactionOccurred",
  "verifiedNoMigrationOccurred",
  "verifiedNoDeployOccurred",
  "verifiedNoSecretLikeValuePresent",
  "verifiedShortOro10bFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "runtimeApproval",
  "runtimeActivation",
  "runtimeEnablement",
  "runtimeAuthz",
  "runtimeAcceptance",
  "runtimeFinalization",
  "runtimeApprovalChainRollover",
  "runtimeMount",
  "routeAlias",
  "publicAlias",
  "publicCallbackAlias",
  "liveExecution",
  "actualExternalCall",
  "externalCall",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCalled",
  "walletMutation",
  "ledgerMutation",
  "prismaWrite",
  "dbTransaction",
  "migration",
  "deploy",
  "productionDbTouched",
  "realMoneyTouched",
  "secretLikeValuePresent",
  "sensitiveOutputPresent",
  "longFilenameDetected",
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

function buildOro10bSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10bOro10aPredecessorEvidence() {
  const oro10aSummary = validateOro10aBoundary(buildOro10aApprovalChainRolloverRecord());
  const passed = oro10aSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10A_KEY]: true,
    [ORO10A_PASSED_KEY]: passed,
    [VERIFIED_ORO10A_ONLY_KEY]: passed,
    oro10aStatus: passed ? ORO_10A_STATUS : HOLD,
    oro10aScope: passed ? ORO_10A_SCOPE : HOLD,
    oro10aClosed: passed,
  };
}

function buildOro10bContinuityGateRecord(overrides = {}) {
  const safetyEvidence = buildOro10bSafetySummary();
  const continuityEvidence = {
    phase: ORO10B_PHASE,
    continuityGateStatus: ORO10B_STATUS,
    continuityGateScope: ORO10B_SCOPE,
    ...safetyEvidence,
    [NEXT_STEP_KEY]: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const baseline = {
    id: "validOro10bContinuityGateFromOro10aFixture",
    oro10aPredecessorEvidence: buildOro10bOro10aPredecessorEvidence(),
    continuityGateEvidence: continuityEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10bContinuityGateRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.oro10aPredecessorEvidence) ? merged.oro10aPredecessorEvidence : {};
  const continuity = isPlainObject(merged.continuityGateEvidence) ? merged.continuityGateEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const continuitySources = [merged, continuity];
  const safetySources = [merged, safety, continuity, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(continuitySources, "phase", ORO10B_PHASE),
    continuityGateStatus: readStringFrom(continuitySources, "continuityGateStatus", ORO10B_STATUS),
    continuityGateScope: readStringFrom(continuitySources, "continuityGateScope", ORO10B_SCOPE),
    [DEPENDS_ON_ORO10A_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10A_KEY, true),
    [ORO10A_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10A_PASSED_KEY, true),
    [VERIFIED_ORO10A_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10A_ONLY_KEY, true),
    oro10aStatus: readStringFrom(predecessorSources, "oro10aStatus", ORO_10A_STATUS),
    oro10aScope: readStringFrom(predecessorSources, "oro10aScope", ORO_10A_SCOPE),
    oro10aClosed: readBooleanFrom(predecessorSources, "oro10aClosed", true),
    [NEXT_STEP_KEY]: readBooleanFrom(continuitySources, NEXT_STEP_KEY, true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      continuitySources,
      "nextStepRequiresSeparateRuntimeApproval",
      true
    ),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (fixture.phase !== ORO10B_PHASE) blockers.push("invalid_oro10b_phase");
  if (!fixture[DEPENDS_ON_ORO10A_KEY] || !fixture[ORO10A_PASSED_KEY] || !fixture[VERIFIED_ORO10A_ONLY_KEY]) {
    blockers.push("missing_oro10a_predecessor");
  }
  if (!fixture.oro10aClosed || !fixture.oro10aPredecessorPresent) blockers.push("oro10a_closed_predecessor_required");
  if (fixture.oro10aStatus !== ORO_10A_STATUS) blockers.push("invalid_oro10a_status");
  if (fixture.oro10aScope !== ORO_10A_SCOPE) blockers.push("invalid_oro10a_scope");
  if (fixture.continuityGateStatus !== ORO10B_STATUS) blockers.push("invalid_oro10b_status");
  if (fixture.continuityGateScope !== ORO10B_SCOPE) blockers.push("invalid_oro10b_scope");
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10b`);
  if (!fixture[NEXT_STEP_KEY]) blockers.push("next_step_requires_separate_continuity_approval");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10B_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10B_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10A_KEY]: pass && fixture[DEPENDS_ON_ORO10A_KEY],
    [ORO10A_PASSED_KEY]: pass && fixture[ORO10A_PASSED_KEY],
    [VERIFIED_ORO10A_ONLY_KEY]: pass && fixture[VERIFIED_ORO10A_ONLY_KEY],
    oro10aStatus: pass ? fixture.oro10aStatus : HOLD,
    oro10aScope: pass ? fixture.oro10aScope : HOLD,
    oro10aClosed: pass && fixture.oro10aClosed,
    continuityGateStatus: pass ? fixture.continuityGateStatus : HOLD,
    continuityGateScope: pass ? fixture.continuityGateScope : HOLD,
    [NEXT_STEP_KEY]: pass && fixture[NEXT_STEP_KEY],
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10bContinuityGate(input = buildOro10bContinuityGateRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10bContinuityGate(input = {}) {
  return evaluateOro10bContinuityGate(input);
}

function buildOro10bContinuityGateRecordResult(overrides = {}) {
  return validateOro10bContinuityGate(buildOro10bContinuityGateRecord(overrides));
}

module.exports = {
  ORO10B_PHASE,
  ORO10B_SCOPE,
  ORO10B_STATUS,
  ORO10B_RESULT_KEY,
  DEPENDS_ON_ORO10A_KEY,
  ORO10A_PASSED_KEY,
  VERIFIED_ORO10A_ONLY_KEY,
  NEXT_STEP_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10bSafetySummary,
  buildOro10bOro10aPredecessorEvidence,
  buildOro10bContinuityGateRecord,
  buildOro10bContinuityGateRecordResult,
  evaluateOro10bContinuityGate,
  validateOro10bContinuityGate,
};
