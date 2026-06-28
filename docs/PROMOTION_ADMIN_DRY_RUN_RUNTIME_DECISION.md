# Promotion Admin Dry-run Runtime Decision

## Purpose

This document records the phase 42 runtime decision gate for the promotion admin dry-run chain. The helper is pure and static, and it exists only to capture the decision boundary after final readiness.

## Current status

- Phase marker: `BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-RUNTIME-DECISION-42`
- Mode: `decision_record_only`
- Status: `runtime_decision_record_only_runtime_not_enabled`
- Runtime is not enabled in phase 42.

## Decision options

- `hold_runtime`
- `reject_runtime_for_now`
- `request_staging_only_runtime_phase`
- `request_separate_runtime_implementation_phase`

## Selected decision

The default selected decision is `hold_runtime`. The record stays read only, write locked, and does not open route mounting or runtime enablement.

## Runtime boundary

The gate only records the next-step decision. It does not mount routes, enable handlers, touch Prisma, write DB rows, update promotions, or call external systems.

## Required separate runtime phase

A separate approved runtime phase is still required before any runtime can be enabled.

## Staging-only path

`request_staging_only_runtime_phase` is recorded as a decision only. It remains blocked in phase 42 and does not enable staging runtime.

## Production runtime path

`request_separate_runtime_implementation_phase` is recorded as a decision only. It remains blocked in phase 42 and does not enable production runtime.

## Non-goals

- No route mount
- No API enablement
- No controller or service runtime wiring
- No DB write
- No promotion update
- No audit row creation
- No ledger creation
- No turnover creation
- No claim execution

## Hard safety locks

- `noDbWrite`
- `noPromotionUpdate`
- `noAuditRowCreation`
- `noLedgerCreation`
- `noTurnoverCreation`
- `noClaimExecution`
- `noRuntimeCreditAction`
- `noProviderOutbound`
- `noProductionDeploy`

## Next possible phase

If runtime is ever approved, the next phase must be a separately approved runtime implementation decision with explicit route and handler authorization.
