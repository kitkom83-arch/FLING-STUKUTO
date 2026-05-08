const { ZodError } = require("zod");
const { fail } = require("../utils/response");

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function notFound(req, res) {
  return fail(res, "Not found", 404);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return fail(res, "Validation error", 400, error.flatten());
  }

  if (error.code === "P2002") {
    return fail(res, "Duplicate data", 400, { target: error.meta && error.meta.target });
  }

  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  if (statusCode >= 500) {
    console.error({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }

  return fail(res, message, statusCode);
}

module.exports = {
  asyncHandler,
  notFound,
  errorHandler,
};
