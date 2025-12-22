-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INVESTOR', 'STARTUP');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C_PLUS');

-- CreateEnum
CREATE TYPE "StartupCategory" AS ENUM ('VERTICAL_SAAS', 'AI_AGENT', 'HORIZONTAL_SAAS', 'ML_INFRA', 'DEVTOOLS', 'FINTECH', 'HEALTHTECH', 'EDTECH');

-- CreateEnum
CREATE TYPE "StartupStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'FUNDED', 'PAUSED');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('CUSTOMER_WIN', 'PRODUCT_LAUNCH', 'HIRING', 'RISK', 'PARTNERSHIP', 'FUNDING', 'CHURN', 'PIVOT', 'MILESTONE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VIEWED', 'FAVORITED', 'CONTACTED', 'NOTED', 'UNFAVORITED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "profile_photo_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STARTUP',
    "supabase_auth_id" TEXT,
    "invited_by_user_id" TEXT,
    "invite_token" TEXT,
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invite_sent_at" TIMESTAMP(3),
    "invite_expires_at" TIMESTAMP(3),
    "invite_accepted_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "tagline" TEXT,
    "founding_date" TIMESTAMP(3),
    "website" TEXT,
    "location" TEXT,
    "logo_url" TEXT,
    "stage" "StartupStage" NOT NULL,
    "category" "StartupCategory" NOT NULL,
    "linkedin_company_url" TEXT,
    "twitter_handle" TEXT,
    "elevator_pitch" TEXT,
    "problem_statement" TEXT,
    "solution" TEXT,
    "pitch_deck_url" TEXT,
    "one_pager_url" TEXT,
    "demo_video_url" TEXT,
    "financial_model_url" TEXT,
    "status" "StartupStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_score_calculated" TIMESTAMP(3),

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founders" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedin_url" TEXT,
    "photo_url" TEXT,
    "bio" TEXT,
    "education" JSONB,
    "previous_companies" JSONB,
    "years_experience" INTEGER,
    "domain_expertise" JSONB,
    "technical_skills" JSONB,
    "is_fulltime" BOOLEAN NOT NULL DEFAULT true,
    "equity_percentage" DOUBLE PRECISION,
    "has_vesting" BOOLEAN NOT NULL DEFAULT false,
    "vesting_schedule" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "mrr" DOUBLE PRECISION,
    "arr" DOUBLE PRECISION,
    "revenue" DOUBLE PRECISION,
    "total_customers" INTEGER,
    "paying_customers" INTEGER,
    "trial_customers" INTEGER,
    "mom_growth_rate" DOUBLE PRECISION,
    "qoq_growth_rate" DOUBLE PRECISION,
    "yoy_growth_rate" DOUBLE PRECISION,
    "churn_rate" DOUBLE PRECISION,
    "retention_rate" DOUBLE PRECISION,
    "nrr" DOUBLE PRECISION,
    "cac" DOUBLE PRECISION,
    "ltv" DOUBLE PRECISION,
    "ltv_cac_ratio" DOUBLE PRECISION,
    "payback_period" INTEGER,
    "burn_rate" DOUBLE PRECISION,
    "runway_months" INTEGER,
    "gross_margin" DOUBLE PRECISION,
    "cash_balance" DOUBLE PRECISION,
    "dau" INTEGER,
    "mau" INTEGER,
    "dau_mau_ratio" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financials" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "total_funding_raised" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previous_rounds" JSONB,
    "previous_investors" JSONB,
    "funding_target" DOUBLE PRECISION,
    "minimum_raise" DOUBLE PRECISION,
    "offered_dilution" DOUBLE PRECISION,
    "pre_money_valuation" DOUBLE PRECISION,
    "post_money_valuation" DOUBLE PRECISION,
    "use_of_funds" JSONB,
    "founder_equity" DOUBLE PRECISION,
    "employee_pool" DOUBLE PRECISION,
    "investor_equity" DOUBLE PRECISION,
    "projected_revenue" JSONB,
    "projected_customers" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "tam" DOUBLE PRECISION,
    "sam" DOUBLE PRECISION,
    "som" DOUBLE PRECISION,
    "target_sector" TEXT,
    "target_industries" JSONB,
    "target_geography" TEXT,
    "target_customer_type" TEXT,
    "ideal_customer_profile" JSONB,
    "competitors" JSONB,
    "competitive_landscape" TEXT,
    "differentiation" TEXT,
    "moat" TEXT,
    "market_growth_rate" DOUBLE PRECISION,
    "market_trends" JSONB,
    "regulatory_factors" TEXT,
    "gtm_strategy" TEXT,
    "sales_channels" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linkedin_activity" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "post_date" TIMESTAMP(3) NOT NULL,
    "post_text" TEXT NOT NULL,
    "post_url" TEXT,
    "post_image_url" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER,
    "engagement_rate" DOUBLE PRECISION,
    "ai_analysis" JSONB,
    "ai_analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "founder_score" DOUBLE PRECISION NOT NULL,
    "team_score" DOUBLE PRECISION NOT NULL,
    "market_score" DOUBLE PRECISION NOT NULL,
    "product_score" DOUBLE PRECISION NOT NULL,
    "traction_score" DOUBLE PRECISION NOT NULL,
    "financial_score" DOUBLE PRECISION NOT NULL,
    "linkedin_score" DOUBLE PRECISION NOT NULL,
    "score_breakdown" JSONB NOT NULL,
    "risk_penalties" JSONB,
    "overall_risk" TEXT,
    "percentile" DOUBLE PRECISION,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_version" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "insight_type" "InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "insight_text" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_data" JSONB,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preferred_stages" JSONB,
    "preferred_categories" JSONB,
    "min_score_threshold" DOUBLE PRECISION DEFAULT 0,
    "ticket_size_min" DOUBLE PRECISION,
    "ticket_size_max" DOUBLE PRECISION,
    "typical_ticket_size" DOUBLE PRECISION,
    "preferred_sectors" JSONB,
    "preferred_geographies" JSONB,
    "excluded_sectors" JSONB,
    "excluded_geographies" JSONB,
    "min_mrr" DOUBLE PRECISION,
    "min_growth_rate" DOUBLE PRECISION,
    "min_customers" INTEGER,
    "max_churn_rate" DOUBLE PRECISION,
    "require_fulltime_founders" BOOLEAN NOT NULL DEFAULT false,
    "min_founders_count" INTEGER,
    "require_technical_cofounder" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "action_type" "ActivityType" NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,
    "contact_date" TIMESTAMP(3),
    "next_follow_up" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_auth_id_key" ON "users"("supabase_auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_token_key" ON "users"("invite_token");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_supabase_auth_id_idx" ON "users"("supabase_auth_id");

-- CreateIndex
CREATE INDEX "users_invite_token_idx" ON "users"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "startups_user_id_key" ON "startups"("user_id");

-- CreateIndex
CREATE INDEX "startups_status_is_published_idx" ON "startups"("status", "is_published");

-- CreateIndex
CREATE INDEX "startups_stage_category_idx" ON "startups"("stage", "category");

-- CreateIndex
CREATE INDEX "startups_company_name_idx" ON "startups"("company_name");

-- CreateIndex
CREATE INDEX "founders_startup_id_idx" ON "founders"("startup_id");

-- CreateIndex
CREATE INDEX "founders_linkedin_url_idx" ON "founders"("linkedin_url");

-- CreateIndex
CREATE INDEX "metrics_startup_id_recorded_at_idx" ON "metrics"("startup_id", "recorded_at");

-- CreateIndex
CREATE INDEX "financials_startup_id_idx" ON "financials"("startup_id");

-- CreateIndex
CREATE UNIQUE INDEX "market_startup_id_key" ON "market"("startup_id");

-- CreateIndex
CREATE INDEX "linkedin_activity_startup_id_post_date_idx" ON "linkedin_activity"("startup_id", "post_date");

-- CreateIndex
CREATE INDEX "linkedin_activity_founder_id_post_date_idx" ON "linkedin_activity"("founder_id", "post_date");

-- CreateIndex
CREATE INDEX "scores_startup_id_calculated_at_idx" ON "scores"("startup_id", "calculated_at");

-- CreateIndex
CREATE INDEX "scores_total_score_idx" ON "scores"("total_score");

-- CreateIndex
CREATE INDEX "insights_startup_id_created_at_idx" ON "insights"("startup_id", "created_at");

-- CreateIndex
CREATE INDEX "insights_insight_type_severity_idx" ON "insights"("insight_type", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "investor_preferences_user_id_key" ON "investor_preferences"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_investor_id_startup_id_idx" ON "activity_logs"("investor_id", "startup_id");

-- CreateIndex
CREATE INDEX "activity_logs_investor_id_action_type_idx" ON "activity_logs"("investor_id", "action_type");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founders" ADD CONSTRAINT "founders_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financials" ADD CONSTRAINT "financials_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market" ADD CONSTRAINT "market_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_activity" ADD CONSTRAINT "linkedin_activity_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_activity" ADD CONSTRAINT "linkedin_activity_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_preferences" ADD CONSTRAINT "investor_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
