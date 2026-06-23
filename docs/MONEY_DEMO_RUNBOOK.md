# Money Demo Runbook

This runbook explains how to replay the PG77 money demo safely on a local machine.

## Safety Boundaries

- Local PostgreSQL only.
- Local backend only.
- Mock/sandbox provider modes only.
- No real money.
- No live bank rails.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No schema change.
- No migration.
- No secret values in docs, logs, screenshots, or chat.

## Local Defaults

Use the local demo values that are already used by the money demo pages and smoke flows.

- Site code: `PG77`
- Member demo page: `/member-money-demo/`
- Admin demo page: `/admin-money-demo/`
- Default member password: `localSmokeMember123`
- Default admin username: `local_money_flow_admin`
- Default admin password: `local-demo-admin-code-not-real`

## 1. Start PostgreSQL Locally

Use a local PostgreSQL instance listening on port `5432`.

If PostgreSQL is not already listening, start the local service or the local cluster with your machine's PostgreSQL installation.

Example Windows pattern used by this repo's local smoke runner:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\16\data" -l "$env:TEMP\pg77-postgres.log"
```

If your installation path differs, use the matching local PostgreSQL binary and data directory on your machine. Do not point at a remote or production database.

## 2. Set Local-Safe ENV

Set the environment in a separate shell before starting the backend.

```powershell
$env:NODE_ENV = "development-local"
$env:APP_ENV = "local-test"
$env:PORT = "4000"
$env:LOCAL_DB_URL = "<LOCAL_POSTGRES_URL>"
$env:APP_DB_URL = $env:LOCAL_DB_URL
$env:PUBLIC_API_BASE_URL = "http://localhost:4000"
$env:JWT_SECRET = "<LOCAL_TEST_JWT_SECRET>"
$env:LOCAL_ADMIN_PASSWORD = "<LOCAL_TEST_ADMIN_PASSWORD>"
$env:LOCAL_MEMBER_PASSWORD = "<LOCAL_TEST_MEMBER_PASSWORD>"
$env:GAME_PROVIDER_MODE = "mock"
$env:PAYMENT_PROVIDER_MODE = "mock"
$env:BANK_STATEMENT_MODE = "mock"
$env:SMS_PROVIDER_MODE = "mock"
$env:SLIP_OCR_MODE = "mock"
```

Keep the values local-only. Never reuse staging or production secrets here.
Map the local database URL into the repo's database environment variable in the shell you use to start the backend.

## 3. Start the Backend

Start the API from the repo root after the env is set.

```powershell
npm run dev
```

Confirm the health endpoint is up before opening the demo pages.

## 4. Open the Demo URLs

Open these pages in the browser:

- `/member-money-demo/`
- `/admin-money-demo/`

## 5. Manual Browser Checklist

Use the same browser session for the whole checklist so local storage and token state stay intact.

1. Create or re-login the member session.
   - Expected: session becomes `ready` only after token verification passes.
   - Expected: no 401/403 in the console after ready.
2. Approve the member bank account in the admin page.
   - Expected: member sees `Approved Bank Accounts = 1`.
   - Expected: the approved bank account appears in the withdrawal selector.
3. Create a deposit and reject it in the admin page.
   - Expected: pending deposits decrease by 1.
   - Expected: member refresh shows deposit status `rejected`.
   - Expected: wallet balance does not increase from the rejected deposit.
4. Create a new deposit and approve it.
   - Expected: member balance increases after refresh.
   - Expected: ledger and audit refresh with the approval entry.
5. Create a withdrawal and reject it.
   - Expected: pending withdrawals decrease by 1.
   - Expected: member refresh shows withdrawal status `rejected`.
   - Expected: wallet balance stays correct whether or not the system held funds during create.
6. Create a new withdrawal and approve it.
   - Expected: member balance decreases after refresh.
   - Expected: ledger and audit refresh with the approval entry.
7. Refresh member data.
   - Expected: wallet, ledger, bank accounts, deposits, and withdrawals all reload cleanly.
8. Check ledger and audit.
   - Expected: no `undefined`, no `NaN`, no broken rows, and no missing action summaries.

## 6. Console Checks

Verify the browser console stays clean during the ready state and after approve/reject actions.

- No `401` or `403` after session `ready`.
- No `undefined`.
- No `NaN`.
- No red error that breaks the flow.

## 7. Notes on Reject Flow

- Deposit reject must not change wallet balance.
- Withdrawal reject must not produce an incorrect balance.
- Bank account reject should only be used if the backend exposes the reject route.
- Do not guess routes that do not exist.
