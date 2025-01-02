-- CreateTable
CREATE TABLE "PromptUser" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "PromptUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromptUser" ADD CONSTRAINT "PromptUser_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUser" ADD CONSTRAINT "PromptUser_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
