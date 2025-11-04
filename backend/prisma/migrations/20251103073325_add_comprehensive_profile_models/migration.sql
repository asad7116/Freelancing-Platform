-- CreateTable
CREATE TABLE "freelancer_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "specialization" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "years_of_experience" INTEGER NOT NULL DEFAULT 0,
    "skills" JSONB,
    "languages" JSONB,
    "education" JSONB,
    "experience" JSONB,
    "certifications" JSONB,
    "portfolio_items" JSONB,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "website_url" TEXT,
    "twitter_url" TEXT,
    "bank_accounts" JSONB,
    "payment_methods" JSONB,
    "profile_image" TEXT,
    "cover_image" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT,
    "company_name" TEXT,
    "company_size" TEXT,
    "industry" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "website_url" TEXT,
    "linkedin_url" TEXT,
    "bank_accounts" JSONB,
    "payment_methods" JSONB,
    "profile_image" TEXT,
    "preferred_language" TEXT DEFAULT 'en',
    "timezone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "freelancer_profiles_user_id_key" ON "freelancer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "freelancer_profiles" ADD CONSTRAINT "freelancer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
