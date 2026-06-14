"use strict";

const {
  HOLD,
  ORO10B_SCOPE,
  ORO10B_STATUS,
  PASS,
  buildOro10bContinuityGateRecord,
  validateOro10bContinuityGate,
} = require("./oro10bApprovalChainRolloverContinuityGate");

const ORO10C_PHASE = "ORO-10C";
const ORO10C_SCOPE = "approval_chain_rollover_evidence_gate_only";
const ORO10C_STATUS = "approval_chain_rollover_evidence_gate_passed_for_static_contract_only";
const ORO10C_RESULT_KEY = "approvalChainRolloverEvidenceGateResult";
const DEPENDS_ON_ORO10A_KEY = "dependsOnOro10aApprovalChainRolloverBoundary";
const DEPENDS_ON_ORO10B_KEY = "dependsOnOro10bApprovalChainRolloverContinuityGate";
const ORO10A_PASSED_KEY = "oro10aApprovalChainRolloverBoundaryPassed";
const ORO10B_PASSED_KEY = "oro10bApprovalChainRolloverContinuityGatePassed";
const VERIFIED_ORO10B_ONLY_KEY = "verifiedOro10bWasContinuityGateOnly";
const NEXT_PHASE_KEY = "nextPhaseSeparateApprovalRequired";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "oro10aPredecessorPresent",
  "oro10bPredecessorPresent",
  "continuationFromOro10bConfirmed",
  "approvalChainRolloverEvidenceGatePresent",
  "evidenceRecordPresent",
  "evidenceReviewPrepared",
  "evidenceReviewIssued",
  "evidenceReviewPassed",
  "evidenceReviewRecorded",
  "oro10cShortFilenameConfirmed",
  "noLongFilenameConfirmed",
  "localTargetedValidationRequired",
  "safeCiRequiredAfterCommitPushForCloseoutOnly",
  "approvalChainRolloverStillInSafetyGateChain",
  "docsStaticMockLocalSmokeOnly",
  "verifiedNoSignedRuntimeApprovalOccurred",
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
  "verifiedShortOro10cFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "signedRuntimeApproval",
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

function buildOro10cSafetySummary(overrides = {}) {
  return deepMerge(
    {
      ...flagsFor(REQUIRED_TRUE_FLAGS, true),
      ...flagsFor(REQUIRED_FALSE_FLAGS, false),
    },
    overrides
  );
}

function buildOro10cPredecessorEvidence() {
  const oro10bSummary = validateOro10bContinuityGate(buildOro10bContinuityGateRecord());
  const passed = oro10bSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO10A_KEY]: passed && oro10bSummary.oro10aClosed === true,
    [DEPENDS_ON_ORO10B_KEY]: true,
    [ORO10A_PASSED_KEY]: passed && oro10bSummary.oro10aClosed === true,
    [ORO10B_PASSED_KEY]: passed,
    [VERIFIED_ORO10B_ONLY_KEY]: passed,
    oro10bStatus: passed ? ORO10B_STATUS : HOLD,
    oro10bScope: passed ? ORO10B_SCOPE : HOLD,
    oro10bClosed: passed,
  };
}

function buildOro10cEvidenceGateRecord(overrides = {}) {
  const safetyEvidence = buildOro10cSafetySummary();
  const evidenceGateEvidence = {
    phase: ORO10C_PHASE,
    evidenceGateStatus: ORO10C_STATUS,
    evidenceGateScope: ORO10C_SCOPE,
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    nextStepRequiresSeparateRuntimeApproval: true,
  };
  const baseline = {
    id: "validOro10cEvidenceGateFromOro10bFixture",
    predecessorEvidence: buildOro10cPredecessorEvidence(),
    evidenceGateEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10cEvidenceGateRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const predecessor = isPlainObject(merged.predecessorEvidence) ? merged.predecessorEvidence : {};
  const evidence = isPlainObject(merged.evidenceGateEvidence) ? merged.evidenceGateEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const predecessorSources = [merged, predecessor];
  const evidenceSources = [merged, evidence];
  const safetySources = [merged, safety, evidence, predecessor];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(evidenceSources, "phase", ORO10C_PHASE),
    evidenceGateStatus: readStringFrom(evidenceSources, "evidenceGateStatus", ORO10C_STATUS),
    evidenceGateScope: readStringFrom(evidenceSources, "evidenceGateScope", ORO10C_SCOPE),
    [DEPENDS_ON_ORO10A_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10A_KEY, true),
    [DEPENDS_ON_ORO10B_KEY]: readBooleanFrom(predecessorSources, DEPENDS_ON_ORO10B_KEY, true),
    [ORO10A_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10A_PASSED_KEY, true),
    [ORO10B_PASSED_KEY]: readBooleanFrom(predecessorSources, ORO10B_PASSED_KEY, true),
    [VERIFIED_ORO10B_ONLY_KEY]: readBooleanFrom(predecessorSources, VERIFIED_ORO10B_ONLY_KEY, true),
    oro10bStatus: readStringFrom(predecessorSources, "oro10bStatus", ORO10B_STATUS),
    oro10bScope: readStringFrom(predecessorSources, "oro10bScope", ORO10B_SCOPE),
    oro10bClosed: readBooleanFrom(predecessorSources, "oro10bClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(evidenceSources, NEXT_PHASE_KEY, true),
    nextStepRequiresSeparateRuntimeApproval: readBooleanFrom(
      evidenceSources,
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
  if (fixture.phase !== ORO10C_PHASE) blockers.push("invalid_oro10c_phase");
  if (!fixture[DEPENDS_ON_ORO10A_KEY] || !fixture[ORO10A_PASSED_KEY] || !fixture.oro10aPredecessorPresent) {
    blockers.push("missing_oro10a_predecessor");
  }
  if (!fixture[DEPENDS_ON_ORO10B_KEY] || !fixture[ORO10B_PASSED_KEY] || !fixture[VERIFIED_ORO10B_ONLY_KEY]) {
    blockers.push("missing_oro10b_predecessor");
  }
  if (!fixture.oro10bClosed || !fixture.oro10bPredecessorPresent) blockers.push("oro10b_closed_predecessor_required");
  if (fixture.oro10bStatus !== ORO10B_STATUS) blockers.push("invalid_oro10b_status");
  if (fixture.oro10bScope !== ORO10B_SCOPE) blockers.push("invalid_oro10b_scope");
  if (fixture.evidenceGateStatus !== ORO10C_STATUS) blockers.push("invalid_oro10c_status");
  if (fixture.evidenceGateScope !== ORO10C_SCOPE) blockers.push("invalid_oro10c_scope");
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10c`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_separate_approval_required");
  if (!fixture.nextStepRequiresSeparateRuntimeApproval) blockers.push("next_step_requires_separate_runtime_approval");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO10C_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10C_RESULT_KEY]: result,
    [DEPENDS_ON_ORO10A_KEY]: pass && fixture[DEPENDS_ON_ORO10A_KEY],
    [DEPENDS_ON_ORO10B_KEY]: pass && fixture[DEPENDS_ON_ORO10B_KEY],
    [ORO10A_PASSED_KEY]: pass && fixture[ORO10A_PASSED_KEY],
    [ORO10B_PASSED_KEY]: pass && fixture[ORO10B_PASSED_KEY],
    [VERIFIED_ORO10B_ONLY_KEY]: pass && fixture[VERIFIED_ORO10B_ONLY_KEY],
    oro10bStatus: pass ? fixture.oro10bStatus : HOLD,
    oro10bScope: pass ? fixture.oro10bScope : HOLD,
    oro10bClosed: pass && fixture.oro10bClosed,
    evidenceGateStatus: pass ? fixture.evidenceGateStatus : HOLD,
    evidenceGateScope: pass ? fixture.evidenceGateScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    nextStepRequiresSeparateRuntimeApproval: pass && fixture.nextStepRequiresSeparateRuntimeApproval,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10cEvidenceGate(input = buildOro10cEvidenceGateRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10cEvidenceGate(input = {}) {
  return evaluateOro10cEvidenceGate(input);
}

function buildOro10cEvidenceGateRecordResult(overrides = {}) {
  return validateOro10cEvidenceGate(buildOro10cEvidenceGateRecord(overrides));
}

module.exports = {
  ORO10C_PHASE,
  ORO10C_SCOPE,
  ORO10C_STATUS,
  ORO10C_RESULT_KEY,
  DEPENDS_ON_ORO10A_KEY,
  DEPENDS_ON_ORO10B_KEY,
  ORO10A_PASSED_KEY,
  ORO10B_PASSED_KEY,
  VERIFIED_ORO10B_ONLY_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10cSafetySummary,
  buildOro10cPredecessorEvidence,
  buildOro10cEvidenceGateRecord,
  buildOro10cEvidenceGateRecordResult,
  evaluateOro10cEvidenceGate,
  validateOro10cEvidenceGate,
};
