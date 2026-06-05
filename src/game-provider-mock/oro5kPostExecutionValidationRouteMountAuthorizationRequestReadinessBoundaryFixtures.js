"use strict";

const {
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput,
} = require("./oro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessInput({
      id,
      ...overrides,
    })
  );
}

const happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture =
  fixture("happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture");

const missingOro5jExecutionFixture = fixture("missingOro5jExecutionFixture", {
  oro5jExecution: { executionPresent: false },
});

const executionBoundaryNotEnteredFixture = fixture(
  "executionBoundaryNotEnteredFixture",
  { oro5jExecution: { actualPatchImplementationExecutionBoundaryEntered: false } }
);

const executionNotStartedFixture = fixture("executionNotStartedFixture", {
  oro5jExecution: { actualPatchImplementationExecutionStarted: false },
});

const executionNotCompletedFixture = fixture("executionNotCompletedFixture", {
  oro5jExecution: { actualPatchImplementationExecutionCompleted: false },
});

const wrongExecutionStatusFixture = fixture("wrongExecutionStatusFixture", {
  oro5jExecution: { actualPatchImplementationExecutionStatus: "hold" },
});

const wrongExecutionResultFixture = fixture("wrongExecutionResultFixture", {
  oro5jExecution: { actualPatchImplementationExecutionResult: "held" },
});

const wrongExecutionScopeFixture = fixture("wrongExecutionScopeFixture", {
  oro5jExecution: {
    actualPatchImplementationExecutionScope: "runtime_route_patch",
  },
});

const isolatedPatchArtifactMissingFixture = fixture(
  "isolatedPatchArtifactMissingFixture",
  {
    oro5jExecution: {
      isolatedActualPatchImplementationExecuted: false,
      isolatedActualPatchImplementationPatchApplied: false,
      actualPatchImplementationPatchArtifactPrepared: false,
    },
  }
);

const isolatedPatchArtifactNotReadyFixture = fixture(
  "isolatedPatchArtifactNotReadyFixture",
  {
    oro5jExecution: {
      actualPatchImplementationPatchArtifactStatus: "draft",
    },
  }
);

const postExecutionEvidenceMissingFixture = fixture(
  "postExecutionEvidenceMissingFixture",
  { oro5jExecution: { postExecutionEvidencePrepared: false } }
);

const postExecutionEvidenceNotReadyFixture = fixture(
  "postExecutionEvidenceNotReadyFixture",
  { oro5jExecution: { postExecutionEvidenceResult: "draft" } }
);

const wrongActualPatchImplementationScopeFixture = fixture(
  "wrongActualPatchImplementationScopeFixture",
  {
    oro5jExecution: {
      actualPatchImplementationImplementationScope: "mounted_runtime_patch",
    },
  }
);

const runtimeActualImplementationAlreadyImplementedFixture = fixture(
  "runtimeActualImplementationAlreadyImplementedFixture",
  { oro5jExecution: { runtimeActualPatchImplementationImplemented: true } }
);

const runtimeRoutePatchedUnexpectedlyFixture = fixture(
  "runtimeRoutePatchedUnexpectedlyFixture",
  { oro5jExecution: { runtimeRoutePatched: true } }
);

const srcAppChangedUnexpectedlyFixture = fixture("srcAppChangedUnexpectedlyFixture", {
  oro5jExecution: { srcAppChanged: true },
});

const routeControllerChangedUnexpectedlyFixture = fixture(
  "routeControllerChangedUnexpectedlyFixture",
  { oro5jExecution: { runtimeRouteControllerChanged: true } }
);

const routeMountRequestAlreadySubmittedFixture = fixture(
  "routeMountRequestAlreadySubmittedFixture",
  { routeMountReadinessState: { routeMountAuthorizationRequestSubmitted: true } }
);

const routeMountDecisionAlreadyIssuedFixture = fixture(
  "routeMountDecisionAlreadyIssuedFixture",
  { routeMountReadinessState: { routeMountAuthorizationDecisionIssued: true } }
);

const routeMountAuthorizationAlreadyGrantedFixture = fixture(
  "routeMountAuthorizationAlreadyGrantedFixture",
  { routeMountReadinessState: { routeMountAuthorizationGranted: true } }
);

const routeMountApprovedUnexpectedlyFixture = fixture(
  "routeMountApprovedUnexpectedlyFixture",
  { routeMountReadinessState: { routeMountPatchApproved: true } }
);

const routeMountImplementationAuthorizedUnexpectedlyFixture = fixture(
  "routeMountImplementationAuthorizedUnexpectedlyFixture",
  { routeMountReadinessState: { routeMountPatchImplementationAuthorized: true } }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  { routeMountReadinessState: { routeMountAuthorization: "authorized_for_mount" } }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { expressMountAllowed: true } }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { publicAliasAllowed: true } }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { runtimeTrafficAllowed: true } }
);

const walletMutationAllowedUnexpectedlyFixture = fixture(
  "walletMutationAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { walletMutationAllowed: true } }
);

const ledgerMutationAllowedUnexpectedlyFixture = fixture(
  "ledgerMutationAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { ledgerMutationAllowed: true } }
);

const prismaWriteAllowedUnexpectedlyFixture = fixture(
  "prismaWriteAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { prismaWriteAllowed: true } }
);

const dbTransactionAllowedUnexpectedlyFixture = fixture(
  "dbTransactionAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { dbTransactionAllowed: true } }
);

const migrationAllowedUnexpectedlyFixture = fixture(
  "migrationAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { migrationAllowed: true } }
);

const externalNetworkAllowedUnexpectedlyFixture = fixture(
  "externalNetworkAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { externalNetworkAllowed: true } }
);

const liveOroPlayApiCallAllowedUnexpectedlyFixture = fixture(
  "liveOroPlayApiCallAllowedUnexpectedlyFixture",
  { routeMountReadinessState: { liveOroPlayApiCallAllowed: true } }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  oro5jExecution: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessFixtures() {
  return [
    happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture,
    missingOro5jExecutionFixture,
    executionBoundaryNotEnteredFixture,
    executionNotStartedFixture,
    executionNotCompletedFixture,
    wrongExecutionStatusFixture,
    wrongExecutionResultFixture,
    wrongExecutionScopeFixture,
    isolatedPatchArtifactMissingFixture,
    isolatedPatchArtifactNotReadyFixture,
    postExecutionEvidenceMissingFixture,
    postExecutionEvidenceNotReadyFixture,
    wrongActualPatchImplementationScopeFixture,
    runtimeActualImplementationAlreadyImplementedFixture,
    runtimeRoutePatchedUnexpectedlyFixture,
    srcAppChangedUnexpectedlyFixture,
    routeControllerChangedUnexpectedlyFixture,
    routeMountRequestAlreadySubmittedFixture,
    routeMountDecisionAlreadyIssuedFixture,
    routeMountAuthorizationAlreadyGrantedFixture,
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
  happyPathPostExecutionValidationRouteMountAuthorizationRequestReadinessFixture,
  missingOro5jExecutionFixture,
  executionBoundaryNotEnteredFixture,
  executionNotStartedFixture,
  executionNotCompletedFixture,
  wrongExecutionStatusFixture,
  wrongExecutionResultFixture,
  wrongExecutionScopeFixture,
  isolatedPatchArtifactMissingFixture,
  isolatedPatchArtifactNotReadyFixture,
  postExecutionEvidenceMissingFixture,
  postExecutionEvidenceNotReadyFixture,
  wrongActualPatchImplementationScopeFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  srcAppChangedUnexpectedlyFixture,
  routeControllerChangedUnexpectedlyFixture,
  routeMountRequestAlreadySubmittedFixture,
  routeMountDecisionAlreadyIssuedFixture,
  routeMountAuthorizationAlreadyGrantedFixture,
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
  buildOro5kPostExecutionValidationRouteMountAuthorizationRequestReadinessFixtures,
};
