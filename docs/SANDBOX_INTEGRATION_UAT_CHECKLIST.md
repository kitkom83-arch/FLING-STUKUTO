# Phase AS Sandbox Integration UAT Checklist

## Phase AS checklist

- [ ] sandbox provider contract review
- [ ] sandbox env contract review
- [ ] provider mode mock only
- [ ] provider mode sandbox_configured_not_called
- [ ] external network blocked
- [ ] real secrets blocked
- [ ] fake payload accepted
- [ ] callback contract validated
- [ ] webhook contract validated
- [ ] idempotency key stable
- [ ] duplicate providerTransactionId guard
- [ ] duplicate rawHash guard
- [ ] duplicate orderId guard
- [ ] QR sandbox result does not credit
- [ ] TrueMoney sandbox result does not credit
- [ ] TMNOne sandbox result does not credit
- [ ] Slip sandbox uncertain manual_review
- [ ] Statement sandbox unmatched manual_review
- [ ] SMS fallback manual_review
- [ ] manual admin reason required
- [ ] ledger guard receives mock recommendation only
- [ ] no runtime ledger mutation
- [ ] no auto-credit
- [ ] no real QR
- [ ] no real payment
- [ ] no external network
- [ ] no production DB
- [ ] no payout
- [ ] no secret printed
- [ ] no missing display value / invalid numeric display / raw object display value display

## UAT safety notes

Phase AS is sandbox integration readiness only. It validates docs, contract shape, fake callback payloads, idempotency, duplicate guards, manual review routing, and ledger guard handoff as mock recommendations only. It does not enable live provider/payment/bank/SMS/Slip OCR, live TrueMoney, live TMNOne, real QR, real payment, production DB, payout, auto-credit, runtime money-flow, runtime ledger mutation, or external network execution in Phase AS.
