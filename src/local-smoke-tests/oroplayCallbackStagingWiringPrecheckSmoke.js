"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS,
  assertOroplayNoAliasEnabled,
  assertOroplayNoExternalNetwork,
  assertOroplayNoLiveRouteWiring,
  assertOroplayNoPrismaWrite,
  assertOroplayNoWalletLedgerMutation,
  assertOroplayRuntimeSkeletonStillDisabled,
  buildOroplayRuntimeSkeletonCertification,
  buildOroplayStagingActivationBlockers,
  buildOroplayStagingWiringPrecheck,
  validateOroplayRuntimeSkeletonCertification,
  validateOroplayStagingWiringPrecheck,
} = require("../game-provider-mock/oroplayCallbackStagingWiringPrecheck");
const {
  assertOroplayRuntimeRemainsDisabled,
  evaluateOroplayRuntimeDisabledGate,
} = require("../game-provider-mock/oroplayCallbackRuntimeDisabledGate");
const {
  validateOroplayCallbackRuntimeImplementationSkeleton,
} = require("../game-provider-mock/oroplayCallbackRuntimeImplementationSkeleton");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const CERTIFICATION_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_SKELETON_CERTIFICATION.md";
const PRECHECK_DOC = "docs/OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK.md";
const PRECHECK_HELPER = "src/game-provider-mock/oroplayCallbackStagingWiringPrecheck.js";
const PRECHECK_SMOKE = "src/local-smoke-tests/oroplayCallbackStagingWiringPrecheckSmoke.js";
const RUNNER = "src/local-smoke-tests/runAllLocalSmoke.js";
const PACKAGE_JSON = "package.json";
const REQUIRED_ENV_NAMES = [
  "OROPLAY_CALLBACK_RUNTIME_MODE",
  "OROPLAY_CALLBACK_BASIC_USER",
  "OROPLAY_CALLBACK_BASIC_SECRET",
  "OROPLAY_RUNTIME_CERTIFIED",
  "OROPLAY_ENABLE_PUBLIC_ALIASES",
];
const COMPLETE_CERTIFICATION = {
  certification: {
    oro4aSkeletonPassed: true,
    oro4bPrecheckReviewed: true,
    stagingOnlyApprovalRecorded: true,
    rollbackKillSwitchDefined: true,
    sanitizedAuditLogApproved: true,
    walletLedgerDryRunRequired: true,
    reconciliationGuardRequired: true,
    manualApprovalRequired: true,
  },
};
const NEW_FILES = [CERTIFICATION_DOC, PRECHECK_DOC, PRECHECK_HELPER, PRECHECK_SMOKE];

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
  const certificationDoc = readRequired(CERTIFICATION_DOC);
  const precheckDoc = readRequired(PRECHECK_DOC);
  const helper = readRequired(PRECHECK_HELPER);

  assertIncludes("runtime skeleton certification doc", certificationDoc, [
    "## ORO-4B scope",
    "## current status",
    "## certification checklist",
    "## disabled-by-default proof",
    "## fail-closed proof",
    "## no wallet mutation proof",
    "## no ledger mutation proof",
    "## no Prisma write proof",
    "## no external network proof",
    "## no alias proof",
    "## no live route wiring proof",
    "## future staging-only activation requirements",
    "## rollback / kill switch requirement",
    "## audit / sanitized log requirement",
    "## explicit no-real-money boundary",
    "activationAllowed=false",
    "runtimeWiredToLiveRoute=false",
    "walletMutationAllowed=false",
    "ledgerMutationAllowed=false",
    "prismaWriteAllowed=false",
    "externalNetworkAllowed=false",
    "aliasBalanceEnabled=false",
    "aliasTransactionEnabled=false",
  ]);

  assertIncludes("staging wiring precheck doc", precheckDoc, [
    "## staging wiring precheck purpose",
    "## what must exist before wiring",
    "## required env names only, no values",
    "## route alias remains disabled",
    "## ORO-2B fail-closed preserved",
    "## runtime skeleton not wired",
    "## activation blockers",
    "## required manual approval before future staging wiring",
    "## no production deploy",
    "## no live provider call",
    "## no wallet/ledger mutation",
    "activation remains false",
    "ORO-4B records names only",
    "The ORO-2B callback stub remains fail-closed",
  ]);

  assertIncludes("precheck helper exports", helper, [
    "OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS",
    "buildOroplayRuntimeSkeletonCertification",
    "buildOroplayStagingWiringPrecheck",
    "validateOroplayRuntimeSkeletonCertification",
    "validateOroplayStagingWiringPrecheck",
    "assertOroplayRuntimeSkeletonStillDisabled",
    "assertOroplayNoLiveRouteWiring",
    "assertOroplayNoAliasEnabled",
    "assertOroplayNoWalletLedgerMutation",
    "assertOroplayNoPrismaWrite",
    "assertOroplayNoExternalNetwork",
    "buildOroplayStagingActivationBlockers",
  ]);

  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-staging-wiring-precheck"],
    "node src/local-smoke-tests/oroplayCallbackStagingWiringPrecheckSmoke.js",
    "package.json missing ORO-4B smoke script."
  );

  const runner = readRequired(RUNNER);
  assertIncludes("runAllLocalSmoke ORO-4B registration", runner, [
    "oroplayCallbackStagingWiringPrecheck.js",
    "oroplayCallbackStagingWiringPrecheckSmoke.js",
    "smoke:oroplay-callback-staging-wiring-precheck",
    "oroplayCallbackStagingWiringPrecheck",
    "docs/OROPLAY_CALLBACK_RUNTIME_SKELETON_CERTIFICATION.md",
    "docs/OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK.md",
  ]);
}

function assertPrecheckContract() {
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.defaultState, "fail_closed");
  assert.strictEqual(
    OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.certifiedMockState,
    "staging_precheck_ready"
  );
  assert.strictEqual(OROPLAY_CALLBACK_STAGING_WIRING_PRECHECK_STATUS.activationAllowed, false);

  const oro4aValidation = validateOroplayCallbackRuntimeImplementationSkeleton();
  assert.strictEqual(oro4aValidation.ok, true, oro4aValidation.errors.join("; "));

  const defaultCertification = buildOroplayRuntimeSkeletonCertification();
  assert.strictEqual(defaultCertification.defaultState, "fail_closed");
  assert.strictEqual(defaultCertification.certificationState, "fail_closed");
  assert.strictEqual(defaultCertification.activationAllowed, false);
  assert.strictEqual(defaultCertification.runtimeWiredToLiveRoute, false);
  assert.strictEqual(defaultCertification.aliasBalanceEnabled, false);
  assert.strictEqual(defaultCertification.aliasTransactionEnabled, false);
  assert.strictEqual(defaultCertification.walletMutationAllowed, false);
  assert.strictEqual(defaultCertification.ledgerMutationAllowed, false);
  assert.strictEqual(defaultCertification.prismaWriteAllowed, false);
  assert.strictEqual(defaultCertification.externalNetworkAllowed, false);
  assert.strictEqual(defaultCertification.productionConfigTouched, false);

  const certified = buildOroplayRuntimeSkeletonCertification(COMPLETE_CERTIFICATION);
  assert.strictEqual(certified.certificationState, "staging_precheck_ready");
  assert.strictEqual(certified.activationAllowed, false);

  const defaultPrecheck = buildOroplayStagingWiringPrecheck();
  assert.strictEqual(defaultPrecheck.precheckOnly, true);
  assert.strictEqual(defaultPrecheck.precheckState, "fail_closed");
  assert.strictEqual(defaultPrecheck.activationAllowed, false);

  const certifiedPrecheck = buildOroplayStagingWiringPrecheck(COMPLETE_CERTIFICATION);
  assert.strictEqual(certifiedPrecheck.precheckState, "staging_precheck_ready");
  assert.strictEqual(certifiedPrecheck.certifiedMockState, "staging_precheck_ready");
  assert.strictEqual(certifiedPrecheck.activationAllowed, false);
  assert.strictEqual(certifiedPrecheck.runtimeWiredToLiveRoute, false);
  assert.strictEqual(certifiedPrecheck.aliasBalanceEnabled, false);
  assert.strictEqual(certifiedPrecheck.aliasTransactionEnabled, false);
  assert.strictEqual(certifiedPrecheck.walletMutationAllowed, false);
  assert.strictEqual(certifiedPrecheck.ledgerMutationAllowed, false);
  assert.strictEqual(certifiedPrecheck.prismaWriteAllowed, false);
  assert.strictEqual(certifiedPrecheck.externalNetworkAllowed, false);
  assert.strictEqual(certifiedPrecheck.productionConfigTouched, false);
  assert.strictEqual(certifiedPrecheck.oro2bFailClosedPreserved, true);
  assert.strictEqual(certifiedPrecheck.oro4aDisabledGatePreserved, true);

  const allowedStates = new Set(["fail_closed", "staging_precheck_ready"]);
  assert(allowedStates.has(defaultPrecheck.precheckState), "default precheck must stay in the allowed states.");
  assert(allowedStates.has(certifiedPrecheck.precheckState), "certified precheck must stay in the allowed states.");

  const certificationValidation = validateOroplayRuntimeSkeletonCertification(COMPLETE_CERTIFICATION);
  assert.strictEqual(certificationValidation.ok, true, certificationValidation.errors.join("; "));
  const precheckValidation = validateOroplayStagingWiringPrecheck(COMPLETE_CERTIFICATION);
  assert.strictEqual(precheckValidation.ok, true, precheckValidation.errors.join("; "));

  assert.doesNotThrow(() => assertOroplayRuntimeSkeletonStillDisabled(COMPLETE_CERTIFICATION));
  assert.doesNotThrow(() => assertOroplayNoLiveRouteWiring(COMPLETE_CERTIFICATION));
  assert.doesNotThrow(() => assertOroplayNoAliasEnabled(COMPLETE_CERTIFICATION));
  assert.doesNotThrow(() => assertOroplayNoWalletLedgerMutation(COMPLETE_CERTIFICATION));
  assert.doesNotThrow(() => assertOroplayNoPrismaWrite(COMPLETE_CERTIFICATION));
  assert.doesNotThrow(() => assertOroplayNoExternalNetwork(COMPLETE_CERTIFICATION));

  const blockers = buildOroplayStagingActivationBlockers();
  assert(blockers.length > 0, "activation blockers must be listed.");
}

function assertEnvNamesOnly() {
  const precheck = buildOroplayStagingWiringPrecheck(COMPLETE_CERTIFICATION);
  const envNames = precheck.requiredFutureEnvNames.map((item) => item.name);

  for (const name of REQUIRED_ENV_NAMES) {
    assert(envNames.includes(name), `future env name missing: ${name}`);
  }

  for (const item of precheck.requiredFutureEnvNames) {
    assert.strictEqual(item.envNameOnly, true, `${item.name} must be name-only.`);
    assert.strictEqual(item.valueRead, false, `${item.name} must not be read.`);
    assert.strictEqual(item.valueDisplayed, false, `${item.name} must not be displayed.`);
    assert(!Object.prototype.hasOwnProperty.call(item, "value"), `${item.name} must not carry a value.`);
  }

  assert.strictEqual(precheck.envValuesRead, false, "precheck must not read env values.");
  assert.strictEqual(precheck.envValuesDisplayed, false, "precheck must not display env values.");
}

function assertOro2bAndOro4aPreserved() {
  const disabled = buildOroplayCallbackStubResponse({ callbackType: "balance" });
  const enabledSkeleton = buildOroplayCallbackStubResponse({ callbackType: "transaction", stubEnabled: true });

  for (const response of [disabled, enabledSkeleton]) {
    const validation = validateOroplayCallbackStubSafety(response);
    assert.strictEqual(validation.ok, true, validation.errors.join("; "));
    assert.strictEqual(response.success, false, "ORO-2B stub must remain unsuccessful.");
    assert.strictEqual(response.result, "fail_closed", "ORO-2B stub must remain fail_closed.");
    assert.strictEqual(response.safety.noWalletMutation, true, "ORO-2B stub must block wallet mutation.");
    assert.strictEqual(response.safety.noLedgerMutation, true, "ORO-2B stub must block ledger mutation.");
  }

  const defaultGate = evaluateOroplayRuntimeDisabledGate();
  assert.strictEqual(defaultGate.gateStatus, "disabled", "ORO-4A gate must remain disabled.");
  assert.strictEqual(defaultGate.decision, "disabled", "ORO-4A gate default decision must remain disabled.");
  assert.strictEqual(defaultGate.runtimeEnabled, false, "ORO-4A gate must not enable runtime.");
  assert.strictEqual(defaultGate.aliasEnabled, false, "ORO-4A gate must not enable aliases.");
  assert.doesNotThrow(() => assertOroplayRuntimeRemainsDisabled({ runtimeFlag: "enabled" }));
}

function assertNoAliasesOrLiveWiring() {
  const app = readRequired("src/app.js");
  const routes = readRequired("src/routes/oroplayCallbackStub.routes.js");
  const controller = readRequired("src/controllers/oroplayCallbackStub.controller.js");
  const combined = [app, routes, controller].join("\n");

  assertNotIncludes("live route wiring", combined, [
    "oroplayCallbackStagingWiringPrecheck",
    "buildOroplayStagingWiringPrecheck",
    "executeOroplayCallbackRuntimeSkeleton",
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]);
}

function assertNoCredentialShape(label, text) {
  const scanned = String(text || "");
  const credentialUrl = /[a-z]+:\/\/[^:\s/]+:[^@\s/]+@/i;
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const apiKeyShape = new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i");
  const dbAssignment = new RegExp(`\\b${["DATABASE", "_URL"].join("")}\\s*=\\s*["']?[A-Za-z0-9_./:@-]+`, "i");
  const credentialAssignment = /\b(?:client_secret|token|password|PIN|device_identifier)\s*[:=]\s*["'][A-Za-z0-9_./:@-]{8,}/i;
  const authHeaderFixture = new RegExp(`\\b${["Authorization", ":"].join("")}\\s+${["Bearer"].join("")}\\s+[A-Za-z0-9_.-]{12,}`, "i");

  assert(!credentialUrl.test(scanned), `${label} contains credential URL shape.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!apiKeyShape.test(scanned), `${label} contains credential-prefix-marker.`);
  assert(!dbAssignment.test(scanned), `${label} contains database assignment shape.`);
  assert(!credentialAssignment.test(scanned), `${label} contains credential assignment shape.`);
  assert(!authHeaderFixture.test(scanned), `${label} contains auth-header-redaction-marker.`);
}

function assertNoRuntimeImportsOrCalls() {
  const helper = readRequired(PRECHECK_HELPER);
  const forbiddenHelperPatterns = [
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

  for (const pattern of forbiddenHelperPatterns) {
    assert(!pattern.test(helper), `${PRECHECK_HELPER} contains forbidden runtime marker ${pattern}.`);
  }
}

function assertNoSecretScanFalsePositiveMarkers() {
  const markerText = NEW_FILES.map((file) => readRequired(file)).join("\n");
  const forbiddenFalsePositiveShapes = [
    new RegExp(`${["Authorization", ":"].join("")}\\s+${["Bearer"].join("")}`, "i"),
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["api", "key"].join("-")}\\s*[:=]\\s*["'][A-Za-z0-9_-]{8,}`, "i"),
  ];

  for (const pattern of forbiddenFalsePositiveShapes) {
    assert(!pattern.test(markerText), `new ORO-4B files contain CI false-positive marker text: ${pattern}.`);
  }

  assertIncludes("safe redaction wording", markerText, [
    "auth-header-redaction-marker",
    "credential-prefix-marker",
    "redacted-credential-marker",
  ]);

  for (const file of NEW_FILES) {
    assertNoCredentialShape(file, readRequired(file));
  }
}

function main() {
  assertDocsAndRegistration();
  assertPrecheckContract();
  assertEnvNamesOnly();
  assertOro2bAndOro4aPreserved();
  assertNoAliasesOrLiveWiring();
  assertNoRuntimeImportsOrCalls();
  assertNoSecretScanFalsePositiveMarkers();
  console.log("ORO-4B OroPlay callback staging wiring precheck smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-4B OroPlay callback staging wiring precheck smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
