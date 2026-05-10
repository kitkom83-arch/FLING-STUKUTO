# Admin UI Permission Contract

## 1. Overview

Admin permissions must be enforced in two layers:

- Frontend/backoffice uses this contract to hide menus, hide or disable buttons, and explain denied actions before an API call is made.
- Backend remains the source of truth and must enforce every protected API action with authentication and permission checks. Frontend menu hiding is advisory only.

Unauthenticated admin requests return `401`. Authenticated admins without the required permission return `403`. The `owner` role and legacy `super_admin` role bypass permission checks and receive every permission. All other roles must use the effective permission list resolved from role defaults or site-level `AdminSiteAccess.permissions` override.

RBAC here controls backend admin API access only. It does not enable real providers, real payment rails, real bank rails, SMS, Slip OCR, or real-money transfer.

## 2. Role Summary

| Role | Responsibility | Permission behavior |
| --- | --- | --- |
| `owner` | Everything across admin/backoffice. | Bypasses permission checks and has all permissions. |
| `finance` | Deposits, withdrawals, bank visibility, and financial reports. | Can view members, view and approve deposits/withdrawals, view bank data, and view reports. |
| `support` | Member lookup, customer support, and history reading. | Can view and update members, and view deposits, withdrawals, and bank data. |
| `graphic` | Website settings, banner/theme, promotions, and assets. | Can view/update website settings, view promotion settings, and upload assets. |
| `viewer` | Read-only operations. | Can view allowed data only; cannot update, approve, reject, or manage admins. |

## 3. Permission Catalog

These permissions exist in `src/services/adminPermission.service.js` and are enforced by `src/middleware/adminPermission.js` through `src/routes/admin.routes.js`.

| Permission | Backend use | Primary UI surface |
| --- | --- | --- |
| `members.view` | View member list/detail. | Member management, customer support lookup. |
| `members.update` | Block/unblock members, add/remove credit, add/remove points. | Member actions and credit/points tools. |
| `deposits.view` | View admin deposit list. | Deposit queue and financial activity. |
| `deposits.approve` | Approve or reject deposits. | Deposit approval actions. |
| `withdrawals.view` | View admin withdrawal list. | Withdrawal queue and financial activity. |
| `withdrawals.approve` | Approve, reject, or mark withdrawals paid. | Withdrawal approval and payout actions. |
| `bank.view` | View member bank approvals, site bank accounts, mock bank statements, and mock Slip OCR verify endpoint. | Bank menus, account review, statement review. |
| `bank.update` | Approve/reject member bank accounts; create/update/soft-disable site bank accounts. | Bank setup and bank-account approval actions. |
| `reports.view` | View admin logs and report endpoints. | Dashboard metrics, reports, audit/history pages. |
| `settings.website.view` | View site list/config/detail, theme, game provider config, and payment config. | Site settings, game/payment config read views. |
| `settings.website.update` | Update site settings/theme, game provider config, and payment config. | Website, banner/theme, game, and payment setup actions. |
| `settings.promotion.view` | Role/catalog permission currently available for promotion views. | Promotion settings read views. |
| `assets.upload` | Role/catalog permission currently available for asset upload UI. | Logo, favicon, banner, and asset upload controls. |
| `admin.manage` | List roles/permissions, read target admin permissions, and assign admin roles. | Admin and permission management. |
| `admin.schedule.view` | Read a target admin work schedule. `admin.manage` is also accepted by backend. | Admin work schedule detail. |
| `admin.schedule.update` | Update a target admin work schedule. `admin.manage` is also accepted by backend. | Work from home and shift controls. |
| `admin.schedule.override` | Enable or disable temporary emergency schedule override. `admin.manage` is also accepted by backend. | Emergency admin access modal. |

### Proposed for Frontend Contract

The permissions below are not backend permissions today. Do not send them to the backend or persist them until they are added to `PERMISSIONS` and guarded in routes.

| Proposed permission | Why it may be useful later | Current backend fallback |
| --- | --- | --- |
| `reports.export` | Separate report viewing from CSV/XLSX export. | Use `reports.view` for current UI gating. |
| `settings.promotion.update` | Separate promotion editing from promotion viewing. | No dedicated backend update permission currently exists. |
| `settings.game.view` | Separate game-provider read access from general website settings. | Use `settings.website.view`. |
| `settings.game.update` | Separate game-provider edits from general website settings. | Use `settings.website.update`. |
| `assets.delete` | Separate asset deletion from upload. | No dedicated backend route/permission currently exists. |

## 4. Sidebar Menu Permission Map

| Sidebar menu | Sub menu | Required permission | View-only permission | Edit/action permission | Roles that should see it |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Summary cards / latest activity | `reports.view` | `reports.view` | None | `owner`, `finance`, `viewer` |
| รายงาน | Deposit, withdrawal, wallet ledger, admin logs | `reports.view` | `reports.view` | Proposed `reports.export` only if added later | `owner`, `finance`, `viewer` |
| จัดการสมาชิก | Member list/detail | `members.view` | `members.view` | `members.update` | `owner`, `finance`, `support`, `viewer` |
| จัดการสมาชิก | Credit / points / block controls | `members.update` | `members.view` | `members.update` | `owner`, `support` |
| รายการเดินบัญชี | Deposits | `deposits.view` | `deposits.view` | `deposits.approve` | `owner`, `finance`, `support`, `viewer` |
| รายการเดินบัญชี | Withdrawals | `withdrawals.view` | `withdrawals.view` | `withdrawals.approve` | `owner`, `finance`, `support`, `viewer` |
| รายการเดินบัญชี | Wallet ledger report | `reports.view` | `reports.view` | None | `owner`, `finance`, `viewer` |
| ธนาคาร | Pending member bank accounts | `bank.view` | `bank.view` | `bank.update` | `owner`, `finance`, `support`, `viewer` |
| ธนาคาร | Site bank accounts | `bank.view` | `bank.view` | `bank.update` | `owner`, `finance`, `support`, `viewer` |
| ธนาคาร | Mock bank statements / mock Slip OCR | `bank.view` | `bank.view` | `bank.view` for mock verify endpoint | `owner`, `finance`, `support`, `viewer` |
| บริการเสริม | Game provider config | `settings.website.view` | `settings.website.view` | `settings.website.update` | `owner`, `graphic`, `viewer` |
| บริการเสริม | Payment config | `settings.website.view` | `settings.website.view` | `settings.website.update` | `owner`, `graphic`, `viewer` |
| ตั้งค่า | Website settings | `settings.website.view` | `settings.website.view` | `settings.website.update` | `owner`, `graphic`, `viewer` |
| ตั้งค่า | Theme / logo / banner | `settings.website.view` | `settings.website.view` | `settings.website.update`, `assets.upload` | `owner`, `graphic`, `viewer` |
| ตั้งค่า | Promotion settings | `settings.promotion.view` | `settings.promotion.view` | Proposed `settings.promotion.update` only if added later | `owner`, `graphic`, `viewer` |
| จัดการแอดมิน/สิทธิ์ | Roles, permissions, role assignment | `admin.manage` | `admin.manage` | `admin.manage` | `owner` |
| จัดการแอดมิน/เวลาเข้างาน | Work schedule and emergency override | `admin.schedule.view` or `admin.manage` | `admin.schedule.view` or `admin.manage` | `admin.schedule.update`, `admin.schedule.override`, or `admin.manage` | `owner` |

## 5. Button / Action Permission Map

| Button / action | Required permission | Backend endpoint examples | UI behavior without permission |
| --- | --- | --- | --- |
| Export | `reports.view` today; proposed `reports.export` later | Report list endpoints are read-only today. | Disable export or hide until export is implemented. |
| เพิ่มข้อมูล | Depends on surface: `bank.update` for site bank accounts, `settings.website.update` for provider/payment configs | `POST /admin/sites/:id/bank-accounts`, `POST /admin/sites/:id/game-providers`, `POST /admin/sites/:id/payment-configs` | Disable with tooltip. |
| แก้ไข | Surface update permission | `members.update`, `bank.update`, `settings.website.update` | Disable with tooltip. |
| ลบ | `bank.update` for site bank soft-disable where available | `DELETE /admin/sites/:id/bank-accounts/:bankAccountId` | Disable with tooltip. |
| อนุมัติ | `deposits.approve`, `withdrawals.approve`, or `bank.update` | Deposit, withdrawal, and bank-account approve endpoints | Disable with tooltip. |
| ปฏิเสธ | `deposits.approve`, `withdrawals.approve`, or `bank.update` | Deposit, withdrawal, and bank-account reject endpoints | Disable with tooltip. |
| mark-paid | `withdrawals.approve` | `POST /admin/withdrawals/:id/mark-paid` | Disable with tooltip. |
| จัดการเครดิต | `members.update` | `POST /admin/members/:id/credit/add`, `POST /admin/members/:id/credit/remove` | Disable with tooltip. |
| เปิด/ปิดสถานะ | `members.update`, `bank.update`, or `settings.website.update` depending on surface | Member block/unblock, bank status update, maintenance/site settings | Disable with tooltip. |
| อัปโหลดรูป/แบนเนอร์ | `assets.upload` for upload control; `settings.website.update` for persisted theme/banner URLs | `POST /admin/sites/:id/theme` | Disable upload/update controls with tooltip. |
| ตั้งค่าโปรโมชัน | `settings.promotion.view` for read-only; proposed `settings.promotion.update` for future edits | No dedicated admin promotion update route in current route file | Show read-only unless a backend update permission/route is added. |
| ตั้งค่าเกม | `settings.website.view` for read; `settings.website.update` for create/update | Game provider config endpoints | Disable create/update controls with tooltip. |
| ตั้งค่าธนาคาร | `bank.view` for read; `bank.update` for create/update/soft-disable | Site bank account endpoints | Disable create/update/delete controls with tooltip. |
| ตั้งเวลาเข้างานแอดมิน | `admin.schedule.update` or `admin.manage` | `PATCH /admin/work-schedules/:adminId` | Disable with tooltip. |
| เปิด emergency override | `admin.schedule.override` or `admin.manage` | `POST /admin/work-schedules/:adminId/override`, `DELETE /admin/work-schedules/:adminId/override` | Disable with tooltip. |

## 6. Role Matrix

`allow` means the role can perform the action-level capability for that permission. `view-only` means the role can open/read the related UI but should not be shown edit/approve controls. `deny` means hide the menu/action unless another permission grants a read-only parent view.

| Permission | owner | finance | support | graphic | viewer |
| --- | --- | --- | --- | --- | --- |
| `members.view` | allow | view-only | allow | deny | view-only |
| `members.update` | allow | deny | allow | deny | deny |
| `deposits.view` | allow | allow | view-only | deny | view-only |
| `deposits.approve` | allow | allow | deny | deny | deny |
| `withdrawals.view` | allow | allow | view-only | deny | view-only |
| `withdrawals.approve` | allow | allow | deny | deny | deny |
| `bank.view` | allow | view-only | view-only | deny | view-only |
| `bank.update` | allow | deny | deny | deny | deny |
| `reports.view` | allow | view-only | deny | deny | view-only |
| `settings.website.view` | allow | deny | deny | allow | view-only |
| `settings.website.update` | allow | deny | deny | allow | deny |
| `settings.promotion.view` | allow | deny | deny | view-only | view-only |
| `assets.upload` | allow | deny | deny | allow | deny |
| `admin.manage` | allow | deny | deny | deny | deny |
| `admin.schedule.view` | allow | deny | deny | deny | deny |
| `admin.schedule.update` | allow | deny | deny | deny | deny |
| `admin.schedule.override` | allow | deny | deny | deny | deny |

## 7. Frontend Behavior

- No view permission means hide the sidebar menu and direct-link landing content for that surface.
- Has view permission but no update/action permission means show the page in read-only mode and disable edit, delete, approve, reject, mark-paid, status toggle, and credit controls.
- Denied actions should render disabled buttons with a tooltip such as `ไม่มีสิทธิ์ใช้งาน`.
- API `403` means show `ไม่มีสิทธิ์ใช้งาน`, keep the user on the current screen when possible, and refresh current permissions if the UI may be stale.
- API `401` means clear the admin session and return to login.
- Frontend must call `GET /api/admin/permissions/me` after admin login or site switch and use the returned effective permissions for UI gating.
- Frontend role-management screens must use `GET /api/admin/permissions`, `GET /api/admin/roles`, `GET /api/admin/admins/:id/permissions`, and `PATCH /api/admin/admins/:id/role`; all require `admin.manage` except current-admin permission read.
- Frontend work-schedule screens should use `GET /api/admin/work-schedules`, `GET /api/admin/work-schedules/:adminId`, `PATCH /api/admin/work-schedules/:adminId`, `POST /api/admin/work-schedules/:adminId/override`, `DELETE /api/admin/work-schedules/:adminId/override`, and `GET /api/admin/work-schedules/:adminId/audit-logs`; backend accepts the schedule-specific permission or `admin.manage`.
- Frontend must not treat hidden menus as security. Every protected action must still expect backend `401` or `403`.

## 8. Backend Behavior

- Missing or invalid admin authentication returns `401`.
- Authenticated admin without site access or required permission returns `403`.
- `owner` and legacy `super_admin` bypass permission checks and receive the full permission catalog.
- Non-owner roles resolve permissions from role defaults unless a site-level `AdminSiteAccess.permissions` override exists.
- Permission guard failures use the standard error envelope and include the denied permission; they must not return `500`.
- Non-owner admin login is checked against the stored work schedule after username/password validation and before token issuance. Outside schedule returns `403` and writes `admin.login.blocked_outside_schedule`; `owner` and legacy `super_admin` bypass schedule blocking.
- Active emergency override permits temporary login until `expiresAt`. Expired overrides do not permit login.
- Responses must not leak secrets. Existing docs require responses to strip password hashes and encrypted provider/payment secrets, and smoke tests scan for secret-shaped values.
- Business mutations listed in `docs/API.md` write admin log actions where implemented, such as member block/unblock, credit changes, deposit/withdrawal approvals, bank-account approval, site/config changes, `admin.role.update`, schedule update/enable/disable, override enable/disable, and schedule-blocked login.

## 9. Smoke Coverage

`adminPermissionSmoke.js` and `docs/SMOKE_COVERAGE.md` cover:

- `owner` role: lists roles, lists permissions, reads current permissions, assigns a role, approves a mock deposit, and updates settings.
- `finance` role: views deposits/withdrawals, approves mock deposit/withdrawal, and gets `403` for settings updates.
- `support` role: views/updates members and gets `403` for deposit approval.
- `graphic` role: updates website settings/theme and gets `403` for deposit/withdrawal approval.
- `viewer` role: views allowed data and gets `403` for approve/update actions.
- Unauthenticated admin requests returning `401`.
- No-permission/site override requests returning `403`.
- Forbidden action checks returning `403`.
- Response leak scan for DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.
- `adminRoleManagementSmoke.js` covers owner role-management access, target admin permission reads, non-owner `403` role-update attempts, role assignment to support/graphic/viewer, rollback to the original role, `admin.role.update` audit log presence, and response leak scan.
- `adminWorkScheduleSmoke.js` covers unauthenticated schedule `401`, no-permission `403`, owner schedule read/update, active/disabled emergency override, login outside schedule `403` without token, login inside schedule allow, expired override block, overnight shift helper behavior, schedule rollback, audit log actions, and response leak scan.

## 10. Known Gaps

- Frontend is not wired to real permissions yet.
- Menu hiding and disabled buttons are a documentation contract only until implemented in the frontend/backoffice.
- Role UI management is limited to backend admin permission endpoints; a complete role-management UI remains a later phase if it does not already exist in the frontend.
- Admin work schedule frontend is not implemented yet; backend API and login guard are available. Force-logout of already-active sessions is not implemented yet.
- Production/live provider, payment, bank, SMS, Slip OCR, and real-money behavior are out of scope for this contract.
- Promotion update, report export, and granular game/asset permissions are proposed only and are not backend-enforced today.
