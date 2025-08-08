-- AlterTable
ALTER TABLE `arrivalstatuses` MODIFY `statusQc` VARCHAR(191) NULL DEFAULT 'Mennunggu QC',
    MODIFY `statusWeighing` VARCHAR(191) NULL DEFAULT 'Menunggu Timbang';
