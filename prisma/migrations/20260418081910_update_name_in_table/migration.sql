/*
  Warnings:

  - You are about to drop the column `name` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleName]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleName` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Role_name_key";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "name",
ADD COLUMN     "roleName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");
