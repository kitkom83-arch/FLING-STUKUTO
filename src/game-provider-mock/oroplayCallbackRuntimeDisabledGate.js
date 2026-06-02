"use strict";

const OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS = Object.freeze({
  phase: "ORO-4A",
  status: "callback runtime implementation skeleton disabled gate",
  defaultState: "disabled_fail_closed",
  runtimeEnabled: false,
  runtimeActive: false,
  productionEnabled: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  aliasEnabled: false,
});

const ENABLED_VALUES = new Set(["true", "enabled", "enable", "on", "1", "yes"]);
const DISABLED_VALUES = new Set(["false", "disabled", "disable", "off", "0", "no", ""]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeRuntimeFlag(value) {
  if (value === undefined || value === null) return { provided: false, state: "missing" };
  if (value === true) return { provided: true, state: "enabled" };
  if (value === false) return { provided: true, state: "disabled" };

  const normalized = String(value).trim().toLowerCase();
  if (ENABLED_VALUES.has(normalized)) return { provided: true, state: "enabled" };
  if (DISABLED_VALUES.has(normalized)) return { provided: true, state: "disabled" };
  return { provided: true, state: "unknown" };
}

function readInjectedRuntimeFlag(candidate) {
  if (Object.prototype.hasOwnProperty.call(candidate, "runtimeFlag")) return candidate.runtimeFlag;
  if (Object.prototype.hasOwnProperty.call(candidate, "runtimeEnabled")) return candidate.runtimeEnabled;

  if (isPlainObject(candidate.config)) {
    if (Object.prototype.hasOwnProperty.call(candidate.config, "runtimeFlag")) return candidate.config.runtimeFlag;
    if (Object.prototype.hasOwnProperty.call(candidate.config, "OROPLAY_CALLBACK_RUNTIME_ENABLED")) {
      return candidate.config.OROPLAY_CALLBACK_RUNTIME_ENABLED;
    }
  }

  if (isPlainObject(candidate.env)) {
    if (Object.prototype.hasOwnProperty.call(candidate.env, "OROPLAY_CALLBACK_RUNTIME_ENABLED")) {
      return candidate.env.OROPLAY_CALLBACK_RUNTIME_ENABLED;
    }
  }

  return undefined;
}

function hasMockCertification(candidate) {
  if (candidate.certificationMockPresent === true) return true;
  if (candidate.certificationPresent === true) return true;
  if (!isPlainObject(candidate.certification)) return false;

  return (
    candidate.certification.oro4aSkeletonPassed === true &&
    candidate.certification.walletLedgerDryRunPassed === true &&
    candidate.certification.reconciliationGuardPassed === true &&
    candidate.certification.auditLogProofPassed === true &&
    candidate.certification.duplicateGuardProofPassed === true &&
    candidate.certification.rollbackProofPassed === true &&
    candidate.certification.explicitApproval === true
  );
}

function buildOroplayRuntimeDisabledGateConfig(input = {}) {
  const candidate = isPlainObject(input) ? input : {};
  const runtimeFlag = normalizeRuntimeFlag(readInjectedRuntimeFlag(candidate));

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS.phase,
    gateStatus: "disabled",
    runtimeFlagProvided: runtimeFlag.provided,
    runtimeFlagState: runtimeFlag.state,
    certificationMockPresent: hasMockCertification(candidate),
    productionEnabledRequested: candidate.productionEnabled === true || candidate.productionRuntimeEnabled === true,
    walletMutationRequested: candidate.walletMutationAllowed === true,
    ledgerMutationRequested: candidate.ledgerMutationAllowed === true,
    prismaWriteRequested: candidate.prismaWriteAllowed === true,
    aliasRequested: candidate.aliasEnabled === true,
  };
}

function buildBlockedReasons(config) {
  const reasons = [];

  if (config.runtimeFlagState === "missing") reasons.push("runtime flag missing; default disabled.");
  if (config.runtimeFlagState === "disabled") reasons.push("runtime flag disabled.");
  if (config.runtimeFlagState === "unknown") reasons.push("runtime flag value is unsupported; fail closed.");
  if (config.runtimeFlagState === "enabled" && config.certificationMockPresent !== true) {
    reasons.push("runtime flag requested but certification evidence is missing.");
  }
  if (config.productionEnabledRequested) reasons.push("production runtime request is forbidden in ORO-4A.");
  if (config.walletMutationRequested) reasons.push("wallet mutation request is forbidden in ORO-4A.");
  if (config.ledgerMutationRequested) reasons.push("ledger mutation request is forbidden in ORO-4A.");
  if (config.prismaWriteRequested) reasons.push("Prisma write request is forbidden in ORO-4A.");
  if (config.aliasRequested) reasons.push("provider-compatible alias request is forbidden in ORO-4A.");

  return reasons;
}

function evaluateOroplayRuntimeDisabledGate(input = {}) {
  const config = buildOroplayRuntimeDisabledGateConfig(input);
  const blockedReasons = buildBlockedReasons(config);
  const decision =
    config.runtimeFlagState === "enabled" && config.certificationMockPresent === true && blockedReasons.length === 0
      ? "staging_ready_only"
      : config.runtimeFlagState === "disabled" || config.runtimeFlagState === "missing"
        ? "disabled"
        : "fail_closed";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS.phase,
    status: OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS.status,
    gateStatus: "disabled",
    decision,
    runtimeState: decision === "staging_ready_only" ? "staging_ready_only_runtime_inactive" : "disabled_fail_closed",
    runtimeFlagProvided: config.runtimeFlagProvided,
    runtimeFlagState: config.runtimeFlagState,
    certificationMockPresent: config.certificationMockPresent,
    blockedReasons,
    runtimeEnabled: false,
    runtimeActive: false,
    productionEnabled: false,
    productionRuntimeState: "blocked",
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    aliasEnabled: false,
    balanceAliasEnabled: false,
    transactionAliasEnabled: false,
    liveOroplayRuntimeAllowed: false,
    externalNetworkAllowed: false,
    failClosed: decision !== "staging_ready_only",
    stagingReadyOnly: decision === "staging_ready_only",
  };
}

function assertOroplayRuntimeRemainsDisabled(input = {}) {
  const result = evaluateOroplayRuntimeDisabledGate(input);
  const unsafeFlags = [
    "runtimeEnabled",
    "runtimeActive",
    "productionEnabled",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "aliasEnabled",
    "balanceAliasEnabled",
    "transactionAliasEnabled",
    "liveOroplayRuntimeAllowed",
    "externalNetworkAllowed",
  ];

  if (result.decision === "production_enabled") {
    throw new Error("OroPlay callback runtime gate must never return production_enabled.");
  }

  for (const flag of unsafeFlags) {
    if (result[flag] !== false) throw new Error(`OroPlay callback runtime gate must keep ${flag}=false.`);
  }

  return result;
}

function buildOroplayRuntimeDisabledGateSummary(input = {}) {
  const result = evaluateOroplayRuntimeDisabledGate(input);
  return {
    phase: result.phase,
    gateStatus: result.gateStatus,
    decision: result.decision,
    runtimeState: result.runtimeState,
    runtimeFlagProvided: result.runtimeFlagProvided,
    runtimeFlagState: result.runtimeFlagState,
    certificationMockPresent: result.certificationMockPresent,
    runtimeEnabled: result.runtimeEnabled,
    runtimeActive: result.runtimeActive,
    productionEnabled: result.productionEnabled,
    walletMutationAllowed: result.walletMutationAllowed,
    ledgerMutationAllowed: result.ledgerMutationAllowed,
    prismaWriteAllowed: result.prismaWriteAllowed,
    aliasEnabled: result.aliasEnabled,
    blockedReasons: result.blockedReasons.slice(),
  };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_DISABLED_GATE_STATUS,
  buildOroplayRuntimeDisabledGateConfig,
  evaluateOroplayRuntimeDisabledGate,
  assertOroplayRuntimeRemainsDisabled,
  buildOroplayRuntimeDisabledGateSummary,
};
