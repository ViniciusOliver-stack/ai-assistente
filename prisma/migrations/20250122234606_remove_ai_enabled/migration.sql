/*
  Warnings:

  - You are about to drop the column `isAIEnabled` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `isAIEnabled` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "isAIEnabled";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isAIEnabled";
