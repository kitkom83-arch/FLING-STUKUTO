"use strict";

const { simulatePromotionAdminDryRunApi } = require("./promotionAdminDryRunApiStub");

const PREVIEW_SECTIONS = Object.freeze([
  "diff preview",
  "risk summary",
  "errors and warnings",
  "audit preview",
  "safety flags",
]);

function makeRequest(overrides, actorOverrides) {
  const base = {
    title: "New Year Promo",
    type: "deposit",
    status: "active",
    minDeposit: 100,
    maxDeposit: 500,
    bonusType: "fixed",
    bonusValue: 20,
    turnoverMultiplier: 3,
    maxWithdraw: 200,
    startAt: "2026-01-01T00:00:00.000Z",
    endAt: "2026-01-31T23:59:59.000Z",
  };

  return {
    params: { id: "promo-123" },
    body: {
      before: Object.assign({}, base),
      after: Object.assign({}, base, overrides && overrides.after ? overrides.after : {}),
      auditReason: overrides && overrides.auditReason,
      riskAcknowledgement: overrides && Object.prototype.hasOwnProperty.call(overrides, "riskAcknowledgement")
        ? overrides.riskAcknowledgement
        : undefined,
    },
    actor: Object.assign(
      {
        id: "admin-77",
        role: "finance",
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      },
      actorOverrides || {},
      overrides && overrides.actor ? overrides.actor : {}
    ),
  };
}

function previewSample(request) {
  return simulatePromotionAdminDryRunApi(request);
}

function buildPromotionAdminDryRunUiPreview() {
  const success = previewSample(
    makeRequest({
      after: { title: "New Year Promo Updated" },
      auditReason: "title refresh",
    })
  );

  const forbidden = previewSample(
    makeRequest(
      {
        after: { title: "No Permission Promo" },
        auditReason: "permission check",
      },
      {
        permissions: ["settings.promotion.view"],
      }
    )
  );

  const auditReasonRequired = previewSample(
    makeRequest(
      {
        after: { title: "Audit Reason Missing Promo" },
        auditReason: "   ",
      },
      {
        permissions: ["settings.promotion.view", "settings.promotion.write"],
      }
    )
  );

  const riskAcknowledgementRequired = previewSample(
    makeRequest({
      after: { bonusValue: 25 },
      auditReason: "bonus change",
    })
  );

  const validationFailed = previewSample(
    makeRequest({
      after: { bonusValue: -1 },
      auditReason: "negative bonus",
      riskAcknowledgement: true,
    })
  );

  return {
    title: "Promotion Admin Dry-run UI Preview",
    mode: "dry_run_ui_preview",
    writeLocked: true,
    routeMounted: false,
    apiCallEnabled: false,
    previewOnly: true,
    summary:
      "UI preview only, no API call, not mounted, write locked, validate-only, no DB write, no ledger creation, no turnover creation, and no claim execution.",
    safetyFlags: {
      noDbWrite: true,
      noLedgerCreation: true,
      noTurnoverCreation: true,
      noClaimExecution: true,
      noRuntimeCreditAction: true,
    },
    samples: {
      success,
      forbidden,
      auditReasonRequired,
      riskAcknowledgementRequired,
      validationFailed,
    },
    sections: PREVIEW_SECTIONS.slice(),
  };
}

module.exports = {
  buildPromotionAdminDryRunUiPreview,
};
