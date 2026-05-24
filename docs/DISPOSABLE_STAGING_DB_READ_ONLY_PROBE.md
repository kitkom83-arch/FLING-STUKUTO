# Disposable Staging DB Read-Only Connection Probe

## 1. Phase AE status

Phase AE adds a disposable staging database read-only connection probe pack. It performs an operator-approved DB connection and runs only read-only SQL probes against a disposable staging/test database target.

Phase AE remains read-only probe only:

- no migration.
- no seed.
- no deploy.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.
- no INSERT, UPDATE, DELETE, UPSERT, TRUNCATE, ALTER, DROP, or CREATE statements.

## 2. What the read-only probe checks

The probe script reads the database URL value from the process environment, parses it with the built-in URL parser, and checks:

- the value exists.
- the value parses as a PostgreSQL URL.
- protocol, hostname, port, database name, and masked username can be summarized without printing the raw value.
- hostname and database name do not include production-looking wording.
- `NODE_ENV` is not production.
- `APP_ENV` is not production.
- `STAGING_DB_DISPOSABLE_CONFIRM` is true.
- `STAGING_DB_DRY_RUN_ONLY` is true.
- `STAGING_DB_READ_ONLY_PROBE_CONFIRM` is true.
- provider modes are mock or sandbox as required for this phase.

## 3. What the read-only probe does

After all guards pass, the probe opens a Prisma connection and runs only read-only SQL:

- `SELECT 1` connection proof.
- `SHOW transaction_read_only` transaction state observation.
- `SELECT COUNT` from `information_schema.tables` for schema visibility.

The probe prints only safe labels and counts. It does not print raw connection text, password values, token values, provider secrets, or authorization material.

## 4. What the read-only probe does not do

The probe does not:

- run migration.
- run seed.
- deploy.
- mutate data.
- verify write denial by attempting a write.
- call a network service other than the approved database connection.
- call a live provider/payment/bank/SMS/Slip OCR service.
- move real money.
- approve any later database operation.

## 5. Required ENV variables

Required key names and values:

- `DATABASE_URL`: present in the process environment and pointing to disposable staging/test PostgreSQL database only.
- `STAGING_DB_DISPOSABLE_CONFIRM`: `true`.
- `STAGING_DB_DRY_RUN_ONLY`: `true`.
- `STAGING_DB_READ_ONLY_PROBE_CONFIRM`: `true`.
- `GAME_PROVIDER_MODE`: `mock`.
- `PAYMENT_PROVIDER_MODE`: `sandbox`.
- `BANK_STATEMENT_MODE`: `mock`.
- `SMS_PROVIDER_MODE`: `mock`.
- `SLIP_OCR_MODE`: `mock`.

Required production blockers:

- `NODE_ENV` must not be production.
- `APP_ENV` must not be production.

## 6. Safe output rules

Allowed output:

- protocol.
- hostname.
- port.
- database name.
- masked username.
- pass/fail status.
- public table count.
- transaction read-only state.
- safe failure reason without secret values.

Forbidden output:

- raw database URL value.
- password.
- token.
- JWT.
- authorization material.
- provider secret.
- full credential-bearing text.

## 7. Secret redaction rules

Evidence and logs must use non-secret labels only. The probe summary may show hostname and database name because those are required classification labels, but it must never show raw connection text or password values.

Use safe wording in written notes:

- missing-value placeholder.
- invalid-number placeholder.
- object-string placeholder.
- unsafe rendered placeholder copy.

## 8. Production-looking DB block rules

Hostname and database name are scanned case-insensitively. Stop immediately if either includes:

- production.
- prod.
- live.
- primary.
- main-prod.
- real-money.
- payout-live.

Any match means the target is NO-GO for Phase AE. Do not continue into any later database command.

## 9. Provider mode requirements

Phase AE requires:

- `GAME_PROVIDER_MODE` set to mock.
- `PAYMENT_PROVIDER_MODE` set to sandbox.
- `BANK_STATEMENT_MODE` set to mock.
- `SMS_PROVIDER_MODE` set to mock.
- `SLIP_OCR_MODE` set to mock.

Live provider/payment/bank/SMS/Slip OCR modes are blocked by policy. Sandbox payment mode is allowed only as a non-real-money staging boundary.

## 10. Runtime harness boundary

The runtime harness uses a synthetic injected DB client and synthetic environment values only. It does not use a real database connection value and does not connect to any database.

The harness proves that:

- the safe synthetic case passes.
- required guard failures fail closed.
- read-only query failures fail closed.
- protected synthetic values are not printed.
- the probe uses only read-only query calls in the harness.

## 11. Required commands

Syntax, static smoke, and synthetic runtime harness:

```powershell
node --check src/staging-scripts/disposableStagingDbReadOnlyProbe.js
node --check src/local-smoke-tests/disposableStagingDbReadOnlyProbeSmoke.js
node --check src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarness.js
node --check src/local-smoke-tests/disposableStagingDbReadOnlyProbeRuntimeHarnessSmoke.js
npm run smoke:disposable-staging-db-read-only-probe-static
npm run smoke:disposable-staging-db-read-only-probe-runtime-static
npm run smoke:disposable-staging-db-read-only-probe-runtime
```

Operator read-only connection probe, only after the environment is known disposable/staging and safe:

```powershell
npm run staging:db:read-only-probe
```

## 12. Expected PASS output

Expected safe success shape:

```text
Disposable staging DB read-only probe target summary
- protocol: ...
- hostname: ...
- port: ...
- database name: ...
- username: ...
Read-only connection probe: PASS
Transaction read-only state: ...
Schema visibility probe: PASS (...)
Disposable staging DB read-only probe: PASS
```

The output must not include raw connection text or password values.

## 13. Expected FAIL output

Expected safe failure shape:

```text
Disposable staging DB read-only probe: FAIL
- Safe failure reason without secret values.
```

Failure output must not print raw connection text, password values, token values, JWT values, provider secrets, authorization material, or real credentials.

## 14. Operator evidence checklist

- [ ] Git branch and commit recorded.
- [ ] Safe CI result recorded.
- [ ] `node --check` results recorded.
- [ ] Static smoke result recorded.
- [ ] Synthetic runtime harness result recorded.
- [ ] Disposable staging DB owner recorded.
- [ ] Hostname label recorded without raw connection text.
- [ ] Database name label recorded without raw connection text.
- [ ] Username label recorded only in masked form.
- [ ] Production-looking DB scan passed.
- [ ] `NODE_ENV` and `APP_ENV` production blockers passed.
- [ ] Disposable confirmation flag passed.
- [ ] Dry-run-only flag passed.
- [ ] Read-only probe confirmation flag passed.
- [ ] Provider mode requirements passed.
- [ ] Read-only connection probe result recorded.
- [ ] Evidence contains no secret values.

## 15. Stop conditions

Stop immediately when any condition appears:

- database URL value is missing or invalid.
- hostname or database name looks production-like.
- `NODE_ENV` is production.
- `APP_ENV` is production.
- disposable confirmation flag is missing or not true.
- dry-run-only flag is missing or not true.
- read-only probe confirmation flag is missing or not true.
- provider mode is not the required mock/sandbox value.
- raw connection text appears in logs or evidence.
- password, token, JWT, authorization material, or provider secret appears.
- any request is made to run migration, run seed, deploy, use production DB, mutate data, use real money, or enable live provider/payment/bank/SMS/Slip OCR.

## 16. Next phase boundary

Phase AE does not approve migration, seed, deploy, write access, production readiness, or live money movement. A later phase must explicitly name the target commit, disposable staging DB non-secret labels, backup owner, restore owner, rollback owner, provider mode evidence, no-production DB evidence, no-real-money evidence, no-live-provider/payment/bank/SMS/Slip OCR evidence, and final operator approval before any database write operation is considered.

Until that later approval exists, keep scope to read-only connection probe, synthetic runtime harness checks, static smoke, and documentation only.
