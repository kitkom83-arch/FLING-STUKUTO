# Staging Release Runbook

Phase K defines the operator runbook for staging release, rollback, incident handling, and smoke policy. Use it only for the Render staging service and staging/mock/sandbox fixtures.

## 1. Scope

- Staging/mock/sandbox only.
- No production database.
- No real money.
- No live provider, payment, bank, SMS, or Slip OCR.
- No real payout.
- Do not paste real credential values into docs, chat, tickets, screenshots, terminal transcripts, commits, or logs.

## 2. Pre-Deploy Checklist

- Confirm `git status` is clean.
- Confirm the latest commit:

```powershell
git log -1 --oneline
```

- Check recent Safe CI runs:

```powershell
gh run list --branch main --limit 10
```

- Safe CI must be PASS before staging deploy.
- Render Build Command must be `npm install && npx prisma generate`.
- Render Start Command must be `npm start`.
- Seed command is temporary only. Do not leave it in the Render Start Command.
- Confirm the staging service still uses mock/sandbox/disabled external modes only.

## 3. Deploy Checklist

- Open Render.
- Go to the staging Web Service.
- Use Manual Deploy > Deploy latest commit.
- Wait until Render shows `Your service is live`.
- Check health:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

- Confirm `databaseConnected` is `true`.
- Confirm external service modes are `mock`, `sandbox`, or `disabled`.

## 4. Post-Deploy Release Gate

Run after every staging deploy:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-release-gate
```

Release gate policy:

- Non-destructive.
- Does not consume member wheel spin.
- Does not patch role permissions.
- Checks health, database connectivity, external modes, admin read-only endpoints, browser routes, member wheel read-only endpoints, role-permission audit reads, and response leak safety.

## 5. Full UAT Policy

Run only after seed reset or before closing a major phase:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-uat
```

Full UAT policy:

- It may consume a staging/mock member wheel spin.
- It should not be run repeatedly as a routine release gate.
- If member spin returns `400`, reset the staging demo member/wheel state through the guarded seed and run Full UAT once.

## 6. Role Permission UAT Policy

Run when role or permission behavior changes:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-role-permission-uat
```

Role Permission UAT policy:

- Mutates only a safe non-owner staging role fixture.
- Restores the original role permissions immediately.
- Requires the no-permission admin fixture and safe role fixture for full Phase H/role-permission closure.
- Must not grant owner, `super_admin`, or `admin.manage` through the role matrix.

## 7. Seed/Reset Policy

Use seed/reset only when fixture state must be refreshed for Full UAT or role-permission UAT.

Temporary Render Start Command:

```bash
NODE_ENV=staging npm run staging:seed-demo && npm start
```

Seed/reset steps:

- Set staging-only demo fixture values in Render Environment or the approved credential manager.
- Change the Render Start Command to the temporary command above.
- Deploy latest commit.
- Wait for sanitized seed PASS output.
- Change Render Start Command back to `npm start` immediately.
- Deploy latest commit again.
- Confirm the normal service is live.
- Do not leave the seed command in the Start Command.

## 8. Rollback Checklist

- In Render, roll back to the previous live deploy.
- Check health:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

- Run the release gate:

```powershell
npm run smoke:staging-release-gate
```

- If rollback still fails, check Render Build Command, Render Start Command, and Render logs.
- Keep staging connected only to staging/mock/sandbox resources.
- Never point staging at production as a rollback shortcut.

## 9. Incident Checklist

### 502 HTML from `/admin/auth/login`

- Check `/api/health` twice.
- Wait for the service to stabilize.
- Rerun `npm run smoke:staging-release-gate`.
- If it still fails, redeploy latest commit.

### Cannot find module `express`

- Confirm Build Command is `npm install && npx prisma generate`.
- Clear Render build cache and deploy again.

### No open ports detected

- Confirm the server binds `0.0.0.0`.
- Confirm the server uses `process.env.PORT`.

### Member spin `400`

- Full UAT consumes a spin.
- Reset the staging demo member/wheel state through the guarded seed.
- Run Full UAT once after reset.

### No-permission admin credential mismatch

- Check Render Environment values through the approved credential channel.
- Refresh the staging fixture through the guarded seed.

### Start Command is still a seed command

- Change Start Command back to `npm start` immediately.
- Deploy latest commit again.

## 10. ENV Safety

- Use masked input when entering local smoke credentials:

```powershell
$env:STAGING_DEMO_ADMIN_EMAIL = Read-Host "Staging demo admin email"
$env:STAGING_DEMO_ADMIN_PASSWORD = Read-Host -MaskInput "Staging demo admin credential"
$env:STAGING_DEMO_MEMBER_USERNAME = Read-Host "Staging demo member username"
$env:STAGING_DEMO_MEMBER_PASSWORD = Read-Host -MaskInput "Staging demo member credential"
```

- Do not paste real credential values into docs, chat, tickets, screenshots, commits, terminal transcripts, or logs.
- Clear local smoke values after the run.
- Clear PowerShell history after handling staging credentials.

## 11. Commands Copy/Paste

Health check:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

Release gate smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-release-gate
```

Full UAT smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-uat
```

Role permission UAT smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-role-permission-uat
```

Cleanup local ENV:

```powershell
Remove-Item Env:\BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_ADMIN_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_ADMIN_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_MEMBER_USERNAME -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_MEMBER_PASSWORD -ErrorAction SilentlyContinue
Clear-History
```

## Final Boundary

- Release gate = run after every deploy.
- Full UAT = run after seed/reset only.
- Role Permission UAT = run after role permission changes.
- Seed command = temporary only.
- Start Command final = `npm start`.
- Build Command final = `npm install && npx prisma generate`.
- Staging remains mock/sandbox only.
