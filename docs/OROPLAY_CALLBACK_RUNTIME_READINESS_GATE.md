# OroPlay Callback Runtime Readiness Gate

## purpose

ORO-3D defines a callback runtime readiness gate and pre-implementation certification boundary for the future OroPlay callback runtime. ORO-3D is readiness gate / certification pack only.

## non-goals

- No runtime callback implementation.
- No runtime wallet debit or credit.
- No runtime ledger insert.
- No Prisma write.
- No provider-compatible alias route enablement.
- No live OroPlay traffic.

## safety boundary

ORO-3D is docs, contract, static/mock harness, readiness gate object, certification pack object, and local smoke only. It does not use production DB, real money, external network, live OroPlay API calls, live provider credentials, migrations, deployment, payout, auto-credit, runtime wallet mutation, runtime ledger mutation, or Prisma writes.

## readiness gate overview

The readiness gate is intentionally closed. It records evidence required before a future implementation phase can be considered, while always returning runtime implementation blocked for ORO-3D.

Gate criteria:

1. preflight clean.
2. Safe CI current HEAD pass.
3. ORO-2B fail-closed route still fail-closed.
4. ORO-2C readiness closed.
5. ORO-3A simulation closed.
6. ORO-3B adapter contract closed.
7. ORO-3C execution plan closed.
8. no wallet mutation.
9. no ledger mutation.
10. no Prisma write.
11. no route alias enabled.
12. no external network.
13. no real secret.
14. no production DB.
15. no real money.
16. all targeted OroPlay smokes pass.
17. local smoke all-local pass before commit if local env available.
18. certification checklist reviewed before ORO-3E.

## current closed phases

- ORO-2B closed: fail-closed callback stub route remains default.
- ORO-2C closed: callback runtime readiness contract.
- ORO-3A closed: callback runtime simulation.
- ORO-3B closed: runtime adapter contract / wallet-ledger bridge design.
- ORO-3C closed: callback runtime wallet-ledger execution plan / still no-mutation runtime gate.
- ORO-3D current: readiness gate / certification pack only.

## runtime implementation blocked statement

Runtime implementation remains blocked in ORO-3D even when the readiness checklist passes. ORO-3D only certifies whether the next implementation phase has enough documented evidence to be reviewed.

## required evidence before implementation

- Current preflight evidence with clean working tree.
- Safe CI success for current HEAD.
- Targeted OroPlay smoke results.
- All-local smoke result or explicit local env/backend blocker.
- Callback auth design evidence.
- Member mapping source approval.
- Idempotency store design and retention evidence.
- Wallet bridge approval evidence.
- Ledger bridge approval evidence.
- Reconciliation evidence.
- Monitoring and alert evidence.
- Rollback / compensation runbook evidence.

## callback auth readiness

Callback auth must remain design-only in ORO-3D. Auth evidence must describe validation, redaction, and fail-closed behavior without storing secrets in repo and without printing Authorization headers.

## member mapping readiness

Member mapping must define the source of truth for OroPlay user code to PG77 member ID. ORO-3D does not query production DB or mutate member records.

## idempotency store readiness

Idempotency storage must define keys, conflict rules, retention, replay behavior, and failure modes before runtime writes are considered.

## duplicate/conflict handling readiness

Duplicate callbacks with the same fingerprint must be replay-safe. Conflicting duplicates must fail closed or enter manual review before any wallet or ledger mutation is approved.

## wallet bridge readiness

Wallet bridge readiness must identify the wallet source of truth, balance read contract, debit/credit ordering, lock strategy, permission boundary, and audit evidence. ORO-3D does not debit or credit wallet.

## ledger bridge readiness

Ledger bridge readiness must identify ledger entry schema, transaction boundary, reconciliation fields, audit linkage, and failure recovery. ORO-3D does not insert ledger entries.

## reconciliation readiness

Reconciliation must compare callback trace, wallet delta, ledger entry, transaction log, and audit log before a future mutation phase can be reviewed.

## audit log readiness

Audit evidence must define sanitized fields, actor/source metadata, decision, correlation IDs, and retention without storing raw credential-like payloads.

## sanitized logging readiness

Logs must redact password, token, secret, client secret, PIN, device ID, database URL, and Authorization header fields. ORO-3D does not print raw credential-like payloads.

## monitoring readiness

Monitoring evidence must define callback success/fail-closed rates, duplicate conflict counts, latency, wallet/ledger reconciliation health, and runtime disabled alerts.

## alerting readiness

Alerting must cover fail-closed spikes, duplicate conflicts, idempotency store failures, wallet bridge failures, ledger bridge failures, reconciliation drift, and alias traffic attempts.

## rollback / compensation readiness

Rollback / compensation must define manual review, reversible transaction references, wallet/ledger compensation rules, approval authority, and audit requirements before mutation is allowed.

## staging callback readiness

Staging callback readiness requires mock/sandbox-only traffic, sanitized payload storage, local/staging-only DB targets, and explicit no-production safety checks.

## feature flag readiness

Any future runtime must be behind a fail-closed feature flag with default disabled behavior and separate approvals for mutation, alias enablement, and live traffic.

## provider alias readiness

ORO-3D does not enable `/api/balance` or `/api/transaction`. Provider-compatible aliases remain blocked until explicit future approval and shared guarded handler evidence exist.

## runbook readiness

The runbook must include preflight, targeted smokes, rollback steps, monitoring checks, secret redaction checks, and stop conditions for any future runtime phase.

## ORO-3E prerequisites

ORO-3E is blocked until ORO-3D passes. ORO-3E also requires approval evidence for runtime mutation, alias enablement, live provider traffic, monitoring, rollback, and staging callback validation.

## no live runtime statement

ORO-3D does not open live callback runtime behavior. It does not call OroPlay and does not accept live provider traffic.

## no runtime wallet mutation

ORO-3D does not debit, credit, update, or otherwise mutate wallet state.

## no runtime ledger mutation

ORO-3D does not create, update, insert, or otherwise mutate ledger state.

## no Prisma write

ORO-3D does not import Prisma client, open DB transactions, or write records through Prisma.

## no alias provider-compatible route enabled

ORO-3D does not enable `/api/balance` or `/api/transaction`; ORO-2B fail-closed preferred routes remain the only callback route skeleton.

## ORO-3E implementation design freeze current

ORO-3D closed. ORO-3E implementation design freeze current. The readiness gate remains closed for runtime mutation.

ORO-3E freezes the implementation design and staging-only activation plan only. It does not enable callback runtime, wallet mutation, ledger mutation, Prisma write, live OroPlay traffic, external network, production DB, real money, migration, deploy, or provider-compatible aliases.

## ORO-3F local smoke normalization current

ORO-3F normalizes local callback smoke diagnosis before any runtime callback implementation. It is docs/smoke/local-diagnosis only and does not activate callback runtime behavior.

The ORO-2B callback stub smoke may use `OROPLAY_CALLBACK_STUB_BASE_URL` or `BASE_URL` for a local loopback API target. The smoke normalizes the value so a root URL or `/api` URL does not produce a double `/api` path.

The live-route assertion must run only when `/api/health` returns the PG77 health contract. If `/api/health` returns `404` while `/health` responds from another local service, the smoke records a local port conflict / wrong service diagnostic and skips the route assertion. This is a local environment blocker, not callback regression evidence.

`smoke:all-local` still requires `NODE_ENV` to be `development-local` or `test`, plus `LOCAL_ADMIN_PASSWORD` in the local shell. ORO-3F does not change `.env`, does not print secret values, and does not stop unrelated local processes.

ORO-3F does not enable `/api/balance` or `/api/transaction`; ORO-2B fail-closed preferred routes remain the only callback route skeleton.

## ORO-4A skeleton current

ORO-4A skeleton current. The runtime implementation skeleton remains disabled by default and the staging-disabled gate remains fail-closed unless future certified mock evidence is explicitly supplied.

ORO-4A is not runtime activation. It keeps wallet mutation, ledger mutation, Prisma write, live OroPlay traffic, external network, production DB, real money, migration, deploy, payout, auto-credit, `/api/balance`, and `/api/transaction` blocked.
