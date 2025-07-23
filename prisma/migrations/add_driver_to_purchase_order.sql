-- Migration: Add driverId to purchase_orders table
-- Created at: 2025-07-15

-- Add driverId column to purchase_orders table
ALTER TABLE "purchase_orders" 
ADD COLUMN IF NOT EXISTS "driverId" TEXT;

-- Add foreign key constraint
ALTER TABLE "purchase_orders" 
ADD CONSTRAINT "purchase_orders_driverId_fkey" 
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") 
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "purchase_orders_driverId_idx" ON "purchase_orders"("driverId");

-- Update existing records to have a default driver (if any drivers exist)
-- This will be handled by the application logic
