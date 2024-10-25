/*
  Warnings:

  - The `limitToken` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "temperature" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "limitToken",
ADD COLUMN     "limitToken" DOUBLE PRECISION;
