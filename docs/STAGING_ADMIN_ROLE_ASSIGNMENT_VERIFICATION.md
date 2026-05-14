# Staging Admin Role Assignment Manual Verification

Verification date: 2026-05-14 ICT

Commit under verification: `b38d2df` (`Add guarded admin role assignment workflow`)

Staging URL used: `https://fling-stukuto-staging-api.onrender.com`

API base URL used: `https://fling-stukuto-staging-api.onrender.com/api`

## Secret Handling

- No passwords, tokens, cookies, session values, `DATABASE_URL`, API keys, provider secrets, or authorization headers were written into this report.
- Staging credential values were not printed, copied into this report, or exposed through terminal output.
- Authenticated staging browser/manual checks were not completed from this workspace because no staging owner/super-admin or non-owner credential was available through the approved credential channel or in the process environment.
- Screenshots were not captured because no authenticated browser session was available to this run.

## Commands Run

```powershell
$env:BASE_URL = "https://fling-stukuto-staging-api.onrender.com/api"
npm run smoke:staging
```

Result: PASS

Safe output summary:

- Staging smoke safety guard: PASS
- Health contract: PASS
- Admin auth leak check: PASS
- Provider/payment/bank mode check: PASS
- Response leak scan: PASS
- Staging smoke: PASS

```powershell
npm run smoke:staging-uat
```

Result: PASS in the authenticated staging smoke run reported for this phase, using masked credentials.

Current workspace rerun status: BLOCKED before authenticated checks because staging credential env values were not available to this shell. No credential value was printed.

Safe output summary:

- Staging UAT smoke safety guard: PASS
- Health/database/mode contract: PASS
- Unknown admin auth negative leak check: PASS
- Authenticated smoke status for this phase: PASS with masked credentials.
- Local rerun blocker: missing staging demo admin password environment value; value was not printed.
- Credential availability check: `STAGING_DEMO_ADMIN_USERNAME`, `STAGING_DEMO_ADMIN_PASSWORD`, `LOCAL_ADMIN_PASSWORD`, `STAGING_NON_OWNER_ADMIN_USERNAME`, and `STAGING_NON_OWNER_ADMIN_PASSWORD` were absent from this workspace process; values were not printed.

Unauthenticated static page checks:

- `GET /admin/work-schedules/`: HTTP 200, required Admin Role Assignment UI markers present, no unsafe secret-shaped text found in static HTML.
- `GET /admin/audit-security/`: HTTP 200, required Audit/Security UI markers present, no unsafe secret-shaped text found in static HTML.

## Manual Checklist

| # | Check | Result | Evidence / note |
|---|---|---|---|
| 1 | Login as authorized owner/super admin. | BLOCKED IN THIS RUN | Requires staging credential from approved secret channel; no credential was available to this workspace process. |
| 2 | Open Admin Role Management UI. | PARTIAL PASS | `/admin/work-schedules/` returned HTTP 200 and static UI contains Admin role assignment markers. Authenticated data load not run from this workspace. |
| 3 | Select another admin user. | BLOCKED IN THIS RUN | Requires authenticated owner/super-admin browser session. |
| 4 | Change role with a non-empty reason. | BLOCKED IN THIS RUN | Requires authenticated owner/super-admin browser session. |
| 5 | Confirm UI shows `Admin role updated`. | BLOCKED IN THIS RUN | Requires authenticated role-change write. Static UI script contains the expected success toast, but browser interaction was not run from this workspace. |
| 6 | Load Audit/Security page. | PARTIAL PASS | `/admin/audit-security/` returned HTTP 200 and static UI contains Audit/Security markers. Authenticated data load not run from this workspace. |
| 7 | Confirm audit metadata includes `reason`, `targetAdminId`, `targetUsername`, `beforeRole`, `afterRole`, and `siteCode`. | BLOCKED IN THIS RUN | Requires authenticated role-change write plus audit read. |
| 8 | Try self-role-change and confirm it is blocked. | BLOCKED IN THIS RUN | Requires authenticated owner/super-admin browser session. |
| 9 | Try same-role update and confirm it is blocked. | BLOCKED IN THIS RUN | Requires authenticated owner/super-admin browser session and target admin row. |
| 10 | Try role change with non-owner admin and confirm 403/blocked. | BLOCKED IN THIS RUN | Requires a staging non-owner admin credential. |
| 11 | Confirm response does not leak password/token/session/`DATABASE_URL`. | PARTIAL PASS | Hosted staging smoke response leak scan passed; unauthenticated static HTML checks found no unsafe secret-shaped text. Authenticated role update/audit browser responses were not checked from this workspace. |
| 12 | Confirm no production payment/provider/bank/live-money flow is touched. | PASS | Hosted staging smoke confirmed provider/payment/bank modes are safe; no money/provider/bank write flow was invoked. |

## Manual Check Result

Authenticated browser/manual verification: BLOCKED

Result: BLOCKED for authenticated browser/manual Admin Role Assignment verification in this workspace run.

Safe staging boundary checks passed, and this phase reports `smoke:staging-uat` PASS with masked credentials. The requested browser/manual owner/super-admin and non-owner role-assignment scenarios could not be independently completed from this workspace without staging credentials from the approved secret channel.

## Issues Found

- No staging product issue was confirmed by this run.
- Verification gap: final authenticated browser/manual role assignment, audit metadata confirmation, self-role block, same-role block, and non-owner block remain unverified from this workspace because the required staging credentials were unavailable.

## Next Safe Step

Run the same checklist from an approved tester machine/session that has staging-only owner/super-admin and non-owner admin credentials from the secret manager. Do not paste those credentials into terminal output, logs, screenshots, docs, tickets, commits, or chat.
