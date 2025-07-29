-- Simple Database Trigger Functions - Initial Implementation

-- Function to update current inventory summary after transaction
CREATE OR REPLACE FUNCTION update_inventory_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
    p_tenant_id TEXT;
    latest_date DATE;
BEGIN
    p_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    latest_date := COALESCE(NEW.transaction_date, OLD.transaction_date);
    
    -- Create or update current inventory summary with basic values
    INSERT INTO current_inventory_summary (
        tenant_id, 
        total_full_cylinders, 
        total_empty_cylinders,
        total_empty_cylinders_in_hand,
        total_cylinder_receivables,
        total_cash_receivables,
        total_cylinders,
        last_calculated
    )
    VALUES (
        p_tenant_id,
        100, -- Placeholder - will be calculated properly later
        50,  -- Placeholder
        30,  -- Placeholder
        20,  -- Placeholder
        0,   -- Placeholder
        150, -- Placeholder
        NOW()
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        total_full_cylinders = 100, -- These will be real calculations later
        total_empty_cylinders = 50,
        total_empty_cylinders_in_hand = 30,
        total_cylinder_receivables = 20,
        total_cylinders = 150,
        last_calculated = NOW();
    
    -- Update current size inventory with placeholder data
    INSERT INTO current_size_inventory (
        tenant_id,
        cylinder_size_id,
        full_cylinders,
        empty_cylinders,
        empty_cylinders_in_hand,
        cylinder_receivables,
        primary_company_name,
        updated_at
    )
    SELECT 
        p_tenant_id,
        cs.id,
        25, -- Placeholder
        15, -- Placeholder  
        10, -- Placeholder
        5,  -- Placeholder
        'Test Company',
        NOW()
    FROM cylinder_sizes cs
    WHERE cs.tenant_id = p_tenant_id
    ON CONFLICT (tenant_id, cylinder_size_id) DO UPDATE SET
        full_cylinders = 25,
        empty_cylinders = 15,
        empty_cylinders_in_hand = 10,
        cylinder_receivables = 5,
        updated_at = NOW();
        
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_inventory ON transaction_logs;
CREATE TRIGGER trigger_update_inventory
    AFTER INSERT OR UPDATE OR DELETE ON transaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_inventory_after_transaction();

-- Create simple views for frontend

-- View for full cylinders table
CREATE OR REPLACE VIEW full_cylinders_by_size AS
SELECT 
    csi.tenant_id,
    cs.size,
    COALESCE(csi.primary_company_name, 'Test Company') as company,
    csi.full_cylinders as quantity
FROM current_size_inventory csi
JOIN cylinder_sizes cs ON csi.cylinder_size_id = cs.id
WHERE csi.full_cylinders > 0
ORDER BY cs.size;

-- Success message
SELECT 'Simple database triggers created successfully!' as status;