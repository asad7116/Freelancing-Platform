/*
  Warnings:

  - A unique constraint covering the columns `[name,category_id]` on the table `specialties` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_category_id_key" ON "specialties"("name", "category_id");
