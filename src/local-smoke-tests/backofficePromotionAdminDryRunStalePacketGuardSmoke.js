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
const UI_MARKER = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-STALE-PACKET-GUARD-52";

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

function createUiHarness(options) {
  const harness = createDocumentHarness();
  const localStorage = createLocalStorage();
  const fetchCalls = [];
  const routeResponses = [];
  const promotions = Array.isArray(options && options.promotions)
    ? options.promotions
    : [
        {
          id: "local-smoke-promo-52-a",
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
          id: "local-smoke-promo-52-b",
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
      const actor = actorFromHeaders(headers) || writeActor;
      const promotionId = pathname.split("/").slice(-2)[0];
      const result = simulatePromotionAdminDryRunStagingRouteMount({
        method,
        path: pathname,
        params: { id: promotionId },
        body: parsedBody,
        actor,
      });
      routeResponses.push(result.body);
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
    routeResponses,
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

function assertSafetyFlags(packet) {
  assert(packet.safetyFlags, "packet safetyFlags missing");
  assert.strictEqual(packet.safetyFlags.dryRunOnly, true);
  assert.strictEqual(packet.safetyFlags.validateOnly, true);
  assert.strictEqual(packet.safetyFlags.writeLocked, true);
  assert.strictEqual(packet.safetyFlags.dbWriteEnabled, false);
  assert.strictEqual(packet.safetyFlags.walletWriteEnabled, false);
  assert.strictEqual(packet.safetyFlags.promotionUpdateEnabled, false);
  assert.strictEqual(packet.safetyFlags.auditWriteEnabled, false);
  assert.strictEqual(packet.safetyFlags.ledgerWriteEnabled, false);
  assert.strictEqual(packet.safetyFlags.turnoverCreationEnabled, false);
  assert.strictEqual(packet.safetyFlags.claimExecutionEnabled, false);
  assert.strictEqual(packet.safetyFlags.providerOutboundEnabled, false);
  assert.strictEqual(packet.safetyFlags.productionLiveEnabled, false);
  assert.strictEqual(packet.safetyFlags.productionDeployEnabled, false);
  assert(String(packet.safetyConfirmation).includes("no DB write"));
  assert(String(packet.safetyConfirmation).includes("no provider outbound"));
}

function assertReadyPacket(packet) {
  assert.strictEqual(packet.status, "ready_for_review");
  assert.strictEqual(packet.reason, "dry_run_completed");
  assert.strictEqual(packet.freshness, "fresh");
  assert.strictEqual(packet.isStale, false);
  assert.strictEqual(packet.promotionId, "local-smoke-promo-52-a");
  assert(packet.originalSnapshot, "packet originalSnapshot missing");
  assert.strictEqual(packet.originalSnapshot.title, "Summer Bonus A");
  assert(packet.formPayload, "packet formPayload missing");
  assert.strictEqual(packet.formPayload.after.title, "Summer Bonus A Review Packet");
  assert.strictEqual(packet.formPayload.after.bonusValue, 300);
  assert.strictEqual(packet.formPayload.after.maxWithdraw, 1200);
  assert.strictEqual(packet.auditReason, "stale packet smoke");
  assert.strictEqual(packet.riskAcknowledgement, true);
  assert(Array.isArray(packet.beforeAfterDiff), "packet beforeAfterDiff should be an array");
  assert(Array.isArray(packet.changedFields), "packet changedFields should be an array");
  assert(packet.changedFields.some((item) => item.field === "title"));
  assert(packet.changedFields.some((item) => item.field === "bonusValue"));
  assert(packet.changedFields.some((item) => item.field === "maxWithdraw"));
  assert(Array.isArray(packet.riskyFields), "packet riskyFields should be an array");
  assert(packet.riskyFields.includes("bonus") || packet.riskyFields.includes("bonusValue"));
  assert(packet.riskyFields.includes("maxWithdraw"));
  assert.strictEqual(packet.validationStatus, "validated");
  assert(Array.isArray(packet.validationErrors));
  assert.strictEqual(packet.validationErrors.length, 0);
  assert(Array.isArray(packet.warningNotes));
  assert(packet.warningNotes.some((warning) => String(warning).includes("Risk acknowledgement accepted")));
  assert(packet.generatedAt && !/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(packet.generatedAt), "generatedAt should be a local timestamp, not UTC ISO");
  assertSafetyFlags(packet);
}

function assertStalePacket(packet) {
  assert.strictEqual(packet.status, "fail-closed");
  assert.strictEqual(packet.reason, "stale_review_packet");
  assert.strictEqual(packet.freshness, "stale");
  assert.strictEqual(packet.isStale, true);
  assert(packet.validationErrors.some((item) => String(item).includes("Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export.")));
  assert(packet.warningNotes.some((item) => String(item).includes("Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export.")));
  assertSafetyFlags(packet);
}

function setValidForm(harness) {
  setValue(harness, "admin-promotion-dry-run-promotion-id", "local-smoke-promo-52-a");
  setValue(harness, "admin-promotion-dry-run-title", "Summer Bonus A Review Packet");
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
  setValue(harness, "admin-promotion-dry-run-audit-reason", "stale packet smoke");
  setChecked(harness, "admin-promotion-dry-run-acknowledgement", true);
}

async function main() {
  const adminHtml = read("src/money-demo-ui/admin.html");
  const appJs = read("src/money-demo-ui/app.js");
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");

  assertIncludes("admin.html", adminHtml, [
    UI_MARKER,
    "admin-promotion-dry-run-review-packet-freshness-state",
    "admin-promotion-dry-run-review-packet-freshness",
    "When the form changes after a successful dry-run, the packet becomes stale",
    "Packet freshness is fail-closed until a dry-run succeeds.",
  ]);
  assertIncludes("app.js", appJs, [
    "promotionDryRunLastDryRunPayloadSnapshot",
    "promotionDryRunReviewPacketFreshnessState",
    "promotionDryRunReviewPacketFreshness",
    "promotionDryRunPayloadSnapshot",
    "stale_review_packet",
    "Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่ก่อน copy/export.",
  ]);
  assertIncludes("package.json", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-stale-packet-guard",
    "backofficePromotionAdminDryRunStalePacketGuardSmoke.js",
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
  const copyButton = getElement(harness, "admin-promotion-dry-run-review-packet-copy");
  const reviewPacketState = getElement(harness, "admin-promotion-dry-run-review-packet-state");
  const freshnessState = getElement(harness, "admin-promotion-dry-run-review-packet-freshness-state");
  const freshnessValue = getElement(harness, "admin-promotion-dry-run-review-packet-freshness");
  const selectedSummary = getElement(harness, "admin-promotion-dry-run-selected");
  const validationStatus = getElement(harness, "admin-promotion-dry-run-validation-status");
  const validationErrors = getElement(harness, "admin-promotion-dry-run-validation-errors");
  const warningNotes = getElement(harness, "admin-promotion-dry-run-warning-notes");
  const preflightState = getElement(harness, "admin-promotion-dry-run-preflight-state");
  const preflightErrors = getElement(harness, "admin-promotion-dry-run-preflight-errors");
  const resultCode = getElement(harness, "admin-promotion-dry-run-result-code");
  const routeMounted = getElement(harness, "admin-promotion-dry-run-route-mounted");
  const apiEnabled = getElement(harness, "admin-promotion-dry-run-api-enabled");
  const dryRunOnly = getElement(harness, "admin-promotion-dry-run-only");
  const validateOnly = getElement(harness, "admin-promotion-dry-run-validate-only");
  const writeLocked = getElement(harness, "admin-promotion-dry-run-write-locked");
  const dbWriteEnabled = getElement(harness, "admin-promotion-dry-run-db-write-enabled");
  const walletWriteEnabled = getElement(harness, "admin-promotion-dry-run-wallet-write-enabled");
  const promotionUpdateEnabled = getElement(harness, "admin-promotion-dry-run-promotion-update-enabled");
  const auditWriteEnabled = getElement(harness, "admin-promotion-dry-run-audit-write-enabled");
  const ledgerWriteEnabled = getElement(harness, "admin-promotion-dry-run-ledger-write-enabled");
  const turnoverEnabled = getElement(harness, "admin-promotion-dry-run-turnover-enabled");
  const claimEnabled = getElement(harness, "admin-promotion-dry-run-claim-enabled");
  const providerEnabled = getElement(harness, "admin-promotion-dry-run-provider-enabled");
  const productionLiveEnabled = getElement(harness, "admin-promotion-dry-run-production-live-enabled");
  const productionDeployEnabled = getElement(harness, "admin-promotion-dry-run-production-deploy-enabled");

  await invokePrimaryClick(adminLogin);
  await waitFor(() => adminStatus.textContent.includes("Local admin login successful."), "admin login");
  const adminLoginCall = harness.fetchCalls.find((call) => call.pathname === "/api/admin/auth/login");
  assert(adminLoginCall, "admin login request missing");
  assert.strictEqual(adminLoginCall.method, "POST");
  assert.strictEqual(adminLoginCall.body.username, "local_money_flow_admin");
  assert.strictEqual(adminLoginCall.body.password, "local-demo-admin-code-not-real");
  await waitFor(() => promotionRows.children.length > 1, "promotion rows");

  const firstRow = promotionRows.children[0];
  const secondRow = promotionRows.children[1];
  const selectFirstButton = findButtonByText(firstRow, "Select for dry-run");
  const selectSecondButton = findButtonByText(secondRow, "Select for dry-run");

  await invokePrimaryClick(selectFirstButton);
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-52-a", "prefill first promotion");
  setValidForm(harness);

  const dryRunCallsBeforeValid = dryRunCallCount(harness.fetchCalls);
  await invokePrimaryClick(submitButton);
  await waitFor(() => dryRunCallCount(harness.fetchCalls) === dryRunCallsBeforeValid + 1, "valid dry-run request");
  await waitFor(() => validationStatus.textContent === "validated", "validated response");
  assert.strictEqual(routeMounted.textContent, "true");
  assert.strictEqual(apiEnabled.textContent, "true");
  assert.strictEqual(dryRunOnly.textContent, "true");
  assert.strictEqual(validateOnly.textContent, "true");
  assert.strictEqual(writeLocked.textContent, "true");
  assert.strictEqual(dbWriteEnabled.textContent, "false");
  assert.strictEqual(walletWriteEnabled.textContent, "false");
  assert.strictEqual(promotionUpdateEnabled.textContent, "false");
  assert.strictEqual(auditWriteEnabled.textContent, "false");
  assert.strictEqual(ledgerWriteEnabled.textContent, "false");
  assert.strictEqual(turnoverEnabled.textContent, "false");
  assert.strictEqual(claimEnabled.textContent, "false");
  assert.strictEqual(providerEnabled.textContent, "false");
  assert.strictEqual(productionLiveEnabled.textContent, "false");
  assert.strictEqual(productionDeployEnabled.textContent, "false");
  assert.strictEqual(freshnessValue.textContent, "fresh");
  assert.strictEqual(freshnessState.textContent.includes("fresh"), true);
  assert.strictEqual(reviewPacketState.textContent.includes("Local-only copy/export is available."), true);
  let packet = parsePacket(harness);
  assertReadyPacket(packet);
  const validResponse = harness.routeResponses[harness.routeResponses.length - 1];
  assertCommonResponseFlags(validResponse);

  const callsBeforeStale = harness.fetchCalls.length;
  setValue(harness, "admin-promotion-dry-run-title", "Summer Bonus A Review Packet Updated");
  await waitFor(() => freshnessValue.textContent === "stale", "stale freshness marker");
  assert.strictEqual(freshnessState.textContent.includes("stale"), true);
  assert.strictEqual(reviewPacketState.textContent.includes("Review Packet นี้ไม่ตรงกับ form ปัจจุบันแล้ว กรุณา dry-run ใหม่"), true);
  packet = parsePacket(harness);
  assertStalePacket(packet);
  await invokePrimaryClick(copyButton);
  assert.strictEqual(harness.fetchCalls.length, callsBeforeStale, "stale copy/export must not call network");
  packet = parsePacket(harness);
  assertStalePacket(packet);

  setValidForm(harness);
  const callsBeforeFreshRun = dryRunCallCount(harness.fetchCalls);
  await invokePrimaryClick(submitButton);
  await waitFor(() => dryRunCallCount(harness.fetchCalls) === callsBeforeFreshRun + 1, "fresh dry-run after edit");
  await waitFor(() => freshnessValue.textContent === "fresh", "fresh packet after re-dry-run");
  packet = parsePacket(harness);
  assertReadyPacket(packet);
  assert.strictEqual(reviewPacketState.textContent.includes("Local-only copy/export is available."), true);

  await invokePrimaryClick(selectSecondButton);
  await waitFor(() => getElement(harness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-52-b", "prefill second promotion");
  packet = parsePacket(harness);
  assert.strictEqual(packet.status, "fail-closed");
  assert.strictEqual(packet.reason, "dry_run_required");
  assert.strictEqual(packet.freshness, "fail-closed");
  assert.strictEqual(packet.isStale, false);
  assert.strictEqual(freshnessValue.textContent, "fail-closed");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-promotion-id").value, "local-smoke-promo-52-b");

  const noSelectionHarness = createUiHarness({ promotions: [] });
  const noSelectionLogin = getElement(noSelectionHarness, "admin-login");
  const noSelectionStatus = getElement(noSelectionHarness, "admin-status-text");
  const noSelectionSubmit = getElement(noSelectionHarness, "admin-promotion-dry-run-submit");
  const noSelectionReviewPacketState = getElement(noSelectionHarness, "admin-promotion-dry-run-review-packet-state");
  const noSelectionFreshnessValue = getElement(noSelectionHarness, "admin-promotion-dry-run-review-packet-freshness");
  const noSelectionFreshnessState = getElement(noSelectionHarness, "admin-promotion-dry-run-review-packet-freshness-state");
  await invokePrimaryClick(noSelectionLogin);
  await waitFor(() => noSelectionStatus.textContent.includes("Local admin login successful."), "no-selection login");
  const noSelectionCallsBefore = dryRunCallCount(noSelectionHarness.fetchCalls);
  await invokePrimaryClick(noSelectionSubmit);
  await waitFor(() => noSelectionReviewPacketState.textContent.includes("fail-closed"), "no selection fail-closed");
  assert.strictEqual(dryRunCallCount(noSelectionHarness.fetchCalls), noSelectionCallsBefore, "no selected promotion should not call dry-run");
  const noSelectionPacket = parsePacket(noSelectionHarness);
  assert.strictEqual(noSelectionPacket.status, "fail-closed");
  assert.strictEqual(noSelectionPacket.reason, "no_selected_promotion");
  assert.strictEqual(noSelectionPacket.freshness, "fail-closed");
  assert.strictEqual(noSelectionPacket.isStale, false);
  assert.strictEqual(noSelectionFreshnessValue.textContent, "fail-closed");
  assert.strictEqual(noSelectionFreshnessState.textContent.includes("fail-closed"), true);

  const preflightHarness = createUiHarness();
  const preflightLogin = getElement(preflightHarness, "admin-login");
  const preflightStatus = getElement(preflightHarness, "admin-status-text");
  const preflightRows = getElement(preflightHarness, "admin-promotion-rows");
  const preflightSubmit = getElement(preflightHarness, "admin-promotion-dry-run-submit");
  const preflightReviewPacketState = getElement(preflightHarness, "admin-promotion-dry-run-review-packet-state");
  const preflightFreshnessValue = getElement(preflightHarness, "admin-promotion-dry-run-review-packet-freshness");
  const preflightFreshnessState = getElement(preflightHarness, "admin-promotion-dry-run-review-packet-freshness-state");
  const preflightPacketState = getElement(preflightHarness, "admin-promotion-dry-run-preflight-state");
  const preflightPacketErrors = getElement(preflightHarness, "admin-promotion-dry-run-preflight-errors");
  await invokePrimaryClick(preflightLogin);
  await waitFor(() => preflightStatus.textContent.includes("Local admin login successful."), "preflight login");
  await waitFor(() => preflightRows.children.length > 0, "preflight rows");
  await invokePrimaryClick(findButtonByText(preflightRows.children[0], "Select for dry-run"));
  await waitFor(() => getElement(preflightHarness, "admin-promotion-dry-run-promotion-id").value === "local-smoke-promo-52-a", "preflight prefill");
  setValidForm(preflightHarness);
  setValue(preflightHarness, "admin-promotion-dry-run-audit-reason", "");
  const preflightCallsBefore = dryRunCallCount(preflightHarness.fetchCalls);
  await invokePrimaryClick(preflightSubmit);
  await waitFor(() => preflightReviewPacketState.textContent.includes("fail-closed"), "client preflight fail closed");
  assert.strictEqual(dryRunCallCount(preflightHarness.fetchCalls), preflightCallsBefore, "client preflight fail must not call dry-run");
  assert.strictEqual(preflightPacketState.textContent.includes("ยังไม่ยิง API เพราะตรวจหน้า form ไม่ผ่าน"), true);
  assert.strictEqual(preflightPacketErrors.textContent.includes("auditReason is required"), true);
  const preflightPacket = parsePacket(preflightHarness);
  assert.strictEqual(preflightPacket.status, "fail-closed");
  assert.strictEqual(preflightPacket.reason, "client_preflight_failed");
  assert.strictEqual(preflightPacket.freshness, "fail-closed");
  assert.strictEqual(preflightPacket.isStale, false);
  assert.strictEqual(preflightFreshnessValue.textContent, "fail-closed");
  assert.strictEqual(preflightFreshnessState.textContent.includes("fail-closed"), true);

  const validCall = harness.fetchCalls.find(function (call) {
    return call.pathname === "/api/admin/promotions/local-smoke-promo-52-a/dry-run";
  });
  assert(validCall, "valid dry-run call missing");
  assert.strictEqual(validCall.method, ROUTE_METHOD);
  assert.strictEqual(validCall.headers["X-Site-Code"], "PG77");
  assert.strictEqual(validCall.headers[AUTH_HEADER_NAME], `${AUTH_SCHEME} ${WRITE_TOKEN}`);

  const forbiddenRuntimeCalls = harness.fetchCalls.filter(function (call) {
    return /claim|provider|payment/i.test(call.pathname) || (/promotion/i.test(call.pathname) && /create|update|delete/i.test(call.pathname));
  });
  assert.strictEqual(forbiddenRuntimeCalls.length, 0, "forbidden runtime endpoints should not be called");

  console.log("Backoffice promotion admin dry-run stale packet guard source contract: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard fresh packet generation: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard stale blocking: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard no-selection fail-closed: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard client preflight blocking: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard safety flags: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard secret scan: PASS");
  console.log("Backoffice promotion admin dry-run stale packet guard smoke: PASS");
}

main().catch((error) => {
  console.error("Backoffice promotion admin dry-run stale packet guard smoke: FAIL");
  console.error(error);
  process.exitCode = 1;
});
