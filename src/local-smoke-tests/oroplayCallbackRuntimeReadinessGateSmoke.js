"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  assertOroplayRuntimeReadinessGateClosed,
  buildOroplayRuntimeReadinessGateSummary,
  evaluateOroplayRuntimeReadinessGate,
  validateOroplayCallbackRuntimeReadinessGate,
} = require("../game-provider-mock/oroplayCallbackRuntimeReadinessGate");
const {
  buildOroplayImplementationBlockerMatrix,
  evaluateOroplayPreImplementationCertificationPack,
  validateOroplayPreImplementationCertificationPack,
} = require("../game-provider-mock/oroplayCallbackPreImplementationCertificationPack");
const {
  buildOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const ROOT = path.resolve(__dirname, "..", "..");
const READINESS_GATE_DOC = "docs/OROPLAY_CALLBACK_RUNTIME_READINESS_GATE.md";
const CERTIFICATION_DOC = "docs/OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION.md";
const READINESS_GATE_FILE = "src/game-provider-mock/oroplayCallbackRuntimeReadinessGate.js";
const CERTIFICATION_PACK_FILE = "src/game-provider-mock/oroplayCallbackPreImplementationCertificationPack.js";
const SMOKE_FILE = "src/local-smoke-tests/oroplayCallbackRuntimeReadinessGateSmoke.js";
const NEW_RUNTIME_FILES = [READINESS_GATE_FILE, CERTIFICATION_PACK_FILE, SMOKE_FILE];

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
  const readinessDoc = readRequired(READINESS_GATE_DOC);
  const certificationDoc = readRequired(CERTIFICATION_DOC);

  assertIncludes("ORO-3D readiness gate doc", readinessDoc, [
    "## purpose",
    "## non-goals",
    "## safety boundary",
    "## readiness gate overview",
    "## current closed phases",
    "## runtime implementation blocked statement",
    "## required evidence before implementation",
    "## callback auth readiness",
    "## member mapping readiness",
    "## idempotency store readiness",
    "## duplicate/conflict handling readiness",
    "## wallet bridge readiness",
    "## ledger bridge readiness",
    "## reconciliation readiness",
    "## audit log readiness",
    "## sanitized logging readiness",
    "## monitoring readiness",
    "## alerting readiness",
    "## rollback / compensation readiness",
    "## staging callback readiness",
    "## feature flag readiness",
    "## provider alias readiness",
    "## runbook readiness",
    "## ORO-3E prerequisites",
    "## no live runtime statement",
    "## no runtime wallet mutation",
    "## no runtime ledger mutation",
    "## no Prisma write",
    "## no alias provider-compatible route enabled",
    "ORO-3D is readiness gate / certification pack only",
    "ORO-3D does not enable `/api/balance` or `/api/transaction`",
    "ORO-3E is blocked until ORO-3D passes",
  ]);

  assertIncludes("ORO-3D certification doc", certificationDoc, [
    "## purpose",
    "## certification scope",
    "## certification non-goals",
    "## certification evidence checklist",
    "## implementation blocker matrix",
    "## callback auth checklist",
    "## payload validation checklist",
    "## member mapping checklist",
    "## idempotency checklist",
    "## wallet execution checklist",
    "## ledger execution checklist",
    "## transaction log checklist",
    "## reconciliation checklist",
    "## audit checklist",
    "## log redaction checklist",
    "## monitoring checklist",
    "## rollback checklist",
    "## staging checklist",
    "## go/no-go checklist",
    "## required approvals before runtime mutation",
    "## required approvals before alias enablement",
    "## required approvals before live provider traffic",
    "## ORO-3E entry criteria",
    "blockerId",
    "why it blocks runtime",
    "current status",
    "required evidence",
    "owner / future owner",
    "pass condition",
  ]);

  readRequired(READINESS_GATE_FILE);
  readRequired(CERTIFICATION_PACK_FILE);

  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-callback-runtime-readiness-gate"],
    "node src/local-smoke-tests/oroplayCallbackRuntimeReadinessGateSmoke.js",
    "package.json missing ORO-3D smoke script."
  );

  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke ORO-3D registration", runner, [
    "oroplayCallbackRuntimeReadinessGate.js",
    "oroplayCallbackPreImplementationCertificationPack.js",
    "oroplayCallbackRuntimeReadinessGateSmoke.js",
    "smoke:oroplay-callback-runtime-readiness-gate",
    "oroplayCallbackRuntimeReadinessGate",
  ]);
}

function assertDefaultGateClosed() {
  const gate = evaluateOroplayRuntimeReadinessGate();
  assert.strictEqual(gate.gateStatus, "closed", "default readiness gate must be closed.");
  assert.strictEqual(gate.runtimeImplementationAllowed, false, "default gate must block runtime implementation.");
  assert.strictEqual(gate.walletMutationAllowed, false, "default gate must block wallet mutation.");
  assert.strictEqual(gate.ledgerMutationAllowed, false, "default gate must block ledger mutation.");
  assert.strictEqual(gate.aliasEnablementAllowed, false, "default gate must block alias enablement.");
  assert.strictEqual(gate.liveTrafficAllowed, false, "default gate must block live traffic.");
  assert.strictEqual(gate.nextPhaseBlocked, true, "default gate must block next phase.");
  assert.strictEqual(gate.reason, "ORO-3D is readiness/certification only", "default gate reason mismatch.");
  assert(gate.localValidationBlockers.length > 0, "default gate must record all-local blocker.");
  assert.doesNotThrow(() => assertOroplayRuntimeReadinessGateClosed(), "default closed gate must be assertable.");

  const summary = buildOroplayRuntimeReadinessGateSummary();
  assert.strictEqual(summary.noPrismaWrite, true, "summary must keep Prisma write blocked.");
}

function assertDangerousFlagsFailClosed() {
  for (const flag of [
    "productionDbAllowed",
    "realMoneyAllowed",
    "liveOroplayCallAllowed",
    "externalNetworkAllowed",
    "walletMutationAllowed",
    "ledgerMutationAllowed",
    "prismaWriteAllowed",
    "migrationAllowed",
    "deployAllowed",
    "providerAliasEnabled",
    "secretsPresent",
  ]) {
    const gate = evaluateOroplayRuntimeReadinessGate({ [flag]: true });
    assert.strictEqual(gate.decision, "fail_closed", `${flag} must fail closed.`);
    assert(gate.blockedReasons.length > 0, `${flag} must include blockedReasons.`);
    assert.strictEqual(gate.runtimeImplementationAllowed, false, `${flag} must not allow implementation.`);
    assert.strictEqual(gate[flag], false, `${flag} output must remain false.`);
  }

  const localOnly = evaluateOroplayRuntimeReadinessGate({
    targetedSmokesPassed: true,
    allLocalSmokePassed: false,
  });
  assert.notStrictEqual(localOnly.decision, "fail_closed", "all-local blocker alone must not become implementation fail.");
  assert(localOnly.localValidationBlockers.length > 0, "all-local blocker must be explicit.");
}

function assertCertificationPack() {
  const validation = validateOroplayPreImplementationCertificationPack();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));

  const pack = evaluateOroplayPreImplementationCertificationPack();
  assert.strictEqual(pack.phase, "ORO-3D", "certification phase mismatch.");
  assert.strictEqual(pack.certificationType, "pre_implementation", "certification type mismatch.");
  assert.strictEqual(pack.runtimeEnabled, false, "certification pack must keep runtime disabled.");
  assert.strictEqual(pack.mutationAllowed, false, "certification pack must block mutation.");
  assert.strictEqual(pack.aliasEnabled, false, "certification pack must block alias.");
  assert.strictEqual(pack.liveTrafficAllowed, false, "certification pack must block live traffic.");
  assert(Array.isArray(pack.evidenceRequired) && pack.evidenceRequired.length > 0, "evidenceRequired must be populated.");
  assert(Array.isArray(pack.checklistItems) && pack.checklistItems.length > 0, "checklistItems must be populated.");
  assert(Array.isArray(pack.blockerMatrix) && pack.blockerMatrix.length > 0, "blockerMatrix must be populated.");
  assert(pack.passCount > 0, "passCount must be positive.");
  assert.strictEqual(pack.failCount, 0, "default failCount must be zero.");
  assert(pack.blockedCount > 0, "blockedCount must be positive.");
  assert.strictEqual(
    pack.readinessDecision,
    "certification_passed_but_runtime_blocked",
    "certification pass must still return runtime blocked."
  );

  const incomplete = evaluateOroplayPreImplementationCertificationPack({
    incompleteChecklistIds: ["monitoring"],
  });
  assert.strictEqual(incomplete.readinessDecision, "certification_incomplete", "missing evidence must be incomplete.");

  const failClosed = evaluateOroplayPreImplementationCertificationPack({ walletMutationAllowed: true });
  assert.strictEqual(failClosed.readinessDecision, "fail_closed", "dangerous certification input must fail closed.");

  const manualReview = evaluateOroplayPreImplementationCertificationPack({ manualReviewRequired: true });
  assert.strictEqual(
    manualReview.readinessDecision,
    "manual_review_required",
    "manual review input must require manual review."
  );
}

function assertBlockerMatrix() {
  const matrix = buildOroplayImplementationBlockerMatrix();
  for (const term of [
    "production DB",
    "real money",
    "wallet mutation",
    "ledger mutation",
    "alias enablement",
    "live traffic",
    "Prisma write",
  ]) {
    const found = matrix.some((item) => `${item.blocker} ${item.blockerId}`.toLowerCase().includes(term.toLowerCase()));
    assert(found, `blocker matrix missing ${term}.`);
  }
}

function assertRuntimeGateValidation() {
  const validation = validateOroplayCallbackRuntimeReadinessGate();
  assert.strictEqual(validation.ok, true, validation.errors.join("; "));
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

  for (const file of NEW_RUNTIME_FILES) {
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

function assertStaticDocs() {
  assertIncludes("ORO-3C execution plan doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN.md"), [
    "ORO-3C closed",
    "ORO-3D readiness gate current",
    "execution plan remains no-mutation",
  ]);
  assertIncludes("ORO-3B adapter doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_ADAPTER_CONTRACT.md"), [
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D readiness gate current",
  ]);
  assertIncludes("ORO-3A simulation doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_SIMULATION.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D readiness gate current",
  ]);
  assertIncludes("ORO runtime readiness doc", readRequired("docs/OROPLAY_CALLBACK_RUNTIME_READINESS.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D current",
    "runtime mutation still blocked",
    "runtime readiness gate remains closed",
  ]);
  assertIncludes("OroPlay callback API design", readRequired("docs/OROPLAY_CALLBACK_API_DESIGN.md"), [
    "ORO-3D readiness gate only",
    "ORO-2B fail-closed route remains default",
    "no runtime wallet/ledger mutation",
    "no provider-compatible alias enabled",
  ]);
  assertIncludes("OroPlay integration plan", readRequired("docs/OROPLAY_INTEGRATION_PLAN.md"), [
    "ORO-3A closed",
    "ORO-3B closed",
    "ORO-3C closed",
    "ORO-3D current",
    "ORO-3E blocked until readiness gate smoke passes",
  ]);
  assertIncludes("API mapping", readRequired("docs/API_MAPPING.md"), [
    "ORO-2B fail-closed route exists",
    "ORO-2C readiness contract closed",
    "ORO-3A runtime simulation closed",
    "ORO-3B adapter contract closed",
    "ORO-3C execution plan closed",
    "ORO-3D readiness gate only",
    "not production runtime",
    "no alias enabled",
    "no runtime wallet/ledger mutation",
    "runtime gate closed",
  ]);
  assertIncludes("Smoke coverage", readRequired("docs/SMOKE_COVERAGE.md"), [
    "smoke:oroplay-callback-runtime-readiness-gate",
    "readiness gate coverage",
    "pre-implementation certification pack coverage",
    "blocker matrix coverage",
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
    "ORO-3D current/readiness gate",
    "ORO-3E blocked until ORO-3D pass",
  ]);
}

function assertSanitizerTermsExist() {
  const combined = [
    readRequired(READINESS_GATE_DOC),
    readRequired(CERTIFICATION_DOC),
    readRequired(READINESS_GATE_FILE),
    readRequired(CERTIFICATION_PACK_FILE),
  ].join("\n");
  assertIncludes("sanitizer/redaction terms", combined, [
    "redact",
    "redacted",
    "Authorization header",
    "database URL",
    "client secret",
    "PIN",
    "device ID",
  ]);
}

function main() {
  assertDocsAndRegistration();
  assertRuntimeGateValidation();
  assertDefaultGateClosed();
  assertDangerousFlagsFailClosed();
  assertCertificationPack();
  assertBlockerMatrix();
  assertStaticDocs();
  assertSanitizerTermsExist();
  assertNoRuntimeMarkers();
  assertOro2bFailClosedAndAliasDisabled();
  console.log("ORO-3D OroPlay callback runtime readiness gate smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("ORO-3D OroPlay callback runtime readiness gate smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
