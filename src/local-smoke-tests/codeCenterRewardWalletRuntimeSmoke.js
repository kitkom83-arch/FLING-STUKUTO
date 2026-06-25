require("dotenv").config();

const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const codeCenterController = require("../controllers/codeCenter.controller");
const memberRewardController = require("../controllers/memberReward.controller");
const { disconnectRuntimeStores, inspectDatabaseTarget } = require("../services/codeCenterRuntimeStore");

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

function mockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return body;
    },
  };
}

async function invoke(handler, req) {
  const res = mockResponse();
  await handler(req, res);
  assert.strictEqual(res.payload && res.payload.success, true, "controller response must succeed");
  assertNoSecretShape(res.payload, "controller response");
  return res;
}

async function expectReject(fn, statusCode, label) {
  try {
    await fn();
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode, label);
    assertNoSecretShape({ message: error.message, details: error.details }, label);
    return error;
  }
  throw new Error(`${label} did not reject`);
}

async function seedSiteAndMember(prisma, siteId, memberId) {
  await prisma.site.upsert({
    where: { code: siteId },
    create: {
      id: siteId,
      code: siteId,
      name: "Code Center Runtime Smoke",
      brandName: "PG77 Runtime Smoke",
      status: "active",
    },
    update: { status: "active" },
  });
  await prisma.user.upsert({
    where: { id: memberId },
    create: {
      id: memberId,
      siteId,
      username: memberId,
      phone: memberId,
      passwordHash: "local-runtime-smoke-hash",
      status: "active",
    },
    update: { status: "active" },
  });
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

  const previousMode = process.env.CODE_CENTER_STORAGE_MODE;
  process.env.CODE_CENTER_STORAGE_MODE = "prisma";

  const prisma = new PrismaClient({ log: ["error"] });
  const siteId = "site_code_center_runtime_smoke";
  const memberId = "member_code_center_runtime";
  const admin = { id: "admin_code_center_runtime", username: "runtime-admin", role: "owner" };

  try {
    await cleanup(prisma, siteId);
    await seedSiteAndMember(prisma, siteId, memberId);

    const createResponse = await invoke(codeCenterController.adminCreateCampaign, {
      siteId,
      siteCode: siteId,
      admin,
      body: {
        name: "Runtime Coupon",
        status: "active",
        reward: {
          type: "coupon",
          amount: 1,
          label: "runtime coupon reward",
          metadata: { smokeNote: "runtime controller smoke" },
        },
      },
    });
    assert.strictEqual(createResponse.statusCode, 201, "admin create campaign status");

    const campaignId = createResponse.payload.data.campaign.id;
    const codeResponse = await invoke(codeCenterController.adminGenerateCodes, {
      siteId,
      admin,
      params: { id: campaignId },
      body: { count: 1, prefix: "rtcp" },
    });
    assert.strictEqual(codeResponse.statusCode, 201, "admin generate code status");
    const code = codeResponse.payload.data.codes[0].code;

    const redeemResponse = await invoke(codeCenterController.redeem, {
      siteId,
      user: { id: memberId },
      body: { code },
    });
    assert.strictEqual(redeemResponse.statusCode, 201, "member redeem status");
    assert.strictEqual(redeemResponse.payload.data.cashWalletMutation, false, "redeem must not mutate cash wallet");
    assert.strictEqual(redeemResponse.payload.data.reward.type, "coupon", "coupon reward lands in wallet");

    await expectReject(
      () => codeCenterController.redeem({ siteId, user: { id: memberId }, body: { code } }, mockResponse()),
      409,
      "duplicate runtime redeem must fail"
    );

    await disconnectRuntimeStores();
    process.env.CODE_CENTER_STORAGE_MODE = "prisma";

    const summaryResponse = await invoke(memberRewardController.summary, {
      siteId,
      user: { id: memberId },
    });
    assert.strictEqual(summaryResponse.payload.data.couponCount, 1, "summary reads persisted coupon");
    assert.strictEqual(summaryResponse.payload.data.cashWalletMutation, false, "summary must not mutate cash wallet");

    const historyResponse = await invoke(memberRewardController.history, {
      siteId,
      user: { id: memberId },
      query: {},
    });
    assert.strictEqual(historyResponse.payload.data.history.length, 1, "history reads persisted reward");
    assert.strictEqual(historyResponse.payload.data.history[0].source, "code_center", "history source is code_center");

    const logsResponse = await invoke(codeCenterController.myRedeemLogs, {
      siteId,
      user: { id: memberId },
      query: {},
    });
    assert.strictEqual(logsResponse.payload.data.redeemLogs.length, 1, "member redeem logs read persisted row");

    await expectReject(
      () =>
        codeCenterController.adminCreateCampaign(
          {
            siteId,
            siteCode: siteId,
            admin,
            body: { name: "Runtime Cash Block", status: "active", reward: { type: "cash_credit", amount: 10 } },
          },
          mockResponse()
        ),
      422,
      "cash_credit must remain blocked"
    );

    console.log("CODE_CENTER_REWARD_WALLET_RUNTIME_SMOKE_PASS");
  } finally {
    await disconnectRuntimeStores().catch(() => {});
    if (previousMode === undefined) {
      delete process.env.CODE_CENTER_STORAGE_MODE;
    } else {
      process.env.CODE_CENTER_STORAGE_MODE = previousMode;
    }
    await cleanup(prisma, siteId).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
