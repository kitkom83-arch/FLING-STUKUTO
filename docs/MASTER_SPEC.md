# PG77 Master Spec

## Project status summary

PG77-real-core is Safe MVP / Handoff Ready for local, staging, mock, and sandbox review. The repository contains a real Node.js/Express backend with JWT auth, Prisma models, wallet flows, manual deposit and withdrawal flows, admin logs, admin permission guards, Lucky Wheel backend MVP, and mock provider/payment/bank-related adapters.

This document is a master planning document for the next API integration phase. It does not approve production operation, live money movement, production database access, production migration, production seed, live provider integration, live payment rails, live bank feeds, live SMS, or live Slip OCR.

## Safe MVP status

| Area | Current status | Notes |
| --- | --- | --- |
| Backend API core | Safe MVP / backend-ready for existing local and staging routes | Existing routes are guarded by auth, site access, and permission middleware where applicable. |
| Backoffice demo surfaces | Static/mock/backend-ready depending on module | UI visibility is not authorization; backend guards remain the source of truth. |
| Member frontend surfaces | Mock/static unless explicitly wired to existing API | Auth, wallet, deposits, withdrawals, promotions, game mock launch, and Lucky Wheel member routes exist. |
| Financial flows | Manual local/staging/mock only | No real money, no live payout, no live payment rail, no live bank transfer. |
| External integrations | Mock, sandbox, or disabled only | Live provider/payment/bank/SMS/Slip OCR is not started. |
| Staging readiness | Prepared for safe staging review | Staging still requires guarded env, staging DB separation, smoke evidence, and explicit approval. |
| Production readiness | Not production ready | Production/live integration and production DB operation are not approved. |

## Mock/sandbox boundaries

- Local and staging runs must stay mock, sandbox, or disabled for game provider, payment provider, bank statement, SMS, and Slip OCR modes.
- Production DB, production read replicas, production clones, production seed, production migration, and production smoke from a local checkout are forbidden.
- Real money, live payout, live wallet settlement, live provider callbacks, live bank statements, live SMS sending, and live Slip OCR requests are out of scope.
- Demo frontends and backoffice screens remain mock/static unless an endpoint is explicitly wired and verified in a safe environment.
- All money-affecting admin writes must keep auth, permission, reason, audit, idempotency planning, and reconciliation requirements.
- Phase AE read-only probe remains manual-only and must not connect to a DB during all-local smoke.

## Backoffice module list

| Module | Current status | API readiness | Notes |
| --- | --- | --- | --- |
| Dashboard | Backend-ready summary route exists | Partial | Uses admin report summary; UI may still be static/demo. |
| Reports | Backend-ready read routes exist | Partial | Deposit, withdrawal, and wallet-ledger reports are read-only. |
| Member management | Backend-ready | Partial | List/detail/block/unblock and credit/points adjustments exist. |
| Member detail | Backend-ready | Partial | Reads member profile and related wallet context through admin route. |
| Credit adjustment | Backend-ready, guarded | Partial | Local/staging/mock only; production ledger hardening still required. |
| Deposit list | Backend-ready | Partial | Manual deposit list and approval/rejection routes exist. |
| Withdraw list | Backend-ready | Partial | Manual withdrawal list exists. |
| Withdraw review | Backend-ready | Partial | Approve/reject/mark-paid are mock/manual only, no live payout. |
| Bank account management | Backend-ready | Partial | Member bank approval and site bank account management routes exist. |
| Bank statement | Mock/backend-ready | Mock only | Mock statement routes only; no live bank feed. |
| Promotion/bonus | Member API-ready, admin management missing | Partial | Member list/claim exists; admin CRUD is not implemented as a dedicated API. |
| Affiliate | Missing | Missing | Requires data model, API, permissions, and audit spec in a later phase. |
| Ranking | Missing/static | Missing | Requires ranking source, scoring rules, and API. |
| Check-in | Missing/static | Missing | Requires check-in data model, daily limits, reward rules, and audit plan. |
| Lucky Wheel | Backend MVP exists | Backend-ready for mock/staging | No real money, payout, live reward, or frontend-selected result. |
| Coupon | Missing/static | Missing | Requires code lifecycle, redemption, fraud controls, audit, and limits. |
| Shop | Missing/static | Missing | Requires catalog, inventory, redemption, fulfillment, and audit. |
| Mystery box | Missing/static | Missing | Requires reward pool, odds disclosure policy, and fulfillment model. |
| Tournament | Missing/static | Missing | Requires event model, leaderboard source, settlement, and dispute controls. |
| Website settings | Backend-ready | Partial | Site config, theme, bank, game provider, and payment config routes exist for admin. |
| Game settings | Backend-ready for config | Partial | Site game provider config routes exist; live provider certification not started. |
| Register settings | Missing/static | Missing | Requires rules, validation policy, captcha/SMS policy, and admin audit. |
| Commission settings | Missing/static | Missing | Requires finance rules, ledger linkage, reconciliation, and dual control. |
| Admin permissions/audit | Backend-ready | Partial | Permission catalog, roles, schedules, audit logs, and security events exist. |

## Member frontend module list

| Module | Current status | API readiness | Notes |
| --- | --- | --- | --- |
| Home | Static/mock | Partial | Site config and promotions can support real data, but homepage composition is frontend-specific. |
| Login | API-ready | Ready for safe env | `POST /api/auth/login` exists. |
| Register | API-ready | Ready for safe env | `POST /api/auth/register` exists. |
| Profile | API-ready | Ready for safe env | `GET /api/me` exists. |
| Wallet | API-ready | Ready for safe env | `GET /api/wallet`, `GET /api/points`, and `GET /api/wallet/ledger` exist. |
| Deposit | Backend-ready/manual | Partial | Member create/list exists; real payment rail not enabled. |
| Withdraw | Backend-ready/manual | Partial | Member create/list exists; live payout not enabled. |
| Transaction history | Backend-ready | Partial | Wallet ledger plus deposit/withdraw list routes exist. |
| Promotions | API-ready for list/claim | Partial | Admin promotion management is not complete. |
| Ranking | Missing/static | Missing | Requires API and scoring source. |
| Check-in | Missing/static | Missing | Requires API and reward rules. |
| Lucky Wheel | Backend MVP exists | Backend-ready for mock/staging | Member config/spin/history/my-rewards routes exist. |
| Code redeem | Missing/static | Missing | Requires coupon/redeem API. |
| Free credit | Missing/static | Missing | Requires eligibility, anti-abuse, ledger, and audit controls. |
| Shop | Missing/static | Missing | Requires catalog, inventory, and fulfillment API. |
| Inventory/Bag | Missing/static | Missing | Requires item ownership and usage API. |
| Settings | Static/partial | Partial | Profile reads exist; account settings APIs are not complete. |
| Provider game launch | Mock API-ready | Mock only | `/api/game/launch/mock` exists; live provider launch is not certified. |

## Lucky Wheel status

Lucky Wheel backend MVP exists for local/staging/mock use. Member routes support config, spin, history, and my-rewards. Admin routes support campaign, reward, spin, claim, and audit-adjacent review through guarded admin APIs.

The wheel must remain backend-selected. Member frontend must not submit reward id, reward value, probability, or prize index to control the result. Admin claim/cancel is staging/mock item handoff only and must not trigger real payout, provider calls, bank calls, payment calls, SMS, Slip OCR, or live wallet settlement.

## Financial Ledger status

Financial Ledger phases P-U are docs/static/mock/certification only. Existing wallet ledger behavior supports Safe MVP local/staging checks, but production-grade ledger certification is not complete.

The ledger work still needs live integration certification, staging dry-run migration approval, production DB isolation proof, idempotency and reconciliation hardening, dual-control validation, backup/restore proof, monitoring, and final go-live approval before any real-money operation.

## Staging/Production/Live integration status

| Environment or integration | Status | Boundary |
| --- | --- | --- |
| Local | Safe for guarded mock/test use | No production DB, no live integrations. |
| Staging | Prepared for safe staging review | Must use staging/test DB and mock/sandbox/disabled external modes only. |
| Production deploy | Not started/approved | No production launch approval in this phase. |
| Production DB | Not approved | No production migration, seed, smoke, or local connection. |
| Game provider live integration | Not started | Mock/sandbox only until certification. |
| Payment live integration | Not started | No real deposit rail. |
| Bank live integration | Not started | Mock statements only unless sandbox is explicitly approved. |
| SMS live integration | Not started | No live SMS send. |
| Slip OCR live integration | Not started | Mock verify only unless sandbox is explicitly approved. |
| Live payout | Not enabled | No real withdrawal payout or reward payout. |

## Known not-yet-production items

- Production DB credentials, migration, backup/restore, and rollback proof.
- Production platform deployment and production smoke policy.
- Live provider contract review, sandbox callback verification, IP allowlist, and rollback.
- Live payment contract review, callback signature verification, idempotency, and reconciliation.
- Live bank statement or bank transfer integration.
- Live SMS and Slip OCR certification.
- Financial ledger production hardening, schema migration, reconciliation reports, dual control, monitoring, and alerting.
- Backoffice APIs for affiliate, ranking, check-in, coupon, shop, mystery box, tournament, register settings, and commission settings.
- Member frontend APIs for ranking, check-in, code redeem, free credit, shop, inventory/bag, account settings, and live provider launch.
- Admin UI wiring confirmation for every module in a browser against safe staging.
- Full RBAC matrix and audit matrix for every new future module.

## Phase readiness summary

| Phase target | Readiness | Recommendation |
| --- | --- | --- |
| Phase AG: Backoffice API integration | Ready to plan and start with low-risk read endpoints | Start with Dashboard/Reports and Member list/detail before money writes. |
| Phase AH: Member Frontend API integration | Ready to plan after API base/auth handling is locked | Start with login/register/profile/wallet/promotions. |
| Phase AI: Staging deploy readiness | Partially ready | Requires env review, safe staging DB, smoke evidence, and no-live proof. |
| Phase AJ: Live integration certification | Not ready | Must remain certification-only until sandbox contracts and ledger controls are complete. |

Final Phase AF boundary: documentation only. No runtime code, production DB, migration, seed, deploy, real money, live provider, live payment, live bank, live SMS, live Slip OCR, commit, or push.
