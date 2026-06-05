"use strict";

const {
  buildOro5oPostMountValidationBoundaryInput,
} = require("./oro5oPostMountValidationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5oPostMountValidationBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathInternalFailClosedRouteVerificationFixture = fixture(
  "happyPathInternalFailClosedRouteVerificationFixture"
);

const missingInternalMountFixture = fixture("missingInternalMountFixture", {
  oro5nMountEvidence: {
    routeMountPatchImplementedFromOro5n: false,
    oroplayInternalCallbackRouteMounted: false,
  },
});

const publicAliasDetectedFixture = fixture("publicAliasDetectedFixture", {
  safetyEvidence: {
    publicAliasImplemented: true,
    apiBalancePublicAliasMounted: true,
  },
});

const runtimeTrafficDetectedFixture = fixture("runtimeTrafficDetectedFixture", {
  safetyEvidence: { runtimeTrafficEnabled: true },
});

const walletMutationDetectedFixture = fixture("walletMutationDetectedFixture", {
  safetyEvidence: { [["wallet", "MutationPerformed"].join("")]: true },
});

const ledgerMutationDetectedFixture = fixture("ledgerMutationDetectedFixture", {
  safetyEvidence: { [["ledger", "MutationPerformed"].join("")]: true },
});

const prismaWriteDetectedFixture = fixture("prismaWriteDetectedFixture", {
  safetyEvidence: { [["prisma", "WritePerformed"].join("")]: true },
});

const externalNetworkDetectedFixture = fixture("externalNetworkDetectedFixture", {
  safetyEvidence: { externalNetworkCalled: true },
});

const liveOroPlayCallDetectedFixture = fixture("liveOroPlayCallDetectedFixture", {
  safetyEvidence: { [["live", "OroPlayApiCalled"].join("")]: true },
});

const backendNotListeningOptionalProbeSkippedFixture = fixture(
  "backendNotListeningOptionalProbeSkippedFixture",
  {
    postMountEvidence: {
      optionalLocalProbeAttempted: false,
      optionalLocalProbeSkippedReason: "backend_not_listening",
      optionalLocalProbeResult: "skipped_or_pass",
    },
  }
);

function buildOro5oPostMountValidationBoundaryFixtures() {
  return [
    happyPathInternalFailClosedRouteVerificationFixture,
    missingInternalMountFixture,
    publicAliasDetectedFixture,
    runtimeTrafficDetectedFixture,
    walletMutationDetectedFixture,
    ledgerMutationDetectedFixture,
    prismaWriteDetectedFixture,
    externalNetworkDetectedFixture,
    liveOroPlayCallDetectedFixture,
    backendNotListeningOptionalProbeSkippedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathInternalFailClosedRouteVerificationFixture,
  missingInternalMountFixture,
  publicAliasDetectedFixture,
  runtimeTrafficDetectedFixture,
  walletMutationDetectedFixture,
  ledgerMutationDetectedFixture,
  prismaWriteDetectedFixture,
  externalNetworkDetectedFixture,
  liveOroPlayCallDetectedFixture,
  backendNotListeningOptionalProbeSkippedFixture,
  cloneFixture,
  buildOro5oPostMountValidationBoundaryFixtures,
};
