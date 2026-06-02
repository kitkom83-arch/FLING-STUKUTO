# OroPlay Seamless Wallet Contract

Status: ORO-1 safe contract / adapter boundary. This document does not add runtime routes or enable provider callbacks.

ORO-2A callback route design is tracked in `docs/OROPLAY_CALLBACK_API_DESIGN.md`. ORO-2A remains design/staging-boundary only and does not change the ORO-1 mock harness behavior.

## Provider Callback Purpose

OroPlay Seamless Wallet callbacks allow the provider to ask the platform for member balance and to submit game transaction events. Future implementation must keep the wallet ledger as source of truth and must reject duplicate or unsafe provider events before any wallet mutation.

## Expected Callback Auth

- Expected callback auth: Basic Auth using env-only credentials.
- Credentials must never be stored in docs, source code, logs, issue comments, or screenshots.
- Future callback logs must record only sanitized auth result, request id, member reference, transaction reference, and safe status labels.

## Preferred Routes

Preferred internal routes for future implementation:

- `POST /api/oroplay/balance`
- `POST /api/oroplay/transaction`

Optional provider-compatible aliases only if OroPlay requires direct paths:

- `POST /api/balance`
- `POST /api/transaction`

Aliases must call the same guarded internal handler and must not bypass auth, idempotency, ledger, or reconciliation checks.

## Balance Callback Contract

Purpose: return the current member wallet balance for provider-side gameplay checks.

Expected future request fields:

- Account code or provider merchant reference.
- Member username or member provider id.
- Provider request id if supplied.

Expected future response fields:

- Success/failure status.
- Member wallet balance.
- Currency.
- Provider-compatible error code/message when member is not found, auth fails, or account is blocked.

Rules:

- Read wallet balance from platform wallet/ledger state only.
- Do not compute balance from provider betting history.
- Do not include credential-shaped values, admin credential material, raw auth value, or internal secret in any response.

## Transaction Callback Contract

Purpose: apply provider game transaction events only after auth, validation, idempotency, and ledger guards pass.

Expected future request fields:

- Account code or provider merchant reference.
- Member username or member provider id.
- `transactionCode`.
- Round id / game round reference.
- Game code or game id.
- Amount.
- Currency.
- Transaction timestamp.
- Provider event type/status if supplied.

Transaction amount rule:

- Negative amount = bet/debit.
- Positive amount = win/credit.
- Zero amount must be explicitly classified before acceptance; default should be reject or manual review until provider examples confirm the rule.

## Required Guards

- Duplicate `transactionCode` guard: replay must return an idempotent safe result or a duplicate conflict, never double-post.
- Finished round / invalid transaction guard: reject or no-op according to provider examples; never mutate wallet from invalid finished-round events.
- Insufficient balance behavior: debit must fail safely when wallet balance is insufficient; response should be provider-compatible and must not leak internal wallet internals.
- Ledger source of truth: every accepted debit/credit must map to a wallet ledger entry before balance changes are considered valid.
- Reconciliation guard: betting history and provider callbacks must be reconcilable by transaction, round, member, amount, and timestamp.
- Sanitized callback logs: log request id, transaction code hash or safe reference, member safe id, action, result, and error class only.

## ORO-1 Mock Harness Behavior

ORO-1 adds only local mock contract helpers and an in-memory harness:

- `src/game-provider-mock/oroplaySeamlessContract.js`
- `src/game-provider-mock/oroplaySeamlessMockHarness.js`
- `src/local-smoke-tests/oroplaySeamlessContractSmoke.js`

Mock behavior:

- Balance callback reads the in-memory mock user balance only.
- Transaction callback handles negative amount as bet/debit and positive amount as win/credit.
- Zero, malformed, missing `transactionCode`, or missing `roundId` requests are rejected.
- Duplicate `transactionCode` returns the saved response and never debits or credits twice.
- Insufficient balance rejects and leaves balance unchanged.
- Finished round rejects later new transactions for the same round and leaves balance unchanged.
- Sanitized callback logs redact raw Basic Auth and remove credential-shaped payload keys such as `clientSecret`, token fields, password fields, `DATABASE_URL`, PIN, and device identifiers.

The ORO-1 harness is not a live callback API, does not create Express routes, does not connect a database, and does not mutate runtime wallet or ledger state.

## Forbidden Until Later Approval

- No runtime callback endpoint in ORO-1.
- No production DB.
- No real money runtime flow.
- No live provider call.
- No callback wallet mutation.
- No live payout.
- No hardcoded secret.
- No migration.
- No deploy.
