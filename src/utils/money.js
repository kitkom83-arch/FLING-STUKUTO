const { Prisma } = require("@prisma/client");

function toDecimal(value) {
  if (value instanceof Prisma.Decimal) return value;
  if (value === null || value === undefined || value === "") {
    const error = new Error("Amount is required");
    error.statusCode = 400;
    throw error;
  }
  let decimal;
  try {
    decimal = new Prisma.Decimal(value);
  } catch (cause) {
    const error = new Error("Amount must be a valid number");
    error.statusCode = 400;
    throw error;
  }
  if (!decimal.isFinite()) {
    const error = new Error("Amount must be a valid number");
    error.statusCode = 400;
    throw error;
  }
  return decimal.toDecimalPlaces(2);
}

function assertPositiveAmount(value) {
  const amount = toDecimal(value);
  if (amount.lte(0)) {
    const error = new Error("Amount must be greater than 0");
    error.statusCode = 400;
    throw error;
  }
  return amount;
}

function formatMoney(value) {
  if (value === null || value === undefined) return null;
  return toDecimal(value).toFixed(2);
}

module.exports = {
  toDecimal,
  assertPositiveAmount,
  formatMoney,
};
