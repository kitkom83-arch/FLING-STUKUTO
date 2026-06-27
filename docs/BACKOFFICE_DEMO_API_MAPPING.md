# BACKOFFICE_DEMO_API_MAPPING

## Scope

- Backend source of truth remains `PG77-real-core`.
- `New project.zip` is a static UI/mock reference only, not a backend source.
- Do not copy demo files over the real app, do not import the zip into this repo, and do not reuse frontend-only mock logic as backend behavior.
- This phase is mapping-only: no runtime route/controller/service/UI changes, no production DB, no live provider, no live payment/bank/SMS/slip OCR path, and no deploy.

## Demo Reference Inspected

- Zip path: `C:\Users\ADMIN\Downloads\New project.zip`
- Read-only extraction path used for inspection: `C:\Users\ADMIN\AppData\Local\Temp\new-project-inspect-866e09ca-ec34-4b27-bb3b-8f471a7c19e9\New project`
- Files reviewed: `index.html`, `app.js`, `style.css`, `README.md`, `PROJECT_PLAN.md`
- The extracted demo also contains its own `.git` folder and backup files; neither is a source of truth for `PG77-real-core`.

## Demo Menu Summary

Main demo menus/pages found in the static reference:

- `Dashboard`
- `รายงาน`: system, promotion/bonus, profit-loss, new members, online members, referrals, VIP members, wheel
- `จัดการสมาชิก`: member info, blocked members, pending bank accounts, member detail, credit management, CRM messaging
- `รายการเดินบัญชี`: deposits, pending transactions, account balance summary, add deposit, auto transfer, withdrawal review, payment, credit management
- `ธนาคาร`: deposit statement, withdraw statement, account management, bank SMS statement data
- `บริการเสริม`: referral, ranking, check-in, lucky wheel, messaging, points giveaway, coupon, article, shop, lootbox, tournament, code center
- `ตั้งค่า`: line, line alerts, web alerts, system settings, game settings, promotion settings, website settings, register settings, loss settings, commission settings

Static/mock-only traits explicitly found in the demo reference:

- Demo is `HTML/CSS/JavaScript` only and can open even when backend is not ready.
- Many flows use frontend-only mock state and `localStorage`.
- Banking, reward wallet, promotions, dashboard exports, messaging, article, shop, lootbox, tournament, and most settings pages are described as mock-only.
- README and PROJECT_PLAN repeatedly say there is no real API, no real database, no real bank connection, and no real payment gateway in the demo itself.

## Mapping Table

| Demo menu/page | UI intent | Existing PG77 route/API | Existing controller/service | Existing admin UI surface | Status | Risk/safety notes | Recommended next phase |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Show high-level ops summary and quick health checks | `GET /api/health`, `GET /api/admin/reports/summary`, `GET /api/admin/deposits`, `GET /api/admin/withdrawals`, `GET /api/admin/bank-accounts/pending`, `GET /api/admin/logs` | `health.controller`, `admin.controller`, `report.service` | `src/admin-ui/index.html`, `src/money-demo-ui/admin.html` | `PARTIAL` | Demo dashboard includes many mock KPI/report cards not backed 1:1 by current API responses. Keep local-safe and read-only where data is not modeled yet. | Build a real backoffice dashboard adapter that composes existing read endpoints without adding live money flow. |
| Members | List members, view member detail/history, block/unblock, inspect related activity | `GET /api/admin/members`, `GET /api/admin/members/:id`, `GET /api/admin/members/:id/history`, `POST /api/admin/members/:id/block`, `POST /api/admin/members/:id/unblock` | `admin.controller`, `member.service` | `src/admin-ui/index.html` | `READY_TO_CONNECT` | Existing member routes are real backend surfaces. Keep auth/permission guards and avoid exposing unsafe internal fields. | Connect demo member list/detail to existing admin member endpoints. |
| Wallet / Credit | Manage credit/points and inspect ledger state | `POST /api/admin/members/:id/credit/add`, `POST /api/admin/members/:id/credit/remove`, `POST /api/admin/members/:id/points/add`, `POST /api/admin/members/:id/points/remove`, `GET /api/admin/reports/wallet-ledger`, `GET /api/wallet`, `GET /api/wallet/ledger`, `GET /api/points` | `admin.controller`, `wallet.controller`, `wallet.service`, `point.service` | `src/admin-ui/index.html`, `src/money-demo-ui/admin.html`, `src/money-demo-ui/member.html` | `PARTIAL` | Core wallet and credit actions exist, but the demo shows a much broader finance control center than the current dedicated admin UI. No live money execution beyond existing guarded local-safe flows. | Add a focused backoffice wallet/credit adapter using existing admin member credit actions and report ledger reads. |
| Deposit | Create/list member deposit requests and admin approve/reject review | `POST /api/deposits`, `GET /api/deposits`, `GET /api/admin/deposits`, `POST /api/admin/deposits/:id/approve`, `POST /api/admin/deposits/:id/reject` | `deposit.controller`, `deposit.service` | `src/money-demo-ui/member.html`, `src/money-demo-ui/admin.html`, `src/admin-ui/index.html` | `READY_TO_CONNECT` | Keep local-safe only. Do not introduce production payment rails or bypass approval/audit behavior. | Connect demo deposit lists/actions to existing guarded deposit endpoints. |
| Withdraw | Create/list member withdrawals and admin approve/reject/mark-paid review | `POST /api/withdrawals`, `GET /api/withdrawals`, `GET /api/admin/withdrawals`, `POST /api/admin/withdrawals/:id/approve`, `POST /api/admin/withdrawals/:id/reject`, `POST /api/admin/withdrawals/:id/mark-paid` | `withdraw.controller`, `withdraw.service` | `src/money-demo-ui/member.html`, `src/money-demo-ui/admin.html`, `src/admin-ui/index.html` | `READY_TO_CONNECT` | Keep local-safe only. Do not add live bank payout behavior in this phase. | Connect demo withdraw review and mark-paid flow to existing guarded withdrawal endpoints. |
| Bank accounts | Member bank account create/list and admin pending-bank review | `GET /api/bank-accounts`, `POST /api/bank-accounts`, `GET /api/admin/bank-accounts/pending`, `POST /api/admin/bank-accounts/:id/approve`, `POST /api/admin/bank-accounts/:id/reject` | `bankAccount.controller`, `bankAccount.service` | `src/money-demo-ui/member.html`, `src/money-demo-ui/admin.html`, `src/admin-ui/index.html` | `READY_TO_CONNECT` | Existing flow is already guarded and audited. Keep masked bank details and fail-closed permissions. | Connect pending bank review screens to existing endpoints and keep the reason/audit workflow. |
| Bank statements / Payment / SMS banking tools | Demo shows statement pages, payment tabs, SMS-bank data, and bank-management mock tools | Mock/safety/readiness only in current repo: `GET /api/admin/bank/mock/statements/deposits`, `GET /api/admin/bank/mock/statements/withdrawals`, `POST /api/admin/slip-ocr/mock/verify` | `bankMock.controller`, `bankMock.service` | `src/admin-ui/index.html` read-only bank sections only | `MOCK_ONLY` | These are explicitly mock/safety surfaces. No real bank API, payment gateway, SMS banking, or slip OCR live path should be introduced here. | Keep these labeled mock-only and defer any real integration to a separately approved guarded phase. |
| Promotions | Configure promotions, calculator, preview, and admin promotion management | Current real backend is limited to member-facing `GET /api/promotions`, `POST /api/promotions/:id/claim` | `promotion.controller`, `promotion.service` | No real backoffice promotion UI in repo; demo promotion screens are static-only | `MISSING_BACKEND` | Demo promotion admin is frontend-only mock. There is no real admin promotion CRUD/config API yet. | Design and implement a guarded admin promotion config API/DB phase separately from this mapping work. |
| Lucky Wheel | Admin campaign/prize config and member wheel runtime | Admin routes: `GET /api/admin/wheel/config`, `PATCH /api/admin/wheel/campaign`, `POST /api/admin/wheel/rewards`, `PATCH /api/admin/wheel/rewards/:id`, `GET /api/admin/wheel/spins`, `GET /api/admin/wheel/member-rewards`, `PATCH /api/admin/wheel/member-rewards/:id/status` Member routes: `GET /api/member/wheel/config`, `POST /api/member/wheel/spin`, `GET /api/member/wheel/history`, `GET /api/member/wheel/my-rewards` | `wheel.controller`, `wheel.service` | `src/admin-wheel-ui`, `apps/lucky-wheel-game`, `src/money-demo-ui/member.html` launcher | `READY_TO_CONNECT` | Backend is the only source of truth for reward selection. Frontend must not choose reward results. Spin payload must remain `{ campaignId }`. No live provider or production DB. | Continue connecting backoffice/menu entries to the existing admin/member wheel surfaces rather than creating a parallel system. |
| Reward / Prize / Code Center | Prize/reward operations beyond wheel: reward inbox, coupon, box, code center, member reward wallet | `GET /api/admin/code-center/campaigns`, `POST /api/admin/code-center/campaigns`, `POST /api/admin/code-center/campaigns/:id/codes`, `GET /api/admin/code-center/redeem-logs`, `POST /api/code-center/redeem`, `GET /api/code-center/redeem-logs`, `GET /api/member/rewards`, `GET /api/member/rewards/summary`, `GET /api/member/rewards/history` | `codeCenter.controller`, `codeCenter.service`, `memberReward.controller`, `memberRewardWallet.service` | No dedicated backoffice UI surface yet; repo has backend and smoke coverage | `PARTIAL` | There is real backend for code center and member reward wallet, but the demo’s broader prize inbox and inventory screens are still mock-shaped. No cash-credit live path. | Add a scoped backoffice reward/code UI that starts with code center campaigns, redeem logs, and member reward summaries. |
| Reports | Financial, member, wheel, audit, and summary reporting | `GET /api/admin/reports/summary`, `GET /api/admin/reports/deposits`, `GET /api/admin/reports/withdrawals`, `GET /api/admin/reports/wallet-ledger`, plus wheel read endpoints | `admin.controller`, `report.service`, `wheel.service` | `src/admin-ui/index.html`, `src/admin-wheel-ui/index.html` | `PARTIAL` | Current reporting exists but is narrower than the demo’s full report matrix. Keep report surfaces read-only and local-safe. | Build report adapters page-by-page from current endpoints before adding new aggregates. |
| Audit / Logs | Read admin logs, audit history, and security events | `GET /api/admin/logs`, `GET /api/admin/audit-logs`, `GET /api/admin/audit-logs/summary`, `GET /api/admin/security-events`, `GET /api/admin/security-events/summary` | `admin.controller`, `adminAudit.controller`, `adminLog.service` | `src/admin-ui/index.html`, `src/admin-wheel-ui/index.html` | `READY_TO_CONNECT` | Audit/security is already guarded and should remain read-only unless a separate approved write/audit phase is defined. | Wire demo audit/log pages to existing audit endpoints and preserve filters/detail views. |
| Settings (core site/game/payment config) | Website config, site bank accounts, game providers, and payment configs | `GET /api/admin/sites`, `GET /api/admin/sites/current/config`, `GET /api/admin/sites/:id`, `POST /api/admin/sites/:id/settings`, `POST /api/admin/sites/:id/theme`, `GET/POST /api/admin/sites/:id/bank-accounts`, `GET/POST /api/admin/sites/:id/game-providers`, `GET/POST /api/admin/sites/:id/payment-configs` | `adminSite.controller` | No dedicated rich settings UI in repo; only route/backend surface exists | `PARTIAL` | Backend exists for core site settings, but the static demo exposes far more tabs and mock editors than current real UI. Keep secret masking and safe config boundaries. | Start by wiring a minimal settings surface for current site config and provider/payment records only. |
| Admin / users / roles / work schedule | Admin permission guard, role management, assignment, and schedule enforcement | `GET /api/admin/permissions/me`, `GET /api/admin/permissions`, `GET /api/admin/permissions/catalog`, `GET /api/admin/roles`, `GET /api/admin/roles/:role`, `PATCH /api/admin/roles/:role/permissions`, `GET /api/admin/admins/:id/permissions`, `PATCH /api/admin/admins/:id/role`, work-schedule endpoints under `/api/admin` | `adminPermission.controller`, `adminPermission.service`, `adminWorkSchedule.service` | `src/admin-ui/index.html` | `READY_TO_CONNECT` | Existing role/schedule surfaces are already guarded and local-safe. Keep reason/audit requirements. | Continue from the existing admin UI rather than rebuilding a new admin/role system from the demo mock. |
| Services extras: referral, ranking, check-in, messaging, coupon/article/shop/lootbox/tournament | Backoffice operations for service modules shown in the demo sidebar | No equivalent real backoffice API set found in current repo for these modules as shown in the demo | None for these demo scopes in current backend | Demo-only mock reference; no matching real UI surface in repo | `MISSING_BACKEND` | These sections are mostly frontend-only mock in the demo and should not be assumed to exist in PG77. | Split these into separate discovery phases and prioritize only the modules with real product demand and safe backend contracts. |
| Live provider / bank / payment / SMS / slip OCR execution | Demo mentions many operational areas that could imply live integrations | Out of current phase. Current repo keeps mock/safety/readiness boundaries and guarded non-live modes | Existing guards across services and smokes | No phase-19 runtime change allowed | `OUT_OF_SCOPE_NOW` | No production DB, no live provider/API call, no deploy, no new backend stack, and no live money path in this phase. | Keep all live-execution work behind separate approval and safety gates. |

## Lucky Wheel Contract Notes

- Existing admin routes:
  - `GET /api/admin/wheel/config`
  - `PATCH /api/admin/wheel/campaign`
  - `POST /api/admin/wheel/rewards`
  - `PATCH /api/admin/wheel/rewards/:id`
- Existing member routes:
  - `GET /api/member/wheel/config`
  - `POST /api/member/wheel/spin`
  - `GET /api/member/wheel/history`
  - `GET /api/member/wheel/my-rewards`
- Backend remains the only source of truth for wheel reward selection.
- Frontend must not choose the reward result itself.
- Member spin payload must remain `{ campaignId }`.

## Status Count

- `READY_TO_CONNECT`: 7
- `PARTIAL`: 5
- `MOCK_ONLY`: 1
- `MISSING_BACKEND`: 2
- `OUT_OF_SCOPE_NOW`: 1

## Top Recommended Next Phases

1. Connect the static backoffice member, deposit, withdraw, and pending-bank screens to the existing guarded PG77 admin APIs.
2. Build a minimal real backoffice dashboard/report adapter from current read endpoints instead of inheriting the demo’s frontend-only KPI logic.
3. Add a scoped real backoffice surface for Code Center and Member Reward Wallet using the existing backend endpoints.
4. Design a proper admin promotion configuration backend/API because the current demo promotion suite is mock-only and the real repo only has member promotion claim routes.
5. Build a minimal site/settings UI for existing site config, bank-account, game-provider, and payment-config endpoints, while leaving unsupported settings tabs clearly out of scope.
