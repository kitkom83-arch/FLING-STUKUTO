# Disposable Staging DB Dry-Run

## 1. Phase AB status

Phase AB is a disposable staging database dry-run documentation and static smoke pack only. It prepares evidence, guardrails, and approval gates for a later explicit database dry-run phase.

Phase AB does not execute migration, does not run Prisma migration commands, does not seed data, does not connect to a database, does not deploy, and does not approve any actual database operation.

Current boundary:

- disposable/staging DB only.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.
- no actual migration in Phase AB.
- actual DB dry-run belongs to a later explicit approval phase only.

## 2. Disposable staging DB definition

A disposable staging DB is a non-production PostgreSQL target created only for staging/test rehearsal. It can be deleted and recreated without customer impact, settlement impact, provider impact, or production operational impact.

Required properties:

- The DB is dedicated to staging/test dry-run evidence.
- The DB is not production, not a production clone, and not a production read replica.
- The DB name, host label, and user label clearly indicate staging, test, QA, sandbox, or disposable use.
- The DB contains no production customer data, no production payout data, and no production provider data.
- Any evidence records only non-secret labels and pass/fail status.

## 3. Strict no-production DB boundary

Phase AB has a hard no-production DB boundary:

- Do not use production DB.
- Do not use a production clone.
- Do not use a production read replica.
- Do not use production service accounts.
- Do not connect to a production database host.
- Do not run migration, seed, restore, rollback, or Prisma commands against production.
- Stop immediately if any DB target is unclear or production-like.

## 4. Required evidence before dry-run

Before a later approved dry-run can start, collect:

- Preflight command results.
- Git baseline commit and branch.
- Safe CI result for the target commit.
- Disposable staging DB identity evidence.
- DB host label evidence without connection text.
- DB name evidence without connection text.
- DB user label evidence without passwords.
- No-production host evidence.
- No-production database name evidence.
- Backup proof.
- Restore proof.
- Rollback proof.
- Mock/sandbox provider mode evidence.
- No-real-money evidence.
- Final written approval for the later database dry-run phase.

## 5. Required DATABASE_URL safety checks

The database connection value must be checked only through safe classification, never by printing or pasting it.

Required checks:

- Confirm the target is disposable/staging DB only.
- Confirm the target is not production, not a production clone, and not a production read replica.
- Confirm the host label is staging/test/QA/sandbox/disposable.
- Confirm the database name label is staging/test/QA/sandbox/disposable.
- Confirm the database user label is staging/test/QA/sandbox/disposable.
- Confirm the value is stored only in an ignored local shell or approved secret manager.
- Confirm no docs, logs, screenshots, tickets, commits, or chat output include connection text.
- Confirm any failure stops the dry-run before any Prisma command is executed.

## 6. Allowed database targets

Allowed only in a later explicit approval phase:

- Local disposable PostgreSQL database.
- Staging disposable PostgreSQL database.
- Test or QA PostgreSQL database with disposable data only.
- Sandbox PostgreSQL database dedicated to this dry-run.

All allowed targets must be non-production, isolated, and safe to delete.

## 7. Forbidden database targets

Forbidden in Phase AB and in any later dry-run:

- Production DB.
- Production clone.
- Production read replica.
- Production service account.
- Production host or primary host.
- Customer data copy without approved anonymization and written approval.
- Any database target with unclear ownership or unclear environment label.
- Any target where connection text appears in logs or evidence.

## 8. Backup/restore proof checklist

- [ ] Backup owner recorded.
- [ ] Backup method recorded without secret values.
- [ ] Backup target is disposable/staging only.
- [ ] Backup timestamp recorded.
- [ ] Restore target is disposable/staging only.
- [ ] Restore result recorded as pass/fail.
- [ ] Restore evidence contains no connection text.
- [ ] Restore failure stops any later migration dry-run.

## 9. Rollback proof checklist

- [ ] Rollback owner recorded.
- [ ] Rollback method recorded.
- [ ] Rollback target is disposable/staging only.
- [ ] Previous known-good migration state recorded.
- [ ] Post-rollback verification command recorded without secret values.
- [ ] Rollback result recorded as pass/fail.
- [ ] Rollback evidence contains no connection text.
- [ ] Rollback failure stops any later migration dry-run.

## 10. Migration dry-run checklist

- [ ] Phase AB completed as docs/static smoke only.
- [ ] Later explicit dry-run approval recorded.
- [ ] Disposable/staging DB identity evidence reviewed.
- [ ] No-production DB evidence reviewed.
- [ ] Backup proof reviewed.
- [ ] Restore proof reviewed.
- [ ] Rollback proof reviewed.
- [ ] Migration command reviewed before execution.
- [ ] Logs redaction plan reviewed.
- [ ] No actual migration in Phase AB.

## 11. Prisma dry-run checklist

- [ ] Prisma commands are reviewed only as planned commands in Phase AB.
- [ ] Prisma migration execution is blocked in Phase AB.
- [ ] Prisma seed execution is blocked in Phase AB.
- [ ] Later approved Prisma commands must target disposable/staging DB only.
- [ ] Later approved Prisma output must be reviewed for secret leaks.
- [ ] Any production-like Prisma target stops the run.
- [ ] Any secret-shaped output stops the run and triggers rotation review.

## 12. Seed restriction checklist

- [ ] No seed runs in Phase AB.
- [ ] No production seed.
- [ ] No production-like fixture source.
- [ ] No customer data seed.
- [ ] Later seed rehearsal requires explicit approval.
- [ ] Later seed rehearsal uses disposable/staging fixtures only.
- [ ] Later seed evidence contains no password, token, or connection text.

## 13. Data isolation checklist

- [ ] Disposable/staging DB is isolated from production.
- [ ] No production customer rows.
- [ ] No production wallet rows.
- [ ] No production ledger rows.
- [ ] No production payout rows.
- [ ] No live provider callback rows.
- [ ] No live bank statement rows.
- [ ] No live SMS or Slip OCR rows.

## 14. No-real-money checklist

- [ ] No real money.
- [ ] No settlement.
- [ ] No live transfer.
- [ ] No wallet payout.
- [ ] No provider payout.
- [ ] No bank payout.
- [ ] Evidence is mock/sandbox/disposable only.

## 15. No-live-provider/payment/bank/SMS/Slip OCR checklist

- [ ] Game provider mode is mock, sandbox, or disabled.
- [ ] Payment provider mode is mock, sandbox, or disabled.
- [ ] Bank statement mode is mock, sandbox, or disabled.
- [ ] SMS provider mode is mock, sandbox, or disabled.
- [ ] Slip OCR mode is mock, sandbox, or disabled.
- [ ] No live callbacks.
- [ ] No live webhooks.
- [ ] No live statement feed.
- [ ] No live SMS send.
- [ ] No live OCR request.

## 16. Operator evidence checklist

- [ ] Operator name recorded.
- [ ] Evidence owner recorded.
- [ ] Git baseline recorded.
- [ ] Safe CI result recorded.
- [ ] Disposable DB identity recorded by non-secret label.
- [ ] Backup proof attached.
- [ ] Restore proof attached.
- [ ] Rollback proof attached.
- [ ] Mock/sandbox provider evidence attached.
- [ ] Secret leak review completed.
- [ ] Final approval gate reviewed.

## 17. Go/No-Go matrix

| Area | GO when | NO-GO when |
| --- | --- | --- |
| Phase scope | Phase AB remains docs/static smoke only | Any actual DB operation is attempted |
| DB target | Disposable/staging DB only | Production DB, clone, replica, or unclear target appears |
| Migration | Later explicit approval exists | Migration is requested in Phase AB |
| Prisma | Planned command is reviewed only | Prisma command execution is attempted in Phase AB |
| Seed | No seed runs in Phase AB | Seed command is requested in Phase AB |
| Backup/restore | Backup and restore proof exist | Proof is missing or targets are unclear |
| Rollback | Rollback proof exists | Rollback is unproven |
| Money | No real money | Real money, settlement, or payout appears |
| Providers | Mock/sandbox/disabled only | Live provider/payment/bank/SMS/Slip OCR appears |
| Secrets | No secret values in evidence | Password, token, connection text, or secret-shaped output appears |

## 18. Stop conditions

Stop immediately when any condition appears:

- Production DB is detected.
- Production clone is detected.
- Production read replica is detected.
- Production service account is detected.
- Actual migration is requested in Phase AB.
- Seed is requested in Phase AB.
- Deploy is requested in Phase AB.
- Real money or live payout appears.
- Live provider/payment/bank/SMS/Slip OCR mode appears.
- Secret-shaped values appear in logs, docs, screenshots, tickets, commits, or chat.
- Required backup, restore, rollback, or approval evidence is missing.

## 19. Final approval gate before any actual DB operation

No actual DB operation is allowed in Phase AB.

Before any later disposable staging DB dry-run, approval must explicitly name:

- target phase.
- target commit.
- disposable/staging DB non-secret label.
- DB owner.
- migration owner.
- backup owner.
- rollback owner.
- approved Prisma command category.
- provider mode evidence.
- no-production DB evidence.
- no-real-money evidence.
- no-live-provider/payment/bank/SMS/Slip OCR evidence.

If approval is missing, unclear, or mentions production, the dry-run is NO-GO.
