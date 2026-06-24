# OroPlay Live Readiness

This document records the current live-readiness diagnostic state for OroPlay while the provider resolves the token exchange blocker.

## Current Staging Status

- VPS is online.
- HTTPS is working at `https://staging-api.bn9.one/api/health`.
- Backend runs through Nginx -> PM2 -> Node app on port 4000.
- PostgreSQL staging DB check passes.
- Runtime remains safe: `NODE_ENV=staging`, `APP_ENV=staging`, `OROPLAY_ENABLED=0`, and provider modes stay mock.
- OroPlay IP whitelist includes VPS IP `23.100.88.80`.
- Local env shape on the VPS is present:
  - `OROPLAY_BASE_URL=https://bs.sxvwlkohlv.com/api/v2`
  - `OROPLAY_CLIENT_ID=MAHA289`
  - `OROPLAY_CLIENT_SECRET` length is `64`
  - `OROPLAY_CLIENT_SECRET` has no whitespace

## Current Blocker

- `POST /auth/createtoken` currently returns `HTTP 401` with an empty body from the VPS diagnostic.
- The auth diagnostic pack is intentionally read-only and does not enable provider runtime.

## Verified Evidence

- HTTPS OK.
- DB OK.
- PM2 OK.
- Nginx OK.
- Env present.
- Secret length 64.
- No whitespace in `OROPLAY_CLIENT_SECRET`.
- VPS IP already registered with OroPlay CS.
- Transfer API evidence has already been verified end-to-end in sanitized form.
- `GET /agent/balance` is the verified balance method for the diagnostic pack.

## Safety Rule

- Do not enable `OROPLAY_ENABLED=1` until the auth diagnostic returns `200` and the balance read-only smoke passes.

## Diagnostic Script

- `npm run oroplay:auth:diagnostic`
- Optional read-only balance probe only when `OROPLAY_DIAGNOSTIC_BALANCE=1`
- The script must never print `clientSecret`, raw token, or full launch URL.

## Message Template For OroPlay CS

Subject: OroPlay `createtoken` returns HTTP 401 with empty body on whitelisted VPS

Hello OroPlay CS,

We have verified the staging VPS IP whitelist, HTTPS, application runtime, and staging database. The current diagnostic on the VPS still returns:

- `POST /auth/createtoken`
- `HTTP_STATUS=401`
- `CONTENT_TYPE=` (empty)
- `BODY_LENGTH=0`

Environment is present and sanitized:

- `OROPLAY_BASE_URL=https://bs.sxvwlkohlv.com/api/v2`
- `OROPLAY_CLIENT_ID=MAHA289`
- `OROPLAY_CLIENT_SECRET` length is `64`
- `OROPLAY_CLIENT_SECRET` has no whitespace

Please confirm whether the client credential, environment registration, endpoint path, or any server-side allowlist/rotation step still needs to be updated so the token exchange can return `200`.

Thank you.
