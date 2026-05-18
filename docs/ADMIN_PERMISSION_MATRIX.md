# Admin Permission Matrix

Phase D uses the existing RBAC storage: `Admin.role` plus optional site-level `AdminSiteAccess.permissions` JSON. No migration is required.

Owner and `super_admin` keep the existing bypass behavior and receive every permission from the catalog. All other roles are deny by default and may act only when their effective permission list contains the required key. UI visibility is advisory; backend guards remain the source of truth.

## Lucky Wheel

| Permission key | UI surface | API | Type | Reason required | Audit required | Safety notes |
| --- | --- | --- | --- | --- | --- | --- |
| `wheel.view` | `/admin-wheel` shared config load | `GET /api/admin/wheel/config` | read | No | No | Grants config read entry only; responses must stay sanitized. |
| `wheel.campaign.view` | Campaign settings tab | `GET /api/admin/wheel/config` | read | No | No | Does not allow campaign writes. |
| `wheel.campaign.update` | Save campaign | `PATCH /api/admin/wheel/campaign` | write | Yes | Yes, `wheel.campaign.update` | Staging/mock only; no live provider or payout flow. |
| `wheel.rewards.view` | Rewards management tab | `GET /api/admin/wheel/config` | read | No | No | Shows admin reward fields; no member spin result control. |
| `wheel.rewards.create` | Add reward | `POST /api/admin/wheel/rewards` | write | Yes | Yes, `wheel.reward.create` | Must not submit member `rewardId`/`prizeIndex`. |
| `wheel.rewards.update` | Edit reward | `PATCH /api/admin/wheel/rewards/:id` | write | Yes | Yes, `wheel.reward.update` | Does not force member spin outcomes. |
| `wheel.rewards.status.update` | Enable/disable reward | `PATCH /api/admin/wheel/rewards/:id` | write | Yes | Yes, `wheel.reward.status.update` | Status-only update; no member payout. |
| `wheel.spins.view` | Spin history tab | `GET /api/admin/wheel/spins` | read | No | No | Shows sanitized spin rows only, with masked IP/user-agent hash. |
| `wheel.reports.view` | Reports tab | Client summary from config/spins/claims | read | No | No | Client summary only; no report write endpoint. |
| `wheel.claims.view` | Reward Claims tab | `GET /api/admin/wheel/member-rewards` | read | No | No | Shows sanitized claims only. |
| `wheel.claims.status.update` | Mark claimed/cancel | `PATCH /api/admin/wheel/member-rewards/:id/status` | write | Yes | Yes, `wheel.memberReward.status.update` | Manual staging/mock item handoff only; no wallet/provider/bank/payment/SMS/Slip OCR action. |
| `wheel.audit.view` | Audit history tab filtered to wheel actions | `GET /api/admin/audit-logs` | read | No | No | Wheel-only users are scoped to wheel audit actions. No raw user-agent or raw IP. |

## Admin / Audit

| Permission key | UI surface | API | Type | Reason required | Audit required | Safety notes |
| --- | --- | --- | --- | --- | --- | --- |
| `admin.audit.view` | Audit/security report | `GET /api/admin/audit-logs`, `GET /api/admin/audit-logs/summary` | read | No | No | Full safe audit log view; masked IP, no raw user-agent. |
| `admin.security.view` | Audit/security report | `GET /api/admin/security-events`, `GET /api/admin/security-events/summary` | read | No | No | Security-event read only; no secrets or raw session data. |
| `admin.roles.view` | Admin role/permission screens | `GET /api/admin/permissions`, `GET /api/admin/roles`, `GET /api/admin/admins/:id/permissions` | read | No | No | Shows permission keys only, not credentials. |
| `admin.roles.update` | Admin role assignment | `PATCH /api/admin/admins/:id/role` | write | Yes | Yes, `admin.role.update` | Uses existing self-update guard and secret-shaped reason redaction. |
| `admin.workSchedule.view` | Work schedule screens | `GET /api/admin/work-schedules`, `GET /api/admin/work-schedules/:adminId`, audit aliases | read | No | No | Existing `admin.schedule.view` remains accepted for compatibility. |
| `admin.workSchedule.update` | Work schedule update | `PATCH /api/admin/work-schedules/:adminId` | write | Yes | Yes, `admin.schedule.update` and enable/disable actions | Existing `admin.schedule.update` remains accepted for compatibility. |

## Role Defaults

| Role | Lucky Wheel defaults | Admin/audit defaults |
| --- | --- | --- |
| `owner` / `super_admin` | All Lucky Wheel permissions through existing owner bypass. | All admin/audit permissions through existing owner bypass. |
| `finance` | `wheel.view`, `wheel.spins.view`, `wheel.reports.view`, `wheel.claims.view` | `admin.audit.view` plus existing finance report permissions. |
| `support` | `wheel.view`, `wheel.claims.view`, `wheel.claims.status.update` | No role-management or security defaults. |
| `graphic` | Campaign and reward view/create/update/status update. | No role-management or security defaults. |
| `viewer` | `wheel.view`, campaign/reward/spin/report/claim read only. | No role-management or security defaults. |

## UI Rules

- No view permission: tab shows `ไม่มีสิทธิ์เข้าถึง` and does not load that API data.
- No write permission: action buttons are disabled with `ไม่มีสิทธิ์ดำเนินการนี้`.
- Every write path requires a non-empty `reason` before submission and must create the existing audit action.
- Read views must not display raw tokens, auth headers, passwords, secrets, database URLs, raw stacks, raw user-agent strings, or raw unmasked IPs.
- Member spin result and `prizeIndex` remain backend-selected only.
