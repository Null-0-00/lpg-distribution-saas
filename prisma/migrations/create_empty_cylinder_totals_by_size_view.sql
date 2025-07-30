-- Create view for aggregating empty cylinders by size
-- This view combines data from multiple sources to provide total empty cylinders per size

CREATE OR REPLACE VIEW empty_cylinder_totals_by_size AS
WITH 
-- Get baseline quantities from driver cylinder size baselines
driver_baselines AS (
  SELECT 
    tenant_id,
    cylinder_size_id,
    SUM(baseline_quantity) as total_baseline_with_drivers
  FROM driver_cylinder_size_baselines 
  WHERE baseline_quantity > 0
  GROUP BY tenant_id, cylinder_size_id
),

-- Get current sales-based calculations (refill sales - cylinder deposits by size)
sales_calculations AS (
  SELECT 
    s.tenant_id,
    p.cylinder_size_id,
    SUM(CASE WHEN s.sale_type = 'REFILL' THEN s.quantity ELSE 0 END) as total_refill_sales,
    SUM(s.cylinders_deposited) as total_cylinder_deposits,
    SUM(CASE WHEN s.sale_type = 'REFILL' THEN s.quantity ELSE 0 END) - SUM(s.cylinders_deposited) as net_sales_impact
  FROM sales s
  JOIN products p ON s.product_id = p.id
  WHERE p.cylinder_size_id IS NOT NULL
  GROUP BY s.tenant_id, p.cylinder_size_id
),

-- Get shipment data by size (incoming empty - outgoing empty)
shipment_calculations AS (
  SELECT 
    sh.tenant_id,
    p.cylinder_size_id,
    SUM(CASE WHEN sh.shipment_type = 'INCOMING_EMPTY' THEN sh.quantity ELSE 0 END) as incoming_empty,
    SUM(CASE WHEN sh.shipment_type = 'OUTGOING_EMPTY' THEN sh.quantity ELSE 0 END) as outgoing_empty,
    SUM(CASE WHEN sh.shipment_type IN ('INCOMING_EMPTY', 'OUTGOING_EMPTY') 
             THEN (CASE WHEN sh.shipment_type = 'INCOMING_EMPTY' THEN sh.quantity ELSE -sh.quantity END)
             ELSE 0 END) as net_shipment_impact,
    SUM(CASE WHEN sh.status IN ('PENDING', 'IN_TRANSIT') THEN sh.quantity ELSE 0 END) as outstanding_shipments
  FROM shipments sh
  JOIN products p ON sh.product_id = p.id
  WHERE p.cylinder_size_id IS NOT NULL
  GROUP BY sh.tenant_id, p.cylinder_size_id
),

-- Get empty cylinder records baseline
empty_cylinder_baselines AS (
  SELECT 
    tenant_id,
    cylinder_size_id,
    SUM(baseline_quantity) as total_onboarding_baseline
  FROM empty_cylinders
  GROUP BY tenant_id, cylinder_size_id
)

-- Final aggregation combining all sources
SELECT 
  cs.tenant_id,
  cs.id as cylinder_size_id,
  cs.size as cylinder_size_name,
  
  -- Baseline quantities
  COALESCE(db.total_baseline_with_drivers, 0) as quantity_with_drivers,
  COALESCE(ecb.total_onboarding_baseline, 0) as onboarding_baseline,
  
  -- Sales impact
  COALESCE(sc.total_refill_sales, 0) as total_refill_sales,
  COALESCE(sc.total_cylinder_deposits, 0) as total_cylinder_deposits,
  COALESCE(sc.net_sales_impact, 0) as net_sales_impact,
  
  -- Shipment impact  
  COALESCE(shc.incoming_empty, 0) as incoming_empty_shipments,
  COALESCE(shc.outgoing_empty, 0) as outgoing_empty_shipments,
  COALESCE(shc.net_shipment_impact, 0) as net_shipment_impact,
  COALESCE(shc.outstanding_shipments, 0) as outstanding_shipments,
  
  -- Calculated totals
  COALESCE(ecb.total_onboarding_baseline, 0) + 
  COALESCE(sc.net_sales_impact, 0) + 
  COALESCE(shc.net_shipment_impact, 0) - 
  COALESCE(shc.outstanding_shipments, 0) as total_quantity,
  
  -- Quantity breakdown
  COALESCE(db.total_baseline_with_drivers, 0) as quantity_with_drivers_current,
  GREATEST(0, 
    COALESCE(ecb.total_onboarding_baseline, 0) + 
    COALESCE(sc.net_sales_impact, 0) + 
    COALESCE(shc.net_shipment_impact, 0) - 
    COALESCE(shc.outstanding_shipments, 0) - 
    COALESCE(db.total_baseline_with_drivers, 0)
  ) as quantity_in_hand,
  
  -- Metadata
  CURRENT_TIMESTAMP as calculated_at

FROM cylinder_sizes cs
LEFT JOIN driver_baselines db ON cs.tenant_id = db.tenant_id AND cs.id = db.cylinder_size_id
LEFT JOIN sales_calculations sc ON cs.tenant_id = sc.tenant_id AND cs.id = sc.cylinder_size_id  
LEFT JOIN shipment_calculations shc ON cs.tenant_id = shc.tenant_id AND cs.id = shc.cylinder_size_id
LEFT JOIN empty_cylinder_baselines ecb ON cs.tenant_id = ecb.tenant_id AND cs.id = ecb.cylinder_size_id
WHERE cs.is_active = true
ORDER BY cs.tenant_id, cs.size;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_empty_cylinder_totals_tenant ON empty_cylinder_totals_by_size USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_empty_cylinder_totals_size ON empty_cylinder_totals_by_size USING btree (cylinder_size_id);