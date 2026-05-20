const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = path.join(ROOT, "docs", "FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md");
const REPORTS_PATH = path.join(ROOT, "src", "ledger-mock", "financialLedgerReconciliationMockReports.js");
const UI_DIR = path.join(ROOT, "src", "admin-reconciliation-readonly-ui");
const UI_INDEX_PATH = path.join(UI_DIR, "index.html");
const UI_APP_PATH = path.join(UI_DIR, "app.js");
const UI_STYLE_PATH = path.join(UI_DIR, "style.css");
const SMOKE_PATH = __filename;

const {
  createMockReconciliationDataset,
  buildReconciliationDashboardSummary,
  buildDailyDepositVsStatementReport,
  buildWithdrawReserveApprovalPaidMockReport,
  buildWalletBalanceSnapshotVsLedgerSumReport,
  buildAdminAdjustmentVarianceReport,
  buildProviderCallbackVarianceReport,
  buildWheelRewardLiabilityReport,
  buildStalePendingReport,
  buildUnmatchedEntriesReport,
  buildAuditCoverageReport,
  buildAllMockReconciliationReports,
  sanitizeReportOutput,
  assertReadOnlyReportBoundary,
  assertNoSecretLeak,
  assertNoRenderedPlaceholders,
} = require("../ledger-mock/financialLedgerReconciliationMockReports");

function readFile(filePath, label) {
  assert(fs.existsSync(filePath), `${label} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertDocContract(text) {
  assertIncludes("Phase T doc", text, [
    "Phase T",
    "NOT production ready",
    "reconciliation mock reports only",
    "admin read-only UI only",
    "mock/in-memory only",
    "no production DB",
    "no real money",
    "no live payout",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no Prisma migration",
    "no schema.prisma change",
    "no runtime route/controller/service integration",
  ]);

  assertNormalizedIncludes("Safety boundaries", text, [
    "Mock/staging/sandbox only",
    "No DB writes",
    "No external network calls",
    "No Prisma client usage",
    "No Express route exposure",
    "No frontend money calculation authority",
    "Read-only admin UI only",
    "No approve/reject/apply/reverse write action in UI",
  ]);

  assertNormalizedIncludes("Mock report scope", text, [
    "visualize ledger reconciliation status",
    "compare wallet snapshot vs mock ledger sum",
    "compare deposit credited vs mock statement",
    "compare withdraw reserved/approved/paid_mock",
    "show admin adjustment variance",
    "show provider callback variance",
    "show Lucky Wheel reward liability",
    "show stale pending items",
    "show unmatched entries",
    "show audit link coverage",
  ]);

  assertNormalizedIncludes("Report types", text, [
    "daily deposit ledger vs statement mock report",
    "withdraw reserve vs approved vs paid_mock report",
    "wallet balance snapshot vs ledger sum report",
    "admin adjustment variance report",
    "provider callback variance report",
    "Lucky Wheel reward liability report",
    "stale pending deposit/withdraw report",
    "unmatched entries report",
    "audit coverage report",
    "reconciliation dashboard summary",
  ]);

  assertNormalizedIncludes("Report data contract", text, [
    "reportId",
    "reportType",
    "siteId",
    "generatedAt",
    "generatedBy",
    "sourceMode = mock",
    "dateRange",
    "status",
    "summary",
    "rows",
    "totals",
    "varianceAmount",
    "varianceCount",
    "staleCount",
    "unmatchedCount",
    "auditCoveragePercent",
    "notes",
    "safetyBoundarySnapshot",
  ]);

  assertNormalizedIncludes("Dashboard summary contract", text, [
    "totalReports",
    "matchedReports",
    "varianceReports",
    "stalePendingCount",
    "unmatchedEntryCount",
    "totalMockDepositAmount",
    "totalMockWithdrawReserveAmount",
    "totalMockPaidMockAmount",
    "totalMockWheelRewardLiability",
    "auditCoveragePercent",
    "lastGeneratedAt",
  ]);

  assertNormalizedIncludes("UI contract", text, [
    "static/local read-only",
    "save button",
    "approve button",
    "reject button",
    "apply adjustment button",
    "reverse transaction button",
    "payout button",
    "live provider action",
    "Overview",
    "Deposits",
    "Withdrawals",
    "Wallet snapshots",
    "Provider variance",
    "Lucky Wheel liability",
    "Admin adjustments",
    "Stale pending",
    "Unmatched entries",
    "Audit coverage",
  ]);

  assertNormalizedIncludes("States and filters", text, [
    "ไม่พบข้อมูล",
    "Mock data only",
    "No production DB",
    "Live payout disabled",
    "Provider live disabled",
    "Reconciliation mismatch mock",
    "Stale pending mock",
    "Audit coverage warning mock",
    "date range mock",
    "report type filter mock",
    "status filter mock",
    "member/site filter mock",
    "search mock",
    "export preview mock only",
  ]);

  assertNormalizedIncludes("Phase U criteria", text, [
    "Phase U must not start",
    "mock reports module exists",
    "read-only UI exists",
    "smoke PASS",
    "no DB usage",
    "no Prisma usage",
    "no network call",
    "no route/controller/service integration",
    "no write/approve/reject/payout action in UI",
    "report contracts PASS",
    "empty/error state PASS",
    "audit redaction PASS",
    "no secret scan PASS",
    "no-live-payout boundary PASS",
    "no-production-DB boundary PASS",
  ]);

  assertIncludes("Next phases", text, ["Phase U", "Phase V", "Phase W", "Phase X"]);
}

function assertReportsModuleIsolation(text) {
  const forbiddenMarkers = [
    'require("prisma")',
    "Prisma" + "Client",
    "fet" + "ch(",
    "axios",
    "http.request",
    "https.request",
    "src/app.js",
    "src/server.js",
    "process.env",
    "DATA" + "BASE_URL" + "=",
  ];
  for (const marker of forbiddenMarkers) {
    assert(!text.includes(marker), `Reports module must not contain ${marker}.`);
  }
}

function assertUiStaticReadOnly(indexText, appText) {
  assertIncludes("UI index", indexText, [
    "Financial Reconciliation Mock Reports",
    "Phase T",
    "Read-only mock",
    "No production DB",
    "No real money",
    "Live payout disabled",
    "Overview",
    "Deposits",
    "Withdrawals",
    "Wallet snapshots",
    "Provider variance",
    "Lucky Wheel liability",
    "Admin adjustments",
    "Stale pending",
    "Unmatched entries",
    "Audit coverage",
  ]);
  assertIncludes("UI app", appText, ["Export preview only", "ไม่พบข้อมูล", "Mock data only", "No production DB"]);

  const forbiddenSource = [
    "fet" + "ch(",
    "axios",
    "localStorage",
    "XMLHttpRequest",
    "http.request",
    "https.request",
  ];
  for (const marker of forbiddenSource) {
    assert(!appText.includes(marker), `UI app must not contain ${marker}.`);
  }

  const actionWords = ["save", "approve", "reject", "apply", "reverse", "payout"];
  for (const word of actionWords) {
    const buttonActionPattern = new RegExp(`<button[^>]*>${word}|data-action=["']${word}`, "i");
    assert(!buttonActionPattern.test(indexText), `UI must not expose ${word} action.`);
    assert(!buttonActionPattern.test(appText), `UI app must not expose ${word} action.`);
  }
  for (const method of ["PO" + "ST", "PAT" + "CH", "DE" + "LETE"]) {
    const methodIntent = new RegExp(`\\b${method}\\b|method\\s*[:=]\\s*["']${method}`, "i");
    assert(!methodIntent.test(indexText), `UI index must not contain ${method} intent.`);
    assert(!methodIntent.test(appText), `UI app must not contain ${method} intent.`);
  }
}

function assertReportContract(report, expectedType) {
  const requiredFields = [
    "reportId",
    "reportType",
    "siteId",
    "generatedAt",
    "generatedBy",
    "sourceMode",
    "dateRange",
    "status",
    "summary",
    "rows",
    "totals",
    "varianceAmount",
    "varianceCount",
    "staleCount",
    "unmatchedCount",
    "auditCoveragePercent",
    "notes",
    "safetyBoundarySnapshot",
  ];
  for (const field of requiredFields) {
    assert(Object.prototype.hasOwnProperty.call(report, field), `${expectedType} missing ${field}.`);
  }
  assert.strictEqual(report.reportType, expectedType, `${expectedType} reportType mismatch.`);
  assert.strictEqual(report.sourceMode, "mock", `${expectedType} must be mock source mode.`);
  assert(Array.isArray(report.rows), `${expectedType} rows must be an array.`);
  assert(report.safetyBoundarySnapshot, `${expectedType} missing safety boundary snapshot.`);
  assert.strictEqual(report.safetyBoundarySnapshot.productionDb, false, `${expectedType} production DB boundary failed.`);
  assert.strictEqual(report.safetyBoundarySnapshot.livePayout, false, `${expectedType} live payout boundary failed.`);
}

function expectSuccess(label, result) {
  assert(result && result.success === true, `${label} expected success.`);
}

function assertDashboardSummary(summary) {
  const required = [
    "totalReports",
    "matchedReports",
    "varianceReports",
    "stalePendingCount",
    "unmatchedEntryCount",
    "totalMockDepositAmount",
    "totalMockWithdrawReserveAmount",
    "totalMockPaidMockAmount",
    "totalMockWheelRewardLiability",
    "auditCoveragePercent",
    "lastGeneratedAt",
  ];
  for (const field of required) {
    assert(Object.prototype.hasOwnProperty.call(summary, field), `Dashboard summary missing ${field}.`);
  }
  assert(summary.totalReports >= 9, "Dashboard summary should include all report types.");
  assert(summary.varianceReports >= 1, "Dashboard summary should show variance reports.");
}

function assertNoSecretShapedValues(text, label) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const mongoProtocol = ["mongo", "db://"].join("");
  const mongoSrvProtocol = ["mongo", "db+srv://"].join("");
  const openAiKey = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerJwt = new RegExp(`\\b${["Be", "arer"].join("")}\\s+${["e", "y", "J"].join("")}[A-Za-z0-9._-]+`, "i");
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains PostgreSQL URL protocol.`);
  assert(!lower.includes(mongoProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!lower.includes(mongoSrvProtocol), `${label} contains MongoDB URL protocol.`);
  assert(!bearerJwt.test(scanned), `${label} contains bearer credential-shaped text.`);
  assert(!openAiKey.test(scanned), `${label} contains API-key-shaped text.`);
  assert(!new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=\\s*actual`, "i").test(scanned), `${label} contains DB actual assignment.`);
  assert(!new RegExp(`${["Author", "ization"].join("")}:\\s*actual`, "i").test(scanned), `${label} contains auth actual marker.`);
  assert(!new RegExp(`\\b${["J", "WT"].join("")}\\s+actual\\b`, "i").test(scanned), `${label} contains credential actual marker.`);
  assert(!jwtLike.test(scanned), `${label} contains credential-shaped dotted text.`);
  assert(!longTokenLike.test(scanned), `${label} contains long credential-like text.`);
}

function assertNoRenderedMarkers(text, label) {
  const missingValueMarker = ["un", "defined"].join("");
  const invalidNumberMarker = ["N", "aN"].join("");
  const objectStringMarker = ["[object ", "Object]"].join("");
  const allowedCriterion = `${missingValueMarker}/${invalidNumberMarker}/${objectStringMarker} scan PASS`;
  const scanned = String(text || "").replace(allowedCriterion, "");
  for (const marker of [missingValueMarker, invalidNumberMarker, objectStringMarker]) {
    assert(!scanned.includes(marker), `${label} contains rendered marker: ${marker}`);
  }
}

function assertNoUnsafeEnablement(text, label) {
  const lower = normalize(text);
  const launchPhrase = ["production", "ready"].join(" ");
  const withoutAllowedStatus = lower.replace(new RegExp(`not ${launchPhrase}`, "g"), "");
  assert(!withoutAllowedStatus.includes(launchPhrase), `${label} contains unsafe launch wording.`);
  assert(!/live payout (enabled|on|active|allowed|approved)/i.test(text), `${label} contains unsafe payout wording.`);
  assert(!/production db (enabled|on|active|allowed|approved)/i.test(text), `${label} contains unsafe DB wording.`);
}

function main() {
  const docText = readFile(DOC_PATH, "docs/FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md");
  console.log("Financial ledger reconciliation mock reports doc exists: PASS");
  assertDocContract(docText);

  const reportsText = readFile(REPORTS_PATH, "src/ledger-mock/financialLedgerReconciliationMockReports.js");
  assertReportsModuleIsolation(reportsText);
  console.log("Reports module isolated from DB/network: PASS");

  const uiIndexText = readFile(UI_INDEX_PATH, "src/admin-reconciliation-readonly-ui/index.html");
  const uiAppText = readFile(UI_APP_PATH, "src/admin-reconciliation-readonly-ui/app.js");
  const uiStyleText = readFile(UI_STYLE_PATH, "src/admin-reconciliation-readonly-ui/style.css");
  assertUiStaticReadOnly(uiIndexText, uiAppText);
  console.log("Read-only admin UI static files exist: PASS");

  const dataset = createMockReconciliationDataset();
  const all = buildAllMockReconciliationReports(dataset);
  const dashboardSummary = buildReconciliationDashboardSummary(all.reports, dataset);
  assertDashboardSummary(dashboardSummary);
  console.log("Dashboard summary report: PASS");

  const depositReport = buildDailyDepositVsStatementReport(dataset);
  assertReportContract(depositReport, "daily_deposit_ledger_vs_statement_mock");
  assert(depositReport.rows.some((row) => row.status === "variance"), "Deposit report should show mock variance.");
  console.log("Deposit reconciliation report: PASS");

  const withdrawReport = buildWithdrawReserveApprovalPaidMockReport(dataset);
  assertReportContract(withdrawReport, "withdraw_reserve_vs_approved_vs_paid_mock");
  assert(withdrawReport.summary.livePayoutDisabled === true, "Withdraw report must keep live payout disabled.");
  console.log("Withdraw reconciliation report: PASS");

  const walletReport = buildWalletBalanceSnapshotVsLedgerSumReport(dataset);
  assertReportContract(walletReport, "wallet_balance_snapshot_vs_ledger_sum");
  assert(walletReport.rows.some((row) => row.status === "variance"), "Wallet snapshot report should show mock variance.");
  console.log("Wallet snapshot report: PASS");

  const adminReport = buildAdminAdjustmentVarianceReport(dataset);
  assertReportContract(adminReport, "admin_adjustment_variance");
  assert(adminReport.rows.every((row) => row.noSelfApproval === true), "Admin adjustment report must show no self-approval flag.");
  console.log("Admin adjustment variance report: PASS");

  const providerReport = buildProviderCallbackVarianceReport(dataset);
  assertReportContract(providerReport, "provider_callback_variance");
  assert(providerReport.rows.every((row) => row.noLiveProviderAction === true), "Provider report must be mock only.");
  console.log("Provider callback variance report: PASS");

  const wheelReport = buildWheelRewardLiabilityReport(dataset);
  assertReportContract(wheelReport, "lucky_wheel_reward_liability");
  assert(wheelReport.totals.liabilityAmount > 0, "Wheel liability report should show mock liability.");
  console.log("Lucky Wheel reward liability report: PASS");

  const staleReport = buildStalePendingReport(dataset);
  assertReportContract(staleReport, "stale_pending_deposit_withdraw");
  assert(staleReport.staleCount >= 1, "Stale pending report should include stale mock rows.");
  console.log("Stale pending report: PASS");

  const unmatchedReport = buildUnmatchedEntriesReport(dataset);
  assertReportContract(unmatchedReport, "unmatched_entries");
  assert(unmatchedReport.unmatchedCount >= 1, "Unmatched entries report should include unmatched mock rows.");
  console.log("Unmatched entries report: PASS");

  const auditReport = buildAuditCoverageReport(dataset);
  assertReportContract(auditReport, "audit_coverage");
  assert(auditReport.summary.sanitizedSnapshotCheck === true, "Audit report should confirm sanitized snapshots.");
  console.log("Audit coverage report: PASS");

  expectSuccess("read-only boundary", assertReadOnlyReportBoundary(all));
  console.log("Read-only report boundary: PASS");

  const sanitized = sanitizeReportOutput({
    password: "value",
    token: "value",
    secret: "value",
    [(["DATA", "BASE_URL"].join(""))]: "value",
    [(["Author", "ization"].join(""))]: ["Bea", "rer value"].join(""),
    [(["access", "Token"].join(""))]: "value",
    [(["refresh", "Token"].join(""))]: "value",
  });
  assert.strictEqual(sanitized.password, "[REDACTED]", "Password field must be redacted.");
  assert.strictEqual(sanitized.token, "[REDACTED]", "Token field must be redacted.");
  assert.strictEqual(sanitized.secret, "[REDACTED]", "Secret field must be redacted.");
  expectSuccess("audit/report output sanitized", assertNoSecretLeak(all));
  console.log("Audit/report output sanitized: PASS");

  const scannedTexts = [
    ["Phase T doc", docText],
    ["Reports module", reportsText],
    ["Phase T smoke", readFile(SMOKE_PATH, "financialLedgerReconciliationMockReportsSmoke.js")],
    ["UI index", uiIndexText],
    ["UI app", uiAppText],
    ["UI style", uiStyleText],
    ["Report output", JSON.stringify(all)],
  ];
  for (const [label, text] of scannedTexts) {
    assertNoSecretShapedValues(text, label);
    assertNoRenderedMarkers(text, label);
    assertNoUnsafeEnablement(text, label);
  }
  expectSuccess("rendered placeholder report scan", assertNoRenderedPlaceholders(all));
  console.log("Financial ledger reconciliation mock reports no secret scan: PASS");
  console.log("Financial ledger reconciliation mock reports rendered output scan: PASS");
  console.log("Financial ledger reconciliation mock reports no-live-payout boundary: PASS");
  console.log("Financial ledger reconciliation mock reports no-production-DB boundary: PASS");

  console.log("Financial ledger reconciliation mock reports smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Financial ledger reconciliation mock reports smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
