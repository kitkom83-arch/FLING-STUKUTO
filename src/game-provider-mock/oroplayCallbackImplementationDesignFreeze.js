"use strict";

const OROPLAY_CALLBACK_IMPLEMENTATION_DESIGN_FREEZE_STATUS = Object.freeze({
  phase: "ORO-3E",
  status: "callback runtime implementation design freeze / staging-only activation plan only",
  designFrozen: true,
  runtimeImplemented: false,
  runtimeEnabled: false,
  mutationAllowed: false,
  walletMutationAllowed: false,
  ledgerMutationAllowed: false,
  prismaWriteAllowed: false,
  aliasEnabled: false,
  liveTrafficAllowed: false,
  productionAllowed: false,
  externalNetworkAllowed: false,
  changeControlRequired: true,
  nextPhase: "ORO-3F",
});

const CLOSED_PHASE_EVIDENCE = Object.freeze([
  { phase: "ORO-2B", status: "closed", evidence: "fail-closed callback stub route remains default" },
  { phase: "ORO-2C", status: "closed", evidence: "callback runtime readiness contract closed" },
  { phase: "ORO-3A", status: "closed", evidence: "callback runtime simulation closed" },
  { phase: "ORO-3B", status: "closed", evidence: "adapter contract and wallet-ledger bridge design closed" },
  { phase: "ORO-3C", status: "closed", evidence: "execution plan and no-mutation runtime gate closed" },
  { phase: "ORO-3D", status: "closed", evidence: "readiness gate and certification pack closed" },
]);

const REQUIRED_FREEZE_FLAGS = Object.freeze([
  "oroplay2bFailClosedClosed",
  "oroplay2cReadinessClosed",
  "oroplay3aSimulationClosed",
  "oroplay3bAdapterContractClosed",
  "oroplay3cExecutionPlanClosed",
  "oroplay3dReadinessGateClosed",
  "callbackContractFrozen",
  "authBoundaryFrozen",
  "memberMappingBoundaryFrozen",
  "idempotencyBoundaryFrozen",
  "walletBridgeBoundaryFrozen",
  "ledgerBridgeBoundaryFrozen",
  "transactionLogBoundaryFrozen",
  "reconciliationBoundaryFrozen",
  "auditBoundaryFrozen",
  "sanitizedLoggingBoundaryFrozen",
  "responseMappingFrozen",
  "errorMappingFrozen",
]);

const DANGEROUS_RUNTIME_FLAGS = Object.freeze([
  "runtimeImplemented",
  "runtimeEnabled",
  "mutationAllowed",
  "walletMutationAllowed",
  "ledgerMutationAllowed",
  "prismaWriteAllowed",
  "aliasEnabled",
  "liveTrafficAllowed",
  "productionAllowed",
  "externalNetworkAllowed",
  "productionDbAllowed",
  "realMoneyAllowed",
  "migrationAllowed",
  "deployAllowed",
  "payoutAllowed",
  "autoCreditAllowed",
  "liveProviderAllowed",
]);

const DEFAULT_INPUT = Object.freeze(
  Object.assign(
    REQUIRED_FREEZE_FLAGS.reduce((memo, flag) => Object.assign(memo, { [flag]: true }), {}),
    DANGEROUS_RUNTIME_FLAGS.reduce((memo, flag) => Object.assign(memo, { [flag]: false }), {}),
    {
      designFrozen: true,
      changeControlRequired: true,
      manualReviewRequired: false,
    }
  )
);

const BLOCKED_RUNTIME_ACTIONS = Object.freeze([
  "runtime callback implementation",
  "runtime wallet debit or credit",
  "runtime ledger insert",
  "Prisma write",
  "provider-compatible alias enablement",
  "live OroPlay callback traffic",
  "external network call",
  "production DB access",
  "real money flow",
  "migration",
  "deploy",
  "payout",
  "auto-credit",
]);

const REQUIRED_FUTURE_APPROVALS = Object.freeze([
  "ORO-3F staging-only activation approval",
  "wallet source-of-truth approval",
  "ledger bridge approval",
  "Prisma write boundary approval",
  "idempotency storage approval",
  "reconciliation approval",
  "audit and sanitized logging approval",
  "monitoring approval",
  "rollback approval",
  "emergency disable approval",
  "alias enablement approval if provider-compatible routes are required",
]);

function readBoolean(candidate, flag) {
  if (!Object.prototype.hasOwnProperty.call(candidate, flag)) return DEFAULT_INPUT[flag] === true;
  return candidate[flag] === true;
}

function buildOroplayImplementationDesignFreezeInput(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const freezeInput = {};

  for (const flag of REQUIRED_FREEZE_FLAGS) {
    freezeInput[flag] = readBoolean(candidate, flag);
  }
  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    freezeInput[flag] = readBoolean(candidate, flag);
  }

  freezeInput.designFrozen = readBoolean(candidate, "designFrozen");
  freezeInput.changeControlRequired = readBoolean(candidate, "changeControlRequired");
  freezeInput.manualReviewRequired = readBoolean(candidate, "manualReviewRequired");
  return freezeInput;
}

function buildOroplayFrozenCallbackContract() {
  return {
    phase: "ORO-3E",
    scope: "balance_and_transaction_callback_design_freeze",
    preferredRoutes: ["/api/oroplay/balance", "/api/oroplay/transaction"],
    providerCompatibleAliases: ["/api/balance", "/api/transaction"],
    aliasEnabled: false,
    runtimeResponseEnabled: false,
    balanceCallback: {
      designFrozen: true,
      callbackType: "balance",
      requiredFields: ["userCode"],
      behavior: "future_balance_response_plan_only",
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
    },
    transactionCallback: {
      designFrozen: true,
      callbackType: "transaction",
      requiredFields: ["userCode", "transactionCode", "amount"],
      optionalGuardFields: ["roundId", "vendorCode", "gameCode"],
      behavior: "future_bet_debit_or_win_credit_plan_only",
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
    },
    authBoundary: {
      envOnly: true,
      realSecretAllowed: false,
      authorizationHeaderPrinted: false,
    },
    memberMappingBoundary: {
      sourceOfTruthApproved: false,
      productionLookupAllowed: false,
      futureApprovalRequired: true,
    },
    idempotencyBoundary: {
      storageApproved: false,
      duplicateConflictBehavior: "fail_closed_or_manual_review",
      futureApprovalRequired: true,
    },
    responseMapping: {
      frozen: true,
      liveProviderResponseEnabled: false,
      mutationAllowed: false,
    },
    errorMapping: {
      frozen: true,
      unsafeStates: [
        "malformed_payload",
        "unknown_member",
        "blocked_member",
        "inactive_member",
        "insufficient_balance",
        "duplicate_conflict",
        "finished_round_replay",
        "canceled_transaction",
      ],
      behavior: "fail_closed_or_manual_review",
    },
  };
}

function buildOroplayFrozenRuntimeBoundaries() {
  return {
    phase: "ORO-3E",
    runtimeImplemented: false,
    runtimeEnabled: false,
    mutationAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    aliasEnabled: false,
    liveTrafficAllowed: false,
    productionAllowed: false,
    externalNetworkAllowed: false,
    changeControlRequired: true,
    blockedRuntimeActions: BLOCKED_RUNTIME_ACTIONS.slice(),
    requiredFutureApprovals: REQUIRED_FUTURE_APPROVALS.slice(),
  };
}

function requiredFreezeBlockerFor(flag) {
  return `${flag} must be true before ORO-3E can pass design freeze.`;
}

function dangerousRuntimeBlockerFor(flag) {
  const labels = {
    runtimeImplemented: "runtime implementation must remain absent in ORO-3E.",
    runtimeEnabled: "runtime must remain disabled in ORO-3E.",
    mutationAllowed: "runtime mutation must remain blocked in ORO-3E.",
    walletMutationAllowed: "wallet mutation must remain blocked in ORO-3E.",
    ledgerMutationAllowed: "ledger mutation must remain blocked in ORO-3E.",
    prismaWriteAllowed: "Prisma write must remain blocked in ORO-3E.",
    aliasEnabled: "provider-compatible alias must remain blocked in ORO-3E.",
    liveTrafficAllowed: "live callback traffic must remain blocked in ORO-3E.",
    productionAllowed: "production activation must remain blocked in ORO-3E.",
    externalNetworkAllowed: "external network must remain blocked in ORO-3E.",
    productionDbAllowed: "production DB must remain blocked in ORO-3E.",
    realMoneyAllowed: "real money must remain blocked in ORO-3E.",
    migrationAllowed: "migration must remain blocked in ORO-3E.",
    deployAllowed: "deploy must remain blocked in ORO-3E.",
    payoutAllowed: "payout must remain blocked in ORO-3E.",
    autoCreditAllowed: "auto-credit must remain blocked in ORO-3E.",
    liveProviderAllowed: "live provider traffic must remain blocked in ORO-3E.",
  };
  return labels[flag] || `${flag} must remain false in ORO-3E.`;
}

function evaluateOroplayImplementationDesignFreeze(input = {}) {
  const freezeInput = buildOroplayImplementationDesignFreezeInput(input);
  const blockedReasons = [];
  const incompleteReasons = [];

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    if (freezeInput[flag] === true) blockedReasons.push(dangerousRuntimeBlockerFor(flag));
  }

  for (const flag of REQUIRED_FREEZE_FLAGS) {
    if (freezeInput[flag] !== true) incompleteReasons.push(requiredFreezeBlockerFor(flag));
  }

  if (freezeInput.designFrozen !== true) incompleteReasons.push("designFrozen must be true.");
  if (freezeInput.changeControlRequired !== true) incompleteReasons.push("changeControlRequired must be true.");

  const decision =
    blockedReasons.length > 0
      ? "fail_closed"
      : freezeInput.manualReviewRequired === true
      ? "manual_review_required"
      : incompleteReasons.length > 0
      ? "design_freeze_incomplete"
      : "design_freeze_passed_runtime_blocked";

  return {
    phase: "ORO-3E",
    decision,
    designFrozen: decision !== "design_freeze_incomplete" && blockedReasons.length === 0,
    runtimeImplemented: false,
    runtimeEnabled: false,
    mutationAllowed: false,
    walletMutationAllowed: false,
    ledgerMutationAllowed: false,
    prismaWriteAllowed: false,
    aliasEnabled: false,
    liveTrafficAllowed: false,
    productionAllowed: false,
    externalNetworkAllowed: false,
    changeControlRequired: true,
    nextPhase: "ORO-3F",
    closedPhaseEvidence: CLOSED_PHASE_EVIDENCE.map((item) => Object.assign({}, item)),
    frozenContracts: buildOroplayFrozenCallbackContract(),
    frozenRuntimeBoundaries: buildOroplayFrozenRuntimeBoundaries(),
    blockedRuntimeActions: BLOCKED_RUNTIME_ACTIONS.slice(),
    requiredFutureApprovals: REQUIRED_FUTURE_APPROVALS.slice(),
    blockedReasons,
    incompleteReasons,
    manualReviewRequired: freezeInput.manualReviewRequired === true,
    input: freezeInput,
  };
}

function buildOroplayImplementationDesignFreezeSummary(input = {}) {
  const result = evaluateOroplayImplementationDesignFreeze(input);
  return {
    phase: result.phase,
    decision: result.decision,
    designFrozen: result.designFrozen,
    runtimeImplemented: result.runtimeImplemented,
    runtimeEnabled: result.runtimeEnabled,
    mutationAllowed: result.mutationAllowed,
    walletMutationAllowed: result.walletMutationAllowed,
    ledgerMutationAllowed: result.ledgerMutationAllowed,
    prismaWriteAllowed: result.prismaWriteAllowed,
    aliasEnabled: result.aliasEnabled,
    liveTrafficAllowed: result.liveTrafficAllowed,
    productionAllowed: result.productionAllowed,
    externalNetworkAllowed: result.externalNetworkAllowed,
    changeControlRequired: result.changeControlRequired,
    nextPhase: result.nextPhase,
    blockedReasons: result.blockedReasons.slice(),
    incompleteReasons: result.incompleteReasons.slice(),
  };
}

function validateOroplayCallbackImplementationDesignFreeze() {
  const errors = [];
  const defaultResult = evaluateOroplayImplementationDesignFreeze();

  if (defaultResult.phase !== "ORO-3E") errors.push("default phase must be ORO-3E.");
  if (defaultResult.decision !== "design_freeze_passed_runtime_blocked") {
    errors.push("default decision must pass design freeze while runtime remains blocked.");
  }
  if (defaultResult.designFrozen !== true) errors.push("default designFrozen must be true.");
  if (defaultResult.runtimeImplemented !== false) errors.push("runtimeImplemented must remain false.");
  if (defaultResult.runtimeEnabled !== false) errors.push("runtimeEnabled must remain false.");
  if (defaultResult.mutationAllowed !== false) errors.push("mutationAllowed must remain false.");
  if (defaultResult.walletMutationAllowed !== false) errors.push("walletMutationAllowed must remain false.");
  if (defaultResult.ledgerMutationAllowed !== false) errors.push("ledgerMutationAllowed must remain false.");
  if (defaultResult.prismaWriteAllowed !== false) errors.push("prismaWriteAllowed must remain false.");
  if (defaultResult.aliasEnabled !== false) errors.push("aliasEnabled must remain false.");
  if (defaultResult.liveTrafficAllowed !== false) errors.push("liveTrafficAllowed must remain false.");
  if (defaultResult.productionAllowed !== false) errors.push("productionAllowed must remain false.");
  if (defaultResult.externalNetworkAllowed !== false) errors.push("externalNetworkAllowed must remain false.");
  if (defaultResult.changeControlRequired !== true) errors.push("changeControlRequired must be true.");
  if (defaultResult.nextPhase !== "ORO-3F") errors.push("nextPhase must be ORO-3F.");
  if (defaultResult.closedPhaseEvidence.length !== CLOSED_PHASE_EVIDENCE.length) {
    errors.push("closedPhaseEvidence must include the closed ORO chain.");
  }
  if (!defaultResult.frozenContracts || defaultResult.frozenContracts.aliasEnabled !== false) {
    errors.push("frozenContracts must exist and keep aliases blocked.");
  }
  if (!defaultResult.frozenRuntimeBoundaries || defaultResult.frozenRuntimeBoundaries.walletMutationAllowed !== false) {
    errors.push("frozen runtime boundaries must keep wallet mutation blocked.");
  }
  if (defaultResult.blockedRuntimeActions.length < 1) errors.push("blockedRuntimeActions must be populated.");
  if (defaultResult.requiredFutureApprovals.length < 1) errors.push("requiredFutureApprovals must be populated.");

  for (const flag of REQUIRED_FREEZE_FLAGS) {
    const result = evaluateOroplayImplementationDesignFreeze({ [flag]: false });
    if (result.decision !== "design_freeze_incomplete") errors.push(`${flag}=false must make design freeze incomplete.`);
  }

  for (const flag of DANGEROUS_RUNTIME_FLAGS) {
    const result = evaluateOroplayImplementationDesignFreeze({ [flag]: true });
    if (result.decision !== "fail_closed") errors.push(`${flag}=true must fail closed.`);
    if (result.blockedReasons.length < 1) errors.push(`${flag}=true must include blockedReasons.`);
    if (result[flag] !== false && Object.prototype.hasOwnProperty.call(result, flag)) {
      errors.push(`${flag} output must remain false.`);
    }
  }

  const manualReview = evaluateOroplayImplementationDesignFreeze({ manualReviewRequired: true });
  if (manualReview.decision !== "manual_review_required") errors.push("manualReviewRequired must return manual_review_required.");

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_IMPLEMENTATION_DESIGN_FREEZE_STATUS,
  buildOroplayImplementationDesignFreezeInput,
  buildOroplayFrozenCallbackContract,
  buildOroplayFrozenRuntimeBoundaries,
  evaluateOroplayImplementationDesignFreeze,
  buildOroplayImplementationDesignFreezeSummary,
  validateOroplayCallbackImplementationDesignFreeze,
};
