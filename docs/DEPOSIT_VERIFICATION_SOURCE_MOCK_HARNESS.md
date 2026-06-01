# Deposit Verification Source Mock Harness

## Phase AQ scope

Phase AQ: Deposit Verification Source Mock Harness is docs/static/mock only. It builds on Phase AO Payment Provider Contract / Dual TrueMoney Provider and Phase AP Member QR Deposit UX / Mock QR Download. It defines source verification contracts, isolated normalization helpers, duplicate guard behavior, manual review routing, and local static smoke coverage only.

Phase AQ does not open runtime endpoints, connect a payment gateway, validate real money, connect banks, connect SMS, connect Slip OCR, create credit, create debit, create payout, run migrations, deploy, seed production, or use production DB.

## Safety boundary

- Mock/source verification contract only.
- No production DB.
- No real money.
- No real QR.
- No real payment.
- No live provider/payment/bank/SMS/Slip OCR.
- No live TrueMoney.
- No live TMNOne.
- No live QR payment gateway.
- No payout.
- No migration.
- No deploy.
- No runtime money-flow.
- No auto-credit from verification source.
- No external network.
- No hardcoded secret/token/password/PIN/deviceId/DATABASE_URL.

## Deposit verification source overview

A deposit verification source is a normalized mock signal that may help an operator or a future reconciliation guard understand why a member deposit order should remain pending, move to manual review, be rejected, or be considered matched by a later certified guard.

In Phase AQ, a matched source is only a mock contract status. It must not post wallet credit, ledger entries, payout, or any runtime money action.

## Source types

| source type | phase use | default outcome | safety |
| --- | --- | --- | --- |
| `qr_mock_order` | Mock QR order from Phase AP | `source_received` or `source_pending` | QR download source must never credit member. |
| `payment_provider_mock_event` | Mock provider event from Phase AO | `source_matched` only when expected identifiers and amount match | No live provider and no real payment. |
| `slip_verification_mock` | Mock slip verification result | `source_matched` for verified confidence; otherwise `source_manual_review` | No Slip OCR and no external network. |
| `bank_statement_mock` | Mock bank statement row | `source_matched` when matched; otherwise `source_manual_review` | No real bank and no production DB. |
| `bank_sms_fallback_mock` | Mock SMS fallback signal | `source_manual_review` | SMS fallback must be weak signal only. |
| `manual_admin_mock` | Future manual admin source | `source_manual_review` | Manual admin source must require reason. |

## Source confidence

Allowed confidence values:

- `verified`
- `high`
- `medium`
- `weak`

SMS fallback must always normalize to `weak`. Slip verification uncertain results must route to manual review. Bank statement unmatched results must route to manual review. Manual admin source requires a reason and remains review/audit evidence only.

## Verification statuses

- `source_received`
- `source_matched`
- `source_pending`
- `source_manual_review`
- `source_duplicate_suspect`
- `source_rejected`
- `source_expired`
- `source_cancelled`
- `source_failed`

## Match rules

- Payment provider mock event may become `source_matched` only when `orderId`, amount, and currency match expected mock order data.
- Verified slip verification mock may become `source_matched` only when expected order data matches.
- Bank statement mock may become `source_matched` only when the statement row is marked matched and expected order data matches.
- SMS fallback default status = `source_manual_review`.
- SMS fallback must be weak signal only.
- SMS-only source must never credit member.
- QR download source must never credit member.
- QR mock downloaded source remains `source_pending` or `source_manual_review`.
- Expired QR source must not be matched.
- Cancelled QR source must not be matched.
- A failed source must not be matched without a later separate source.

## Manual review rules

- SMS fallback default must manual_review.
- Slip verification uncertain result must become manual_review.
- Bank statement unmatched result must become manual_review.
- Manual admin source must require reason.
- Manual review is an audit/operator decision state only in Phase AQ.
- Manual review must not create credit, debit, payout, ledger entry, or provider action.

## Duplicate guard

Duplicate guard fields:

- Duplicate `orderId` rejected / duplicate_suspect.
- Duplicate `providerTransactionId` rejected / duplicate_suspect.
- Duplicate `rawHash` rejected / duplicate_suspect.

Duplicate source candidates must normalize to `source_duplicate_suspect` or `source_rejected`. They must not become matched and must not create member credit.

## Idempotency

The mock idempotency key is built from stable non-secret source fields:

- `sourceType`
- `orderId`
- `providerTransactionId`
- `rawHash`

The idempotency key is a mock-only guard marker. It is not a production settlement key and must not be used to post credit in Phase AQ.

## Audit requirements

Future/mock audit actions:

- `member.deposit_verification.source_received_mock`
- `member.deposit_verification.source_matched_mock`
- `member.deposit_verification.source_manual_review_mock`
- `member.deposit_verification.source_rejected_mock`
- `member.deposit_verification.duplicate_suspect_mock`
- `admin.deposit_verification.manual_review_mock`

Audit requirements:

- Audit only / mock only.
- No credit/debit runtime action.
- No real payment.
- No payout.
- No production DB.
- Admin manual review requires reason.
- Before/after snapshots must be masked and must not contain raw credentials, raw provider payload credentials, raw SMS credentials, raw bank credentials, or raw database URLs.

## Secret redaction requirements

- No secret-shaped values in examples.
- Do not hardcode or print secret/token/password/PIN/deviceId/DATABASE_URL.
- Do not print bearer-style authorization values.
- Do not print credential URLs.
- Do not print raw provider credentials or bank credentials.
- Do not print raw SMS or Slip OCR credentials.
- Mock identifiers must use safe values such as `mock-order-001`, `mock-provider-tx-001`, and `mock-raw-hash-001`.

## No auto-credit boundary

Verification source status must never auto-credit a member in Phase AQ. `source_matched` is only a mock contract state. Future credit posting requires a later ledger/reconciliation guard, audit proof, idempotency proof, rollback proof, and explicit approval.

## No real payment boundary

Phase AQ must not validate a real payment, real QR, real bank transfer, live TrueMoney, live TMNOne, live QR payment gateway, live provider callback, real SMS, or real Slip OCR result.

## No external network boundary

The contract, harness, and smoke must run locally with Node only. They must not call external APIs, payment gateways, banks, SMS providers, Slip OCR providers, or production services.
