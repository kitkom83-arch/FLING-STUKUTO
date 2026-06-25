# Code Center Reward Economy Mapping

## 1. Current phase

Phase: `CODE-CENTER-REWARD-ECONOMY-MAPPING-5`.

This phase maps the legacy/demo Backoffice reward economy into the current Code Center and Reward Wallet runtime contract. It is documentation-only. It does not add business logic, Prisma schema changes, migrations, deployment, production DB access, live provider calls, or real-money behavior.

Current closed foundation:

- `CODE-CENTER-REWARD-WALLET-RUNTIME-3`: Code Center runtime storage wiring.
- `CODE-CENTER-REWARD-WALLET-MIGRATION-4`: Prisma migration for Code Center and member reward wallet storage.

The current runtime intentionally keeps cash wallet mutation blocked for Code Center rewards. `cash_credit` is rejected until a guarded ledger implementation exists.

## 2. Source files inspected

Repository files inspected:

- `prisma/schema.prisma`
- `prisma/migrations/20260625121414_code_center_reward_wallet_runtime_models/migration.sql`
- `src/services/codeCenter.service.js`
- `src/services/memberRewardWallet.service.js`
- `src/services/codeCenterRuntimeStore.js`
- `src/controllers/codeCenter.controller.js`
- `src/controllers/memberReward.controller.js`
- `src/routes/admin.routes.js`
- `src/routes/index.js`
- `src/controllers/admin.controller.js`
- `src/services/wallet.service.js`
- `src/services/point.service.js`
- `src/services/promotion.service.js`
- `src/services/wheel.service.js`
- `src/admin-ui/index.html`
- `src/admin-wheel-ui/index.html`
- `src/admin-wheel-ui/app.js`
- `src/money-demo-ui/member.html`
- `src/money-demo-ui/app.js`
- `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md`
- `docs/PHASE_ROADMAP.md`
- `docs/SMOKE_COVERAGE.md`
- `docs/API_MAPPING.md`

Reference-only source:

- `C:\Users\ADMIN\Downloads\สรุปเนื้อหาเข้าใจง่าย.pdf`

The PDF was readable through its embedded text layer and was used only for feature/menu mapping. Its contents were not copied wholesale into this document.

## 3. Backoffice reward economy summary

The legacy Backoffice model groups reward economy controls across four areas:

- Reports: promotion/bonus, cashback, commission, wheel, referral, ranking, coupon, credit return/removal, point campaign, shop, check-in, tournament, and other reward-cost reporting.
- Account transactions: deposit/withdraw flows plus admin credit, bonus, turnover, point, random box, and referral-balance adjustments.
- Extra services: referral wallet, daily check-in, lucky wheel, point/diamond campaigns, coupon, random box, shop, and tournament-style engagement.
- Settings: promotion rules, cashback/lossback rules, commission rules, game/category settings, withdrawal caps, turnover requirements, and claim windows.

The important contract shape is not one generic reward balance. It is a set of typed reward sources, typed member wallet entries, ledger movements, approval gates, and audit records. Any reward that becomes playable credit or cash must move through the financial ledger and approval controls rather than directly mutating a balance field.

## 4. Reward Type Mapping table

| Reward type | Meaning | Backoffice/demo source | Creator | Receiver | Target wallet | Turn required | Play credit withdrawal | Cash withdrawal | Approval | Audit level |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `credit` | Playable cash wallet credit | Manage credit, wheel reward, shop exchange, check-in | Admin or guarded system job | Member | `wallet_accounts` plus `wallet_ledgers` | Sometimes, depending source | Already play credit | No direct cash without withdraw flow | Yes for admin/manual or reward conversion | Financial ledger + admin audit |
| `bonus_credit` | Promotional playable bonus | Manage bonus, promotion setup, check-in bonus | Admin or promotion engine | Member | Wallet ledger type `bonus` or `promotion_bonus` | Usually yes | Yes, with turnover lock | No direct cash | Yes for manual grant | Financial ledger + promotion source |
| `cash_credit` / `cashback` / lossback | Lossback/cashback settlement value | Cashback/lossback settings, reports | Scheduled settlement job, finance admin | Member | Separate cashback cycle, then wallet/cash approval | Usually configurable | Only via guarded conversion | Only through cash withdrawal approval | Required | Cycle record + financial ledger + dual-control audit |
| `diamond` / `point` | Loyalty/engagement points or diamonds | Point campaigns, check-in, shop, wheel cost | Admin or system campaign | Member | `users.points` with `point_ledgers`; future reward wallet for claimable entries | Usually no unless converted | Only after conversion rule | No direct cash | Manual adjustment requires permission | Point ledger + admin audit |
| `coupon` | Redeemable code/benefit | Coupon menu, Code Center | Admin with Code Center permission | Member | `member_reward_wallet_entries` | Depends reward payload | Only if coupon grants credit through later ledger | No direct cash | Campaign creation approval recommended | Code redeem log + reward wallet history |
| `random_box` / `box` | Claimable/openable mystery box | Random box service/menu | Admin campaign | Member | `member_reward_wallet_entries` until opened | Depends prize | Only if prize converts to credit | No direct cash without approval | Required for odds/rate changes | Box open ledger + odds snapshot + audit |
| `wheel_ticket` | Spin entitlement | Wheel, coupon, point campaign, admin grant | Admin or campaign | Member | Future reward wallet entry | No, unless source says | No | No | Manual grant approval recommended | Reward wallet + source audit |
| `wheel_reward` | Prize produced by a spin | Lucky Wheel | Wheel engine | Member | Existing `member_rewards`; future unified reward wallet | Depends prize type | Only via prize conversion | Only if physical/cash path approved | Physical/cash claims need approval | Wheel spin + reward claim audit |
| `shop_item` | Product or exchange item | Shop | Admin shop config, member redeem | Member | Shop order/fulfillment ledger; optional reward wallet | No, unless credit conversion | If item is credit conversion only | If cash conversion only through approval | Required for physical/cash fulfillment | Shop order + fulfillment audit |
| `referral_balance` | Referral reward balance | Referral system/report | Referral engine or admin adjustment | Referrer member | Referral wallet/cycle model; not generic wallet field | Usually configurable | Possible via conversion rule | Possible via cash withdrawal approval | Required for manual/withdraw | Referral cycle + ledger + admin audit |
| `commission` | Commission settlement | Commission settings/report | Scheduled settlement job, finance admin | Member/agent/referrer | Commission cycle model; then wallet/cash approval | Usually no | Possible via guarded conversion | Possible via cash withdrawal approval | Required | Commission cycle + financial ledger |
| `pending_reward` | Reward awaiting review/claim | Code Center, wheel, physical rewards, manual review | Admin/system | Member | `member_reward_wallet_entries` or `member_rewards` | Depends final reward | No until approved/converted | No until approved | Required | Pending record + decision audit |
| `turn_increase` | Adds turnover obligation | Manage turnover, promotion setup | Admin or promotion engine | Member | `turnover_requirements` | Yes | Blocks withdraw until met | Blocks cash withdraw until met | Required for manual | Turnover ledger + admin audit |
| `turn_reduce` | Reduces/removes turnover obligation | Manage turnover | Admin with elevated permission | Member | `turnover_requirements` plus future turnover ledger | N/A | May unlock play/cash flow | May unlock withdrawal | Strong approval required | High-risk admin audit + before/after |

## 5. Admin Operation Mapping table

| Operation | Automatic/manual | Wallet affected | Required permission | Approval gate | Ledger/audit required |
| --- | --- | --- | --- | --- | --- |
| Manage credit | Manual | Cash/play wallet | `wallet.credit.adjust` or stricter than current `members.update` | Required for remove, large add, or real-money credit | `wallet_ledgers` + admin audit with reason |
| Manage bonus | Manual/system | Bonus wallet or wallet ledger `bonus` | `bonus.manage` | Required for manual grant/cancel | Bonus source record + wallet ledger + admin audit |
| Manage turnover | Manual/system | `turnover_requirements` | `turnover.manage`; `turnover.reduce` separate | Required, especially reduce/remove | Turnover ledger + before/after admin audit |
| Manage points | Manual/system | `users.points`, `point_ledgers` | `points.adjust` | Required for large/manual removal | `point_ledgers` + admin audit |
| Manage random boxes | Manual/system config | Reward wallet box entries, box inventory | `random_box.manage` | Required for odds, stock, or prize changes | Box config audit + open-box ledger |
| Manage referral balance | Manual/system settlement | Referral wallet/cycle | `referral.manage` | Required for withdrawals/manual adjustment | Referral cycle + ledger + admin audit |
| Configure cashback/lossback | Manual config, automatic cycle settlement | Cashback cycle, wallet conversion | `cashback.manage` | Required for config and settlement release | Cycle record + financial ledger + admin audit |
| Configure commission | Manual config, automatic cycle settlement | Commission cycle, wallet conversion | `commission.manage` | Required for config and settlement release | Cycle record + financial ledger + admin audit |
| Coupon / Code Center | Manual campaign/code generation, member redeem automatic | Reward wallet entry | `code_center.manage`, `code_center.view` | Required for high-value or cash-convertible campaigns | Code campaign + code redeem log + admin audit |
| Random box member flow | Member automatic after entitlement | Reward wallet box and opened prize | Member auth + box eligibility | No for low-risk; yes for cash/credit prize release | Open-box ledger + odds snapshot |
| Shop | Member redeem, admin fulfillment | Points/reward wallet/shop order | `shop.manage`, member auth | Required for physical/cash/credit fulfillment | Shop order + point/reward ledger + fulfillment audit |
| Lucky Wheel | Member automatic spin; admin config manual | Points cost, wheel rewards | Wheel permissions already split | Required for reward/status changes and physical claim | `wheel_spins`, `member_rewards`, point ledger, admin audit |
| Check-in | Automatic member claim | Points/diamond/coupon/credit via campaign | `checkin.manage` for config | Required if credit/cash reward | Check-in claim record + reward/point/wallet ledger |
| Point/diamond campaign | Automatic/manual grant | Point ledger or reward wallet | `points.campaign.manage` | Required for bulk or conversion | Campaign grant ledger + admin audit |

## 6. Wallet Ledger Mapping table

| Ledger action | Recommended ledger | Required source record | Notes |
| --- | --- | --- | --- |
| `grant` | Reward wallet ledger or point/wallet ledger by type | Campaign, admin action, cycle, or code redeem | Must be idempotent by source type/id. |
| `redeem` | Reward wallet ledger | Reward wallet entry, coupon/code, shop order | Should mark entry consumed rather than delete it. |
| `expire` | Reward wallet ledger | Reward wallet entry | Needs scheduled job record and audit visibility. |
| `adjust` | Typed wallet/point/reward ledger | Admin adjustment | Reason required. High-risk types need approval. |
| `reverse` | Same ledger family as original movement | Original ledger id | Never edit original row in place. |
| `withdraw_to_play_credit` | Reward wallet ledger plus `wallet_ledgers` | Reward wallet entry and conversion request | Creates playable credit only after guard/approval. |
| `withdraw_to_cash` | Reward wallet ledger plus withdraw approval flow | Cash withdrawal request | Must not bypass bank/withdraw approval. |
| `open_box` | Reward wallet ledger plus box-open record | Box entitlement and odds snapshot | Store selected prize, odds version, and stock movement. |
| `spin_wheel` | `wheel_spins` plus point ledger; future reward wallet bridge | Wheel campaign/reward | Frontend must not submit result fields; current service enforces this. |
| `apply_coupon` | `code_redeem_logs` plus reward wallet ledger | Code Center campaign/code | Current unique `(code_id, member_id)` protects duplicate member redeem. |
| `cashback_cycle_settle` | Cashback cycle ledger, then wallet/cash ledger if released | Cycle settlement record | Needs period, game/category basis, eligible loss, cap, approver. |
| `turn_add` | Turnover ledger plus `turnover_requirements` | Promotion/admin/source event | Locks withdraw rules until satisfied. |
| `turn_reduce` | Turnover ledger plus `turnover_requirements` | Admin approval decision | High-risk, requires elevated permission and before/after audit. |
| `admin_adjust` | Financial/point/reward ledger depending asset | Admin action | Current credit/point flows exist, but permission granularity is too broad. |

## 7. Current Prisma/schema fit

Supported now:

- Code Center campaign/code/redeem storage exists through `code_campaigns`, `code_center_codes`, and `code_redeem_logs`.
- Member reward wallet entries exist through `member_reward_wallet_entries`.
- Code redeem uniqueness exists for `(code_id, member_id)`.
- Reward wallet idempotency exists for `(site_id, source_type, source_id)`.
- Current Code Center runtime supports `coupon`, `box`, `diamond`, and `pending_reward`.
- `cash_credit` is explicitly blocked by the Code Center reward service.
- Cash/play wallet ledger exists through `wallet_ledgers`.
- Point ledger exists through `point_ledgers`.
- Promotion bonus and turnover basics exist through `promotions`, `promotion_claims`, and `turnover_requirements`.
- Lucky Wheel has separate campaign, reward, spin, stock, probability weight, result snapshot, and member reward models.
- Admin audit exists through `admin_logs`.

Partial fit:

- `MemberRewardWalletEntry.payload` can carry metadata, but should not become the only home for rules, odds, approval state, or cycle settlement details.
- Wheel rewards currently use `member_rewards`, not the new `member_reward_wallet_entries`, so a bridge/normalization phase is needed.
- Point balance is both `users.points` and `point_ledgers`; future diamond/point campaigns should rely on ledger movements, not direct balance edits.
- Existing admin credit/point routes create ledger/audit, but their permission is still `members.update`, which is too coarse for real reward economy operations.

## 8. Missing models/fields/gaps

Recommended next schema/data gaps:

- Reward wallet ledger table: immutable history for grant, redeem, expire, adjust, reverse, conversion, open_box, and approval decisions.
- Reward wallet lifecycle fields: `available_at`, `expires_at`, `claimed_at`, `approved_by_id`, `approved_at`, `cancelled_at`, `reason`, and `version`.
- Reward conversion request model: separate conversion from reward wallet to play credit or cash withdrawal.
- Coupon/code abuse controls: per-member window, device/IP hash, campaign global rate limits, and failure log.
- Random box models: box campaign, box prize, odds version, stock, open event, and result snapshot.
- Shop models: catalog item, inventory, order/redeem record, fulfillment status, delivery/cash/credit conversion status.
- Check-in campaign/claim models: daily claim state, streak, reward selection, eligibility snapshot.
- Cashback/lossback cycle models: period, game/category basis, loss amount, cap, settlement status, release approval.
- Commission cycle models: source member/agent, period, basis amount, rate, cap, settlement status, release approval.
- Referral wallet/cycle models: referral source, invited member, qualifying event, cycle amount, conversion/withdraw status.
- Turnover ledger model: immutable add/reduce/satisfy/reverse entries instead of only current requirement rows.
- Approval workflow model: request, reviewer, decision, reason, dual-control/self-approval guard, evidence snapshot.
- Stronger permission taxonomy: split credit add/remove, bonus grant/cancel, point add/remove, turnover add/reduce, cashback release, commission release, reward conversion, and physical/cash claim.

Avoid storing these only in one JSON payload:

- odds/rate tables,
- cash/credit conversion approvals,
- cashback/commission cycle basis,
- financial before/after balances,
- turnover reductions,
- physical fulfillment decisions,
- idempotency keys for money-affecting actions.

## 9. Safety and approval rules

- Reducing turnover must require elevated permission, reason, before/after snapshot, and admin audit.
- Cash withdrawal from any reward must use a separate withdrawal/conversion approval path.
- Cashback/lossback must be cycle-based with period boundaries, cap calculation, and settlement record.
- Commission must be cycle-based with source basis and release approval.
- Random box odds/rates must be versioned and audited; box open must store the odds snapshot used.
- Coupon/code redemption must enforce duplicate, per-member, campaign cap, expiry, and abuse controls.
- Diamond/point changes must use `point_ledgers`; direct balance edits are not acceptable for production logic.
- Rewards convertible to real money must not be editable through ordinary campaign or member update operations.
- Admin adjustment must require a reason and should fail closed on missing source/permission.
- Physical/cash/high-value reward claim must require approval and should prevent self-approval.
- No reward runtime should print secrets, live database URLs, provider tokens, or raw sensitive member data.

## 10. Recommended next implementation phases

1. Reward Wallet Ledger Contract
   - Add a documentation/static contract for reward wallet ledger actions, status transitions, idempotency keys, and conversion rules.

2. Permission and Approval Matrix
   - Split current broad `members.update` coverage into reward-economy-specific permissions and approval gates.

3. Reward Wallet Ledger Schema
   - Add an immutable reward wallet ledger and lifecycle fields after explicit migration approval.

4. Code Center Conversion Guard
   - Keep current non-cash rewards available, then add guarded conversion request flow for playable credit only.

5. Wheel to Reward Wallet Bridge
   - Map `member_rewards` into unified reward wallet entries without losing `wheel_spins` audit and odds snapshots.

6. Random Box Contract and Schema
   - Define box campaign/prize/odds/open models before implementation.

7. Cashback, Commission, and Referral Cycle Contracts
   - Build cycle records first; only later allow wallet/cash release through approval.

8. Shop and Check-in Contracts
   - Model catalog/order and daily claim/streak records before adding runtime grants.

9. Safety Smoke Coverage
   - Add negative tests for duplicate redeem, unsupported cash credit, permission denial, missing reason, and no direct cash mutation.

## 11. Validation notes

- This document is mapping-only.
- No runtime code changed.
- No Prisma schema changed.
- No migration was created.
- No production DB, live API, provider, payment, bank, SMS, or Slip OCR was called.
- The PDF reference was read locally for mapping only and was not copied into the repository.
- The PDF file was not added to the repository.
