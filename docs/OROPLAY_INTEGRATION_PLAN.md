# OroPlay Integration Plan

ORO sequence status: planning only. The current production direction is Seamless Wallet unless OroPlay confirms a different mode.

## Phase Sequence

| Phase | Goal | Scope | Exit gate |
| --- | --- | --- | --- |
| ORO-0 docs/status alignment | Record current production context and safe plan. | Docs/static only. | Docs updated with no secrets and no runtime code. |
| ORO-1 mock Seamless Wallet contract | Create mock-only callback and wallet contract. | Static/mock harness only. | Contract smoke confirms auth, balance, transaction, duplicate, and leak guards. |
| ORO-2A Callback API Design / Staging Route Boundary | Design callback routing, auth boundary, payload shape, amount intent, and sanitizer behavior. | Closed docs/static plus isolated mock boundary only; no Express route. | `smoke:oroplay-callback-boundary` confirms route/auth/payload/amount/no-mutation/sanitizer boundary. |
| ORO-2B Staging Fail-Closed Callback Stub | Add preferred route skeletons that fail closed by default. | Closed staging stub only; no wallet or ledger mutation; no aliases. | `smoke:oroplay-callback-stub` confirms route skeleton, fail-closed behavior, alias-disabled guard, sanitizer, and no-mutation boundary. |
| ORO-2C Callback Runtime Readiness Contract | Define member mapping, callback payload validation, idempotency, duplicate guard, sanitized callback log, and ledger/reconciliation readiness contract. | Closed readiness contract only; no runtime processing; no wallet or ledger mutation; no aliases. | `smoke:oroplay-callback-readiness` confirms readiness contract, mock harness, sanitizer, no-mutation boundary, ORO-2B fail-closed default, and alias-disabled guard. |
| ORO-3A Callback Runtime Simulation Harness | Simulate balance and transaction runtime decisions with mock state and intent objects only. | Closed simulation harness only; no runtime wallet mutation; no runtime ledger mutation; no Prisma write; no aliases. | `smoke:oroplay-callback-runtime-simulation` confirms simulation, idempotency/replay, sanitizer, ledger intent only, and no-mutation coverage. |
| ORO-3B Callback Runtime Adapter Contract / Wallet-Ledger Bridge Design | Align callback simulation output to future wallet, ledger, transaction log, audit, and reconciliation intent shapes. | Closed adapter contract only; no runtime wallet mutation; no runtime ledger mutation; no Prisma write; no aliases. | `smoke:oroplay-callback-runtime-adapter-contract` confirms adapter contract, bridge plan, sanitizer, fail-closed cases, and no-mutation coverage. |
| ORO-3C Callback Runtime Wallet-Ledger Execution Plan | Define future wallet, ledger, transaction log, audit, reconciliation execution steps and a closed no-mutation runtime gate. | Current execution plan only; no runtime wallet mutation; no runtime ledger mutation; no Prisma write; no aliases. | `smoke:oroplay-callback-runtime-execution-plan` confirms execution plan, runtime gate, wallet/ledger/log/audit/reconciliation steps, and no-mutation coverage. |
| ORO-3D Runtime Guard Approval | Approve member mapping source, wallet source of truth, idempotency storage, ledger transaction boundary, audit log boundary, reconciliation, and rollback/compensation policy. | ORO-3D blocked until execution plan smoke passes and runtime safety gates are approved. | Runtime mutation remains blocked until ORO-3D approval evidence is complete. |
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

ORO-2C closed. ORO-3A current. ORO-3B blocked until simulation smoke passes.

ORO-3A closed. ORO-3B current. ORO-3C blocked until adapter contract smoke passes.

ORO-3A closed. ORO-3B closed. ORO-3C current. ORO-3D blocked until execution plan smoke passes.

ORO-3A callback runtime simulation harness is current.

- Balance simulation reads mock state only.
- Transaction simulation returns decisions only.
- Valid new transaction simulation may return `ledgerIntent` / `reconciliationIntent` mock objects only.
- Duplicate `transactionCode` replay is idempotent and does not produce another intent.
- Conflicting duplicate replay enters manual_review / fail-closed.
- Unknown, blocked, inactive, insufficient balance, malformed, finished-round replay, and unsupported transaction type cases fail closed.
- Sanitized log preview must not expose credential-like fields.
- No production DB, no real money, no live OroPlay API call, no external network, no client secret, no runtime wallet mutation, no runtime ledger mutation, no Prisma write, no migration, no deploy, and no aliases.

ORO-3B is blocked until `smoke:oroplay-callback-runtime-simulation` passes and runtime safety gates are approved.

ORO-3B dependencies before any callback processing:

- member mapping.
- idempotency.
- ledger/reconciliation guard.
- sanitized callback log design.

ORO-3B callback runtime adapter contract is current and remains design-only:

- adapter output is plan/intent only.
- wallet-ledger bridge is design only.
- no production DB, no real money, no live OroPlay API call, no external network, no client secret, no runtime wallet mutation, no runtime ledger mutation, no Prisma write, no migration, no deploy, and no aliases.
- ORO-3C blocked until adapter contract smoke passes.

ORO-3C callback runtime wallet-ledger execution plan is current and remains execution-plan-only:

- execution plan output is plan/step only.
- runtime gate remains closed.
- wallet execution step is no-mutation.
- ledger execution step is no-write.
- transaction log, audit, and reconciliation steps are no-write.
- no production DB, no real money, no live OroPlay API call, no external network, no client secret, no runtime wallet mutation, no runtime ledger mutation, no Prisma write, no migration, no deploy, and no aliases.
- ORO-3D blocked until execution plan smoke passes.

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

## ORO-3D Current

ORO-3A closed. ORO-3B closed. ORO-3C closed. ORO-3D current readiness gate / certification pack only. ORO-3E blocked until readiness gate smoke passes and the pre-implementation certification checklist is reviewed. ORO-3D does not enable production DB, real money, live OroPlay traffic, external network, runtime wallet mutation, runtime ledger mutation, Prisma write, migration, deploy, or provider-compatible aliases.

## ORO-3E Current

ORO-3A closed. ORO-3B closed. ORO-3C closed. ORO-3D closed. ORO-3E current design freeze / staging-only activation plan only.

ORO-3F blocked until design freeze smoke passes. ORO-3E does not enable callback runtime, staging activation, production activation, runtime wallet mutation, runtime ledger mutation, Prisma write, provider-compatible aliases, external network, live OroPlay traffic, production DB, real money, migration, or deploy.
