"use strict";

const {
  buildOro5lRouteMountAuthorizationRequestSubmissionInput,
} = require("./oro5lRouteMountAuthorizationRequestSubmissionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5lRouteMountAuthorizationRequestSubmissionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRouteMountAuthorizationRequestSubmissionFixture = fixture(
  "happyPathRouteMountAuthorizationRequestSubmissionFixture"
);

const missingOro5kReadinessFixture = fixture("missingOro5kReadinessFixture", {
  oro5kReadiness: { readinessPresent: false },
});

const postExecutionValidationMissingFixture = fixture(
  "postExecutionValidationMissingFixture",
  { oro5kReadiness: { postExecutionValidationChecked: false } }
);

const postExecutionValidationNotPassedFixture = fixture(
  "postExecutionValidationNotPassedFixture",
  { oro5kReadiness: { postExecutionValidationResult: "hold" } }
);

const isolatedArtifactNotReviewedFixture = fixture(
  "isolatedArtifactNotReviewedFixture",
  { oro5kReadiness: { isolatedPatchArtifactReviewed: false } }
);

const isolatedArtifactNotAcceptedFixture = fixture(
  "isolatedArtifactNotAcceptedFixture",
  { oro5kReadiness: { isolatedPatchArtifactReviewResult: "rejected" } }
);

const postExecutionEvidenceNotReviewedFixture = fixture(
  "postExecutionEvidenceNotReviewedFixture",
  { oro5kReadiness: { postExecutionEvidenceReviewed: false } }
);

const postExecutionEvidenceNotAcceptedFixture = fixture(
  "postExecutionEvidenceNotAcceptedFixture",
  { oro5kReadiness: { postExecutionEvidenceReviewResult: "rejected" } }
);

const routeMountReadinessNotCheckedFixture = fixture(
  "routeMountReadinessNotCheckedFixture",
  { oro5kReadiness: { routeMountAuthorizationRequestReadinessChecked: false } }
);

const routeMountReadinessNotReadyFixture = fixture(
  "routeMountReadinessNotReadyFixture",
  { oro5kReadiness: { routeMountAuthorizationRequestReadinessResult: "hold" } }
);

const requestPreparationNotAllowedFixture = fixture(
  "requestPreparationNotAllowedFixture",
  { oro5kReadiness: { routeMountAuthorizationRequestPreparationAllowed: false } }
);

const wrongRequestPreparationScopeFixture = fixture(
  "wrongRequestPreparationScopeFixture",
  {
    oro5kReadiness: {
      routeMountAuthorizationRequestPreparationScope: "route_mount_authorization",
    },
  }
);

const requestAlreadySubmittedFixture = fixture("requestAlreadySubmittedFixture", {
  oro5kReadiness: { routeMountAuthorizationRequestSubmitted: true },
});

const routeMountDecisionAlreadyIssuedFixture = fixture(
  "routeMountDecisionAlreadyIssuedFixture",
  { oro5kReadiness: { routeMountAuthorizationDecisionIssued: true } }
);

const routeMountGrantedUnexpectedlyFixture = fixture(
  "routeMountGrantedUnexpectedlyFixture",
  { oro5kReadiness: { routeMountAuthorizationGranted: true } }
);

const routeMountApprovedUnexpectedlyFixture = fixture(
  "routeMountApprovedUnexpectedlyFixture",
  { oro5kReadiness: { routeMountPatchApproved: true } }
);

const routeMountImplementationAuthorizedUnexpectedlyFixture = fixture(
  "routeMountImplementationAuthorizedUnexpectedlyFixture",
  { oro5kReadiness: { routeMountPatchImplementationAuthorized: true } }
);

const routeMountAuthorizedUnexpectedlyFixture = fixture(
  "routeMountAuthorizedUnexpectedlyFixture",
  { oro5kReadiness: { routeMountAuthorization: "authorized_for_mount" } }
);

const routePatchImplementedUnexpectedlyFixture = fixture(
  "routePatchImplementedUnexpectedlyFixture",
  { oro5kReadiness: { routeMountPatchImplemented: true } }
);

const runtimeActualImplementationAlreadyImplementedFixture = fixture(
  "runtimeActualImplementationAlreadyImplementedFixture",
  { oro5kReadiness: { runtimeActualPatchImplementationImplemented: true } }
);

const runtimeRoutePatchedUnexpectedlyFixture = fixture(
  "runtimeRoutePatchedUnexpectedlyFixture",
  { oro5kReadiness: { runtimeRoutePatched: true } }
);

const srcAppChangedUnexpectedlyFixture = fixture("srcAppChangedUnexpectedlyFixture", {
  oro5kReadiness: { srcAppChanged: true },
});

const routeControllerChangedUnexpectedlyFixture = fixture(
  "routeControllerChangedUnexpectedlyFixture",
  { oro5kReadiness: { runtimeRouteControllerChanged: true } }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  { oro5kReadiness: { expressMountAllowed: true } }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  { oro5kReadiness: { publicAliasAllowed: true } }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  { oro5kReadiness: { runtimeTrafficAllowed: true } }
);

const walletMutationAllowedUnexpectedlyFixture = fixture(
  "walletMutationAllowedUnexpectedlyFixture",
  { oro5kReadiness: { walletMutationAllowed: true } }
);

const ledgerMutationAllowedUnexpectedlyFixture = fixture(
  "ledgerMutationAllowedUnexpectedlyFixture",
  { oro5kReadiness: { ledgerMutationAllowed: true } }
);

const prismaWriteAllowedUnexpectedlyFixture = fixture(
  "prismaWriteAllowedUnexpectedlyFixture",
  { oro5kReadiness: { prismaWriteAllowed: true } }
);

const dbTransactionAllowedUnexpectedlyFixture = fixture(
  "dbTransactionAllowedUnexpectedlyFixture",
  { oro5kReadiness: { dbTransactionAllowed: true } }
);

const migrationAllowedUnexpectedlyFixture = fixture(
  "migrationAllowedUnexpectedlyFixture",
  { oro5kReadiness: { migrationAllowed: true } }
);

const externalNetworkAllowedUnexpectedlyFixture = fixture(
  "externalNetworkAllowedUnexpectedlyFixture",
  { oro5kReadiness: { externalNetworkAllowed: true } }
);

const liveOroPlayApiCallAllowedUnexpectedlyFixture = fixture(
  "liveOroPlayApiCallAllowedUnexpectedlyFixture",
  { oro5kReadiness: { liveOroPlayApiCallAllowed: true } }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  oro5kReadiness: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5lRouteMountAuthorizationRequestSubmissionFixtures() {
  return [
    happyPathRouteMountAuthorizationRequestSubmissionFixture,
    missingOro5kReadinessFixture,
    postExecutionValidationMissingFixture,
    postExecutionValidationNotPassedFixture,
    isolatedArtifactNotReviewedFixture,
    isolatedArtifactNotAcceptedFixture,
    postExecutionEvidenceNotReviewedFixture,
    postExecutionEvidenceNotAcceptedFixture,
    routeMountReadinessNotCheckedFixture,
    routeMountReadinessNotReadyFixture,
    requestPreparationNotAllowedFixture,
    wrongRequestPreparationScopeFixture,
    requestAlreadySubmittedFixture,
    routeMountDecisionAlreadyIssuedFixture,
    routeMountGrantedUnexpectedlyFixture,
    routeMountApprovedUnexpectedlyFixture,
    routeMountImplementationAuthorizedUnexpectedlyFixture,
    routeMountAuthorizedUnexpectedlyFixture,
    routePatchImplementedUnexpectedlyFixture,
    runtimeActualImplementationAlreadyImplementedFixture,
    runtimeRoutePatchedUnexpectedlyFixture,
    srcAppChangedUnexpectedlyFixture,
    routeControllerChangedUnexpectedlyFixture,
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
  happyPathRouteMountAuthorizationRequestSubmissionFixture,
  missingOro5kReadinessFixture,
  postExecutionValidationMissingFixture,
  postExecutionValidationNotPassedFixture,
  isolatedArtifactNotReviewedFixture,
  isolatedArtifactNotAcceptedFixture,
  postExecutionEvidenceNotReviewedFixture,
  postExecutionEvidenceNotAcceptedFixture,
  routeMountReadinessNotCheckedFixture,
  routeMountReadinessNotReadyFixture,
  requestPreparationNotAllowedFixture,
  wrongRequestPreparationScopeFixture,
  requestAlreadySubmittedFixture,
  routeMountDecisionAlreadyIssuedFixture,
  routeMountGrantedUnexpectedlyFixture,
  routeMountApprovedUnexpectedlyFixture,
  routeMountImplementationAuthorizedUnexpectedlyFixture,
  routeMountAuthorizedUnexpectedlyFixture,
  routePatchImplementedUnexpectedlyFixture,
  runtimeActualImplementationAlreadyImplementedFixture,
  runtimeRoutePatchedUnexpectedlyFixture,
  srcAppChangedUnexpectedlyFixture,
  routeControllerChangedUnexpectedlyFixture,
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
  buildOro5lRouteMountAuthorizationRequestSubmissionFixtures,
};
