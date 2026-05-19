# Staging Admin Browser QA

Phase I validates final manual browser QA for staging admin pages. Use this only against staging/mock/sandbox. Do not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout paths.

## Routes

- `/admin`
- `/admin/roles`
- `/admin-wheel`
- `/admin/audit-security`
- `/admin/work-schedules`

Each route must open directly, must support browser refresh without `404`, and must not return API JSON or an error page for GET/HEAD browser navigation.

## A. `/admin`

- [ ] Page opens on the staging domain.
- [ ] Browser refresh does not return `404`.
- [ ] Admin shell displays.
- [ ] Link to `/admin/roles` works.
- [ ] Link to `/admin-wheel` works.
- [ ] Work Schedule section can be reached.
- [ ] Audit Security navigation is visible or reachable.
- [ ] F12 Console has no red errors.
- [ ] Browser Console has no red errors.
- [ ] No `undefined`, `NaN`, or `[object Object]` appears.
- [ ] No raw secret or credential value is visible.

## B. `/admin/roles`

- [ ] Page opens on the staging domain.
- [ ] Browser refresh does not return `404`.
- [ ] Role list displays.
- [ ] Permission matrix displays.
- [ ] `wheel.*` permissions display.
- [ ] `admin.audit.view` displays.
- [ ] `admin.roles.update` displays.
- [ ] Save is disabled when there is no change.
- [ ] Save is disabled when reason is blank.
- [ ] Reason is required before submit.
- [ ] Reset changes restores the previous state.
- [ ] Confirm modal appears before save.
- [ ] Effective permission preview displays.
- [ ] Owner and `super_admin` protected warning or backend block is visible.
- [ ] No raw secret or credential value is visible.
- [ ] Browser Console has no red errors.

## C. `/admin-wheel`

- [ ] Page opens on the staging domain.
- [ ] Browser refresh does not return `404`.
- [ ] Permission summary shows role and site code.
- [ ] Campaign settings tab opens.
- [ ] Rewards management tab opens.
- [ ] Reward Claims tab opens.
- [ ] Spin history tab opens.
- [ ] Reports tab opens.
- [ ] Audit history tab opens.
- [ ] Claim and cancel actions require a reason.
- [ ] No force reward control is present.
- [ ] No force spin control is present.
- [ ] No set `prizeIndex` control is present.
- [ ] Browser Console has no red errors.

## D. `/admin/audit-security`

- [ ] Route opens on the staging domain.
- [ ] Browser refresh does not return `404`.
- [ ] Audit/security summary displays.
- [ ] Audit log table displays or shows a safe empty state.
- [ ] Security event table displays or shows a safe empty state.
- [ ] Filter controls work.
- [ ] Action search works.
- [ ] Detail modal opens and closes.
- [ ] No password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` value is visible.
- [ ] Browser Console has no red errors.

## E. `/admin/work-schedules`

- [ ] Route opens on the staging domain.
- [ ] Browser refresh does not return `404`.
- [ ] Schedule UI displays.
- [ ] Override UI displays for allowed admins.
- [ ] Audit/history displays or shows a safe empty state.
- [ ] Schedule write reason validation works.
- [ ] Override reason validation works.
- [ ] Login guard behavior still blocks staged out-of-schedule access when configured.
- [ ] Browser Console has no red errors.

## Cross-Page Safety

- [ ] No production DB.
- [ ] No real money.
- [ ] No live provider, payment, bank, SMS, or Slip OCR.
- [ ] No real payout.
- [ ] Member spin result remains backend-selected only.
- [ ] Admin UI does not call the member spin endpoint.
- [ ] Every admin write action requires a reason and writes audit history.
- [ ] No `undefined`, `NaN`, or `[object Object]` appears on any page.
- [ ] No password, token, secret, `DATABASE_URL`, `Authorization`, or `JWT` value is visible.

## Smoke Commands

Run static route/source smoke before browser handoff:

```powershell
npm run smoke:admin-browser-routes
npm run smoke:admin-wheel-ui
npm run smoke:admin-operator-handoff
```

Run hosted staging UAT smoke after deploy when staging demo env is available:

```powershell
npm run smoke:staging-uat
npm run smoke:staging-role-permission-uat
```

DB-backed runtime smoke may report `SKIPPED` or `BLOCKED` when the required safe local/staging env is absent. Treat that as a guard result, record the reason, and do not weaken auth, permission, staging, or provider-mode guards to force a pass.
