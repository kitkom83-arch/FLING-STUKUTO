const { PrismaClient } = require("@prisma/client");
const { assertStagingSafety } = require("./stagingSafety");

const prisma = new PrismaClient();
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const ADMIN_USERNAME = process.env.STAGING_DEMO_ADMIN_EMAIL || process.env.STAGING_DEMO_ADMIN_USERNAME || "admin";
const DEMO_MEMBER_USERNAME = process.env.STAGING_DEMO_MEMBER_USERNAME || "ima00180";

const REQUIRED_TABLES = [
  "_prisma_migrations",
  "sites",
  "site_domains",
  "site_settings",
  "site_themes",
  "admins",
  "admin_site_accesses",
  "admin_logs",
  "users",
  "user_bank_accounts",
  "wallet_accounts",
  "wallet_ledgers",
  "site_bank_accounts",
  "site_payment_configs",
  "site_game_provider_configs",
  "game_providers",
  "games",
  "promotions",
  "promotion_claims",
  "turnover_requirements",
  "point_ledgers",
  "deposit_transactions",
  "withdraw_transactions",
  "game_sessions",
  "game_transfers",
  "game_bet_history_mock",
];

async function assertTablesExist() {
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;
  const existing = new Set(rows.map((row) => row.table_name));
  const missing = REQUIRED_TABLES.filter((table) => !existing.has(table));
  if (missing.length > 0) {
    throw new Error(`Missing required staging DB tables: ${missing.join(", ")}`);
  }
  console.log(`Schema tables: PASS (${REQUIRED_TABLES.length} required tables)`);
}

async function assertDemoDataReady() {
  const site = await prisma.site.findUnique({
    where: { code: SITE_CODE },
    select: { id: true, code: true, status: true },
  });
  if (!site || site.status !== "active") {
    throw new Error(`Missing active staging site ${SITE_CODE}.`);
  }

  const admin = await prisma.admin.findUnique({
    where: { username: ADMIN_USERNAME },
    select: {
      username: true,
      role: true,
      status: true,
      siteAccesses: {
        where: { siteId: site.id },
        select: { role: true, permissions: true },
      },
    },
  });
  if (!admin || admin.status !== "active") {
    throw new Error(`Missing staging demo admin ${ADMIN_USERNAME}.`);
  }
  if (!["super_admin", "owner"].includes(admin.role) && admin.siteAccesses.length === 0) {
    throw new Error(`Staging demo admin ${ADMIN_USERNAME} has no access to site ${SITE_CODE}.`);
  }

  const member = await prisma.user.findFirst({
    where: { siteId: site.id, username: DEMO_MEMBER_USERNAME },
    select: { username: true, status: true, walletAccount: { select: { currency: true } } },
  });
  if (!member || member.status !== "active") {
    throw new Error(`Missing active staging demo user ${DEMO_MEMBER_USERNAME}.`);
  }
  if (!member.walletAccount) {
    throw new Error(`Staging demo user ${DEMO_MEMBER_USERNAME} is missing a wallet account.`);
  }

  const counts = {
    siteBankAccounts: await prisma.siteBankAccount.count({ where: { siteId: site.id, status: "active" } }),
    gameProviders: await prisma.gameProvider.count({ where: { status: "active" } }),
    games: await prisma.game.count({ where: { status: "active" } }),
    siteGameConfigs: await prisma.siteGameProviderConfig.count({ where: { siteId: site.id } }),
    paymentConfigs: await prisma.sitePaymentConfig.count({ where: { siteId: site.id } }),
    promotions: await prisma.promotion.count({ where: { siteId: site.id, status: "active" } }),
  };

  for (const [label, count] of Object.entries(counts)) {
    if (count < 1) throw new Error(`Missing staging demo data for ${label}.`);
  }

  console.log(`Demo site: PASS (${site.code})`);
  console.log(`Demo admin: PASS (${admin.username}, role=${admin.role})`);
  console.log(`Demo user: PASS (${member.username}, wallet=${member.walletAccount.currency})`);
  console.log(
    `Demo fixtures: PASS (${counts.siteBankAccounts} bank accounts, ${counts.gameProviders} providers, ${counts.games} games, ${counts.promotions} promotions)`
  );
}

async function main() {
  try {
    assertStagingSafety({ label: "Staging DB check safety guard" });
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB connection: PASS");
    await assertTablesExist();
    await assertDemoDataReady();
    console.log("Response/output safety: PASS");
    console.log("Staging DB check: PASS");
  } catch (error) {
    console.error("Staging DB check: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
