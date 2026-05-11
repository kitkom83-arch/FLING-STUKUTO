# Staging Rollback Runbook

This runbook covers staging rollback only. It does not authorize production access, production database use, live provider mode, live bank rails, live payment rails, or real-money testing.

Never record raw database URLs, passwords, tokens, API keys, JWTs, provider secrets, callback secrets, private keys, or authorization headers in rollback notes.

## Immediate Decision

- Stop new staging UAT steps.
- Identify the affected deploy by non-secret label: platform, service, commit, release, and timestamp.
- Confirm provider/payment/bank/SMS/Slip OCR modes remain `mock`, `sandbox`, or `disabled`.
- Confirm no production database, production clone, or live provider credential is in scope.
- Assign one rollback owner and one reviewer.

## Roll Back Deploy

- Render: redeploy the previous known-good deploy from deploy history.
- Railway: redeploy the previous successful deployment or pin the previous commit.
- Fly.io: rollback to the previous release and verify machines restart.
- VPS: switch the process manager to the previous known-good release directory or commit, then restart the service.

Do not change `DATABASE_URL` to production as a rollback shortcut. If a migration caused the failure, pause and review the staging migration state before running any corrective migration.

## Disable Staging Traffic

Use the lowest-risk option available on the selected platform:

- Remove or pause the public staging route.
- Restrict the staging route behind platform access controls or IP allow rules.
- Stop the staging service if the issue can affect data integrity.
- Disable staging webhooks, worker processes, cron jobs, queue consumers, or callback routes involved in the test.
- Set external modes back to `mock` or `disabled` if any sandbox integration is unstable.

Do not disable production traffic from this runbook.

## Check Health After Rollback

Use the staging API URL only:

```bash
curl <STAGING_API_BASE_URL>/api/health
```

Expected:

- HTTP `200`.
- JSON response with `success: true`.
- `data.ok` is `true`.
- `data.databaseConnected` is a boolean.
- `data.externalModes` contains only `mock`, `sandbox`, or `disabled`.
- No database URL, token, password, secret, API key, JWT, or authorization header appears in the response or logs.

## Check Smoke After Rollback

Run the safe preflight and staging smoke only after the rollback service is reachable:

```bash
npm run staging:preflight
BASE_URL=<STAGING_API_BASE_URL>/api npm run smoke:staging
```

Run DB-backed smoke only when the staging database target and fixtures are confirmed safe:

```bash
npm run smoke:admin-work-schedule
npm run smoke:admin-work-schedule-ui
npm run smoke:admin-audit-security
```

If any guard blocks, stop and keep the block in the incident note without printing secret values.

## Incident Record

Record only non-secret facts:

- Incident title.
- Platform and service label.
- Affected staging URL label.
- Bad deploy commit or release label.
- Rollback commit or release label.
- Start time, rollback time, and recovery time.
- Health result: PASS/FAIL and status code.
- Smoke result: PASS/FAIL/SKIPPED and command names.
- Provider modes by label only: `mock`, `sandbox`, or `disabled`.
- Whether staging traffic was paused, restricted, or left open.
- Owner, reviewer, and follow-up actions.

Do not paste raw environment variables, connection strings, tokens, provider payloads, bank payloads, stack traces containing env values, or screenshots that expose secrets.

## Secret Exposure During Incident

If any secret was printed, committed, screenshotted, pasted, or exposed outside the approved secret manager:

- Revoke or rotate the exposed value immediately.
- Replace it only through the platform secret manager.
- Redeploy or restart staging so the old value is no longer loaded.
- Record the affected key name and rotation owner, but not the secret value.
- Re-run `npm run staging:preflight` and `npm run smoke:staging`.
