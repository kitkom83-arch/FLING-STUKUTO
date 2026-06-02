# OroPlay Callback Staging Disabled Runtime Gate

## purpose

ORO-4A records the disabled runtime gate for future OroPlay callback runtime work. The runtime gate is disabled by default and stays fail-closed unless future certification phases explicitly approve a staging runtime.

## disabled-by-default gate

Default gate behavior is disabled and fail-closed:

- Missing runtime flag means disabled.
- `false`, `disabled`, or `off` mock flag values mean disabled.
- `true`, `enabled`, or `on` without certification means fail-closed.
- Certification evidence in mock input can only return staging-ready-only.
- Production runtime can never be enabled in ORO-4A.

## documentation-only staging activation flag

Any staging activation flag named in this phase is documentation-only. ORO-4A does not add runtime enablement to `.env`, `.env.example`, production config, route config, or live code paths.

## no ENV change in this phase

ORO-4A does not edit `.env` or `.env.example`, does not add live provider credentials, does not read real secrets, and does not print credential-like values.

## no production activation

Production activation is excluded. ORO-4A does not permit production DB, real money, live OroPlay traffic, external network, migration, deploy, payout, auto-credit, alias enablement, wallet mutation, ledger mutation, or Prisma write.

## activation prerequisites

Future activation requires all of the following:

- ORO-4A skeleton PASS.
- ORO-4B staging mock runtime PASS.
- Wallet/ledger dry-run PASS.
- Reconciliation guard PASS.
- Audit log proof PASS.
- Duplicate guard proof PASS.
- Rollback proof PASS.
- Explicit approval.

## fail-closed behavior when runtime is not certified

If runtime is not certified, the gate returns fail-closed or disabled. It must not return active runtime, production-enabled, wallet mutation allowed, ledger mutation allowed, Prisma write allowed, or alias enabled.

If certification is present only in mock input, the gate returns staging-ready-only and still keeps runtime inactive.

## safe diagnostics

Diagnostics must be safe and non-sensitive:

- Record whether a mock flag was provided without printing the raw value.
- Record whether mock certification evidence was provided without printing credential-like payloads.
- Redact Authorization header material.
- Redact token, password, clientSecret, client_secret, DATABASE_URL, PIN, and deviceId values.
- Do not output raw env values.
- Do not output live provider credentials.

## no live runtime statement

The staging disabled runtime gate is not live callback runtime. It is a static/mock guard for future phases only.
