# Permission Matrix

Phase AJ status: static admin RBAC matrix for API mapping.

Safety boundary: docs/static only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, and no runtime write action is enabled here.

## Role Legend

| Mark | Meaning |
| --- | --- |
| Yes | Role should have permission by default. |
| Limited | Role may have permission only for assigned site/module and with backend guard. |
| No | Role should not have permission by default. |

## Matrix

| Permission | Type | owner | super_admin | finance | support | graphic | viewer | Reason required | Audit required | Safety notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `dashboard.view` | read-only permission | Yes | Yes | Yes | Yes | Limited | Yes | No | No | Read-only summary only. |
| `reports.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Reports are display/export only; export audit can be added later. |
| `members.view` | read-only permission | Yes | Yes | Yes | Yes | No | Yes | No | No | Must mask sensitive member data. |
| `members.history.view` | read-only permission | Yes | Yes | Yes | Yes | No | Yes | No | No | History read-only; no provider live calls. |
| `members.bank.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Bank account numbers must be masked; pending review read only. |
| `members.bank.approve` | guarded write permission | Yes | Yes | Yes | No | No | No | Yes | Yes | Phase AL guarded write; approve/reject requires reason, audit, duplicate guard, local/staging/mock only, and no live bank action. |
| `members.blacklist.update` | write permission | Yes | Yes | Limited | Limited | No | No | Yes | Yes | Must capture before/after status and actor. |
| `wallet.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Display only; not settlement proof. |
| `wallet.adjust` | write permission | Yes | Yes | Limited | No | No | No | Yes | Yes | No self-approval; no live action until certification; dual control required before production. |
| `deposits.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Manual/mock deposits only. |
| `deposits.create` | write permission | Yes | Yes | Yes | No | No | No | Yes | Yes | Admin-created deposit requires reason and idempotency. |
| `deposits.approve` | write permission | Yes | Yes | Yes | No | No | No | Yes | Yes | No real payment rail; no self-approval where requester/approver separation applies. |
| `withdrawals.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Manual/mock withdrawals only. |
| `withdrawals.approve` | write permission | Yes | Yes | Yes | No | No | No | Yes | Yes | No self-approval; no live payout; mark-paid must not trigger bank transfer. |
| `bank.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Mock/sandbox statement read only. |
| `bank.manage` | write permission | Yes | Yes | Limited | No | No | No | Yes | Yes | Site bank config only; no live bank rail enablement. |
| `promotions.view` | read-only permission | Yes | Yes | Yes | Yes | Yes | Yes | No | No | Promotion visibility only. |
| `promotions.manage` | write permission | Yes | Yes | Limited | No | Yes | No | Yes | Yes | Graphic may manage copy/assets only if backend separates financial reward fields. |
| `wheel.view` | read-only permission | Yes | Yes | Yes | Yes | Yes | Yes | No | No | Wheel reports/config read. |
| `wheel.manage` | write permission | Yes | Yes | Limited | No | Yes | No | Yes | Yes | No forced spin result; backend selects member rewards. |
| `audit.view` | read-only permission | Yes | Yes | Yes | Limited | No | Yes | No | No | Audit rows must be sanitized. |
| `security.view` | read-only permission | Yes | Yes | Limited | No | No | Yes | No | No | Security event rows must be sanitized. |
| `admin.roles.view` | read-only permission | Yes | Yes | No | No | No | Yes | No | No | Viewer sees catalog only if policy allows. |
| `admin.roles.update` | write permission | Yes | Limited | No | No | No | No | Yes | Yes | Owner-only recommended; no self-demotion bypass or privilege escalation. |
| `admin.workSchedule.view` | read-only permission | Yes | Yes | Limited | No | No | Yes | No | No | Read schedule/override state. |
| `admin.workSchedule.update` | write permission | Yes | Yes | No | No | No | No | Yes | Yes | Must preserve fail-closed login schedule behavior. |
| `settings.view` | read-only permission | Yes | Yes | Yes | Limited | Yes | Yes | No | No | Settings read only. |
| `settings.update` | write permission | Yes | Yes | Limited | No | Limited | No | Yes | Yes | Graphic limited to display/theme settings; provider/payment/bank/SMS/Slip OCR live config blocked until certification. |

## Required Controls

- Read-only permission and write permission must stay separate.
- Reason is required for wallet, bank approval/reject, blacklist, deposit approval, withdrawal approval/mark paid, promotion manage, wheel manage, role update, work schedule update, and settings update.
- Audit is required for every write permission row.
- No self-approval is required for wallet adjustment, withdrawal approval/mark paid, role-sensitive changes, future commission settlement, and any future dual-control action.
- No live action until certification: provider, payment, bank, SMS, Slip OCR, payout, and production DB operation remain disabled or mock/sandbox only.
