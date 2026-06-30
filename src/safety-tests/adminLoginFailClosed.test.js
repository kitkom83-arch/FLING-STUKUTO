const assert = require("assert");
const http = require("http");

const controllerPath = require.resolve("../controllers/admin.controller");
const prismaPath = require.resolve("../config/prisma");
const passwordPath = require.resolve("../utils/password");

let siteFindUniqueCalls = 0;

const prismaMock = {
  admin: {
    findUnique: async () => null,
    update: async ({ data }) => ({
      id: "admin_1",
      username: "admin",
      role: "super_admin",
      status: "active",
      lastLoginAt: data.lastLoginAt,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
  },
  adminLog: {
    create: async () => ({ id: "log_1" }),
  },
  site: {
    findUnique: async () => {
      siteFindUniqueCalls += 1;
      return {
        id: "test_site",
        code: "PG77",
        status: "active",
        setting: null,
        theme: null,
      };
    },
  },
  siteDomain: {
    findFirst: async () => null,
  },
};

const passwordMock = {
  impl: async () => false,
  hashPassword: async () => "unused",
  verifyPassword: (...args) => passwordMock.impl(...args),
};

const savedEnv = {
  NODE_ENV: process.env.NODE_ENV,
  APP_ENV: process.env.APP_ENV,
  LOCAL_ADMIN_PASSWORD: process.env.LOCAL_ADMIN_PASSWORD,
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
  exports: passwordMock,
};
delete require.cache[controllerPath];

const adminController = require("../controllers/admin.controller");

function createResponse() {
  return {
    statusCode: null,
    payload: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

function createRequest(body, extra = {}) {
  return {
    body,
    siteId: "test_site",
    headers: {
      "user-agent": "admin-login-failclosed-test",
      ...(extra.headers || {}),
    },
    ...extra,
  };
}

function assertSafeFailure(label, res) {
  assert.notStrictEqual(res.statusCode, 500, `${label} must not return 500`);
  assert.strictEqual(res.statusCode, 400, `${label} must return 400`);
  assert.strictEqual(res.payload.success, false, `${label} must fail`);
  assert.strictEqual(res.payload.message, "Invalid admin credentials", `${label} must use generic message`);
  const serialized = JSON.stringify(res.payload).toLowerCase();
  assert(!serialized.includes("token"), `${label} must not expose token markers`);
  assert(!serialized.includes("session"), `${label} must not expose session markers`);
  assert(!serialized.includes("cookie"), `${label} must not expose cookie markers`);
  assert(!serialized.includes("database"), `${label} must not expose database markers`);
}

async function runCase(label, body, setup) {
  const logs = [];
  const originalError = console.error;
  prismaMock.admin.findUnique = async () => null;
  prismaMock.site.findUnique = async () => {
    siteFindUniqueCalls += 1;
    return {
      id: "test_site",
      code: "PG77",
      status: "active",
      setting: null,
      theme: null,
    };
  };
  siteFindUniqueCalls = 0;
  passwordMock.impl = async () => false;
  if (setup) setup();
  console.error = (...args) => logs.push(args);
  try {
    const res = createResponse();
    await adminController.login(createRequest(body), res);
    assertSafeFailure(label, res);
  } finally {
    console.error = originalError;
  }

  const serializedLogs = JSON.stringify(logs).toLowerCase();
  assert(!serializedLogs.includes("admin-test-password"), `${label} log must not include submitted password`);
  assert(!serializedLogs.includes("bearer"), `${label} log must not include auth scheme`);
  assert(!serializedLogs.includes("database_url"), `${label} log must not include database URL key`);
}

async function runLocalDemoLoginCase(label, body, setup) {
  const logs = [];
  const originalError = console.error;
  prismaMock.admin.findUnique = async () => null;
  prismaMock.site.findUnique = async () => {
    siteFindUniqueCalls += 1;
    return {
      id: "test_site",
      code: "PG77",
      status: "active",
      setting: null,
      theme: null,
    };
  };
  siteFindUniqueCalls = 0;
  passwordMock.impl = async () => false;
  if (setup) setup();
  console.error = (...args) => logs.push(args);
  try {
    const res = createResponse();
    await adminController.login(createRequest(body), res);
    assert.strictEqual(res.statusCode, 200, `${label} must return 200`);
    assert(res.payload.data && typeof res.payload.data.token === "string", `${label} must return token`);
    assert.strictEqual(siteFindUniqueCalls, 0, `${label} must not re-resolve site context when already attached`);
  } finally {
    console.error = originalError;
  }

  const serializedLogs = JSON.stringify(logs).toLowerCase();
  assert(!serializedLogs.includes("admin-test-password"), `${label} log must not include submitted password`);
  assert(!serializedLogs.includes("bearer"), `${label} log must not include auth scheme`);
  assert(!serializedLogs.includes("database_url"), `${label} log must not include database URL key`);
}

async function postJson(app, path, body, headers = {}) {
  return requestJson(app, "POST", path, body, headers);
}

async function requestJson(app, method, path, body, headers = {}) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json();
    return { statusCode: response.status, payload };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function main() {
  await runCase("missing body", undefined);
  await runCase("wrong body", "not-an-object");
  await runCase("missing username", { password: "admin-test-password" });
  await runCase("missing username/email", { password: "admin-test-password" });
  await runCase("missing password", { username: "admin" });
  await runCase("user not found", { username: "missing_admin", password: "admin-test-password" });
  await runCase("invalid credentials", { username: "admin", password: "admin-test-password" }, () => {
    prismaMock.admin.findUnique = async () => ({
      id: "admin_1",
      username: "admin",
      status: "active",
      passwordHash: "hash-present",
    });
  });
  await runCase("prisma lookup throws", { username: "admin", password: "admin-test-password" }, () => {
    prismaMock.admin.findUnique = async () => {
      const error = new Error("mock lookup failed");
      error.code = "P1001";
      throw error;
    };
  });
  await runCase("password hash missing", { username: "admin", password: "admin-test-password" }, () => {
    prismaMock.admin.findUnique = async () => ({ id: "admin_1", username: "admin", status: "active" });
  });
  await runCase("password compare throws", { username: "admin", password: "admin-test-password" }, () => {
    prismaMock.admin.findUnique = async () => ({
      id: "admin_1",
      username: "admin",
      status: "active",
      passwordHash: "invalid-hash",
    });
    passwordMock.impl = async () => {
      throw new Error("mock compare failed");
    };
  });

  await runCase("email login alias invalid credentials", { email: "admin@example.test", password: "admin-test-password" });

  const app = require("../app");
  prismaMock.admin.findUnique = async () => null;
  prismaMock.site.findUnique = async () => {
    siteFindUniqueCalls += 1;
    throw Object.assign(new Error("mock site lookup failed"), { code: "P1001" });
  };
  siteFindUniqueCalls = 0;
  const routeRes = await postJson(app, "/api/admin/auth/login", {
    username: "missing_admin",
    password: "admin-test-password",
  }, {
    "X-Site-Code": "PG77",
  });
  assertSafeFailure("route unknown admin before site lookup", routeRes);
  assert.strictEqual(siteFindUniqueCalls, 0, "unknown admin route must not query site before failing closed");

  prismaMock.admin.findUnique = async () => ({
    id: "admin_1",
    username: "admin",
    status: "active",
    role: "super_admin",
    passwordHash: "hash-present",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  prismaMock.site.findUnique = async () => {
    siteFindUniqueCalls += 1;
    return {
      id: "test_site",
      code: "PG77",
      status: "active",
      setting: null,
      theme: null,
    };
  };
  passwordMock.impl = async () => true;
  siteFindUniqueCalls = 0;
  const successRes = await postJson(app, "/api/admin/auth/login", {
    username: "admin",
    password: "admin-test-password",
  }, {
    "X-Site-Code": "PG77",
  });
  assert.strictEqual(successRes.statusCode, 200, "valid admin login must still return 200");
  assert(successRes.payload.data && typeof successRes.payload.data.token === "string", "valid admin login must return token");
  assert.strictEqual(siteFindUniqueCalls, 1, "valid admin login must resolve site context");

  process.env.NODE_ENV = "development-local";
  process.env.APP_ENV = "local-test";
  process.env.LOCAL_ADMIN_PASSWORD = "local-test-password";
  let localDemoLookupCalls = 0;
  prismaMock.admin.findUnique = async () => {
    localDemoLookupCalls += 1;
    return null;
  };
  prismaMock.site.findUnique = async () => {
    siteFindUniqueCalls += 1;
    throw Object.assign(new Error("mock site lookup failed"), { code: "P1001" });
  };
  siteFindUniqueCalls = 0;
  passwordMock.impl = async () => false;
  const localDemoRouteLogin = await postJson(app, "/api/admin/auth/login", {
    username: "local_money_flow_admin",
    password: "local-demo-admin-code-not-real",
  }, {
    "X-Site-Code": "PG77",
  });
  assert.strictEqual(localDemoRouteLogin.statusCode, 200, "local demo route login must return 200");
  assert(localDemoRouteLogin.payload.data && typeof localDemoRouteLogin.payload.data.token === "string", "local demo route login must return token");
  assert.strictEqual(localDemoRouteLogin.payload.data.localDemo, true, "local demo route login must mark localDemo true");
  assert.strictEqual(localDemoLookupCalls, 0, "local demo route login must not query the admin table");
  assert.strictEqual(siteFindUniqueCalls, 0, "local demo route login must short-circuit site resolution in local-safe mode");

  const localDemoDryRun = await postJson(
    app,
    "/api/admin/promotions/local-smoke-promo-49/dry-run",
    {
      before: {
        title: "Summer Bonus",
        type: "bonus-plus",
        status: "active",
        minDeposit: 100,
        maxDeposit: 5000,
        bonusType: "cash",
        bonusValue: 250,
        turnoverMultiplier: 4,
        maxWithdraw: 1000,
        startAt: "2026-08-01T00:00",
        endAt: "2026-08-31T23:59",
      },
      after: {
        title: "Summer Bonus Prefill UX",
        type: "bonus-plus",
        status: "active",
        minDeposit: 100,
        maxDeposit: 5000,
        bonusType: "cash",
        bonusValue: 300,
        turnoverMultiplier: 4,
        maxWithdraw: 1200,
        startAt: "2026-08-01T00:00",
        endAt: "2026-08-31T23:59",
      },
      auditReason: "local demo browser verify",
      riskAcknowledgement: true,
    },
    {
      "X-Site-Code": "PG77",
      Authorization: `Bearer ${localDemoRouteLogin.payload.data.token}`,
    }
  );
  assert.strictEqual(localDemoDryRun.statusCode, 200, "local demo dry-run route must return 200");
  assert.strictEqual(localDemoDryRun.payload.success, true, "local demo dry-run route must succeed");
  assert.strictEqual(localDemoDryRun.payload.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(localDemoDryRun.payload.promotionId, "local-smoke-promo-49");
  assert(Array.isArray(localDemoDryRun.payload.diff), "local demo dry-run must return diff array");

  await runLocalDemoLoginCase("local demo login literal password", {
    username: "local_money_flow_admin",
    password: "local-demo-admin-code-not-real",
  });

  await runCase("local demo wrong password still rejected", {
    username: "local_money_flow_admin",
    password: "wrong-password",
  }, () => {
    process.env.NODE_ENV = "development-local";
    process.env.APP_ENV = "local-test";
    process.env.LOCAL_ADMIN_PASSWORD = "local-test-password";
    prismaMock.admin.findUnique = async () => ({
      id: "admin_local_1",
      username: "local_money_flow_admin",
      status: "active",
      passwordHash: "hash-present",
    });
  });

  await runCase("local demo login blocked outside local env", {
    username: "local_money_flow_admin",
    password: "local-demo-admin-code-not-real",
  }, () => {
    process.env.NODE_ENV = "production";
    process.env.APP_ENV = "production";
    delete process.env.LOCAL_ADMIN_PASSWORD;
    prismaMock.admin.findUnique = async () => ({
      id: "admin_local_1",
      username: "local_money_flow_admin",
      status: "active",
      passwordHash: "hash-present",
    });
  });

  process.env.NODE_ENV = savedEnv.NODE_ENV;
  process.env.APP_ENV = savedEnv.APP_ENV;
  process.env.LOCAL_ADMIN_PASSWORD = savedEnv.LOCAL_ADMIN_PASSWORD;

  console.log("Admin login fail-closed test: PASS");
}

main().catch((error) => {
  console.error("Admin login fail-closed test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
