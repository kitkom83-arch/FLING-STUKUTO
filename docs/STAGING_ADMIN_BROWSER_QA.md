# Staging Admin Browser QA

Phase F validates the browser route contract and manual admin UI behavior for staging only. Do not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout paths.

## Routes

- `/admin`
- `/admin/roles`
- `/admin-wheel`

Each route must open directly, with or without trailing slash where supported, and a browser refresh on the route must not return `404`.

## A. `/admin`

- [ ] Page opens on the staging domain.
- [ ] Login/admin shell follows the existing admin pattern.
- [ ] Role Management link or section can be reached.
- [ ] Browser Console has no red errors.
- [ ] Rendered page has no `undefined`, `NaN`, or `[object Object]`.
- [ ] Rendered page does not show credential values, database connection strings, request auth headers, session values, or JWT-shaped values.

## B. `/admin/roles`

- [ ] Page opens on the staging domain.
- [ ] Role list renders.
- [ ] Permission matrix renders.
- [ ] `wheel.*` permissions are visible.
- [ ] `admin.audit.view` is visible.
- [ ] `admin.roles.update` is visible.
- [ ] Effective permission preview renders.
- [ ] Save is disabled until there is both a permission change and a reason.
- [ ] Reset changes restores the original permission state.
- [ ] Confirm modal appears before save.
- [ ] Owner and legacy `super_admin` role edits are blocked or show the protected-role warning according to backend logic.
- [ ] Browser Console has no red errors.
- [ ] No owner/super_admin bypass, wildcard permission, or production override control is exposed.

## C. `/admin-wheel`

- [ ] Page opens on the staging domain.
- [ ] Permission summary panel shows role and site code.
- [ ] Campaign settings tab opens.
- [ ] Rewards management tab opens.
- [ ] Spin history tab opens.
- [ ] Reports tab opens.
- [ ] Audit history tab opens.
- [ ] Reward Claims tab opens.
- [ ] Claim and cancel actions require a reason.
- [ ] No force reward, force spin, or set-prize-index control is present.
- [ ] Browser Console has no red errors.

## D. Safety

- [ ] No production DB.
- [ ] No real money.
- [ ] No live provider, payment, bank, SMS, or Slip OCR.
- [ ] No credential, database connection, auth header, session, or JWT-shaped value is rendered.
- [ ] Member spin result remains backend-selected only.
- [ ] Admin UI does not call the member spin endpoint.
- [ ] Every admin write action requires a reason and writes audit history.

## Browser Route Smoke

Run this static HTTP route smoke locally before browser handoff:

```powershell
node src\local-smoke-tests\adminBrowserRoutesSmoke.js
```

It starts the Express app on an ephemeral local port, fetches `/admin`, `/admin/roles`, `/admin-wheel`, their trailing-slash aliases, JS/CSS assets, and a negative `/api/*` boundary route. It does not run migrations, seed data, use production DB, call live providers, or move money.

DB-backed runtime smoke may report SKIPPED or BLOCKED when the required safe local/staging env is absent. Treat that as a guard result, not a UI pass. Report the guard reason and do not weaken auth, permission, staging, or provider-mode guards to force a pass.
