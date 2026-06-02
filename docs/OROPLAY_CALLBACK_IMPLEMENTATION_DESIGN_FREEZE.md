# OroPlay Callback Implementation Design Freeze

## purpose

ORO-3E freezes the future OroPlay callback runtime implementation design before any real implementation begins. ORO-3E is design freeze / staging-only activation plan only.

ORO-3E does not open live callback runtime behavior, does not debit or credit wallet balance, does not insert ledger rows, does not open `/api/balance` or `/api/transaction` aliases, does not call external networks, and does not use production DB.

## non-goals

- No runtime callback implementation.
- No runtime wallet debit or credit.
- No runtime ledger insert.
- No Prisma write.
- No provider-compatible alias route enablement.
- No live OroPlay callback runtime.
- No external network call.
- No production DB.
- No real money flow.
- No migration.
- No deploy.

## safety boundary

ORO-3E is limited to docs, contract, static/mock harness, staging-only activation plan, design freeze checklist, and local smoke. It does not add runtime routes, controllers, wallet services, ledger services, DB transactions, live provider env, production config, or provider-compatible aliases.

Credential-like values must not be stored or printed. Logs and docs must not expose Authorization header values, password values, token values, clientSecret values, PIN values, deviceId values, database URL values, or raw credential-like payloads.

## design freeze overview

The design freeze locks the next implementation shape without authorizing runtime mutation:

- ORO-2B fail-closed stub closed.
- ORO-2C callback readiness closed.
- ORO-3A runtime simulation closed.
- ORO-3B adapter contract closed.
- ORO-3C execution plan closed.
- ORO-3D readiness gate / certification closed.
- ORO-3E freezes the implementation design but does not implement runtime mutation.

The frozen design can pass only when runtime remains blocked.

## frozen callback contract scope

The frozen callback scope is balance and transaction callbacks under the preferred internal route plan only:

- `POST /api/oroplay/balance`.
- `POST /api/oroplay/transaction`.

Provider-compatible aliases remain blocked. `/api/balance` and `/api/transaction` are not enabled in ORO-3E.

## frozen balance callback design

Balance callback design is frozen as a future read-only balance response plan. ORO-3E does not read a real wallet source of truth and does not return a live provider runtime response.

Frozen balance design requirements:

- validate callback shape.
- map `userCode` only after future source-of-truth approval.
- fail closed for unknown, blocked, inactive, or malformed member references.
- return a future response mapping plan only.
- keep wallet mutation blocked.
- keep ledger mutation blocked.

## frozen transaction callback design

Transaction callback design is frozen as future bet/debit and win/credit planning only. ORO-3E does not debit wallet, credit wallet, insert ledger, post transaction logs, or persist reconciliation rows.

Frozen transaction design requirements:

- validate `userCode`, `transactionCode`, amount, round, vendor, and game identity fields.
- reject malformed or zero amount payloads.
- classify bet/debit and win/credit intent only.
- evaluate idempotency before future wallet work.
- route duplicate conflicts to fail-closed or manual review.
- keep all mutation blocked.

## frozen auth boundary

Callback auth remains env-only and future-approved. ORO-3E does not add real credentials, does not add live provider env, and does not print Authorization header values.

## frozen member mapping boundary

Member mapping remains a frozen design dependency. ORO-3E does not query production DB and does not create or update member mappings.

## frozen idempotency boundary

Idempotency remains a frozen design dependency. Future runtime must approve key format, storage, retention, replay behavior, conflict handling, and lock ordering before mutation is considered.

## frozen wallet bridge boundary

Wallet bridge remains blocked. The frozen design requires future approval for wallet source of truth, lock strategy, balance read, debit, credit, audit linkage, and rollback behavior before any wallet mutation.

## frozen ledger bridge boundary

Ledger bridge remains blocked. The frozen design requires future approval for ledger entry shape, transaction boundary, reconciliation fields, rollback behavior, and audit linkage before any ledger mutation.

## frozen transaction log boundary

Transaction log storage remains blocked. ORO-3E defines future log fields only and does not insert transaction history.

## frozen reconciliation boundary

Reconciliation remains blocked. Future runtime must reconcile callback trace, wallet delta, ledger entry, transaction log, audit log, and provider identity before mutation is considered.

## frozen audit boundary

Audit remains design-only. Future audit records must store sanitized metadata, decision, source, correlation identifiers, and review state without raw credential-like payloads.

## frozen sanitized logging boundary

Logging must redact Authorization header, password, token, secret, clientSecret, PIN, deviceId, database URL, and raw credential-like values. ORO-3E does not print raw payloads.

## frozen response mapping

Accepted future callbacks map to response plan objects only. Response mapping is frozen as documentation and static/mock contract output, not live provider response behavior.

## frozen error mapping

Errors remain fail-closed or manual-review only. Unknown member, inactive member, blocked member, malformed payload, unsupported transaction type, insufficient balance, duplicate conflict, finished round replay, canceled transaction, and unsafe runtime flag input must not mutate wallet or ledger.

## implementation change control

Any implementation change after ORO-3E requires a new approved phase. Runtime code, wallet mutation, ledger mutation, Prisma write, provider alias enablement, external network, live provider traffic, production config, migration, and deploy remain outside this phase.

## implementation blocker rules

Implementation is blocked if any of these are requested or detected:

- production DB.
- real money.
- live OroPlay API call.
- external network.
- real client secret or credential material.
- runtime wallet mutation.
- runtime ledger mutation.
- Prisma write.
- migration.
- deploy.
- payout.
- auto-credit.
- provider-compatible alias enablement.

## runtime mutation still blocked

ORO-3E passes only as design freeze while runtime mutation remains blocked.

## route alias still blocked

`/api/balance` and `/api/transaction` remain blocked. ORO-3E does not enable aliases and does not change the ORO-2B fail-closed route behavior into runtime processing.

## staging-only activation dependency

Staging-only activation remains disabled by default and depends on a future ORO-3F approval. The ORO-3E staging activation plan is documentation and static/mock contract only.

## ORO-3F prerequisites

ORO-3F is blocked until ORO-3E passes. ORO-3F must review design freeze smoke, staging-only activation plan, monitoring plan, rollback plan, emergency disable plan, idempotency plan, wallet bridge approval, ledger bridge approval, Prisma write approval, and alias approval before any runtime activation.

## ORO-3F local smoke environment normalization

ORO-3F is limited to callback local smoke environment normalization and pre-implementation port guard evidence. It may improve smoke diagnosis and docs, but it does not implement callback runtime behavior.

The callback stub smoke may read `OROPLAY_CALLBACK_STUB_BASE_URL` or `BASE_URL` for a local loopback target only. The smoke must not print the configured value, must reject embedded credentials, and must normalize root/API paths without producing a double `/api` path.

The live route assertion for `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` is valid only after `/api/health` identifies the PG77 backend. When an unrelated service owns local port 4000 and `/api/health` returns `404`, the result is a local port conflict / wrong service diagnostic, not an OroPlay callback regression.

ORO-3F does not add runtime routes, controllers, wallet services, ledger services, Prisma writes, migrations, deploy steps, external network calls, live OroPlay traffic, or provider-compatible aliases.

## no live runtime statement

ORO-3E is not a live callback runtime and does not process live OroPlay callbacks.

## no runtime wallet mutation

ORO-3E does not debit, credit, update, or otherwise mutate wallet state.

## no runtime ledger mutation

ORO-3E does not create, update, insert, post, reverse, or otherwise mutate ledger state.

## no Prisma write

ORO-3E does not import Prisma client, open DB transactions, or write records through Prisma.

## no alias provider-compatible route enabled

ORO-3E does not enable `/api/balance` or `/api/transaction`; the ORO-2B fail-closed stub remains the active callback route boundary.

## ORO-4A callback runtime implementation skeleton current

ORO-4A callback runtime implementation skeleton current. It is a disabled-by-default runtime skeleton and staging-disabled gate only.

ORO-4A does not wire runtime implementation into live routes, does not convert ORO-2B fail-closed routes into runtime processing, does not enable `/api/balance` or `/api/transaction`, does not mutate wallet, does not mutate ledger, does not write through Prisma, does not call external networks, and does not activate production runtime.
