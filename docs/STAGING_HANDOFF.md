# Staging UAT Handoff

This handoff is for PG77-real-core staging tester access only. Render staging has passed health, DB check/seed, staging smoke, and staging UAT smoke, but this is not production and does not authorize live money, live providers, live payment rails, live bank rails, SMS sending, or live Slip OCR.

Never put real passwords, tokens, API keys, provider secrets, callback secrets, bearer values, or real database URLs in this file, logs, screenshots, tickets, pull requests, commits, or chat.

## Target

- Staging URL: `https://fling-stukuto-staging-api.onrender.com`
- API base URL: `https://fling-stukuto-staging-api.onrender.com/api`
- Health check: `GET /api/health`
- Expected health boundary: `databaseConnected=true` and all external modes are `mock`, `sandbox`, or `disabled`

## What Testers May Test

- Health/readiness checks through `/api/health`.
- Login/logout with approved staging demo accounts only.
- Safe invalid admin login behavior. Invalid credentials must fail closed without `500`, token leaks, stack traces, or password hints.
- Admin schedule UI behavior for staging demo admins, including list/read/update, working days, overnight schedules, emergency override, and schedule-blocked login behavior.
- Audit/security UI behavior, including filters, summaries, empty states, masked IP values, omitted raw user-agent values, and safe detail modals.
- Read-only reports/config visibility that is already covered by smoke scripts.
- Mock/sandbox deposit, withdrawal, game, payment, bank statement, SMS, and Slip OCR flows only where the staging UI/API exposes them safely.

## What Testers Must Not Test

- Production database, production clone, production read replica, or production customer data.
- Real money deposit, withdrawal, transfer, settlement, payout, or reconciliation.
- Live game provider, payment provider, bank statement, SMS, or Slip OCR mode.
- Real provider callbacks, real bank webhooks, real OCR uploads, or real SMS sending.
- Production credentials, production admin/member accounts, or production settlement accounts.
- Any test that requires printing, copying, or screenshotting secrets.
- Any direct database mutation outside the approved staging seed/check flow.

## What Is Still Mock/Sandbox/Disabled

- Game provider mode remains mock/sandbox/disabled.
- Payment provider mode remains mock/sandbox/disabled.
- Bank statement mode remains mock/sandbox/disabled.
- SMS provider mode remains mock/sandbox/disabled.
- Slip OCR mode remains mock/sandbox/disabled.
- Demo fixtures are staging-only and must not be treated as production accounts.

## How To Report Bugs

Include only non-secret evidence:

- Environment label: `staging`.
- Feature or page tested.
- Timestamp with timezone.
- Expected result and actual result.
- HTTP status code and route path without query secrets.
- Browser, device, and role used, if relevant.
- Screenshot only if it contains no secret values, no ENV page, no bearer token, no raw database URL, and no password.
- Short reproduction steps using staging demo labels, not real credentials.

Do not include passwords, tokens, authorization headers, cookies, database URLs, provider keys, callback secrets, full ENV pages, or raw request payloads that include sensitive values.

## Safe Log Attachment

Before attaching logs:

- Redact `DATABASE_URL`, JWTs, bearer tokens, cookies, API keys, provider secrets, callback secrets, passwords, hashes, and authorization headers.
- Redact complete request/response headers unless the specific non-secret header is needed.
- Keep only the route, status code, timestamp, safe request id, and sanitized error message.
- Do not attach Render Environment/Secrets screenshots or terminal output that prints env values.
- If a credential appears in a log or screenshot, stop sharing it, rotate the credential, and report the leak through the security channel before continuing UAT.

## GO / NO-GO Before Tester Access

GO only when all items are true:

- `/api/health` passes on Render staging.
- Staging DB is connected and is a dedicated staging/test database.
- `npm run staging:db:check` passes.
- `npm run staging:db:seed` has passed when demo fixtures were required.
- `npm run smoke:staging` passes.
- `npm run smoke:staging-uat` passes.
- Invalid admin login fails closed without `500` and without secrets.
- All provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Demo credentials were shared only through a secret manager or other approved out-of-repo channel.
- Any credential that was exposed has been rotated before handoff.

NO-GO if any item is true:

- Any production database or production customer data is in scope.
- Any external mode is `live`.
- Any health, DB check, seed, smoke, or UAT smoke check fails.
- Any secret appears in docs, logs, screenshots, tickets, commits, chat, or smoke output.
- Testers need real money, real provider callbacks, real bank rails, SMS live sending, or live Slip OCR to complete the requested test.
