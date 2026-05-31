# API Mapping

Phase AJ status: master API mapping for safe integration planning.

Safety boundary: docs/static only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, and no runtime write action is enabled here.

## Status Legend

| Status | Meaning |
| --- | --- |
| implemented | Route or behavior exists and is usable inside existing guards. |
| read-only implemented | Existing route is used only for safe display/query flows. |
| mock implemented | Existing flow is mock/static/sandbox-safe only. |
| static spec only | Contract is documented but not confirmed as implemented. |
| future guarded write | Write route requires auth, permission, validation, reason/audit, and safe environment gates. |
| future live integration | Requires certification before live use. |

## Mapping Table

| Module | Screen | Action | Method | Endpoint | Request summary | Response summary | Permission | Audit action | Current status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin auth | Login | Admin login | POST | `/api/admin/auth/login` | email/username, password, site context | admin token/session and admin profile | none before login | `admin.login.success`, `admin.login.failed`, `admin.login.blocked_outside_schedule` | implemented | Must redact password and fail closed outside work schedule. |
| Admin auth | Current admin | Read current admin | GET | `/api/admin/me` | Admin JWT | current admin profile, role, site access | authenticated admin | none | implemented | Read-only identity context. |
| Admin auth | Permissions | Read effective permissions | GET | `/api/admin/permissions/me` | Admin JWT | permission list for current admin | authenticated admin | none | implemented | UI visibility only; backend guards remain source of truth. |
| Admin members | Member list | Search/list members | GET | `/api/admin/members` | page, limit, search, status, date filters | member rows with safe profile/wallet/bank summary | `members.view` | none | read-only implemented | No member write action from list. |
| Admin member detail | Member detail | Read member detail | GET | `/api/admin/members/:id` | member id | member profile, wallet, banks, deposits, withdrawals | `members.view`, panel-specific read permissions | none | read-only implemented | No secrets or raw credentials. |
| Admin member history | History tabs | Read member history | GET | `/api/admin/members/:id/history` | member id, filters/page/limit | wallet/deposit/withdraw/promotion/game/wheel history payload | `members.history.view` and related read permissions | none | read-only implemented | Phase AH endpoint remains read-only; no provider live calls. |
| Admin audit logs | Audit logs | Search audit logs | GET | `/api/admin/audit-logs` | filters: action, target type/id, actor, date, status | sanitized audit rows | `audit.view` | none | read-only implemented | Use action + target filters for bank/member audit. |
| Admin audit logs | Audit summary | Audit summary | GET | `/api/admin/audit-logs/summary` | date/site filters | counts by action/result/risk | `audit.view` | none | read-only implemented | Read-only dashboard panel. |
| Admin security events | Security events | Search security events | GET | `/api/admin/security-events` | filters: actor, event, date, status | sanitized security event rows | `security.view` | none | read-only implemented | Used for login failures and schedule blocks. |
| Admin roles/permissions | Permission catalog | Read permission catalog | GET | `/api/admin/roles/permissions` | Admin JWT | grouped permission catalog | `admin.roles.view` | none | read-only implemented | Catalog display only. |
| Admin roles/permissions | Role catalog | Read roles | GET | `/api/admin/roles` | Admin JWT | role list and assigned permissions | `admin.roles.view` | none | read-only implemented | Role writes remain guarded. |
| Admin roles/permissions | Role update | Update role permissions | PATCH | `/api/admin/roles/:roleId/permissions` | permission ids, reason | updated role permission set | `admin.roles.update` | `admin.role.permissions.update` | future guarded write | Owner/super_admin only; reason and before/after snapshots required. |
| Work schedule | Schedule view | Read admin work schedule | GET | `/api/admin/work-schedules` | admin/site/date filters | schedule rows and override state | `admin.workSchedule.view` | none | read-only implemented | Supports login schedule controls. |
| Work schedule | Schedule update | Update schedule/override | PATCH | `/api/admin/work-schedules/:id` | schedule fields, override, reason | updated schedule | `admin.workSchedule.update` | `admin.schedule.update` | future guarded write | Must not weaken emergency guard without audit. |
| Bank module | Pending accounts | Read pending member bank accounts | GET | `/api/admin/bank-accounts/pending` | page, limit | pending member bank account rows with masked account numbers | `members.bank.view` | none | read-only implemented | No bank rail connection. |
| Bank module | Bank account approval | Approve member bank | POST | `/api/admin/bank-accounts/:id/approve` | bank account id, required reason | `{ id, status: "approved", auditAction: "member.bank.approve" }` | `members.bank.approve` | `member.bank.approve` | guarded write foundation | Local/staging/mock only; duplicate reviewed rows fail safely with `409`; no live bank action. |
| Bank module | Bank account reject | Reject member bank | POST | `/api/admin/bank-accounts/:id/reject` | bank account id, required reason | `{ id, status: "rejected", auditAction: "member.bank.reject" }` | `members.bank.approve` | `member.bank.reject` | guarded write foundation | Local/staging/mock only; duplicate reviewed rows fail safely with `409`; reason required. |
| Bank module | Site bank accounts | Read site bank config | GET | `/api/admin/sites/:id/bank-accounts` | site id | site bank account configs | `bank.view` | none | read-only implemented | Config only. |
| Bank module | Site bank manage | Create/update/disable site bank | POST/PUT/DELETE | `/api/admin/sites/:id/bank-accounts...` | bank config fields, reason | created/updated/disabled config | `bank.manage` | `site.bank_account.create/update/disable` | future guarded write | Does not connect to bank transfer rails. |
| Bank module | Deposit statement | Read mock deposit statements | GET | `/api/admin/bank/mock/statements/deposits` | date/account filters | mock statement rows | `bank.view` | none | mock implemented / Phase AK UI wired | Future live feed requires certification. |
| Bank module | Withdrawal statement | Read mock withdrawal statements | GET | `/api/admin/bank/mock/statements/withdrawals` | date/account filters | mock statement rows | `bank.view` | none | mock implemented / Phase AK UI wired | Future live feed requires certification. |
| Reports | Summary | Dashboard/report summary | GET | `/api/admin/reports/summary` | date/site filters | totals and counts | `dashboard.view`, `reports.view` | none | read-only implemented / Phase AK UI wired | Dashboard read-only. |
| Reports | Deposits | Deposit report | GET | `/api/admin/reports/deposits` | page, status, date filters | deposit rows/totals | `reports.view`, `deposits.view` | none | read-only implemented | Not production settlement evidence. |
| Reports | Withdrawals | Withdrawal report | GET | `/api/admin/reports/withdrawals` | page, status, date filters | withdrawal rows/totals | `reports.view`, `withdrawals.view` | none | read-only implemented | No live payout. |
| Reports | Wallet ledger | Wallet ledger report | GET | `/api/admin/reports/wallet-ledger` | user_id, type, date, page | wallet ledger rows | `wallet.view`, `reports.view` | none | read-only implemented / Phase AK UI wired | Used by member detail history and Phase AK ledger table. |
| Promotions | Public list | List active promotions | GET | `/api/promotions` | active/site filters | promotion rows | none/public | none | implemented | Public/member-facing read. |
| Promotions | Member claim | Claim promotion | POST | `/api/promotions/:id/claim` | promotion id, member JWT | claim result and turnover/wallet context | member self | promotion claim audit if implemented | future guarded write | Requires idempotency review before live-like use. |
| Promotions | Admin management | Create/update promotion | POST/PATCH | `/api/admin/promotions`, `/api/admin/promotions/:id` | promotion fields, reason | created/updated promotion | `promotions.manage` | `promotion.create/update` | static spec only | Admin CRUD contract still planned. |
| Deposits | Member deposit | Create manual deposit | POST | `/api/deposits` | amount, bank/reference/slip metadata | deposit request row | member self | `deposit.create` | future guarded write | Manual/mock only; no live payment rail. |
| Deposits | Member deposit history | Read deposits | GET | `/api/deposits` | page/status filters | member-owned deposit rows | member self | none | read-only implemented | Member-owned records only. |
| Deposits | Admin deposit list | Read admin deposits | GET | `/api/admin/deposits` | page/status/search/date | deposit rows | `deposits.view` | none | read-only implemented | Review queue. |
| Deposits | Admin approve deposit | Approve deposit | POST | `/api/admin/deposits/:id/approve` | deposit id, reason | updated deposit and wallet/ledger context | `deposits.approve` | `deposit.approve` | future guarded write | No live payment; reason/audit/idempotency required. |
| Withdrawals | Member withdrawal | Create withdrawal request | POST | `/api/withdrawals` | amount, bank account id | withdrawal request row | member self | withdrawal create audit if implemented | future guarded write | Manual/mock only; no live payout. |
| Withdrawals | Member withdrawal history | Read withdrawals | GET | `/api/withdrawals` | page/status filters | member-owned withdrawal rows | member self | none | read-only implemented | Member-owned records only. |
| Withdrawals | Admin withdrawals | Read admin withdrawals | GET | `/api/admin/withdrawals` | page/status/search/date | withdrawal rows | `withdrawals.view` | none | read-only implemented | Review queue. |
| Withdrawals | Admin approve withdrawal | Approve withdrawal | POST | `/api/admin/withdrawals/:id/approve` | withdrawal id, reason | approved withdrawal state | `withdrawals.approve` | `withdrawal.approve` | future guarded write | No self-approval; no live payout. |
| Withdrawals | Admin mark paid | Mark paid mock | POST | `/api/admin/withdrawals/:id/mark-paid` | withdrawal id, reason/reference | paid mock withdrawal state | `withdrawals.approve` | `withdrawal.mark_paid` | future guarded write | Must not trigger bank transfer. |
| Wallet ledger | Member wallet | Read wallet balance | GET | `/api/wallet` | member JWT | wallet balance | member self | none | read-only implemented | Display only. |
| Wallet ledger | Member points | Read points | GET | `/api/points` | member JWT | point balance | member self | none | read-only implemented | Points only. |
| Wallet ledger | Member ledger | Read member ledger | GET | `/api/wallet/ledger` | page/type filters | member-owned ledger rows | member self | none | read-only implemented | Not production settlement proof. |
| Wallet ledger | Admin credit | Add/remove credit | POST | `/api/admin/members/:id/credit/add`, `/api/admin/members/:id/credit/remove` | member id, amount, reason | wallet adjustment result | `wallet.adjust` | `wallet.adjust.credit`, `wallet.adjust.debit` | future guarded write | Requires dual control and no self-approval before live. |
| Lucky Wheel | Member config | Read wheel config | GET | `/api/member/wheel/config` | campaign id optional | member-safe campaign/reward display | member self | none | mock implemented | No admin-only odds exposure. |
| Lucky Wheel | Member spin | Spin wheel | POST | `/api/member/wheel/spin` | campaign id only | backend-selected result | member self | wheel spin audit if implemented | mock implemented | Client must not submit prizeIndex/reward/result control. |
| Lucky Wheel | Member history | Read spin history | GET | `/api/member/wheel/history` | page/limit | member-owned spin rows | member self | none | read-only implemented | No live payout. |
| Lucky Wheel | Admin config | Read wheel config | GET | `/api/admin/wheel/config` | campaign id optional | campaign, rewards, summary | `wheel.view` | none | read-only implemented | Admin read-only surface. |
| Lucky Wheel | Admin campaign | Update campaign | PATCH | `/api/admin/wheel/campaign` | campaign fields, reason | updated campaign | `wheel.manage` | `wheel.campaign.update` | future guarded write | Reason required. |
| Lucky Wheel | Admin rewards | Create/update reward | POST/PATCH | `/api/admin/wheel/rewards`, `/api/admin/wheel/rewards/:id` | reward fields, reason | created/updated reward | `wheel.manage` | `wheel.reward.create/update` | future guarded write | No forced member result. |
| Frontend member auth | Login | Member login | POST | `/api/auth/login` | phone/username and password | member token/profile | none before login | member auth audit if implemented | implemented | Password must never be logged. |
| Frontend member auth | Register | Member register | POST | `/api/auth/register` | username, phone, password, referral/site | created member/session | none before register | member register audit if implemented | implemented | Registration bonus remains guarded/mock. |
| Frontend wallet/profile/history | Profile | Read self profile | GET | `/api/me` | member JWT | member profile | member self | none | read-only implemented | Member-owned data only. |
| Frontend wallet/profile/history | Bank accounts | List/create member bank | GET/POST | `/api/bank-accounts` | GET none; POST bank fields | member bank accounts or pending account | member self | member bank create audit if implemented | read-only implemented / future guarded write | Bank add does not connect bank rail. |
| Frontend wallet/profile/history | Combined history | Read combined history | GET | `/api/wallet/ledger`, `/api/deposits`, `/api/withdrawals` | filters/page/status | merged member-owned history client-side | member self | none | read-only implemented | Dedicated combined endpoint is static spec only. |
| Future game provider API | Provider list | List providers | GET | `/api/game/providers` | member JWT | provider rows | member self | none | mock implemented | Mock/sandbox only. |
| Future game provider API | Game list | List games | GET | `/api/game/providers/:provider/games` | provider id, filters | game rows | member self | none | mock implemented | Mock/sandbox only. |
| Future game provider API | Mock launch | Launch mock game | POST | `/api/game/launch/mock` | provider, game id, device | mock launch URL/session | member self | provider launch mock audit if implemented | mock implemented | Live launch requires certification. |
| Future game provider API | Mock transfer | Transfer in/out mock | POST | `/api/game/transfer-in/mock`, `/api/game/transfer-out/mock` | amount/reference | mock transfer result | member self | provider transfer mock audit if implemented | mock implemented | No live provider wallet. |
| Future game provider API | Live provider integration | Certified provider launch/transfer/callback | TBD | Future certified provider endpoints | signed requests, idempotency, callback verification | launch/session/transfer results | future provider permissions | `live_provider.config.update`, future provider callback audits | future live integration | Requires sandbox evidence, ledger certification, rollback, monitoring, and secret handling. |

## Integration Rules

- Every admin write must map to a permission and audit action before UI exposure.
- Every member money/reward-like write should include backend eligibility and idempotency.
- Every future live provider/payment/bank/SMS/Slip OCR route remains disabled until certification.
- This document does not grant production readiness or live operation approval.
