/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EntrySource" AS ENUM ('TEXT', 'VOICE', 'MIXED');

-- CreateEnum
CREATE TYPE "TagSource" AS ENUM ('AI', 'USER');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Mood" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" SERIAL NOT NULL,
    "journalId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "source" "EntrySource" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceRecording" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "s3Url" TEXT NOT NULL,
    "durationS" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcription" (
    "id" SERIAL NOT NULL,
    "recordingId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrySummary" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryMood" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntryMood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryTag" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "source" "TagSource" NOT NULL DEFAULT 'AI',

    CONSTRAINT "EntryTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_journalId_createdAt_idx" ON "JournalEntry"("journalId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceRecording_entryId_key" ON "VoiceRecording"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_recordingId_key" ON "Transcription"("recordingId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrySummary_entryId_key" ON "EntrySummary"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryMood_entryId_key" ON "EntryMood"("entryId");

-- CreateIndex
CREATE INDEX "EntryTag_entryId_idx" ON "EntryTag"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryTag_entryId_tag_key" ON "EntryTag"("entryId", "tag");

-- AddForeignKey
ALTER TABLE "Mood" ADD CONSTRAINT "Mood_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceRecording" ADD CONSTRAINT "VoiceRecording_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "VoiceRecording"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrySummary" ADD CONSTRAINT "EntrySummary_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryMood" ADD CONSTRAINT "EntryMood_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryTag" ADD CONSTRAINT "EntryTag_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
