# Lucky Wheel Final UAT

## 1. Member wheel UAT

- Use local/staging/mock only.
- Confirm member config loads without probability weights or admin-only fields.
- Confirm backend decides prizeIndex for every accepted spin.
- Confirm frontend must not decide reward, reward value, probability, or prize index.
- Confirm invalid campaign and missing auth paths fail safely.
- Confirm no production DB, no real money, and no live provider/payment/bank/SMS/Slip OCR are used.

## 2. Admin wheel UAT

- Confirm admin console requires authenticated admin access.
- Confirm no-permission admin receives a safe forbidden response.
- Confirm campaign, reward, claim, spin, report, and audit tabs render safe empty/loading states.
- Confirm no force reward, force spin, or frontend prize override control is visible.
- Confirm local/staging/mock only.

## 3. Campaign settings UAT

- Confirm campaign read works for an authorized admin.
- Confirm campaign write requires permission and a reason.
- Confirm inactive campaign blocks member spin safely.
- Confirm start/end date and spin limit fields do not produce invalid-number placeholder copy.

## 4. Reward management UAT

- Confirm reward create/update/enable/disable requires permission and a reason.
- Confirm reward weights and stock are visible only to admin users.
- Confirm stock-zero rewards are excluded from member result selection.
- Confirm reward displays use safe missing-value placeholder wording when optional display fields are absent.

## 5. Reward claim/cancel UAT

- Confirm reward claim and cancel actions require permission and a reason.
- Confirm item reward claim/cancel does not trigger real payout.
- Confirm status changes write safe audit metadata.
- Confirm no live payout and no real wallet payout occur.

## 6. Spin history UAT

- Confirm member spin history shows backend-selected results only.
- Confirm admin spin history can filter by date and reward.
- Confirm masked IP or safe derived network metadata is used.
- Confirm raw user-agent text is not exposed.

## 7. Reports UAT

- Confirm report totals handle zero rows safely.
- Confirm report percentages and totals do not show invalid-number placeholder copy.
- Confirm reports are staging/mock only and must not be used as production financial reports.

## 8. Audit history UAT

- Confirm audit log must record actor/action/reason safely.
- Confirm metadata stores reason without credential values.
- Confirm before/after state is sanitized.
- Confirm audit history is available only to authorized admins.

## 9. Permission matrix UAT

- Confirm wheel view permission controls read-only access.
- Confirm wheel write permission controls campaign/reward/claim actions.
- Confirm audit permission controls audit-history visibility.
- Confirm frontend menu hiding is not treated as authorization.

## 10. Reason-required admin write UAT

- Confirm admin write actions require reason.
- Confirm every admin write action rejects an empty reason.
- Confirm every accepted admin write action records the provided reason.
- Confirm reason text is bounded and safe for logs.
- Confirm no guard downgrade is used to force a pass.

## 11. Frontend result injection guard UAT

- Confirm frontend must not decide reward.
- Confirm frontend must not send reward id, reward value, probability weight, or prize index to influence spin result.
- Confirm backend decides prizeIndex and reward for accepted spins.
- Confirm unsafe spin payloads fail safely.

## 12. Response leak scan checklist

- Confirm responses do not expose password, token, secret, credential, database connection, auth header, raw stack, or long token-shaped values.
- Confirm safe copy uses missing-value placeholder, invalid-number placeholder, object-string placeholder, and unsafe rendered placeholder copy wording only.
- Confirm no production DB, no real money, and no live provider/payment/bank/SMS/Slip OCR are used.

## 13. No-real-money checklist

- Confirm spins use points/mock balance only in local/staging fixtures.
- Confirm reward claim/cancel does not move live money.
- Confirm reports are not financial settlement evidence.
- Confirm no live payout is enabled.

## 14. No-live-provider checklist

- Confirm provider, payment, bank, SMS, and Slip OCR modes remain mock, sandbox, or disabled.
- Confirm no live provider/payment/bank/SMS/Slip OCR credential is used.
- Confirm no callback, webhook, bank statement, SMS send, or Slip OCR live request is performed.

## 15. Final acceptance checklist

- Member wheel UAT reviewed.
- Admin wheel UAT reviewed.
- Campaign settings UAT reviewed.
- Reward management UAT reviewed.
- Reward claim/cancel UAT reviewed.
- Spin history, reports, audit history, permission matrix, reason-required writes, frontend injection guard, and response leak scan reviewed.
- Operator confirms local/staging/mock only, no production DB, no real money, and no live provider/payment/bank/SMS/Slip OCR.