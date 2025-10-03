-- AlterTable
ALTER TABLE "job_posts" ADD COLUMN     "budget_type" TEXT NOT NULL DEFAULT 'hourly',
ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "experience_level" TEXT NOT NULL DEFAULT 'intermediate',
ADD COLUMN     "fixed_price" DECIMAL(10,2),
ADD COLUMN     "freelancers_needed" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hourly_rate_from" DECIMAL(10,2),
ADD COLUMN     "hourly_rate_to" DECIMAL(10,2),
ADD COLUMN     "hours_per_week" TEXT,
ADD COLUMN     "job_size" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "mandatory_skills" JSONB,
ADD COLUMN     "nice_to_have_skills" JSONB,
ADD COLUMN     "project_type" TEXT NOT NULL DEFAULT 'one-time',
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tools" JSONB,
ALTER COLUMN "regular_price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'skill',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
