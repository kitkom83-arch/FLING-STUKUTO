const crypto = require("crypto");

function datePart() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function randomPart() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function transactionId(prefix) {
  return `${prefix}-${datePart()}-${randomPart()}`;
}

module.exports = {
  transactionId,
};
