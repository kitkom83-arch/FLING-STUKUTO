# Staging Deploy Decision Checklist

This document is a go/no-go checklist for staging only. It does not authorize a real deploy by itself, production database use, live provider mode, live payment rails, live bank rails, or real-money testing.

Do not paste real database URLs, tokens, passwords, API keys, provider secrets, callback secrets, private keys, authorization headers, or platform credentials into this file.

## Required Decision Inputs

- [ ] Platform selected: Render, Railway, Fly.io, or VPS.
- [ ] Staging domain selected and confirmed as non-production.
- [ ] Dedicated staging/test PostgreSQL exists and is separate from production.
- [ ] Staging database is not a production clone, production read replica, or production customer database.
- [ ] Platform secret manager exists and is access-controlled.
- [ ] Required ENV values are configured in the platform secret manager.
- [ ] `GET /api/health` returns safe JSON on staging.
- [ ] `npm run staging:preflight` passes.
- [ ] `BASE_URL=https://<staging-domain>/api npm run smoke:staging` passes.
- [ ] Rollback owner is named.
- [ ] Deploy owner is named.
- [ ] No provider/payment/bank/SMS/Slip OCR mode is `live`.
- [ ] No real-money flow is enabled or tested.

## Current Platform Recommendation

- Recommended first staging target: Render Web Service.
- Railway, Fly.io, and VPS remain backup options.
- Final deploy is still blocked until the real platform service, staging domain, dedicated staging DB, and secret-manager values are ready.
- This decision checklist does not authorize Codex to run a real deploy.

## Deploy Dry-Run Commands

Run locally before handoff:

```bash
npm run check
npm run staging:preflight
```

Run only after a real staging service exists:

```powershell
$env:BASE_URL = "https://<staging-domain>/api"
npm run staging:preflight
npm run smoke:staging
```

These commands are templates. Replace placeholders only in a private operator shell or platform UI, never in committed files.

## GO Conditions

GO is allowed only when all items are true:

- Platform, staging domain, deploy owner, and rollback owner are confirmed.
- Staging/test database is dedicated and verified as non-production.
- All required ENV values are set in the platform secret manager.
- Provider, payment, bank, SMS, and Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Health check, staging preflight, and staging smoke pass.
- Secret scan over changed files passes.
- Rollback method is known for the selected platform.
- No live provider credential, production DB credential, or real-money path is present.

## NO-GO Conditions

NO-GO if any item is true:

- Platform, staging domain, staging DB, deploy owner, or rollback owner is missing.
- Any database label, host, or account appears production-like.
- `DATABASE_URL` points to production, a production clone, or an unverified database.
- Any external mode is `live`.
- Any required secret is pasted into docs, commits, logs, tickets, screenshots, or chat.
- Health, preflight, smoke, or secret scan fails.
- Rollback path is unknown.
- Provider/payment/bank/SMS/Slip OCR sandbox credentials are not approved but modes are set to sandbox.

## Rollback Triggers

Rollback staging if any item occurs after deploy:

- `/api/health` fails or returns unsafe external mode labels.
- `npm run staging:preflight` fails against the staging API.
- `npm run smoke:staging` fails after deploy.
- Staging connects to an unexpected database target.
- Any provider/payment/bank/SMS/Slip OCR mode becomes `live`.
- Logs or responses expose secret-shaped values.
- Admin auth, permission, audit, schedule, deposit, withdrawal, or wallet behavior regresses in smoke.
- Staging traffic affects real customers, real provider accounts, or real money.

## Secret Rotation Triggers

Rotate the affected secret immediately if:

- It was committed or staged.
- It was printed in terminal output, logs, health response, smoke output, screenshots, tickets, or chat.
- It was copied into docs or pull request text.
- It was shared outside the selected platform secret manager.
- A staging operator no longer needs access.
- A sandbox provider test completes and the credential will be reused later.

Record the key name, owner, rotation time, and service label only. Do not record the secret value.
