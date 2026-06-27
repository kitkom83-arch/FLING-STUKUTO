# Wheel Game V1 Member Entry Preflight

Phase: WHEEL-GAME-V1-MEMBER-ENTRY-PREFLIGHT-13

## Recommended Target

Use the repo-served member page at `/member-money-demo/` from `src/money-demo-ui/member.html` as the first Lucky Wheel V1 entry point.

Reasons:

- It is already mounted by `src/app.js` and shares the local PG77 API base `/api`.
- Its member session flow already stores and restores a bearer token in localStorage.
- Its API helper already sends `X-Site-Code: PG77`.
- It already has a `Play Games / เล่นเกม` card that can receive a lightweight `กงล้อรางวัล` action without replacing the page.

## Current Findings

- Current repo-served member page: `/member-money-demo/`.
- Existing member wheel demo route: `/wheel-demo/` and `/member/wheel-demo/` serve `src/wheel-demo-ui`.
- Current app source for V1 wheel: `apps/lucky-wheel-game/`.
- Member demo API base: `/api`.
- Member demo site context: hardcoded `X-Site-Code: PG77`.
- Member demo session storage key shape: `pg77-money-demo:member:member-session`, with `token` and `profile` in the stored JSON payload.
- External `PG77-member-demo.zip` exists locally, but it is a separate static demo with its own large `app.js/style.css`, Google Fonts references, mock wheel/activity flows, and no observed `X-Site-Code` marker. Do not replace the repo-served member page with it without a separate migration/audit phase.

## Recommended Integration Mode

For V1, use a new backend static route that serves the built Lucky Wheel app as a fullscreen standalone route, then add a small entry button/card in `/member-money-demo/`.

Recommended route:

```text
/member/lucky-wheel/
```

Recommended behavior:

1. Member logs in through `/member-money-demo/`.
2. Member clicks `กงล้อรางวัล`.
3. Browser opens `/member/lucky-wheel/`.
4. Lucky Wheel reads the real member token, sends `X-Site-Code: PG77`, and calls the existing wheel API.
5. Backend remains the source of truth for config and spin result.

This avoids iframe token/session edge cases and keeps the wheel mobile-first/fullscreen.

## Next Implementation Plan

1. Align token storage so `apps/lucky-wheel-game` can read the member token written by `/member-money-demo/`, or add a safe bridge that copies the token into the existing `pg77_member_token` key after member login.
2. Build/serve `apps/lucky-wheel-game` from a backend static mount such as `/member/lucky-wheel/`.
3. Add a lightweight `กงล้อรางวัล` card or button next to the existing OroPlay demo card in `src/money-demo-ui/member.html`.
4. Keep local demo member fallback enabled only for local/dev `.env.local` usage, not for the repo-served member entry.
5. After a spin, refresh member reward/wallet views or add a link back to `/member-money-demo/` with a visible refresh instruction.

## Risks

- Replacing `src/money-demo-ui` with `PG77-member-demo.zip` would introduce a second auth/storage model, large static files, mock wheel behavior, and external font dependencies.
- An iframe embed could complicate localStorage/session access and mobile viewport sizing.
- Serving the Vite source directly from backend is not enough; V1 needs a deliberate build/static serving plan that does not commit `dist/`.
- If token storage is not aligned, Lucky Wheel will fall back to local demo mode or show auth errors instead of spinning for the real member.

## Safety Boundary

- No production DB.
- No live provider/payment/bank/SMS/Slip OCR.
- No backend wheel contract change.
- No zip, `node_modules`, `dist`, or `.env.local` copied.
- No deploy, migration, or Prisma schema change.
