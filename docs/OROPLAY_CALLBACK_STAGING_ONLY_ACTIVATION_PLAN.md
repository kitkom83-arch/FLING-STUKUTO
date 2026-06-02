# OroPlay Callback Staging-Only Activation Plan

## purpose

ORO-3E records a staging-only activation plan for the future OroPlay callback runtime. This plan is documentation and static/mock contract only. It does not activate staging runtime behavior.

## non-goals

- No runtime callback implementation.
- No staging runtime activation in this phase.
- No production activation.
- No wallet debit or credit.
- No ledger write.
- No Prisma write.
- No provider-compatible alias enablement.
- No live OroPlay traffic.
- No external network call.
- No ENV change.
- No migration.
- No deploy.

## staging-only boundary

Staging-only activation remains closed by default. ORO-3E defines the future gate shape but does not enable any flag, route, provider credential, external network, wallet mutation, ledger mutation, Prisma write, alias, or production behavior.

## staging activation overview

The future staging activation flow must be explicitly approved in ORO-3F. Default behavior stays fail-closed:

1. verify ORO-3E design freeze smoke passed.
2. verify staging-only plan passed static smoke.
3. approve emergency disable.
4. approve monitoring.
5. approve rollback.
6. approve idempotency storage.
7. approve wallet bridge.
8. approve ledger bridge.
9. approve Prisma write boundary.
10. approve alias policy if provider-compatible paths are required.
11. keep production blocked.

## staging prerequisites

- ORO-3E design freeze smoke pass.
- ORO-3F approval recorded.
- staging-only runtime design reviewed.
- no production DB target.
- no real money.
- no live provider credential in repo.
- no raw credential-like payload logging.
- monitoring and rollback plans reviewed.

## staging environment assumptions

Future staging must use staging-only targets, staging-only approvals, sanitized logs, and disabled-by-default flags. ORO-3E does not change `.env`, `.env.example`, runtime env, or production config.

## staging network assumptions

External network remains disabled in ORO-3E. Future staging network access requires an explicit allowlist, provider approval, callback source review, and ORO-3F gate pass.

## callback URL staging plan

The staging callback URL is a future placeholder plan only. ORO-3E does not publish a live callback URL and does not enable provider callback traffic.

## provider whitelisting staging plan

Provider whitelisting is future evidence only. ORO-3E does not submit allowlist data, does not call OroPlay, and does not enable live provider traffic.

## callback auth staging plan

Callback auth remains env-only and future-approved. ORO-3E does not add real credential material and does not print Authorization header values.

## feature flag plan

The following feature flag names are documentation / future plan only. They are not added to ENV, not enabled, and not read by runtime code in ORO-3E:

- `OROPLAY_CALLBACK_RUNTIME_ENABLED=false`
- `OROPLAY_CALLBACK_STAGING_ONLY=true`
- `OROPLAY_CALLBACK_ALIAS_BALANCE_ENABLED=false`
- `OROPLAY_CALLBACK_ALIAS_TRANSACTION_ENABLED=false`
- `OROPLAY_CALLBACK_WALLET_MUTATION_ENABLED=false`
- `OROPLAY_CALLBACK_LEDGER_MUTATION_ENABLED=false`
- `OROPLAY_CALLBACK_PRISMA_WRITE_ENABLED=false`
- `OROPLAY_CALLBACK_EXTERNAL_NETWORK_ENABLED=false`
- `OROPLAY_CALLBACK_LIVE_PROVIDER_ENABLED=false`
- `OROPLAY_CALLBACK_PRODUCTION_ENABLED=false`

Default behavior remains closed. These names are plan markers only and must not be treated as enabled runtime configuration.

## route alias staging plan

`/api/balance` and `/api/transaction` aliases remain disabled. Future alias work requires ORO-3F approval, shared guarded handler evidence, route smoke, monitoring, and emergency disable.

## wallet mutation staging gate

Wallet mutation remains blocked. Future staging wallet debit or credit requires wallet source-of-truth approval, lock ordering approval, idempotency approval, audit approval, and rollback approval.

## ledger mutation staging gate

Ledger mutation remains blocked. Future staging ledger write requires ledger bridge approval, transaction boundary approval, reconciliation approval, audit approval, and rollback approval.

## DB write staging gate

DB write remains blocked. Future staging DB write requires schema review, Prisma write approval, transaction boundary approval, migration approval if needed, and rollback proof.

## idempotency staging gate

Idempotency storage remains blocked until ORO-3F approves key format, storage target, lock behavior, retention, replay response, and conflict handling.

## reconciliation staging gate

Reconciliation remains blocked until ORO-3F approves callback trace, wallet delta, ledger entry, transaction log, audit log, and provider identity comparison.

## audit staging gate

Audit remains blocked until ORO-3F approves sanitized metadata fields, retention, actor/source labels, correlation identifiers, and manual review state.

## monitoring staging gate

Monitoring is required before staging activation. It must cover callback fail-closed rate, duplicate conflict rate, latency, wallet bridge health, ledger bridge health, reconciliation drift, alias traffic attempts, and runtime disabled alerts.

## rollback staging plan

Rollback is required before staging activation. It must define disable steps, compensation review, manual review routing, audit evidence, and owner approval.

## emergency disable plan

Emergency disable is required before staging activation. It must disable runtime, aliases, wallet mutation, ledger mutation, Prisma write, external network, live provider traffic, and production activation independently.

## manual review plan

Manual review is required for duplicate conflicts, reconciliation ambiguity, insufficient evidence, unsafe member state, canceled/finished round ambiguity, and any callback that cannot be proven safe.

## go/no-go checklist

Go for future ORO-3F review requires:

- ORO-3E smoke pass.
- all feature flags default closed.
- emergency disable plan present.
- monitoring plan present.
- rollback plan present.
- production exclusion confirmed.
- no alias enabled.
- no wallet mutation enabled.
- no ledger mutation enabled.
- no Prisma write enabled.
- no external network enabled.
- no live provider enabled.

No-go if any dangerous runtime flag is true.

## production exclusion statement

Production activation is excluded. ORO-3E does not permit production DB, real money, production runtime, live provider traffic, production config changes, migration, deploy, payout, auto-credit, alias enablement, wallet mutation, ledger mutation, Prisma write, or external network.

## ORO-3F prerequisites

ORO-3F is blocked until ORO-3E passes. Staging-only activation still requires explicit ORO-3F approval and remains disabled by default.
