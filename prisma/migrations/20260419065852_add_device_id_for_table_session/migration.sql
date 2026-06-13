/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "deviceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_deviceId_key" ON "Session"("deviceId");
