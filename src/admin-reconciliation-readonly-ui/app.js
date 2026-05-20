const tabs = [
  { id: "overview", label: "Overview" },
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "wallets", label: "Wallet snapshots" },
  { id: "provider", label: "Provider variance" },
  { id: "wheel", label: "Lucky Wheel liability" },
  { id: "adjustments", label: "Admin adjustments" },
  { id: "stale", label: "Stale pending" },
  { id: "unmatched", label: "Unmatched entries" },
  { id: "audit", label: "Audit coverage" },
];

const summary = {
  matchedReports: 3,
  varianceReports: 6,
  stalePending: 2,
  unmatchedEntries: 2,
  auditCoverage: "73%",
  liveTransfer: "disabled",
};

const reports = {
  overview: [
    { report: "Deposit ledger vs statement", status: "variance", rows: 3, variance: "20.00", note: "Reconciliation mismatch mock" },
    { report: "Withdraw reserve / checker / paid mock", status: "stale", rows: 2, variance: "60.00", note: "Live payout disabled" },
    { report: "Wallet snapshot vs ledger sum", status: "variance", rows: 3, variance: "1.00", note: "Mock data only" },
  ],
  deposits: [
    { source: "dep_stmt_001", member: "member_alpha", statement: "500.00", ledger: "500.00", status: "matched" },
    { source: "dep_stmt_002", member: "member_beta", statement: "280.00", ledger: "300.00", status: "variance" },
    { source: "dep_stmt_unmatched", member: "member_gamma", statement: "75.00", ledger: "0.00", status: "unmatched" },
  ],
  withdrawals: [
    { source: "wd_001", member: "member_alpha", requested: "120.00", reserved: "120.00", paidMock: "120.00", status: "matched" },
    { source: "wd_002", member: "member_beta", requested: "60.00", reserved: "60.00", paidMock: "0.00", status: "stale" },
  ],
  wallets: [
    { account: "acct_member_alpha_cash", member: "member_alpha", snapshot: "379.98", ledger: "379.98", status: "matched" },
    { account: "acct_member_beta_cash", member: "member_beta", snapshot: "341.00", ledger: "340.00", status: "variance" },
    { account: "acct_reward_liability", member: "-", snapshot: "50.00", ledger: "50.00", status: "matched" },
  ],
  provider: [
    { source: "provider_callback_001", member: "member_beta", mode: "mock", provider: "15.00", ledger: "15.00", status: "matched" },
    { source: "provider_callback_unmatched", member: "member_delta", mode: "mock", provider: "35.00", ledger: "0.00", status: "unmatched" },
  ],
  wheel: [
    { reward: "wheel_reward_001", member: "member_alpha", awarded: "50.00", claimed: "10.00", liability: "40.00", status: "liability_open" },
  ],
  adjustments: [
    { source: "mock_adjustment_0001", member: "member_beta", amount: "25.00", maker: "admin_maker_a", checker: "admin_checker_b", status: "matched" },
    { source: "adj_missing_audit", member: "member_alpha", amount: "10.00", maker: "admin_maker_c", checker: "-", status: "variance" },
  ],
  stale: [
    { source: "stale_deposit_001", type: "deposit", member: "member_gamma", age: "3h", reason: "Stale pending mock", status: "stale" },
    { source: "stale_withdraw_002", type: "withdraw", member: "member_beta", age: "3.5h", reason: "Stale pending mock", status: "stale" },
  ],
  unmatched: [
    { source: "dep_stmt_unmatched", type: "deposit_statement", severity: "medium", note: "Mock statement without ledger credit", status: "unmatched" },
    { source: "provider_callback_unmatched", type: "provider_callback", severity: "high", note: "Provider live disabled", status: "unmatched" },
  ],
  audit: [
    { source: "dep_stmt_001", type: "deposit_credit", audit: "mock_audit_0001", status: "matched" },
    { source: "wd_002", type: "withdraw_reserve", audit: "-", status: "variance" },
    { source: "adj_missing_audit", type: "admin_adjustment", audit: "-", status: "variance" },
  ],
};

let activeTab = "overview";

function text(value) {
  return String(value === null || value === void 0 ? "" : value);
}

function renderTabs() {
  const mount = document.getElementById("tabs");
  mount.innerHTML = tabs
    .map(
      (tab) =>
        `<button type="button" class="tab${tab.id === activeTab ? " active" : ""}" data-tab="${tab.id}">${tab.label}</button>`
    )
    .join("");
}

function renderOverview() {
  const cards = [
    ["matched reports", summary.matchedReports],
    ["variance reports", summary.varianceReports],
    ["stale pending", summary.stalePending],
    ["unmatched entries", summary.unmatchedEntries],
    ["audit coverage", summary.auditCoverage],
    ["live payout disabled", summary.liveTransfer],
  ];
  document.getElementById("overview").innerHTML = cards
    .map(([label, value]) => `<article class="summary-card"><span>${label}</span><strong>${value}</strong></article>`)
    .join("");
}

function filteredRows() {
  const status = document.getElementById("statusFilter").value;
  const query = document.getElementById("search").value.trim().toLowerCase();
  return (reports[activeTab] || []).filter((row) => {
    const statusMatch = status === "all" || row.status === status;
    const queryMatch = !query || Object.values(row).some((value) => text(value).toLowerCase().includes(query));
    return statusMatch && queryMatch;
  });
}

function renderTable() {
  const rows = filteredRows();
  const mount = document.getElementById("tableMount");
  if (rows.length === 0) {
    mount.innerHTML = '<div class="empty">ไม่พบข้อมูล · Mock data only · No production DB</div>';
    return;
  }

  const columns = Object.keys(rows[0]);
  const head = columns.map((column) => `<th>${column}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => {
            const value = text(row[column]);
            if (column === "status") return `<td><span class="badge status ${value}">${value}</span></td>`;
            return `<td>${value}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  mount.innerHTML = `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function render() {
  renderTabs();
  renderOverview();
  renderTable();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

document.getElementById("tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button) return;
  activeTab = button.dataset.tab;
  render();
});

document.getElementById("dateRange").addEventListener("change", renderTable);
document.getElementById("statusFilter").addEventListener("change", renderTable);
document.getElementById("search").addEventListener("input", renderTable);
document.getElementById("exportPreview").addEventListener("click", () => showToast("Export preview only"));

render();
