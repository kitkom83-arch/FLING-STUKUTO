# Financial Ledger Staging Dry-Run Migration Plan

## 1. Phase V Scope

Phase V is dry-run migration only for a staging/disposable DB only.

Status: NOT production ready.

- staging/disposable DB only
- no production DB
- dry-run migration only
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no deploy
- no seed
- no runtime money flow change
- no Prisma migration apply
- no live provider, payment, bank, SMS, or Slip OCR connection

This plan does not authorize production migration, production database access, real-money movement, live payout, live provider/payment/bank/SMS/Slip OCR, deploy, seed, or runtime money-flow changes.

## 2. Preconditions

Phase V must not continue unless all preconditions are true and recorded as evidence:

- working tree clean
- latest commit `077311e Add financial ledger live integration certification checklist` verified
- Safe CI PASS verified for commit `077311e`
- Phase P/Q/R/S/T/U docs reviewed
- disposable/staging DB identified
- production DB prohibited
- staging/disposable DB only boundary confirmed
- no production DB credential available to the dry-run shell
- no real money, no live payout, and no live provider/payment/bank/SMS/Slip OCR modes enabled

If a disposable/staging DB is not identified, mark the dry-run status as NOT EXECUTED and stop before any database command.

## 3. Allowed Commands

Allowed commands are limited to:

- `prisma migrate diff` for dry-run only
- `pg_dump` or equivalent only against staging/disposable DB
- `pg_restore` or equivalent only against staging/disposable DB
- `npm run check`
- `npm run smoke:financial-ledger-staging-dry-run-migration`
- smoke tests that are static/local or explicitly guarded for staging/disposable targets

Every command must avoid printing connection strings, passwords, tokens, secrets, or credential-shaped values.

## 4. Forbidden Commands

Forbidden commands in Phase V:

- `prisma migrate deploy`
- `prisma migrate dev`
- `prisma db push`
- seed commands
- deploy commands
- any production/live connection
- any command that writes to a production DB
- any command that enables real money
- any command that enables live payout
- any command that enables live provider/payment/bank/SMS/Slip OCR

If a command or environment value looks production-like, stop immediately and record the stop condition without printing secrets.

## 5. Dry-Run Procedure

1. Identify the disposable/staging database.
2. Confirm the environment guard:
   - target name must include local, test, staging, sandbox, disposable, or qa
   - target name must not include prod, production, live, primary, real, main, or master
   - `NODE_ENV` must not be production
   - external provider/payment/bank/SMS/Slip OCR modes must be mock, sandbox, disabled, or absent
3. Confirm the connection info is redacted before evidence capture.
4. Run schema diff only with `prisma migrate diff`.
5. Capture a summary of the diff result.
6. Do not apply migration.
7. Do not run seed.
8. Do not deploy.
9. If the diff is unexpected, stop and record the failure criteria.

No command in this procedure may connect to production DB or change runtime money flow.

## 6. Evidence Format

Record evidence with this shape:

- command name
- timestamp
- env classification: staging/disposable only
- redacted connection info
- result
- no secret output

Evidence must never include raw database URLs, passwords, tokens, secrets, auth header values, private keys, or provider credentials.

Example status labels:

- `EXECUTED on staging/disposable DB`
- `NOT EXECUTED because no staging/disposable DB configured`
- `STOPPED because target looked production-like`

## 7. Failure Criteria

Stop immediately if:

- env looks production-like
- target host, database name, app label, or env name includes prod, production, live, primary, real, main, or master
- schema diff is unexpected
- backup/restore cannot be proven safely
- rollback proof cannot be proven safely
- any command would apply a migration
- any command would seed data
- any command would deploy
- any command would touch real money or live payout
- any command would call live provider/payment/bank/SMS/Slip OCR
- any secret-shaped value appears in output

If backup/restore cannot be proven safely, mark NOT EXECUTED. Do not fabricate proof.

## 8. Handoff Checklist

- [ ] Preflight repo status captured.
- [ ] Latest commit `077311e` captured.
- [ ] Safe CI PASS captured.
- [ ] Phase P/Q/R/S/T/U docs reviewed.
- [ ] Staging/disposable DB identified, or NOT EXECUTED recorded.
- [ ] Production DB prohibited and not touched.
- [ ] Dry-run migration only result captured, or NOT EXECUTED recorded.
- [ ] Backup/restore proof captured, or NOT EXECUTED recorded.
- [ ] Rollback proof captured, or NOT EXECUTED recorded.
- [ ] Smoke guard PASS.
- [ ] Secret/leak scan reviewed.
- [ ] no production DB.
- [ ] no real money.
- [ ] no live payout.
- [ ] no live provider/payment/bank/SMS/Slip OCR.
- [ ] no deploy.
- [ ] no seed.
- [ ] no runtime money flow changed.

## Final Boundary

Phase V is staging/disposable DB only and dry-run migration only. It does not authorize production DB, production migration, real money, live payout, live provider/payment/bank/SMS/Slip OCR, deploy, seed, or runtime money-flow changes.
