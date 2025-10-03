-- DropForeignKey
ALTER TABLE "public"."job_posts" DROP CONSTRAINT "job_posts_city_id_fkey";

-- AlterTable
ALTER TABLE "job_posts" ALTER COLUMN "city_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
