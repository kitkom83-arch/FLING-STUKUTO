# Promotion Admin Dry-run Enablement Runbook

## Purpose

This runbook captures the readiness-only approval checklist for the future promotion admin dry-run boundary. It documents the gate without mounting any route, enabling any runtime handler, or touching live data.

## Current status

- Phase: `BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-ENABLEMENT-RUNBOOK-39`
- Runbook mode: `readiness_only`
- Runtime enabled: `false`
- Route mounted: `false`
- Mount granted: `false`
- Mount denied by default: `true`

## Required approvals

- Product owner approval
- Technical lead approval
- Security approval
- Rollback plan acceptance
- Monitoring plan acceptance
- Staging UAT pass
- Production window approval

## Required prechecks

- Confirm the mount authorization gate remains on Phase 38.
- Confirm the runtime preflight remains on Phase 37.
- Confirm the runbook stays `readiness_only`.
- Confirm the route is not mounted.
- Confirm runtime is not enabled.
- Confirm write locked remains `true`.
- Confirm no database write path exists in the runbook.

## UAT checklist

- Staging UAT completed with approval evidence.
- Approval checklist values recorded for every required gate.
- Future runtime decisions remain blocked until a separate approved phase exists.

## Monitoring checklist

- Monitoring plan accepted before any future runtime gate.
- Monitoring remains local-safe and read-only.
- No live provider outbound.
- No production deploy.

## Rollback checklist

- Rollback plan accepted before any future runtime gate.
- Route remains unmounted.
- Runtime remains disabled.
- Write locked remains `true`.

## Non-goals

- No Express route mount.
- No controller runtime handler.
- No service runtime handler.
- No API call enablement.
- No DB write.
- No promotion update.
- No audit row creation.
- No ledger creation.
- No turnover creation.
- No claim execution.
- No runtime credit action.

## Hard safety locks

- `noDbWrite: true`
- `noPromotionUpdate: true`
- `noAuditRowCreation: true`
- `noLedgerCreation: true`
- `noTurnoverCreation: true`
- `noClaimExecution: true`
- `noRuntimeCreditAction: true`
- `noProviderOutbound: true`
- `noProductionDeploy: true`
