# ORO-11H User-Approved Evidence Pack Separate Gate

## Status

- ORO-11G closed.
- ORO-11H current.
- ORO-11H was created from an explicit human-approved separate gate decision after ORO-11G.
- ORO-11H was not inferred from an existing roadmap marker.
- ORO-11H scope: user_approved_evidence_pack_separate_gate_after_oro_11g_only
- ORO-11H remains docs, static contract, mock helper, fixtures, and local smoke coverage only.
- ORO-11H is not runtime implementation.
- ORO-11H is not live execution.
- ORO-11H does not mount a route.
- ORO-11H does not create or enable a public alias.
- ORO-11H does not enable runtime traffic.
- ORO-11H does not mutate wallet or ledger state.
- ORO-11H does not call OroPlay.
- ORO-11H does not use real client secret material.
- ORO-11H does not touch production DB.
- ORO-11H does not deploy.

## Gate Contract

- phase id must be ORO-11H.
- previous phase must be ORO-11G.
- ORO-11G closed marker must be present.
- human-approved separate gate decision must be present.
- route mount remains disabled.
- public alias remains disabled.
- runtime traffic remains disabled.
- wallet mutation remains disabled.
- ledger mutation remains disabled.
- live execution remains disabled.
- external call remains disabled.
- secret-shaped values are not present.
- next phase requires a separate gate again.

## Safety Markers

- no_runtime_implementation
- no_live_execution
- no_live_oroplay_api_call
- no_external_network
- no_route_mount
- no_public_alias
- no_runtime_traffic
- no_wallet_mutation
- no_ledger_mutation
- no_prisma_write
- no_db_transaction
- no_migration
- no_deploy
- no_production_db
- no_real_money
- no_secret_shaped_value
- next_phase_requires_separate_gate

## Expected Files

- doc: docs/ORO_11H_SEPARATE_GATE.md
- helper: src/game-provider-mock/oro11hSeparateGate.js
- fixtures: src/game-provider-mock/oro11hSeparateGateFixtures.js
- detailed smoke: src/local-smoke-tests/oro11hSeparateGateSmoke.js
- wrapper smoke: src/local-smoke-tests/oro11hSmoke.js
- npm run smoke:oro-11h
- npm run smoke:oro-11h:detailed

## Rollback

- ORO-11H has no runtime side effect to roll back.
- Removing the ORO-11H doc, helper, fixtures, local smoke, and script registration returns the repo to the ORO-11G closed static state.

## Next Phase

- Next phase requires separate gate.
