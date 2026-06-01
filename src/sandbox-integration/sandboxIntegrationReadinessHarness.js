"use strict";

const assert = require("assert");

const {
  SANDBOX_READINESS_STATUSES,
  SANDBOX_BLOCK_REASONS,
  createSandboxProviderConfig,
  createSandboxDryRunRequest,
  createSandboxDryRunResponse,
  createSandboxCallbackPayload,
  normalizeSandboxIntegrationEvent,
  buildSandboxIdempotencyKey,
  evaluateSandboxReadiness,
  assertNoExternalNetworkAttempt,
  assertNoLiveProviderMode,
  assertNoRealSecretValue,
  assertNoRuntimeMoneyMutation,
  assertNoLedgerPosting,
  assertNoAutoCredit,
} = require("./sandboxIntegrationReadinessContract");

function runCase(label, fn) {
  fn();
  return `${label}: PASS`;
}

function baseConfig(overrides = {}) {
  return createSandboxProviderConfig({
    providerKey: "truemoney_official_sandbox",
    mode: "mock",
    endpointPlaceholder: "https://sandbox-placeholder.invalid/provider",
    callbackPlaceholder: "https://example.invalid/sandbox/callback",
    credentialPlaceholder: "redacted-placeholder",
    ...overrides,
  });
}

function assertNoMoneyOrLedgerMutation(result) {
  assertNoRuntimeMoneyMutation(result);
  assertNoLedgerPosting(result);
  assertNoAutoCredit(result);
  assert.strictEqual(result.canCreditMember, false);
  assert.strictEqual(result.canDebitMember, false);
  assert.strictEqual(result.walletMutated, false);
  assert.strictEqual(result.runtimeLedgerMutation, false);
  assert.strictEqual(result.ledgerPosted, false);
  assert.strictEqual(result.autoCredit, false);
}

function runSandboxIntegrationReadinessHarness() {
  const lines = [];

  lines.push(
    runCase("mock provider config passes mock-only readiness", () => {
      const readiness = evaluateSandboxReadiness(baseConfig());
      assert.strictEqual(readiness.readinessStatus, SANDBOX_READINESS_STATUSES.CONFIGURED_MOCK_ONLY);
      assert.strictEqual(readiness.success, true);
    })
  );

  lines.push(
    runCase("sandbox_configured_not_called does not call external network", () => {
      const readiness = evaluateSandboxReadiness(
        baseConfig({ mode: "sandbox_configured_not_called", credentialPlaceholder: "redacted-placeholder" })
      );
      assert.strictEqual(readiness.readinessStatus, SANDBOX_READINESS_STATUSES.READY_FOR_DRY_RUN);
      assert.strictEqual(readiness.externalNetworkCalled, false);
      assertNoExternalNetworkAttempt(readiness);
    })
  );

  lines.push(
    runCase("live provider mode blocked", () => {
      const readiness = evaluateSandboxReadiness(baseConfig({ mode: "live_after_certification_only" }));
      assert.strictEqual(readiness.readinessStatus, SANDBOX_READINESS_STATUSES.FAILED_CONTRACT_CHECK);
      assert(readiness.blockReasons.includes(SANDBOX_BLOCK_REASONS.LIVE_PROVIDER_MODE));
      assert.throws(() => assertNoLiveProviderMode({ mode: "live_after_certification_only" }), /blocked/);
    })
  );

  lines.push(
    runCase("missing config blocked", () => {
      const readiness = evaluateSandboxReadiness(
        baseConfig({ mode: "sandbox_configured_not_called", endpointPlaceholder: "missing display value" })
      );
      assert.strictEqual(readiness.readinessStatus, SANDBOX_READINESS_STATUSES.BLOCKED_MISSING_CONFIG);
    })
  );

  lines.push(
    runCase("secret-shaped token blocked", () => {
      assert.throws(() => createSandboxProviderConfig({ token: "real-provider-token-value" }), /secret/i);
    })
  );

  lines.push(
    runCase("secret-shaped password blocked", () => {
      assert.throws(() => createSandboxProviderConfig({ password: "real-provider-password-value" }), /secret/i);
    })
  );

  lines.push(
    runCase("secret-shaped PIN blocked", () => {
      assert.throws(() => createSandboxProviderConfig({ pin: "123456" }), /secret/i);
    })
  );

  lines.push(
    runCase("real DATABASE_URL shaped value blocked", () => {
      assert.throws(
        () => assertNoRealSecretValue("postgresql://user:pass@db.example.invalid:5432/app"),
        /database|credential/i
      );
    })
  );

  lines.push(
    runCase("fake sandbox placeholder accepted", () => {
      const config = createSandboxProviderConfig({
        providerKey: "tmnone_sandbox",
        mode: "sandbox_configured_not_called",
        credentialPlaceholder: "fake-sandbox-key",
        devicePlaceholder: "fake-device-id",
        pinPlaceholder: "fake-pin-redacted",
      });
      assert.strictEqual(config.credentialPlaceholder, "fake-sandbox-key");
      assertNoRealSecretValue(config);
    })
  );

  lines.push(
    runCase("sandbox dry-run request creates fake payload only", () => {
      const request = createSandboxDryRunRequest(baseConfig({ mode: "sandbox_configured_not_called" }));
      assert.strictEqual(request.fakePayloadOnly, true);
      assert.strictEqual(request.contractOnly, true);
      assertNoExternalNetworkAttempt(request);
    })
  );

  lines.push(
    runCase("sandbox dry-run response does not credit member", () => {
      const response = createSandboxDryRunResponse(baseConfig());
      assert.strictEqual(response.canCreditMember, false);
      assert.strictEqual(response.creditsMember, false);
      assertNoMoneyOrLedgerMutation(response);
    })
  );

  lines.push(
    runCase("sandbox dry-run response does not debit member", () => {
      const response = createSandboxDryRunResponse(baseConfig());
      assert.strictEqual(response.canDebitMember, false);
      assert.strictEqual(response.debitsMember, false);
      assertNoMoneyOrLedgerMutation(response);
    })
  );

  lines.push(
    runCase("sandbox dry-run response does not mutate wallet", () => {
      const response = createSandboxDryRunResponse(baseConfig());
      assert.strictEqual(response.walletMutated, false);
      assertNoMoneyOrLedgerMutation(response);
    })
  );

  lines.push(
    runCase("sandbox dry-run response does not post ledger", () => {
      const response = createSandboxDryRunResponse(baseConfig());
      assert.strictEqual(response.ledgerPosted, false);
      assertNoMoneyOrLedgerMutation(response);
    })
  );

  lines.push(
    runCase("sandbox callback payload is contract-only", () => {
      const payload = createSandboxCallbackPayload(baseConfig());
      assert.strictEqual(payload.contractOnly, true);
      assert.strictEqual(payload.fakePayloadOnly, true);
      assert.strictEqual(payload.signatureValidated, false);
    })
  );

  lines.push(
    runCase("idempotency key stable", () => {
      const first = buildSandboxIdempotencyKey(baseConfig());
      const second = buildSandboxIdempotencyKey(baseConfig());
      assert.strictEqual(first, second);
    })
  );

  lines.push(
    runCase("duplicate orderId detected", () => {
      const event = normalizeSandboxIntegrationEvent({ ...baseConfig(), seen: { orderIds: ["as-order-001"] } });
      assert.strictEqual(event.duplicate, true);
      assert.strictEqual(event.duplicateField, "orderId");
    })
  );

  lines.push(
    runCase("duplicate providerTransactionId detected", () => {
      const event = normalizeSandboxIntegrationEvent({
        ...baseConfig(),
        orderId: "as-order-002",
        seen: { providerTransactionIds: ["as-provider-tx-001"] },
      });
      assert.strictEqual(event.duplicate, true);
      assert.strictEqual(event.duplicateField, "providerTransactionId");
    })
  );

  lines.push(
    runCase("duplicate rawHash detected", () => {
      const event = normalizeSandboxIntegrationEvent({
        ...baseConfig(),
        orderId: "as-order-003",
        providerTransactionId: "as-provider-tx-003",
        seen: { rawHashes: ["mock_raw_hash_as_001"] },
      });
      assert.strictEqual(event.duplicate, true);
      assert.strictEqual(event.duplicateField, "rawHash");
    })
  );

  lines.push(
    runCase("SMS fallback remains manual_review", () => {
      const response = createSandboxDryRunResponse(
        baseConfig({ providerKey: "bank_sms_fallback_manual_review", mode: "mock" })
      );
      assert.strictEqual(response.recommendationType, "manual_review");
      assert.strictEqual(response.readinessStatus, SANDBOX_READINESS_STATUSES.MANUAL_REVIEW_REQUIRED);
    })
  );

  lines.push(
    runCase("manual admin source requires reason", () => {
      assert.throws(() => createSandboxDryRunResponse(baseConfig({ providerKey: "manual_admin_sandbox" })), /reason/);
      const response = createSandboxDryRunResponse(
        baseConfig({ providerKey: "manual_admin_sandbox", reason: "mock sandbox review reason" })
      );
      assert.strictEqual(response.recommendationType, "manual_review");
    })
  );

  lines.push(
    runCase("no external network marker", () => {
      assert.throws(() => assertNoExternalNetworkAttempt({ externalNetworkCalled: true }), /external network/);
      assertNoExternalNetworkAttempt({ externalNetworkCalled: false });
    })
  );

  lines.push(
    runCase("no real money marker", () => {
      const response = createSandboxDryRunResponse(baseConfig());
      assert.strictEqual(response.realMoneyFlow, false);
      assert.strictEqual(response.noRealMoney, true);
    })
  );

  const result = {
    success: true,
    phase: "Phase AS Sandbox Integration Readiness",
    mode: "docs/static/sandbox-readiness only",
    noProductionDb: true,
    noExternalNetwork: true,
    noRealMoney: true,
    noRealQr: true,
    noRealPayment: true,
    noLiveProvider: true,
    noPayout: true,
    noRuntimeLedgerMutation: true,
    noAutoCreditFromSandboxResult: true,
    cases: lines,
  };

  lines.push(
    runCase("no secret-shaped values in output", () => {
      assertNoRealSecretValue(result);
    })
  );

  result.cases = lines;
  return result;
}

if (require.main === module) {
  try {
    const result = runSandboxIntegrationReadinessHarness();
    console.log("Sandbox integration readiness harness: PASS");
    for (const line of result.cases) console.log(line);
    console.log("no external network: PASS");
    console.log("no real money: PASS");
    console.log("no auto-credit from sandbox result: PASS");
    console.log("no runtime ledger mutation: PASS");
    console.log("no secret-shaped values: PASS");
  } catch (error) {
    console.error("Sandbox integration readiness harness: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  runSandboxIntegrationReadinessHarness,
};
