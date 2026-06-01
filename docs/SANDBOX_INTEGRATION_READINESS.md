# Phase AS Sandbox Integration Readiness

## Phase AS scope

Phase AS defines the Sandbox Integration Readiness / Sandbox Adapter Boundary before Phase AT Live Certification. This phase is docs/static/sandbox-readiness only. It does not enable live provider calls, real sandbox API calls, external network calls, real secrets, production DB access, real QR, real payment, payout, runtime wallet mutation, auto-credit, or runtime ledger mutation.

## Safety boundary

- Sandbox adapter must never call external network in Phase AS.
- Sandbox adapter must never use real secrets in Phase AS.
- Sandbox result must never credit member.
- Sandbox result must never debit member.
- Sandbox result must never mutate wallet.
- Sandbox result must never post real ledger.
- Sandbox webhook/callback must be contract-only.
- Sandbox callback examples must use fake payload only.
- SMS fallback remains manual_review only.
- manual admin source must require reason.
- Ledger posting candidate remains mock recommendation only.
- Live provider enablement only after Phase AT certification.
- No secret-shaped values in examples.

## Sandbox Integration Readiness overview

Phase AS turns the Phase AO/AP/AQ/AR mock contracts into a single sandbox readiness boundary. The boundary answers whether each provider is ready for a later dry-run approval path without opening any live rail or external network execution in Phase AS.

Provider groups:

| provider group | purpose | Phase AS boundary |
| --- | --- | --- |
| `truemoney_official_sandbox` | TrueMoney Official / Partner Gateway readiness | contract-only, no live TrueMoney |
| `tmnone_sandbox` | TMNOne readiness | contract-only, no live TMNOne |
| `qr_payment_gateway_sandbox` | QR payment gateway readiness | no real QR, no real payment |
| `slip_verification_sandbox` | slip verification readiness | fake payload only, no Slip OCR call |
| `bank_statement_sandbox` | bank statement readiness | read-only contract, no bank call |
| `bank_sms_fallback_manual_review` | SMS fallback readiness | manual_review only |
| `manual_admin_sandbox` | manual admin review readiness | reason required |

Sandbox modes:

- `mock`
- `sandbox_configured_not_called`
- `sandbox_dry_run_only`
- `live_after_certification_only`

Sandbox readiness statuses:

- `sandbox_not_configured`
- `sandbox_configured_mock_only`
- `sandbox_ready_for_dry_run`
- `sandbox_dry_run_passed_mock`
- `sandbox_blocked_missing_config`
- `sandbox_blocked_secret_missing`
- `sandbox_blocked_external_call`
- `sandbox_failed_contract_check`
- `sandbox_manual_review_required`

## Relationship with Phase AO/AP/AQ/AR

- Phase AO provides the Payment Provider Contract / Dual TrueMoney Provider list, callback shape, duplicate guard, idempotency, audit, and secret redaction expectations.
- Phase AP provides Member QR Deposit UX / Mock QR Download boundaries. A QR download is not payment evidence and must never credit member.
- Phase AQ provides Deposit Verification Source Mock Harness source types and manual review routing.
- Phase AR provides Ledger/Reconciliation Guard handoff. Any ledger posting candidate remains a mock recommendation only.

## Sandbox provider boundary

The provider boundary accepts provider metadata, placeholder endpoints, redacted credential placeholders, callback placeholders, mode, and manual review reason where required. It rejects live provider mode, missing sandbox configuration, secret-shaped values, external network attempt markers, and runtime money mutation markers.

## Sandbox adapter interface

The sandbox adapter interface is contract-only:

- `createSandboxProviderConfig(input)` normalizes provider readiness config.
- `createSandboxDryRunRequest(input)` builds a fake dry-run request contract.
- `createSandboxDryRunResponse(input)` builds a mock result contract.
- `createSandboxCallbackPayload(input)` builds a fake callback/webhook payload.
- `normalizeSandboxIntegrationEvent(input)` normalizes dry-run/callback evidence.
- `buildSandboxIdempotencyKey(event)` creates a stable idempotency key.
- `evaluateSandboxReadiness(config)` returns a readiness status and block reasons.

## Sandbox request contract

A sandbox request contains provider key, mode, fake order id, fake provider transaction id, fake raw hash, fake amount, currency, idempotency key, and a `fakePayloadOnly` marker. It must not include real secret, real endpoint credential, production DB reference, real QR artifact, or live provider payload.

## Sandbox response contract

A sandbox response contains provider key, status, readiness status, idempotency key, recommendation, manual review marker, and safety booleans. It must keep `canCreditMember`, `canDebitMember`, `walletMutated`, `runtimeLedgerMutation`, `ledgerPosted`, `autoCredit`, `externalNetworkCalled`, and `realMoneyFlow` false.

## Sandbox callback/webhook readiness contract

Callback and webhook validation is fake payload only. Phase AS may validate shape, provider key, order id, provider transaction id, raw hash, idempotency key, duplicate markers, and audit action names. It must not validate a real provider signature, call an external callback URL, or store callback evidence in production DB.

## Sandbox reconciliation readiness

Sandbox reconciliation readiness maps dry-run and callback payloads into mock reconciliation evidence only. Uncertain slip verification, unmatched statement evidence, SMS fallback, duplicate markers, or manual admin sources route to `manual_review`.

## Sandbox ledger guard handoff

Phase AS may hand off a `ledger_posting_candidate_mock` recommendation to the Phase AR guard. The candidate remains a mock recommendation only and must never become runtime ledger posting, wallet credit, wallet debit, or auto-credit.

## Sandbox failure handling

Failures must be explicit and safe:

- missing provider config maps to `sandbox_blocked_missing_config`.
- missing redacted placeholder maps to `sandbox_blocked_secret_missing`.
- secret-shaped value maps to `sandbox_failed_contract_check`.
- external network attempt maps to `sandbox_blocked_external_call`.
- live provider mode maps to `sandbox_failed_contract_check`.
- uncertain or weak evidence maps to `sandbox_manual_review_required`.

## Idempotency

Idempotency uses provider key plus the strongest stable fake identity available: provider transaction id, order id, or raw hash. The same fake payload must produce the same idempotency key.

## Duplicate guard

The sandbox boundary checks duplicate `orderId`, duplicate `providerTransactionId`, and duplicate `rawHash`. Duplicate evidence routes to manual review or duplicate suspect and must not credit, debit, mutate wallet, or post ledger.

## Audit requirements

Phase AS audit actions are future/mock only. Audit events must record provider key, mode, readiness status, block reason, idempotency key, manual review reason where required, and redacted placeholder markers. Audit only / mock only means no credit/debit runtime action, no ledger posting runtime action, no real payment, and no external network execution in Phase AS.

## Secret redaction requirements

Examples may use `example.invalid`, `sandbox-placeholder.invalid`, `redacted-placeholder`, `fake-sandbox-key`, `fake-device-id`, and `fake-pin-redacted`. Examples must not contain real token, password, PIN, device id, database URL, authorization header, or live endpoint.

## No live provider boundary

`live_after_certification_only` is a future certification marker and must be blocked in Phase AS execution. Live TrueMoney, live TMNOne, live QR payment gateway, live bank, live SMS, live Slip OCR, and live payout are not allowed.

## No real payment boundary

Phase AS has no real payment, no real QR, no payout, no production DB, no live provider/payment/bank/SMS/Slip OCR, and no runtime money-flow.

## No auto-credit boundary

Sandbox result must never credit member, debit member, mutate wallet, post real ledger, or auto-credit from sandbox result.

## No runtime ledger mutation boundary

Runtime ledger mutation is blocked. Phase AS may produce mock recommendations for Phase AR only.

## No external network execution boundary in Phase AS

No external network execution is allowed in Phase AS. Sandbox endpoints are placeholders only and must not be called until a later phase is explicitly approved.
