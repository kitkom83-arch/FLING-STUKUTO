# Staging Environment Matrix

## 1. Required ENV names

Core runtime names:

- `NODE_ENV`
- `APP_ENV`
- `STAGING_MODE`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `PUBLIC_API_BASE_URL`

Staging UAT fixture names:

- `LOCAL_ADMIN_PASSWORD`
- `STAGING_DEMO_ADMIN_EMAIL`
- `STAGING_DEMO_ADMIN_PASSWORD`
- `STAGING_DEMO_MEMBER_USERNAME`
- `STAGING_DEMO_MEMBER_PHONE`
- `STAGING_DEMO_MEMBER_PASSWORD`
- `STAGING_NO_PERMISSION_ADMIN_EMAIL`
- `STAGING_NO_PERMISSION_ADMIN_USERNAME`
- `STAGING_NO_PERMISSION_ADMIN_PASSWORD`
- `STAGING_SAFE_ROLE_NAME`
- `STAGING_SAFE_ROLE_ADMIN_EMAIL`
- `STAGING_SAFE_ROLE_ADMIN_USERNAME`
- `STAGING_SAFE_ROLE_ADMIN_PASSWORD`

External boundary names:

- `GAME_PROVIDER_MODE`
- `PAYMENT_PROVIDER_MODE`
- `BANK_STATEMENT_MODE`
- `SMS_PROVIDER_MODE`
- `SLIP_OCR_MODE`

## 2. Allowed staging values

- `NODE_ENV`: staging/test/local-test style non-production label.
- `APP_ENV`: staging or local-test.
- `STAGING_MODE`: mock or sandbox.
- `GAME_PROVIDER_MODE=mock`.
- `PAYMENT_PROVIDER_MODE=sandbox`.
- `BANK_STATEMENT_MODE=mock`.
- `SMS_PROVIDER_MODE=mock`.
- `SLIP_OCR_MODE=mock`.
- `DATABASE_URL`: staging/test database value only, stored outside the repo.
- Secrets and passwords: generated staging-only values stored only in the platform secret manager.

## 3. Forbidden production/live values

- production DATABASE_URL.
- production DB clone or read replica.
- live payout.
- live bank.
- live payment.
- live provider.
- live SMS.
- live Slip OCR.
- production customer account values.
- production service account values.
- real secret values in docs, logs, screenshots, tickets, commits, or chat.

## 4. Provider mode matrix

| Mode | Allowed for Phase AA | Notes |
| --- | --- | --- |
| mock | Yes | Preferred for readiness and static smoke |
| sandbox | Only when explicitly approved for staging evidence | Must use sandbox-only credentials from secret manager |
| disabled | Yes | Allowed when a provider line is not under test |
| live | No | Forbidden in Phase AA |

## 5. Payment mode matrix

| Value | Decision | Boundary |
| --- | --- | --- |
| `PAYMENT_PROVIDER_MODE=sandbox` | Allowed for staging readiness | No real money, no live payout |
| `PAYMENT_PROVIDER_MODE=mock` | Allowed | Mock-only payment behavior |
| live payment mode | Forbidden | Stop and rotate any exposed live credential |

## 6. Bank statement mode matrix

| Value | Decision | Boundary |
| --- | --- | --- |
| `BANK_STATEMENT_MODE=mock` | Allowed | Mock statement data only |
| sandbox bank statement mode | Later approval only | Sandbox account only, no production bank |
| live bank mode | Forbidden | No live bank rails in Phase AA |

## 7. SMS mode matrix

| Value | Decision | Boundary |
| --- | --- | --- |
| `SMS_PROVIDER_MODE=mock` | Allowed | No real SMS send |
| sandbox SMS mode | Later approval only | Sandbox-only account |
| live SMS mode | Forbidden | No live SMS in Phase AA |

## 8. Slip OCR mode matrix

| Value | Decision | Boundary |
| --- | --- | --- |
| `SLIP_OCR_MODE=mock` | Allowed | Mock OCR behavior only |
| sandbox Slip OCR mode | Later approval only | Sandbox-only account |
| live Slip OCR mode | Forbidden | No live OCR in Phase AA |

## 9. Game provider mode matrix

| Value | Decision | Boundary |
| --- | --- | --- |
| `GAME_PROVIDER_MODE=mock` | Allowed | Mock provider adapter only |
| sandbox game provider mode | Later approval only | Sandbox-only callback and account |
| live game provider mode | Forbidden | No live provider in Phase AA |

## 10. DATABASE_URL handling rules

- Store only in the platform secret manager or ignored local shell.
- Target only a dedicated staging/test database.
- Do not paste connection text into repository files, docs, logs, screenshots, tickets, commits, or chat.
- Do not use production, production clone, production replica, or production service account.
- Use non-secret labels when recording evidence.

## 11. JWT/admin/member secret handling rules

- Generate staging-only values.
- Store values only in the platform secret manager or approved out-of-repo channel.
- Do not print password, token, JWT, session, provider key, or raw auth material.
- Demo admin/member credentials are UAT-only and must be rotated if exposed.
- Evidence may record only key names and pass/fail status, never values.

## 12. Health endpoint expectations

- Health path is `/api/health`.
- Response uses JSON only.
- Health success indicates safe runtime availability only.
- `databaseConnected` is boolean.
- External mode labels are mock, sandbox, or disabled only.
- No secret-shaped value, DB connection text, raw auth material, provider payload, or stack trace appears.

## 13. Admin route expectations

- Admin routes require authenticated admin access.
- Permission checks remain backend-enforced.
- Admin write actions require reason where documented.
- Audit events record actor/action/reason safely.
- UI hiding is advisory only and not authorization.
- No guard downgrade is allowed.

## 14. Member wheel expectations

- Member wheel config returns public fields only.
- Member spin sends campaign only.
- Backend decides `prizeIndex` and reward result.
- Frontend must not decide reward, reward value, probability, or prize index.
- Member history and rewards return sanitized rows only.

## 15. Financial ledger boundary expectations

- Ledger evidence is mock/read-only unless a later approved phase changes scope.
- No real money.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No production DB.
- Reward claim/cancel must not credit wallet, points, tickets, bank, payment, provider, SMS, or Slip OCR.

## 16. Evidence checklist

- ENV names reviewed without values.
- Safe mode values recorded.
- Forbidden production/live values absent.
- DB target classified by non-secret label.
- Secret storage location confirmed without values.
- Health expectations reviewed.
- Admin route guard expectations reviewed.
- Member wheel backend-result authority reviewed.
- Financial ledger boundary reviewed.
