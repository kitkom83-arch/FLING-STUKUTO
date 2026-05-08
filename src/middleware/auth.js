const jwt = require("jsonwebtoken");
const env = require("../config/env");
const prisma = require("../config/prisma");
const { fail } = require("../utils/response");

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return fail(res, "Authentication required", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.type !== "member") {
      return fail(res, "Authentication required", 401);
    }

    if (payload.siteId && req.siteId && payload.siteId !== req.siteId) {
      return fail(res, "Token site mismatch", 403, {});
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, siteId: req.siteId },
    });
    if (!user) return fail(res, "Authentication required", 401);
    if (user.status === "blocked") return fail(res, "User is blocked", 403);

    req.user = user;
    return next();
  } catch (error) {
    return fail(res, "Authentication required", 401);
  }
}

module.exports = auth;
