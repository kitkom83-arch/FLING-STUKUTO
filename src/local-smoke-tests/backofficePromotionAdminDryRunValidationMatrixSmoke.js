"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { simulatePromotionAdminDryRunStagingRouteMount } = require("../utils/promotionAdminDryRunStagingRouteMount");
const { validatePromotionAdminWriteDryRun } = require("../utils/promotionAdminWriteValidator");

const ROOT = path.resolve(__dirname, "..", "..");
const ROUTE_PATH = "/api/admin/promotions/:id/dry-run";
const UI_PATH = "/admin/promotions/${encodeURIComponent(form.promotionId)}/dry-run";

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertCommonDryRunFlags(body) {
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
}

function basePromotion() {
  return {
    title: "Spring Promo",
    type: "seasonal",
    status: "active",
    minDeposit: 100,
    maxDeposit: 500,
    bonusType: "fixed",
    bonusValue: 20,
    turnoverMultiplier: 3,
    maxWithdraw: 200,
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-06-30T23:59:59.000Z",
  };
}

function buildRequest(overrides) {
  const base = basePromotion();
  const body = {
    before: Object.assign({}, base),
    after: Object.assign({}, base, {
      title: "Spring Promo Updated",
      bonusValue: 25,
      maxWithdraw: 220,
      endAt: "2026-07-01T23:59:59.000Z",
    }),
    auditReason: "validation matrix smoke",
    riskAcknowledgement: true,
  };

  if (overrides && overrides.body) {
    body.before = overrides.body.before || body.before;
    body.after = overrides.body.after || body.after;
    if (Object.prototype.hasOwnProperty.call(overrides.body, "auditReason")) {
      body.auditReason = overrides.body.auditReason;
    }
    if (Object.prototype.hasOwnProperty.call(overrides.body, "riskAcknowledgement")) {
      body.riskAcknowledgement = overrides.body.riskAcknowledgement;
    }
  }

  return {
    method: "POST",
    path: "/api/admin/promotions/promo-48/dry-run",
    params: { id: "promo-48" },
    body,
    actor: Object.assign(
      {
        id: "admin-48",
        role: "finance",
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      overrides && overrides.actor ? overrides.actor : {}
    ),
  };
}

function assertValidatorOk(label, input) {
  const result = validatePromotionAdminWriteDryRun(input);
  assert.strictEqual(result.ok, true, `${label} should validate`);
  return result;
}

function assertValidatorError(label, input, expectedErrors) {
  const result = validatePromotionAdminWriteDryRun(input);
  assert.strictEqual(result.ok, false, `${label} should fail validation`);
  for (const expected of expectedErrors) {
    assert(
      result.errors.some((item) => String(item).includes(expected)),
      `${label} missing validation error: ${expected}`
    );
  }
  return result;
}

function assertRouteSuccess(label, request) {
  const response = simulatePromotionAdminDryRunStagingRouteMount(request);
  assert.strictEqual(response.status, 200, `${label} should return 200`);
  assert.strictEqual(response.body.success, true, `${label} should succeed`);
  assert.strictEqual(response.body.validator, "validatePromotionAdminWriteDryRun");
  assert.strictEqual(response.body.promotionId, "promo-48");
  assertCommonDryRunFlags(response.body);
  return response;
}

function assertRouteFailure(label, request, expectedStatus, expectedCode, expectedErrorFragments) {
  const response = simulatePromotionAdminDryRunStagingRouteMount(request);
  assert.strictEqual(response.status, expectedStatus, `${label} should return ${expectedStatus}`);
  assert.strictEqual(response.body.success, false, `${label} should fail closed`);
  assert.strictEqual(response.body.code, expectedCode, `${label} should map to ${expectedCode}`);
  assertCommonDryRunFlags(response.body);
  for (const fragment of expectedErrorFragments) {
    assert(
      Array.isArray(response.body.errors) && response.body.errors.some((item) => String(item).includes(fragment)),
      `${label} missing response error fragment: ${fragment}`
    );
  }
  return response;
}

function main() {
  const packageJson = read("package.json");
  const smokeCoverage = read("docs/SMOKE_COVERAGE.md");
  const mappingDoc = read("docs/BACKOFFICE_DEMO_API_MAPPING.md");
  const adminHtml = read("src/money-demo-ui/admin.html");
  const appJs = read("src/money-demo-ui/app.js");
  const validatorSource = read("src/utils/promotionAdminWriteValidator.js");
  const routeMountSource = read("src/utils/promotionAdminDryRunStagingRouteMount.js");
  const controllerSource = read("src/controllers/promotionAdminDryRun.controller.js");

  assertIncludes("package.json", packageJson, [
    "smoke:backoffice-promotion-admin-dry-run-validation-matrix",
    "backofficePromotionAdminDryRunValidationMatrixSmoke.js",
  ]);
  assertIncludes("smoke coverage doc", smokeCoverage, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-VALIDATION-MATRIX-48",
    "backofficePromotionAdminDryRunValidationMatrixSmoke.js",
  ]);
  assertIncludes("mapping doc", mappingDoc, [
    "BACKOFFICE-PROMOTION-ADMIN-DRY-RUN-VALIDATION-MATRIX-48",
    "backofficePromotionAdminDryRunValidationMatrixSmoke.js",
  ]);
  assertIncludes("admin html", adminHtml, [
    "aria-label=\"Promotion admin dry-run payload form\"",
    "id=\"admin-promotion-dry-run-validation-status\"",
    "id=\"admin-promotion-dry-run-validation-errors\"",
    "id=\"admin-promotion-dry-run-diff-preview\"",
    "id=\"admin-promotion-dry-run-warning-notes\"",
    "Dry-run เท่านั้น",
    "ไม่มีการบันทึกจริง",
    "ไม่แตะ wallet/claim/ledger/provider",
  ]);
  assertIncludes("app.js", appJs, [
    "submitPromotionDryRunFromForm",
    `apiRequest(\`${UI_PATH}\``,
    'method: "POST"',
    "promotionDryRunValidationStatus",
    "promotionDryRunValidationErrors",
    "promotionDryRunDiffPreview",
    "promotionDryRunWarningNotes",
    "riskAcknowledgement",
  ]);
  assertIncludes("validator source", validatorSource, [
    "auditReason is required",
    "maxDeposit must be greater than or equal to minDeposit",
    "startAt must not be later than endAt",
    "riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes",
  ]);
  assertIncludes("route mount source", routeMountSource, [
    ROUTE_PATH,
    "routeMounted: true",
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
  assertIncludes("controller source", controllerSource, [
    "simulatePromotionAdminDryRunStagingRouteMount",
    "res.status(response.status).json(response.body)",
  ]);

  const validRequest = buildRequest({
    body: {
      before: Object.assign({}, basePromotion()),
      after: Object.assign({}, basePromotion(), {
        title: "Spring Promo Matrix Updated",
        bonusValue: 25,
        maxWithdraw: 220,
        endAt: "2026-07-01T23:59:59.000Z",
      }),
      auditReason: "validation matrix smoke",
      riskAcknowledgement: true,
    },
  });
  const validValidation = assertValidatorOk("valid case", validRequest.body);
  assert.strictEqual(validValidation.errors.length, 0, "valid case should have no validation errors");
  assert.strictEqual(validValidation.diff.length > 0, true, "valid case should produce a diff");
  assert.strictEqual(validValidation.warnings.length > 0, true, "valid case should preserve risk acknowledgement warning");
  assert.strictEqual(
    validValidation.warnings.some((item) => String(item).includes("Risk acknowledgement accepted")),
    true
  );
  const validRoute = assertRouteSuccess("valid route case", validRequest);
  assert.strictEqual(validRoute.body.errors.length, 0);
  assert.strictEqual(validRoute.body.warnings.length > 0, true);
  assert.strictEqual(validRoute.body.diff.length > 0, true);
  assert.strictEqual(validRoute.body.riskSummary.hasBonusRisk, true);
  assert.strictEqual(validRoute.body.riskSummary.hasWithdrawRisk, true);
  assert.strictEqual(validRoute.body.riskSummary.hasEligibilityRisk, true);

  const invalidCases = [
    {
      label: "auditReason empty",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { title: "Audit Missing Promo" }),
          auditReason: "",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["auditReason is required"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
      routeErrors: ["auditReason is required"],
    },
    {
      label: "minDeposit negative",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { minDeposit: -1, title: "Min Negative Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["after.minDeposit must be non-negative"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["after.minDeposit must be non-negative"],
    },
    {
      label: "maxDeposit negative",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { maxDeposit: -1, title: "Max Negative Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["after.maxDeposit must be non-negative"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["after.maxDeposit must be non-negative"],
    },
    {
      label: "minDeposit greater than maxDeposit",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { minDeposit: 600, maxDeposit: 500, title: "Ordered Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["maxDeposit must be greater than or equal to minDeposit"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["maxDeposit must be greater than or equal to minDeposit"],
    },
    {
      label: "bonusValue negative",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { bonusValue: -5, title: "Bonus Negative Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["after.bonusValue must be non-negative"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["after.bonusValue must be non-negative"],
    },
    {
      label: "turnoverMultiplier negative",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { turnoverMultiplier: -2, title: "Turnover Negative Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["after.turnoverMultiplier must be non-negative"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["after.turnoverMultiplier must be non-negative"],
    },
    {
      label: "maxWithdraw negative",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { maxWithdraw: -10, title: "Withdraw Negative Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["after.maxWithdraw must be non-negative"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["after.maxWithdraw must be non-negative"],
    },
    {
      label: "startAt later than endAt",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), {
            startAt: "2026-07-10T00:00:00.000Z",
            endAt: "2026-07-01T00:00:00.000Z",
            title: "Window Promo",
          }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: true,
        },
      }),
      validatorErrors: ["startAt must not be later than endAt"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_VALIDATION_FAILED",
      routeErrors: ["startAt must not be later than endAt"],
    },
    {
      label: "bonusValue changed without risk acknowledgement",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { bonusValue: 26, title: "Bonus Ack Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: false,
        },
      }),
      validatorErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
      routeErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
    },
    {
      label: "turnoverMultiplier changed without risk acknowledgement",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { turnoverMultiplier: 4, title: "Turnover Ack Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: false,
        },
      }),
      validatorErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
      routeErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
    },
    {
      label: "maxWithdraw changed without risk acknowledgement",
      request: buildRequest({
        body: {
          before: Object.assign({}, basePromotion()),
          after: Object.assign({}, basePromotion(), { maxWithdraw: 230, title: "Withdraw Ack Promo" }),
          auditReason: "validation matrix smoke",
          riskAcknowledgement: false,
        },
      }),
      validatorErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
      routeStatus: 422,
      routeCode: "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
      routeErrors: ["riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes"],
    },
  ];

  for (const testCase of invalidCases) {
    assertValidatorError(testCase.label, testCase.request.body, testCase.validatorErrors);
    const route = assertRouteFailure(
      testCase.label,
      testCase.request,
      testCase.routeStatus,
      testCase.routeCode,
      testCase.routeErrors
    );
    assert.strictEqual(route.body.validator, "validatePromotionAdminWriteDryRun");
  }

  console.log("Backoffice promotion admin dry-run validation matrix smoke: PASS");
}

main();
