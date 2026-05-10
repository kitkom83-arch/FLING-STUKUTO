# Smoke Coverage Index

## 1. Overview

This smoke suite is for local and staging/test safety checks of the PG77-real-core backend. It verifies guarded API behavior against safe local or staging/test PostgreSQL targets and must not be used against production databases.

The smoke suite does not send real money, does not connect real provider/payment/bank rails, and does not use production credentials. Game, payment, and bank boundaries are mock, sandbox, or manual local approval only. SMS and Slip OCR remain mock placeholders.

## 2. Smoke Scripts Summary

| Script | NPM command | Requires local DB? | Requires backend running? | Requires LOCAL_ADMIN_PASSWORD? | Runs in GitHub Actions? | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `moneyFlowSmoke.js` | `npm run smoke:money-flow` | Yes | Yes | Yes | Syntax check only | Manual local money-flow happy path and duplicate approval guards. |
| `coreApiSmoke.js` | `npm run smoke:core-api` | Yes | Yes | Yes | Syntax check only | Core member, wallet, promotion list, mock game launch, and admin read endpoints. |
| `financialNegativeSmoke.js` | `npm run smoke:financial-negative` | Yes | Yes | Yes | Syntax check only | Invalid money inputs, duplicate state transitions, ledger safety, and leak scans. |
| `promotionClaimSmoke.js` | `npm run smoke:promotion-claim` | Yes | Yes | No | Syntax check only | Promotion claim fixture, duplicate guard, count guards, and wallet/ledger effects. |
| `gameTransferSmoke.js` | `npm run smoke:game-transfer` | Yes | Yes | Yes | Syntax check only | Mock transfer-in/out and mock bet-history checks. |
| `adminReportsConfigSmoke.js` | `npm run smoke:admin-reports-config` | Yes | Yes | Yes | Syntax check only | Admin report endpoints and read-only site/config endpoints. |
| `runAllLocalSmoke.js` | `npm run smoke:all-local` | Yes | Yes | Yes | Syntax check only | Guarded local runner for syntax, project checks, all local smokes, secret grep, and diff check. |

GitHub Actions also scans `src/local-smoke-tests` for secret-shaped values. It does not run DB-backed smoke commands.

## 3. smoke:money-flow Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Admin login through the real local API.
- Member register through the real local API.
- Bank account pending status after registration.
- Admin bank account approve.
- Deposit create.
- Deposit approve.
- Duplicate deposit approve guard.
- Withdrawal create.
- Withdrawal approve.
- Duplicate withdrawal approve guard.
- Withdrawal mark-paid.
- Duplicate mark-paid guard.
- Final wallet balance check.
- Wallet ledger row count and amount checks.
- Admin log checks for deposit approve, withdrawal approve, and withdrawal mark-paid.

## 4. smoke:core-api Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Member auth guard for `/me` and `/wallet`.
- Admin auth guard for `/admin/me`.
- Member registration and login flow.
- Member `/me`.
- Wallet summary.
- Points summary.
- Wallet ledger.
- Promotions list.
- Mock game provider list.
- Mock game list.
- Mock game launch.
- Admin login.
- Admin `/me`.
- Admin logs.
- Admin members list.
- Admin deposits list.
- Admin withdrawals list.
- Response leak scan for responses read by the script.

## 5. smoke:financial-negative Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Unauthenticated member protected endpoint guard.
- Unauthenticated admin protected endpoint guard.
- Invalid deposit amount zero.
- Invalid deposit amount negative.
- Invalid withdrawal amount zero.
- Invalid withdrawal amount negative.
- Withdrawal over wallet balance.
- Duplicate deposit approve safety.
- Duplicate withdrawal approve safety.
- Duplicate mark-paid safety.
- Ledger safety, including stable row counts after duplicate/admin-log checks.
- Admin log checks for deposit approve, withdrawal approve, and withdrawal mark-paid.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

## 6. smoke:promotion-claim Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Unauthenticated promotion claim guard.
- Promotion list response.
- Local promotion fixture.
- Successful promotion claim.
- Duplicate claim guard.
- Invalid promotion id guard.
- `PromotionClaim` count guard.
- `TurnoverRequirement` count guard.
- Wallet/ledger effect guard.
- Response leak scan.

## 7. smoke:game-transfer Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Auth negative for transfer-in, transfer-out, and bet-history.
- Member login through the real local API.
- Mock game provider and game fixtures.
- Transfer-in wallet debit and ledger row.
- Transfer-out wallet credit and ledger row.
- Final wallet balance after mock transfers.
- Bet-history JSON row shape.
- Response leak scan.

## 8. smoke:admin-reports-config Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Public site config endpoint: `/site/config`.
- Admin auth negative for protected report/config endpoints.
- Admin login through the real local API.
- Report endpoints covered:
  - `/admin/reports/summary`
  - `/admin/reports/deposits`
  - `/admin/reports/withdrawals`
  - `/admin/reports/wallet-ledger`
- Site/config endpoints covered:
  - `/site/config`
  - `/admin/sites`
  - `/admin/sites/current/config`
  - `/admin/sites/:id`
  - `/admin/sites/:id/bank-accounts`
  - `/admin/sites/:id/game-providers`
  - `/admin/sites/:id/payment-configs`
- Read-only safety: coverage calls use GET/read-only endpoints and do not update config.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

## 9. smoke:all-local Coverage

`npm run smoke:all-local` runs a guarded sequence and stops on the first failure:

- All-local safety guard.
- Backend local health check.
- Syntax checks for:
  - `promotionClaimSmoke.js`
  - `moneyFlowSmoke.js`
  - `coreApiSmoke.js`
  - `gameTransferSmoke.js`
  - `financialNegativeSmoke.js`
  - `adminReportsConfigSmoke.js`
- `npm run check`.
- `npm run smoke:promotion-claim`.
- `npm run smoke:money-flow`.
- `npm run smoke:core-api`.
- `npm run smoke:game-transfer`.
- `npm run smoke:financial-negative`.
- `npm run smoke:admin-reports-config`.
- Secret grep over package/docs/README/local-smoke related files.
- `git diff --check`.
- Final PASS/FAIL summary.

## 10. GitHub Actions Safe CI Coverage

`.github/workflows/ci.yml` defines Safe CI for `push` and `pull_request`:

- Checkout.
- Setup Node.js 22 with npm cache.
- `npm ci`.
- `npx prisma validate`.
- `npx prisma generate`.
- `npm run check`.
- Direct smoke syntax checks for:
  - `moneyFlowSmoke.js`
  - `coreApiSmoke.js`
  - `financialNegativeSmoke.js`
  - `promotionClaimSmoke.js`
  - `gameTransferSmoke.js`
  - `adminReportsConfigSmoke.js`
  - `runAllLocalSmoke.js`
- Secret-shaped value scan over `package.json`, `README.md`, `src/local-smoke-tests`, and `.github`.

Safe CI does not run DB-backed smoke commands because those require a running backend, safe local/staging/test PostgreSQL, guarded environment variables, and local fixtures.

## 11. Required Local Runtime

To run local smoke commands, prepare:

- A local or staging/test PostgreSQL database.
- Prisma migrations applied to that database.
- The backend running locally at `http://localhost:4000/api` or another explicitly safe base URL.
- `NODE_ENV` set to `development-local` or `test` for most smoke scripts.
- `LOCAL_ADMIN_PASSWORD` set for admin-backed smoke scripts.
- `JWT_SECRET` set.
- `BASE_URL`, `CORE_API_BASE_URL`, or `PUBLIC_API_BASE_URL`, if set, must target local/staging/test and must not contain embedded credentials or production-like host markers.
- Provider/payment/bank/SMS/Slip OCR mode values must be unset, `mock`, or `sandbox`.

`moneyFlowSmoke.js` also allows `staging` for `NODE_ENV`. Other current smoke scripts shown above allow `development-local` or `test`.

## 12. Safe Commands

Run these only after the backend and safe local/staging/test environment are ready:

```bash
npm run smoke:all-local
npm run smoke:money-flow
npm run smoke:core-api
npm run smoke:financial-negative
npm run smoke:promotion-claim
npm run smoke:game-transfer
npm run smoke:admin-reports-config
npm run check
```

## 13. Mock / Sandbox Boundaries

- Game provider coverage uses mock/local fixtures and `MockGameProviderAdapter` behavior.
- Payment and bank money flow is manual local approval through the API and admin endpoints.
- No real provider API call is made by the current smoke suite.
- No real payment rail or bank rail is used.
- SMS is a mock placeholder.
- Slip OCR is a mock placeholder.
- Production DB targets are forbidden.
- Real provider/payment/bank integrations and production credential flows are outside current smoke coverage.

## 14. Known Coverage Gaps

Confirmed from current docs and scripts:

- Config POST/PUT endpoints are intentionally not covered by `smoke:admin-reports-config` because the smoke is read-only for config safety.
- Real provider integrations are not covered.
- Real payment and bank integrations are not covered.
- Production deployment smoke is not covered.
- Full end-to-end frontend coverage is not covered.
- docs/API.md still contains older "ต้องตรวจเพิ่ม" notes for some endpoints that are now covered by newer smoke scripts; ต้องตรวจเพิ่ม before using that section as the source of truth.

## 15. How to Add a New Smoke

1. Add the new smoke script under `src/local-smoke-tests`.
2. Reuse the existing local safety guard and response leak scan patterns.
3. Use local/staging/test only; do not connect production DB, real provider, real payment, or real bank systems.
4. Add an npm script in `package.json`.
5. Wire the command into `src/local-smoke-tests/runAllLocalSmoke.js`.
6. Add coverage notes in this file.
7. Run `node --check` for the new file and `runAllLocalSmoke.js`.
8. Run `npm run check`.
9. Run the new smoke and `npm run smoke:all-local` when a safe local runtime is available.
10. Run the secret-shaped value scan.
11. Run `git diff --check`.
12. Do not commit until checks and smokes pass.
