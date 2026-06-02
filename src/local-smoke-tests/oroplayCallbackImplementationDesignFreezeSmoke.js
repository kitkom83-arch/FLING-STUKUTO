"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildOroplayFrozenCallbackContract,
  buildOroplayFrozenRuntimeBoundaries,
  buildOroplayImplementationDesignFreezeSummary,
  evaluateOroplayImplementationDesignFreeze,
  validateOroplayCallbackImplementationDesignFreeze,
} = require("../game-provider-mock/oroplayCallbackImplementationDesignFreeze");
const {
  buildOroplayStagingFeatureFlagPlan,
  buildOroplayStagingActivationSummary,
  evaluateOroplayStagingActivationPlan,
  validateOroplayCallbackStagingActivationPlan,
} = require("../game-provider-mock/oroplayCallbackStagingActivationPlan");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const DESIGN_FREEZE_DOC = "docs/OROPLAY_CALLBACK_IMPLEMENTATION_DESIGN_FREEZE.md";
const STAGING_PLAN_DOC = "docs/OROPLAY_CALLBACK_STAGING_ONLY_ACTIVATION_PLAN.md";
const DESIGN_FREEZE_FILE = "src/game-provider-mock/oroplayCallbackImplementationDesignFreeze.js";
const STAGING_PLAN_FILE = "src/game-provider-mock/oroplayCallbackStagingActivationPlan.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackImplementationDesignFreezeSmoke.js";
const NEW_FILES = [DESIGN_FREEZE_DOC, STAGING_PLAN_DOC, DESIGN_FREEZE_FILE, STAGING_PLAN_FILE, SMOKE_FILE];

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
  const designDoc = readRequired(DESIGN_FREEZE_DOC);
  const stagingDoc = readRequired(STAGING_PLAN_DOC);

  assertIncludes("ORO-3E design freeze doc", designDoc, [
    "## purpose",
    "## non-goals",
    "## safety boundary",
    "## design freeze overview",
    "## frozen callback contract scope",
    "## frozen balance callback design",
    "## frozen transaction callback design",
    "## frozen auth boundary",
    "## frozen member mapping boundary",
    "## frozen idempotency boundary",
    "## frozen wallet bridge boundary",
    "## frozen ledger bridge boundary",
    "## frozen transaction log boundary",
    "## frozen reconciliation boundary",
    "## frozen audit boundary",
    "## frozen sanitized logging boundary",
    "## frozen response mapping",
    "## frozen error mapping",
    "## implementation change control",
    "## implementation blocker rules",
    "## runtime mutation still blocked",
    "## route alias still blocked",
    "## staging-only activation dependency",
    "## ORO-3F prerequisites",
    "## no live runtime statement",
    "## no runtime wallet mutation",
    "## no runtime ledger mutation",
    "## no Prisma write",
    "## no alias provider-compatible route enabled",
    "ORO-3E is design freeze / staging-only activation plan only",
    "ORO-3E does not open live callback runtime behavior",
    "ORO-3E does not debit, credit, update, or otherwise mutate wallet state",
    "ORO-3E does not create, update, insert, post, reverse, or otherwise mutate ledger state",
    "ORO-3E does not enable `/api/balance` or `/api/transaction`",
    "does not call external networks",
    "does not use production DB",
    "ORO-2B fail-closed stub closed",
    "ORO-2C callback readiness closed",
    "ORO-3A runtime simulation closed",
    "ORO-3B adapter contract closed",
    "ORO-3C execution plan closed",
    "ORO-3D readiness gate / certification closed",
    "ORO-3E freezes the implementation design but does not implement runtime mutation",
    "ORO-3F is blocked until ORO-3E passes",
  ]);

  assertIncludes("ORO-3E staging activation doc", stagingDoc, [
    "## purpose",
    "## non-goals",
    "## staging-only boundary",
    "## staging activation overview",
    "## staging prerequisites",
    "## staging environment assumptions",
    "## staging network assumptions",
    "## callback URL staging plan",
    "## provider whitelisting staging plan",
    "## callback auth staging plan",
    "## feature flag plan",
    "## route alias staging plan",
    "## wallet mutation staging gate",
    "## ledger mutation staging gate",
    "## DB write staging gate",
    "## idempotency staging gate",
    "## reconciliation staging gate",
    "## audit staging gate",
    "## monitoring staging gate",
    "## rollback staging plan",
    "## emergency disable plan",
    "## manual review plan",
    "## go/no-go checklist",
    "## production exclusion statement",
    "## ORO-3F prerequisites",
    "OROPLAY_CALLBACK_RUNTIME_ENABLED=false",
    "OROPLAY_CALLBACK_STAGING_ONLY=true",
    "OROPLAY_CALLBACK_ALIAS_BALANCE_ENABLED=false",
    "OROPLAY_CALLBACK_ALIAS_TRANSACTION_ENABLED=false",
    "OROPLAY_CALLBACK_WALLET_MUTATION_ENABLED=false",
    "OROPLAY_CALLBACK_LEDGER_MUTATION_ENABLED=false",
    "OROPLAY_CALLBACK_PRISMA_WRITE_ENABLED=false",
    "OROPLAY_CALLBACK_EXTERNAL_NETWORK_ENABLED=false",
    "OROPLAY_CALLBACK_LIVE_PROVIDER_ENABLED=false",
    "OROPLAY_CALLBACK_PRODUCTION_ENABLED=false",
    "documentation / future plan only",
    "not added to ENV",
    "Default behavior remains closed",
    "ORO-3F is blocked until ORO-3E passes",
    "Production activation is excluded",
  ]);

  readRequired(DESIGN_FREEZE_FILE);
  readRequired(STAGING_PLAN_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-implementation-design-freeze"],
    "node src/local-smoke-tests/oroplayCallbackImplementationDesignFreezeSmoke.js",
    "package.json missing ORO-3E smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-3E registration", runner, [
    "oroplayCallbackImplementationDesignFreeze.js",
    "oroplayCallbackStagingActivationPlan.js",
    "oroplayCallbackImplementationDesignFreezeSmoke.js",
    "smoke:oroplay-callback-implementation-design-freeze",
    "oroplayCallbackImplementationDesignFreeze",
  ]);
}

function assertDefaultDesignFreeze() {
  const validation = validateOroplayCallbackImplementationDesignFreeze();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const result = evaluateOroplayImplementationDesignFreeze();
  assert.strictEqual(result.phase, "ORO-3E", "design freeze phase mismatch.");
  assert.strictEqual(result.decision, "design_freeze_passed_runtime_blocked", "default design freeze decision mismatch.");
  assert.strictEqual(result.designFrozen, true, "design freeze must pass by default.");
  assert.strictEqual(result.runtimeImplemented, false, "runtime must not be implemented.");
  assert.strictEqual(result.runtimeEnabled, false, "runtime must not be enabled.");
  assert.strictEqual(result.mutationAllowed, false, "mutation must not be allowed.");
  assert.strictEqual(result.walletMutationAllowed, false, "wallet mutation must not be allowed.");
  assert.strictEqual(result.ledgerMutationAllowed, false, "ledger mutation must not be allowed.");
  assert.strictEqual(result.prismaWriteAllowed, false, "Prisma write must not be allowed.");
  assert.strictEqual(result.aliasEnabled, false, "alias must not be enabled.");
  assert.strictEqual(result.liveTrafficAllowed, false, "live traffic must not be allowed.");
  assert.strictEqual(result.productionAllowed, false, "production must not be allowed.");
  assert.strictEqual(result.externalNetworkAllowed, false, "external network must not be allowed.");
  assert.strictEqual(result.changeControlRequired, true, "change control must be required.");
  assert.strictEqual(result.nextPhase, "ORO-3F", "next phase must be ORO-3F.");

  for (const phase of ["ORO-2B", "ORO-2C", "ORO-3A", "ORO-3B", "ORO-3C", "ORO-3D"]) {
    assert(result.closedPhaseEvidence.some((item) => item.phase === phase && item.status === "closed"), `${phase} closed evidence missing.`);
  }

  const contract = buildOroplayFrozenCallbackContract();
  assert.strictEqual(contract.scope, "balance_and_transaction_callback_design_freeze", "frozen callback contract missing.");
  assert.strictEqual(contract.aliasEnabled, false, "frozen callback contract must block alias.");
  assert.strictEqual(contract.balanceCallback.walletMutationAllowed, false, "balance design must block wallet mutation.");
  assert.strictEqual(contract.transactionCallback.ledgerMutationAllowed, false, "transaction design must block ledger mutation.");

  const boundaries = buildOroplayFrozenRuntimeBoundaries();
  assert.strictEqual(boundaries.walletMutationAllowed, false, "wallet boundary must remain blocked.");
  assert.strictEqual(boundaries.ledgerMutationAllowed, false, "ledger boundary must remain blocked.");
  assert(boundaries.blockedRuntimeActions.length > 0, "blockedRuntimeActions must be populated.");
  assert(boundaries.requiredFutureApprovals.length > 0, "requiredFutureApprovals must be populated.");

  const summary = buildOroplayImplementationDesignFreezeSummary();
  assert.strictEqual(summary.decision, "design_freeze_passed_runtime_blocked", "summary decision mismatch.");
  assert.strictEqual(summary.runtimeEnabled, false, "summary must keep runtime blocked.");
}

function assertDesignFreezeDecisions() {
  const incomplete = evaluateOroplayImplementationDesignFreeze({ callbackContractFrozen: false });
  assert.strictEqual(incomplete.decision, "design_freeze_incomplete", "missing contract freeze must be incomplete.");

  const manualReview = evaluateOroplayImplementationDesignFreeze({ manualReviewRequired: true });
  assert.strictEqual(manualReview.decision, "manual_review_required", "manual review input must require manual review.");

  for (const flag of [
    "runtimeImplemented",
    "runtimeEnabled",
    "mutationAllowed",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "aliasEnabled",
    "liveTrafficAllowed",
    "productionAllowed",
    "externalNetworkAllowed",
  ]) {
    const result = evaluateOroplayImplementationDesignFreeze({ [flag]: true });
    assert.strictEqual(result.decision, "fail_closed", `${flag} must fail closed.`);
    assert(result.blockedReasons.length > 0, `${flag} must include blockedReasons.`);
    assert.strictEqual(result[flag], false, `${flag} output must remain false.`);
  }
}

function assertStagingActivationPlan() {
  const validation = validateOroplayCallbackStagingActivationPlan();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const plan = evaluateOroplayStagingActivationPlan();
  assert.strictEqual(plan.phase, "ORO-3E", "staging plan phase mismatch.");
  assert.strictEqual(plan.environment, "staging_only", "staging plan environment mismatch.");
  assert.strictEqual(plan.runtimeEnabled, false, "runtime must remain disabled.");
  assert.strictEqual(plan.stagingActivationAllowed, false, "staging activation must remain blocked.");
  assert.strictEqual(plan.productionActivationAllowed, false, "production activation must remain blocked.");
  assert.strictEqual(plan.aliasEnablementAllowed, false, "alias enablement must remain blocked.");
  assert.strictEqual(plan.walletMutationAllowed, false, "wallet mutation must remain blocked.");
  assert.strictEqual(plan.ledgerMutationAllowed, false, "ledger mutation must remain blocked.");
  assert.strictEqual(plan.prismaWriteAllowed, false, "Prisma write must remain blocked.");
  assert.strictEqual(plan.externalNetworkAllowed, false, "external network must remain blocked.");
  assert.strictEqual(plan.liveProviderAllowed, false, "live provider must remain blocked.");
  assert.strictEqual(plan.flagsDefaultClosed, true, "flags must default closed.");
  assert.strictEqual(plan.emergencyDisableRequired, true, "emergency disable plan is required.");
  assert.strictEqual(plan.monitoringRequired, true, "monitoring plan is required.");
  assert.strictEqual(plan.rollbackRequired, true, "rollback plan is required.");
  assert(plan.approvalsRequired.length > 0, "approvalsRequired must be populated.");
  assert(plan.blockedReasons.length > 0, "blockedReasons must be populated.");

  const flags = buildOroplayStagingFeatureFlagPlan();
  assert.strictEqual(flags.length, 10, "staging feature flag plan must include all documented flags.");
  assert(flags.every((flag) => flag.enabledNow === false), "all staging flags must be disabled now.");
  assert(flags.every((flag) => flag.documentationOnly === true), "all staging flags must be documentation-only.");
  assert(flags.every((flag) => flag.envChanged === false), "staging flags must not change ENV.");

  const summary = buildOroplayStagingActivationSummary();
  assert.strictEqual(summary.runtimeEnabled, false, "staging summary must keep runtime disabled.");
  assert.strictEqual(summary.stagingActivationAllowed, false, "staging summary must keep activation blocked.");

  for (const flag of [
    "productionActivationAllowed",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "aliasEnablementAllowed",
    "liveProviderAllowed",
    "externalNetworkAllowed",
  ]) {
    const result = evaluateOroplayStagingActivationPlan({ [flag]: true });
    assert.strictEqual(result.decision, "fail_closed", `${flag} must fail closed.`);
    assert(result.blockedReasons.length > 2, `${flag} must include blockedReasons.`);
    assert.strictEqual(result[flag], false, `${flag} output must remain false.`);
  }
}

function assertStaticDocs() {
  assertIncludes("ORO-3D readiness gate doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS_GATE.md"), [
    "ORO-3D closed",
    "ORO-3E implementation design freeze current",
    "readiness gate remains closed for runtime mutation",
  ]);
  assertIncludes("ORO-3D certification doc", readRequired("docs/OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION.md"), [
    "ORO-3D closed",
    "ORO-3E design freeze current",
    "certification is not runtime approval",
  ]);
  assertIncludes("ORO-3C execution plan doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN.md"), [
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E design freeze current",
    "execution plan remains no-mutation",
  ]);
  assertIncludes("ORO-3B adapter doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT.md"), [
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E design freeze current",
  ]);
  assertIncludes("ORO-3A simulation doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E design freeze current",
  ]);
  assertIncludes("ORO runtime readiness doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E current",
    "runtime mutation still blocked",
    "staging-only activation remains closed by default",
  ]);
  assertIncludes("OroPlay callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-3E design freeze / staging-only activation plan only",
    "ORO-2B fail-closed route remains default",
    "no runtime wallet/ledger mutation",
    "no provider-compatible alias enabled",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E current",
    "ORO-3F blocked until design freeze smoke passes",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-2B fail-closed route exists",
    "ORO-2C readiness contract closed",
    "ORO-3A runtime simulation closed",
    "ORO-3B adapter contract closed",
    "ORO-3C execution plan closed",
    "ORO-3D readiness gate closed",
    "ORO-3E design freeze / staging-only activation plan only",
    "not production runtime",
    "no alias enabled",
    "no runtime wallet/ledger mutation",
    "staging-only activation disabled by default",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-implementation-design-freeze",
    "design freeze coverage",
    "staging-only activation plan coverage",
    "feature flags default-closed coverage",
    "no mutation coverage",
    "no alias coverage",
    "no live traffic coverage",
  ]);
  assertIncludes("Phase roadmap", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-2B closed",
    "ORO-2C closed",
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D closed",
    "ORO-3E current/design freeze",
    "ORO-3F blocked until ORO-3E pass",
  ]);
}

function assertNoRuntimeMarkers() {
  const forbiddenPatterns = [
    /\bprisma\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany)\s*\(/i,
    /\bdb\.[A-Za-z0-9_]+\.(?:create|update|upsert|delete|deleteMany|createMany|updateMany|insert)\s*\(/i,
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
    /\b(?:autoCredit|payout)\s*\(/i,
    /\bfetch\s*\(/i,
    /\baxios\./i,
    /\bhttp\.request\s*\(/i,
    /\bhttps\.request\s*\(/i,
    /require\(["']@prisma\/client["']\)/i,
    /require\(["']http["']\)/i,
    /require\(["']https["']\)/i,
  ];

  for (const file of NEW_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertOro2bFailClosedAndAliasDisabled() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });
  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B stub must not report runtime success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B stub must remain fail-closed.");
    assert.strictEqual(response.safety.noWalletMutation, true, "ORO-2B stub must mark no wallet mutation.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "ORO-2B stub must mark no ledger mutation.");
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

function main() {
  assertDocsAndRegistration();
  assertDefaultDesignFreeze();
  assertDesignFreezeDecisions();
  assertStagingActivationPlan();
  assertStaticDocs();
  assertNoRuntimeMarkers();
  assertOro2bFailClosedAndAliasDisabled();
  console.log("ORO-3E OroPlay callback implementation design freeze smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-3E OroPlay callback implementation design freeze smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
