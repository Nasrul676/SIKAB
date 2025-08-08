/*
  Warnings:

  - You are about to alter the column `statusQc` on the `arrivalitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `arrivalitems` MODIFY `statusQc` BOOLEAN NULL;
