/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_deviceId_key";

-- CreateIndex
CREATE INDEX "Session_deviceId_idx" ON "Session"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_deviceId_key" ON "Session"("userId", "deviceId");
