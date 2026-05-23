# Staging DB Safety Evidence Checklist

This is a checklist template only. Do not include secret values, password values, token values, real database connection values, JWT values, auth material, provider keys, or raw connection text in this document.

## 1. Evidence owner

- [ ] Owner name:
- [ ] Review date:
- [ ] Phase:
- [ ] Target commit:
- [ ] Evidence storage location:
- [ ] Secret values excluded from evidence.

## 2. Local machine evidence

- [ ] Machine role recorded without user secrets.
- [ ] Shell type recorded.
- [ ] Node version recorded.
- [ ] npm version recorded.
- [ ] No local environment values printed.
- [ ] No local secret files attached.

## 3. Git baseline evidence

- [ ] Branch recorded.
- [ ] Commit hash recorded.
- [ ] `git status --short` result recorded.
- [ ] Diff scope reviewed.
- [ ] No unexpected working tree files.

## 4. Safe CI evidence

- [ ] Safe CI workflow name recorded.
- [ ] Run ID recorded.
- [ ] Commit hash recorded.
- [ ] Branch recorded.
- [ ] Result recorded.
- [ ] Timestamp recorded.
- [ ] CI logs reviewed for secret-shaped values.

## 5. Staging DB identity evidence

- [ ] DB purpose recorded as disposable/staging only.
- [ ] Environment label recorded without connection text.
- [ ] DB owner recorded.
- [ ] Expected lifecycle recorded.
- [ ] Delete/recreate permission recorded.
- [ ] Production separation confirmed.

## 6. DB hostname/IP evidence

- [ ] Host label recorded without full connection text.
- [ ] IP classification recorded only if approved and non-secret.
- [ ] Host is staging/test/QA/sandbox/disposable.
- [ ] Host is not production.
- [ ] Host is not a production replica.

## 7. DB name evidence

- [ ] Database name label recorded.
- [ ] Name indicates staging/test/QA/sandbox/disposable.
- [ ] Name does not indicate production, primary, or live operation.
- [ ] Name is not a production database name.

## 8. DB user evidence

- [ ] User label recorded without password.
- [ ] User is staging/test/QA/sandbox/disposable.
- [ ] User is not a production service account.
- [ ] User permissions are limited to the approved dry-run scope.

## 9. No production host evidence

- [ ] Production host inventory checked.
- [ ] Staging host differs from production host.
- [ ] Staging host differs from production primary host.
- [ ] Staging host differs from production replica host.
- [ ] Evidence contains labels only, no connection text.

## 10. No production database name evidence

- [ ] Production database names reviewed by authorized owner.
- [ ] Disposable staging database name does not match production.
- [ ] Disposable staging database name does not match production clone.
- [ ] Disposable staging database name does not match production replica.
- [ ] Evidence contains labels only.

## 11. No live provider evidence

- [ ] Game provider mode is mock, sandbox, or disabled.
- [ ] Payment provider mode is mock, sandbox, or disabled.
- [ ] Bank statement mode is mock, sandbox, or disabled.
- [ ] SMS provider mode is mock, sandbox, or disabled.
- [ ] Slip OCR mode is mock, sandbox, or disabled.
- [ ] No live provider callback evidence is used.

## 12. No real-money evidence

- [ ] No real money.
- [ ] No live payout.
- [ ] No live settlement.
- [ ] No live transfer.
- [ ] No live bank payout.
- [ ] No wallet payout.
- [ ] Fixtures are disposable/staging/mock/sandbox only.

## 13. Backup evidence

- [ ] Backup owner recorded.
- [ ] Backup timestamp recorded.
- [ ] Backup method recorded without secret values.
- [ ] Backup target is disposable/staging only.
- [ ] Backup result recorded.
- [ ] Backup evidence contains no connection text.

## 14. Restore evidence

- [ ] Restore owner recorded.
- [ ] Restore timestamp recorded.
- [ ] Restore target is disposable/staging only.
- [ ] Restore method recorded without secret values.
- [ ] Restore result recorded.
- [ ] Restore evidence contains no connection text.

## 15. Rollback evidence

- [ ] Rollback owner recorded.
- [ ] Rollback timestamp recorded.
- [ ] Rollback target is disposable/staging only.
- [ ] Rollback method recorded without secret values.
- [ ] Post-rollback verification recorded.
- [ ] Rollback evidence contains no connection text.

## 16. Prisma command evidence

- [ ] Prisma command category recorded.
- [ ] Command is planned only in Phase AB.
- [ ] No Prisma command executed in Phase AB.
- [ ] Later execution requires explicit approval.
- [ ] Target classification is disposable/staging only.
- [ ] Output redaction plan recorded.

## 17. Migration command evidence

- [ ] Migration command category recorded.
- [ ] Command is planned only in Phase AB.
- [ ] No migration executed in Phase AB.
- [ ] Later migration dry-run requires explicit approval.
- [ ] Backup/restore proof reviewed before execution.
- [ ] Rollback proof reviewed before execution.

## 18. Seed command evidence

- [ ] Seed command category recorded.
- [ ] No seed executed in Phase AB.
- [ ] Production seed is forbidden.
- [ ] Later seed rehearsal requires explicit approval.
- [ ] Fixtures must be disposable/staging/mock/sandbox only.
- [ ] Seed evidence contains no password, token, or connection text.

## 19. Logs redaction evidence

- [ ] Logs reviewed for secret-shaped values.
- [ ] Logs reviewed for password values.
- [ ] Logs reviewed for token values.
- [ ] Logs reviewed for database connection text.
- [ ] Logs reviewed for JWT values.
- [ ] Logs reviewed for auth material.
- [ ] Logs reviewed for provider secret values.
- [ ] Use missing-value placeholder, invalid-number placeholder, object-string placeholder, and unsafe rendered placeholder copy wording in written notes.

## 20. Final approval signature area

- [ ] Evidence owner signature:
- [ ] DB owner signature:
- [ ] Migration owner signature:
- [ ] Rollback owner signature:
- [ ] Security reviewer signature:
- [ ] Operator signature:
- [ ] Approval explicitly states disposable/staging DB only.
- [ ] Approval explicitly states no production DB.
- [ ] Approval explicitly states no real money.
- [ ] Approval explicitly states no live provider/payment/bank/SMS/Slip OCR.
