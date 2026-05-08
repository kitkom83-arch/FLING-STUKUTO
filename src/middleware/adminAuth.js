const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../config/prisma");
const { fail } = require("../utils/response");

async function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return fail(res, "Admin authentication required", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.type !== "admin") {
      return fail(res, "Admin authentication required", 401);
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) return fail(res, "Admin authentication required", 401);
    if (admin.status !== "active") return fail(res, "Admin is not active", 403);

    req.admin = admin;
    return next();
  } catch (error) {
    return fail(res, "Admin authentication required", 401);
  }
}

module.exports = adminAuth;
