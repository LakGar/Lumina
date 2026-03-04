-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('DEFAULT', 'WARM', 'COOL');

-- AlterTable
ALTER TABLE "userPrefferences" ADD COLUMN "colorScheme" "ColorScheme" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN "prompt" TEXT;
