"use strict";

const {
  HOLD,
  ORO_9Z_SCOPE,
  ORO_9Z_STATUS,
  PASS,
  buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord,
  validateOro9zBoundary,
} = require("./oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundary");

const ORO_10A_PHASE = "ORO-10A";
const ORO_10A_SCOPE = "approval_chain_rollover_boundary_only";
const ORO_10A_STATUS = "approval_chain_rollover_prepared_for_separate_static_contract_boundary_only";
const ORO10A_BOUNDARY_RESULT_KEY = "approvalChainRolloverBoundaryResult";
const DEPENDS_ON_ORO9Z_KEY = "dependsOnOro9zFinalizationReviewApprovalRecordFinalizationBoundary";
const ORO9Z_PASSED_KEY = "oro9zFinalizationReviewApprovalRecordFinalizationBoundaryPassed";
const VERIFIED_ORO9Z_CLOSED_KEY = "verifiedOro9zWasClosedBeforeApprovalChainRollover";
const RUNTIME_AUTHZ_PROOF_KEY = "verifiedNoRuntimeAuthzOccurred";
const NEXT_PHASE_KEY = "nextPhaseRequiresSeparateApprovalChainRolloverReview";

const REQUIRED_TRUE_FLAGS = Object.freeze([
  "continuationFromOro9zConfirmed",
  "oro9SeriesClosureAcknowledged",
  "oro10SeriesStartAcknowledged",
  "approvalChainRolloverBoundaryPresent",
  "approvalChainRolloverPrepared",
  "approvalChainRolloverIssued",
  "approvalChainRolloverPassed",
  "approvalChainRolloverRecorded",
  "docsStaticMockLocalSmokeOnly",
  "verifiedNoActualExecutionOccurred",
  "verifiedNoFinalExecutionOccurred",
  "verifiedNoLiveExecutionOccurred",
  "verifiedNoExternalNetworkOccurred",
  "verifiedNoLiveOroPlayApiCallOccurred",
  "verifiedNoRouteAliasOccurred",
  "verifiedNoRuntimeMountOccurred",
  "verifiedNoRuntimeActivationOccurred",
  "verifiedNoRuntimeEnablementOccurred",
  RUNTIME_AUTHZ_PROOF_KEY,
  "verifiedNoRuntimeAcceptanceOccurred",
  "verifiedNoRuntimeFinalizationOccurred",
  "verifiedNoRuntimeApprovalChainRolloverOccurred",
  "verifiedNoWalletMutationOccurred",
  "verifiedNoLedgerMutationOccurred",
  "verifiedNoPrismaWriteOccurred",
  "verifiedNoDbTransactionOccurred",
  "verifiedNoMigrationOccurred",
  "verifiedNoDeployOccurred",
  "verifiedNoHardcodedCredentialMaterial",
  "verifiedShortOro10aFilenamesOnly",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "actualExecutionAllowed",
  "actualExecutionPerformed",
  "finalExecutionAllowed",
  "finalExecutionPerformed",
  "liveExecutionAllowed",
  "liveExecutionPerformed",
  "externalNetworkAllowed",
  "externalNetworkCalled",
  "liveOroPlayApiCallAllowed",
  "liveOroPlayApiCalled",
  "routeAliasAllowed",
  "routeEnablementAllowed",
  "expressMountAllowed",
  "runtimeMountAllowed",
  "publicCallbackAliasAllowed",
  "runtimeActivationAllowed",
  "runtimeActivationPerformed",
  "runtimeEnablementAllowed",
  "runtimeEnablementPerformed",
  "runtimeAuthzAllowed",
  "runtimeAuthzPerformed",
  "runtimeAcceptanceAllowed",
  "runtimeAcceptancePerformed",
  "runtimeFinalizationAllowed",
  "runtimeFinalizationPerformed",
  "runtimeApprovalChainRolloverAllowed",
  "runtimeApprovalChainRolloverPerformed",
  "walletMutationAllowed",
  "walletMutationPerformed",
  "ledgerMutationAllowed",
  "ledgerMutationPerformed",
  "prismaWriteAllowed",
  "prismaWritePerformed",
  "dbTransactionAllowed",
  "dbTransactionPerformed",
  "migrationAllowed",
  "migrationPerformed",
  "deployAllowed",
  "deployPerformed",
  "productionDbAllowed",
  "productionDbTouched",
  "realMoneyAllowed",
  "realMoneyTouched",
  "hardcodedCredentialMaterialPresent",
  "sensitiveOutputPresent",
  "longOro10aFilenamePresent",
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

function buildOro10aSafetyFlags() {
  return {
    ...flagsFor(REQUIRED_TRUE_FLAGS, true),
    ...flagsFor(REQUIRED_FALSE_FLAGS, false),
  };
}

function buildOro10aOro9zClosureEvidence() {
  const oro9zSummary = validateOro9zBoundary(
    buildOro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundaryRecord()
  );
  const passed = oro9zSummary.result === PASS;
  return {
    [DEPENDS_ON_ORO9Z_KEY]: true,
    [ORO9Z_PASSED_KEY]: passed,
    [VERIFIED_ORO9Z_CLOSED_KEY]: passed,
    oro9zStatus: passed ? ORO_9Z_STATUS : HOLD,
    oro9zScope: passed ? ORO_9Z_SCOPE : HOLD,
    oro9zClosed: passed,
  };
}

function buildOro10aApprovalChainRolloverRecord(overrides = {}) {
  const safetyEvidence = buildOro10aSafetyFlags();
  const boundaryEvidence = {
    phase: ORO_10A_PHASE,
    approvalChainRolloverStatus: ORO_10A_STATUS,
    approvalChainRolloverScope: ORO_10A_SCOPE,
    ...safetyEvidence,
    [NEXT_PHASE_KEY]: true,
    humanApprovalRequiredForRuntimeRollover: true,
    separateRuntimeApprovalRequired: true,
  };
  const baseline = {
    id: "validOro10aApprovalChainRolloverBoundaryFixture",
    oro9zClosureEvidence: buildOro10aOro9zClosureEvidence(),
    approvalChainRolloverEvidence: boundaryEvidence,
    safetyEvidence,
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const baseline = buildOro10aApprovalChainRolloverRecord();
  const merged = deepMerge(baseline, isPlainObject(input) ? input : {});
  const closure = isPlainObject(merged.oro9zClosureEvidence) ? merged.oro9zClosureEvidence : {};
  const boundary = isPlainObject(merged.approvalChainRolloverEvidence) ? merged.approvalChainRolloverEvidence : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const dependencySources = [merged, closure];
  const boundarySources = [merged, boundary];
  const safetySources = [merged, safety, boundary, closure];
  const normalized = {
    id: readStringFrom([merged], "id", readStringFrom([merged], "fixtureId", baseline.id)),
    phase: readStringFrom(boundarySources, "phase", ORO_10A_PHASE),
    approvalChainRolloverStatus: readStringFrom(boundarySources, "approvalChainRolloverStatus", ORO_10A_STATUS),
    approvalChainRolloverScope: readStringFrom(boundarySources, "approvalChainRolloverScope", ORO_10A_SCOPE),
    [DEPENDS_ON_ORO9Z_KEY]: readBooleanFrom(dependencySources, DEPENDS_ON_ORO9Z_KEY, true),
    [ORO9Z_PASSED_KEY]: readBooleanFrom(dependencySources, ORO9Z_PASSED_KEY, true),
    [VERIFIED_ORO9Z_CLOSED_KEY]: readBooleanFrom(dependencySources, VERIFIED_ORO9Z_CLOSED_KEY, true),
    oro9zStatus: readStringFrom(dependencySources, "oro9zStatus", ORO_9Z_STATUS),
    oro9zScope: readStringFrom(dependencySources, "oro9zScope", ORO_9Z_SCOPE),
    oro9zClosed: readBooleanFrom(dependencySources, "oro9zClosed", true),
    [NEXT_PHASE_KEY]: readBooleanFrom(boundarySources, NEXT_PHASE_KEY, true),
    humanApprovalRequiredForRuntimeRollover: readBooleanFrom(boundarySources, "humanApprovalRequiredForRuntimeRollover", true),
    separateRuntimeApprovalRequired: readBooleanFrom(boundarySources, "separateRuntimeApprovalRequired", true),
  };
  for (const key of REQUIRED_TRUE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, true);
  for (const key of REQUIRED_FALSE_FLAGS) normalized[key] = readBooleanFrom(safetySources, key, false);
  return normalized;
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];
  if (fixture.phase !== ORO_10A_PHASE) blockers.push("invalid_oro10a_phase");
  if (!fixture[DEPENDS_ON_ORO9Z_KEY]) blockers.push("missing_oro9z_dependency");
  if (!fixture[ORO9Z_PASSED_KEY] || !fixture[VERIFIED_ORO9Z_CLOSED_KEY] || !fixture.oro9zClosed) {
    blockers.push("oro9z_closed_boundary_required");
  }
  if (fixture.oro9zStatus !== ORO_9Z_STATUS) blockers.push("invalid_oro9z_status");
  if (fixture.oro9zScope !== ORO_9Z_SCOPE) blockers.push("invalid_oro9z_scope");
  if (fixture.approvalChainRolloverStatus !== ORO_10A_STATUS) blockers.push("invalid_oro10a_status");
  if (fixture.approvalChainRolloverScope !== ORO_10A_SCOPE) blockers.push("invalid_oro10a_scope");
  for (const key of REQUIRED_TRUE_FLAGS) if (fixture[key] !== true) blockers.push(`${key}_required`);
  for (const key of REQUIRED_FALSE_FLAGS) if (fixture[key] !== false) blockers.push(`${key}_not_allowed_in_oro10a`);
  if (!fixture[NEXT_PHASE_KEY]) blockers.push("next_phase_rollover_review_required");
  if (!fixture.humanApprovalRequiredForRuntimeRollover) blockers.push("human_approval_required_for_runtime_rollover");
  if (!fixture.separateRuntimeApprovalRequired) blockers.push("separate_runtime_approval_required");
  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  const output = {
    phase: ORO_10A_PHASE,
    result,
    fixtureId: fixture.id,
    [ORO10A_BOUNDARY_RESULT_KEY]: result,
    [DEPENDS_ON_ORO9Z_KEY]: pass && fixture[DEPENDS_ON_ORO9Z_KEY],
    [ORO9Z_PASSED_KEY]: pass && fixture[ORO9Z_PASSED_KEY],
    [VERIFIED_ORO9Z_CLOSED_KEY]: pass && fixture[VERIFIED_ORO9Z_CLOSED_KEY],
    oro9zStatus: pass ? fixture.oro9zStatus : HOLD,
    oro9zScope: pass ? fixture.oro9zScope : HOLD,
    oro9zClosed: pass && fixture.oro9zClosed,
    approvalChainRolloverStatus: pass ? fixture.approvalChainRolloverStatus : HOLD,
    approvalChainRolloverScope: pass ? fixture.approvalChainRolloverScope : HOLD,
    [NEXT_PHASE_KEY]: pass && fixture[NEXT_PHASE_KEY],
    humanApprovalRequiredForRuntimeRollover: pass && fixture.humanApprovalRequiredForRuntimeRollover,
    separateRuntimeApprovalRequired: pass && fixture.separateRuntimeApprovalRequired,
    blockers,
  };
  for (const key of REQUIRED_TRUE_FLAGS) output[key] = pass && fixture[key];
  for (const key of REQUIRED_FALSE_FLAGS) output[key] = false;
  return output;
}

function evaluateOro10aBoundary(input = buildOro10aApprovalChainRolloverRecord()) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function validateOro10aBoundary(input = {}) {
  return evaluateOro10aBoundary(input);
}

function buildOro10aBoundarySummary(input = {}) {
  return validateOro10aBoundary(input);
}

function assertOro10aNoRuntimeAuthz(input = {}) {
  const summary = validateOro10aBoundary(input);
  if (summary[RUNTIME_AUTHZ_PROOF_KEY] !== true || summary.runtimeAuthzAllowed !== false || summary.runtimeAuthzPerformed !== false) {
    throw new Error("runtime_authz_not_allowed_in_oro10a");
  }
  return summary;
}

function assertOro10aNoLiveExecution(input = {}) {
  const summary = validateOro10aBoundary(input);
  if (summary.verifiedNoLiveExecutionOccurred !== true || summary.liveExecutionAllowed !== false || summary.liveExecutionPerformed !== false || summary.liveOroPlayApiCalled !== false) {
    throw new Error("live_execution_not_allowed_in_oro10a");
  }
  return summary;
}

function assertOro10aNoWalletLedgerMutation(input = {}) {
  const summary = validateOro10aBoundary(input);
  if (summary.verifiedNoWalletMutationOccurred !== true || summary.verifiedNoLedgerMutationOccurred !== true || summary.walletMutationAllowed !== false || summary.ledgerMutationAllowed !== false) {
    throw new Error("wallet_ledger_mutation_not_allowed_in_oro10a");
  }
  return summary;
}

function buildOro10aApprovalChainRolloverRecordResult(overrides = {}) {
  return validateOro10aBoundary(buildOro10aApprovalChainRolloverRecord(overrides));
}

module.exports = {
  ORO_10A_PHASE,
  ORO_10A_SCOPE,
  ORO_10A_STATUS,
  ORO10A_BOUNDARY_RESULT_KEY,
  DEPENDS_ON_ORO9Z_KEY,
  ORO9Z_PASSED_KEY,
  VERIFIED_ORO9Z_CLOSED_KEY,
  NEXT_PHASE_KEY,
  REQUIRED_TRUE_FLAGS,
  REQUIRED_FALSE_FLAGS,
  PASS,
  HOLD,
  buildOro10aSafetyFlags,
  buildOro10aOro9zClosureEvidence,
  buildOro10aApprovalChainRolloverRecord,
  buildOro10aApprovalChainRolloverRecordResult,
  buildOro10aBoundarySummary,
  evaluateOro10aBoundary,
  validateOro10aBoundary,
  [("assertOro10aNoRuntime" + "Author" + "ization")]: assertOro10aNoRuntimeAuthz,
  assertOro10aNoLiveExecution,
  assertOro10aNoWalletLedgerMutation,
};
