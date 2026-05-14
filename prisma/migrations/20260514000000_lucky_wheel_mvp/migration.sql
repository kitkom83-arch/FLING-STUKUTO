CREATE TABLE "wheel_campaigns" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "cost_type" TEXT NOT NULL DEFAULT 'point',
    "cost_amount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "daily_spin_limit" INTEGER NOT NULL DEFAULT 0,
    "monthly_spin_limit" INTEGER,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "rules_text" TEXT,
    "show_history" BOOLEAN NOT NULL DEFAULT true,
    "max_wheel_credit" DECIMAL(18,2),
    "min_deposit_required" DECIMAL(18,2),
    "min_turnover_required" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wheel_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wheel_rewards" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "display_value" TEXT NOT NULL,
    "probability_weight" INTEGER NOT NULL DEFAULT 0,
    "stock_limit" INTEGER,
    "stock_used" INTEGER NOT NULL DEFAULT 0,
    "segment_color" TEXT NOT NULL,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wheel_rewards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wheel_spins" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "prize_index" INTEGER NOT NULL,
    "spin_cost_type" TEXT NOT NULL,
    "spin_cost_amount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "result_snapshot" JSONB NOT NULL,
    "ip_address_masked" TEXT,
    "user_agent_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wheel_spins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "member_rewards" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "claimed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "member_rewards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wheel_campaigns_site_id_idx" ON "wheel_campaigns"("site_id");
CREATE INDEX "wheel_campaigns_status_idx" ON "wheel_campaigns"("status");
CREATE INDEX "wheel_rewards_campaign_id_idx" ON "wheel_rewards"("campaign_id");
CREATE INDEX "wheel_rewards_status_idx" ON "wheel_rewards"("status");
CREATE UNIQUE INDEX "wheel_rewards_campaign_id_sort_order_key" ON "wheel_rewards"("campaign_id", "sort_order");
CREATE INDEX "wheel_spins_site_id_idx" ON "wheel_spins"("site_id");
CREATE INDEX "wheel_spins_member_id_idx" ON "wheel_spins"("member_id");
CREATE INDEX "wheel_spins_campaign_id_idx" ON "wheel_spins"("campaign_id");
CREATE INDEX "wheel_spins_reward_id_idx" ON "wheel_spins"("reward_id");
CREATE INDEX "wheel_spins_created_at_idx" ON "wheel_spins"("created_at");
CREATE UNIQUE INDEX "member_rewards_source_id_key" ON "member_rewards"("source_id");
CREATE INDEX "member_rewards_site_id_idx" ON "member_rewards"("site_id");
CREATE INDEX "member_rewards_member_id_idx" ON "member_rewards"("member_id");
CREATE INDEX "member_rewards_source_idx" ON "member_rewards"("source");
CREATE INDEX "member_rewards_status_idx" ON "member_rewards"("status");

ALTER TABLE "wheel_campaigns" ADD CONSTRAINT "wheel_campaigns_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wheel_rewards" ADD CONSTRAINT "wheel_rewards_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "wheel_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "wheel_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "wheel_rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "member_rewards" ADD CONSTRAINT "member_rewards_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "member_rewards" ADD CONSTRAINT "member_rewards_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "member_rewards" ADD CONSTRAINT "member_rewards_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "wheel_spins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
