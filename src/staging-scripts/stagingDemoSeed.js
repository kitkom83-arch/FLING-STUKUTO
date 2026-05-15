require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { evaluateStagingSafety } = require("./stagingSafety");

const prisma = new PrismaClient();
const SITE_CODE = process.env.STAGING_SMOKE_SITE_CODE || "PG77";
const DEMO_ADMIN_ROLE = "super_admin";

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
  const passwordHash = await bcrypt.hash(password, 12);
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
  try {
    demoAdmin = validateDemoAdminEnv();
  } catch (error) {
    fail(error.message);
    return;
  }

  if (!demoAdmin.ok) {
    skipSafe(demoAdmin.reason);
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
    await writeAuditLog(admin, sites.find((site) => site.code === SITE_CODE) || sites[0]);

    console.log(`Demo admin: PASS (${admin.username}, role=${DEMO_ADMIN_ROLE})`);
    console.log(`Demo admin site access: PASS (${sites.length} active staging site(s))`);
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
