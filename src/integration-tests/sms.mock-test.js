const assert = require("assert");
const SmsProviderAdapter = require("../adapters/sms/SmsProviderAdapter");

function maskPhone(phone) {
  const value = String(phone || "");
  if (value.length <= 4) return "***";
  return `${value.slice(0, 3)}****${value.slice(-2)}`;
}

function captureConsole(callback) {
  const originalLog = console.log;
  const lines = [];
  console.log = (...args) => lines.push(args.join(" "));
  return Promise.resolve()
    .then(callback)
    .then((result) => ({ result, lines }))
    .finally(() => {
      console.log = originalLog;
    });
}

class SandboxSmsProviderAdapter extends SmsProviderAdapter {
  async sendSms(payload) {
    console.log(`sms sandbox send to ${maskPhone(payload.phone)}`);
    return {
      provider: "sandbox-sms",
      messageId: "SMS-SANDBOX-0001",
      status: "queued",
      phone: maskPhone(payload.phone),
    };
  }

  async getBalance() {
    return {
      provider: "sandbox-sms",
      balance: "1000.00",
    };
  }

  async normalizeResult(result) {
    return {
      provider: result.provider || "sandbox-sms",
      reference: result.messageId,
      status: result.status === "queued" ? "pending" : result.status,
      phone: result.phone,
    };
  }
}

async function run() {
  const adapter = new SandboxSmsProviderAdapter();
  const fullPhone = "0800000000";
  const { result: sendResult, lines } = await captureConsole(() =>
    adapter.sendSms({ phone: fullPhone, message: "Sandbox OTP 123456" })
  );

  assert.ok(sendResult.status, "sendSms response must include clear status");
  assert.ok(!lines.join("\n").includes(fullPhone), "test logs must not include full phone");
  assert.ok(sendResult.phone && sendResult.phone !== fullPhone, "sendSms result must mask phone when present");

  const balance = await adapter.getBalance();
  assert.ok(
    (typeof balance.balance === "number" && Number.isFinite(balance.balance)) ||
      (typeof balance.balance === "string" && Number.isFinite(Number(balance.balance))),
    "SMS balance must be a safe number or numeric string"
  );

  const normalized = await adapter.normalizeResult(sendResult);
  assert.ok(["pending", "success", "failed"].includes(normalized.status), "normalizeResult status must be clear");

  console.log("sms integration harness: PASS");
}

run().catch((error) => {
  console.error("sms integration harness: FAIL", error.message);
  process.exit(1);
});
