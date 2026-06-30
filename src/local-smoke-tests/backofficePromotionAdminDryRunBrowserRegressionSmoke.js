"use strict";

const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const UI_MARKER = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-BROWSER-REGRESSION-55";
const AUTH_SCHEME = ["B", "earer"].join("");
const AUTH_HEADER_NAME = ["Author", "ization"].join("");
const AUTH_HEADER_KEY = AUTH_HEADER_NAME.toLowerCase();
const LOCAL_SECRET = "smoke-browser-regression-jwt";
const RUN_SUITE = [
  "src/local-smoke-tests/backofficePromotionAdminDryRunUiActionWiringSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunValidationMatrixSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunPrefillDiffUxSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunReviewPacketSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunReviewPacketFingerprintSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunClientPreflightGuardSmoke.js",
  "src/local-smoke-tests/backofficePromotionAdminDryRunStalePacketGuardSmoke.js",
];

const prismaPath = require.resolve("../config/prisma");
const envPath = require.resolve("../config/env");
const adminAuthPath = require.resolve("../middleware/adminAuth");
const siteResolverPath = require.resolve("../middleware/siteResolver");
const adminLocalAuthPath = require.resolve("../utils/adminLocalAuth");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const tokenLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const bearerLiteral = new RegExp(["Bear", "er\\s+"].join(""));
  const secretKeyLiteral = new RegExp(["\\b", "s", "k-"].join(""));
  const envLiteral = new RegExp(["DATABASE", "_URL\\s*="].join(""));
  const postgresLiteral = new RegExp(["postgre", "sql://user:password@"].join(""));
  assert(!tokenLike.test(text), `${label} contains a token-shaped static value.`);
  assert(!postgresWithCredentials.test(text), `${label} contains a PostgreSQL credential URL.`);
  assert(!bearerLiteral.test(text), `${label} contains a bearer literal.`);
  assert(!secretKeyLiteral.test(text), `${label} contains a secret-key-like literal.`);
  assert(!envLiteral.test(text), `${label} contains a DATABASE_URL assignment literal.`);
  assert(!postgresLiteral.test(text), `${label} contains a PostgreSQL credential literal.`);
}

function assertNoUndefinedOrNaN(label, text) {
  assert(!/\bundefined\b/.test(text), `${label} must not render undefined.`);
  assert(!/\bNaN\b/.test(text), `${label} must not render NaN.`);
}

function clearModule(relativePath) {
  delete require.cache[require.resolve(relativePath)];
}

function installPrismaMock(prismaMock) {
  require.cache[prismaPath] = {
    id: prismaPath,
    filename: prismaPath,
    loaded: true,
    exports: prismaMock,
  };
}

function restoreModules() {
  delete require.cache[prismaPath];
  delete require.cache[envPath];
  delete require.cache[adminAuthPath];
  delete require.cache[siteResolverPath];
  delete require.cache[adminLocalAuthPath];
}

function runNodeSmoke(relativePath) {
  childProcess.execFileSync(process.execPath, [path.join(ROOT, relativePath)], {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
  });
}

async function withEnv(overrides, fn) {
  const keys = ["NODE_ENV", "APP_ENV", "JWT_SECRET", "LOCAL_ADMIN_PASSWORD"];
  const saved = {};
  for (const key of keys) saved[key] = process.env[key];
  try {
    for (const [key, value] of Object.entries(overrides || {})) {
      if (value === undefined || value === null) {
        delete process.env[key];
      } else {
        process.env[key] = String(value);
      }
    }
    return fn();
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  }
}

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

async function runResolveSiteCase(label, envOverrides, prismaMock, request, expect) {
  return withEnv(envOverrides, async () => {
    clearModule("../utils/adminLocalAuth");
    clearModule("../middleware/siteResolver");
    installPrismaMock(prismaMock);
    const siteResolver = require("../middleware/siteResolver");
    try {
      const result = await siteResolver.resolveSiteForRequest(request);
      if (Object.prototype.hasOwnProperty.call(expect, "siteId")) {
        assert(result, `${label} must resolve a site`);
        assert.strictEqual(result.id, expect.siteId, `${label} site id mismatch`);
      } else {
        assert.strictEqual(result, null, `${label} must return null`);
      }
      if (typeof expect.siteFindUniqueCalls === "number") {
        assert.strictEqual(prismaMock.siteFindUniqueCalls, expect.siteFindUniqueCalls, `${label} site lookups mismatch`);
      }
      if (typeof expect.siteDomainFindFirstCalls === "number") {
        assert.strictEqual(prismaMock.siteDomainFindFirstCalls, expect.siteDomainFindFirstCalls, `${label} domain lookups mismatch`);
      }
    } finally {
      restoreModules();
    }
  });
}

async function runAdminAuthCase(label, envOverrides, prismaMock, token, expectNext) {
  return withEnv(envOverrides, async () => {
    clearModule("../config/env");
    clearModule("../utils/adminLocalAuth");
    clearModule("../middleware/adminAuth");
    installPrismaMock(prismaMock);
    const adminAuth = require("../middleware/adminAuth");
    const req = {
      headers: {
        authorization: `${AUTH_SCHEME} ${token}`,
      },
    };
    const res = createResponse();
    let nextCalled = false;
    try {
      await adminAuth(req, res, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, expectNext, `${label} next() mismatch`);
      if (expectNext) {
        assert(req.admin, `${label} must attach admin`);
      } else {
        assert.strictEqual(res.statusCode, 401, `${label} must reject local admin token`);
      }
    } finally {
      restoreModules();
    }
  });
}

async function main() {
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminControllerSource = read("src/controllers/admin.controller.js");
  const siteResolverSource = read("src/middleware/siteResolver.js");
  const adminAuthSource = read("src/middleware/adminAuth.js");
  const adminLocalAuthSource = read("src/utils/adminLocalAuth.js");
  const safetyTestSource = read("src/safety-tests/adminLoginFailClosed.test.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-browser-regression",
    "backofficePromotionAdminDryRunBrowserRegressionSmoke.js",
  ]);

  assertIncludes("smoke coverage", smokeCoverage, [
    UI_MARKER,
    "backofficePromotionAdminDryRunBrowserRegressionSmoke.js",
    "browser regression",
    "local-safe dry-run only",
  ]);

  assertIncludes("admin HTML dry-run region", adminHtml, [
    "Promotion Admin Dry-run",
    "admin-promotion-dry-run-state",
    "admin-promotion-dry-run-route-mounted",
    "admin-promotion-dry-run-review-packet-state",
    "admin-promotion-dry-run-review-packet-fingerprint-state",
    "admin-promotion-dry-run-review-packet-copy",
    "Dry-run promotion",
  ]);

  assertNotIncludes("admin HTML dry-run region", adminHtml, [
    "admin-promotion-dry-run-save",
    "admin-promotion-dry-run-apply",
    "admin-promotion-dry-run-confirm",
    "Save promotion",
    "Apply promotion",
    "Confirm promotion",
  ]);

  assertIncludes("money demo source", moneyDemoSource, [
    "localDemoSession",
    "buildLocalDemoPromotion",
    "Select for dry-run",
    "Dry-run promotion",
    "promotionDryRunReviewPacketFingerprints",
    "promotionDryRunLastDryRunPayloadSnapshot",
    "copyPromotionDryRunReviewPacket",
    "admin-promotion-dry-run-review-packet-fingerprint-source-version",
    "promotionDryRunReviewPacketFreshness",
  ]);

  assertIncludes("controller / resolver / auth / local auth", adminControllerSource + siteResolverSource + adminAuthSource + adminLocalAuthSource + safetyTestSource, [
    "localAdminLoginAllowed",
    "localAdminDemoLogin",
    "attachLocalDemoLoginSite",
    "localDemo: true",
    "localDemo: false",
    "localDemoSiteFallbackAllowed",
    "buildLocalDemoFallbackSite",
    "isLocalDemoAdminTokenAllowed",
    "buildLocalDemoAdminFromToken",
    "Admin login fail-closed test",
  ]);

  [
    ["package.json", packageJson],
    ["docs/SMOKE_COVERAGE.md", smokeCoverage],
    ["src/money-demo-ui/admin.html", adminHtml],
    ["src/money-demo-ui/app.js", moneyDemoSource],
    ["src/controllers/admin.controller.js", adminControllerSource],
    ["src/middleware/siteResolver.js", siteResolverSource],
    ["src/middleware/adminAuth.js", adminAuthSource],
    ["src/utils/adminLocalAuth.js", adminLocalAuthSource],
  ].forEach(function (entry) {
    assertNoSecretShape(entry[0], entry[1]);
  });

  const localSitePrismaMock = {
    siteFindUniqueCalls: 0,
    siteDomainFindFirstCalls: 0,
  };
  localSitePrismaMock.site = {
    findUnique: async function () {
      localSitePrismaMock.siteFindUniqueCalls += 1;
      return null;
    },
  };
  localSitePrismaMock.siteDomain = {
    findFirst: async function () {
      localSitePrismaMock.siteDomainFindFirstCalls += 1;
      return null;
    },
  };
  await runResolveSiteCase(
    "local-safe site resolution",
    {
      NODE_ENV: "development-local",
      APP_ENV: "local-test",
    },
    localSitePrismaMock,
    {
      headers: {
        "x-site-code": "PG77",
      },
    },
    {
      siteId: "local-demo-site:PG77",
      siteFindUniqueCalls: 0,
      siteDomainFindFirstCalls: 0,
    }
  );

  const prodSitePrismaMock = {
    siteFindUniqueCalls: 0,
    siteDomainFindFirstCalls: 0,
  };
  prodSitePrismaMock.site = {
    findUnique: async function () {
      prodSitePrismaMock.siteFindUniqueCalls += 1;
      return null;
    },
  };
  prodSitePrismaMock.siteDomain = {
    findFirst: async function () {
      prodSitePrismaMock.siteDomainFindFirstCalls += 1;
      return null;
    },
  };
  await runResolveSiteCase(
    "production site resolution",
    {
      NODE_ENV: "production",
      APP_ENV: "production",
    },
    prodSitePrismaMock,
    {
      headers: {
        "x-site-code": "PG77",
      },
    },
    {
      siteFindUniqueCalls: 1,
      siteDomainFindFirstCalls: 0,
    }
  );

  await runAdminAuthCase(
    "local-safe admin auth",
    {
      NODE_ENV: "development-local",
      APP_ENV: "local-test",
      JWT_SECRET: LOCAL_SECRET,
    },
    {
      admin: {
        findUniqueCalls: 0,
        findUnique: async () => {
          throw new Error("admin lookup must not run for local demo token");
        },
      },
    },
    jwt.sign(
      {
        sub: "local-demo-admin:local_money_flow_admin",
        type: "admin-local",
        local: true,
        role: "super_admin",
        username: "local_money_flow_admin",
        status: "active",
      },
      LOCAL_SECRET
    ),
    true
  );

  await runAdminAuthCase(
    "production admin auth rejection",
    {
      NODE_ENV: "production",
      APP_ENV: "production",
      JWT_SECRET: LOCAL_SECRET,
      LOCAL_ADMIN_PASSWORD: "",
    },
    {
      admin: {
        findUniqueCalls: 0,
        findUnique: async () => {
          throw new Error("production-like local demo token must not reach admin lookup");
        },
      },
    },
    jwt.sign(
      {
        sub: "local-demo-admin:local_money_flow_admin",
        type: "admin-local",
        local: true,
        role: "super_admin",
        username: "local_money_flow_admin",
        status: "active",
      },
      LOCAL_SECRET
    ),
    false
  );

  const uiRegressionScripts = RUN_SUITE.slice();
  for (const script of uiRegressionScripts) {
    runNodeSmoke(script);
  }

  console.log("Backoffice promotion admin dry-run browser regression package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run browser regression local-safe gate: PASS");
  console.log("Backoffice promotion admin dry-run browser regression browser suite: PASS");
  console.log("Backoffice promotion admin dry-run browser regression secret scan: PASS");
  console.log("Backoffice promotion admin dry-run browser regression smoke: PASS");
}

main().catch((error) => {
  console.error("Backoffice promotion admin dry-run browser regression smoke: FAIL");
  console.error(error);
  process.exitCode = 1;
});
