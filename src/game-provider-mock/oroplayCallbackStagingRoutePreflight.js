"use strict";

const PHASE = "ORO-4G";
const NAME = "Staging Route Wiring Preflight";
const MOUNT_READINESS_BLOCKED = "BLOCKED";
const MOUNT_READINESS_NOT_READY = "NOT_READY_TO_MOUNT";
const MOUNT_READINESS_STATE = "NOT_READY_TO_MOUNT_BY_DEFAULT";

const ROUTE_CANDIDATES = Object.freeze([
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/balance",
    candidateOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
  Object.freeze({
    method: "POST",
    path: "/api/oroplay/transaction",
    candidateOnly: true,
    active: false,
    mounted: false,
    public: false,
    alias: false,
  }),
]);

const BLOCKED_ALIASES = Object.freeze([
  Object.freeze({ method: "POST", path: "/api/balance", blocked: true, active: false }),
  Object.freeze({ method: "POST", path: "/api/transaction", blocked: true, active: false }),
]);

const DOCUMENTATION_GATES = Object.freeze([
  Object.freeze({ gate: "callbackAuthDocumented", field: "callbackAuthDocumented" }),
  Object.freeze({ gate: "requestEnvelopeDocumented", field: "requestEnvelopeDocumented" }),
  Object.freeze({ gate: "responseEnvelopeDocumented", field: "responseEnvelopeDocumented" }),
  Object.freeze({ gate: "idempotencyDocumented", field: "idempotencyDocumented" }),
  Object.freeze({ gate: "rollbackDocumented", field: "rollbackDocumented" }),
  Object.freeze({ gate: "stagingFlagDocumented", field: "stagingFlagDocumented" }),
  Object.freeze({ gate: "observabilityDocumented", field: "observabilityDocumented" }),
  Object.freeze({ gate: "uatChecklistDocumented", field: "uatChecklistDocumented" }),
]);

const ROLLBACK_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "disableStagingFlag", label: "disable staging flag" }),
  Object.freeze({ key: "removeRouteMount", label: "remove route mount" }),
  Object.freeze({ key: "keepFailClosedBehavior", label: "keep fail-closed behavior" }),
  Object.freeze({ key: "preserveSanitizedLogs", label: "preserve sanitized logs" }),
  Object.freeze({ key: "stopExternalTraffic", label: "stop external traffic" }),
  Object.freeze({ key: "verifyNoWalletLedgerMutationOccurred", label: "verify no wallet/ledger mutation occurred" }),
  Object.freeze({ key: "runTargetedSmoke", label: "run targeted smoke" }),
  Object.freeze({ key: "runSafeCi", label: "run Safe CI" }),
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
    new RegExp(`${["DATABASE", "_URL"].join("")}\\s*=`, "i"),
    new RegExp(`${["pass", "word"].join("")}\\s*[:=]`, "i"),
    new RegExp(`${["client", "Secret"].join("")}\\s*[:=]`, "i"),
  ];
}

function hasSecretShapedString(value) {
  const strings = collectStringValues(value);
  const patterns = secretShapePatterns();
  return strings.some((entry) => patterns.some((pattern) => pattern.test(entry)));
}

function normalizeFixture(fixture) {
  const source = fixture && typeof fixture === "object" ? fixture : {};
  return {
    id: source.id || "unnamed-preflight-fixture",
    expressMount: source.expressMount === true,
    runtimeWiredToLiveRoute: source.runtimeWiredToLiveRoute === true,
    routeActive: source.routeActive === true,
    publicAliasActive: source.publicAliasActive === true,
    publicAliasAllowed: source.publicAliasAllowed === true,
    proposedAliases: normalizeList(source.proposedAliases),
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
    status: passed ? "PASS" : "BLOCKED",
    passed,
    evidence,
    notes,
  };
}

function evaluateNoPublicAlias(fixture) {
  const proposedBlockedAliases = fixture.proposedAliases.filter((path) =>
    BLOCKED_ALIASES.some((alias) => alias.path === path)
  );
  const passed =
    proposedBlockedAliases.length === 0 && fixture.publicAliasAllowed !== true && fixture.publicAliasActive !== true;

  return gateResult(
    "noPublicAlias",
    passed,
    {
      blockedAliases: clone(BLOCKED_ALIASES),
      proposedBlockedAliases,
      publicAliasAllowed: fixture.publicAliasAllowed,
      publicAliasActive: fixture.publicAliasActive,
    },
    passed ? "No public alias proposed or active." : "Public alias proposal or active alias is blocked."
  );
}

function evaluateRollbackReadiness(fixture) {
  const items = ROLLBACK_REQUIREMENTS.map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    status: fixture.rollback[requirement.key] === true ? "PASS" : "BLOCKED",
    passed: fixture.rollback[requirement.key] === true,
  }));

  return {
    status: items.every((item) => item.passed) ? "PASS" : "BLOCKED",
    requirements: items,
  };
}

function buildOroPlayCallbackStagingRoutePreflightReport(fixtureInput) {
  const fixture = normalizeFixture(fixtureInput);
  const rollback = evaluateRollbackReadiness(fixture);
  const gates = [
    gateResult(
      "noExpressMount",
      fixture.expressMount !== true && fixture.runtimeWiredToLiveRoute !== true && fixture.routeActive !== true,
      {
        expressMount: fixture.expressMount,
        runtimeWiredToLiveRoute: fixture.runtimeWiredToLiveRoute,
        routeActive: fixture.routeActive,
      },
      "ORO-4G does not mount Express routes or activate runtime routes."
    ),
    evaluateNoPublicAlias(fixture),
    gateResult("noSrcAppChangeRequired", true, { srcAppJsChangeRequired: false }, "ORO-4G does not require app edits."),
    gateResult(
      "noRuntimeWalletMutation",
      fixture.walletMutation !== true,
      { walletMutation: fixture.walletMutation },
      "Wallet mutation is blocked in preflight."
    ),
    gateResult(
      "noRuntimeLedgerMutation",
      fixture.ledgerMutation !== true,
      { ledgerMutation: fixture.ledgerMutation },
      "Ledger mutation is blocked in preflight."
    ),
    gateResult(
      "noPrismaWrite",
      fixture.prismaWrite !== true,
      { prismaWrite: fixture.prismaWrite },
      "Prisma writes are blocked in preflight."
    ),
    gateResult(
      "noExternalNetwork",
      fixture.externalNetwork !== true,
      { externalNetwork: fixture.externalNetwork },
      "External network is blocked in preflight."
    ),
    gateResult(
      "noLiveOroPlayCall",
      fixture.liveOroPlayCall !== true,
      { liveOroPlayCall: fixture.liveOroPlayCall },
      "Live OroPlay calls are blocked in preflight."
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
        `${docGate.gate} must be documented before a future mount.`
      )
    );
  }

  gates.push(
    gateResult(
      "rollbackChecklistComplete",
      rollback.status === "PASS",
      { rollbackStatus: rollback.status },
      "Rollback checklist must be complete before a future mount."
    )
  );

  const failedGates = gates.filter((gate) => !gate.passed);
  const mountReadiness = failedGates.length > 0 ? MOUNT_READINESS_BLOCKED : MOUNT_READINESS_NOT_READY;

  return {
    phase: PHASE,
    name: NAME,
    fixtureId: fixture.id,
    mountReadiness,
    mountReadinessState: MOUNT_READINESS_STATE,
    expressMountAllowed: false,
    publicAliasAllowed: false,
    routeActive: false,
    publicAliasActive: false,
    routeCandidates: clone(ROUTE_CANDIDATES),
    blockedAliases: clone(BLOCKED_ALIASES),
    gates,
    rollback,
    safety: {
      preMountOnly: true,
      expressMountAllowed: false,
      publicAliasAllowed: false,
      runtimeRouteAllowed: false,
      walletMutationAllowed: false,
      ledgerMutationAllowed: false,
      prismaWriteAllowed: false,
      externalNetworkAllowed: false,
      liveOroPlayCallAllowed: false,
      readyToMountAllowed: false,
    },
    ok: failedGates.length === 0,
    blockedGateNames: failedGates.map((gate) => gate.name),
  };
}

function evaluateOroPlayCallbackStagingRoutePreflight(fixtureInput) {
  return buildOroPlayCallbackStagingRoutePreflightReport(fixtureInput);
}

function summarizeOroPlayCallbackMountReadiness(reportOrFixture) {
  const report =
    reportOrFixture && Array.isArray(reportOrFixture.gates)
      ? reportOrFixture
      : buildOroPlayCallbackStagingRoutePreflightReport(reportOrFixture);

  return {
    phase: report.phase,
    name: report.name,
    mountReadiness: report.mountReadiness,
    mountReadinessState: report.mountReadinessState,
    readyToMount: false,
    routeCandidatesActive: report.routeCandidates.some((route) => route.active === true),
    publicAliasesActive: report.blockedAliases.some((alias) => alias.active === true),
    blockedGateCount: report.blockedGateNames.length,
    blockedGateNames: report.blockedGateNames.slice(),
  };
}

module.exports = {
  PHASE,
  MOUNT_READINESS_BLOCKED,
  MOUNT_READINESS_NOT_READY,
  MOUNT_READINESS_STATE,
  ROUTE_CANDIDATES,
  BLOCKED_ALIASES,
  ROLLBACK_REQUIREMENTS,
  buildOroPlayCallbackStagingRoutePreflightReport,
  evaluateOroPlayCallbackStagingRoutePreflight,
  summarizeOroPlayCallbackMountReadiness,
};
