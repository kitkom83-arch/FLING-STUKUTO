const assert = require("assert");
const SlipOcrAdapter = require("../adapters/slipOcr/SlipOcrAdapter");

function isDecimalSafe(value) {
  return typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
}

class SandboxSlipOcrAdapter extends SlipOcrAdapter {
  async verifySlip(fileOrPayload) {
    if (!fileOrPayload || fileOrPayload.invalid === true) {
      return {
        ok: false,
        error: {
          code: "INVALID_SLIP",
          message: "Slip could not be verified in sandbox harness",
        },
      };
    }

    return {
      ok: true,
      bank: "SANDBOX_BANK",
      account: "123-xxx-7890",
      amount: "100.00",
      date: "2026-05-08T10:15:00.000Z",
      reference: "SLIP-SANDBOX-0001",
    };
  }

  async normalizeResult(result) {
    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.error && result.error.code ? result.error.code : "SLIP_OCR_ERROR",
          message: result.error && result.error.message ? result.error.message : "Slip OCR failed",
        },
      };
    }

    return {
      ok: true,
      bank: result.bank,
      account: result.account,
      amount: String(result.amount),
      date: new Date(result.date).toISOString(),
      reference: result.reference,
    };
  }
}

async function run() {
  const adapter = new SandboxSlipOcrAdapter();
  const valid = await adapter.normalizeResult(await adapter.verifySlip({ filename: "sandbox-slip.jpg" }));
  assert.strictEqual(valid.ok, true, "valid slip must normalize as ok");
  assert.ok(valid.bank, "valid slip must include bank");
  assert.ok(valid.account, "valid slip must include account");
  assert.ok(isDecimalSafe(valid.amount), "valid slip amount must be Decimal-safe");
  assert.ok(valid.date, "valid slip must include date");
  assert.ok(valid.reference, "valid slip must include reference");

  const invalid = await adapter.normalizeResult(await adapter.verifySlip({ invalid: true }));
  assert.strictEqual(invalid.ok, false, "invalid slip must normalize as error");
  assert.ok(invalid.error.code, "invalid slip error must include code");
  assert.ok(invalid.error.message, "invalid slip error must include message");

  console.log("slip-ocr integration harness: PASS");
}

run().catch((error) => {
  console.error("slip-ocr integration harness: FAIL", error.message);
  process.exit(1);
});
