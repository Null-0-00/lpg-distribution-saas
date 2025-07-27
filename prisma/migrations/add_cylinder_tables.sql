-- Add Full Cylinders and Empty Cylinders tables for consistent inventory tracking
-- Migration: add_cylinder_tables

-- Step 1: Create Full Cylinders table (পূর্ণ সিলিন্ডার)
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "full_cylinders_pkey" PRIMARY KEY ("id")
)

-- Step 2: Create Empty Cylinders table (খালি সিলিন্ডার)
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empty_cylinders_pkey" PRIMARY KEY ("id")
)

-- Step 3: Add foreign key constraints for full_cylinders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'full_cylinders_tenantId_fkey') THEN
        ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'full_cylinders_productId_fkey') THEN
        ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'full_cylinders_companyId_fkey') THEN
        ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'full_cylinders_cylinderSizeId_fkey') THEN
        ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

-- Step 4: Add foreign key constraints for empty_cylinders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'empty_cylinders_tenantId_fkey') THEN
        ALTER TABLE "empty_cylinders" ADD CONSTRAINT "empty_cylinders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'empty_cylinders_cylinderSizeId_fkey') THEN
        ALTER TABLE "empty_cylinders" ADD CONSTRAINT "empty_cylinders_cylinderSizeId_fkey" FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$

-- Step 5: Add unique constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'full_cylinders_tenantId_productId_date_key') THEN
        ALTER TABLE "full_cylinders" ADD CONSTRAINT "full_cylinders_tenantId_productId_date_key" UNIQUE ("tenantId", "productId", "date");
    END IF;
END $$

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'empty_cylinders_tenantId_cylinderSizeId_date_key') THEN
        ALTER TABLE "empty_cylinders" ADD CONSTRAINT "empty_cylinders_tenantId_cylinderSizeId_date_key" UNIQUE ("tenantId", "cylinderSizeId", "date");
    END IF;
END $$

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS "full_cylinders_tenantId_idx" ON "full_cylinders"("tenantId")
CREATE INDEX IF NOT EXISTS "full_cylinders_date_idx" ON "full_cylinders"("date")
CREATE INDEX IF NOT EXISTS "full_cylinders_productId_idx" ON "full_cylinders"("productId")
CREATE INDEX IF NOT EXISTS "full_cylinders_companyId_idx" ON "full_cylinders"("companyId")
CREATE INDEX IF NOT EXISTS "full_cylinders_cylinderSizeId_idx" ON "full_cylinders"("cylinderSizeId")

CREATE INDEX IF NOT EXISTS "empty_cylinders_tenantId_idx" ON "empty_cylinders"("tenantId")
CREATE INDEX IF NOT EXISTS "empty_cylinders_date_idx" ON "empty_cylinders"("date")
CREATE INDEX IF NOT EXISTS "empty_cylinders_cylinderSizeId_idx" ON "empty_cylinders"("cylinderSizeId")