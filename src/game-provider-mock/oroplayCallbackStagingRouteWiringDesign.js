"use strict";

const FUTURE_STAGING_ROUTE_PATHS = Object.freeze({
  balance: "/api/oroplay/balance",
  transaction: "/api/oroplay/transaction",
});

const DISABLED_PUBLIC_ALIAS_PATHS = Object.freeze({
  balance: "/api/balance",
  transaction: "/api/transaction",
});

const REQUIRED_FUTURE_ACTIVATION_GATES = Object.freeze([
  "manual approval required",
  "staging env only",
  "certified runtime flag required",
  "callback auth configured",
  "idempotency guard verified",
  "ledger/reconciliation guard verified",
  "rollback switch verified",
  "sanitized log verified",
  "no production deployment",
]);

const OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS = Object.freeze({
  phase: "ORO-4F",
  status: "callback staging route wiring design contract",
  scope: "docs contract static mock harness local smoke only",
  designContractOnly: true,
  mockContractOnly: true,
  stagingRoutePlanOnly: true,
  expressRouteMounted: false,
  publicAliasMounted: false,
  runtimeWiredToLiveRoute: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  externalNetworkAllowed: false,
  productionConfigTouched: false,
  activationAllowed: false,
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSafetyProofFlags() {
  return {
    expressRouteMounted: false,
    publicAliasMounted: false,
    runtimeWiredToLiveRoute: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    productionConfigTouched: false,
    activationAllowed: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
  };
}

function buildRoutePlanEntry(callbackType) {
  const futureStagingPath = FUTURE_STAGING_ROUTE_PATHS[callbackType];
  const publicAliasPath = DISABLED_PUBLIC_ALIAS_PATHS[callbackType];

  return {
    callbackType,
    futureStagingPath,
    futureOnly: true,
    stagingOnly: true,
    expressRouteMounted: false,
    routeMounted: false,
    controllerMounted: false,
    handlerBound: false,
    publicAliasPath,
    publicAliasEnabled: false,
    publicAliasMounted: false,
    runtimeWiredToLiveRoute: false,
  };
}

function buildOroplayStagingRouteWiringPlan() {
  const routePlan = [buildRoutePlanEntry("balance"), buildRoutePlanEntry("transaction")];

  return {
    phase: OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.phase,
    status: OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.status,
    purpose: "future staging route wiring design only",
    designContractOnly: true,
    mockContractOnly: true,
    stagingRoutePlanOnly: true,
    futureStagingPaths: clone(FUTURE_STAGING_ROUTE_PATHS),
    publicAliasPaths: clone(DISABLED_PUBLIC_ALIAS_PATHS),
    routePlan,
    noExpressRouterCreated: true,
    noExpressMountAdded: true,
    noAppJsChangeRequired: true,
    srcAppJsTouched: false,
    publicAliasesDisabled: true,
    oro2bFailClosedRoutePreserved: true,
    oro4aDisabledGatePreserved: true,
    oro4bStagingPrecheckPreserved: true,
    oro4cShadowInvocationPreserved: true,
    oro4dEnvelopeMapperPreserved: true,
    oro4eFacadeDryRunPreserved: true,
    requiredFutureGates: REQUIRED_FUTURE_ACTIVATION_GATES.slice(),
    callbackAuthRequirement: {
      requirement: "callback auth configured",
      namesOnly: true,
      valuesRead: false,
      valuesPrinted: false,
      configuredInThisPhase: false,
    },
    idempotencyRequirement: {
      requirement: "idempotency guard verified",
      verifiedInThisPhase: false,
    },
    ledgerReconciliationRequirement: {
      requirement: "ledger/reconciliation guard verified",
      verifiedInThisPhase: false,
    },
    sanitizedLogRequirement: {
      requirement: "sanitized log verified",
      markers: [
        "auth-header-redaction-marker",
        "credential-prefix-marker",
        "mock-redaction-key-name",
        "redacted-credential-marker",
      ],
      valuesPrinted: false,
    },
    ...buildSafetyProofFlags(),
  };
}

function buildOroplayStagingRouteMountContract() {
  const plan = buildOroplayStagingRouteWiringPlan();

  return {
    phase: plan.phase,
    contract: "staging route mount contract",
    designContractOnly: true,
    futureRoutePaths: clone(plan.futureStagingPaths),
    disabledPublicAliases: clone(plan.publicAliasPaths),
    routeMounts: plan.routePlan.map((entry) => ({
      callbackType: entry.callbackType,
      futureStagingPath: entry.futureStagingPath,
      futureOnly: true,
      expressRouteMounted: false,
      routeMounted: false,
      controllerMounted: false,
      publicAliasPath: entry.publicAliasPath,
      publicAliasMounted: false,
      publicAliasEnabled: false,
    })),
    srcAppJsEditRequired: false,
    srcAppJsTouched: false,
    routeFileCreated: false,
    controllerFileCreated: false,
    ...buildSafetyProofFlags(),
  };
}

function buildOroplayStagingRouteActivationGate() {
  return {
    phase: OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.phase,
    gate: "future staging route activation gate",
    activationAllowed: false,
    activationBlockers: REQUIRED_FUTURE_ACTIVATION_GATES.slice(),
    requiredFutureGates: REQUIRED_FUTURE_ACTIVATION_GATES.slice(),
    manualApprovalRequired: true,
    stagingEnvOnly: true,
    certifiedRuntimeFlagRequired: true,
    callbackAuthConfiguredInThisPhase: false,
    idempotencyGuardVerifiedInThisPhase: false,
    ledgerReconciliationGuardVerifiedInThisPhase: false,
    rollbackSwitchVerifiedInThisPhase: false,
    sanitizedLogVerifiedInThisPhase: false,
    noProductionDeployment: true,
    ...buildSafetyProofFlags(),
  };
}

function buildOroplayStagingRollbackPlan() {
  return {
    phase: OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.phase,
    rollbackPlanExists: true,
    rollbackSwitchRequired: true,
    rollbackSwitchVerifiedInThisPhase: false,
    activationAllowed: false,
    rollbackSteps: [
      "keep ORO-4F design contract out of src/app.js",
      "keep public aliases disabled",
      "keep runtime disconnected from live routes",
      "return any later staging mount to disabled state if validation fails",
    ],
    ...buildSafetyProofFlags(),
  };
}

function validateOroplayStagingRouteWiringDesign() {
  const plan = buildOroplayStagingRouteWiringPlan();
  const mountContract = buildOroplayStagingRouteMountContract();
  const activationGate = buildOroplayStagingRouteActivationGate();
  const rollbackPlan = buildOroplayStagingRollbackPlan();
  const errors = [];

  if (plan.designContractOnly !== true) errors.push("plan must stay designContractOnly.");
  if (plan.futureStagingPaths.balance !== "/api/oroplay/balance") errors.push("balance future staging path mismatch.");
  if (plan.futureStagingPaths.transaction !== "/api/oroplay/transaction") {
    errors.push("transaction future staging path mismatch.");
  }
  if (plan.publicAliasPaths.balance !== "/api/balance") errors.push("balance public alias path mismatch.");
  if (plan.publicAliasPaths.transaction !== "/api/transaction") errors.push("transaction public alias path mismatch.");
  if (mountContract.srcAppJsEditRequired !== false) errors.push("src/app.js edit must not be required.");
  if (rollbackPlan.rollbackPlanExists !== true) errors.push("rollback plan must exist.");
  if (!Array.isArray(activationGate.activationBlockers) || activationGate.activationBlockers.length === 0) {
    errors.push("activation blockers must exist.");
  }

  for (const gate of REQUIRED_FUTURE_ACTIVATION_GATES) {
    if (!activationGate.requiredFutureGates.includes(gate)) errors.push(`missing future gate: ${gate}.`);
  }

  for (const target of [plan, mountContract, activationGate, rollbackPlan]) {
    for (const flag of [
      "expressRouteMounted",
      "publicAliasMounted",
      "runtimeWiredToLiveRoute",
      "walletMutationAllowed",
      "ledgerMutationAllowed",
      "prismaWriteAllowed",
      "externalNetworkAllowed",
      "productionConfigTouched",
      "activationAllowed",
    ]) {
      if (target[flag] !== false) errors.push(`${flag} must remain false.`);
    }
  }

  for (const entry of mountContract.routeMounts) {
    if (entry.futureOnly !== true) errors.push(`${entry.callbackType} route must be future-only.`);
    if (entry.expressRouteMounted !== false) errors.push(`${entry.callbackType} route must not be mounted.`);
    if (entry.publicAliasMounted !== false) errors.push(`${entry.callbackType} alias must not be mounted.`);
    if (entry.publicAliasEnabled !== false) errors.push(`${entry.callbackType} alias must not be enabled.`);
  }

  return { ok: errors.length === 0, errors, plan, mountContract, activationGate, rollbackPlan };
}

function assertFalseFlag(target, flagName) {
  if (target[flagName] !== false) throw new Error(`OroPlay ORO-4F must keep ${flagName}=false.`);
}

function assertOroplayRouteWiringDesignNoExpressMount() {
  const mountContract = buildOroplayStagingRouteMountContract();
  assertFalseFlag(mountContract, "expressRouteMounted");
  for (const entry of mountContract.routeMounts) {
    if (entry.expressRouteMounted !== false || entry.routeMounted !== false || entry.controllerMounted !== false) {
      throw new Error("OroPlay ORO-4F must not mount Express route entries.");
    }
  }
  return mountContract;
}

function assertOroplayRouteWiringDesignNoAliasEnabled() {
  const mountContract = buildOroplayStagingRouteMountContract();
  assertFalseFlag(mountContract, "publicAliasMounted");
  for (const entry of mountContract.routeMounts) {
    if (entry.publicAliasEnabled !== false || entry.publicAliasMounted !== false) {
      throw new Error("OroPlay ORO-4F must keep public aliases disabled.");
    }
  }
  return mountContract;
}

function assertOroplayRouteWiringDesignNoMutation() {
  const plan = buildOroplayStagingRouteWiringPlan();
  assertFalseFlag(plan, "walletMutationAllowed");
  assertFalseFlag(plan, "ledgerMutationAllowed");
  if (plan.walletMutation !== false) throw new Error("OroPlay ORO-4F must not mutate wallet state.");
  if (plan.ledgerMutation !== false) throw new Error("OroPlay ORO-4F must not mutate ledger state.");
  return plan;
}

function assertOroplayRouteWiringDesignNoNetwork() {
  const plan = buildOroplayStagingRouteWiringPlan();
  assertFalseFlag(plan, "externalNetworkAllowed");
  if (plan.externalNetwork !== false) throw new Error("OroPlay ORO-4F must not call external network.");
  return plan;
}

function assertOroplayRouteWiringDesignNoPrismaWrite() {
  const plan = buildOroplayStagingRouteWiringPlan();
  assertFalseFlag(plan, "prismaWriteAllowed");
  if (plan.prismaWrite !== false) throw new Error("OroPlay ORO-4F must not write through Prisma.");
  return plan;
}

module.exports = {
  OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS,
  buildOroplayStagingRouteWiringPlan,
  buildOroplayStagingRouteMountContract,
  buildOroplayStagingRouteActivationGate,
  buildOroplayStagingRollbackPlan,
  validateOroplayStagingRouteWiringDesign,
  assertOroplayRouteWiringDesignNoExpressMount,
  assertOroplayRouteWiringDesignNoAliasEnabled,
  assertOroplayRouteWiringDesignNoMutation,
  assertOroplayRouteWiringDesignNoNetwork,
  assertOroplayRouteWiringDesignNoPrismaWrite,
};
