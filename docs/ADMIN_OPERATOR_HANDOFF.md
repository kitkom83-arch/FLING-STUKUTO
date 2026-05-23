# Admin Operator Handoff

## 1. Admin login safety

- Use local/staging/mock/sandbox only.
- Use approved staging credentials only through the platform secret manager or approved out-of-repo channel.
- Do not share password, token, secret, credential, database connection, or auth header values in docs, logs, screenshots, tickets, or chat.
- Do not use production DB.
- Do not use real money.
- Do not use live bank/payment/provider/SMS/Slip OCR.
- no live money.
- no production DB.
- no live bank/payment/provider/SMS/Slip OCR.
- no secret sharing.
- no guard downgrade.

## 2. Role Management

- Operators may review role list, permission catalog, and effective permission preview.
- Operators may perform approved staging/mock role checks only when a safe reason is recorded.
- Operators must not grant owner bypass, wildcard permission, or guard override.
- Operators must not downgrade auth guard, permission guard, or audit guard.

## 3. Admin Work Schedule

- Operators may review schedules, login allow/block behavior, and emergency override evidence in staging/mock.
- Operators may update schedules only when approved by the handoff owner and a reason is recorded.
- Operators must not use work schedule changes to bypass role, permission, or audit requirements.

## 4. Admin Audit/Security

- Operators may review admin audit logs and security events through the approved admin UI.
- Operators must confirm audit records include actor/action/reason safely for admin writes.
- Operators must not expose raw credential values, raw auth headers, database connection strings, or raw stack traces in evidence.

## 5. Admin Wheel Console

- Operators may review campaign settings, reward management, reward claims, spin history, reports, and audit history.
- Operators may run Lucky Wheel UAT only in local/staging/mock/sandbox.
- Operators must confirm backend decides prizeIndex and frontend must not decide reward.
- Operators must not create force reward, force spin, or frontend result override actions.

## 6. Financial ledger mock/read-only reports

- Operators may review mock/read-only reconciliation and ledger report artifacts.
- Operators must treat reports as mock evidence only.
- Operators must not use these reports for live settlement, real payout, or production reconciliation.

## 7. Bank mock/statement mock/slip OCR mock

- Operators may review mock bank statement and mock Slip OCR behavior.
- Operators must confirm bank, payment, provider, SMS, and Slip OCR modes are mock, sandbox, or disabled.
- Operators must not connect live bank rails, live payment rails, live provider callbacks, live SMS, or live Slip OCR.

## 8. Staging release readiness

- Operators may run `npm run smoke:staging-release-readiness` as a static release policy guard.
- Operators may run `npm run smoke:project-closeout` for final closeout docs.
- Operators must not deploy, migrate production, seed production, or enable live rails during this handoff.

## 9. Monitoring/backup docs

- Operators may review monitoring, incident, backup, restore, and rollback docs as planning evidence.
- Operators must not treat planning docs as production readiness approval.
- Operators must escalate any missing backup/restore proof before production planning continues.

## 10. What operators may do

- Review local/staging/mock/sandbox documentation.
- Run static smoke commands that do not require API, DB, server, or env secrets.
- Run local/staging smoke only when the safe target is explicitly configured.
- Record evidence, Safe CI run ID, smoke status, and SKIP-SAFE guard reasons.

## 11. What operators must not do

- Do not use production DB.
- Do not use live money or real money.
- Do not enable live payout.
- Do not enable live bank/payment/provider/SMS/Slip OCR.
- Do not share secrets.
- Do not downgrade auth guard, permission guard, audit guard, staging guard, or provider-mode guard.
- Do not deploy, migrate production, or seed production from this handoff.

## 12. Escalation checklist

- Use missing-value placeholder, invalid-number placeholder, object-string placeholder, and unsafe rendered placeholder copy wording in handoff notes instead of raw unsafe rendered copy.


Escalate before handoff signoff when any item is true:

- Safe CI fails or targets the wrong commit.
- Smoke fails outside a documented SKIP-SAFE guard.
- Any production-like DB/API target appears.
- Any live provider/payment/bank/SMS/Slip OCR mode appears.
- Any credential-shaped value appears in docs, logs, screenshots, tickets, or chat.
- Any admin write action lacks reason or audit evidence.
- Any operator asks to reduce auth, permission, audit, staging, or smoke strictness.

## 13. Evidence checklist before handoff

- Final commit hash recorded.
- Safe CI run ID recorded.
- `npm run smoke:project-closeout` result recorded.
- `npm run smoke:staging-release-readiness` result recorded.
- `npm run smoke:all-local` result recorded when safe local runtime is available.
- Repository clean status recorded.
- Operator confirms no production DB, no real money, no live payout, and no live provider/payment/bank/SMS/Slip OCR.