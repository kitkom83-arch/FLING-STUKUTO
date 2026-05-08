class MockPaymentAdapter {
  async verifyDepositSlip() {
    return {
      verified: true,
      provider: "mock",
      message: "Mock payment verification only. No real bank or payment API is called.",
    };
  }
}

module.exports = MockPaymentAdapter;
