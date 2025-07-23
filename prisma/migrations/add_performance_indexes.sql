-- Performance optimization indexes for LPG Distributor SaaS
-- Generated on: $(date)

-- Composite indexes for frequently queried combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_tenant_date_driver_idx" 
ON "sales" ("tenantId", "saleDate", "driverId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_tenant_product_date_idx" 
ON "sales" ("tenantId", "productId", "saleDate");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_date_type_idx" 
ON "sales" ("saleDate", "saleType");

-- Inventory performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "inventory_records_tenant_product_date_idx" 
ON "inventory_records" ("tenantId", "productId", "date" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "inventory_movements_tenant_date_type_idx" 
ON "inventory_movements" ("tenantId", "date" DESC, "type");

-- Financial data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "receivable_records_tenant_driver_date_idx" 
ON "receivable_records" ("tenantId", "driverId", "date" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "expenses_tenant_category_date_idx" 
ON "expenses" ("tenantId", "categoryId", "expenseDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "expenses_tenant_date_approved_idx" 
ON "expenses" ("tenantId", "expenseDate" DESC, "isApproved");

-- Purchase and shipment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "purchases_tenant_company_date_idx" 
ON "purchases" ("tenantId", "companyId", "purchaseDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "shipments_tenant_company_date_idx" 
ON "shipments" ("tenantId", "companyId", "shipmentDate" DESC);

-- Admin and audit indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_tenant_user_date_idx" 
ON "audit_logs" ("tenantId", "userId", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_entity_type_date_idx" 
ON "audit_logs" ("entityType", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_logs_action_date_idx" 
ON "audit_logs" ("action", "createdAt" DESC);

-- Multi-tenant security indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_tenant_active_name_idx" 
ON "companies" ("tenantId", "isActive", "name");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_tenant_company_active_idx" 
ON "products" ("tenantId", "companyId", "isActive");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "drivers_tenant_status_idx" 
ON "drivers" ("tenantId", "status");

-- Assignment and pricing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "distributor_assignments_tenant_active_idx" 
ON "distributor_assignments" ("tenantId", "isActive", "effectiveDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "distributor_pricing_assignments_tenant_active_idx" 
ON "distributor_pricing_assignments" ("tenantId", "isActive");

-- Purchase order indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "purchase_orders_tenant_status_date_idx" 
ON "purchase_orders" ("tenantId", "status", "orderDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "purchase_orders_company_status_idx" 
ON "purchase_orders" ("companyId", "status");

-- Partial indexes for performance (only active records)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "active_companies_tenant_idx" 
ON "companies" ("tenantId") WHERE "isActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "active_products_tenant_company_idx" 
ON "products" ("tenantId", "companyId") WHERE "isActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "active_drivers_tenant_idx" 
ON "drivers" ("tenantId") WHERE "status" = 'ACTIVE';

-- Text search indexes for admin search functionality
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_name_search_idx" 
ON "companies" USING gin(to_tsvector('english', "name"));

CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_name_search_idx" 
ON "products" USING gin(to_tsvector('english', "name"));

-- JSON indexes for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_analytics_idx" 
ON "companies" USING gin("analytics") WHERE "analytics" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_performance_metrics_idx" 
ON "products" USING gin("performanceMetrics") WHERE "performanceMetrics" IS NOT NULL;

-- Dashboard performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_recent_activity_idx" 
ON "sales" ("tenantId", "createdAt" DESC) WHERE "createdAt" > NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS "expenses_recent_activity_idx" 
ON "expenses" ("tenantId", "createdAt" DESC) WHERE "createdAt" > NOW() - INTERVAL '30 days';

-- Statistics and reporting indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_monthly_stats_idx" 
ON "sales" ("tenantId", date_trunc('month', "saleDate"), "saleType");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "inventory_daily_stats_idx" 
ON "inventory_records" ("tenantId", "date", "productId");

-- Add covering indexes for common SELECT queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sales_dashboard_covering_idx" 
ON "sales" ("tenantId", "saleDate" DESC) 
INCLUDE ("driverId", "productId", "quantity", "totalValue", "saleType");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_list_covering_idx" 
ON "products" ("tenantId", "isActive", "name") 
INCLUDE ("companyId", "currentPrice", "lowStockThreshold");

-- Unique constraint performance
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "unique_tenant_email_active_users" 
ON "users" ("tenantId", "email") WHERE "isActive" = true;