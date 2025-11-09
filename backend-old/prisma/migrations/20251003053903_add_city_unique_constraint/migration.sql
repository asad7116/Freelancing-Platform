/*
  Warnings:

  - A unique constraint covering the columns `[name,country]` on the table `cities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cities_name_country_key" ON "cities"("name", "country");
