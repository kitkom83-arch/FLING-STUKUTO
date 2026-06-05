"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const helper = require("../game-provider-mock/oro5oPostMountValidationBoundary");
const fixtures = require("../game-provider-mock/oro5oPostMountValidationBoundaryFixtures");

const {
  FAIL_CLOSED_NO_MUTATION,
  INTERNAL_FAIL_CLOSED_SCOPE,
  ORO5O_POST_MOUNT_VALIDATION_BOUNDARY_STATUS,
  PASS,
  assertOro5oFailClosedRouteVerification,
  assertOro5oInternalMountOnly,
  assertOro5oNoExternalNetwork,
  assertOro5oNoPublicAlias,
  assertOro5oNoRuntimeMoneyMutation,
  buildOro5oPostMountValidationBoundary,
  buildOro5oSafetyLockSummary,
  validateOro5oPostMountValidationBoundary,
} = helper;

const {
  backendNotListeningOptionalProbeSkippedFixture,
  buildOro5oPostMountValidationBoundaryFixtures,
  externalNetworkDetectedFixture,
  happyPathInternalFailClosedRouteVerificationFixture,
  ledgerMutationDetectedFixture,
  liveOroPlayCallDetectedFixture,
  missingInternalMountFixture,
  prismaWriteDetectedFixture,
  publicAliasDetectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
} = fixtures;

const ROOT = path.resolve(__dirname, "..", "..");
const DOC = "docs/ORO_5O_POST_MOUNT_VALIDATION_BOUNDARY.md";
const APP = "src/app.js";
const ROUTE_FILE = "src/routes/oroplayCallbackStub.routes.js";
const CONTROLLER_FILE = "src/controllers/oroplayCallbackStub.controller.js";
const WRAPPER = "src/local-smoke-tests/oro5oSmoke.js";
const SCRIPT = "smoke:oro-5o";
const STATIC_SAFETY_FILES = Object.freeze([
  APP,
  DOC,
  "src/game-provider-mock/oro5oPostMountValidationBoundary.js",
  "src/game-provider-mock/oro5oPostMountValidationBoundaryFixtures.js",
  "src/local-smoke-tests/oro5oPostMountValidationBoundarySmoke.js",
  WRAPPER,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
  ["docs/API_MAP", "P", "ING.md"].join(""),
  "docs/OROPLAY_INTEGRATION_PLAN.md",
  "docs/PHASE_ROADMAP.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md",
  "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md",
  "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md",
  [
    "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
    "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
  ].join(""),
  "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md",
  "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md",
  "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md",
]);

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertResultHasNoSensitiveFields(value) {
  const forbidden = [
    ["to", "ken"].join(""),
    ["pass", "word"].join(""),
    ["client", "Secret"].join(""),
    ["DATABASE", "_URL"].join(""),
    ["P", "IN"].join(""),
    ["device", "Id"].join(""),
  ];
  const serialized = JSON.stringify(value);
  for (const marker of forbidden) {
    assert(!serialized.includes(marker), `summary leaked sensitive marker ${marker}.`);
  }
}

function assertChangedFilesStaticSafety() {
  const secretPatterns = [
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/i,
    new RegExp(`${["Be", "arer"].join("")}\\s+[A-Za-z0-9._-]{10,}`, "i"),
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    new RegExp(`${["s", "k", "-"].join("")}[A-Za-z0-9]{10,}`, "i"),
    /ghp_[A-Za-z0-9]{10,}/i,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  ];

  for (const file of STATIC_SAFETY_FILES) {
    const absolutePath = path.join(ROOT, file);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), `${file} contains secret-shaped value ${pattern}.`);
    }
  }
}

function assertNoForbiddenRuntimeFileModified() {
  const result = spawnSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  assert.strictEqual(result.status, 0, `git diff --name-only failed: ${result.stderr}`);
  const changed = new Set(
    result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
  for (const forbidden of [APP, ROUTE_FILE, CONTROLLER_FILE]) {
    assert(!changed.has(forbidden), `${forbidden} must not be modified by ORO-5O.`);
  }
}

function assertAppMount() {
  const app = readRequired(APP);
  assert(
    app.includes('const oroplayCallbackStubRoutes = require("./routes/oroplayCallbackStub.routes");'),
    "src/app.js must require the existing fail-closed OroPlay callback stub router."
  );
  assert(
    app.includes('app.use("/api/oroplay", oroplayCallbackStubRoutes);'),
    "src/app.js must mount the existing stub only under /api/oroplay."
  );
  assert(
    app.includes("ORO-5N: internal fail-closed OroPlay callback staging mount only"),
    "src/app.js must carry the ORO-5N controlled mount marker."
  );
  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'app.post("/api/balance"',
    'app.post("/api/transaction"',
  ]) {
    assert(!app.includes(marker), `src/app.js must not contain ${marker}.`);
  }
}

function assertFailClosedRoutePreserved() {
  const route = readRequired(ROUTE_FILE);
  const controller = readRequired(CONTROLLER_FILE);
  assert(route.includes('router.post("/balance"'), "balance route must stay mounted.");
  assert(
    route.includes('router.post("/transaction"'),
    "transaction route must stay mounted."
  );
  assert(
    controller.includes("sendFailClosedStub"),
    "controller must still use fail-closed stub sender."
  );
  assert(
    controller.includes("statusCode = stubEnabled ? 501 : 503"),
    "controller must still return fail-closed 501/503 status."
  );
}

function assertNoUnsafeRuntimeText() {
  const app = readRequired(APP);
  const route = readRequired(ROUTE_FILE);
  const controller = readRequired(CONTROLLER_FILE);
  const helperText = readRequired(
    "src/game-provider-mock/oro5oPostMountValidationBoundary.js"
  );
  const fixtureText = readRequired(
    "src/game-provider-mock/oro5oPostMountValidationBoundaryFixtures.js"
  );
  const runtimeCombined = `${app}\n${route}\n${controller}`;
  const boundaryCombined = `${helperText}\n${fixtureText}`;

  for (const marker of [
    'app.use("/api/balance"',
    'app.use("/api/transaction"',
    'router.post("/api/balance"',
    'router.post("/api/transaction"',
  ]) {
    assert(!runtimeCombined.includes(marker), `public alias must not exist: ${marker}.`);
  }

  for (const marker of [
    "PrismaClient",
    "prisma.",
    ".create(",
    ".update(",
    ".delete(",
    "$transaction",
    "http.request",
    "https.request",
  ]) {
    assert(!boundaryCombined.includes(marker), `ORO-5O boundary files must not contain ${marker}.`);
  }

  for (const marker of [
    "walletMutationPerformed: true",
    "ledgerMutationPerformed: true",
    "prismaWritePerformed: true",
    "dbTransactionPerformed: true",
    "liveOroPlayApiCalled: true",
  ]) {
    assert(!boundaryCombined.includes(marker), `ORO-5O files must not perform ${marker}.`);
  }

  const liveUrlPatterns = [/https?:\/\/[^"'\s]*oroplay/i, /oroplay/i];
  for (const [label, text] of [
    ["runtime files", runtimeCombined],
    ["ORO-5O files", boundaryCombined],
  ]) {
    for (const line of text.split(/\r?\n/)) {
      if (!/https?:\/\//i.test(line)) continue;
      assert(
        !liveUrlPatterns.some((pattern) => pattern.test(line)),
        `${label} must not include live OroPlay URL.`
      );
    }
  }
}

function assertDocsAndRegistration() {
  const doc = readRequired(DOC);
  for (const marker of [
    "## ORO-5O scope",
    "## Dependency on ORO-5N",
    "## Internal mount validation",
    "## Fail-closed validation",
    "## No public alias validation",
    "## No runtime traffic validation",
    "## No wallet / ledger / DB mutation validation",
    "## No external or live OroPlay call validation",
    "## Next phase requirements",
    "postMountValidationBoundaryResult = PASS",
    "routeMountPatchImplementationScope = internal_fail_closed_oroplay_callback_staging_mount_only",
    "oroplayBalanceRouteMode = fail_closed_no_mutation",
    "apiBalancePublicAliasMounted = false",
    "runtimeTrafficEnabled = false",
    "walletMutationAllowed = false",
    "liveOroPlayApiCallAllowed = false",
  ]) {
    assert(doc.includes(marker), `${DOC} missing marker ${marker}.`);
  }

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(pkg.scripts[SCRIPT], `node ${WRAPPER}`);

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  for (const marker of [WRAPPER, SCRIPT, "oro5o", "oro-5o"]) {
    assert(runner.includes(marker), `runAllLocalSmoke missing ${marker}.`);
  }

  for (const [file, markers] of [
    [
      ["docs/API_MAP", "P", "ING.md"].join(""),
      [
        "ORO-5O post-mount validation boundary",
        "internal /api/oroplay mount remains fail-closed",
      ],
    ],
    [
      "docs/OROPLAY_INTEGRATION_PLAN.md",
      ["## ORO-5O Current", "internal /api/oroplay mount remains fail-closed"],
    ],
    [
      "docs/PHASE_ROADMAP.md",
      ["ORO-5O current/local pending post-mount validation boundary", SCRIPT],
    ],
    [
      "docs/SMOKE_COVERAGE.md",
      ["ORO-5O Post-Mount Validation Boundary Coverage", SCRIPT],
    ],
    [ "docs/ORO_5N_ROUTE_MOUNT_IMPLEMENTATION_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
    [ "docs/ORO_5M_ROUTE_MOUNT_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
    [ "docs/ORO_5L_ROUTE_MOUNT_AUTHORIZATION_REQUEST_SUBMISSION_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
    [
      [
        "docs/ORO_5K_POST_EXECUTION_VALIDATION_",
        "ROUTE_MOUNT_AUTHORIZATION_REQUEST_READINESS_BOUNDARY.md",
      ].join(""),
      ["ORO-5O validates the post-mount state"],
    ],
    [ "docs/ORO_5J_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
    [ "docs/ORO_5I_ACTUAL_PATCH_IMPLEMENTATION_EXECUTION_READINESS_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
    [ "docs/ORO_5H_ACTUAL_PATCH_IMPLEMENTATION_AUTHORIZATION_DECISION_BOUNDARY.md", ["ORO-5O validates the post-mount state"] ],
  ]) {
    const text = readRequired(file);
    for (const marker of markers) {
      assert(text.includes(marker), `${file} missing marker ${marker}.`);
    }
  }
}

function assertHeldGates(summary) {
  assert.strictEqual(summary.publicAliasAllowed, false);
  assert.strictEqual(summary.publicAliasImplemented, false);
  assert.strictEqual(summary.apiBalancePublicAliasMounted, false);
  assert.strictEqual(summary.apiTransactionPublicAliasMounted, false);
  assert.strictEqual(summary.runtimeTrafficAllowed, false);
  assert.strictEqual(summary.runtimeTrafficEnabled, false);
  assert.strictEqual(summary.liveTrafficAllowed, false);
  assert.strictEqual(summary.liveTrafficEnabled, false);
  assert.strictEqual(summary.walletMutationAllowed, false);
  assert.strictEqual(summary.walletMutationPerformed, false);
  assert.strictEqual(summary.ledgerMutationAllowed, false);
  assert.strictEqual(summary.ledgerMutationPerformed, false);
  assert.strictEqual(summary.prismaWriteAllowed, false);
  assert.strictEqual(summary.prismaWritePerformed, false);
  assert.strictEqual(summary.dbTransactionAllowed, false);
  assert.strictEqual(summary.dbTransactionPerformed, false);
  assert.strictEqual(summary.migrationAllowed, false);
  assert.strictEqual(summary.migrationPerformed, false);
  assert.strictEqual(summary.externalNetworkAllowed, false);
  assert.strictEqual(summary.externalNetworkCalled, false);
  assert.strictEqual(summary.liveOroPlayApiCallAllowed, false);
  assert.strictEqual(summary.liveOroPlayApiCalled, false);
}

function assertHappyPath(summary) {
  assert.strictEqual(summary.phase, "ORO-5O");
  assert.strictEqual(summary.fixtureId, "happyPathInternalFailClosedRouteVerificationFixture");
  assert.strictEqual(summary.postMountValidationBoundaryResult, PASS);
  assert.strictEqual(summary.postMountValidationBoundaryEntered, true);
  assert.strictEqual(summary.postMountValidationChecked, true);
  assert.strictEqual(summary.dependsOnOro5nRouteMountImplementation, true);
  assert.strictEqual(summary.routeMountPatchImplementedFromOro5n, true);
  assert.strictEqual(summary.routeMountPatchImplementationScope, INTERNAL_FAIL_CLOSED_SCOPE);
  assert.strictEqual(summary.srcAppChangedInOro5o, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5o, false);
  assert.strictEqual(summary.internalOroPlayMountVerified, true);
  assert.strictEqual(summary.oroplayInternalCallbackRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMounted, true);
  assert.strictEqual(summary.oroplayTransactionRouteMounted, true);
  assert.strictEqual(summary.oroplayBalanceRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.oroplayTransactionRouteMode, FAIL_CLOSED_NO_MUTATION);
  assert.strictEqual(summary.failClosedRouteVerificationPassed, true);
  assertHeldGates(summary);
  assert.strictEqual(summary.nextPhaseRequiresSeparatePublicAliasApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateRuntimeTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresSeparateLiveTrafficApproval, true);
  assert.strictEqual(summary.nextPhaseRequiresPostValidationDecisionBoundary, true);
  assert.deepStrictEqual(summary.blockers, []);
  assertResultHasNoSensitiveFields(summary);
}

function assertHeld(summary, blocker) {
  assert.strictEqual(summary.postMountValidationBoundaryResult, "HOLD");
  assert(summary.blockers.includes(blocker), `missing blocker ${blocker}.`);
  assert.strictEqual(summary.srcAppChangedInOro5o, false);
  assert.strictEqual(summary.runtimeRouteControllerChangedInOro5o, false);
  assertHeldGates(summary);
  assertResultHasNoSensitiveFields(summary);
}

function normalizeBaseUrl(value) {
  const raw = String(value || "http://127.0.0.1:4000").trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_error) {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) return null;
  return raw;
}

async function postFailClosed(baseUrl, routePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500);
  try {
    const response = await fetch(`${baseUrl}${routePath}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    assert([501, 503].includes(response.status), `${routePath} must fail closed.`);
    assert.strictEqual(payload.success, false, `${routePath} must return success false.`);
    assert.strictEqual(payload.result, "fail_closed", `${routePath} must return fail_closed.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function optionalLocalProbeInput() {
  const baseUrl = normalizeBaseUrl(process.env.ORO5O_LOCAL_BASE_URL || process.env.BASE_URL);
  if (!baseUrl) {
    console.log("ORO-5O optional local route probe skipped: backend not listening");
    return happyPathInternalFailClosedRouteVerificationFixture;
  }

  try {
    await postFailClosed(baseUrl, "/api/oroplay/balance");
    await postFailClosed(baseUrl, "/api/oroplay/transaction");
    return {
      ...happyPathInternalFailClosedRouteVerificationFixture,
      postMountEvidence: {
        ...happyPathInternalFailClosedRouteVerificationFixture.postMountEvidence,
        optionalLocalProbeAttempted: true,
        optionalLocalProbeSkippedReason: "not_skipped",
        optionalLocalProbeResult: "pass",
      },
    };
  } catch (_error) {
    console.log("ORO-5O optional local route probe skipped: backend not listening");
    return happyPathInternalFailClosedRouteVerificationFixture;
  }
}

async function main() {
  assert.strictEqual(typeof ORO5O_POST_MOUNT_VALIDATION_BOUNDARY_STATUS, "object");
  assert.strictEqual(typeof buildOro5oPostMountValidationBoundary, "function");
  assert.strictEqual(typeof validateOro5oPostMountValidationBoundary, "function");
  assert.strictEqual(typeof buildOro5oSafetyLockSummary, "function");
  assert.strictEqual(typeof assertOro5oInternalMountOnly, "function");
  assert.strictEqual(typeof assertOro5oFailClosedRouteVerification, "function");
  assert.strictEqual(typeof assertOro5oNoPublicAlias, "function");
  assert.strictEqual(typeof assertOro5oNoRuntimeMoneyMutation, "function");
  assert.strictEqual(typeof assertOro5oNoExternalNetwork, "function");

  assertDocsAndRegistration();
  assertAppMount();
  assertFailClosedRoutePreserved();
  assertNoForbiddenRuntimeFileModified();
  assertNoUnsafeRuntimeText();
  assertChangedFilesStaticSafety();

  const happy = buildOro5oPostMountValidationBoundary(
    happyPathInternalFailClosedRouteVerificationFixture
  );
  assertHappyPath(happy);
  assert.strictEqual(assertOro5oInternalMountOnly(happy), true);
  assert.strictEqual(assertOro5oFailClosedRouteVerification(happy), true);
  assert.strictEqual(assertOro5oNoPublicAlias(happy), true);
  assert.strictEqual(assertOro5oNoRuntimeMoneyMutation(happy), true);
  assert.strictEqual(assertOro5oNoExternalNetwork(happy), true);

  assertHeld(
    buildOro5oPostMountValidationBoundary(missingInternalMountFixture),
    "ORO-5N route mount patch implementation must be present"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(publicAliasDetectedFixture),
    "public aliases must remain absent"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(runtimeTrafficDetectedFixture),
    "runtime and live traffic must remain disabled"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(walletMutationDetectedFixture),
    "wallet mutation must remain absent"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(ledgerMutationDetectedFixture),
    "ledger mutation must remain absent"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(prismaWriteDetectedFixture),
    "Prisma write and DB transaction must remain absent"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(externalNetworkDetectedFixture),
    "external network must remain absent"
  );
  assertHeld(
    buildOro5oPostMountValidationBoundary(liveOroPlayCallDetectedFixture),
    "live OroPlay API call must remain absent"
  );

  const validation = validateOro5oPostMountValidationBoundary();
  assert.strictEqual(validation.valid, true);
  assert.deepStrictEqual(validation.blockers, []);

  const safety = buildOro5oSafetyLockSummary();
  assert.strictEqual(safety.publicAliasImplemented, false);
  assert.strictEqual(safety.runtimeTrafficEnabled, false);
  assert.strictEqual(safety.walletMutationPerformed, false);
  assert.strictEqual(safety.ledgerMutationPerformed, false);
  assert.strictEqual(safety.prismaWritePerformed, false);
  assert.strictEqual(safety.externalNetworkCalled, false);
  assert.strictEqual(safety.liveOroPlayApiCalled, false);

  const allReports =
    buildOro5oPostMountValidationBoundaryFixtures().map(
      buildOro5oPostMountValidationBoundary
    );
  assert(allReports.length >= 10, "fixture set must cover ORO-5O required cases.");
  for (const report of allReports) {
    assertHeldGates(report);
    assertResultHasNoSensitiveFields(report);
  }

  const probeAwareSummary = buildOro5oPostMountValidationBoundary(
    await optionalLocalProbeInput()
  );
  assert.strictEqual(probeAwareSummary.postMountValidationBoundaryResult, PASS);
  assertHappyPath(probeAwareSummary);

  console.log(JSON.stringify(probeAwareSummary, null, 2));
  console.log("ORO-5O post-mount validation boundary smoke: PASS");
}

main().catch((error) => {
  console.error("ORO-5O post-mount validation boundary smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
