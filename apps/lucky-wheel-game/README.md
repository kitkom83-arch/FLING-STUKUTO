# PG77 Lucky Wheel Phaser Prototype

Standalone mobile-first Phaser 3 Lucky Wheel prototype for demo, deploy preview, and safe PG77-real-core Lucky Wheel Backend MVP integration.

This project is intentionally separate from PG77-real-core. It does not handle real money, does not pay out real rewards, and does not connect to any payment or external reward provider.

## Run Dev

```bash
npm install
npm run dev
```

The dev server uses Vite and opens at:

```text
http://127.0.0.1:5173
```

## Wheel API Mode

The app defaults to mock mode. Copy `.env.example` to `.env.local` and choose one mode:

```text
VITE_WHEEL_API_MODE=api
VITE_WHEEL_API_BASE_URL=http://127.0.0.1:4000/api
VITE_WHEEL_SITE_CODE=PG77
VITE_WHEEL_DEMO_MEMBER_ENABLED=true
VITE_WHEEL_DEMO_MEMBER_ID=demo_member
```

Modes:

- `mock`: uses the existing local mock result flow in `src/game/services/mockBackend.ts`.
- `api`: calls PG77-real-core member Lucky Wheel MVP endpoints:
  - `GET /member/wheel/config`
  - `POST /member/wheel/spin`
  - `GET /member/wheel/history`
  - `GET /member/wheel/my-rewards`

For local PG77-real-core smoke/demo runs, set `VITE_WHEEL_DEMO_MEMBER_ENABLED=true`. API mode then sends the safe local demo member header required by the Lucky Wheel endpoints:

```text
x-demo-member-id: demo_member
```

PG77-real-core also requires site context. Set `VITE_WHEEL_SITE_CODE=PG77` for local/test API runs so the frontend sends:

```text
X-Site-Code: PG77
```

With the site code configured, the frontend calls PG77-real-core directly and does not need a local proxy to add headers. Use this only with local/test PG77 backend environments.

When `VITE_WHEEL_DEMO_MEMBER_ENABLED` is not `true`, API mode expects a member bearer token already saved by the PG77 member demo under `localStorage` key `pg77_member_token`. The token is only read for the `Authorization` header and is not logged or rendered.

Vite also proxies `/api` to `http://127.0.0.1:4000` for local development. Do not commit real tokens, passwords, or secrets.

## Build

```bash
npm run build
```

The browser-ready export is generated in:

```text
dist/
```

## Open Demo

1. Start the dev server with `npm run dev`.
2. Open `http://127.0.0.1:5173`.
3. Test the flow: Loading screen, Lucky Wheel, Spin, Result modal, My Rewards, Rules, and History.

## File Structure

```text
index.html
package.json
vite.config.ts
tsconfig.json
src/
  main.ts
  styles.css
  types/
    phaser-esm.d.ts
  game/
    content/
      rewards.ts              8 wheel reward segment definitions
    services/
      mockBackend.ts          mock spin result integration boundary
      wheelApi.ts             mock/api Lucky Wheel service adapter
    simulation/
      store.ts                source of truth for UI/game state
  phaser/
    scenes/
      LoadingScene.ts         loading screen and generated UI textures
      LuckyWheelScene.ts      Phaser wheel rendering and spin animation
  ui/
    mountGameUi.ts            DOM HUD, modal, rewards, rules, history
dist/
  index.html
  assets/                     production build output
```

## Mock Scope

- Spin result is mocked in `src/game/services/mockBackend.ts`.
- Mock result shape is `{ prizeIndex, rewardId, rewardLabel, rewardType, amount }`.
- Mock reward segments are defined in `src/game/content/rewards.ts`.
- Demo balances, rewards, and history are stored in memory in `src/game/simulation/store.ts`.
- Data resets on page refresh.

## Backend Integration Point

Use `VITE_WHEEL_API_MODE=api` to call the PG77-real-core Lucky Wheel Backend MVP through `src/game/services/wheelApi.ts`.

The frontend must keep this rule:

- It requests a spin result.
- It receives `prizeIndex` and reward metadata from the backend.
- It animates the wheel to that exact `prizeIndex`.
- It sends only `{ campaignId }` when spinning.
- It does not send `rewardId`, `prizeIndex`, `rewardValue`, or `probabilityWeight`.
- It does not randomize, select, or override the reward in the browser.
- Local demo member mode sends the `X-Site-Code` header configured by `VITE_WHEEL_SITE_CODE` and the `x-demo-member-id` header configured by `VITE_WHEEL_DEMO_MEMBER_ID`; it does not add real-money, payout, payment, provider, or external reward integrations.

## Current Prototype Features

- 360x740 mobile-first Phaser canvas with responsive desktop preview.
- Red/gold festival casino mini-game styling.
- Original generated vector/canvas assets only.
- Loading screen.
- Lucky Wheel screen with 8 reward segments.
- Fixed top pointer.
- Center spin button.
- Spin button disabled while spinning.
- 4-6 full wheel rotations with easing.
- Result modal after spin animation.
- Remaining spins badge.
- Credit, points, and ticket demo balances.
- My Rewards, Rules, and Spin History screens.

## Non-Goals

- No production/staging URL hardcoded in source.
- No real-money wallet.
- No real payout.
- No payment provider.
- No external reward provider.
