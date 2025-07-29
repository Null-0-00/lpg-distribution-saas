-- Database Trigger Functions for Automatic Inventory Calculations
-- These functions will automatically update all related tables when transactions are created

-- =============================================
-- CORE CALCULATION FUNCTIONS
-- =============================================

-- Function to update daily snapshot after transaction
CREATE OR REPLACE FUNCTION update_daily_snapshot_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
    snapshot_date DATE;
    snapshot_id TEXT;
    p_tenant_id TEXT;
BEGIN
    -- Get transaction details
    snapshot_date := COALESCE(NEW.transaction_date, OLD.transaction_date);
    p_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    
    -- Get or create daily snapshot
    INSERT INTO daily_inventory_snapshots (tenant_id, date)
    VALUES (p_tenant_id, snapshot_date)
    ON CONFLICT (tenant_id, date) DO NOTHING;
    
    SELECT id INTO snapshot_id 
    FROM daily_inventory_snapshots 
    WHERE tenant_id = p_tenant_id AND date = snapshot_date;
    
    -- Recalculate entire day's data
    PERFORM recalculate_daily_snapshot(p_tenant_id, snapshot_date, snapshot_id);
    
    -- Update current inventory summary
    PERFORM update_current_inventory_summary(p_tenant_id);
    
    -- Update current size inventory
    PERFORM update_current_size_inventory(p_tenant_id);
    
    -- Update current product inventory
    PERFORM update_current_product_inventory(p_tenant_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate daily snapshot
CREATE OR REPLACE FUNCTION recalculate_daily_snapshot(
    p_tenant_id TEXT,
    p_date DATE,
    p_snapshot_id TEXT
) RETURNS VOID AS $$
DECLARE
    prev_snapshot RECORD;
    prev_date DATE;
BEGIN
    -- Get previous day's snapshot for inventory calculations
    prev_date := p_date - INTERVAL '1 day';
    SELECT * INTO prev_snapshot 
    FROM daily_inventory_snapshots 
    WHERE tenant_id = p_tenant_id AND date = prev_date;
    
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
            SELECT COALESCE(SUM(COALESCE(net_amount, total_amount)), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'SALE_PACKAGE'
        ),
        refill_sales_revenue = (
            SELECT COALESCE(SUM(COALESCE(net_amount, total_amount)), 0) 
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
        package_purchase_cost = (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'PURCHASE_PACKAGE'
        ),
        refill_purchase_cost = (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM transaction_logs 
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date 
            AND transaction_type = 'PURCHASE_REFILL'
        ),
        updated_at = NOW(),
        calculated_at = NOW()
    WHERE id = p_snapshot_id;
    
    -- Calculate inventory levels using LPG business logic
    PERFORM calculate_inventory_levels(p_tenant_id, p_date, p_snapshot_id, prev_snapshot);
    
    -- Update product breakdowns
    PERFORM update_product_breakdowns(p_snapshot_id, p_tenant_id, p_date);
    
    -- Update size breakdowns  
    PERFORM update_size_breakdowns(p_snapshot_id, p_tenant_id, p_date);
    
END;
$$ LANGUAGE plpgsql;

-- Function to calculate inventory levels using LPG business logic
CREATE OR REPLACE FUNCTION calculate_inventory_levels(
    p_tenant_id TEXT,
    p_date DATE,
    p_snapshot_id TEXT,
    prev_snapshot RECORD
) RETURNS VOID AS $$
DECLARE
    current_snapshot RECORD;
    calculated_full_cylinders INT;
    calculated_empty_cylinders INT;
    calculated_cylinder_receivables INT;
BEGIN
    -- Get current day's transaction totals
    SELECT * INTO current_snapshot
    FROM daily_inventory_snapshots
    WHERE id = p_snapshot_id;
    
    -- LPG Business Logic Calculations:
    -- Today's Full Cylinders = Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
    calculated_full_cylinders := COALESCE(prev_snapshot.full_cylinders, 0) 
                                + current_snapshot.package_purchase_qty 
                                + current_snapshot.refill_purchase_qty 
                                - (current_snapshot.package_sales_qty + current_snapshot.refill_sales_qty);
    
    -- Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinder Buy/Sell
    calculated_empty_cylinders := COALESCE(prev_snapshot.empty_cylinders, 0) 
                                + current_snapshot.refill_sales_qty;
    
    -- Cylinder Receivables = Package Sales (drivers owe empty cylinders back)
    calculated_cylinder_receivables := COALESCE(prev_snapshot.cylinder_receivables, 0)
                                     + current_snapshot.package_sales_qty
                                     - (
                                        SELECT COALESCE(SUM(cylinder_deposit), 0)
                                        FROM transaction_logs
                                        WHERE tenant_id = p_tenant_id 
                                        AND transaction_date = p_date
                                        AND transaction_type IN ('SALE_PACKAGE', 'SALE_REFILL')
                                     );
    
    -- Ensure non-negative values
    calculated_full_cylinders := GREATEST(calculated_full_cylinders, 0);
    calculated_empty_cylinders := GREATEST(calculated_empty_cylinders, 0);
    calculated_cylinder_receivables := GREATEST(calculated_cylinder_receivables, 0);
    
    -- Update snapshot with calculated inventory
    UPDATE daily_inventory_snapshots SET
        full_cylinders = calculated_full_cylinders,
        empty_cylinders = calculated_empty_cylinders,
        empty_cylinders_in_hand = calculated_empty_cylinders - calculated_cylinder_receivables,
        total_cylinders = calculated_full_cylinders + calculated_empty_cylinders,
        cylinder_receivables = calculated_cylinder_receivables,
        cash_receivables = (
            SELECT COALESCE(SUM(total_amount - COALESCE(cash_deposit, 0)), 0)
            FROM transaction_logs
            WHERE tenant_id = p_tenant_id 
            AND transaction_date = p_date
            AND transaction_type IN ('SALE_PACKAGE', 'SALE_REFILL')
        ),
        total_sales_qty = package_sales_qty + refill_sales_qty,
        total_sales_revenue = package_sales_revenue + refill_sales_revenue,
        total_purchase_qty = package_purchase_qty + refill_purchase_qty,
        total_purchase_cost = package_purchase_cost + refill_purchase_cost,
        gross_profit = (package_sales_revenue + refill_sales_revenue) - (package_purchase_cost + refill_purchase_cost),
        net_profit = (package_sales_revenue + refill_sales_revenue) - (package_purchase_cost + refill_purchase_cost)
    WHERE id = p_snapshot_id;
    
END;
$$ LANGUAGE plpgsql;

-- Function to update product breakdowns
CREATE OR REPLACE FUNCTION update_product_breakdowns(
    p_snapshot_id TEXT,
    p_tenant_id TEXT, 
    p_date DATE
) RETURNS VOID AS $$
BEGIN
    -- Clear existing breakdowns
    DELETE FROM daily_product_breakdowns WHERE snapshot_id = p_snapshot_id;
    
    -- Insert product breakdowns
    INSERT INTO daily_product_breakdowns (
        snapshot_id, product_id, package_sales, refill_sales, total_sales, sales_revenue,
        package_purchase, refill_purchase, total_purchase, purchase_cost, full_cylinders, profit
    )
    SELECT 
        p_snapshot_id,
        p.id,
        COALESCE(sales.package_qty, 0),
        COALESCE(sales.refill_qty, 0),
        COALESCE(sales.package_qty, 0) + COALESCE(sales.refill_qty, 0),
        COALESCE(sales.total_revenue, 0),
        COALESCE(purchases.package_qty, 0),
        COALESCE(purchases.refill_qty, 0),
        COALESCE(purchases.package_qty, 0) + COALESCE(purchases.refill_qty, 0),
        COALESCE(purchases.total_cost, 0),
        GREATEST(COALESCE(purchases.package_qty, 0) + COALESCE(purchases.refill_qty, 0) - COALESCE(sales.package_qty, 0) - COALESCE(sales.refill_qty, 0), 0),
        COALESCE(sales.total_revenue, 0) - COALESCE(purchases.total_cost, 0)
    FROM products p
    LEFT JOIN (
        SELECT 
            product_id,
            SUM(CASE WHEN transaction_type = 'SALE_PACKAGE' THEN quantity ELSE 0 END) as package_qty,
            SUM(CASE WHEN transaction_type = 'SALE_REFILL' THEN quantity ELSE 0 END) as refill_qty,
            SUM(COALESCE(net_amount, total_amount)) as total_revenue
        FROM transaction_logs
        WHERE tenant_id = p_tenant_id 
        AND transaction_date = p_date
        AND transaction_type IN ('SALE_PACKAGE', 'SALE_REFILL')
        GROUP BY product_id
    ) sales ON p.id = sales.product_id
    LEFT JOIN (
        SELECT 
            product_id,
            SUM(CASE WHEN transaction_type = 'PURCHASE_PACKAGE' THEN quantity ELSE 0 END) as package_qty,
            SUM(CASE WHEN transaction_type = 'PURCHASE_REFILL' THEN quantity ELSE 0 END) as refill_qty,
            SUM(total_amount) as total_cost
        FROM transaction_logs
        WHERE tenant_id = p_tenant_id 
        AND transaction_date = p_date
        AND transaction_type IN ('PURCHASE_PACKAGE', 'PURCHASE_REFILL')
        GROUP BY product_id
    ) purchases ON p.id = purchases.product_id
    WHERE p.tenant_id = p_tenant_id
    AND (sales.product_id IS NOT NULL OR purchases.product_id IS NOT NULL);
    
END;
$$ LANGUAGE plpgsql;

-- Function to update size breakdowns
CREATE OR REPLACE FUNCTION update_size_breakdowns(
    p_snapshot_id TEXT,
    p_tenant_id TEXT,
    p_date DATE
) RETURNS VOID AS $$
BEGIN
    -- Clear existing breakdowns
    DELETE FROM daily_size_breakdowns WHERE snapshot_id = p_snapshot_id;
    
    -- Insert size breakdowns (aggregate by cylinder size)
    INSERT INTO daily_size_breakdowns (
        snapshot_id, cylinder_size_id, full_cylinders, empty_cylinders, 
        empty_cylinders_in_hand, cylinder_receivables, empty_cylinders_buy_sell
    )
    SELECT 
        p_snapshot_id,
        cs.id,
        COALESCE(inventory.full_cylinders, 0),
        COALESCE(inventory.empty_cylinders, 0),
        GREATEST(COALESCE(inventory.empty_cylinders, 0) - COALESCE(inventory.cylinder_receivables, 0), 0),
        COALESCE(inventory.cylinder_receivables, 0),
        0 -- empty_cylinders_buy_sell calculation would need specific business logic
    FROM cylinder_sizes cs
    LEFT JOIN (
        SELECT 
            p.cylinder_size_id,
            SUM(CASE WHEN tl.transaction_type IN ('PURCHASE_PACKAGE', 'PURCHASE_REFILL') THEN tl.quantity ELSE 0 END) -
            SUM(CASE WHEN tl.transaction_type IN ('SALE_PACKAGE', 'SALE_REFILL') THEN tl.quantity ELSE 0 END) as full_cylinders,
            SUM(CASE WHEN tl.transaction_type = 'SALE_REFILL' THEN tl.quantity ELSE 0 END) as empty_cylinders,
            SUM(CASE WHEN tl.transaction_type = 'SALE_PACKAGE' THEN tl.quantity ELSE 0 END) as cylinder_receivables
        FROM transaction_logs tl
        JOIN products p ON tl.product_id = p.id
        WHERE tl.tenant_id = p_tenant_id 
        AND tl.transaction_date = p_date
        GROUP BY p.cylinder_size_id
    ) inventory ON cs.id = inventory.cylinder_size_id
    WHERE cs.tenant_id = p_tenant_id;
    
END;
$$ LANGUAGE plpgsql;

-- Function to update current inventory summary
CREATE OR REPLACE FUNCTION update_current_inventory_summary(p_tenant_id TEXT)
RETURNS VOID AS $$
DECLARE
    latest_snapshot RECORD;
BEGIN
    -- Get latest snapshot
    SELECT * INTO latest_snapshot
    FROM daily_inventory_snapshots
    WHERE tenant_id = p_tenant_id
    ORDER BY date DESC
    LIMIT 1;
    
    -- Update or create current inventory summary
    INSERT INTO current_inventory_summary (
        tenant_id, total_full_cylinders, total_empty_cylinders, 
        total_empty_cylinders_in_hand, total_cylinder_receivables,
        total_cash_receivables, total_cylinders, last_calculated
    )
    VALUES (
        p_tenant_id,
        COALESCE(latest_snapshot.full_cylinders, 0),
        COALESCE(latest_snapshot.empty_cylinders, 0),
        COALESCE(latest_snapshot.empty_cylinders_in_hand, 0),
        COALESCE(latest_snapshot.cylinder_receivables, 0),
        COALESCE(latest_snapshot.cash_receivables, 0),
        COALESCE(latest_snapshot.total_cylinders, 0),
        NOW()
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        total_full_cylinders = EXCLUDED.total_full_cylinders,
        total_empty_cylinders = EXCLUDED.total_empty_cylinders,
        total_empty_cylinders_in_hand = EXCLUDED.total_empty_cylinders_in_hand,
        total_cylinder_receivables = EXCLUDED.total_cylinder_receivables,
        total_cash_receivables = EXCLUDED.total_cash_receivables,
        total_cylinders = EXCLUDED.total_cylinders,
        last_calculated = NOW();
        
END;
$$ LANGUAGE plpgsql;

-- Function to update current size inventory
CREATE OR REPLACE FUNCTION update_current_size_inventory(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update current size inventory from latest size breakdowns
    INSERT INTO current_size_inventory (
        tenant_id, cylinder_size_id, full_cylinders, empty_cylinders,
        empty_cylinders_in_hand, cylinder_receivables, primary_company_name, updated_at
    )
    SELECT 
        p_tenant_id,
        dsb.cylinder_size_id,
        dsb.full_cylinders,
        dsb.empty_cylinders,
        dsb.empty_cylinders_in_hand,
        dsb.cylinder_receivables,
        (
            SELECT c.name
            FROM products p
            JOIN companies c ON p.company_id = c.id
            WHERE p.cylinder_size_id = dsb.cylinder_size_id
            AND p.tenant_id = p_tenant_id
            LIMIT 1
        ),
        NOW()
    FROM daily_size_breakdowns dsb
    JOIN daily_inventory_snapshots dis ON dsb.snapshot_id = dis.id
    WHERE dis.tenant_id = p_tenant_id
    AND dis.date = (
        SELECT MAX(date) 
        FROM daily_inventory_snapshots 
        WHERE tenant_id = p_tenant_id
    )
    ON CONFLICT (tenant_id, cylinder_size_id) DO UPDATE SET
        full_cylinders = EXCLUDED.full_cylinders,
        empty_cylinders = EXCLUDED.empty_cylinders,
        empty_cylinders_in_hand = EXCLUDED.empty_cylinders_in_hand,
        cylinder_receivables = EXCLUDED.cylinder_receivables,
        primary_company_name = EXCLUDED.primary_company_name,
        updated_at = NOW();
        
END;
$$ LANGUAGE plpgsql;

-- Function to update current product inventory
CREATE OR REPLACE FUNCTION update_current_product_inventory(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update current product inventory from latest product breakdowns
    INSERT INTO current_product_inventory (
        tenant_id, product_id, full_cylinders, stock_value, 
        stock_status, avg_daily_sales, days_of_stock, updated_at
    )
    SELECT 
        p_tenant_id,
        dpb.product_id,
        dpb.full_cylinders,
        dpb.full_cylinders * p.current_price,
        CASE 
            WHEN dpb.full_cylinders = 0 THEN 'OUT_OF_STOCK'
            WHEN dpb.full_cylinders <= p.low_stock_threshold THEN 'CRITICAL'
            WHEN dpb.full_cylinders <= p.low_stock_threshold * 2 THEN 'LOW'
            ELSE 'GOOD'
        END,
        COALESCE(dpb.total_sales, 0),
        CASE 
            WHEN dpb.total_sales > 0 THEN dpb.full_cylinders / dpb.total_sales
            ELSE 999
        END,
        NOW()
    FROM daily_product_breakdowns dpb
    JOIN daily_inventory_snapshots dis ON dpb.snapshot_id = dis.id
    JOIN products p ON dpb.product_id = p.id
    WHERE dis.tenant_id = p_tenant_id
    AND dis.date = (
        SELECT MAX(date) 
        FROM daily_inventory_snapshots 
        WHERE tenant_id = p_tenant_id
    )
    ON CONFLICT (tenant_id, product_id) DO UPDATE SET
        full_cylinders = EXCLUDED.full_cylinders,
        stock_value = EXCLUDED.stock_value,
        stock_status = EXCLUDED.stock_status,
        avg_daily_sales = EXCLUDED.avg_daily_sales,
        days_of_stock = EXCLUDED.days_of_stock,
        updated_at = NOW();
        
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Create trigger for automatic updates after transaction changes
DROP TRIGGER IF EXISTS trigger_update_daily_snapshot ON transaction_logs;
CREATE TRIGGER trigger_update_daily_snapshot
    AFTER INSERT OR UPDATE OR DELETE ON transaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_daily_snapshot_after_transaction();

-- =============================================
-- HELPER VIEWS FOR FRONTEND
-- =============================================

-- View for dashboard summary cards
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
    cis.tenant_id,
    CURRENT_DATE as date,
    COALESCE(dis.total_sales_qty, 0) as total_sales_qty,
    COALESCE(dis.total_sales_revenue, 0) as total_sales_revenue,
    cis.total_full_cylinders as full_cylinders,
    cis.total_empty_cylinders as empty_cylinders,
    cis.total_cylinder_receivables as cylinder_receivables,
    cis.total_cash_receivables as cash_receivables,
    cis.total_cylinders,
    cis.total_empty_cylinders_in_hand,
    cis.low_stock_items,
    cis.critical_stock_items
FROM current_inventory_summary cis
LEFT JOIN daily_inventory_snapshots dis ON cis.tenant_id = dis.tenant_id AND dis.date = CURRENT_DATE;

-- View for full cylinders table (ভরা সিলিন্ডার)
CREATE OR REPLACE VIEW full_cylinders_by_size AS
SELECT 
    csi.tenant_id,
    cs.size,
    COALESCE(csi.primary_company_name, 'Unknown') as company,
    csi.full_cylinders as quantity
FROM current_size_inventory csi
JOIN cylinder_sizes cs ON csi.cylinder_size_id = cs.id
WHERE csi.full_cylinders > 0
ORDER BY cs.size;

-- View for daily inventory tracking (দৈনিক মজুদ ট্র্যাক)
CREATE OR REPLACE VIEW daily_inventory_tracking AS
SELECT 
    dis.tenant_id,
    dis.date,
    dis.package_sales_qty,
    dis.refill_sales_qty,
    dis.total_sales_qty,
    dis.package_purchase_qty,
    dis.refill_purchase_qty,
    dis.full_cylinders,
    dis.outstanding_shipments,
    COALESCE(dsb_agg.empty_cylinders_buy_sell, 0) as empty_cylinders_buy_sell,
    dis.cylinder_receivables as empty_cylinder_receivables,
    dis.empty_cylinders_in_hand as empty_cylinders_in_stock,
    dis.total_cylinders,
    -- Size breakdowns as JSON
    (
        SELECT json_agg(
            json_build_object(
                'size', cs.size,
                'quantity', dsb.full_cylinders
            )
        )
        FROM daily_size_breakdowns dsb
        JOIN cylinder_sizes cs ON dsb.cylinder_size_id = cs.id
        WHERE dsb.snapshot_id = dis.id
        AND dsb.full_cylinders > 0
    ) as full_cylinders_by_sizes
FROM daily_inventory_snapshots dis
LEFT JOIN (
    SELECT 
        snapshot_id,
        SUM(empty_cylinders_buy_sell) as empty_cylinders_buy_sell
    FROM daily_size_breakdowns
    GROUP BY snapshot_id
) dsb_agg ON dis.id = dsb_agg.snapshot_id
ORDER BY dis.date DESC;

-- Success message
SELECT 'Database trigger functions and views created successfully!' as status;