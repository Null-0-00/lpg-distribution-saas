-- Performance indexes for LPG Distributor SaaS
-- Run these in your database to improve query performance

-- Index for receivable records (used heavily in cylinder summary)
CREATE INDEX IF NOT EXISTS idx_receivable_records_tenant_driver_date 
ON "receivable_records" ("tenantId", "driverId", "date" DESC);

-- Index for inventory records queries
CREATE INDEX IF NOT EXISTS idx_inventory_records_tenant_date 
ON "inventory_records" ("tenantId", "date" DESC);

-- Index for products queries
CREATE INDEX IF NOT EXISTS idx_products_tenant_active 
ON "products" ("tenantId", "isActive");

-- Index for inventory movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant_product_date 
ON "inventory_movements" ("tenantId", "productId", "date" DESC);

-- Index for sales queries
CREATE INDEX IF NOT EXISTS idx_sales_tenant_driver_type 
ON "sales" ("tenantId", "driverId", "saleType");

-- Index for driver queries
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_status_type 
ON "drivers" ("tenantId", "status", "driverType");

-- Index for driver cylinder size baseline
CREATE INDEX IF NOT EXISTS idx_driver_cylinder_baseline_tenant_driver 
ON "driver_cylinder_size_baselines" ("tenantId", "driverId");

-- Composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_receivable_records_latest 
ON "receivable_records" ("tenantId", "driverId") 
INCLUDE ("totalCylinderReceivables", "date");

-- Print completion message
SELECT 'Performance indexes created successfully' as status;