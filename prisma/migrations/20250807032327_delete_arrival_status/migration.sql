/*
  Warnings:

  - You are about to drop the column `status` on the `arrivals` table. All the data in the column will be lost.
  - You are about to drop the column `statusQc` on the `arrivals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `arrivals` DROP COLUMN `status`,
    DROP COLUMN `statusQc`;

-- AlterTable
ALTER TABLE `arrivalstatuses` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'Menunggu QC/Timbang';
