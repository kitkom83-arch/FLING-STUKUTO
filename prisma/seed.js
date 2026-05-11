require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const MOCK_CONFIG_PLACEHOLDER = "MOCK_ONLY_PLACEHOLDER_NOT_A_CREDENTIAL";
const LOCAL_PROMOTION_SMOKE_ID = "local_mock_promotion_claim_smoke";

function decimal(value) {
  return new Prisma.Decimal(value);
}

function demoAccountNumber(siteCode, suffix) {
  const siteDigits = String(siteCode || "")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
  return `0000${siteDigits}${suffix}`;
}

function mockPlaceholder(siteCode, scope, providerCode) {
  return `${MOCK_CONFIG_PLACEHOLDER}_${siteCode}_${scope}_${providerCode || "DEMO"}`;
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function assertSafeDatabaseTarget() {
  const rawUrl = process.env.DATABASE_URL;
  const appEnv = String(process.env.APP_ENV || "local-test").trim().toLowerCase();
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  let parsed;

  try {
    parsed = rawUrl ? new URL(rawUrl) : null;
  } catch (_error) {
    parsed = null;
  }

  if (!parsed) {
    throw new Error("Seed blocked: DATABASE_URL must be set to a safe local/staging/test PostgreSQL target. Value is not printed.");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("Seed blocked: DATABASE_URL must use PostgreSQL. Value is not printed.");
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    throw new Error("Seed blocked: DATABASE_URL appears production-like. Value is not printed.");
  }

  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!isLoopbackHost(parsed.hostname) && !hasSafeMarker) {
    throw new Error("Seed blocked: DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.");
  }

  if (["prod", "production", "live"].includes(appEnv)) {
    throw new Error("Seed blocked: APP_ENV production/live is not allowed for demo seed.");
  }

  if (nodeEnv === "production" && !["staging", "stage", "test", "testing", "qa", "sandbox"].includes(appEnv)) {
    throw new Error("Seed blocked: NODE_ENV=production requires APP_ENV to be an explicit staging/test label.");
  }

  if (appEnv === "staging" && !process.env.LOCAL_ADMIN_PASSWORD && !process.env.STAGING_DEMO_ADMIN_PASSWORD) {
    throw new Error("Seed blocked: staging demo admin password env must be set. Value is not printed.");
  }
}

function requiredPasswordEnv(names, label) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.length > 0) return value;
  }
  throw new Error(`${label} password env must be set for demo seed. Value is not printed.`);
}

const SITE_DEFS = [
  {
    id: "site_pg77",
    code: "PG77",
    name: "PG77",
    brandName: "PG77",
    domains: ["localhost:4000", "pg77.localhost"],
    theme: {
      primaryColor: "#ff5aa5",
      secondaryColor: "#54c7ff",
      backgroundColor: "#fff5fb",
      logoUrl: "/assets/pg77-logo.png",
    },
    demoMember: {
      phone: "0800000000",
      username: "ima00180",
      balance: "11.09",
      points: "47.00",
      rank: "Mermaid Demo",
    },
  },
  {
    id: "site_site2",
    code: "SITE2",
    name: "SITE2",
    brandName: "SITE2 Demo",
    domains: ["site2.localhost"],
    theme: {
      primaryColor: "#111111",
      secondaryColor: "#d6a935",
      backgroundColor: "#f7f1df",
      logoUrl: "/assets/site2-logo.png",
    },
    demoMember: {
      phone: "0800000002",
      username: "site2demo",
      balance: "25.00",
      points: "10.00",
      rank: "demo",
    },
  },
  {
    id: "site_site3",
    code: "SITE3",
    name: "SITE3",
    brandName: "SITE3 Blue",
    domains: ["site3.localhost"],
    theme: { primaryColor: "#0b63ce", secondaryColor: "#66d9ff", backgroundColor: "#eef6ff" },
  },
  {
    id: "site_site4",
    code: "SITE4",
    name: "SITE4",
    brandName: "SITE4 Green",
    domains: ["site4.localhost"],
    theme: { primaryColor: "#148c52", secondaryColor: "#b6e36b", backgroundColor: "#f1fff6" },
  },
  {
    id: "site_site5",
    code: "SITE5",
    name: "SITE5",
    brandName: "SITE5 Red Gold",
    domains: ["site5.localhost"],
    theme: { primaryColor: "#c81e1e", secondaryColor: "#f7c948", backgroundColor: "#fff6f2" },
  },
  {
    id: "site_site6",
    code: "SITE6",
    name: "SITE6",
    brandName: "SITE6 Purple",
    domains: ["site6.localhost"],
    theme: { primaryColor: "#7c3aed", secondaryColor: "#f0abfc", backgroundColor: "#fbf5ff" },
  },
];

const PROVIDERS = {
  PG: "PG Soft",
  JILI: "JILI",
  PRAGMATIC: "Pragmatic Play",
  EVO: "Evolution",
  JOKER: "Joker Gaming",
};

const GAMES = [
  ["PG", "fortune_tiger", "Fortune Tiger", "slot"],
  ["PG", "fortune_rabbit", "Fortune Rabbit", "slot"],
  ["JILI", "mahjong_ways", "Mahjong Ways", "slot"],
  ["PRAGMATIC", "sweet_bonanza", "Sweet Bonanza", "slot"],
  ["EVO", "baccarat_mock", "Baccarat Mock", "live"],
  ["JOKER", "joker_treasure_mock", "Joker Treasure Mock", "slot"],
];

async function upsertSite(def) {
  const site = await prisma.site.upsert({
    where: { code: def.code },
    update: {
      name: def.name,
      brandName: def.brandName,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
    create: {
      id: def.id,
      code: def.code,
      name: def.name,
      brandName: def.brandName,
      status: "active",
      defaultLanguage: "th",
      currency: "THB",
      timezone: "Asia/Bangkok",
    },
  });

  for (const [index, domain] of def.domains.entries()) {
    await prisma.siteDomain.upsert({
      where: { domain },
      update: { siteId: site.id, isPrimary: index === 0, status: "active" },
      create: {
        id: `domain_${def.code.toLowerCase()}_${index}`,
        siteId: site.id,
        domain,
        isPrimary: index === 0,
        status: "active",
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { siteId: site.id },
    update: {
      lineUrl: `https://line.example/${def.code.toLowerCase()}`,
      telegramUrl: `https://t.me/${def.code.toLowerCase()}_support`,
      customerServiceUrl: `https://support.example/${def.code.toLowerCase()}`,
      announcement: `${def.brandName} demo environment`,
      maintenanceMode: false,
      metadata: { seed: true },
    },
    create: {
      siteId: site.id,
      lineUrl: `https://line.example/${def.code.toLowerCase()}`,
      telegramUrl: `https://t.me/${def.code.toLowerCase()}_support`,
      customerServiceUrl: `https://support.example/${def.code.toLowerCase()}`,
      announcement: `${def.brandName} demo environment`,
      maintenanceMode: false,
      metadata: { seed: true },
    },
  });

  await prisma.siteTheme.upsert({
    where: { siteId: site.id },
    update: { ...def.theme, layoutMode: "default", customCss: null },
    create: { siteId: site.id, ...def.theme, layoutMode: "default", customCss: null },
  });

  await upsertSiteBankAccounts(site, def);
  await upsertSiteGameProviders(site, def);
  await upsertSitePaymentConfig(site, def);
  await upsertPromotions(site, def);

  return site;
}

async function upsertSiteBankAccounts(site, def) {
  const accounts = [
    {
      type: "deposit",
      bankCode: "KBANK",
      bankName: "Kasikorn Bank",
      accountName: `${def.brandName} Deposit`,
      accountNumber: demoAccountNumber(site.code, "01"),
      legacyAccountNumber: `${site.code}001001`,
      phone: "0800000000",
      isDefault: true,
    },
    {
      type: "withdraw",
      bankCode: "SCB",
      bankName: "Siam Commercial Bank",
      accountName: `${def.brandName} Withdraw`,
      accountNumber: demoAccountNumber(site.code, "02"),
      legacyAccountNumber: `${site.code}002002`,
      phone: "0800000000",
      isDefault: false,
    },
  ];

  for (const account of accounts) {
    const existing = await prisma.siteBankAccount.findFirst({
      where: {
        siteId: site.id,
        type: account.type,
        bankCode: account.bankCode,
        OR: [{ accountNumber: account.accountNumber }, { accountNumber: account.legacyAccountNumber }],
      },
    });
    const { legacyAccountNumber, ...accountData } = account;
    const data = { ...accountData, status: "active", metadata: { seed: true, mock: true, manualOnly: true } };
    if (existing) {
      await prisma.siteBankAccount.update({ where: { id: existing.id }, data });
    } else {
      await prisma.siteBankAccount.create({ data: { siteId: site.id, ...data } });
    }
  }
}

async function upsertSiteGameProviders(site, def) {
  const activeProviders = ["PG", "JILI", "PRAGMATIC", "EVO", "JOKER"];
  for (const providerCode of activeProviders) {
    await prisma.siteGameProviderConfig.upsert({
      where: { siteId_providerCode: { siteId: site.id, providerCode } },
      update: {
        displayName: PROVIDERS[providerCode],
        status: providerCode === "PG" || providerCode === "JILI" ? "active" : "inactive",
        agentCode: `${site.code}_${providerCode}_AGENT`,
        apiBaseUrl: "https://mock-game-provider.local/api",
        apiKeyEncrypted: mockPlaceholder(site.code, "GAME_API_KEY", providerCode),
        secretEncrypted: mockPlaceholder(site.code, "GAME_SECRET", providerCode),
        callbackPath: `/api/game/callback/${site.code.toLowerCase()}/${providerCode.toLowerCase()}`,
        walletMode: "transfer",
        metadata: { seed: true, mock: true, mode: "sandbox", callsRealProvider: false },
      },
      create: {
        siteId: site.id,
        providerCode,
        displayName: PROVIDERS[providerCode],
        status: providerCode === "PG" || providerCode === "JILI" ? "active" : "inactive",
        agentCode: `${site.code}_${providerCode}_AGENT`,
        apiBaseUrl: "https://mock-game-provider.local/api",
        apiKeyEncrypted: mockPlaceholder(site.code, "GAME_API_KEY", providerCode),
        secretEncrypted: mockPlaceholder(site.code, "GAME_SECRET", providerCode),
        callbackPath: `/api/game/callback/${site.code.toLowerCase()}/${providerCode.toLowerCase()}`,
        walletMode: "transfer",
        metadata: { seed: true, mock: true, mode: "sandbox", callsRealProvider: false },
      },
    });
  }
}

async function upsertSitePaymentConfig(site) {
  await prisma.sitePaymentConfig.upsert({
    where: { siteId_providerCode: { siteId: site.id, providerCode: "MOCK_PAYMENT" } },
    update: {
      displayName: "Mock Payment",
      status: "active",
      merchantId: `${site.code}_MOCK_MERCHANT`,
      apiBaseUrl: "https://mock-payment.local/api",
      apiKeyEncrypted: mockPlaceholder(site.code, "PAYMENT_API_KEY", "MOCK_PAYMENT"),
      secretEncrypted: mockPlaceholder(site.code, "PAYMENT_SECRET", "MOCK_PAYMENT"),
      callbackPath: `/api/payment/callback/${site.code.toLowerCase()}/mock`,
      metadata: { seed: true, mock: true, mode: "sandbox", callsRealProvider: false },
    },
    create: {
      siteId: site.id,
      providerCode: "MOCK_PAYMENT",
      displayName: "Mock Payment",
      status: "active",
      merchantId: `${site.code}_MOCK_MERCHANT`,
      apiBaseUrl: "https://mock-payment.local/api",
      apiKeyEncrypted: mockPlaceholder(site.code, "PAYMENT_API_KEY", "MOCK_PAYMENT"),
      secretEncrypted: mockPlaceholder(site.code, "PAYMENT_SECRET", "MOCK_PAYMENT"),
      callbackPath: `/api/payment/callback/${site.code.toLowerCase()}/mock`,
      metadata: { seed: true, mock: true, mode: "sandbox", callsRealProvider: false },
    },
  });
}

async function upsertPromotions(site, def) {
  const promotions = [
    {
      title: `${def.brandName} No Bonus`,
      type: "none",
      bonusType: "fixed",
      bonusValue: "0.00",
      turnoverMultiplier: "0.00",
    },
    {
      title: `${def.brandName} Welcome Bonus`,
      type: "new_member",
      minDeposit: "100.00",
      maxDeposit: "1000.00",
      bonusType: "percent",
      bonusValue: "20.00",
      turnoverMultiplier: "3.00",
      maxWithdraw: "3000.00",
    },
  ];

  if (site.code === "PG77") {
    promotions.push(
      {
        title: "Daily First Deposit",
        type: "first_deposit_daily",
        minDeposit: "100.00",
        maxDeposit: "5000.00",
        bonusType: "percent",
        bonusValue: "10.00",
        turnoverMultiplier: "2.00",
        maxWithdraw: "5000.00",
      },
      {
        title: "Cashback Mock",
        type: "cashback",
        bonusType: "percent",
        bonusValue: "5.00",
        turnoverMultiplier: "1.00",
      }
    );
  }

  for (const promotion of promotions) {
    const existing = await prisma.promotion.findFirst({ where: { siteId: site.id, title: promotion.title } });
    const data = {
      ...promotion,
      siteId: site.id,
      minDeposit: promotion.minDeposit ? decimal(promotion.minDeposit) : null,
      maxDeposit: promotion.maxDeposit ? decimal(promotion.maxDeposit) : null,
      bonusValue: promotion.bonusValue ? decimal(promotion.bonusValue) : null,
      turnoverMultiplier: decimal(promotion.turnoverMultiplier),
      maxWithdraw: promotion.maxWithdraw ? decimal(promotion.maxWithdraw) : null,
      status: "active",
    };
    if (existing) {
      await prisma.promotion.update({ where: { id: existing.id }, data });
    } else {
      await prisma.promotion.create({ data });
    }
  }
}

async function upsertSmokeFixtures(site, member) {
  if (site.code !== "PG77") return;

  await prisma.promotion.upsert({
    where: { id: LOCAL_PROMOTION_SMOKE_ID },
    update: {
      siteId: site.id,
      title: "Local Mock Promotion Claim Smoke",
      type: "local_mock",
      minDeposit: decimal("100.00"),
      maxDeposit: decimal("1000.00"),
      bonusType: "fixed",
      bonusValue: decimal("25.00"),
      turnoverMultiplier: decimal("2.00"),
      maxWithdraw: decimal("500.00"),
      status: "active",
      startAt: null,
      endAt: null,
    },
    create: {
      id: LOCAL_PROMOTION_SMOKE_ID,
      siteId: site.id,
      title: "Local Mock Promotion Claim Smoke",
      type: "local_mock",
      minDeposit: decimal("100.00"),
      maxDeposit: decimal("1000.00"),
      bonusType: "fixed",
      bonusValue: decimal("25.00"),
      turnoverMultiplier: decimal("2.00"),
      maxWithdraw: decimal("500.00"),
      status: "active",
      startAt: null,
      endAt: null,
    },
  });

  if (!member) return;

  const rows = [
    {
      provider: "PG",
      gameCode: "fortune_tiger",
      betAmount: "10.00",
      winAmount: "15.50",
      profitAmount: "-5.50",
      roundId: "DEMO-PG77-PG-001",
    },
    {
      provider: "EVO",
      gameCode: "baccarat_mock",
      betAmount: "20.00",
      winAmount: "0.00",
      profitAmount: "20.00",
      roundId: "DEMO-PG77-EVO-001",
    },
  ];

  for (const row of rows) {
    const data = {
      siteId: site.id,
      userId: member.id,
      provider: row.provider,
      gameCode: row.gameCode,
      betAmount: decimal(row.betAmount),
      winAmount: decimal(row.winAmount),
      profitAmount: decimal(row.profitAmount),
      roundId: row.roundId,
    };
    const existing = await prisma.gameBetHistoryMock.findFirst({
      where: { siteId: site.id, userId: member.id, roundId: row.roundId },
    });
    if (existing) {
      await prisma.gameBetHistoryMock.update({ where: { id: existing.id }, data });
    } else {
      await prisma.gameBetHistoryMock.create({ data });
    }
  }
}

async function upsertDemoMember(site, demoMember, admin, passwordHash) {
  if (!demoMember) return null;

  const member = await prisma.user.upsert({
    where: { siteId_phone: { siteId: site.id, phone: demoMember.phone } },
    update: {
      username: demoMember.username,
      passwordHash,
      status: "active",
      points: decimal(demoMember.points),
      rank: demoMember.rank,
    },
    create: {
      siteId: site.id,
      username: demoMember.username,
      phone: demoMember.phone,
      passwordHash,
      referralSource: "seed",
      acceptBonus: false,
      acceptTerms: true,
      status: "active",
      points: decimal(demoMember.points),
      rank: demoMember.rank,
    },
  });

  await prisma.walletAccount.upsert({
    where: { userId: member.id },
    update: { siteId: site.id, balance: decimal(demoMember.balance), currency: "THB" },
    create: {
      siteId: site.id,
      userId: member.id,
      balance: decimal(demoMember.balance),
      currency: "THB",
    },
  });

  await prisma.walletLedger.upsert({
    where: { transactionId: `WLG-SEED-${site.code}` },
    update: { siteId: site.id, userId: member.id },
    create: {
      siteId: site.id,
      transactionId: `WLG-SEED-${site.code}`,
      userId: member.id,
      type: "admin_add_credit",
      amount: decimal(demoMember.balance),
      balanceBefore: decimal("0.00"),
      balanceAfter: decimal(demoMember.balance),
      referenceType: "seed",
      referenceId: `initial-member-balance-${site.code}`,
      createdByType: "admin",
      createdById: admin.id,
      note: "Initial demo balance",
    },
  });

  await prisma.pointLedger.upsert({
    where: { id: `seed-point-ledger-${site.code.toLowerCase()}` },
    update: { siteId: site.id, userId: member.id },
    create: {
      id: `seed-point-ledger-${site.code.toLowerCase()}`,
      siteId: site.id,
      userId: member.id,
      before: decimal("0.00"),
      amount: decimal(demoMember.points),
      after: decimal(demoMember.points),
      reason: "Initial demo points",
      referenceType: "seed",
      referenceId: `initial-member-points-${site.code}`,
      createdByType: "admin",
      createdById: admin.id,
    },
  });

  const accounts = [
    ["KBANK", demoAccountNumber(site.code, "11"), "1231231231", `${site.brandName} Demo`],
    ["SCB", demoAccountNumber(site.code, "12"), "9992221110", `${site.brandName} Demo Account`],
  ];

  for (const [bankCode, accountNumber, legacyAccountNumber, accountName] of accounts) {
    const existing = await prisma.userBankAccount.findFirst({
      where: {
        siteId: site.id,
        userId: member.id,
        bankCode,
        OR: [{ accountNumber }, { accountNumber: legacyAccountNumber }],
      },
    });
    const data = {
      siteId: site.id,
      userId: member.id,
      bankCode,
      accountNumber,
      accountName,
      status: "approved",
      approvedById: admin.id,
      approvedAt: new Date(),
    };
    if (existing) {
      await prisma.userBankAccount.update({ where: { id: existing.id }, data });
    } else {
      await prisma.userBankAccount.create({ data });
    }
  }

  return member;
}

async function upsertGlobalGames() {
  for (const [code, name] of Object.entries(PROVIDERS)) {
    await prisma.gameProvider.upsert({
      where: { code },
      update: { name, status: "active" },
      create: { code, name, status: "active" },
    });
  }

  for (const [providerCode, code, name, category] of GAMES) {
    const provider = await prisma.gameProvider.findUnique({ where: { code: providerCode } });
    await prisma.game.upsert({
      where: { providerCode_code: { providerCode, code } },
      update: { name, category, status: "active" },
      create: {
        providerId: provider.id,
        providerCode,
        code,
        name,
        category,
        status: "active",
      },
    });
  }
}

async function main() {
  assertSafeDatabaseTarget();

  const adminPassword = requiredPasswordEnv(["LOCAL_ADMIN_PASSWORD", "STAGING_DEMO_ADMIN_PASSWORD"], "Admin");
  const memberPassword = requiredPasswordEnv(["LOCAL_MEMBER_PASSWORD", "STAGING_DEMO_MEMBER_PASSWORD"], "Member");
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const memberPasswordHash = await bcrypt.hash(memberPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminPasswordHash, role: "super_admin", status: "active" },
    create: { username: "admin", passwordHash: adminPasswordHash, role: "super_admin", status: "active" },
  });

  await upsertGlobalGames();

  for (const def of SITE_DEFS) {
    const site = await upsertSite(def);
    await prisma.adminSiteAccess.upsert({
      where: { adminId_siteId: { adminId: admin.id, siteId: site.id } },
      update: { role: "super_admin", permissions: { all: true } },
      create: { adminId: admin.id, siteId: site.id, role: "super_admin", permissions: { all: true } },
    });
    const member = await upsertDemoMember(site, def.demoMember, admin, memberPasswordHash);
    await upsertSmokeFixtures(site, member);
  }

  console.log("Seed completed");
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error("Seed failed");
      console.error(error.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  main,
  assertSafeDatabaseTarget,
  requiredPasswordEnv,
  disconnect: () => prisma.$disconnect(),
};
