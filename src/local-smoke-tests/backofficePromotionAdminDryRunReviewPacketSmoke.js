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
const VIEW_TOKEN = "smoke-admin-view";
const UI_MARKER = "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-REVIEW-PACKET-50";

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
  const promotionId = "local-smoke-promo-50";
  const selectedPromotion = {
    id: promotionId,
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
  };
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

  function routeResponse(method, pathValue, body, actor) {
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
    const parts = authorization.split(/\s+/, 2);
    if (parts[0] !== AUTH_SCHEME) return null;
    if (parts[1] === WRITE_TOKEN) return writeActor;
    if (parts[1] === VIEW_TOKEN) return viewActor;
    return null;
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
      return { success: true, data: { promotions: [selectedPromotion] } };
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
      const actor = actorFromHeaders(headers) || viewActor;
      if (parsedBody && parsedBody.after && parsedBody.after.title === "API fail promo") {
        return makeJsonResponse(500, {
          success: false,
          code: "PROMOTION_DRY_RUN_FAILED",
          message: "Injected API failure for smoke.",
          errors: ["Injected API failure for smoke."],
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
        });
      }
      const result = routeResponse(method, pathname, parsedBody, actor);
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
  const appSource = read("src/money-demo-ui/app.js");
  vm.runInContext(appSource, context, { filename: "src/money-demo-ui/app.js" });

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

function assertAppSource(text) {
  assertIncludes("admin.html", text.adminHtml, [
    UI_MARKER,
    "aria-label=\"Promotion admin dry-run payload form\"",
    "aria-label=\"Promotion admin dry-run review packet\"",
    "placeholder=\"กรอก audit reason เองก่อน submit\"",
    "id=\"admin-promotion-dry-run-selected\"",
    "id=\"admin-promotion-dry-run-diff-preview\"",
    "id=\"admin-promotion-dry-run-validation-status\"",
    "id=\"admin-promotion-dry-run-validation-errors\"",
    "id=\"admin-promotion-dry-run-warning-notes\"",
    "id=\"admin-promotion-dry-run-review-packet-state\"",
    "id=\"admin-promotion-dry-run-review-packet-status\"",
    "id=\"admin-promotion-dry-run-review-packet-promotion-id\"",
    "id=\"admin-promotion-dry-run-review-packet-generated-at\"",
    "id=\"admin-promotion-dry-run-review-packet-safety\"",
    "id=\"admin-promotion-dry-run-review-packet-changed-fields\"",
    "id=\"admin-promotion-dry-run-review-packet-risky-fields\"",
    "id=\"admin-promotion-dry-run-review-packet-validation-summary\"",
    "id=\"admin-promotion-dry-run-review-packet-warning-summary\"",
    "id=\"admin-promotion-dry-run-review-packet-safety-summary\"",
    "id=\"admin-promotion-dry-run-review-packet-copy\"",
    "id=\"admin-promotion-dry-run-review-packet-export\"",
    "Selected promotion summary",
    "Before / after diff",
    "Review Packet / Change Summary",
    "Copy packet JSON",
    "Local-only dry-run review packet",
    "Copy/export is local-only JSON text. It does not call another API",
    "Dry-run เท่านั้น ไม่มีการบันทึกจริง ไม่แตะ wallet/claim/ledger/provider",
  ]);
  assertIncludes("app.js", text.appJs, [
    "buildPromotionDryRunReviewPacket",
    "renderPromotionDryRunReviewPacket",
    "copyPromotionDryRunReviewPacket",
    "promotionDryRunReviewPacketExport",
    "promotionDryRunPacketBase",
    "promotionDryRunLocalTimestamp",
    "selectPromotionForDryRun",
    "promotionDryRunFieldSummary",
    "promotionDryRunDiffText",
    "promotionDryRunPreviewText",
    "renderPromotionDryRunResult",
    "promotionDryRunAuditReasonInput.value = \"\"",
    "Select for dry-run",
    "Dry-run promotion",
    'apiRequest(`/admin/promotions/${encodeURIComponent(form.promotionId)}/dry-run`',
    'method: "POST"',
  ]);
}

function parsePacket(harness) {
  const raw = getElement(harness, "admin-promotion-dry-run-review-packet-export").value;
  assert(raw && raw.trim().startsWith("{"), "review packet export should contain JSON");
  return JSON.parse(raw);
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
  assert.strictEqual(packet.promotionId, "local-smoke-promo-50");
  assert(packet.originalSnapshot, "packet originalSnapshot missing");
  assert.strictEqual(packet.originalSnapshot.title, "Summer Bonus");
  assert(packet.formPayload, "packet formPayload missing");
  assert.strictEqual(packet.formPayload.after.title, "Summer Bonus Review Packet");
  assert.strictEqual(packet.formPayload.after.bonusValue, 300);
  assert.strictEqual(packet.formPayload.after.maxWithdraw, 1200);
  assert.strictEqual(packet.auditReason, "review packet smoke");
  assert.strictEqual(packet.riskAcknowledgement, true);
  assert(Array.isArray(packet.beforeAfterDiff), "packet beforeAfterDiff should be an array");
  assert(Array.isArray(packet.changedFields), "packet changedFields should be an array");
  assert(packet.changedFields.some((item) => item.field === "title"));
  assert(packet.changedFields.some((item) => item.field === "bonusValue"));
  assert(packet.changedFields.some((item) => item.field === "maxWithdraw"));
  assert(Array.isArray(packet.riskyFields), "packet riskyFields should be an array");
  assert(packet.riskyFields.includes("bonusValue") || packet.riskyFields.includes("bonus"));
  assert(packet.riskyFields.includes("maxWithdraw"));
  assert.strictEqual(packet.validationStatus, "validated");
  assert(Array.isArray(packet.validationErrors));
  assert.strictEqual(packet.validationErrors.length, 0);
  assert(Array.isArray(packet.warningNotes));
  assert(packet.warningNotes.some((warning) => String(warning).includes("Risk acknowledgement accepted")));
  assert(packet.generatedAt && !/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(packet.generatedAt), "generatedAt should be a local timestamp, not UTC ISO");
  assertSafetyFlags(packet);
}

function assertNoSecretsOnSources(files) {
  for (const [label, text] of files) {
    assertNoSecretShape(label, text);
  }
}

async function main() {
  const adminHtml = read("src/money-demo-ui/admin.html");
  const appJs = read("src/money-demo-ui/app.js");
  const payloadSmoke = read("src/local-smoke-tests/backofficePromotionAdminDryRunPayloadFormWiringSmoke.js");
  const validationSmoke = read("src/local-smoke-tests/backofficePromotionAdminDryRunValidationMatrixSmoke.js");
  const runtimeSmoke = read("src/local-smoke-tests/backofficePromotionAdminDryRunUiRuntimeE2eSmoke.js");

  assertAppSource({ adminHtml, appJs });
  assertIncludes("package.json", read("package.json"), [
    "smoke:backoffice-promotion-admin-dry-run-review-packet",
    "backofficePromotionAdminDryRunReviewPacketSmoke.js",
  ]);
  assertIncludes("docs/SMOKE_COVERAGE.md", read("docs/SMOKE_COVERAGE.md"), [
    UI_MARKER,
  ]);
  assertIncludes("docs/BACKOFFICE_DEMO_API_MAPPING.md", read("docs/BACKOFFICE_DEMO_API_MAPPING.md"), [
    UI_MARKER,
  ]);
  assertNoSecretsOnSources([
    ["package.json", read("package.json")],
    ["README.md", read("README.md")],
    ["src/local-smoke-tests/backofficePromotionAdminDryRunReviewPacketSmoke.js", read(__filename)],
    ["src/local-smoke-tests/backofficePromotionAdminDryRunPayloadFormWiringSmoke.js", payloadSmoke],
    ["src/local-smoke-tests/backofficePromotionAdminDryRunValidationMatrixSmoke.js", validationSmoke],
    ["src/local-smoke-tests/backofficePromotionAdminDryRunUiRuntimeE2eSmoke.js", runtimeSmoke],
    ["docs/SMOKE_COVERAGE.md", read("docs/SMOKE_COVERAGE.md")],
    ["docs/BACKOFFICE_DEMO_API_MAPPING.md", read("docs/BACKOFFICE_DEMO_API_MAPPING.md")],
    ["src/money-demo-ui/admin.html", adminHtml],
    ["src/money-demo-ui/app.js", appJs],
  ]);

  const harness = createUiHarness();
  const adminLogin = getElement(harness, "admin-login");
  const adminStatus = getElement(harness, "admin-status-text");
  const promotionRows = getElement(harness, "admin-promotion-rows");
  const selectedSummary = getElement(harness, "admin-promotion-dry-run-selected");
  const diffPreview = getElement(harness, "admin-promotion-dry-run-diff-preview");
  const validationStatus = getElement(harness, "admin-promotion-dry-run-validation-status");
  const validationErrors = getElement(harness, "admin-promotion-dry-run-validation-errors");
  const warningNotes = getElement(harness, "admin-promotion-dry-run-warning-notes");
  const stateText = getElement(harness, "admin-promotion-dry-run-state");
  const resultCode = getElement(harness, "admin-promotion-dry-run-result-code");
  const submitButton = getElement(harness, "admin-promotion-dry-run-submit");
  const reviewPacketState = getElement(harness, "admin-promotion-dry-run-review-packet-state");
  const reviewPacketStatus = getElement(harness, "admin-promotion-dry-run-review-packet-status");
  const reviewPacketPromotionId = getElement(harness, "admin-promotion-dry-run-review-packet-promotion-id");
  const reviewPacketGeneratedAt = getElement(harness, "admin-promotion-dry-run-review-packet-generated-at");
  const reviewPacketChangedFields = getElement(harness, "admin-promotion-dry-run-review-packet-changed-fields");
  const reviewPacketRiskyFields = getElement(harness, "admin-promotion-dry-run-review-packet-risky-fields");
  const reviewPacketValidationSummary = getElement(harness, "admin-promotion-dry-run-review-packet-validation-summary");
  const reviewPacketWarningSummary = getElement(harness, "admin-promotion-dry-run-review-packet-warning-summary");
  const reviewPacketCopy = getElement(harness, "admin-promotion-dry-run-review-packet-copy");
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
  await waitFor(() => promotionRows.children.length > 0, "promotion rows");

  const firstRow = promotionRows.children[0];
  const selectButton = findButtonByText(firstRow, "Select for dry-run");
  await invokePrimaryClick(selectButton);

  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-promotion-id").value, "local-smoke-promo-50");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-title").value, "Summer Bonus");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-type").value, "bonus-plus");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-status").value, "active");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-min-deposit").value, "100");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-max-deposit").value, "5000");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-bonus-type").value, "cash");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-bonus-value").value, "250");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-turnover-multiplier").value, "4");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-max-withdraw").value, "1000");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-start-at").value, "2026-08-01T00:00");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-end-at").value, "2026-08-31T23:59");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-audit-reason").value, "");
  assert.strictEqual(getElement(harness, "admin-promotion-dry-run-acknowledgement").checked, false);
  assert(selectedSummary.textContent.includes("id local-smoke-promo-50"));
  assert(selectedSummary.textContent.includes("title Summer Bonus"));
  assert.strictEqual(diffPreview.textContent.includes("no diff"), true);
  assert.strictEqual(validationStatus.textContent === "-" || validationStatus.textContent === "preview", true);
  assert.strictEqual(stateText.textContent.includes("prefill form"), true);

  let packet = parsePacket(harness);
  assert.strictEqual(packet.status, "fail-closed");
  assert.strictEqual(packet.reason, "dry_run_required");
  assert.strictEqual(packet.promotionId, "local-smoke-promo-50");
  assert(packet.originalSnapshot, "fail-closed packet should keep original snapshot");
  assert(packet.formPayload, "fail-closed packet should keep current form payload");
  assertSafetyFlags(packet);

  setValue(harness, "admin-promotion-dry-run-title", "Summer Bonus Review Packet");
  setValue(harness, "admin-promotion-dry-run-bonus-value", "300");
  setValue(harness, "admin-promotion-dry-run-max-withdraw", "1200");
  setValue(harness, "admin-promotion-dry-run-audit-reason", "review packet smoke");
  setChecked(harness, "admin-promotion-dry-run-acknowledgement", true);

  assert.strictEqual(diffPreview.textContent.includes("title: Summer Bonus - Summer Bonus Review Packet"), true);
  assert.strictEqual(diffPreview.textContent.includes("bonusValue: 250 - 300"), true);
  assert.strictEqual(diffPreview.textContent.includes("maxWithdraw: 1000 - 1200"), true);

  await invokePrimaryClick(submitButton);
  await waitFor(() => harness.fetchCalls.some((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-50/dry-run"), "dry-run request");
  const dryRunCall = harness.fetchCalls.find((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-50/dry-run");
  assert(dryRunCall, "dry-run call missing");
  assert.strictEqual(dryRunCall.method, ROUTE_METHOD);
  assert.strictEqual(dryRunCall.body.before.title, "Summer Bonus");
  assert.strictEqual(dryRunCall.body.after.title, "Summer Bonus Review Packet");
  assert.strictEqual(dryRunCall.body.after.bonusValue, 300);
  assert.strictEqual(dryRunCall.body.after.maxWithdraw, 1200);
  assert.strictEqual(dryRunCall.body.auditReason, "review packet smoke");
  assert.strictEqual(dryRunCall.body.riskAcknowledgement, true);
  await waitFor(() => validationStatus.textContent === "validated", "validation status");
  assert.strictEqual(validationErrors.textContent.includes("no validation errors"), true);
  assert.strictEqual(warningNotes.textContent.includes("Risk acknowledgement accepted"), true);
  assert.strictEqual(resultCode.textContent.includes("OK"), true);
  assert.strictEqual(resultCode.textContent.includes("validated successfully"), true);
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
  await waitFor(() => reviewPacketStatus.textContent === "ready_for_review", "review packet ready");
  assert.strictEqual(reviewPacketPromotionId.textContent, "local-smoke-promo-50");
  assert(reviewPacketGeneratedAt.textContent && reviewPacketGeneratedAt.textContent !== "-");
  assert(reviewPacketState.textContent.includes("Review packet generated"));
  assert(reviewPacketChangedFields.textContent.includes("title"));
  assert(reviewPacketChangedFields.textContent.includes("bonusValue"));
  assert(reviewPacketChangedFields.textContent.includes("maxWithdraw"));
  assert(reviewPacketRiskyFields.textContent.includes("bonus") || reviewPacketRiskyFields.textContent.includes("maxWithdraw"));
  assert(reviewPacketValidationSummary.textContent.includes("validated"));
  assert(reviewPacketValidationSummary.textContent.includes("no validation errors"));
  assert(reviewPacketWarningSummary.textContent.includes("Risk acknowledgement accepted"));

  packet = parsePacket(harness);
  assertReadyPacket(packet);
  const callsBeforeCopy = harness.fetchCalls.length;
  await invokePrimaryClick(reviewPacketCopy);
  assert.strictEqual(harness.fetchCalls.length, callsBeforeCopy, "copy/export packet should not call network");
  packet = parsePacket(harness);
  assertReadyPacket(packet);

  setValue(harness, "admin-promotion-dry-run-promotion-id", "");
  invokePrimaryClick(submitButton);
  await waitFor(() => stateText.textContent.includes("Fail-closed."), "no selection fail closed");
  const noSelectionCalls = harness.fetchCalls.filter((call) => call.pathname === "/api/admin/promotions/local-smoke-promo-50/dry-run").length;
  assert.strictEqual(noSelectionCalls, 1, "no-selection submit should not call dry-run endpoint again");
  assert.strictEqual(validationErrors.textContent.includes("promotionId must reference a loaded promotion row"), true);
  assert.strictEqual(validationStatus.textContent, "fail-closed");
  assert.strictEqual(resultCode.textContent.includes("OK"), false);
  packet = parsePacket(harness);
  assert.strictEqual(packet.status, "fail-closed");
  assert.strictEqual(packet.reason, "no_selected_promotion");
  assert(packet.validationErrors.includes("promotionId must reference a loaded promotion row"));
  assertSafetyFlags(packet);

  setValue(harness, "admin-promotion-dry-run-promotion-id", "local-smoke-promo-50");
  setValue(harness, "admin-promotion-dry-run-title", "API fail promo");
  setValue(harness, "admin-promotion-dry-run-audit-reason", "api fail smoke");
  setChecked(harness, "admin-promotion-dry-run-acknowledgement", true);
  invokePrimaryClick(submitButton);
  await waitFor(() => stateText.textContent.includes("Fail-closed."), "api fail closed");
  assert.strictEqual(resultCode.textContent.includes("HTTP_500"), true);
  assert.strictEqual(resultCode.textContent.includes("OK"), false);
  assert.strictEqual(stateText.textContent.includes("Injected API failure for smoke."), true);
  assert.strictEqual(routeMounted.textContent, "true");
  assert.strictEqual(dbWriteEnabled.textContent, "false");
  assert.strictEqual(walletWriteEnabled.textContent, "false");
  assert.strictEqual(providerEnabled.textContent, "false");
  packet = parsePacket(harness);
  assert.strictEqual(packet.status, "fail-closed");
  assert.strictEqual(packet.reason, "dry_run_failed");
  assert.strictEqual(packet.validationStatus, "fail-closed");
  assert(packet.validationErrors.includes("Injected API failure for smoke."));
  assertSafetyFlags(packet);

  assert.strictEqual(selectedSummary.textContent.includes("id local-smoke-promo-50"), true);
  assert.strictEqual(diffPreview.textContent.includes("title: Summer Bonus"), true);

  const reviewPacketSource = [
    appJs.slice(
      appJs.indexOf("function buildPromotionDryRunReviewPacket"),
      appJs.indexOf("function renderPromotionDryRunResult", appJs.indexOf("function buildPromotionDryRunReviewPacket"))
    ),
    appJs.slice(
      appJs.indexOf("function copyPromotionDryRunReviewPacket"),
      appJs.indexOf("function renderPromotions", appJs.indexOf("function copyPromotionDryRunReviewPacket"))
    ),
  ].join("\n");
  assert(reviewPacketSource.includes("function copyPromotionDryRunReviewPacket"), "review packet source slice should include copy handler");
  assert(
    !/apiRequest\(|fetch\(|\b(?:createPromotion|updatePromotion|deletePromotion|claimPromotion|providerOutbound)\s*\(|prisma\.\w+\.(?:create|update|delete)/i.test(reviewPacketSource),
    "review packet builder/render/copy path should not add network, promotion write, provider, or DB write runtime calls"
  );

  console.log("Backoffice promotion admin dry-run review packet package/docs wiring: PASS");
  console.log("Backoffice promotion admin dry-run review packet source contract: PASS");
  console.log("Backoffice promotion admin dry-run review packet generation: PASS");
  console.log("Backoffice promotion admin dry-run review packet local-only copy/export: PASS");
  console.log("Backoffice promotion admin dry-run review packet fail-closed behavior: PASS");
  console.log("Backoffice promotion admin dry-run review packet safety flags: PASS");
  console.log("Backoffice promotion admin dry-run review packet secret scan: PASS");
  console.log("Backoffice promotion admin dry-run review packet smoke: PASS");
}

main().catch((error) => {
  console.error("Backoffice promotion admin dry-run review packet smoke: FAIL");
  console.error(error);
  process.exitCode = 1;
});
