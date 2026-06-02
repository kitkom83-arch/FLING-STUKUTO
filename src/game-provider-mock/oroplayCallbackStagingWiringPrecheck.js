"use strict";

const {
  assertOroplayRuntimeRemainsDisabled,
  evaluateOroplayRuntimeDisabledGate,
} = require("./oroplayCallbackRuntimeDisabledGate");
const {
  executeOroplayCallbackRuntimeSkeleton,
  validateOroplayCallbackRuntimeImplementationSkeleton,
} = require("./oroplayCallbackRuntimeImplementationSkeleton");

const OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS = Object.freeze({
  phase: "ORO-4B",
  status: "callback staging wiring precheck",
  defaultState: "fail_closed",
  certifiedMockState: "staging_precheck_ready",
  activationAllowed: false,
  runtimeWiredToLiveRoute: false,
  aliasBalanceEnabled: false,
  aliasTransactionEnabled: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  externalNetworkAllowed: false,
  productionConfigTouched: false,
});

const REQUIRED_FUTURE_ENV_NAMES = Object.freeze([
  "OROPLAY_CALLBACK_RUNTIME_MODE",
  "OROPLAY_CALLBACK_BASIC_USER",
  "OROPLAY_CALLBACK_BASIC_SECRET",
  "OROPLAY_RUNTIME_CERTIFIED",
  "OROPLAY_ENABLE_PUBLIC_ALIASES",
]);

const CERTIFICATION_GATES = Object.freeze([
  "oro4aSkeletonPassed",
  "oro4bPrecheckReviewed",
  "stagingOnlyApprovalRecorded",
  "rollbackKillSwitchDefined",
  "sanitizedAuditLogApproved",
  "walletLedgerDryRunRequired",
  "reconciliationGuardRequired",
  "manualApprovalRequired",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function buildRequiredFutureEnvNameList() {
  return REQUIRED_FUTURE_ENV_NAMES.map((name) => ({
    name,
    envNameOnly: true,
    valueRead: false,
    valueDisplayed: false,
  }));
}

function normalizeCertificationInput(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const certification = isPlainObject(candidate.certification) ? candidate.certification : candidate;

  return {
    oro4aSkeletonPassed:
      certification.oro4aSkeletonPassed === true || candidate.certificationMockPresent === true,
    oro4bPrecheckReviewed: certification.oro4bPrecheckReviewed === true,
    stagingOnlyApprovalRecorded: certification.stagingOnlyApprovalRecorded === true,
    rollbackKillSwitchDefined: certification.rollbackKillSwitchDefined === true,
    sanitizedAuditLogApproved: certification.sanitizedAuditLogApproved === true,
    walletLedgerDryRunRequired: certification.walletLedgerDryRunRequired === true,
    reconciliationGuardRequired: certification.reconciliationGuardRequired === true,
    manualApprovalRequired: certification.manualApprovalRequired === true || certification.explicitApproval === true,
  };
}

function missingCertificationGates(gates) {
  return CERTIFICATION_GATES.filter((gate) => gates[gate] !== true);
}

function buildOroplayRuntimeSkeletonCertification(input = {}) {
  const gateEvidence = normalizeCertificationInput(input);
  const missingGates = missingCertificationGates(gateEvidence);
  const oro4aValidation = validateOroplayCallbackRuntimeImplementationSkeleton();
  const runtimeGate = evaluateOroplayRuntimeDisabledGate({
    runtimeFlag: "enabled",
    certificationMockPresent: gateEvidence.oro4aSkeletonPassed,
  });
  const skeletonExecution = executeOroplayCallbackRuntimeSkeleton({
    runtimeFlag: "enabled",
    certificationMockPresent: gateEvidence.oro4aSkeletonPassed,
  });
  const certificationReady =
    oro4aValidation.ok === true &&
    missingGates.length === 0 &&
    runtimeGate.decision === "staging_ready_only" &&
    skeletonExecution.decision === "staging_ready_only";

  return {
    phase: OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.phase,
    scope: "runtime skeleton certification",
    defaultState: OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.defaultState,
    certificationState: certificationReady ? "staging_precheck_ready" : "fail_closed",
    certificationReady,
    activationAllowed: false,
    runtimeWiredToLiveRoute: false,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    productionConfigTouched: false,
    envValuesRead: false,
    envValuesDisplayed: false,
    requiredFutureEnvNames: buildRequiredFutureEnvNameList(),
    gateEvidence,
    missingGates,
    oro4aValidationOk: oro4aValidation.ok,
    runtimeGateDecision: runtimeGate.decision,
    skeletonExecutionDecision: skeletonExecution.decision,
  };
}

function buildOroplayStagingActivationBlockers(input = {}) {
  const certification = buildOroplayRuntimeSkeletonCertification(input);
  const blockers = [
    "manual approval before future staging wiring is required",
    "runtime skeleton remains disconnected from live routes",
    "public provider-compatible aliases remain disabled",
    "wallet and ledger mutation remain blocked",
    "Prisma write and DB transaction remain blocked",
    "external network and live provider call remain blocked",
    "production config must stay untouched",
    "rollback kill switch evidence is required before any future activation",
  ];

  for (const gate of certification.missingGates) {
    blockers.push(`missing certification gate: ${gate}`);
  }

  return blockers;
}

function buildOroplayStagingWiringPrecheck(input = {}) {
  const certification = buildOroplayRuntimeSkeletonCertification(input);
  const precheckReady = certification.certificationReady === true;

  return {
    phase: OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.phase,
    status: OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.status,
    precheckOnly: true,
    defaultState: OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.defaultState,
    precheckState: precheckReady ? "staging_precheck_ready" : "fail_closed",
    certifiedMockState: precheckReady ? "staging_precheck_ready" : "not_certified",
    activationAllowed: false,
    runtimeWiredToLiveRoute: false,
    oro2bFailClosedPreserved: true,
    oro4aDisabledGatePreserved: true,
    aliasBalanceEnabled: false,
    aliasTransactionEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    productionConfigTouched: false,
    envValuesRead: false,
    envValuesDisplayed: false,
    requiredFutureEnvNames: certification.requiredFutureEnvNames,
    certification,
    activationBlockers: buildOroplayStagingActivationBlockers(input),
  };
}

function assertFalseFlag(result, flagName) {
  if (result[flagName] !== false) throw new Error(`OroPlay ORO-4B must keep ${flagName}=false.`);
}

function assertOroplayRuntimeSkeletonStillDisabled(input = {}) {
  assertOroplayRuntimeRemainsDisabled(input);
  const result = buildOroplayStagingWiringPrecheck(input);

  assertFalseFlag(result, "activationAllowed");
  assertFalseFlag(result, "runtimeWiredToLiveRoute");
  if (result.precheckState !== "fail_closed" && result.precheckState !== "staging_precheck_ready") {
    throw new Error("OroPlay ORO-4B precheck state must stay fail_closed or staging_precheck_ready.");
  }

  return result;
}

function assertOroplayNoLiveRouteWiring(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  assertFalseFlag(result, "runtimeWiredToLiveRoute");
  if (result.oro2bFailClosedPreserved !== true) {
    throw new Error("OroPlay ORO-4B must preserve the ORO-2B fail-closed route.");
  }
  return result;
}

function assertOroplayNoAliasEnabled(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  assertFalseFlag(result, "aliasBalanceEnabled");
  assertFalseFlag(result, "aliasTransactionEnabled");
  return result;
}

function assertOroplayNoWalletLedgerMutation(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  assertFalseFlag(result, "walletMutationAllowed");
  assertFalseFlag(result, "ledgerMutationAllowed");
  return result;
}

function assertOroplayNoPrismaWrite(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  assertFalseFlag(result, "prismaWriteAllowed");
  return result;
}

function assertOroplayNoExternalNetwork(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  assertFalseFlag(result, "externalNetworkAllowed");
  return result;
}

function validateOroplayRuntimeSkeletonCertification(input = {}) {
  const result = buildOroplayRuntimeSkeletonCertification(input);
  const errors = [];

  if (result.defaultState !== "fail_closed") errors.push("defaultState must be fail_closed.");
  if (result.certificationReady && result.certificationState !== "staging_precheck_ready") {
    errors.push("certified mock state must be staging_precheck_ready.");
  }
  if (!result.certificationReady && result.certificationState !== "fail_closed") {
    errors.push("uncertified state must fail closed.");
  }
  if (result.activationAllowed !== false) errors.push("activationAllowed must remain false.");
  if (result.runtimeWiredToLiveRoute !== false) errors.push("runtimeWiredToLiveRoute must remain false.");
  if (result.aliasBalanceEnabled !== false) errors.push("aliasBalanceEnabled must remain false.");
  if (result.aliasTransactionEnabled !== false) errors.push("aliasTransactionEnabled must remain false.");
  if (result.walletMutationAllowed !== false) errors.push("walletMutationAllowed must remain false.");
  if (result.ledgerMutationAllowed !== false) errors.push("ledgerMutationAllowed must remain false.");
  if (result.prismaWriteAllowed !== false) errors.push("prismaWriteAllowed must remain false.");
  if (result.externalNetworkAllowed !== false) errors.push("externalNetworkAllowed must remain false.");
  if (result.productionConfigTouched !== false) errors.push("productionConfigTouched must remain false.");
  if (result.envValuesRead !== false) errors.push("envValuesRead must remain false.");
  if (result.envValuesDisplayed !== false) errors.push("envValuesDisplayed must remain false.");

  for (const envItem of result.requiredFutureEnvNames) {
    if (!envItem.name || envItem.envNameOnly !== true || envItem.valueRead !== false || envItem.valueDisplayed !== false) {
      errors.push("future env names must be names only and must not expose values.");
    }
  }

  return { ok: errors.length === 0, errors, result };
}

function validateOroplayStagingWiringPrecheck(input = {}) {
  const result = buildOroplayStagingWiringPrecheck(input);
  const certification = validateOroplayRuntimeSkeletonCertification(input);
  const errors = certification.errors.slice();

  if (result.precheckOnly !== true) errors.push("precheckOnly must be true.");
  if (result.defaultState !== "fail_closed") errors.push("precheck defaultState must be fail_closed.");
  if (result.precheckState !== "fail_closed" && result.precheckState !== "staging_precheck_ready") {
    errors.push("precheckState must be fail_closed or staging_precheck_ready only.");
  }
  if (result.precheckState === "staging_precheck_ready" && result.activationAllowed !== false) {
    errors.push("staging_precheck_ready must not allow activation.");
  }
  if (result.oro2bFailClosedPreserved !== true) errors.push("ORO-2B fail-closed route must be preserved.");
  if (result.oro4aDisabledGatePreserved !== true) errors.push("ORO-4A disabled gate must be preserved.");
  if (!Array.isArray(result.activationBlockers) || result.activationBlockers.length === 0) {
    errors.push("activation blockers must be listed.");
  }

  return { ok: errors.length === 0, errors, result };
}

module.exports = {
  OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS,
  buildOroplayRuntimeSkeletonCertification,
  buildOroplayStagingWiringPrecheck,
  validateOroplayRuntimeSkeletonCertification,
  validateOroplayStagingWiringPrecheck,
  assertOroplayRuntimeSkeletonStillDisabled,
  assertOroplayNoLiveRouteWiring,
  assertOroplayNoAliasEnabled,
  assertOroplayNoWalletLedgerMutation,
  assertOroplayNoPrismaWrite,
  assertOroplayNoExternalNetwork,
  buildOroplayStagingActivationBlockers,
};
