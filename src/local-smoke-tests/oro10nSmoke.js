"use strict";

const {
  runOro10nDetailedSmoke,
} = require("./oro10nApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationBoundarySmoke");

try {
  runOro10nDetailedSmoke({ print: false });
  console.log("ORO-10N smoke: PASS");
} catch (error) {
  console.error("ORO-10N smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
