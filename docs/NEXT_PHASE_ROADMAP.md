# Next Phase Roadmap

## Recommended next phase options

| Option | Goal | Recommended priority | Start condition | Stop condition |
| --- | --- | --- | --- | --- |
| Phase AG: Backoffice API integration | Wire backoffice screens to existing safe backend APIs | 1 | Confirm admin auth, API base URL, role expectations, and safe staging target | Any production DB, live provider, live payment, live bank, live SMS, live Slip OCR, or real-money need appears |
| Phase AH: Member Frontend API integration | Wire member frontend screens to existing safe member APIs | 2 | Confirm member auth/session handling and frontend API client behavior | Any live provider launch, real payment, live payout, or production DB need appears |
| Phase AI: Staging deploy readiness | Prepare a controlled staging handoff with smoke evidence | 3 | Phase AG/AH core routes are wired or explicitly scoped out | Staging env cannot prove mock/sandbox/disabled external modes or staging DB separation |
| Phase AJ: Live integration certification | Certify live provider/payment/bank/SMS/Slip OCR readiness | 4 | Sandbox contracts, credentials, callback verification, ledger controls, and rollback plan exist | Any certification evidence is missing |

## Phase AG option: Backoffice API integration

Recommended scope:

- Admin login/session handling.
- Dashboard via `GET /api/admin/reports/summary`.
- Reports via existing read-only report routes.
- Member list/detail via `GET /api/admin/members` and `GET /api/admin/members/:id`.
- Deposit and withdrawal lists via existing admin routes.
- Bank pending accounts and site bank account config via existing bank routes.
- Lucky Wheel admin console via existing wheel routes.
- Website/game settings reads before writes.

Defer:

- Credit adjustment writes until reason/audit/idempotency/dual-control expectations are verified.
- Deposit approval, withdrawal approval, and mark-paid writes until ledger/reconciliation smoke coverage is accepted for the target environment.
- Affiliate, ranking, check-in, coupon, shop, mystery box, tournament, register settings, and commission settings until dedicated APIs exist.

Required safety:

- Admin JWT only.
- Backend permission guards are the source of truth.
- All admin writes require a reason and audit review before broad UI exposure.
- No production DB, no real money, no live payout, no live provider/payment/bank/SMS/Slip OCR.

## Phase AH option: Member Frontend API integration

Recommended scope:

- Login/register/profile.
- Wallet balance, points, and wallet ledger.
- Manual deposit create/list.
- Manual withdrawal create/list.
- Bank account list/create.
- Promotions list/claim.
- Lucky Wheel member config/spin/history/my-rewards.
- Mock game provider list, game list, and mock launch.

Defer:

- Live game launch and provider wallet transfer certification.
- Real payment deposit.
- Real withdrawal payout.
- Ranking, check-in, code redeem, free credit, shop, inventory/bag, and account settings update until APIs are defined.

Required safety:

- Member JWT only for private routes.
- Member can access only own data.
- Frontend must not calculate wallet authority, payout authority, reward settlement, or Lucky Wheel spin result.
- No live provider/payment/bank/SMS/Slip OCR and no production DB.

## Phase AI option: Staging deploy readiness

Recommended scope:

- Confirm staging API base URL and CORS.
- Confirm staging/test PostgreSQL target only.
- Confirm external modes are mock, sandbox, or disabled.
- Confirm secret handling uses platform secret manager and no committed credentials.
- Run safe smoke tests for health, auth negative paths, admin permissions, bank mock module, Lucky Wheel, and core API routes.
- Capture go/no-go evidence without printing secrets.

Non-goals:

- No production deploy.
- No production migration.
- No production seed.
- No real provider/payment/bank/SMS/Slip OCR.
- No real money or live payout.

## Phase AJ option: Live integration certification

Recommended scope:

- Provider sandbox login, launch, transfer, callback, and bet-history certification.
- Payment sandbox deposit callback and reconciliation certification.
- Bank statement sandbox/read-only feed certification.
- SMS sandbox send and template certification.
- Slip OCR sandbox verification certification.
- Financial ledger hardening, idempotency, reconciliation, dual control, backup/restore, monitoring, and rollback proof.

Start only after:

- Phase U-style certification checklist is fully reviewed.
- Sandbox credentials and provider documentation are available through approved secret handling.
- Production DB isolation is proven.
- Staging dry-run migration and rollback plans are approved.
- Smoke tests and response leak scans are passing.

## Risk ranking

| Rank | Risk | Severity | Why it matters | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Real-money or live payout enabled before ledger certification | Critical | Can create irreversible financial loss and reconciliation gaps | Keep all money flows mock/manual until ledger, dual control, idempotency, audit, and reconciliation pass. |
| 2 | Production DB touched from local/staging workflow | Critical | Can corrupt or expose production data | Keep production DB forbidden; require staging/test DB markers and guarded commands. |
| 3 | Live provider/payment/bank/SMS/Slip OCR used without sandbox certification | Critical | Can leak credentials, move money, or call real customers/providers | Keep modes mock/sandbox/disabled and require certification evidence. |
| 4 | Admin UI exposes write controls without backend permission/audit validation | High | Can bypass operational controls or hide unsafe actions | Backend permissions remain source of truth; every write needs reason/audit tests. |
| 5 | Lucky Wheel frontend result injection | High | Can manipulate rewards and liability | Backend must select results; reject reward id, prize index, probability, or value control from member payloads. |
| 6 | Missing idempotency on money/reward writes | High | Can duplicate deposits, withdrawals, claims, rewards, or transfers | Add/review idempotency keys before live integration. |
| 7 | Secret or unsafe data in logs/responses/docs | High | Can expose credentials or sensitive member/admin data | Run leak scans and keep redaction rules. |
| 8 | Static/mock UI mistaken for production-ready feature | Medium | Can create false go-live confidence | Label status explicitly in API mapping and handoff notes. |

## Suggested first API integration target

Start with Phase AG read-only backoffice integration:

1. `POST /api/admin/auth/login`
2. `GET /api/admin/me`
3. `GET /api/admin/permissions/me`
4. `GET /api/admin/reports/summary`
5. `GET /api/admin/members`
6. `GET /api/admin/members/:id`
7. `GET /api/admin/deposits`
8. `GET /api/admin/withdrawals`

Reason: these routes provide immediate operational value, exercise admin auth and permissions, and avoid first touching high-risk money write paths. After read-only paths are stable, add guarded write flows one at a time with reason/audit/idempotency checks.

## What must remain mock/sandbox

- Game provider launch, transfer, callback, and bet history until provider sandbox certification is complete.
- Payment provider deposit rails and callbacks until payment sandbox certification is complete.
- Bank statements, bank transfers, and bank verification until bank sandbox/read-only certification is complete.
- SMS sending until SMS sandbox certification is complete.
- Slip OCR until OCR sandbox certification is complete.
- Lucky Wheel reward payout, claim fulfillment, and live reward settlement.
- Financial ledger reconciliation and production settlement.
- Affiliate commission, ranking rewards, check-in rewards, coupon redemptions, shop orders, mystery boxes, tournament rewards, free credit, and provider transfers until their APIs and controls are certified.

## Required smoke tests before commit

Before committing a future implementation phase, run only tests appropriate to the changed scope and safe environment. For Phase AF itself, only documentation checks are required.

Minimum for docs-only changes:

```powershell
git status --short
git diff --check
```

Also run the raw rendered-placeholder scan required by the phase checklist against these three docs. Do not persist the raw scan pattern in these docs, because that would make the scan match the checklist text itself.

Minimum for future backoffice API wiring:

```powershell
npm run check
npm run smoke:admin-reports-config
npm run smoke:admin-permission
npm run smoke:admin-role-management
npm run smoke:admin-audit-security
git diff --check
```

Minimum for future member API wiring:

```powershell
npm run check
npm run smoke:core-api
npm run smoke:money-flow
npm run smoke:promotion-claim
npm run smoke:wheel
git diff --check
```

Minimum for future staging readiness:

```powershell
npm run smoke:staging
npm run smoke:staging-release-readiness
npm run smoke:staging-deploy-readiness-pack
git diff --check
```

Do not commit if any required smoke fails, if external modes are not mock/sandbox/disabled, if a production-like database or API target is detected, or if a response leak scan finds credential-shaped data.

## Phase AF closeout boundary

Phase AF creates only:

- `docs/MASTER_SPEC.md`
- `docs/API_MAPPING.md`
- `docs/NEXT_PHASE_ROADMAP.md`

No runtime code, production DB, migration, seed, deploy, real money, live provider, live payment, live bank, live SMS, live Slip OCR, commit, or push is part of this phase.
