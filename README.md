# PG77 Real Core Backend

Backend Core API for the PG77 member system. This project is a real Node.js/Express API with Prisma models prepared for PostgreSQL, JWT authentication, bcrypt password hashing, wallet ledger rules, manual deposit/withdraw flows, admin logs, and mock game/payment/bank integrations.

This first version intentionally does not connect to real Game Provider, Payment, Bank, SMS, or Slip OCR APIs.

## Tech Stack

- Node.js
- Express
- Prisma
- PostgreSQL-ready
- JWT Auth
- bcrypt
- dotenv
- cors
- helmet
- zod
- JSON API only

## Install

```bash
npm install
```

## Environment

Create `.env` from `.env.example`. The real `.env` file must stay local and must never be committed.

```bash
cp .env.example .env
```

Set PostgreSQL, JWT, CORS, and provider configuration through environment variables. Keep real values out of source control, logs, issue trackers, and chat output.

## Prisma

Validate schema:

```bash
npm run prisma:validate
```

Run migration when PostgreSQL is available:

```bash
npm run prisma:migrate
```

Do not run migrations against production unless the target database, migration plan, backup, and rollback path have been verified.

For staging/test deploy migrations, do not run `npx prisma migrate deploy` directly. Use the guarded script only:

```bash
npm run db:migrate:staging
```

`db:migrate:staging` runs `src/db-safety-tests/dbSafetyGuard.js` before Prisma can deploy migrations. The guard must pass first, `DATABASE_URL` must target staging/test PostgreSQL only, and all provider modes must be `mock` or `sandbox`. Never use this command with a production database and never print `DATABASE_URL`, JWT secrets, API keys, tokens, provider secrets, or passwords.

Seed demo data:

```bash
npm run seed
```

Do not run seed against production.

Prisma technical debt: `package.json#prisma` is deprecated for Prisma 7. Migrate this to a Prisma config file before upgrading Prisma major versions.

## Deployment Safety

This project is a backend API, not a static demo. Do not deploy it to Netlify as a static site.

Use backend hosting that can run a Node.js process, such as Render, Railway, or a VPS. The API requires PostgreSQL and environment variables for database, auth, CORS, and provider settings.

Staging must use mock or sandbox provider modes for game, payment, bank statement, SMS, and Slip OCR integrations. Do not connect real provider credentials until sandbox callbacks, verification, IP allowlists, rollback, and audit logging are confirmed.

Do not commit local runtime files:

- `.env`
- `.server.err.log`
- `.server.out.log`
- `*.log`

Do not run `prisma migrate`, `prisma db seed`, or any real provider/payment/game/bank integration command against production from a local checkout.

## Staging Readiness

PG77-real-core is an Express backend API with Prisma and PostgreSQL. It is not a frontend bundle and must not be deployed to Netlify as a static site.

Staging must run on backend hosting that supports a long-running Node.js process, such as Render, Railway, or a VPS. Staging must use a PostgreSQL database that is separate from production.

Use `.env.staging.example` as the placeholder template for staging configuration. Never copy production secrets into staging, never commit real `.env` files, and never print database URLs, JWT secrets, provider API keys, tokens, or callback secrets.

Provider modes for staging must remain `mock` or sandbox until each real provider has signed sandbox credentials, callback verification, IP allowlists, timeout/retry rules, audit logging, and rollback instructions.

Production migration and seed commands must not be run from a local checkout:

- Do not run `prisma migrate deploy` against production from local.
- Do not run `prisma migrate dev` against production.
- Do not run `npm run seed` against production.
- Do not run DB-backed safety tests against production.

## Run

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm run start
```

Syntax check:

```bash
npm run check
```

## Local Money-Flow Smoke Test

The local money-flow smoke test exercises the manual admin approval path against a local, staging, or test PostgreSQL database only. It blocks production-like database targets, production-like API bases, and real provider modes before touching Prisma.

Run the backend first with the same safe `.env` or shell environment loaded:

```bash
npm run dev
```

In another shell, set a safe environment. Use your own local/staging/test values and do not print real secrets:

```powershell
$env:NODE_ENV = "development-local"
$env["DATABASE_URL"] = "<LOCAL_TEST_DATABASE_URL>"
$env:JWT_SECRET = "local-test-jwt-secret"
$env:LOCAL_ADMIN_PASSWORD = "local-admin-password"
$env:PUBLIC_API_BASE_URL = "http://localhost:4000"
```

Provider, payment, bank, SMS, and slip OCR modes must be unset, `mock`, or `sandbox`. They must never point at real provider, payment, bank, SMS, or slip OCR APIs for this smoke test.

Run the smoke test:

```bash
npm run smoke:money-flow
```

The script creates local-only fixtures for the `PG77` site and a `local_money_flow_admin` admin, registers a mock member, approves the member bank account, approves a 100.00 deposit, approves and marks paid a 10.00 withdrawal, checks the wallet final balance is 90.00, checks the two ledger rows, and verifies duplicate approval/mark-paid attempts are blocked without adding ledger rows.

## Demo Accounts

Admin:

- username: `admin`
- password: `admin123456`
- role: `super_admin`

Member:

- username: `ima00180`
- phone: `0800000000`
- password: `123456`
- balance: `11.09`
- points: `47.00`
- rank: `นางเงือกสาว`

## API Endpoints

Health:

- `GET /api/health`

Member auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`

Wallet and points:

- `GET /api/wallet`
- `GET /api/wallet/ledger`
- `GET /api/points`

Bank accounts:

- `GET /api/bank-accounts`
- `POST /api/bank-accounts`

Deposits:

- `POST /api/deposits`
- `GET /api/deposits`

Withdrawals:

- `POST /api/withdrawals`
- `GET /api/withdrawals`

Promotions:

- `GET /api/promotions`
- `POST /api/promotions/:id/claim`

Mock game:

- `GET /api/game/providers`
- `GET /api/game/providers/:provider/games`
- `POST /api/game/launch/mock`
- `POST /api/game/transfer-in/mock`
- `POST /api/game/transfer-out/mock`
- `GET /api/game/bet-history/mock`

Admin auth:

- `POST /api/admin/auth/login`
- `GET /api/admin/me`
- `GET /api/admin/logs`

Admin members:

- `GET /api/admin/members`
- `GET /api/admin/members/:id`
- `POST /api/admin/members/:id/block`
- `POST /api/admin/members/:id/unblock`
- `POST /api/admin/members/:id/credit/add`
- `POST /api/admin/members/:id/credit/remove`
- `POST /api/admin/members/:id/points/add`
- `POST /api/admin/members/:id/points/remove`

Admin bank accounts:

- `GET /api/admin/bank-accounts/pending`
- `POST /api/admin/bank-accounts/:id/approve`
- `POST /api/admin/bank-accounts/:id/reject`

Admin deposits:

- `GET /api/admin/deposits`
- `POST /api/admin/deposits/:id/approve`
- `POST /api/admin/deposits/:id/reject`

Admin withdrawals:

- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/:id/approve`
- `POST /api/admin/withdrawals/:id/reject`
- `POST /api/admin/withdrawals/:id/mark-paid`

Admin reports:

- `GET /api/admin/reports/summary`
- `GET /api/admin/reports/deposits`
- `GET /api/admin/reports/withdrawals`
- `GET /api/admin/reports/wallet-ledger`

## API Contract

### Response Format

Success responses use:

```json
{ "success": true, "data": {} }
```

Error responses use:

```json
{ "success": false, "message": "Error message", "errors": {} }
```

All API responses are JSON. Prisma decimal money values are serialized as strings with two decimals, for example `"0.00"`. `passwordHash` is stripped from responses, `undefined` values are removed or converted to `null`, and invalid numeric values such as `NaN` are converted to `null`.

### Auth Header

Member and admin protected endpoints require:

```http
Authorization header with bearer token
```

Member tokens are issued by `POST /api/auth/login`. Admin tokens are issued by `POST /api/admin/auth/login`.

### Error Format

Validation errors return HTTP 400 with `success: false`, a `message`, and structured `errors`. Authentication failures return HTTP 401. Authorization or blocked account failures return HTTP 403. Server errors return a generic message and never return stack traces in the response.

### Member API

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/wallet`
- `GET /api/points`
- `GET /api/wallet/ledger`
- `GET /api/bank-accounts`
- `GET /api/promotions`
- `POST /api/promotions/:id/claim`
- `GET /api/game/providers`
- `GET /api/game/providers/:provider/games`
- `POST /api/game/launch/mock`
- `POST /api/deposits`
- `GET /api/deposits`
- `POST /api/withdrawals`
- `GET /api/withdrawals`

### Admin API

- `POST /api/admin/auth/login`
- `GET /api/admin/me`
- `GET /api/admin/reports/summary`
- `GET /api/admin/members`
- `GET /api/admin/members/:id`
- `POST /api/admin/members/:id/block`
- `POST /api/admin/members/:id/unblock`
- `POST /api/admin/members/:id/credit/add`
- `POST /api/admin/members/:id/credit/remove`
- `POST /api/admin/members/:id/points/add`
- `POST /api/admin/members/:id/points/remove`
- `GET /api/admin/deposits`
- `POST /api/admin/deposits/:id/approve`
- `POST /api/admin/deposits/:id/reject`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/:id/approve`
- `POST /api/admin/withdrawals/:id/reject`
- `POST /api/admin/withdrawals/:id/mark-paid`
- `GET /api/admin/bank-accounts/pending`
- `POST /api/admin/bank-accounts/:id/approve`
- `POST /api/admin/bank-accounts/:id/reject`
- `GET /api/admin/logs`

Admin list endpoints support safe query parameters without changing the array response shape:

- `GET /api/admin/members?page=1&limit=50&search=ima&status=active`
- `GET /api/admin/deposits?page=1&limit=100&search=PGD&status=pending`
- `GET /api/admin/withdrawals?page=1&limit=100&search=PGW&status=pending`
- `GET /api/admin/logs?page=1&limit=100&search=deposit&status=deposit.approve`

### Mock Game API

- `GET /api/game/providers`
- `GET /api/game/providers/:provider/games`
- `POST /api/game/launch/mock`
- `POST /api/game/transfer-in/mock`
- `POST /api/game/transfer-out/mock`
- `GET /api/game/bet-history/mock`

Mock game endpoints use `MockGameProviderAdapter` only. They do not call real provider APIs.

### Current Mock Integrations

- Game Provider: `src/adapters/game/GameProviderAdapter.js`, `src/adapters/game/MockGameProviderAdapter.js`
- Payment/Bank: `src/adapters/payment/MockPaymentAdapter.js` and manual admin approval flows
- SMS: mock mode placeholder only, no real SMS API connected
- Slip OCR: mock mode placeholder only, no real OCR API connected

### Ready-to-connect Adapter List

The following skeleton adapters are ready for future real-provider wiring. Real provider config must come from `.env` or database config and must not be hard-coded.

- Game Provider: `src/adapters/game/GameProviderAdapter.js`
- Payment Provider: `src/adapters/payment/PaymentProviderAdapter.js`
- Bank Statement: `src/adapters/bank/BankStatementAdapter.js`
- SMS Provider: `src/adapters/sms/SmsProviderAdapter.js`
- Slip OCR: `src/adapters/slipOcr/SlipOcrAdapter.js`

## Real API Integration Plan

Real integrations must be enabled one provider line at a time. The current default mode for every external dependency is `mock`; do not switch any mode to a real provider until the provider document, sandbox credential, callback verification method, IP whitelist requirement, and rollback plan are confirmed.

Integration order:

1. Game provider sandbox
2. Payment provider sandbox
3. Bank statement sandbox/read-only feed
4. SMS sandbox
5. Slip OCR sandbox
6. Production credential handoff and controlled go-live

No real Game Provider, Payment, Bank, SMS, or Slip OCR API is connected in this backend version.

### Adapter Contract

Game Provider:

- `listProviders()`
- `listGames(providerCode)`
- `createPlayer(user)`
- `getBalance(user)`
- `transferIn(user, amount, reference)`
- `transferOut(user, amount, reference)`
- `launchGame(user, gameCode)`
- `getBetHistory(user, dateRange)`

Payment Provider:

- `createDepositOrder(payload)`
- `getDepositStatus(reference)`
- `verifyCallback(payload, signature)`
- `normalizeCallback(payload)`

Bank Statement:

- `listTransactions(dateRange)`
- `matchDeposit(deposit, transactions)`
- `normalizeTransaction(transaction)`

SMS Provider:

- `sendSms(payload)`
- `getBalance()`
- `normalizeResult(result)`

Slip OCR:

- `verifySlip(fileOrPayload)`
- `normalizeResult(result)`

### Required Provider Documents

Before implementing any real adapter, collect:

- Sandbox base URL and production base URL
- Auth method, signing algorithm, timestamp/nonce rules, and callback signature rules
- IP whitelist requirements for outbound calls and inbound callbacks
- Rate limits, idempotency keys, duplicate callback behavior, and retry policy
- Currency/decimal rules, timezone rules, and provider transaction status mapping
- Error code table and timeout guidance
- Test accounts, test games, test bank accounts, and sandbox callback examples

### Callback URL Plan

Future callback endpoints are reserved but not implemented until provider documents are available:

| Area | Future endpoint | Purpose | Verification requirement |
| --- | --- | --- | --- |
| Payment | `POST /api/callback/payment/:provider` | Deposit/payout status callback | Verify provider signature before state changes |
| Game | `POST /api/callback/game/:provider` | Bet settlement, balance, transfer callback | Verify provider signature and idempotency key |
| Bank | `POST /api/callback/bank/:provider` | Bank transaction feed callback | Verify source IP/signature before matching deposits |
| SMS | `POST /api/callback/sms/:provider` | Delivery status callback | Verify signature or provider token |
| Slip OCR | `POST /api/callback/slip-ocr/:provider` | Async OCR result callback | Verify signature and match original request reference |

All callback handlers must return the standard response format and must not alter wallet, deposit, withdraw, or points flows without going through existing service rules.

### Secret Handling

- Secrets must come from `.env` or encrypted database config, never source code.
- `.env.example` contains placeholders only.
- Do not log raw `Authorization`, token, password, API key, or secret values.
- Admin log metadata is sanitized for password/token/secret/API-key-like keys.
- API responses strip `passwordHash`, `apiKeyEncrypted`, and `secretEncrypted`.
- Production must set a real `JWT_SECRET`; the development fallback is blocked in production.

### IP Whitelist Checklist

- Confirm outbound server IP for provider dashboard.
- Confirm provider callback source IP ranges.
- Add firewall/WAF allow rules only after provider confirmation.
- Keep callback routes behind signature verification even when IP whitelist is enabled.
- Document emergency block/disable steps per provider.

### Sandbox Test Checklist

- Run provider sandbox login/auth handshake.
- Verify callback signature using provider examples.
- Verify idempotency for duplicate callbacks.
- Verify timeout and retry handling.
- Verify response normalization into existing `{ success, data }` / `{ success, message, errors }` shape.
- Verify no raw secret or provider token appears in API responses or admin logs.
- Verify money values remain strings with two decimals.

## Integration Sandbox Harness

The manual integration harness lives in `src/integration-tests/`. It validates adapter method contracts with in-memory sandbox adapters only. It does not call external networks, does not use real API credentials, does not write wallet ledgers, and does not change the PostgreSQL provider or seed data.

The harness is safe for staging readiness checks because it does not import Prisma, does not read `.env`, and does not call payment, bank, SMS, Slip OCR, or game provider networks.

### How to Run Integration Harness

Run individual harness checks:

```bash
npm run test:integration:payment
npm run test:integration:bank
npm run test:integration:sms
npm run test:integration:slip-ocr
npm run test:integration:game
```

Run the full harness:

```bash
npm run test:integration:all
```

Each command prints a short PASS/FAIL line only. Do not dump provider payloads, `.env`, headers, tokens, API keys, passwords, or secrets in test output.

### Adapter Test Checklist

- Payment: `createDepositOrder`, `getDepositStatus`, `verifyCallback`, and `normalizeCallback` must return a stable reference, Decimal-safe amount strings, valid status values, and duplicate callback normalization without applying credit.
- Bank: `listTransactions`, `matchDeposit`, and `normalizeTransaction` must return `amount`, `date`, `reference`, and `account`, with explicit `match` or `no-match` results and no `NaN` amounts.
- SMS: `sendSms`, `getBalance`, and `normalizeResult` must return clear delivery status, safe numeric balance, and masked phone output when logging is needed.
- Slip OCR: `verifySlip` and `normalizeResult` must return normalized `bank`, `account`, `amount`, `date`, and `reference`, plus a common error shape for invalid slips.
- Game: provider/game listing, player creation, balance, transfer in/out, launch, and bet history must require transfer references, return mock launch URLs, and keep all amounts non-NaN.

## Financial Safety Tests

The financial safety harness lives in `src/safety-tests/`. It uses in-memory state only and does not import Prisma, read `.env`, connect to PostgreSQL, call provider networks, or touch real wallet balances.

Run all financial safety checks:

```bash
npm run test:safety:all
```

Individual checks:

```bash
npm run test:safety:wallet
npm run test:safety:deposit
npm run test:safety:withdraw
npm run test:safety:admin-credit
npm run test:safety:provider-callback
```

Coverage:

- Deposit approve cannot run twice.
- Deposit reject after approve is blocked.
- Deposit approve after reject is blocked.
- Withdraw approve cannot run twice.
- Withdraw reject after approve is blocked.
- Withdraw mark-paid cannot run twice.
- Wallet movements must produce ledger rows with before and after balances.
- Admin add/remove credit must write audit rows.
- Duplicate provider callback references must not credit balance twice.

These tests are a backend safety baseline, not production deploy readiness. Staging still needs a separate PostgreSQL test database, migration verification, end-to-end admin approval tests, provider sandbox callback checks, and rollback validation before any production deploy.

## Guarded DB-backed Safety Suite

DB-backed financial safety tests are guarded and disabled for real database execution unless the target is explicitly confirmed as staging/test PostgreSQL. Production DBs are strictly forbidden.

Rules:

- Use this suite only with a confirmed staging/test PostgreSQL database.
- Never use a production database, production clone, production read replica, or production-like target.
- Never print `DATABASE_URL`, JWT secrets, API keys, tokens, provider secrets, passwords, or raw provider payloads.
- Provider modes must be `mock` or `sandbox` for game, payment, bank statement, SMS, and Slip OCR integrations.
- Do not run production migrations or production seed from a local checkout.
- Do not run raw `npx prisma migrate deploy`; use `npm run db:migrate:staging` for staging/test so `dbSafetyGuard` runs first.
- Do not connect real payment, provider, game, bank, SMS, or Slip OCR APIs from this suite.

Dry-run the plan without touching a database:

```bash
npm run test:db:safety:dry-run
```

The dry-run validates the planned cases and guard behavior with fake env values only. It does not import Prisma, open `.env`, connect to PostgreSQL, run migrations, run seed, or call providers.

The real DB-backed runner is guarded:

```bash
npm run test:db:safety
```

`test:db:safety` always runs `src/db-safety-tests/dbSafetyGuard.js` first and fails immediately if the guard blocks. The guard reads only the already-provided process environment; it does not load `.env` and it does not print the database URL or secret values.

Current DB-backed test coverage plan:

- Deposit approve concurrent double request: one status transition, one ledger row, one credit.
- Withdraw approve concurrent double request: one status transition, one ledger row, one debit.
- Withdraw mark-paid concurrent double request: one paid transition and no extra ledger rows.
- Provider callback duplicate reference concurrent: duplicate references do not credit twice.
- Wallet ledger transaction rollback: failed operations roll back wallet balance, ledger rows, and audit rows.

Before enabling real DB assertions, verify the target `DATABASE_URL` is staging/test only without printing the value. If a staging/test DB is not confirmed, run only the dry-run.

### Before Adding Real Provider

- Keep provider mode as `mock` or sandbox until provider documents are reviewed.
- Add real adapter code behind the existing skeleton contract without changing frontend or backoffice response contracts.
- Verify callback signature, idempotency, timeout, retry, status mapping, decimal handling, and timezone handling against provider examples.
- Route wallet, deposit, withdraw, and point changes through existing services only. Never update balances directly from an adapter.
- Confirm the harness passes before enabling any real sandbox credential.

### Provider Credential Checklist

- Store credentials in `.env` or encrypted database config only.
- Use sandbox credentials first; never commit real API keys, tokens, passwords, merchant secrets, or callback secrets.
- Mask any value whose key contains `password`, `token`, `secret`, `apiKey`, `api_key`, `apikey`, or `authorization`.
- Never log a full `.env` object or raw request headers.
- Rotate sandbox credentials before production handoff and document who owns provider dashboard access.

### Sandbox Test Result Format

Use this result format when reporting a harness run:

```text
Integration harness result:
- Payment: PASS/FAIL - note
- Bank: PASS/FAIL - note
- SMS: PASS/FAIL - note
- Slip OCR: PASS/FAIL - note
- Game: PASS/FAIL - note
- Secret leak check: PASS/FAIL - note
```

### Production Go-live Checklist

- Rotate sandbox credentials out and install production credentials through `.env` or encrypted database config.
- Confirm production base URL and callback URLs.
- Confirm IP whitelist is active on both sides.
- Run read-only smoke checks before enabling write operations.
- Enable one provider mode at a time.
- Monitor admin logs, wallet ledgers, deposit status, withdraw status, and callback failure counts.
- Keep rollback path to `mock` mode documented for each provider.

## Ledger Rule

Do not update `wallet_accounts.balance` directly in application code. All wallet balance changes must go through `wallet_ledgers`, recording:

- `transaction_id`
- `user_id`
- `type`
- `amount`
- `balance_before`
- `balance_after`
- `reference_type`
- `reference_id`
- `created_by_type`
- `created_by_id`
- `note`
- `created_at`

The service `src/services/wallet.service.js` is the single application path for wallet movements.

## Mock Integrations

Current mock-only areas:

- Game Provider: `MockGameProviderAdapter`
- Payment/Bank: `MockPaymentAdapter` and manual admin approval flows
- SMS: not connected
- Slip OCR: not connected

No real game provider API is called in this version.
