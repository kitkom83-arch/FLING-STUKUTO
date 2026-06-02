"use strict";

const {
  buildOroplayStagingRollbackPlan,
  buildOroplayStagingRouteActivationGate,
  buildOroplayStagingRouteMountContract,
  buildOroplayStagingRouteWiringPlan,
} = require("./oroplayCallbackStagingRouteWiringDesign");

function buildOroplayCallbackStagingRouteWiringProofFlags() {
  return {
    expressRouteMounted: false,
    publicAliasMounted: false,
    runtimeWiredToLiveRoute: false,
    walletMutation: false,
    ledgerMutation: false,
    prismaWrite: false,
    externalNetwork: false,
    productionConfigTouched: false,
    activationAllowed: false,
  };
}

function buildOroplayCallbackStagingRouteWiringFixtures() {
  const plan = buildOroplayStagingRouteWiringPlan();
  const mountContract = buildOroplayStagingRouteMountContract();
  const activationGate = buildOroplayStagingRouteActivationGate();
  const rollbackPlan = buildOroplayStagingRollbackPlan();

  return [
    {
      id: "future_staging_balance_path_only",
      name: "staging route plan keeps /api/oroplay/balance as future staging path only",
      kind: "route-plan",
      futureStagingPath: plan.futureStagingPaths.balance,
      futureOnly: true,
      expressRouteMounted: false,
    },
    {
      id: "future_staging_transaction_path_only",
      name: "staging route plan keeps /api/oroplay/transaction as future staging path only",
      kind: "route-plan",
      futureStagingPath: plan.futureStagingPaths.transaction,
      futureOnly: true,
      expressRouteMounted: false,
    },
    {
      id: "public_alias_balance_disabled",
      name: "public alias /api/balance remains disabled",
      kind: "alias-policy",
      publicAliasPath: plan.publicAliasPaths.balance,
      publicAliasMounted: false,
      publicAliasEnabled: false,
    },
    {
      id: "public_alias_transaction_disabled",
      name: "public alias /api/transaction remains disabled",
      kind: "alias-policy",
      publicAliasPath: plan.publicAliasPaths.transaction,
      publicAliasMounted: false,
      publicAliasEnabled: false,
    },
    {
      id: "express_mount_false",
      name: "Express mount remains false",
      kind: "mount-contract",
      expressRouteMounted: mountContract.expressRouteMounted,
      routeMounts: mountContract.routeMounts,
    },
    {
      id: "app_js_untouched",
      name: "src/app.js remains untouched by this phase",
      kind: "source-boundary",
      srcAppJsTouched: mountContract.srcAppJsTouched,
      srcAppJsEditRequired: mountContract.srcAppJsEditRequired,
    },
    {
      id: "oro2b_fail_closed_preserved",
      name: "ORO-2B fail-closed route preserved",
      kind: "previous-phase",
      preserved: plan.oro2bFailClosedPreserved,
    },
    {
      id: "oro4a_disabled_gate_preserved",
      name: "ORO-4A disabled gate preserved",
      kind: "previous-phase",
      preserved: plan.oro4aDisabledGatePreserved,
    },
    {
      id: "oro4e_facade_dry_run_only",
      name: "ORO-4E facade remains dry-run only",
      kind: "previous-phase",
      preserved: plan.oro4eFacadeDryRunPreserved,
    },
    {
      id: "rollback_plan_exists",
      name: "rollback plan exists",
      kind: "rollback",
      rollbackPlanExists: rollbackPlan.rollbackPlanExists,
      rollbackSwitchRequired: rollbackPlan.rollbackSwitchRequired,
    },
    {
      id: "activation_blockers_exist",
      name: "activation blockers exist",
      kind: "activation-gate",
      activationAllowed: activationGate.activationAllowed,
      activationBlockers: activationGate.activationBlockers,
    },
    {
      id: "sanitized_log_requirement_exists",
      name: "sanitized log requirement exists",
      kind: "log-policy",
      sanitizedLogRequirement: plan.sanitizedLogRequirement,
    },
    {
      id: "proof_flags_all_false",
      name: "proof flags all false",
      kind: "proof",
      proofFlags: buildOroplayCallbackStagingRouteWiringProofFlags(),
    },
  ];
}

module.exports = {
  buildOroplayCallbackStagingRouteWiringFixtures,
  buildOroplayCallbackStagingRouteWiringProofFlags,
};
