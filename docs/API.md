# PG77-real-core API Documentation

## 1. Overview

PG77-real-core is the backend API for the PG77 member system.

- Local base URL: `http://localhost:4000/api`
- Test environment: `development-local`
- API format: JSON only
- Current integration mode: local/mock/sandbox
- Money flow: manual local approval only
- External systems: no real game provider, payment provider, bank rail, SMS, or Slip OCR connection
- Database boundary: use local, staging, or test PostgreSQL only; do not use production DB

`GET /api/health` is mounted before site resolution. Other endpoints run through `siteResolver`, which resolves the site from `X-Site-Code`, `X-Site-Domain`, host/domain records, or the development fallback site `PG77`.

## 2. Auth Model

Member auth:

- Login endpoint: `POST /api/auth/login`
- Register endpoint: `POST /api/auth/register`
- Protected member endpoints use `src/middleware/auth.js`
- JWT payload type must be `member`
- Blocked members receive `403`
- Site mismatch receives `403`

Admin auth:

- Login endpoint: `POST /api/admin/auth/login`
- Protected admin endpoints use `src/middleware/adminAuth.js`
- Site-scoped admin endpoints also use `siteAccess`
- JWT payload type must be `admin`
- Inactive admins receive `403`

Auth header:

- Header name: `Authorization`
- Header value shape: `Bearer<space><token>`
- Do not put real tokens in docs, logs, commits, tickets, or chat output.

Protected endpoint behavior:

- Missing or invalid member token returns `401` with `success: false`
- Missing or invalid admin token returns `401` with `success: false`
- Correct auth type is required; admin token is not accepted by member auth and member token is not accepted by admin auth.

## 3. Response Envelope

The shared response helpers are in `src/utils/response.js`.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {}
}
```

Serialization rules from `cleanData`:

- `Date` values are ISO strings.
- Prisma Decimal values are strings with two decimals, for example `"100.00"`.
- `undefined` is removed from objects or converted to `null` in arrays/values.
- `NaN` and non-finite numbers become `null`.
- `passwordHash`, `apiKeyEncrypted`, and `secretEncrypted` are hidden from API responses.

## 4. Health API

| Method | Path | Auth | Description | Request body | Success response | Error response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/health` | None | API health check. Mounted before site resolver. | None | `200`, `data.status`, `data.version`, `data.timestamp` | Standard error envelope if unexpected server error occurs |

Smoke coverage: `smoke:money-flow`, `smoke:core-api`, `smoke:financial-negative`, `smoke:promotion-claim`, `smoke:game-transfer`, and `smoke:admin-reports-config`.

## 5. Member API

| Method | Path | Auth required | Body fields | Query params | Response summary | Error cases | Smoke script |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | `phone`, optional `username`, `password`, `bank_code`, `bank_account_number`, `bank_account_name`, optional `referral_source`, `accept_bonus`, `accept_terms: true` | None | `201`, token, public user, wallet summary; creates pending bank account and wallet | `400` validation or duplicate data | `moneyFlowSmoke`, `coreApiSmoke` |
| POST | `/auth/login` | No | `phone`, `password`; `phone` can match phone or username | None | token, public user, wallet summary | `400` invalid credentials, `403` blocked user | `coreApiSmoke` |
| GET | `/me` | Member | None | None | public user and wallet summary | `401` unauth, `403` blocked/site mismatch | `coreApiSmoke` |
| GET | `/wallet` | Member | None | None | wallet `balance` and `currency` | `401` unauth | `moneyFlowSmoke`, `coreApiSmoke`, `financialNegativeSmoke` |
| GET | `/wallet/ledger` | Member | None | `limit`, capped at 100 | latest wallet ledger rows | `401` unauth | `moneyFlowSmoke`, `coreApiSmoke`, `financialNegativeSmoke` |
| GET | `/points` | Member | None | None | point `balance` and latest point ledgers | `401` unauth | `coreApiSmoke` |
| GET | `/bank-accounts` | Member | None | None | member bank accounts | `401` unauth | `moneyFlowSmoke` |
| POST | `/bank-accounts` | Member | `bank_code`, `bank_account_number`, `bank_account_name` | None | `201`, pending member bank account | `400` validation, `401` unauth | Not directly covered by current smoke |
| GET | `/site/config` | No site auth, site resolver required | None | None | public site config, theme, contact, feature flags, active provider config summaries | `404` site not found | `adminReportsConfigSmoke` |

## 6. Admin API

Admin site access:

- Most business admin endpoints use `protectedSite`: admin token plus site access for the resolved site.
- `owner` and legacy `super_admin` can access all sites and bypass admin permissions.
- Non-super admins need `AdminSiteAccess`.
- Admin permissions are enforced by backend middleware. Frontend menu hiding is advisory only and must not be treated as authorization.
- RBAC is local/mock/sandbox control for admin API access. It does not enable real providers, real payment rails, real bank rails, or real-money transfer.

Admin role matrix:

| Role | Permissions |
| --- | --- |
| `owner` | All permissions, including `admin.manage` |
| `finance` | `members.view`, `deposits.view`, `deposits.approve`, `withdrawals.view`, `withdrawals.approve`, `bank.view`, `reports.view` |
| `support` | `members.view`, `members.update`, `deposits.view`, `withdrawals.view`, `bank.view` |
| `graphic` | `settings.website.view`, `settings.website.update`, `settings.promotion.view`, `assets.upload` |
| `viewer` | `members.view`, `deposits.view`, `withdrawals.view`, `bank.view`, `reports.view`, `settings.website.view`, `settings.promotion.view` |

Lucky Wheel Phase D adds granular `wheel.*` permissions to the same catalog. Owner and `super_admin` receive all of them. Role defaults are documented in `docs/ADMIN_PERMISSION_MATRIX.md`; site-level `AdminSiteAccess.permissions` may override them per site.

Permission catalog:

- `members.view`
- `members.update`
- `deposits.view`
- `deposits.approve`
- `withdrawals.view`
- `withdrawals.approve`
- `bank.view`
- `bank.update`
- `reports.view`
- `settings.website.view`
- `settings.website.update`
- `settings.promotion.view`
- `assets.upload`
- `admin.manage`
- `admin.audit.view`
- `admin.security.view`
- `admin.roles.view`
- `admin.roles.update`
- `admin.schedule.view`
- `admin.schedule.update`
- `admin.schedule.override`
- `admin.workSchedule.view`
- `admin.workSchedule.update`
- `wheel.view`
- `wheel.campaign.view`
- `wheel.campaign.update`
- `wheel.rewards.view`
- `wheel.rewards.create`
- `wheel.rewards.update`
- `wheel.rewards.status.update`
- `wheel.spins.view`
- `wheel.reports.view`
- `wheel.claims.view`
- `wheel.claims.status.update`
- `wheel.audit.view`

Current implementation uses existing schema:

- `Admin.role` stores the global role.
- `AdminSiteAccess.permissions` can store a JSON permission override for a site and `adminWorkSchedule` metadata for the admin work schedule guard.
- No new RBAC table or migration is required.

Permission failures return `403` with the standard error envelope and must not return `500`.

| Method | Path | Auth | Required role/access | Body fields | Response summary | Error cases | Admin log action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/admin/auth/login` | No | Active admin; work schedule guard for non-owner admins | `username`, `password` | token and public admin | `400` invalid credentials, `403` inactive admin or outside allowed work schedule | `admin.login.success` when login passes; `admin.login.blocked_outside_schedule` when schedule blocks login |
| GET | `/admin/me` | Admin | Site access | None | public admin | `401`, `403` | None |
| GET | `/admin/permissions/me` | Admin | Site access | None | current admin summary, current role, permission list, owner flag, source, and site code | `401`, `403` | None |
| GET | `/admin/permissions` | Admin | `admin.roles.view` or `admin.manage` | None | permission catalog | `401`, `403` | None |
| GET | `/admin/permissions/catalog` | Admin | `admin.roles.view`, `admin.security.view`, or `admin.manage` | None | permission metadata catalog with key, label, group, read/write type, reason/audit requirement, linked page, and linked API | `401`, `403` | None |
| GET | `/admin/roles` | Admin | `admin.roles.view` or `admin.manage` | None | site-aware role catalog, description, admin count, source, updatedAt, and permissions | `401`, `403` | None |
| GET | `/admin/roles/:role` | Admin | `admin.roles.view` or `admin.manage` | None | selected role detail and effective site permission set | `400`, `401`, `403` | None |
| PATCH | `/admin/roles/:role/permissions` | Admin | `admin.roles.update` or `admin.manage` | `permissions` array of known keys and required trimmed `reason` length 1-500 | updated site-level role permission override using `AdminSiteAccess.permissions` for admins on that role | `400` for empty reason, invalid key, `admin.manage`, owner/super_admin role, or unsafe self-role permission edit; `401`, `403` | `admin.role.permissions.update`; audit metadata includes actor, role, reason, before/after permission counts, affected admin count, and site code. |
| GET | `/admin/admins/:id/permissions` | Admin | `admin.roles.view` or `admin.manage` | None | target admin public profile, effective role, permission list, owner flag, and source | `401`, `403`, `404` | None |
| PATCH | `/admin/admins/:id/role` | Admin | `admin.roles.update` or `admin.manage` | `role`, required trimmed `reason` length 1-500, optional `permissions` array or `null` | assigned admin role and effective permissions | `400` for invalid role, empty reason, same role, or self role change; `403` if a non-owner actor attempts owner/super_admin assignment; `401`, `404` | `admin.role.update`; audit metadata includes actor, target admin id/username, beforeRole, afterRole, reason, before/after, and site code. Secret-shaped reason text is redacted. |
| GET | `/admin/work-schedules` | Admin | `admin.workSchedule.view`, `admin.schedule.view`, or `admin.manage` | None | list of site admin schedules with public admin summary, site access role, schedule, summary, last schedule audit timestamp, and last schedule audit actor | `401`, `403` | None |
| GET | `/admin/work-schedules/:adminId` | Admin | `admin.workSchedule.view`, `admin.schedule.view`, or `admin.manage` | None | target admin public profile, site id, schedule, and emergency override state | `401`, `403`, `404` | None |
| PATCH | `/admin/work-schedules/:adminId` | Admin | `admin.workSchedule.update`, `admin.schedule.update`, or `admin.manage` | required `reason`; schedule fields: `enabled`, `timezone`, `allowedDays`, `startTime`, `endTime`, `forceLogoutWhenScheduleEnds`, `idleTimeoutMinutes`, optional `emergencyOverride` | updated schedule | `400`, `401`, `403`, `404` | `admin.schedule.update`; also `admin.schedule.enable` or `admin.schedule.disable` on enabled-state changes. Audit metadata includes `reason`, `targetAdminId`, and target username. |
| POST | `/admin/work-schedules/:adminId/override` | Admin | `admin.schedule.override` or `admin.manage` | `expiresAt`, required `reason` | active emergency override inside schedule response | `400`, `401`, `403`, `404` | `admin.schedule.override_enable`; audit metadata includes `reason`, `targetAdminId`, and target username |
| DELETE | `/admin/work-schedules/:adminId/override` | Admin | `admin.schedule.override` or `admin.manage` | required `reason` | disabled emergency override inside schedule response | `400`, `401`, `403`, `404` | `admin.schedule.override_disable`; audit metadata includes `reason`, `targetAdminId`, and target username |
| GET | `/admin/work-schedules/:adminId/audit-logs` | Admin | `admin.workSchedule.view`, `admin.schedule.view`, or `admin.manage` | None | schedule/override/login-block audit history for the target admin with masked IP, redacted user-agent, and safe reason metadata when present | `401`, `403`, `404` | None |
| GET | `/admin/logs` | Admin | `reports.view` | None | admin logs with admin summary, module/result/severity classification, masked IP, and no raw user-agent | `401`, `403` | None |
| GET | `/admin/audit-logs` | Admin | `admin.audit.view` or `wheel.audit.view` | None | `{ rows, summary }` for safe admin audit logs with masked IP, no raw user-agent, safe metadata, module/result/severity badges, and zero summary for empty results. `wheel.audit.view` is scoped to Lucky Wheel actions only. | `400`, `401`, `403` | None |
| GET | `/admin/audit-logs/summary` | Admin | `admin.audit.view` or `wheel.audit.view` | None | audit summary counts: `totalEvents`, `blockedLogins`, `emergencyOverrides`, `permissionChanges`, `roleChanges`, `scheduleChanges`, `failedAttempts`, `highSeverityCount`; wheel-only access is scoped to Lucky Wheel actions. | `400`, `401`, `403` | None |
| GET | `/admin/security-events` | Admin | `admin.security.view` | None | `{ rows, summary }` for sensitive admin/security events such as role changes, schedule changes, emergency override, and login guard events | `400`, `401`, `403` | None |
| GET | `/admin/security-events/summary` | Admin | `admin.security.view` | None | security-event summary counts with the same safe summary contract | `400`, `401`, `403` | None |
| GET | `/admin/members` | Admin | `members.view` | None | member list with wallet and bank accounts | `401`, `403` | None |
| GET | `/admin/members/:id` | Admin | `members.view` | None | member detail with wallet, bank accounts, recent deposits, recent withdrawals | `403`, `404` member not found | None |
| POST | `/admin/members/:id/block` | Admin | `members.update` | None | blocked member | `403`, `404` member not found | `user.block` |
| POST | `/admin/members/:id/unblock` | Admin | `members.update` | None | active member | `403`, `404` member not found | `user.unblock` |
| POST | `/admin/members/:id/credit/add` | Admin | `members.update` | `amount`, optional `note` | wallet movement and ledger | `400`, `403`, `404` member not found | `credit.add` |
| POST | `/admin/members/:id/credit/remove` | Admin | `members.update` | `amount`, optional `note` | wallet movement and ledger | `400`, `403`, `404` member not found | `credit.remove` |
| POST | `/admin/members/:id/points/add` | Admin | `members.update` | `amount`, `reason`, optional `reference_type`, `reference_id` | updated user and point ledger | `400`, `403`, `404` member not found | `points.add` |
| POST | `/admin/members/:id/points/remove` | Admin | `members.update` | `amount`, `reason`, optional `reference_type`, `reference_id` | updated user and point ledger | `400`, `403`, `404` member not found | `points.remove` |
| GET | `/admin/bank-accounts/pending` | Admin | `bank.view` | None | pending member bank accounts | `401`, `403` | None |
| POST | `/admin/bank-accounts/:id/approve` | Admin | `bank.update` | None | approved member bank account | `403`, `404` not found | `bank_account.approve` |
| POST | `/admin/bank-accounts/:id/reject` | Admin | `bank.update` | `reject_reason` | rejected member bank account | `400`, `403`, `404` not found | `bank_account.reject` |
| GET | `/admin/deposits` | Admin | `deposits.view` | None | deposit list | `401`, `403` | None |
| POST | `/admin/deposits/:id/approve` | Admin | `deposits.approve` | optional `note` | approved deposit, wallet, ledger | `400`, `403`, `404` not found | `deposit.approve` |
| POST | `/admin/deposits/:id/reject` | Admin | `deposits.approve` | `reject_reason` | rejected deposit | `400`, `403`, `404` not found | `deposit.reject` |
| GET | `/admin/withdrawals` | Admin | `withdrawals.view` | None | withdrawal list | `401`, `403` | None |
| POST | `/admin/withdrawals/:id/approve` | Admin | `withdrawals.approve` | optional `note` | approved withdrawal, wallet, ledger | `400`, `403`, `404` not found | `withdraw.approve` |
| POST | `/admin/withdrawals/:id/reject` | Admin | `withdrawals.approve` | `reject_reason` | rejected withdrawal | `400`, `403`, `404` not found | `withdraw.reject` |
| POST | `/admin/withdrawals/:id/mark-paid` | Admin | `withdrawals.approve` | None | paid withdrawal | `400`, `403`, `404` not found | `withdraw.mark_paid` |
| GET | `/admin/reports/summary` | Admin | `reports.view` | None | counts and decimal totals | `401`, `403` | None |
| GET | `/admin/reports/deposits` | Admin | `reports.view` | None | deposit report rows | `401`, `403` | None |
| GET | `/admin/reports/withdrawals` | Admin | `reports.view` | None | withdrawal report rows | `401`, `403` | None |
| GET | `/admin/reports/wallet-ledger` | Admin | `reports.view` | None | wallet ledger report rows | `401`, `403` | None |

Common admin query params:

- `/admin/members`: `page`, `limit`, `search`, `status`
- `/admin/logs`: `page`, `limit`, `search`, `action`, `status`, `admin_id`, `target_type`, `target_id`
- `/admin/audit-logs` and `/admin/security-events`: `page`, `limit`, `search`, `action`, `adminId`, `targetAdminId`, `dateFrom`, `dateTo`, `severity`, `module`, `result`
- `/admin/deposits`: `page`, `limit`, `search`, `status`
- `/admin/withdrawals`: `page`, `limit`, `search`, `status`
- report endpoints: `status` or `user_id` where supported by service
- work schedule list/history endpoints: `search`, `role`, `status`, `action`, `limit`, and `page` where supported. The older `/admin/admins/:id/work-schedule` routes remain available as compatibility aliases, but UI should prefer `/admin/work-schedules`.

Admin site/config endpoints found in routes:

| Method | Path | Auth | Permission | Description | Body fields | Admin log action |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin/sites` | Admin + site access | `settings.website.view` | List all sites for `owner`/`super_admin`, otherwise accessible sites | None | None |
| GET | `/admin/sites/current/config` | Admin + site access | `settings.website.view` | Current resolved site full config | None | None |
| GET | `/admin/sites/:id` | Admin + target site access in controller | `settings.website.view` | Site detail with domains, setting, theme, bank accounts, provider/payment configs | None | None |
| POST | `/admin/sites/:id/settings` | Admin + target site access in controller | `settings.website.update` | Upsert site settings | `lineUrl`, `telegramUrl`, `customerServiceUrl`, `announcement`, `maintenanceMode`, `metadata` | `site.settings.update` |
| POST | `/admin/sites/:id/theme` | Admin + target site access in controller | `settings.website.update` | Upsert site theme/banner-style assets | `logoUrl`, `faviconUrl`, `primaryColor`, `secondaryColor`, `backgroundColor`, `layoutMode`, `customCss` | `site.theme.update` |
| GET | `/admin/sites/:id/bank-accounts` | Admin + target site access in controller | `bank.view` | List site bank accounts | None | None |
| POST | `/admin/sites/:id/bank-accounts` | Admin + target site access in controller | `bank.update` | Create site bank account. Mock balance/capital and website visibility are stored in `metadata`. | `type`, `bankCode`, `bankName`, `accountName`, `accountNumber`, optional `phone`, `status`, `isDefault`, `metadata`, `showOnWebsite`, `mockBalance`, `mockCapital` | `site.bank_account.create` |
| PUT | `/admin/sites/:id/bank-accounts/:bankAccountId` | Admin + target site access in controller | `bank.update` | Update site bank account, including open/closed status and show/hide metadata | Partial site bank account fields, optional `showOnWebsite`, `mockBalance`, `mockCapital` | `site.bank_account.update` |
| DELETE | `/admin/sites/:id/bank-accounts/:bankAccountId` | Admin + target site access in controller | `bank.update` | Safe soft-disable site bank account. Does not delete rows or call bank rails. | None | `site.bank_account.disable` |
| GET | `/admin/sites/:id/game-providers` | Admin + target site access in controller | `settings.website.view` | List game provider configs with secrets masked | None | None |
| POST | `/admin/sites/:id/game-providers` | Admin + target site access in controller | `settings.website.update` | Create game provider config | `providerCode`, `displayName`, optional config fields | `site.game_provider.create` |
| PUT | `/admin/sites/:id/game-providers/:configId` | Admin + target site access in controller | `settings.website.update` | Update game provider config | Partial provider config fields | `site.game_provider.update` |
| GET | `/admin/sites/:id/payment-configs` | Admin + target site access in controller | `settings.website.view` | List payment configs with secrets masked | None | None |
| POST | `/admin/sites/:id/payment-configs` | Admin + target site access in controller | `settings.website.update` | Create payment config | `providerCode`, `displayName`, optional config fields | `site.payment_config.create` |
| PUT | `/admin/sites/:id/payment-configs/:configId` | Admin + target site access in controller | `settings.website.update` | Update payment config | Partial payment config fields | `site.payment_config.update` |

Smoke coverage:

- `coreApiSmoke`: admin login, admin me, logs, members, deposits, withdrawals.
- `moneyFlowSmoke`: bank account approval, deposit approval, withdrawal approval, mark-paid, admin log checks.
- `financialNegativeSmoke`: duplicate approval guards, invalid amounts, over-balance withdrawal, admin log checks.
- `adminReportsConfigSmoke`: read-only coverage for `/admin/reports/summary`, `/admin/reports/deposits`, `/admin/reports/withdrawals`, `/admin/reports/wallet-ledger`, `/site/config`, `/admin/sites`, `/admin/sites/current/config`, `/admin/sites/:id`, `/admin/sites/:id/bank-accounts`, `/admin/sites/:id/game-providers`, and `/admin/sites/:id/payment-configs`; includes admin auth negative checks and response leak scan.
- `bankModuleSmoke`: mock-only bank account create/update/soft-disable, mock deposit/withdraw statement lists, mock Slip OCR success/fail, admin auth negative checks, and response leak scan.
- `adminPermissionSmoke`: owner/finance/support/graphic/viewer/no-permission role checks, admin permission endpoints, backend `403` checks for missing permissions, admin unauth `401`, and response leak scan.
- `adminRoleManagementSmoke`: owner role-management access, target admin permission read, non-owner role-update `403`, role assignment and rollback, `admin.role.update` audit log check, and response leak scan.
- `adminWorkScheduleSmoke`: owner schedule list/read/update/override, unauth `401`, non-owner `403`, invalid time `400`, login outside schedule block with no token, login inside schedule allow, active and expired emergency override behavior, overnight shift helper, schedule rollback, audit history endpoint checks, and response leak scan.
- `adminWorkScheduleUiSmoke`: static UI route/assets, owner list and schedule UI flow, no-permission API block, emergency override UI flow, masked audit history data, and response leak scan.
- `adminAuditSecuritySmoke`: static `/admin/audit-security` UI route/assets, audit/security summary and list endpoints, UX markers for summary cards/filter toolbar/details modal/redaction/role before-after/work-schedule rows, action/admin/target/date/severity/module/result API filters, no-permission `403`, empty result shape, masked IP, omitted raw user-agent, and response leak scan.

Mock bank module endpoints:

| Method | Path | Auth | Description | Query/body fields |
| --- | --- | --- | --- | --- |
| GET | `/admin/bank/mock/statements/deposits` | Admin + site access | Deposit statement mock list. No bank network call. Empty filters return `[]`. | Query: optional `from`, `to`, `date_from`, `date_to`, `search` |
| GET | `/admin/bank/mock/statements/withdrawals` | Admin + site access | Withdraw statement mock list. No bank network call. Empty filters return `[]`. | Query: optional `from`, `to`, `date_from`, `date_to`, `search` |
| POST | `/admin/slip-ocr/mock/verify` | Admin + site access | Slip OCR mock verify. Does not run OCR and does not send files outside the system. | Body: optional `result: "success" \| "fail"`, `invalid`, `amount`, `reference` |

## 7. Deposit API

Member create/list:

| Method | Path | Auth | Body fields | Response summary | Error cases |
| --- | --- | --- | --- | --- | --- |
| POST | `/deposits` | Member | `amount`, `channel`, optional `bank_account_id`, `promotion_id`, `slip_file_url`, `note` | `201`, pending deposit transaction with `transactionId` prefix `PGD` | `400` invalid amount, `404` bank account/promotion not found |
| GET | `/deposits` | Member | None | Member deposits, newest first, including promotion and bank account | `401` unauth |

Admin approve/reject:

| Method | Path | Auth | Body fields | Response summary | Error cases | Admin log |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin/deposits` | Admin + site access | None | Deposit list including user, promotion, bank account | `401`, `403` | None |
| POST | `/admin/deposits/:id/approve` | Admin + site access | optional `note` | `{ deposit, wallet, ledger }` | `400` if not pending, `404` not found | `deposit.approve` |
| POST | `/admin/deposits/:id/reject` | Admin + site access | `reject_reason` | rejected deposit | `400` missing reason or not pending, `404` not found | `deposit.reject` |

Flow contract:

1. Member creates a pending deposit with a positive amount.
2. Admin approves a pending deposit.
3. Approval creates a wallet movement with type `deposit`.
4. Ledger row uses `referenceType: "deposit"` and `referenceId` equal to the deposit id.
5. Wallet balance increases by the deposit amount.
6. Admin log action `deposit.approve` is written.
7. Duplicate approve is blocked because approved deposits are no longer `pending`.

Safety behavior verified by smoke tests:

- Amount `0` fails safely with `400`.
- Negative amount fails safely with `400`.
- Invalid amount does not create bad wallet balance or ledger effect.
- Duplicate approve returns a non-2xx response and does not credit again.
- `financialNegativeSmoke` verifies one deposit ledger row and unchanged wallet after duplicate approve.

## 8. Withdraw API

Member create/list:

| Method | Path | Auth | Body fields | Response summary | Error cases |
| --- | --- | --- | --- | --- | --- |
| POST | `/withdrawals` | Member | `user_bank_account_id`, `amount`, optional `note` | `201`, pending withdrawal with `transactionId` prefix `PGW` | `400` invalid amount or insufficient wallet balance, `404` approved bank account not found |
| GET | `/withdrawals` | Member | None | Member withdrawals, newest first, including user bank account | `401` unauth |

Admin approve/reject/mark-paid:

| Method | Path | Auth | Body fields | Response summary | Error cases | Admin log |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin/withdrawals` | Admin + site access | None | Withdrawal list including user and bank account | `401`, `403` | None |
| POST | `/admin/withdrawals/:id/approve` | Admin + site access | optional `note` | `{ withdrawal, wallet, ledger }` | `400` if not pending or insufficient balance, `404` not found | `withdraw.approve` |
| POST | `/admin/withdrawals/:id/reject` | Admin + site access | `reject_reason` | rejected withdrawal | `400` missing reason or not pending, `404` not found | `withdraw.reject` |
| POST | `/admin/withdrawals/:id/mark-paid` | Admin + site access | None | paid withdrawal | `400` if not approved, `404` not found | `withdraw.mark_paid` |

Flow contract:

1. Member creates pending withdrawal using an approved bank account.
2. Withdrawal creation checks wallet balance but does not deduct yet.
3. Admin approval deducts wallet using wallet movement type `withdraw`.
4. Ledger row amount is negative and uses `referenceType: "withdraw"`.
5. Admin log action `withdraw.approve` is written.
6. Admin mark-paid changes status from `approved` to `paid`.
7. Mark-paid writes admin log action `withdraw.mark_paid`.
8. Mark-paid does not create another wallet ledger and does not change wallet balance.

Safety behavior verified by smoke tests:

- Amount `0` fails safely with `400`.
- Negative amount fails safely with `400`.
- Withdrawal greater than balance is blocked with `400`.
- Duplicate approve returns a non-2xx response and does not debit again.
- Duplicate mark-paid returns a non-2xx response and does not change wallet balance.
- `financialNegativeSmoke` verifies one withdrawal ledger row and unchanged wallet after duplicate approve/mark-paid.

## 9. Game API

All game endpoints require member auth and use `MockGameProviderAdapter`. Current smoke coverage is mock/sandbox/local provider only. No real provider API is called.

| Method | Path | Auth | Body/query | Response summary | Error cases | Smoke script |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/game/providers` | Member | None | Active site game provider configs merged with mock provider names | `401` unauth | `coreApiSmoke` |
| GET | `/game/providers/:provider/games` | Member | route `provider` | Mock games for provider | `403` if provider is not active for site | `coreApiSmoke` |
| POST | `/game/launch/mock` | Member | `provider` string default `PG`, `game_code` required | `launch_url` and `session` | `400` validation, `403` inactive provider, possible DB FK failure if game missing | `coreApiSmoke` |
| POST | `/game/transfer-in/mock` | Member | `provider` string default `PG`, `amount` | transfer, wallet, ledger; debits wallet using `game_debit_mock` | `400` invalid amount or insufficient balance, `403` inactive provider | `gameTransferSmoke` |
| POST | `/game/transfer-out/mock` | Member | `provider` string default `PG`, `amount` | transfer, wallet, ledger; credits wallet using `game_credit_mock` | `400` invalid amount, `403` inactive provider | `gameTransferSmoke` |
| GET | `/game/bet-history/mock` | Member | optional `from`, `to` | existing or generated mock bet history rows | `401` unauth | `gameTransferSmoke` |

Confirmed launch contract:

- `POST /api/game/launch/mock`
- Requires member auth.
- Body:
  - `provider`: string, default `PG`.
  - `game_code`: string, required.
- Provider must be active in `siteGameProviderConfig`.
- Game must exist in the global `games` table because `GameSession` has a FK from `(provider, gameCode)` to `(Game.providerCode, Game.code)`.
- `coreApiSmoke` creates active mock `PG` provider config and fixture games before launch.
- Launch URL is local mock format beginning with `/mock-game`.
- Do not connect a real provider from this endpoint.

Transfer smoke contract:

- `gameTransferSmoke` covers auth negatives for transfer-in, transfer-out, and bet-history.
- It creates local mock provider/game fixtures only.
- Transfer-in verifies wallet debit and a `game_debit_mock` ledger row.
- Transfer-out verifies wallet credit and a `game_credit_mock` ledger row.
- Bet-history verifies JSON row shape.
- Responses are scanned for secret-shaped values and issued auth values.
- No real provider call is made.

## 10. Promotions API

| Method | Path | Auth | Body fields | Response summary | Error cases | Smoke script |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/promotions` | No member auth; site resolver required | None | Active promotions for the resolved site, filtered by start/end date | `404` site not found | `coreApiSmoke` |
| POST | `/promotions/:id/claim` | Member | None | `201`, promotion, claim, turnover, optional wallet/ledger if bonus amount is positive | `404` promotion not found, `400` duplicate claim or possible wallet validation errors | `promotionClaimSmoke` |

Smoke contract:

- `coreApiSmoke` verifies `GET /promotions` returns a JSON success envelope and `data` is an array.
- Empty promotion data is valid if the envelope format is correct.
- `promotionClaimSmoke` creates a local promotion fixture and verifies successful `POST /promotions/:id/claim`.
- Duplicate claim is blocked with a safe non-2xx response.
- Duplicate claim and invalid promotion id attempts do not create extra `PromotionClaim` or `TurnoverRequirement` rows.
- Invalid promotion id fails safely.
- Wallet and ledger effects are checked after the first claim and stay stable after duplicate/invalid attempts.
- Promotion responses are scanned for secret-shaped values and issued auth values.

## 11. Lucky Wheel API

Lucky Wheel is a staging/mock backend MVP for the future `lucky-wheel-game` Phaser prototype. It does not perform real payout, real wallet payout, live provider calls, live payment calls, bank calls, SMS, or Slip OCR. The backend is the only component allowed to choose the reward result.

Member endpoints:

| Method | Path | Auth | Body/query | Response summary | Safety notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/member/wheel/config` | Member or local demo header | optional query `campaignId` | active campaign, cost, remaining spins, mock balance, public reward segments, rules, server time | Does not expose `probabilityWeight`, stock, or internal metadata |
| POST | `/member/wheel/spin` | Member or local demo header | `campaignId` only | backend-selected `spinId`, `rewardId`, `prizeIndex`, reward label/type/amount, remaining spins, balance after | Rejects frontend `rewardId`, `prizeIndex`, `probabilityWeight`, or `rewardValue` |
| GET | `/member/wheel/history` | Member or local demo header | `page`, `limit` max 100 | newest spin rows with reward label/type/value/status/prizeIndex | Sanitized history only |
| GET | `/member/wheel/my-rewards` | Member or local demo header | `page`, `limit` max 100 | pending/claimed/expired wheel rewards, excluding no-reward results | No real payout or claim payout is implemented |

Member runtime fail-safe behavior:

- Missing member auth returns a controlled JSON `401`.
- Unknown `campaignId` returns a controlled not-found response and must not expose raw internal error details.
- `POST /member/wheel/spin` accepts only `campaignId`; frontend/client requests that include `rewardId`, `prizeIndex`, `probabilityWeight`, or reward value fields are rejected before reward selection.
- Insufficient mock points, daily limit reached, inactive campaign, and unavailable stock fail safely with sanitized JSON errors.
- Stock-zero rewards are excluded from backend selection even if configured with a high probability weight.
- History and my-rewards responses must not expose raw tokens, auth headers, passwords, secrets, database URLs, raw stack traces, or raw provider data.

Local Lucky Wheel frontend demo bridge:

- Header name: `x-demo-member-id`
- Header value: `demo_member`
- Applies only to `GET /member/wheel/config`, `POST /member/wheel/spin`, `GET /member/wheel/history`, and `GET /member/wheel/my-rewards`.
- Allowed only when `NODE_ENV` is `development-local` or `test`, `APP_ENV` is `local-test`, and all external modes are exactly `mock`.
- Never use this header in production, staging UAT, or any environment with live/sandbox provider, payment, bank, SMS, or Slip OCR modes.
- The bridge creates or reuses a local fixture member named `demo_member` with mock points and mock wallet balance. It does not issue a token, expose session data, create real payout, or call live systems.
- If the header is missing and no normal member bearer token is sent, the endpoint returns `Member session unavailable. Please sign in again.`

Admin endpoints:

| Method | Path | Auth | Permission | Body/query | Response summary | Admin log |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/admin/wheel/config` | Admin + site access | `wheel.view` or `wheel.campaign.view` | None | campaign, rewards with weight/stock fields, summary counts | None |
| PATCH | `/admin/wheel/campaign` | Admin + site access | `wheel.campaign.update` | allowed campaign fields plus required `reason` | sanitized campaign | `wheel.campaign.update` |
| POST | `/admin/wheel/rewards` | Admin + site access | `wheel.rewards.create` | reward fields plus required `reason` | sanitized reward | `wheel.reward.create` |
| PATCH | `/admin/wheel/rewards/:id` | Admin + site access | `wheel.rewards.update` or `wheel.rewards.status.update` for status-only body | reward fields plus required `reason` | sanitized reward | `wheel.reward.update`; status-only changes write `wheel.reward.status.update` |
| GET | `/admin/wheel/spins` | Admin + site access | `wheel.spins.view` | `campaignId`, `memberId`, `username`, `rewardType`, `rewardId`, `dateFrom`, `dateTo`, `page`, `limit` | sanitized spin rows with masked IP and user-agent hash when present | None |
| GET | `/admin/wheel/member-rewards` | Admin + site access | `wheel.claims.view` | `campaignId`, `memberId`, `username`, `rewardType`, `status`, `spinId`/`sourceId`, `dateFrom`, `dateTo`, `page`, `limit` | `{ rows, summary }` for sanitized member reward claims | None |
| PATCH | `/admin/wheel/member-rewards/:id/status` | Admin + site access | `wheel.claims.status.update` | `status` as `claimed` or `cancelled`, plus required `reason` | sanitized member reward with unchanged reward value | `wheel.memberReward.status.update` |

Reward status flow:

- Member spins create `member_rewards` rows with `status: pending` for non-`no_reward` results.
- Admin Reward Claims can mark only pending `item` rewards as `claimed`. This is a manual staging/mock handoff only and does not credit wallets, points, tickets, provider balances, banks, payments, SMS, or Slip OCR.
- Admin Reward Claims can cancel pending rewards with a required `reason`.
- `expired` is reported from stored reward state but is not set by the current admin UI action.
- The claim/cancel endpoint never accepts `rewardValue`, payout amount, wallet amount, points amount, ticket amount, `rewardId`, `prizeIndex`, or probability fields from the UI.

Admin Wheel UI API usage:

- Static page: `/admin/lucky-wheel/`.
- The UI uses only wheel/admin APIs listed above plus existing read-only `GET /admin/audit-logs?limit=100` for the Audit history tab when that report endpoint is available.
- Permission guard is backend-enforced: config reads require `wheel.view` or `wheel.campaign.view`, campaign writes require `wheel.campaign.update`, reward writes require `wheel.rewards.create`, `wheel.rewards.update`, or `wheel.rewards.status.update`, spin history requires `wheel.spins.view`, reward claims require `wheel.claims.view` / `wheel.claims.status.update`, and audit history requires `wheel.audit.view` or `admin.audit.view`. UI menu visibility is advisory only.
- Admin UI maps auth/permission failures to safe messages: `401` shows `กรุณาเข้าสู่ระบบแอดมิน`, `403` shows `ไม่มีสิทธิ์ใช้งานเมนู Lucky Wheel`, `404` shows `ยังไม่พบข้อมูล Lucky Wheel`, and other load failures show `โหลดข้อมูลไม่สำเร็จ`.
- Campaign settings loads `GET /admin/wheel/config`, shows read-only `campaignId`, active/inactive status, site code, last updated, cost, daily-limit, and date-window summary, and writes `PATCH /admin/wheel/campaign` with only `status`, `name`, `costType`, `costAmount`, `dailySpinLimit`, `startAt`, `endAt`, `rulesText`, and required `reason`.
- Rewards management loads rewards from `GET /admin/wheel/config`, creates with `POST /admin/wheel/rewards`, and edits/toggles status with `PATCH /admin/wheel/rewards/:id`. Reward writes send `label`, `rewardType`, `rewardValue`, `displayValue`, `probabilityWeight`, `stockLimit`, `segmentColor`, `imageUrl`, `sortOrder`, `status`, and required `reason`. The UI labels backend `no_reward` as `empty`, validates label/type, non-negative probability weight, and `stockLimit >= stockUsed` when editing an existing reward, and falls back invalid segment colors to the default safe color.
- Spin history uses `GET /admin/wheel/spins` with supported filters: `campaignId`, `username`, `memberId`, `rewardType`, `rewardId`, `dateFrom`, `dateTo`, and `limit`. The UI filters status client-side from the sanitized reward status returned by the endpoint and renders reward type, cost type/amount, prize index, masked IP, user-agent hash when present, and spin ID only.
- Reward Claims uses `GET /admin/wheel/member-rewards` and `PATCH /admin/wheel/member-rewards/:id/status`. Claim/cancel writes require a confirm modal and non-empty `reason`, call guarded admin APIs, create `wheel.memberReward.status.update`, and never perform real payout or live credit/point/ticket changes.
- Reports are frontend summaries derived from `GET /admin/wheel/config`, `GET /admin/wheel/spins`, and `GET /admin/wheel/member-rewards`; there is no report endpoint and no report write endpoint. Reports show total spins, unique members spun, rewards issued, pending rewards, claimed rewards, expired/cancelled rewards, total point cost, total ticket cost, empty/no reward count, top reward by count, top reward by stock used, daily spin count, reward type summary, reward stock usage, top rewards, claim status summary, and member reward summary. Zero-state reports must render `0 %`, `0`, `ไม่จำกัด`, or `ไม่พบข้อมูล` instead of `NaN`/`undefined`.
- Audit history filters existing admin audit rows client-side to `wheel.campaign.update`, `wheel.reward.create`, `wheel.reward.update`, `wheel.reward.status.update`, and `wheel.memberReward.status.update`, then renders time, actor/admin, action, target type, target ID, reason, before summary, after summary, and site code. If the report endpoint is unavailable, the tab shows a read-only placeholder. If auth/permission fails, it shows the safe 401/403 message instead of fake audit data.
- Every write action requires a non-empty `reason` before submit. The UI does not send `stockUsed`, `rewardId`, `prizeIndex`, `probabilityWeight`, or reward value to member spin endpoints. Member spin remains `{ "campaignId": "wheel_main" }` only and backend-selected.
- The UI redacts secret-shaped values in details/diff displays and must not render raw tokens, passwords, secrets, database URLs, authorization headers, raw internal stack traces, or raw unmasked IPs.

Spin contract for `lucky-wheel-game`:

1. Frontend calls `GET /api/member/wheel/config` to render wheel segments.
2. Frontend calls `POST /api/member/wheel/spin` with only `{ "campaignId": "wheel_main" }`.
3. Backend validates campaign, member, mock balance, limits, stock, and chooses the reward with `crypto.randomInt`.
4. Backend returns `prizeIndex`; frontend animates to that index.
5. Frontend must not randomize rewards, submit `rewardId`, submit `prizeIndex`, or submit reward value.

Mock seed: campaign `wheel_main`, name `กงล้อนำโชค`, active, point cost `10`, daily limit `3`, and eight demo segments: Credit 10, Credit 50, Points 20, Ticket 1, No reward, Gold Mystery Box, Jackpot mock, and Try again.

Smoke coverage:

- `npm run smoke:admin-wheel-ui` covers static Admin Lucky Wheel UI source contract, campaign summary fields, reward table/modal fields, Reward Claims fields/actions, spin history empty state, reports/audit fields, endpoint usage, reason validation before writes, safe auth/permission messages, report zero guards, redaction markers, masked IP handling, and frontend spin-safety guard.
- `npm run smoke:admin-wheel-runtime` covers static HTTP route/assets, unauthenticated `401`, no-permission `403`, admin config/spins/member-rewards reads, member config/spin/history/my-rewards runtime shape, unsafe spin payload rejection, write-without-reason rejection, write-with-reason success for campaign/reward/reward-claim status, audit creation/read through the existing audit endpoint, and response leak scan. It skips safely when local admin/member env is not configured.
- `npm run smoke:wheel` covers the local/staging safety guard, member config, missing auth, invalid campaign, member result field injection rejection, backend-selected spin result, history, my rewards, daily limit, insufficient points, inactive campaign, stock-zero exclusion, admin reason validation, admin audit reason, admin config/spins, and response leak scan. It skips safely when local runtime env is missing and blocks production-like targets.

## 12. Financial Ledger Runtime API Contract Draft

Phase Q contract status: draft only, not implemented runtime.

This section mirrors `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md`. It is docs/static smoke only. It does not enable real money, does not enable live payout, does not use production DB, does not add a Prisma migration, and does not implement runtime ledger routes.

Safety boundaries:

- No real money.
- No live payout.
- No production DB.
- No live provider/payment/bank/SMS/Slip OCR.
- No frontend money calculation authority.
- No admin direct balance mutation without ledger, audit, and dual control.
- No secret values, raw auth material, or database connection text in docs/logs/responses.

Draft admin endpoints:

| Method | Path | Auth | Permission | Contract notes |
| --- | --- | --- | --- | --- |
| GET | `/admin/ledger/entries` | Admin + site access | `ledger.view` or `reports.view` | Read-only ledger list. No idempotency key required. No secret response. |
| GET | `/admin/ledger/entries/:id` | Admin + site access | `ledger.view` or `reports.view` | Read-only ledger entry detail. No secret response. |
| GET | `/admin/ledger/reconciliation` | Admin + site access | `ledger.reconciliation.view` or `reports.view` | Read-only reconciliation summary draft. |
| GET | `/admin/ledger/member/:memberId` | Admin + site access | `ledger.view` or `members.view` | Read-only member ledger/balance draft. |
| POST | `/admin/ledger/admin-adjustment/request` | Admin + site access | `ledger.adjustment.request` | Money-affecting draft write. Requires idempotency key, reason, maker audit, and no direct balance mutation. |
| POST | `/admin/ledger/admin-adjustment/:id/approve` | Admin + site access | `ledger.adjustment.approve` | Requires checker audit, no self-approval, idempotency, and dual control. |
| POST | `/admin/ledger/admin-adjustment/:id/reject` | Admin + site access | `ledger.adjustment.approve` | Requires checker audit, no self-approval, idempotency, and reason. |

Draft member endpoints:

| Method | Path | Auth | Permission | Contract notes |
| --- | --- | --- | --- | --- |
| GET | `/member/ledger/history` | Member | Own member scope | Read-only member ledger history. Server-calculated values only. |
| GET | `/member/wallet/balance` | Member | Own member scope | Read-only balance summary. Frontend must not calculate authoritative balance. |

Draft internal/mock endpoints:

| Method | Path | Auth | Permission | Contract notes |
| --- | --- | --- | --- | --- |
| POST | `/internal/mock-ledger/deposit-credit` | Internal mock guard | Mock-only internal permission | Mock/staging/sandbox only. Requires idempotency and audit. |
| POST | `/internal/mock-ledger/withdraw-reserve` | Internal mock guard | Mock-only internal permission | Mock/staging/sandbox only. Requires idempotency and audit. |
| POST | `/internal/mock-ledger/reversal` | Internal mock guard | Mock-only internal permission | Mock/staging/sandbox only. Creates explicit reversal entry draft. |

Draft response shape:

```json
{
  "success": true,
  "data": {
    "status": "draft_contract"
  }
}
```

Draft error shape:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Safe error message",
    "correlationId": "safe-correlation-reference"
  }
}
```

Draft error codes include `validation_error`, `unauthorized`, `forbidden`, `idempotency_conflict`, `insufficient_balance`, `ledger_write_failed`, `reconciliation_mismatch`, `dual_control_required`, `live_payout_disabled`, `provider_live_disabled`, and `production_db_blocked`.

## 13. Safety / Negative Contract

Verified by `src/local-smoke-tests/financialNegativeSmoke.js`:

- Unauthenticated member endpoint `/wallet` returns `401`.
- Unauthenticated admin endpoint `/admin/me` returns `401`.
- Invalid deposit amount `0` fails safely.
- Invalid deposit negative amount fails safely.
- Invalid withdrawal amount `0` fails safely.
- Invalid withdrawal negative amount fails safely.
- Withdrawal over wallet balance is blocked.
- Duplicate deposit approve does not add credit twice.
- Duplicate withdrawal approve does not debit twice.
- Duplicate withdrawal mark-paid does not change wallet balance.
- Ledger row counts stay stable after duplicate/admin-log checks.
- Admin logs exist once for `deposit.approve`, `withdraw.approve`, and `withdraw.mark_paid`.
- Responses scanned by the script must not expose secret-shaped values, auth values, DB URLs, password/token/secret markers, `undefined`, or `NaN`.

## 14. Smoke Test Coverage Map

| Command | What it checks | Needs running API | Needs local DB | GitHub Actions status |
| --- | --- | --- | --- | --- |
| `npm run smoke:money-flow` | Health, admin login, member register, bank approval, deposit approve, duplicate deposit guard, withdrawal approve, duplicate withdrawal guard, mark-paid guard, wallet final balance, ledger rows, admin logs | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:core-api` | Health, auth guards, member register/login/me/wallet/points/ledger, promotions list, game providers/games/mock launch, admin login/me/logs/members/deposits/withdrawals, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:financial-negative` | Unauth 401s, invalid deposit/withdraw amounts, over-balance withdrawal, duplicate approve/mark-paid guards, ledger safety, admin log checks, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:promotion-claim` | Health, unauth promotion claim guard, promotion list, local promotion fixture, successful claim, duplicate claim guard, invalid promotion id guard, `PromotionClaim` and `TurnoverRequirement` count guards, wallet/ledger effect guard, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:game-transfer` | Health, auth negatives for transfer-in/transfer-out/bet-history, member login, mock provider/game fixtures, transfer-in debit, transfer-out credit, final wallet balance, ledger rows, bet-history row shape, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-reports-config` | Health, public site config, admin auth negatives, admin login, read-only report endpoints, read-only site/config endpoints, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-work-schedule` | Health, schedule auth guards, owner schedule list/update/read/override, invalid time validation, login schedule block/allow, expired override, overnight shift helper, audit logs, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-work-schedule-ui` | Static `/admin/work-schedules` UI route/assets, permission block, owner schedule list/update, override, masked audit history, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-audit-security` | Static `/admin/audit-security` UI route/assets, audit/security endpoints, UX markers, filters, permission block, empty state response, masked IP, raw user-agent omission, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-wheel-ui` | Static `/admin/lucky-wheel` UI source contract, tabs, existing endpoint usage, reason validation before writes, redaction markers, and frontend spin-safety guard | No | No | Runs as static/source smoke |
| `npm run smoke:wheel` | Lucky Wheel safety guard, member config/spin/history/rewards, backend result selection, admin campaign/reward reason validation, audit reason, stock-zero exclusion, and response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:all-local` | Guarded sequence: smoke syntax checks, `npm run check`, promotion-claim, money-flow, core-api, game-transfer, financial-negative, admin-reports-config, admin work schedule, admin work schedule UI, admin audit/security, admin wheel UI, wheel, secret grep, diff whitespace check | Yes | Yes | Not run in Safe CI because it needs a running API and local DB |
| GitHub Actions Safe CI | `npm ci`, Prisma validate/generate, `npm run check`, local smoke syntax checks, secret-shaped value scan | No | No real DB connection for smoke | Runs on push and PR |

GitHub Actions does not run DB-backed local smoke flows because those require a running local API and safe local/test PostgreSQL fixture setup.

## 15. Error Status Contract

Status codes verified from code:

- `200`: normal success.
- `201`: successful create/register/claim where controller passes `201`.
- `400`: validation errors, invalid credentials, invalid amount, insufficient balance, duplicate approval/state transition, Prisma duplicate data (`P2002` maps to `400`).
- `401`: missing/invalid auth for protected member/admin endpoints.
- `403`: blocked member/admin, token site mismatch, admin site access denied, inactive game provider.
- `404`: route not found, site not found, member/deposit/withdraw/bank account/promotion not found.
- `409`: no confirmed route currently returns `409`; duplicate/conflict behavior currently maps to `400`.
- `500`: should not occur for expected validation and negative money-flow cases. Negative smoke treats 5xx as unsafe.

## 16. Mock / Sandbox Boundaries

- Game provider uses `MockGameProviderAdapter`.
- Payment/bank money flow is manual local approval through API and admin actions.
- Payment provider adapter is mock/skeleton only.
- Bank statement adapter is mock/skeleton only.
- SMS is a mock placeholder; no real SMS API is connected.
- Slip OCR is a mock placeholder; no real OCR API is connected.
- Lucky Wheel is mock/staging only; it stores demo spin/reward rows and never triggers real payout.
- No real provider/payment/bank/SMS/Slip OCR connection is allowed in these local flows.
- No production DB is allowed.
- Do not log or document real DB URLs, passwords, tokens, provider secrets, API keys, or raw provider payloads.
- RBAC controls admin API access only. It does not enable real provider, payment, bank, SMS, Slip OCR, or production credential flows.

## 17. Developer Notes

Run local API:

```bash
npm run dev
```

or:

```bash
npm run start
```

Run static/syntax check:

```bash
npm run check
```

Run all guarded local smoke tests after the backend is running and the environment targets a safe local/test DB:

```bash
npm run smoke:all-local
```

Run Lucky Wheel smoke only:

```bash
npm run smoke:wheel
```

Reference:

- Main runbook: `README.md`, section `Dev/Test Runbook`
- Local money-flow details: `README.md`, section `Local Money-Flow Smoke Test`
- Core API smoke details: `README.md`, section `Local Core API Smoke Test`
- Financial negative smoke details: `README.md`, section `Local Financial Negative Smoke Test`
- Full smoke coverage index: `docs/SMOKE_COVERAGE.md`

Secret rules:

- Do not put real `.env` values in docs.
- Do not print DB URLs, JWT secrets, passwords, API keys, provider secrets, tokens, or auth headers.
- Do not connect real provider/payment/bank systems from local smoke or mock endpoints.
- Do not run migrations, seed, smoke, or safety tests against production.

## 18. Known Coverage Gaps

- Config POST/PUT endpoints are intentionally not covered by `smoke:admin-reports-config` because that smoke is read-only for config safety.
- Real provider integrations are not covered.
- Real payment and bank integrations are not covered.
- Admin work schedule static frontend is implemented at `/admin/work-schedules`; force-logout session handling is not implemented yet.
- Admin audit/security static frontend is implemented at `/admin/audit-security`; it is a backend-served static page and uses backend `reports.view` guard as the source of truth.
- Production deployment smoke is not covered.
- Full frontend end-to-end coverage is not covered.
- Lucky Wheel frontend Phaser integration and real payout claiming are not implemented. Reward Claims in this phase is a staging/mock admin queue for manual item handoff or cancellation only.
