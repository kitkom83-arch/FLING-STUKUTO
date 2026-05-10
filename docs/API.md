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
- `admin.schedule.view`
- `admin.schedule.update`
- `admin.schedule.override`

Current implementation uses existing schema:

- `Admin.role` stores the global role.
- `AdminSiteAccess.permissions` can store a JSON permission override for a site and `adminWorkSchedule` metadata for the admin work schedule guard.
- No new RBAC table or migration is required.

Permission failures return `403` with the standard error envelope and must not return `500`.

| Method | Path | Auth | Required role/access | Body fields | Response summary | Error cases | Admin log action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/admin/auth/login` | No | Active admin; work schedule guard for non-owner admins | `username`, `password` | token and public admin | `400` invalid credentials, `403` inactive admin or outside allowed work schedule | `admin.login.blocked_outside_schedule` when schedule blocks login |
| GET | `/admin/me` | Admin | Site access | None | public admin | `401`, `403` | None |
| GET | `/admin/permissions/me` | Admin | Site access | None | current role, permission list, owner flag, and source | `401`, `403` | None |
| GET | `/admin/permissions` | Admin | `admin.manage` | None | permission catalog | `401`, `403` | None |
| GET | `/admin/roles` | Admin | `admin.manage` | None | role catalog and permissions | `401`, `403` | None |
| GET | `/admin/admins/:id/permissions` | Admin | `admin.manage` | None | target admin public profile, effective role, permission list, owner flag, and source | `401`, `403`, `404` | None |
| PATCH | `/admin/admins/:id/role` | Admin | `admin.manage` | `role`, optional `permissions` array or `null` | assigned admin role and effective permissions | `400`, `401`, `403`, `404` | `admin.role.update` |
| GET | `/admin/work-schedules` | Admin | `admin.schedule.view` or `admin.manage` | None | list of site admin schedules with public admin summary, site access role, schedule, and summary | `401`, `403` | None |
| GET | `/admin/work-schedules/:adminId` | Admin | `admin.schedule.view` or `admin.manage` | None | target admin public profile, site id, schedule, and emergency override state | `401`, `403`, `404` | None |
| PATCH | `/admin/work-schedules/:adminId` | Admin | `admin.schedule.update` or `admin.manage` | schedule fields: `enabled`, `timezone`, `allowedDays`, `startTime`, `endTime`, `forceLogoutWhenScheduleEnds`, `idleTimeoutMinutes`, optional `emergencyOverride` | updated schedule | `400`, `401`, `403`, `404` | `admin.schedule.update`; also `admin.schedule.enable` or `admin.schedule.disable` on enabled-state changes |
| POST | `/admin/work-schedules/:adminId/override` | Admin | `admin.schedule.override` or `admin.manage` | `expiresAt`, `reason` | active emergency override inside schedule response | `400`, `401`, `403`, `404` | `admin.schedule.override_enable` |
| DELETE | `/admin/work-schedules/:adminId/override` | Admin | `admin.schedule.override` or `admin.manage` | optional `reason` | disabled emergency override inside schedule response | `400`, `401`, `403`, `404` | `admin.schedule.override_disable` |
| GET | `/admin/work-schedules/:adminId/audit-logs` | Admin | `admin.schedule.view` or `admin.manage` | None | schedule/override/login-block audit history for the target admin | `401`, `403`, `404` | None |
| GET | `/admin/logs` | Admin | `reports.view` | None | admin logs with admin summary | `401`, `403` | None |
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

## 11. Safety / Negative Contract

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

## 12. Smoke Test Coverage Map

| Command | What it checks | Needs running API | Needs local DB | GitHub Actions status |
| --- | --- | --- | --- | --- |
| `npm run smoke:money-flow` | Health, admin login, member register, bank approval, deposit approve, duplicate deposit guard, withdrawal approve, duplicate withdrawal guard, mark-paid guard, wallet final balance, ledger rows, admin logs | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:core-api` | Health, auth guards, member register/login/me/wallet/points/ledger, promotions list, game providers/games/mock launch, admin login/me/logs/members/deposits/withdrawals, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:financial-negative` | Unauth 401s, invalid deposit/withdraw amounts, over-balance withdrawal, duplicate approve/mark-paid guards, ledger safety, admin log checks, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:promotion-claim` | Health, unauth promotion claim guard, promotion list, local promotion fixture, successful claim, duplicate claim guard, invalid promotion id guard, `PromotionClaim` and `TurnoverRequirement` count guards, wallet/ledger effect guard, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:game-transfer` | Health, auth negatives for transfer-in/transfer-out/bet-history, member login, mock provider/game fixtures, transfer-in debit, transfer-out credit, final wallet balance, ledger rows, bet-history row shape, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-reports-config` | Health, public site config, admin auth negatives, admin login, read-only report endpoints, read-only site/config endpoints, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:admin-work-schedule` | Health, schedule auth guards, owner schedule list/update/read/override, invalid time validation, login schedule block/allow, expired override, overnight shift helper, audit logs, response leak scan | Yes | Yes | Syntax checked only in Safe CI |
| `npm run smoke:all-local` | Guarded sequence: smoke syntax checks, `npm run check`, promotion-claim, money-flow, core-api, game-transfer, financial-negative, admin-reports-config, admin work schedule, secret grep, diff whitespace check | Yes | Yes | Not run in Safe CI because it needs a running API and local DB |
| GitHub Actions Safe CI | `npm ci`, Prisma validate/generate, `npm run check`, local smoke syntax checks, secret-shaped value scan | No | No real DB connection for smoke | Runs on push and PR |

GitHub Actions does not run DB-backed local smoke flows because those require a running local API and safe local/test PostgreSQL fixture setup.

## 13. Error Status Contract

Status codes verified from code:

- `200`: normal success.
- `201`: successful create/register/claim where controller passes `201`.
- `400`: validation errors, invalid credentials, invalid amount, insufficient balance, duplicate approval/state transition, Prisma duplicate data (`P2002` maps to `400`).
- `401`: missing/invalid auth for protected member/admin endpoints.
- `403`: blocked member/admin, token site mismatch, admin site access denied, inactive game provider.
- `404`: route not found, site not found, member/deposit/withdraw/bank account/promotion not found.
- `409`: no confirmed route currently returns `409`; duplicate/conflict behavior currently maps to `400`.
- `500`: should not occur for expected validation and negative money-flow cases. Negative smoke treats 5xx as unsafe.

## 14. Mock / Sandbox Boundaries

- Game provider uses `MockGameProviderAdapter`.
- Payment/bank money flow is manual local approval through API and admin actions.
- Payment provider adapter is mock/skeleton only.
- Bank statement adapter is mock/skeleton only.
- SMS is a mock placeholder; no real SMS API is connected.
- Slip OCR is a mock placeholder; no real OCR API is connected.
- No real provider/payment/bank/SMS/Slip OCR connection is allowed in these local flows.
- No production DB is allowed.
- Do not log or document real DB URLs, passwords, tokens, provider secrets, API keys, or raw provider payloads.
- RBAC controls admin API access only. It does not enable real provider, payment, bank, SMS, Slip OCR, or production credential flows.

## 15. Developer Notes

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

## 16. Known Coverage Gaps

- Config POST/PUT endpoints are intentionally not covered by `smoke:admin-reports-config` because that smoke is read-only for config safety.
- Real provider integrations are not covered.
- Real payment and bank integrations are not covered.
- Admin work schedule frontend and force-logout session handling are not implemented yet; the backend login guard and management API are implemented.
- Production deployment smoke is not covered.
- Full frontend end-to-end coverage is not covered.
