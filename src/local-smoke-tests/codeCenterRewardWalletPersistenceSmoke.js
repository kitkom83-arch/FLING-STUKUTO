require("dotenv").config();

const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const codeCenter = require("../services/codeCenter.service");
const rewardWallet = require("../services/memberRewardWallet.service");
const { createCodeCenterPrismaStore } = require("../services/codeCenterPrismaStore");
const { createMemberRewardPrismaStore } = require("../services/memberRewardPrismaStore");

const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];

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

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function isLoopbackHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) return { ok: false, reason: "database URL must be set. Value is not printed." };
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, reason: "database URL must use PostgreSQL. Value is not printed." };
  }
  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return { ok: false, reason: "database URL appears production-like and is blocked. Value is not printed." };
  }
  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return { ok: false, reason: "database URL must target local/staging/test PostgreSQL. Value is not printed." };
  }
  return { ok: true, reason: null };
}

function secretScanPattern() {
  const authScheme = ["B", "earer"].join("");
  const cloudKeyPrefix = ["s", "k"].join("") + "-";
  const jwtLike = "[A-Za-z0-9_-]{20,}\\\\.[A-Za-z0-9_-]{20,}\\\\.[A-Za-z0-9_-]{20,}";
  return new RegExp(
    [
      `${authScheme}\\\\s+[^\\\\s\\"]+`,
      "postgres(?:ql)?:\\\\/\\\\/[^\\\\s\\\"]+",
      `${cloudKeyPrefix}[A-Za-z0-9_-]{12,}`,
      jwtLike,
      ["pass", "word"].join(""),
      ["client", "Secret"].join(""),
      ["client", "_secret"].join(""),
      ["author", "ization"].join(""),
    ].join("|"),
    "i"
  );
}

function assertNoSecretShape(value, label) {
  const text = JSON.stringify(value);
  assert(!secretScanPattern().test(text), `${label} leaked secret-shaped data`);
}

async function expectReject(fn, statusCode, label) {
  try {
    await fn();
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode, label);
    return error;
  }
  throw new Error(`${label} did not reject`);
}

async function seedSiteAndMembers(prisma, siteId, memberIds) {
  await prisma.site.upsert({
    where: { code: siteId },
    create: {
      id: siteId,
      code: siteId,
      name: "Code Center Persistence Smoke",
      brandName: "PG77 Smoke",
      status: "active",
    },
    update: { status: "active" },
  });

  for (const memberId of memberIds) {
    await prisma.user.upsert({
      where: { id: memberId },
      create: {
        id: memberId,
        siteId,
        username: memberId,
        phone: memberId,
        passwordHash: "local-smoke-hash",
        status: "active",
      },
      update: { status: "active" },
    });
  }
}

async function cleanup(prisma, siteId) {
  await prisma.codeRedeemLog.deleteMany({ where: { siteId } });
  await prisma.memberRewardWalletEntry.deleteMany({ where: { siteId } });
  await prisma.codeCenterCode.deleteMany({ where: { siteId } });
  await prisma.codeCampaign.deleteMany({ where: { siteId } });
  await prisma.user.deleteMany({ where: { siteId } });
  await prisma.site.deleteMany({ where: { id: siteId } });
}

async function run() {
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  if (!databaseTarget.ok) throw new Error(databaseTarget.reason);

  const prisma = new PrismaClient({ log: ["error"] });
  const siteId = "site_code_center_persist_smoke";
  const admin = { id: "admin_code_center_persist", username: "persist-admin", role: "owner" };
  const rewardCases = [
    { name: "Persist Coupon", type: "coupon", memberId: "member_persist_coupon", amount: 1, key: "couponCount" },
    { name: "Persist Diamond", type: "diamond", memberId: "member_persist_diamond", amount: 25, key: "diamondBalance" },
    { name: "Persist Box", type: "box", memberId: "member_persist_box", amount: 1, key: "boxCount" },
    { name: "Persist Pending", type: "pending_reward", memberId: "member_persist_pending", amount: 50, key: "pendingRewardCount" },
  ];

  try {
    await cleanup(prisma, siteId);
    await seedSiteAndMembers(
      prisma,
      siteId,
      rewardCases.map((item) => item.memberId)
    );

    codeCenter.configureStoreForSmoke(createCodeCenterPrismaStore(prisma));
    rewardWallet.configureStoreForSmoke(createMemberRewardPrismaStore(prisma));

    for (const item of rewardCases) {
      const campaignResult = await codeCenter.createCampaign({
        siteId,
        admin,
        body: {
          name: item.name,
          status: "active",
          reward: {
            type: item.type,
            amount: item.amount,
            label: `${item.type} persisted reward`,
            metadata: { smokeNote: "safe persistence smoke" },
          },
        },
      });
      const codeResult = await codeCenter.generateCodes({
        siteId,
        campaignId: campaignResult.campaign.id,
        admin,
        body: { count: 1, prefix: item.type.slice(0, 4) },
      });
      const redeemResult = await codeCenter.redeemCode({
        siteId,
        userId: item.memberId,
        body: { code: codeResult.codes[0].code },
      });
      assert.strictEqual(redeemResult.reward.type, item.type, `${item.type} reward type`);
      assert.strictEqual(redeemResult.cashWalletMutation, false, `${item.type} must not mutate cash wallet`);

      await expectReject(
        () => codeCenter.redeemCode({ siteId, userId: item.memberId, body: { code: codeResult.codes[0].code } }),
        409,
        `${item.type} duplicate redeem must fail after write`
      );
    }

    codeCenter.configureStoreForSmoke(createCodeCenterPrismaStore(prisma));
    rewardWallet.configureStoreForSmoke(createMemberRewardPrismaStore(prisma));

    const logs = await codeCenter.listRedeemLogs({ siteId });
    assert.strictEqual(logs.redeemLogs.length, rewardCases.length, "redeem logs must persist");
    assertNoSecretShape(logs, "persisted redeem logs");

    for (const item of rewardCases) {
      const summary = await rewardWallet.summary({ siteId, memberId: item.memberId });
      if (item.type === "diamond") {
        assert.strictEqual(summary[item.key], item.amount, `${item.type} persisted summary amount`);
      } else {
        assert.strictEqual(summary[item.key], 1, `${item.type} persisted summary count`);
      }
      assert.strictEqual(summary.cashWalletMutation, false, `${item.type} summary must not mutate cash wallet`);
      const history = await rewardWallet.history({ siteId, memberId: item.memberId });
      assert.strictEqual(history.history.length, 1, `${item.type} persisted history`);
      assert.strictEqual(history.history[0].source, "code_center", `${item.type} source persisted`);
      assertNoSecretShape(history, `${item.type} persisted history`);
    }

    await expectReject(
      () =>
        codeCenter.createCampaign({
          siteId,
          admin,
          body: { name: "Cash Credit Block Persist", status: "active", reward: { type: "cash_credit", amount: 10 } },
        }),
      422,
      "cash_credit must remain blocked"
    );

    console.log("CODE_CENTER_REWARD_WALLET_PERSISTENCE_SMOKE_PASS");
  } finally {
    codeCenter.configureStoreForSmoke(null);
    rewardWallet.configureStoreForSmoke(null);
    await cleanup(prisma, siteId).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
