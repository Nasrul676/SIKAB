-- DropForeignKey
ALTER TABLE `arrivalitems` DROP FOREIGN KEY `ArrivalItems_arrivalId_fkey`;

-- DropForeignKey
ALTER TABLE `arrivalitems` DROP FOREIGN KEY `ArrivalItems_conditionId_fkey`;

-- DropForeignKey
ALTER TABLE `arrivalitems` DROP FOREIGN KEY `ArrivalItems_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `arrivalitems` DROP FOREIGN KEY `ArrivalItems_parameterId_fkey`;

-- DropForeignKey
ALTER TABLE `arrivalitems` DROP FOREIGN KEY `ArrivalItems_qcStatusId_fkey`;

-- DropIndex
DROP INDEX `ArrivalItems_arrivalId_fkey` ON `arrivalitems`;

-- DropIndex
DROP INDEX `ArrivalItems_conditionId_fkey` ON `arrivalitems`;

-- DropIndex
DROP INDEX `ArrivalItems_materialId_fkey` ON `arrivalitems`;

-- DropIndex
DROP INDEX `ArrivalItems_parameterId_fkey` ON `arrivalitems`;

-- DropIndex
DROP INDEX `ArrivalItems_qcStatusId_fkey` ON `arrivalitems`;

-- CreateTable
CREATE TABLE `ParameterSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `parameterId` INTEGER NOT NULL,

    UNIQUE INDEX `ParameterSettings_parameterId_key_key`(`parameterId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArrivalItems` ADD CONSTRAINT `ArrivalItems_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `Arrivals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArrivalItems` ADD CONSTRAINT `ArrivalItems_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Materials`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArrivalItems` ADD CONSTRAINT `ArrivalItems_conditionId_fkey` FOREIGN KEY (`conditionId`) REFERENCES `Conditions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArrivalItems` ADD CONSTRAINT `ArrivalItems_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `Parameters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArrivalItems` ADD CONSTRAINT `ArrivalItems_qcStatusId_fkey` FOREIGN KEY (`qcStatusId`) REFERENCES `QcStatus`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParameterSettings` ADD CONSTRAINT `ParameterSettings_parameterId_fkey` FOREIGN KEY (`parameterId`) REFERENCES `Parameters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
