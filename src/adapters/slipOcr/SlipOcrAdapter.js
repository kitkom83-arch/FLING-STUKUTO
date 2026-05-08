class SlipOcrAdapter {
  constructor(config = {}) {
    this.config = config;
    // Real Slip OCR config must come from .env or database config. Do not hard-code secrets.
  }

  async verifySlip(fileOrPayload) {
    throw new Error("Not implemented");
  }

  async normalizeResult(result) {
    throw new Error("Not implemented");
  }
}

module.exports = SlipOcrAdapter;
