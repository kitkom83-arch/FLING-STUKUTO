# OroPlay Callback Runtime Wallet-Ledger Execution Plan

## purpose

ORO-3C defines the future callback runtime wallet-ledger execution plan for OroPlay balance and transaction callbacks.

ORO-3C is execution plan only. ORO-3C does not enable the callback runtime, does not debit or credit wallet balance, does not insert ledger rows, does not call external networks, and does not use production DB.

## non-goals

- No production DB.
- No real money.
- No live OroPlay API call.
- No external network.
- No client secret or credential material.
- No runtime wallet debit or credit.
- No runtime ledger write.
- No Prisma write.
- No migration.
- No deploy.
- No payout.
- No auto-credit.
- No provider-compatible alias route for `/api/balance` or `/api/transaction`.
- No conversion of the ORO-2B fail-closed route into live runtime processing.

## safety boundary

ORO-3C is docs, contract, static/mock harness, local smoke, execution plan object, runtime gate object, and no-mutation design only.

The ORO-2B fail-closed callback route remains the active route behavior. ORO-3C does not add a route, controller, provider alias, DB transaction, wallet service call, ledger service call, payout flow, or live provider callback runtime.

## execution plan overview

The execution plan returns a runtime-shaped object that describes future work without executing it:

- wallet execution step.
- ledger execution step.
- transaction log execution step.
- audit execution step.
- reconciliation execution step.
- response plan.
- closed runtime gate.

Every execution step must keep `mutationAllowed: false`, `runtimeEnabled: false`, and `requiresFutureApproval: true`.

## no-mutation runtime gate

The runtime gate is closed by default:

- `gateStatus: closed`.
- `runtimeEnabled: false`.
- reason: `ORO-3C is execution-plan-only / no-mutation runtime gate`.

The gate fails closed if any dangerous runtime flag is true, including production DB, real money, live OroPlay call, external network, wallet mutation, ledger mutation, Prisma write, migration, deploy, payout, auto-credit, or provider alias enablement.

## callback execution lifecycle

1. receive callback payload
2. sanitize payload
3. validate callback shape
4. resolve member mapping
5. check member status
6. derive idempotency key
7. acquire future idempotency lock design
8. detect replay / conflict
9. build wallet execution plan
10. build ledger execution plan
11. build transaction log execution plan
12. build audit log execution plan
13. build reconciliation execution plan
14. evaluate runtime gate
15. return response plan
16. do not mutate wallet
17. do not write ledger
18. do not write DB

## balance callback execution plan

Balance callbacks validate `userCode`, resolve the mock member mapping, and build a wallet balance read step only. The plan does not read a real wallet source of truth and does not expose `/api/balance`.

## transaction callback execution plan

Transaction callbacks validate `userCode`, `transactionCode`, `transactionType`, `amount`, `roundId`, `vendorCode`, and `gameCode` as planning inputs only. Accepted bet and win callbacks produce future wallet, ledger, transaction log, audit, and reconciliation steps only.

## wallet execution plan

The wallet step describes future read, debit, or credit behavior:

- balance: `read_balance`.
- bet: `debit`.
- win: `credit`.

The wallet step is not executed. ORO-3C does not debit wallet balance and does not credit wallet balance.

## ledger execution plan

The ledger step describes the future ledger entry shape for provider debit or credit events. It is not inserted, posted, updated, reversed, persisted, or wrapped in a DB transaction.

## transaction log execution plan

The transaction log step describes a future game-provider transaction log row. It is not inserted and does not create runtime transaction history.

## reconciliation execution plan

The reconciliation step describes future checks between callback payload, member mapping, idempotency key, wallet delta, ledger entry, transaction log, audit log, and provider callback trace. It is not persisted.

## audit execution plan

The audit step stores only sanitized payload preview data in the plan object. It must not expose authorization, password, secret, token, clientSecret, DATABASE_URL, PIN, deviceId, raw credentials, or credential-like payload values.

## idempotency execution plan

The plan derives an idempotency key from callback type and transaction identity. Future runtime work must approve idempotency storage and lock behavior before any wallet or ledger mutation is considered.

## duplicate replay handling

Duplicate `transactionCode` with the same payload fingerprint returns `idempotent_replay`. It creates no second wallet step, ledger step, transaction log write, audit write, or reconciliation write.

## conflicting duplicate handling

Duplicate `transactionCode` with a different fingerprint returns manual-review or fail-closed planning output. ORO-3C does not choose a runtime compensation action.

## insufficient balance handling

Bet/debit planning fails closed when the mock before-balance cannot cover the debit amount. No wallet debit, ledger write, transaction log write, payout, or auto-credit is performed.

## unknown member handling

Unknown `userCode` fails closed. ORO-3C does not query production DB or create a member mapping at runtime.

## blocked/inactive member handling

Blocked or inactive member state fails closed. The plan does not bypass member status checks and does not write a corrective record.

## finished round handling

Finished round replay fails closed or routes to manual review. ORO-3C does not reopen rounds, reverse balances, or insert compensation ledger entries.

## canceled transaction handling

Canceled transaction payloads and canceled transaction replay fail closed. ORO-3C does not create reversal entries, credit wallet balance, debit wallet balance, or mark a runtime transaction as canceled.

## fail-closed rules

The plan fails closed for malformed payload, unsupported transaction type, unknown member, blocked member, inactive member, insufficient balance, finished round replay, canceled transaction, and dangerous runtime gate input.

## manual review rules

Manual review is reserved for conflicting duplicates and future ambiguous reconciliation cases. In ORO-3C, manual review is an output classification only and does not create a task, notification, or DB row.

## lock ordering design

Future runtime lock ordering must be approved before mutation:

1. idempotency key lock.
2. member wallet lock.
3. game transaction log lock.
4. ledger transaction boundary.
5. reconciliation trace boundary.

ORO-3C does not acquire real locks.

## rollback / compensation plan

Rollback and compensation remain design-only. Future ORO-3D must decide whether rollback callbacks produce rejection, manual review, reversal ledger entries, or compensation entries. ORO-3C does not perform compensation.

## required runtime prerequisites

Future runtime work requires approval for:

- member mapping source of truth.
- wallet source of truth.
- idempotency storage.
- DB transaction boundary.
- ledger transaction boundary.
- transaction log storage.
- audit log storage.
- reconciliation workflow.
- rollback and compensation policy.
- sanitized callback logging.
- provider-compatible alias decision, if required.

## ORO-3D prerequisites

ORO-3D is blocked until ORO-3C passes `smoke:oroplay-callback-runtime-execution-plan`, ORO-2B fail-closed route remains default, ORO-3A simulation remains no-mutation, ORO-3B adapter contract remains no-mutation, and runtime safety gates receive explicit approval.

## no live runtime statement

ORO-3C is not a live callback runtime. It does not process provider callbacks in production or staging runtime.

## no runtime wallet mutation

ORO-3C does not debit wallet balance and does not credit wallet balance.

## no runtime ledger mutation

ORO-3C does not insert, update, post, reverse, or persist ledger entries.

## no Prisma write

ORO-3C does not import Prisma client, does not open DB transactions, and does not write database records.

## no alias provider-compatible route enabled

ORO-3C does not enable `/api/balance` or `/api/transaction`. The only existing callback route behavior remains the ORO-2B fail-closed stub under `/api/oroplay`.

## ORO-3D readiness gate current

ORO-3C closed. ORO-3D readiness gate current. The execution plan remains no-mutation and remains plan-only until the readiness gate and pre-implementation certification pack pass. ORO-3D does not enable runtime wallet mutation, runtime ledger mutation, Prisma write, live OroPlay traffic, external network, production DB, real money, or `/api/balance` and `/api/transaction` aliases.

## ORO-3E design freeze current

ORO-3C closed. ORO-3D closed. ORO-3E design freeze current. The execution plan remains no-mutation.

ORO-3E freezes implementation design and staging-only activation planning only. It does not execute wallet steps, ledger steps, transaction log steps, audit steps, reconciliation steps, Prisma writes, provider aliases, live traffic, external network, production DB, real money, migration, or deploy.
