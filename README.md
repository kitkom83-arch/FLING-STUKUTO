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

Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

Set a real PostgreSQL URL and a long random JWT secret.

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pg77_real_core?schema=public
JWT_SECRET=replace-with-a-long-random-secret
```

## Prisma

Validate schema:

```bash
npm run prisma:validate
```

Run migration when PostgreSQL is available:

```bash
npm run prisma:migrate
```

Seed demo data:

```bash
npm run seed
```

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
Authorization: Bearer <jwt>
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
