# Phase AB Go/No-Go

Phase AB prepares disposable staging database dry-run evidence and guardrails only. Phase AB does not execute migration, does not deploy, does not seed, and does not connect to production.

## 1. GO criteria

Phase AB is GO only when all criteria are true:

- Required Phase AB docs exist.
- Static smoke passes.
- Safe CI passes for the target commit.
- DB safety evidence is completed as a template with no secret values.
- Disposable/staging DB identity evidence is available.
- No-production DB boundary is documented.
- Backup evidence is documented.
- Restore evidence is documented.
- Rollback evidence is documented.
- Mock/sandbox/disabled provider evidence is documented.
- No-real-money boundary is documented.
- Final approval gate is documented for a later actual DB dry-run phase.

## 2. NO-GO criteria

Phase AB is NO-GO if any item is true:

- Actual migration is requested in Phase AB.
- Deploy is requested in Phase AB.
- Seed is requested in Phase AB.
- Production DB is detected.
- Production clone is detected.
- Production read replica is detected.
- Production service account is detected.
- Secret values appear in docs, logs, screenshots, tickets, commits, or chat.
- Real money, settlement, or live payout appears.
- Live provider/payment/bank/SMS/Slip OCR mode is detected.
- Backup, restore, or rollback evidence is missing.
- Auth, permission, audit, staging, or smoke guard strictness is reduced.

## 3. Required docs

- `docs/DISPOSABLE_STAGING_DB_DRY_RUN.md`
- `docs/STAGING_DB_SAFETY_EVIDENCE_CHECKLIST.md`
- `docs/PHASE_AB_GO_NO_GO.md`
- `docs/STAGING_DEPLOY_READINESS_PACK.md`
- `docs/STAGING_ENVIRONMENT_MATRIX.md`
- `docs/STAGING_DEPLOY_GO_NO_GO.md`
- `docs/SMOKE_COVERAGE.md`

## 4. Required smoke results

Record pass/fail status for:

```powershell
node --check src/local-smoke-tests/disposableStagingDbDryRunPackSmoke.js
npm run smoke:disposable-staging-db-dry-run-pack
npm run smoke:staging-deploy-readiness-pack
npm run smoke:project-closeout
npm run smoke:staging-release-readiness
npm run smoke:all-local
git diff --check
```

If `smoke:all-local` cannot run because the local runtime env is missing, record the guard reason and do not treat that as approval for actual DB work.

## 5. Required Safe CI result

- Safe CI workflow name.
- Safe CI run ID.
- Commit hash.
- Branch.
- Result.
- Timestamp.
- Confirmation that CI evidence contains no secret values.

## 6. Required DB safety evidence

- Evidence owner.
- Disposable/staging DB identity.
- DB host label without connection text.
- DB name label without connection text.
- DB user label without password.
- No production host evidence.
- No production database name evidence.
- No production service account evidence.
- Secret leak review evidence.

## 7. Required backup/restore evidence

- Backup owner.
- Backup method.
- Backup result.
- Restore owner.
- Restore method.
- Restore result.
- Confirmation that backup and restore targets are disposable/staging only.
- Confirmation that evidence contains no connection text.

## 8. Required rollback evidence

- Rollback owner.
- Rollback method.
- Previous known-good migration state.
- Post-rollback verification command category.
- Rollback result.
- Confirmation that rollback target is disposable/staging only.
- Confirmation that rollback does not switch staging to production DB.

## 9. Required mock/sandbox provider evidence

- Game provider mode is mock, sandbox, or disabled.
- Payment provider mode is mock, sandbox, or disabled.
- Bank statement mode is mock, sandbox, or disabled.
- SMS provider mode is mock, sandbox, or disabled.
- Slip OCR mode is mock, sandbox, or disabled.
- No live provider callback, webhook, bank feed, SMS send, or OCR request is used.

## 10. Required approval before actual DB dry-run

Actual DB dry-run belongs to a later explicit approval phase only. Approval must name:

- target phase.
- target commit.
- disposable/staging DB non-secret label.
- DB owner.
- migration owner.
- backup owner.
- rollback owner.
- approved command category.
- evidence packet location.
- stop conditions.

Without this approval, actual DB dry-run is NO-GO.

## 11. Explicit stop condition if production DB is detected

Stop immediately if production DB, production clone, production read replica, production host, production database name, or production service account is detected. Do not run Prisma, migration, seed, restore, rollback, or deploy commands.

## 12. Explicit stop condition if secret appears in logs

Stop immediately if password, token, JWT value, provider key, auth material, database connection text, or secret-shaped output appears in logs, docs, screenshots, tickets, commits, or chat. Record only that a leak review is required and rotate through the approved owner path.

## 13. Explicit stop condition if live provider mode is detected

Stop immediately if live provider/payment/bank/SMS/Slip OCR mode is detected. Phase AB requires mock, sandbox, or disabled provider modes only.

## Final boundary

Phase AB does not execute migration. Phase AB does not deploy. Phase AB prepares evidence and guardrails only.
