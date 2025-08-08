-- CreateTable
CREATE TABLE `ArrivalStatuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `arrivalId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusQc` VARCHAR(191) NULL,
    `statusWeighing` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArrivalStatuses` ADD CONSTRAINT `ArrivalStatuses_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `Arrivals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
