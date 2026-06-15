"use strict";

const {
  runOro10iDetailedSmoke,
} = require("./oro10iApprovalChainRolloverSignedApprovalRequestBoundarySmoke");

try {
  runOro10iDetailedSmoke({ print: false });
  console.log("ORO-10I smoke: PASS");
} catch (error) {
  console.error("ORO-10I smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
