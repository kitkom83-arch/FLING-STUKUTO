const assert = require("assert");
const http = require("http");

process.env.NODE_ENV = "test";
process.env.APP_ENV = "staging";
process.env.JWT_SECRET = "admin-wheel-config-route-test-secret";
process.env.GAME_PROVIDER_MODE = "mock";
process.env.PAYMENT_PROVIDER_MODE = "mock";
process.env.BANK_STATEMENT_MODE = "mock";
process.env.SMS_PROVIDER_MODE = "mock";
process.env.SLIP_OCR_MODE = "mock";

const prismaPath = require.resolve("../config/prisma");
const passwordPath = require.resolve("../utils/password");
const DEMO_ADMIN_USERNAME = "demo-admin@example.test";
const NO_PERMISSION_ADMIN_USERNAME = "wheel-viewer@example.test";
const DEMO_ADMIN_PASSWORD = "admin-wheel-route-test-password";
const auditLogs = [];
const memberRewards = [
  {
    id: "member_reward_1",
    siteId: "test_site",
    memberId: "member_1",
    source: "wheel",
    sourceId: "spin_1",
    rewardType: "item",
    rewardValue: "0.00",
    label: "Mock Item Reward",
    status: "pending",
    claimedAt: null,
    expiresAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    member: {
      id: "member_1",
      username: "staging_member",
      phone: "0800000099",
    },
    spin: {
      id: "spin_1",
      campaignId: "wheel_main",
      resultSnapshot: {
        label: "Mock Item Reward",
        rewardType: "item",
        noRealPayout: true,
      },
      campaign: {
        id: "wheel_main",
        name: "Staging Mock Lucky Wheel",
      },
    },
  },
];

const prismaMock = {
  $transaction: async (callback) => callback(prismaMock),
  admin: {
    findUnique: async ({ where }) => {
      if (where.id === "admin_viewer" || where.username === NO_PERMISSION_ADMIN_USERNAME) {
        return {
          id: "admin_viewer",
          username: NO_PERMISSION_ADMIN_USERNAME,
          role: "viewer",
          status: "active",
          passwordHash: "mock-password-hash",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        };
      }
      if (where.id && where.id !== "admin_1") return null;
      if (where.username && where.username !== DEMO_ADMIN_USERNAME) return null;
      return {
        id: "admin_1",
        username: DEMO_ADMIN_USERNAME,
        role: "super_admin",
        status: "active",
        passwordHash: "mock-password-hash",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
    },
    update: async ({ where, data }) => {
      const admin = await prismaMock.admin.findUnique({ where });
      return {
        ...admin,
        lastLoginAt: data.lastLoginAt,
      };
    },
  },
  adminLog: {
    create: async ({ data }) => {
      const row = { id: `log_${auditLogs.length + 1}`, ...data };
      auditLogs.push(row);
      return row;
    },
    findMany: async () =>
      auditLogs.map((row) => ({
        ...row,
        admin: {
          id: row.adminId,
          username: DEMO_ADMIN_USERNAME,
          role: "super_admin",
          status: "active",
        },
      })),
  },
  adminSiteAccess: {
    findUnique: async ({ where }) => {
      if (where.adminId_siteId.adminId === "admin_viewer") {
        return {
          id: "access_viewer",
          adminId: "admin_viewer",
          siteId: "test_site",
          role: "viewer",
          permissions: [],
        };
      }
      return null;
    },
  },
  memberReward: {
    count: async () => 0,
    findMany: async () => memberRewards,
    findFirst: async ({ where }) => {
      const row = memberRewards.find((item) => item.id === where.id && item.siteId === where.siteId);
      return row || null;
    },
    update: async ({ where, data }) => {
      const row = memberRewards.find((item) => item.id === where.id);
      Object.assign(row, data, { updatedAt: new Date("2026-01-02T00:00:00.000Z") });
      return row;
    },
  },
  site: {
    findUnique: async () => ({
      id: "test_site",
      code: "PG77",
      status: "active",
      setting: null,
      theme: null,
    }),
  },
  siteDomain: {
    findFirst: async () => null,
  },
  wheelCampaign: {
    findFirst: async () => null,
  },
  wheelSpin: {
    count: async () => 0,
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
    verifyPassword: async (password) => password === DEMO_ADMIN_PASSWORD,
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
        "X-Site-Code": options.siteCode || "PG77",
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

function assertNoSecretLeak(label, payload) {
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();
  assert(!lower.includes("password"), `${label} must not expose password fields`);
  assert(!lower.includes("token"), `${label} must not expose token fields`);
  assert(!lower.includes("secret"), `${label} must not expose secret fields`);
  assert(!lower.includes("authorization"), `${label} must not expose authorization fields`);
  assert(!lower.includes("database_url"), `${label} must not expose database URL fields`);
  assert(!/postgres(?:ql)?:\/\//i.test(serialized), `${label} must not expose database URLs`);
  assert(!/(Error:\s.+\n\s+at\s+)|(\"stack\"\s*:)/i.test(serialized), `${label} must not expose stacks`);
}

async function main() {
  const unauthenticated = await requestJson("/api/admin/wheel/config");
  assert.notStrictEqual(unauthenticated.statusCode, 200, "unauthenticated admin wheel config must not pass");
  assert.notStrictEqual(unauthenticated.statusCode, 404, "admin wheel config route must be mounted");
  assert.strictEqual(unauthenticated.payload.success, false, "unauthenticated admin wheel config must fail safely");
  assertNoSecretLeak("unauthenticated admin wheel config", unauthenticated.payload);

  const login = await requestJson("/api/admin/auth/login", {
    method: "POST",
    body: {
      username: DEMO_ADMIN_USERNAME,
      password: DEMO_ADMIN_PASSWORD,
    },
  });
  assert.strictEqual(login.statusCode, 200, "demo admin login must return 200");
  assert(login.payload.data && typeof login.payload.data.token === "string", "demo admin login must return token");

  const authenticated = await requestJson("/api/admin/wheel/config", {
    headers: {
      Authorization: `Bearer ${login.payload.data.token}`,
    },
  });
  assert.notStrictEqual(
    authenticated.statusCode,
    404,
    `authenticated admin wheel config must not return 404: ${JSON.stringify(authenticated.payload)}`
  );
  assert.strictEqual(authenticated.statusCode, 200, "authenticated admin wheel config must return 200");
  assert.strictEqual(authenticated.payload.success, true, "authenticated admin wheel config must succeed");
  assert(authenticated.payload.data && authenticated.payload.data.campaign, "admin wheel config must include campaign");
  assert(Array.isArray(authenticated.payload.data.rewards), "admin wheel config must include rewards array");
  assert(authenticated.payload.data.rewards.length >= 1, "admin wheel config must include at least one reward");
  assert(
    authenticated.payload.data.rewards.some((reward) => reward.status === "active"),
    "admin wheel config must include at least one active reward"
  );
  assert(
    authenticated.payload.data.summary && typeof authenticated.payload.data.summary.totalSpins === "number",
    "admin wheel config must include summary.totalSpins"
  );
  assertNoSecretLeak("authenticated admin wheel config", authenticated.payload);

  const unauthenticatedRewards = await requestJson("/api/admin/wheel/member-rewards");
  assert.notStrictEqual(unauthenticatedRewards.statusCode, 200, "admin member rewards list must require auth");
  assert.strictEqual(unauthenticatedRewards.payload.success, false, "admin member rewards list unauth must fail safely");
  assertNoSecretLeak("unauthenticated admin member rewards", unauthenticatedRewards.payload);

  const rewardsList = await requestJson("/api/admin/wheel/member-rewards?limit=20", {
    headers: {
      Authorization: `Bearer ${login.payload.data.token}`,
    },
  });
  assert.strictEqual(rewardsList.statusCode, 200, "admin member rewards list must return 200");
  assert.strictEqual(rewardsList.payload.success, true, "admin member rewards list must succeed");
  assert(rewardsList.payload.data && Array.isArray(rewardsList.payload.data.rows), "admin member rewards list must include rows");
  assert(
    rewardsList.payload.data.summary && typeof rewardsList.payload.data.summary.pendingRewards === "number",
    "admin member rewards list must include summary"
  );
  assertNoSecretLeak("admin member rewards list", rewardsList.payload);

  const missingReason = await requestJson("/api/admin/wheel/member-rewards/member_reward_1/status", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${login.payload.data.token}`,
    },
    body: { status: "claimed", reason: "" },
  });
  assert.strictEqual(missingReason.statusCode, 400, "reward claim/cancel must require reason");
  assert.strictEqual(missingReason.payload.success, false, "reward claim missing reason must fail safely");
  assertNoSecretLeak("admin member reward missing reason", missingReason.payload);

  const missingCampaignReason = await requestJson("/api/admin/wheel/campaign", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${login.payload.data.token}`,
    },
    body: { name: "Staging Mock Lucky Wheel", reason: "" },
  });
  assert.strictEqual(missingCampaignReason.statusCode, 400, "campaign update must require reason");
  assert.strictEqual(missingCampaignReason.payload.success, false, "campaign update missing reason must fail safely");
  assertNoSecretLeak("admin campaign missing reason", missingCampaignReason.payload);

  const noPermissionLogin = await requestJson("/api/admin/auth/login", {
    method: "POST",
    body: {
      username: NO_PERMISSION_ADMIN_USERNAME,
      password: DEMO_ADMIN_PASSWORD,
    },
  });
  assert.strictEqual(noPermissionLogin.statusCode, 200, "no-permission admin login must return 200");
  const forbiddenCampaign = await requestJson("/api/admin/wheel/campaign", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${noPermissionLogin.payload.data.token}`,
    },
    body: { name: "Forbidden Campaign", reason: "viewer cannot update campaign" },
  });
  assert.strictEqual(forbiddenCampaign.statusCode, 403, "unauthorized campaign update must fail closed");
  assert.strictEqual(forbiddenCampaign.payload.success, false, "unauthorized campaign update must fail safely");
  assertNoSecretLeak("unauthorized campaign update", forbiddenCampaign.payload);

  const forbiddenAudit = await requestJson("/api/admin/audit-logs?limit=20", {
    headers: {
      Authorization: `Bearer ${noPermissionLogin.payload.data.token}`,
    },
  });
  assert.strictEqual(forbiddenAudit.statusCode, 403, "unauthorized admin audit view must fail closed");
  assert.strictEqual(forbiddenAudit.payload.success, false, "unauthorized admin audit view must fail safely");
  assertNoSecretLeak("unauthorized admin audit view", forbiddenAudit.payload);

  const forbiddenUpdate = await requestJson("/api/admin/wheel/member-rewards/member_reward_1/status", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${noPermissionLogin.payload.data.token}`,
    },
    body: { status: "claimed", reason: "viewer cannot claim reward" },
  });
  assert.strictEqual(forbiddenUpdate.statusCode, 403, "unauthorized admin reward status update must fail closed");
  assert.strictEqual(forbiddenUpdate.payload.success, false, "unauthorized admin reward status update must fail safely");
  assertNoSecretLeak("unauthorized admin member reward status", forbiddenUpdate.payload);

  const claimed = await requestJson("/api/admin/wheel/member-rewards/member_reward_1/status", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${login.payload.data.token}`,
    },
    body: { status: "claimed", reason: "manual item handoff in staging" },
  });
  assert.strictEqual(claimed.statusCode, 200, "reward claim with reason must return 200");
  assert.strictEqual(claimed.payload.success, true, "reward claim with reason must succeed");
  assert.strictEqual(claimed.payload.data.status, "claimed", "reward claim response must include updated status");
  assert(
    auditLogs.some((row) => row.action === "wheel.memberReward.status.update" && row.targetId === "member_reward_1"),
    "reward claim/cancel must create audit log"
  );
  assertNoSecretLeak("admin member reward claimed", claimed.payload);

  console.log("Admin wheel config route test: PASS");
}

main().catch((error) => {
  console.error("Admin wheel config route test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
