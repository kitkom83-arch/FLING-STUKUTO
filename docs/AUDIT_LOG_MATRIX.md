# Audit Log Matrix

Phase AJ status: static audit action matrix for API mapping.

Safety boundary: docs/static only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, and no runtime write action is enabled here.

## Status Legend

| Status | Meaning |
| --- | --- |
| implemented | Action is expected in existing safe runtime or already documented from code inspection. |
| planned guarded write | Action is required before opening or expanding guarded write UI/API. |
| future certification required | Action is part of a future live integration certification gate. |

## Matrix

| Module | Action | Trigger | Actor | Target type | Target id | Before snapshot | After snapshot | Reason required | Risk level | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin auth | `admin.login.success` | Admin login accepted | admin | admin_session | session id or admin id | login attempt metadata | session metadata, schedule status | No | Medium | implemented |
| Admin auth | `admin.login.failed` | Invalid credential or auth failure | system/admin candidate | admin_login_attempt | username/email hash or admin id when known | attempt metadata | failure reason code | No | Medium | implemented |
| Admin auth | `admin.login.blocked_outside_schedule` | Login denied by work schedule | system/admin candidate | admin | admin id when known | schedule window | denied login event | No | High | implemented |
| Admin roles | `admin.role.assign` | Admin role assignment changes | owner/super_admin | admin | target admin id | previous role | new role | Yes | High | planned guarded write |
| Admin roles | `admin.role.permissions.update` | Role permission set changes | owner/super_admin | admin_role | role id | previous permission ids | new permission ids | Yes | Critical | planned guarded write |
| Work schedule | `admin.schedule.update` | Work schedule or override changes | owner/super_admin | admin_schedule | schedule id | previous schedule/override | new schedule/override | Yes | High | planned guarded write |
| Member bank | `member.bank.approve` | Pending member bank approved | finance/super_admin | user_bank_account | bank account id | previous bank status and masked account | approved status, approver, and reason | Yes | Medium | guarded write / operator history visible |
| Member bank | `member.bank.reject` | Pending member bank rejected | finance/super_admin | user_bank_account | bank account id | previous bank status and masked account | rejected status and reject reason | Yes | Medium | guarded write / operator history visible |
| Member blacklist | `member.blacklist.add` | Member blocked/blacklisted | support/super_admin | user | member id | previous status | blocked status, reason, blockedBy | Yes | High | planned guarded write |
| Member blacklist | `member.blacklist.remove` | Member unblocked | support/super_admin | user | member id | blocked status and reason | active/restored status | Yes | High | planned guarded write |
| Wallet | `wallet.adjust.credit` | Admin adds credit | finance/super_admin | wallet_account | member wallet id | balance before and pending adjustments | balance after and ledger id | Yes | Critical | planned guarded write |
| Wallet | `wallet.adjust.debit` | Admin removes credit | finance/super_admin | wallet_account | member wallet id | balance before and pending adjustments | balance after and ledger id | Yes | Critical | planned guarded write |
| Deposit | `deposit.create` | Member or admin creates manual deposit request | member/admin | deposit_transaction | deposit id | none or previous draft | created deposit request | Yes for admin; member note optional | High | planned guarded write |
| Deposit | `deposit.approve` | Admin approves manual/mock deposit | finance/super_admin | deposit_transaction | deposit id | pending deposit and wallet balance | approved deposit, wallet/ledger result | Yes | Critical | planned guarded write |
| Withdrawal | `withdrawal.approve` | Admin approves withdrawal request | finance/super_admin | withdraw_transaction | withdrawal id | pending withdrawal and wallet reserve state | approved withdrawal state | Yes | Critical | planned guarded write |
| Withdrawal | `withdrawal.mark_paid` | Admin marks withdrawal paid mock | finance/super_admin | withdraw_transaction | withdrawal id | approved withdrawal state | paid mock state and reference | Yes | Critical | planned guarded write |
| Promotions | `promotion.create/update` | Admin creates or updates promotion | super_admin/graphic/finance | promotion | promotion id | previous promotion config | new promotion config | Yes | High | planned guarded write |
| Lucky Wheel | `wheel.campaign.update` | Admin updates wheel campaign | super_admin/graphic/finance | wheel_campaign | campaign id | previous campaign config | new campaign config | Yes | High | planned guarded write |
| Lucky Wheel | `wheel.reward.create/update` | Admin creates or updates wheel reward | super_admin/graphic/finance | wheel_reward | reward id | previous reward config or none | new reward config | Yes | High | planned guarded write |
| Settings | `settings.update` | Admin updates site/system settings | owner/super_admin | site_settings | site id or setting id | previous settings | new settings | Yes | High | planned guarded write |
| Live provider | `live_provider.config.update` | Admin changes provider live/sandbox config | owner/super_admin | game_provider_config | config id | previous mode/config metadata | new mode/config metadata | Yes | Critical | future certification required |

## Audit Requirements

- Before snapshot and after snapshot must never include token, password, secret, raw database URL, auth header, raw provider credential, raw SMS credential, raw bank credential, raw Slip OCR credential, raw user-agent, or unmasked IP.
- Member bank approve/reject audit metadata must include reason required, previousStatus, nextStatus, targetType, targetId, actor admin id/username, siteCode, and before/after snapshot with masked account number only.
- Phase AM Admin Bank Account Review Audit & Operator Handoff exposes `member.bank.approve` and `member.bank.reject` history through the read-only audit log panel for operators with `admin.audit.view`; it must not create audit rows, change review status, or call live bank/payment/provider/SMS/Slip OCR integrations.
- Phase AN Admin Bank Account Review Release Pack / UAT Checklist records the required audit evidence and UAT checklist only. It does not introduce new audit actions or runtime write behavior.
- Reason is mandatory for high and critical write actions unless explicitly listed as no.
- Critical financial actions require no self-approval where a requester/approver workflow exists.
- Future live integration actions must not be enabled until certification evidence is complete.
