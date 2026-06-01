# Member QR Deposit UX Contract

Phase AP status: Member QR Deposit UX / Mock QR Download.

This document defines a member-facing QR deposit UX contract and isolated mock behavior only. Phase AP does not create a real payment QR, does not connect a payment gateway, does not call external APIs, does not access production DB, does not add runtime money-flow, and does not auto-credit a member from QR download.

## Phase AP scope

- Define the member QR deposit UX contract for `providerKey = qr_payment_gateway`.
- Define mock/sandbox-only QR order and mock QR download artifact behavior.
- Align the mock QR order with `docs/PAYMENT_PROVIDER_CONTRACT.md` and the normalized deposit event contract from Phase AO.
- Provide a static/mock harness and smoke coverage only.
- Keep `live_after_certification` as documentation-only future language. It must not be activated in Phase AP.

## Safety boundary

- `providerMode` must be `mock` or `sandbox` only.
- no production DB
- no real money
- no real QR
- no real payment
- no live provider/payment/bank/SMS/Slip OCR
- no live TrueMoney
- no live TMNOne
- no live QR payment gateway
- no external network
- no payout
- no migration
- no deploy
- no runtime money-flow
- no credit/debit runtime action
- no auto-credit from QR download
- no hardcoded secret/token/password/PIN/deviceId/DATABASE_URL

## Member QR deposit UX overview

Member flow:

1. Member opens the QR deposit page.
2. Member enters a deposit amount.
3. System creates a mock QR deposit order.
4. System displays a QR mock preview.
5. Member clicks download QR mock.
6. System records that the mock QR was downloaded in the mock event.
7. System displays `pending_verification` / waiting verification status.
8. Downloading the QR must never credit the member.
9. If the QR expires, the UI must show `expired` and allow a refresh mock order action.
10. If a duplicate `orderId` or `providerTransactionId` is detected, the duplicate guard must reject it or mark `duplicate_suspect`.

## QR deposit states

Allowed Phase AP QR states:

- `idle`
- `amount_entered`
- `order_creating`
- `qr_ready`
- `qr_downloaded`
- `pending_verification`
- `matched_mock_only`
- `manual_review`
- `expired`
- `cancelled`
- `failed`

State rules:

- `expired` QR cannot be matched.
- `cancelled` QR cannot be matched.
- `matched_mock_only` is a mock marker only and is not a credit decision.
- `manual_review` is the boundary for any uncertain or duplicate-like event.
- `failed` must not create wallet movement.

## Mock QR order contract

Mock QR order fields:

| field | requirement |
| --- | --- |
| `providerKey` | Must be `qr_payment_gateway`. |
| `providerMode` | Must be `mock` or `sandbox`. |
| `orderId` | Stable mock order id used for idempotency and duplicate guard. |
| `memberId` | Member id for mock contract only. |
| `amount` | Positive finite amount. Zero and negative amounts are rejected. |
| `currency` | Currency code, default `THB`. |
| `createdAt` | ISO timestamp from the mock order creation moment. |
| `expiresAt` | ISO timestamp after `createdAt`. |
| `qrMockId` | Mock-only QR identifier. |
| `qrPayloadMockHash` | Mock-only payload hash marker; not a payment payload. |
| `qrDownloadFileName` | Mock download file name. |
| `qrDownloadMimeType` | Mock download MIME type, for example `text/plain`. |
| `qrDownloadAllowed` | Boolean. Must be false after expiry or cancel. |
| `qrPreviewAltText` | Must identify the QR as mock-only. |
| `status` | One of the QR deposit states. |
| `reviewRequired` | Boolean manual review marker. |
| `source` | Mock source marker such as `member_qr_deposit_mock`. |

Example mock-only order:

```json
{
  "providerKey": "qr_payment_gateway",
  "providerMode": "mock",
  "orderId": "qr-mock-order-001",
  "memberId": "member-mock-001",
  "amount": 100,
  "currency": "THB",
  "createdAt": "2026-06-01T00:00:00.000Z",
  "expiresAt": "2026-06-01T00:15:00.000Z",
  "qrMockId": "qr-mock-001",
  "qrPayloadMockHash": "mock-hash-qr-001",
  "qrDownloadFileName": "qr-mock-order-001-mock-qr.txt",
  "qrDownloadMimeType": "text/plain",
  "qrDownloadAllowed": true,
  "qrPreviewAltText": "Mock QR preview for sandbox deposit order qr-mock-order-001",
  "status": "qr_ready",
  "reviewRequired": false,
  "source": "member_qr_deposit_mock"
}
```

## Mock QR download contract

- Mock QR download must return a mock artifact only.
- Mock QR download must include a visible mock marker.
- Mock QR download must not contain a real payment QR payload.
- Mock QR download must not call a live QR provider.
- Mock QR download must never credit member.
- Mock QR download must record `qr_downloaded` in the mock order/event.
- Downloaded status only means the member saved the mock artifact. It is not proof of payment.

## Expiry / refresh / cancel behavior

- Mock QR orders must include `expiresAt`.
- Expired QR cannot be matched.
- Expired QR cannot be downloaded as an active payment request.
- Refresh creates a new mock order with a new `orderId` and new `qrPayloadMockHash`.
- Cancel changes status to `cancelled`.
- Cancelled QR cannot be matched.
- Cancelled QR cannot create wallet movement.

## Deposit event compatibility with Phase AO

Phase AP must normalize mock QR deposit activity into the Phase AO normalized deposit event contract:

```json
{
  "providerKey": "qr_payment_gateway",
  "providerEventId": "qr-mock-event-001",
  "providerTransactionId": "qr-mock-order-001",
  "orderId": "qr-mock-order-001",
  "memberId": "member-mock-001",
  "amount": 100,
  "currency": "THB",
  "occurredAt": "2026-06-01T00:00:00.000Z",
  "reference": "qr-mock-order-001",
  "rawHash": "mock-hash-qr-001",
  "confidence": "weak",
  "status": "pending",
  "reviewRequired": true,
  "source": "member_qr_deposit_mock"
}
```

This event remains mock-only. Any future real matching must wait for idempotency, duplicate guard, audit, reconciliation, sandbox evidence, and certification.

## Idempotency and duplicate guard

- Idempotency key must include `providerKey` and `orderId`.
- Duplicate `orderId` must be rejected or marked `duplicate_suspect`.
- Duplicate `providerTransactionId` must be rejected or marked `duplicate_suspect`.
- Duplicate `qrPayloadMockHash` must be rejected or marked `duplicate_suspect`.
- Duplicate guard must run before any future matching decision.
- Frontend must not decide duplicate state or credit posting.

## Manual review boundary

- QR download is not payment evidence.
- Mock downloaded status routes to `pending_verification`.
- Uncertain, expired, cancelled, duplicate, or inconsistent mock events route to `manual_review` or `duplicate_suspect`.
- Manual review is audit-only/mock-only in Phase AP.
- No admin approval, payout, credit, or debit action is added by this phase.

## Audit requirements

Future/mock audit actions should capture:

- `member.qr_deposit.order_created_mock`
- `member.qr_deposit.qr_downloaded_mock`
- `member.qr_deposit.order_expired_mock`
- `member.qr_deposit.order_cancelled_mock`
- `member.qr_deposit.duplicate_suspect_mock`

Audit payloads must include `providerKey`, `providerMode`, `orderId`, `memberId`, amount, currency, status, idempotency key, duplicate guard result, `qrPayloadMockHash`, and sanitized source marker. Audit in Phase AP is audit only / mock only; it must not create credit/debit runtime action and must not represent a real payment.

## Secret redaction requirements

- Do not hardcode secret/token/password/PIN/deviceId/DATABASE_URL.
- Do not print raw ENV secret values.
- Do not include provider credentials in docs, examples, mock artifacts, smoke output, or audit samples.
- Use mock ids and mock hashes only.
- Redact raw provider payloads in future phases before display or audit.

## No real QR / no real payment boundary

- QR mock must not be a QR that can be paid with real money.
- QR payload must be a mock marker only.
- QR download must create a mock artifact only.
- No live QR provider, live payment gateway, live bank, live SMS, live Slip OCR, or external network call is allowed in Phase AP.
- `live_after_certification` may be documented as a future mode label, but activation is blocked until Phase AT certification.

## No auto-credit boundary

- Download QR must never credit member.
- Preview QR must never credit member.
- Expiry, refresh, cancel, and duplicate guard must never credit member.
- Any future credit decision must be backend-side only and must wait for idempotency, audit, reconciliation, sandbox evidence, and Phase AT live certification.
