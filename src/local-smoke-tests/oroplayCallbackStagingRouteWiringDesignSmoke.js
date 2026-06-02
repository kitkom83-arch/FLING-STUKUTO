"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS,
  assertOroplayRouteWiringDesignNoAliasEnabled,
  assertOroplayRouteWiringDesignNoExpressMount,
  assertOroplayRouteWiringDesignNoMutation,
  assertOroplayRouteWiringDesignNoNetwork,
  assertOroplayRouteWiringDesignNoPrismaWrite,
  buildOroplayStagingRollbackPlan,
  buildOroplayStagingRouteActivationGate,
  buildOroplayStagingRouteMountContract,
  buildOroplayStagingRouteWiringPlan,
  validateOroplayStagingRouteWiringDesign,
} = require("../game-provider-mock/oroplayCallbackStagingRouteWiringDesign");
const {
  buildOroplayCallbackStagingRouteWiringFixtures,
  buildOroplayCallbackStagingRouteWiringProofFlags,
} = require("../game-provider-mock/oroplayCallbackStagingRouteWiringFixtures");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");
const { evaluateOroplayRuntimeDisabledGate } = require("../game-provider-mock/oroplayCallbackRuntimeDisabledGate");
const {
  buildOroplayStagingWiringPrecheck,
  validateOroplayStagingWiringPrecheck,
} = require("../game-provider-mock/oroplayCallbackStagingWiringPrecheck");
const {
  invokeOroplayRuntimeSkeletonShadow,
  validateOroplayShadowInvocationDecision,
} = require("../game-provider-mock/oroplayCallbackRuntimeShadowInvoker");
const {
  invokeOroplayShadowEnvelopeFlow,
  validateOroplayRequestResponseEnvelope,
} = require("../game-provider-mock/oroplayCallbackRequestResponseEnvelope");
const {
  runOroplayControllerFacadeDryRunFlow,
  validateOroplayControllerFacadeDryRun,
} = require("../game-provider-mock/oroplayCallbackControllerFacadeDryRun");

const ROOT = path.resolve(__dirname, "..", "..");
const DESIGN_DOC = "docs/OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN.md";
const DESIGN_HELPER = "src/game-provider-mock/oroplayCallbackStagingRouteWiringDesign.js";
const DESIGN_FIXTURES = "src/game-provider-mock/oroplayCallbackStagingRouteWiringFixtures.js";
const DESIGN_SMOKE = "src/local-smoke-tests/oroplayCallbackStagingRouteWiringDesignSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const NEW_FILES = [DESIGN_DOC, DESIGN_HELPER, DESIGN_FIXTURES, DESIGN_SMOKE];
const NEW_MOCK_FILES = [DESIGN_HELPER, DESIGN_FIXTURES];

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

function scenarioByName(name) {
  const scenario = buildOroplayCallbackStagingRouteWiringFixtures().find((entry) => entry.name === name);
  assert(scenario, `missing scenario ${name}.`);
  return scenario;
}

function assertDocsAndRegistration() {
  const doc = readRequired(DESIGN_DOC);
  const helper = readRequired(DESIGN_HELPER);
  readRequired(DESIGN_FIXTURES);

  assertIncludes("ORO-4F design doc", doc, [
    "## ORO-4F scope",
    "## staging route wiring design purpose",
    "## design contract vs real route wiring",
    "## future staging-only route paths",
    "## public alias policy",
    "## required activation gates",
    "## callback auth requirement",
    "## idempotency requirement",
    "## ledger/reconciliation guard requirement",
    "## sanitized log requirement",
    "## rollback / kill switch requirement",
    "## monitoring requirement",
    "## no Express route mount proof",
    "## no src/app.js edit proof",
    "## no alias proof",
    "## no wallet mutation proof",
    "## no ledger mutation proof",
    "## no Prisma write proof",
    "## no external network proof",
    "## future implementation checklist",
    "## explicit no-real-money boundary",
    "/api/oroplay/balance is documented as future-only",
    "/api/oroplay/transaction is documented as future-only",
    "/api/balance remains disabled",
    "/api/transaction remains disabled",
    "expressRouteMounted=false",
    "publicAliasMounted=false",
    "runtimeWiredToLiveRoute=false",
    "activationAllowed=false",
    "walletMutationAllowed=false",
    "ledgerMutationAllowed=false",
    "prismaWriteAllowed=false",
    "externalNetworkAllowed=false",
    "productionConfigTouched=false",
    "No src/app.js changes required by this phase.",
  ]);

  assertIncludes("staging route wiring helper exports", helper, [
    "OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS",
    "buildOroplayStagingRouteWiringPlan",
    "buildOroplayStagingRouteMountContract",
    "buildOroplayStagingRouteActivationGate",
    "buildOroplayStagingRollbackPlan",
    "validateOroplayStagingRouteWiringDesign",
    "assertOroplayRouteWiringDesignNoExpressMount",
    "assertOroplayRouteWiringDesignNoAliasEnabled",
    "assertOroplayRouteWiringDesignNoMutation",
    "assertOroplayRouteWiringDesignNoNetwork",
    "assertOroplayRouteWiringDesignNoPrismaWrite",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-route-wiring-design"],
    "node src/local-smoke-tests/oroplayCallbackStagingRouteWiringDesignSmoke.js",
    "package.json missing ORO-4F smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4F registration", runner, [
    "oroplayCallbackStagingRouteWiringDesign.js",
    "oroplayCallbackStagingRouteWiringFixtures.js",
    "oroplayCallbackStagingRouteWiringDesignSmoke.js",
    "smoke:oroplay-callback-staging-route-wiring-design",
    "oroplayCallbackStagingRouteWiringDesign",
    "docs/OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN.md",
  ]);

  assertIncludes("ORO-4F coverage docs", readRequired("docs/SMOKE_COVERAGE.md"), [
    "ORO-4F OroPlay Callback Staging Route Wiring Design Coverage",
    "smoke:oroplay-callback-staging-route-wiring-design",
  ]);
  assertIncludes("ORO-4F roadmap docs", readRequired("docs/PHASE_ROADMAP.md"), [
    "ORO-4F current/staging route wiring design",
    "Staging Route Wiring Design Contract",
  ]);
  assertIncludes("ORO-4F API mapping docs", readRequired("docs/API_MAPPING.md"), [
    "ORO-4F callback staging route wiring design",
  ]);
  assertIncludes("ORO-4F integration plan docs", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-4F Current",
    "Staging Route Wiring Design Contract",
  ]);
}

function assertFixtureSet() {
  const names = new Set(buildOroplayCallbackStagingRouteWiringFixtures().map((scenario) => scenario.name));
  for (const name of [
    "staging route plan keeps /api/oroplay/balance as future staging path only",
    "staging route plan keeps /api/oroplay/transaction as future staging path only",
    "public alias /api/balance remains disabled",
    "public alias /api/transaction remains disabled",
    "Express mount remains false",
    "src/app.js remains untouched by this phase",
    "ORO-2B fail-closed route preserved",
    "ORO-4A disabled gate preserved",
    "ORO-4E facade remains dry-run only",
    "rollback plan exists",
    "activation blockers exist",
    "sanitized log requirement exists",
    "proof flags all false",
  ]) {
    assert(names.has(name), `missing fixture scenario: ${name}`);
  }
}

function assertDesignContract() {
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.phase, "ORO-4F");
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.designContractOnly, true);
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.expressRouteMounted, false);
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN_STATUS.activationAllowed, false);

  const plan = buildOroplayStagingRouteWiringPlan();
  assert.strictEqual(plan.futureStagingPaths.balance, "/api/oroplay/balance");
  assert.strictEqual(plan.futureStagingPaths.transaction, "/api/oroplay/transaction");
  assert.strictEqual(plan.publicAliasPaths.balance, "/api/balance");
  assert.strictEqual(plan.publicAliasPaths.transaction, "/api/transaction");
  assert.strictEqual(plan.publicAliasesDisabled, true);
  assert.strictEqual(plan.noAppJsChangeRequired, true);
  assert.strictEqual(plan.srcAppJsTouched, false);
  assert.strictEqual(plan.oro2bFailClosedRoutePreserved, true);
  assert.strictEqual(plan.oro4aDisabledGatePreserved, true);
  assert.strictEqual(plan.oro4bStagingPrecheckPreserved, true);
  assert.strictEqual(plan.oro4cShadowInvocationPreserved, true);
  assert.strictEqual(plan.oro4dEnvelopeMapperPreserved, true);
  assert.strictEqual(plan.oro4eFacadeDryRunPreserved, true);

  const mountContract = buildOroplayStagingRouteMountContract();
  assert.strictEqual(mountContract.srcAppJsEditRequired, false, "src/app.js must not be required.");
  assert.strictEqual(mountContract.srcAppJsTouched, false, "src/app.js must remain untouched by contract.");
  assert.strictEqual(mountContract.routeFileCreated, false, "route file must not be created by ORO-4F.");
  assert.strictEqual(mountContract.controllerFileCreated, false, "controller file must not be created by ORO-4F.");
  for (const entry of mountContract.routeMounts) {
    assert.strictEqual(entry.futureOnly, true, `${entry.callbackType} path must be future-only.`);
    assert.strictEqual(entry.expressRouteMounted, false, `${entry.callbackType} Express mount must stay false.`);
    assert.strictEqual(entry.publicAliasMounted, false, `${entry.callbackType} alias mount must stay false.`);
    assert.strictEqual(entry.publicAliasEnabled, false, `${entry.callbackType} alias enablement must stay false.`);
  }

  const activationGate = buildOroplayStagingRouteActivationGate();
  assert.strictEqual(activationGate.activationAllowed, false, "activation must stay false.");
  for (const gate of [
    "manual approval required",
    "staging env only",
    "certified runtime flag required",
    "callback auth configured",
    "idempotency guard verified",
    "ledger/reconciliation guard verified",
    "rollback switch verified",
    "sanitized log verified",
    "no production deployment",
  ]) {
    assert(activationGate.requiredFutureGates.includes(gate), `missing future gate ${gate}.`);
  }

  const rollback = buildOroplayStagingRollbackPlan();
  assert.strictEqual(rollback.rollbackPlanExists, true, "rollback plan must exist.");
  assert.strictEqual(rollback.activationAllowed, false, "rollback plan must not allow activation.");

  const validation = validateOroplayStagingRouteWiringDesign();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
}

function assertFuturePathsAndAliases() {
  const balanceScenario = scenarioByName("staging route plan keeps /api/oroplay/balance as future staging path only");
  const transactionScenario = scenarioByName("staging route plan keeps /api/oroplay/transaction as future staging path only");
  assert.strictEqual(balanceScenario.futureStagingPath, "/api/oroplay/balance");
  assert.strictEqual(balanceScenario.futureOnly, true);
  assert.strictEqual(transactionScenario.futureStagingPath, "/api/oroplay/transaction");
  assert.strictEqual(transactionScenario.futureOnly, true);

  const balanceAlias = scenarioByName("public alias /api/balance remains disabled");
  const transactionAlias = scenarioByName("public alias /api/transaction remains disabled");
  assert.strictEqual(balanceAlias.publicAliasMounted, false);
  assert.strictEqual(balanceAlias.publicAliasEnabled, false);
  assert.strictEqual(transactionAlias.publicAliasMounted, false);
  assert.strictEqual(transactionAlias.publicAliasEnabled, false);
}

function assertProofFlagsAndAssertions() {
  const proof = buildOroplayCallbackStagingRouteWiringProofFlags();
  for (const flag of [
    "expressRouteMounted",
    "publicAliasMounted",
    "runtimeWiredToLiveRoute",
    "walletMutation",
    "ledgerMutation",
    "prismaWrite",
    "externalNetwork",
    "productionConfigTouched",
    "activationAllowed",
  ]) {
    assert.strictEqual(proof[flag], false, `${flag} proof flag must be false.`);
  }

  const plan = buildOroplayStagingRouteWiringPlan();
  for (const flag of [
    "expressRouteMounted",
    "publicAliasMounted",
    "runtimeWiredToLiveRoute",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "externalNetworkAllowed",
    "productionConfigTouched",
    "activationAllowed",
  ]) {
    assert.strictEqual(plan[flag], false, `${flag} must stay false.`);
  }

  assert.doesNotThrow(() => assertOroplayRouteWiringDesignNoExpressMount());
  assert.doesNotThrow(() => assertOroplayRouteWiringDesignNoAliasEnabled());
  assert.doesNotThrow(() => assertOroplayRouteWiringDesignNoMutation());
  assert.doesNotThrow(() => assertOroplayRouteWiringDesignNoNetwork());
  assert.doesNotThrow(() => assertOroplayRouteWiringDesignNoPrismaWrite());
}

function assertPreviousPhaseGatesPreserved() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });

  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B fail-closed route must not report success.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B route must remain fail_closed.");
  }

  const oro4a = evaluateOroplayRuntimeDisabledGate();
  assert.strictEqual(oro4a.gateStatus, "disabled", "ORO-4A disabled gate must remain disabled.");
  assert.strictEqual(oro4a.runtimeEnabled, false, "ORO-4A must not enable runtime.");
  assert.strictEqual(oro4a.aliasEnabled, false, "ORO-4A must not enable alias.");

  const oro4b = buildOroplayStagingWiringPrecheck();
  assert.strictEqual(oro4b.activationAllowed, false, "ORO-4B precheck must keep activation false.");
  assert.strictEqual(oro4b.runtimeWiredToLiveRoute, false, "ORO-4B precheck must keep route wiring false.");
  const oro4bValidation = validateOroplayStagingWiringPrecheck();
  assert.strictEqual(oro4bValidation.ok, true, oro4bValidation.errors.join("; "));

  const oro4c = invokeOroplayRuntimeSkeletonShadow({
    callbackType: "balance",
    payload: { callbackType: "balance", userCode: "ORO_SHADOW_VALID_001" },
  });
  const oro4cValidation = validateOroplayShadowInvocationDecision(oro4c);
  assert.strictEqual(oro4cValidation.ok, true, oro4cValidation.errors.join("; "));
  assert.strictEqual(oro4c.runtimeWiredToLiveRoute, false, "ORO-4C shadow invocation must stay disconnected.");

  const oro4d = invokeOroplayShadowEnvelopeFlow({
    callbackType: "balance",
    payload: { callbackType: "balance", userCode: "ORO_ENVELOPE_VALID_001" },
  });
  const oro4dValidation = validateOroplayRequestResponseEnvelope(oro4d);
  assert.strictEqual(oro4dValidation.ok, true, oro4dValidation.errors.join("; "));
  assert.strictEqual(oro4d.response.activationAllowed, false, "ORO-4D envelope mapper must not allow activation.");

  const oro4e = runOroplayControllerFacadeDryRunFlow({
    callbackType: "balance",
    mockAuth: { allowed: false },
    body: { callbackType: "balance", userCode: "ORO_FACADE_VALID_001" },
  });
  const oro4eValidation = validateOroplayControllerFacadeDryRun(oro4e);
  assert.strictEqual(oro4eValidation.ok, true, oro4eValidation.errors.join("; "));
  assert.strictEqual(oro4e.controllerFacadeOnly, true, "ORO-4E facade must remain dry-run only.");
  assert.strictEqual(oro4e.expressRouteWired, false, "ORO-4E facade must stay disconnected from Express routes.");
}

function assertNoAliasesOrExpressWiring() {
  const app = readRequired("src/app.js");
  const routes = readRequired("src/routes/oroplayCallbackStub.routes.js");
  const controller = readRequired("src/controllers/oroplayCallbackStub.controller.js");
  const combined = [app, routes, controller].join("\n");

  assertNotIncludes("provider alias mount", combined, [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]);
  assertNotIncludes("ORO-4F runtime live wiring", combined, [
    "oroplayCallbackStagingRouteWiringDesign",
    "buildOroplayStagingRouteWiringPlan",
    "buildOroplayStagingRouteMountContract",
    "buildOroplayStagingRouteActivationGate",
  ]);
}

function assertNoForbiddenRuntimeMarkers() {
  const forbiddenPatterns = [
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
    /\bwallet(?:Service)?\.(?:credit|debit|update|mutate)\s*\(/i,
    /\bledger(?:Service)?\.(?:post|create|update|write|mutate)\s*\(/i,
  ];

  for (const file of NEW_MOCK_FILES) {
    const source = readRequired(file);
    for (const pattern of forbiddenPatterns) {
      assert(!pattern.test(source), `${file} contains forbidden runtime marker ${pattern}.`);
    }
  }
}

function assertNoSecretScanFalsePositiveMarkers() {
  const markerText = NEW_FILES.map((file) => readRequired(file)).join("\n");
  const falsePositiveShapes = [
    new RegExp(`${["Authorization", ":"].join("")}\\s+${["Be", "arer"].join("")}`, "i"),
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["api", "key"].join("-")}\\s*[:=]\\s*["'][A-Za-z0-9_-]{8,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["DATABASE", "_URL"].join("")}\\s*=\\s*["']?[A-Za-z0-9_./:@-]+`, "i"),
  ];

  for (const pattern of falsePositiveShapes) {
    assert(!pattern.test(markerText), `new ORO-4F files contain CI false-positive marker text: ${pattern}.`);
  }

  assertIncludes("safe redaction marker wording", markerText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "mock-redaction-key-name",
    "redacted-credential-marker",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertFixtureSet();
  assertDesignContract();
  assertFuturePathsAndAliases();
  assertProofFlagsAndAssertions();
  assertPreviousPhaseGatesPreserved();
  assertNoAliasesOrExpressWiring();
  assertNoForbiddenRuntimeMarkers();
  assertNoSecretScanFalsePositiveMarkers();
  console.log("ORO-4F OroPlay callback staging route wiring design smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4F OroPlay callback staging route wiring design smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
