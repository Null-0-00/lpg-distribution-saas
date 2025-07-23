# Source Tree Structure - LPG Distributor SaaS

## Overview

This document provides a comprehensive overview of the LPG Distributor SaaS source code organization, explaining the purpose and structure of each directory and key files. The project follows Next.js 14 App Router conventions with additional organizational patterns for enterprise-scale applications.

## Root Directory Structure

```
lpg-distributor-saas/
├── 📄 README.md                    # Project documentation and setup instructions
├── 📄 package.json                 # Dependencies, scripts, and project metadata
├── 📄 package-lock.json            # Locked dependency versions for reproducible builds
├── 📄 next.config.js               # Next.js configuration and build settings
├── 📄 tailwind.config.ts           # Tailwind CSS configuration and theme
├── 📄 tsconfig.json                # TypeScript compiler configuration
├── 📄 jest.setup.js                # Jest testing framework setup
├── 📄 eslint.config.mjs            # ESLint linting rules and configuration
├── 📄 postcss.config.mjs           # PostCSS configuration for CSS processing
├── 📄 babel.config.js              # Babel transpilation configuration
├── 📄 Dockerfile                   # Docker containerization configuration
├── 📄 PRD.md                       # Product Requirements Document
├── 📄 CLAUDE.md                    # Development workflow and guidelines
├── 📁 .github/                     # GitHub workflows and templates
├── 📁 .bmad-core/                  # BMad development system configuration
├── 📁 .cursor/                     # Cursor IDE configuration
├── 📁 .claude/                     # Claude AI assistant configuration
├── 📁 docs/                        # Project documentation
├── 📁 public/                      # Static assets and PWA files
├── 📁 src/                         # Source code (main application)
├── 📁 prisma/                      # Database schema and migrations
├── 📁 scripts/                     # Build, deployment, and utility scripts
├── 📁 tests/                       # Test files and fixtures
└── 📁 k8s/                         # Kubernetes deployment configurations
```

## Source Code Structure (`src/`)

The `src/` directory contains all application source code, organized by feature and layer:

```
src/
├── 📁 app/                         # Next.js App Router pages and API routes
│   ├── 📁 (admin)/                # Admin-only pages with route groups
│   ├── 📁 api/                     # Backend API endpoints
│   ├── 📁 auth/                    # Authentication pages
│   ├── 📁 dashboard/               # Main application dashboard
│   ├── 📄 favicon.ico              # Application favicon
│   ├── 📄 globals.css              # Global CSS styles and Tailwind imports
│   ├── 📄 layout.tsx               # Root layout component
│   └── 📄 page.tsx                 # Landing page component
├── 📁 components/                  # Reusable React components
│   ├── 📁 ui/                      # Base UI components (shadcn/ui)
│   ├── 📁 forms/                   # Form components
│   ├── 📁 tables/                  # Data table components
│   ├── 📁 charts/                  # Chart and visualization components
│   ├── 📁 dashboard/               # Dashboard-specific components
│   ├── 📁 expenses/                # Expense management components
│   ├── 📁 reports/                 # Reporting components
│   ├── 📁 mobile/                  # Mobile-specific components
│   ├── 📁 admin/                   # Admin panel components
│   ├── 📁 layout/                  # Layout and navigation components
│   └── 📁 providers/               # React context providers
├── 📁 lib/                         # Business logic and utilities
│   ├── 📁 auth/                    # Authentication logic
│   ├── 📁 business/                # Core business logic
│   ├── 📁 database/                # Database client and utilities
│   ├── 📁 security/                # Security utilities
│   ├── 📁 utils/                   # Helper functions and utilities
│   ├── 📁 services/                # External services and APIs
│   ├── 📁 monitoring/              # Application monitoring
│   ├── 📁 email/                   # Email service integration
│   ├── 📁 cache/                   # Caching strategies
│   ├── 📁 offline/                 # Offline functionality
│   ├── 📁 pwa/                     # Progressive Web App features
│   ├── 📁 testing/                 # Testing utilities
│   ├── 📁 i18n/                    # Internationalization
│   ├── 📁 optimization/            # Performance optimization
│   ├── 📁 validations/             # Validation schemas
│   └── 📄 prisma.ts                # Prisma client configuration
├── 📁 types/                       # TypeScript type definitions
│   ├── 📁 api/                     # API request/response types
│   ├── 📁 business/                # Business domain types
│   ├── 📁 database/                # Database model types
│   ├── 📁 ui/                      # UI component types
│   ├── 📄 auth.ts                  # Authentication types
│   ├── 📄 settings.ts              # Application settings types
│   └── 📄 next-auth.d.ts           # NextAuth.js type extensions
├── 📁 hooks/                       # Custom React hooks
├── 📁 contexts/                    # React context definitions
├── 📁 providers/                   # Top-level providers
├── 📄 middleware.ts                # Next.js middleware for security and routing
└── 📄 auth.ts                      # Authentication configuration
```

## Detailed Directory Breakdown

### App Router Structure (`src/app/`)

The App Router follows Next.js 14 conventions with additional organizational patterns:

```
app/
├── 📁 (admin)/                     # Route group for admin-only access
│   └── 📁 admin/
│       ├── 📄 layout.tsx           # Admin layout with navigation
│       ├── 📄 page.tsx             # Admin dashboard
│       ├── 📁 companies/           # Company management
│       ├── 📁 products/            # Product management
│       └── 📁 distributor-assignments/  # Distributor assignments
├── 📁 api/                         # Backend API endpoints
│   ├── 📁 admin/                   # Admin-only API endpoints
│   │   ├── 📁 companies/           # Company management APIs
│   │   ├── 📁 products/            # Product management APIs
│   │   └── 📁 distributor-assignments/  # Assignment APIs
│   ├── 📁 auth/                    # Authentication endpoints
│   │   ├── 📁 [...nextauth]/       # NextAuth.js handler
│   │   ├── 📁 register/            # User registration
│   │   └── 📁 session/             # Session management
│   ├── 📁 sales/                   # Sales management APIs
│   │   ├── 📄 route.ts             # CRUD operations for sales
│   │   ├── 📁 [id]/                # Individual sale operations
│   │   ├── 📁 daily-summary/       # Daily sales summaries
│   │   └── 📁 bulk-delete/         # Bulk operations
│   ├── 📁 inventory/               # Inventory management APIs
│   │   ├── 📄 route.ts             # Inventory calculations
│   │   ├── 📁 daily/               # Daily inventory reports
│   │   ├── 📁 alerts/              # Low stock alerts
│   │   └── 📁 movements/           # Inventory movement tracking
│   ├── 📁 drivers/                 # Driver management APIs
│   ├── 📁 receivables/             # Receivables tracking APIs
│   ├── 📁 assets/                  # Asset management APIs
│   ├── 📁 liabilities/             # Liability management APIs
│   ├── 📁 expenses/                # Expense management APIs
│   ├── 📁 financial-reports/       # Financial reporting APIs
│   ├── 📁 purchase-orders/         # Purchase order management
│   ├── 📁 shipments/               # Shipment tracking
│   └── 📁 dashboard/               # Dashboard analytics
├── 📁 auth/                        # Authentication pages
│   ├── 📄 layout.tsx               # Auth layout (centered forms)
│   ├── 📁 login/                   # Login page and variations
│   └── 📁 register/                # Registration page
└── 📁 dashboard/                   # Main application interface
    ├── 📄 layout.tsx               # Dashboard layout with navigation
    ├── 📄 page.tsx                 # Executive dashboard
    ├── 📁 sales/                   # Sales management interface
    ├── 📁 inventory/               # Inventory management interface
    ├── 📁 drivers/                 # Driver management interface
    ├── 📁 receivables/             # Receivables management interface
    ├── 📁 assets/                  # Asset management interface
    ├── 📁 expenses/                # Expense management interface
    ├── 📁 reports/                 # Reporting interface
    ├── 📁 purchase-orders/         # Purchase order management
    ├── 📁 shipments/               # Shipment management
    ├── 📁 users/                   # User management
    ├── 📁 settings/                # Application settings
    └── 📁 admin/                   # Admin-specific dashboards
```

### Component Organization (`src/components/`)

Components are organized by functionality and reusability:

```
components/
├── 📁 ui/                          # Base UI components (shadcn/ui based)
│   ├── 📄 button.tsx               # Button component with variants
│   ├── 📄 input.tsx                # Form input component
│   ├── 📄 select.tsx               # Select dropdown component
│   ├── 📄 card.tsx                 # Card layout component
│   ├── 📄 dialog.tsx               # Modal dialog component
│   ├── 📄 table.tsx                # Data table component
│   ├── 📄 alert.tsx                # Alert notification component
│   ├── 📄 badge.tsx                # Status badge component
│   ├── 📄 tabs.tsx                 # Tab navigation component
│   ├── 📄 toast.tsx                # Toast notification component
│   ├── 📄 skeleton.tsx             # Loading skeleton component
│   ├── 📄 progress.tsx             # Progress indicator component
│   ├── 📄 sheet.tsx                # Side panel component
│   ├── 📄 drawer.tsx               # Mobile drawer component
│   ├── 📄 separator.tsx            # Visual separator component
│   ├── 📄 scroll-area.tsx          # Custom scrollbar component
│   ├── 📄 mobile-optimized.tsx     # Mobile optimization utilities
│   ├── 📄 ClientTime.tsx           # Client-side time display
│   ├── 📄 ThemeToggle.tsx          # Dark/light theme toggle
│   └── 📄 ErrorBoundary.tsx        # Error boundary component
├── 📁 forms/                       # Form components
│   ├── 📄 SaleForm.tsx             # Sales entry form
│   ├── 📄 CombinedSaleForm.tsx     # Advanced sales form
│   ├── 📄 AddDriverForm.tsx        # Driver creation form
│   └── 📄 PurchaseOrderForm.tsx    # Purchase order form
├── 📁 tables/                      # Data table components
│   └── 📄 SalesTable.tsx           # Sales data table with pagination
├── 📁 charts/                      # Chart and visualization components
│   └── 📁 [various chart components for analytics]
├── 📁 dashboard/                   # Dashboard-specific components
│   ├── 📄 RealTimeMetrics.tsx      # Live KPI display
│   ├── 📄 InventoryOverview.tsx    # Inventory status overview
│   ├── 📄 InventoryAlerts.tsx      # Low stock notifications
│   ├── 📄 LiveDataFeed.tsx         # Real-time activity feed
│   ├── 📄 InteractiveTrendChart.tsx # Interactive analytics charts
│   ├── 📄 kpi-cards.tsx           # KPI metric cards
│   ├── 📄 kpi-tracker.tsx         # KPI tracking component
│   ├── 📄 analytics-charts.tsx    # Business analytics charts
│   ├── 📄 mobile-dashboard.tsx    # Mobile-optimized dashboard
│   ├── 📄 offline-indicator.tsx   # Offline status indicator
│   ├── 📄 progress-indicator.tsx  # Progress tracking
│   └── 📄 real-time-notifications.tsx # Push notifications
├── 📁 expenses/                    # Expense management components
│   ├── 📄 ExpenseHeader.tsx        # Expense page header
│   ├── 📄 ExpenseTable.tsx         # Expense data table
│   ├── 📄 ExpenseFilters.tsx       # Expense filtering controls
│   ├── 📄 ExpenseStatCards.tsx     # Expense statistics cards
│   ├── 📄 ExpensePagination.tsx    # Pagination controls
│   ├── 📄 CategoryManagement.tsx   # Category management
│   ├── 📄 MonthNavigation.tsx      # Month selector
│   ├── 📄 ErrorBoundary.tsx        # Expense-specific error handling
│   ├── 📁 forms/                   # Expense-related forms
│   │   ├── 📄 ExpenseForm.tsx      # Expense entry form
│   │   └── 📄 CategoryForm.tsx     # Category creation form
│   └── 📁 optimized/               # Performance-optimized components
│       ├── 📄 MemoizedExpenseHeader.tsx
│       ├── 📄 MemoizedExpenseTable.tsx
│       └── 📄 MemoizedExpenseStatCards.tsx
├── 📁 reports/                     # Reporting components
│   └── 📄 MonthlyReportSender.tsx  # Automated report generation
├── 📁 mobile/                      # Mobile-specific components
│   ├── 📄 MobileTestSuite.tsx      # Mobile testing components
│   ├── 📄 OfflineDashboard.tsx     # Offline mode dashboard
│   └── 📄 OfflineSalesForm.tsx     # Offline sales entry
├── 📁 admin/                       # Admin panel components
│   └── 📄 AdminNavigation.tsx      # Admin navigation sidebar
├── 📁 layout/                      # Layout and navigation components
│   └── 📁 [navigation and layout components]
└── 📁 providers/                   # React context providers
    └── 📄 SessionProvider.tsx      # Authentication session provider
```

### Business Logic Layer (`src/lib/`)

The business logic layer contains core functionality and utilities:

```
lib/
├── 📁 auth/                        # Authentication and authorization
│   ├── 📄 index.ts                 # Auth utilities export
│   ├── 📄 config.ts                # Auth configuration
│   └── 📄 auth-options.ts          # NextAuth.js configuration
├── 📁 business/                    # Core business logic
│   ├── 📄 index.ts                 # Business logic exports
│   ├── 📄 inventory.ts             # Inventory calculation logic
│   ├── 📄 receivables.ts           # Receivables calculation logic
│   ├── 📄 validation.ts            # Business rule validation
│   ├── 📄 BusinessValidator.ts     # Validation class
│   ├── 📁 drivers/                 # Driver management logic
│   ├── 📁 sales/                   # Sales processing logic
│   ├── 📁 inventory/               # Advanced inventory logic
│   └── 📁 financial/               # Financial calculations
├── 📁 database/                    # Database utilities
│   ├── 📄 client.ts                # Database client configuration
│   └── 📄 query-optimizer.ts       # Database query optimization
├── 📁 security/                    # Security utilities
│   ├── 📄 encryption.ts            # Data encryption utilities
│   ├── 📄 input-sanitizer.ts       # Input sanitization
│   ├── 📄 multi-tenant-validator.ts # Tenant isolation validation
│   ├── 📄 rate-limiter.ts          # API rate limiting
│   ├── 📄 https-enforcer.ts        # HTTPS enforcement
│   └── 📄 xss-csrf-protection.ts   # XSS and CSRF protection
├── 📁 utils/                       # Helper functions and utilities
│   ├── 📄 index.ts                 # Utility functions export
│   ├── 📄 constants.ts             # Application constants
│   ├── 📄 formatters.ts            # Data formatting utilities
│   ├── 📄 validators.ts            # Input validation utilities
│   └── 📄 expense.ts               # Expense-specific utilities
├── 📁 services/                    # External services and APIs
│   ├── 📄 fallback-data.ts         # Fallback data service
│   └── 📁 __tests__/               # Service tests
│       └── 📄 fallback-data.test.ts
├── 📁 monitoring/                  # Application monitoring
│   ├── 📄 performance-monitor.ts   # Performance tracking
│   ├── 📄 error-tracker.ts         # Error logging and tracking
│   └── 📄 alerting-system.ts       # Alert management
├── 📁 email/                       # Email service integration
│   ├── 📄 email-service.ts         # Email sending service
│   └── 📄 report-generator.ts      # Automated report emails
├── 📁 cache/                       # Caching strategies
│   ├── 📄 cache-strategies.ts      # Caching implementations
│   └── 📄 redis-client.ts          # Redis client configuration
├── 📁 offline/                     # Offline functionality
│   ├── 📄 storage.ts               # Local storage management
│   └── 📄 sync.ts                  # Data synchronization
├── 📁 pwa/                         # Progressive Web App features
│   └── 📄 push-notifications.ts    # Push notification service
├── 📁 testing/                     # Testing utilities
│   └── 📄 security-tests.ts        # Security testing utilities
├── 📁 i18n/                        # Internationalization
│   └── 📄 translations.ts          # Translation management
├── 📁 optimization/                # Performance optimization
│   └── 📁 [optimization utilities]
├── 📁 validations/                 # Validation schemas
│   └── 📄 expense.ts               # Expense validation schemas
├── 📄 audit-logger.ts              # Audit trail logging
├── 📄 admin-auth.ts                # Admin authentication
├── 📄 offline-storage.ts           # Offline storage utilities
└── 📄 prisma.ts                    # Prisma client singleton
```

### Type Definitions (`src/types/`)

TypeScript type definitions organized by domain:

```
types/
├── 📁 api/                         # API request/response types
│   └── 📁 [API endpoint types]
├── 📁 business/                    # Business domain types
│   ├── 📄 inventory.ts             # Inventory-related types
│   └── 📄 sales.ts                 # Sales-related types
├── 📁 database/                    # Database model types
│   └── 📁 [Prisma-generated types]
├── 📁 ui/                          # UI component types
│   └── 📁 [Component prop types]
├── 📄 auth.ts                      # Authentication types
├── 📄 settings.ts                  # Application settings types
└── 📄 next-auth.d.ts               # NextAuth.js type extensions
```

### Custom Hooks (`src/hooks/`)

Reusable React hooks for state management and business logic:

```
hooks/
├── 📄 use-toast.ts                 # Toast notification hook
├── 📄 use-debounce.ts              # Input debouncing hook
├── 📄 usePWA.ts                    # Progressive Web App hook
├── 📄 useFormatter.ts              # Data formatting hook
├── 📄 useCategories.ts             # Category management hook
├── 📄 useExpenses.ts               # Expense management hook
├── 📄 useExpenseFilters.ts         # Expense filtering hook
├── 📄 useExpensePagination.ts      # Expense pagination hook
├── 📄 useDailySalesData.ts         # Daily sales data hook
└── 📄 useDriverPerformance.ts      # Driver performance analytics hook
```

## External Configuration and Assets

### Public Assets (`public/`)

Static assets served directly by the web server:

```
public/
├── 📄 manifest.json                # PWA manifest file
├── 📄 sw.js                        # Service worker for PWA
├── 📄 next.svg                     # Next.js logo
├── 📄 vercel.svg                   # Vercel logo
├── 📄 file.svg                     # File icon
├── 📄 globe.svg                    # Globe icon
└── 📄 window.svg                   # Window icon
```

### Database Schema (`prisma/`)

Database schema and migration files:

```
prisma/
├── 📄 schema.prisma                # Database schema definition
├── 📄 seed.ts                      # Database seeding script
├── 📁 migrations/                  # Database migration history
│   ├── 📁 20250715154628_init/     # Initial migration
│   │   └── 📄 migration.sql
│   ├── 📄 add_driver_to_purchase_order.sql
│   ├── 📄 add_performance_indexes.sql
│   └── 📄 migration_lock.toml
```

### Scripts (`scripts/`)

Build, deployment, and utility scripts:

```
scripts/
├── 📄 bug-check.js                 # Bug detection script
├── 📄 validation-test.js           # Validation testing script
├── 📄 create-permissions.js        # Permission setup script
├── 📄 create-test-user.js          # Test user creation script
├── 📄 docker-entrypoint.sh         # Docker container entrypoint
├── 📄 health-check.sh              # Health check script
├── 📁 build/                       # Build-related scripts
├── 📁 database/                    # Database utility scripts
├── 📁 deployment/                  # Deployment scripts
└── 📁 maintenance/                 # Maintenance scripts
```

### Documentation (`docs/`)

Comprehensive project documentation:

```
docs/
├── 📄 development-phases.md        # Development roadmap and phases
├── 📄 disaster-recovery-plan.md    # Business continuity planning
├── 📁 api/                         # API documentation
├── 📁 business/                    # Business logic documentation
├── 📁 development/                 # Development guides
├── 📁 user/                        # User documentation
└── 📁 architecture/                # Architecture documentation
    ├── 📄 coding-standards.md      # Coding standards and practices
    ├── 📄 tech-stack.md            # Technology stack overview
    └── 📄 source-tree.md           # This document
```

### Testing (`tests/`)

Test organization and fixtures:

```
tests/
├── 📁 unit/                        # Unit tests
├── 📁 integration/                 # Integration tests
├── 📁 e2e/                         # End-to-end tests
├── 📁 fixtures/                    # Test data fixtures
├── 📁 mocks/                       # Mock implementations
└── 📁 setup/                       # Test setup and utilities
```

### Deployment (`k8s/`)

Kubernetes deployment configurations:

```
k8s/
├── 📄 namespace.yaml               # Kubernetes namespace
└── 📁 production/                  # Production deployment configs
    ├── 📄 database.yaml            # Database deployment
    ├── 📄 deployment.yaml          # Application deployment
    ├── 📄 logging.yaml             # Logging configuration
    ├── 📄 monitoring.yaml          # Monitoring setup
    ├── 📄 redis.yaml               # Redis deployment
    └── 📄 ssl-certificates.yaml    # SSL certificate management
```

## File Naming Conventions

### Consistency Rules
- **React Components**: PascalCase (e.g., `SaleForm.tsx`, `InventoryOverview.tsx`)
- **Utility Files**: camelCase (e.g., `inventory.ts`, `businessValidator.ts`)
- **API Routes**: kebab-case directories with `route.ts` files
- **Configuration Files**: kebab-case (e.g., `next.config.js`, `tailwind.config.ts`)
- **Documentation**: kebab-case (e.g., `coding-standards.md`, `tech-stack.md`)

### File Extensions
- **TypeScript Files**: `.ts` for utilities, `.tsx` for React components
- **Configuration**: `.js`, `.mjs`, or `.ts` based on requirements
- **Styling**: `.css` for stylesheets
- **Documentation**: `.md` for Markdown files

## Import Path Conventions

### Path Aliases
The project uses TypeScript path aliases for clean imports:

```typescript
// ✅ Using path aliases
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { InventoryCalculator } from '@/lib/business';

// ❌ Relative imports (avoid)
import { auth } from '../../../lib/auth';
import { Button } from '../../components/ui/button';
```

### Import Organization
Imports are organized in a specific order:
1. External library imports
2. Internal imports (using path aliases)
3. Type-only imports
4. Relative imports (when necessary)

## Architecture Patterns

### Layered Architecture
1. **Presentation Layer**: React components and pages (`src/app/`, `src/components/`)
2. **Business Logic Layer**: Business rules and calculations (`src/lib/business/`)
3. **Data Access Layer**: Database operations and ORM (`src/lib/database/`, `prisma/`)
4. **Infrastructure Layer**: Security, monitoring, caching (`src/lib/security/`, `src/lib/monitoring/`)

### Design Patterns Used
- **Repository Pattern**: Database access abstraction
- **Factory Pattern**: Component and service creation
- **Observer Pattern**: Real-time updates and notifications
- **Strategy Pattern**: Multiple business calculation strategies
- **Decorator Pattern**: Middleware and authentication

## Key Architectural Decisions

### Multi-tenant Architecture
- **Row-Level Security**: All database queries include tenant isolation
- **Middleware Enforcement**: Authentication and authorization at the route level
- **Data Isolation**: Complete separation of tenant data

### Type Safety
- **End-to-End Types**: From database to UI components
- **Schema Validation**: Runtime validation with compile-time types
- **Business Logic Types**: Domain-specific type definitions

### Performance Optimizations
- **Code Splitting**: Automatic and manual code splitting strategies
- **Caching**: Multiple levels of caching (browser, API, database)
- **Lazy Loading**: Component and data lazy loading
- **Database Optimization**: Proper indexing and query optimization

## Conclusion

This source tree structure provides a scalable, maintainable, and well-organized foundation for the LPG Distributor SaaS platform. The organization follows industry best practices while accommodating the specific needs of a multi-tenant business application.

The structure supports:
- **Developer Productivity**: Clear organization and conventions
- **Scalability**: Modular architecture that grows with the application
- **Maintainability**: Separation of concerns and clear dependencies
- **Testing**: Organized test structure and utilities
- **Documentation**: Comprehensive documentation at all levels

Regular reviews and refactoring ensure the source tree remains optimal as the application evolves.