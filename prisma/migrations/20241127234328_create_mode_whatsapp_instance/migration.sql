-- CreateTable
CREATE TABLE "WhatsAppInstance" (
    "id" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "integration" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "WhatsAppInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInstance_instanceName_key" ON "WhatsAppInstance"("instanceName");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppInstance_instanceId_key" ON "WhatsAppInstance"("instanceId");

-- CreateIndex
CREATE INDEX "WhatsAppInstance_teamId_idx" ON "WhatsAppInstance"("teamId");

-- CreateIndex
CREATE INDEX "WhatsAppInstance_agentId_idx" ON "WhatsAppInstance"("agentId");

-- AddForeignKey
ALTER TABLE "WhatsAppInstance" ADD CONSTRAINT "WhatsAppInstance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppInstance" ADD CONSTRAINT "WhatsAppInstance_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
