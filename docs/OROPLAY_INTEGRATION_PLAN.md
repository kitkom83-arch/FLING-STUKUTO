# OroPlay Integration Plan

ORO sequence status: planning only. The current production direction is Seamless Wallet unless OroPlay confirms a different mode.

## Phase Sequence

| Phase | Goal | Scope | Exit gate |
| --- | --- | --- | --- |
| ORO-0 docs/status alignment | Record current production context and safe plan. | Docs/static only. | Docs updated with no secrets and no runtime code. |
| ORO-1 mock Seamless Wallet contract | Create mock-only callback and wallet contract. | Static/mock harness only. | Contract smoke confirms auth, balance, transaction, duplicate, and leak guards. |
| ORO-2A Callback API Design / Staging Route Boundary | Design callback routing, auth boundary, payload shape, amount intent, and sanitizer behavior. | Closed docs/static plus isolated mock boundary only; no Express route. | `smoke:oroplay-callback-boundary` confirms route/auth/payload/amount/no-mutation/sanitizer boundary. |
| ORO-2B Staging Fail-Closed Callback Stub | Add preferred route skeletons that fail closed by default. | Closed staging stub only; no wallet or ledger mutation; no aliases. | `smoke:oroplay-callback-stub` confirms route skeleton, fail-closed behavior, alias-disabled guard, sanitizer, and no-mutation boundary. |
| ORO-2C Callback Runtime Readiness Contract | Define member mapping, callback payload validation, idempotency, duplicate guard, sanitized callback log, and ledger/reconciliation readiness contract. | Current readiness contract only; no runtime processing; no wallet or ledger mutation; no aliases. | `smoke:oroplay-callback-readiness` confirms readiness contract, mock harness, sanitizer, no-mutation boundary, ORO-2B fail-closed default, and alias-disabled guard. |
| ORO-3 wallet/ledger/reconciliation design | Align member mapping, wallet ledger source of truth, callback logs, game transactions, idempotency, duplicate guards, and reconciliation reports. | Blocked until ORO-2C readiness smoke passes and runtime safety gates are approved. | Ledger and reconciliation guard checklist must be runtime-approved before callback mutation. |
| ORO-4 outbound service design | Plan provider credential exchange, vendor list, game list, detail, launch URL, and betting history services. | Service design only; no public member credential endpoint. | Provider request/response mapping and redaction rules documented. |
| ORO-5 admin read-only provider status page | Plan admin read-only provider health/status view. | Admin read-only design. | No write controls; no secret display; status-only payload. |
| ORO-6 staging UAT with server IP whitelist and HTTPS callback | Validate staging-only callback and outbound behavior. | Staging UAT only after approval. | Server IP whitelist, HTTPS callback, auth, duplicate, insufficient balance, and invalid transaction cases pass. |
| ORO-7 live certification gate | Final approval before live use. | Certification evidence only unless explicitly approved. | Security, rollback, backup, reconciliation, audit, monitoring, and final approval recorded. |

## Safety Boundary

- No production DB.
- No real money runtime flow.
- No live payout.
- No hardcoded secrets.
- No callback wallet mutation until ledger/idempotency/reconciliation guards exist.
- No live provider call until sandbox/staging evidence and certification are approved.
- No migration or deploy in ORO-2A.

## ORO-2A Closed Scope

- Preferred callback routes: `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`.
- Optional provider-compatible aliases: `POST /api/balance` and `POST /api/transaction` only if OroPlay requires them later.
- Basic Auth must use env-only credentials and sanitized logs only.
- Request boundary covers `userCode`, `transactionCode`, `roundId`, `amount`, and `isFinished`.
- Negative amount means bet/debit intent; positive amount means win/credit intent; zero or malformed amount is rejected.
- ORO-2A does not add runtime wallet mutation, runtime ledger mutation, production DB access, real money, live OroPlay API calls, external network, migrations, deploys, or real client secrets.

ORO-2A callback design boundary is closed.

## ORO-2B Current Scope

ORO-2B staging fail-closed callback stub is closed.

ORO-2B staging fail-closed callback stub is current.

ORO-2B staging fail-closed callback stub is current as the active fail-closed runtime default; ORO-2C is current for readiness contract work.

- Active skeleton routes: `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`.
- Default route behavior: disabled/fail-closed unless the staging stub placeholder env key is explicitly enabled.
- Enabled staging stub behavior still fails closed and does not process a live callback.
- Optional aliases `POST /api/balance` and `POST /api/transaction` remain disabled and provider-required-only.
- No production DB, no real money, no live OroPlay API call, no external network, no client secret, no runtime wallet mutation, no runtime ledger mutation, no migration, and no deploy.

## ORO-2C Current Scope

ORO-2C callback runtime readiness contract is current.

- Member mapping contract covers valid `userCode`, unknown `userCode`, blocked member, inactive member, and malformed `userCode`.
- Callback payload validation contract covers balance payload, transaction payload, malformed body, missing `userCode`, missing `transactionCode`, invalid amount, unsupported transaction type, and unknown vendor/game fields.
- Idempotency contract covers duplicate `transactionCode`, same payload replay, round/session replay, and conflicting replay to manual review / fail-closed.
- Sanitized callback log contract allows only safe metadata such as request id, route, event type, masked/hash `userCode`, and masked/hash `transactionCode`.
- Ledger/reconciliation boundary remains mock readiness only.
- No production DB, no real money, no live OroPlay API call, no external network, no client secret, no runtime wallet mutation, no runtime ledger mutation, no migration, no deploy, and no aliases.

ORO-3 is blocked until `smoke:oroplay-callback-readiness` passes and runtime safety gates are approved.

ORO-3 dependencies before any callback processing:

- member mapping.
- idempotency.
- ledger/reconciliation guard.
- sanitized callback log design.

## Current Integration Direction

- Prefer Seamless Wallet for planning because admin currently shows API mode as Seamless Wallet.
- Treat Balance Transfer API as documented by OroPlay but secondary until confirmed.
- Keep provider credential exchange internal only; never expose provider credential creation as a public member endpoint.
- Keep betting history sync for reconciliation, not as a wallet source of truth.

## Required Future Evidence

- OroPlay callback credential type and rotation process.
- Server IP whitelist requirements.
- HTTPS callback URL requirements.
- Balance precision, currency, and timezone rules.
- Duplicate `transactionCode` behavior.
- Finished round / invalid transaction examples.
- Insufficient balance response expected by provider.
- Betting history pagination and reconciliation retention.
- Launch URL expiry and device behavior.
