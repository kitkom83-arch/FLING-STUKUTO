# Payment Provider Mock UAT Checklist

Phase AO status: mock-only UAT checklist for Payment Provider Contract / Dual TrueMoney Provider.

Safety boundary: mock/sandbox/staging only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no live TrueMoney, no live TMNOne, no payout, no withdrawal approve, no credit/debit runtime action, no migration, no deploy, no hardcoded secret/token/password/PIN/deviceId/DATABASE_URL, and no external network calls.

## Mock Provider Checklist

- [ ] TrueMoney Official mock order normalizes with provider key `truemoney_official`.
- [ ] TrueMoney Official mock includes orderId/refId mapping.
- [ ] TrueMoney Official mock records idempotency and audit markers.
- [ ] TMNOne mock transaction history normalizes with provider key `tmnone`.
- [ ] TMNOne mock transaction info supports deposit/receive matching.
- [ ] TMNOne mock enforces configurable per-user, per-transaction, and daily limit markers.
- [ ] QR Payment mock QR order normalizes with provider key `qr_payment_gateway`.
- [ ] QR Payment mock includes QR download UX contract marker.
- [ ] QR Payment mock includes open full screen, copy amount, copy reference/orderId, upload slip fallback, callback/inquiry, payment status, expiration, and reconciliation markers.
- [ ] Slip Verification mock verified can become `matched`.
- [ ] Slip Verification uncertain result becomes `manual_review`.
- [ ] Statement API mock fetch normalizes with provider key `bank_statement`.
- [ ] Statement unmatched result becomes `manual_review`.
- [ ] SMS fallback mock event normalizes with provider key `bank_sms_fallback`.
- [ ] SMS fallback mock event always returns `manual_review`.
- [ ] SMS-only cannot credit.
- [ ] SMS fallback creates weak signal only.
- [ ] Duplicate providerTransactionId is rejected or marked duplicate_suspect.
- [ ] Duplicate rawHash is rejected or marked duplicate_suspect.
- [ ] Manual Admin fallback requires reason and audit markers.
- [ ] No secret printed.
- [ ] No live provider.
- [ ] No real money.
- [ ] No production DB.
- [ ] No payout.
- [ ] No withdrawal approve.
- [ ] No runtime money-flow change.

## Expected Mock Harness Results

- TrueMoney Official mock: PASS
- TMNOne mock: PASS
- QR Gateway mock: PASS
- Slip Verification verified: PASS
- Slip Verification uncertain -> manual_review: PASS
- Statement unmatched -> manual_review: PASS
- SMS fallback -> manual_review: PASS
- SMS-only cannot credit: PASS
- duplicate providerTransactionId guard: PASS
- duplicate rawHash guard: PASS
- no secret-shaped values in output: PASS
- no live provider mode allowed: PASS
- no real money marker: PASS

## Manual Review Rules

- SMS fallback is manual_review only.
- Uncertain slip verification is manual_review only.
- Unmatched statement transaction is manual_review only.
- Manual Admin fallback requires reason, admin id, audit log, and future dual control before any future posting path.
- Frontend must not decide credit posting.
- Provider event must pass idempotency + audit + reconciliation guard before future credit posting.
