# OroPlay Production Transfer API Evidence

This document records a controlled production test or staging proof only. It is not evidence of customer-live launch readiness, and it must not contain raw secrets, raw tokens, or public customer data.

## Test Boundary

- Provider: OroPlay
- API mode: Transfer API
- Currency: THB
- Agent: MAHA289
- Scope: controlled production test / staging proof
- Customer impact: none intended
- Live customer access: not opened

## Required Evidence Fields

Record the following for each run:

- Date and time
- Operator name
- Machine public IP
- Whitelist confirmation
- Base URL used
- Smoke command used
- Whether token creation passed
- Whether agent balance passed
- Whether vendor list passed
- Whether game list passed
- Which 5-6 games were launched
- Deposit amount used
- Balance before withdraw
- Balance after withdraw
- Betting history result
- Any failed step and safe error summary

## Masking Rules

- Do not write the client secret.
- Do not write the raw bearer token.
- Do not write full Authorization headers.
- Mask player identifiers if they might be reused outside the test.
- Summaries should use masked or partial values only.

## Run Log Template

| Field | Value |
| --- | --- |
| Date |  |
| Operator |  |
| Public IP |  |
| Whitelist confirmed |  |
| Base URL |  |
| Smoke command | `npm run smoke:oroplay-production-transfer` |
| CreateToken |  |
| Agent balance |  |
| Vendor list |  |
| Game list |  |
| Selected games |  |
| Player username |  |
| Deposit amount |  |
| Launches passed |  |
| User balance before withdraw |  |
| Withdraw all |  |
| User balance after withdraw |  |
| Betting history |  |
| Notes |  |

## Masked Response Summary Example

- Token: `******abc123`
- Client secret: `ab***yz`
- Player: `testuser_20260624120000`
- Launch URL: `https://...` or masked summary only
- Response payloads: safe summary fields only

## Failed Step Log Template

If something fails, record only a safe summary:

- Step name
- HTTP status if known
- Safe error class or message
- Whether the failure looked like auth, whitelist, empty list, launch, balance, or history delay
- Whether the run was stopped immediately

## Controls

- No customer data.
- No secret text.
- No stage, commit, or push until approval.
- No public live route for customers.
