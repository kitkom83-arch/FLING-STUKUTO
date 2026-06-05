"use strict";

const {
  buildOro5iActualPatchImplementationExecutionReadinessInput,
} = require("./oro5iActualPatchImplementationExecutionReadinessBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5iActualPatchImplementationExecutionReadinessInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationExecutionReadinessFixture = fixture(
  "happyPathActualPatchImplementationExecutionReadinessFixture"
);

const missingOro5hDecisionFixture = fixture("missingOro5hDecisionFixture", {
  oro5hDecision: { decisionPresent: false },
});

const oro5hDecisionNotApprovedFixture = fixture("oro5hDecisionNotApprovedFixture", {
  oro5hDecision: { actualPatchImplementationAuthorizationDecisionResult: "rejected" },
});

const authorizationNotGrantedFixture = fixture("authorizationNotGrantedFixture", {
  oro5hDecision: { actualPatchImplementationAuthorizationGranted: false },
});

const wrongGrantScopeFixture = fixture("wrongGrantScopeFixture", {
  oro5hDecision: {
    actualPatchImplementationAuthorizationGrantScope: "route_mount_authorization",
  },
});

const implementationAlreadyStartedFixture = fixture(
  "implementationAlreadyStartedFixture",
  { readinessState: { actualPatchImplementationExecutionStarted: true } }
);

const patchAlreadyAppliedFixture = fixture("patchAlreadyAppliedFixture", {
  readinessState: { actualPatchImplementationPatchApplied: true },
});

const implementationAlreadyImplementedFixture = fixture(
  "implementationAlreadyImplementedFixture",
  { readinessState: { actualPatchImplementationImplemented: true } }
);

const runtimeRoutePatchedUnexpectedlyFixture = fixture(
  "runtimeRoutePatchedUnexpectedlyFixture",
  { readinessState: { runtimeRoutePatched: true } }
);

const srcAppChangedUnexpectedlyFixture = fixture("srcAppChangedUnexpectedlyFixture", {
  readinessState: { srcAppChanged: true },
});

const routeControllerChangedUnexpectedlyFixture = fixture(
  "routeControllerChangedUnexpectedlyFixture",
  { readinessState: { runtimeRouteControllerChanged: true } }
);

const routeMountApprovedUnexpectedlyFixture = fixture(
  "routeMountApprovedUnexpectedlyFixture",
  { readinessState: { routeMountPatchApproved: true } }
);

const routeMountImplementationAuthorizedUnexpectedlyFixture = fixture(
  "routeMountImplementationAuthorizedUnexpectedlyFixture",
  { readinessState: { routeMountPatchImplementationAuthorized: true } }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  { readinessState: { routeMountAuthorization: "authorized_for_mount" } }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  { readinessState: { expressMountAllowed: true } }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  { readinessState: { publicAliasAllowed: true } }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  { readinessState: { runtimeTrafficAllowed: true } }
);

const walletMutationAllowedUnexpectedlyFixture = fixture(
  "walletMutationAllowedUnexpectedlyFixture",
  { readinessState: { walletMutationAllowed: true } }
);

const ledgerMutationAllowedUnexpectedlyFixture = fixture(
  "ledgerMutationAllowedUnexpectedlyFixture",
  { readinessState: { ledgerMutationAllowed: true } }
);

const prismaWriteAllowedUnexpectedlyFixture = fixture(
  "prismaWriteAllowedUnexpectedlyFixture",
  { readinessState: { prismaWriteAllowed: true } }
);

const dbTransactionAllowedUnexpectedlyFixture = fixture(
  "dbTransactionAllowedUnexpectedlyFixture",
  { readinessState: { dbTransactionAllowed: true } }
);

const migrationAllowedUnexpectedlyFixture = fixture(
  "migrationAllowedUnexpectedlyFixture",
  { readinessState: { migrationAllowed: true } }
);

const externalNetworkAllowedUnexpectedlyFixture = fixture(
  "externalNetworkAllowedUnexpectedlyFixture",
  { readinessState: { externalNetworkAllowed: true } }
);

const liveOroPlayApiCallAllowedUnexpectedlyFixture = fixture(
  "liveOroPlayApiCallAllowedUnexpectedlyFixture",
  { readinessState: { liveOroPlayApiCallAllowed: true } }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  readinessState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5iActualPatchImplementationExecutionReadinessFixtures() {
  return [
    happyPathActualPatchImplementationExecutionReadinessFixture,
    missingOro5hDecisionFixture,
    oro5hDecisionNotApprovedFixture,
    authorizationNotGrantedFixture,
    wrongGrantScopeFixture,
    implementationAlreadyStartedFixture,
    patchAlreadyAppliedFixture,
    implementationAlreadyImplementedFixture,
    runtimeRoutePatchedUnexpectedlyFixture,
    srcAppChangedUnexpectedlyFixture,
    routeControllerChangedUnexpectedlyFixture,
    routeMountApprovedUnexpectedlyFixture,
    routeMountImplementationAuthorizedUnexpectedlyFixture,
    routeMountAuthorizedUnexpectedlyFixture,
    expressMountAllowedUnexpectedlyFixture,
    publicAliasAllowedUnexpectedlyFixture,
    runtimeTrafficAllowedUnexpectedlyFixture,
    walletMutationAllowedUnexpectedlyFixture,
    ledgerMutationAllowedUnexpectedlyFixture,
    prismaWriteAllowedUnexpectedlyFixture,
    dbTransactionAllowedUnexpectedlyFixture,
    migrationAllowedUnexpectedlyFixture,
    externalNetworkAllowedUnexpectedlyFixture,
    liveOroPlayApiCallAllowedUnexpectedlyFixture,
    secretShapedOutputFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathActualPatchImplementationExecutionReadinessFixture,
  missingOro5hDecisionFixture,
  oro5hDecisionNotApprovedFixture,
  authorizationNotGrantedFixture,
  wrongGrantScopeFixture,
  implementationAlreadyStartedFixture,
  patchAlreadyAppliedFixture,
  implementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  srcAppChangedUnexpectedlyFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  expressMountAllowedUnexpectedlyFixture,
  publicAliasAllowedUnexpectedlyFixture,
  runtimeTrafficAllowedUnexpectedlyFixture,
  walletMutationAllowedUnexpectedlyFixture,
  ledgerMutationAllowedUnexpectedlyFixture,
  prismaWriteAllowedUnexpectedlyFixture,
  dbTransactionAllowedUnexpectedlyFixture,
  migrationAllowedUnexpectedlyFixture,
  externalNetworkAllowedUnexpectedlyFixture,
  liveOroPlayApiCallAllowedUnexpectedlyFixture,
  secretShapedOutputFixture,
  cloneFixture,
  buildOro5iActualPatchImplementationExecutionReadinessFixtures,
};
