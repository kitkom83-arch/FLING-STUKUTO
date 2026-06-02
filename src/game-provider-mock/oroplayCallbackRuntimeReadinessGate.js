"use strict";

const OROPLAY_CALLBACK_RUNTIME_READINESS_GATE_STATUS = Object.freeze({
  phase: "ORO-3D",
  status: "callback runtime readiness gate / pre-implementation certification only",
  gateStatus: "closed",
  runtimeImplementationAllowed: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  aliasEnablementAllowed: false,
  liveTrafficAllowed: false,
  nextPhaseBlocked: true,
  reason: "ORO-3D is readiness/certification only",
  runtimeEnabled: false,
  mutationAllowed: false,
  prismaWriteAllowed: false,
  providerAliasEnabled: false,
  noProductionDb: true,
  noRealMoney: true,
  noLiveOroplayApi: true,
  noExternalNetwork: true,
});

const REQUIRED_EVIDENCE_FLAGS = Object.freeze([
  "preflightClean",
  "safeCiPassed",
  "oroplay2bFailClosed",
  "oroplay2cReadinessClosed",
  "oroplay3aSimulationClosed",
  "oroplay3bAdapterContractClosed",
  "oroplay3cExecutionPlanClosed",
  "targetedSmokesPassed",
]);

const OPTIONAL_LOCAL_EVIDENCE_FLAGS = Object.freeze(["allLocalSmokePassed"]);

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
  "secretsPresent",
]);

const DEFAULT_GATE_INPUT = Object.freeze({
  preflightClean: true,
  safeCiPassed: true,
  oroplay2bFailClosed: true,
  oroplay2cReadinessClosed: true,
  oroplay3aSimulationClosed: true,
  oroplay3bAdapterContractClosed: true,
  oroplay3cExecutionPlanClosed: true,
  targetedSmokesPassed: true,
  allLocalSmokePassed: false,
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
  secretsPresent: false,
});

function readBoolean(candidate, flag) {
  if (!Object.prototype.hasOwnProperty.call(candidate, flag)) return DEFAULT_GATE_INPUT[flag] === true;
  return candidate[flag] === true;
}

function buildOroplayRuntimeReadinessGateInput(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const gateInput = {};

  for (const flag of REQUIRED_EVIDENCE_FLAGS) {
    gateInput[flag] = readBoolean(candidate, flag);
  }
  for (const flag of OPTIONAL_LOCAL_EVIDENCE_FLAGS) {
    gateInput[flag] = readBoolean(candidate, flag);
  }
  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    gateInput[flag] = readBoolean(candidate, flag);
  }

  return gateInput;
}

function evidenceBlockerFor(flag) {
  const labels = {
    preflightClean: "preflight clean evidence is required before ORO-3E.",
    safeCiPassed: "Safe CI current HEAD success is required before ORO-3E.",
    oroplay2bFailClosed: "ORO-2B fail-closed route evidence is required.",
    oroplay2cReadinessClosed: "ORO-2C readiness closure evidence is required.",
    oroplay3aSimulationClosed: "ORO-3A simulation closure evidence is required.",
    oroplay3bAdapterContractClosed: "ORO-3B adapter contract closure evidence is required.",
    oroplay3cExecutionPlanClosed: "ORO-3C execution plan closure evidence is required.",
    targetedSmokesPassed: "targeted OroPlay smoke evidence is required before ORO-3E.",
  };
  return labels[flag] || `${flag} evidence is required.`;
}

function dangerousBlockerFor(flag) {
  const labels = {
    productionDbAllowed: "production DB must remain blocked in ORO-3D.",
    realMoneyAllowed: "real money must remain blocked in ORO-3D.",
    liveOroplayCallAllowed: "live OroPlay API calls must remain blocked in ORO-3D.",
    externalNetworkAllowed: "external network must remain blocked in ORO-3D.",
    walletMutationAllowed: "runtime wallet mutation must remain blocked in ORO-3D.",
    ledgerMutationAllowed: "runtime ledger mutation must remain blocked in ORO-3D.",
    prismaWriteAllowed: "Prisma write must remain blocked in ORO-3D.",
    migrationAllowed: "migration must remain blocked in ORO-3D.",
    deployAllowed: "deploy must remain blocked in ORO-3D.",
    payoutAllowed: "payout must remain blocked in ORO-3D.",
    autoCreditAllowed: "auto-credit must remain blocked in ORO-3D.",
    providerAliasEnabled: "provider alias enablement must remain blocked in ORO-3D.",
    secretsPresent: "real secrets must not be present in ORO-3D inputs.",
  };
  return labels[flag] || `${flag} must remain false in ORO-3D.`;
}

function evaluateOroplayRuntimeReadinessGate(input = {}) {
  const gateInput = buildOroplayRuntimeReadinessGateInput(input);
  const blockedReasons = [];
  const readinessBlockers = [];
  const localValidationBlockers = [];

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    if (gateInput[flag] === true) blockedReasons.push(dangerousBlockerFor(flag));
  }

  for (const flag of REQUIRED_EVIDENCE_FLAGS) {
    if (gateInput[flag] !== true) readinessBlockers.push(evidenceBlockerFor(flag));
  }

  if (gateInput.allLocalSmokePassed !== true) {
    localValidationBlockers.push(
      "allLocalSmokePassed is false; run all-local before commit when local env/backend is available, or record the env/backend blocker."
    );
  }

  const decision =
    blockedReasons.length > 0
      ? "fail_closed"
      : readinessBlockers.length > 0
      ? "readiness_incomplete"
      : "readiness_gate_closed";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_READINESS_GATE_STATUS.phase,
    gateStatus: "closed",
    decision,
    runtimeImplementationAllowed: false,
    runtimeEnabled: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    mutationAllowed: false,
    aliasEnablementAllowed: false,
    liveTrafficAllowed: false,
    nextPhaseBlocked: true,
    reason: OROPLAY_CALLBACK_RUNTIME_READINESS_GATE_STATUS.reason,
    blockedReasons,
    readinessBlockers,
    localValidationBlockers,
    implementationFailure: decision === "fail_closed",
    localSmokeBlocksCommit: gateInput.allLocalSmokePassed !== true,
    targetedSmokesPassed: gateInput.targetedSmokesPassed,
    allLocalSmokePassed: gateInput.allLocalSmokePassed,
    input: gateInput,
    productionDbAllowed: false,
    realMoneyAllowed: false,
    liveOroplayCallAllowed: false,
    externalNetworkAllowed: false,
    prismaWriteAllowed: false,
    migrationAllowed: false,
    deployAllowed: false,
    payoutAllowed: false,
    autoCreditAllowed: false,
    providerAliasEnabled: false,
    secretsPresent: false,
  };
}

function buildOroplayRuntimeReadinessGateSummary(input = {}) {
  const gate = evaluateOroplayRuntimeReadinessGate(input);
  return {
    phase: gate.phase,
    gateStatus: gate.gateStatus,
    decision: gate.decision,
    runtimeImplementationAllowed: gate.runtimeImplementationAllowed,
    walletMutationAllowed: gate.walletMutationAllowed,
    ledgerMutationAllowed: gate.ledgerMutationAllowed,
    aliasEnablementAllowed: gate.aliasEnablementAllowed,
    liveTrafficAllowed: gate.liveTrafficAllowed,
    nextPhaseBlocked: gate.nextPhaseBlocked,
    reason: gate.reason,
    blockedReasons: gate.blockedReasons.slice(),
    readinessBlockers: gate.readinessBlockers.slice(),
    localValidationBlockers: gate.localValidationBlockers.slice(),
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

function assertOroplayRuntimeReadinessGateClosed(input = {}) {
  const result = evaluateOroplayRuntimeReadinessGate(input);
  if (result.gateStatus !== "closed" || result.runtimeImplementationAllowed !== false) {
    throw new Error("OroPlay runtime readiness gate must remain closed.");
  }
  if (result.decision === "fail_closed") {
    throw new Error(`OroPlay runtime readiness gate fail-closed: ${result.blockedReasons.join("; ")}`);
  }
  return result;
}

function validateOroplayCallbackRuntimeReadinessGate() {
  const errors = [];
  const defaultGate = evaluateOroplayRuntimeReadinessGate();

  if (defaultGate.gateStatus !== "closed") errors.push("default readiness gate must be closed.");
  if (defaultGate.runtimeImplementationAllowed !== false) {
    errors.push("default readiness gate must block runtime implementation.");
  }
  if (defaultGate.walletMutationAllowed !== false) errors.push("default readiness gate must block wallet mutation.");
  if (defaultGate.ledgerMutationAllowed !== false) errors.push("default readiness gate must block ledger mutation.");
  if (defaultGate.aliasEnablementAllowed !== false) errors.push("default readiness gate must block alias enablement.");
  if (defaultGate.liveTrafficAllowed !== false) errors.push("default readiness gate must block live traffic.");
  if (defaultGate.nextPhaseBlocked !== true) errors.push("default readiness gate must block the next phase.");
  if (defaultGate.reason !== "ORO-3D is readiness/certification only") errors.push("default readiness reason mismatch.");
  if (defaultGate.decision !== "readiness_gate_closed") errors.push("default readiness gate decision mismatch.");
  if (defaultGate.localValidationBlockers.length < 1) {
    errors.push("default readiness gate must record all-local validation blocker.");
  }

  const allLocalBlocked = evaluateOroplayRuntimeReadinessGate({
    targetedSmokesPassed: true,
    allLocalSmokePassed: false,
  });
  if (allLocalBlocked.decision === "fail_closed") {
    errors.push("allLocalSmokePassed=false must not become implementation fail when targeted smokes pass.");
  }

  const targetedBlocked = evaluateOroplayRuntimeReadinessGate({ targetedSmokesPassed: false });
  if (targetedBlocked.decision !== "readiness_incomplete") {
    errors.push("targetedSmokesPassed=false must mark readiness incomplete.");
  }

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    const gate = evaluateOroplayRuntimeReadinessGate({ [flag]: true });
    if (gate.decision !== "fail_closed") errors.push(`${flag} must fail closed when true.`);
    if (gate.blockedReasons.length < 1) errors.push(`${flag} must include blockedReasons.`);
    if (gate.runtimeImplementationAllowed !== false) errors.push(`${flag} must not allow runtime implementation.`);
    if (gate[flag] !== false) errors.push(`${flag} result must remain false.`);
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_READINESS_GATE_STATUS,
  buildOroplayRuntimeReadinessGateInput,
  evaluateOroplayRuntimeReadinessGate,
  buildOroplayRuntimeReadinessGateSummary,
  assertOroplayRuntimeReadinessGateClosed,
  validateOroplayCallbackRuntimeReadinessGate,
};
