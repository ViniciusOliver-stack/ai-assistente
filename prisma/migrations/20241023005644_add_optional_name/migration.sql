-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "restrictionContent" DROP NOT NULL,
ALTER COLUMN "languageDetector" DROP NOT NULL,
ALTER COLUMN "prompt" DROP NOT NULL;
