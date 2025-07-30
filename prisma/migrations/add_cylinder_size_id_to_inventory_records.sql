-- Add cylinderSizeId column to inventory_records table as a required field
-- This enables direct cylinder size tracking in inventory records

-- Step 1: Add the column as nullable first
ALTER TABLE inventory_records 
ADD COLUMN "cylinderSizeId" TEXT;

-- Step 2: Update existing records to populate cylinderSizeId from products table
UPDATE inventory_records 
SET "cylinderSizeId" = p."cylinderSizeId"
FROM products p 
WHERE inventory_records."productId" = p.id 
  AND p."cylinderSizeId" IS NOT NULL;

-- Step 3: For records without productId, we need to handle them
-- Get the first available cylinder size for records with NULL productId
UPDATE inventory_records 
SET "cylinderSizeId" = (
  SELECT id FROM cylinder_sizes 
  WHERE "tenantId" = inventory_records."tenantId" 
    AND "isActive" = true 
  ORDER BY size 
  LIMIT 1
)
WHERE "cylinderSizeId" IS NULL 
  AND "productId" IS NULL;

-- Step 4: Make the column NOT NULL
ALTER TABLE inventory_records 
ALTER COLUMN "cylinderSizeId" SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE inventory_records 
ADD CONSTRAINT "inventory_records_cylinderSizeId_fkey" 
FOREIGN KEY ("cylinderSizeId") REFERENCES cylinder_sizes(id) ON DELETE CASCADE;

-- Step 6: Update the unique constraint to include cylinderSizeId
ALTER TABLE inventory_records 
DROP CONSTRAINT IF EXISTS "inventory_records_tenantId_date_productId_key";

ALTER TABLE inventory_records 
ADD CONSTRAINT "inventory_records_tenantId_date_productId_cylinderSizeId_key" 
UNIQUE ("tenantId", "date", "productId", "cylinderSizeId");

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS "inventory_records_cylinderSizeId_idx" 
ON inventory_records("cylinderSizeId");

CREATE INDEX IF NOT EXISTS "inventory_records_tenantId_cylinderSizeId_idx" 
ON inventory_records("tenantId", "cylinderSizeId");

-- Step 8: Verify the changes
SELECT 
  COUNT(*) as total_records,
  COUNT("cylinderSizeId") as records_with_cylinder_size,
  COUNT(DISTINCT "cylinderSizeId") as unique_cylinder_sizes
FROM inventory_records;