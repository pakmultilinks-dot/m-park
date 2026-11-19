-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pricePkr" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StickerOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "plate" TEXT,
    "stickerCode" TEXT NOT NULL,
    "pricePkr" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" TEXT,
    "orderStatus" TEXT NOT NULL DEFAULT 'ORDERED',
    "userId" TEXT,
    "vehicleId" TEXT,
    "qrCodeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StickerOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StickerOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StickerOrder_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StickerOrder_stickerCode_key" ON "StickerOrder"("stickerCode");

-- CreateIndex
CREATE UNIQUE INDEX "StickerOrder_qrCodeId_key" ON "StickerOrder"("qrCodeId");
