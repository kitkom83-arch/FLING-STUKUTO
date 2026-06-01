# Deposit Verification Source Mock UAT Checklist

Phase AQ: Deposit Verification Source Mock Harness is docs/static/mock only. It does not enable runtime endpoints, production DB, real money, real QR, real payment, live provider/payment/bank/SMS/Slip OCR, payout, migration, deploy, runtime money-flow, or auto-credit.

## Checklist

- [ ] QR mock order source received.
- [ ] QR mock downloaded source remains pending/manual review.
- [ ] QR mock expired cannot match.
- [ ] QR mock cancelled cannot match.
- [ ] Payment provider mock event matched.
- [ ] Slip verification mock verified matched.
- [ ] Slip verification uncertain manual_review.
- [ ] Bank statement mock matched.
- [ ] Bank statement unmatched manual_review.
- [ ] Bank SMS fallback manual_review.
- [ ] SMS-only cannot credit.
- [ ] Manual admin mock requires reason.
- [ ] duplicate orderId rejected.
- [ ] duplicate providerTransactionId rejected.
- [ ] duplicate rawHash rejected.
- [ ] no auto-credit.
- [ ] no real QR.
- [ ] no real payment.
- [ ] no external network.
- [ ] no production DB.
- [ ] no payout.
- [ ] no secret printed.
- [ ] no missing display value / invalid numeric display / raw object display value display.

## Required evidence

- `npm run smoke:deposit-verification-source` PASS.
- `node --check src/payment-provider-mock/depositVerificationSourceContract.js` PASS.
- `node --check src/payment-provider-mock/depositVerificationSourceMockHarness.js` PASS.
- `node --check src/local-smoke-tests/depositVerificationSourceSmoke.js` PASS.
- Manual browser not required because Phase AQ has no runtime member UI changes.

## Safety confirmation

- SMS fallback must stay weak and manual_review only.
- SMS-only source must never credit member.
- QR download source must never credit member.
- Expired QR source must not be matched.
- Cancelled QR source must not be matched.
- Duplicate orderId, duplicate providerTransactionId, and duplicate rawHash must be rejected or duplicate_suspect.
- Manual admin source must require reason.
- Future matched status is mock contract evidence only and must not create credit/debit runtime action.
