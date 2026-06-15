"use strict";

const {
  runOro10lDetailedSmoke,
} = require("./oro10lApprovalChainRolloverSignedApprovalArtifactVerificationRecordBoundarySmoke");

try {
  runOro10lDetailedSmoke({ print: false });
  console.log("ORO-10L smoke: PASS");
} catch (error) {
  console.error("ORO-10L smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
