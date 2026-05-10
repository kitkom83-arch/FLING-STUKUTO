# Demo Seed Runbook

This runbook prepares a safe local or staging/test database with mock PG77 demo data. It is not a production data guide.

## Safety Rules

- Run demo seed only against local, staging, test, sandbox, or QA PostgreSQL targets.
- Do not run demo seed with `NODE_ENV` set to production.
- Do not use production clones, production read replicas, real payment rails, real bank rails, or real provider credentials.
- Keep game, payment, bank statement, SMS, and Slip OCR modes unset, `mock`, or `sandbox`.
- Do not print database URLs, JWT secrets, tokens, API keys, provider secrets, passwords, or raw provider payloads.

`prisma/seed.js` blocks production-like database targets before writing data. It validates the database target without printing the configured value.

## Prepare Local DB

Create `.env` from `.env.example`, then set the local PostgreSQL and local auth values in `.env`. Keep `.env` uncommitted.

Install dependencies and validate the schema:

```bash
npm install
npx prisma validate
npx prisma generate
```

Run migrations against the confirmed local database:

```bash
npx prisma migrate deploy
```

For first-time local development where migration files are already present, `npm run prisma:migrate` is also available. Use only non-production targets.

## Run Demo Seed

Use the existing Prisma seed script:

```bash
npm run seed
```

The seed is idempotent. It uses upsert or find-and-update patterns so it can be run repeatedly without creating duplicate core demo records.

## Verify Seed Without Printing Secrets

Use count and public identifier checks only:

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();Promise.all([p.site.count(),p.admin.count(),p.user.count(),p.siteBankAccount.count(),p.promotion.count(),p.gameProvider.count(),p.game.count(),p.siteGameProviderConfig.count(),p.sitePaymentConfig.count()]).then(([sites,admins,members,siteBanks,promos,providers,games,gameConfigs,paymentConfigs])=>console.log({sites,admins,members,siteBanks,promos,providers,games,gameConfigs,paymentConfigs})).finally(()=>p.$disconnect())"
```

Expected result: non-zero counts for the listed demo areas. Do not select or print password hashes, token values, encrypted config columns, provider payloads, or raw environment values.

## Run Smoke After Seed

Start the API in a separate terminal against the same safe local database:

```bash
npm run dev
```

Then run the full local smoke suite:

```bash
npm run smoke:all-local
```

The smoke runner requires `NODE_ENV` to be `development-local` or `test`, a local admin password, a JWT secret, a safe database target, a local/staging/test API base URL, and mock or sandbox provider modes.

## Safe Local Reset

Only reset disposable local databases. Never reset staging or production from a local checkout.

```bash
npx prisma migrate reset --skip-seed
npx prisma migrate deploy
npm run seed
```

Confirm the target database is disposable before running reset. The reset command deletes local data.

## Mock Data Created

- Site: `PG77` with id `site_pg77`, localhost domains, site settings, and theme.
- Extra demo sites: `SITE2` through `SITE6` with mock domains, settings, themes, bank accounts, provider configs, payment config, and promotions.
- Admin: `admin` with `super_admin` role and access to all seeded sites.
- Member: PG77 member `ima00180` with mock phone `0800000000`, wallet balance, points, and approved demo bank accounts.
- Site bank accounts: manual-only mock deposit and withdraw accounts with zero-prefixed demo account numbers.
- Promotions: no-bonus, welcome bonus, PG77 daily first deposit, cashback mock, and the local promotion-claim smoke fixture.
- Game providers: PG, JILI, PRAGMATIC, EVO, and JOKER provider rows.
- Games: mock slot/live games used by launch, transfer, and list smoke coverage.
- Site game provider config: active PG/JILI mock transfer configs and inactive extra provider configs.
- Payment config: active `MOCK_PAYMENT` config with mock-only placeholder credential fields.
- Smoke fixtures: local promotion-claim smoke promotion and demo bet-history rows for the PG77 demo member.

## Intentionally Not Seeded

- Real passwords.
- Real API keys.
- Real provider tokens.
- Real bank account numbers.
- Real customer phone numbers.
- Live provider mode.
- Real payment, bank, provider, SMS, or Slip OCR connectivity.

