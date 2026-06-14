"use strict";

const {
  runOro10aDetailedSmoke,
} = require("./oro10aApprovalChainRolloverBoundarySmoke");

try {
  runOro10aDetailedSmoke({ print: false });
  console.log("ORO-10A smoke: PASS");
} catch (error) {
  console.error("ORO-10A smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
