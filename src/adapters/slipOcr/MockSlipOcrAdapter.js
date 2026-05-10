const SlipOcrAdapter = require("./SlipOcrAdapter");

const SAFE_MODES = new Set(["mock", "sandbox"]);

function assertSafeMode(mode) {
  const normalized = String(mode || "mock").trim().toLowerCase();
  if (!SAFE_MODES.has(normalized)) {
    const error = new Error("Slip OCR mock is only available in mock or sandbox mode");
    error.statusCode = 400;
    throw error;
  }
}

class MockSlipOcrAdapter extends SlipOcrAdapter {
  constructor(config = {}) {
    super(config);
    assertSafeMode(config.mode);
  }

  async verifySlip(payload = {}) {
    if (payload.invalid === true || payload.result === "fail") {
      return {
        ok: false,
        source: "mock",
        mode: "mock",
        error: {
          code: "MOCK_SLIP_REJECTED",
          message: "Mock slip verification failed",
        },
      };
    }

    return {
      ok: true,
      source: "mock",
      mode: "mock",
      bank: "MOCK_BANK",
      account: "000-xxx-1001",
      amount: String(payload.amount || "100.00"),
      date: "2026-05-08T10:15:00.000Z",
      reference: payload.reference || "MOCK-SLIP-0001",
    };
  }

  async normalizeResult(result) {
    if (!result.ok) {
      return {
        ok: false,
        source: "mock",
        mode: "mock",
        error: {
          code: result.error && result.error.code ? result.error.code : "MOCK_SLIP_ERROR",
          message: result.error && result.error.message ? result.error.message : "Mock slip verification failed",
        },
      };
    }

    return {
      ok: true,
      source: "mock",
      mode: "mock",
      bank: result.bank,
      account: result.account,
      amount: normalizeAmount(result.amount),
      date: new Date(result.date).toISOString(),
      reference: result.reference,
    };
  }
}

function normalizeAmount(value) {
  const amount = Number(String(value));
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("Mock slip amount is invalid");
    error.statusCode = 400;
    throw error;
  }
  return amount.toFixed(2);
}

module.exports = MockSlipOcrAdapter;
