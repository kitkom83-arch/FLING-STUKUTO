# Admin Bank Account Review Operator Runbook

Phase AN status: operator runbook for the existing Phase AL approve/reject flow and Phase AM audit/history handoff.

Safety boundary: local/staging/mock only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, no credit/debit, no payout, and no new runtime write action is approved by this document.

## Operator Scope

Operators may review pending bank account requests, approve or reject a pending bank account with a required reason, and read review history when they have the required permissions. Operators must not use this screen for wallet adjustment, withdrawal approval, payout, live transfer, provider action, payment action, bank action, SMS, or Slip OCR work.

Required permissions:

- `members.bank.view` to read Pending Bank Accounts.
- `members.bank.approve` to approve or reject pending bank accounts.
- `admin.audit.view` to read Bank Account Review Audit / Review History.

Audit actions:

- `member.bank.approve`
- `member.bank.reject`

## How To Review Pending Accounts

1. Open `/admin`.
2. Paste the admin credential locally in the browser from the approved secret channel.
3. Confirm Dashboard and Member List load.
4. Go to Pending Bank Accounts.
5. Confirm each row shows the member, bank, account name, masked account number, status, and note when available.
6. Compare the visible masked account details with the approved staging/mock evidence supplied for the request.
7. If account details are unclear, stop and escalate. Do not guess.

## Safety Checklist Before Approve Or Reject

- [ ] Environment is local/staging/mock only.
- [ ] No production DB is being used.
- [ ] No real money is involved.
- [ ] No live provider/payment/bank/SMS/Slip OCR mode is enabled.
- [ ] The account row is still pending.
- [ ] The account number is masked in the UI.
- [ ] The member and bank details match the approved staging/mock evidence.
- [ ] You understand the reason you will enter.
- [ ] You are not using this flow for credit/debit, payout, withdrawal approval, live transfer, or provider live actions.

## How To Approve

1. In Pending Bank Accounts, choose a pending row that has been verified.
2. Click `Approve`.
3. Confirm the modal title is `Approve bank account`.
4. Confirm username and masked account are correct.
5. Enter a clear reason.
6. Click Confirm.
7. Expect success only in local/staging/mock.
8. Confirm the pending list refreshes.
9. Confirm audit/history records `member.bank.approve` when audit data is available.

## How To Reject

1. In Pending Bank Accounts, choose the pending row that should not be approved.
2. Click `Reject`.
3. Confirm the modal title is `Reject bank account`.
4. Confirm username and masked account are correct.
5. Enter a clear reason.
6. Click Confirm.
7. Expect success only in local/staging/mock.
8. Confirm the pending list refreshes.
9. Confirm audit/history records `member.bank.reject` when audit data is available.

## Reason Rules

- Reason is required for approve and reject.
- Empty reason must validate before submit.
- Reason must describe the operator decision and the evidence used.
- Do not enter credential values, database details, raw request headers, or secret-shaped values as a reason.
- If reason text would expose sensitive information, record a safe summary and move the sensitive evidence to the approved secure system.

## How To View Review History

1. Open Bank Account Review Audit / Review History.
2. Confirm you have `admin.audit.view`.
3. Use the action filter:
   - All for all review actions.
   - Approve for `member.bank.approve`.
   - Reject for `member.bank.reject`.
4. Use username, target id, and date range filters when needed.
5. If no audit fixture exists, the empty state must be safe and must not show raw stack or sensitive values.

## How To Read Audit Metadata

Review history rows should be interpreted as:

- action: `member.bank.approve` or `member.bank.reject`.
- actor admin: admin who performed the action.
- target bank account/member: masked bank account context and member identifier when available.
- previousStatus: expected to be `pending` before review.
- nextStatus: expected to be `approved` or `rejected`.
- reason: operator decision reason.
- createdAt: timestamp of the review action.
- siteCode: site boundary marker.

Before/after snapshots must remain sanitized. They must not include token values, raw passwords, raw database connection strings, raw bank credentials, raw provider credentials, raw SMS credentials, raw Slip OCR credentials, raw request headers, raw stack traces, or unmasked account numbers.

## Handling Safe Error States

- `401` unauthenticated: sign in with an approved admin credential in the browser. Do not paste the credential into chat or logs.
- `403` no permission: stop and ask an authorized admin to confirm the role/permission assignment. Do not bypass permission.
- `400` reason required: enter a clear reason and retry only if the decision is still valid.
- `409` duplicate reviewed: the account has already been reviewed. Refresh Pending Bank Accounts and Review History. Do not retry blindly.
- `404` not found: refresh the list and confirm the account id. Escalate if the request is still expected.
- Safe error state: users should see controlled error text only, never raw stack or sensitive values.

## Escalation Path

Escalate before approving or rejecting when:

- Bank account data is unclear or inconsistent.
- The member identity is ambiguous.
- The account appears already reviewed.
- The reason would require sensitive evidence that cannot be safely entered.
- Any permission, audit, duplicate, or response leak guard behaves unexpectedly.
- Any real-money, payout, live transfer, provider live, payment live, bank live, SMS live, Slip OCR live, or production DB signal appears.

Escalation record should include only safe fields: member username/id, target bank account id, masked account, action being considered, safe reason summary, timestamp, environment, and screenshot without credential values.

## Forbidden Actions

Operators must not:

- Add credit or debit.
- Approve withdrawal.
- Run payout or transfer.
- Enable provider live, payment live, bank live, SMS live, or Slip OCR live.
- Use production DB.
- Run migration or deploy.
- Seed production.
- Bypass auth, permission, reason, duplicate, or audit guards.
- Ask frontend to mutate bank status directly.
- Store credentials, raw DB connection strings, tokens, raw request headers, or provider secrets in docs, tickets, screenshots, logs, commits, or chat.
