require("dotenv").config();

const { spawnSync } = require("child_process");

const {
  evaluateDbSafetyGuard,
  PROVIDER_MODE_KEYS,
} = require("../db-safety-tests/dbSafetyGuard");

const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox"]);
const SAFE_TARGET_MARKERS = ["local", "test", "testing", "stage", "staging", "sandbox", "qa"];
const PRODUCTION_MARKERS = ["prod", "production", "live", "primary", "main", "master"];
const DEFAULT_BASE_URL = "http://localhost:4000/api";
const RELATED_FILES = [
  "package.json",
  "README.md",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  "src/local-smoke-tests/promotionClaimSmoke.js",
  "src/local-smoke-tests/gameTransferSmoke.js",
  "src/local-smoke-tests/adminReportsConfigSmoke.js",
  "src/local-smoke-tests/bankModuleSmoke.js",
  "src/local-smoke-tests/adminPermissionSmoke.js",
  "src/local-smoke-tests/adminRoleManagementSmoke.js",
  "src/local-smoke-tests/adminWorkScheduleSmoke.js",
  "src/local-smoke-tests/adminWorkScheduleUiSmoke.js",
  "src/local-smoke-tests/adminAuditSecuritySmoke.js",
  "src/local-smoke-tests/adminWheelUiSmoke.js",
  "src/local-smoke-tests/adminWheelRuntimeSmoke.js",
  "src/local-smoke-tests/adminBrowserRoutesSmoke.js",
  "src/local-smoke-tests/stagingReleaseReadinessSmoke.js",
  "src/local-smoke-tests/projectCloseoutSmoke.js",
  "src/local-smoke-tests/productionReadinessAuditSmoke.js",
  "src/local-smoke-tests/productionSafetyDryRunSmoke.js",
  "src/local-smoke-tests/monitoringBackupRunbookSmoke.js",
  "src/local-smoke-tests/financialLedgerHardeningSmoke.js",
  "src/local-smoke-tests/financialLedgerRuntimeContractSmoke.js",
  "src/local-smoke-tests/financialLedgerSchemaDryRunSmoke.js",
  "src/local-smoke-tests/financialLedgerMockRuntimeHarnessSmoke.js",
  "src/local-smoke-tests/financialLedgerReconciliationMockReportsSmoke.js",
  "src/local-smoke-tests/financialLedgerLiveIntegrationCertificationSmoke.js",
  "src/local-smoke-tests/financialLedgerStagingDryRunMigrationSmoke.js",
  "src/ledger-mock/financialLedgerMockHarness.js",
  "src/ledger-mock/financialLedgerReconciliationMockReports.js",
  "src/admin-reconciliation-readonly-ui/index.html",
  "src/admin-reconciliation-readonly-ui/app.js",
  "src/admin-reconciliation-readonly-ui/style.css",
  "src/local-smoke-tests/wheelSmoke.js",
  "docs/PRODUCTION_READINESS_GAP_AUDIT.md",
  "docs/PRODUCTION_SAFETY_DRY_RUN.md",
  "docs/MONITORING_BACKUP_RUNBOOK.md",
  "docs/FINANCIAL_LEDGER_HARDENING_PLAN.md",
  "docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md",
  "docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md",
  "docs/FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md",
  "docs/FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md",
  "docs/FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md",
  "docs/LUCKY_WHEEL_E2E_LOCAL_RUNBOOK.md",
  "docs/PROJECT_CLOSEOUT.md",
  "docs/LUCKY_WHEEL_FINAL_UAT.md",
  "docs/ADMIN_OPERATOR_HANDOFF.md",
  "src/admin-wheel-ui/index.html",
  "src/admin-wheel-ui/app.js",
  "src/admin-wheel-ui/styles.css",
  "src/local-smoke-tests/stagingPreflight.js",
  "src/local-smoke-tests/stagingSmoke.js",
];
const SECRET_GREP_PATTERN = [
  ["postgres", "ql://[^:@]+:[^@]+@"].join(""),
  [["Be", "arer"].join(""), String.raw`\s+`].join(""),
  ["e", "y", "J"].join(""),
  ["s", "k", "-"].join(""),
  ["DATABASE", "_URL", String.raw`\s*=`].join(""),
].join("|");

const nodeCommand = process.execPath;
const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function npmArgs(args) {
  if (process.platform !== "win32") return args;
  return ["/d", "/s", "/c", ["npm", ...args].join(" ")];
}

const summary = [
  { key: "syntax", label: "syntax checks", status: "PENDING" },
  { key: "project", label: "project check", status: "PENDING" },
  { key: "promotion", label: "promotion-claim", status: "PENDING" },
  { key: "money", label: "money-flow", status: "PENDING" },
  { key: "core", label: "core-api", status: "PENDING" },
  { key: "gameTransfer", label: "game-transfer", status: "PENDING" },
  { key: "financial", label: "financial-negative", status: "PENDING" },
  { key: "adminReportsConfig", label: "admin-reports-config", status: "PENDING" },
  { key: "bankModule", label: "bank-module", status: "PENDING" },
  { key: "adminPermission", label: "admin-permission", status: "PENDING" },
  { key: "adminRoleManagement", label: "admin-role-management", status: "PENDING" },
  { key: "adminWorkSchedule", label: "admin-work-schedule", status: "PENDING" },
  { key: "adminWorkScheduleUi", label: "admin-work-schedule-ui", status: "PENDING" },
  { key: "adminAuditSecurity", label: "admin-audit-security", status: "PENDING" },
  { key: "adminWheelUi", label: "admin-wheel-ui", status: "PENDING" },
  { key: "adminWheelRuntime", label: "admin-wheel-runtime", status: "PENDING" },
  { key: "adminBrowserRoutes", label: "admin-browser-routes", status: "PENDING" },
  { key: "stagingReleaseReadiness", label: "staging-release-readiness", status: "PENDING" },
  { key: "productionReadinessAudit", label: "production-readiness-audit", status: "PENDING" },
  { key: "productionSafetyDryRun", label: "production-safety-dry-run", status: "PENDING" },
  { key: "monitoringBackupRunbook", label: "monitoring-backup-runbook", status: "PENDING" },
  { key: "financialLedgerHardening", label: "financial-ledger-hardening", status: "PENDING" },
  { key: "financialLedgerRuntimeContract", label: "financial-ledger-runtime-contract", status: "PENDING" },
  { key: "financialLedgerSchemaDryRun", label: "financial-ledger-schema-dry-run", status: "PENDING" },
  { key: "financialLedgerMockRuntimeHarness", label: "financial-ledger-mock-runtime-harness", status: "PENDING" },
  {
    key: "financialLedgerReconciliationMockReports",
    label: "financial-ledger-reconciliation-mock-reports",
    status: "PENDING",
  },
  {
    key: "financialLedgerLiveIntegrationCertification",
    label: "financial-ledger-live-integration-certification",
    status: "PENDING",
  },
  {
    key: "financialLedgerStagingDryRunMigration",
    label: "financial-ledger-staging-dry-run-migration",
    status: "PENDING",
  },
  { key: "wheel", label: "wheel", status: "PENDING" },
  { key: "projectCloseout", label: "project-closeout", status: "PENDING" },
  { key: "responseScan", label: "response leak scan", status: "PENDING" },
  { key: "secretGrep", label: "secret grep", status: "PENDING" },
  { key: "diff", label: "git diff --check", status: "PENDING" },
];

const steps = [
  {
    name: "node --check promotionClaimSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/promotionClaimSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check moneyFlowSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/moneyFlowSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check coreApiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/coreApiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check gameTransferSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/gameTransferSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialNegativeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialNegativeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminReportsConfigSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminReportsConfigSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check bankModuleSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/bankModuleSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminPermissionSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminPermissionSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminRoleManagementSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminRoleManagementSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWorkScheduleSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWorkScheduleSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWorkScheduleUiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWorkScheduleUiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminAuditSecuritySmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminAuditSecuritySmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWheelUiSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWheelUiSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminWheelRuntimeSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminWheelRuntimeSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check adminBrowserRoutesSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/adminBrowserRoutesSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingReleaseReadinessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingReleaseReadinessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check productionReadinessAuditSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/productionReadinessAuditSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check productionSafetyDryRunSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/productionSafetyDryRunSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check monitoringBackupRunbookSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/monitoringBackupRunbookSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerHardeningSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerHardeningSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerRuntimeContractSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerRuntimeContractSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerSchemaDryRunSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerSchemaDryRunSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerMockHarness",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/financialLedgerMockHarness.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerMockRuntimeHarnessSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerMockRuntimeHarnessSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerReconciliationMockReports",
    command: nodeCommand,
    args: ["--check", "src/ledger-mock/financialLedgerReconciliationMockReports.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check admin reconciliation readonly UI app",
    command: nodeCommand,
    args: ["--check", "src/admin-reconciliation-readonly-ui/app.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerReconciliationMockReportsSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerReconciliationMockReportsSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerLiveIntegrationCertificationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerLiveIntegrationCertificationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check financialLedgerStagingDryRunMigrationSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/financialLedgerStagingDryRunMigrationSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check wheelSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/wheelSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check projectCloseoutSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/projectCloseoutSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingPreflight",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingPreflight.js"],
    summaryKey: "syntax",
  },
  {
    name: "node --check stagingSmoke",
    command: nodeCommand,
    args: ["--check", "src/local-smoke-tests/stagingSmoke.js"],
    summaryKey: "syntax",
  },
  {
    name: "npm run check",
    command: npmCommand,
    args: npmArgs(["run", "check"]),
    summaryKey: "project",
  },
  {
    name: "npm run smoke:promotion-claim",
    command: npmCommand,
    args: npmArgs(["run", "smoke:promotion-claim"]),
    summaryKey: "promotion",
  },
  {
    name: "npm run smoke:money-flow",
    command: npmCommand,
    args: npmArgs(["run", "smoke:money-flow"]),
    summaryKey: "money",
  },
  {
    name: "npm run smoke:core-api",
    command: npmCommand,
    args: npmArgs(["run", "smoke:core-api"]),
    summaryKey: "core",
  },
  {
    name: "npm run smoke:game-transfer",
    command: npmCommand,
    args: npmArgs(["run", "smoke:game-transfer"]),
    summaryKey: "gameTransfer",
  },
  {
    name: "npm run smoke:financial-negative",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-negative"]),
    summaryKey: "financial",
  },
  {
    name: "npm run smoke:admin-reports-config",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-reports-config"]),
    summaryKey: "adminReportsConfig",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:bank-module",
    command: npmCommand,
    args: npmArgs(["run", "smoke:bank-module"]),
    summaryKey: "bankModule",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-permission",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-permission"]),
    summaryKey: "adminPermission",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-role-management",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-role-management"]),
    summaryKey: "adminRoleManagement",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-work-schedule",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-work-schedule"]),
    summaryKey: "adminWorkSchedule",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-work-schedule-ui",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-work-schedule-ui"]),
    summaryKey: "adminWorkScheduleUi",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-audit-security",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-audit-security"]),
    summaryKey: "adminAuditSecurity",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-wheel-ui",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-wheel-ui"]),
    summaryKey: "adminWheelUi",
  },
  {
    name: "npm run smoke:admin-wheel-runtime",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-wheel-runtime"]),
    summaryKey: "adminWheelRuntime",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:admin-browser-routes",
    command: npmCommand,
    args: npmArgs(["run", "smoke:admin-browser-routes"]),
    summaryKey: "adminBrowserRoutes",
  },
  {
    name: "npm run smoke:staging-release-readiness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:staging-release-readiness"]),
    summaryKey: "stagingReleaseReadiness",
  },
  {
    name: "npm run smoke:production-readiness-audit",
    command: npmCommand,
    args: npmArgs(["run", "smoke:production-readiness-audit"]),
    summaryKey: "productionReadinessAudit",
  },
  {
    name: "npm run smoke:production-safety-dry-run",
    command: npmCommand,
    args: npmArgs(["run", "smoke:production-safety-dry-run"]),
    summaryKey: "productionSafetyDryRun",
  },
  {
    name: "npm run smoke:monitoring-backup-runbook",
    command: npmCommand,
    args: npmArgs(["run", "smoke:monitoring-backup-runbook"]),
    summaryKey: "monitoringBackupRunbook",
  },
  {
    name: "npm run smoke:financial-ledger-hardening",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-hardening"]),
    summaryKey: "financialLedgerHardening",
  },
  {
    name: "npm run smoke:financial-ledger-runtime-contract",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-runtime-contract"]),
    summaryKey: "financialLedgerRuntimeContract",
  },
  {
    name: "npm run smoke:financial-ledger-schema-dry-run",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-schema-dry-run"]),
    summaryKey: "financialLedgerSchemaDryRun",
  },
  {
    name: "npm run smoke:financial-ledger-mock-runtime-harness",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-mock-runtime-harness"]),
    summaryKey: "financialLedgerMockRuntimeHarness",
  },
  {
    name: "npm run smoke:financial-ledger-reconciliation-mock-reports",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-reconciliation-mock-reports"]),
    summaryKey: "financialLedgerReconciliationMockReports",
  },
  {
    name: "npm run smoke:financial-ledger-live-integration-certification",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-live-integration-certification"]),
    summaryKey: "financialLedgerLiveIntegrationCertification",
  },
  {
    name: "npm run smoke:financial-ledger-staging-dry-run-migration",
    command: npmCommand,
    args: npmArgs(["run", "smoke:financial-ledger-staging-dry-run-migration"]),
    summaryKey: "financialLedgerStagingDryRunMigration",
  },
  {
    name: "npm run smoke:wheel",
    command: npmCommand,
    args: npmArgs(["run", "smoke:wheel"]),
    summaryKey: "wheel",
    alsoPass: ["responseScan"],
  },
  {
    name: "npm run smoke:project-closeout",
    command: npmCommand,
    args: npmArgs(["run", "smoke:project-closeout"]),
    summaryKey: "projectCloseout",
  },
  {
    name: "secret grep",
    command: "rg",
    args: [
      "-n",
      SECRET_GREP_PATTERN,
      "package.json",
      "README.md",
      "src/local-smoke-tests",
      "docs",
      ".github",
    ],
    summaryKey: "secretGrep",
    expectNoMatches: true,
  },
  {
    name: "git diff --check",
    command: "git",
    args: ["diff", "--check", "--", ...RELATED_FILES],
    summaryKey: "diff",
  },
];

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function hasAnyToken(value, markers) {
  const tokens = tokenize(value);
  return markers.some((marker) => tokens.includes(marker));
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isLoopbackHost(hostname) {
  const host = normalizeHost(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function ensureApiPath(baseUrl) {
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  const parsed = parseUrl(trimmed);
  if (!parsed) return trimmed;
  if (parsed.pathname === "" || parsed.pathname === "/") return `${trimmed}/api`;
  return trimmed;
}

function configuredHealthBaseUrl() {
  if (process.env.BASE_URL) return ensureApiPath(process.env.BASE_URL);
  if (process.env.CORE_API_BASE_URL) return ensureApiPath(process.env.CORE_API_BASE_URL);
  if (process.env.PUBLIC_API_BASE_URL) return ensureApiPath(process.env.PUBLIC_API_BASE_URL);
  return DEFAULT_BASE_URL;
}

function inspectDatabaseTarget(databaseUrl) {
  const parsed = typeof databaseUrl === "string" && databaseUrl.trim() ? parseUrl(databaseUrl.trim()) : null;
  if (!parsed) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must be set. Value is not printed." };
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    return { ok: false, localAllowed: false, reason: "DATABASE_URL must use PostgreSQL. Value is not printed." };
  }

  const targetParts = [parsed.hostname, parsed.pathname, parsed.username];
  if (targetParts.some((part) => hasAnyToken(part, PRODUCTION_MARKERS))) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL appears production-like and is blocked. Value is not printed.",
    };
  }

  const localAllowed = isLoopbackHost(parsed.hostname);
  const hasSafeMarker = targetParts.some((part) => hasAnyToken(part, SAFE_TARGET_MARKERS));
  if (!localAllowed && !hasSafeMarker) {
    return {
      ok: false,
      localAllowed: false,
      reason: "DATABASE_URL must target local/staging/test PostgreSQL. Value is not printed.",
    };
  }

  return { ok: true, localAllowed, reason: null };
}

function inspectApiBaseUrl(label, apiBaseUrl) {
  const parsed = parseUrl(apiBaseUrl);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, reason: `${label} must be a valid HTTP(S) URL.` };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: `${label} must not contain embedded credentials.` };
  }
  if (hasAnyToken(parsed.hostname, PRODUCTION_MARKERS)) {
    return { ok: false, reason: `${label} appears production-like and is blocked.` };
  }
  if (!isLoopbackHost(parsed.hostname) && !hasAnyToken(parsed.hostname, SAFE_TARGET_MARKERS)) {
    return { ok: false, reason: `${label} must target local/staging/test only.` };
  }
  return { ok: true, reason: null };
}

function normalizedGuardEnv() {
  const env = { ...process.env };
  for (const key of PROVIDER_MODE_KEYS) {
    if (!env[key]) env[key] = "mock";
  }
  return env;
}

function assertLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const databaseTarget = inspectDatabaseTarget(process.env.DATABASE_URL);
  const guardResult = evaluateDbSafetyGuard(normalizedGuardEnv());
  const urlEnvKeys = ["BASE_URL", "CORE_API_BASE_URL", "PUBLIC_API_BASE_URL"];

  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local or test.");
  }
  if (!process.env.LOCAL_ADMIN_PASSWORD) {
    reasons.push("LOCAL_ADMIN_PASSWORD must be set for local smoke tests.");
  }
  if (!process.env.JWT_SECRET) {
    reasons.push("JWT_SECRET must be set for local smoke tests.");
  }
  if (!databaseTarget.ok) {
    reasons.push(databaseTarget.reason);
  }

  for (const key of PROVIDER_MODE_KEYS) {
    const mode = String(process.env[key] || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      reasons.push(`${key} must be mock or sandbox for local smoke tests.`);
    }
  }

  for (const key of urlEnvKeys) {
    if (!process.env[key]) continue;
    const result = inspectApiBaseUrl(key, ensureApiPath(process.env[key]));
    if (!result.ok) reasons.push(result.reason);
  }

  for (const reason of guardResult.reasons) {
    const localMarkerReason = reason.startsWith("DATABASE_URL must include an explicit staging/test marker");
    if (localMarkerReason && databaseTarget.ok && databaseTarget.localAllowed) continue;
    reasons.push(reason);
  }

  if (reasons.length > 0) {
    throw new Error(`All local smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }

  console.log("All local smoke safety guard: PASS");
}

async function assertBackendHealth() {
  const baseUrl = configuredHealthBaseUrl();
  const healthUrl = `${baseUrl.replace(/\/+$/, "")}/health`;

  try {
    const response = await fetch(healthUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`health returned ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || payload.success !== true) {
      throw new Error("health response was not successful");
    }
  } catch (error) {
    throw new Error(
      `Backend local health check failed. Please open node src/server.js before running smoke. Detail: ${error.message}`
    );
  }

  console.log("Backend local health check: PASS");
}

function sensitiveEnvValues() {
  const sensitiveKeyPattern = /password|token|secret|key|authorization|database/i;
  return Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && typeof value === "string" && value.length >= 6)
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeOutput(value) {
  let text = String(value || "");
  for (const secretValue of sensitiveEnvValues()) {
    text = text.replace(new RegExp(escapeRegExp(secretValue), "g"), "[REDACTED]");
  }

  text = text.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DB_URL]");
  text = text.replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_JWT]");
  text = text.replace(new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "gi"), "[REDACTED_AUTH]");
  text = text.replace(new RegExp(`${["e", "y", "J"].join("")}[A-Za-z0-9_-]+`, "g"), "[REDACTED_TOKEN]");
  text = text.replace(new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9_-]+`, "g"), "[REDACTED_KEY]");
  return text;
}

function updateSummary(key, status) {
  const item = summary.find((entry) => entry.key === key);
  if (item) item.status = status;
}

function markSkippedAfterFailure() {
  for (const item of summary) {
    if (item.status === "PENDING") item.status = "SKIPPED";
  }
}

function printOutput(output, writer) {
  const sanitized = sanitizeOutput(output).trimEnd();
  if (sanitized) writer(sanitized);
}

function runStep(step) {
  console.log(`\n[RUN] ${step.name}`);
  const result = spawnSync(step.command, step.args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  printOutput(result.stdout, console.log);
  printOutput(result.stderr, console.error);

  if (result.error) {
    updateSummary(step.summaryKey, "FAIL");
    throw new Error(`${step.name} failed to start: ${result.error.message}`);
  }

  const exitCode = typeof result.status === "number" ? result.status : 1;
  const passed = step.expectNoMatches ? exitCode === 1 : exitCode === 0;
  if (!passed) {
    updateSummary(step.summaryKey, "FAIL");
    throw new Error(`${step.name} failed.`);
  }

  updateSummary(step.summaryKey, "PASS");
  for (const key of step.alsoPass || []) updateSummary(key, "PASS");
  console.log(`[PASS] ${step.name}`);
}

function printSummary(finalStatus) {
  console.log("\nSmoke all-local summary");
  for (const item of summary) {
    console.log(`- ${item.label}: ${item.status}`);
  }
  console.log(`- final result: ${finalStatus}`);
}

async function main() {
  let finalStatus = "FAIL";

  try {
    assertLocalSafety();
    await assertBackendHealth();

    for (const step of steps) {
      runStep(step);
    }

    finalStatus = "PASS";
  } catch (error) {
    console.error(sanitizeOutput(error.message));
    process.exitCode = 1;
  } finally {
    markSkippedAfterFailure();
    printSummary(finalStatus);
  }
}

main();
