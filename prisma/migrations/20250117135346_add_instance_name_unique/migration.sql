/*
  Warnings:

  - A unique constraint covering the columns `[instanceName]` on the table `WhatsAppInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInstance_instanceName_key" ON "WhatsAppInstance"("instanceName");
