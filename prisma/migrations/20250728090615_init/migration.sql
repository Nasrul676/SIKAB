-- AlterTable
ALTER TABLE `qchistories` ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `pengeringan` DOUBLE NULL,
    ADD COLUMN `qcKotoran` DOUBLE NULL,
    ADD COLUMN `qcNote` VARCHAR(191) NULL,
    ADD COLUMN `qcSample` DOUBLE NULL,
    ADD COLUMN `totalBerat` DOUBLE NULL;
