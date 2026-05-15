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
const DEMO_ADMIN_PASSWORD = "admin-wheel-route-test-password";

const prismaMock = {
  admin: {
    findUnique: async ({ where }) => {
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
    update: async ({ data }) => ({
      id: "admin_1",
      username: DEMO_ADMIN_USERNAME,
      role: "super_admin",
      status: "active",
      lastLoginAt: data.lastLoginAt,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
  },
  adminLog: {
    create: async () => ({ id: "log_1" }),
  },
  adminSiteAccess: {
    findUnique: async () => null,
  },
  memberReward: {
    count: async () => 0,
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

  console.log("Admin wheel config route test: PASS");
}

main().catch((error) => {
  console.error("Admin wheel config route test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
