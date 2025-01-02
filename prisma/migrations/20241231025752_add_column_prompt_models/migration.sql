/*
  Warnings:

  - You are about to drop the `PromptUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PromptUser" DROP CONSTRAINT "PromptUser_agentId_fkey";

-- DropForeignKey
ALTER TABLE "PromptUser" DROP CONSTRAINT "PromptUser_teamId_fkey";

-- DropTable
DROP TABLE "PromptUser";

-- CreateTable
CREATE TABLE "PromptModels" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptModels_pkey" PRIMARY KEY ("id")
);
