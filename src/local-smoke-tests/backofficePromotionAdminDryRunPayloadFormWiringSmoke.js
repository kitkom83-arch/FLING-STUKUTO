const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { simulatePromotionAdminDryRunStagingRouteMount } = require("../utils/promotionAdminDryRunStagingRouteMount");

const repoRoot = path.resolve(__dirname, "../..");
const uiHtmlPath = path.join(repoRoot, "src/money-demo-ui/admin.html");
const uiAppPath = path.join(repoRoot, "src/money-demo-ui/app.js");

const requiredIds = [
  "admin-promotion-dry-run-promotion-id",
  "admin-promotion-dry-run-title",
  "admin-promotion-dry-run-type",
  "admin-promotion-dry-run-status",
  "admin-promotion-dry-run-min-deposit",
  "admin-promotion-dry-run-max-deposit",
  "admin-promotion-dry-run-bonus-type",
  "admin-promotion-dry-run-bonus-value",
  "admin-promotion-dry-run-turnover-multiplier",
  "admin-promotion-dry-run-max-withdraw",
  "admin-promotion-dry-run-start-at",
  "admin-promotion-dry-run-end-at",
  "admin-promotion-dry-run-audit-reason",
  "admin-promotion-dry-run-acknowledgement",
  "admin-promotion-dry-run-submit",
  "admin-promotion-dry-run-validation-status",
  "admin-promotion-dry-run-validation-errors",
  "admin-promotion-dry-run-diff-preview",
  "admin-promotion-dry-run-warning-notes",
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
  "admin-promotion-dry-run-state",
  "admin-promotion-dry-run-safety-message",
  "admin-promotion-dry-run-selected",
  "admin-promotion-dry-run-validator",
  "admin-promotion-dry-run-result-code",
];

const requiredHtmlSnippets = [
  "Dry-run เท่านั้น",
  "ไม่มีการบันทึกจริง",
  "ไม่แตะ wallet/claim/ledger/provider",
  "POST /api/admin/promotions/:id/dry-run",
];

const requiredAppSnippets = [
  "admin-promotion-dry-run-submit",
  "buildPromotionDryRunPayloadFromForm",
  "submitPromotionDryRunFromForm",
  "readPromotionDryRunForm",
  "promotionDryRunSelectedRow",
  'apiRequest(`/admin/promotions/${encodeURIComponent(form.promotionId)}/dry-run`',
  'method: "POST"',
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
  "Dry-run เท่านั้น",
  "ไม่มีการบันทึกจริง",
  "ไม่แตะ wallet/claim/ledger/provider",
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(text, needle, label) {
  assert.ok(text.includes(needle), `${label} missing: ${needle}`);
}

function assertAll(text, needles, label) {
  needles.forEach((needle) => assertIncludes(text, needle, label));
}

function walkFiles(dirPath, out) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, out);
    } else if (/\.(js|json|md|html)$/i.test(entry.name)) {
      out.push(fullPath);
    }
  }
}

function buildClassList() {
  const values = new Set();
  return {
    add(...tokens) {
      tokens.filter(Boolean).forEach((token) => values.add(token));
    },
    remove(...tokens) {
      tokens.filter(Boolean).forEach((token) => values.delete(token));
    },
    contains(token) {
      return values.has(token);
    },
    toString() {
      return Array.from(values).join(" ");
    },
  };
}

function buildElement(tagName, id) {
  const listeners = Object.create(null);
  return {
    id: id || "",
    tagName: String(tagName || "div").toUpperCase(),
    value: "",
    checked: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    className: "",
    dataset: {},
    style: {},
    children: [],
    parentNode: null,
    classList: buildClassList(),
    attributes: Object.create(null),
    listeners,
    appendChild(child) {
      this.children.push(child);
      if (child && typeof child === "object") {
        child.parentNode = this;
      }
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) {
        this.children.splice(index, 1);
      }
      return child;
    },
    insertBefore(child, beforeChild) {
      const index = this.children.indexOf(beforeChild);
      if (index < 0) {
        return this.appendChild(child);
      }
      this.children.splice(index, 0, child);
      if (child && typeof child === "object") {
        child.parentNode = this;
      }
      return child;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === "id") {
        this.id = String(value);
      }
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    dispatchEvent(event) {
      const list = listeners[event && event.type] || [];
      list.forEach((handler) => handler.call(this, event));
      return true;
    },
    click() {
      const event = {
        type: "click",
        target: this,
        currentTarget: this,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
        stopPropagation() {},
      };
      return this.dispatchEvent(event);
    },
    focus() {},
    scrollIntoView() {},
  };
}

function createHarness() {
  const elements = new Map();
  const documentListeners = Object.create(null);
  const windowListeners = Object.create(null);
  const localStore = new Map();

  function getElement(id) {
    if (!elements.has(id)) {
      elements.set(id, buildElement("div", id));
    }
    return elements.get(id);
  }

  const document = {
    readyState: "loading",
    body: Object.assign(getElement("document-body"), { dataset: { page: "admin" } }),
    documentElement: getElement("document-element"),
    addEventListener(type, handler) {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(handler);
    },
    removeEventListener() {},
    dispatchEvent(event) {
      const list = documentListeners[event && event.type] || [];
      list.forEach((handler) => handler.call(document, event));
      return true;
    },
    getElementById(id) {
      return getElement(id);
    },
    createElement(tagName) {
      return buildElement(tagName);
    },
    createTextNode(text) {
      return {
        nodeType: 3,
        textContent: String(text),
        parentNode: null,
      };
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  };

  const window = {
    document,
    location: {
      origin: "http://127.0.0.1:4000",
      href: "http://127.0.0.1:4000/admin/",
      pathname: "/admin/",
      search: "",
    },
    navigator: { userAgent: "node-smoke" },
    localStorage: {
      getItem(key) {
        return localStore.has(key) ? localStore.get(key) : null;
      },
      setItem(key, value) {
        localStore.set(String(key), String(value));
      },
      removeItem(key) {
        localStore.delete(String(key));
      },
      clear() {
        localStore.clear();
      },
    },
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener(type, handler) {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push(handler);
    },
    removeEventListener() {},
    dispatchEvent(event) {
      const list = windowListeners[event && event.type] || [];
      list.forEach((handler) => handler.call(window, event));
      return true;
    },
    requestAnimationFrame(callback) {
      return setTimeout(callback, 0);
    },
    cancelAnimationFrame(handle) {
      clearTimeout(handle);
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };

  window.window = window;
  window.self = window;
  window.globalThis = window;
  window.fetch = fetchStub;
  window.Event = function Event(type) {
    this.type = type;
  };
  document.defaultView = window;

  const requests = [];
  const promotionFixture = {
    id: "promo-123",
    title: "Summer Bonus",
    type: "deposit",
    status: "active",
    minDeposit: 100,
    maxDeposit: 5000,
    bonusType: "cash",
    bonusValue: 250,
    turnoverMultiplier: 5,
    maxWithdraw: 1000,
    startAt: "2026-07-01T00:00:00.000Z",
    endAt: "2026-07-31T23:59:59.000Z",
  };

  function jsonResponse(status, payload) {
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: {
        get() {
          return "application/json";
        },
      },
      async json() {
        return payload;
      },
      async text() {
        return JSON.stringify(payload);
      },
    };
  }

  async function fetchStub(url, options) {
    const method = String(options && options.method ? options.method : "GET").toUpperCase();
    const body = options && Object.prototype.hasOwnProperty.call(options, "body") ? options.body : undefined;
    let parsedBody = body;
    if (typeof body === "string") {
      try {
        parsedBody = JSON.parse(body);
      } catch (_error) {
        parsedBody = body;
      }
    }
    requests.push({
      url: String(url),
      method,
      headers: options && options.headers ? options.headers : {},
      body: parsedBody,
    });

    const normalizedUrl = String(url).replace(/^https?:\/\/[^/]+/, "");
    if (method === "POST" && normalizedUrl.endsWith("/admin/auth/login")) {
      return jsonResponse(200, { token: "admin-token" });
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/reports/summary")) {
      return jsonResponse(200, { ok: true, summary: {} });
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/bank-accounts/pending")) {
      return jsonResponse(200, []);
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/deposits?status=pending&limit=50")) {
      return jsonResponse(200, []);
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/withdrawals?status=pending&limit=50")) {
      return jsonResponse(200, []);
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/reports/wallet-ledger?limit=20")) {
      return jsonResponse(200, []);
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/promotions")) {
      return jsonResponse(200, { promotions: [promotionFixture] });
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/code-center/campaigns")) {
      return jsonResponse(200, { campaigns: [] });
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/code-center/redeem-logs?limit=50")) {
      return jsonResponse(200, { redeemLogs: [] });
    }
    if (method === "GET" && normalizedUrl.endsWith("/admin/logs?limit=20")) {
      return jsonResponse(200, []);
    }
    if (method === "POST" && normalizedUrl.endsWith("/admin/promotions/promo-123/dry-run")) {
      assert.ok(parsedBody && typeof parsedBody === "object", "dry-run request body must be an object");
      assert.strictEqual(parsedBody.before.title, "Summer Bonus", "before.title should come from loaded promotion");
      assert.strictEqual(parsedBody.after.title, "Summer Bonus v2", "after.title should come from form input");
      assert.strictEqual(parsedBody.after.type, "bonus-plus", "after.type should come from form input");
      assert.strictEqual(parsedBody.after.status, "paused", "after.status should come from form input");
      assert.strictEqual(parsedBody.after.minDeposit, 150, "after.minDeposit should come from form input");
      assert.strictEqual(parsedBody.after.maxDeposit, 6000, "after.maxDeposit should come from form input");
      assert.strictEqual(parsedBody.after.bonusType, "cash", "after.bonusType should come from form input");
      assert.strictEqual(parsedBody.after.bonusValue, 300, "after.bonusValue should come from form input");
      assert.strictEqual(parsedBody.after.turnoverMultiplier, 6, "after.turnoverMultiplier should come from form input");
      assert.strictEqual(parsedBody.after.maxWithdraw, 1200, "after.maxWithdraw should come from form input");
      assert.strictEqual(parsedBody.after.startAt, "2026-08-01T00:00", "after.startAt should come from form input");
      assert.strictEqual(parsedBody.after.endAt, "2026-08-31T23:59", "after.endAt should come from form input");
      assert.strictEqual(parsedBody.auditReason, "Phase 47 UI payload wiring smoke", "auditReason should come from form input");
      assert.strictEqual(parsedBody.riskAcknowledgement, true, "riskAcknowledgement should come from checkbox input");
      return jsonResponse(200, {
        code: "PROMOTION_DRY_RUN_OK",
        message: "Promotion admin dry-run completed.",
        routeMounted: true,
        apiCallEnabled: true,
        dryRunOnly: true,
        validateOnly: true,
        writeLocked: true,
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
        validator: "validatePromotionAdminWriteDryRun",
        errors: [],
        warnings: ["Dry-run เท่านั้น", "ไม่มีการบันทึกจริง", "ไม่แตะ wallet/claim/ledger/provider"],
        diff: ["title changed", "status changed"],
      });
    }

    throw new Error(`Unexpected request: ${method} ${normalizedUrl}`);
  }

  const sandbox = {
    console,
    window,
    document,
    localStorage: window.localStorage,
    location: window.location,
    navigator: window.navigator,
    fetch: fetchStub,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Promise,
    RegExp,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Math,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
  };
  sandbox.globalThis = window;

  return { sandbox, document, window, elements, requests, documentListeners, windowListeners };
}

function trigger(listeners) {
  (listeners || []).forEach((handler) => handler.call(null, { type: "DOMContentLoaded" }));
}

async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

async function waitFor(predicate, failureMessage) {
  for (let i = 0; i < 30; i += 1) {
    if (predicate()) {
      return;
    }
    await flush();
  }
  throw new Error(failureMessage);
}

function setInput(document, id, value) {
  document.getElementById(id).value = value;
}

function setCheckbox(document, id, checked) {
  document.getElementById(id).checked = checked;
}

function invokePrimaryClick(element) {
  const clickHandlers = element && element.listeners && Array.isArray(element.listeners.click) ? element.listeners.click : [];
  if (clickHandlers.length) {
    const handler = clickHandlers[0];
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
    const result = handler.call(element, event);
    return result;
  }
  return element.click();
}

function normalizeNoSecretPatterns(text) {
  const patterns = [
    new RegExp(["Be", "arer"].join("") + "\\s+"),
    new RegExp(["e", "yJ"].join("")),
    new RegExp(["s", "k-"].join("")),
    new RegExp(["DATABASE", "_URL"].join("") + "\\s*="),
    new RegExp(["postgresql", "://", "user:password@"].join("")),
  ];
  patterns.forEach((pattern) => {
    assert.ok(!pattern.test(text), `Unexpected secret-shaped literal matched ${pattern}`);
  });
}

async function main() {
  const html = read(uiHtmlPath);
  const appJs = read(uiAppPath);

  assertAll(html, requiredHtmlSnippets, "admin.html");
  assertAll(appJs, requiredAppSnippets, "app.js");
  requiredIds.forEach((id) => assertIncludes(html, `id="${id}"`, "admin.html"));

  const routeResponse = simulatePromotionAdminDryRunStagingRouteMount({
    method: "POST",
    path: "/api/admin/promotions/promo-123/dry-run",
    params: { id: "promo-123" },
    body: {
      before: {
        title: "Summer Bonus",
        type: "deposit",
        status: "active",
        minDeposit: 100,
        maxDeposit: 5000,
        bonusType: "cash",
        bonusValue: 250,
        turnoverMultiplier: 5,
        maxWithdraw: 1000,
        startAt: "2026-07-01T00:00:00.000Z",
        endAt: "2026-07-31T23:59:59.000Z",
      },
      after: {
        title: "Summer Bonus v2",
        type: "bonus-plus",
        status: "paused",
        minDeposit: 150,
        maxDeposit: 6000,
        bonusType: "cash",
        bonusValue: 300,
        turnoverMultiplier: 6,
        maxWithdraw: 1200,
        startAt: "2026-08-01T00:00",
        endAt: "2026-08-31T23:59",
      },
      auditReason: "Phase 47 UI payload wiring smoke",
      riskAcknowledgement: true,
    },
    actor: {
      id: "admin-1",
      permissions: ["settings.promotion.view", "settings.promotion.write"],
    },
  });

  assert.strictEqual(routeResponse.status, 200, "route helper should accept the local-safe POST dry-run request");
  assert.strictEqual(routeResponse.body.routeMounted, true, "route helper should report routeMounted");
  assert.strictEqual(routeResponse.body.apiCallEnabled, true, "route helper should report apiCallEnabled");
  assert.strictEqual(routeResponse.body.dryRunOnly, true, "route helper should report dryRunOnly");
  assert.strictEqual(routeResponse.body.validateOnly, true, "route helper should report validateOnly");
  assert.strictEqual(routeResponse.body.writeLocked, true, "route helper should report writeLocked");
  assert.strictEqual(routeResponse.body.dbWriteEnabled, false, "route helper should keep DB writes disabled");
  assert.strictEqual(routeResponse.body.walletWriteEnabled, false, "route helper should keep wallet writes disabled");
  assert.strictEqual(routeResponse.body.promotionUpdateEnabled, false, "route helper should keep promotion updates disabled");
  assert.strictEqual(routeResponse.body.auditWriteEnabled, false, "route helper should keep audit writes disabled");
  assert.strictEqual(routeResponse.body.ledgerWriteEnabled, false, "route helper should keep ledger writes disabled");
  assert.strictEqual(routeResponse.body.turnoverCreationEnabled, false, "route helper should keep turnover creation disabled");
  assert.strictEqual(routeResponse.body.claimExecutionEnabled, false, "route helper should keep claim execution disabled");
  assert.strictEqual(routeResponse.body.providerOutboundEnabled, false, "route helper should keep provider outbound disabled");
  assert.strictEqual(routeResponse.body.productionLiveEnabled, false, "route helper should keep production live disabled");
  assert.strictEqual(routeResponse.body.productionDeployEnabled, false, "route helper should keep production deploy disabled");

  assertIncludes(appJs, "promotionDryRunPromotionRow = form.promotionRow || null;", "app.js");
  assertIncludes(appJs, 'els.promotionDryRunSubmit.addEventListener("click"', "app.js");
  assertIncludes(appJs, 'els.statusText.textContent = `Running promotion dry-run for ${form.promotionLabel}...`;', "app.js");
  assertIncludes(appJs, 'els.statusText.textContent = `${safeText(form.error.message, "Promotion dry-run form validation failed.")} Fail-closed.`;', "app.js");

  const scanRoots = [
    path.join(repoRoot, "package.json"),
    path.join(repoRoot, "README.md"),
    path.join(repoRoot, "src/local-smoke-tests"),
    path.join(repoRoot, ".github"),
    path.join(repoRoot, "docs"),
    path.join(repoRoot, "src/money-demo-ui"),
    path.join(repoRoot, "src/routes"),
    path.join(repoRoot, "src/controllers"),
    path.join(repoRoot, "src/utils"),
  ];
  const scannedFiles = [];
  scanRoots.forEach((scanRoot) => {
    if (fs.existsSync(scanRoot) && fs.statSync(scanRoot).isDirectory()) {
      walkFiles(scanRoot, scannedFiles);
    } else if (fs.existsSync(scanRoot)) {
      scannedFiles.push(scanRoot);
    }
  });

  scannedFiles.forEach((filePath) => {
    const text = read(filePath);
    normalizeNoSecretPatterns(text);
  });
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
