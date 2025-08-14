/*
  Warnings:

  - Added the required column `resultKey` to the `QcResults` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qcresults` ADD COLUMN `resultKey` VARCHAR(191) NOT NULL;
