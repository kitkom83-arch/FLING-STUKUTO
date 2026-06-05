"use strict";

const {
  buildOro5jActualPatchImplementationExecutionInput,
} = require("./oro5jActualPatchImplementationExecutionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5jActualPatchImplementationExecutionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathActualPatchImplementationExecutionFixture = fixture(
  "happyPathActualPatchImplementationExecutionFixture"
);

const missingOro5iReadinessFixture = fixture("missingOro5iReadinessFixture", {
  oro5iReadiness: { readinessPresent: false },
});

const readinessNotCheckedFixture = fixture("readinessNotCheckedFixture", {
  oro5iReadiness: { actualPatchImplementationExecutionReadinessChecked: false },
});

const readinessWrongStatusFixture = fixture("readinessWrongStatusFixture", {
  oro5iReadiness: {
    actualPatchImplementationExecutionReadinessStatus: "hold",
  },
});

const isolatedMockExecutionPlanMissingFixture = fixture(
  "isolatedMockExecutionPlanMissingFixture",
  { oro5iReadiness: { isolatedMockExecutionPlanPrepared: false } }
);

const executionBoundaryEntryNotAllowedFixture = fixture(
  "executionBoundaryEntryNotAllowedFixture",
  { oro5iReadiness: { executionBoundaryEntryAllowed: false } }
);

const wrongExecutionBoundaryEntryScopeFixture = fixture(
  "wrongExecutionBoundaryEntryScopeFixture",
  { oro5iReadiness: { executionBoundaryEntryScope: "runtime_patch_execution" } }
);

const authorizationDecisionMissingFixture = fixture(
  "authorizationDecisionMissingFixture",
  { oro5iReadiness: { actualPatchImplementationAuthorizationDecisionIssued: false } }
);

const authorizationNotGrantedFixture = fixture("authorizationNotGrantedFixture", {
  oro5iReadiness: { actualPatchImplementationAuthorizationGranted: false },
});

const wrongAuthorizationGrantScopeFixture = fixture(
  "wrongAuthorizationGrantScopeFixture",
  {
    oro5iReadiness: {
      actualPatchImplementationAuthorizationGrantScope: "route_mount_authorization",
    },
  }
);

const implementationAlreadyStartedFixture = fixture(
  "implementationAlreadyStartedFixture",
  { oro5iReadiness: { actualPatchImplementationExecutionStarted: true } }
);

const patchAlreadyAppliedFixture = fixture("patchAlreadyAppliedFixture", {
  oro5iReadiness: { actualPatchImplementationPatchApplied: true },
});

const implementationAlreadyImplementedFixture = fixture(
  "implementationAlreadyImplementedFixture",
  { oro5iReadiness: { actualPatchImplementationImplemented: true } }
);

const runtimeActualImplementationAlreadyImplementedFixture = fixture(
  "runtimeActualImplementationAlreadyImplementedFixture",
  { oro5iReadiness: { runtimeActualPatchImplementationImplemented: true } }
);

const runtimeRoutePatchedUnexpectedlyFixture = fixture(
  "runtimeRoutePatchedUnexpectedlyFixture",
  { executionState: { runtimeRoutePatched: true } }
);

const srcAppChangedUnexpectedlyFixture = fixture("srcAppChangedUnexpectedlyFixture", {
  executionState: { srcAppChanged: true },
});

const routeControllerChangedUnexpectedlyFixture = fixture(
  "routeControllerChangedUnexpectedlyFixture",
  { executionState: { runtimeRouteControllerChanged: true } }
);

const routeMountApprovedUnexpectedlyFixture = fixture(
  "routeMountApprovedUnexpectedlyFixture",
  { executionState: { routeMountPatchApproved: true } }
);

const routeMountImplementationAuthorizedUnexpectedlyFixture = fixture(
  "routeMountImplementationAuthorizedUnexpectedlyFixture",
  { executionState: { routeMountPatchImplementationAuthorized: true } }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  { executionState: { routeMountAuthorization: "authorized_for_mount" } }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  { executionState: { expressMountAllowed: true } }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  { executionState: { publicAliasAllowed: true } }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  { executionState: { runtimeTrafficAllowed: true } }
);

const walletMutationAllowedUnexpectedlyFixture = fixture(
  "walletMutationAllowedUnexpectedlyFixture",
  { executionState: { walletMutationAllowed: true } }
);

const ledgerMutationAllowedUnexpectedlyFixture = fixture(
  "ledgerMutationAllowedUnexpectedlyFixture",
  { executionState: { ledgerMutationAllowed: true } }
);

const prismaWriteAllowedUnexpectedlyFixture = fixture(
  "prismaWriteAllowedUnexpectedlyFixture",
  { executionState: { prismaWriteAllowed: true } }
);

const dbTransactionAllowedUnexpectedlyFixture = fixture(
  "dbTransactionAllowedUnexpectedlyFixture",
  { executionState: { dbTransactionAllowed: true } }
);

const migrationAllowedUnexpectedlyFixture = fixture(
  "migrationAllowedUnexpectedlyFixture",
  { executionState: { migrationAllowed: true } }
);

const externalNetworkAllowedUnexpectedlyFixture = fixture(
  "externalNetworkAllowedUnexpectedlyFixture",
  { executionState: { externalNetworkAllowed: true } }
);

const liveOroPlayApiCallAllowedUnexpectedlyFixture = fixture(
  "liveOroPlayApiCallAllowedUnexpectedlyFixture",
  { executionState: { liveOroPlayApiCallAllowed: true } }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  executionState: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5jActualPatchImplementationExecutionFixtures() {
  return [
    happyPathActualPatchImplementationExecutionFixture,
    missingOro5iReadinessFixture,
    readinessNotCheckedFixture,
    readinessWrongStatusFixture,
    isolatedMockExecutionPlanMissingFixture,
    executionBoundaryEntryNotAllowedFixture,
    wrongExecutionBoundaryEntryScopeFixture,
    authorizationDecisionMissingFixture,
    authorizationNotGrantedFixture,
    wrongAuthorizationGrantScopeFixture,
    implementationAlreadyStartedFixture,
    patchAlreadyAppliedFixture,
    implementationAlreadyImplementedFixture,
    runtimeActualImplementationAlreadyImplementedFixture,
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
  happyPathActualPatchImplementationExecutionFixture,
  missingOro5iReadinessFixture,
  readinessNotCheckedFixture,
  readinessWrongStatusFixture,
  isolatedMockExecutionPlanMissingFixture,
  executionBoundaryEntryNotAllowedFixture,
  wrongExecutionBoundaryEntryScopeFixture,
  authorizationDecisionMissingFixture,
  authorizationNotGrantedFixture,
  wrongAuthorizationGrantScopeFixture,
  implementationAlreadyStartedFixture,
  patchAlreadyAppliedFixture,
  implementationAlreadyImplementedFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
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
  buildOro5jActualPatchImplementationExecutionFixtures,
};
