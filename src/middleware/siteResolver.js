const prisma = require("../config/prisma");
const env = require("../config/env");
const { fail } = require("../utils/response");

function normalizeDomain(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

async function getDevelopmentFallbackSite() {
  if (env.nodeEnv !== "development") return null;
  return prisma.site.findUnique({
    where: { code: "PG77" },
    include: { setting: true, theme: true },
  });
}

async function siteResolver(req, res, next) {
  try {
    const siteCode = req.headers["x-site-code"];
    const siteDomain = normalizeDomain(req.headers["x-site-domain"]);
    const host = normalizeDomain(req.headers.host);

    let site = null;
    if (siteCode) {
      site = await prisma.site.findUnique({
        where: { code: String(siteCode).trim().toUpperCase() },
        include: { setting: true, theme: true },
      });
    }

    const domainCandidates = [siteDomain, host, host ? host.split(":")[0] : null].filter(Boolean);
    for (const domain of domainCandidates) {
      if (site) break;
      const domainRow = await prisma.siteDomain.findFirst({
        where: { domain, status: "active" },
        include: { site: { include: { setting: true, theme: true } } },
      });
      if (domainRow && domainRow.site && domainRow.site.status === "active") {
        site = domainRow.site;
      }
    }

    if (!site || site.status !== "active") {
      site = await getDevelopmentFallbackSite();
    }

    if (!site || site.status !== "active") {
      return fail(res, "Site not found", 404, {});
    }

    req.site = site;
    req.siteId = site.id;
    req.siteCode = site.code;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = siteResolver;
