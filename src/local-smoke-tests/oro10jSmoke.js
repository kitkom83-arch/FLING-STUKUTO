"use strict";

const {
  runOro10jDetailedSmoke,
} = require("./oro10jApprovalChainRolloverSignedApprovalArtifactIntakeGateSmoke");

try {
  runOro10jDetailedSmoke({ print: false });
  console.log("ORO-10J smoke: PASS");
} catch (error) {
  console.error("ORO-10J smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
