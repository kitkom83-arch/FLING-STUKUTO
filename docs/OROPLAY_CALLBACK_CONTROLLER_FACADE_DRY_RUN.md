# OroPlay Callback Controller Facade Dry-Run

## ORO-4E scope

ORO-4E adds a Callback Controller Facade Dry-Run / Still No Express Route Wiring contract. This phase is docs, contract, static/mock harness, and local smoke only.

It does not add live route behavior, public aliases, production DB access, real money movement, wallet mutation, ledger mutation, Prisma write, DB transaction, migration, deploy, payout, auto-credit, or a live OroPlay call.

## controller facade dry-run purpose

The facade simulates the shape of a future callback controller by direct function call only:

1. mock auth decision.
2. request envelope mapper.
3. runtime shadow invocation.
4. response envelope.
5. sanitized log preview.

The facade exists to prove the controller-level flow can be modeled before any real Express controller wiring is approved.

## facade vs real Express controller

The facade accepts a mock request object only. It is not imported by `src/app.js`, route files, controllers, wallet services, ledger services, or Prisma.

A real Express controller would receive HTTP traffic, parse headers, apply route middleware, and call runtime services. ORO-4E does none of that and keeps `expressRouteWired=false` and `runtimeWiredToLiveRoute=false`.

## mock auth decision

Mock auth decision uses a boolean mock field only. It does not read ENV values, does not read real credential values, does not use a real client secret, and does not print credential headers.

Unauthorized mock requests fail closed before request envelope mapping.

## balance facade flow

Balance facade flow:

1. Accept a mock direct-call request object.
2. Evaluate mock auth decision.
3. Normalize the mock balance request through the ORO-4D request envelope mapper.
4. Invoke the ORO-4C shadow balance flow through the ORO-4D envelope flow.
5. Return a mock balance response envelope.
6. Return sanitized facade log preview metadata only.

The balance response envelope comes from a mock-only decision and fixture balance.

## transaction facade flow

Transaction facade flow:

1. Accept a mock direct-call request object.
2. Evaluate mock auth decision.
3. Normalize the mock transaction request through the ORO-4D request envelope mapper.
4. Invoke the ORO-4C shadow transaction flow through the ORO-4D envelope flow.
5. Return a transaction response envelope from shadow intent only.
6. Return sanitized facade log preview metadata only.

Valid bet requests can return debit intent only. Valid win requests can return credit intent only. Neither path mutates wallet or ledger state.

## request envelope usage

ORO-4E uses the ORO-4D request envelope mapper for mock payload normalization. The facade does not parse real HTTP request headers and does not accept live provider traffic.

Request envelope output remains `shadowRequestOnly=true` and `mapperOnly=true`.

## shadow invocation usage

ORO-4E uses ORO-4D envelope flow to reach ORO-4C shadow invocation. The shadow invocation reads mock fixture state only and remains disconnected from routes.

## response envelope usage

ORO-4E returns the ORO-4D response envelope from the facade result. The response envelope remains `mockResponseEnvelopeOnly=true` and `shadowResponseContractOnly=true`.

Balance facade responses use `responseSource=mock_only_decision`. Transaction facade responses use `responseSource=shadow_intent_only`.

## unauthorized fail_closed behavior

Unauthorized mock auth returns fail_closed. It does not continue to real credential validation, does not read ENV values, and does not call provider or runtime services.

## malformed request fail_closed behavior

Malformed mock request objects fail closed. Missing body, malformed member id, malformed transaction id, invalid amount, and unsupported transaction type never produce a runtime write.

## duplicate replay behavior

Duplicate replay with the same transaction payload returns idempotent replay behavior. It does not create another debit intent or credit intent.

The facade response records double-debit and double-credit prevention through the response envelope.

## conflicting duplicate behavior

Conflicting duplicate replay enters manual_review / fail_closed behavior. This is a response marker only and does not write admin review, wallet, ledger, or Prisma records.

## insufficient balance behavior

A bet facade request that exceeds mock fixture balance returns fail_closed with reason `insufficient_balance`.

The facade does not reserve balance, debit wallet, post ledger, or call a provider.

## sanitized log behavior

The facade returns sanitized log preview metadata only. It never prints raw request bodies or credential-like values.

Safe redaction markers are:

- auth-header-redaction-marker
- credential-prefix-marker
- mock-redaction-key-name
- redacted-credential-marker

Credential-like keys are replaced with redaction output.

## no Express route wiring proof

ORO-4E keeps Express route wiring blocked:

- `expressRouteWired=false`
- `runtimeWiredToLiveRoute=false`
- `activationAllowed=false`
- expressRouteWiring proof flag is false.
- no import or mount is added to `src/app.js`, route files, or controllers.

## no alias proof

Provider-compatible aliases remain disabled:

- `aliasBalanceEnabled=false`
- `aliasTransactionEnabled=false`
- aliasBalance proof flag is false.
- aliasTransaction proof flag is false.
- `/api/balance` is not opened.
- `/api/transaction` is not opened.

## no wallet mutation proof

ORO-4E keeps wallet mutation blocked:

- `walletMutationAllowed=false`
- walletMutation proof flag is false.
- debit and credit remain response intent markers only.
- wallet mutation services are not imported.

## no ledger mutation proof

ORO-4E keeps ledger mutation blocked:

- `ledgerMutationAllowed=false`
- ledgerMutation proof flag is false.
- facade response envelopes are not ledger records.
- ledger services are not imported.

## no Prisma write proof

ORO-4E keeps Prisma writes blocked:

- `prismaWriteAllowed=false`
- prismaWrite proof flag is false.
- no Prisma client import exists in the new mock facade or fixture files.
- no DB transaction is introduced.

## no external network proof

ORO-4E keeps external network blocked:

- `externalNetworkAllowed=false`
- `networkAllowed=false`
- externalNetwork proof flag is false.
- no live OroPlay API call is introduced.

## future staging controller requirements

Any future staging controller wiring remains blocked until a separate approved phase supplies:

- explicit manual approval.
- staging-only runtime mode gate.
- callback credential handling proof without printing values.
- sanitized audit log proof.
- request envelope and response envelope compatibility proof.
- idempotency and duplicate replay proof.
- wallet and ledger dry-run proof.
- reconciliation guard proof.
- rollback / kill switch proof.
- local smoke, staging smoke, and secret scan evidence.

## explicit no-real-money boundary

ORO-4E is not real callback runtime. It does not debit, credit, settle, reconcile real money, pay out, auto-credit, mutate wallet, mutate ledger, write through Prisma, call OroPlay, migrate, deploy, enable `/api/balance`, enable `/api/transaction`, add Express routes, or change production config.
