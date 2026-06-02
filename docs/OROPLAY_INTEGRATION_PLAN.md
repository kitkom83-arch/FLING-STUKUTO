# OroPlay Integration Plan

ORO sequence status: planning only. The current production direction is Seamless Wallet unless OroPlay confirms a different mode.

## Phase Sequence

| Phase | Goal | Scope | Exit gate |
| --- | --- | --- | --- |
| ORO-0 docs/status alignment | Record current production context and safe plan. | Docs/static only. | Docs updated with no secrets and no runtime code. |
| ORO-1 mock Seamless Wallet contract | Create mock-only callback and wallet contract. | Static/mock harness only. | Contract smoke confirms auth, balance, transaction, duplicate, and leak guards. |
| ORO-2A Callback API Design / Staging Route Boundary | Design callback routing, auth boundary, payload shape, amount intent, and sanitizer behavior. | Docs/static plus isolated mock boundary only; no Express route. | `smoke:oroplay-callback-boundary` confirms route/auth/payload/amount/no-mutation/sanitizer boundary. |
| ORO-2B Future Staging Callback Stub | Optional disabled staging route stub only if explicitly approved later. | Staging stub only; no wallet or ledger mutation. | Stub fails closed until member mapping, ledger, idempotency, logs, and reconciliation are approved. |
| ORO-3 wallet/ledger/reconciliation design | Align member mapping, wallet ledger source of truth, callback logs, game transactions, idempotency, duplicate guards, and reconciliation reports. | Design/static only until approved. | Ledger and reconciliation guard checklist complete. |
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

## ORO-2A Current Scope

- Preferred callback routes: `POST /api/oroplay/balance` and `POST /api/oroplay/transaction`.
- Optional provider-compatible aliases: `POST /api/balance` and `POST /api/transaction` only if OroPlay requires them later.
- Basic Auth must use env-only credentials and sanitized logs only.
- Request boundary covers `userCode`, `transactionCode`, `roundId`, `amount`, and `isFinished`.
- Negative amount means bet/debit intent; positive amount means win/credit intent; zero or malformed amount is rejected.
- ORO-2A does not add runtime wallet mutation, runtime ledger mutation, production DB access, real money, live OroPlay API calls, external network, migrations, deploys, or real client secrets.

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
