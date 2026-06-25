# Wheel Game V1 Frontend API Connect

Phase: WHEEL-GAME-V1-FRONTEND-API-CONNECT-7

This runbook connects the standalone `lucky-wheel-game` Phaser/Vite prototype to the existing PG77-real-core Lucky Wheel member API for local demo/testing only. It does not enable production DB access, real money, live provider calls, payment, bank, SMS, Slip OCR, deploy, migration, or Prisma schema changes.

## What Was Inspected

Standalone prototype files inspected from `lucky-wheel-game.zip`:

- `package.json`
- `README.md`
- `.env.example`
- `vite.config.ts`
- `src/game/services/wheelApi.ts`
- `src/game/services/mockBackend.ts`
- `src/game/content/rewards.ts`
- `src/game/simulation/store.ts`
- `src/phaser/scenes/LuckyWheelScene.ts`
- `src/ui/mountGameUi.ts`

PG77-real-core backend files inspected:

- `src/routes/wheel.routes.js`
- `src/controllers/wheel.controller.js`
- `src/services/wheel.service.js`
- `src/middleware/wheelMemberAuth.js`
- `docs/API.md`
- `src/local-smoke-tests/wheelSmoke.js`

## Backend Contract

The PG77 member Lucky Wheel API is already present behind `/api`:

- `GET /api/member/wheel/config`
- `POST /api/member/wheel/spin`
- `GET /api/member/wheel/history`
- `GET /api/member/wheel/my-rewards`

Frontend spin requests must send only:

```json
{ "campaignId": "wheel_main" }
```

Frontend requests must not submit `rewardId`, `prizeIndex`, `rewardValue`, or `probabilityWeight`. The backend is the source of truth for the selected reward, returns `prizeIndex` plus reward metadata, creates pending `member_rewards`, and bridges non-`no_reward` results into `member_reward_wallet_entries`.

## Prototype Compatibility Findings

The prototype already has API mode and uses these correct relative paths when `VITE_WHEEL_API_BASE_URL` is `http://127.0.0.1:4000/api`:

- `/member/wheel/config`
- `/member/wheel/spin`
- `/member/wheel/history?limit=20`
- `/member/wheel/my-rewards?limit=20`

The prototype `spinWheel` call sends only `{ campaignId }` in API mode. It does not send frontend-selected reward fields.

Compatibility notes for `src/game/services/wheelApi.ts`:

- Already supports the PG77 `success/data` envelope.
- Already maps `campaignId`, `remainingSpinsToday`, `memberBalance`, `rewards`, `prizeIndex`, `rewardId`, and `reward.label/type/amount/displayValue`.
- Recommended defensive fallback: accept `remainingSpins` when `remainingSpinsToday` is absent.
- Recommended defensive fallback: accept `balanceAfter` from the spin response when refreshing config fails.
- Recommended type normalization: PG77 may return `physical`; the prototype should map `physical` to the existing `item` visual type.
- Recommended history/reward mapper: accept either flattened fields (`rewardLabel`, `rewardType`, `rewardValue`) or nested `reward.label/type/amount/displayValue`.
- Recommended prize index handling: if backend reward count differs from the prototype's eight static Phaser segments, local demo seed should keep eight active rewards or the frontend should add a segment alignment patch before browser QA.

No backend compatibility change is required for this phase.

## Safe Placement

Keep `lucky-wheel-game.zip` outside PG77-real-core, for example:

```text
C:\Users\ADMIN\Downloads\lucky-wheel-game.zip
```

Extract the prototype outside the repo or under a temporary ignored workspace. Do not copy these into PG77-real-core:

- `lucky-wheel-game.zip`
- `node_modules`
- `dist`
- real `.env.local` containing secrets

Safe example:

```powershell
Expand-Archive C:\Users\ADMIN\Downloads\lucky-wheel-game.zip C:\Users\ADMIN\Downloads\lucky-wheel-game-work -Force
cd C:\Users\ADMIN\Downloads\lucky-wheel-game-work\lucky-wheel-game
```

## Frontend Env

For local PG77 API mode, create `lucky-wheel-game/.env.local` with demo-only values:

```text
VITE_WHEEL_API_MODE=api
VITE_WHEEL_API_BASE_URL=http://127.0.0.1:4000/api
VITE_WHEEL_DEMO_MEMBER_ENABLED=true
VITE_WHEEL_DEMO_MEMBER_ID=demo_member
```

The Vite proxy in `vite.config.ts` also forwards `/api` to `http://127.0.0.1:4000` for local development, but the explicit API base URL above is the clearest demo setup.

## Start PG77 Backend Locally

Use local/test settings only. The local demo member bridge in `wheelMemberAuth.js` is intentionally narrow:

- `NODE_ENV=development-local` or `NODE_ENV=test`
- `APP_ENV=local-test`
- provider/payment/bank/SMS/Slip OCR modes set to mock
- dummy local-only `JWT_SECRET`
- dummy local-only `LOCAL_ADMIN_PASSWORD`
- local test database only

Then start the backend on `127.0.0.1:4000` using the repo's normal local command for this workspace.

Do not use production DB, real member funds, live provider, payment, bank, SMS, or Slip OCR services.

## Start Lucky Wheel Frontend

From the extracted standalone prototype:

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Manual API Checks

Use browser DevTools Network while the PG77 backend and prototype dev server are both running:

- Loading the game calls `GET http://127.0.0.1:4000/api/member/wheel/config`.
- Pressing Spin calls `POST http://127.0.0.1:4000/api/member/wheel/spin` with only `{ "campaignId": "wheel_main" }`.
- After a spin, the UI refreshes `GET /api/member/wheel/config`, `GET /api/member/wheel/history?limit=20`, and `GET /api/member/wheel/my-rewards?limit=20`.
- The response body is wrapped as `{ success: true, data: ... }`.
- The spin response includes backend-selected `prizeIndex`, `rewardId`, `reward`, `remainingSpinsToday`, and `balanceAfter`.

## Verify The Frontend Does Not Randomize

Check these source points in the extracted prototype:

- `src/game/services/wheelApi.ts`: API mode `spinWheel` calls `/member/wheel/spin` and sends only `{ campaignId }`.
- `src/phaser/scenes/LuckyWheelScene.ts`: the scene awaits `spinWheel`, then calls `spinToPrize(result.prizeIndex)`.
- `src/game/services/mockBackend.ts`: mock result cycling is isolated to mock mode only.
- Browser DevTools request payload for `/member/wheel/spin` contains no `rewardId`, no `prizeIndex`, no `rewardValue`, and no `probabilityWeight`.

## Verify Reward Wallet Bridge

For backend proof, use the existing local backend smoke:

```powershell
npm run smoke:wheel
```

That smoke validates the member endpoints, confirms frontend result-field injection is rejected, performs a local-safe spin, confirms pending my-rewards behavior for non-`no_reward` results, and checks that a `member_reward_wallet_entries` row is created with wheel metadata. It uses local/staging/test fixtures only and must not be pointed at production.

## Compatibility Patch Guidance

If the prototype source is updated before browser QA, apply these safe frontend-only mapper improvements in `src/game/services/wheelApi.ts`:

- Add `remainingSpins?: number | null` to `ApiWheelConfig`.
- Map `remainingSpins` from `remainingSpinsToday ?? remainingSpins`.
- Add `balanceAfter?: Partial<Record<keyof WheelBalance, unknown>>` to `ApiSpinResponse` only for display fallback; never use it to choose the prize.
- Extend record types so history and my-rewards accept nested `reward` objects as well as flattened fields.
- Normalize backend `physical` reward type to prototype `item`.

These are compatibility improvements only. They must not add frontend reward selection, frontend probability, coupon/shop/cashback/commission logic, or any real payout behavior.

## Safety Boundary

This phase is local/demo only:

- no production DB
- no real money
- no live API
- no live provider/payment/bank/SMS/Slip OCR
- no deploy
- no migration
- no Prisma schema change
- no lucky-wheel-game.zip committed
- no node_modules committed
- no dist committed
- no secrets, tokens, passwords, or database URLs committed
