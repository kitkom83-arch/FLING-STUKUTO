# Financial Ledger Staging Rollback Proof

## 1. Scope

This runbook covers rollback proof for Phase V staging/disposable only.

Status: NOT production ready.

- staging/disposable DB only
- no production DB
- dry-run migration only
- rollback proof
- backup/restore proof
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no deploy
- no seed

There is no production rollback in Phase V.

## 2. Rollback Strategy

Rollback proof must be designed for staging/disposable DB only:

- take backup before change
- run migration SQL/diff review as dry-run only
- document whether the dry-run migration SQL/diff is reversible
- document irreversible operations explicitly
- prefer restore-from-backup proof for disposable targets
- run smoke after rollback
- preserve evidence without secrets

No production DB rollback is allowed.

## 3. Backup-Before-Change Requirement

Before any staging/disposable dry-run proof that could change a disposable target, a backup proof must exist.

Required evidence:

- backup command completed
- backup artifact safe identifier captured
- restore target identified
- redacted connection info only
- no secret output

If backup-before-change cannot be proven safely, stop and mark rollback proof NOT EXECUTED.

## 4. Reversibility Review

The dry-run migration SQL/diff must be reversible or documented.

Review for:

- dropped tables
- dropped columns
- destructive type changes
- data backfill assumptions
- index/constraint changes
- lock risk
- rollback SQL availability
- restore-from-backup fallback

If reversibility is unclear or destructive, stop and record the failure criteria.

## 5. Rollback Proof Checklist

- [ ] staging/disposable DB only classified.
- [ ] no production DB touched.
- [ ] backup-before-change proof exists.
- [ ] dry-run migration SQL/diff captured safely.
- [ ] reversible path documented, or irreversible risk documented.
- [ ] restore-from-backup proof completed against disposable restore DB, or NOT EXECUTED recorded.
- [ ] smoke after rollback completed, or NOT EXECUTED recorded.
- [ ] no secret leaked.
- [ ] no real money.
- [ ] no live payout.
- [ ] no live provider/payment/bank/SMS/Slip OCR.
- [ ] no deploy.
- [ ] no seed.

## 6. Restore-From-Backup Proof

Restore-from-backup proof must restore to a disposable restore DB only.

Evidence must include:

- command name
- timestamp
- env classification: staging/disposable only
- redacted connection info
- restore target classification
- result
- restored DB query/check result
- no secret output

## 7. Smoke After Rollback

After rollback or restore proof, run only safe static/local or staging/disposable-guarded smoke.

Minimum static smoke:

- `npm run check`
- `npm run smoke:financial-ledger-staging-dry-run-migration`

Additional staging/disposable smoke is allowed only when the target is classified safely and no production/live path exists.

## 8. Evidence Format

Record evidence with:

- command name
- timestamp
- env classification: staging/disposable only
- redacted connection info
- result
- rollback status
- smoke after rollback status
- no secret output

## 9. NOT EXECUTED Path

If no disposable DB exists or the target cannot be classified safely:

- mark NOT EXECUTED
- explain missing staging/disposable DB
- do not run rollback
- do not run restore
- do not query a database
- do not fabricate proof

Use this status:

`NOT EXECUTED because no staging/disposable DB configured`

## Final Boundary

Rollback proof is staging/disposable DB only. It is not production rollback, not production migration, not deploy, not seed, not real money, not live payout, and not live provider/payment/bank/SMS/Slip OCR.
