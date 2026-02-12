-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "dateISO" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "repeat" TEXT NOT NULL DEFAULT 'none',
    "title" TEXT NOT NULL,
    "journalId" INTEGER,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_authorId_dateISO_idx" ON "Reminder"("authorId", "dateISO");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
