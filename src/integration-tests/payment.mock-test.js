const assert = require("assert");
const PaymentProviderAdapter = require("../adapters/payment/PaymentProviderAdapter");

const STATUSES = new Set(["pending", "success", "failed"]);

function isDecimalSafe(value) {
  return typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
}

class SandboxPaymentAdapter extends PaymentProviderAdapter {
  constructor(config = {}) {
    super({ mode: "sandbox-harness", ...config });
    this.normalizedCallbacks = new Set();
  }

  async createDepositOrder(payload) {
    return {
      provider: "sandbox-payment",
      reference: payload.reference || "PAY-SANDBOX-0001",
      amount: String(payload.amount),
      status: "pending",
    };
  }

  async getDepositStatus(reference) {
    return {
      provider: "sandbox-payment",
      reference,
      amount: "100.00",
      status: "success",
    };
  }

  async verifyCallback(payload, signature) {
    return {
      verified: signature === "sandbox-valid-signature",
      reference: payload.reference,
    };
  }

  async normalizeCallback(payload) {
    const callbackId = payload.callbackId || `${payload.reference}:${payload.status}`;
    const duplicate = this.normalizedCallbacks.has(callbackId);
    this.normalizedCallbacks.add(callbackId);
    return {
      provider: "sandbox-payment",
      callbackId,
      reference: payload.reference,
      amount: String(payload.amount),
      status: STATUSES.has(payload.status) ? payload.status : "failed",
      duplicate,
      creditApplied: false,
    };
  }
}

async function run() {
  const adapter = new SandboxPaymentAdapter();
  const order = await adapter.createDepositOrder({
    userId: "user_sandbox",
    reference: "PAY-SANDBOX-0001",
    amount: "100.00",
  });
  assert.ok(order.reference, "createDepositOrder response must include reference");
  assert.ok(isDecimalSafe(order.amount), "createDepositOrder amount must be Decimal-safe");
  assert.ok(STATUSES.has(order.status), "createDepositOrder status must be valid");

  const status = await adapter.getDepositStatus(order.reference);
  assert.strictEqual(status.reference, order.reference, "getDepositStatus must keep reference");
  assert.ok(isDecimalSafe(status.amount), "getDepositStatus amount must be Decimal-safe");
  assert.ok(STATUSES.has(status.status), "getDepositStatus status must be valid");

  const verification = await adapter.verifyCallback({ reference: order.reference }, "sandbox-valid-signature");
  assert.strictEqual(verification.verified, true, "verifyCallback must verify sandbox signature");

  const callbackPayload = {
    callbackId: "CALLBACK-SANDBOX-0001",
    reference: order.reference,
    amount: "100.00",
    status: "success",
  };
  const normalized = await adapter.normalizeCallback(callbackPayload);
  const duplicate = await adapter.normalizeCallback(callbackPayload);
  assert.strictEqual(normalized.duplicate, false, "first callback must not be duplicate");
  assert.strictEqual(duplicate.duplicate, true, "duplicate callback must normalize as duplicate");
  assert.strictEqual(duplicate.creditApplied, false, "duplicate callback must not apply real credit");
  assert.ok(isDecimalSafe(duplicate.amount), "normalized callback amount must be Decimal-safe");
  assert.ok(STATUSES.has(duplicate.status), "normalized callback status must be valid");

  console.log("payment integration harness: PASS");
}

run().catch((error) => {
  console.error("payment integration harness: FAIL", error.message);
  process.exit(1);
});
