const assert = require("assert");
const http = require("http");

process.env.NODE_ENV = "test";
process.env.APP_ENV = "staging";
process.env.JWT_SECRET = "member-wheel-route-test-secret";
process.env.GAME_PROVIDER_MODE = "mock";
process.env.PAYMENT_PROVIDER_MODE = "mock";
process.env.BANK_STATEMENT_MODE = "mock";
process.env.SMS_PROVIDER_MODE = "mock";
process.env.SLIP_OCR_MODE = "mock";

const prismaPath = require.resolve("../config/prisma");
const passwordPath = require.resolve("../utils/password");
const DEMO_MEMBER_PHONE = "0800000099";
const DEMO_MEMBER_PASSWORD = "member-wheel-route-test-password";

const site = {
  id: "test_site",
  code: "PG77",
  status: "active",
  setting: null,
  theme: null,
};
const member = {
  id: "member_1",
  siteId: site.id,
  phone: DEMO_MEMBER_PHONE,
  username: "staging_demo_member",
  status: "active",
  passwordHash: "mock-member-password-hash",
  points: "360.00",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  site,
};
const wallet = {
  id: "wallet_1",
  siteId: site.id,
  userId: member.id,
  balance: "180.00",
  currency: "THB",
};
const rewards = [
  {
    id: "wheel_reward_1",
    campaignId: "wheel_main",
    label: "Mock Points",
    rewardType: "point",
    rewardValue: "20.00",
    displayValue: "20 points",
    probabilityWeight: 10,
    stockLimit: null,
    stockUsed: 0,
    segmentColor: "#2563eb",
    imageUrl: null,
    sortOrder: 1,
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];
const campaign = {
  id: "wheel_main",
  siteId: site.id,
  name: "Staging Mock Lucky Wheel",
  status: "active",
  costType: "point",
  costAmount: "0.00",
  dailySpinLimit: 3,
  monthlySpinLimit: null,
  startAt: null,
  endAt: null,
  rulesText: "Staging demo rewards only. No real payout.",
  showHistory: true,
  maxWheelCredit: null,
  minDepositRequired: null,
  minTurnoverRequired: null,
  rewards,
};
const spins = [];
const memberRewards = [];

const prismaMock = {
  $transaction: async (callback) => callback(prismaMock),
  user: {
    findFirst: async ({ where, include }) => {
      if (where.id && where.id !== member.id) return null;
      if (where.siteId && where.siteId !== site.id) return null;
      if (where.OR) {
        const found = where.OR.some((item) => item.phone === member.phone || item.username === member.username);
        if (!found) return null;
      }
      return include && include.site ? { ...member, site } : member;
    },
    findUnique: async () => ({ siteId: site.id }),
    update: async ({ data }) => {
      Object.assign(member, data);
      return member;
    },
  },
  site: {
    findUnique: async () => site,
  },
  siteDomain: {
    findFirst: async () => null,
  },
  walletAccount: {
    findUnique: async () => wallet,
    create: async ({ data }) => ({ id: "wallet_created", ...data }),
  },
  wheelCampaign: {
    findFirst: async ({ where }) => {
      if (where.id !== campaign.id || where.siteId !== site.id) return null;
      return { ...campaign, rewards };
    },
  },
  wheelReward: {
    updateMany: async () => ({ count: 1 }),
  },
  wheelSpin: {
    count: async ({ where }) => {
      if (where && where.memberId === member.id && where.createdAt) return spins.length;
      return spins.length;
    },
    create: async ({ data }) => {
      const row = {
        id: `spin_${spins.length + 1}`,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        reward: rewards[0],
        memberReward: null,
        member,
        campaign: { id: campaign.id, name: campaign.name },
        ...data,
      };
      spins.push(row);
      return row;
    },
    findMany: async () => spins.map((row) => ({ ...row, reward: rewards[0], memberReward: memberRewards[0] || null })),
  },
  memberReward: {
    create: async ({ data }) => {
      const row = {
        id: `member_reward_${memberRewards.length + 1}`,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        claimedAt: null,
        expiresAt: null,
        ...data,
      };
      memberRewards.push(row);
      return row;
    },
    findMany: async () => memberRewards,
  },
  pointLedger: {
    create: async () => ({ id: "point_ledger_1" }),
  },
};

require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: prismaMock,
};
require.cache[passwordPath] = {
  id: passwordPath,
  filename: passwordPath,
  loaded: true,
  exports: {
    hashPassword: async () => "unused",
    verifyPassword: async (password) => password === DEMO_MEMBER_PASSWORD,
  },
};

const app = require("../app");

async function requestJson(path, options = {}) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        "X-Site-Code": "PG77",
        ...(options.headers || {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    return { statusCode: response.status, payload: await response.json() };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function assertNoSecretLeak(label, payload, { allowAuthToken = false } = {}) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  if (!allowAuthToken) assert(!lower.includes("token"), `${label} must not expose token fields`);
  assert(!lower.includes("secret"), `${label} must not expose secret fields`);
  assert(!lower.includes("authorization"), `${label} must not expose authorization fields`);
  assert(!lower.includes("database_url"), `${label} must not expose database URL fields`);
  assert(!/postgres(?:ql)?:\/\//i.test(serialized), `${label} must not expose database URLs`);
  assert(!/(Error:\s.+\n\s+at\s+)|(\"stack\"\s*:)/i.test(serialized), `${label} must not expose stacks`);
}

async function main() {
  const unauthenticated = await requestJson("/api/member/wheel/config");
  assert.notStrictEqual(unauthenticated.statusCode, 200, "unauthenticated member wheel config must not pass");
  assert.strictEqual(unauthenticated.payload.success, false, "unauthenticated member wheel config must fail safely");
  assertNoSecretLeak("unauthenticated member wheel config", unauthenticated.payload);

  const login = await requestJson("/api/auth/login", {
    method: "POST",
    body: { phone: DEMO_MEMBER_PHONE, password: DEMO_MEMBER_PASSWORD },
  });
  assert.strictEqual(login.statusCode, 200, "demo member login must return 200");
  assert(login.payload.data && typeof login.payload.data.token === "string", "demo member login must return token");
  assertNoSecretLeak("demo member login", login.payload, { allowAuthToken: true });

  const authHeaders = { Authorization: `Bearer ${login.payload.data.token}` };
  const config = await requestJson("/api/member/wheel/config", { headers: authHeaders });
  assert.strictEqual(config.statusCode, 200, "member wheel config must return 200");
  assert(config.payload.data && config.payload.data.campaignId === campaign.id, "member wheel config must include campaignId");
  assert(Array.isArray(config.payload.data.rewards), "member wheel config must include rewards array");
  assert(Object.prototype.hasOwnProperty.call(config.payload.data, "remainingSpinsToday"), "member wheel config must include remainingSpinsToday");
  assert(config.payload.data.memberBalance, "member wheel config must include memberBalance");
  assert(
    config.payload.data.rewards.every((reward) => !Object.prototype.hasOwnProperty.call(reward, "probabilityWeight")),
    "member wheel config must not expose probabilityWeight"
  );

  const unsafeSpin = await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id, rewardId: rewards[0].id, prizeIndex: 0 },
  });
  assert.strictEqual(unsafeSpin.statusCode, 400, "member wheel spin must reject client-selected result fields");
  assert.strictEqual(unsafeSpin.payload.success, false, "unsafe member wheel spin must fail safely");

  const originalCostAmount = campaign.costAmount;
  const originalPoints = member.points;
  campaign.costAmount = "999.00";
  member.points = "0.00";
  const insufficientBalance = await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id },
  });
  assert.strictEqual(insufficientBalance.statusCode, 400, "member wheel insufficient balance must fail safely");
  assert.strictEqual(insufficientBalance.payload.success, false, "member wheel insufficient balance must not return 500");
  assertNoSecretLeak("member wheel insufficient balance", insufficientBalance.payload);
  campaign.costAmount = originalCostAmount;
  member.points = originalPoints;

  const spin = await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id },
  });
  assert.strictEqual(spin.statusCode, 201, "member wheel spin must return 201");
  assert(spin.payload.data.spinId, "member wheel spin must include spinId");
  assert(spin.payload.data.rewardId, "member wheel spin must include rewardId");
  assert.strictEqual(typeof spin.payload.data.prizeIndex, "number", "member wheel spin must include prizeIndex");
  assert(spin.payload.data.reward, "member wheel spin must include reward");
  assert(Object.prototype.hasOwnProperty.call(spin.payload.data, "remainingSpinsToday"), "member wheel spin must include remainingSpinsToday");

  await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id },
  });
  await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id },
  });
  const limitFailure = await requestJson("/api/member/wheel/spin", {
    method: "POST",
    headers: authHeaders,
    body: { campaignId: campaign.id },
  });
  assert.strictEqual(limitFailure.statusCode, 400, "member wheel daily limit must fail safely");
  assert.strictEqual(limitFailure.payload.success, false, "member wheel daily limit must not return 500");

  const history = await requestJson("/api/member/wheel/history?limit=20", { headers: authHeaders });
  assert.strictEqual(history.statusCode, 200, "member wheel history must return 200");
  assert(Array.isArray(history.payload.data), "member wheel history must return array");

  const myRewards = await requestJson("/api/member/wheel/my-rewards?limit=20", { headers: authHeaders });
  assert.strictEqual(myRewards.statusCode, 200, "member wheel my-rewards must return 200");
  assert(Array.isArray(myRewards.payload.data), "member wheel my-rewards must return array");

  assertNoSecretLeak("member wheel config", config.payload);
  assertNoSecretLeak("member wheel spin", spin.payload);
  assertNoSecretLeak("member wheel history", history.payload);
  assertNoSecretLeak("member wheel my-rewards", myRewards.payload);

  console.log("Member wheel route test: PASS");
}

main().catch((error) => {
  console.error("Member wheel route test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
