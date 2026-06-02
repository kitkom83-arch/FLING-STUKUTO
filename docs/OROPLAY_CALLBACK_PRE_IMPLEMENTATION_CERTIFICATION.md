# OroPlay Callback Pre-Implementation Certification

## purpose

ORO-3D records the pre-implementation certification package for future OroPlay callback runtime work. Passing this package does not permit runtime mutation.

## certification scope

The scope is docs, contract, static/mock harness, readiness gate object, certification pack object, blocker matrix, and local smoke verification.

## certification non-goals

- No runtime callback implementation.
- No wallet debit or credit.
- No ledger write.
- No Prisma write.
- No migration.
- No deploy.
- No live OroPlay API call.
- No provider-compatible alias enablement.

## certification evidence checklist

- Preflight clean evidence.
- Safe CI current HEAD success.
- ORO-2B fail-closed evidence.
- ORO-2C readiness evidence.
- ORO-3A simulation evidence.
- ORO-3B adapter contract evidence.
- ORO-3C execution plan evidence.
- Targeted OroPlay smoke evidence.
- All-local smoke evidence or local env/backend blocker.
- Secret scan evidence with field-name-only findings allowed.

## implementation blocker matrix

| blockerId | blocker | why it blocks runtime | current status | required evidence | owner / future owner | pass condition |
| --- | --- | --- | --- | --- | --- | --- |
| PRODUCTION_DB_NOT_ALLOWED | production DB not allowed | Runtime writes cannot be certified against production DB in ORO-3D. | blocked | local/staging-only DB proof and future approval | future runtime owner | Approved staging plan exists; production DB remains blocked until live certification. |
| REAL_MONEY_NOT_ALLOWED | real money not allowed | Wallet mutation could move value. | blocked | mock-only proof and future approval | future wallet owner | Explicit money-flow approval after certification. |
| LIVE_OROPLAY_API_NOT_ALLOWED | live OroPlay API not allowed | Live provider traffic would exceed readiness-only scope. | blocked | staging callback evidence and provider approval | future provider owner | Live traffic approval granted after staging pass. |
| ALIAS_BALANCE_NOT_ENABLED | alias `/api/balance` not enabled | Provider-compatible alias could expose runtime traffic. | blocked | alias route design, shared handler proof, approval | future API owner | Explicit alias enablement approval. |
| ALIAS_TRANSACTION_NOT_ENABLED | alias `/api/transaction` not enabled | Provider-compatible alias could expose runtime traffic. | blocked | alias route design, shared handler proof, approval | future API owner | Explicit alias enablement approval. |
| ALIAS_ENABLEMENT_BLOCKED | provider alias enablement blocked | Alias traffic must not bypass fail-closed guards. | blocked | alias audit, route smoke, monitoring evidence | future API owner | Alias remains disabled until approved. |
| RUNTIME_WALLET_MUTATION_BLOCKED | runtime wallet mutation blocked | Debit/credit requires wallet source-of-truth approval. | blocked | wallet bridge approval, lock plan, audit evidence | future wallet owner | Mutation approval granted after wallet evidence review. |
| RUNTIME_LEDGER_MUTATION_BLOCKED | runtime ledger mutation blocked | Ledger writes require transaction boundary and reconciliation evidence. | blocked | ledger bridge approval and reconciliation proof | future ledger owner | Mutation approval granted after ledger evidence review. |
| PRISMA_WRITE_BLOCKED | Prisma write blocked | DB writes require schema, migration, and rollback evidence. | blocked | schema and transaction proof | future backend owner | Explicit Prisma write approval. |
| MIGRATION_BLOCKED | migration blocked | Schema changes are outside ORO-3D scope. | blocked | reviewed migration plan | future backend owner | Migration approval granted separately. |
| DEPLOY_BLOCKED | deploy blocked | Deployment could expose unfinished runtime. | blocked | release plan, rollback, monitoring | future release owner | Deploy approval granted separately. |
| EXTERNAL_NETWORK_BLOCKED | external network blocked | ORO-3D must remain static/mock-only. | blocked | sandbox plan and network allowlist evidence | future provider owner | External network approval granted separately. |
| SECRET_HANDLING_NOT_ALLOWED_IN_REPO | secret handling not allowed in repo | Credentials must remain env-only and redacted. | blocked | redaction proof and secret scan | future security owner | No real secrets in repo or logs. |
| MONITORING_EVIDENCE_REQUIRED | monitoring evidence required | Runtime cannot be operated safely without visibility. | blocked | dashboards, counters, alerts | future ops owner | Monitoring evidence reviewed. |
| ROLLBACK_EVIDENCE_REQUIRED | rollback evidence required | Runtime mutation needs recovery path. | blocked | compensation and rollback runbook | future ops owner | Rollback evidence reviewed. |
| LIVE_TRAFFIC_BLOCKED | live provider traffic blocked | Live callback traffic would exceed certification scope. | blocked | staging proof, provider approval, alerting | future provider owner | Explicit live traffic approval. |

## callback auth checklist

- Auth validation remains design-only.
- No Authorization header value is printed.
- Credential-like fields are redacted.
- Missing or invalid auth fails closed.

## payload validation checklist

- Balance and transaction payload shapes are documented.
- Malformed payloads fail closed.
- Amount sign handling remains planned only.
- Raw payload logging is blocked.

## member mapping checklist

- OroPlay user code to member ID source is identified.
- Unknown, blocked, and inactive members fail closed.
- No production member lookup occurs in ORO-3D.

## idempotency checklist

- Idempotency key format is documented.
- Same-payload replay is safe.
- Conflicting duplicate requires fail-closed/manual review.
- Store retention is defined before runtime.

## wallet execution checklist

- Wallet source of truth requires approval.
- Debit/credit lock ordering requires approval.
- ORO-3D does not mutate wallet.

## ledger execution checklist

- Ledger bridge contract requires approval.
- Transaction boundary requires approval.
- ORO-3D does not mutate ledger.

## transaction log checklist

- Callback transaction log fields are defined.
- Raw credential-like payloads are excluded.
- No Prisma write occurs in ORO-3D.

## reconciliation checklist

- Callback trace, wallet delta, ledger entry, transaction log, and audit log must reconcile before runtime mutation.

## audit checklist

- Audit logs record sanitized metadata, decision, and correlation identifiers only.

## log redaction checklist

- password, token, secret, client secret, PIN, device ID, database URL, and Authorization header values must be redacted.

## monitoring checklist

- Monitoring evidence is required for fail-closed rate, duplicate conflict rate, callback latency, wallet bridge health, ledger bridge health, and reconciliation drift.

## rollback checklist

- Rollback / compensation evidence is required before wallet or ledger mutation.

## staging checklist

- Staging callback validation must use mock/sandbox-only traffic and local/staging-only targets.

## go/no-go checklist

- Go for ORO-3D means certification pack pass while runtime remains blocked.
- No-go for implementation if any blocker remains unreviewed.

## required approvals before runtime mutation

Runtime mutation requires explicit future approval for wallet bridge, ledger bridge, transaction boundary, audit, monitoring, rollback, and staging callback evidence.

## required approvals before alias enablement

Aliases `/api/balance` and `/api/transaction` require explicit future approval, shared guarded handler evidence, route smoke, monitoring, and rollback plan.

## required approvals before live provider traffic

Live provider traffic requires staging callback pass, provider approval, monitoring, alerting, rollback, and secret handling evidence.

## ORO-3E entry criteria

ORO-3E is blocked until ORO-3D passes. Entry requires targeted smoke pass, certification checklist review, blocker matrix review, and explicit approval boundaries for any future implementation work.
