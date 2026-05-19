# Admin Wheel Handoff

Phase C covers Admin Wheel UI manual QA and operator handoff for staging only. It does not approve production database access, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.

## Staging URL

- Admin Wheel: `https://stukuto-real-core-staging.onrender.com/admin-wheel`
- Trailing slash: `https://stukuto-real-core-staging.onrender.com/admin-wheel/`
- Legacy alias: `https://stukuto-real-core-staging.onrender.com/admin/lucky-wheel/`

## What This Page Does

- Configure Lucky Wheel campaign settings.
- Manage rewards.
- View spin history.
- View reports.
- View audit history.
- View reward claims.
- Show the current admin Lucky Wheel permission summary for the selected site.

## Permission Panel Check

1. Open `/admin-wheel` with a staging/mock admin credential.
2. Confirm `Permission summary` shows current role, site, campaign view/update, reward manage, claims view/update, reports view, and audit view.
3. Confirm an admin without write permission sees disabled Save/Add/Edit/Claim/Cancel buttons with `ไม่มีสิทธิ์ดำเนินการนี้`.
4. Confirm an admin without a tab view permission sees `ไม่มีสิทธิ์เข้าถึง` and `กรุณาติดต่อผู้ดูแลระบบ`.
5. Confirm denied tabs do not load or render API data for that surface.

## Campaign Settings Check

1. Open `/admin-wheel`.
2. Open the `Campaign settings` tab.
3. Edit campaign fields such as name, status, cost, daily limit, or rules.
4. Leave `Reason` blank and confirm the UI blocks the save with a clear required message.
5. Enter a staging-safe reason and save.
6. Confirm the page refreshes or shows a success toast.
7. Confirm audit history includes `wheel.campaign.update`.

## Rewards Management Check

1. Open the `Rewards management` tab.
2. Add a reward with staging/mock values only.
3. Edit the reward.
4. Enable or disable the reward.
5. Confirm every create, edit, enable, or disable action requires `Reason`.
6. Confirm audit history includes `wheel.reward.create`, `wheel.reward.update`, or `wheel.reward.status.update`.
7. Do not use reward management to force a member spin result. Member spin result and prize index must come from the backend only.

## Reward Claims Check

1. Open the `Reward Claims` tab.
2. Filter by status and confirm the table updates.
3. Open `View detail` and close the detail modal.
4. Use `Mark claimed` only on pending item rewards.
5. Use `Cancel` only on pending rewards.
6. Confirm claim and cancel actions reject a blank `Reason`.
7. Confirm successful claim or cancel writes `wheel.memberReward.status.update`.
8. Confirm no real payout, wallet credit, provider call, bank action, payment action, SMS, or Slip OCR action occurs.

## Reports Check

1. Open the `Reports` tab.
2. Confirm summary cards render total spins, unique members spun, rewards issued, pending rewards, claimed rewards, expired/cancelled rewards, total point cost, total ticket cost, stock used, top reward, top reward by stock used, and empty/no reward count.
3. Confirm `Top rewards`, `Reward stock usage`, `Claim status summary`, `Reward type summary`, `Daily spin count`, and `Member reward summary` render staging/mock summaries.
4. Confirm reports are summary data from staging/mock config, spins, and reward claims only. They are not real payout reports.

## Audit History Check

1. Open the `Audit history` tab.
2. Filter by action, actor, target ID, and date range.
3. Confirm expected Lucky Wheel actions are visible when data exists:
   - `wheel.campaign.update`
   - `wheel.reward.create`
   - `wheel.reward.update`
   - `wheel.reward.status.update`
   - `wheel.memberReward.status.update`
4. Confirm each write audit has a reason, actor/admin, target type, target ID, site code, and sanitized before/after summary.

## Safety Checklist

- No production DB.
- No real money.
- No live provider/payment/bank/SMS/Slip OCR.
- No real payout, wallet payout, or settlement.
- No credential or connection-string leak in UI, responses, docs, logs, screenshots, or handoff notes.
- Member spin result and prize index are backend-selected only.
- Admin UI must not call member spin endpoints.
- Admin UI must not force reward, force spin, or set member prize index.
- Every admin write action must require a reason and create an audit log.
- Permission panel must not show raw permission objects, raw headers, request IDs, tokens, passwords, secrets, or database URLs.

## Manual Browser Checklist

- Open `/admin-wheel`.
- Open browser dev tools and confirm the Console has no red errors.
- Confirm every tab opens: Campaign settings, Rewards management, Spin history, Reports, Audit history, Reward Claims.
- Confirm the permission summary panel renders and updates after credential load.
- Confirm denied tabs show the safe access-denied state.
- Confirm write buttons disable when the loaded admin lacks the matching `wheel.*` write permission.
- Confirm reward, status, claim/cancel, and detail modals open and close.
- Confirm reason validation works for campaign save, reward save, reward enable/disable, claim, and cancel.
- Confirm successful writes appear in audit history with reason, actor/admin, target type, target ID, site code, and sanitized before/after summary.
- Confirm tables do not break on desktop widths.
- Confirm empty states show `ไม่พบข้อมูล`.
- Confirm loading states show while API requests are running.
- Confirm error states are sanitized and do not show raw stacks.

## Smoke And Manual Guide

Run local static/source smoke:

```powershell
node src\local-smoke-tests\adminBrowserRoutesSmoke.js
node src\local-smoke-tests\adminWheelUiSmoke.js
```

Run runtime smoke only when the local/staging environment has safe DB, admin, member, and provider-mode settings:

```powershell
node src\local-smoke-tests\adminWheelRuntimeSmoke.js
```

Run staging UAT smoke after deploy:

```powershell
npm run smoke:staging-uat
```

`adminBrowserRoutesSmoke.js` covers `/admin`, `/admin/roles`, `/admin-wheel`, trailing-slash aliases, static asset paths, and the `/api/*` boundary before browser QA. `adminWheelUiSmoke.js` covers static route aliases, title/tabs, modal selectors, reason validation markers, no visible placeholder text, static asset leak shapes, no member spin endpoint call, and no force reward/spin controls. Browser-only checks such as Console red errors, actual table overflow, and visual modal fit remain manual checklist items.

Phase D also covers permission summary markers, disabled write buttons, access-denied copy, `GET /api/admin/permissions/me`, and granular Lucky Wheel permission keys. Runtime smoke verifies owner/super-admin allow paths, no-permission `403`, missing-reason rejection, audit read guard, response leak scan, and member spin result injection rejection when a safe local/staging runtime is available.

Phase E adds `/admin/roles` for assigning/revoking Lucky Wheel and admin/audit permissions to existing site role access rows. Operators can use it to preview effective access before saving, enter a required reason, and confirm the `admin.role.permissions.update` audit entry. This remains staging/mock/sandbox only and does not enable real payout, live provider/payment/bank/SMS/Slip OCR, or frontend spin-result control.

Phase F adds browser route QA for `/admin`, `/admin/roles`, and `/admin-wheel`. After deploy, open each route directly and refresh it. If a DB-backed runtime smoke is SKIPPED or BLOCKED by the safe env guard, report the reason and do not weaken auth, permission, staging, or provider-mode guards.

## Known Mock/Sandbox Limits

- No real money.
- Claim/cancel is a staging/mock queue operation.
- Reports are not real payout reports.
- Runtime smoke may return SKIPPED when local env values are incomplete.
- Reward Claims manual claim is limited to pending item rewards and does not perform payout.
- Browser visual regression is manual for this phase.

## Phase I Operator Handoff Final

Phase I status: Admin Wheel is included in the final admin operator manual browser QA and handoff.

Operator handoff doc:

- `docs/ADMIN_OPERATOR_HANDOFF_FINAL.md`

Final browser checklist for `/admin-wheel`:

- Permission summary shows role and site code.
- Campaign settings, Rewards management, Reward Claims, Spin history, Reports, and Audit history tabs open.
- Claim and cancel require a reason.
- Audit history can show `wheel.memberReward.status.update`, `wheel.reward.update`, and `wheel.campaign.update` when data exists.
- No force reward, force spin, or set `prizeIndex` control is present.
- Browser Console has no red errors.

Run before handoff:

```powershell
npm run smoke:admin-wheel-ui
npm run smoke:admin-browser-routes
npm run smoke:admin-operator-handoff
npm run smoke:staging-uat
```

Render Start Command must be `npm start`. Use seed commands only as a temporary fixture refresh, then change the Start Command back to `npm start`.
