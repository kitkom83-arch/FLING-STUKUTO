"use strict";

const {
  runOro10kDetailedSmoke,
} = require("./oro10kApprovalChainRolloverSignedApprovalArtifactVerificationGateSmoke");

try {
  runOro10kDetailedSmoke({ print: false });
  console.log("ORO-10K smoke: PASS");
} catch (error) {
  console.error("ORO-10K smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
