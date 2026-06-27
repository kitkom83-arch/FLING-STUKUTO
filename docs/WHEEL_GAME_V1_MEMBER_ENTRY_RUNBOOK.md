# Wheel Game V1 Member Entry Runbook

Phase: WHEEL-GAME-V1-MEMBER-ENTRY-14

## Scope

This runbook wires the repo-served member page at `/member-money-demo/` to the Lucky Wheel V1 frontend in `apps/lucky-wheel-game/` without changing the backend Lucky Wheel API contract.

## Route And Build

- Member entry page: `/member-money-demo/`
- Lucky Wheel standalone route: `/member/lucky-wheel/`
- Build command: `npm run build --prefix apps/lucky-wheel-game`
- Optional helper script: `npm run build:member-lucky-wheel`
- Backend static source: `apps/lucky-wheel-game/dist`

The backend serves `apps/lucky-wheel-game/dist/index.html` from `/member/lucky-wheel/`. If the build output is missing, the route returns a safe `503` text response telling the operator to build the frontend first.

## Auth And Session Handoff

Integration mode for this phase: `real member token handoff`

- The repo-served member demo continues to own the member login flow with session data under `pg77-money-demo:member:member-session`.
- After member login or session restore, the member demo copies the current bearer token into `localStorage` key `pg77_member_token`.
- The Lucky Wheel frontend reads only `pg77_member_token` for the `Authorization` header and sends `X-Site-Code: PG77`.
- No token is logged, printed, or embedded into source.
- The repo-served member entry must not silently fall back to demo member mode for production-like usage. Local demo member mode remains a separate `.env.local` option for standalone local frontend development only.

## Member Flow

1. Open `/member-money-demo/`.
2. Create or re-login a local-safe member session.
3. Click `เล่นกงล้อ`.
4. Browser opens `/member/lucky-wheel/`.
5. Lucky Wheel loads `GET /api/member/wheel/config`.
6. Lucky Wheel spins with `POST /api/member/wheel/spin` body `{ campaignId }`.
7. Lucky Wheel refreshes history and rewards from the existing member endpoints.
8. Use the in-app link back to `/member-money-demo/`, then tap `Refresh Data` to refresh the member wallet summary.

## Browser Manual Result

Manual browser validation result from the closed follow-up phase `WHEEL-GAME-V1-MEMBER-SPIN-E2E-15`:

- `/member-money-demo/` opens normally.
- Member `Session Status` becomes `ready`.
- Clicking `เล่นกงล้อ` opens `/member/lucky-wheel/`.
- Pressing `SPIN` returns a backend-selected reward result such as `Credit 10`.
- `Back to Member Demo` returns safely to `/member-money-demo/`.
- Browser console shows no new red error for the validated member flow.

## How To Open Local Server Safely

1. Start local PostgreSQL only. Do not point the workspace at a remote or production database.
2. Use local-safe environment values only, then start the backend from `C:\Users\ADMIN\PG77-real-core`.
3. Build the Lucky Wheel frontend with `npm run build --prefix apps/lucky-wheel-game`.
4. Open the repo-served member entry route at `http://127.0.0.1:4000/member-money-demo/`.
5. Use browser DevTools Network only for safe local verification of the Lucky Wheel member endpoints.

## Required Env For Local Server

- `NODE_ENV=development-local` or `NODE_ENV=test`
- `APP_ENV=local-test`
- `PORT=4000`
- local PostgreSQL `DATABASE_URL` or local-safe DB mapping only
- local/mock provider modes only
- local/mock payment modes only
- local/mock bank modes only
- local/mock SMS modes only
- local/mock Slip OCR modes only
- local-only `JWT_SECRET`

## PostgreSQL Local Note

- Use local PostgreSQL only, typically on `127.0.0.1:5432`.
- Do not point `DATABASE_URL` at staging, shared, remote, or production infrastructure.
- This member spin validation does not require production DB, live wallet settlement, or external provider access.

## Manual Check

1. Open `/member-money-demo/`.
2. Click `Clear Session`.
3. Click `Re-Login`.
4. Click `เล่นกงล้อ`.
5. Press `SPIN`.
6. Open `My Rewards` and confirm the reward list reflects the backend-selected result when the result is not `no_reward`.
7. Open `History` and confirm the latest spin row matches the backend-selected result.
8. Click `Back to Member Demo`.
9. Confirm Console no red error.

## Known Non-Blocker

- Phaser console banner
- Chrome DevTools Thai notification
- Vite chunk size warning
- npm audit warning for local game dependency

## Safety

- no PG77-member-demo.zip copied
- no backend wheel API contract change
- no production DB
- no live API/provider/payment/bank/SMS/Slip OCR
- no migration or Prisma schema change
- no node_modules, dist, or .env.local committed
- no deploy
