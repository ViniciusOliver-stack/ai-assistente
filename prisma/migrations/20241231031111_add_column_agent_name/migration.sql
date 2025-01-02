/*
  Warnings:

  - Added the required column `agentName` to the `PromptModels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PromptModels" ADD COLUMN     "agentName" TEXT NOT NULL;
