# Financial Ledger Live Integration Certification Checklist

## 1. Phase U status

Phase U defines the certification checklist before any live integration, staging dry-run migration, or DB-backed ledger staging prototype.

Status: NOT production ready.

- certification checklist only
- docs/static smoke only
- no production DB
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no Prisma migration
- no schema.prisma change
- no seed
- no runtime money flow change
- no route/controller/service integration
- no admin write action

## 2. Safety boundaries

- mock/staging/sandbox only
- no production DB
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no DB writes
- no external network calls
- no Prisma migration
- no schema.prisma change
- no seed/fixture change
- no frontend money authority
- no admin direct balance mutation without ledger/audit/dual control
- no secret/token/password/database env/JWT/auth header values in docs/logs

## 3. Certification purpose

This checklist is used to:

- check readiness before live integration
- check readiness before staging dry-run migration
- check readiness before DB-backed ledger staging prototype
- check readiness before provider/payment/bank integration certification
- check readiness before payout certification

This checklist does not authorize real money, does not authorize live payout, does not authorize production DB, and does not enable live integration by itself.

## 4. Required closed phases before live integration

No-Go if any required phase below is not closed with commit evidence and Safe CI PASS.

| Phase | Required evidence | Safe CI | Deploy/seed note | Scope summary |
| --- | --- | --- | --- | --- |
| Phase P: Financial Ledger Hardening Plan | commit recorded in release notes | PASS required | no deploy required; no seed required | planning artifact for ledger, reconciliation, audit, dual control, and no-live-payout boundaries |
| Phase Q: Financial Ledger Runtime Design / Data Contract | commit recorded in release notes | PASS required | no deploy required; no seed required | docs/static runtime data, API, idempotency, reconciliation, audit, and error contracts |
| Phase R: Ledger schema dry-run design + migration plan only | commit recorded in release notes | PASS required | no deploy required; no seed required | schema and migration dry-run plan only; no migration and no schema.prisma change |
| Phase S: Ledger mock runtime harness, no real money | commit recorded in release notes | PASS required | no deploy required; no seed required | isolated in-memory mock harness for ledger logic only |
| Phase T: Reconciliation mock reports + admin read-only UI | commit `22f4fbe Add financial ledger reconciliation mock reports` | PASS required | no deploy required; no seed required | isolated mock reports and static read-only admin UI only |

## 5. Production DB isolation checklist

- [ ] production DB credential not present in local/staging docs/logs
- [ ] production DB access blocked for dry-run
- [ ] DB endpoint allowlist reviewed
- [ ] staging DB and production DB are separate
- [ ] local disposable DB plan exists
- [ ] backup/restore drill required before any production-like migration
- [ ] migration dry-run cannot target production
- [ ] CI/static scans must reject database env assignments in docs/logs
- [ ] No-Go if production DB boundary missing/failing

## 6. Real-money and payout boundary checklist

- [ ] no real money enabled
- [ ] live payout disabled
- [ ] withdraw paid_mock remains mock only
- [ ] payout provider disabled
- [ ] bank transfer live mode disabled
- [ ] payment live mode disabled
- [ ] provider live mode disabled
- [ ] admin payout action not implemented
- [ ] no frontend payout authority
- [ ] no member-triggered live payout
- [ ] No-Go if any live payout path exists

## 7. Provider/payment/bank/SMS/Slip OCR certification checklist

### Provider game callback certification

- [ ] sandbox/mock mode proof
- [ ] contract review
- [ ] credential handling review
- [ ] callback signature validation plan
- [ ] idempotency plan
- [ ] reconciliation plan
- [ ] error handling plan
- [ ] response leak scan
- [ ] rollback/disable switch
- [ ] live enablement requires explicit approval

### Payment deposit certification

- [ ] sandbox/mock mode proof
- [ ] contract review
- [ ] credential handling review
- [ ] callback signature validation plan
- [ ] idempotency plan
- [ ] reconciliation plan
- [ ] error handling plan
- [ ] response leak scan
- [ ] rollback/disable switch
- [ ] live enablement requires explicit approval

### Bank statement certification

- [ ] sandbox/mock mode proof
- [ ] contract review
- [ ] credential handling review
- [ ] callback signature validation plan
- [ ] idempotency plan
- [ ] reconciliation plan
- [ ] error handling plan
- [ ] response leak scan
- [ ] rollback/disable switch
- [ ] live enablement requires explicit approval

### SMS provider certification

- [ ] sandbox/mock mode proof
- [ ] contract review
- [ ] credential handling review
- [ ] callback signature validation plan
- [ ] idempotency plan
- [ ] reconciliation plan
- [ ] error handling plan
- [ ] response leak scan
- [ ] rollback/disable switch
- [ ] live enablement requires explicit approval

### Slip OCR certification

- [ ] sandbox/mock mode proof
- [ ] contract review
- [ ] credential handling review
- [ ] callback signature validation plan
- [ ] idempotency plan
- [ ] reconciliation plan
- [ ] error handling plan
- [ ] response leak scan
- [ ] rollback/disable switch
- [ ] live enablement requires explicit approval

## 8. Ledger runtime certification checklist

- [ ] ledger data contract locked
- [ ] schema dry-run plan reviewed
- [ ] idempotency behavior reviewed
- [ ] double-entry-compatible balancing reviewed
- [ ] immutable append-only entries reviewed
- [ ] reversal policy reviewed
- [ ] ledger write atomicity plan reviewed
- [ ] wallet balance snapshot strategy reviewed
- [ ] failed/reversed entries explicit policy reviewed
- [ ] no frontend money calculation authority

## 9. Dual control certification checklist

- [ ] maker/checker separation
- [ ] no self-approval
- [ ] auditor role
- [ ] owner role
- [ ] emergency override reason required
- [ ] high-risk action requires second admin
- [ ] all approval/rejection audit events required
- [ ] admin RBAC negative tests required
- [ ] No-Go if self-approval possible

## 10. Audit and redaction certification checklist

- [ ] auditLogId required for money-affecting action
- [ ] actorType/actorId required
- [ ] siteCode required
- [ ] action/target required
- [ ] before/after sanitized snapshots
- [ ] reason required
- [ ] masked IP
- [ ] userAgent hash
- [ ] no raw secret-shaped values
- [ ] no raw internal error
- [ ] response leak scan required
- [ ] No-Go if audit or redaction incomplete

## 11. Reconciliation certification checklist

- [ ] daily deposit ledger vs statement
- [ ] withdraw reserve vs approved vs paid_mock
- [ ] wallet snapshot vs ledger sum
- [ ] provider callback variance
- [ ] admin adjustment variance
- [ ] Lucky Wheel reward liability
- [ ] stale pending deposit/withdraw
- [ ] unmatched entries
- [ ] audit coverage report
- [ ] reconciliation owner assigned
- [ ] No-Go if variance report missing

## 12. Backup/restore and rollback certification checklist

- [ ] backup before migration
- [ ] restore drill completed
- [ ] rollback script reviewed
- [ ] stop-write procedure documented
- [ ] post-rollback reconciliation
- [ ] incident report template
- [ ] monitoring/alerting enabled before any live operation
- [ ] No-Go if backup/restore drill missing

## 13. Monitoring and alerting certification checklist

- [ ] ledger write failure alert
- [ ] reconciliation mismatch alert
- [ ] stale pending alert
- [ ] idempotency conflict alert
- [ ] payout-disabled violation alert
- [ ] provider callback variance alert
- [ ] admin adjustment high-risk alert
- [ ] audit missing reason alert
- [ ] dashboard owner
- [ ] escalation path

## 14. API and response contract certification checklist

- [ ] auth required
- [ ] permission required
- [ ] idempotency required for money-affecting writes
- [ ] error shape documented
- [ ] no secret response
- [ ] no raw internal error
- [ ] correlationId/requestId included
- [ ] response leak scan
- [ ] unauthorized/forbidden negative tests
- [ ] No-Go if any money write lacks auth/permission/idempotency

## 15. Staging dry-run migration readiness checklist

- [ ] Phase V requires explicit approval
- [ ] disposable local DB dry-run first
- [ ] staging DB dry-run after local success
- [ ] migration rollback plan
- [ ] backup/restore proof
- [ ] no production DB proof
- [ ] smoke suite required
- [ ] response leak scan required
- [ ] no live integration
- [ ] no real money

## 16. DB-backed ledger staging prototype readiness checklist

- [ ] Phase W requires Phase V approval
- [ ] staging only
- [ ] read/write isolated to staging prototype
- [ ] no production
- [ ] no live provider/payment/bank/SMS/Slip OCR
- [ ] no live payout
- [ ] fixture data only
- [ ] admin RBAC guard required
- [ ] audit guard required
- [ ] dual control guard required

## 17. Final Go/No-Go matrix

| area | required evidence | pass condition | no-go condition | owner | phase dependency |
| --- | --- | --- | --- | --- | --- |
| safety boundary | signed boundary checklist | all no-live/no-production markers pass | any boundary missing | phase owner | P/Q/R/S/T |
| production DB isolation | DB separation and scan evidence | production DB absent from dry-run paths | production DB reachable | database owner | U |
| real-money boundary | mode and money-flow evidence | real money remains disabled | real money path exists | finance owner | U |
| live payout boundary | payout-disabled proof | no payout path exists | live payout path exists | finance owner | U |
| provider certification | sandbox callback evidence | contract/idempotency/reconciliation reviewed | live provider unapproved | integration owner | U/Y |
| payment certification | payment sandbox evidence | deposit contract reviewed | live payment unapproved | payment owner | U/Y |
| bank certification | bank statement sandbox evidence | bank reconciliation reviewed | live bank unapproved | finance owner | U/Y |
| SMS certification | SMS sandbox evidence | no live send without approval | live SMS unapproved | operations owner | U/Y |
| Slip OCR certification | OCR sandbox evidence | OCR contract reviewed | live OCR unapproved | operations owner | U/Y |
| ledger contract | locked contract evidence | contract reviewed and unchanged | missing ledger contract | ledger owner | Q |
| schema dry-run | dry-run plan evidence | plan reviewed before migration | migration without approval | database owner | R/V |
| idempotency | idempotency test plan | duplicate/replay behavior reviewed | money write without idempotency | ledger owner | Q/S |
| dual control | RBAC and maker/checker evidence | no self-approval possible | self-approval possible | security owner | P/Q/S |
| audit/redaction | audit and leak scan evidence | required audit and redaction complete | missing audit/redaction | security owner | P/Q/S/T |
| reconciliation | report evidence | variance/stale/unmatched reports available | variance report missing | finance owner | T |
| backup/restore | restore drill evidence | restore drill completed | no restore drill | database owner | O/U |
| monitoring | alert plan evidence | required alerts assigned | no alert owner | operations owner | O/U |
| RBAC | negative test evidence | unauthorized/forbidden paths pass | RBAC negative fails | security owner | existing safety |
| response leak scan | scan output | no secret-shaped values | leak scan fails | security owner | all phases |
| CI/static smoke | Safe CI and local smoke | static smoke PASS | CI/static smoke fails | phase owner | all phases |

## 18. Phase V Go/No-Go criteria

Phase V must not start unless Phase U passes:

- checklist doc exists
- static smoke PASS
- all phase dependencies listed
- no production DB boundary documented
- no real money boundary documented
- no live payout boundary documented
- no live provider/payment/bank/SMS/Slip OCR boundary documented
- no migration/schema/seed/runtime change
- certification evidence matrix present
- response leak scan requirement present
- backup/restore requirement present
- explicit approval requirement present

## 19. Next phases

- Phase V: Staging dry-run migration only after explicit approval
- Phase W: DB-backed ledger staging prototype only after Phase V approval
- Phase X: Read-only staging reconciliation API only after explicit approval
- Phase Y: Provider/payment/bank sandbox certification only after explicit approval

## Final boundary

This Phase U checklist is docs/static smoke only. It does not use production DB, move real money, enable live payout, enable live provider/payment/bank/SMS/Slip OCR, create a Prisma migration, change `schema.prisma`, seed data, change runtime money flow, add route/controller/service implementation, or add admin write actions.
