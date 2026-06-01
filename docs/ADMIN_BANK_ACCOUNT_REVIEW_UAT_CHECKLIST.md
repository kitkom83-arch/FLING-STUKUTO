# Admin Bank Account Review UAT Checklist

Phase AN status: release pack and UAT checklist for the Phase AL guarded write flow and Phase AM read-only audit/history handoff.

Safety boundary: local/staging/mock only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, no credit/debit, no payout, and no new runtime write action is approved by this document.

## Scope

- Validate the existing Admin Bank Account Review flow before staging/mock operator use.
- Cover Pending Bank Accounts, approve/reject modal behavior, required reason validation, audit/history visibility, operator handoff, permissions, safe error states, and response leak safety.
- Use only approved local/staging/mock fixtures and approved out-of-repo credentials.
- Do not record raw credential values, request headers, database connection strings, or screenshots that expose secrets.

## Preflight

- [ ] Confirm latest Safe CI is passing for the commit under UAT.
- [ ] Confirm backend health is OK and external modes are mock, sandbox, or disabled.
- [ ] Confirm target database is local/staging/test only and not production.
- [ ] Confirm no migration or deploy is being performed for this UAT checklist.
- [ ] Confirm the tester has an admin credential through the approved secret channel only.

## Browser UAT Checklist

- [ ] Open `/admin`.
- [ ] Paste the admin credential locally in the browser; do not paste it into chat, docs, tickets, logs, or screenshots.
- [ ] Dashboard loads.
- [ ] Member List loads.
- [ ] Pending Bank Accounts loads.
- [ ] Pending Bank Accounts shows pending accounts, or records a safe empty state when no fixture exists.
- [ ] Approve modal opens from a pending account.
- [ ] Reject modal opens from a pending account.
- [ ] Reason field is visible in both modals.
- [ ] Empty reason validates before submit and keeps the modal open.
- [ ] Authorized approve with reason succeeds only against local/staging/mock fixtures.
- [ ] Authorized reject with reason succeeds only against local/staging/mock fixtures.
- [ ] Duplicate reviewed account fails safely with `409`.
- [ ] Bank Account Review Audit / Review History section loads.
- [ ] Audit/history can show `member.bank.approve` and `member.bank.reject` actions when audit fixture exists.
- [ ] History empty state is safe when no audit fixture exists.
- [ ] Operator Handoff box is visible.
- [ ] Browser Console has no red errors.
- [ ] Page does not show `undefined`, `NaN`, or object-string placeholder copy.
- [ ] Page does not expose secret-shaped values or raw internal errors.

## Permission Behavior Checklist

- [ ] No login returns `401` for approve/reject and audit/history API paths.
- [ ] Admin without `members.bank.view` cannot read pending bank accounts.
- [ ] Admin without `members.bank.approve` cannot see approve/reject buttons.
- [ ] Admin without `members.bank.approve` receives `403` on approve/reject API paths.
- [ ] Admin without `admin.audit.view` cannot read Bank Account Review Audit / Review History.
- [ ] Admin with `members.bank.view` and without `members.bank.approve` sees the pending list as read-only.
- [ ] Admin with `members.bank.approve` still must provide reason for approve/reject.
- [ ] Permission guards are backend enforced; UI visibility is advisory only.

## Regression Checklist

- [ ] No login approve/reject = `401`.
- [ ] No permission approve/reject = `403`.
- [ ] Missing reason = `400`.
- [ ] Duplicate reviewed = safe `409`.
- [ ] Authorized plus reason = success against local/staging/mock only.
- [ ] Response includes only sanitized data and expected audit action.
- [ ] Audit metadata exists for approved/rejected review.
- [ ] Audit metadata includes `reason`, `previousStatus`, `nextStatus`, target bank account id, actor admin, `siteCode`, and sanitized before/after snapshots.
- [ ] Response leak scan passes.
- [ ] Safe error state does not show raw stack or sensitive values.

## Forbidden Controls Checklist

The Admin Bank Account Review screen must not show or expose controls for:

- [ ] credit/debit
- [ ] payout
- [ ] live transfer
- [ ] provider live
- [ ] approve withdrawal
- [ ] mark paid real
- [ ] force credit
- [ ] force debit

## Evidence Template

- Commit:
- Safe CI Run ID:
- Environment:
- Backend health:
- Pending account fixture count:
- Audit/history fixture status:
- Dashboard:
- Member List:
- Pending Bank Accounts:
- Approve modal:
- Reject modal:
- Reason validation:
- Audit/History:
- Operator Handoff:
- Console:
- Dangerous buttons:
- Response leak scan:
- Result: PASS / BLOCKED / FAIL

## Stop Conditions

Stop UAT immediately if any of the following occurs:

- Any external mode is live.
- The target appears to be production DB.
- Any real-money, payout, transfer, wallet credit/debit, provider live, payment live, bank live, SMS live, or Slip OCR live path is reachable.
- A response or UI shows raw stack, raw credential, secret-shaped value, or internal connection detail.
- Permission, reason, duplicate, or audit guard fails.
