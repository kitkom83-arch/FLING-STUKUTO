# Admin Role Management UI Contract

## 1. Overview

This contract defines the frontend admin UI for managing admin roles and permissions. The page is intended for `owner` and legacy `super_admin` admins to manage admin access levels through the real backend permission guard.

Frontend visibility is advisory only. The UI may hide or disable role-management buttons, but backend authorization remains the source of truth. Requests without a valid admin session must receive `401`. Authenticated admins without `admin.manage` must receive `403`.

The current backend role-management API is site-aware. Non-owner permissions can come from role defaults or a site-level `AdminSiteAccess.permissions` override. The UI must show the effective permission source when it is available.

## 2. Page: Admin Users / รายชื่อแอดมิน

Purpose: show admins that can be inspected or managed by an `owner`/`super_admin`.

Current backend note: there is no dedicated `GET /api/admin/admins` list endpoint in `src/routes/admin.routes.js` today. The table UI is the desired frontend contract, but the list API and create-admin API are proposed until backend routes are added. Existing backend support covers reading one admin's effective permissions and changing one admin's role by admin ID.

Required UI controls:

- Search input for `username`, proposed `email`, and proposed display `name`.
- Role filter for `owner`, `finance`, `support`, `graphic`, and `viewer`.
- Status filter, currently aligned to `Admin.status` such as `active`.
- Detail action to open the target admin detail.
- Change role action for admins with `admin.manage`.
- View permissions action for admins with `admin.manage`.
- Create admin button: proposed only until backend create-admin contract is defined.

Table columns:

| Column | Source / note |
| --- | --- |
| Admin ID | `Admin.id` |
| Username / Email | `Admin.username`; email is proposed because current schema has no admin email field. |
| Name | Proposed display field; current schema has no admin name field. |
| Role | `Admin.role` or effective role from target permission API. |
| Status | `Admin.status` |
| Last login | `Admin.lastLoginAt` |
| Created at | `Admin.createdAt` |
| Actions | Detail, change role, view permissions, proposed create/admin actions where allowed. |

Frontend behavior:

- The page route itself requires `admin.manage`.
- If current admin lacks `admin.manage`, do not render the table data and show the forbidden state.
- If the UI has a cached admin list and a role update succeeds, refresh the changed row and target permissions.
- If a direct URL opens a target admin modal and backend returns `403`, show the no-permission state rather than trusting the hidden menu.

## 3. Page: Role Catalog / รายการ Role

Source: `GET /api/admin/roles`, backed by `ROLE_PERMISSIONS` in `src/services/adminPermission.service.js`.

| Role | Badge | Description | Permission count | Main permissions |
| --- | --- | --- | --- | --- |
| `owner` | Full access | Full admin/backoffice access. Bypasses permission checks and receives the full permission catalog. | 14 | All backend permissions, including `admin.manage`. |
| `finance` | Finance | Handles deposits, withdrawals, bank visibility, and financial reports. | 7 | `members.view`, `deposits.view`, `deposits.approve`, `withdrawals.view`, `withdrawals.approve`, `bank.view`, `reports.view` |
| `support` | Support | Handles member lookup/support workflows and read access to money-flow context. | 5 | `members.view`, `members.update`, `deposits.view`, `withdrawals.view`, `bank.view` |
| `graphic` | Graphic | Handles website settings, theme/banner, promotion read views, and uploads. | 4 | `settings.website.view`, `settings.website.update`, `settings.promotion.view`, `assets.upload` |
| `viewer` | Read-only | Read-only role for allowed operational data. | 7 | `members.view`, `deposits.view`, `withdrawals.view`, `bank.view`, `reports.view`, `settings.website.view`, `settings.promotion.view` |

Legacy note: backend also treats `super_admin` as an owner role and includes it in the API role catalog with the same 14 permissions. The UI may label it as legacy/full-access if records still use it.

## 4. Page: Permission Catalog / รายการ Permission

Source: `GET /api/admin/permissions`, backed by `PERMISSIONS` in `src/services/adminPermission.service.js`.

Backend-enforced permissions:

| Group | Permissions | Primary UI surface |
| --- | --- | --- |
| Members | `members.view`, `members.update` | Member list/detail, block/unblock, credit/points tools. |
| Deposits | `deposits.view`, `deposits.approve` | Deposit queue, approve/reject deposit actions. |
| Withdrawals | `withdrawals.view`, `withdrawals.approve` | Withdrawal queue, approve/reject/mark-paid actions. |
| Bank | `bank.view`, `bank.update` | Pending member bank accounts, site bank accounts, mock bank statements, mock Slip OCR verify. |
| Reports | `reports.view` | Dashboard metrics, reports, wallet ledger report, admin logs. |
| Settings | `settings.website.view`, `settings.website.update`, `settings.promotion.view` | Site/config/theme/payment/game-provider read and update surfaces; promotion settings read views. |
| Admin management | `admin.manage` | Role catalog, permission catalog, target admin permissions, role assignment. |
| Assets/graphics | `assets.upload` | Logo, favicon, banner, and asset upload controls. |

Proposed frontend permissions only:

| Proposed permission | Status | Current backend fallback |
| --- | --- | --- |
| `reports.export` | Proposed only | Use `reports.view` until a backend export permission exists. |
| `settings.promotion.update` | Proposed only | No dedicated backend update permission today. |
| `settings.game.view` | Proposed only | Use `settings.website.view`. |
| `settings.game.update` | Proposed only | Use `settings.website.update`. |
| `assets.delete` | Proposed only | No dedicated backend route/permission today. |
| `admin.schedule.view` | Proposed for next backend phase | Use `admin.manage` for current UI gating until backend adds schedule-specific permission guards. |
| `admin.schedule.update` | Proposed for next backend phase | Use `admin.manage` for current UI gating until backend adds schedule-specific permission guards. |
| `admin.schedule.override` | Proposed for next backend phase | Use `admin.manage` for current UI gating until backend adds schedule-specific permission guards. |

Do not send proposed permissions to the current backend role update API. `assignRole` rejects unknown permissions with `400`.

## 5. Modal: Change Admin Role

Entry point: the change-role action on an admin row or detail screen.

Visible fields:

- Target admin: admin ID and username.
- Current role: current global or effective role.
- New role dropdown: `owner`, `finance`, `support`, `graphic`, `viewer`; include `super_admin` only if the product keeps legacy records editable.
- Permission preview: permissions that will apply after the role change.
- Warning when the new role removes permissions from the current effective role.
- Optional note field for an operator note. Current backend role update does not persist a separate note field, so this is proposed until the API supports it.
- Buttons: Cancel and Confirm.

Behavior:

- `owner` and legacy `super_admin` can change roles because they satisfy `admin.manage`.
- `finance`, `support`, `graphic`, and `viewer` must either see a disabled action or receive backend `403` if they attempt the API call.
- On success, close or keep the modal in success state, refresh the changed row, and refresh target permissions.
- Success toast: `อัปเดต role สำเร็จ`.
- If the API returns `403`, show `ไม่มีสิทธิ์จัดการ role`.
- If the selected role would reduce access, show a clear warning before Confirm.
- If the role dropdown is disabled because the current admin lacks permission or data is stale, show the disabled role dropdown state.

Request:

```json
{
  "role": "support",
  "permissions": null
}
```

`permissions` is optional or `null` for role defaults. A non-null array is a site-level override and must contain only backend-known permission strings.

## 6. Modal: View Admin Permissions

Entry point: view-permissions action on an admin row or detail screen.

Data source: `GET /api/admin/admins/:id/permissions`.

Visible fields:

- Admin: ID, username, status, created/updated timestamps.
- Role: effective role returned by the API.
- Effective permissions: exact permission strings returned by the API.
- Site access / `AdminSiteAccess` permissions if present through the returned `siteId` and `source`.
- Permission source: `role` for role defaults or `site_override` for a site-level override.
- Owner flag: show full-access state when `owner: true`.
- Read-only view for non-owner admins only if the backend allows the read. Today the endpoint requires `admin.manage`, so non-owner roles should not be able to open it unless their effective permissions include `admin.manage`.

The modal must not expose password hashes, tokens, secret values, raw provider config, or raw stack traces.

## 7. Menu / Button Visibility

Required permission for the role-management page: `admin.manage`.

Visibility contract:

| Current admin | Page visibility | Change role button | View permissions button | Notes |
| --- | --- | --- | --- | --- |
| `owner` | Visible | Enabled | Enabled | Full access. |
| `super_admin` | Visible | Enabled | Enabled | Legacy full-access role. |
| `finance` | Hidden or forbidden | Hidden or disabled | Hidden or disabled | Backend must return `403` for role management without `admin.manage`. |
| `support` | Hidden or forbidden | Hidden or disabled | Hidden or disabled | Backend must return `403`. |
| `graphic` | Hidden or forbidden | Hidden or disabled | Hidden or disabled | Backend must return `403`. |
| `viewer` | Hidden or forbidden | Hidden or disabled | Hidden or disabled | Viewer cannot view this page unless a site override grants `admin.manage`. |

Frontend must call `GET /api/admin/permissions/me` after admin login and after site switch, then use the returned effective permissions for menu gating.

## 8. API Contract Used by UI

All paths below include the `/api` prefix. Success responses use `{ "success": true, "data": ... }`. Error responses use `{ "success": false, "message": "...", "errors": ... }`.

| Method | Path | Required permission | Request body | Success response summary | Expected errors |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/admin/permissions/me` | Admin auth + site access; no `admin.manage` required. | None | Current effective role, permission list, `owner` boolean, and `source`. | `401` missing/invalid admin session, `403` inactive admin or denied site access, `500` generic safe error. |
| GET | `/api/admin/permissions` | `admin.manage` | None | Array of backend permission strings. | `401`, `403`, `500`. |
| GET | `/api/admin/roles` | `admin.manage` | None | Array of `{ role, permissions }` entries from backend role catalog. | `401`, `403`, `500`. |
| GET | `/api/admin/admins/:id/permissions` | `admin.manage` | None | Target `admin`, `siteId`, effective `role`, `permissions`, `owner`, and `source`. | `401`, `403`, `404` admin not found, `500`. |
| PATCH | `/api/admin/admins/:id/role` | `admin.manage` | `role`; optional `permissions` array or `null`. | Updated target admin summary, `siteId`, assigned `role`, and effective permissions. Writes `admin.role.update` audit log when actor and site are available. | `400` validation/unknown role/unknown permission, `401`, `403`, `404` admin not found, `409` role conflict if future backend adds conflict detection, `500`. |

Status expectation by endpoint:

| Endpoint | `401` | `403` | `404` | `409` | `500` |
| --- | --- | --- | --- | --- | --- |
| `GET /api/admin/permissions/me` | Missing or invalid admin session. | Inactive admin or denied site access. | Not expected today. | Not expected today. | Generic safe error only. |
| `GET /api/admin/permissions` | Missing or invalid admin session. | Missing `admin.manage` or denied site access. | Not expected today. | Not expected today. | Generic safe error only. |
| `GET /api/admin/roles` | Missing or invalid admin session. | Missing `admin.manage` or denied site access. | Not expected today. | Not expected today. | Generic safe error only. |
| `GET /api/admin/admins/:id/permissions` | Missing or invalid admin session. | Missing `admin.manage` or denied site access. | Target admin not found. | Not expected today. | Generic safe error only. |
| `PATCH /api/admin/admins/:id/role` | Missing or invalid admin session. | Missing `admin.manage` or denied site access. | Target admin not found. | Future role conflict only if backend adds conflict detection. | Generic safe error only. |

Current gaps in API coverage for the page:

- `GET /api/admin/admins` list endpoint is proposed.
- `POST /api/admin/admins` create admin endpoint is proposed.
- Dedicated audit-history endpoint for role changes is not required by the current role update API. Existing `GET /api/admin/logs` can show `admin.role.update` rows for admins with `reports.view`.

## 9. Error Handling

UI handling rules:

| Status | UI behavior |
| --- | --- |
| `401` | Clear admin session and redirect to login. |
| `403` | Show no-permission state or modal error; for role updates show `ไม่มีสิทธิ์จัดการ role`. Refresh current permissions if stale permission state is possible. |
| `404` | Show admin-not-found state and remove stale row if the list is cached. |
| `409` | Show role conflict message if a future backend conflict response is added; keep the current role unchanged and refetch target admin. |
| `500` | Show generic safe error. Do not show raw stack, SQL, token, provider payload, or secret values. |

The UI must not display token values, secret values, raw `Authorization` headers, database URLs, or raw stack traces.

## 10. Audit / History

Role changes should be visible in an audit/history view with:

- Actor admin.
- Target admin.
- Old role.
- New role.
- Timestamp.
- Note, if a future API supports storing notes.

Current backend behavior:

- `PATCH /api/admin/admins/:id/role` writes an `admin.role.update` admin log action when `actor` and `siteId` are available.
- The logged `before`/`after` payload includes old role, new role, site access role, and permissions.
- `GET /api/admin/logs` requires `reports.view`, not `admin.manage`.

Future UI enhancement: add a dedicated role-management audit timeline if a narrower audit endpoint is introduced.

## 11. Page/Section: Admin Work Schedule

Purpose: define when each admin is allowed to log in and keep a session active. This is intended for Work From Home operations and shift-based staff. It lets `owner`/`super_admin` configure allowed days, allowed times, session limits, force-logout behavior, and emergency temporary access for a specific admin.

Current backend status: the backend login guard and management API are implemented. Schedule data is stored in `AdminSiteAccess.permissions.adminWorkSchedule`, so no schema or migration is added. The guard checks non-owner admin login after username/password validation and before issuing a token. Force-logout for already-active sessions remains a future phase.

Required fields:

| Field | UI contract |
| --- | --- |
| Admin | Target admin ID and username. |
| Role | Current admin role for context. |
| Status | Schedule enabled or disabled. |
| Allowed days | Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. |
| Start time | Local shift start time. |
| End time | Local shift end time. |
| Timezone | Default `Asia/Bangkok`; editable only if backend supports timezone storage. |
| Force logout when schedule ends | Boolean. If true, active sessions should be warned and logged out when the allowed window ends after backend support exists. |
| Session idle timeout minutes | Numeric idle timeout for this admin schedule. |
| Emergency override enabled | Boolean temporary bypass for urgent access. |
| Override expires at | Required date/time when emergency override is enabled. |
| Override reason | Required reason when emergency override is enabled. |
| Updated by | Last actor admin who changed the schedule. |
| Updated at | Last update timestamp. |

Allowed-days picker:

| Day | UI label |
| --- | --- |
| Monday | Monday |
| Tuesday | Tuesday |
| Wednesday | Wednesday |
| Thursday | Thursday |
| Friday | Friday |
| Saturday | Saturday |
| Sunday | Sunday |

Implemented API surface:

| Method | Path | Proposed permission | Request body | Success response summary |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/admins/:id/work-schedule` | `admin.schedule.view` or `admin.manage` fallback | None | Target admin schedule and emergency override status. |
| PATCH | `/api/admin/admins/:id/work-schedule` | `admin.schedule.update` or `admin.manage` fallback | Schedule fields listed above. | Updated schedule. |
| POST | `/api/admin/admins/:id/work-schedule/override` | `admin.schedule.override` or `admin.manage` fallback | `expiresAt`, `reason`. | Emergency override state. |
| DELETE | `/api/admin/admins/:id/work-schedule/override` | `admin.schedule.override` or `admin.manage` fallback | Optional `reason`. | Disabled override state. |

## 12. Admin Work Schedule UI Behavior

- `owner` and legacy `super_admin` can view and edit schedules.
- Other roles must not view or edit schedules unless their effective permissions include `admin.manage` today or schedule-specific proposed permissions after the next backend phase.
- If schedule status is disabled, normal role/permission checks apply.
- If schedule status is enabled and the current login attempt is outside the allowed time window, backend login returns `403` and does not issue a token.
- If schedule status is enabled and the current login attempt is outside the allowed day, backend login returns `403` and does not issue a token.
- If an active session reaches the schedule end and `Force logout when schedule ends` is true, the UI should show a warning and then logout after backend session enforcement exists.
- If an emergency override is enabled and `Override expires at` is still in the future, the admin can temporarily log in within the override window.
- If an emergency override has expired, it must not permit login.
- Every schedule action must show a clear toast or status message, such as save success, save failed, override active, override expired, or forced logout warning.

## 13. Login Behavior Contract

This behavior is enforced by the backend login guard for non-owner admins. `owner` and legacy `super_admin` bypass schedule blocking.

| Scenario | Expected behavior |
| --- | --- |
| Login within allowed day and time | Login passes if normal auth, status, site access, and permission rules also pass. |
| Login outside allowed time | Return `403` or another safe blocked response. Do not issue a valid session token. |
| Login outside allowed day | Return blocked response. Do not issue a valid session token. |
| Emergency override active and not expired | Login passes temporarily if normal auth/status/site rules also pass. |
| Emergency override expired | Login is blocked if outside schedule. |
| Schedule disabled | Schedule policy does not block login; normal auth and permission behavior applies. |

Blocked responses must use the standard safe error envelope and must not leak password, token, secret, raw schedule internals that are not needed by the UI, database details, or stack traces.

## 14. Emergency Override Modal

Entry point: owner/super_admin clicks emergency access from the admin schedule section.

Visible fields:

- Selected admin.
- Emergency access toggle.
- Override expiration date/time.
- Reason.
- Buttons: Cancel and Confirm.

Rules:

- Reason is required.
- Expiration date/time is required.
- Permanent override without expiration is forbidden.
- Confirm is disabled until required fields are valid.
- Override activation must write an audit log.
- Override disable must write an audit log.
- On success, show a clear toast/status such as override active or override disabled.
- On failure, show a safe error without raw stack, token, password, or secret values.

## 15. Admin Work Schedule Audit Log

Every schedule and override action should write an audit log entry after backend support is added.

Required actions:

| Action | When |
| --- | --- |
| `admin.schedule.update` | Any schedule field changes. |
| `admin.schedule.enable` | Schedule status changes from disabled to enabled. |
| `admin.schedule.disable` | Schedule status changes from enabled to disabled. |
| `admin.schedule.override_enable` | Emergency override is enabled. |
| `admin.schedule.override_disable` | Emergency override is disabled manually or expires through backend handling. |
| `admin.login.blocked_outside_schedule` | Login is blocked because it is outside allowed schedule. |
| `admin.session.force_logout_schedule_end` | Active session is force logged out when schedule ends. |

Log payload requirements:

- Actor admin ID.
- Target admin ID.
- Old schedule.
- New schedule.
- Reason.
- Timestamp.
- IP and device metadata if available.

Audit logs must not store password, token, secret, raw authorization header, or credential values.

## 16. Role Matrix UI

`allow` means the role can perform the action-level capability. `view-only` means the role can open/read the surface but must not see edit/approve controls. `deny` means the surface/action should be hidden or disabled unless a site override grants permissions.

| Permission group | owner | finance | support | graphic | viewer |
| --- | --- | --- | --- | --- | --- |
| Members | allow | view-only | allow | deny | view-only |
| Deposits | allow | allow | view-only | deny | view-only |
| Withdrawals | allow | allow | view-only | deny | view-only |
| Bank | allow | view-only | view-only | deny | view-only |
| Reports | allow | view-only | deny | deny | view-only |
| Website settings | allow | deny | deny | allow | view-only |
| Promotion settings | allow | deny | deny | view-only | view-only |
| Assets/graphics | allow | deny | deny | allow | deny |
| Admin management | allow | deny | deny | deny | deny |

Exact permission mapping:

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

## 17. Frontend States

Required states:

| State | Expected UI |
| --- | --- |
| Loading | Skeleton or spinner for admin list, role catalog, and permission catalog. |
| Empty admin list | Empty table state with create-admin button only if backend/create permission exists; otherwise show no admins found. |
| Empty permission list | Safe empty state; block role preview and retry `GET /api/admin/permissions`. |
| Disabled role dropdown | Current admin lacks `admin.manage`, target admin cannot be changed, or role data is still loading. |
| Forbidden `403` state | No-permission page or modal state; do not render cached privileged data. |
| Update success | Toast `อัปเดต role สำเร็จ`, refresh target row and target permissions. |
| Update failed | Show safe error; preserve selected role until user cancels or retries. |
| Stale role refresh | Refetch current permissions, target permissions, and the admin row after update or `403`. |
| Loading schedule | Skeleton or spinner for the admin work schedule section. |
| Schedule disabled | Show normal permission behavior and disabled schedule badge. |
| Outside working hour | Show blocked schedule status after backend reports schedule denial. |
| Override active | Show emergency override badge with expiration time. |
| Override expired | Show expired override status and require normal schedule rules. |
| Save success | Toast/status after schedule save succeeds. |
| Save failed | Safe error after schedule save fails. |
| Forced logout warning | Warning shown before logout when schedule end is reached and force logout is enabled. |

## 18. Smoke Coverage

Backend smoke coverage already verifies:

- Owner access to permission catalog, role catalog, current permissions, target permissions, and role update.
- Non-owner `403` for role updates across `finance`, `support`, `graphic`, and `viewer`.
- Role assignment to `support`, `graphic`, and `viewer`, then rollback to the original role.
- Unauthenticated role-management endpoints return `401`.
- `admin.role.update` audit log presence.
- Response leak scan for database URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

Related smoke scripts:

- `src/local-smoke-tests/adminRoleManagementSmoke.js`
- `src/local-smoke-tests/adminPermissionSmoke.js`

## 19. Known Gaps

- There is no real frontend role-management UI implementation yet.
- There is no dedicated `GET /api/admin/admins` list endpoint today.
- There is no dedicated create-admin UI or clear backend create-admin API contract today.
- Audit history UI may need a dedicated endpoint later; current backend has `GET /api/admin/logs` with `reports.view`.
- Admin email and display name are proposed UI fields because the current `Admin` schema only includes `username`.
- Proposed frontend permissions must not be sent to backend until they are added to `PERMISSIONS` and route guards.
- Admin Work Schedule backend guard and management API are implemented.
- Force-logout of already-active sessions must be implemented in a later phase.
- No schema or migration is added in this phase.
- Schedule and override login behavior is enforced; force-logout behavior is not enforced until session handling is added.
