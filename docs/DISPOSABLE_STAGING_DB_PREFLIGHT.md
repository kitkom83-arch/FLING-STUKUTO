# Disposable Staging DB Preflight

## 1. Phase AC status

Phase AC adds a disposable staging database preflight script and static smoke only. It checks environment labels and database target labels before any later database work is considered.

Phase AC remains safe preflight only:

- no DB connection.
- no migration.
- no seed.
- no deploy.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.

## 2. What the preflight script checks

The preflight script reads the database URL value from the process environment and parses it with the built-in URL parser. It then checks:

- the value exists.
- the value parses as a URL.
- protocol, hostname, port, database name, and masked username can be summarized without printing the raw value.
- hostname and database name do not include production-looking wording.
- `NODE_ENV` is not production.
- `APP_ENV` is not production.
- `STAGING_DB_DISPOSABLE_CONFIRM` is true.
- `STAGING_DB_DRY_RUN_ONLY` is true.
- provider modes are mock or sandbox as required for this phase.

## 3. What the preflight script does not do

The preflight script does not:

- connect to a database.
- run Prisma.
- run migration.
- run seed.
- deploy.
- call a network service.
- call a live provider/payment/bank/SMS/Slip OCR service.
- move real money.
- approve any later database operation.

## 4. Required ENV variables

Required key names and values:

- `DATABASE_URL`: present in the process environment and pointing to disposable staging/test database only.
- `STAGING_DB_DISPOSABLE_CONFIRM`: `true`.
- `STAGING_DB_DRY_RUN_ONLY`: `true`.
- `GAME_PROVIDER_MODE`: `mock`.
- `PAYMENT_PROVIDER_MODE`: `sandbox`.
- `BANK_STATEMENT_MODE`: `mock`.
- `SMS_PROVIDER_MODE`: `mock`.
- `SLIP_OCR_MODE`: `mock`.

Required production blockers:

- `NODE_ENV` must not be production.
- `APP_ENV` must not be production.

## 5. Safe output rules

Allowed output:

- protocol.
- hostname.
- port.
- database name.
- masked username.
- pass/fail status.
- safe failure reason without secret values.

Forbidden output:

- raw database URL value.
- password.
- token.
- JWT.
- authorization material.
- provider secret.
- full credential-bearing text.

## 6. Secret redaction rules

Evidence and logs must use non-secret labels only. The preflight summary may show hostname and database name because those are required classification labels, but it must never show raw connection text or password values.

Use safe wording in written notes:

- missing-value placeholder.
- invalid-number placeholder.
- object-string placeholder.
- unsafe rendered placeholder copy.

## 7. Production-looking DB block rules

Hostname and database name are scanned case-insensitively. Stop immediately if either includes:

- production.
- prod.
- live.
- primary.
- main-prod.
- real-money.
- payout-live.

Any match means the target is NO-GO for Phase AC. Do not continue into any later database command.

## 8. Provider mode requirements

Phase AC requires:

- `GAME_PROVIDER_MODE` set to mock.
- `PAYMENT_PROVIDER_MODE` set to sandbox.
- `BANK_STATEMENT_MODE` set to mock.
- `SMS_PROVIDER_MODE` set to mock.
- `SLIP_OCR_MODE` set to mock.

Live provider/payment/bank/SMS/Slip OCR modes are blocked by policy. Sandbox payment mode is allowed only as a non-real-money staging boundary.

## 9. Required commands

Syntax and static smoke:

```powershell
node --check src/staging-scripts/disposableStagingDbPreflight.js
node --check src/local-smoke-tests/disposableStagingDbPreflightSmoke.js
npm run smoke:disposable-staging-db-preflight
```

Operator preflight, only after the environment is known disposable/staging and safe:

```powershell
npm run staging:db:preflight
```

## 10. Expected PASS output

Expected safe success shape:

```text
Disposable staging DB target summary
- protocol: ...
- hostname: ...
- port: ...
- database name: ...
- username: ...
Disposable staging DB preflight: PASS
```

The output must not include raw connection text or password values.

## 11. Expected FAIL output

Expected safe failure shape:

```text
Disposable staging DB preflight: FAIL
- Safe failure reason without secret values.
```

Failure output must not print raw connection text, password values, token values, JWT values, provider secrets, or authorization material.

## 12. Operator evidence checklist

- [ ] Git branch and commit recorded.
- [ ] Safe CI result recorded.
- [ ] `node --check` results recorded.
- [ ] Static smoke result recorded.
- [ ] Disposable staging DB owner recorded.
- [ ] Hostname label recorded without raw connection text.
- [ ] Database name label recorded without raw connection text.
- [ ] Username label recorded only in masked form.
- [ ] Production-looking DB scan passed.
- [ ] `NODE_ENV` and `APP_ENV` production blockers passed.
- [ ] Disposable confirmation flag passed.
- [ ] Dry-run-only flag passed.
- [ ] Provider mode requirements passed.
- [ ] Evidence contains no secret values.

## 13. Stop conditions

Stop immediately when any condition appears:

- database URL value is missing or invalid.
- hostname or database name looks production-like.
- `NODE_ENV` is production.
- `APP_ENV` is production.
- disposable confirmation flag is missing or not true.
- dry-run-only flag is missing or not true.
- provider mode is not the required mock/sandbox value.
- raw connection text appears in logs or evidence.
- password, token, JWT, authorization material, or provider secret appears.
- any request is made to connect DB, run migration, run seed, deploy, use production DB, use real money, or enable live provider/payment/bank/SMS/Slip OCR.

## 14. Next phase boundary

Phase AC does not approve database execution. A later phase must explicitly name the target commit, disposable staging DB non-secret labels, backup owner, rollback owner, provider mode evidence, no-production DB evidence, no-real-money evidence, and final operator approval before any database operation is considered.

Until that later approval exists, keep the scope to docs/static smoke and safe preflight only.
