/*
  Warnings:

  - You are about to drop the column `ItemName` on the `arrivalitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `arrivalitems` DROP COLUMN `ItemName`,
    ADD COLUMN `itemName` VARCHAR(191) NULL;
