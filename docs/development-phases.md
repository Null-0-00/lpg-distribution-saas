# 🚀 LPG Distributor SaaS - Final Production Prompts

## **Phase 1: Foundation Setup**

### **Prompt 1: Project Architecture & Setup**
```bash
@architect @security-engineer --thinking --evidence --deep --batch --secure
```
**Prompt:**
```
Create a production-ready Next.js 14 TypeScript SaaS application for LPG distributors with:

1. Multi-tenant architecture with complete data isolation
2. Subscription-based billing system integration
3. Role-based authentication (Admin/Manager) with NextAuth.js
4. PostgreSQL database with Prisma ORM
5. Tailwind CSS with shadcn/ui components
6. Production folder structure:
   - /app (App Router)
   - /components (Reusable UI)
   - /lib (Utilities & Database)
   - /types (TypeScript definitions)
   - /hooks (Custom React hooks)

Set up environment configuration, security headers, and deployment-ready structure.
```

### **Prompt 2: Database Schema & Business Logic**
```bash
@architect @data-engineer --thinking --evidence --precise --validate --deep
```
**Prompt:**
```
Design and implement comprehensive Prisma schema for LPG business with:

ENTITIES:
- Tenant (distributor isolation)
- User (admin/manager roles)
- Company (Aygaz, Jamuna, etc.)
- Product (12L, 35L variants)
- Driver (active/inactive status)
- Sale (package/refill types, cash/credit)
- Purchase/Shipment
- Inventory (full/empty cylinders)
- Receivable (cash/cylinder)
- Asset (fixed/current)
- Liability
- ExpenseCategory
- Expense

BUSINESS RULES:
- Package sale: -1 Full Cylinder, no Empty Cylinder change
- Refill sale: -1 Full Cylinder, +1 Empty Cylinder
- Cylinder credit tracking for refills
- Multi-tenant data isolation with RLS policies

Include proper indexes, constraints, and seed data.
```

## **Phase 2: Core Sales & Inventory**

### **Prompt 3: Daily Sales System**
```bash
@fullstack-dev --thinking --compress --batch --responsive --validate
```
**Prompt:**
```
Implement complete Daily Sales module:

1. ENTER DAILY SALES PAGE:
   - Form: Driver (active only), Product, Sale Type (Package/Refill), Quantity, Unit Price, Payment Type (Cash/Credit), Discount, Cash Deposited, Cylinders Deposited
   - Today's entries table with columns: Date, Driver, Package Sales(Qty), Refill Sales(Qty), Total Sales Value, Discount, Total Cash Deposited, Total Cylinder Deposited
   - Edit/Delete functionality for today's entries only
   - Real-time inventory updates

2. DAILY SALES REPORT PAGE:
   - All drivers shown daily (even with 0 sales)
   - Columns: Driver, Package Sales(Qty), Refill Sales(Qty), Total Sales(Qty), Total Sales Value, Discount, Total Deposited, Total Cylinders Receivables, Total Receivables, Change in Receivables
   - Total row at bottom
   - Daily deposits/expenses summary below table
   - Available cash in green text at bottom

Include form validation, error handling, and mobile-responsive design.
```

### **Prompt 4: Inventory Management System**
```bash
@data-engineer @backend-dev --thinking --evidence --precise --automate --validate
```
**Prompt:**
```
Create Inventory page with exact formula implementation:

TABLE COLUMNS: Date, Package Sales(Qty), Refill Sales(Qty), Total Sales(Qty), Package Purchase, Refill Purchase, Empty Cylinders Buy/Sell, Full Cylinders, Empty Cylinders, Total Cylinders

EXACT FORMULAS:
- Package Sales = SUM(all drivers package sales for date)
- Refill Sales = SUM(all drivers refill sales for date)  
- Total Sales = Package Sales + Refill Sales
- Package Purchase = SUM(shipments.package_quantity for date)
- Refill Purchase = SUM(shipments.refill_quantity for date)
- Empty Cylinders Buy/Sell = SUM(empty_cylinder_transactions for date)
- Today's Full Cylinders = Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
- Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell
- Total Cylinders = Full Cylinders + Empty Cylinders

Create automated daily calculation service and historical tracking.
```

## **Phase 3: User & Financial Management**

### **Prompt 5: Driver & User Management**
```bash
@backend-dev @frontend-dev --thinking --compress --batch --secure
```
**Prompt:**
```
Implement comprehensive user management:

1. DRIVER MANAGEMENT:
   - Active/Inactive status with transfer functionality
   - Driver performance analytics and metrics
   - Bulk operations (activate/deactivate multiple)
   - Integration ensuring only active drivers appear in sales dropdowns

2. USER MANAGEMENT:
   - Admin/Manager role assignment
   - Multi-tenant user isolation
   - Permission-based UI rendering
   - User activity logging

Include proper authorization checks and audit trails.
```

### **Prompt 6: Receivables Tracking System**
```bash
@data-engineer @analyst --thinking --evidence --precise --validate --automate
```
**Prompt:**
```
Create Receivables system with exact calculations:

CASH RECEIVABLES FORMULAS:
- Today's Changes = driver_sales_revenue - cash_deposits - discounts
- Today's Total = Yesterday's Total + Today's Changes

CYLINDER RECEIVABLES FORMULAS:
- Today's Changes = driver_refill_sales - cylinder_deposits
- Today's Total = Yesterday's Total + Today's Changes

FEATURES:
- Driver-wise receivables summary
- Historical tracking with daily changes
- Automated calculations from sales data
- Aging analysis (30/60/90 days)
- Receivables trend charts
- Export functionality

Create automated daily calculation service and alert system for overdue amounts.
```

## **Phase 4: Advanced Financial Features**

### **Prompt 7: Assets & Liabilities Management**
```bash
@analyst @backend-dev --thinking --evidence --precise --validate --track
```
**Prompt:**
```
Build comprehensive Assets & Liabilities system:

1. ASSETS CATEGORIZATION:
   - Fixed Assets (manual entry/editing)
   - Current Assets:
     - Full Cylinders (auto from inventory)
     - Empty Cylinders (auto from inventory)  
     - Cash Receivables (auto from receivables)
     - Cylinder Receivables (auto from receivables)
     - Cash in Hand (auto calculated)

2. LIABILITIES:
   - Current Liabilities (manual entry)
   - Long-term Liabilities (manual entry)
   - Owner's Equity calculations

3. FEATURES:
   - CRUD operations for manual entries
   - Real-time auto-calculations for linked assets
   - Historical value tracking
   - Impact analysis on Balance Sheet
   - Asset depreciation calculations

Ensure all changes reflect immediately in financial reports.
```

### **Prompt 8: Expense Management System**
```bash
@backend-dev @frontend-dev --thinking --compress --batch --categorize
```
**Prompt:**
```
Create comprehensive expense tracking:

1. ADMIN FEATURES:
   - Create/Edit/Delete expense categories
   - Set category budgets and limits
   - Expense approval workflows

2. MANAGER FEATURES:
   - Daily expense entry with category selection
   - Owner drawings tracking
   - Receipt upload functionality
   - Expense history and search

3. REPORTING:
   - Monthly expense summaries by category
   - Budget vs actual analysis
   - Expense trends and patterns
   - Integration with cash flow calculations

Include expense approval workflows and budget alerts.
```

## **Phase 5: Financial Reporting & Analytics**

### **Prompt 9: Financial Reports Engine**
```bash
@analyst @backend-dev @frontend-dev --thinking --evidence --batch --export --validate
```
**Prompt:**
```
Implement comprehensive financial reporting system:

1. INCOME STATEMENT:
   - Revenue (sales by type/driver)
   - Cost of Goods Sold (cylinder purchases)
   - Operating Expenses (by category)
   - Net Income calculations
   - Monthly/Yearly comparisons

2. BALANCE SHEET:
   - Assets (auto-linked + manual)
   - Liabilities (manual entries)
   - Owner's Equity (calculated)
   - Balance validation (Assets = Liabilities + Equity)

3. CASH FLOW STATEMENT:
   - Operating Activities (sales, expenses)
   - Investing Activities (asset purchases)
   - Financing Activities (owner drawings, loans)

4. FEATURES:
   - Real-time calculations
   - Export to PDF/Excel
   - Historical comparisons
   - Visual charts and graphs
   - Email automation for monthly reports

Ensure all reports reflect real-time data changes.
```

### **Prompt 10: Purchase & Shipment Management**
```bash
@backend-dev @frontend-dev --thinking --compress --integrate --validate
```
**Prompt:**
```
Create Purchase & Shipment management:

1. SHIPMENT TRACKING:
   - Bulk cylinder purchases from companies
   - Shipment details (date, company, quantities, costs)
   - Integration with inventory formulas
   - Vendor performance tracking

2. EMPTY CYLINDER TRANSACTIONS:
   - Buy/Sell empty cylinders
   - Integration with inventory calculations
   - Pricing and profit tracking

3. FEATURES:
   - Purchase order management
   - Vendor relationship management
   - Cost analysis and trends
   - Integration with inventory and financial calculations
   - Automated inventory updates

Include proper validation and business rule enforcement.
```

## **Phase 6: Dashboard & Production Features**

### **Prompt 11: Executive Dashboard**
```bash
@frontend-dev @analyst --thinking --compress --realtime --optimize --responsive
```
**Prompt:**
```
Build comprehensive executive dashboard:

1. KEY METRICS:
   - Daily/Monthly sales performance
   - Inventory levels and turnover
   - Receivables aging and collection rates
   - Driver performance rankings
   - Financial health indicators

2. VISUAL ANALYTICS:
   - Sales trend charts
   - Inventory movement graphs
   - Receivables aging pie charts
   - Driver performance comparisons
   - Financial ratio indicators

3. REAL-TIME FEATURES:
   - Live sales updates
   - Inventory alerts (low stock)
   - Overdue receivables notifications
   - Performance KPI tracking

4. MOBILE OPTIMIZATION:
   - Responsive design for tablets/phones
   - Touch-friendly interfaces
   - Offline data viewing
   - Push notifications

Include real-time data updates and mobile-first design.
```

### **Prompt 12: Company & Product Management**
```bash
@backend-dev @frontend-dev --thinking --compress --batch --secure
```
**Prompt:**
```
Create admin-only Company & Product management:

1. COMPANY MANAGEMENT:
   - Add/Edit/Delete LPG companies (Aygaz, Jamuna, etc.)
   - Company-specific pricing and terms
   - Supplier relationship tracking

2. PRODUCT MANAGEMENT:
   - Product variants (12L, 35L, etc.) per company
   - Pricing management and updates
   - Product performance analytics

3. DISTRIBUTOR ASSIGNMENTS:
   - Assign companies/products to distributors
   - Pricing tier management
   - Territory management

Include proper admin authorization and audit logging.
```

## **Phase 7: Production & Optimization**

### **Prompt 13: Performance & Security**
```bash
@performance-engineer @security-engineer --thinking --evidence --optimize --secure --monitor
```
**Prompt:**
```
Implement production-ready optimizations:

1. PERFORMANCE:
   - Database query optimization with proper indexes
   - Caching strategy (Redis) for frequently accessed data
   - API rate limiting and throttling
   - Image optimization and CDN integration
   - Bundle optimization and code splitting

2. SECURITY:
   - Multi-tenant data isolation validation
   - Input sanitization and SQL injection prevention
   - XSS protection and CSRF tokens
   - Rate limiting and DDoS protection
   - Security headers and HTTPS enforcement
   - Data encryption at rest and in transit

3. MONITORING:
   - Application performance monitoring
   - Error tracking and alerting
   - Database performance monitoring
   - User activity logging

Include comprehensive security testing and performance benchmarks.
```

### **Prompt 14: Mobile & PWA Features**
```bash
@mobile-specialist @frontend-dev --compress --responsive --offline --touch
```
**Prompt:**
```
Optimize for mobile field operations:

1. PROGRESSIVE WEB APP:
   - Service worker for offline functionality
   - App manifest for home screen installation
   - Push notifications for important updates

2. MOBILE OPTIMIZATION:
   - Touch-friendly forms and buttons
   - Optimized layouts for small screens
   - Fast loading and minimal data usage
   - Voice input for sales entry

3. OFFLINE CAPABILITIES:
   - Local storage for critical data
   - Offline sales entry with sync
   - Cached reports and dashboards
   - Conflict resolution for data sync

Include comprehensive mobile testing and offline scenario handling.
```

### **Prompt 15: Deployment & DevOps**
```bash
@devops-engineer --thinking --evidence --deploy --monitor --backup
```
**Prompt:**
```
Set up production deployment pipeline:

1. CI/CD PIPELINE:
   - Automated testing (unit, integration, e2e)
   - Code quality checks and security scanning
   - Automated deployment to staging/production
   - Database migration automation

2. INFRASTRUCTURE:
   - Production server setup (Docker/Kubernetes)
   - Database backup and disaster recovery
   - Load balancing and auto-scaling
   - SSL certificates and domain management

3. MONITORING & MAINTENANCE:
   - Application monitoring and alerting
   - Log aggregation and analysis
   - Performance metrics tracking
   - Automated backup verification

4. SUBSCRIPTION BILLING:
   - Stripe integration for payments
   - Subscription plan management
   - Usage tracking and billing
   - Payment failure handling

Include comprehensive monitoring, backup strategies, and disaster recovery plans.
```

## **🎯 Execution Order**

Execute these prompts sequentially, waiting for each phase to complete before moving to the next. Each prompt is optimized for SuperClaude's capabilities and includes specific flags for optimal performance.

**Start with:** `Prompt 1` and proceed through `Prompt 15` for a complete, production-ready LPG distributor SaaS application.