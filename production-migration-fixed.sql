-- Production Database Migration Script (Fixed for Supabase)
-- Run this on your Vercel production database to sync with local schema

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);

-- Add missing column to inventory_records table  
ALTER TABLE inventory_records
ADD COLUMN IF NOT EXISTS "emptyCylinderReceivables" INTEGER NOT NULL DEFAULT 0;

-- Create driver_cylinder_size_baselines table if not exists
CREATE TABLE IF NOT EXISTS "driver_cylinder_size_baselines" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "baselineQuantity" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_cylinder_size_baselines_pkey" PRIMARY KEY ("id")
);

-- Create indexes for driver_cylinder_size_baselines
CREATE INDEX IF NOT EXISTS "driver_cylinder_size_baselines_tenantId_idx" ON "driver_cylinder_size_baselines"("tenantId");
CREATE INDEX IF NOT EXISTS "driver_cylinder_size_baselines_driverId_idx" ON "driver_cylinder_size_baselines"("driverId");
CREATE INDEX IF NOT EXISTS "driver_cylinder_size_baselines_cylinderSizeId_idx" ON "driver_cylinder_size_baselines"("cylinderSizeId");
CREATE UNIQUE INDEX IF NOT EXISTS "driver_cylinder_size_baselines_tenantId_driverId_cylinderSi_key" ON "driver_cylinder_size_baselines"("tenantId", "driverId", "cylinderSizeId");

-- Create full_cylinders table if not exists
CREATE TABLE IF NOT EXISTS "full_cylinders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "full_cylinders_pkey" PRIMARY KEY ("id")
);

-- Create indexes for full_cylinders
CREATE INDEX IF NOT EXISTS "full_cylinders_tenantId_idx" ON "full_cylinders"("tenantId");
CREATE INDEX IF NOT EXISTS "full_cylinders_date_idx" ON "full_cylinders"("date");
CREATE INDEX IF NOT EXISTS "full_cylinders_productId_idx" ON "full_cylinders"("productId");
CREATE INDEX IF NOT EXISTS "full_cylinders_companyId_idx" ON "full_cylinders"("companyId");
CREATE INDEX IF NOT EXISTS "full_cylinders_cylinderSizeId_idx" ON "full_cylinders"("cylinderSizeId");
CREATE UNIQUE INDEX IF NOT EXISTS "full_cylinders_tenantId_productId_date_key" ON "full_cylinders"("tenantId", "productId", "date");

-- Create empty_cylinders table if not exists
CREATE TABLE IF NOT EXISTS "empty_cylinders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantityInHand" INTEGER NOT NULL DEFAULT 0,
    "quantityWithDrivers" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empty_cylinders_pkey" PRIMARY KEY ("id")
);

-- Create indexes for empty_cylinders
CREATE INDEX IF NOT EXISTS "empty_cylinders_tenantId_idx" ON "empty_cylinders"("tenantId");
CREATE INDEX IF NOT EXISTS "empty_cylinders_date_idx" ON "empty_cylinders"("date");
CREATE INDEX IF NOT EXISTS "empty_cylinders_cylinderSizeId_idx" ON "empty_cylinders"("cylinderSizeId");
CREATE UNIQUE INDEX IF NOT EXISTS "empty_cylinders_tenantId_cylinderSizeId_date_key" ON "empty_cylinders"("tenantId", "cylinderSizeId", "date");

-- Create inventory_asset_values table if not exists
CREATE TABLE IF NOT EXISTS "inventory_asset_values" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "unitValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_asset_values_pkey" PRIMARY KEY ("id")
);

-- Create indexes for inventory_asset_values
CREATE INDEX IF NOT EXISTS "inventory_asset_values_tenantId_idx" ON "inventory_asset_values"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_asset_values_tenantId_assetType_key" ON "inventory_asset_values"("tenantId", "assetType");

-- Create cylinder_receivables_by_size table if not exists
CREATE TABLE IF NOT EXISTS "cylinder_receivables_by_size" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "receivableRecordId" TEXT NOT NULL,
    "cylinderSizeId" TEXT NOT NULL,
    "cylinderReceivables" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cylinder_receivables_by_size_pkey" PRIMARY KEY ("id")
);

-- Create indexes for cylinder_receivables_by_size
CREATE INDEX IF NOT EXISTS "cylinder_receivables_by_size_tenantId_idx" ON "cylinder_receivables_by_size"("tenantId");
CREATE INDEX IF NOT EXISTS "cylinder_receivables_by_size_cylinderSizeId_idx" ON "cylinder_receivables_by_size"("cylinderSizeId");
CREATE UNIQUE INDEX IF NOT EXISTS "cylinder_receivables_by_size_receivableRecordId_cylinderSiz_key" ON "cylinder_receivables_by_size"("receivableRecordId", "cylinderSizeId");

-- Add foreign key constraints with error handling
DO $$
BEGIN
    -- Add foreign key for driver_cylinder_size_baselines -> tenants
    BEGIN
        ALTER TABLE "driver_cylinder_size_baselines" 
        ADD CONSTRAINT "driver_cylinder_size_baselines_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign key for driver_cylinder_size_baselines -> drivers  
    BEGIN
        ALTER TABLE "driver_cylinder_size_baselines" 
        ADD CONSTRAINT "driver_cylinder_size_baselines_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign key for driver_cylinder_size_baselines -> cylinder_sizes
    BEGIN
        ALTER TABLE "driver_cylinder_size_baselines" 
        ADD CONSTRAINT "driver_cylinder_size_baselines_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign keys for full_cylinders
    BEGIN
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_companyId_fkey" 
        FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign keys for empty_cylinders
    BEGIN
        ALTER TABLE "empty_cylinders" 
        ADD CONSTRAINT "empty_cylinders_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "empty_cylinders" 
        ADD CONSTRAINT "empty_cylinders_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign keys for inventory_asset_values
    BEGIN
        ALTER TABLE "inventory_asset_values" 
        ADD CONSTRAINT "inventory_asset_values_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    -- Add foreign keys for cylinder_receivables_by_size
    BEGIN
        ALTER TABLE "cylinder_receivables_by_size" 
        ADD CONSTRAINT "cylinder_receivables_by_size_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "cylinder_receivables_by_size" 
        ADD CONSTRAINT "cylinder_receivables_by_size_receivableRecordId_fkey" 
        FOREIGN KEY ("receivableRecordId") REFERENCES "receivable_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE "cylinder_receivables_by_size" 
        ADD CONSTRAINT "cylinder_receivables_by_size_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

END $$;

-- Update any existing records to set default values for new columns
UPDATE users SET "onboardingCompleted" = false WHERE "onboardingCompleted" IS NULL;
UPDATE inventory_records SET "emptyCylinderReceivables" = 0 WHERE "emptyCylinderReceivables" IS NULL;