# Staging Deploy Go/No-Go

## 1. Go criteria

GO for a later staging deploy phase only when all criteria are true:

- Explicit deploy approval is recorded in the later phase.
- Target commit is named.
- Working tree is clean before deploy work starts.
- Safe CI passes for the target commit.
- Required local/static smoke evidence passes.
- Staging ENV evidence confirms mock/sandbox boundaries.
- Staging DB evidence confirms no production DB.
- Rollback owner and rollback method are recorded.
- Operator and UAT owners accept the staging-only scope.

## 2. No-Go criteria

NO-GO if any item is true:

- Phase AA is being treated as deploy approval.
- Production deploy is requested.
- Production DB, production clone, or production replica appears.
- Real money or live payout appears.
- Live provider/payment/bank/SMS/Slip OCR appears.
- Safe CI fails or targets the wrong commit.
- Required smoke fails outside a documented safe guard.
- Secret-shaped values appear in docs, logs, screenshots, tickets, commits, or chat.
- Auth, permission, audit, staging, or smoke guard strictness is reduced.

## 3. Required local smoke evidence

Record pass/fail status for:

```powershell
node --check src/local-smoke-tests/stagingDeployReadinessPackSmoke.js
npm run smoke:staging-deploy-readiness-pack
npm run smoke:project-closeout
npm run smoke:staging-release-readiness
npm run smoke:all-local
git diff --check
```

If local runtime env is missing for `smoke:all-local`, record the guard reason and do not commit until the required workflow decision is clear.

## 4. Required Safe CI evidence

- Safe CI run ID.
- Commit hash.
- Branch.
- Workflow result.
- Timestamp.
- Confirmation that no secret values were included in evidence.

## 5. Required ENV evidence

- ENV key names reviewed without values.
- `APP_ENV` is staging or local-test.
- `STAGING_MODE` is mock or sandbox.
- Provider modes are mock, sandbox, or disabled.
- Secret values are stored only in the platform secret manager or approved out-of-repo channel.

## 6. Required staging DB evidence

- DB target is staging/test only.
- Target is not production, clone, or read replica.
- Connection text is never printed.
- Migration and seed commands remain guarded and require later explicit approval.
- Evidence uses non-secret DB labels only.

## 7. Required mock/sandbox provider evidence

- `GAME_PROVIDER_MODE=mock`.
- `PAYMENT_PROVIDER_MODE=sandbox` or mock.
- `BANK_STATEMENT_MODE=mock`.
- `SMS_PROVIDER_MODE=mock`.
- `SLIP_OCR_MODE=mock`.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.

## 8. Required rollback evidence

- Rollback owner.
- Previous known-good commit or deploy label.
- Health check after rollback.
- Smoke command after rollback.
- Secret rotation path if a leak is suspected.
- Confirmation that rollback never switches staging to production DB.

## 9. Required operator acceptance

Operator accepts:

- local/staging/mock/sandbox only.
- no production DB.
- no real money.
- no live payout.
- no live provider/payment/bank/SMS/Slip OCR.
- no secret sharing.
- no auth, permission, audit, staging, or smoke guard downgrade.

## 10. Required manual UAT acceptance

Manual UAT owner accepts:

- Admin UAT uses staging-only credentials.
- Member Lucky Wheel UAT remains backend-selected.
- Reward claim/cancel remains mock/staging manual handoff only.
- Reports remain mock/read-only and not settlement evidence.
- Evidence includes pass/fail only and no secret values.

## 11. Approval section

Approval must record:

- environment: staging only.
- target commit.
- deploy owner.
- rollback owner.
- operator reviewer.
- UAT reviewer.
- Safe CI run ID.
- local/static smoke result.
- DB target non-secret label.
- provider mode evidence.

## 12. Explicit deploy approval gate

Phase AA does not deploy. Actual staging deploy belongs to the next phase only and requires explicit approval after this pack is reviewed.

Any production deploy remains forbidden.
