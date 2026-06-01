# Payment Provider Contract

Phase AO status: Payment Provider Contract / Dual TrueMoney Provider.

This document defines the contract, mock-only harness, and safety boundary for future multi-provider deposit verification. It does not connect real APIs, does not enable real money, does not enable live provider/payment/bank/SMS/Slip OCR, does not add runtime money-flow, does not add payout, does not approve withdrawal, does not add migration, and does not deploy.

## Phase AO scope

- Define provider keys and normalized deposit event contract.
- Define mock/sandbox/live-after-certification mode boundaries.
- Define idempotency, duplicate guard, manual review, audit, and secret redaction requirements.
- Provide isolated mock harness coverage only.
- Keep all provider flows mock/contract only in Phase AO.

## Provider list

| provider key | provider | Phase AO status |
| --- | --- | --- |
| `truemoney_official` | TrueMoney Official API / Partner Gateway | contract/mock only |
| `tmnone` | TMNOne / tmn.one | contract/mock only |
| `qr_payment_gateway` | QR Payment / Payment Gateway | contract/mock only |
| `slip_verification` | Slip Verification | contract/mock only |
| `bank_statement` | Statement API | contract/mock only |
| `bank_sms_fallback` | Bank SMS fallback | weak signal / manual_review only |
| `manual_admin` | Manual Admin fallback | manual review only |

## Safety boundary

- mock/sandbox/staging only
- no production DB
- no real money
- no live provider/payment/bank/SMS/Slip OCR
- no live TrueMoney
- no live TMNOne
- no payout
- no withdrawal approve
- no credit/debit runtime action in this phase
- no migration
- no deploy
- no hardcoded secret/token/password/PIN/deviceId/DATABASE_URL
- no external network calls
- frontend must not decide credit posting
- provider event must pass idempotency + audit + reconciliation guard before future credit posting

## Provider Mode

Allowed mode labels:

- `mock`
- `sandbox`
- `live_after_certification`

Phase AO permits mock contracts and isolated mock harness only. `live_after_certification` is a future label and must not be used to connect live providers until Phase AT Live Certification is complete.

## Normalized Deposit Event Contract

Every future provider signal must normalize into a single shape before matching, audit, reconciliation, or any future posting decision:

```json
{
  "providerKey": "truemoney_official",
  "providerEventId": "mock-event-001",
  "providerTransactionId": "mock-transaction-001",
  "orderId": "mock-order-001",
  "memberId": "mock-member-001",
  "amount": 100,
  "currency": "THB",
  "occurredAt": "2026-06-01T00:00:00.000Z",
  "receiverAccountMasked": "099***9999",
  "senderAccountMasked": "088***8888",
  "reference": "mock-reference-001",
  "rawHash": "mock-hash-001",
  "confidence": "verified",
  "status": "received",
  "reviewRequired": false,
  "source": "mock"
}
```

Allowed statuses:

- `received`
- `matched`
- `pending`
- `manual_review`
- `duplicate_suspect`
- `rejected`
- `expired`
- `failed`

Allowed confidence levels:

- `verified`
- `high`
- `medium`
- `weak`

## Idempotency Contract

- Idempotency key must include `providerKey` and a stable provider transaction identity.
- Preferred identity order: `providerTransactionId`, then `providerEventId`, then `rawHash`, then `orderId`.
- Duplicate `providerTransactionId` must be rejected or marked `duplicate_suspect`.
- Duplicate `rawHash` must be rejected or marked `duplicate_suspect`.
- Future credit posting must be blocked until idempotency, audit, and reconciliation pass.

## Duplicate Guard

Duplicate guard must check:

- provider key
- provider transaction id
- provider event id
- order id / ref id
- raw hash
- member id
- amount
- occurredAt tolerance window

Duplicate guard must be backend-side only. Frontend must not decide duplicate state or credit posting.

## Manual Review Rules

Manual review is required when:

- confidence is `weak`
- source is `bank_sms_fallback`
- slip verification is uncertain
- statement transaction is unmatched
- provider callback and inquiry disagree
- amount differs from order
- receiver account differs from expected masked account
- transfer time falls outside tolerance
- duplicate guard is inconclusive

Important SMS rule:

- SMS fallback must create weak signal only.
- SMS fallback default status = `manual_review`.
- SMS-only event must never credit member.
- The allowed state is `sms_detected -> manual_review`.
- forbidden state: `sms_detected -> credited`.

## Audit Requirements

Future provider deposit actions must audit:

- provider key
- provider event id
- provider transaction id
- order id / ref id
- idempotency key
- duplicate guard result
- before/after balance snapshot when future posting is approved
- actor or system source
- reason for manual admin fallback
- confidence and status
- reconciliation batch id when available
- site code

Audit snapshots must be sanitized and must not include raw credentials, raw provider secrets, raw request headers, raw bank credentials, raw SMS content, raw Slip OCR credentials, raw database connection strings, token values, passwords, PIN values, or device identifiers.

## Secret Redaction Requirements

- No hardcoded secret/token/password/PIN/deviceId/DATABASE_URL.
- Provider credentials must live only in approved ENV or secret manager paths in future phases.
- Mock harness must not read or print real ENV secret values.
- Logs and smoke output must use safe provider labels and mock ids only.
- Raw provider payloads must be hashed or redacted before audit display.

## No Live Money Boundary

Phase AO is contract/mock only:

- no real money
- no live TrueMoney
- no live TMNOne
- no live QR payment
- no live bank statement
- no live SMS
- no live Slip OCR
- no payout
- no withdrawal approve
- no runtime credit/debit action
- no runtime money-flow change

Live provider behavior is blocked until sandbox PASS, UAT PASS, reconciliation PASS, rollback PASS, audit PASS, permission PASS, secret scan PASS, and final approval in Phase AT.
