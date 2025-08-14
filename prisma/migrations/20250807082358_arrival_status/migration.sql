/*
  Warnings:

  - A unique constraint covering the columns `[arrivalId]` on the table `ArrivalStatuses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ArrivalStatuses_arrivalId_key` ON `ArrivalStatuses`(`arrivalId`);
