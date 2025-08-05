-- AlterTable
ALTER TABLE `qcresults` ADD COLUMN `historyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `QcResults` ADD CONSTRAINT `QcResults_historyId_fkey` FOREIGN KEY (`historyId`) REFERENCES `QcHistories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
