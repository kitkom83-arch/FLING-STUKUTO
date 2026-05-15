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
    await adminController.login({ body, siteId: "test_site" }, res);
    assertSafeFailure(label, res);
  } finally {
    console.error = originalError;
  }

  const serializedLogs = JSON.stringify(logs).toLowerCase();
  assert(!serializedLogs.includes("admin-test-password"), `${label} log must not include submitted password`);
  assert(!serializedLogs.includes("bearer"), `${label} log must not include auth scheme`);
  assert(!serializedLogs.includes("database_url"), `${label} log must not include database URL key`);
}

async function postJson(app, path, body, headers = {}) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: "POST",
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

  console.log("Admin login fail-closed test: PASS");
}

main().catch((error) => {
  console.error("Admin login fail-closed test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
