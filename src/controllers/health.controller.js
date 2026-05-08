const { success } = require("../utils/response");

function health(req, res) {
  return success(res, {
    status: "ok",
    version: "0.1.0",
    timestamp: new Date(),
  });
}

module.exports = {
  health,
};
