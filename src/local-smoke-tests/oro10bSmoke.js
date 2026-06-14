"use strict";

const {
  runOro10bDetailedSmoke,
} = require("./oro10bApprovalChainRolloverContinuityGateSmoke");

try {
  runOro10bDetailedSmoke({ print: false });
  console.log("ORO-10B smoke: PASS");
} catch (error) {
  console.error("ORO-10B smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
