-- CreateTable
CREATE TABLE "code_campaigns" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "site_code" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reward_type" TEXT NOT NULL,
    "reward_payload" JSONB NOT NULL,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "max_redemptions" INTEGER NOT NULL DEFAULT 0,
    "per_member_limit" INTEGER NOT NULL DEFAULT 1,
    "created_by" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_center_codes" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "max_redemptions" INTEGER NOT NULL DEFAULT 1,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" JSONB,
    "redeemed_by" TEXT,
    "redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_center_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_redeem_logs" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "code_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_payload" JSONB,
    "reward_entry_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_redeem_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_reward_wallet_entries" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "amount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "label" TEXT NOT NULL,
    "payload" JSONB,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_reward_wallet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_campaigns_site_id_idx" ON "code_campaigns"("site_id");

-- CreateIndex
CREATE INDEX "code_campaigns_status_idx" ON "code_campaigns"("status");

-- CreateIndex
CREATE INDEX "code_campaigns_reward_type_idx" ON "code_campaigns"("reward_type");

-- CreateIndex
CREATE INDEX "code_center_codes_site_id_idx" ON "code_center_codes"("site_id");

-- CreateIndex
CREATE INDEX "code_center_codes_campaign_id_idx" ON "code_center_codes"("campaign_id");

-- CreateIndex
CREATE INDEX "code_center_codes_status_idx" ON "code_center_codes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "code_center_codes_site_id_code_key" ON "code_center_codes"("site_id", "code");

-- CreateIndex
CREATE INDEX "code_redeem_logs_site_id_idx" ON "code_redeem_logs"("site_id");

-- CreateIndex
CREATE INDEX "code_redeem_logs_campaign_id_idx" ON "code_redeem_logs"("campaign_id");

-- CreateIndex
CREATE INDEX "code_redeem_logs_member_id_idx" ON "code_redeem_logs"("member_id");

-- CreateIndex
CREATE INDEX "code_redeem_logs_status_idx" ON "code_redeem_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "code_redeem_logs_code_id_member_id_key" ON "code_redeem_logs"("code_id", "member_id");

-- CreateIndex
CREATE INDEX "member_reward_wallet_entries_site_id_idx" ON "member_reward_wallet_entries"("site_id");

-- CreateIndex
CREATE INDEX "member_reward_wallet_entries_member_id_idx" ON "member_reward_wallet_entries"("member_id");

-- CreateIndex
CREATE INDEX "member_reward_wallet_entries_reward_type_idx" ON "member_reward_wallet_entries"("reward_type");

-- CreateIndex
CREATE INDEX "member_reward_wallet_entries_status_idx" ON "member_reward_wallet_entries"("status");

-- CreateIndex
CREATE INDEX "member_reward_wallet_entries_source_type_source_id_idx" ON "member_reward_wallet_entries"("source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_reward_wallet_entries_site_id_source_type_source_id_key" ON "member_reward_wallet_entries"("site_id", "source_type", "source_id");

-- AddForeignKey
ALTER TABLE "code_campaigns" ADD CONSTRAINT "code_campaigns_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_center_codes" ADD CONSTRAINT "code_center_codes_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_center_codes" ADD CONSTRAINT "code_center_codes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "code_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redeem_logs" ADD CONSTRAINT "code_redeem_logs_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redeem_logs" ADD CONSTRAINT "code_redeem_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "code_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redeem_logs" ADD CONSTRAINT "code_redeem_logs_code_id_fkey" FOREIGN KEY ("code_id") REFERENCES "code_center_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redeem_logs" ADD CONSTRAINT "code_redeem_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redeem_logs" ADD CONSTRAINT "code_redeem_logs_reward_entry_id_fkey" FOREIGN KEY ("reward_entry_id") REFERENCES "member_reward_wallet_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_reward_wallet_entries" ADD CONSTRAINT "member_reward_wallet_entries_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_reward_wallet_entries" ADD CONSTRAINT "member_reward_wallet_entries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
