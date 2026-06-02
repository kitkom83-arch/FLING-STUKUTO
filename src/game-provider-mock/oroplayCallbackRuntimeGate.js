"use strict";

const OROPLAY_CALLBACK_RUNTIME_GATE_STATUS = Object.freeze({
  phase: "ORO-3C",
  status: "no-mutation runtime gate",
  gateStatus: "closed",
  runtimeEnabled: false,
  reason: "ORO-3C is execution-plan-only / no-mutation runtime gate",
  productionDbAllowed: false,
  realMoneyAllowed: false,
  liveOroplayCallAllowed: false,
  externalNetworkAllowed: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  migrationAllowed: false,
  deployAllowed: false,
  payoutAllowed: false,
  autoCreditAllowed: false,
  providerAliasEnabled: false,
});

const DANGEROUS_RUNTIME_FLAGS = Object.freeze([
  "productionDbAllowed",
  "realMoneyAllowed",
  "liveOroplayCallAllowed",
  "externalNetworkAllowed",
  "walletMutationAllowed",
  "ledgerMutationAllowed",
  "prismaWriteAllowed",
  "migrationAllowed",
  "deployAllowed",
  "payoutAllowed",
  "autoCreditAllowed",
  "providerAliasEnabled",
]);

function buildOroplayRuntimeGateInput(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const gateInput = {};

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    gateInput[flag] = candidate[flag] === true;
  }

  return gateInput;
}

function evaluateOroplayRuntimeGate(input = {}) {
  const gateInput = buildOroplayRuntimeGateInput(input);
  const blockedReasons = [];

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    if (gateInput[flag] === true) {
      blockedReasons.push(`${flag} must remain false in ORO-3C.`);
    }
  }

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_GATE_STATUS.phase,
    gateStatus: "closed",
    decision: blockedReasons.length > 0 ? "fail_closed" : "runtime_gate_closed",
    runtimeEnabled: false,
    reason: OROPLAY_CALLBACK_RUNTIME_GATE_STATUS.reason,
    blockedReasons,
    input: gateInput,
    productionDbAllowed: false,
    realMoneyAllowed: false,
    liveOroplayCallAllowed: false,
    externalNetworkAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    migrationAllowed: false,
    deployAllowed: false,
    payoutAllowed: false,
    autoCreditAllowed: false,
    providerAliasEnabled: false,
  };
}

function assertOroplayRuntimeGateClosed(input = {}) {
  const result = evaluateOroplayRuntimeGate(input);
  if (result.gateStatus !== "closed" || result.runtimeEnabled !== false || result.blockedReasons.length > 0) {
    throw new Error(`OroPlay runtime gate blocked: ${result.blockedReasons.join("; ")}`);
  }
  return result;
}

function buildOroplayRuntimeGateSummary(input = {}) {
  const gate = evaluateOroplayRuntimeGate(input);
  return {
    phase: gate.phase,
    gateStatus: gate.gateStatus,
    decision: gate.decision,
    runtimeEnabled: gate.runtimeEnabled,
    reason: gate.reason,
    blockedReasons: gate.blockedReasons.slice(),
    noProductionDb: true,
    noRealMoney: true,
    noLiveOroplayApi: true,
    noExternalNetwork: true,
    noRuntimeWalletMutation: true,
    noRuntimeLedgerMutation: true,
    noPrismaWrite: true,
    noMigration: true,
    noDeploy: true,
    noProviderAliasEnabled: true,
  };
}

function validateOroplayCallbackRuntimeGate() {
  const errors = [];
  const defaultGate = evaluateOroplayRuntimeGate();

  if (defaultGate.gateStatus !== "closed") errors.push("default runtime gate must be closed.");
  if (defaultGate.runtimeEnabled !== false) errors.push("default runtime gate must keep runtimeEnabled false.");
  if (defaultGate.decision !== "runtime_gate_closed") errors.push("default runtime gate decision mismatch.");

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    const gate = evaluateOroplayRuntimeGate({ [flag]: true });
    if (gate.decision !== "fail_closed") errors.push(`${flag} must fail closed when true.`);
    if (gate.blockedReasons.length < 1) errors.push(`${flag} must include blockedReasons.`);
    if (gate[flag] !== false) errors.push(`${flag} result must remain false.`);
    if (gate.runtimeEnabled !== false) errors.push(`${flag} must not enable runtime.`);
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_GATE_STATUS,
  buildOroplayRuntimeGateInput,
  evaluateOroplayRuntimeGate,
  assertOroplayRuntimeGateClosed,
  buildOroplayRuntimeGateSummary,
  validateOroplayCallbackRuntimeGate,
};
