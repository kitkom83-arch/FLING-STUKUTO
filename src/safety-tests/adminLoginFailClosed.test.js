const assert = require("assert");

const controllerPath = require.resolve("../controllers/admin.controller");
const prismaPath = require.resolve("../config/prisma");
const passwordPath = require.resolve("../utils/password");

const prismaMock = {
  admin: {
    findUnique: async () => null,
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

async function main() {
  await runCase("missing body", undefined);
  await runCase("missing username", { password: "admin-test-password" });
  await runCase("missing password", { username: "admin" });
  await runCase("user not found", { username: "missing_admin", password: "admin-test-password" });
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

  console.log("Admin login fail-closed test: PASS");
}

main().catch((error) => {
  console.error("Admin login fail-closed test: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
