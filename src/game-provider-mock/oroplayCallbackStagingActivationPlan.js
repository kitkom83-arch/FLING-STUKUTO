"use strict";

const OROPLAY_CALLBACK_STAGING_ACTIVATION_PLAN_STATUS = Object.freeze({
  phase: "ORO-3E",
  environment: "staging_only",
  status: "staging-only activation plan only",
  runtimeEnabled: false,
  stagingActivationAllowed: false,
  productionActivationAllowed: false,
  aliasEnablementAllowed: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  externalNetworkAllowed: false,
  liveProviderAllowed: false,
  flagsDefaultClosed: true,
  emergencyDisableRequired: true,
  monitoringRequired: true,
  rollbackRequired: true,
});

const FEATURE_FLAG_PLAN = Object.freeze([
  ["OROPLAY_CALLBACK_RUNTIME_ENABLED", false],
  ["OROPLAY_CALLBACK_STAGING_ONLY", true],
  ["OROPLAY_CALLBACK_ALIAS_BALANCE_ENABLED", false],
  ["OROPLAY_CALLBACK_ALIAS_TRANSACTION_ENABLED", false],
  ["OROPLAY_CALLBACK_WALLET_MUTATION_ENABLED", false],
  ["OROPLAY_CALLBACK_LEDGER_MUTATION_ENABLED", false],
  ["OROPLAY_CALLBACK_PRISMA_WRITE_ENABLED", false],
  ["OROPLAY_CALLBACK_EXTERNAL_NETWORK_ENABLED", false],
  ["OROPLAY_CALLBACK_LIVE_PROVIDER_ENABLED", false],
  ["OROPLAY_CALLBACK_PRODUCTION_ENABLED", false],
]);

const DANGEROUS_ACTIVATION_FLAGS = Object.freeze([
  "productionActivationAllowed",
  "walletMutationAllowed",
  "ledgerMutationAllowed",
  "prismaWriteAllowed",
  "aliasEnablementAllowed",
  "liveProviderAllowed",
  "externalNetworkAllowed",
  "runtimeEnabled",
  "stagingActivationAllowed",
]);

const REQUIRED_PLAN_FLAGS = Object.freeze([
  "flagsDefaultClosed",
  "emergencyDisableRequired",
  "monitoringRequired",
  "rollbackRequired",
  "manualReviewRequired",
  "goNoGoChecklistRequired",
  "oro3fApprovalRequired",
]);

const DEFAULT_INPUT = Object.freeze(
  Object.assign(
    DANGEROUS_ACTIVATION_FLAGS.reduce((memo, flag) => Object.assign(memo, { [flag]: false }), {}),
    REQUIRED_PLAN_FLAGS.reduce((memo, flag) => Object.assign(memo, { [flag]: true }), {}),
    {
      productionDbAllowed: false,
      realMoneyAllowed: false,
      liveTrafficAllowed: false,
    }
  )
);

const APPROVALS_REQUIRED = Object.freeze([
  "ORO-3F approval",
  "staging-only environment approval",
  "emergency disable approval",
  "monitoring approval",
  "rollback approval",
  "manual review approval",
  "idempotency storage approval",
  "wallet bridge approval",
  "ledger bridge approval",
  "Prisma write approval",
  "alias approval if provider-compatible paths are required",
]);

function readBoolean(candidate, flag) {
  if (!Object.prototype.hasOwnProperty.call(candidate, flag)) return DEFAULT_INPUT[flag] === true;
  return candidate[flag] === true;
}

function buildOroplayStagingActivationInput(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const planInput = {};

  for (const flag of DANGEROUS_ACTIVATION_FLAGS) {
    planInput[flag] = readBoolean(candidate, flag);
  }
  for (const flag of REQUIRED_PLAN_FLAGS) {
    planInput[flag] = readBoolean(candidate, flag);
  }

  planInput.productionDbAllowed = readBoolean(candidate, "productionDbAllowed");
  planInput.realMoneyAllowed = readBoolean(candidate, "realMoneyAllowed");
  planInput.liveTrafficAllowed = readBoolean(candidate, "liveTrafficAllowed");
  return planInput;
}

function buildOroplayStagingFeatureFlagPlan() {
  return FEATURE_FLAG_PLAN.map(([name, defaultValue]) => ({
    name,
    documentedDefault: defaultValue,
    enabledNow: false,
    documentationOnly: true,
    envChanged: false,
  }));
}

function dangerousActivationBlockerFor(flag) {
  const labels = {
    productionActivationAllowed: "production activation must remain blocked in ORO-3E.",
    walletMutationAllowed: "wallet mutation must remain blocked in ORO-3E.",
    ledgerMutationAllowed: "ledger mutation must remain blocked in ORO-3E.",
    prismaWriteAllowed: "Prisma write must remain blocked in ORO-3E.",
    aliasEnablementAllowed: "provider-compatible alias enablement must remain blocked in ORO-3E.",
    liveProviderAllowed: "live provider traffic must remain blocked in ORO-3E.",
    externalNetworkAllowed: "external network must remain blocked in ORO-3E.",
    runtimeEnabled: "runtime must remain disabled in ORO-3E.",
    stagingActivationAllowed: "staging activation requires future ORO-3F approval.",
    productionDbAllowed: "production DB must remain blocked in ORO-3E.",
    realMoneyAllowed: "real money must remain blocked in ORO-3E.",
    liveTrafficAllowed: "live callback traffic must remain blocked in ORO-3E.",
  };
  return labels[flag] || `${flag} must remain false in ORO-3E.`;
}

function missingPlanBlockerFor(flag) {
  return `${flag} is required before any future staging activation review.`;
}

function evaluateOroplayStagingActivationPlan(input = {}) {
  const planInput = buildOroplayStagingActivationInput(input);
  const blockedReasons = [
    "ORO-3F approval is required before staging-only activation.",
    "all feature flags are documentation-only and default closed in ORO-3E.",
  ];
  const missingPlanReasons = [];

  for (const flag of [
    ...DANGEROUS_ACTIVATION_FLAGS,
    "productionDbAllowed",
    "realMoneyAllowed",
    "liveTrafficAllowed",
  ]) {
    if (planInput[flag] === true) blockedReasons.push(dangerousActivationBlockerFor(flag));
  }

  for (const flag of REQUIRED_PLAN_FLAGS) {
    if (planInput[flag] !== true) missingPlanReasons.push(missingPlanBlockerFor(flag));
  }

  const dangerousFlagPresent = blockedReasons.length > 2;
  const decision = dangerousFlagPresent
    ? "fail_closed"
    : missingPlanReasons.length > 0
    ? "staging_plan_incomplete"
    : "staging_plan_passed_activation_blocked";

  return {
    phase: "ORO-3E",
    environment: "staging_only",
    decision,
    runtimeEnabled: false,
    stagingActivationAllowed: false,
    productionActivationAllowed: false,
    aliasEnablementAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    externalNetworkAllowed: false,
    liveProviderAllowed: false,
    flagsDefaultClosed: true,
    emergencyDisableRequired: true,
    monitoringRequired: true,
    rollbackRequired: true,
    approvalsRequired: APPROVALS_REQUIRED.slice(),
    blockedReasons,
    missingPlanReasons,
    featureFlags: buildOroplayStagingFeatureFlagPlan(),
    productionDbAllowed: false,
    realMoneyAllowed: false,
    liveTrafficAllowed: false,
    input: planInput,
  };
}

function buildOroplayStagingActivationSummary(input = {}) {
  const plan = evaluateOroplayStagingActivationPlan(input);
  return {
    phase: plan.phase,
    environment: plan.environment,
    decision: plan.decision,
    runtimeEnabled: plan.runtimeEnabled,
    stagingActivationAllowed: plan.stagingActivationAllowed,
    productionActivationAllowed: plan.productionActivationAllowed,
    aliasEnablementAllowed: plan.aliasEnablementAllowed,
    walletMutationAllowed: plan.walletMutationAllowed,
    ledgerMutationAllowed: plan.ledgerMutationAllowed,
    prismaWriteAllowed: plan.prismaWriteAllowed,
    externalNetworkAllowed: plan.externalNetworkAllowed,
    liveProviderAllowed: plan.liveProviderAllowed,
    flagsDefaultClosed: plan.flagsDefaultClosed,
    emergencyDisableRequired: plan.emergencyDisableRequired,
    monitoringRequired: plan.monitoringRequired,
    rollbackRequired: plan.rollbackRequired,
    blockedReasons: plan.blockedReasons.slice(),
    approvalsRequired: plan.approvalsRequired.slice(),
  };
}

function validateOroplayCallbackStagingActivationPlan() {
  const errors = [];
  const defaultPlan = evaluateOroplayStagingActivationPlan();

  if (defaultPlan.phase !== "ORO-3E") errors.push("default phase must be ORO-3E.");
  if (defaultPlan.environment !== "staging_only") errors.push("default environment must be staging_only.");
  if (defaultPlan.decision !== "staging_plan_passed_activation_blocked") {
    errors.push("default decision must pass plan while activation remains blocked.");
  }
  if (defaultPlan.runtimeEnabled !== false) errors.push("runtimeEnabled must remain false.");
  if (defaultPlan.stagingActivationAllowed !== false) errors.push("stagingActivationAllowed must remain false.");
  if (defaultPlan.productionActivationAllowed !== false) errors.push("productionActivationAllowed must remain false.");
  if (defaultPlan.aliasEnablementAllowed !== false) errors.push("aliasEnablementAllowed must remain false.");
  if (defaultPlan.walletMutationAllowed !== false) errors.push("walletMutationAllowed must remain false.");
  if (defaultPlan.ledgerMutationAllowed !== false) errors.push("ledgerMutationAllowed must remain false.");
  if (defaultPlan.prismaWriteAllowed !== false) errors.push("prismaWriteAllowed must remain false.");
  if (defaultPlan.externalNetworkAllowed !== false) errors.push("externalNetworkAllowed must remain false.");
  if (defaultPlan.liveProviderAllowed !== false) errors.push("liveProviderAllowed must remain false.");
  if (defaultPlan.flagsDefaultClosed !== true) errors.push("flagsDefaultClosed must be true.");
  if (defaultPlan.emergencyDisableRequired !== true) errors.push("emergencyDisableRequired must be true.");
  if (defaultPlan.monitoringRequired !== true) errors.push("monitoringRequired must be true.");
  if (defaultPlan.rollbackRequired !== true) errors.push("rollbackRequired must be true.");
  if (defaultPlan.approvalsRequired.length < 1) errors.push("approvalsRequired must be populated.");
  if (defaultPlan.blockedReasons.length < 1) errors.push("blockedReasons must be populated.");
  if (!defaultPlan.featureFlags.every((flag) => flag.enabledNow === false && flag.documentationOnly === true)) {
    errors.push("all feature flag plan entries must be documentation-only and disabled now.");
  }

  for (const flag of DANGEROUS_ACTIVATION_FLAGS) {
    const plan = evaluateOroplayStagingActivationPlan({ [flag]: true });
    if (plan.decision !== "fail_closed") errors.push(`${flag}=true must fail closed.`);
    if (plan.blockedReasons.length < 3) errors.push(`${flag}=true must include a specific blocked reason.`);
    if (Object.prototype.hasOwnProperty.call(plan, flag) && plan[flag] !== false) {
      errors.push(`${flag} output must remain false.`);
    }
  }

  for (const flag of ["productionDbAllowed", "realMoneyAllowed", "liveTrafficAllowed"]) {
    const plan = evaluateOroplayStagingActivationPlan({ [flag]: true });
    if (plan.decision !== "fail_closed") errors.push(`${flag}=true must fail closed.`);
    if (plan[flag] !== false) errors.push(`${flag} output must remain false.`);
  }

  for (const flag of REQUIRED_PLAN_FLAGS) {
    const plan = evaluateOroplayStagingActivationPlan({ [flag]: false });
    if (plan.decision !== "staging_plan_incomplete") errors.push(`${flag}=false must mark plan incomplete.`);
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_STAGING_ACTIVATION_PLAN_STATUS,
  buildOroplayStagingActivationInput,
  buildOroplayStagingFeatureFlagPlan,
  evaluateOroplayStagingActivationPlan,
  buildOroplayStagingActivationSummary,
  validateOroplayCallbackStagingActivationPlan,
};
