class SmsProviderAdapter {
  constructor(config = {}) {
    this.config = config;
    // Real SMS provider config must come from .env or database config. Do not hard-code secrets.
  }

  async sendSms(payload) {
    throw new Error("Not implemented");
  }

  async getBalance() {
    throw new Error("Not implemented");
  }

  async normalizeResult(result) {
    throw new Error("Not implemented");
  }
}

module.exports = SmsProviderAdapter;
