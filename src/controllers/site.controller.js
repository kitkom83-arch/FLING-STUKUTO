const prisma = require("../config/prisma");
const { success } = require("../utils/response");

function publicProvider(config) {
  return {
    providerCode: config.providerCode,
    displayName: config.displayName,
    status: config.status,
    agentCode: config.agentCode,
    walletMode: config.walletMode,
  };
}

async function config(req, res) {
  const site = await prisma.site.findUnique({
    where: { id: req.siteId },
    include: {
      setting: true,
      theme: true,
      gameProviderConfigs: {
        where: { status: "active" },
        orderBy: { providerCode: "asc" },
      },
    },
  });

  return success(res, {
    site: {
      code: site.code,
      name: site.name,
      brandName: site.brandName,
      currency: site.currency,
      language: site.defaultLanguage,
    },
    theme: {
      logoUrl: site.theme && site.theme.logoUrl,
      faviconUrl: site.theme && site.theme.faviconUrl,
      primaryColor: site.theme && site.theme.primaryColor,
      secondaryColor: site.theme && site.theme.secondaryColor,
      backgroundColor: site.theme && site.theme.backgroundColor,
      layoutMode: site.theme && site.theme.layoutMode,
    },
    contact: {
      lineUrl: site.setting && site.setting.lineUrl,
      telegramUrl: site.setting && site.setting.telegramUrl,
      customerServiceUrl: site.setting && site.setting.customerServiceUrl,
    },
    features: {
      maintenanceMode: Boolean(site.setting && site.setting.maintenanceMode),
    },
    providers: site.gameProviderConfigs.map(publicProvider),
  });
}

module.exports = {
  config,
};
