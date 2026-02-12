-- CreateTable PromptCompletion (for Lumina level: prompt completion bonus)
CREATE TABLE "PromptCompletion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "entryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptCompletion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromptCompletion_userId_idx" ON "PromptCompletion"("userId");
CREATE INDEX "PromptCompletion_userId_createdAt_idx" ON "PromptCompletion"("userId", "createdAt");

ALTER TABLE "PromptCompletion" ADD CONSTRAINT "PromptCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
