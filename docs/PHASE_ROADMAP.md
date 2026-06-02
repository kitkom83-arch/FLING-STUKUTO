# Phase Roadmap

Phase AJ status: master roadmap after Phase AH and Phase AI closure.

Safety boundary: docs/static only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, and no runtime write action is enabled here.

## Completed Phases

| Phase | Goal | Scope | Allowed files | Forbidden actions | Required tests | Exit criteria | Safety boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Phase W/X/Y/Z Safe MVP / Handoff | Close Safe MVP, Lucky Wheel local verification, and operator handoff. | Static docs, local smoke, handoff runbooks, Lucky Wheel final UAT. | Docs, local smoke scripts, safe UI/static assets from those phases. | Production DB, real money, live payout, live provider/payment/bank/SMS/Slip OCR, migration, deploy. | `npm run check`, relevant local smoke, Safe CI. | Safe CI passed and handoff docs recorded safe boundaries. | Local/staging/mock/sandbox only. |
| Phase AH Admin Member Detail API Integration | Add admin member detail/history read-only API integration. | Read-only member detail/history, blocked members, pending bank views, audit mapping. | Admin read-only UI/API files and smoke/docs from Phase AH. | Member write actions, bank mutation, live bank, production DB, migration, deploy. | `npm run check`, admin member history read-only smoke, Safe CI. | Read-only routes/UI verified and Safe CI passed at baseline `b88e4f9`. | Read-only implemented; no runtime write action. |
| Phase AI Browser Validation | Validate safe admin/member flows in browser. | Browser validation for existing safe flows. | Browser validation artifacts/docs/smoke only. | Production DB, real money, live integration, migration, deploy. | Safe browser validation, Safe CI run `26598664557`. | Safe CI completed successfully for `b88e4f9`. | Validation only; no live rails. |

## Next Phases

| Phase | Goal | Scope | Allowed files | Forbidden actions | Required tests | Exit criteria | Safety boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Phase AJ Master Spec / API Mapping | Consolidate all system specs into central docs for safe future API integration. | `MASTER_BACKOFFICE_SPEC`, `MASTER_FRONTEND_MEMBER_SPEC`, `API_MAPPING`, `PERMISSION_MATRIX`, `AUDIT_LOG_MATRIX`, `PHASE_ROADMAP`, static smoke, coverage docs. | `docs/MASTER_BACKOFFICE_SPEC.md`, `docs/MASTER_FRONTEND_MEMBER_SPEC.md`, `docs/API_MAPPING.md`, `docs/PERMISSION_MATRIX.md`, `docs/AUDIT_LOG_MATRIX.md`, `docs/PHASE_ROADMAP.md`, `src/local-smoke-tests/masterSpecMappingSmoke.js`, `package.json`, `docs/SMOKE_COVERAGE.md`, `src/local-smoke-tests/runAllLocalSmoke.js`. | Controller/service/route runtime money changes, production DB, real money, live provider/payment/bank/SMS/Slip OCR, migration, deploy, secrets. | `npm run check`, `npm run smoke:master-spec-mapping`, `npm run smoke:all-local`, `git diff --check`. | Static smoke confirms required docs, mapping, permissions, audit, roadmap, and no unsafe secret/live enablement wording. | Docs/static only; no runtime behavior change. |
| Phase AK Admin Backoffice Read-only API Integration | Wire more backoffice screens to existing safe read APIs. | Dashboard, reports, members, bank pending, audit/security, wheel read views. | Admin UI read-only assets, safe client helpers, docs/smoke for read-only coverage. | Money writes, approval writes, provider live calls, production DB, migration, deploy. | `npm run check`, relevant admin read-only smokes, browser validation, Safe CI. | Read-only screens load from guarded APIs and handle 401/403/empty/error states. | Read-only only; backend guards remain authority. |
| Phase AL Admin Write Actions with guard/audit | Add or expose admin writes one at a time with strict guard/audit. | Bank approval/reject, blacklist, promotion/wheel/settings writes, wallet/withdraw only after dual-control plan. | Specific controller/service/route/UI/smoke files approved for each write. | Unguarded writes, missing reason, missing audit, self-approval, live rails, production DB, migration without approval. | `npm run check`, targeted write smoke, safety tests, audit verification, negative permission tests. | Each write has permission guard, reason, audit before/after, idempotency where needed, no self-approval where needed. | Staging/mock only; no real-money or live action until certification. |
| Phase AM Admin Bank Account Review Audit & Operator Handoff | Add read-only review history and operator handoff for guarded bank account review. | Bank Account Review Audit / Review History panel, action/username/target/date filters, summary cards, operator safety copy, docs/smoke coverage. | Admin UI, existing read-only audit endpoint wiring, docs/smoke files approved for Phase AM. | New write action, credit/debit, payout, withdrawal approve, live transfer, provider/payment/bank/SMS/Slip OCR live, production DB, migration, deploy. | `npm run check`, `npm run smoke:admin-operator-handoff`, Phase AL/AK admin smokes, browser validation, leak scan. | Operators can view sanitized `member.bank.approve` / `member.bank.reject` history with `admin.audit.view`; reason required, audit required, duplicate reviewed safe `409`, and no dangerous controls are documented and visible. | Read-only operator handoff; local/staging/mock only; no real-money or live action. |
| Phase AN Admin Bank Account Review Release Pack / UAT Checklist | Prepare release pack, UAT checklist, and operator runbook for Admin Bank Account Review before staging/mock use. | UAT checklist, operator runbook, release readiness pack, smoke/static safety coverage, staging/mock handoff references. | Approved docs, package script, release-pack smoke, and runAll registration only. | New runtime write action, credit/debit, payout, withdrawal approve, live transfer, production DB, migration, deploy, live provider/payment/bank/SMS/Slip OCR. | `npm run check`, `npm run smoke:admin-bank-account-review-release-pack`, Phase AL/AM smokes, `git diff --check`, full local smoke before commit readiness. | Release pack documents Pending Bank Accounts, approve/reject modal, reason required, audit/history, operator handoff, permission behavior, safe errors, rollback, and go/no-go checks. | Docs/static only; no runtime behavior change; local/staging/mock only. |
| Phase AO Payment Provider Contract / Dual TrueMoney Provider | Define provider contracts for TrueMoney Official / Partner Gateway, TMNOne, and QR Payment / Payment Gateway. | Provider interface, mock-only contract, order/ref mapping, callback/inquiry contract, duplicate guard, idempotency key, audit log, secret redaction, configurable limits. | Docs, static contract, isolated mock helper, mock harness, smoke registration. | Runtime money-flow, production DB, real money, live provider/payment/bank/SMS/Slip OCR, credit/debit runtime action, payout, withdrawal approve, migration, deploy, hardcoded secrets. | `npm run smoke:payment-provider-contract`, `npm run check`, no-live-money-provider guard, secret scan. | Provider keys `truemoney_official`, `tmnone`, and `qr_payment_gateway` are mapped with mock-only safety and no live rail. | Mock/contract only; no real money, no live provider, no runtime money-flow. |
| Phase AP Member QR Deposit UX / Mock QR Download | Define member QR deposit UX contract and mock QR download harness. | Mock/UX contract only; providerKey `qr_payment_gateway`; mock QR order, mock QR preview, mock QR download artifact, expiry/cancel/duplicate guard docs and smoke. | Phase AP allowed docs, `src/payment-provider-mock/memberQrDepositUxContract.js`, `src/payment-provider-mock/memberQrDepositMockHarness.js`, `src/local-smoke-tests/memberQrDepositUxSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`. | Runtime money-flow, production DB, real money, real QR, live provider/payment/bank/SMS/Slip OCR, live QR payment gateway, auto-credit, payout, migration, deploy, external network, hardcoded secrets. | `npm run smoke:member-qr-deposit-ux`, `npm run check`, `git diff --check`, full local smoke before commit readiness. | Mock QR UX contract and mock download artifact are covered; QR download must never credit member; expired/cancelled/duplicate QR guards are documented and tested. | Mock/UX contract only; no real QR, no real payment, no live provider, no runtime money-flow, no auto-credit. |
| Phase AQ Deposit Verification Source Mock Harness | Define deposit verification source mock harness. | Mock/source verification contract only; QR mock order source, provider mock event, slip verification mock, bank statement mock, SMS fallback mock, manual admin mock, duplicate guards, idempotency, manual review routing, no auto-credit. | Phase AQ allowed docs, `src/payment-provider-mock/depositVerificationSourceContract.js`, `src/payment-provider-mock/depositVerificationSourceMockHarness.js`, `src/local-smoke-tests/depositVerificationSourceSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`. | Runtime money-flow, production DB, real money, real QR, real payment, live provider/payment/bank/SMS/Slip OCR, live TrueMoney, live TMNOne, live QR payment gateway, auto-credit, payout, migration, deploy, external network, hardcoded secrets. | `npm run smoke:deposit-verification-source`, `npm run check`, `git diff --check`, full local smoke before commit readiness. | Source verification contract and harness are covered; SMS fallback stays weak/manual_review, QR download never credits, expired/cancelled QR cannot match, and duplicates are rejected or duplicate_suspect. | Mock/source verification contract only; no real QR, no real payment, no live provider, no runtime money-flow, no auto-credit. |
| Phase AR Ledger/Reconciliation Guard | Define deposit ledger/reconciliation guard recommendation contract. | Mock/ledger guard contract only; consumes Phase AQ sources and returns mock recommendations, reconciliation snapshots, mismatch review, duplicate suspect, manual review, and rejection markers. | Phase AR allowed docs, `src/ledger-mock/depositLedgerReconciliationGuard.js`, `src/ledger-mock/depositLedgerReconciliationGuardHarness.js`, `src/local-smoke-tests/depositLedgerReconciliationGuardSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`. | Runtime money-flow, production DB, real money, real QR, real payment, live provider/payment/bank/SMS/Slip OCR, live TrueMoney, live TMNOne, live QR payment gateway, auto-credit, payout, migration, deploy, external network, runtime ledger mutation, ledger posting runtime action, hardcoded secrets. | `npm run smoke:deposit-ledger-reconciliation-guard`, `npm run check`, `git diff --check`, full local smoke before commit readiness. | Ledger guard contract and harness are covered; `ledger_posting_candidate_mock` is only a mock recommendation and never credits, debits, mutates wallet, or posts ledger. | Mock/ledger guard contract only; no real QR, no real payment, no live provider, no runtime money-flow, no auto-credit, no runtime ledger mutation. |
| Phase AS Sandbox Integration | Prove sandbox-readiness contracts before any live certification. | Sandbox readiness contract only; provider modes `mock`, `sandbox_configured_not_called`, `sandbox_dry_run_only`, and future marker `live_after_certification_only`; no external network execution in Phase AS. | Phase AS allowed docs, `src/sandbox-integration/sandboxIntegrationReadinessContract.js`, `src/sandbox-integration/sandboxIntegrationReadinessHarness.js`, `src/local-smoke-tests/sandboxIntegrationReadinessSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`. | Live provider/payment/bank/SMS/Slip OCR, production DB, real money, real QR, payout, withdrawal approve, auto-credit, runtime money-flow, runtime ledger mutation, external network execution in Phase AS, real secrets. | `npm run smoke:sandbox-integration-readiness`, `npm run check`, `git diff --check`, full local smoke before commit readiness. | Sandbox readiness contract and harness are covered; sandbox result must never credit member, mutate wallet, post real ledger, or call external network. | sandbox readiness contract only; no real QR, no real payment, no live provider, no runtime money-flow, no auto-credit, no runtime ledger mutation. |
| Phase AT Live Certification | Final approval gate before live payment/provider/bank use. | Security checklist, provider credentials checklist, webhook signature checklist, rollback proof, backup/restore proof, reconciliation proof, final approval. | Certification docs/evidence only unless explicitly approved. | Direct live use without approval, production DB mutation from uncertified flow, real payout, secret hardcoding, missing audit/reconciliation. | Security PASS, provider credential PASS, webhook signature PASS, rollback PASS, backup/restore PASS, reconciliation PASS, audit PASS, permission PASS, secret scan PASS, final approval. | Live is blocked until all certification evidence and final approval are recorded. | Certification only; no live operation by default. |
| ORO-0 OroPlay Docs Only | Align docs with current OroPlay production context and safe Seamless Wallet plan. | Docs/static only: current status, integration plan, Seamless Wallet contract, API mapping, roadmap, smoke coverage. | `docs/OROPLAY_CURRENT_STATUS.md`, `docs/OROPLAY_INTEGRATION_PLAN.md`, `docs/OROPLAY_SEAMLESS_WALLET_CONTRACT.md`, `docs/API_MAPPING.md`, `docs/PHASE_ROADMAP.md`, `docs/SMOKE_COVERAGE.md`. | Runtime code, routes, controllers, services, migrations, deploy, production DB, real money runtime flow, live payout, live provider calls, callback wallet mutation, hardcoded secrets. | `npm run check`, `npm run smoke:master-spec-mapping`, `git diff --check`. | OroPlay docs and planning rows exist, contain no secrets, and preserve docs/static boundary. | Docs/static only; no runtime behavior change. |
| ORO-2A OroPlay Callback API Design / Staging Route Boundary | Define callback route plan, Basic Auth boundary, payload shape, amount intent, sanitizer, and no-mutation rules. | Design/staging-boundary only; docs/static plus isolated mock boundary and static smoke. | `docs/OROPLAY_CALLBACK_API_DESIGN.md`, `src/game-provider-mock/oroplayCallbackBoundary.js`, `src/local-smoke-tests/oroplayCallbackBoundarySmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`, `docs/API_MAPPING.md`, `docs/PHASE_ROADMAP.md`, `docs/SMOKE_COVERAGE.md`, `docs/OROPLAY_INTEGRATION_PLAN.md`, `docs/OROPLAY_SEAMLESS_WALLET_CONTRACT.md`. | Express callback route, production DB, real money, live OroPlay API call, external network, real client secret, runtime wallet mutation, runtime ledger mutation, auto-credit, payout, migration, deploy. | `npm run check`, `npm run smoke:oroplay-callback-boundary`, `npm run smoke:oroplay-seamless-contract`, `git diff --check`, secret scan. | Smoke confirms preferred routes, optional provider-required aliases, Basic Auth env-only boundary, payload shape, amount rule, no runtime mutation, sanitizer, and static secret scan. | Docs/static/mock boundary only; no runtime behavior change. |
| ORO-2B Staging Callback Stub Route Skeleton | Add fail-closed staging callback route skeletons for preferred OroPlay callback paths. | Staging/mock/fail-closed route skeleton only; no alias mount; no callback processing. | `src/controllers/oroplayCallbackStub.controller.js`, `src/routes/oroplayCallbackStub.routes.js`, `src/game-provider-mock/oroplayCallbackStubContract.js`, `src/local-smoke-tests/oroplayCallbackStubSmoke.js`, `src/app.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`, `docs/OROPLAY_CALLBACK_API_DESIGN.md`, `docs/OROPLAY_INTEGRATION_PLAN.md`, `docs/API_MAPPING.md`, `docs/SMOKE_COVERAGE.md`, `docs/PHASE_ROADMAP.md`. | Production DB, real money, live OroPlay API call, external network, real client secret, runtime wallet mutation, runtime ledger mutation, auto-credit, payout, migration, deploy, provider alias mount. | `npm run check`, `npm run smoke:oroplay-callback-stub`, `npm run smoke:oroplay-callback-boundary`, `npm run smoke:oroplay-seamless-contract`, `git diff --check`, secret scan. | Smoke confirms route skeletons, fail-closed response, optional alias disabled guard, sanitizer, no mutation, no live provider, and no secret-shaped values. | ORO-2B current/fail-closed route skeleton; no runtime wallet or ledger behavior. |
| ORO-2C Callback Runtime Readiness Contract | Define readiness contract for member mapping, callback payload validation, idempotency, duplicate guard, sanitized callback logs, and ledger/reconciliation prerequisites. | Docs/static/mock readiness only; no runtime processing; no alias mount; no callback money-flow. | `docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md`, `src/game-provider-mock/oroplayCallbackReadinessContract.js`, `src/game-provider-mock/oroplayCallbackReadinessHarness.js`, `src/local-smoke-tests/oroplayCallbackReadinessSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`, `docs/OROPLAY_CALLBACK_API_DESIGN.md`, `docs/OROPLAY_INTEGRATION_PLAN.md`, `docs/API_MAPPING.md`, `docs/SMOKE_COVERAGE.md`, `docs/PHASE_ROADMAP.md`. | Production DB, real money, live OroPlay API call, external network, real client secret, runtime wallet mutation, runtime ledger mutation, Prisma write, auto-credit, payout, migration, deploy, provider alias mount. | `npm run check`, `npm run smoke:oroplay-callback-readiness`, `npm run smoke:oroplay-callback-stub`, `npm run smoke:oroplay-callback-boundary`, `npm run smoke:oroplay-seamless-contract`, `git diff --check`, secret scan. | Smoke confirms readiness contract, mock scenarios, member mapping, idempotency, sanitized log boundary, ledger/reconciliation boundary, ORO-2B fail-closed default, optional alias disabled guard, and no secret-shaped values. | ORO-2C current/readiness only; ORO-3 blocked until ORO-2C pass and runtime safety gates are approved. |
| ORO-3A Callback Runtime Simulation Harness | Simulate OroPlay callback runtime decisions without mutation. | Docs/static/mock simulation only; no runtime processing; no alias mount; no callback money-flow. | `docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md`, `src/game-provider-mock/oroplayCallbackRuntimeSimulator.js`, `src/game-provider-mock/oroplayCallbackRuntimeScenarios.js`, `src/local-smoke-tests/oroplayCallbackRuntimeSimulationSmoke.js`, `package.json`, `src/local-smoke-tests/runAllLocalSmoke.js`, `docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md`, `docs/OROPLAY_CALLBACK_API_DESIGN.md`, `docs/OROPLAY_INTEGRATION_PLAN.md`, `docs/API_MAPPING.md`, `docs/SMOKE_COVERAGE.md`, `docs/PHASE_ROADMAP.md`. | Production DB, real money, live OroPlay API call, external network, real client secret, runtime wallet mutation, runtime ledger mutation, Prisma write, auto-credit, payout, migration, deploy, provider alias mount. | `npm run check`, `npm run smoke:oroplay-callback-runtime-simulation`, `npm run smoke:oroplay-callback-readiness`, `npm run smoke:oroplay-callback-stub`, `npm run smoke:oroplay-callback-boundary`, `npm run smoke:oroplay-seamless-contract`, `git diff --check`, secret scan. | Smoke confirms runtime simulation coverage, idempotency/replay coverage, ledger intent only coverage, no mutation coverage, sanitizer coverage, ORO-2B fail-closed default, and alias disabled guard. | ORO-3A current/simulation; ORO-3B blocked until ORO-3A pass. |

## Phase Gates

- Every phase starts with clean working tree and latest Safe CI verification for the baseline commit.
- Any phase that touches runtime writes must include permission, reason, audit, before/after snapshot, negative permission tests, and leak scan.
- Any phase that touches money-like flow must include idempotency and reconciliation plan before staging.
- Any phase that touches live integration must complete certification before live use.

Phase sequence after AP:

- Phase AQ: Deposit Verification Source Mock Harness.
- Phase AR: Ledger/Reconciliation Guard.
- Phase AS: Sandbox Integration.
- Phase AT: Live Certification.

Phase AQ status marker:

- mock/source verification contract only.
- no real QR.
- no real payment.
- no live provider.
- no runtime money-flow.
- no auto-credit.

Phase sequence after AQ:

- Phase AR: Ledger/Reconciliation Guard.
- Phase AS: Sandbox Integration.
- Phase AT: Live Certification.

Phase AR status marker:

- mock/ledger guard contract only.
- no real QR.
- no real payment.
- no live provider.
- no runtime money-flow.
- no auto-credit.
- no runtime ledger mutation.

Phase next after AR:

- Phase AS: Sandbox Integration.
- Phase AT: Live Certification.

Phase AS status marker:

- sandbox readiness contract only.
- no real QR.
- no real payment.
- no live provider.
- no runtime money-flow.
- no auto-credit.
- no runtime ledger mutation.
- no external network execution in Phase AS.

Phase next after AS:

- Phase AT: Live Certification.

OroPlay phase sequence after current mock/contract phases:

- ORO-0: docs only.
- ORO-1: mock contract only.
- ORO-2A: closed callback API design / staging route boundary only.
- ORO-2B: closed/fail-closed route skeleton. ORO-2B closed.
- ORO-2C: closed/readiness contract only. ORO-2C closed.
- ORO-3A: current/simulation. ORO-3A current/simulation.
- ORO-3B: member mapping, ledger source of truth, callback logs, game transactions, idempotency, and reconciliation alignment. ORO-3B blocked until ORO-3A pass.
- ORO-2B current/fail-closed route skeleton remains the active fail-closed runtime default.
- ORO-3 is not allowed until ORO-2B passes; ORO-2C and ORO-3A add newer gates before runtime work.
- ORO-3B is not allowed until ORO-2B and ORO-2C are closed and ORO-3A passes.
- ORO-4: sandbox/staging integration.
- ORO-5: live certification only after approval.

ORO-0 status marker:

- docs/static only.
- current production direction is Seamless Wallet unless confirmed otherwise.
- no production DB.
- no real money runtime flow.
- no live provider call.
- no callback wallet mutation.
- no hardcoded secret.
- no migration.
- no deploy.

ORO-2A status marker:

- design/staging-boundary only.
- preferred routes are `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`.
- optional aliases `POST /api/balance` and `POST /api/transaction` are provider-required-only.
- Basic Auth boundary uses env-only credentials.
- payload boundary covers `userCode`, `transactionCode`, `roundId`, `amount`, and `isFinished`.
- negative amount is bet/debit intent; positive amount is win/credit intent; zero or malformed amount is invalid.
- no production DB.
- no real money.
- no live OroPlay API call.
- no external network.
- no client secret.
- no runtime wallet mutation.
- no runtime ledger mutation.
- no migration.
- no deploy.

ORO-2B status marker:

- closed/fail-closed route skeleton.
- active skeleton routes are `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`.
- optional aliases `POST /api/balance` and `POST /api/transaction` are disabled/provider-required-only.
- default response is disabled/fail-closed.
- no production DB.
- no real money.
- no live OroPlay API call.
- no external network.
- no client secret.
- no runtime wallet mutation.
- no runtime ledger mutation.
- no migration.
- no deploy.

ORO-2C status marker:

- closed callback runtime readiness contract only.
- covers member mapping, payload validation, idempotency, sanitized log boundary, and ledger/reconciliation boundary.
- ORO-2C does not query DB and does not write Prisma records.
- ORO-2B fail-closed route remains default.
- optional aliases `POST /api/balance` and `POST /api/transaction` remain disabled/provider-required-only.
- no production DB.
- no real money.
- no live OroPlay API call.
- no external network.
- no client secret.
- no runtime wallet mutation.
- no runtime ledger mutation.
- no migration.
- no deploy.
- ORO-3A was opened only after ORO-2C readiness closure.

ORO-3A status marker:

- current/simulation only.
- balance simulation reads mock state only.
- transaction simulation returns decisions only.
- ledger intent and reconciliation intent are mock objects only.
- duplicate replay is idempotent and conflicting duplicate enters manual_review / fail-closed.
- ORO-2B fail-closed route remains default.
- optional aliases `POST /api/balance` and `POST /api/transaction` remain disabled/provider-required-only.
- no production DB.
- no real money.
- no live OroPlay API call.
- no external network.
- no client secret.
- no runtime wallet mutation.
- no runtime ledger mutation.
- no Prisma write.
- no migration.
- no deploy.
- ORO-3B blocked until ORO-3A pass.
