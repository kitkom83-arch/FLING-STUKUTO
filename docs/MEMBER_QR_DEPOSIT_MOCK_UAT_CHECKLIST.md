# Member QR Deposit Mock UAT Checklist

Phase AP status: Member QR Deposit UX / Mock QR Download checklist.

Use this checklist for mock/static UAT only. No production DB, no real money, no real QR, no real payment, no live provider/payment/bank/SMS/Slip OCR, no payout, no migration, no deploy, no external network, and no auto-credit from QR download are allowed.

## Checklist

| item | expected result |
| --- | --- |
| open member QR deposit mock UX | Mock UX contract opens or is reviewed without runtime money-flow. |
| amount input valid | Positive amount is accepted by the mock order contract. |
| amount input zero rejected | Zero amount is rejected. |
| amount input negative rejected | Negative amount is rejected. |
| create mock QR order | Mock order is created with safe mock markers only. |
| QR preview uses mock marker | Preview copy identifies the QR as mock-only. |
| QR download button visible | Download action is present for `qr_ready` mock orders. |
| QR download returns mock file marker | Download artifact contains mock marker text only. |
| QR download does not credit member | Wallet/ledger credit is not created by download. |
| QR downloaded status recorded | Mock order status records `qr_downloaded` and event status remains pending verification. |
| QR expiry changes status to expired | Expiry changes status to `expired`. |
| expired QR cannot be matched | Expired QR cannot transition to matched. |
| cancel QR changes status to cancelled | Cancel changes status to `cancelled`. |
| cancelled QR cannot be matched | Cancelled QR cannot transition to matched. |
| duplicate orderId rejected | Duplicate `orderId` is rejected or marked `duplicate_suspect`. |
| duplicate qrPayloadMockHash rejected | Duplicate `qrPayloadMockHash` is rejected or marked `duplicate_suspect`. |
| providerKey = qr_payment_gateway | Provider key is exactly `qr_payment_gateway`. |
| providerMode not live | Provider mode is `mock` or `sandbox`; live mode is blocked. |
| no real QR | Artifact is not a real payment QR. |
| no real payment | No payment gateway or bank payment occurs. |
| no external network | Mock harness does not call network. |
| no production DB | Mock harness does not connect to production DB. |
| no payout | No payout or withdrawal action occurs. |
| no secret printed | Output contains no secret-shaped value. |
| no missing display value / invalid numeric display / raw object display value display | UI/docs must not show missing display value, invalid numeric display, or raw object display value placeholders. |

## Required provider markers

- `providerKey = qr_payment_gateway`
- `providerMode = mock` or `providerMode = sandbox`
- `live_after_certification` is documentation-only and blocked until certification.

## Failure boundaries

- QR mock must not be a QR that can be paid with real money.
- QR payload must be a mock marker only.
- QR download must create a mock artifact only.
- Download QR must never credit member.
- Expired QR cannot be matched.
- Cancelled QR cannot be matched.
- Duplicate `orderId` must be rejected or marked `duplicate_suspect`.
- Duplicate `qrPayloadMockHash` must be rejected or marked `duplicate_suspect`.
