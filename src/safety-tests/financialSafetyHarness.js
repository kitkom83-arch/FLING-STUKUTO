const CREDIT_TYPES = new Set(["deposit", "admin_add_credit", "provider_callback"]);
const DEBIT_TYPES = new Set(["withdraw", "admin_remove_credit"]);

function toCents(value) {
  const input = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(input)) {
    throw new Error(`Invalid money amount: ${input}`);
  }
  const [whole, fraction = ""] = input.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function formatCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

function assertPending(row, message) {
  if (row.status !== "pending") {
    throw new Error(message);
  }
}

class FinancialSafetyHarness {
  constructor() {
    this.wallets = new Map();
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.ledger = [];
    this.adminLogs = [];
    this.processedProviderReferences = new Set();
    this.sequence = 1;
  }

  createUser({ id, balance = "0.00" }) {
    this.wallets.set(id, { userId: id, balanceCents: toCents(balance), currency: "THB" });
    return this.walletSummary(id);
  }

  walletSummary(userId) {
    const wallet = this.wallets.get(userId);
    if (!wallet) throw new Error("Wallet not found");
    return { userId, balance: formatCents(wallet.balanceCents), currency: wallet.currency };
  }

  createWalletMovement({ userId, type, amount, referenceType, referenceId, createdByType, createdById = null }) {
    if (!referenceType || !referenceId) {
      throw new Error("Wallet ledger reference_type and reference_id are required");
    }
    const wallet = this.wallets.get(userId);
    if (!wallet) throw new Error("Wallet not found");

    const positiveAmount = toCents(amount);
    const direction = CREDIT_TYPES.has(type) ? "credit" : DEBIT_TYPES.has(type) ? "debit" : null;
    if (!direction) throw new Error(`Unsupported ledger type: ${type}`);

    const balanceBefore = wallet.balanceCents;
    const balanceAfter = direction === "credit" ? balanceBefore + positiveAmount : balanceBefore - positiveAmount;
    if (balanceAfter < 0) throw new Error("Insufficient wallet balance");

    wallet.balanceCents = balanceAfter;
    const ledger = {
      id: `ledger_${this.sequence++}`,
      type,
      amount: formatCents(direction === "credit" ? positiveAmount : -positiveAmount),
      balanceBefore: formatCents(balanceBefore),
      balanceAfter: formatCents(balanceAfter),
      referenceType,
      referenceId,
      createdByType,
      createdById,
    };
    this.ledger.push(ledger);
    return { wallet: this.walletSummary(userId), ledger };
  }

  logAdminAction({ admin, action, targetType, targetId, before, after }) {
    const row = {
      id: `admin_log_${this.sequence++}`,
      adminId: admin.id,
      action,
      targetType,
      targetId,
      before,
      after,
    };
    this.adminLogs.push(row);
    return row;
  }

  createDeposit({ id, userId, amount }) {
    const row = { id, userId, amount: formatCents(toCents(amount)), status: "pending" };
    this.deposits.set(id, row);
    return row;
  }

  approveDeposit({ id, admin }) {
    const before = this.deposits.get(id);
    if (!before) throw new Error("Deposit not found");
    assertPending(before, "Deposit is not pending");
    const movement = this.createWalletMovement({
      userId: before.userId,
      type: "deposit",
      amount: before.amount,
      referenceType: "deposit",
      referenceId: before.id,
      createdByType: "admin",
      createdById: admin.id,
    });
    const after = { ...before, status: "approved", approvedById: admin.id };
    this.deposits.set(id, after);
    this.logAdminAction({ admin, action: "deposit.approve", targetType: "deposit", targetId: id, before, after });
    return { deposit: after, ...movement };
  }

  rejectDeposit({ id, admin, rejectReason }) {
    const before = this.deposits.get(id);
    if (!before) throw new Error("Deposit not found");
    if (!rejectReason) throw new Error("reject_reason is required");
    assertPending(before, "Deposit is not pending");
    const after = { ...before, status: "rejected", rejectReason };
    this.deposits.set(id, after);
    this.logAdminAction({ admin, action: "deposit.reject", targetType: "deposit", targetId: id, before, after });
    return after;
  }

  createWithdrawal({ id, userId, amount }) {
    const row = { id, userId, amount: formatCents(toCents(amount)), status: "pending" };
    this.withdrawals.set(id, row);
    return row;
  }

  approveWithdrawal({ id, admin }) {
    const before = this.withdrawals.get(id);
    if (!before) throw new Error("Withdrawal not found");
    assertPending(before, "Withdrawal is not pending");
    const movement = this.createWalletMovement({
      userId: before.userId,
      type: "withdraw",
      amount: before.amount,
      referenceType: "withdraw",
      referenceId: before.id,
      createdByType: "admin",
      createdById: admin.id,
    });
    const after = { ...before, status: "approved", approvedById: admin.id };
    this.withdrawals.set(id, after);
    this.logAdminAction({ admin, action: "withdraw.approve", targetType: "withdraw", targetId: id, before, after });
    return { withdrawal: after, ...movement };
  }

  rejectWithdrawal({ id, admin, rejectReason }) {
    const before = this.withdrawals.get(id);
    if (!before) throw new Error("Withdrawal not found");
    if (!rejectReason) throw new Error("reject_reason is required");
    assertPending(before, "Only pending withdrawal can be rejected");
    const after = { ...before, status: "rejected", rejectReason };
    this.withdrawals.set(id, after);
    this.logAdminAction({ admin, action: "withdraw.reject", targetType: "withdraw", targetId: id, before, after });
    return after;
  }

  markWithdrawalPaid({ id, admin }) {
    const before = this.withdrawals.get(id);
    if (!before) throw new Error("Withdrawal not found");
    if (before.status !== "approved") {
      throw new Error("Withdrawal must be approved before mark-paid");
    }
    const after = { ...before, status: "paid", paidById: admin.id };
    this.withdrawals.set(id, after);
    this.logAdminAction({ admin, action: "withdraw.mark_paid", targetType: "withdraw", targetId: id, before, after });
    return after;
  }

  adminAddCredit({ userId, admin, amount }) {
    const before = this.walletSummary(userId);
    const movement = this.createWalletMovement({
      userId,
      type: "admin_add_credit",
      amount,
      referenceType: "admin_credit",
      referenceId: admin.id,
      createdByType: "admin",
      createdById: admin.id,
    });
    this.logAdminAction({ admin, action: "credit.add", targetType: "user", targetId: userId, before, after: movement });
    return movement;
  }

  adminRemoveCredit({ userId, admin, amount }) {
    const before = this.walletSummary(userId);
    const movement = this.createWalletMovement({
      userId,
      type: "admin_remove_credit",
      amount,
      referenceType: "admin_credit",
      referenceId: admin.id,
      createdByType: "admin",
      createdById: admin.id,
    });
    this.logAdminAction({ admin, action: "credit.remove", targetType: "user", targetId: userId, before, after: movement });
    return movement;
  }

  applyProviderCallback({ userId, reference, amount }) {
    if (this.processedProviderReferences.has(reference)) {
      return { duplicate: true, creditApplied: false, wallet: this.walletSummary(userId) };
    }
    this.processedProviderReferences.add(reference);
    const movement = this.createWalletMovement({
      userId,
      type: "provider_callback",
      amount,
      referenceType: "provider_callback",
      referenceId: reference,
      createdByType: "provider",
    });
    return { duplicate: false, creditApplied: true, ...movement };
  }
}

module.exports = {
  FinancialSafetyHarness,
  formatCents,
  toCents,
};
