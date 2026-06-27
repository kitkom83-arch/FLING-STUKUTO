"use strict";

const PROMOTION_ADMIN_DRY_RUN_API_CONTRACT = Object.freeze({
  endpoint: Object.freeze({
    method: "POST",
    path: "/api/admin/promotions/:id/dry-run",
    status: "contract_only_not_mounted",
  }),
  permissions: Object.freeze({
    currentReadPermission: "settings.promotion.view",
    futureDryRunPermissions: Object.freeze(["settings.promotion.write", "settings.promotion.manage"]),
  }),
  request: Object.freeze({
    bodyShape: Object.freeze({
      before: "plain object",
      after: "plain object",
      auditReason: "required string",
      riskAcknowledgement: "boolean",
    }),
    fields: Object.freeze([
      "title",
      "type",
      "status",
      "minDeposit",
      "maxDeposit",
      "bonusType",
      "bonusValue",
      "turnoverMultiplier",
      "maxWithdraw",
      "startAt",
      "endAt",
    ]),
    validatorLink: "validatePromotionAdminWriteDryRun",
  }),
  response: Object.freeze({
    successShape: Object.freeze({
      ok: true,
      mode: "dry_run",
      writeLocked: true,
      validator: "validatePromotionAdminWriteDryRun",
      diff: "array",
      riskSummary: "object",
      warnings: "array",
      errors: "array",
      audit: "object",
    }),
    errorShape: Object.freeze({
      ok: false,
      code: "string",
      message: "string",
      errors: "array",
    }),
  }),
  errorCodes: Object.freeze([
    "PROMOTION_DRY_RUN_VALIDATION_FAILED",
    "PROMOTION_DRY_RUN_AUDIT_REASON_REQUIRED",
    "PROMOTION_DRY_RUN_RISK_ACK_REQUIRED",
    "PROMOTION_DRY_RUN_FORBIDDEN",
    "PROMOTION_DRY_RUN_NOT_MOUNTED",
  ]),
  safetyInvariants: Object.freeze([
    "no DB write",
    "no promotion update",
    "no ledger creation",
    "no turnover creation",
    "no claim execution",
    "no runtime credit action",
    "no provider/payment/bank/SMS/slip OCR",
    "no production DB/deploy",
  ]),
});

function getPromotionAdminDryRunApiContract() {
  return PROMOTION_ADMIN_DRY_RUN_API_CONTRACT;
}

module.exports = {
  PROMOTION_ADMIN_DRY_RUN_API_CONTRACT,
  getPromotionAdminDryRunApiContract,
};
