const DB_SAFETY_CASES = [
  {
    id: "deposit-concurrent-approve",
    title: "deposit approve concurrent double request",
    expectation: "Only one approval may transition pending to approved, create one wallet ledger row, and credit once.",
    concurrentActions: ["approveDeposit(requestA)", "approveDeposit(requestB)"],
    assertions: [
      "exactly one request succeeds",
      "deposit status is approved once",
      "wallet balance increases by the deposit amount once",
      "one wallet ledger row exists for the deposit reference",
      "one admin audit row exists for deposit.approve",
    ],
  },
  {
    id: "withdraw-concurrent-approve",
    title: "withdraw approve concurrent double request",
    expectation: "Only one approval may transition pending to approved, create one wallet ledger row, and debit once.",
    concurrentActions: ["approveWithdrawal(requestA)", "approveWithdrawal(requestB)"],
    assertions: [
      "exactly one request succeeds",
      "withdrawal status is approved once",
      "wallet balance decreases by the withdrawal amount once",
      "one wallet ledger row exists for the withdrawal reference",
      "one admin audit row exists for withdraw.approve",
    ],
  },
  {
    id: "withdraw-concurrent-mark-paid",
    title: "withdraw mark-paid concurrent double request",
    expectation: "Only one mark-paid may transition approved to paid, and it must not create extra wallet ledger rows.",
    concurrentActions: ["markWithdrawalPaid(requestA)", "markWithdrawalPaid(requestB)"],
    assertions: [
      "exactly one request succeeds",
      "withdrawal status is paid once",
      "paid timestamp is set once",
      "no additional wallet ledger row is created by mark-paid",
      "one admin audit row exists for withdraw.mark_paid",
    ],
  },
  {
    id: "provider-callback-duplicate-reference",
    title: "provider callback duplicate reference concurrent",
    expectation: "Duplicate callback references must be idempotent and must not credit wallet balance twice.",
    concurrentActions: ["processProviderCallback(reference)", "processProviderCallback(reference)"],
    assertions: [
      "exactly one callback applies credit",
      "duplicate callback is ignored or blocked",
      "wallet balance increases by the callback amount once",
      "one wallet ledger row exists for the provider callback reference",
      "duplicate attempt does not create a second ledger row",
    ],
  },
  {
    id: "wallet-ledger-rollback",
    title: "wallet ledger transaction rollback when operation fails",
    expectation: "A failed operation must roll back both wallet balance and ledger/audit rows.",
    concurrentActions: ["start wallet/ledger/audit transaction", "inject failure before commit"],
    assertions: [
      "operation returns a controlled failure",
      "wallet balance remains unchanged",
      "wallet ledger row is rolled back",
      "admin audit row is rolled back or a designed error log is written",
      "no partial financial state remains",
    ],
  },
];

module.exports = {
  DB_SAFETY_CASES,
};
