# Disposable Staging DB Preflight Runtime Harness

## 1. Phase AD status

Phase AD adds a runtime harness for the disposable staging DB preflight script. It runs the preflight script with synthetic environment values only and records pass/fail behavior without connecting to any database.

Phase AD remains runtime-harness only:

- no real DATABASE_URL.
- no DB connection.
- no migration.
- no seed.
- no deploy.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.

## 2. What the runtime harness proves

The harness proves that `src/staging-scripts/disposableStagingDbPreflight.js` fails closed or passes as expected when executed as a child process with controlled synthetic ENV. It checks that the safe case exits successfully, required blocker cases exit non-zero, and output does not include protected synthetic values.

The harness does not prove database connectivity, migration readiness, seed readiness, deploy readiness, or production readiness.

## 3. Synthetic ENV only boundary

The harness builds a minimal child-process environment and injects only synthetic values needed by the preflight script. It does not use a real database connection value, production credentials, live provider keys, payment secrets, bank credentials, SMS credentials, or Slip OCR credentials.

Safe wording for evidence notes:

- missing-value placeholder.
- invalid-number placeholder.
- object-string placeholder.
- unsafe rendered placeholder copy.

## 4. No DB connection boundary

The runtime harness only starts Node against the preflight script and reads stdout/stderr. It does not open a socket, run Prisma, call an API, connect DB, migrate, seed, deploy, or call live provider/payment/bank/SMS/Slip OCR services.

Any request to add DB access, Prisma commands, migration commands, seed commands, deploy commands, live rails, or production DB access is out of scope for Phase AD.

## 5. Safe PASS case

The PASS case uses only synthetic staging/disposable labels:

- `NODE_ENV` is development-local.
- `APP_ENV` is staging.
- disposable confirmation is true.
- dry-run-only confirmation is true.
- database host and database name are synthetic staging/disposable labels.
- game, bank statement, SMS, and Slip OCR modes are mock.
- payment mode is sandbox.

Expected result: exit code `0` and `Disposable staging DB preflight: PASS`.

## 6. Required FAIL cases

The harness requires fail-closed behavior for:

- missing database connection value.
- production-looking hostname.
- production-looking database name.
- `NODE_ENV` set to production.
- `APP_ENV` set to production.
- missing disposable confirmation.
- missing dry-run-only confirmation.
- unsafe provider mode.

Expected result: non-zero exit and safe failure text without protected synthetic values.

## 7. Production-looking blocker tests

Production-looking hostname and database-name tests use synthetic labels that contain blocked production-looking wording. They must stop before any later operation is considered.

These tests do not use production DB, production hostnames, production database names, production service accounts, production credentials, or real customer data.

## 8. Provider mode blocker tests

Provider mode tests confirm that live-like modes fail closed. Phase AD allows only:

- `GAME_PROVIDER_MODE` mock.
- `PAYMENT_PROVIDER_MODE` sandbox.
- `BANK_STATEMENT_MODE` mock.
- `SMS_PROVIDER_MODE` mock.
- `SLIP_OCR_MODE` mock.

No live provider/payment/bank/SMS/Slip OCR behavior is enabled or called.

## 9. Redaction proof

The harness checks combined stdout/stderr for absence of:

- the full synthetic database connection value.
- the synthetic password value.
- authorization-shaped synthetic probe text.
- token-shaped synthetic probe text.

If any protected synthetic value appears in output, the harness fails.

## 10. Commands to run

```powershell
node --check src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarness.js
node --check src/local-smoke-tests/disposableStagingDbPreflightRuntimeHarnessSmoke.js
npm run smoke:disposable-staging-db-preflight-runtime-static
npm run smoke:disposable-staging-db-preflight-runtime
```

## 11. Expected PASS output

Expected safe success shape:

```text
Safe disposable staging DB case: PASS
Missing DATABASE_URL case: PASS
Production-looking hostname case: PASS
Production-looking database name case: PASS
NODE_ENV production case: PASS
APP_ENV production case: PASS
Missing disposable confirmation guard case: PASS
Missing dry-run guard case: PASS
Unsafe provider mode case: PASS
Redaction case: PASS
Disposable staging DB preflight runtime harness: PASS
```

The output must not include a full database connection value, password, token, authorization material, provider secret, or real credential.

## 12. Expected FAIL behavior

Expected safe failure shape:

```text
Disposable staging DB preflight runtime harness: FAIL
Safe failure reason without protected values.
```

Failure output must not print a full database connection value, password value, token value, JWT value, provider secret, authorization material, or real credential.

## 13. Stop conditions

Stop immediately when any condition appears:

- a real database connection value is requested.
- any DB connection is requested.
- Prisma execution is requested.
- migration is requested.
- seed is requested.
- deploy is requested.
- production DB is requested.
- real money or live payout is requested.
- live provider/payment/bank/SMS/Slip OCR mode is requested.
- auth guard, permission guard, audit guard, staging guard, or smoke strictness is reduced.
- protected synthetic values appear in output.

## 14. Next phase boundary

Phase AD does not approve database execution. A later phase must explicitly name the target commit, disposable staging DB non-secret labels, backup owner, restore owner, rollback owner, provider mode evidence, no-production DB evidence, no-real-money evidence, no-live-provider/payment/bank/SMS/Slip OCR evidence, and final operator approval before any database operation is considered.

Until that later approval exists, keep scope to synthetic runtime harness checks, static smoke, and documentation only.
