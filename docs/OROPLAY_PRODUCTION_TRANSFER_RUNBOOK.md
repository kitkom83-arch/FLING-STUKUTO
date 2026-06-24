# OroPlay Production Transfer API Runbook

This runbook is for a controlled production test or staging proof only. It is not a customer-live launch guide, and it must not be used to open public routes, expose secrets, or move customer funds.

## Scope

- Provider: OroPlay
- API mode: Transfer API
- Currency: THB
- Agent: MAHA289
- Goal: prove the flow `API -> create player -> deposit -> launch 5-6 games -> check balance -> withdraw all` with a local operator-run smoke script.

## Required Env

Set these locally only:

- `OROPLAY_ENABLED=1`
- `OROPLAY_MODE=transfer`
- `OROPLAY_BASE_URL=https://bs.sxvwlkohlv.com/api/v2`
- `OROPLAY_CLIENT_ID=...`
- `OROPLAY_CLIENT_SECRET=...`

Optional but supported:

- `OROPLAY_AGENT_CODE=MAHA289`
- `OROPLAY_CURRENCY=THB`
- `OROPLAY_TEST_DEPOSIT_AMOUNT=20`
- `OROPLAY_TIMEOUT_MS=20000`

Do not commit `.env`. Do not print the raw client secret, token, or bearer header.

## Public IP Check

Before the first production test run, record the machine's public IP and verify it is whitelisted in OroPlay.

Typical local checks:

- `curl https://api.ipify.org`
- `curl https://ifconfig.me`

If the IP changed, update the OroPlay whitelist before retrying.

## Whitelist Steps

1. Sign in to the OroPlay operator/admin console with an approved operator account.
2. Open the IP whitelist or server whitelist section.
3. Add the current public IP exactly as shown by the check above.
4. Save the whitelist change.
5. Confirm the whitelist entry is active before running the smoke.

## Smoke Command

Run:

```bash
npm run smoke:oroplay-production-transfer
```

Expected top-level flow:

1. Safety guard confirms `OROPLAY_ENABLED=1`.
2. Safety guard confirms `NODE_ENV` is `development-local`, `test`, or `staging`.
3. Safety guard confirms `OROPLAY_BASE_URL`, `OROPLAY_CLIENT_ID`, and `OROPLAY_CLIENT_SECRET` are present.
4. Create token.
5. Read agent balance.
6. Read vendor list.
7. Read game list.
8. Select 5-6 games from the provider list.
9. Create a unique test player such as `testuser_yyyyMMddHHmmss`.
10. Deposit a small amount such as 20 THB.
11. Launch 5-6 games.
12. Check user balance.
13. Read betting history if the provider has populated it.
14. Withdraw all back to the agent.
15. Print a masked summary.

## Expected Output

A successful run should show:

- `OroPlay production transfer smoke safety guard: PASS`
- `CreateToken: PASS`
- `Get agent balance: PASS`
- `Get vendor list: PASS`
- `Get game list: PASS`
- at least 5 `Launch game ...: PASS` lines
- `Check user balance: PASS`
- `Betting history check: PASS`
- `Withdraw all: PASS`
- `OroPlay production transfer smoke: PASS`

The final summary must mask the token and secret.

## Known Failures

- `401`
  - Secret is wrong, client ID is wrong, token flow is wrong, or IP whitelist does not match.
- Empty game list
  - Vendor mapping may be wrong, the provider may not have active games, or the account may not be fully enabled.
- Launch failed
  - Game code is inactive, account privileges are incomplete, or the launch endpoint mapping differs from the provider contract.
- Betting history delay
  - History can lag after deposit or launch; retry after a short wait before treating it as a final failure.

## Rollback / Stop

If anything looks wrong:

1. Stop the smoke immediately.
2. Revoke or rotate the local test credential if needed.
3. Remove or disable the current IP whitelist entry.
4. Set `OROPLAY_ENABLED=0` or unset the OroPlay env locally.
5. Do not re-run until the failure is reviewed.

## Safety Notes

- No customer traffic.
- No public live route.
- No real-money customer flow.
- No secrets in logs or docs.
- No stage, commit, or push until explicit approval is given.
