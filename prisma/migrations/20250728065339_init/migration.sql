/*
  Warnings:

  - You are about to drop the `history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `history` DROP FOREIGN KEY `History_userId_fkey`;

-- DropTable
DROP TABLE `history`;

-- CreateTable
CREATE TABLE `QcHistories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `statusId` INTEGER NOT NULL,
    `arrivalId` INTEGER NULL,
    `arrivalItemId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QcHistories` ADD CONSTRAINT `QcHistories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QcHistories` ADD CONSTRAINT `QcHistories_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `QcStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QcHistories` ADD CONSTRAINT `QcHistories_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `Arrivals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QcHistories` ADD CONSTRAINT `QcHistories_arrivalItemId_fkey` FOREIGN KEY (`arrivalItemId`) REFERENCES `ArrivalItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
