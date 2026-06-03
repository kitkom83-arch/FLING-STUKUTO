"use strict";

const PHASE = "ORO-4H";
const NAME = "Staging Route Wiring Dry-Run Gate";
const GATE_MODE = "DRY_RUN_ONLY";
const DRY_RUN_GATE_PASS = "DRY_RUN_GATE_PASS";
const BLOCKED = "BLOCKED";
const MOUNT_BLOCKED_BY_PHASE = "MOUNT_BLOCKED_BY_PHASE";
const PUBLIC_ALIAS_BLOCKED_BY_PHASE = "PUBLIC_ALIAS_BLOCKED_BY_PHASE";
const NO_RUNTIME_TRAFFIC = "NO_RUNTIME_TRAFFIC";

const ROUTE_CANDIDATES = Object.freeze([
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/balance",
    candidateOnly: true,
    staticRouteDescriptorOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/transaction",
    candidateOnly: true,
    staticRouteDescriptorOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
]);

const BLOCKED_ALIASES = Object.freeze([
  Object.freeze({
    method: "POST",
    path: "/api/balance",
    blocked: true,
    active: false,
    mounted: false,
    public: false,
  }),
  Object.freeze({
    method: "POST",
    path: "/api/transaction",
    blocked: true,
    active: false,
    mounted: false,
    public: false,
  }),
]);

const DOCUMENTATION_GATES = Object.freeze([
  Object.freeze({ gate: "callbackAuthBoundaryDocumented", field: "callbackAuthBoundaryDocumented" }),
  Object.freeze({ gate: "requestEnvelopeDocumented", field: "requestEnvelopeDocumented" }),
  Object.freeze({ gate: "responseEnvelopeDocumented", field: "responseEnvelopeDocumented" }),
  Object.freeze({ gate: "transactionIdempotencyDocumented", field: "transactionIdempotencyDocumented" }),
  Object.freeze({
    gate: "duplicateTransactionFailClosedDocumented",
    field: "duplicateTransactionFailClosedDocumented",
  }),
  Object.freeze({
    gate: "insufficientBalanceFailClosedDocumented",
    field: "insufficientBalanceFailClosedDocumented",
  }),
  Object.freeze({ gate: "invalidUserFailClosedDocumented", field: "invalidUserFailClosedDocumented" }),
  Object.freeze({ gate: "malformedPayloadFailClosedDocumented", field: "malformedPayloadFailClosedDocumented" }),
  Object.freeze({ gate: "sanitizedLogPreviewDocumented", field: "sanitizedLogPreviewDocumented" }),
  Object.freeze({ gate: "observabilityDocumented", field: "observabilityDocumented" }),
  Object.freeze({ gate: "uatSignoffSeparated", field: "uatSignoffSeparated" }),
]);

const ROLLBACK_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "keepRouteUnmounted", label: "keep route unmounted" }),
  Object.freeze({ key: "disableStagingFlag", label: "disable staging flag" }),
  Object.freeze({ key: "keepPublicAliasesBlocked", label: "keep public aliases blocked" }),
  Object.freeze({ key: "keepFailClosedBehavior", label: "keep fail-closed behavior" }),
  Object.freeze({ key: "preserveSanitizedLogsOnly", label: "preserve sanitized logs only" }),
  Object.freeze({ key: "stopDryRunDescriptorPromotion", label: "stop dry-run descriptor promotion" }),
  Object.freeze({
    key: "verifyNoWalletLedgerMutationOccurred",
    label: "verify no wallet/ledger mutation occurred",
  }),
  Object.freeze({ key: "verifyNoPrismaWriteOccurred", label: "verify no Prisma write occurred" }),
  Object.freeze({ key: "runTargetedSmoke", label: "run targeted smoke" }),
  Object.freeze({ key: "runSafeCiBeforeLaterPhase", label: "run Safe CI before any later phase" }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
}

function collectStringValues(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStringValues(entry, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectStringValues(entry, output);
  }
  return output;
}

function secretShapePatterns() {
  return [
    new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
    new RegExp(`${["Ba", "sic"].join("")}\\s+[A-Za-z0-9+/=]{12,}`, "i"),
    /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    new RegExp(`\\b${["s", "k"].join("")}-[A-Za-z0-9_-]{12,}\\b`, "i"),
    new RegExp(`${["DATABASE", "_URL"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["pass", "word"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["client", "Secret"].join("")}\\s*[:=]`, "i"),
    new RegExp(["-----BEGIN", " PRIVATE KEY-----"].join(""), "i"),
  ];
}

function hasSecretShapedString(value) {
  const strings = collectStringValues(value);
  const patterns = secretShapePatterns();
  return strings.some((entry) => patterns.some((pattern) => pattern.test(entry)));
}

function normalizeChangedFile(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "");
}

function normalizeFixture(fixture) {
  const source = fixture && typeof fixture === "object" ? fixture : {};
  const changedFiles = normalizeList(source.changedFiles).map(normalizeChangedFile);

  return {
    id: source.id || "unnamed-dry-run-gate-fixture",
    expressMounted: source.expressMounted === true || source.expressMount === true,
    routeActive: source.routeActive === true,
    publicAliasActive: source.publicAliasActive === true,
    publicAliasAllowed: source.publicAliasAllowed === true,
    proposedAliases: normalizeList(source.proposedAliases),
    srcAppChangeRequired: source.srcAppChangeRequired === true,
    changedFiles,
    runtimeTraffic: source.runtimeTraffic === true,
    runtimeTrafficAllowed: source.runtimeTrafficAllowed === true,
    walletMutation: source.walletMutation === true,
    ledgerMutation: source.ledgerMutation === true,
    prismaWrite: source.prismaWrite === true,
    externalNetwork: source.externalNetwork === true,
    liveOroPlayCall: source.liveOroPlayCall === true,
    credentialLeakDetected: source.credentialLeakDetected === true,
    secretShapedFixtureDetected: source.secretShapedFixtureDetected === true || hasSecretShapedString(source),
    documentation: source.documentation && typeof source.documentation === "object" ? source.documentation : {},
    rollback: source.rollback && typeof source.rollback === "object" ? source.rollback : {},
  };
}

function gateResult(name, passed, evidence, notes) {
  return {
    name,
    status: passed ? "PASS" : BLOCKED,
    passed,
    evidence,
    notes,
  };
}

function evaluateNoPublicAlias(fixture) {
  const proposedBlockedAliases = fixture.proposedAliases.filter((pathValue) =>
    BLOCKED_ALIASES.some((alias) => alias.path === pathValue)
  );
  const passed =
    proposedBlockedAliases.length === 0 && fixture.publicAliasAllowed !== true && fixture.publicAliasActive !== true;

  return gateResult(
    "noPublicAlias",
    passed,
    {
      blockedAliases: clone(BLOCKED_ALIASES),
      proposedBlockedAliases,
      publicAliasAttempted: proposedBlockedAliases.length > 0,
      publicAliasAllowedAttempted: fixture.publicAliasAllowed,
      publicAliasMountedAttempted: fixture.publicAliasActive,
    },
    passed ? "No public alias is proposed or active." : "Public alias proposal is blocked by phase."
  );
}

function evaluateRollbackReadiness(fixture) {
  const requirements = ROLLBACK_REQUIREMENTS.map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    status: fixture.rollback[requirement.key] === true ? "PASS" : BLOCKED,
    passed: fixture.rollback[requirement.key] === true,
  }));

  return {
    status: requirements.every((item) => item.passed) ? "PASS" : BLOCKED,
    requirements,
  };
}

function evaluateOroPlayCallbackStagingRouteDryRunGate(fixtureInput) {
  return buildOroPlayCallbackStagingRouteDryRunGateReport(fixtureInput);
}

function buildOroPlayCallbackStagingRouteDryRunGateReport(fixtureInput) {
  const fixture = normalizeFixture(fixtureInput);
  const rollback = evaluateRollbackReadiness(fixture);
  const srcAppChanged = fixture.changedFiles.includes("src/app.js");
  const gates = [
    gateResult(
      "noExpressMount",
      fixture.expressMounted !== true,
      { expressMountAttempted: fixture.expressMounted },
      "ORO-4H cannot mount Express routes."
    ),
    evaluateNoPublicAlias(fixture),
    gateResult(
      "noActiveRoute",
      fixture.routeActive !== true,
      { routeActivationAttempted: fixture.routeActive },
      "Route candidates must remain inactive."
    ),
    gateResult(
      "noSrcAppChangeRequired",
      fixture.srcAppChangeRequired !== true && srcAppChanged !== true,
      {
        srcAppChangeRequired: fixture.srcAppChangeRequired,
        srcAppJsChanged: srcAppChanged,
      },
      "ORO-4H must not require or include src/app.js changes."
    ),
    gateResult(
      "noRuntimeTraffic",
      fixture.runtimeTraffic !== true && fixture.runtimeTrafficAllowed !== true,
      {
        runtimeTrafficAttempted: fixture.runtimeTraffic,
        runtimeTrafficAllowedAttempted: fixture.runtimeTrafficAllowed,
      },
      "Runtime traffic is blocked in ORO-4H."
    ),
    gateResult(
      "noRuntimeWalletMutation",
      fixture.walletMutation !== true,
      { walletMutationAttempted: fixture.walletMutation },
      "Wallet mutation is blocked in dry-run."
    ),
    gateResult(
      "noRuntimeLedgerMutation",
      fixture.ledgerMutation !== true,
      { ledgerMutationAttempted: fixture.ledgerMutation },
      "Ledger mutation is blocked in dry-run."
    ),
    gateResult(
      "noPrismaWrite",
      fixture.prismaWrite !== true,
      { prismaWriteAttempted: fixture.prismaWrite },
      "Prisma writes are blocked in dry-run."
    ),
    gateResult(
      "noExternalNetwork",
      fixture.externalNetwork !== true,
      { externalNetworkAttempted: fixture.externalNetwork },
      "External network is blocked in dry-run."
    ),
    gateResult(
      "noLiveOroPlayCall",
      fixture.liveOroPlayCall !== true,
      { liveOroPlayCallAttempted: fixture.liveOroPlayCall },
      "Live OroPlay calls are blocked in dry-run."
    ),
    gateResult(
      "noCredentialLeak",
      fixture.credentialLeakDetected !== true,
      { credentialLeakDetected: fixture.credentialLeakDetected },
      "Credential-like values must not be present or echoed."
    ),
    gateResult(
      "noSecretShapedFixture",
      fixture.secretShapedFixtureDetected !== true,
      { secretShapedFixtureDetected: fixture.secretShapedFixtureDetected },
      "Fixtures must use neutral markers only."
    ),
  ];

  for (const docGate of DOCUMENTATION_GATES) {
    gates.push(
      gateResult(
        docGate.gate,
        fixture.documentation[docGate.field] === true,
        { documented: fixture.documentation[docGate.field] === true },
        `${docGate.gate} must be documented for dry-run gate evidence.`
      )
    );
  }

  gates.push(
    gateResult(
      "rollbackDocumented",
      fixture.documentation.rollbackDocumented === true && rollback.status === "PASS",
      {
        documented: fixture.documentation.rollbackDocumented === true,
        rollbackStatus: rollback.status,
      },
      "Rollback and abort readiness must be documented for dry-run gate evidence."
    )
  );

  const blockedGates = gates.filter((gate) => !gate.passed);
  const dryRunStatus = blockedGates.length > 0 ? BLOCKED : DRY_RUN_GATE_PASS;

  return {
    phase: PHASE,
    name: NAME,
    fixtureId: fixture.id,
    gateMode: GATE_MODE,
    dryRunStatus,
    mountStatus: MOUNT_BLOCKED_BY_PHASE,
    publicAliasStatus: PUBLIC_ALIAS_BLOCKED_BY_PHASE,
    runtimeTrafficStatus: NO_RUNTIME_TRAFFIC,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    routeActive: false,
    liveRouteActive: false,
    routeCandidates: clone(ROUTE_CANDIDATES),
    blockedAliases: clone(BLOCKED_ALIASES),
    gates,
    rollback,
    safety: {
      dryRunOnly: true,
      staticRouteDescriptorOnly: true,
      mockInvocationOnly: true,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeTrafficAllowed: false,
      liveRouteAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      externalNetworkAllowed: false,
      liveOroPlayCallAllowed: false,
    },
    ok: blockedGates.length === 0,
    blockedGateNames: blockedGates.map((gate) => gate.name),
  };
}

function summarizeOroPlayCallbackDryRunGate(reportOrFixture) {
  const report =
    reportOrFixture && Array.isArray(reportOrFixture.gates)
      ? reportOrFixture
      : buildOroPlayCallbackStagingRouteDryRunGateReport(reportOrFixture);

  return {
    phase: report.phase,
    name: report.name,
    gateMode: report.gateMode,
    dryRunStatus: report.dryRunStatus,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    runtimeTrafficAllowed: false,
    routeCandidatesActive: report.routeCandidates.some((route) => route.active === true),
    publicAliasesActive: report.blockedAliases.some((alias) => alias.active === true || alias.mounted === true),
    blockedGateCount: report.blockedGateNames.length,
    blockedGateNames: report.blockedGateNames.slice(),
  };
}

module.exports = {
  PHASE,
  NAME,
  GATE_MODE,
  DRY_RUN_GATE_PASS,
  BLOCKED,
  MOUNT_BLOCKED_BY_PHASE,
  PUBLIC_ALIAS_BLOCKED_BY_PHASE,
  NO_RUNTIME_TRAFFIC,
  ROUTE_CANDIDATES,
  BLOCKED_ALIASES,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRouteDryRunGateReport,
  evaluateOroPlayCallbackStagingRouteDryRunGate,
  summarizeOroPlayCallbackDryRunGate,
};
