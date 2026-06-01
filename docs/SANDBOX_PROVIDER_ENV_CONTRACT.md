# Phase AS Sandbox Provider ENV Contract

## Phase AS env scope

Phase AS defines sandbox provider environment placeholders only. It does not read real secrets, print secrets, connect to production DB, call live endpoints, call sandbox endpoints, or enable runtime payment/provider execution.

## Sandbox ENV naming convention

Provider mode keys use uppercase provider names and `_MODE`. Mode values stay mock or configured-not-called in Phase AS:

- `TRUEMONEY_OFFICIAL_MODE=mock` or `TRUEMONEY_OFFICIAL_MODE=sandbox_configured_not_called`
- `TMNONE_MODE=mock` or `TMNONE_MODE=sandbox_configured_not_called`
- `QR_PAYMENT_GATEWAY_MODE=mock` or `QR_PAYMENT_GATEWAY_MODE=sandbox_configured_not_called`
- `SLIP_VERIFICATION_MODE=mock` or `SLIP_VERIFICATION_MODE=sandbox_configured_not_called`
- `BANK_STATEMENT_MODE=mock` or `BANK_STATEMENT_MODE=sandbox_configured_not_called`
- `BANK_SMS_FALLBACK_MODE=manual_review_mock`
- `PAYMENT_PROVIDER_MODE=sandbox`
- `LEDGER_POSTING_MODE=mock_only`

## Secret redaction rules

All secret-like values must be redacted placeholders. Do not use real token, password, PIN, device id, database URL, authorization header, or live endpoint in Phase AS docs, harnesses, smoke tests, logs, or examples.

Safe placeholder values:

- `example.invalid`
- `sandbox-placeholder.invalid`
- `redacted-placeholder`
- `fake-sandbox-key`
- `fake-device-id`
- `fake-pin-redacted`

## Provider mode contract

Allowed Phase AS modes:

- `mock`
- `sandbox_configured_not_called`
- `sandbox_dry_run_only`
- `live_after_certification_only`

`live_after_certification_only` documents a future gate and must be blocked by Phase AS harnesses.

## Provider endpoint placeholder rules

Endpoint placeholders must use `example.invalid` or `sandbox-placeholder.invalid`. They are documentation/configuration placeholders only. The sandbox adapter must never call external network in Phase AS.

## Webhook/callback placeholder rules

Webhook and callback URLs are placeholder-only. Callback validation must use fake payload only and must not validate a real provider signature, call provider infrastructure, or expose a real authorization header.

## Local/staging separation

Local and staging readiness may store provider mode names and redacted placeholders. They must not use production DB, production credentials, live provider endpoints, live QR payment gateway, live TrueMoney, live TMNOne, live bank, live SMS, live Slip OCR, or payout rails.

## Forbidden ENV examples

Forbidden examples include real token, real password, real PIN, real device id, real database URL, real authorization header, and live endpoint. Do not paste provider console credentials into `.env`, docs, smoke output, or UAT evidence.

## Allowed fake placeholder examples

Allowed placeholder examples are `redacted-placeholder`, `fake-sandbox-key`, `fake-device-id`, `fake-pin-redacted`, `example.invalid`, and `sandbox-placeholder.invalid`. These values are not valid credentials and must not be used for real provider calls.

## No production DB boundary

Phase AS must not connect to production DB, seed production, migrate production, or read/write production payment data.

## No live credential boundary

Phase AS must not read, store, print, or validate live credentials. Real sandbox external calls require explicit later approval, and live provider enablement is only after Phase AT certification.
