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

## Safety

- no PG77-member-demo.zip copied
- no backend wheel API contract change
- no production DB
- no live API/provider/payment/bank/SMS/Slip OCR
- no migration or Prisma schema change
- no node_modules, dist, or .env.local committed
- no deploy
