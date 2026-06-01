# Admin Bank Account Review Release Pack

Phase AN status: release readiness pack for Admin Bank Account Review before staging/mock operator use.

Safety boundary: local/staging/mock only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, no credit/debit, no payout, and no new runtime write action is approved by this document.

## Release Scope

This release pack covers the existing Admin Bank Account Review work from Phase AL and Phase AM:

- Pending Bank Accounts read-only listing.
- Guarded approve/reject for pending bank accounts.
- Required reason validation.
- Permission behavior.
- Audit/history visibility.
- Operator handoff.
- UAT and release readiness evidence.

This release pack does not add runtime behavior. It documents how to validate and hand off the existing guarded flow safely.

## Included Phases

- Phase AL: Admin Guarded Bank Account Review.
- Phase AM: Admin Bank Account Review Audit & Operator Handoff.
- Phase AN: Admin Bank Account Review Release Pack / UAT Checklist.

## Endpoints Involved

- `GET /api/admin/bank-accounts/pending`
- `POST /api/admin/bank-accounts/:id/approve`
- `POST /api/admin/bank-accounts/:id/reject`
- `GET /api/admin/audit-logs?action=member.bank.approve|member.bank.reject&target_type=user_bank_account`

The audit/history endpoint is read-only and uses the existing audit log route. It must not change bank status, create review actions, or call live integrations.

## Permissions Involved

- `members.bank.view`: read pending bank accounts.
- `members.bank.approve`: approve or reject pending bank accounts.
- `admin.audit.view`: read Bank Account Review Audit / Review History.

If a documentation matrix uses the generic label `audit.view`, it maps to the existing admin audit read permission used by the UI/API contract: `admin.audit.view`.

## Audit Actions

- `member.bank.approve`
- `member.bank.reject`

Required audit metadata:

- reason
- previousStatus
- nextStatus
- targetType = `user_bank_account`
- targetId
- actor admin id/username
- siteCode
- before/after sanitized snapshots

## Validation Commands

Run before declaring release readiness:

```powershell
npm run check
npm run smoke:admin-bank-account-review-release-pack
npm run smoke:admin-guarded-bank-account-review
npm run smoke:admin-operator-handoff
git diff --check
```

Run full local smoke only from an interactive PowerShell session when safe local/staging/mock credentials are available through an approved secret channel:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\run-local-smoke.ps1
```

Expected full local smoke markers:

- `final result: PASS`
- `=== DONE: smoke passed ===`

Do not paste credential values, request headers, database connection strings, tokens, or environment values into reports.

## Manual Browser Checklist

- Dashboard loads.
- Member List loads.
- Pending Bank Accounts loads.
- Pending accounts visible, or safe empty state if no fixture exists.
- Approve modal opens.
- Reject modal opens.
- Reason required validation works.
- Authorized plus reason succeeds only in local/staging/mock.
- Duplicate reviewed returns safe `409`.
- Bank Account Review Audit / Review History loads.
- Operator Handoff is visible.
- Action filter all/approve/reject works.
- History table or empty state is safe.
- Console has no red errors.
- No `undefined`, `NaN`, or object-string placeholder copy is visible.
- No dangerous buttons: credit/debit, payout, live transfer, provider live, approve withdrawal.

## Regression Checklist

- No login = `401`.
- No permission = `403`.
- No reason = `400`.
- Duplicate reviewed = safe `409`.
- Authorized plus reason = success against local/staging/mock only.
- Audit metadata exists.
- Response leak scan passes.
- Safe error state does not expose raw stack or sensitive values.

## Staging/Mock Verification

- Target environment is staging, test, or local.
- Database is dedicated staging/test/local PostgreSQL only.
- No production DB.
- No real money.
- No live provider/payment/bank/SMS/Slip OCR.
- No migration.
- No deploy from this phase.
- External modes are mock, sandbox, or disabled.
- Credentials are supplied through the approved secret channel only.
- Evidence reports contain PASS/FAIL markers only, not secret values.

## Go/No-Go Checklist

GO only if:

- Safe CI is success for the release commit.
- `npm run check` passes.
- `npm run smoke:admin-bank-account-review-release-pack` passes.
- `npm run smoke:admin-guarded-bank-account-review` passes.
- `npm run smoke:admin-operator-handoff` passes.
- `git diff --check` has no errors.
- `run-local-smoke.ps1` passes in an interactive safe local/staging/mock session.
- Manual browser checklist passes or records no fixture with safe empty state.
- No secret-shaped values appear in docs, UI, logs, smoke output, or responses.

NO-GO if:

- Any auth, permission, reason, duplicate, or audit guard fails.
- Any production DB signal appears.
- Any real-money, payout, transfer, wallet credit/debit, withdrawal approval, live provider/payment/bank/SMS/Slip OCR path is reachable.
- Any response or UI leaks raw stack or sensitive values.
- Manual browser check has red console errors.
- Full local smoke lacks reliable PASS markers.

## Rollback Notes

This phase is docs/static smoke only and does not change runtime behavior. If a staging/mock handoff fails:

- Stop operator use.
- Keep external modes mock/sandbox/disabled.
- Do not switch to production DB as a workaround.
- Revert or disable the staging deploy only through the approved release process.
- Record the failed checklist item, safe error message, commit hash, Safe CI Run ID, and environment label.
- Do not record credentials, raw request headers, database connection strings, or environment values.

## Safety Boundaries

- No production DB.
- No real money.
- No live provider/payment/bank/SMS/Slip OCR.
- No migration.
- No deploy.
- No credit/debit.
- No payout.
- No withdrawal approve.
- No live transfer.
- No new runtime write action.
- No auth, permission, reason, duplicate, or audit guard reduction.

## Payment Provider Roadmap: Dual TrueMoney + QR Gateway + Bank Verification

Status: Backlog / Next Phase after Phase AN. This is not runtime work in Phase AN and does not connect a real API, change money-flow logic, enable real money, enable live provider/payment/bank/SMS/Slip OCR, add migration, deploy, credit/debit, payout, withdrawal approve, or add a new runtime write action.

Required roadmap markers:

- mock/sandbox/staging only
- no production DB
- no real money
- no live provider/payment/bank/SMS/Slip OCR
- no credit/debit runtime action in this phase
- no payout
- no withdrawal approve
- no migration
- no deploy
- no hardcoded secret/token/password/DATABASE_URL
- SMS fallback is manual_review only
- frontend must not decide credit posting
- provider event must pass idempotency + audit + reconciliation guard before future credit posting

### 1. TrueMoney Official / Partner Gateway

- provider key: `truemoney_official`
- mode: `mock` / `sandbox` / `live` after certification only
- status: official route, long-term primary path, not real money in Phase AN
- create payment order
- callback / webhook
- payment inquiry
- `orderId` / `refId` mapping
- duplicate transaction guard
- idempotency key
- audit log
- secret redaction
- no hardcoded credential

### 2. TMNOne / tmn.one

- provider key: `tmnone`
- mode: `mock` / `sandbox/internal` / `live` after certification only
- status: practical TrueMoney provider and second TrueMoney rail
- wallet balance inquiry
- transaction history
- transaction info
- deposit / receive matching
- backoffice-controlled transfer/withdrawal in a future certified phase only
- per-user limit
- per-transaction limit
- daily limit
- role approval
- audit log
- duplicate lock
- configurable limit
- secret/token/PIN/device data must stay in ENV or secret manager only
- live transfer/withdrawal is forbidden now

### 3. QR Payment / Payment Gateway

- provider key: `qr_payment_gateway`
- generate QR order
- show QR on member page
- download QR button
- open QR full screen
- copy amount
- copy reference/orderId
- callback / inquiry
- payment status
- QR expiration
- reconciliation

Member QR UX must support customers with one mobile device:

- show QR
- button: “ดาวน์โหลด QR”
- button: “เปิด QR เต็มจอ”
- button: “คัดลอกยอดเงิน”
- button: “คัดลอกเลขอ้างอิง”
- button: “อัปโหลดสลิป”
- copy: หากใช้มือถือเครื่องเดียว ให้กดดาวน์โหลด QR แล้วเปิดแอปธนาคารเพื่อสแกนจากรูปภาพในเครื่อง

### 4. Slip Verification

- provider key: `slip_verification`
- upload slip
- read slip reference
- verify slip
- check amount
- check receiver account
- check transfer time
- duplicate slip guard
- uncertain result -> `manual_review`
- no auto-credit if verification confidence is low

### 5. Statement API

- provider key: `bank_statement`
- fetch statement
- normalize bank transaction
- match deposit order
- unmatched queue
- duplicate guard
- daily reconciliation
- read-only/sandbox first
- no production bank account in current phase

### 6. Bank SMS Fallback

- provider key: `bank_sms_fallback`
- fallback only
- internal receiver device only
- use only our own system device, SIM, and account
- do not read customer SMS
- do not read OTP
- do not store password/token
- allowlist sender such as SCB/KBANK after real testing
- allowlist receiver device
- parse amount/time/account conservatively
- raw SMS hash duplicate guard
- redact sensitive text
- create weak deposit signal
- default status: `manual_review`
- allowed state: `sms_detected -> manual_review`
- forbidden state: `sms_detected -> credited`

SMS alone must not credit immediately, must not be production core, and must not use customer phone numbers or devices.

### 7. Manual Admin Fallback

- provider key: `manual_admin`
- use when provider/callback/statement/slip fails
- reason required
- admin_id required
- before/after balance required
- audit log required
- future dual control required
- no hidden credit adjustment

### Future Phase Backlog

- Phase AO: Payment Provider Contract / Dual TrueMoney Provider
  - TrueMoney Official / Partner Gateway
  - TMNOne
  - QR Payment / Payment Gateway
  - Provider interface
  - Mock only
  - No real money
  - No live provider
  - No runtime money-flow
- Phase AP: Member QR Deposit UX
  - QR display
  - Download QR button
  - Open full screen QR
  - Upload slip fallback
  - Confirm deposit fallback
  - One-device mobile flow
- Phase AQ: Deposit Verification Sources
  - Slip Verification
  - Statement API
  - SMS fallback
  - Manual review queue
- Phase AR: Ledger / Reconciliation Guard
  - idempotency
  - duplicate guard
  - before/after balance
  - daily reconcile
  - audit log
- Phase AS: Sandbox Integration
  - TrueMoney sandbox/partner test
  - TMNOne internal test
  - QR Gateway sandbox
  - Slip Verification sandbox
  - Statement read-only/sandbox
- Phase AT: Live Certification
  - security checklist
  - provider credentials checklist
  - webhook signature checklist
  - rollback proof
  - backup/restore proof
  - reconciliation proof
  - final approval
