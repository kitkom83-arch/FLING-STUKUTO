# OroPlay Current Status

ORO-0 status date: 2026-06-01.

This document records the current safe repository understanding for OroPlay API / Seamless Wallet integration. It is docs/static only and does not enable runtime integration.

## Known Production Context

- OroPlay production admin is active.
- Production credit is active: about 1,000 USD credit / about 32,516.60 THB displayed in admin.
- Production API host: recorded outside the repository; intentionally omitted from this docs-only plan.
- Status check confirmation: previously returned a successful provider status in an external context; ORO-0 does not call it.
- Account code: recorded outside the repository; intentionally omitted from this docs-only plan.
- API mode shown in admin: Seamless Wallet.
- OroPlay documentation covers both Seamless Wallet and Balance Transfer API.
- Current production direction should be treated as Seamless Wallet unless confirmed otherwise.

## Test History Summary

- Transfer API test flow previously passed in the test environment.
- That prior test result does not authorize live production use from this repository.
- ORO-0 only records status and planning context before any mock, staging, callback, wallet, or provider runtime work.

## Risk Notes

- Cloned games statement must be treated as a provider/business risk until product ownership and game source are confirmed.
- USDT payment is irreversible; do not make a large top-up before certification evidence is complete.
- No large top-up before live certification gate, rollback evidence, ledger/reconciliation guards, and final approval.
- Seamless Wallet callback behavior can mutate wallet state in a future implementation, so no callback wallet mutation is allowed until idempotency, ledger, and reconciliation guards exist.

## Secret Handling

- No raw admin credential, provider credential, signing material, payment address credential, or messaging bot credential may be committed.
- Production credentials must remain outside the repository in approved secret storage.
- Sanitized docs may reference redacted provider/account labels only.

## ORO-0 Boundary

- Docs/static only.
- No production DB.
- No real money runtime flow.
- No live provider calls.
- No runtime route/controller/service change.
- No migration.
- No deploy.
- No secret value.
