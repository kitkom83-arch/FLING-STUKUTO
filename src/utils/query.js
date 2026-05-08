function parsePositiveInt(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function pagination(query = {}, defaults = {}) {
  const page = parsePositiveInt(query.page, defaults.page || 1, 1000000);
  const limit = parsePositiveInt(query.limit, defaults.limit || 50, defaults.maxLimit || 100);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function cleanSearch(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

module.exports = {
  cleanSearch,
  pagination,
};
