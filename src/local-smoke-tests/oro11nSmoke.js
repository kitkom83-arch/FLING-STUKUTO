"use strict";

const {
  runOro11nDetailedSmoke,
} = require("./oro11nSeparateSuccessorPhaseAuthorizationDecisionCloseoutConfirmationGateSmoke");

runOro11nDetailedSmoke({ print: false });
console.log("ORO-11N smoke: PASS");
