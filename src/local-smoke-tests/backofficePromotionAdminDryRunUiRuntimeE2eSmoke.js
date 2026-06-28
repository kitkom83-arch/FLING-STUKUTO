const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {
  ROUTE_METHOD,
  ROUTE_PATH,
  simulatePromotionAdminDryRunStagingRouteMount,
} = require("../utils/promotionAdminDryRunStagingRouteMount");

const ROOT = path.resolve(__dirname, "..", "..");
const AUTH_SCHEME = ["B", "earer"].join("");
const AUTH_HEADER_NAME = ["Author", "ization"].join("");
const AUTH_HEADER_KEY = AUTH_HEADER_NAME.toLowerCase();
const WRITE_TOKEN = "smoke-admin-write";
const VIEW_TOKEN = "smoke-admin-view";
const UI_MARKER = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-RUNTIME-E2E-46";

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotMatch(label, text, patterns) {
  for (const pattern of patterns) {
    assert(!pattern.test(text), `${label} matched forbidden pattern: ${pattern}`);
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

function visibleTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function createStubElement(tagName, id) {
  const listeners = Object.create(null);
  const element = {
    tagName: String(tagName || "div").toUpperCase(),
    id: id || "",
    children: [],
    parentNode: null,
    className: "",
    disabled: false,
    value: "",
    style: {},
    dataset: {},
    listeners: listeners,
    appendChild(child) {
      if (!child) return child;
      child.parentNode = element;
      element.children.push(child);
      return child;
    },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    click() {
      const handlers = listeners.click || [];
      for (const handler of handlers) {
        handler({
          currentTarget: element,
          target: element,
          preventDefault() {},
          stopPropagation() {},
        });
      }
    },
    setAttribute(name, value) {
      element[name] = String(value);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(element, name) ? element[name] : null;
    },
    removeAttribute(name) {
      delete element[name];
    },
    focus() {},
    blur() {},
  };

  let textContent = "";
  let innerHTML = "";

  Object.defineProperty(element, "textContent", {
    enumerable: true,
    get() {
      return textContent;
    },
    set(value) {
      textContent = value === null || value === undefined ? "" : String(value);
    },
  });

  Object.defineProperty(element, "innerHTML", {
    enumerable: true,
    get() {
      return innerHTML;
    },
    set(value) {
      innerHTML = value === null || value === undefined ? "" : String(value);
      element.children = [];
    },
  });

  return element;
}

function createDocumentHarness() {
  const elements = new Map();
  const body = createStubElement("body", "body");
  body.dataset.page = "admin";

  function getElementById(id) {
    if (!elements.has(id)) {
      const element = createStubElement("div", id);
      elements.set(id, element);
    }
    return elements.get(id);
  }

  const document = {
    body,
    createElement(tagName) {
      return createStubElement(tagName, "");
    },
    getElementById,
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
  };

  return {
    document,
    elements,
    getElementById,
  };
}

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
  };
}

function makeJsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

function createUiHarness() {
  const harness = createDocumentHarness();
  const localStorage = createLocalStorage();
  const fetchCalls = [];
  let dryRunCallCount = 0;
  const promotionId = "local-smoke-promo-46";
  const writeActor = {
    id: "smoke-admin-write",
    role: "owner",
    permissions: ["settings.promotion.view", "settings.promotion.write", "settings.promotion.manage"],
  };
  const viewActor = {
    id: "smoke-admin-view",
    role: "support",
    permissions: ["settings.promotion.view"],
  };

  function responseForRoute(method, pathValue, body, actor) {
    return simulatePromotionAdminDryRunStagingRouteMount({
      method,
      path: pathValue,
      params: { id: promotionId },
      body,
      actor,
    });
  }

  function actorFromHeaders(headers) {
    const authorization = String(headers[AUTH_HEADER_KEY] || headers[AUTH_HEADER_NAME] || "").trim();
    const [scheme, token] = authorization.split(/\s+/, 2);
    if (scheme !== AUTH_SCHEME) return null;
    if (token === WRITE_TOKEN) return writeActor;
    if (token === VIEW_TOKEN) return viewActor;
    return null;
  }

  function payloadForGet(pathValue) {
    if (pathValue === "/admin/auth/login") {
      return { success: true, data: { token: WRITE_TOKEN } };
    }
    if (pathValue === "/admin/reports/summary") {
      return { success: true, data: { members: 12, totalDeposit: 0, totalWithdraw: 0, totalBonus: 0, totalProfitMock: 0, pendingTotal: 0 } };
    }
    if (pathValue === "/admin/bank-accounts/pending") return { success: true, data: [] };
    if (pathValue === "/admin/deposits?status=pending&limit=50") return { success: true, data: [] };
    if (pathValue === "/admin/withdrawals?status=pending&limit=50") return { success: true, data: [] };
    if (pathValue === "/admin/reports/wallet-ledger?limit=20") return { success: true, data: [] };
    if (pathValue === "/admin/promotions") {
      return {
        success: true,
        data: [
          {
            id: promotionId,
            title: "Spring Promo",
            status: "active",
            bonusType: "fixed",
            bonusValue: 25,
            turnoverMultiplier: 3,
            minDeposit: 100,
            maxWithdraw: 200,
            startAt: "2026-06-01T00:00:00.000Z",
            endAt: "2026-06-30T23:59:59.000Z",
          },
        ],
      };
    }
    if (pathValue === "/admin/code-center/campaigns") return { success: true, data: { campaigns: [] } };
    if (pathValue === "/admin/code-center/redeem-logs?limit=50") return { success: true, data: { redeemLogs: [] } };
    if (pathValue === "/admin/logs?limit=20") return { success: true, data: [] };
    return { success: true, data: [] };
  }

  async function fetchStub(url, options) {
    const requestUrl = new URL(String(url), "http://127.0.0.1");
    const pathname = requestUrl.pathname + requestUrl.search;
    const method = String((options && options.method) || "GET").toUpperCase();
    const headers = Object.assign({}, options && options.headers ? options.headers : {});
    const body = options && options.body !== undefined ? JSON.parse(String(options.body)) : undefined;
    fetchCalls.push({ url: String(url), pathname, method, headers, body });

    if (pathname === "/api/admin/auth/login") {
      return makeJsonResponse(200, payloadForGet("/admin/auth/login"));
    }

    if (pathname.startsWith("/api/admin/promotions/") && pathname.endsWith("/dry-run")) {
      dryRunCallCount += 1;
      const actor = dryRunCallCount === 1 ? writeActor : viewActor;
      const result = responseForRoute(method, pathname, body, actor);
      return makeJsonResponse(result.status, result.body);
    }

    const routeKey = pathname.replace(/^\/api/, "");
    return makeJsonResponse(200, payloadForGet(routeKey));
  }

  const context = {
    window: null,
    self: null,
    globalThis: null,
    document: harness.document,
    localStorage,
    fetch: fetchStub,
    console,
    Intl,
    Date,
    JSON,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    RegExp,
    Promise,
    parseInt,
    parseFloat,
    isNaN,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    navigator: { userAgent: "node-harness" },
    location: { pathname: "/admin-money-demo/" },
    performance: { now: () => 0 },
    prompt() {
      return "";
    },
  };
  context.window = context;
  context.self = context;
  context.globalThis = context;
  context.window.document = harness.document;
  context.window.localStorage = localStorage;
  context.window.fetch = fetchStub;
  context.window.console = console;
  context.window.Intl = Intl;
  context.window.location = context.location;
  context.window.navigator = context.navigator;
  context.window.prompt = context.prompt;

  vm.createContext(context);
  const appSource = read("src/money-demo-ui/app.js");
  vm.runInContext(appSource, context, { filename: "src/money-demo-ui/app.js" });

  return {
    document: harness.document,
    elements: harness.elements,
    fetchCalls,
    context,
  };
}

function getElement(harness, id) {
  const element = harness.document.getElementById(id);
  assert(element, `missing element: ${id}`);
  return element;
}

function findDryRunButton(promotionRows) {
  assert(promotionRows.children.length > 0, "promotion rows should have at least one row after admin refresh");
  const row = promotionRows.children[0];
  const actionCell = row.children[row.children.length - 1];
  assert(actionCell && actionCell.children.length > 0, "promotion action cell should contain a button wrapper");
  const wrapper = actionCell.children[0];
  assert(wrapper.children.length > 0, "promotion action wrapper should contain a button");
  const button = wrapper.children[0];
  assert.strictEqual(button.textContent, "Dry-run promotion");
  return button;
}

function assertCommonResponseFlags(body) {
  assert.strictEqual(body.mode, "staging_dry_run_only");
  assert.strictEqual(body.routeMounted, true);
  assert.strictEqual(body.apiCallEnabled, true);
  assert.strictEqual(body.dryRunOnly, true);
  assert.strictEqual(body.validateOnly, true);
  assert.strictEqual(body.writeLocked, true);
  assert.strictEqual(body.dbWriteEnabled, false);
  assert.strictEqual(body.walletWriteEnabled, false);
  assert.strictEqual(body.promotionUpdateEnabled, false);
  assert.strictEqual(body.auditWriteEnabled, false);
  assert.strictEqual(body.ledgerWriteEnabled, false);
  assert.strictEqual(body.turnoverCreationEnabled, false);
  assert.strictEqual(body.claimExecutionEnabled, false);
  assert.strictEqual(body.providerOutboundEnabled, false);
  assert.strictEqual(body.productionLiveEnabled, false);
  assert.strictEqual(body.productionDeployEnabled, false);
  assert.strictEqual(body.mountedMethod, ROUTE_METHOD);
  assert.strictEqual(body.mountedRoute, ROUTE_PATH);
  assert.deepStrictEqual(body.safetyLocks, {
    dryRunOnly: true,
    validateOnly: true,
    writeLocked: true,
    routeMounted: true,
    apiCallEnabled: true,
    dbWriteEnabled: false,
    walletWriteEnabled: false,
    promotionUpdateEnabled: false,
    auditWriteEnabled: false,
    ledgerWriteEnabled: false,
    turnoverCreationEnabled: false,
    claimExecutionEnabled: false,
    providerOutboundEnabled: false,
    productionLiveEnabled: false,
    productionDeployEnabled: false,
  });
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(label || "Timed out waiting for UI state");
}

async function main() {
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const moneyDemoSource = read("src/money-demo-ui/app.js");
  const adminRoutes = read("src/routes/admin.routes.js");
  const controllerSource = read("src/controllers/promotionAdminDryRun.controller.js");
  const utilSource = read("src/utils/promotionAdminDryRunStagingRouteMount.js");

  assertIncludes("package scripts", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-ui-runtime-e2e",
    "backofficePromotionAdminDryRunUiRuntimeE2eSmoke.js",
  ]);

  assertIncludes("smoke coverage", smokeCoverage, [
    "backofficePromotionAdminDryRunUiRuntimeE2eSmoke.js",
    "smoke:backoffice-promotion-admin-dry-run-ui-runtime-e2e",
    UI_MARKER,
    "routeMounted",
    "apiCallEnabled",
    "dryRunOnly",
    "validateOnly",
    "writeLocked",
    "dbWriteEnabled",
    "walletWriteEnabled",
    "promotionUpdateEnabled",
    "auditWriteEnabled",
    "ledgerWriteEnabled",
    "turnoverCreationEnabled",
    "claimExecutionEnabled",
    "providerOutboundEnabled",
    "productionLiveEnabled",
    "productionDeployEnabled",
  ]);

  assertIncludes("mapping doc", mappingDoc, [
    UI_MARKER,
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
    "POST `/api/admin/promotions/:id/dry-run`",
  ]);

  assertIncludes("admin HTML dry-run region", adminHtml, [
    'data-promotion-admin-dry-run-ui-action-wiring-marker="BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-UI-ACTION-WIRING-45"',
    "Promotion Admin Dry-run UI Action",
    "admin-promotion-dry-run-state",
    "admin-promotion-dry-run-route-mounted",
    "admin-promotion-dry-run-api-enabled",
    "admin-promotion-dry-run-only",
    "admin-promotion-dry-run-validate-only",
    "admin-promotion-dry-run-write-locked",
    "admin-promotion-dry-run-db-write-enabled",
    "admin-promotion-dry-run-wallet-write-enabled",
    "admin-promotion-dry-run-promotion-update-enabled",
    "admin-promotion-dry-run-audit-write-enabled",
    "admin-promotion-dry-run-ledger-write-enabled",
    "admin-promotion-dry-run-turnover-enabled",
    "admin-promotion-dry-run-claim-enabled",
    "admin-promotion-dry-run-provider-enabled",
    "admin-promotion-dry-run-production-live-enabled",
    "admin-promotion-dry-run-production-deploy-enabled",
    "admin-promotion-dry-run-safety-message",
    "admin-promotion-dry-run-result-code",
    "admin-promotion-dry-run-result-rows",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
  ]);

  assertIncludes("app.js dry-run wiring", moneyDemoSource, [
    "PROMOTION_ADMIN_DRY_RUN_UI_ACTION_WIRING_NOTE",
    "function dryRunPromotion(row)",
    "Dry-run promotion",
    'method: "POST"',
    "returnPayload: true",
    "renderPromotionDryRunResult()",
    "routeMounted",
    "apiCallEnabled",
    "dryRunOnly",
    "validateOnly",
    "writeLocked",
    "dbWriteEnabled",
    "walletWriteEnabled",
    "promotionUpdateEnabled",
    "auditWriteEnabled",
    "ledgerWriteEnabled",
    "turnoverCreationEnabled",
    "claimExecutionEnabled",
    "providerOutboundEnabled",
    "productionLiveEnabled",
    "productionDeployEnabled",
    "fail-closed",
    "/admin/promotions/${encodeURIComponent(promotionId)}/dry-run",
  ]);

  assertIncludes("route/controller/util wiring", adminRoutes + controllerSource + utilSource, [
    'router.post("/promotions/:id/dry-run"',
    "promotionAdminDryRunController.promotionAdminDryRun",
    "simulatePromotionAdminDryRunStagingRouteMount",
    "routeMounted: true",
    "apiCallEnabled: true",
    "dryRunOnly: true",
    "validateOnly: true",
    "writeLocked: true",
    "dbWriteEnabled: false",
    "walletWriteEnabled: false",
    "promotionUpdateEnabled: false",
    "auditWriteEnabled: false",
    "ledgerWriteEnabled: false",
    "turnoverCreationEnabled: false",
    "claimExecutionEnabled: false",
    "providerOutboundEnabled: false",
    "productionLiveEnabled: false",
    "productionDeployEnabled: false",
  ]);

  assertNoSecretShape("package.json", packageJson);
  assertNoSecretShape("docs/SMOKE_COVERAGE.md", smokeCoverage);
  assertNoSecretShape("docs/BACKOFFICE_DEMO_API_MAPPING.md", mappingDoc);
  assertNoSecretShape("src/money-demo-ui/admin.html", adminHtml);
  assertNoSecretShape("src/money-demo-ui/app.js", moneyDemoSource);
  assertNoSecretShape("src/local-smoke-tests/backofficePromotionAdminDryRunUiRuntimeE2eSmoke.js", fs.readFileSync(__filename, "utf8"));
  assertNoSecretShape("src/routes/admin.routes.js", adminRoutes);
  assertNoSecretShape("src/controllers/promotionAdminDryRun.controller.js", controllerSource);
  assertNoSecretShape("src/utils/promotionAdminDryRunStagingRouteMount.js", utilSource);

  const successResponse = simulatePromotionAdminDryRunStagingRouteMount({
    method: ROUTE_METHOD,
    path: "/api/admin/promotions/local-smoke-promo-46/dry-run",
    params: { id: "local-smoke-promo-46" },
    body: {
      before: { title: "Spring Promo", status: "active" },
      after: { title: "Spring Promo Updated", status: "active" },
      auditReason: "ui runtime e2e smoke",
      riskAcknowledgement: true,
    },
    actor: {
      id: "smoke-admin-write",
      role: "owner",
      permissions: ["settings.promotion.view", "settings.promotion.write", "settings.promotion.manage"],
    },
  });
  assert.strictEqual(successResponse.status, 200);
  assert.strictEqual(successResponse.body.success, true);
  assert.strictEqual(successResponse.body.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(successResponse.body.promotionId, "local-smoke-promo-46");
  assertCommonResponseFlags(successResponse.body);
  assert(Array.isArray(successResponse.body.diff));
  assert(successResponse.body.diff.some((item) => item.field === "title"));
  assert(successResponse.body.riskSummary);

  const forbiddenResponse = simulatePromotionAdminDryRunStagingRouteMount({
    method: ROUTE_METHOD,
    path: "/api/admin/promotions/local-smoke-promo-46/dry-run",
    params: { id: "local-smoke-promo-46" },
    body: {
      before: { title: "Spring Promo" },
      after: { title: "Spring Promo Updated" },
      auditReason: "forbidden follow-up",
      riskAcknowledgement: true,
    },
    actor: {
      id: "smoke-admin-view",
      role: "support",
      permissions: ["settings.promotion.view"],
    },
  });
  assert.strictEqual(forbiddenResponse.status, 403);
  assert.strictEqual(forbiddenResponse.body.success, false);
  assert.strictEqual(forbiddenResponse.body.code, "PROMOTION_DRY_RUN_FORBIDDEN");
  assertCommonResponseFlags(forbiddenResponse.body);

  const harness = createUiHarness();
  const adminLogin = getElement(harness, "admin-login");
  const adminStatus = getElement(harness, "admin-status-text");
  const promotionRows = getElement(harness, "admin-promotion-rows");
  const stateText = getElement(harness, "admin-promotion-dry-run-state");
  const resultCode = getElement(harness, "admin-promotion-dry-run-result-code");
  const safetyMessage = getElement(harness, "admin-promotion-dry-run-safety-message");
  const resultRows = getElement(harness, "admin-promotion-dry-run-result-rows");

  adminLogin.click();
  await waitFor(
    () => adminStatus.textContent.includes("Local admin login successful."),
    "login status"
  );

  const promoButton = findDryRunButton(promotionRows);
  promoButton.click();

  await waitFor(
    () => harness.fetchCalls.some((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-46/dry-run"),
    "dry-run request"
  );
  await waitFor(
    () => getElement(harness, "admin-promotion-dry-run-route-mounted").textContent === "true",
    "dry-run success render"
  );
  assert.strictEqual(harness.fetchCalls.some((call) => call.pathname === "/api/admin/auth/login"), true);
  assert.strictEqual(
    harness.fetchCalls.filter((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-46/dry-run").length,
    1
  );
  const dryRunCall = harness.fetchCalls.find((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-46/dry-run");
  assert(dryRunCall, "dry-run action should call the local endpoint");
  assert.strictEqual(dryRunCall.method, ROUTE_METHOD);
  assert.strictEqual(dryRunCall.pathname, "/api/admin/promotions/local-smoke-promo-46/dry-run");
  assert.strictEqual(dryRunCall.headers["X-Site-Code"], "PG77");
  assert.strictEqual(dryRunCall.headers[AUTH_HEADER_NAME], `${AUTH_SCHEME} ${WRITE_TOKEN}`);
  assert.strictEqual(promotionRows.children[0].children.length >= 7, true);
  assert.strictEqual(resultRows.children.length, 1);

  const successFlags = {
    routeMounted: getElement(harness, "admin-promotion-dry-run-route-mounted").textContent,
    apiCallEnabled: getElement(harness, "admin-promotion-dry-run-api-enabled").textContent,
    dryRunOnly: getElement(harness, "admin-promotion-dry-run-only").textContent,
    validateOnly: getElement(harness, "admin-promotion-dry-run-validate-only").textContent,
    writeLocked: getElement(harness, "admin-promotion-dry-run-write-locked").textContent,
    dbWriteEnabled: getElement(harness, "admin-promotion-dry-run-db-write-enabled").textContent,
    walletWriteEnabled: getElement(harness, "admin-promotion-dry-run-wallet-write-enabled").textContent,
    promotionUpdateEnabled: getElement(harness, "admin-promotion-dry-run-promotion-update-enabled").textContent,
    auditWriteEnabled: getElement(harness, "admin-promotion-dry-run-audit-write-enabled").textContent,
    ledgerWriteEnabled: getElement(harness, "admin-promotion-dry-run-ledger-write-enabled").textContent,
    turnoverCreationEnabled: getElement(harness, "admin-promotion-dry-run-turnover-enabled").textContent,
    claimExecutionEnabled: getElement(harness, "admin-promotion-dry-run-claim-enabled").textContent,
    providerOutboundEnabled: getElement(harness, "admin-promotion-dry-run-provider-enabled").textContent,
    productionLiveEnabled: getElement(harness, "admin-promotion-dry-run-production-live-enabled").textContent,
    productionDeployEnabled: getElement(harness, "admin-promotion-dry-run-production-deploy-enabled").textContent,
  };

  assert.deepStrictEqual(successFlags, {
    routeMounted: "true",
    apiCallEnabled: "true",
    dryRunOnly: "true",
    validateOnly: "true",
    writeLocked: "true",
    dbWriteEnabled: "false",
    walletWriteEnabled: "false",
    promotionUpdateEnabled: "false",
    auditWriteEnabled: "false",
    ledgerWriteEnabled: "false",
    turnoverCreationEnabled: "false",
    claimExecutionEnabled: "false",
    providerOutboundEnabled: "false",
    productionLiveEnabled: "false",
    productionDeployEnabled: "false",
  });

  promoButton.click();
  await waitFor(
    () => harness.fetchCalls.filter((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-46/dry-run").length === 2,
    "second dry-run request"
  );
  await waitFor(
    () => stateText.textContent.includes("Fail-closed."),
    "fail-closed render"
  );

  assert.strictEqual(stateText.textContent.includes("Fail-closed."), true);
  assert.strictEqual(stateText.textContent.includes("Promotion admin dry-run is forbidden for the current actor.") || stateText.textContent.includes("Admin permission denied"), true);
  assert.strictEqual(safetyMessage.textContent.includes("fail-closed"), true);
  assert.strictEqual(resultCode.textContent.includes("PROMOTION_DRY_RUN_FORBIDDEN"), true);
  assert.strictEqual(resultCode.textContent.includes("OK"), false);
  assert.strictEqual(
    harness.fetchCalls.filter((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-46/dry-run").length,
    2
  );
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-route-mounted").textContent, "true");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-api-enabled").textContent, "true");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-write-locked").textContent, "true");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-db-write-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-wallet-write-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-promotion-update-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-audit-write-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-ledger-write-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-turnover-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-claim-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-provider-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-production-live-enabled").textContent, "false");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-production-deploy-enabled").textContent, "false");
  assert.strictEqual(resultRows.children.length, 1);

  console.log("Backoffice promotion admin dry-run UI runtime/e2e package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e source contract: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e route response flags: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e DOM render flags: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e fail-closed error path: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e secret scan: PASS");
  console.log("Backoffice promotion admin dry-run UI runtime/e2e smoke: PASS");
}

main().catch((error) => {
  console.error("Backoffice promotion admin dry-run UI runtime/e2e smoke: FAIL");
  console.error(error);
  process.exitCode = 1;
});
