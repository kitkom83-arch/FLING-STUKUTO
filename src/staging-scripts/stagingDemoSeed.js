require("dotenv").config();

const { PrismaClient, Prisma } = require("@prisma/client");
const { evaluateStagingSafety } = require("./stagingSafety");
const { hashPassword } = require("../utils/password");

const prisma = new PrismaClient();
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const DEMO_ADMIN_ROLE = "super_admin";
const DEFAULT_NO_PERMISSION_ROLE = "no_permission_admin";
const DEFAULT_SAFE_ROLE = "staging_safe_role";
const SAFE_ROLE_PERMISSIONS = ["wheel.view", "wheel.reports.view"];
const WHEEL_CAMPAIGN_ID = "wheel_main";
const DEMO_MEMBER_POINTS = "360.00";
const DEMO_MEMBER_BALANCE = "180.00";

function envValue(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function printSafeBoundary() {
  console.log("no production DB used");
  console.log("no real provider/payment/bank/SMS/Slip OCR used");
  console.log("no real money payout");
}

function skipSafe(reason) {
  console.log("Staging demo admin seed: SKIP-SAFE");
  console.log(`reason: ${reason}`);
  printSafeBoundary();
}

function fail(reason) {
  console.error("Staging demo admin seed: FAIL");
  console.error(reason);
  printSafeBoundary();
  process.exitCode = 1;
}

function assertExplicitStagingEnv() {
  const appEnv = envValue("APP_ENV").toLowerCase();
  if (appEnv !== "staging") {
    throw new Error("APP_ENV must be staging before demo admin seed can write data.");
  }
}

function validateDemoAdminEnv() {
  const email = envValue("STAGING_DEMO_ADMIN_EMAIL").toLowerCase();
  const password = envValue("STAGING_DEMO_ADMIN_PASSWORD");

  if (!email || !password) {
    return {
      ok: false,
      reason: "missing STAGING_DEMO_ADMIN_EMAIL or STAGING_DEMO_ADMIN_PASSWORD env",
    };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("STAGING_DEMO_ADMIN_EMAIL must be an email-form login identifier.");
  }
  return { ok: true, email, password };
}

function validateDemoMemberEnv() {
  const username = envValue("STAGING_DEMO_MEMBER_USERNAME");
  const phone = envValue("STAGING_DEMO_MEMBER_PHONE");
  const password = envValue("STAGING_DEMO_MEMBER_PASSWORD");

  if (!username || !phone || !password) {
    return {
      ok: false,
      reason: "missing STAGING_DEMO_MEMBER_USERNAME, STAGING_DEMO_MEMBER_PHONE, or STAGING_DEMO_MEMBER_PASSWORD env",
    };
  }
  if (/^\d+$/.test(phone) || /^0[89]\d{8}$/.test(phone) || !/(demo|staging|test)/i.test(phone)) {
    throw new Error("STAGING_DEMO_MEMBER_PHONE must be a non-real staging/test/demo login value.");
  }
  if (!username || username.length > 64) {
    throw new Error("STAGING_DEMO_MEMBER_USERNAME must be 1-64 characters when provided.");
  }
  return { ok: true, username, phone, password };
}

function fixtureIdentifier(emailKey, usernameKey) {
  return {
    email: envValue(emailKey).toLowerCase(),
    username: envValue(usernameKey).toLowerCase(),
  };
}

function hasProductionLikeMarker(value) {
  const tokens = String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return tokens.some((token) => ["prod", "production", "live", "real", "customer", "main", "master"].includes(token));
}

function hasSafeFixtureMarker(value) {
  return /(staging|stage|demo|test|sandbox|qa|uat)/i.test(String(value || ""));
}

function validateFixtureIdentifier(label, identifier) {
  const value = identifier.email || identifier.username;
  if (!value) return null;
  if (identifier.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier.email)) {
    throw new Error(`${label} email must be an email-form staging/demo/test login identifier.`);
  }
  if (identifier.username && (identifier.username.length > 128 || /\s/.test(identifier.username))) {
    throw new Error(`${label} username must be 1-128 characters without whitespace.`);
  }
  if (!hasSafeFixtureMarker(value) || hasProductionLikeMarker(value)) {
    throw new Error(`${label} identifier must be staging/demo/test only and must not look production/live/customer-like.`);
  }
  return value;
}

function validateSafeRoleName() {
  const role = (envValue("STAGING_SAFE_ROLE_NAME") || DEFAULT_SAFE_ROLE).toLowerCase();
  if (!/^[a-z0-9_:-]{3,64}$/.test(role)) {
    throw new Error("STAGING_SAFE_ROLE_NAME must be 3-64 safe characters.");
  }
  if (role === "owner" || role === "super_admin" || role === "admin.manage") {
    throw new Error("STAGING_SAFE_ROLE_NAME must not be owner, super_admin, or admin.manage.");
  }
  if (!hasSafeFixtureMarker(role) || hasProductionLikeMarker(role)) {
    throw new Error("STAGING_SAFE_ROLE_NAME must be staging/demo/test only and must not look production/live/customer-like.");
  }
  return role;
}

function fixturePassword(name) {
  return envValue(name);
}

function limitedFixtureEnv() {
  const identifier = fixtureIdentifier("STAGING_NO_PERMISSION_ADMIN_EMAIL", "STAGING_NO_PERMISSION_ADMIN_USERNAME");
  const username = validateFixtureIdentifier("STAGING_NO_PERMISSION_ADMIN", identifier);
  const password = fixturePassword("STAGING_NO_PERMISSION_ADMIN_PASSWORD");
  if (!username || !password) {
    return {
      ok: false,
      reason: "missing STAGING_NO_PERMISSION_ADMIN_EMAIL/USERNAME or STAGING_NO_PERMISSION_ADMIN_PASSWORD env",
    };
  }
  return { ok: true, username, password, role: DEFAULT_NO_PERMISSION_ROLE, permissions: [] };
}

function safeRoleFixtureEnv() {
  const role = validateSafeRoleName();
  const identifier = fixtureIdentifier("STAGING_SAFE_ROLE_ADMIN_EMAIL", "STAGING_SAFE_ROLE_ADMIN_USERNAME");
  const username = validateFixtureIdentifier("STAGING_SAFE_ROLE_ADMIN", identifier);
  const password = fixturePassword("STAGING_SAFE_ROLE_ADMIN_PASSWORD");
  if (!username || !password) {
    return {
      ok: false,
      reason: "missing STAGING_SAFE_ROLE_ADMIN_EMAIL/USERNAME or STAGING_SAFE_ROLE_ADMIN_PASSWORD env",
    };
  }
  return { ok: true, username, password, role, permissions: SAFE_ROLE_PERMISSIONS };
}

function isSeedEnabled() {
  const raw = envValue("STAGING_DEMO_SEED_ENABLED");
  if (!raw) return true;
  return ["1", "true", "yes", "enabled"].includes(raw.toLowerCase());
}

async function loadTargetSites() {
  const primary = await prisma.site.findUnique({
    where: { code: SITE_CODE },
    select: { id: true, code: true, status: true },
  });
  if (!primary || primary.status !== "active") {
    throw new Error(`Missing active staging site ${SITE_CODE}. Run guarded staging DB seed before demo admin seed.`);
  }

  const sites = await prisma.site.findMany({
    where: { status: "active" },
    select: { id: true, code: true },
    orderBy: { code: "asc" },
  });
  return sites.length ? sites : [primary];
}

async function upsertDemoAdmin(email, password) {
  const passwordHash = await hashPassword(password);
  return prisma.admin.upsert({
    where: { username: email },
    update: {
      passwordHash,
      role: DEMO_ADMIN_ROLE,
      status: "active",
    },
    create: {
      username: email,
      passwordHash,
      role: DEMO_ADMIN_ROLE,
      status: "active",
    },
  });
}

async function grantSiteAccess(admin, sites) {
  for (const site of sites) {
    await prisma.adminSiteAccess.upsert({
      where: { adminId_siteId: { adminId: admin.id, siteId: site.id } },
      update: {
        role: DEMO_ADMIN_ROLE,
        permissions: { all: true, stagingDemoAdmin: true },
      },
      create: {
        adminId: admin.id,
        siteId: site.id,
        role: DEMO_ADMIN_ROLE,
        permissions: { all: true, stagingDemoAdmin: true },
      },
    });
  }
}

async function upsertLimitedAdminFixture(site, fixture) {
  const passwordHash = await hashPassword(fixture.password);
  const admin = await prisma.admin.upsert({
    where: { username: fixture.username },
    update: {
      passwordHash,
      role: fixture.role,
      status: "active",
    },
    create: {
      username: fixture.username,
      passwordHash,
      role: fixture.role,
      status: "active",
    },
  });

  await prisma.adminSiteAccess.upsert({
    where: { adminId_siteId: { adminId: admin.id, siteId: site.id } },
    update: {
      role: fixture.role,
      permissions: fixture.permissions,
    },
    create: {
      adminId: admin.id,
      siteId: site.id,
      role: fixture.role,
      permissions: fixture.permissions,
    },
  });

  return admin;
}

function decimal(value) {
  return new Prisma.Decimal(value);
}

async function upsertStagingWheelFixtures(site) {
  await prisma.wheelCampaign.upsert({
    where: { id: WHEEL_CAMPAIGN_ID },
    update: {
      siteId: site.id,
      name: "Staging Mock Lucky Wheel",
      status: "active",
      costType: "point",
      costAmount: decimal("0.00"),
      dailySpinLimit: 3,
      monthlySpinLimit: null,
      startAt: null,
      endAt: null,
      rulesText: "Staging demo rewards only. No real payout.",
      showHistory: true,
      maxWheelCredit: null,
      minDepositRequired: null,
      minTurnoverRequired: null,
    },
    create: {
      id: WHEEL_CAMPAIGN_ID,
      siteId: site.id,
      name: "Staging Mock Lucky Wheel",
      status: "active",
      costType: "point",
      costAmount: decimal("0.00"),
      dailySpinLimit: 3,
      monthlySpinLimit: null,
      startAt: null,
      endAt: null,
      rulesText: "Staging demo rewards only. No real payout.",
      showHistory: true,
      maxWheelCredit: null,
      minDepositRequired: null,
      minTurnoverRequired: null,
    },
  });

  const rewards = [
    {
      id: "wheel_reward_1",
      label: "Mock Credit 10",
      rewardType: "credit",
      rewardValue: "10.00",
      displayValue: "10 mock credit",
      probabilityWeight: 30,
      segmentColor: "#2563eb",
      sortOrder: 1,
    },
    {
      id: "wheel_reward_2",
      label: "Mock Points 20",
      rewardType: "point",
      rewardValue: "20.00",
      displayValue: "20 points",
      probabilityWeight: 20,
      segmentColor: "#16a34a",
      sortOrder: 2,
    },
    {
      id: "wheel_reward_3",
      label: "Try Again",
      rewardType: "no_reward",
      rewardValue: "0.00",
      displayValue: "Try again",
      probabilityWeight: 50,
      segmentColor: "#64748b",
      sortOrder: 3,
    },
  ];

  for (const reward of rewards) {
    await prisma.wheelReward.upsert({
      where: { id: reward.id },
      update: {
        campaignId: WHEEL_CAMPAIGN_ID,
        label: reward.label,
        rewardType: reward.rewardType,
        rewardValue: decimal(reward.rewardValue),
        displayValue: reward.displayValue,
        probabilityWeight: reward.probabilityWeight,
        stockLimit: null,
        segmentColor: reward.segmentColor,
        imageUrl: null,
        sortOrder: reward.sortOrder,
        status: "active",
      },
      create: {
        id: reward.id,
        campaignId: WHEEL_CAMPAIGN_ID,
        label: reward.label,
        rewardType: reward.rewardType,
        rewardValue: decimal(reward.rewardValue),
        displayValue: reward.displayValue,
        probabilityWeight: reward.probabilityWeight,
        stockLimit: null,
        stockUsed: 0,
        segmentColor: reward.segmentColor,
        imageUrl: null,
        sortOrder: reward.sortOrder,
        status: "active",
      },
    });
  }
}

async function upsertDemoMember(site, demoMember) {
  const passwordHash = await hashPassword(demoMember.password);
  const memberData = {
    siteId: site.id,
    username: demoMember.username,
    phone: demoMember.phone,
    passwordHash,
    status: "active",
    points: decimal(DEMO_MEMBER_POINTS),
    referralSource: "staging-demo-member",
    acceptBonus: false,
    acceptTerms: true,
    rank: "Staging Demo",
  };

  return prisma.$transaction(async (tx) => {
    const existingMatches = await tx.user.findMany({
      where: {
        siteId: site.id,
        OR: [{ phone: demoMember.phone }, { username: demoMember.username }],
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    const distinctIds = [...new Set(existingMatches.map((row) => row.id))];
    if (distinctIds.length > 1) {
      throw new Error(
        "Staging demo member username and phone match different existing users. Resolve the duplicate staging fixture before seeding."
      );
    }

    const member = distinctIds.length
      ? await tx.user.update({
          where: { id: distinctIds[0] },
          data: memberData,
        })
      : await tx.user.create({
          data: memberData,
        });

    await tx.walletAccount.upsert({
      where: { userId: member.id },
      update: {
        siteId: site.id,
        balance: decimal(DEMO_MEMBER_BALANCE),
        currency: "THB",
      },
      create: {
        siteId: site.id,
        userId: member.id,
        balance: decimal(DEMO_MEMBER_BALANCE),
        currency: "THB",
      },
    });

    await tx.pointLedger.upsert({
      where: { id: `staging-demo-member-points-${site.code.toLowerCase()}` },
      update: {
        siteId: site.id,
        userId: member.id,
        before: decimal("0.00"),
        amount: decimal(DEMO_MEMBER_POINTS),
        after: decimal(DEMO_MEMBER_POINTS),
        reason: "Staging demo member points",
        referenceType: "staging_demo_seed",
        referenceId: `staging-demo-member-points-${site.code}`,
        createdByType: "system",
        createdById: null,
      },
      create: {
        id: `staging-demo-member-points-${site.code.toLowerCase()}`,
        siteId: site.id,
        userId: member.id,
        before: decimal("0.00"),
        amount: decimal(DEMO_MEMBER_POINTS),
        after: decimal(DEMO_MEMBER_POINTS),
        reason: "Staging demo member points",
        referenceType: "staging_demo_seed",
        referenceId: `staging-demo-member-points-${site.code}`,
        createdByType: "system",
        createdById: null,
      },
    });

    await tx.memberReward.deleteMany({
      where: {
        siteId: site.id,
        memberId: member.id,
        source: "wheel",
      },
    });
    await tx.wheelSpin.deleteMany({
      where: {
        siteId: site.id,
        memberId: member.id,
        campaignId: WHEEL_CAMPAIGN_ID,
      },
    });

    return member;
  });
}

async function writeAuditLog(admin, site) {
  await prisma.adminLog.create({
    data: {
      siteId: site.id,
      adminId: admin.id,
      action: "staging.demo_admin.seed",
      targetType: "admin",
      targetId: admin.id,
      metadata: {
        source: "stagingDemoSeed",
        role: DEMO_ADMIN_ROLE,
        siteCode: site.code,
        sanitized: true,
      },
      beforeJson: null,
      afterJson: {
        adminId: admin.id,
        username: admin.username,
        role: DEMO_ADMIN_ROLE,
        status: "active",
        credentialValuesPrinted: false,
      },
      ipAddress: null,
      userAgent: null,
    },
  });
}

async function main() {
  const earlySafety = evaluateStagingSafety(process.env, {
    requireDatabaseUrl: false,
    allowSkipSafe: true,
  });

  if (earlySafety.failed) {
    fail(`Staging demo admin seed safety guard blocked this command.\n- ${earlySafety.failReasons.join("\n- ")}`);
    return;
  }

  console.log("Staging demo admin seed safety guard: PASS");
  console.log("Target accepted as staging/test only. Sensitive values were not printed.");

  if (!isSeedEnabled()) {
    skipSafe("STAGING_DEMO_SEED_ENABLED is not enabled");
    return;
  }

  let demoAdmin;
  let demoMember;
  let noPermissionFixture;
  let safeRoleFixture;
  try {
    demoAdmin = validateDemoAdminEnv();
    demoMember = validateDemoMemberEnv();
    noPermissionFixture = limitedFixtureEnv();
    safeRoleFixture = safeRoleFixtureEnv();
  } catch (error) {
    fail(error.message);
    return;
  }

  if (!demoAdmin.ok) {
    skipSafe(demoAdmin.reason);
    return;
  }
  if (!demoMember.ok) {
    fail(demoMember.reason);
    return;
  }

  try {
    assertExplicitStagingEnv();
  } catch (error) {
    fail(error.message);
    return;
  }

  const writeSafety = evaluateStagingSafety(process.env, {
    allowSkipSafe: true,
  });
  if (writeSafety.failed) {
    fail(`Staging demo admin seed DB safety guard blocked this command.\n- ${writeSafety.failReasons.join("\n- ")}`);
    return;
  }
  if (writeSafety.skipped) {
    skipSafe(writeSafety.skipReasons.join("; "));
    return;
  }

  try {
    const sites = await loadTargetSites();
    const admin = await upsertDemoAdmin(demoAdmin.email, demoAdmin.password);
    await grantSiteAccess(admin, sites);
    const primarySite = sites.find((site) => site.code === SITE_CODE) || sites[0];
    await upsertStagingWheelFixtures(primarySite);
    await upsertDemoMember(primarySite, demoMember);
    if (noPermissionFixture.ok) {
      await upsertLimitedAdminFixture(primarySite, noPermissionFixture);
      console.log("no-permission admin fixture: PASS");
    } else {
      console.log("no-permission admin fixture: SKIP-SAFE");
      console.log(`reason: ${noPermissionFixture.reason}`);
    }
    if (safeRoleFixture.ok) {
      await upsertLimitedAdminFixture(primarySite, safeRoleFixture);
      console.log("safe role/admin fixture: PASS");
    } else {
      console.log("safe role/admin fixture: SKIP-SAFE");
      console.log(`reason: ${safeRoleFixture.reason}`);
    }
    await writeAuditLog(admin, primarySite);

    console.log(`Demo admin: PASS (${admin.username}, role=${DEMO_ADMIN_ROLE})`);
    console.log(`Demo admin site access: PASS (${sites.length} active staging site(s))`);
    console.log(`Demo wheel fixtures: PASS (${WHEEL_CAMPAIGN_ID})`);
    console.log(`Demo member: PASS (site=${primarySite.code})`);
    console.log("Demo admin audit log: PASS");
    printSafeBoundary();
    console.log("Staging demo admin seed: PASS");
  } catch (error) {
    fail(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
