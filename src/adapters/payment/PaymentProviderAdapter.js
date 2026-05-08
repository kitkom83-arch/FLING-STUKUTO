class PaymentProviderAdapter {
  constructor(config = {}) {
    this.config = config;
    // Real provider config must come from .env or database config. Do not hard-code secrets.
  }

  async createDepositOrder(payload) {
    throw new Error("Not implemented");
  }

  async getDepositStatus(reference) {
    throw new Error("Not implemented");
  }

  async verifyCallback(payload, signature) {
    throw new Error("Not implemented");
  }

  async normalizeCallback(payload) {
    throw new Error("Not implemented");
  }
}

module.exports = PaymentProviderAdapter;
