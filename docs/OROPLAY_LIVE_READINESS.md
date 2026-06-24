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
- Live transactional traffic remains blocked in this repository state.

## ORO-LIVE-GATE-2 Read-only Controlled Canary Plan Gate

ORO-LIVE-GATE-2 is a read-only controlled canary plan gate only. It does not enable live traffic, real-money play, provider mutation, game launch, member creation, deposit, withdraw, withdraw-all, callback runtime, or any runtime activation step.

### Gate Intent

- Record the minimum preflight, monitoring, rollback, and abort conditions required before any later runtime activation discussion.
- Keep `OROPLAY_ENABLED=0` and `OROPLAY_MODE=production_disabled`.
- Confirm that the current state is still planning/readiness only and not a live canary execution.
- Keep real-money traffic, real-game traffic, and live provider mutation disabled.

### Preflight Checklist

- VPS is synced to commit `3c36482`.
- VPS working tree is clean.
- Safe CI latest result is PASS.
- Staging health passes.
- `pm2` process `pg77-api` is online.
- OroPlay auth diagnostic passes in sanitized form.
- OroPlay balance read-only verification passes in sanitized form.
- `OROPLAY_ENABLED=0` remains unchanged.
- `OROPLAY_MODE=production_disabled` remains unchanged.
- No PM2 env edit, no service restart for live mode, and no runtime activation attempt are allowed in this gate.

### Monitoring Checklist

- Monitor staging `/api/health` availability and safe response shape.
- Monitor PM2 process status for `pg77-api` staying online.
- Monitor Nginx and application logs only for sanitized auth diagnostic and read-only balance evidence.
- Confirm no provider mutation call, no callback runtime enablement, and no public live route exposure occurs during the gate.
- Confirm no secret, token, password, client secret, or launch URL is printed in docs, logs, or smoke output.

### Rollback Checklist

- Keep `OROPLAY_ENABLED=0`.
- Keep `OROPLAY_MODE=production_disabled`.
- Leave PM2 env unchanged.
- Do not restart services to attempt live activation.
- Revert to Gate 1 safe state if any Gate 2 readiness wording becomes inconsistent with the verified environment state.
- Remove or reject any plan text that implies live traffic, real-money execution, runtime activation, or provider mutation is already approved.

### Abort Conditions

- Auth diagnostic no longer passes in sanitized form.
- Balance read-only verification no longer passes in sanitized form.
- Staging health fails or PM2 `pg77-api` is not online.
- Any proposed step requires `OROPLAY_ENABLED=1`, PM2 env changes, service restart for live mode, provider mutation, DB write, deposit, withdraw, withdraw-all, launch game, or create user.
- Any artifact introduces secret-shaped strings, raw token material, auth header literals, or database assignment literals.
- Any wording claims that live canary traffic, real-money traffic, or real-game traffic is already enabled.

### Approval Requirements Before The Next Gate

- Explicit user approval for a separate successor gate.
- Explicit confirmation that runtime activation remains a separate later gate.
- Verified rollback owner, monitoring owner, and decision owner recorded outside runtime execution.
- Fresh review that no live transactional traffic, real-money traffic, or real-game traffic has been enabled in this gate.

### Gate Outcome

- ORO-LIVE-GATE-2 is readiness/planning only.
- Runtime activation must remain a separate next gate.
- Real money is still not enabled.
- Real game launch is still not enabled.

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
