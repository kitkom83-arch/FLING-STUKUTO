"use strict";

const {
  buildOro5nRouteMountImplementationBoundaryInput,
} = require("./oro5nRouteMountImplementationBoundary");

function cloneFixture(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixture(id, overrides = {}) {
  return Object.freeze(
    buildOro5nRouteMountImplementationBoundaryInput({
      id,
      ...overrides,
    })
  );
}

const happyPathInternalFailClosedMountFixture = fixture(
  "happyPathInternalFailClosedMountFixture"
);

const missingAuthorizationFixture = fixture("missingAuthorizationFixture", {
  oro5mDecision: { authorizationPresent: false },
});

const publicAliasAttemptRejectedFixture = fixture(
  "publicAliasAttemptRejectedFixture",
  { requestedMount: { publicAliasRequested: true } }
);

const runtimeTrafficAttemptRejectedFixture = fixture(
  "runtimeTrafficAttemptRejectedFixture",
  { requestedMount: { runtimeTrafficRequested: true } }
);

const walletMutationAttemptRejectedFixture = fixture(
  "walletMutationAttemptRejectedFixture",
  { requestedMount: { walletMutationRequested: true } }
);

const controllerBehaviorChangeAttemptRejectedFixture = fixture(
  "controllerBehaviorChangeAttemptRejectedFixture",
  { requestedMount: { controllerBehaviorChangeRequested: true } }
);

function buildOro5nRouteMountImplementationBoundaryFixtures() {
  return [
    happyPathInternalFailClosedMountFixture,
    missingAuthorizationFixture,
    publicAliasAttemptRejectedFixture,
    runtimeTrafficAttemptRejectedFixture,
    walletMutationAttemptRejectedFixture,
    controllerBehaviorChangeAttemptRejectedFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathInternalFailClosedMountFixture,
  missingAuthorizationFixture,
  publicAliasAttemptRejectedFixture,
  runtimeTrafficAttemptRejectedFixture,
  walletMutationAttemptRejectedFixture,
  controllerBehaviorChangeAttemptRejectedFixture,
  cloneFixture,
  buildOro5nRouteMountImplementationBoundaryFixtures,
};
