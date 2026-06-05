"use strict";

const {
  buildOro5mRouteMountAuthorizationDecisionInput,
} = require("./oro5mRouteMountAuthorizationDecisionBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5mRouteMountAuthorizationDecisionInput({
      id,
      ...overrides,
    })
  );
}

const happyPathRouteMountAuthorizationDecisionFixture = fixture(
  "happyPathRouteMountAuthorizationDecisionFixture"
);

const missingOro5lRequestFixture = fixture("missingOro5lRequestFixture", {
  oro5lRequest: { requestPresent: false },
});

const requestNotSubmittedFixture = fixture("requestNotSubmittedFixture", {
  oro5lRequest: { routeMountAuthorizationRequestSubmitted: false },
});

const requestWrongStatusFixture = fixture("requestWrongStatusFixture", {
  oro5lRequest: { routeMountAuthorizationRequestStatus: "hold" },
});

const wrongRequestScopeFixture = fixture("wrongRequestScopeFixture", {
  oro5lRequest: { routeMountAuthorizationRequestScope: "route_mount" },
});

const requestEvidenceMissingFixture = fixture("requestEvidenceMissingFixture", {
  oro5lRequest: { routeMountAuthorizationRequestEvidenceIncluded: false },
});

const decisionAlreadyIssuedFixture = fixture("decisionAlreadyIssuedFixture", {
  oro5lRequest: { routeMountAuthorizationDecisionIssued: true },
});

const routeMountAlreadyGrantedFixture = fixture("routeMountAlreadyGrantedFixture", {
  oro5lRequest: { routeMountAuthorizationGranted: true },
});

const implementationAlreadyAuthorizedUnexpectedlyFixture = fixture(
  "implementationAlreadyAuthorizedUnexpectedlyFixture",
  { oro5lRequest: { routeMountPatchImplementationAuthorized: true } }
);

const routePatchAlreadyImplementedUnexpectedlyFixture = fixture(
  "routePatchAlreadyImplementedUnexpectedlyFixture",
  { oro5lRequest: { routeMountPatchImplemented: true } }
);

const runtimeActualImplementationAlreadyImplementedFixture = fixture(
  "runtimeActualImplementationAlreadyImplementedFixture",
  { oro5lRequest: { runtimeActualPatchImplementationImplemented: true } }
);

const runtimeRoutePatchedUnexpectedlyFixture = fixture(
  "runtimeRoutePatchedUnexpectedlyFixture",
  { oro5lRequest: { runtimeRoutePatched: true } }
);

const srcAppChangedUnexpectedlyFixture = fixture("srcAppChangedUnexpectedlyFixture", {
  oro5lRequest: { srcAppChanged: true },
});

const routeControllerChangedUnexpectedlyFixture = fixture(
  "routeControllerChangedUnexpectedlyFixture",
  { oro5lRequest: { runtimeRouteControllerChanged: true } }
);

const expressMountAllowedUnexpectedlyFixture = fixture(
  "expressMountAllowedUnexpectedlyFixture",
  { oro5lRequest: { expressMountAllowed: true } }
);

const publicAliasAllowedUnexpectedlyFixture = fixture(
  "publicAliasAllowedUnexpectedlyFixture",
  { oro5lRequest: { publicAliasAllowed: true } }
);

const runtimeTrafficAllowedUnexpectedlyFixture = fixture(
  "runtimeTrafficAllowedUnexpectedlyFixture",
  { oro5lRequest: { runtimeTrafficAllowed: true } }
);

const walletMutationAllowedUnexpectedlyFixture = fixture(
  "walletMutationAllowedUnexpectedlyFixture",
  { oro5lRequest: { walletMutationAllowed: true } }
);

const ledgerMutationAllowedUnexpectedlyFixture = fixture(
  "ledgerMutationAllowedUnexpectedlyFixture",
  { oro5lRequest: { ledgerMutationAllowed: true } }
);

const prismaWriteAllowedUnexpectedlyFixture = fixture(
  "prismaWriteAllowedUnexpectedlyFixture",
  { oro5lRequest: { prismaWriteAllowed: true } }
);

const dbTransactionAllowedUnexpectedlyFixture = fixture(
  "dbTransactionAllowedUnexpectedlyFixture",
  { oro5lRequest: { dbTransactionAllowed: true } }
);

const migrationAllowedUnexpectedlyFixture = fixture(
  "migrationAllowedUnexpectedlyFixture",
  { oro5lRequest: { migrationAllowed: true } }
);

const externalNetworkAllowedUnexpectedlyFixture = fixture(
  "externalNetworkAllowedUnexpectedlyFixture",
  { oro5lRequest: { externalNetworkAllowed: true } }
);

const liveOroPlayApiCallAllowedUnexpectedlyFixture = fixture(
  "liveOroPlayApiCallAllowedUnexpectedlyFixture",
  { oro5lRequest: { liveOroPlayApiCallAllowed: true } }
);

const secretKey = ["to", "ken"].join("");
const secretShapedOutputFixture = fixture("secretShapedOutputFixture", {
  oro5lRequest: {
    outputPreview: {
      [secretKey]: "mock-redacted-marker",
    },
  },
});

function buildOro5mRouteMountAuthorizationDecisionFixtures() {
  return [
    happyPathRouteMountAuthorizationDecisionFixture,
    missingOro5lRequestFixture,
    requestNotSubmittedFixture,
    requestWrongStatusFixture,
    wrongRequestScopeFixture,
    requestEvidenceMissingFixture,
    decisionAlreadyIssuedFixture,
    routeMountAlreadyGrantedFixture,
    implementationAlreadyAuthorizedUnexpectedlyFixture,
    routePatchAlreadyImplementedUnexpectedlyFixture,
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
  happyPathRouteMountAuthorizationDecisionFixture,
  missingOro5lRequestFixture,
  requestNotSubmittedFixture,
  requestWrongStatusFixture,
  wrongRequestScopeFixture,
  requestEvidenceMissingFixture,
  decisionAlreadyIssuedFixture,
  routeMountAlreadyGrantedFixture,
  implementationAlreadyAuthorizedUnexpectedlyFixture,
  routePatchAlreadyImplementedUnexpectedlyFixture,
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
  buildOro5mRouteMountAuthorizationDecisionFixtures,
};
