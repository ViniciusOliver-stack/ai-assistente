-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "providerModel" TEXT NOT NULL,
    "temperature" INTEGER,
    "restrictionContent" BOOLEAN NOT NULL,
    "languageDetector" BOOLEAN NOT NULL,
    "prompt" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_teamId_key" ON "Agent"("teamId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ApiKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
