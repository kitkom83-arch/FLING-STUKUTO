"use strict";

const OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS = Object.freeze({
  phase: "ORO-3B",
  status: "wallet-ledger bridge design only",
  mutationAllowed: false,
  prismaWriteAllowed: false,
  liveRuntimeEnabled: false,
  runtimeWalletMutation: false,
  runtimeLedgerMutation: false,
  noProductionDb: true,
  noRealMoney: true,
  noLiveOroplayApi: true,
  noExternalNetwork: true,
  nextPhase: "ORO-3C blocked until ORO-3B adapter contract smoke passes",
});

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function normalizeCallbackType(value) {
  return value === "transaction" ? "transaction" : "balance";
}

function normalizeTransactionType(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSignedAmount(input = {}) {
  const callbackType = normalizeCallbackType(input.callbackType);
  if (callbackType === "balance") return 0;

  const rawAmount = Number(input.amount);
  const transactionType = normalizeTransactionType(input.transactionType);
  if (!Number.isFinite(rawAmount)) return 0;
  if (transactionType === "bet") return -Math.abs(rawAmount);
  if (transactionType === "win") return Math.abs(rawAmount);
  return rawAmount;
}

function expectedAfterBalance(beforeBalanceExpected, signedAmount) {
  const before = Number(beforeBalanceExpected);
  if (!Number.isFinite(before)) return null;
  return before + signedAmount;
}

function classifyDirection(input = {}) {
  const callbackType = normalizeCallbackType(input.callbackType);
  if (callbackType === "balance") return "read";

  const transactionType = normalizeTransactionType(input.transactionType);
  if (transactionType === "bet") return "debit";
  if (transactionType === "win") return "credit";

  const signedAmount = normalizeSignedAmount(input);
  return signedAmount < 0 ? "debit" : "credit";
}

function normalizeBridgeInput(input = {}) {
  const callbackType = normalizeCallbackType(input.callbackType);
  const signedAmount = normalizeSignedAmount(input);
  const beforeBalanceExpected = hasValue(input.beforeBalanceExpected) ? Number(input.beforeBalanceExpected) : null;

  return {
    memberId: input.memberId || null,
    userCode: input.userCode || null,
    callbackType,
    transactionType: normalizeTransactionType(input.transactionType),
    transactionCode: input.transactionCode || null,
    roundId: input.roundId || null,
    vendorCode: input.vendorCode || null,
    gameCode: input.gameCode || null,
    amount: signedAmount,
    beforeBalanceExpected,
    afterBalanceExpected: expectedAfterBalance(beforeBalanceExpected, signedAmount),
    direction: classifyDirection(input),
    auditPreview: input.auditPreview || null,
  };
}

function buildOroplayWalletIntent(input = {}) {
  const normalized = normalizeBridgeInput(input);
  const intentKind =
    normalized.callbackType === "balance" ? "future_wallet_balance_read_intent" : `future_wallet_${normalized.direction}_intent`;

  return {
    kind: intentKind,
    phase: OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS.phase,
    memberId: normalized.memberId,
    userCode: normalized.userCode,
    callbackType: normalized.callbackType,
    transactionCode: normalized.transactionCode,
    roundId: normalized.roundId,
    vendorCode: normalized.vendorCode,
    gameCode: normalized.gameCode,
    direction: normalized.direction,
    amount: Math.abs(normalized.amount),
    signedAmount: normalized.amount,
    beforeBalanceExpected: normalized.beforeBalanceExpected,
    afterBalanceExpected: normalized.afterBalanceExpected,
    intentOnly: true,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildOroplayLedgerIntent(input = {}) {
  const normalized = normalizeBridgeInput(input);
  const entryType =
    normalized.callbackType === "balance" ? "no_ledger_entry_for_balance_read" : `game_provider_${normalized.direction}`;

  return {
    kind: "future_ledger_entry_intent",
    phase: OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS.phase,
    memberId: normalized.memberId,
    userCode: normalized.userCode,
    callbackType: normalized.callbackType,
    transactionType: normalized.transactionType,
    transactionCode: normalized.transactionCode,
    roundId: normalized.roundId,
    vendorCode: normalized.vendorCode,
    gameCode: normalized.gameCode,
    entryType,
    direction: normalized.direction,
    amount: Math.abs(normalized.amount),
    signedAmount: normalized.amount,
    beforeBalanceExpected: normalized.beforeBalanceExpected,
    afterBalanceExpected: normalized.afterBalanceExpected,
    intentOnly: true,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildOroplayTransactionLogIntent(input = {}) {
  const normalized = normalizeBridgeInput(input);

  return {
    kind: "future_game_transaction_log_intent",
    phase: OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS.phase,
    memberId: normalized.memberId,
    userCode: normalized.userCode,
    callbackType: normalized.callbackType,
    transactionType: normalized.transactionType,
    transactionCode: normalized.transactionCode,
    roundId: normalized.roundId,
    vendorCode: normalized.vendorCode,
    gameCode: normalized.gameCode,
    amount: normalized.amount,
    intentOnly: true,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildOroplayReconciliationIntent(input = {}) {
  const normalized = normalizeBridgeInput(input);

  return {
    kind: "future_reconciliation_intent",
    phase: OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS.phase,
    memberId: normalized.memberId,
    userCode: normalized.userCode,
    callbackType: normalized.callbackType,
    transactionType: normalized.transactionType,
    transactionCode: normalized.transactionCode,
    roundId: normalized.roundId,
    vendorCode: normalized.vendorCode,
    gameCode: normalized.gameCode,
    expectedWalletDelta: normalized.amount,
    beforeBalanceExpected: normalized.beforeBalanceExpected,
    afterBalanceExpected: normalized.afterBalanceExpected,
    checks: Object.freeze([
      "member_mapping",
      "idempotency",
      "wallet_delta",
      "ledger_entry",
      "transaction_log",
      "provider_callback_trace",
    ]),
    intentOnly: true,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function buildOroplayWalletLedgerBridgePlan(input = {}) {
  const normalized = normalizeBridgeInput(input);
  const walletIntent = buildOroplayWalletIntent(normalized);
  const ledgerIntent = buildOroplayLedgerIntent(normalized);
  const transactionLogIntent = buildOroplayTransactionLogIntent(normalized);
  const reconciliationIntent = buildOroplayReconciliationIntent(normalized);

  return {
    phase: OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS.phase,
    status: "bridge_plan_only",
    memberId: normalized.memberId,
    userCode: normalized.userCode,
    callbackType: normalized.callbackType,
    transactionCode: normalized.transactionCode,
    roundId: normalized.roundId,
    vendorCode: normalized.vendorCode,
    gameCode: normalized.gameCode,
    amount: normalized.amount,
    beforeBalanceExpected: normalized.beforeBalanceExpected,
    afterBalanceExpected: normalized.afterBalanceExpected,
    walletIntent,
    ledgerIntent,
    transactionLogIntent,
    reconciliationIntent,
    auditPreview: normalized.auditPreview,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function validatePlanSafety(plan) {
  const errors = [];
  const intentKeys = ["walletIntent", "ledgerIntent", "transactionLogIntent", "reconciliationIntent"];
  if (!plan || typeof plan !== "object") return ["bridge plan must be an object."];
  if (plan.mutationAllowed !== false) errors.push("bridge plan mutationAllowed must be false.");
  if (plan.prismaWriteAllowed !== false) errors.push("bridge plan prismaWriteAllowed must be false.");
  if (plan.liveRuntimeEnabled !== false) errors.push("bridge plan liveRuntimeEnabled must be false.");
  for (const key of intentKeys) {
    if (!plan[key]) errors.push(`${key} must exist.`);
    if (plan[key] && plan[key].mutationAllowed !== false) errors.push(`${key} mutationAllowed must be false.`);
    if (plan[key] && plan[key].prismaWriteAllowed !== false) errors.push(`${key} prismaWriteAllowed must be false.`);
  }
  return errors;
}

function validateOroplayWalletLedgerBridgeDesign() {
  const errors = [];
  const bet = buildOroplayWalletLedgerBridgePlan({
    memberId: "pg77-member-001",
    userCode: "ORO_VALID_001",
    callbackType: "transaction",
    transactionType: "bet",
    transactionCode: "TX_BRIDGE_BET_001",
    roundId: "ROUND_BRIDGE_BET_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
    amount: 25,
    beforeBalanceExpected: 1000,
  });
  const win = buildOroplayWalletLedgerBridgePlan({
    memberId: "pg77-member-001",
    userCode: "ORO_VALID_001",
    callbackType: "transaction",
    transactionType: "win",
    transactionCode: "TX_BRIDGE_WIN_001",
    roundId: "ROUND_BRIDGE_WIN_001",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
    amount: 75,
    beforeBalanceExpected: 1000,
  });
  const balance = buildOroplayWalletLedgerBridgePlan({
    memberId: "pg77-member-001",
    userCode: "ORO_VALID_001",
    callbackType: "balance",
    beforeBalanceExpected: 1000,
  });

  errors.push(...validatePlanSafety(bet));
  errors.push(...validatePlanSafety(win));
  errors.push(...validatePlanSafety(balance));

  if (bet.walletIntent.direction !== "debit") errors.push("bet must map to wallet debit intent.");
  if (win.walletIntent.direction !== "credit") errors.push("win must map to wallet credit intent.");
  if (bet.amount !== -25) errors.push("bet signed amount must be negative.");
  if (win.amount !== 75) errors.push("win signed amount must be positive.");
  if (balance.walletIntent.kind !== "future_wallet_balance_read_intent") {
    errors.push("balance callback must map to wallet balance read intent.");
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_WALLET_LEDGER_BRIDGE_DESIGN_STATUS,
  buildOroplayWalletIntent,
  buildOroplayLedgerIntent,
  buildOroplayTransactionLogIntent,
  buildOroplayReconciliationIntent,
  buildOroplayWalletLedgerBridgePlan,
  validateOroplayWalletLedgerBridgeDesign,
};
