# Staging Platform Checklist

This checklist is for staging preparation only. Do not paste real database URLs, tokens, passwords, API keys, provider secrets, callback secrets, private keys, or live credentials into this document, commits, logs, tickets, screenshots, or chat.

All values below are placeholders. Put real staging values only in the selected platform secret manager.

Use `docs/STAGING_DEPLOY_DECISION.md` for the final go/no-go checklist before any real staging deploy.

## Common Rules

- Build command: `npm ci && npx prisma generate`
- Start command: `npm run start`
- Preflight command before deploy handoff: `npm run staging:preflight`
- Staging smoke command after deploy: `BASE_URL=<STAGING_API_BASE_URL>/api npm run smoke:staging`
- Health check URL: `<STAGING_API_BASE_URL>/api/health`
- Provider/payment/bank/SMS/Slip OCR modes: `mock`, `sandbox`, or `disabled` only.
- `DATABASE_URL` must target dedicated staging/test PostgreSQL only.
- Never use production DB, production clone, live provider mode, live bank rails, live payment rails, or real-money flows.

## Platform Selection Matrix

| Platform | เหมาะกับอะไร | สิ่งที่ต้องเตรียม | Build command | Start command | Health check path | ENV secret manager | Rollback method | ข้อควรระวัง |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Render | ทีมที่ต้องการ web service managed ง่ายและ deploy history ชัดเจน | Render Web Service, staging PostgreSQL, staging domain, env group | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Render Environment Variables หรือ Environment Group | Redeploy previous successful deploy | อย่าใช้ production database add-on หรือ live provider env ใน service เดียวกัน |
| Railway | ทีมที่ต้องการ setup เร็วและผูก service/database ใน project เดียว | Railway service, staging PostgreSQL, public domain, variables | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Railway Variables | Redeploy previous deployment หรือ pin previous commit | ตรวจว่า variables ไม่ reuse production project และ domain ไม่ production-like |
| Fly.io | ทีมที่ต้องการ region control, machine release, และ rollback แบบ release-based | Fly app, staging PostgreSQL reachable from app, secrets, health check | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Fly secrets | Rollback to previous release | ตรวจ outbound DB access, region latency, และอย่าใส่ live provider secrets |
| VPS | ทีมที่ต้องการ control OS/network เอง | Node.js 18.18+, process manager, reverse proxy, staging DB, secret store | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | systemd env file, PM2 env, vault, or managed secret store outside git | Switch symlink/release dir or commit and restart service | ต้องดูแล patching, firewall, TLS, log redaction, backup, process restart เอง |

## Render

- Service type: Web Service.
- Build command: `npm ci && npx prisma generate`
- Start command: `npm run start`
- Health check URL: `https://<render-staging-service>.onrender.com/api/health`
- Required secret manager env:
  - `NODE_ENV=staging`
  - `APP_ENV=staging`
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `PUBLIC_API_BASE_URL`
  - `LOCAL_ADMIN_PASSWORD`
  - `GAME_PROVIDER_MODE`
  - `PAYMENT_PROVIDER_MODE`
  - `BANK_STATEMENT_MODE`
  - `SMS_PROVIDER_MODE`
  - `SLIP_OCR_MODE`
- Optional sandbox-only env: provider API base URLs, merchant IDs, agent codes, API keys, and secrets.
- Rollback step: open Render deploy history and redeploy the previous known-good deploy, then keep provider modes `mock` if any sandbox line is uncertain.
- Smoke after rollback: `BASE_URL=https://<render-staging-service>.onrender.com/api npm run smoke:staging`

## Railway

- Service type: Node.js service.
- Build command: `npm ci && npx prisma generate`
- Start command: `npm run start`
- Health check URL: `https://<railway-staging-domain>/api/health`
- Required secret manager env:
  - `NODE_ENV=staging`
  - `APP_ENV=staging`
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `PUBLIC_API_BASE_URL`
  - `LOCAL_ADMIN_PASSWORD`
  - `GAME_PROVIDER_MODE`
  - `PAYMENT_PROVIDER_MODE`
  - `BANK_STATEMENT_MODE`
  - `SMS_PROVIDER_MODE`
  - `SLIP_OCR_MODE`
- Optional sandbox-only env: provider API base URLs, merchant IDs, agent codes, API keys, and secrets.
- Rollback step: redeploy the previous successful Railway deployment or pin the previous commit, then verify env still points to staging/test resources.
- Smoke after rollback: `BASE_URL=https://<railway-staging-domain>/api npm run smoke:staging`

## Fly.io

- Service type: Fly app with Node.js runtime or Docker image.
- Build command: `npm ci && npx prisma generate`
- Start command: `npm run start`
- Health check URL: `https://<fly-staging-app>.fly.dev/api/health`
- Required secret manager env:
  - `NODE_ENV=staging`
  - `APP_ENV=staging`
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `PUBLIC_API_BASE_URL`
  - `LOCAL_ADMIN_PASSWORD`
  - `GAME_PROVIDER_MODE`
  - `PAYMENT_PROVIDER_MODE`
  - `BANK_STATEMENT_MODE`
  - `SMS_PROVIDER_MODE`
  - `SLIP_OCR_MODE`
- Optional sandbox-only env: provider API base URLs, merchant IDs, agent codes, API keys, and secrets.
- Rollback step: rollback to the previous Fly release, confirm machines restart cleanly, and keep all external modes non-live.
- Smoke after rollback: `BASE_URL=https://<fly-staging-app>.fly.dev/api npm run smoke:staging`

## VPS

- Runtime: Node.js 18.18+ process manager such as systemd or PM2.
- Build command: `npm ci && npx prisma generate`
- Start command: `npm run start`
- Health check URL: `https://<vps-staging-domain>/api/health`
- Required secret source: systemd environment file, PM2 ecosystem secrets, vault, or another access-controlled secret store outside git.
- Required env:
  - `NODE_ENV=staging`
  - `APP_ENV=staging`
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `PUBLIC_API_BASE_URL`
  - `LOCAL_ADMIN_PASSWORD`
  - `GAME_PROVIDER_MODE`
  - `PAYMENT_PROVIDER_MODE`
  - `BANK_STATEMENT_MODE`
  - `SMS_PROVIDER_MODE`
  - `SLIP_OCR_MODE`
- Optional sandbox-only env: provider API base URLs, merchant IDs, agent codes, API keys, and secrets.
- Rollback step: switch the process manager to the previous known-good release directory or commit, restart the service, and verify it still uses staging/test env only.
- Smoke after rollback: `BASE_URL=https://<vps-staging-domain>/api npm run smoke:staging`

## Blockers

Do not deploy on any platform until the staging platform, staging database, staging domain, platform secret manager access, deploy owner, and rollback owner are confirmed. Do not switch any provider, payment, bank, SMS, or Slip OCR integration to live from this checklist.
