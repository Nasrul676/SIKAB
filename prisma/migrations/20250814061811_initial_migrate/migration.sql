-- CreateTable
CREATE TABLE "Users" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conditions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parameters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrivals" (
    "id" SERIAL NOT NULL,
    "idKedatangan" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivalTime" TEXT,
    "nopol" TEXT,
    "suratJalan" TEXT,
    "city" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Arrivals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalItems" (
    "id" SERIAL NOT NULL,
    "arrivalId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "conditionId" INTEGER NOT NULL,
    "parameterId" INTEGER,
    "conditionCategory" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "itemName" TEXT,
    "qcNote" TEXT,
    "qcStatusId" INTEGER,
    "qcAnalysis" TEXT,
    "qcSample" DOUBLE PRECISION,
    "qcKotoran" DOUBLE PRECISION,
    "totalBerat" DOUBLE PRECISION,
    "pengeringan" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "statusQc" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArrivalItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weighings" (
    "id" SERIAL NOT NULL,
    "arrivalItemId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "weighingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Weighings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "table" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcResults" (
    "id" SERIAL NOT NULL,
    "arrivalItemId" INTEGER NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "historyId" INTEGER,
    "resultKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "QcResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "QcStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcPhotos" (
    "id" SERIAL NOT NULL,
    "arrivalItemId" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "QcPhotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityPhotos" (
    "id" SERIAL NOT NULL,
    "arrivalId" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SecurityPhotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeighingsPhotos" (
    "id" SERIAL NOT NULL,
    "arrivalItemId" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "WeighingsPhotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcHistories" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "arrivalId" INTEGER,
    "arrivalItemId" INTEGER,
    "qcSample" DOUBLE PRECISION,
    "qcKotoran" DOUBLE PRECISION,
    "totalBerat" DOUBLE PRECISION,
    "pengeringan" DOUBLE PRECISION,
    "note" TEXT,
    "qcNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QcHistories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalStatuses" (
    "id" SERIAL NOT NULL,
    "arrivalId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGUQC/TIMBANG',
    "statusQc" TEXT DEFAULT 'MENUNGGUQC',
    "statusWeighing" TEXT DEFAULT 'MENUNGGUTIMBANG',
    "statusApproval" TEXT DEFAULT 'MENUNGGUPERSETUJUAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ArrivalStatuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParameterSettings" (
    "id" SERIAL NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ParameterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ArrivalStatuses_arrivalId_key" ON "ArrivalStatuses"("arrivalId");

-- CreateIndex
CREATE UNIQUE INDEX "ParameterSettings_parameterId_key_key" ON "ParameterSettings"("parameterId", "key");

-- AddForeignKey
ALTER TABLE "Arrivals" ADD CONSTRAINT "Arrivals_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItems" ADD CONSTRAINT "ArrivalItems_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrivals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItems" ADD CONSTRAINT "ArrivalItems_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItems" ADD CONSTRAINT "ArrivalItems_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItems" ADD CONSTRAINT "ArrivalItems_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItems" ADD CONSTRAINT "ArrivalItems_qcStatusId_fkey" FOREIGN KEY ("qcStatusId") REFERENCES "QcStatus"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weighings" ADD CONSTRAINT "Weighings_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcResults" ADD CONSTRAINT "QcResults_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcResults" ADD CONSTRAINT "QcResults_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcResults" ADD CONSTRAINT "QcResults_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "QcHistories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcPhotos" ADD CONSTRAINT "QcPhotos_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityPhotos" ADD CONSTRAINT "SecurityPhotos_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrivals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighingsPhotos" ADD CONSTRAINT "WeighingsPhotos_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcHistories" ADD CONSTRAINT "QcHistories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcHistories" ADD CONSTRAINT "QcHistories_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "QcStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcHistories" ADD CONSTRAINT "QcHistories_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrivals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcHistories" ADD CONSTRAINT "QcHistories_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalStatuses" ADD CONSTRAINT "ArrivalStatuses_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrivals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParameterSettings" ADD CONSTRAINT "ParameterSettings_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
