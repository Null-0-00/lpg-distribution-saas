-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREEMIUM', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DriverType" AS ENUM ('RETAIL', 'SHIPMENT');

-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('PACKAGE', 'REFILL');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'BANK_TRANSFER', 'MFS', 'CREDIT', 'CYLINDER_CREDIT');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('PACKAGE', 'REFILL', 'EMPTY_CYLINDER');

-- CreateEnum
CREATE TYPE "ShipmentType" AS ENUM ('INCOMING_FULL', 'INCOMING_EMPTY', 'OUTGOING_FULL', 'OUTGOING_EMPTY', 'EMPTY_CYLINDER_DELIVERY', 'EMPTY_CYLINDER_PICKUP');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('SALE_PACKAGE', 'SALE_REFILL', 'PURCHASE_PACKAGE', 'PURCHASE_REFILL', 'EMPTY_CYLINDER_BUY', 'EMPTY_CYLINDER_SELL', 'ADJUSTMENT_POSITIVE', 'ADJUSTMENT_NEGATIVE', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('FIXED_ASSET', 'CURRENT_ASSET');

-- CreateEnum
CREATE TYPE "LiabilityCategory" AS ENUM ('CURRENT_LIABILITY', 'LONG_TERM_LIABILITY');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PurchaseOrderPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'ASSIGN', 'UNASSIGN', 'APPROVE', 'REJECT', 'ACTIVATE', 'DEACTIVATE', 'USER_SIGN_IN', 'USER_SIGN_OUT', 'PAYMENT', 'RETURN', 'PAID', 'MONTHLY_REPORT_SENT');

-- CreateEnum
CREATE TYPE "ReceivableType" AS ENUM ('CASH', 'CYLINDER');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('CURRENT', 'DUE_SOON', 'OVERDUE', 'PAID');

-- CreateEnum
CREATE TYPE "FixedCostType" AS ENUM ('MANUAL', 'CALCULATED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "language" TEXT NOT NULL DEFAULT 'bn',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MANAGER',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cylinder_sizes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cylinder_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactInfo" JSONB,
    "businessTerms" JSONB,
    "supplierInfo" JSONB,
    "territory" TEXT,
    "analytics" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cylinderSizeId" TEXT,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fullCylinderWeight" DOUBLE PRECISION,
    "emptyCylinderWeight" DOUBLE PRECISION,
    "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPrice" DOUBLE PRECISION,
    "marketPrice" DOUBLE PRECISION,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "specifications" JSONB,
    "performanceMetrics" JSONB,
    "analytics" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "licenseNumber" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "driverType" "DriverType" NOT NULL DEFAULT 'RETAIL',
    "route" TEXT,
    "joiningDate" TIMESTAMP(3),
    "leavingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerName" TEXT,
    "saleType" "SaleType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netValue" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "cashDeposited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cylindersDeposited" INTEGER NOT NULL DEFAULT 0,
    "isOnCredit" BOOLEAN NOT NULL DEFAULT false,
    "isCylinderCredit" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "saleDate" DATE NOT NULL,
    "packageSales" INTEGER NOT NULL DEFAULT 0,
    "refillSales" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "packageRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refillRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashDeposits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cylinderDeposits" INTEGER NOT NULL DEFAULT 0,
    "discounts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseType" "PurchaseType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "productId" TEXT NOT NULL,
    "shipmentType" "ShipmentType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "shipmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT,
    "vehicleNumber" TEXT,
    "notes" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "date" DATE NOT NULL,
    "packageSales" INTEGER NOT NULL DEFAULT 0,
    "refillSales" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "packagePurchase" INTEGER NOT NULL DEFAULT 0,
    "refillPurchase" INTEGER NOT NULL DEFAULT 0,
    "emptyCylindersBuySell" INTEGER NOT NULL DEFAULT 0,
    "fullCylinders" INTEGER NOT NULL DEFAULT 0,
    "emptyCylinders" INTEGER NOT NULL DEFAULT 0,
    "totalCylinders" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emptyCylinderReceivables" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inventory_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "driverId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivable_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cashReceivablesChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cylinderReceivablesChange" INTEGER NOT NULL DEFAULT 0,
    "totalCashReceivables" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCylinderReceivables" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receivable_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cylinder_receivables_by_size" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "receivableRecordId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "cylinderReceivables" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cylinder_receivables_by_size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_receivables" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "receivableRecordId" TEXT,
    "customerName" TEXT NOT NULL,
    "receivableType" "ReceivableType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ReceivableStatus" NOT NULL DEFAULT 'CURRENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_cylinder_size_baselines" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "baselineQuantity" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_cylinder_size_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "subCategory" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "depreciationRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_asset_values" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "unitValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_asset_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_cylinders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "full_cylinders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empty_cylinders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantityInHand" INTEGER NOT NULL DEFAULT 0,
    "quantityWithDrivers" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empty_cylinders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liabilities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "LiabilityCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_parent_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_parent_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "particulars" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "particulars" TEXT NOT NULL,
    "depositDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "PurchaseOrderPriority" NOT NULL DEFAULT 'NORMAL',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributor_assignments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "productId" TEXT,
    "territory" TEXT,
    "assignedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_pricing_tiers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumOrder" INTEGER,
    "paymentTerms" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_pricing_tiers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION,
    "marginPercent" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributor_pricing_assignments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyTierId" TEXT,
    "productTierId" TEXT,
    "customPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_pricing_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_structures" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_cost_structures" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "costType" "FixedCostType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_cost_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "cylinder_sizes_tenantId_idx" ON "cylinder_sizes"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cylinder_sizes_tenantId_size_key" ON "cylinder_sizes"("tenantId", "size");

-- CreateIndex
CREATE INDEX "companies_tenantId_idx" ON "companies"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenantId_name_key" ON "companies"("tenantId", "name");

-- CreateIndex
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");

-- CreateIndex
CREATE INDEX "products_companyId_idx" ON "products"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_companyId_name_key" ON "products"("tenantId", "companyId", "name");

-- CreateIndex
CREATE INDEX "drivers_tenantId_idx" ON "drivers"("tenantId");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_driverType_idx" ON "drivers"("driverType");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_tenantId_phone_key" ON "drivers"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "sales_tenantId_idx" ON "sales"("tenantId");

-- CreateIndex
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");

-- CreateIndex
CREATE INDEX "sales_tenantId_saleDate_idx" ON "sales"("tenantId", "saleDate");

-- CreateIndex
CREATE INDEX "sales_tenantId_driverId_idx" ON "sales"("tenantId", "driverId");

-- CreateIndex
CREATE INDEX "sales_saleType_idx" ON "sales"("saleType");

-- CreateIndex
CREATE INDEX "sales_paymentType_idx" ON "sales"("paymentType");

-- CreateIndex
CREATE INDEX "sales_driverId_idx" ON "sales"("driverId");

-- CreateIndex
CREATE INDEX "sales_productId_idx" ON "sales"("productId");

-- CreateIndex
CREATE INDEX "daily_sales_tenantId_idx" ON "daily_sales"("tenantId");

-- CreateIndex
CREATE INDEX "daily_sales_saleDate_idx" ON "daily_sales"("saleDate");

-- CreateIndex
CREATE INDEX "daily_sales_driverId_idx" ON "daily_sales"("driverId");

-- CreateIndex
CREATE INDEX "daily_sales_productId_idx" ON "daily_sales"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sales_tenantId_driverId_productId_saleDate_key" ON "daily_sales"("tenantId", "driverId", "productId", "saleDate");

-- CreateIndex
CREATE INDEX "purchases_tenantId_idx" ON "purchases"("tenantId");

-- CreateIndex
CREATE INDEX "purchases_purchaseDate_idx" ON "purchases"("purchaseDate");

-- CreateIndex
CREATE INDEX "purchases_companyId_idx" ON "purchases"("companyId");

-- CreateIndex
CREATE INDEX "shipments_tenantId_idx" ON "shipments"("tenantId");

-- CreateIndex
CREATE INDEX "shipments_shipmentDate_idx" ON "shipments"("shipmentDate");

-- CreateIndex
CREATE INDEX "shipments_companyId_idx" ON "shipments"("companyId");

-- CreateIndex
CREATE INDEX "inventory_records_tenantId_idx" ON "inventory_records"("tenantId");

-- CreateIndex
CREATE INDEX "inventory_records_date_idx" ON "inventory_records"("date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_records_tenantId_date_productId_key" ON "inventory_records"("tenantId", "date", "productId");

-- CreateIndex
CREATE INDEX "inventory_movements_tenantId_idx" ON "inventory_movements"("tenantId");

-- CreateIndex
CREATE INDEX "inventory_movements_date_idx" ON "inventory_movements"("date");

-- CreateIndex
CREATE INDEX "inventory_movements_productId_idx" ON "inventory_movements"("productId");

-- CreateIndex
CREATE INDEX "receivable_records_tenantId_idx" ON "receivable_records"("tenantId");

-- CreateIndex
CREATE INDEX "receivable_records_date_idx" ON "receivable_records"("date");

-- CreateIndex
CREATE INDEX "receivable_records_driverId_idx" ON "receivable_records"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "receivable_records_tenantId_driverId_date_key" ON "receivable_records"("tenantId", "driverId", "date");

-- CreateIndex
CREATE INDEX "cylinder_receivables_by_size_tenantId_idx" ON "cylinder_receivables_by_size"("tenantId");

-- CreateIndex
CREATE INDEX "cylinder_receivables_by_size_cylinderSizeId_idx" ON "cylinder_receivables_by_size"("cylinderSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "cylinder_receivables_by_size_receivableRecordId_cylinderSiz_key" ON "cylinder_receivables_by_size"("receivableRecordId", "cylinderSizeId");

-- CreateIndex
CREATE INDEX "customer_receivables_tenantId_idx" ON "customer_receivables"("tenantId");

-- CreateIndex
CREATE INDEX "customer_receivables_driverId_idx" ON "customer_receivables"("driverId");

-- CreateIndex
CREATE INDEX "customer_receivables_customerName_idx" ON "customer_receivables"("customerName");

-- CreateIndex
CREATE INDEX "customer_receivables_status_idx" ON "customer_receivables"("status");

-- CreateIndex
CREATE INDEX "driver_cylinder_size_baselines_tenantId_idx" ON "driver_cylinder_size_baselines"("tenantId");

-- CreateIndex
CREATE INDEX "driver_cylinder_size_baselines_driverId_idx" ON "driver_cylinder_size_baselines"("driverId");

-- CreateIndex
CREATE INDEX "driver_cylinder_size_baselines_cylinderSizeId_idx" ON "driver_cylinder_size_baselines"("cylinderSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_cylinder_size_baselines_tenantId_driverId_cylinderSi_key" ON "driver_cylinder_size_baselines"("tenantId", "driverId", "cylinderSizeId");

-- CreateIndex
CREATE INDEX "assets_tenantId_idx" ON "assets"("tenantId");

-- CreateIndex
CREATE INDEX "assets_category_idx" ON "assets"("category");

-- CreateIndex
CREATE INDEX "inventory_asset_values_tenantId_idx" ON "inventory_asset_values"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_asset_values_tenantId_assetType_key" ON "inventory_asset_values"("tenantId", "assetType");

-- CreateIndex
CREATE INDEX "full_cylinders_tenantId_idx" ON "full_cylinders"("tenantId");

-- CreateIndex
CREATE INDEX "full_cylinders_date_idx" ON "full_cylinders"("date");

-- CreateIndex
CREATE INDEX "full_cylinders_productId_idx" ON "full_cylinders"("productId");

-- CreateIndex
CREATE INDEX "full_cylinders_companyId_idx" ON "full_cylinders"("companyId");

-- CreateIndex
CREATE INDEX "full_cylinders_cylinderSizeId_idx" ON "full_cylinders"("cylinderSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "full_cylinders_tenantId_productId_date_key" ON "full_cylinders"("tenantId", "productId", "date");

-- CreateIndex
CREATE INDEX "empty_cylinders_tenantId_idx" ON "empty_cylinders"("tenantId");

-- CreateIndex
CREATE INDEX "empty_cylinders_date_idx" ON "empty_cylinders"("date");

-- CreateIndex
CREATE INDEX "empty_cylinders_cylinderSizeId_idx" ON "empty_cylinders"("cylinderSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "empty_cylinders_tenantId_cylinderSizeId_date_key" ON "empty_cylinders"("tenantId", "cylinderSizeId", "date");

-- CreateIndex
CREATE INDEX "liabilities_tenantId_idx" ON "liabilities"("tenantId");

-- CreateIndex
CREATE INDEX "liabilities_category_idx" ON "liabilities"("category");

-- CreateIndex
CREATE INDEX "expense_parent_categories_tenantId_idx" ON "expense_parent_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_parent_categories_tenantId_name_key" ON "expense_parent_categories"("tenantId", "name");

-- CreateIndex
CREATE INDEX "expense_categories_tenantId_idx" ON "expense_categories"("tenantId");

-- CreateIndex
CREATE INDEX "expense_categories_parentId_idx" ON "expense_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_tenantId_name_key" ON "expense_categories"("tenantId", "name");

-- CreateIndex
CREATE INDEX "expenses_tenantId_idx" ON "expenses"("tenantId");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "expenses_categoryId_idx" ON "expenses"("categoryId");

-- CreateIndex
CREATE INDEX "deposits_tenantId_idx" ON "deposits"("tenantId");

-- CreateIndex
CREATE INDEX "deposits_depositDate_idx" ON "deposits"("depositDate");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON "purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");

-- CreateIndex
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- CreateIndex
CREATE INDEX "purchase_orders_companyId_idx" ON "purchase_orders"("companyId");

-- CreateIndex
CREATE INDEX "purchase_orders_driverId_idx" ON "purchase_orders"("driverId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_items_productId_idx" ON "purchase_order_items"("productId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "security_audit_logs_tenantId_idx" ON "security_audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_idx" ON "security_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "security_audit_logs_action_idx" ON "security_audit_logs"("action");

-- CreateIndex
CREATE INDEX "security_audit_logs_timestamp_idx" ON "security_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "distributor_assignments_tenantId_idx" ON "distributor_assignments"("tenantId");

-- CreateIndex
CREATE INDEX "distributor_assignments_companyId_idx" ON "distributor_assignments"("companyId");

-- CreateIndex
CREATE INDEX "distributor_assignments_productId_idx" ON "distributor_assignments"("productId");

-- CreateIndex
CREATE INDEX "distributor_assignments_territory_idx" ON "distributor_assignments"("territory");

-- CreateIndex
CREATE INDEX "company_pricing_tiers_companyId_idx" ON "company_pricing_tiers"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_pricing_tiers_companyId_tierName_key" ON "company_pricing_tiers"("companyId", "tierName");

-- CreateIndex
CREATE INDEX "product_pricing_tiers_productId_idx" ON "product_pricing_tiers"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_pricing_tiers_productId_tierName_key" ON "product_pricing_tiers"("productId", "tierName");

-- CreateIndex
CREATE INDEX "distributor_pricing_assignments_tenantId_idx" ON "distributor_pricing_assignments"("tenantId");

-- CreateIndex
CREATE INDEX "distributor_pricing_assignments_companyTierId_idx" ON "distributor_pricing_assignments"("companyTierId");

-- CreateIndex
CREATE INDEX "distributor_pricing_assignments_productTierId_idx" ON "distributor_pricing_assignments"("productTierId");

-- CreateIndex
CREATE INDEX "commission_structures_tenantId_idx" ON "commission_structures"("tenantId");

-- CreateIndex
CREATE INDEX "commission_structures_productId_idx" ON "commission_structures"("productId");

-- CreateIndex
CREATE INDEX "commission_structures_year_month_idx" ON "commission_structures"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "commission_structures_tenantId_productId_month_year_key" ON "commission_structures"("tenantId", "productId", "month", "year");

-- CreateIndex
CREATE INDEX "fixed_cost_structures_tenantId_idx" ON "fixed_cost_structures"("tenantId");

-- CreateIndex
CREATE INDEX "fixed_cost_structures_productId_idx" ON "fixed_cost_structures"("productId");

-- CreateIndex
CREATE INDEX "fixed_cost_structures_year_month_idx" ON "fixed_cost_structures"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "fixed_cost_structures_tenantId_productId_month_year_costTyp_key" ON "fixed_cost_structures"("tenantId", "productId", "month", "year", "costType");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder_sizes" ADD CONSTRAINT "cylinder_sizes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sales" ADD CONSTRAINT "daily_sales_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_records" ADD CONSTRAINT "inventory_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivable_records" ADD CONSTRAINT "receivable_records_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivable_records" ADD CONSTRAINT "receivable_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder_receivables_by_size" ADD CONSTRAINT "cylinder_receivables_by_size_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder_receivables_by_size" ADD CONSTRAINT "cylinder_receivables_by_size_receivableRecordId_fkey" FOREIGN KEY ("receivableRecordId") REFERENCES "receivable_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder_receivables_by_size" ADD CONSTRAINT "cylinder_receivables_by_size_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_receivables" ADD CONSTRAINT "customer_receivables_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_receivables" ADD CONSTRAINT "customer_receivables_receivableRecordId_fkey" FOREIGN KEY ("receivableRecordId") REFERENCES "receivable_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_receivables" ADD CONSTRAINT "customer_receivables_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_cylinder_size_baselines" ADD CONSTRAINT "driver_cylinder_size_baselines_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_cylinder_size_baselines" ADD CONSTRAINT "driver_cylinder_size_baselines_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_cylinder_size_baselines" ADD CONSTRAINT "driver_cylinder_size_baselines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_asset_values" ADD CONSTRAINT "inventory_asset_values_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empty_cylinders" ADD CONSTRAINT "empty_cylinders_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empty_cylinders" ADD CONSTRAINT "empty_cylinders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_parent_categories" ADD CONSTRAINT "expense_parent_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "expense_parent_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_assignments" ADD CONSTRAINT "distributor_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_assignments" ADD CONSTRAINT "distributor_assignments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_assignments" ADD CONSTRAINT "distributor_assignments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_assignments" ADD CONSTRAINT "distributor_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_pricing_tiers" ADD CONSTRAINT "company_pricing_tiers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pricing_tiers" ADD CONSTRAINT "product_pricing_tiers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_pricing_assignments" ADD CONSTRAINT "distributor_pricing_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_pricing_assignments" ADD CONSTRAINT "distributor_pricing_assignments_companyTierId_fkey" FOREIGN KEY ("companyTierId") REFERENCES "company_pricing_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_pricing_assignments" ADD CONSTRAINT "distributor_pricing_assignments_productTierId_fkey" FOREIGN KEY ("productTierId") REFERENCES "product_pricing_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_pricing_assignments" ADD CONSTRAINT "distributor_pricing_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_structures" ADD CONSTRAINT "commission_structures_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_structures" ADD CONSTRAINT "commission_structures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_cost_structures" ADD CONSTRAINT "fixed_cost_structures_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_cost_structures" ADD CONSTRAINT "fixed_cost_structures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

