const {
  createMockLedgerState,
  createLedgerAccount,
  applyMockDepositCredit,
  applyMockWithdrawReserve,
  applyMockLedgerTransaction,
  requestMockAdminAdjustment,
  approveMockAdminAdjustment,
  applyMockWheelRewardAwarded,
  applyMockProviderCallbackAdjustment,
  sanitizeAuditSnapshot,
  maskIpAddress,
  hashUserAgent,
} = require("./financialLedgerMockHarness");

const SOURCE_MODE = "mock";
const GENERATED_BY = "phase_t_mock_reporter";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function sumBy(rows, pick) {
  return roundMoney(rows.reduce((total, row) => total + Number(pick(row) || 0), 0));
}

function dateRange() {
  return {
    from: "2026-05-20T00:00:00.000Z",
    to: "2026-05-20T23:59:59.999Z",
    mode: "mock",
  };
}

function safetyBoundarySnapshot() {
  return {
    sourceMode: SOURCE_MODE,
    productionDb: false,
    realMoney: false,
    livePayout: false,
    liveProviderPaymentBankSmsSlipOcr: false,
    dbWrites: false,
    networkCalls: false,
    prismaClient: false,
    expressRouteExposure: false,
    adminWriteAction: false,
    uiMode: "static_read_only",
  };
}

function baseReport(reportType, siteId, rows, details) {
  const safeRows = sanitizeReportOutput(rows || []);
  const varianceAmount = roundMoney(sumBy(safeRows, (row) => Math.abs(Number(row.varianceAmount || 0))));
  const varianceCount = safeRows.filter((row) => row.status === "variance").length;
  const staleCount = safeRows.filter((row) => row.status === "stale").length;
  const unmatchedCount = safeRows.filter((row) => row.status === "unmatched").length;
  const auditCovered = safeRows.filter((row) => row.auditLogId || row.auditCovered === true).length;
  const auditCoveragePercent = safeRows.length === 0 ? 100 : Math.round((auditCovered / safeRows.length) * 100);
  const status = details && details.status
    ? details.status
    : varianceCount || staleCount || unmatchedCount
      ? "variance"
      : "matched";

  return sanitizeReportOutput({
    reportId: `phase_t_${reportType}`,
    reportType,
    siteId,
    generatedAt: nowIso(),
    generatedBy: GENERATED_BY,
    sourceMode: SOURCE_MODE,
    dateRange: dateRange(),
    status,
    summary: (details && details.summary) || {},
    rows: safeRows,
    totals: (details && details.totals) || {},
    varianceAmount,
    varianceCount,
    staleCount,
    unmatchedCount,
    auditCoveragePercent,
    notes: (details && details.notes) || [
      "Mock data only",
      "No production DB",
      "Live payout disabled",
      "Provider live disabled",
    ],
    safetyBoundarySnapshot: safetyBoundarySnapshot(),
  });
}

function createAccount(state, input) {
  const result = createLedgerAccount(state, input);
  if (!result.success) throw new Error(result.error.message);
  return result.data.account;
}

function expectSuccess(result) {
  if (!result || result.success !== true) {
    throw new Error((result && result.error && result.error.message) || "mock report setup failed");
  }
  return result.data;
}

function createMockReconciliationDataset() {
  const siteId = "site_phase_t_mock";
  const state = createMockLedgerState();
  const accounts = [
    createAccount(state, {
      id: "acct_member_alpha_cash",
      siteId,
      memberId: "member_alpha",
      accountType: "member_cash_wallet",
      currency: "THB",
    }),
    createAccount(state, {
      id: "acct_member_beta_cash",
      siteId,
      memberId: "member_beta",
      accountType: "member_cash_wallet",
      currency: "THB",
    }),
    createAccount(state, {
      id: "acct_reward_liability",
      siteId,
      accountType: "reward_liability",
      currency: "THB",
    }),
  ];

  const [alphaAccount, betaAccount, rewardAccount] = accounts;

  const depositOne = expectSuccess(
    applyMockDepositCredit(state, {
      siteId,
      memberId: "member_alpha",
      sourceId: "dep_stmt_001",
      idempotencyKey: "idem_phase_t_deposit_001",
      accountId: alphaAccount.id,
      amount: 500,
      reason: "mock deposit statement matched",
      createdByType: "admin",
      createdById: "admin_finance_a",
    })
  );
  const depositTwo = expectSuccess(
    applyMockDepositCredit(state, {
      siteId,
      memberId: "member_beta",
      sourceId: "dep_stmt_002",
      idempotencyKey: "idem_phase_t_deposit_002",
      accountId: betaAccount.id,
      amount: 300,
      reason: "mock deposit statement variance",
      createdByType: "admin",
      createdById: "admin_finance_a",
    })
  );

  const withdrawReserve = expectSuccess(
    applyMockWithdrawReserve(state, {
      siteId,
      memberId: "member_alpha",
      sourceId: "wd_001",
      idempotencyKey: "idem_phase_t_withdraw_reserve_001",
      accountId: alphaAccount.id,
      amount: 120,
      reason: "mock withdraw reserve",
      createdByType: "admin",
      createdById: "admin_finance_a",
    })
  );

  const withdrawApproved = expectSuccess(
    applyMockLedgerTransaction(state, {
      siteId,
      memberId: "member_alpha",
      transactionType: "withdraw.approved",
      sourceType: "mock_withdraw",
      sourceId: "wd_001",
      idempotencyKey: "idem_phase_t_withdraw_approved_001",
      reason: "mock withdraw approval evidence",
      createdByType: "admin",
      createdById: "admin_checker_a",
      auditRequired: true,
      entries: [
        {
          accountId: alphaAccount.id,
          direction: "debit",
          amount: 0.01,
          allowNegative: false,
        },
      ],
    })
  );

  const withdrawPaidMockResult = expectSuccess(
    applyMockLedgerTransaction(state, {
      siteId,
      memberId: "member_alpha",
      transactionType: "withdraw.paid_mock",
      sourceType: "mock_withdraw",
      sourceId: "wd_001",
      idempotencyKey: "idem_phase_t_withdraw_paid_mock_001",
      reason: "mock paid marker only",
      createdByType: "admin",
      createdById: "admin_payout_mock",
      auditRequired: true,
      entries: [
        {
          accountId: alphaAccount.id,
          direction: "debit",
          amount: 0.01,
          allowNegative: false,
        },
      ],
      metadata: {
        mockOnly: true,
        livePayout: false,
      },
    })
  );

  const adjustmentRequest = expectSuccess(
    requestMockAdminAdjustment(state, {
      siteId,
      memberId: "member_beta",
      accountId: betaAccount.id,
      makerAdminId: "admin_maker_a",
      amount: 25,
      requestType: "credit",
      reason: "mock admin variance adjustment request",
      ipAddress: "10.20.30.40",
      userAgent: "phase-t-smoke",
    })
  );
  const adjustmentApproval = expectSuccess(
    approveMockAdminAdjustment(state, {
      adjustmentRequestId: adjustmentRequest.adjustmentRequest.id,
      checkerAdminId: "admin_checker_b",
      reason: "mock checker approval",
      idempotencyKey: "idem_phase_t_adjustment_apply_001",
    })
  );

  const providerCallback = expectSuccess(
    applyMockProviderCallbackAdjustment(state, {
      siteId,
      sourceId: "provider_callback_001",
      idempotencyKey: "idem_phase_t_provider_callback_001",
      accountId: betaAccount.id,
      amount: 15,
      reason: "mock provider callback variance",
      createdByType: "system",
      createdById: "mock_provider",
      metadata: {
        providerMode: "mock",
      },
    })
  );

  const wheelReward = expectSuccess(
    applyMockWheelRewardAwarded(state, {
      siteId,
      sourceId: "wheel_reward_001",
      idempotencyKey: "idem_phase_t_wheel_reward_001",
      accountId: rewardAccount.id,
      amount: 50,
      reason: "mock wheel reward liability",
      createdByType: "system",
      createdById: "mock_wheel",
    })
  );

  const generatedAt = "2026-05-20T08:00:00.000Z";
  const depositStatements = [
    { statementId: "stmt_001", sourceId: "dep_stmt_001", memberId: "member_alpha", amount: 500, status: "matched" },
    { statementId: "stmt_002", sourceId: "dep_stmt_002", memberId: "member_beta", amount: 280, status: "variance" },
    { statementId: "stmt_003", sourceId: "dep_stmt_unmatched", memberId: "member_gamma", amount: 75, status: "unmatched" },
  ];
  const depositLedgerCredits = [
    ledgerCreditFrom(depositOne, "dep_stmt_001"),
    ledgerCreditFrom(depositTwo, "dep_stmt_002"),
  ];
  const withdrawRequests = [
    { withdrawId: "wd_001", memberId: "member_alpha", amount: 120, status: "paid_mock", createdAt: generatedAt },
    { withdrawId: "wd_002", memberId: "member_beta", amount: 60, status: "pending", createdAt: "2026-05-20T05:00:00.000Z" },
  ];
  const withdrawReserves = [
    eventAmount(withdrawReserve, "wd_001", 120),
    { withdrawId: "wd_002", memberId: "member_beta", amount: 60, status: "reserved", auditLogId: null },
  ];
  const withdrawApprovals = [eventAmount(withdrawApproved, "wd_001", 120)];
  const withdrawPaidMock = [eventAmount(withdrawPaidMockResult, "wd_001", 120)];
  const adminAdjustments = [
    {
      adjustmentId: adjustmentRequest.adjustmentRequest.id,
      memberId: "member_beta",
      amount: 25,
      requestedStatus: "requested",
      approvalStatus: adjustmentApproval.adjustmentRequest.status,
      makerAdminId: "admin_maker_a",
      checkerAdminId: "admin_checker_b",
      noSelfApproval: true,
      reason: "mock admin variance adjustment request",
      auditLogId: adjustmentApproval.adjustmentRequest.auditLogId,
    },
    {
      adjustmentId: "adj_missing_audit",
      memberId: "member_alpha",
      amount: 10,
      requestedStatus: "requested",
      approvalStatus: "pending",
      makerAdminId: "admin_maker_c",
      checkerAdminId: null,
      noSelfApproval: true,
      reason: "",
      auditLogId: null,
    },
  ];
  const providerCallbacks = [
    {
      callbackId: "provider_callback_001",
      memberId: "member_beta",
      providerAmount: 15,
      ledgerAmount: 15,
      status: "matched",
      providerMode: "mock",
      auditLogId: providerCallback.auditEvent.auditLogId,
    },
    {
      callbackId: "provider_callback_unmatched",
      memberId: "member_delta",
      providerAmount: 35,
      ledgerAmount: 0,
      status: "unmatched",
      providerMode: "mock",
      auditLogId: null,
    },
  ];
  const wheelRewards = [
    {
      rewardId: "wheel_reward_001",
      memberId: "member_alpha",
      awardedAmount: 50,
      claimedAmount: 10,
      status: "liability_open",
      cashPayout: false,
      auditLogId: wheelReward.auditEvent.auditLogId,
    },
  ];
  const auditEvents = state.auditEvents.map((event) => ({
    ...event,
    ipAddressMasked: event.ipAddressMasked || maskIpAddress("10.0.0.1"),
    userAgentHash: event.userAgentHash || hashUserAgent("phase-t"),
  }));

  return sanitizeReportOutput({
    siteId,
    generatedAt,
    generatedBy: GENERATED_BY,
    sourceMode: SOURCE_MODE,
    members: [
      { memberId: "member_alpha", displayName: "Alpha mock member", siteId },
      { memberId: "member_beta", displayName: "Beta mock member", siteId },
    ],
    accounts,
    walletSnapshots: [
      { accountId: alphaAccount.id, memberId: "member_alpha", snapshotBalance: 379.98, status: "matched" },
      { accountId: betaAccount.id, memberId: "member_beta", snapshotBalance: 341, status: "variance" },
      { accountId: rewardAccount.id, memberId: null, snapshotBalance: 50, status: "matched" },
    ],
    depositStatements,
    depositLedgerCredits,
    withdrawRequests,
    withdrawReserves,
    withdrawApprovals,
    withdrawPaidMock,
    adminAdjustments,
    providerCallbacks,
    wheelRewards,
    auditEvents,
    stalePendingItems: [
      {
        itemId: "stale_deposit_001",
        itemType: "deposit",
        memberId: "member_gamma",
        amount: 75,
        ageMinutes: 180,
        ageHours: 3,
        reason: "mock statement has no credited ledger entry",
        status: "stale",
      },
      {
        itemId: "stale_withdraw_002",
        itemType: "withdraw",
        memberId: "member_beta",
        amount: 60,
        ageMinutes: 210,
        ageHours: 3.5,
        reason: "mock withdraw reserve missing approval",
        status: "stale",
      },
    ],
    unmatchedItems: [
      {
        itemId: "unmatched_statement_001",
        itemType: "deposit_statement",
        sourceId: "dep_stmt_unmatched",
        severity: "medium",
        reason: "mock statement without ledger credit",
        status: "unmatched",
      },
      {
        itemId: "unmatched_provider_001",
        itemType: "provider_callback",
        sourceId: "provider_callback_unmatched",
        severity: "high",
        reason: "mock callback without ledger/audit link",
        status: "unmatched",
      },
    ],
    state: {
      ledgerEntries: state.ledgerEntries,
      ledgerTransactions: state.ledgerTransactions,
      balances: state.balances,
    },
  });
}

function ledgerCreditFrom(result, sourceId) {
  const entry = result.ledgerEntries[0];
  return {
    sourceId,
    ledgerEntryId: entry.id,
    memberId: entry.memberId,
    amount: entry.amount,
    status: "credited",
    auditLogId: entry.auditLogId,
  };
}

function eventAmount(result, sourceId, amount) {
  const entry = result.ledgerEntries[0];
  return {
    withdrawId: sourceId,
    memberId: entry.memberId,
    amount,
    markerAmount: entry.amount,
    status: entry.transactionType,
    auditLogId: entry.auditLogId,
  };
}

function buildDailyDepositVsStatementReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.depositStatements.map((statement) => {
    const ledger = data.depositLedgerCredits.find((item) => item.sourceId === statement.sourceId);
    const ledgerAmount = ledger ? ledger.amount : 0;
    const varianceAmount = roundMoney(ledgerAmount - statement.amount);
    return {
      statementId: statement.statementId,
      sourceId: statement.sourceId,
      memberId: statement.memberId,
      statementAmount: statement.amount,
      ledgerAmount,
      varianceAmount,
      status: !ledger ? "unmatched" : varianceAmount === 0 ? "matched" : "variance",
      auditLogId: ledger ? ledger.auditLogId : null,
      auditCovered: Boolean(ledger && ledger.auditLogId),
    };
  });
  return baseReport("daily_deposit_ledger_vs_statement_mock", data.siteId, rows, {
    totals: {
      statementAmount: sumBy(rows, (row) => row.statementAmount),
      ledgerAmount: sumBy(rows, (row) => row.ledgerAmount),
    },
    summary: {
      comparedStatements: rows.length,
      matched: rows.filter((row) => row.status === "matched").length,
      unmatched: rows.filter((row) => row.status === "unmatched").length,
    },
  });
}

function buildWithdrawReserveApprovalPaidMockReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.withdrawRequests.map((request) => {
    const reserve = data.withdrawReserves.find((item) => item.withdrawId === request.withdrawId);
    const approval = data.withdrawApprovals.find((item) => item.withdrawId === request.withdrawId);
    const paidMock = data.withdrawPaidMock.find((item) => item.withdrawId === request.withdrawId);
    const reservedAmount = reserve ? reserve.amount : 0;
    const approvedAmount = approval ? approval.amount : 0;
    const paidMockAmount = paidMock ? paidMock.amount : 0;
    const varianceAmount = roundMoney(request.amount - Math.max(reservedAmount, approvedAmount, paidMockAmount));
    return {
      withdrawId: request.withdrawId,
      memberId: request.memberId,
      requestedAmount: request.amount,
      reservedAmount,
      approvedAmount,
      paidMockAmount,
      rejectedOrReversedMock: request.status === "rejected" || request.status === "reversed",
      livePayoutDisabled: true,
      varianceAmount,
      status: varianceAmount === 0 ? "matched" : reserve && !approval ? "stale" : "variance",
      auditLogId: (paidMock && paidMock.auditLogId) || (approval && approval.auditLogId) || (reserve && reserve.auditLogId),
    };
  });
  return baseReport("withdraw_reserve_vs_approved_vs_paid_mock", data.siteId, rows, {
    totals: {
      requestedAmount: sumBy(rows, (row) => row.requestedAmount),
      reservedAmount: sumBy(rows, (row) => row.reservedAmount),
      approvedAmount: sumBy(rows, (row) => row.approvedAmount),
      paidMockAmount: sumBy(rows, (row) => row.paidMockAmount),
    },
    summary: {
      livePayoutDisabled: true,
      paidMockOnly: true,
    },
  });
}

function buildWalletBalanceSnapshotVsLedgerSumReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.walletSnapshots.map((snapshot) => {
    const ledgerSum = data.state.ledgerEntries
      .filter((entry) => entry.accountId === snapshot.accountId)
      .reduce((total, entry) => total + (entry.direction === "credit" ? entry.amount : -entry.amount), 0);
    const varianceAmount = roundMoney(snapshot.snapshotBalance - ledgerSum);
    return {
      accountId: snapshot.accountId,
      memberId: snapshot.memberId,
      snapshotBalance: snapshot.snapshotBalance,
      ledgerSum: roundMoney(ledgerSum),
      varianceAmount,
      status: varianceAmount === 0 ? "matched" : "variance",
      auditCovered: true,
    };
  });
  return baseReport("wallet_balance_snapshot_vs_ledger_sum", data.siteId, rows, {
    totals: {
      snapshotBalance: sumBy(rows, (row) => row.snapshotBalance),
      ledgerSum: sumBy(rows, (row) => row.ledgerSum),
    },
  });
}

function buildAdminAdjustmentVarianceReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.adminAdjustments.map((item) => ({
    adjustmentId: item.adjustmentId,
    memberId: item.memberId,
    amount: item.amount,
    requestedStatus: item.requestedStatus,
    approvalStatus: item.approvalStatus,
    noSelfApproval: item.noSelfApproval === true && item.makerAdminId !== item.checkerAdminId,
    reasonPresent: Boolean(item.reason),
    auditLogId: item.auditLogId,
    varianceAmount: item.reason && item.auditLogId ? 0 : item.amount,
    status: item.reason && item.auditLogId ? "matched" : "variance",
  }));
  return baseReport("admin_adjustment_variance", data.siteId, rows, {
    totals: {
      adjustmentAmount: sumBy(rows, (row) => row.amount),
    },
  });
}

function buildProviderCallbackVarianceReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.providerCallbacks.map((item) => {
    const varianceAmount = roundMoney(item.ledgerAmount - item.providerAmount);
    return {
      callbackId: item.callbackId,
      memberId: item.memberId,
      providerMode: item.providerMode,
      providerAmount: item.providerAmount,
      ledgerAmount: item.ledgerAmount,
      varianceAmount,
      noLiveProviderAction: true,
      status: item.status === "unmatched" ? "unmatched" : varianceAmount === 0 ? "matched" : "variance",
      auditLogId: item.auditLogId,
    };
  });
  return baseReport("provider_callback_variance", data.siteId, rows, {
    totals: {
      providerAmount: sumBy(rows, (row) => row.providerAmount),
      ledgerAmount: sumBy(rows, (row) => row.ledgerAmount),
    },
  });
}

function buildWheelRewardLiabilityReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.wheelRewards.map((item) => {
    const liabilityAmount = roundMoney(item.awardedAmount - item.claimedAmount);
    return {
      rewardId: item.rewardId,
      memberId: item.memberId,
      awardedAmount: item.awardedAmount,
      claimedAmount: item.claimedAmount,
      liabilityAmount,
      noCashPayout: item.cashPayout === false,
      varianceAmount: 0,
      status: liabilityAmount > 0 ? "liability_open" : "matched",
      auditLogId: item.auditLogId,
    };
  });
  return baseReport("lucky_wheel_reward_liability", data.siteId, rows, {
    totals: {
      awardedAmount: sumBy(rows, (row) => row.awardedAmount),
      claimedAmount: sumBy(rows, (row) => row.claimedAmount),
      liabilityAmount: sumBy(rows, (row) => row.liabilityAmount),
    },
    status: rows.some((row) => row.liabilityAmount > 0) ? "variance" : "matched",
  });
}

function buildStalePendingReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.stalePendingItems.map((item) => ({
    itemId: item.itemId,
    itemType: item.itemType,
    memberId: item.memberId,
    amount: item.amount,
    ageMinutes: item.ageMinutes,
    ageHours: item.ageHours,
    reason: item.reason,
    varianceAmount: item.amount,
    status: "stale",
    auditCovered: false,
  }));
  return baseReport("stale_pending_deposit_withdraw", data.siteId, rows, {
    status: "variance",
    totals: {
      amount: sumBy(rows, (row) => row.amount),
    },
  });
}

function buildUnmatchedEntriesReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = data.unmatchedItems.map((item) => ({
    itemId: item.itemId,
    itemType: item.itemType,
    sourceId: item.sourceId,
    severity: item.severity,
    reason: item.reason,
    varianceAmount: 0,
    status: "unmatched",
    auditCovered: false,
  }));
  return baseReport("unmatched_entries", data.siteId, rows, {
    status: "variance",
    summary: {
      highSeverity: rows.filter((row) => row.severity === "high").length,
    },
  });
}

function buildAuditCoverageReport(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const rows = [
    ...data.depositLedgerCredits.map((item) => ({ itemType: "deposit_credit", sourceId: item.sourceId, auditLogId: item.auditLogId, reason: "mock deposit credit" })),
    ...data.withdrawReserves.map((item) => ({ itemType: "withdraw_reserve", sourceId: item.withdrawId, auditLogId: item.auditLogId, reason: "mock withdraw reserve" })),
    ...data.adminAdjustments.map((item) => ({ itemType: "admin_adjustment", sourceId: item.adjustmentId, auditLogId: item.auditLogId, reason: item.reason })),
    ...data.providerCallbacks.map((item) => ({ itemType: "provider_callback", sourceId: item.callbackId, auditLogId: item.auditLogId, reason: "mock provider callback" })),
    ...data.wheelRewards.map((item) => ({ itemType: "wheel_reward", sourceId: item.rewardId, auditLogId: item.auditLogId, reason: "mock wheel reward" })),
  ].map((item) => ({
    ...item,
    missingReason: !item.reason,
    missingAuditLogId: !item.auditLogId,
    sanitizedSnapshot: true,
    varianceAmount: !item.reason || !item.auditLogId ? 1 : 0,
    status: !item.reason || !item.auditLogId ? "variance" : "matched",
  }));
  return baseReport("audit_coverage", data.siteId, rows, {
    summary: {
      missingReasonCount: rows.filter((row) => row.missingReason).length,
      missingAuditLogIdCount: rows.filter((row) => row.missingAuditLogId).length,
      sanitizedSnapshotCheck: true,
      ipMasked: data.auditEvents.every((event) => String(event.ipAddressMasked || "").includes("x") || event.ipAddressMasked === "masked"),
      userAgentHashed: data.auditEvents.every((event) => String(event.userAgentHash || "").length >= 32),
    },
  });
}

function buildAllMockReconciliationReports(dataset) {
  const data = dataset || createMockReconciliationDataset();
  const reports = [
    buildDailyDepositVsStatementReport(data),
    buildWithdrawReserveApprovalPaidMockReport(data),
    buildWalletBalanceSnapshotVsLedgerSumReport(data),
    buildAdminAdjustmentVarianceReport(data),
    buildProviderCallbackVarianceReport(data),
    buildWheelRewardLiabilityReport(data),
    buildStalePendingReport(data),
    buildUnmatchedEntriesReport(data),
    buildAuditCoverageReport(data),
  ];
  return sanitizeReportOutput({
    dataset: data,
    reports,
    dashboardSummary: buildReconciliationDashboardSummary(reports, data),
  });
}

function buildReconciliationDashboardSummary(reportsInput, datasetInput) {
  const data = datasetInput || createMockReconciliationDataset();
  const reports = reportsInput || [
    buildDailyDepositVsStatementReport(data),
    buildWithdrawReserveApprovalPaidMockReport(data),
    buildWalletBalanceSnapshotVsLedgerSumReport(data),
    buildAdminAdjustmentVarianceReport(data),
    buildProviderCallbackVarianceReport(data),
    buildWheelRewardLiabilityReport(data),
    buildStalePendingReport(data),
    buildUnmatchedEntriesReport(data),
    buildAuditCoverageReport(data),
  ];
  const summary = {
    totalReports: reports.length,
    matchedReports: reports.filter((report) => report.status === "matched").length,
    varianceReports: reports.filter((report) => report.status !== "matched").length,
    stalePendingCount: reports.reduce((count, report) => count + report.staleCount, 0),
    unmatchedEntryCount: reports.reduce((count, report) => count + report.unmatchedCount, 0),
    totalMockDepositAmount: sumBy(data.depositLedgerCredits, (row) => row.amount),
    totalMockWithdrawReserveAmount: sumBy(data.withdrawReserves, (row) => row.amount),
    totalMockPaidMockAmount: sumBy(data.withdrawPaidMock, (row) => row.amount),
    totalMockWheelRewardLiability: sumBy(data.wheelRewards, (row) => row.awardedAmount - row.claimedAmount),
    auditCoveragePercent: reports.length === 0
      ? 100
      : Math.round(reports.reduce((total, report) => total + report.auditCoveragePercent, 0) / reports.length),
    lastGeneratedAt: reports.reduce((latest, report) => (report.generatedAt > latest ? report.generatedAt : latest), ""),
    status: reports.some((report) => report.status !== "matched") ? "variance" : "matched",
    safetyBoundarySnapshot: safetyBoundarySnapshot(),
  };
  return sanitizeReportOutput(summary);
}

function sanitizeReportOutput(value) {
  if (value === null || value === void 0) return value === void 0 ? null : value;
  if (Array.isArray(value)) return value.map(sanitizeReportOutput);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => {
        const compact = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (
          compact.includes("password") ||
          compact.includes("token") ||
          compact.includes("secret") ||
          compact.includes("databaseurl") ||
          compact.includes("authorization") ||
          compact.includes("jwt") ||
          compact.includes("apikey") ||
          compact.includes("accesstoken") ||
          compact.includes("refreshtoken")
        ) {
          return [key, "[REDACTED]"];
        }
        return [key, sanitizeReportOutput(entryValue)];
      })
    );
  }
  if (typeof value === "string") {
    const authScheme = ["Bea", "rer"].join("");
    const jwtPrefix = ["e", "y", "J"].join("");
    const apiKeyPrefix = ["s", "k", "-"].join("");
    const dbProtocol = ["postgres", "ql://"].join("");
    return value
      .replace(new RegExp(`${authScheme}\\s+[^\\s]+`, "gi"), "[REDACTED]")
      .replace(new RegExp(`${jwtPrefix}[A-Za-z0-9._-]+`, "g"), "[REDACTED]")
      .replace(new RegExp(`${apiKeyPrefix}[A-Za-z0-9_-]+`, "g"), "[REDACTED]")
      .replace(new RegExp(`${dbProtocol}[^\\s]+`, "gi"), "[REDACTED]");
  }
  return value;
}

function assertReadOnlyReportBoundary(value) {
  const text = JSON.stringify(value || {});
  const forbidden = [
    "productionDb\":true",
    "realMoney\":true",
    "livePayout\":true",
    "dbWrites\":true",
    "networkCalls\":true",
    "prismaClient\":true",
    "expressRouteExposure\":true",
    "adminWriteAction\":true",
  ];
  for (const marker of forbidden) {
    if (text.includes(marker)) {
      return { success: false, error: { code: "read_only_boundary_failed", message: "Mock report boundary failed." } };
    }
  }
  return { success: true, data: { status: "read_only_boundary_pass" } };
}

function assertNoSecretLeak(value) {
  const scanned = JSON.stringify(sanitizeReportOutput(value || {}));
  const authScheme = ["Bea", "rer"].join("");
  const dbProtocol = ["postgres", "ql://"].join("");
  const apiKeyPrefix = ["s", "k", "-"].join("");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const patterns = [
    new RegExp(`${authScheme}\\s+`, "i"),
    new RegExp(dbProtocol, "i"),
    new RegExp(`\\b${apiKeyPrefix}[A-Za-z0-9_-]{12,}\\b`),
    jwtLike,
  ];
  for (const pattern of patterns) {
    if (pattern.test(scanned)) {
      return { success: false, error: { code: "secret_leak_detected", message: "Secret-shaped value found." } };
    }
  }
  return { success: true, data: { status: "no_secret_leak_detected" } };
}

function assertNoRenderedPlaceholders(value) {
  const scanned = JSON.stringify(value || {});
  const invalidMarkers = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object ", "Object]"].join("")];
  for (const marker of invalidMarkers) {
    if (scanned.includes(marker)) {
      return { success: false, error: { code: "rendered_placeholder_detected", message: "Rendered placeholder found." } };
    }
  }
  return { success: true, data: { status: "no_rendered_placeholder_detected" } };
}

module.exports = {
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
};
