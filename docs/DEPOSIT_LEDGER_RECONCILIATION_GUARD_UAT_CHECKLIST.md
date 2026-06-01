# Deposit Ledger/Reconciliation Guard UAT Checklist

Phase AR UAT is docs/static/mock only for Ledger/Reconciliation Guard. It does not enable real QR, real payment, live provider, payout, production DB, external network, runtime ledger posting, wallet mutation, or auto-credit.

## Checklist

- [ ] Verified payment provider source becomes `ledger_posting_candidate_mock` only.
- [ ] QR downloaded source does not credit.
- [ ] QR downloaded source does not become ledger candidate.
- [ ] Expired QR source is rejected/manual review only.
- [ ] Cancelled QR source is rejected/manual review only.
- [ ] SMS fallback stays weak/manual_review.
- [ ] SMS-only cannot credit.
- [ ] SMS-only cannot become ledger candidate.
- [ ] Slip verified source can become ledger candidate mock.
- [ ] Slip uncertain source manual_review.
- [ ] Bank statement matched source can become ledger candidate mock.
- [ ] Bank statement unmatched source manual_review.
- [ ] Amount mismatch becomes `mismatch_review_required`.
- [ ] Member mismatch becomes `mismatch_review_required`.
- [ ] Currency mismatch becomes `mismatch_review_required`.
- [ ] Duplicate `orderId` rejected / `duplicate_suspect`.
- [ ] Duplicate `providerTransactionId` rejected / `duplicate_suspect`.
- [ ] Duplicate `rawHash` rejected / `duplicate_suspect`.
- [ ] Manual admin mock requires reason.
- [ ] Reconciliation snapshot does not mutate wallet.
- [ ] No ledger posting runtime action.
- [ ] No auto-credit.
- [ ] No real QR.
- [ ] No real payment.
- [ ] No external network.
- [ ] No production DB.
- [ ] No payout.
- [ ] No secret printed.
- [ ] No missing display value display.
- [ ] No invalid numeric display.
- [ ] No raw object display value display.

## Acceptance boundary

- `ledger_posting_candidate_mock` is not a ledger transaction.
- Mock recommendation must never credit member.
- Reconciliation result must never mutate wallet.
- SMS-only source must never create ledger posting candidate.
- QR downloaded source must never create ledger posting candidate.
- Expired QR source must be rejected or manual_review only.
- Cancelled QR source must be rejected or manual_review only.
- Manual admin source must require reason.
- Duplicate `orderId`, duplicate `providerTransactionId`, and duplicate `rawHash` route to duplicate review.
