/*
  Warnings:

  - You are about to drop the column `isAIEnabled` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instanceName]` on the table `WhatsAppInstance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instanceId,teamId,agentId]` on the table `WhatsAppInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "isAIEnabled";

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInstance_instanceName_key" ON "WhatsAppInstance"("instanceName");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInstance_instanceId_teamId_agentId_key" ON "WhatsAppInstance"("instanceId", "teamId", "agentId");
