# Admin Operator Handoff Final

Phase I covers final manual browser QA and operator handoff for the staging admin surfaces only. This guide is for admins and operators checking the live staging pages before handoff.

## 1. Scope

- This system is staging/mock/sandbox only.
- No real money is used.
- No production database is used.
- Provider, payment, bank, SMS, and Slip OCR integrations remain mock, sandbox, or disabled.
- This guide does not approve production launch, real payout, live provider access, or production customer data access.

## 2. URLs

- `/admin`
- `/admin/roles`
- `/admin-wheel`
- `/admin/audit-security`
- `/admin/work-schedules`

## 3. Before Starting

- Render staging must be live before browser QA starts.
- Render Start Command must be `npm start`.
- Do not leave a seed command in the Render Start Command.
- Demo credentials must come from Render Environment or the approved secret manager only.
- Do not write real credential values in this document, screenshots, tickets, chat, or logs.
- Build Command must stay `npm install && npx prisma generate`.

## 4. Admin Role Management

Open `/admin/roles`.

- Confirm the role list is visible.
- Confirm the permission matrix is visible.
- Confirm the effective permission preview is visible.
- Assign or revoke a permission only for normal non-owner roles.
- Enter a clear reason before saving.
- Confirm the modal appears before the write action is submitted.
- Confirm an audit log is created for `admin.role.permissions.update`.
- Confirm `owner` and `super_admin` are protected and cannot be edited through the matrix.
- Do not grant `admin.manage` through the role permission matrix.

## 5. Lucky Wheel Admin

Open `/admin-wheel`.

- Confirm Campaign settings opens.
- Confirm Rewards management opens.
- Confirm Reward Claims opens.
- Confirm Spin history opens.
- Confirm Reports opens.
- Confirm Audit history opens.
- Confirm Permission summary shows role and site code.
- Confirm Claim and Cancel require a reason.
- Confirm claim/cancel creates `wheel.memberReward.status.update` when a safe staging action succeeds.
- Do not force reward.
- Do not force spin.
- Do not set `prizeIndex` from the admin UI.
- Member spin result must remain selected by the backend only.

## 6. Audit Security

Open `/admin/audit-security`.

- Confirm audit and security logs are visible when the admin has permission.
- Confirm filters and action search work.
- Confirm important actions can be checked when data exists:
  - `admin.role.permissions.update`
  - `wheel.memberReward.status.update`
  - `wheel.reward.update`
  - `wheel.campaign.update`
- Confirm detail views show safe metadata only.
- Confirm the page does not show password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` values.

## 7. Work Schedules

Open `/admin/work-schedules`.

- Confirm the schedule list is visible.
- Confirm override controls are visible for allowed admins.
- Confirm audit/history is visible.
- Confirm login guard behavior still works for staged schedule restrictions.
- Confirm schedule and override writes require a reason and create audit history.

## 8. Manual Browser QA Checklist

Check each page in a browser:

- F12 Console has no red errors.
- Refreshing the route does not return `404`.
- Tabs can be changed.
- Modals open and close.
- Reason validation works.
- Disabled states are correct.
- Access denied states are correct.
- No `undefined`, `NaN`, or `[object Object]` appears in visible copy.
- No password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` value is shown.

## 9. Smoke Commands

Run these before final handoff:

```powershell
npm run smoke:staging-uat
npm run smoke:staging-role-permission-uat
npm run smoke:admin-browser-routes
npm run smoke:admin-operator-handoff
```

If local runtime smoke is blocked or skipped by a safety guard, record the guard reason. Do not weaken auth, permission, staging, or provider-mode guards to force a pass.

## 10. Troubleshooting

- Render port issue: the server must bind `0.0.0.0` and use `process.env.PORT`.
- Missing Express after deploy: Build Command must be `npm install && npx prisma generate`.
- Member spin returns `400`: reset the staging demo member fixture and run the smoke once.
- No-permission admin credential invalid: check Render Environment values and refresh the staging fixture through the guarded seed.
- Start Command must be changed back to `npm start` after any temporary seed deploy.
- If a route refresh returns `404`, run `npm run smoke:admin-browser-routes` and check the static route fallback before browser handoff.

## Final Boundary

- No production DB.
- No real money.
- No live provider, payment, bank, SMS, or Slip OCR.
- No real payout.
- Admin UI is advisory only. Backend auth, permission, staging, and safety guards remain the source of truth.
