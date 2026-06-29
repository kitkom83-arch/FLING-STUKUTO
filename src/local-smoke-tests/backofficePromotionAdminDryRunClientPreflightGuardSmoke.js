"use strict";

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
const UI_MARKER = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-CLIENT-PREFLIGHT-GUARD-51";

function read(filePath) {
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  return fs.readFileSync(resolvedPath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNoSecretShape(label, text) {
  const patterns = [
    /Bearer\s+/,
    new RegExp(["e", "yJ"].join("")),
    new RegExp(["s", "k-"].join("")),
    /DATABASE_URL\s*=/,
    /postgresql:\/\/user:password@/,
  ];
  for (const pattern of patterns) {
    assert(!pattern.test(text), `${label} contains a secret-shaped literal.`);
  }
}

function createStubElement(tagName, id) {
  const element = {
    tagName: String(tagName || "div").toUpperCase(),
    id: id || "",
    value: "",
    checked: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    className: "",
    style: {},
    dataset: {},
    attributes: {},
    children: [],
    parentNode: null,
    listeners: Object.create(null),
    appendChild(child) {
      if (!child) return child;
      child.parentNode = element;
      element.children.push(child);
      return child;
    },
    removeChild(child) {
      const index = element.children.indexOf(child);
      if (index >= 0) element.children.splice(index, 1);
      return child;
    },
    setAttribute(name, value) {
      element.attributes[String(name)] = String(value);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(element.attributes, String(name))
        ? element.attributes[String(name)]
        : null;
    },
    addEventListener(type, handler) {
      if (!element.listeners[type]) element.listeners[type] = [];
      element.listeners[type].push(handler);
    },
    dispatchEvent(event) {
      const handlers = element.listeners[event && event.type] || [];
      handlers.forEach(function (handler) {
        handler.call(element, event);
      });
      return true;
    },
    focus() {},
    select() {},
    scrollIntoView() {},
  };
  return element;
}

function createDocumentHarness() {
  const elements = new Map();
  const body = createStubElement("body", "body");
  body.dataset.page = "admin";

  function getElementById(id) {
    if (!elements.has(id)) {
      elements.set(id, createStubElement("div", id));
    }
    return elements.get(id);
  }

  function querySelectorAll(selector) {
    if (selector === ".inline-actions button") {
      const results = [];
      for (const element of elements.values()) {
        if (element && element.className === "inline-actions") {
          for (const child of element.children) {
            if (child && String(child.tagName).toUpperCase() === "BUTTON") {
              results.push(child);
            }
          }
        }
      }
      return results;
    }
    return [];
  }

  return {
    document: {
      readyState: "complete",
      body,
      createElement(tagName) {
        return createStubElement(tagName, "");
      },
      getElementById,
      querySelector() {
        return null;
      },
      querySelectorAll,
      addEventListener() {},
      removeEventListener() {},
    },
    elements,
  };
}

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
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
  const promotions = [
    {
      id: "local-smoke-promo-51-a",
      title: "Summer Bonus A",
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
    {
      id: "local-smoke-promo-51-b",
      title: "Summer Bonus B",
      type: "bonus-plus",
      status: "paused",
      minDeposit: 200,
      maxDeposit: 6000,
      bonusType: "cash",
      bonusValue: 350,
      turnoverMultiplier: 5,
      maxWithdraw: 1500,
      startAt: "2026-09-01T00:00",
      endAt: "2026-09-30T23:59",
    },
  ];
  const writeActor = {
    id: "smoke-admin-write",
    role: "owner",
    permissions: ["settings.promotion.view", "settings.promotion.write", "settings.promotion.manage"],
  };

  function actorFromHeaders(headers) {
    const authorization = String(headers[AUTH_HEADER_KEY] || headers[AUTH_HEADER_NAME] || "").trim();
    const parts = authorization.split(/\s+/, 2);
    if (parts[0] !== AUTH_SCHEME || parts[1] !== WRITE_TOKEN) return null;
    return writeActor;
  }

  function payloadForGet(pathValue) {
    if (pathValue === "/admin/auth/login") {
      return { success: true, data: { token: WRITE_TOKEN } };
    }
    if (pathValue === "/admin/reports/summary") {
      return { success: true, data: { summary: { total_bonus: 0 } } };
    }
    if (pathValue === "/admin/bank-accounts/pending") return { success: true, data: [] };
    if (pathValue === "/admin/deposits?status=pending&limit=50") return { success: true, data: [] };
    if (pathValue === "/admin/withdrawals?status=pending&limit=50") return { success: true, data: [] };
    if (pathValue === "/admin/reports/wallet-ledger?limit=20") return { success: true, data: [] };
    if (pathValue === "/admin/promotions") {
      return { success: true, data: { promotions: promotions } };
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
    const body = options && Object.prototype.hasOwnProperty.call(options, "body") ? options.body : undefined;
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    fetchCalls.push({ pathname, method, headers, body: parsedBody });

    if (pathname === "/api/admin/auth/login") {
      return makeJsonResponse(200, payloadForGet("/admin/auth/login"));
    }

    if (pathname.startsWith("/api/admin/promotions/") && pathname.endsWith("/dry-run")) {
      const actor = actorFromHeaders(headers);
      const promotionId = pathname.split("/").slice(-2)[0];
      const result = simulatePromotionAdminDryRunStagingRouteMount({
        method,
        path: pathname,
        params: { id: promotionId },
        body: parsedBody,
        actor,
      });
      return makeJsonResponse(result.status, result.body);
    }

    const routeKey = pathname.replace(/^\/api/, "");
    return makeJsonResponse(200, payloadForGet(routeKey));
  }

  const context = {
    console,
    window: null,
    self: null,
    globalThis: null,
    document: harness.document,
    localStorage,
    location: { pathname: "/admin/" },
    navigator: { userAgent: "node-smoke" },
    URL,
    fetch: fetchStub,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame(callback) {
      return setTimeout(callback, 0);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    },
  };
  context.window = context;
  context.self = context;
  context.globalThis = context;

  vm.createContext(context);
  vm.runInContext(read("src/money-demo-ui/app.js"), context, { filename: "src/money-demo-ui/app.js" });

  return {
    document: harness.document,
    fetchCalls,
  };
}

function getElement(harness, id) {
  const element = harness.document.getElementById(id);
  assert(element, `missing element: ${id}`);
  return element;
}

function setValue(harness, id, value) {
  const element = getElement(harness, id);
  element.value = value;
  if (typeof element.dispatchEvent === "function") {
    element.dispatchEvent({ type: "input", target: element, currentTarget: element });
    element.dispatchEvent({ type: "change", target: element, currentTarget: element });
  }
}

function setChecked(harness, id, checked) {
  const element = getElement(harness, id);
  element.checked = checked;
  if (typeof element.dispatchEvent === "function") {
    element.dispatchEvent({ type: "input", target: element, currentTarget: element });
    element.dispatchEvent({ type: "change", target: element, currentTarget: element });
  }
}

function invokePrimaryClick(element) {
  const clickHandlers = element && element.listeners && Array.isArray(element.listeners.click) ? element.listeners.click : [];
  assert(clickHandlers.length > 0, "element should have a click handler");
  const event = {
    type: "click",
    target: element,
    currentTarget: element,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {},
  };
  return clickHandlers[0].call(element, event);
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(label || "Timed out waiting for UI state");
}

function findButtonByText(row, text) {
  const actionCell = row.children[row.children.length - 1];
  assert(actionCell && actionCell.children.length > 0, "promotion action cell should contain controls");
  for (const child of actionCell.children) {
    if (child && String(child.textContent) === text) return child;
    if (child && child.children && child.children.length > 0) {
      for (const nestedChild of child.children) {
        if (nestedChild && String(nestedChild.textContent) === text) return nestedChild;
      }
    }
  }
  throw new Error(`Missing button text: ${text}`);
}

function dryRunCallCount(fetchCalls) {
  return fetchCalls.filter(function (call) {
    return call.pathname.startsWith("/api/admin/promotions/") && call.pathname.endsWith("/dry-run");
  }).length;
}

function parsePacket(harness) {
  return JSON.parse(getElement(harness, "admin-promotion-dry-run-review-packet-export").value);
}

function setBaseValidForm(harness) {
  setValue(harness, "admin-promotion-dry-run-promotion-id", "local-smoke-promo-51-a");
  setValue(harness, "admin-promotion-dry-run-title", "Summer Bonus A");
  setValue(harness, "admin-promotion-dry-run-type", "bonus-plus");
  setValue(harness, "admin-promotion-dry-run-status", "active");
  setValue(harness, "admin-promotion-dry-run-min-deposit", "100");
  setValue(harness, "admin-promotion-dry-run-max-deposit", "5000");
  setValue(harness, "admin-promotion-dry-run-bonus-type", "cash");
  setValue(harness, "admin-promotion-dry-run-bonus-value", "300");
  setValue(harness, "admin-promotion-dry-run-turnover-multiplier", "4");
  setValue(harness, "admin-promotion-dry-run-max-withdraw", "1200");
  setValue(harness, "admin-promotion-dry-run-start-at", "2026-08-01T00:00");
  setValue(harness, "admin-promotion-dry-run-end-at", "2026-08-31T23:59");
  setValue(harness, "admin-promotion-dry-run-audit-reason", "client preflight smoke");
  setChecked(harness, "admin-promotion-dry-run-acknowledgement", true);
}

async function assertBlockedSubmit(harness, submitButton, setupInvalid, expectedText) {
  const beforeCount = dryRunCallCount(harness.fetchCalls);
  const promotionRows = getElement(harness, "admin-promotion-rows");
  await invokePrimaryClick(findButtonByText(promotionRows.children[0], "Select for dry-run"));
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-51-a", "reselect");
  setBaseValidForm(harness);
  setupInvalid();
  await invokePrimaryClick(submitButton);
  await waitFor(
    () => getElement(harness, "admin-promotion-dry-run-state").textContent.includes("Fail-closed."),
    "preflight fail-closed"
  );
  assert.strictEqual(dryRunCallCount(harness.fetchCalls), beforeCount, "blocked preflight must not call dry-run API");
  const blockedNotes = [
    getElement(harness, "admin-promotion-dry-run-preflight-state").textContent,
    getElement(harness, "admin-promotion-dry-run-state").textContent,
  ].join(" | ");
  assert(blockedNotes.includes("ยังไม่ยิง API เพราะตรวจหน้า form ไม่ผ่าน"));
  const packet = parsePacket(harness);
  const renderedErrors = [
    getElement(harness, "admin-promotion-dry-run-preflight-errors").textContent,
    getElement(harness, "admin-promotion-dry-run-validation-errors").textContent,
    Array.isArray(packet.validationErrors) ? packet.validationErrors.join(" | ") : "",
  ].join(" | ");
  assert(renderedErrors.includes(expectedText), `missing blocked error text: ${expectedText}`);
  assert.strictEqual(packet.status, "fail-closed");
  assert.notStrictEqual(packet.reason, "dry_run_completed");
}

async function main() {
  const adminHtml = read("src/money-demo-ui/admin.html");
  const appJs = read("src/money-demo-ui/app.js");
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");

  assertIncludes("admin.html", adminHtml, [
    UI_MARKER,
    "Promotion admin dry-run client preflight guard",
    "admin-promotion-dry-run-preflight-status",
    "admin-promotion-dry-run-preflight-api-blocked",
    "admin-promotion-dry-run-preflight-selected-match",
    "admin-promotion-dry-run-preflight-state",
    "admin-promotion-dry-run-preflight-errors",
    "admin-promotion-dry-run-preflight-risky-fields",
    "ยังไม่ยิง API เพราะตรวจหน้า form ไม่ผ่าน",
  ]);
  assertIncludes("app.js", appJs, [
    "buildPromotionDryRunClientPreflight",
    "PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_BLOCK_NOTE",
    "PROMOTION_ADMIN_DRY_RUN_CLIENT_PREFLIGHT_RISKY_FIELDS",
    "promotionId must match the currently selected promotion snapshot",
    "selected promotion is required before dry-run submit",
    "riskAcknowledgement must be true when risky fields change",
  ]);
  assertIncludes("package.json", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-client-preflight-guard",
    "backofficePromotionAdminDryRunClientPreflightGuardSmoke.js",
  ]);
  assertIncludes("docs/SMOKE_COVERAGE.md", smokeCoverage, [UI_MARKER]);
  assertIncludes("docs/BACKOFFICE_DEMO_API_MAPPING.md", mappingDoc, [UI_MARKER]);

  [
    ["package.json", packageJson],
    ["docs/SMOKE_COVERAGE.md", smokeCoverage],
    ["docs/BACKOFFICE_DEMO_API_MAPPING.md", mappingDoc],
    ["src/money-demo-ui/admin.html", adminHtml],
    ["src/money-demo-ui/app.js", appJs],
    [__filename, read(__filename)],
  ].forEach(function (entry) {
    assertNoSecretShape(entry[0], entry[1]);
  });

  const harness = createUiHarness();
  const adminLogin = getElement(harness, "admin-login");
  const adminStatus = getElement(harness, "admin-status-text");
  const promotionRows = getElement(harness, "admin-promotion-rows");
  const submitButton = getElement(harness, "admin-promotion-dry-run-submit");

  await invokePrimaryClick(adminLogin);
  await waitFor(() => adminStatus.textContent.includes("Local admin login successful."), "admin login");
  await waitFor(() => promotionRows.children.length > 0, "promotion rows");

  await invokePrimaryClick(findButtonByText(promotionRows.children[0], "Select for dry-run"));
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-51-a", "prefill");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-promotion-id", "");
  }, "promotionId must reference a loaded promotion row");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-audit-reason", "");
  }, "auditReason is required");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-min-deposit", "-1");
  }, "minDeposit must be a non-negative number");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-min-deposit", "6000");
    setValue(harness, "admin-promotion-dry-run-max-deposit", "5000");
  }, "maxDeposit must be greater than or equal to minDeposit");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-start-at", "2026-09-01T00:00");
    setValue(harness, "admin-promotion-dry-run-end-at", "2026-08-01T00:00");
  }, "startAt must not be later than endAt");

  await assertBlockedSubmit(harness, submitButton, function () {
    setChecked(harness, "admin-promotion-dry-run-acknowledgement", false);
  }, "riskAcknowledgement must be true when risky fields change");

  await assertBlockedSubmit(harness, submitButton, function () {
    setValue(harness, "admin-promotion-dry-run-promotion-id", "local-smoke-promo-51-b");
  }, "promotionId must match the currently selected promotion snapshot");

  const beforeValidSubmit = dryRunCallCount(harness.fetchCalls);
  await invokePrimaryClick(findButtonByText(promotionRows.children[0], "Select for dry-run"));
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-51-a", "reselect valid");
  setBaseValidForm(harness);
  await invokePrimaryClick(submitButton);
  await waitFor(() => dryRunCallCount(harness.fetchCalls) === beforeValidSubmit + 1, "valid dry-run request");
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-validation-status").textContent === "validated", "valid response");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-preflight-status").textContent, "passed");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-preflight-api-blocked").textContent, "false");
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

  const validCall = harness.fetchCalls.find(function (call) {
    return call.pathname === "/api/admin/promotions/local-smoke-promo-51-a/dry-run";
  });
  assert(validCall, "valid dry-run call missing");
  assert.strictEqual(validCall.method, ROUTE_METHOD);
  assert.strictEqual(validCall.headers["X-Site-Code"], "PG77");
  assert.strictEqual(validCall.headers[AUTH_HEADER_NAME], `${AUTH_SCHEME} ${WRITE_TOKEN}`);

  const packet = parsePacket(harness);
  assert.strictEqual(packet.status, "ready_for_review");
  assert.strictEqual(packet.reason, "dry_run_completed");

  const forbiddenRuntimeCalls = harness.fetchCalls.filter(function (call) {
    return /claim|provider/i.test(call.pathname) || (/promotion/i.test(call.pathname) && /create|update|delete/i.test(call.pathname));
  });
  assert.strictEqual(forbiddenRuntimeCalls.length, 0, "forbidden runtime endpoints should not be called");

  console.log("Backoffice promotion admin dry-run client preflight guard source contract: PASS");
  console.log("Backoffice promotion admin dry-run client preflight guard fail-closed blocking: PASS");
  console.log("Backoffice promotion admin dry-run client preflight guard valid submit path: PASS");
  console.log("Backoffice promotion admin dry-run client preflight guard review packet behavior: PASS");
  console.log("Backoffice promotion admin dry-run client preflight guard secret scan: PASS");
  console.log("Backoffice promotion admin dry-run client preflight guard smoke: PASS");
}

main().catch((error) => {
  console.error("Backoffice promotion admin dry-run client preflight guard smoke: FAIL");
  console.error(error);
  process.exitCode = 1;
});
