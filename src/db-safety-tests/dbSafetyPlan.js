const DB_SAFETY_CASES = [
  {
    id: "deposit-concurrent-approve",
    title: "deposit approve concurrent double request",
    expectation: "Only one approval may transition pending to approved, create one wallet ledger row, and credit once.",
  },
  {
    id: "withdraw-concurrent-approve",
    title: "withdraw approve concurrent double request",
    expectation: "Only one approval may transition pending to approved, create one wallet ledger row, and debit once.",
  },
  {
    id: "withdraw-concurrent-mark-paid",
    title: "withdraw mark-paid concurrent double request",
    expectation: "Only one mark-paid may transition approved to paid, and it must not create extra wallet ledger rows.",
  },
  {
    id: "provider-callback-duplicate-reference",
    title: "provider callback duplicate reference concurrent",
    expectation: "Duplicate callback references must be idempotent and must not credit wallet balance twice.",
  },
  {
    id: "wallet-ledger-rollback",
    title: "wallet ledger transaction rollback when operation fails",
    expectation: "A failed operation must roll back both wallet balance and ledger/audit rows.",
  },
];

module.exports = {
  DB_SAFETY_CASES,
};
