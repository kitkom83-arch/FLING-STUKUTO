"use strict";

const {
  runOro10oDetailedSmoke,
} = require("./oro10oApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewFinalizationApprovalRequestBoundarySmoke");

try {
  runOro10oDetailedSmoke({ print: false });
  console.log("ORO-10O smoke: PASS");
} catch (error) {
  console.error("ORO-10O smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
