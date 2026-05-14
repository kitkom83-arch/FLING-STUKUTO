# Staging UAT Handoff

This handoff is for PG77-real-core staging tester access only. Render staging has passed health, DB check/seed, staging smoke, and staging UAT smoke, but this is not production and does not authorize live money, live providers, live payment rails, live bank rails, SMS sending, or live Slip OCR.

Never put real passwords, tokens, API keys, provider secrets, callback secrets, bearer values, or real database URLs in this file, logs, screenshots, tickets, pull requests, commits, or chat.

## Target

- Staging URL: `https://fling-stukuto-staging-api.onrender.com`
- API base URL: `https://fling-stukuto-staging-api.onrender.com/api`
- Health check: `GET /api/health`
- Expected health boundary: `databaseConnected=true` and all external modes are `mock`, `sandbox`, or `disabled`

## What Testers May Test

- Health/readiness checks through `/api/health`.
- Login/logout with approved staging demo accounts only.
- Safe invalid admin login behavior. Invalid credentials must fail closed without `500`, token leaks, stack traces, or password hints.
- Admin schedule UI behavior for staging demo admins, including list/read/update, working days, overnight schedules, emergency override, and schedule-blocked login behavior.
- Audit/security UI behavior, including role/work-schedule audit review, client-side filters, summary cards, empty states, masked IP values, omitted raw user-agent values, and safe detail modals.
- Lucky Wheel MVP API contract with staging/mock member/admin accounts only: config, spin, history, my rewards, admin config, admin reason validation, and audit reason visibility.
- Read-only reports/config visibility that is already covered by smoke scripts.
- Mock/sandbox deposit, withdrawal, game, payment, bank statement, SMS, and Slip OCR flows only where the staging UI/API exposes them safely.

## Manual Admin UI Test

Use this checklist for manual staging clicks only. Do not use production accounts, do not turn on live provider/payment/bank/SMS/Slip OCR modes, and do not test real-money movement.

- [ ] Open `https://fling-stukuto-staging-api.onrender.com/api/health`.
- [ ] Confirm health returns HTTP `200`, `databaseConnected=true`, and external modes only as `mock`, `sandbox`, or `disabled`.
- [ ] Log in with the approved staging demo admin. Get the password only from the secret manager or approved out-of-repo channel.
- [ ] Open the admin work schedule UI.
- [ ] Confirm the schedule list loads.
- [ ] Confirm the UI branding shows `STUDIOKUTO` and `SK`, not legacy admin branding.
- [ ] Confirm token clear removes the credential from the input and session state before entering a new credential.
- [ ] Open a schedule row with `Detail` and confirm the read-only modal shows username, role, status, working days, time, emergency override status, last updated, and updated by with `-` for missing fields.
- [ ] Open or edit a staging demo admin schedule only if the tester role is approved for that action.
- [ ] Confirm schedule edit requires a reason, validates enabled schedules for working days and start/end time, shows `Confirm schedule update`, saves, refreshes the list, and shows that reason in audit history.
- [ ] Confirm enable/disable opens a reason-required confirm modal, writes a schedule audit event with the typed reason, shows the expected success toast, and refreshes the list.
- [ ] Confirm emergency override requires a reason and an expiration when enabled, rejects overrides without expiration, shows a confirm step, refreshes the list, and shows the reason in audit history.
- [ ] Confirm the `Audit` button scrolls to audit history, filters/loads the selected admin, and handles `0 events` without a blank page.
- [ ] Confirm Edit, Enable, Disable, and Override reasons do not disappear after refresh or per-admin audit reload.
- [ ] Confirm schedule audit history uses masked/safe values and does not show passwords, tokens, database URLs, provider secrets, or authorization headers.
- [ ] Confirm visible UI, browser network previews, copied logs, and screenshots do not expose passwords, tokens, secrets, raw authorization headers, or database URLs.
- [ ] Open Permission Guard, use the approved staging token, and confirm session status, current admin, role, site code, access granted/denied, and permission matrix render without exposing the token.
- [ ] Confirm Permission Guard requests include the staging site code header and use backend-enforced permission results.
- [ ] Open Role Management / Admin Permission, select a role, and confirm role detail, permission list, and admin count/read-only fallback render safely.
- [ ] Open Edit role permissions and confirm reason validation blocks empty reason before any confirm/save path.
- [ ] Confirm role-definition editing is clearly marked read-only/mock if the staging demo has no role definition update endpoint.
- [ ] If an admin role/permission assignment is tested through backend write APIs, confirm the typed reason appears in audit history and does not disappear after reload.
- [ ] Confirm role/permission audit rows show masked IP values and do not show passwords, tokens, secrets, raw authorization headers, or database URLs.
- [ ] In Admin Role Assignment, confirm the table shows admin username, current role, schedule status, last updated, updated by, and Change role.
- [ ] Click Change role without a reason and confirm the role update confirm modal does not open.
- [ ] Select the current role as the new role, if selectable, and confirm the UI blocks the update before API submission.
- [ ] Click Change role on the current logged-in admin and confirm the UI shows `You cannot change your own role in this staging UI.` and does not submit.
- [ ] For another staging demo admin, select a different role, enter a reason, confirm `Confirm role assignment update`, and verify `Admin role updated`.
- [ ] Load audit for `admin.role.update` and confirm target username, reason, before/after role, target admin ID, and site code are visible.
- [ ] Load work schedule audit rows and confirm schedule update, enable/disable, override, expired override, or login-blocked rows show target admin, schedule state, reason, and status.
- [ ] Open audit logs.
- [ ] Confirm audit log summary cards, filters, empty states, role/work-schedule highlights, and detail modal load without showing secrets.
- [ ] Open security events.
- [ ] Confirm security event rows, filters, summaries, empty states, status badges, and detail modal load without showing secrets.
- [ ] Verify Lucky Wheel member config at `GET /api/member/wheel/config` with a staging/mock member token.
- [ ] Confirm wheel config returns campaign `wheel_main`, 8 demo rewards, remaining spins, mock balance, rules, and no `probabilityWeight` in the member response.
- [ ] Verify spin with `POST /api/member/wheel/spin` using only `campaignId`; confirm backend returns `prizeIndex`, reward data, remaining spins, and balance after.
- [ ] Confirm frontend-style attempts to submit `rewardId` or `prizeIndex` are rejected.
- [ ] Verify `GET /api/member/wheel/history` shows the spin and `GET /api/member/wheel/my-rewards` shows pending rewards when the result is not `no_reward`.
- [ ] Verify admin `PATCH /api/admin/wheel/campaign` rejects empty `reason`.
- [ ] Verify admin `POST /api/admin/wheel/rewards` and `PATCH /api/admin/wheel/rewards/:id` reject empty `reason`.
- [ ] Verify successful admin campaign/reward updates write audit logs with the typed reason and no secret-shaped values.
- [ ] Confirm Lucky Wheel responses do not expose passwords, tokens, authorization headers, database URLs, provider secrets, stock internals on member endpoints, or raw user-agent.
- [ ] Final authenticated browser role assignment verification remains blocked unless approved staging credentials are available from the secret manager or approved out-of-repo channel.
- [ ] Test invalid admin login with intentionally wrong credentials.
- [ ] Confirm invalid login fails closed with a controlled auth failure and does not return `500`.
- [ ] Test logout if the UI exposes a logout control.
- [ ] Confirm protected admin pages require login again after logout or session expiry.
- [ ] Check visible responses, browser network previews, copied logs, and screenshots for secret leaks before attaching anything to a bug report.

## What Testers Must Not Test

- Production database, production clone, production read replica, or production customer data.
- Real money deposit, withdrawal, transfer, settlement, payout, or reconciliation.
- Lucky Wheel real payout, real reward settlement, real wallet payout, or frontend-selected reward results.
- Live game provider, payment provider, bank statement, SMS, or Slip OCR mode.
- Real provider callbacks, real bank webhooks, real OCR uploads, or real SMS sending.
- Production credentials, production admin/member accounts, or production settlement accounts.
- Any test that requires printing, copying, or screenshotting secrets.
- Any direct database mutation outside the approved staging seed/check flow.

## What Is Still Mock/Sandbox/Disabled

- Game provider mode remains mock/sandbox/disabled.
- Payment provider mode remains mock/sandbox/disabled.
- Bank statement mode remains mock/sandbox/disabled.
- SMS provider mode remains mock/sandbox/disabled.
- Slip OCR mode remains mock/sandbox/disabled.
- Lucky Wheel remains staging/mock only. Backend chooses the result; frontend must never submit reward id, prize index, probability, or reward value.
- Demo fixtures are staging-only and must not be treated as production accounts.

## How To Report Bugs

Include only non-secret evidence:

- Environment label: `staging`.
- Feature or page tested.
- Timestamp with timezone.
- Expected result and actual result.
- HTTP status code and route path without query secrets.
- Browser, device, and role used, if relevant.
- Screenshot only if it contains no secret values, no ENV page, no bearer token, no raw database URL, and no password.
- Short reproduction steps using staging demo labels, not real credentials.

Do not include passwords, tokens, authorization headers, cookies, database URLs, provider keys, callback secrets, full ENV pages, or raw request payloads that include sensitive values.

## Bug Report Template

```text
Severity: blocker | major | minor
Page/endpoint:
Role used:
Timestamp and timezone:

Steps:
1.
2.
3.

Expected:

Actual:

Screenshot/log attached: yes/no
Secret check: confirmed no password, token, authorization header, cookie, DATABASE_URL, API key, provider secret, callback secret, or ENV page is included
```

## Safe Log Attachment

Before attaching logs:

- Redact `DATABASE_URL`, JWTs, bearer tokens, cookies, API keys, provider secrets, callback secrets, passwords, hashes, and authorization headers.
- Redact complete request/response headers unless the specific non-secret header is needed.
- Keep only the route, status code, timestamp, safe request id, and sanitized error message.
- Do not attach Render Environment/Secrets screenshots or terminal output that prints env values.
- If a credential appears in a log or screenshot, stop sharing it, rotate the credential, and report the leak through the security channel before continuing UAT.

## GO / NO-GO Before Tester Access

GO only when all items are true:

- `/api/health` passes on Render staging.
- Staging DB is connected and is a dedicated staging/test database.
- Admin demo login passes.
- `npm run staging:db:check` passes.
- `npm run staging:db:seed` has passed when demo fixtures were required.
- `npm run smoke:staging` passes.
- `npm run smoke:staging-uat` passes.
- Lucky Wheel smoke or manual checklist passes in staging/mock mode when Lucky Wheel is in scope.
- No `500` appears in the main manual admin UI flow.
- Invalid admin login fails closed without `500` and without secrets.
- No response, screenshot, log, ticket, commit, or chat contains a secret-shaped value.
- All provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Demo credentials were shared only through a secret manager or other approved out-of-repo channel.
- Any credential that was exposed has been rotated before handoff.

NO-GO if any item is true:

- Any production database or production customer data is in scope.
- Health fails or the staging DB is disconnected.
- Admin demo login fails.
- Any external mode is `live`.
- Any health, DB check, seed, smoke, or UAT smoke check fails.
- Any response contains a password, token, authorization header, cookie, database URL, API key, provider secret, callback secret, or other secret-shaped value.
- Any secret appears in docs, logs, screenshots, tickets, commits, chat, or smoke output.
- Testers need real money, real provider callbacks, real bank rails, SMS live sending, or live Slip OCR to complete the requested test.
- Testers need Lucky Wheel real payout, real wallet credit settlement, or frontend-side reward randomization to complete the requested test.
