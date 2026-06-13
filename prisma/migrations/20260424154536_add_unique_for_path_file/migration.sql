/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
