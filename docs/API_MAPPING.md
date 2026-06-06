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
| Admin audit logs | Audit logs | Search audit logs | GET | `/api/admin/audit-logs` | filters: action, target type/id, actor, date, status | sanitized audit rows | `admin.audit.view` | none | read-only implemented | Use action + target filters for bank/member audit. |
| Admin audit logs | Audit summary | Audit summary | GET | `/api/admin/audit-logs/summary` | date/site filters | counts by action/result/risk | `admin.audit.view` | none | read-only implemented | Read-only dashboard panel. |
| Admin security events | Security events | Search security events | GET | `/api/admin/security-events` | filters: actor, event, date, status | sanitized security event rows | `security.view` | none | read-only implemented | Used for login failures and schedule blocks. |
| Admin roles/permissions | Permission catalog | Read permission catalog | GET | `/api/admin/roles/permissions` | Admin JWT | grouped permission catalog | `admin.roles.view` | none | read-only implemented | Catalog display only. |
| Admin roles/permissions | Role catalog | Read roles | GET | `/api/admin/roles` | Admin JWT | role list and assigned permissions | `admin.roles.view` | none | read-only implemented | Role writes remain guarded. |
| Admin roles/permissions | Role update | Update role permissions | PATCH | `/api/admin/roles/:roleId/permissions` | permission ids, reason | updated role permission set | `admin.roles.update` | `admin.role.permissions.update` | future guarded write | Owner/super_admin only; reason and before/after snapshots required. |
| Work schedule | Schedule view | Read admin work schedule | GET | `/api/admin/work-schedules` | admin/site/date filters | schedule rows and override state | `admin.workSchedule.view` | none | read-only implemented | Supports login schedule controls. |
| Work schedule | Schedule update | Update schedule/override | PATCH | `/api/admin/work-schedules/:id` | schedule fields, override, reason | updated schedule | `admin.workSchedule.update` | `admin.schedule.update` | future guarded write | Must not weaken emergency guard without audit. |
| Bank module | Pending accounts | Read pending member bank accounts | GET | `/api/admin/bank-accounts/pending` | page, limit | pending member bank account rows with masked account numbers | `members.bank.view` | none | read-only implemented | No bank rail connection. |
| Bank module | Bank account approval | Approve member bank | POST | `/api/admin/bank-accounts/:id/approve` | bank account id, required reason | `{ id, status: "approved", auditAction: "member.bank.approve" }` | `members.bank.approve` | `member.bank.approve` | guarded write foundation | Local/staging/mock only; duplicate reviewed rows fail safely with `409`; no live bank action. |
| Bank module | Bank account reject | Reject member bank | POST | `/api/admin/bank-accounts/:id/reject` | bank account id, required reason | `{ id, status: "rejected", auditAction: "member.bank.reject" }` | `members.bank.approve` | `member.bank.reject` | guarded write foundation | Local/staging/mock only; duplicate reviewed rows fail safely with `409`; reason required. |
| Bank module | Bank account review audit | Read approve/reject review history | GET | `/api/admin/audit-logs?action=member.bank.approve|member.bank.reject&target_type=user_bank_account` | action, username/search, target id, date range, limit | sanitized audit rows with actor, target, previousStatus, nextStatus, reason, createdAt, and siteCode | `admin.audit.view` | none | read-only operator handoff | Phase AM Admin Bank Account Review Audit & Operator Handoff; duplicate reviewed remains safe `409` in write flow; read-only endpoint never changes bank status. |
| Bank module | Bank account review release pack | UAT checklist and operator handoff docs | docs/static | `docs/ADMIN_BANK_ACCOUNT_REVIEW_UAT_CHECKLIST.md`, `docs/ADMIN_BANK_ACCOUNT_REVIEW_OPERATOR_RUNBOOK.md`, `docs/ADMIN_BANK_ACCOUNT_REVIEW_RELEASE_PACK.md` | release scope, validation commands, manual browser checklist, rollback notes, go/no-go checklist | `members.bank.view`, `members.bank.approve`, `admin.audit.view` | `member.bank.approve`, `member.bank.reject` | release pack / UAT checklist | Phase AN Admin Bank Account Review Release Pack / UAT Checklist; no endpoint, migration, deploy, production DB, real money, live integration, credit/debit, payout, or new runtime write action. |
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

## Future Payment Provider Contract Mapping

Status: Phase AO Payment Provider Contract / Dual TrueMoney Provider is contract/mock only. It builds on the Payment Provider Roadmap: Dual TrueMoney + QR Gateway + Bank Verification backlog and still does not add runtime endpoints, migrations, deploy, production DB, real money, live provider/payment/bank/SMS/Slip OCR, credit/debit runtime action, payout, withdrawal approve, or runtime money-flow changes.

Safety markers: mock/sandbox/staging only; no production DB; no real money; no live provider/payment/bank/SMS/Slip OCR; no credit/debit runtime action in this phase; no payout; no withdrawal approve; no migration; no deploy; no hardcoded secret/token/password/DATABASE_URL; SMS fallback is manual_review only; frontend must not decide credit posting; provider event must pass idempotency + audit + reconciliation guard before future credit posting.

| provider key | provider type | current phase status | future endpoints | safety |
| --- | --- | --- | --- | --- |
| `truemoney_official` | TrueMoney Official / Partner Gateway | backlog/mock only | create order, callback, inquiry | official long-term route; orderId/refId mapping, duplicate transaction guard, idempotency key, audit log, secret redaction, no hardcoded credential, no live |
| `tmnone` | TMNOne | backlog/mock only | balance, transaction history, transaction info | second TrueMoney rail; deposit/receive matching, per-user/per-transaction/daily limits, role approval, audit log, duplicate lock, configurable limit, no live secret, no live transfer/withdrawal now |
| `qr_payment_gateway` | QR Payment / Gateway | backlog/mock only | generate QR, callback, inquiry | QR expiration, status, reconciliation, QR download UX, one-device mobile flow, copy amount/reference, upload slip fallback |
| `slip_verification` | Bank Slip Verification | backlog/mock only | verify slip | check reference, amount, receiver account, transfer time, duplicate slip guard, manual_review if uncertain, no auto-credit on low confidence |
| `bank_statement` | Statement API | backlog/mock only | fetch statement | normalize bank transaction, match deposit order, unmatched queue, duplicate guard, daily reconciliation, read-only/sandbox, no production bank account |
| `bank_sms_fallback` | SMS fallback | backlog/manual_review only | receive SMS signal | internal receiver device only, no customer SMS, no OTP, allowlist sender/receiver, raw SMS hash duplicate guard, redact sensitive text, `sms_detected -> manual_review`, no auto-credit |
| `manual_admin` | Manual fallback | backlog only | manual review | provider/callback/statement/slip failure path only, reason + audit, admin_id, before/after balance, future dual control, no hidden credit adjustment |

Phase AO smoke coverage: `smoke:payment-provider-contract` checks provider keys, docs, mock-only harness, duplicate guard, SMS fallback manual_review, no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no payout, and no secret-shaped values.

## Future Member QR Deposit UX Mapping

Status: Phase AP mock/static only. These rows define member QR deposit UX / Mock QR Download contracts for `providerKey = qr_payment_gateway`. They do not add runtime endpoints, production DB access, real money, real QR, live provider, payout, migration, deploy, credit/debit runtime action, or auto-credit from QR download.

| area | future endpoint | method | current phase | providerKey | safety |
| --- | --- | --- | --- | --- | --- |
| create QR deposit order | `/api/member/deposits/qr-orders` | POST | Phase AP mock/static only | `qr_payment_gateway` | no real QR; no real payment; no auto-credit; no live provider |
| get QR deposit order status | `/api/member/deposits/qr-orders/:orderId` | GET | Phase AP mock/static only | `qr_payment_gateway` | no real QR; no real payment; no auto-credit; no live provider |
| download mock QR | `/api/member/deposits/qr-orders/:orderId/download` | GET | Phase AP mock/static only | `qr_payment_gateway` | no real QR; no real payment; no auto-credit; no live provider |
| expire QR order | `/api/member/deposits/qr-orders/:orderId/expire` | POST | Phase AP mock/static only | `qr_payment_gateway` | no real QR; no real payment; no auto-credit; no live provider |
| cancel QR order | `/api/member/deposits/qr-orders/:orderId/cancel` | POST | Phase AP mock/static only | `qr_payment_gateway` | no real QR; no real payment; no auto-credit; no live provider |

## Integration Rules

- Every admin write must map to a permission and audit action before UI exposure.
- Every member money/reward-like write should include backend eligibility and idempotency.
- Every future live provider/payment/bank/SMS/Slip OCR route remains disabled until certification.
- This document does not grant production readiness or live operation approval.

## Future Deposit Verification Source Mapping

Status: Phase AQ Deposit Verification Source Mock Harness is mock/static only. It builds on Phase AO provider source contracts and Phase AP QR mock order contracts. It does not add runtime endpoints, production DB access, real money, real QR, live provider/payment/bank/SMS/Slip OCR, payout, migration, deploy, credit/debit runtime action, runtime money-flow, or auto-credit from verification source.

| area | future endpoint | method | current phase | source type | safety |
| --- | --- | --- | --- | --- | --- |
| create verification source | `/api/member/deposits/verification-sources` | POST | Phase AQ mock/static only | `qr_mock_order`, `payment_provider_mock_event`, `slip_verification_mock`, `bank_statement_mock`, `bank_sms_fallback_mock`, `manual_admin_mock` | no real QR; no real payment; no auto-credit; no live provider |
| get verification source | `/api/member/deposits/verification-sources/:sourceId` | GET | Phase AQ mock/static only | all mock source types | no real QR; no real payment; no auto-credit; no live provider |
| match verification source | `/api/member/deposits/verification-sources/:sourceId/match` | POST | Phase AQ mock/static only | provider, slip, statement mock sources | no real QR; no real payment; no auto-credit; no live provider |
| manual review verification source | `/api/admin/deposits/verification-sources/:sourceId/manual-review` | POST | Phase AQ mock/static only | `bank_sms_fallback_mock`, uncertain slip, unmatched statement, manual admin | no real QR; no real payment; no auto-credit; no live provider |
| reject verification source | `/api/admin/deposits/verification-sources/:sourceId/reject` | POST | Phase AQ mock/static only | duplicate or failed mock source | no real QR; no real payment; no auto-credit; no live provider |
| duplicate guard verification source | `/api/admin/deposits/verification-sources/:sourceId/duplicate-guard` | POST | Phase AQ mock/static only | duplicate `orderId`, `providerTransactionId`, or `rawHash` | no real QR; no real payment; no auto-credit; no live provider |

## Future Deposit Ledger/Reconciliation Guard Mapping

Status: Phase AR mock/static only. These rows define Ledger/Reconciliation Guard contracts after Phase AQ source verification. They do not add runtime endpoints, production DB access, real money, real QR, live provider/payment/bank/SMS/Slip OCR, payout, migration, deploy, credit/debit runtime action, ledger posting runtime action, runtime money-flow, or auto-credit.

| area | future endpoint | method | current phase | guard output | safety |
| --- | --- | --- | --- | --- | --- |
| evaluate ledger guard | `/api/admin/deposits/ledger-guard/evaluate` | POST | Phase AR mock/static only | `ledger_posting_candidate_mock`, `manual_review_required`, `no_action`, `reject` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |
| build reconciliation snapshot | `/api/admin/deposits/ledger-guard/reconciliation/:sourceId` | GET | Phase AR mock/static only | `reconciled_mock`, `unreconciled_mock`, `pending_review_mock` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |
| detect reconciliation mismatch | `/api/admin/deposits/ledger-guard/evaluate` | POST | Phase AR mock/static only | `mismatch_review_required` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |
| mark duplicate suspect | `/api/admin/deposits/ledger-guard/evaluate` | POST | Phase AR mock/static only | `duplicate_suspect` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |
| manual review ledger guard | `/api/admin/deposits/ledger-guard/:sourceId/manual-review` | POST | Phase AR mock/static only | `manual_review_required` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |
| reject ledger guard candidate | `/api/admin/deposits/ledger-guard/:sourceId/manual-review` | POST | Phase AR mock/static only | `reject` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no live provider |

## Future Sandbox Integration Readiness Mapping

Status: Phase AS mock/static/sandbox-readiness only. These rows define future sandbox integration readiness contracts after Phase AO/AP/AQ/AR. They do not add runtime endpoints, production DB access, real money, real QR, live provider/payment/bank/SMS/Slip OCR, payout, migration, deploy, auto-credit, ledger posting runtime action, runtime money-flow, or external network execution in Phase AS.

| area | future endpoint | method | current phase | provider mode | safety |
| --- | --- | --- | --- | --- | --- |
| provider readiness check | `/api/admin/sandbox/providers/:providerKey/readiness` | GET | Phase AS mock/static/sandbox-readiness only | `mock`, `sandbox_configured_not_called` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| sandbox dry-run request | `/api/admin/sandbox/providers/:providerKey/dry-run` | POST | Phase AS mock/static/sandbox-readiness only | `sandbox_dry_run_only` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| sandbox dry-run response | `/api/admin/sandbox/providers/:providerKey/dry-run` | POST | Phase AS mock/static/sandbox-readiness only | `sandbox_dry_run_only` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| callback payload validation | `/api/admin/sandbox/callbacks/:providerKey/validate` | POST | Phase AS mock/static/sandbox-readiness only | `mock` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| webhook contract validation | `/api/admin/sandbox/callbacks/:providerKey/validate` | POST | Phase AS mock/static/sandbox-readiness only | `mock` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| sandbox reconciliation handoff | `/api/admin/sandbox/providers/:providerKey/readiness` | GET | Phase AS mock/static/sandbox-readiness only | `mock` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |
| sandbox ledger guard handoff | `/api/admin/sandbox/providers/:providerKey/dry-run` | POST | Phase AS mock/static/sandbox-readiness only | `mock` | no real QR; no real payment; no auto-credit; no ledger posting runtime action; no external network in Phase AS; no live provider |

## Future OroPlay API Mapping

Status: ORO-2B fail-closed callback stub only remains the active runtime behavior, ORO-2C readiness contract is closed, ORO-3A runtime simulation closed, ORO-3B adapter contract is closed, ORO-3C execution plan only is closed, ORO-3D readiness gate only is closed, ORO-4Q mount authorization hold gate is closed, ORO-4R private artifact hash registry is closed, ORO-4S signed approval record / mount authorization request preparation boundary is closed, ORO-4T request submission review boundary is closed, ORO-4U final pre-mount decision boundary is closed, ORO-4V route mount approval boundary is closed, ORO-4W implementation approval readiness is closed, ORO-4X implementation approval decision is closed, ORO-4Y execution approval readiness is closed, ORO-4Z patch review decision is closed, ORO-5A execution approval request is closed, ORO-5B execution decision is closed, ORO-5C implementation request is closed, ORO-5D implementation decision is closed, ORO-5E actual patch approval request is closed, ORO-5F actual patch approval decision is closed, ORO-5G actual patch authorization request is closed, ORO-5H actual patch authorization decision is closed, ORO-5I actual patch implementation execution readiness is closed, ORO-5J actual patch implementation execution is closed, ORO-5K post-execution validation route mount authorization request readiness is closed, ORO-5L route mount authorization request submission is closed, ORO-5M route mount authorization decision is closed, ORO-5N route mount implementation boundary is closed, ORO-5O post-mount validation boundary is closed, ORO-5P post-mount validation decision boundary is closed, ORO-5Q public alias authorization request submission boundary is closed, ORO-5R public alias authorization decision boundary is closed, and ORO-5S public alias implementation boundary is current/local pending for OroPlay API / Seamless Wallet integration. These rows are not production runtime and do not add callback processing, services, migrations, deploy, production DB access, real money runtime flow, live payout, live provider calls, callback wallet mutation, runtime wallet mutation, runtime ledger mutation, Prisma write, provider alias enablement, or hardcoded secrets.

ORO-2B fail-closed stub only.

ORO-3A runtime simulation only; not production runtime; no alias enabled.

ORO-2B fail-closed route exists. ORO-2C readiness contract closed. ORO-3A runtime simulation closed. ORO-3B adapter contract only. ORO-3B adapter contract closed. ORO-3C execution plan only. ORO-3C execution plan closed. ORO-3D readiness gate only; not production runtime; no alias enabled; no runtime wallet/ledger mutation; runtime gate closed.

ORO-2B fail-closed route exists. ORO-2C readiness contract closed. ORO-3A runtime simulation closed. ORO-3B adapter contract closed. ORO-3C execution plan closed. ORO-3D readiness gate closed. ORO-3E design freeze / staging-only activation plan only; not production runtime; no alias enabled; no runtime wallet/ledger mutation; staging-only activation disabled by default.

ORO-3E callback endpoint mapping:

- `/api/oroplay/balance`: ORO-2B fail-closed route exists; ORO-2C readiness contract closed; ORO-3A runtime simulation closed; ORO-3B adapter contract closed; ORO-3C execution plan closed; ORO-3D readiness gate closed; ORO-3E design freeze / staging-only activation plan only; not production runtime; no alias enabled; no runtime wallet/ledger mutation; staging-only activation disabled by default.
- `/api/oroplay/transaction`: ORO-2B fail-closed route exists; ORO-2C readiness contract closed; ORO-3A runtime simulation closed; ORO-3B adapter contract closed; ORO-3C execution plan closed; ORO-3D readiness gate closed; ORO-3E design freeze / staging-only activation plan only; not production runtime; no alias enabled; no runtime wallet/ledger mutation; staging-only activation disabled by default.
- `/api/balance` and `/api/transaction`: no alias enabled; not production runtime; staging-only activation disabled by default; no runtime wallet/ledger mutation.

Safety markers: mock/static/staging-only planning; future live integration requires explicit certification. Current production direction is Seamless Wallet unless confirmed otherwise. Provider credential handling must remain internal service only and env-only.

| area | future endpoint or service | method | current phase | integration mode | safety |
| --- | --- | --- | --- | --- | --- |
| Provider status check | `/api/oroplay/status` or admin-only service action | GET or internal service | ORO-0 docs/static only | future live integration planning | status only; no secret display; no live call in ORO-0 |
| Provider credential exchange | internal service only, not public member endpoint | internal | ORO-0 docs/static only | future live integration planning | env-only credential; no public credential route |
| Vendor list sync | internal provider sync service | internal | ORO-0 docs/static only | future live integration planning | staging/mock first; sanitized logs |
| Game list sync | internal provider sync service | internal | ORO-0 docs/static only | future live integration planning | staging/mock first; no member wallet mutation |
| Game detail sync | internal provider sync service | internal | ORO-0 docs/static only | future live integration planning | staging/mock first; no secret response fields |
| Launch URL service | internal launch service for member game entry | internal or guarded member action | ORO-0 docs/static only | future live integration planning | no live launch until certification; launch URL must not be logged raw |
| Betting history sync | internal reconciliation service | internal | ORO-0 docs/static only | future live integration planning | reconciliation only; wallet ledger remains source of truth |
| Callback balance endpoint | `/api/oroplay/balance` | POST | ORO-4Q hold gate only; route remains not mounted and not authorized for mount | Seamless Wallet callback planning | Not production runtime; no active route mount from ORO-4Q; no production DB; no real money; no wallet mutation; no ledger mutation; no runtime wallet/ledger mutation; no live OroPlay API; no external network; no public alias |
| Callback transaction endpoint | `/api/oroplay/transaction` | POST | ORO-4Q hold gate only; route remains not mounted and not authorized for mount | Seamless Wallet callback planning | Not production runtime; no active route mount from ORO-4Q; no production DB; no real money; no wallet mutation; no ledger mutation; no runtime wallet/ledger mutation; no auto-credit; no live OroPlay API; no public alias |
| Optional callback balance alias | `/api/balance` | POST | ORO-4Q hold gate only; no public alias | Seamless Wallet callback planning | Disabled; no public alias; provider-required-only future decision; not production runtime; no production DB; no real money; no wallet mutation; no ledger mutation; no runtime wallet/ledger mutation; not authorized for mount |
| Optional callback transaction alias | `/api/transaction` | POST | ORO-4Q hold gate only; no public alias | Seamless Wallet callback planning | Disabled; no public alias; provider-required-only future decision; not production runtime; no production DB; no real money; no wallet mutation; no ledger mutation; no runtime wallet/ledger mutation; no auto-credit; not authorized for mount |

ORO-4A callback runtime implementation skeleton: disabled-by-default runtime gate, intent-only runtime skeleton, not wired into live routes, not production runtime, no alias enabled, no runtime wallet/ledger mutation, no Prisma write, no live OroPlay API call, no external network, no production DB, and no real money.

ORO-4B callback staging wiring precheck: runtime skeleton certification and staging wiring precheck only; default state fail_closed; certified mock state staging_precheck_ready only; activationAllowed=false; runtimeWiredToLiveRoute=false; aliasBalanceEnabled=false; aliasTransactionEnabled=false; walletMutationAllowed=false; ledgerMutationAllowed=false; prismaWriteAllowed=false; externalNetworkAllowed=false; productionConfigTouched=false; no live route wiring, no public alias enablement, no production deploy, and no live provider call.

ORO-4C callback runtime shadow invocation: isolated mock shadow invocation harness only; default decision fail_closed; certified mock state shadow_ready_only only; activationAllowed=false; runtimeWiredToLiveRoute=false; aliasBalanceEnabled=false; aliasTransactionEnabled=false; walletMutationAllowed=false; ledgerMutationAllowed=false; prismaWriteAllowed=false; networkAllowed=false; no Express route wiring, no public alias enablement, no production DB, no real money, no live OroPlay API call, no external network, no Prisma write, no DB transaction, no deploy, no payout, and no auto-credit.

ORO-4D callback request/response envelope mapper: isolated mock mapper and shadow response contract only; default response behavior fail_closed; activationAllowed=false; runtimeWiredToLiveRoute=false; aliasBalanceEnabled=false; aliasTransactionEnabled=false; walletMutationAllowed=false; ledgerMutationAllowed=false; prismaWriteAllowed=false; externalNetworkAllowed=false; no Express route wiring, no public alias enablement, no production DB, no real money, no live OroPlay API call, no Prisma write, no DB transaction, no deploy, no payout, and no auto-credit.

ORO-4E callback controller facade dry-run: isolated mock direct-call facade only; mock auth decision only; default response behavior fail_closed; expressRouteWired=false; runtimeWiredToLiveRoute=false; aliasBalanceEnabled=false; aliasTransactionEnabled=false; walletMutationAllowed=false; ledgerMutationAllowed=false; prismaWriteAllowed=false; externalNetworkAllowed=false; activationAllowed=false; no Express route wiring, no `src/app.js` change, no public alias enablement, no production DB, no real money, no live OroPlay API call, no Prisma write, no DB transaction, no deploy, no payout, and no auto-credit.

ORO-4F callback staging route wiring design: staging route wiring design contract only; future staging-only paths `/api/oroplay/balance` and `/api/oroplay/transaction` are documented as future-only; public aliases `/api/balance` and `/api/transaction` remain disabled; expressRouteMounted=false; publicAliasMounted=false; runtimeWiredToLiveRoute=false; walletMutationAllowed=false; ledgerMutationAllowed=false; prismaWriteAllowed=false; externalNetworkAllowed=false; productionConfigTouched=false; activationAllowed=false; no Express route mount, no `src/app.js` change, no public alias enablement, no production DB, no real money, no live OroPlay API call, no Prisma write, no DB transaction, no deploy, no payout, and no auto-credit.

ORO-4G callback staging route preflight: mount readiness checklist only; route candidates `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` remain inactive, unmounted, non-public, and candidate-only; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no live route, no runtime mutation, no wallet mutation, no ledger mutation, no Prisma write, no external network, no live OroPlay API call, no migration, no deploy, and no real money. ORO-4G can return `BLOCKED` or `NOT_READY_TO_MOUNT`, but it cannot approve mount readiness.

ORO-4H callback staging route dry-run gate: dry-run gate only; route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no live route, no runtime traffic, no wallet mutation, no ledger mutation, no Prisma write, no external network, no live OroPlay API call, no migration, no deploy, and no real money. ORO-4H can return `DRY_RUN_GATE_PASS` or `BLOCKED`, while mount and public alias status remain `MOUNT_BLOCKED_BY_PHASE` and `PUBLIC_ALIAS_BLOCKED_BY_PHASE`.

ORO-4I callback staging route internal shadow harness: internal shadow harness only; route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; direct-call shadow invocation uses a static route descriptor and sanitized trace only; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no active route, no HTTP listener, no runtime traffic, no external network, no live OroPlay API call, no wallet mutation, no ledger mutation, no Prisma write, no DB transaction, no side effect, no migration, no deploy, and no real money. ORO-4I can return `INTERNAL_SHADOW_PASS` or `BLOCKED`, while mount and public alias status remain `MOUNT_BLOCKED_BY_PHASE` and `PUBLIC_ALIAS_BLOCKED_BY_PHASE`.

ORO-4J callback staging route mount decision readiness gate: static/mock mount decision gate only; reviews the ORO-4I internal shadow harness, ORO-4H dry-run gate evidence, static route descriptor, sanitized trace boundary, and no-side-effect safety checklist. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no active route, no HTTP listener, no runtime traffic, no external network, no live OroPlay API call, no wallet mutation, no ledger mutation, no Prisma write, no DB transaction, no migration, no deploy, and no real money. ORO-4J can return static/mock gate `PASS`, but mount decision remains `manual_review_required` or blocked; it does not approve mount or live traffic.

ORO-4K callback staging route human mount review evidence pack: static/mock human mount review evidence pack only; combines ORO-4F route wiring design, ORO-4G mount preflight, ORO-4H dry-run gate, ORO-4I internal shadow harness, and ORO-4J mount decision readiness gate evidence for human review. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no active route, no public alias, no HTTP listener, no runtime traffic, no external network, no live OroPlay API call, no wallet mutation, no ledger mutation, no Prisma write, no DB transaction, no migration, no deploy, and no real money. ORO-4K can return `evidencePackResult=PASS`, but `mountApproval` remains `pending_human_approval`; a later phase requires separate approval.

ORO-4L callback staging route human approval record / pre-mount authorization boundary: static/mock human approval record template and pre-mount authorization boundary only; uses ORO-4K evidence pack output as an input but keeps signed authorization absent. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no active route, no public alias, no actual mount authorization, no HTTP listener, no runtime traffic, no external network, no live OroPlay API call, no wallet mutation, no ledger mutation, no Prisma write, no DB transaction, no migration, no deploy, and no real money. ORO-4L can return `authorizationBoundaryResult=PASS`, but `preMountAuthorization` remains `pending_manual_authorization`; the next phase requires separate explicit authorization.

ORO-4M callback staging route signed approval intake gate: static/mock signed approval intake gate only; uses the ORO-4L approval record template as an input but keeps no actual signed approval record, no signed approval verification, and no route mount authorization. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no Express mount, no `src/app.js` change, no active route, no public alias, no actual signed approval record, no route mount authorization, no HTTP listener, no runtime traffic, no external network, no live OroPlay API call, no wallet mutation, no ledger mutation, no Prisma write, no DB transaction, no migration, no deploy, and no real money. ORO-4M can return `signedApprovalIntakeGateResult=PASS`, but `preMountAuthorization` remains `pending_signed_approval_record` and `routeMountAuthorization` remains `not_authorized_for_mount`.

ORO-4N callback staging route signed approval record review mount authorization request boundary: ORO-4N request boundary only; uses ORO-4M as input but keeps no actual signed approval record, no signed approval verification, no submitted mount authorization request, and no route mount authorization. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` and are not authorized for mount. Public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no public alias is enabled. ORO-4N can return `signedApprovalRecordReviewBoundaryResult=PASS`, but `mountAuthorizationRequestStatus` remains `request_pack_prepared_pending_actual_signed_record`, `mountAuthorizationRequestSubmitted=false`, `preMountAuthorization=pending_signed_approval_record`, and `routeMountAuthorization=not_authorized_for_mount`.

ORO-4O callback staging route signed approval artifact intake pre-mount evidence boundary: ORO-4O artifact intake / evidence boundary only; uses ORO-4N as input but keeps no actual signed approval record, no actual signed approval artifact, no signed approval artifact acceptance, no signed approval artifact verification, no submitted mount authorization evidence pack, no submitted mount authorization request, and no route mount authorization. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` and are not authorized for mount. Public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no public alias is enabled. ORO-4O can return `signedApprovalArtifactIntakeBoundaryResult=PASS`, but `mountAuthorizationEvidenceStatus` remains `evidence_pack_prepared_pending_actual_signed_approval_artifact`, `mountAuthorizationEvidencePackSubmitted=false`, `mountAuthorizationRequestSubmitted=false`, `preMountAuthorization=pending_actual_signed_approval_artifact`, and `routeMountAuthorization=not_authorized_for_mount`.

ORO-4P callback staging route signed approval artifact acceptance review final pre-mount authorization decision boundary: ORO-4P acceptance review / decision boundary only; uses ORO-4O as input but keeps no actual signed approval record, no actual signed approval artifact, no signed approval artifact acceptance, no signed approval artifact verification, no issued final pre-mount authorization decision, no submitted mount authorization evidence pack, no submitted mount authorization request, and no route mount authorization. Route candidates remain inactive for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` and are not authorized for mount. Public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no public alias is enabled. ORO-4P can return `signedApprovalArtifactAcceptanceReviewBoundaryResult=PASS`, but `acceptanceReviewStatus` remains `review_boundary_passed_pending_actual_signed_approval_artifact`, `finalPreMountAuthorizationDecisionStatus` remains `decision_pack_prepared_pending_actual_signed_approval_artifact`, `finalPreMountAuthorizationDecisionIssued=false`, `expressMountAllowed=false`, `publicAliasAllowed=false`, `runtimeTrafficAllowed=false`, `preMountAuthorization=pending_actual_signed_approval_artifact`, and `routeMountAuthorization=not_authorized_for_mount`.

ORO-4Q callback staging route mount authorization hold gate: ORO-4Q mount authorization hold gate only; uses ORO-4P as input but keeps no actual signed approval artifact, no actual signed approval record, no signed approval artifact acceptance, no signed approval artifact verification, no issued final pre-mount authorization decision, no submitted mount authorization evidence pack, no submitted mount authorization request, and no route mount authorization. Route candidates remain inactive and not mounted for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`; they are not authorized for mount. Public aliases remain blocked for `POST /api/balance` and `POST /api/transaction`; no public alias is enabled. `/api/oroplay/balance` and `/api/oroplay/transaction` are still not mounted by ORO-4Q, and `/api/balance` and `/api/transaction` still have no public alias. ORO-4Q can return `mountAuthorizationHoldGateResult=PASS`, but `finalPreMountAuthorizationDecisionPrepared=true`, `finalPreMountAuthorizationDecisionIssued=false`, `actualSignedApprovalArtifactPresent=false`, `signedApprovalRecordPresent=false`, `mountAuthorizationEvidencePackSubmitted=false`, `mountAuthorizationRequestSubmitted=false`, `mountAuthorizationHoldActive=true`, `expressMountAllowed=false`, `publicAliasAllowed=false`, `runtimeTrafficAllowed=false`, `preMountAuthorization=pending_actual_signed_approval_artifact`, and `routeMountAuthorization=not_authorized_for_mount`.

ORO-4R callback staging route signed approval artifact private hash registry: ORO-4R registers private artifact hash chunks only; it records owner-provided sanitized private artifact metadata and SHA256 chunks for `PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf` without committing the PDF, signature, local private path, or full hash literal. ORO-4R removes only `missing_actual_signed_approval_artifact` and keeps `signedApprovalRecordPresent=false`, `finalPreMountAuthorizationDecisionIssued=false`, `mountAuthorizationRequestSubmitted=false`, and `routeMountAuthorization=not_authorized_for_mount`. Route candidates for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` remain not mounted and not authorized for mount. Public aliases for `POST /api/balance` and `POST /api/transaction` remain without public alias. ORO-4R does not open active route wiring, does not edit `src/app.js`, does not enable Express mount, public alias, runtime traffic, wallet mutation, ledger mutation, Prisma write, DB transaction, live OroPlay call, external network, migration, deploy, payout, auto-credit, or real money.

ORO-4S callback staging route signed approval record mount authorization request preparation boundary: ORO-4S creates signed approval record metadata from the ORO-4R private hash registry and prepares a mount authorization request draft only. ORO-4S removes `missing_signed_approval_record` but keeps `mountAuthorizationRequestSubmitted=false`, `finalPreMountAuthorizationDecisionIssued=false`, `routeMountAuthorization=not_authorized_for_mount`, `expressMountAllowed=false`, `publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. `/api/oroplay/balance` and `/api/oroplay/transaction` remain not mounted and not authorized for mount. `/api/balance` and `/api/transaction` still have no public alias. ORO-4S does not open active route wiring, does not edit `src/app.js`, does not submit mount authorization request, does not issue final pre-mount authorization, does not enable Express mount, public alias, runtime traffic, wallet mutation, ledger mutation, Prisma write, DB transaction, live OroPlay call, external network, migration, deploy, payout, auto-credit, or real money.

ORO-4T callback staging route mount authorization request submission final decision review boundary: ORO-4T creates static internal metadata only for the mount authorization request submission record and prepares final pre-mount decision review metadata. ORO-4T removes `mount_authorization_request_not_submitted` but keeps `finalPreMountAuthorizationDecisionIssued=false`, `routeMountAuthorization=not_authorized_for_mount`, `expressMountAllowed=false`, `publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. `/api/oroplay/balance` and `/api/oroplay/transaction` remain not mounted and not authorized for mount. `/api/balance` and `/api/transaction` still have no public alias. ORO-4T does not open active route wiring, does not edit `src/app.js`, does not perform external mount request submission, does not issue final pre-mount authorization, does not enable Express mount, public alias, runtime traffic, wallet mutation, ledger mutation, Prisma write, DB transaction, live OroPlay call, external network, migration, deploy, payout, auto-credit, or real money.

ORO-4U final pre-mount decision boundary: ORO-4U records the final decision as static/internal metadata only after the ORO-4T request submission record. It sets `finalPreMountAuthorizationDecisionIssued=true` only for internal metadata, while `routeMountAuthorization=not_authorized_for_mount`, `expressMountAllowed=false`, `publicAliasAllowed=false`, and `runtimeTrafficAllowed=false` remain unchanged. `/api/oroplay/balance` and `/api/oroplay/transaction` remain not mounted and not authorized for mount. `/api/balance` and `/api/transaction` still have no public alias. ORO-4U does not edit `src/app.js`, does not enable Express mount, public alias, runtime traffic, wallet mutation, ledger mutation, Prisma write, DB transaction, live OroPlay call, external network, migration, deploy, payout, auto-credit, or real money.

ORO-4V route mount approval boundary: ORO-4V records a separate approval boundary as static/internal metadata only after the ORO-4U final decision. It records approval boundary metadata but keeps `routeMountAuthorization=not_authorized_for_mount`, `expressMountAllowed=false`, `expressMountImplemented=false`, `publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. `/api/oroplay/balance` and `/api/oroplay/transaction` remain not mounted and not authorized for mount. `/api/balance` and `/api/transaction` still have no public alias. ORO-4V does not edit `src/app.js`, does not implement Express mount, does not enable runtime traffic, and requires a separate implementation phase before any actual route mount.

ORO-4W implementation approval readiness: ORO-4W separate implementation
approval gate records readiness for a future execution approval phase only.
ORO-4W separate implementation approval gate is static/internal metadata only.
It keeps `implementationApprovalReadinessRecorded=true`,
`implementationApprovalGranted=false`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresExplicitImplementationApproval=true`, and
`nextPhaseRequiresSeparateExecutionApproval=true`. ORO-4W does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, and does not authorize real route mount
execution.

ORO-4X implementation approval decision: ORO-4X execution still not authorized gate
records `implementationApprovalDecisionIssued=true` and
`implementationApprovalGranted=true` for static planning only. It keeps
`implementationApprovalScope=static_route_mount_implementation_planning_only`,
`implementationExecutionApproved=false`,
`routeMountExecutionAuthorization=not_authorized_for_execution`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresSeparateExecutionApproval=true`,
`nextPhaseRequiresRouteMountPatchReview=true`, and
`nextPhaseRequiresExplicitRuntimeTrafficApproval=true`. ORO-4X does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, and does not authorize route mount execution.

ORO-4Y execution approval readiness: ORO-4Y patch review preparation
records `executionApprovalReadinessRecorded=true`,
`executionApprovalGranted=false`, `routeMountPatchReviewPrepared=true`,
`routeMountPatchReviewed=false`, `routeMountPatchApproved=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`routeMountExecutionAuthorization=not_authorized_for_execution`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresExplicitExecutionApproval=true`,
`nextPhaseRequiresActualPatchImplementationApproval=true`, and
`nextPhaseRequiresSeparateRuntimeTrafficApproval=true`. ORO-4Y does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, and does not authorize route mount execution.

ORO-4Z patch review decision: ORO-4Z execution authorization hold records
`routeMountPatchReviewDecisionIssued=true`,
`routeMountPatchReviewPrepared=true`, `routeMountPatchReviewed=true`,
`routeMountPatchReviewResult=reviewed_ready_for_execution_approval_request_only`,
`routeMountPatchApproved=false`, `routeMountPatchImplemented=false`,
`executionApprovalGranted=false`, `implementationExecutionApproved=false`,
`routeMountExecutionAuthorization=not_authorized_for_execution`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresExplicitExecutionApproval=true`,
`nextPhaseRequiresActualPatchImplementationApproval=true`, and
`nextPhaseRequiresSeparateRuntimeTrafficApproval=true`. ORO-4Z does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, does not approve patch implementation, and
does not authorize route mount execution.

ORO-5A execution approval request: ORO-5A patch implementation hold records
`routeMountExecutionApprovalRequestSubmitted=true`,
`routeMountExecutionApprovalRequestStatus=submitted_pending_decision`,
`routeMountPatchReviewDecisionAcknowledged=true`,
`executionApprovalDecisionIssued=false`, `executionApprovalGranted=false`,
`routeMountPatchApproved=false`,
`routeMountPatchImplementationAuthorized=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`routeMountExecutionAuthorization=not_authorized_for_execution`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresFinalExecutionApprovalDecision=true`,
`nextPhaseRequiresActualPatchImplementationApproval=true`, and
`nextPhaseRequiresSeparateRuntimeTrafficApproval=true`. ORO-5A does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, does not approve patch implementation, does
not issue final execution approval decision, and does not authorize route mount
execution.

ORO-5B execution decision: ORO-5B implementation hold records
`routeMountExecutionApprovalRequestSubmitted=true`,
`routeMountExecutionApprovalRequestStatus=decision_issued`,
`routeMountExecutionApprovalDecisionIssued=true`,
`routeMountExecutionApprovalDecisionResult=approved_for_patch_implementation_authorization_request_only`,
`executionApprovalDecisionIssued=true`, `executionApprovalGranted=true`,
`routeMountExecutionAuthorization=authorized_for_patch_implementation_authorization_request_only`,
`routeMountPatchApproved=false`,
`routeMountPatchImplementationAuthorized=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, `runtimeTrafficAllowed=false`,
`nextPhaseRequiresPatchImplementationAuthorizationRequest=true`,
`nextPhaseRequiresActualPatchImplementationApproval=true`, and
`nextPhaseRequiresSeparateRuntimeTrafficApproval=true`. ORO-5B does not edit
`src/app.js`, does not mount Express routes, does not enable public aliases,
does not allow runtime traffic, does not approve patch implementation, does
not authorize route mount, and does not mutate wallet or ledger state.

ORO-5C implementation request: ORO-5C mount hold records patch authorization
request submitted metadata only. This is patch authorization request submitted
for documentation and smoke evidence only:
`routeMountPatchImplementationAuthorizationRequestSubmitted=true`,
`routeMountPatchImplementationAuthorizationRequestStatus=submitted_pending_decision`,
`routeMountPatchImplementationAuthorizationRequestResult=pending_decision`,
`routeMountPatchImplementationAuthorizationDecisionIssued=false`, and
`routeMountPatchImplementationAuthorizationGranted=false`.
ORO-5C keeps `routeMountPatchApproved=false`,
`routeMountPatchImplementationAuthorized=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. ORO-5C does
not edit `src/app.js`, does not mount Express routes, does not enable public
aliases, does not allow runtime traffic, and does not mutate wallet or ledger
state.

ORO-5D implementation decision: ORO-5D mount hold records patch authorization
decision metadata only. This is actual patch approval request only and not
actual patch implementation:
`routeMountPatchImplementationAuthorizationRequestSubmitted=true`,
`routeMountPatchImplementationAuthorizationRequestStatus=decision_issued`,
`routeMountPatchImplementationAuthorizationRequestResult=approved_for_actual_patch_implementation_approval_request_only`,
`routeMountPatchImplementationAuthorizationDecisionIssued=true`,
`routeMountPatchImplementationAuthorizationDecisionResult=approved_for_actual_patch_implementation_approval_request_only`,
`routeMountPatchImplementationAuthorizationGranted=true`, and
`routeMountPatchImplementationAuthorization=authorized_for_actual_patch_implementation_approval_request_only`.
ORO-5D keeps `routeMountPatchApproved=false`,
`routeMountPatchImplementationAuthorized=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`actualPatchImplementationApprovalIssued=false`,
`actualPatchImplementationApprovalGranted=false`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. ORO-5D does
not edit `src/app.js`, does not mount Express routes, does not enable public
aliases, does not allow runtime traffic, and does not mutate wallet or ledger
state.

ORO-5E actual patch approval request: ORO-5E submitted actual patch implementation approval request.

ORO-5E submitted actual patch implementation approval request metadata only. This is an approval request
submission and not an approval decision, implementation, mount, or runtime
traffic authorization.
`actualPatchImplementationApprovalRequestSubmitted=true`,
`actualPatchImplementationApprovalRequestStatus=submitted_pending_decision`,
`actualPatchImplementationApprovalRequestResult=pending_decision`,
`actualPatchImplementationApprovalDecisionIssued=false`, and
`actualPatchImplementationApprovalGranted=false`. ORO-5E still does not
approve actual patch implementation, still does not implement patch, still does
not mount route, and still does not open runtime traffic. ORO-5E keeps
`routeMountPatchApproved=false`,
`routeMountPatchImplementationAuthorized=false`,
`routeMountPatchImplemented=false`, `implementationExecutionApproved=false`,
`routeMountAuthorization=not_authorized_for_mount`,
`expressMountAllowed=false`, `expressMountImplemented=false`,
`publicAliasAllowed=false`, and `runtimeTrafficAllowed=false`. The next phase
is actual patch implementation approval decision boundary.

ORO-5F actual patch approval decision: ORO-5F issued actual patch implementation approval decision.

ORO-5F grants approval only for next authorization request scope:
`actualPatchImplementationApprovalRequestStatus=decision_issued`,
`actualPatchImplementationApprovalDecisionIssued=true`,
`actualPatchImplementationApprovalDecisionResult=approved_for_actual_patch_implementation_authorization_request_only`,
`actualPatchImplementationApprovalGranted=true`, and
`actualPatchImplementationApprovalGrantScope=actual_patch_implementation_authorization_request_only`.

ORO-5F still does not authorize implementation execution, still does not
implement patch, still does not mount route, and still does not open runtime
traffic. The next phase is actual patch implementation authorization request boundary.

ORO-5G actual patch authorization request: ORO-5G submitted actual patch implementation authorization request.

ORO-5G records authorization request metadata only:
`actualPatchImplementationAuthorizationRequestSubmitted=true`,
`actualPatchImplementationAuthorizationRequestStatus=submitted_pending_decision`,
`actualPatchImplementationAuthorizationRequestResult=pending_decision`,
`actualPatchImplementationAuthorizationDecisionIssued=false`, and
`actualPatchImplementationAuthorizationGranted=false`.

ORO-5G still does not issue authorization decision, still does not grant
implementation authorization, still does not implement patch, still does not
mount route, and still does not open runtime traffic. The next phase is actual
patch implementation authorization decision boundary.
next phase is actual patch implementation authorization decision boundary.

ORO-5H actual patch authorization decision: ORO-5H issued actual patch implementation authorization decision.

ORO-5H grants only permission to proceed to a later actual patch implementation execution boundary.

ORO-5H decision metadata only:
`actualPatchImplementationAuthorizationRequestStatus=decision_issued`,
`actualPatchImplementationAuthorizationDecisionResult=approved`,
`actualPatchImplementationAuthorizationGranted=true`, and
`actualPatchImplementationAuthorizationGrantScope=actual_patch_implementation_execution_boundary_only`.

ORO-5H still does not execute actual patch implementation, still does not
apply patch, still does not mount route, and still does not open runtime
traffic. The next phase is actual patch implementation execution boundary.
next phase is actual patch implementation execution boundary.

ORO-5I actual patch implementation execution readiness: ORO-5I checks actual patch implementation execution readiness after ORO-5H issued actual patch implementation authorization decision.

ORO-5I prepares isolated mock execution plan only:
`actualPatchImplementationExecutionReadinessChecked=true`,
`actualPatchImplementationExecutionReadinessStatus=ready_for_isolated_mock_execution_boundary`,
`isolatedMockExecutionPlanPrepared=true`, and
`executionBoundaryEntryScope=isolated_mock_execution_plan_only`.

ORO-5I still does not start execution, still does not apply runtime patch,
still does not implement patch, still does not mount route, still does not
open public alias, and still does not open runtime traffic. The next phase is
actual patch implementation execution boundary. Route mount authorization
still requires separate authorization. Runtime traffic approval still requires
separate approval.

ORO-5J actual patch implementation execution: ORO-5J executes isolated non-mounted actual patch implementation boundary after ORO-5I checked execution readiness.

ORO-5J prepares isolated patch artifact and post-execution evidence only:
`actualPatchImplementationExecutionStatus=executed_isolated_non_mounted_patch`,
`actualPatchImplementationExecutionScope=isolated_non_mounted_callback_patch_artifact_only`,
`actualPatchImplementationPatchArtifactStatus=prepared_for_post_execution_review`, and
`postExecutionEvidencePrepared=true`.

ORO-5J still does not mount route, still does not edit src/app.js, still does
not open public alias, still does not open runtime traffic, still does not
mutate wallet/ledger in runtime, still does not write Prisma/DB, and still
does not call live OroPlay API. The next phase is post-execution validation
boundary or route mount authorization request boundary. Route mount
authorization, public alias approval, and runtime traffic approval still
require separate explicit approval.

ORO-5K post-execution validation route mount authorization request readiness:
ORO-5K validates post-execution evidence after ORO-5J executed isolated
non-mounted actual patch implementation.

ORO-5K reviews isolated non-mounted patch artifact and records route mount
authorization request readiness only:

ORO-5K records route mount authorization request readiness only.

- postExecutionValidationStatus=passed_for_route_mount_authorization_request_readiness
- isolatedPatchArtifactReviewStatus=accepted_for_route_mount_authorization_request_readiness
- routeMountAuthorizationRequestReadinessStatus=ready_to_prepare_route_mount_authorization_request
- routeMountAuthorizationRequestPreparationScope=readiness_record_only

ORO-5K does not submit route mount authorization request, does not issue route
mount authorization decision, does not mount route, does not edit src/app.js,
does not open public alias, does not open runtime traffic, does not mutate
wallet/ledger in runtime, does not write Prisma/DB, and does not call live
OroPlay API.

ORO-5L route mount authorization request submission: ORO-5L submits route
mount authorization request record after ORO-5K readiness.

ORO-5L submits route mount authorization request record only:

- routeMountAuthorizationRequestStatus=submitted_pending_decision
- routeMountAuthorizationRequestResult=submitted
- routeMountAuthorizationRequestScope=route_mount_authorization_decision_request_only
- routeMountAuthorizationDecisionResult=pending_decision

ORO-5L still does not issue route mount decision, still does not grant route
mount authorization, still does not mount route, still does not edit
src/app.js, still does not open public alias, still does not open runtime
traffic, still does not mutate wallet/ledger in runtime, still does not write
Prisma/DB, and still does not call live OroPlay API. The next phase is route
mount authorization decision boundary. Express mount implementation, public
alias approval, and runtime traffic approval remain separate explicit phases.

ORO-5M route mount authorization decision: ORO-5M issues route mount
authorization decision after ORO-5L submitted the request.

ORO-5M issues route mount authorization decision only:

- routeMountAuthorizationDecisionStatus=decision_issued
- routeMountAuthorizationDecisionResult=approved
- routeMountAuthorizationGrantScope=route_mount_implementation_boundary_only
- routeMountAuthorization=authorized_for_route_mount_implementation_boundary_only

ORO-5M grants only permission to proceed to route mount implementation
boundary. ORO-5M still does not implement or mount route, still does not edit
src/app.js, still does not open public alias, still does not open runtime
traffic, still does not mutate wallet/ledger in runtime, still does not write
Prisma/DB, and still does not call live OroPlay API. Public alias approval,
runtime traffic approval, post-mount validation, and live traffic approval
remain separate explicit phases.

ORO-5M grants only permission to proceed to route mount implementation boundary.

ORO-5N route mount implementation boundary: ORO-5N implements the internal
fail-closed OroPlay callback staging mount only.

ORO-5N internal fail-closed OroPlay callback staging mount only:

- routeMountPatchImplementationScope=internal_fail_closed_oroplay_callback_staging_mount_only
- srcAppChangeScope=internal_oroplay_callback_staging_mount_only
- expressMountScope=internal_fail_closed_oroplay_callback_staging_mount_only
- oroplayBalanceRouteMode=fail_closed_no_mutation
- oroplayTransactionRouteMode=fail_closed_no_mutation
- apiBalancePublicAliasMounted=false
- apiTransactionPublicAliasMounted=false

ORO-5N keeps public aliases disabled, keeps runtime traffic disabled, keeps
wallet/ledger mutation blocked, keeps Prisma/DB writes blocked, and keeps live
OroPlay API calls blocked. Public alias approval, runtime traffic approval,
post-mount validation, and live traffic approval remain separate phases.

ORO-5O post-mount validation boundary: ORO-5O validates that the internal
`/api/oroplay` mount remains fail-closed after ORO-5N. It confirms the balance
and transaction callback paths remain `fail_closed_no_mutation`, confirms no
public `/api/balance` or `/api/transaction` alias exists, confirms no runtime or
live traffic is enabled, confirms no wallet/ledger/Prisma/DB mutation or
migration is performed, and confirms no external or live OroPlay call is made.
ORO-5O is validation only and does not change `src/app.js` or runtime
route/controller files.

ORO-5O marker: internal /api/oroplay mount remains fail-closed.

ORO-5P post-mount validation decision boundary: ORO-5P records that ORO-5O
post-mount validation passed and prepares public alias authorization request
readiness only.

ORO-5P public alias authorization request readiness only:

- postMountValidationDecisionBoundaryResult=PASS
- postMountValidationDecisionIssued=true
- publicAliasAuthorizationRequestReadinessPrepared=true
- publicAliasAuthorizationRequestSubmitted=false
- publicAliasAuthorizationDecisionIssued=false
- publicAliasAuthorizationGranted=false
- publicAliasImplemented=false
- apiBalancePublicAliasMounted=false
- apiTransactionPublicAliasMounted=false
- runtimeTrafficEnabled=false

ORO-5P does not submit the public alias authorization request, does not issue a
public alias authorization decision, does not implement public aliases, and does
not enable runtime traffic.

next phase is route mount authorization decision boundary.

ORO-5P next phase is public alias authorization request submission boundary.

ORO-5Q public alias authorization request submission boundary: ORO-5Q records a
static/mock public alias authorization request submission after ORO-5P readiness.

ORO-5Q public alias authorization decision request only:

- publicAliasAuthorizationRequestSubmissionBoundaryResult=PASS
- publicAliasAuthorizationRequestSubmitted=true
- publicAliasAuthorizationRequestStatus=submitted_pending_decision
- publicAliasAuthorizationRequestResult=submitted
- publicAliasAuthorizationRequestScope=public_alias_authorization_decision_request_only
- publicAliasAuthorizationDecisionIssued=false
- publicAliasAuthorizationGranted=false
- publicAliasImplementationAuthorized=false
- publicAliasImplemented=false
- apiBalancePublicAliasMounted=false
- apiTransactionPublicAliasMounted=false
- runtimeTrafficEnabled=false

ORO-5Q does not issue the public alias authorization decision, does not grant a
public alias, does not authorize implementation, does not implement public
aliases, and does not enable runtime traffic.

ORO-5Q next phase is public alias authorization decision boundary.

ORO-5R public alias authorization decision boundary: ORO-5R issues a
static/mock public alias authorization decision after ORO-5Q request submission.

ORO-5R public alias implementation boundary grant only:

- publicAliasAuthorizationDecisionBoundaryResult=PASS
- publicAliasAuthorizationDecisionIssued=true
- publicAliasAuthorizationDecisionStatus=decision_issued
- publicAliasAuthorizationDecisionResult=approved
- publicAliasAuthorizationRequestStatus=decision_issued
- publicAliasAuthorizationRequestResult=approved
- publicAliasAuthorizationRequestResolved=true
- publicAliasAuthorizationGranted=true
- publicAliasAuthorizationGrantScope=public_alias_implementation_boundary_only
- publicAliasImplementationAuthorized=true
- publicAliasImplementationBoundaryEntryAllowed=true
- publicAliasImplemented=false
- apiBalancePublicAliasMounted=false
- apiTransactionPublicAliasMounted=false
- runtimeTrafficEnabled=false

ORO-5R grants only entry into the next public alias implementation boundary. It
does not implement public aliases, does not mount `/api/balance`, does not mount
`/api/transaction`, and does not enable runtime traffic.

ORO-5R next phase is public alias implementation boundary.

ORO-5S public alias implementation boundary: ORO-5S wires the public aliases to
the existing fail-closed callback handlers after ORO-5R authorization.

ORO-5S fail-closed alias wiring only:

- publicAliasImplementationBoundaryResult=PASS
- publicAliasImplemented=true
- publicAliasPatchImplemented=true
- apiBalancePublicAliasMounted=true
- apiTransactionPublicAliasMounted=true
- apiBalancePublicAliasPath=/api/balance
- apiTransactionPublicAliasPath=/api/transaction
- apiBalancePublicAliasMode=fail_closed_no_mutation
- apiTransactionPublicAliasMode=fail_closed_no_mutation
- apiBalancePublicAliasRuntimeTrafficEnabled=false
- apiTransactionPublicAliasRuntimeTrafficEnabled=false
- runtimeTrafficEnabled=false
- walletMutationPerformed=false
- ledgerMutationPerformed=false
- prismaWritePerformed=false
- externalNetworkCalled=false
- liveOroPlayApiCalled=false

ORO-5S implements only fail-closed no-mutation public alias wiring. It does not
approve runtime traffic, live traffic, real-money flow, wallet mutation, ledger
mutation, persistent writes, or live OroPlay calls.

ORO-5S next phase is post-alias validation boundary.

ORO-5T public alias post-implementation validation boundary: ORO-5T validates
the committed ORO-5S public aliases after implementation. The validation
confirms `POST /api/balance` and `POST /api/transaction` remain mounted, map to
the existing OroPlay fail-closed handlers, and stay in `fail_closed_no_mutation`
mode.

ORO-5T validation-only markers:

- publicAliasPostImplementationValidationBoundaryResult=PASS
- publicAliasImplementationFromOro5s=true
- apiBalancePublicAliasMounted=true
- apiTransactionPublicAliasMounted=true
- apiBalancePublicAliasMode=fail_closed_no_mutation
- apiTransactionPublicAliasMode=fail_closed_no_mutation
- runtimeTrafficApprovalIssued=false
- liveTrafficApprovalIssued=false
- runtimeTrafficEnabled=false
- liveTrafficEnabled=false
- walletMutationPerformed=false
- ledgerMutationPerformed=false
- prismaWritePerformed=false
- dbTransactionPerformed=false
- externalNetworkCalled=false
- liveOroPlayApiCalled=false
- smoke:oro-5t

ORO-5T is a validation boundary only. It does not edit `src/app.js`, does not
approve runtime traffic, does not approve live traffic, does not perform
wallet/ledger/Prisma/DB mutation, and does not call external or live OroPlay
services.

next phase is actual patch implementation approval decision boundary.

ORO-5U runtime traffic authorization request readiness boundary: ORO-5U records
readiness for a later runtime traffic authorization request submission after
ORO-5T validates the public aliases. It is readiness-only and keeps runtime
traffic unsubmitted, undecided, ungranted, and disabled.

ORO-5U readiness-only markers:

- dependsOnOro5tPublicAliasPostImplementationValidation=true
- publicAliasPostImplementationValidationFromOro5t=true
- apiBalancePublicAliasMounted=true
- apiTransactionPublicAliasMounted=true
- apiBalancePublicAliasMode=fail_closed_no_mutation
- apiTransactionPublicAliasMode=fail_closed_no_mutation
- runtimeTrafficAuthorizationRequestReady=true
- runtimeTrafficAuthorizationRequestPrepared=true
- runtimeTrafficAuthorizationRequestSubmitted=false
- runtimeTrafficAuthorizationDecisionIssued=false
- runtimeTrafficAuthorizationGranted=false
- runtimeTrafficAllowed=false
- runtimeTrafficEnabled=false
- liveTrafficAuthorizationRequestSubmitted=false
- liveTrafficAuthorizationDecisionIssued=false
- liveTrafficAllowed=false
- liveTrafficEnabled=false
- externalNetworkCalled=false
- liveOroPlayApiCalled=false
- smoke:oro-5u

ORO-5V runtime traffic authorization request submission boundary: ORO-5V submits
the runtime traffic authorization request record after ORO-5U readiness. It is a
request submission record only and leaves runtime traffic undecided, ungranted,
and disabled.

ORO-5V request-submission markers:

- dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness=true
- runtimeTrafficAuthorizationRequestReadyFromOro5u=true
- runtimeTrafficAuthorizationRequestPreparedFromOro5u=true
- runtimeTrafficAuthorizationRequestSubmitted=true
- runtimeTrafficAuthorizationRequestStatus=submitted_pending_decision
- runtimeTrafficAuthorizationRequestResult=submitted
- runtimeTrafficAuthorizationRequestScope=runtime_traffic_authorization_decision_request_only
- runtimeTrafficAuthorizationDecisionIssued=false
- runtimeTrafficAuthorizationGranted=false
- runtimeTrafficAllowed=false
- runtimeTrafficEnabled=false
- liveTrafficAuthorizationRequestSubmitted=false
- liveTrafficAuthorizationDecisionIssued=false
- liveTrafficAllowed=false
- liveTrafficEnabled=false
- apiBalancePublicAliasMode=fail_closed_no_mutation
- apiTransactionPublicAliasMode=fail_closed_no_mutation
- externalNetworkCalled=false
- liveOroPlayApiCalled=false
- smoke:oro-5v
