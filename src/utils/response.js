const { Prisma } = require("@prisma/client");

const HIDDEN_RESPONSE_KEYS = new Set(["passwordHash", "apiKeyEncrypted", "secretEncrypted"]);

function cleanData(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Prisma.Decimal) return value.toFixed(2);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map(cleanData);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, item]) => item !== undefined && !HIDDEN_RESPONSE_KEYS.has(key))
        .map(([key, item]) => [key, cleanData(item)])
    );
  }
  return value;
}

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data: cleanData(data),
  });
}

function fail(res, message, statusCode = 400, errors = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: cleanData(errors),
  });
}

module.exports = {
  cleanData,
  success,
  fail,
};
