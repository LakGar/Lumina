-- Baseline: DB already has these (added outside migration history).
-- Do NOT run this migration. Instead run:
--   npx prisma migrate resolve --applied "20260202100000_baseline_drift"
-- Then run:
--   npx prisma migrate dev
-- This file exists only so migration history matches your DB.

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('DAILY', 'WEEKLY', 'ALTERNATE');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;
ALTER TABLE "User" ADD COLUMN "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "prefferdName" TEXT;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateTable Billing
CREATE TABLE "Billing" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "plan" TEXT,
    "status" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Billing_userId_key" ON "Billing"("userId");
CREATE UNIQUE INDEX "Billing_stripeCustomerId_key" ON "Billing"("stripeCustomerId");
CREATE UNIQUE INDEX "Billing_stripeSubscriptionId_key" ON "Billing"("stripeSubscriptionId");
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "dailyReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyReminderTime" TEXT,
    "timezone" TEXT,
    "frequency" "NotificationFrequency",
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Notification_authorId_key" ON "Notification"("authorId");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable userPrefferences
CREATE TABLE "userPrefferences" (
    "id" SERIAL NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "goal" TEXT,
    "topics" TEXT,
    "reason" TEXT,
    "aiSummariesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoTaggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "moodDetectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiTone" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userPrefferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "userPrefferences_authorId_key" ON "userPrefferences"("authorId");
ALTER TABLE "userPrefferences" ADD CONSTRAINT "userPrefferences_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
