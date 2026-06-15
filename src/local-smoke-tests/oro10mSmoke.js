"use strict";

const {
  runOro10mDetailedSmoke,
} = require("./oro10mApprovalChainRolloverSignedApprovalArtifactVerificationRecordReviewGateSmoke");

try {
  runOro10mDetailedSmoke({ print: false });
  console.log("ORO-10M smoke: PASS");
} catch (error) {
  console.error("ORO-10M smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
