-- AlterTable: add emailRemindersEnabled to Notification
ALTER TABLE "Notification" ADD COLUMN "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: PushToken for Expo push tokens
CREATE TABLE "PushToken" (
    "id" SERIAL NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushToken_expoPushToken_key" ON "PushToken"("expoPushToken");
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
