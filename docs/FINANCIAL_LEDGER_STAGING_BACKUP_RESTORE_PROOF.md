# Financial Ledger Staging Backup Restore Proof

## 1. Scope

This runbook covers backup/restore proof for Phase V staging/disposable only.

Status: NOT production ready.

- staging/disposable DB only
- no production DB
- dry-run migration only
- backup/restore proof
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no deploy
- no seed

This is no production DB proof. It must never connect to, dump, restore, query, or validate a production database.

## 2. Backup Proof

Backup proof may use `pg_dump` or an equivalent database backup tool only after a staging/disposable DB is positively identified.

Required backup evidence:

- command name
- timestamp
- env classification: staging/disposable only
- redacted connection info
- result
- backup artifact identifier that is safe and non-secret
- no secret output

The command must not print raw connection strings, passwords, tokens, secrets, credential values, or provider credentials.

## 3. Restore Proof

Restore proof may use `pg_restore` or an equivalent database restore tool only into a disposable restore DB.

Restore target requirements:

- disposable restore DB only
- no production DB
- separate from the original staging/disposable source
- safe to destroy after proof
- clearly marked staging, disposable, restore, sandbox, test, or qa
- not named with prod, production, live, primary, real, main, or master

Required restore evidence:

- command name
- timestamp
- env classification: staging/disposable only
- redacted connection info
- restore target classification
- result
- no secret output

## 4. Restored DB Check

After restore, run a safe query/check against the disposable restore DB only.

The check should verify:

- restored DB is reachable
- expected migration metadata or table list exists
- row counts or schema checks are safe summaries only
- no secret output

Do not print member PII, auth material, provider credentials, bank credentials, or raw database connection information.

## 5. Redaction Rule

Never print:

- database URL values
- password values
- token values
- secret values
- auth header values
- JWT values
- provider credentials
- bank credentials
- private key values

Evidence must use redacted connection info only.

## 6. Success Criteria

Backup/restore proof is successful only if:

- backup command completed
- restore command completed
- restored DB query/check completed
- no secret leaked
- source was staging/disposable DB only
- restore target was disposable restore DB only
- no production DB was touched
- no real money, no live payout, and no live provider/payment/bank/SMS/Slip OCR were used
- no deploy
- no seed

## 7. NOT EXECUTED Path

If no safe staging/disposable DB exists or the environment cannot be classified safely:

- mark NOT EXECUTED
- explain missing staging/disposable DB
- do not run backup
- do not run restore
- do not query a database
- do not fabricate proof

Use this status:

`NOT EXECUTED because no staging/disposable DB configured`

## Final Boundary

Backup/restore proof is staging/disposable DB only. It is not production backup proof, not production migration proof, not real-money proof, not live payout proof, not live provider/payment/bank/SMS/Slip OCR proof, not deploy, and not seed.
