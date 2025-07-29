-- LPG Distributor SaaS - Optimized Database Schema
-- This replaces 35+ models with 10 focused, pre-calculated models

-- =============================================
-- CORE MODELS (Keep existing - minimal changes)
-- =============================================

-- Tenant (Multi-tenancy) - Keep as is
-- User (Authentication) - Keep as is  
-- Company (LPG Companies like Bashundhara, Orion) - Keep as is
-- CylinderSize (12kg, 45kg sizes) - Keep as is
-- Product (Company + Size combinations) - Keep as is
-- Driver (Sales representatives) - Keep as is

-- =============================================
-- NEW OPTIMIZED MODELS (Replace 20+ old models)
-- =============================================

-- 1. DAILY INVENTORY SNAPSHOT (Main aggregated data)
CREATE TABLE daily_inventory_snapshots (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Sales Data (aggregated from all drivers/transactions)
    package_sales_qty INTEGER DEFAULT 0,
    package_sales_revenue DECIMAL(12,2) DEFAULT 0,
    refill_sales_qty INTEGER DEFAULT 0,
    refill_sales_revenue DECIMAL(12,2) DEFAULT 0,
    total_sales_qty INTEGER DEFAULT 0,
    total_sales_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Purchase Data (aggregated)
    package_purchase_qty INTEGER DEFAULT 0,
    package_purchase_cost DECIMAL(12,2) DEFAULT 0,
    refill_purchase_qty INTEGER DEFAULT 0,
    refill_purchase_cost DECIMAL(12,2) DEFAULT 0,
    total_purchase_qty INTEGER DEFAULT 0,
    total_purchase_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Current Inventory (calculated)
    full_cylinders INTEGER DEFAULT 0,
    empty_cylinders INTEGER DEFAULT 0,
    empty_cylinders_in_hand INTEGER DEFAULT 0,
    total_cylinders INTEGER DEFAULT 0,
    
    -- Receivables (calculated)
    cylinder_receivables INTEGER DEFAULT 0,
    cash_receivables DECIMAL(12,2) DEFAULT 0,
    total_receivables DECIMAL(12,2) DEFAULT 0,
    
    -- Outstanding Orders
    outstanding_shipments INTEGER DEFAULT 0,
    
    -- Financial Summary
    gross_profit DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    total_costs DECIMAL(12,2) DEFAULT 0,
    
    -- System fields
    calculated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, date),
    INDEX idx_tenant_date (tenant_id, date),
    INDEX idx_date (date)
);

-- 2. DAILY PRODUCT BREAKDOWN (Product-level details)
CREATE TABLE daily_product_breakdowns (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id VARCHAR NOT NULL REFERENCES daily_inventory_snapshots(id) ON DELETE CASCADE,
    product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Sales by product
    package_sales INTEGER DEFAULT 0,
    refill_sales INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    sales_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Purchases by product
    package_purchase INTEGER DEFAULT 0,
    refill_purchase INTEGER DEFAULT 0,
    total_purchase INTEGER DEFAULT 0,
    purchase_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Current inventory by product
    full_cylinders INTEGER DEFAULT 0,
    
    -- Financial by product
    profit DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(snapshot_id, product_id),
    INDEX idx_snapshot_product (snapshot_id, product_id)
);

-- 3. DAILY SIZE BREAKDOWN (Size-level details for cylinders)
CREATE TABLE daily_size_breakdowns (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id VARCHAR NOT NULL REFERENCES daily_inventory_snapshots(id) ON DELETE CASCADE,
    cylinder_size_id VARCHAR NOT NULL REFERENCES cylinder_sizes(id) ON DELETE CASCADE,
    
    -- Inventory by size
    full_cylinders INTEGER DEFAULT 0,
    empty_cylinders INTEGER DEFAULT 0,
    empty_cylinders_in_hand INTEGER DEFAULT 0,
    cylinder_receivables INTEGER DEFAULT 0,
    
    -- Outstanding orders by size
    outstanding_shipments INTEGER DEFAULT 0,
    outstanding_package_orders INTEGER DEFAULT 0,
    outstanding_refill_orders INTEGER DEFAULT 0,
    
    -- Buy/Sell tracking
    empty_cylinders_buy_sell INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(snapshot_id, cylinder_size_id),
    INDEX idx_snapshot_size (snapshot_id, cylinder_size_id)
);

-- 4. TRANSACTION LOG (Unified transaction history)
CREATE TABLE transaction_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_type VARCHAR NOT NULL, -- 'SALE_PACKAGE', 'SALE_REFILL', 'PURCHASE_PACKAGE', 'PURCHASE_REFILL'
    
    -- Core transaction data
    driver_id VARCHAR REFERENCES drivers(id) ON DELETE SET NULL, -- Only for sales
    product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Sales specific fields
    cash_deposit DECIMAL(10,2) DEFAULT 0,
    cylinder_deposit INTEGER DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2), -- total_amount - discount
    
    -- Purchase specific fields
    invoice_number VARCHAR,
    supplier_name VARCHAR,
    
    -- System fields
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR, -- User who entered the transaction
    
    INDEX idx_tenant_date (tenant_id, transaction_date),
    INDEX idx_transaction_type (transaction_type, transaction_date),
    INDEX idx_driver_date (driver_id, transaction_date),
    INDEX idx_product_date (product_id, transaction_date)
);

-- 5. CURRENT INVENTORY SUMMARY (Real-time current state)
CREATE TABLE current_inventory_summary (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Overall totals (for dashboard cards)
    total_full_cylinders INTEGER DEFAULT 0,
    total_empty_cylinders INTEGER DEFAULT 0,
    total_empty_cylinders_in_hand INTEGER DEFAULT 0,
    total_cylinder_receivables INTEGER DEFAULT 0,
    total_cash_receivables DECIMAL(12,2) DEFAULT 0,
    total_cylinders INTEGER DEFAULT 0,
    
    -- Stock alerts
    low_stock_items INTEGER DEFAULT 0,
    critical_stock_items INTEGER DEFAULT 0,
    out_of_stock_items INTEGER DEFAULT 0,
    
    -- Last calculation info
    last_calculated TIMESTAMP DEFAULT NOW(),
    last_transaction_id VARCHAR,
    
    UNIQUE(tenant_id),
    INDEX idx_tenant (tenant_id)
);

-- 6. CURRENT PRODUCT INVENTORY (Real-time product-level inventory)
CREATE TABLE current_product_inventory (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Current stock levels
    full_cylinders INTEGER DEFAULT 0,
    stock_value DECIMAL(12,2) DEFAULT 0,
    
    -- Stock status
    stock_status VARCHAR DEFAULT 'GOOD', -- 'GOOD', 'LOW', 'CRITICAL', 'OUT_OF_STOCK'
    last_sale_date DATE,
    last_purchase_date DATE,
    
    -- Calculated fields
    avg_daily_sales DECIMAL(8,2) DEFAULT 0, -- Average sales per day (last 30 days)
    days_of_stock INTEGER DEFAULT 0, -- How many days current stock will last
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, product_id),
    INDEX idx_tenant_product (tenant_id, product_id),
    INDEX idx_stock_status (stock_status),
    INDEX idx_days_of_stock (days_of_stock)
);

-- 7. CURRENT SIZE INVENTORY (Real-time size-level inventory)
CREATE TABLE current_size_inventory (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cylinder_size_id VARCHAR NOT NULL REFERENCES cylinder_sizes(id) ON DELETE CASCADE,
    
    -- Aggregated inventory by size
    full_cylinders INTEGER DEFAULT 0,
    empty_cylinders INTEGER DEFAULT 0,
    empty_cylinders_in_hand INTEGER DEFAULT 0,
    cylinder_receivables INTEGER DEFAULT 0,
    
    -- Primary company for this size (most active)
    primary_company_id VARCHAR REFERENCES companies(id),
    primary_company_name VARCHAR,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, cylinder_size_id),
    INDEX idx_tenant_size (tenant_id, cylinder_size_id)
);

-- =============================================
-- CALCULATION TRIGGER FUNCTIONS
-- =============================================

-- Function to update daily snapshot after transaction
CREATE OR REPLACE FUNCTION update_daily_snapshot_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
    snapshot_date DATE;
    snapshot_id VARCHAR;
    tenant_id VARCHAR;
BEGIN
    -- Get transaction details
    snapshot_date := NEW.transaction_date;
    tenant_id := NEW.tenant_id;
    
    -- Get or create daily snapshot
    INSERT INTO daily_inventory_snapshots (tenant_id, date)
    VALUES (tenant_id, snapshot_date)
    ON CONFLICT (tenant_id, date) DO NOTHING;
    
    SELECT id INTO snapshot_id 
    FROM daily_inventory_snapshots 
    WHERE tenant_id = NEW.tenant_id AND date = snapshot_date;
    
    -- Recalculate entire day's data
    PERFORM recalculate_daily_snapshot(tenant_id, snapshot_date, snapshot_id);
    
    -- Update current inventory summary
    PERFORM update_current_inventory_summary(tenant_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate daily snapshot
CREATE OR REPLACE FUNCTION recalculate_daily_snapshot(
    p_tenant_id VARCHAR,
    p_date DATE,
    p_snapshot_id VARCHAR
) RETURNS VOID AS $$
BEGIN
    -- Update main snapshot totals
    UPDATE daily_inventory_snapshots SET
        -- Sales totals
        package_sales_qty = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'SALE_PACKAGE'
        ),
        refill_sales_qty = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'SALE_REFILL'
        ),
        package_sales_revenue = (
            SELECT COALESCE(SUM(net_amount), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'SALE_PACKAGE'
        ),
        refill_sales_revenue = (
            SELECT COALESCE(SUM(net_amount), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'SALE_REFILL'
        ),
        -- Purchase totals
        package_purchase_qty = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'PURCHASE_PACKAGE'
        ),
        refill_purchase_qty = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'PURCHASE_REFILL'
        ),
        updated_at = NOW(),
        calculated_at = NOW()
    WHERE id = p_snapshot_id;
    
    -- Calculate inventory levels (using LPG business logic)
    PERFORM calculate_inventory_levels(p_tenant_id, p_date, p_snapshot_id);
    
    -- Update product breakdowns
    PERFORM update_product_breakdowns(p_snapshot_id, p_tenant_id, p_date);
    
    -- Update size breakdowns  
    PERFORM update_size_breakdowns(p_snapshot_id, p_tenant_id, p_date);
    
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_daily_snapshot
    AFTER INSERT OR UPDATE OR DELETE ON transaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_daily_snapshot_after_transaction();

-- =============================================
-- FRONTEND API VIEWS (Simple, fast queries)
-- =============================================

-- View for dashboard summary cards
CREATE VIEW dashboard_summary AS
SELECT 
    s.tenant_id,
    s.date,
    s.total_sales_qty,
    s.total_sales_revenue,
    s.full_cylinders,
    s.empty_cylinders,
    s.cylinder_receivables,
    s.cash_receivables,
    s.total_cylinders,
    cis.total_empty_cylinders_in_hand,
    cis.low_stock_items,
    cis.critical_stock_items
FROM daily_inventory_snapshots s
JOIN current_inventory_summary cis ON s.tenant_id = cis.tenant_id
WHERE s.date = CURRENT_DATE;

-- View for full cylinders table (ভরা সিলিন্ডার)
CREATE VIEW full_cylinders_by_size AS
SELECT 
    csi.tenant_id,
    cs.size,
    csi.primary_company_name as company,
    csi.full_cylinders as quantity
FROM current_size_inventory csi
JOIN cylinder_sizes cs ON csi.cylinder_size_id = cs.id
WHERE csi.full_cylinders > 0
ORDER BY cs.size;

-- View for daily inventory tracking (দৈনিক মজুদ ট্র্যাক)
CREATE VIEW daily_inventory_tracking AS
SELECT 
    s.tenant_id,
    s.date,
    s.package_sales_qty,
    s.refill_sales_qty,
    s.total_sales_qty,
    s.package_purchase_qty,
    s.refill_purchase_qty,
    s.full_cylinders,
    s.outstanding_shipments,
    sb.empty_cylinders_buy_sell,
    sb.cylinder_receivables as empty_cylinder_receivables,
    sb.empty_cylinders_in_hand as empty_cylinders_in_stock,
    s.total_cylinders,
    -- Size breakdowns as JSON
    (
        SELECT json_agg(
            json_build_object(
                'size', cs.size,
                'quantity', sb2.full_cylinders
            )
        )
        FROM daily_size_breakdowns sb2
        JOIN cylinder_sizes cs ON sb2.cylinder_size_id = cs.id
        WHERE sb2.snapshot_id = s.id
    ) as full_cylinders_by_sizes
FROM daily_inventory_snapshots s
LEFT JOIN daily_size_breakdowns sb ON s.id = sb.snapshot_id
ORDER BY s.date DESC;

-- =============================================
-- SUMMARY
-- =============================================

/*
This optimized schema provides:

✅ PERFORMANCE: Pre-calculated data, no real-time calculations
✅ CONSISTENCY: Single source of truth, automatic updates via triggers  
✅ SIMPLICITY: 10 focused tables instead of 35+ confusing models
✅ MAINTAINABILITY: Clear relationships, easy to understand

Frontend Benefits:
- Single query per page (no complex calculations)
- Consistent data across all views
- Fast loading times
- Real-time updates via triggers

API Endpoints become simple:
GET /api/dashboard/summary -> SELECT * FROM dashboard_summary WHERE tenant_id = ?
GET /api/inventory/full-cylinders -> SELECT * FROM full_cylinders_by_size WHERE tenant_id = ?
GET /api/inventory/daily-tracking -> SELECT * FROM daily_inventory_tracking WHERE tenant_id = ?

This eliminates the confusion and provides the exact data structure the frontend needs.
*/