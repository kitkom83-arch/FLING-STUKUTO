"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  assertOroplayRuntimeRemainsDisabled,
  buildOroplayRuntimeDisabledGateSummary,
  evaluateOroplayRuntimeDisabledGate,
} = require("../game-provider-mock/oroplayCallbackRuntimeDisabledGate");
const {
  buildOroplayCallbackWalletCreditIntent,
  buildOroplayCallbackWalletDebitIntent,
  buildOroplayCallbackLedgerWriteIntent,
  buildOroplayCallbackReconciliationIntent,
  buildOroplayCallbackSanitizedLogIntent,
  executeOroplayCallbackRuntimeSkeleton,
  validateOroplayCallbackRuntimeImplementationSkeleton,
} = require("../game-provider-mock/oroplayCallbackRuntimeImplementationSkeleton");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const SKELETON_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_IMPLEMENTATION_SKELETON.md";
const DISABLED_GATE_DOC = "docs/OROPLAY_CALLBACK_STAGING_DISABLED_RUNTIME_GATE.md";
const SKELETON_FILE = "src/game-provider-mock/oroplayCallbackRuntimeImplementationSkeleton.js";
const DISABLED_GATE_FILE = "src/game-provider-mock/oroplayCallbackRuntimeDisabledGate.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackRuntimeImplementationSkeletonSmoke.js";
const NEW_FILES = [SKELETON_DOC, DISABLED_GATE_DOC, SKELETON_FILE, DISABLED_GATE_FILE, SMOKE_FILE];
const NEW_JS_FILES = [SKELETON_FILE, DISABLED_GATE_FILE, SMOKE_FILE];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function assertDocsAndRegistration() {
  const skeletonDoc = readRequired(SKELETON_DOC);
  const disabledGateDoc = readRequired(DISABLED_GATE_DOC);

  assertIncludes("ORO-4A skeleton doc", skeletonDoc, [
    "## purpose",
    "## scope",
    "## non-goals",
    "## disabled-by-default runtime skeleton",
    "## callback runtime not active",
    "## no-mutation guarantee",
    "## implementation boundaries",
    "## staged implementation path",
    "## certification gates required before activation",
    "## explicit no-mutation statement",
    "ORO-4A creates a disabled-by-default runtime implementation skeleton",
    "ORO-4A does not activate callback runtime behavior",
    "No `/api/balance` alias",
    "No `/api/transaction` alias",
    "walletMutationAllowed=false",
    "ledgerMutationAllowed=false",
    "prismaWriteAllowed=false",
    "aliasEnabled=false",
    "walletMutated=false",
    "ledgerMutated=false",
    "prismaWritten=false",
  ]);

  assertIncludes("ORO-4A disabled gate doc", disabledGateDoc, [
    "## purpose",
    "## disabled-by-default gate",
    "## documentation-only staging activation flag",
    "## no ENV change in this phase",
    "## no production activation",
    "## activation prerequisites",
    "## fail-closed behavior when runtime is not certified",
    "## safe diagnostics",
    "## no live runtime statement",
    "Missing runtime flag means disabled",
    "Certification evidence in mock input can only return staging-ready-only",
    "Production runtime can never be enabled in ORO-4A",
    "ORO-4A does not edit `.env` or `.env.example`",
  ]);

  readRequired(SKELETON_FILE);
  readRequired(DISABLED_GATE_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-implementation-skeleton"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeImplementationSkeletonSmoke.js",
    "package.json missing ORO-4A smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-4A registration", runner, [
    "oroplayCallbackRuntimeDisabledGate.js",
    "oroplayCallbackRuntimeImplementationSkeleton.js",
    "oroplayCallbackRuntimeImplementationSkeletonSmoke.js",
    "smoke:oroplay-callback-runtime-implementation-skeleton",
    "oroplayCallbackRuntimeImplementationSkeleton",
  ]);
}

function assertRuntimeGate() {
  const missing = evaluateOroplayRuntimeDisabledGate();
  assert.strictEqual(missing.gateStatus, "disabled", "default gate must be disabled.");
  assert.strictEqual(missing.decision, "disabled", "missing runtime flag must be disabled.");
  assert.strictEqual(missing.failClosed, true, "missing runtime flag must fail closed.");
  assert.strictEqual(missing.runtimeEnabled, false, "default gate must not enable runtime.");
  assert.strictEqual(missing.walletMutationAllowed, false, "default gate must block wallet mutation.");
  assert.strictEqual(missing.ledgerMutationAllowed, false, "default gate must block ledger mutation.");
  assert.strictEqual(missing.prismaWriteAllowed, false, "default gate must block Prisma write.");
  assert.strictEqual(missing.aliasEnabled, false, "default gate must block alias.");

  const enabledWithoutCertification = evaluateOroplayRuntimeDisabledGate({ runtimeFlag: "enabled" });
  assert.strictEqual(
    enabledWithoutCertification.decision,
    "fail_closed",
    "enabled flag without certification must fail closed."
  );
  assert(enabledWithoutCertification.blockedReasons.length > 0, "fail-closed gate must include blocked reasons.");

  const certifiedMock = evaluateOroplayRuntimeDisabledGate({
    runtimeFlag: "enabled",
    certificationMockPresent: true,
  });
  assert.strictEqual(certifiedMock.decision, "staging_ready_only", "certified mock input must be staging_ready_only.");
  assert.strictEqual(certifiedMock.runtimeEnabled, false, "certified mock input must not enable runtime.");
  assert.strictEqual(certifiedMock.productionEnabled, false, "certified mock input must not enable production.");
  assert.strictEqual(certifiedMock.walletMutationAllowed, false, "certified mock input must block wallet mutation.");
  assert.strictEqual(certifiedMock.ledgerMutationAllowed, false, "certified mock input must block ledger mutation.");
  assert.strictEqual(certifiedMock.prismaWriteAllowed, false, "certified mock input must block Prisma write.");
  assert.strictEqual(certifiedMock.aliasEnabled, false, "certified mock input must block alias.");

  const summary = buildOroplayRuntimeDisabledGateSummary({ env: { OROPLAY_CALLBACK_RUNTIME_ENABLED: "off" } });
  assert.strictEqual(summary.decision, "disabled", "injected off flag must be disabled.");
  assert.doesNotThrow(() => assertOroplayRuntimeRemainsDisabled({ runtimeFlag: "enabled" }));
}

function assertRuntimeSkeleton() {
  const validation = validateOroplayCallbackRuntimeImplementationSkeleton();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const debitIntent = buildOroplayCallbackWalletDebitIntent({
    memberId: "mock_member",
    amount: 10,
    currency: "THB",
    transactionCode: "mock_transaction",
  });
  assert.strictEqual(debitIntent.memberId, "mock_member", "debit intent memberId mismatch.");
  assert.strictEqual(debitIntent.amount, 10, "debit intent amount mismatch.");
  assert.strictEqual(debitIntent.currency, "THB", "debit intent currency mismatch.");
  assert.strictEqual(debitIntent.transactionCode, "mock_transaction", "debit intent transactionCode mismatch.");
  assert.strictEqual(debitIntent.beforeBalanceSource, "mock_only", "debit intent must use mock_only source.");
  assert.strictEqual(debitIntent.mutationAllowed, false, "debit intent must not allow mutation.");

  const creditIntent = buildOroplayCallbackWalletCreditIntent({
    memberId: "mock_member",
    amount: 20,
    currency: "THB",
    transactionCode: "mock_transaction",
  });
  assert.strictEqual(creditIntent.memberId, "mock_member", "credit intent memberId mismatch.");
  assert.strictEqual(creditIntent.amount, 20, "credit intent amount mismatch.");
  assert.strictEqual(creditIntent.currency, "THB", "credit intent currency mismatch.");
  assert.strictEqual(creditIntent.transactionCode, "mock_transaction", "credit intent transactionCode mismatch.");
  assert.strictEqual(creditIntent.mutationAllowed, false, "credit intent must not allow mutation.");

  const ledgerIntent = buildOroplayCallbackLedgerWriteIntent({ memberId: "mock_member", amount: 30 });
  assert.strictEqual(ledgerIntent.ledgerWriteAllowed, false, "ledger intent must not allow ledger write.");
  assert.strictEqual(ledgerIntent.reason, "runtime_not_activated", "ledger intent reason mismatch.");

  const reconciliationIntent = buildOroplayCallbackReconciliationIntent({ transactionCode: "mock_transaction" });
  assert.strictEqual(reconciliationIntent.mode, "mock_only", "reconciliation intent must be mock_only.");
  assert.strictEqual(reconciliationIntent.intentOnly, true, "reconciliation intent must be intent only.");
  assert.strictEqual(
    reconciliationIntent.reconciliationRecordWritten,
    false,
    "reconciliation intent must not write records."
  );

  const logPayload = { safeStatus: "intent_only", nested: {} };
  for (const key of [
    "authorization",
    "token",
    "password",
    "clientSecret",
    "client_secret",
    "DATABASE_URL",
    "PIN",
    "deviceId",
  ]) {
    logPayload[key] = `mock-redaction-${key.toLowerCase()}`;
    logPayload.nested[key] = `mock-nested-redaction-${key.toLowerCase()}`;
  }
  const sanitizedLog = buildOroplayCallbackSanitizedLogIntent({ payload: logPayload });
  for (const key of Object.keys(logPayload).filter((key) => key !== "nested" && key !== "safeStatus")) {
    assert.strictEqual(sanitizedLog.sanitizedPayload[key], "[REDACTED]", `${key} must be redacted.`);
    assert.strictEqual(sanitizedLog.sanitizedPayload.nested[key], "[REDACTED]", `nested ${key} must be redacted.`);
  }
  assert.strictEqual(sanitizedLog.sanitizedPayload.safeStatus, "intent_only", "safe log fields must remain.");

  const defaultExecution = executeOroplayCallbackRuntimeSkeleton();
  assert.strictEqual(defaultExecution.decision, "fail_closed", "default execution must fail closed.");
  assert.strictEqual(defaultExecution.walletMutated, false, "execution must not mutate wallet.");
  assert.strictEqual(defaultExecution.ledgerMutated, false, "execution must not mutate ledger.");
  assert.strictEqual(defaultExecution.prismaWritten, false, "execution must not write Prisma.");
  assert.strictEqual(defaultExecution.externalNetworkCalled, false, "execution must not call external network.");
  assert.strictEqual(defaultExecution.aliasEnabled, false, "execution must not enable alias.");

  const stagingReadyExecution = executeOroplayCallbackRuntimeSkeleton({
    runtimeFlag: "enabled",
    certificationMockPresent: true,
  });
  assert.strictEqual(stagingReadyExecution.decision, "staging_ready_only", "mock certification must not activate runtime.");
  assert.strictEqual(stagingReadyExecution.walletMutated, false, "staging-ready execution must not mutate wallet.");
  assert.strictEqual(stagingReadyExecution.ledgerMutated, false, "staging-ready execution must not mutate ledger.");
}

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const apiKeyShape = /\bsk-[A-Za-z0-9_-]{12,}\b/i;
  const databaseAssignment = /\bDATABASE_URL\s*=\s*["']?[A-Za-z0-9_./:@-]+/i;
  const credentialAssignment =
    /\b(?:clientSecret|client_secret|token|password|PIN|deviceId)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  const authBearerFixture = /\bAuthorization:\s*Bearer\s+[A-Za-z0-9_.-]{12,}/i;

  assert(!credentialUrl.test(scanned), `${label} contains credential URL.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!databaseAssignment.test(scanned), `${label} contains database URL assignment-shaped value.`);
  assert(!credentialAssignment.test(scanned), `${label} contains credential assignment-shaped value.`);
  assert(!authBearerFixture.test(scanned), `${label} contains Authorization Bearer fixture.`);
}

function assertSafetyStaticChecks() {
  const forbiddenRuntimePatterns = [
    /require\(["']@prisma\/client["']\)/i,
    /from\s+["']@prisma\/client["']/i,
    /require\(["'][^"']*wallet[^"']*["']\)/i,
    /require\(["'][^"']*ledger[^"']*["']\)/i,
    /from\s+["'][^"']*wallet[^"']*["']/i,
    /from\s+["'][^"']*ledger[^"']*["']/i,
    /\bfetch\s*\(/i,
    /\baxios\b/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
    /\bprisma\s*\.\s*\$transaction\s*\(/i,
    /\btransaction\s*\(\s*async\b/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
  ];

  for (const file of NEW_JS_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenRuntimePatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }

  for (const file of NEW_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function assertNoAliasEnabled() {
  const enabledValue = ["tr", "ue"].join("");
  const apiBalancePath = "/api/balance";
  const apiTransactionPath = "/api/transaction";
  for (const file of NEW_FILES) {
    const source = readRequired(file);
    assertNotIncludes(`${file} alias enabled markers`, source, [
      `balanceAliasEnabled: ${enabledValue}`,
      `transactionAliasEnabled: ${enabledValue}`,
      `aliasEnabled: ${enabledValue}`,
      `\`${apiBalancePath}\` alias enabled`,
      `\`${apiTransactionPath}\` alias enabled`,
    ]);
  }

  const app = readRequired("src/app.js");
  const route = readRequired("src/routes/oroplayCallbackStub.routes.js");
  assertNotIncludes("app.js provider alias mount", app, [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    '"/api/balance"',
    '"/api/transaction"',
  ]);
  assertNotIncludes("stub routes provider alias", route, [
    '"/api/balance"',
    '"/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]);
}

function assertOro2bFailClosed() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });

  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B stub must not report runtime success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B stub must remain fail-closed.");
    assert.strictEqual(response.safety.noWalletMutation, true, "ORO-2B stub must keep wallet mutation blocked.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "ORO-2B stub must keep ledger mutation blocked.");
  }
}

function assertStaticDocs() {
  assertIncludes("ORO-3E design freeze doc", readRequired("docs/OROPLAY_CALLBACK_IMPLEMENTATION_DESIGN_FREEZE.md"), [
    "ORO-4A callback runtime implementation skeleton current",
    "does not wire runtime implementation into live routes",
  ]);
  assertIncludes("ORO-3E staging plan doc", readRequired("docs/OROPLAY_CALLBACK_STAGING_ONLY_ACTIVATION_PLAN.md"), [
    "ORO-4A disabled runtime gate current",
    "staging activation flag remains documentation-only",
  ]);
  assertIncludes("ORO runtime readiness gate doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS_GATE.md"), [
    "ORO-4A skeleton current",
    "runtime implementation skeleton remains disabled by default",
  ]);
  assertIncludes("OroPlay callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-4A callback runtime implementation skeleton only",
    "no `/api/balance` alias",
    "no `/api/transaction` alias",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-4A current",
    "Callback runtime implementation skeleton is disabled by default",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-4A callback runtime implementation skeleton",
    "disabled-by-default runtime gate",
    "not wired into live routes",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-runtime-implementation-skeleton",
    "ORO-4A runtime skeleton coverage",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4A current/runtime implementation skeleton",
    "ORO-4B blocked until ORO-4A pass",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertRuntimeGate();
  assertRuntimeSkeleton();
  assertSafetyStaticChecks();
  assertNoAliasEnabled();
  assertOro2bFailClosed();
  assertStaticDocs();
  console.log("ORO-4A OroPlay callback runtime implementation skeleton smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4A OroPlay callback runtime implementation skeleton smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
