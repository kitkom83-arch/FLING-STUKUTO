"use strict";

const {
  runOro10cDetailedSmoke,
} = require("./oro10cApprovalChainRolloverEvidenceGateSmoke");

try {
  runOro10cDetailedSmoke({ print: false });
  console.log("ORO-10C smoke: PASS");
} catch (error) {
  console.error("ORO-10C smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
