const prisma = require("../config/prisma");
const { fail } = require("../utils/response");
const { buildLocalDemoSite } = require("../utils/adminLocalAuth");

function normalizeDomain(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function currentNodeEnv() {
  return String(process.env.NODE_ENV || "").trim().toLowerCase();
}

function currentAppEnv() {
  return String(process.env.APP_ENV || "").trim().toLowerCase();
}

async function getDevelopmentFallbackSite() {
  if (currentNodeEnv() !== "development") return null;
  return prisma.site.findUnique({
    where: { code: "PG77" },
    include: { setting: true, theme: true },
  });
}

function localDemoSiteFallbackAllowed() {
  return currentNodeEnv() === "development-local" && currentAppEnv() === "local-test";
}

function buildLocalDemoFallbackSite(siteCode) {
  return buildLocalDemoSite(siteCode || "PG77");
}

async function resolveSiteForRequest(req) {
  const siteCode = req.headers["x-site-code"];
  const siteDomain = normalizeDomain(req.headers["x-site-domain"]);
  const host = normalizeDomain(req.headers.host);

  if (localDemoSiteFallbackAllowed()) {
    return buildLocalDemoFallbackSite(siteCode || "PG77");
  }

  try {
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
      return localDemoSiteFallbackAllowed() ? buildLocalDemoFallbackSite(siteCode) : null;
    }

    return site;
  } catch (error) {
    if (localDemoSiteFallbackAllowed()) {
      return buildLocalDemoFallbackSite(siteCode);
    }
    throw error;
  }
}

function attachSiteToRequest(req, site) {
  req.site = site;
  req.siteId = site.id;
  req.siteCode = site.code;
}

async function siteResolver(req, res, next) {
  try {
    const site = await resolveSiteForRequest(req);
    if (!site) return fail(res, "Site not found", 404, {});

    attachSiteToRequest(req, site);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = siteResolver;
module.exports.resolveSiteForRequest = resolveSiteForRequest;
module.exports.attachSiteToRequest = attachSiteToRequest;
