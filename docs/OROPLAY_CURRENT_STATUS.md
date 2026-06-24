# OroPlay Current Status

ORO-0 status date: 2026-06-24.

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

- Transfer API verified end-to-end with sanitized live API evidence.
- Verified flow: create token, vendor list, game list, game detail, create user, user balance, deposit, launch, betting history, agent balance, withdraw-all cleanup, and balance history.
- Vendor list returned 44 vendors and included `slot-pgsoft`.
- Game list for `slot-pgsoft` returned 136 games.
- Game detail for `doomsday-rampg` returned `Doomsday Rampage`, slug `doomsday-rampg-by-pg-soft`, `isNew=true`, `underMaintenance=false`, and a sanitized thumbnail URL.
- Create user succeeded for `testuser_25690624224452`.
- User balance before deposit was `0`.
- Deposit of `10` returned balance `10`.
- Launch succeeded and the launch host was `m.pgf-oua7zy.com`; the full launch URL is intentionally not stored.
- Betting history returned 1 row with a `10.00` bet and `0.00` win, and balance moved from `10.00` to `0.00`.
- Agent balance is verified with `GET /agent/balance`, not POST.
- Withdraw-all cleanup completed with `amount=0`.
- Balance history recorded the deposit order with sanitized metadata.
- This evidence is transfer-side verification only; the Seamless Wallet callback workstream remains separate.
- Live-readiness blocker remains open: `POST /auth/createtoken` on `https://bs.sxvwlkohlv.com/api/v2` is still returning HTTP 401 with an empty body from the VPS diagnostic.
- Do not enable `OROPLAY_ENABLED=1` until the auth diagnostic returns 200 and the read-only balance smoke passes.
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
- Token values, secrets, and full launch URLs must not be stored in this repository.

## ORO-0 Boundary

- Docs/static only.
- No production DB.
- No real money runtime flow.
- No live provider calls.
- No runtime route/controller/service change.
- No migration.
- No deploy.
- No secret value.
