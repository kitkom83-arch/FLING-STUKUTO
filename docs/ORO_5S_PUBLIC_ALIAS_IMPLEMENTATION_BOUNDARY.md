# ORO-5S Public Alias Implementation Boundary

## ORO-5S scope

ORO-5S is a public alias implementation boundary only. It wires the provider
public aliases to the existing OroPlay callback fail-closed handlers:

- POST `/api/balance`
- POST `/api/transaction`

This boundary does not approve runtime traffic, live traffic, real-money flow,
wallet mutation, ledger mutation, persistent writes, DB transactions,
migrations, external calls, or live OroPlay calls.

## Dependency on ORO-5R authorization decision

ORO-5S depends on the ORO-5R public alias authorization decision:

- dependsOnOro5rPublicAliasAuthorizationDecision = true
- publicAliasAuthorizationGrantedFromOro5r = true
- publicAliasAuthorizationGrantScopeFromOro5r = public_alias_implementation_boundary_only
- publicAliasImplementationBoundaryEntryAllowedFromOro5r = true

## Public alias implementation record

ORO-5S implements only fail-closed alias wiring:

- publicAliasImplementationBoundaryResult = PASS
- publicAliasImplementationBoundaryEntered = true
- publicAliasImplementationBoundaryChecked = true
- publicAliasImplemented = true
- publicAliasPatchImplemented = true
- apiBalancePublicAliasMounted = true
- apiTransactionPublicAliasMounted = true
- apiBalancePublicAliasPath = /api/balance
- apiTransactionPublicAliasPath = /api/transaction
- apiBalancePublicAliasMapsTo = /api/oroplay/balance
- apiTransactionPublicAliasMapsTo = /api/oroplay/transaction
- apiBalancePublicAliasMode = fail_closed_no_mutation
- apiTransactionPublicAliasMode = fail_closed_no_mutation
- apiBalancePublicAliasRuntimeTrafficEnabled = false
- apiTransactionPublicAliasRuntimeTrafficEnabled = false

The `publicAliasImplemented = true` marker means only fail-closed no-mutation
alias wiring. It does not mean runtime processing, live traffic, real-money
flow, wallet mutation, or ledger mutation.

## File boundary

ORO-5S changes only `src/app.js` for runtime wiring:

- srcAppChangedInOro5s = true
- runtimeRouteControllerChangedInOro5s = false

The public aliases reuse the existing callback handlers. No runtime route file,
controller file, service file, Prisma file, migration file, or deployment file
is changed.

## Runtime and money movement boundary

Runtime traffic and live traffic remain disabled:

- runtimeTrafficEnabled = false
- liveTrafficEnabled = false

Wallet, ledger, persistent writes, DB transactions, and migrations remain
blocked:

- walletMutationAllowed = false
- walletMutationPerformed = false
- ledgerMutationAllowed = false
- ledgerMutationPerformed = false
- prismaWriteAllowed = false
- prismaWritePerformed = false
- dbTransactionAllowed = false
- dbTransactionPerformed = false
- migrationAllowed = false
- migrationPerformed = false

External and live OroPlay calls remain blocked:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

Sensitive values remain absent from the boundary output:

- secretsLeaked = false

## Next phase requirements

- nextPhaseRequiresPostAliasValidationBoundary = true
- nextPhaseRequiresSeparateRuntimeTrafficApproval = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate post-alias validation boundary. Runtime
traffic and live traffic remain separate explicit approvals.

## Downstream ORO-5T validation note

ORO-5T validates the public alias implementation after ORO-5S. It confirms
`POST /api/balance` and `POST /api/transaction` remain mounted to the existing
fail-closed handlers, stay in `fail_closed_no_mutation` mode, and do not
approve runtime traffic, live traffic, wallet/ledger mutation, DB mutation,
external calls, or live OroPlay calls.
