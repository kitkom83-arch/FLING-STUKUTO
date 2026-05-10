# Staging and UAT Boundary Runbook

This runbook defines the boundary between local smoke tests, staging checks, controlled live testing, and production operation. It is a safety document only. It does not enable real providers, real bank rails, real payment rails, auto transfer, or production database access.

Never paste real tokens, passwords, API keys, provider secrets, callback secrets, or real database URLs into this document, commit history, logs, issue trackers, tickets, screenshots, or chat output.

## Environment Levels

| Level | Purpose | Database | Provider modes | Money movement |
| --- | --- | --- | --- | --- |
| `local` | Developer workstation checks and local smoke tests | Local PostgreSQL only | `mock` only, or `sandbox` when explicitly needed | No real money |
| `staging` | Hosted non-production verification | Dedicated staging/test PostgreSQL only | `mock` or provider sandbox only | No real money |
| `controlled-live` | Small, manually approved real-provider proof after staging approval | Dedicated non-production or approved controlled-live database, never production by accident | One approved live provider line at a time | Very small test amounts only |
| `production` | Real customer operation | Production PostgreSQL only | Approved production provider modes | Real money with production controls |

## Boundary Rules

- Local smoke tests are allowed only against `local`, `staging`, or `test` targets.
- Production databases, production clones, production read replicas, and production-like database names or hosts are forbidden for local smoke, seed, and DB-backed safety flows.
- Provider live mode is forbidden in smoke. Game, payment, bank statement, SMS, and Slip OCR modes must remain unset, `mock`, or `sandbox`.
- Demo seed is allowed only for local/staging/test use and must never run against production.
- Production migration, seed, smoke, and provider integration commands must not be run from a local checkout.
- Auto transfer must stay disabled before any controlled-live test.
- A separate test bank account and separate test provider accounts must be used for controlled-live. Do not reuse operational production settlement accounts.
- Controlled-live testing must use a very small amount, agreed before the test, and must stay within daily and per-transaction limits.
- No real token, password, provider secret, API key, callback secret, or real database URL may be committed, logged, or pasted into docs.

## Existing Guard Coverage

- `prisma/seed.js` blocks missing or non-PostgreSQL database targets, production-like target markers, non-local targets without local/staging/test markers, and `NODE_ENV=production`.
- `src/db-safety-tests/dbSafetyGuard.js` blocks `NODE_ENV=production`, production-like database targets, database targets without explicit staging/test markers, and provider modes outside `mock` or `sandbox`.
- `src/local-smoke-tests/runAllLocalSmoke.js` blocks unsafe `NODE_ENV`, missing required local credentials, unsafe database targets, production-like API base URLs, embedded URL credentials, and provider modes outside `mock` or `sandbox` before running the smoke suite.
- Individual local smoke scripts also perform their own safety checks for production-like database/API targets and non-mock provider modes before creating fixtures or calling API flows.

## Staging Checklist

- Confirm the target environment is `staging` or `test`, not production.
- Confirm the database is a dedicated staging/test PostgreSQL instance and not a production clone or read replica.
- Confirm the database host, database name, or username includes an explicit staging/test marker.
- Confirm provider modes are unset, `mock`, or `sandbox`.
- Confirm no live provider credentials are present in the staging shell, hosting dashboard, CI variables, or `.env` file.
- Confirm `npm run check` passes before any smoke command.
- Confirm `npm run smoke:admin-work-schedule` passes before validating admin schedule UI behavior in staging.
- Confirm local smoke commands are run only after the backend is pointed at the approved safe target.
- Confirm logs redact database URLs, JWTs, tokens, API keys, callback secrets, provider payloads, passwords, and raw authorization headers.

## Real-Money UAT Checklist

Controlled-live testing is not part of local smoke. Use this checklist only after staging has passed and manual approval has been recorded.

- Confirm the exact provider, route, and feature under test.
- Confirm only one live provider line is enabled for the test.
- Confirm the test uses a separate test account and separate test bank account.
- Confirm auto transfer is disabled.
- Confirm daily and per-transaction limits are configured before the test.
- Confirm the test amount is very small and approved in writing before execution.
- Confirm the member account, admin account, provider account, and bank account are test-only.
- Confirm the expected ledger, deposit, withdrawal, callback, and admin log records before running.
- Confirm no production customer account can be selected or affected.
- Confirm no uncontrolled retry, cron, queue, webhook replay, or auto-settlement job can multiply the transaction.

## Manual Approval Checklist

- Approval names the environment level: `staging` or `controlled-live`.
- Approval names the database target by non-secret label only.
- Approval names the provider mode and provider account by non-secret label only.
- Approval names the maximum daily amount and maximum per-transaction amount.
- Approval names the exact operator, reviewer, and rollback owner.
- Approval confirms auto transfer is disabled.
- Approval confirms real secrets were not pasted into the approval record.
- Approval confirms no production database, production customer balance, or production provider account is in scope.

## Audit Log Checklist

- Record who approved the test, who executed it, and when it started and ended.
- Record the non-secret environment label and provider label.
- Record the test amount, currency, and transaction reference.
- Record member/admin test account identifiers only when they are non-sensitive.
- Verify admin logs exist for manual deposit, withdrawal, bank account, provider config, and status changes touched by the test.
- Verify admin work schedule audit history exists for schedule update, enable/disable, emergency override, and schedule-blocked admin login when those controls are touched.
- Verify provider callbacks or polling results are correlated by reference and are idempotent.
- Verify logs do not contain raw tokens, passwords, API keys, callback secrets, authorization headers, or real database URLs.

## Rollback Checklist

- Disable the tested live provider line.
- Keep auto transfer disabled.
- Revert provider mode to `mock` or `sandbox` unless production launch has a separate approval.
- Stop any worker, cron, webhook replay, or queue consumer involved in the test if behavior is unexpected.
- Reconcile the small test transaction manually with the test bank/provider account.
- Capture the final ledger, deposit, withdrawal, callback, and admin log state.
- Document whether data correction is required and who approved it.
- Do not delete audit records to hide a failed test.

## Secret Handling Checklist

- Use secret managers, hosting environment variables, or local ignored `.env` files only.
- Never commit `.env`, real database URLs, JWT secrets, provider API keys, callback secrets, passwords, or bearer tokens.
- Never paste secrets into docs, pull requests, issue trackers, screenshots, terminal transcripts, or chat.
- Use placeholders such as `<STAGING_DATABASE_URL>` or `<PROVIDER_SANDBOX_KEY>` only when a shape is needed.
- Rotate any secret immediately if it is printed, committed, screenshotted, or shared outside the approved secret store.
- Confirm secret leak scans pass before handoff.
