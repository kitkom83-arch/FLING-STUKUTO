-- Multi-site / white-label core phase 1.
-- Strategy: create a fixed PG77 default site, add site columns with PG77 backfill,
-- then enforce NOT NULL and foreign keys so existing smoke-test data remains intact.

CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'th',
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");

INSERT INTO "sites" ("id", "code", "name", "brandName", "status", "defaultLanguage", "currency", "timezone", "createdAt", "updatedAt")
VALUES ('site_pg77', 'PG77', 'PG77', 'PG77', 'active', 'th', 'THB', 'Asia/Bangkok', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "site_domains" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_domains_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "lineUrl" TEXT,
    "telegramUrl" TEXT,
    "customerServiceUrl" TEXT,
    "announcement" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_themes" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#ff5aa5',
    "secondaryColor" TEXT NOT NULL DEFAULT '#54c7ff',
    "backgroundColor" TEXT NOT NULL DEFAULT '#fff5fb',
    "layoutMode" TEXT NOT NULL DEFAULT 'default',
    "customCss" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_themes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_bank_accounts" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_bank_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_payment_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "merchantId" TEXT,
    "apiBaseUrl" TEXT,
    "apiKeyEncrypted" TEXT,
    "secretEncrypted" TEXT,
    "callbackPath" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_payment_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_game_provider_configs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "agentCode" TEXT,
    "apiBaseUrl" TEXT,
    "apiKeyEncrypted" TEXT,
    "secretEncrypted" TEXT,
    "callbackPath" TEXT,
    "walletMode" TEXT NOT NULL DEFAULT 'transfer',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_game_provider_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_site_accesses" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'site_admin',
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_site_accesses_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users" ADD COLUMN "siteId" TEXT;
UPDATE "users" SET "siteId" = 'site_pg77' WHERE "siteId" IS NULL;
ALTER TABLE "users" ALTER COLUMN "siteId" SET NOT NULL;
DROP INDEX IF EXISTS "users_username_key";
DROP INDEX IF EXISTS "users_phone_key";
CREATE UNIQUE INDEX "users_siteId_phone_key" ON "users"("siteId", "phone");
CREATE UNIQUE INDEX "users_siteId_username_key" ON "users"("siteId", "username");
CREATE INDEX "users_siteId_idx" ON "users"("siteId");

ALTER TABLE "user_bank_accounts" ADD COLUMN "siteId" TEXT;
UPDATE "user_bank_accounts" uba SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = uba."userId"), 'site_pg77') WHERE uba."siteId" IS NULL;
ALTER TABLE "user_bank_accounts" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "user_bank_accounts_siteId_idx" ON "user_bank_accounts"("siteId");

ALTER TABLE "wallet_accounts" ADD COLUMN "siteId" TEXT;
UPDATE "wallet_accounts" wa SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = wa."userId"), 'site_pg77') WHERE wa."siteId" IS NULL;
ALTER TABLE "wallet_accounts" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "wallet_accounts_siteId_idx" ON "wallet_accounts"("siteId");

ALTER TABLE "wallet_ledgers" ADD COLUMN "site_id" TEXT;
UPDATE "wallet_ledgers" wl SET "site_id" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = wl."user_id"), 'site_pg77') WHERE wl."site_id" IS NULL;
ALTER TABLE "wallet_ledgers" ALTER COLUMN "site_id" SET NOT NULL;
CREATE INDEX "wallet_ledgers_site_id_idx" ON "wallet_ledgers"("site_id");

ALTER TABLE "deposit_transactions" ADD COLUMN "site_id" TEXT;
UPDATE "deposit_transactions" dt SET "site_id" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = dt."user_id"), 'site_pg77') WHERE dt."site_id" IS NULL;
ALTER TABLE "deposit_transactions" ALTER COLUMN "site_id" SET NOT NULL;
CREATE INDEX "deposit_transactions_site_id_idx" ON "deposit_transactions"("site_id");

ALTER TABLE "withdraw_transactions" ADD COLUMN "site_id" TEXT;
UPDATE "withdraw_transactions" wt SET "site_id" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = wt."user_id"), 'site_pg77') WHERE wt."site_id" IS NULL;
ALTER TABLE "withdraw_transactions" ALTER COLUMN "site_id" SET NOT NULL;
CREATE INDEX "withdraw_transactions_site_id_idx" ON "withdraw_transactions"("site_id");

ALTER TABLE "promotions" ADD COLUMN "siteId" TEXT;
UPDATE "promotions" SET "siteId" = 'site_pg77' WHERE "siteId" IS NULL;
ALTER TABLE "promotions" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "promotions_siteId_idx" ON "promotions"("siteId");

ALTER TABLE "promotion_claims" ADD COLUMN "siteId" TEXT;
UPDATE "promotion_claims" pc SET "siteId" = COALESCE((SELECT p."siteId" FROM "promotions" p WHERE p."id" = pc."promotionId"), 'site_pg77') WHERE pc."siteId" IS NULL;
ALTER TABLE "promotion_claims" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "promotion_claims_siteId_idx" ON "promotion_claims"("siteId");

ALTER TABLE "turnover_requirements" ADD COLUMN "siteId" TEXT;
UPDATE "turnover_requirements" tr SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = tr."userId"), 'site_pg77') WHERE tr."siteId" IS NULL;
ALTER TABLE "turnover_requirements" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "turnover_requirements_siteId_idx" ON "turnover_requirements"("siteId");

ALTER TABLE "point_ledgers" ADD COLUMN "site_id" TEXT;
UPDATE "point_ledgers" pl SET "site_id" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = pl."user_id"), 'site_pg77') WHERE pl."site_id" IS NULL;
ALTER TABLE "point_ledgers" ALTER COLUMN "site_id" SET NOT NULL;
CREATE INDEX "point_ledgers_site_id_idx" ON "point_ledgers"("site_id");

ALTER TABLE "game_sessions" ADD COLUMN "siteId" TEXT;
UPDATE "game_sessions" gs SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = gs."userId"), 'site_pg77') WHERE gs."siteId" IS NULL;
ALTER TABLE "game_sessions" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "game_sessions_siteId_idx" ON "game_sessions"("siteId");

ALTER TABLE "game_transfers" ADD COLUMN "siteId" TEXT;
UPDATE "game_transfers" gt SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = gt."userId"), 'site_pg77') WHERE gt."siteId" IS NULL;
ALTER TABLE "game_transfers" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "game_transfers_siteId_idx" ON "game_transfers"("siteId");

ALTER TABLE "game_bet_history_mock" ADD COLUMN "siteId" TEXT;
UPDATE "game_bet_history_mock" gb SET "siteId" = COALESCE((SELECT u."siteId" FROM "users" u WHERE u."id" = gb."userId"), 'site_pg77') WHERE gb."siteId" IS NULL;
ALTER TABLE "game_bet_history_mock" ALTER COLUMN "siteId" SET NOT NULL;
CREATE INDEX "game_bet_history_mock_siteId_idx" ON "game_bet_history_mock"("siteId");

ALTER TABLE "admin_logs" ADD COLUMN "site_id" TEXT;
UPDATE "admin_logs" SET "site_id" = 'site_pg77' WHERE "site_id" IS NULL;
ALTER TABLE "admin_logs" ALTER COLUMN "site_id" SET NOT NULL;
CREATE INDEX "admin_logs_site_id_idx" ON "admin_logs"("site_id");

CREATE UNIQUE INDEX "site_domains_domain_key" ON "site_domains"("domain");
CREATE INDEX "site_domains_siteId_idx" ON "site_domains"("siteId");
CREATE UNIQUE INDEX "site_settings_siteId_key" ON "site_settings"("siteId");
CREATE UNIQUE INDEX "site_themes_siteId_key" ON "site_themes"("siteId");
CREATE INDEX "site_bank_accounts_siteId_idx" ON "site_bank_accounts"("siteId");
CREATE UNIQUE INDEX "site_payment_configs_siteId_providerCode_key" ON "site_payment_configs"("siteId", "providerCode");
CREATE INDEX "site_payment_configs_siteId_idx" ON "site_payment_configs"("siteId");
CREATE UNIQUE INDEX "site_game_provider_configs_siteId_providerCode_key" ON "site_game_provider_configs"("siteId", "providerCode");
CREATE INDEX "site_game_provider_configs_siteId_idx" ON "site_game_provider_configs"("siteId");
CREATE UNIQUE INDEX "admin_site_accesses_adminId_siteId_key" ON "admin_site_accesses"("adminId", "siteId");
CREATE INDEX "admin_site_accesses_siteId_idx" ON "admin_site_accesses"("siteId");

ALTER TABLE "site_domains" ADD CONSTRAINT "site_domains_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_themes" ADD CONSTRAINT "site_themes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_bank_accounts" ADD CONSTRAINT "site_bank_accounts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_payment_configs" ADD CONSTRAINT "site_payment_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_game_provider_configs" ADD CONSTRAINT "site_game_provider_configs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_site_accesses" ADD CONSTRAINT "admin_site_accesses_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_site_accesses" ADD CONSTRAINT "admin_site_accesses_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_bank_accounts" ADD CONSTRAINT "user_bank_accounts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wallet_accounts" ADD CONSTRAINT "wallet_accounts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wallet_ledgers" ADD CONSTRAINT "wallet_ledgers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deposit_transactions" ADD CONSTRAINT "deposit_transactions_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "withdraw_transactions" ADD CONSTRAINT "withdraw_transactions_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "promotion_claims" ADD CONSTRAINT "promotion_claims_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "turnover_requirements" ADD CONSTRAINT "turnover_requirements_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "point_ledgers" ADD CONSTRAINT "point_ledgers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "game_transfers" ADD CONSTRAINT "game_transfers_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "game_bet_history_mock" ADD CONSTRAINT "game_bet_history_mock_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
