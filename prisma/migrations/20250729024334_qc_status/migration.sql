/*
  Warnings:

  - Made the column `statusQc` on table `arrivalitems` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `arrivalitems` MODIFY `statusQc` BOOLEAN NOT NULL DEFAULT false;
