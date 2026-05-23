# Staging Deploy Readiness Pack

## 1. Phase AA status

Phase AA is a staging deploy readiness documentation and static smoke pack only. It does not deploy, migrate, seed, connect runtime services, or approve live operation.

Current boundary:

- local/staging/mock/sandbox only.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.
- deploy requires explicit approval in a later phase.

## 2. Current repository baseline

- Repository: `kitkom83-arch/FLING-STUKUTO`.
- Branch: `main`.
- Baseline commit: `9e53e82 Add project closeout handoff smoke`.
- Safe CI baseline run: `26341797600`.
- Phase W, Phase X, Phase Y, and Phase Z are closed before Phase AA begins.

## 3. Required preflight checks

Run these before changing files or preparing any later staging deploy approval:

```powershell
git status --short
git log -1 --oneline
gh run list --branch main --limit 5
```

Required evidence:

- `git status --short` has no output.
- `git log -1 --oneline` shows the baseline commit.
- Latest Safe CI for the baseline commit is completed with success.

## 4. Required local smoke checks

Phase AA adds and requires:

```powershell
node --check src/local-smoke-tests/stagingDeployReadinessPackSmoke.js
npm run smoke:staging-deploy-readiness-pack
npm run smoke:project-closeout
npm run smoke:staging-release-readiness
npm run smoke:all-local
git diff --check
```

`smoke:all-local` requires a safe local runtime and complete local smoke env. If the local runtime env is missing, record that result and rerun through the approved PowerShell local smoke runner when the safe runtime is available.

## 5. Safe CI verification

Safe CI must pass for the commit that contains this pack before any next-phase deploy decision. The CI evidence must record the run ID, commit hash, branch, result, and timestamp without including secret values.

Safe CI is not a deploy signal by itself. It is only one required evidence item before a later explicit staging deploy approval.

## 6. Staging-only boundary

Staging readiness remains local/staging/mock/sandbox only. Phase AA must not:

- deploy the app.
- use production DB.
- run production migration or production seed.
- move real money.
- enable live payout.
- enable live provider/payment/bank/SMS/Slip OCR.
- lower auth guard, permission guard, audit guard, staging guard, or smoke strictness.

## 7. No-production DB proof

Required proof before any later deploy phase:

- `DATABASE_URL` is stored only in the platform secret manager or ignored local shell.
- The DB target label is staging/test/disposable only.
- The DB target is not production, a production clone, or a production read replica.
- No docs, logs, screenshots, tickets, commits, or chat output contain DB connection text.
- Any migration command remains guarded and staging/test only.

## 8. No-real-money proof

Required proof before any later deploy phase:

- Deposit, withdraw, wallet, reward, and ledger checks use mock/staging fixtures only.
- No live settlement, live transfer, wallet payout, provider payout, or bank payout runs.
- Lucky Wheel reward claim/cancel remains staging/mock manual handoff only.
- Financial reports remain mock/read-only evidence and are not settlement evidence.

## 9. No-live-provider/payment/bank/SMS/Slip OCR proof

Required proof before any later deploy phase:

- Game provider mode is mock.
- Payment provider mode is sandbox or mock only.
- Bank statement mode is mock.
- SMS provider mode is mock.
- Slip OCR mode is mock.
- No live callback, webhook, statement feed, SMS send, OCR request, payout, or provider action is reachable from staging readiness.

## 10. ENV readiness checklist

- `NODE_ENV` is a safe non-production label for staging readiness.
- `APP_ENV` is staging or another explicit non-production staging/test label.
- `STAGING_MODE` is mock or sandbox.
- `DATABASE_URL` is present only in the secret manager or ignored shell and points to a staging/test database.
- `CORS_ORIGIN` and public API base values point only at staging/test hosts.
- Provider mode keys use mock, sandbox, or disabled values only.
- Demo admin/member values are staging-only and stored outside the repository.

## 11. Staging secrets handling checklist

- Store real staging values only in the platform secret manager or approved out-of-repo channel.
- Do not print passwords, tokens, session secrets, provider keys, DB connection text, or raw auth material.
- Use missing-value placeholder, invalid-number placeholder, object-string placeholder, and unsafe rendered placeholder copy wording in docs and evidence.
- Rotate any secret immediately if it is printed, committed, screenshotted, or shared outside the approved secret store.

## 12. Staging database checklist

- Use a dedicated staging/test PostgreSQL database only.
- Confirm DB host/name/user labels are staging/test/disposable.
- Do not use production, production clone, production read replica, or production service account.
- Run guarded migration or seed commands only in a later explicitly approved phase.
- Capture DB evidence as non-secret labels and pass/fail status only.

## 13. Staging health check checklist

Expected health evidence for a later deploy phase:

- Health endpoint returns HTTP success.
- Response has a safe success envelope.
- `databaseConnected` is boolean.
- External mode labels are mock, sandbox, or disabled only.
- Response and logs do not include secrets, DB connection text, raw auth material, provider payloads, or stack traces.

## 14. Staging rollback checklist

Before any later deploy phase, record:

- rollback owner.
- previous known-good deploy or commit.
- platform rollback method.
- health check after rollback.
- smoke command after rollback.
- secret rotation path if a leak is suspected.
- confirmation that rollback never points staging at production DB.

## 15. Staging monitoring checklist

Before any later deploy phase, record monitoring coverage for:

- health endpoint status.
- API error rate.
- database connection status.
- provider mode labels.
- admin auth failures and permission failures.
- Lucky Wheel and financial safety errors.
- secret leak alerts or log review.
- deploy and rollback events.

## 16. Staging UAT checklist

Staging UAT may proceed only after a later explicit deploy approval and safe runtime setup:

- Admin login uses staging-only credentials.
- Admin routes keep auth, permission, reason, and audit guards.
- Member wheel config/spin/history uses backend-selected results only.
- Reward claim/cancel does not trigger live payout.
- Reports remain mock/read-only and not settlement evidence.
- UAT evidence records pass/fail status without secret values.

## 17. Go/No-Go matrix

| Area | GO when | NO-GO when |
| --- | --- | --- |
| Repository | Baseline and working tree are verified | Unexpected changes or wrong commit are present |
| Safe CI | Latest required run passes for the target commit | CI fails, is cancelled, or targets the wrong commit |
| Local smoke | Required static smoke passes and runtime smoke is run only in safe env | Smoke fails, is skipped without guard reason, or is weakened |
| Database | Staging/test DB only, with no secret output | Production DB, clone, replica, or unclear target appears |
| Money | Mock/staging fixtures only | Real money, live payout, or settlement path appears |
| Providers | mock/sandbox/disabled only | Live provider/payment/bank/SMS/Slip OCR appears |
| Secrets | Secret manager only, no secret output | Any secret-shaped value is printed or committed |
| Approval | Later phase explicitly approves deploy | Phase AA is treated as deploy approval |

## 18. Manual evidence checklist

- Preflight command results recorded.
- Safe CI run ID recorded.
- Static smoke results recorded.
- `git diff --check` result recorded.
- Forbidden rendered placeholder scan result recorded.
- Staging ENV checklist reviewed.
- Staging DB target classified by non-secret label.
- Mock/sandbox provider evidence recorded.
- Rollback owner and method recorded.
- Operator acceptance recorded.

## 19. Operator handoff checkpoint

Operators must confirm:

- local/staging/mock/sandbox only.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.
- no secret sharing in docs, logs, screenshots, tickets, commits, or chat.
- no auth, permission, audit, staging, or smoke guard downgrade.

## 20. Final approval gate before any deploy

Phase AA does not approve or perform deploy. Any staging deploy belongs to a later phase and requires explicit written approval that names the target environment, target commit, rollback owner, evidence set, and operator signoff.

Any production deploy remains forbidden.
