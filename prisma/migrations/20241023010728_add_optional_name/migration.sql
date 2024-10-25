-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_tokenId_fkey";

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "tokenId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
