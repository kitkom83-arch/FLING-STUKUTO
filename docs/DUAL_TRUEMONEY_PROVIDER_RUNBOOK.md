# Dual TrueMoney Provider Runbook

Phase AO status: contract/mock only runbook for TrueMoney Official / Partner Gateway and TMNOne / tmn.one.

Safety boundary: mock/sandbox/staging only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no live TrueMoney, no live TMNOne, no live payout, no live transfer, no withdrawal approve, no credit/debit runtime action, no migration, no deploy, no hardcoded secret/token/password/PIN/deviceId/DATABASE_URL, and no external network calls in Phase AO.

## Provider Separation

TrueMoney Official / Partner Gateway and TMNOne / tmn.one are separate providers.

The frontend may show a customer-facing label such as `TrueMoney Wallet`, but the backend must keep separate `providerKey` values:

- `truemoney_official`
- `tmnone`

Provider-specific matching, idempotency, audit, limits, credentials, and reconciliation must stay separate.

## A. TrueMoney Official / Partner Gateway

Provider key: `truemoney_official`

Role:

- Official route.
- Long-term primary TrueMoney path.
- Mock/sandbox first.
- Live only after certification.
- Not real money in Phase AO.

Future contract:

- create payment order
- callback / webhook
- payment inquiry
- orderId / refId mapping
- duplicate transaction guard
- idempotency key
- audit log
- secret redaction
- no hardcoded credential

Required safety controls:

- Signed callback or equivalent provider verification before trusting a callback.
- Inquiry fallback before future credit posting.
- Order amount, member id, receiver, and reference must match.
- Provider event must pass idempotency + audit + reconciliation guard before future credit posting.
- Frontend must not decide credit posting.

## B. TMNOne / tmn.one

Provider key: `tmnone`

Role:

- Practical TrueMoney provider.
- Second TrueMoney rail.
- Mock/sandbox/internal first.
- Live only after certification.
- No live transfer now.
- No live withdrawal now.

Future contract:

- wallet balance inquiry
- transaction history
- transaction info
- deposit / receive matching
- backoffice-controlled transfer/withdrawal in future only
- per-user limit
- per-transaction limit
- daily limit
- role approval
- audit log
- duplicate lock
- configurable limits

Secret handling:

- PIN/token/device data must be secret only.
- PIN/token/device data must be stored in approved ENV or secret manager only in future phases.
- PIN/token/device data must not be committed, printed, pasted into docs, screenshots, tickets, chat, or smoke output.
- No hardcoded secret/token/password/PIN/deviceId/DATABASE_URL.

Required safety controls:

- Backoffice-controlled transfer/withdrawal is future-only and requires separate certification.
- Role approval is required before any future sensitive provider action.
- Daily, per-user, and per-transaction limits must be configurable.
- Duplicate lock must protect transaction history and transaction info matching.
- Audit log is required for future matching, inquiry, and any sensitive action.

## Operator Notes

- Use TrueMoney Official when official partner gateway coverage is available.
- Use TMNOne only as a separately configured rail with its own provider key and certification.
- Do not mix order ids, callback ids, transaction ids, limits, or credentials between the two providers.
- Do not use either provider for live payout or live transfer in Phase AO.
- If provider data is uncertain, route the deposit signal to manual_review.

## Phase AO Stop Conditions

Stop and do not continue if any of these appear:

- live provider mode
- production DB target
- real-money transaction
- live transfer
- live payout
- withdrawal approve
- runtime credit/debit action
- hardcoded credential
- external network call from mock harness
- frontend credit posting decision
