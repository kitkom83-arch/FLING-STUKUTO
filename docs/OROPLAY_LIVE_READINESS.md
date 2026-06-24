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

## ORO-LIVE-GATE-3 Runtime Activation Approval Request Gate

ORO-LIVE-GATE-3 is a runtime activation approval request gate only. It prepares the approval request package for a later separate runtime activation decision or controlled activation gate and does not activate runtime.

### Gate Intent

- Record that Gate 1 and Gate 2 prerequisites are satisfied before any runtime activation approval is requested.
- Prepare the approval checklist, operator sign-off requirements, rollback readiness, monitoring readiness, and abort conditions for a later separate Gate 4 decision.
- Keep `OROPLAY_ENABLED=0` and `OROPLAY_MODE=production_disabled`.
- Keep live transactional traffic, real-money traffic, real-game launch, provider mutation, and callback runtime activation disabled.

### Gate Prerequisites

- ORO-LIVE-GATE-1 is closed/pass.
- ORO-LIVE-GATE-2 is closed/pass.
- Safe CI latest result is PASS.
- VPS is synced to commit `0cbbc27`.
- VPS working tree is clean.
- OroPlay auth diagnostic passed in sanitized form.
- OroPlay read-only balance diagnostic passed in sanitized form.
- Staging health passes.
- `pm2` process `pg77-api` is online.
- `OROPLAY_ENABLED=0` remains unchanged.
- `OROPLAY_MODE=production_disabled` remains unchanged.

### Approval Checklist Before Runtime Activation

- Explicit user approval request is recorded for a later separate Gate 4.
- Runtime activation decision authority is identified.
- PM2/env change authority is identified but not exercised in Gate 3.
- Runtime change window, operator owner, rollback owner, and monitoring owner are identified.
- Confirmation that no runtime activation, no public live route enablement, and no provider mutation occur inside Gate 3.
- Confirmation that Gate 4 remains decision-only, Gate 5 stays separate for controlled activation planning and guard preparation, and Gate 6 stays separate for any actual controlled runtime enablement.

### Required Operator Sign-off

- Operator confirms Gate 1 and Gate 2 evidence remains valid.
- Operator confirms current runtime remains disabled.
- Operator confirms no PM2 env change and no service restart for live mode were performed in Gate 3.
- Operator confirms no deposit, withdraw, withdraw-all, launch game, create user, or provider mutation action was attempted.

### Required Rollback Readiness

- Rollback instruction remains fail-closed: keep `OROPLAY_ENABLED=0`.
- Rollback instruction remains fail-closed: keep `OROPLAY_MODE=production_disabled`.
- PM2 env remains unchanged.
- No service restart is used to change runtime state.
- Any approval-request wording that implies runtime is already active must be rejected or reverted before Gate 4 review.

### Required Monitoring Readiness

- Monitoring owner confirms staging `/api/health` remains healthy.
- Monitoring owner confirms PM2 `pg77-api` remains online.
- Monitoring owner confirms sanitized diagnostic evidence remains available without exposing secret, token, password, client secret, or launch URL.
- Monitoring owner confirms no live traffic, no provider mutation, and no runtime activation event occurred during Gate 3.

### Abort Conditions

- Any step attempts `OROPLAY_ENABLED=1`.
- Any step attempts PM2 env changes or service restart for live mode.
- Any step attempts deposit, withdraw, withdraw-all, launch game, create user, provider mutation, DB write, Prisma schema change, migration, or public live route enablement.
- Any step attempts external network calls.
- Any artifact introduces secret-shaped strings, raw token material, auth header literals, JWT/API-key-looking strings, or database assignment literals.
- Any wording claims runtime activation, live traffic, real money, or real game launch is already enabled.

### Gate Outcome

- ORO-LIVE-GATE-3 is approval request only.
- Runtime activation remains pending approval.
- Gate 4 must remain the runtime activation decision gate only, Gate 5 must remain separate for controlled activation planning and guard preparation, and Gate 6 must remain separate for any actual controlled runtime enablement.
- Real money is still not enabled.
- Real game launch is still not enabled.

## ORO-LIVE-GATE-4 Runtime Activation Decision Gate

ORO-LIVE-GATE-4 is a runtime activation decision gate only. It records the runtime activation decision, conditions, evidence, constraints, rollback options, and next-gate requirements, but it does not activate runtime.

### Gate Prerequisites

- ORO-LIVE-GATE-1 is closed/pass.
- ORO-LIVE-GATE-2 is closed/pass.
- ORO-LIVE-GATE-3 is closed/pass.
- Safe CI latest result is PASS.
- VPS is synced to commit `9e8f516`.
- VPS working tree is clean.
- OroPlay auth diagnostic passed in sanitized form.
- OroPlay read-only balance diagnostic passed in sanitized form.
- `OROPLAY_ENABLED=0` remains unchanged.
- `OROPLAY_MODE=production_disabled` remains unchanged.
- Live transactional traffic remains off.

### Decision Record Template

- Decision date:
- Decision owner:
- Decision status:
- Evidence reviewed:
- Constraints acknowledged:
- Rollback owner:
- Monitoring owner:
- Next gate:
- Notes:

### Decision Options

- Approve for controlled activation planning and pre-activation guard preparation in Gate 5 only.
- Reject runtime activation progression.
- Defer pending scheduling or operator readiness.
- Request more evidence before any Gate 5 planning review.

### Required Evidence Checklist

- Gate 1 auth diagnostic evidence remains valid in sanitized form.
- Gate 2 read-only canary plan evidence remains valid.
- Gate 3 approval request evidence remains valid.
- Current runtime remains disabled with `OROPLAY_ENABLED=0`.
- Current runtime remains disabled with `OROPLAY_MODE=production_disabled`.
- Safe CI latest result is PASS.
- VPS sync, clean working tree, staging health, and PM2 online confirmations remain current.
- No provider mutation, no DB write, no external network call, and no runtime activation occurred during Gates 1-4 preparation.

### Operator Sign-off Checklist

- Decision owner signs off that Gate 4 is decision-only.
- Operator owner signs off that no PM2 env change is performed in Gate 4.
- Operator owner signs off that no service restart is performed for live mode in Gate 4.
- Operator owner signs off that no deposit, withdraw, withdraw-all, launch game, or create user action is performed in Gate 4.
- Operator owner signs off that Gate 5 remains plan-only and that actual controlled runtime enablement may occur only in a separate Gate 6 after explicit approval.

### Rollback Readiness Checklist

- Keep `OROPLAY_ENABLED=0`.
- Keep `OROPLAY_MODE=production_disabled`.
- Keep PM2 env unchanged.
- Do not restart services to change runtime state.
- Preserve the fail-closed position that runtime remains disabled unless a separate Gate 6 is explicitly approved after Gate 5 planning and guard review.
- Reject or revert any wording that implies live runtime, real money, or real game launch is already enabled.

### Monitoring Readiness Checklist

- Monitoring owner confirms staging `/api/health` remains healthy.
- Monitoring owner confirms PM2 `pg77-api` remains online.
- Monitoring owner confirms sanitized diagnostic evidence remains available without exposing secret, token, password, client secret, or launch URL.
- Monitoring owner confirms no live transactional traffic, no provider mutation, no deposit, no withdraw, no launch game, and no member creation occurred during Gate 4.

### Abort Conditions

- Any step attempts `OROPLAY_ENABLED=1`.
- Any step attempts PM2 env changes or service restart for live mode.
- Any step attempts deposit, withdraw, withdraw-all, launch game, create user, provider mutation, DB write, Prisma schema change, or migration.
- Any step attempts external network calls.
- Any artifact introduces secret-shaped strings, raw auth values, JWT/API-key-looking strings, or database assignment literals.
- Any wording claims runtime activation, live traffic, real money, or real game launch is already enabled.

### Go/No-Go Criteria

- Go only if Gate 1, Gate 2, and Gate 3 remain closed/pass with no contradictory evidence.
- Go only if decision owner, operator owner, rollback owner, and monitoring owner are identified.
- Go only if current runtime remains disabled, Gate 5 is explicitly reserved for planning/guard preparation, and Gate 6 is explicitly reserved for actual controlled runtime enablement.
- No-Go if any required evidence is stale, missing, contradictory, or implies runtime was changed outside this gate.

### Gate Outcome

- ORO-LIVE-GATE-4 is decision-only.
- Runtime activation is still not enabled.
- Real money is still not enabled.
- Real game launch is still not enabled.
- Gate 5 only may act as the controlled activation plan / pre-activation guard gate after Gate 4 approval, and Gate 6 only may act as the actual controlled runtime enablement gate.

## ORO-LIVE-GATE-5 Controlled Activation Plan / Pre-Activation Guard Gate

ORO-LIVE-GATE-5 is a controlled activation plan / pre-activation guard gate only. It prepares the controlled activation plan, guardrails, rollback template, monitoring readiness, verification checklists, and operator runbook for a later separate gate, but it does not activate runtime.

### Gate Prerequisites

- ORO-LIVE-GATE-1 is closed/pass.
- ORO-LIVE-GATE-2 is closed/pass.
- ORO-LIVE-GATE-3 is closed/pass.
- ORO-LIVE-GATE-4 is closed/pass.
- Safe CI latest result is PASS.
- VPS is synced to commit `8dfe183`.
- VPS working tree is clean.
- OroPlay auth diagnostic passed in sanitized form.
- OroPlay read-only balance diagnostic passed in sanitized form.
- `OROPLAY_ENABLED=0` remains unchanged.
- `OROPLAY_MODE=production_disabled` remains unchanged.
- Live transactional traffic remains off.

### Controlled Activation Plan

- Define the future activation sequence as a documented human-reviewed plan only.
- Limit future activation scope to a controlled, reversible, and explicitly approved window.
- Keep runtime disabled throughout Gate 5 while preparing the next-gate checklist.
- Separate plan preparation, approval review, runtime change execution, and post-change verification into distinct stages.
- Reserve Gate 6 only for any actual controlled runtime enablement decision and execution boundary.

### Pre-Activation Guard Checklist

- Confirm current runtime remains disabled with `OROPLAY_ENABLED=0`.
- Confirm current runtime remains disabled with `OROPLAY_MODE=production_disabled`.
- Confirm PM2 env remains unchanged.
- Confirm no service restart is used to change runtime state during Gate 5.
- Confirm no provider mutation, no DB write, no public live route enablement, and no external network call occur during Gate 5.
- Confirm no instruction in this gate adds an immediate live-enablement command.

### Operator Readiness Checklist

- Operator owner is identified for the later activation window.
- Rollback owner is identified for the later activation window.
- Monitoring owner is identified for the later activation window.
- Decision owner confirms Gate 5 remains plan-only.
- Operator owner confirms no deposit, withdraw, withdraw-all, launch game, or create user action is performed in Gate 5.

### Live Activation Window Checklist

- Planned activation date:
- Planned activation time window:
- Operator owner:
- Rollback owner:
- Monitoring owner:
- Decision owner:
- Verification owner:
- Business communication readiness:
- Incident channel readiness:

### Rollback Runbook Template

- Rollback trigger:
- Rollback decision owner:
- Rollback communication owner:
- Verified fail-closed target state:
- Runtime-disabled confirmation checklist:
- Post-rollback verification checklist:
- Incident notes location:

### Monitoring Checklist

- Monitor staging `/api/health` and safe health response shape.
- Monitor PM2 `pg77-api` online status.
- Monitor sanitized application and Nginx logs only for safe readiness evidence.
- Monitor that no live transactional traffic, no provider mutation, and no member-creation event occurs in Gate 5.
- Monitor that no secret, token, password, client secret, auth value, or launch URL is printed in docs, logs, or smoke output.

### Health Verification Checklist

- Verify staging health remains healthy before any later activation review.
- Verify PM2 `pg77-api` remains online before any later activation review.
- Verify sanitized auth diagnostic evidence remains valid.
- Verify sanitized read-only balance evidence remains valid.
- Verify no contradictory runtime change evidence appears during Gate 5.

### Post-Activation Verification Checklist For Gate 6

- Verify Gate 6 approval is explicit before any runtime state change.
- Verify post-change health checks are defined before Gate 6 starts.
- Verify rollback ownership and monitoring ownership are confirmed before Gate 6 starts.
- Verify post-change observation window and success criteria are documented before Gate 6 starts.
- Verify Gate 6 includes separate execution and verification evidence handling.

### Abort Conditions

- Any step attempts `OROPLAY_ENABLED=1`.
- Any step attempts PM2 env changes or service restart for live mode.
- Any step attempts deposit, withdraw, withdraw-all, launch game, create user, provider mutation, DB write, Prisma schema change, or migration.
- Any step attempts external network calls.
- Any artifact introduces secret-shaped strings, raw auth values, JWT/API-key-looking strings, database assignment literals, or wording that acts like an immediate live-enablement command.
- Any wording claims runtime activation, live traffic, real money, or real game launch is already enabled.

### Approval Requirements For Gate 6

- Explicit user approval for Gate 6 as a separate runtime enablement gate.
- Explicit confirmation that Gate 5 remained plan-only with runtime still disabled.
- Explicit review of controlled activation plan, pre-activation guard checklist, rollback template, monitoring checklist, and verification checklist.
- Explicit confirmation that no live-enablement command is embedded in Gate 5 artifacts.

### Gate Outcome

- ORO-LIVE-GATE-5 is plan-only and pre-activation-guard-only.
- Runtime activation is still not enabled.
- Real money is still not enabled.
- Real game launch is still not enabled.
- Gate 6 only may act as the actual controlled runtime enablement gate after Gate 5 approval.

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
