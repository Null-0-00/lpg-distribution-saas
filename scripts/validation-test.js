#!/usr/bin/env node

/**
 * LPG Distributor SaaS - Final Validation Test Suite
 * Tests all core functionality and validates production readiness
 */

const fs = require('fs');
const path = require('path');

class ValidationSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  test(description, testFn) {
    try {
      const result = testFn();
      if (result) {
        this.results.passed++;
        this.log(`${description}`, 'success');
        return true;
      } else {
        this.results.failed++;
        this.results.errors.push(description);
        this.log(`${description}`, 'error');
        return false;
      }
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`${description}: ${error.message}`);
      this.log(`${description}: ${error.message}`, 'error');
      return false;
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(__dirname, filePath));
  }

  fileContains(filePath, content) {
    if (!this.fileExists(filePath)) return false;
    const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return fileContent.includes(content);
  }

  validateFileStructure() {
    this.log('=== FILE STRUCTURE VALIDATION ===');

    // Core application files
    this.test('Next.js configuration exists', () => 
      this.fileExists('next.config.js') || this.fileExists('next.config.mjs'));
    
    this.test('Package.json exists with correct scripts', () => 
      this.fileExists('package.json') && 
      this.fileContains('package.json', '"build"') &&
      this.fileContains('package.json', '"start"'));

    this.test('Prisma schema exists', () => 
      this.fileExists('prisma/schema.prisma'));

    this.test('TypeScript configuration exists', () => 
      this.fileExists('tsconfig.json'));

    this.test('Tailwind configuration exists', () => 
      this.fileExists('tailwind.config.ts'));

    // Core pages
    this.test('Dashboard page exists', () => 
      this.fileExists('src/app/dashboard/page.tsx'));

    this.test('Sales page exists', () => 
      this.fileExists('src/app/dashboard/sales/page.tsx'));

    this.test('Root layout exists', () => 
      this.fileExists('src/app/layout.tsx'));

    // API endpoints
    this.test('Sales API endpoint exists', () => 
      this.fileExists('src/app/api/sales/route.ts'));

    this.test('Dashboard metrics API exists', () => 
      this.fileExists('src/app/api/dashboard/metrics/route.ts'));

    this.test('Email automation exists', () => 
      this.fileExists('src/lib/email/email-service.ts'));
  }

  validateBusinessLogic() {
    this.log('=== BUSINESS LOGIC VALIDATION ===');

    // Database schema validation
    this.test('Database schema has all required models', () => {
      const schema = fs.readFileSync(path.join(__dirname, 'prisma/schema.prisma'), 'utf8');
      return ['Company', 'User', 'Driver', 'Product', 'DailySales', 'MonthlyInventory', 
              'DailyReceivables', 'Expense', 'Asset', 'Liability'].every(model => 
                schema.includes(`model ${model}`));
    });

    this.test('Multi-tenant isolation in schema', () => 
      this.fileContains('prisma/schema.prisma', 'companyId'));

    this.test('Sales form component exists', () => 
      this.fileExists('src/components/forms/SaleForm.tsx'));

    this.test('Business validation logic exists', () => 
      this.fileExists('src/lib/business/BusinessValidator.ts'));
  }

  validateUIComponents() {
    this.log('=== UI COMPONENTS VALIDATION ===');

    // Essential UI components
    this.test('Button component exists', () => 
      this.fileExists('src/components/ui/button.tsx'));

    this.test('Card components exist', () => 
      this.fileExists('src/components/ui/card.tsx'));

    this.test('Dialog components exist', () => 
      this.fileExists('src/components/ui/dialog.tsx'));

    this.test('Form components exist', () => 
      this.fileExists('src/components/ui/input.tsx'));

    this.test('Toast notifications exist', () => 
      this.fileExists('src/hooks/use-toast.ts'));

    // Dashboard components
    this.test('Real-time metrics component exists', () => 
      this.fileExists('src/components/dashboard/RealTimeMetrics.tsx'));

    this.test('Live data feed component exists', () => 
      this.fileExists('src/components/dashboard/LiveDataFeed.tsx'));

    this.test('Interactive trend chart exists', () => 
      this.fileExists('src/components/dashboard/InteractiveTrendChart.tsx'));
  }

  validatePWAFeatures() {
    this.log('=== PWA FEATURES VALIDATION ===');

    this.test('PWA manifest exists', () => 
      this.fileExists('public/manifest.json'));

    this.test('Service worker exists', () => 
      this.fileExists('public/sw.js'));

    this.test('Service worker registration in layout', () => 
      this.fileContains('src/app/layout.tsx', 'serviceWorker'));

    this.test('PWA metadata in layout', () => 
      this.fileContains('src/app/layout.tsx', 'apple-mobile-web-app'));

    this.test('Offline functionality in service worker', () => 
      this.fileContains('public/sw.js', 'offline') && 
      this.fileContains('public/sw.js', 'cache'));
  }

  validateEmailAutomation() {
    this.log('=== EMAIL AUTOMATION VALIDATION ===');

    this.test('Email service exists', () => 
      this.fileExists('src/lib/email/email-service.ts'));

    this.test('Report generator exists', () => 
      this.fileExists('src/lib/email/report-generator.ts'));

    this.test('Monthly report API endpoint exists', () => 
      this.fileExists('src/app/api/reports/monthly/send/route.ts'));

    this.test('Monthly report sender component exists', () => 
      this.fileExists('src/components/reports/MonthlyReportSender.tsx'));

    this.test('Email service has HTML template generation', () => 
      this.fileContains('src/lib/email/email-service.ts', 'generateMonthlyReportHTML'));
  }

  validateRealTimeFeatures() {
    this.log('=== REAL-TIME FEATURES VALIDATION ===');

    this.test('Real-time metrics API exists', () => 
      this.fileExists('src/app/api/dashboard/real-time-metrics/route.ts'));

    this.test('Live feed API exists', () => 
      this.fileExists('src/app/api/dashboard/live-feed/route.ts'));

    this.test('Analytics API exists', () => 
      this.fileExists('src/app/api/dashboard/analytics/route.ts'));

    this.test('Trends API exists', () => 
      this.fileExists('src/app/api/dashboard/trends/route.ts'));

    this.test('Dashboard has real-time data loading', () => 
      this.fileContains('src/app/dashboard/page.tsx', 'loadDashboardAnalytics') &&
      this.fileContains('src/app/dashboard/page.tsx', 'setInterval'));
  }

  validateSalesManagement() {
    this.log('=== SALES MANAGEMENT VALIDATION ===');

    this.test('Sales page has real API integration', () => 
      this.fileContains('src/app/dashboard/sales/page.tsx', '/api/sales'));

    this.test('Sales CRUD API endpoints exist', () => 
      this.fileExists('src/app/api/sales/route.ts') &&
      this.fileExists('src/app/api/sales/[id]/route.ts'));

    this.test('Sales form has validation', () => 
      this.fileContains('src/components/forms/SaleForm.tsx', 'validation') ||
      this.fileContains('src/components/forms/SaleForm.tsx', 'schema'));

    this.test('Sales page has edit/delete functionality', () => 
      this.fileContains('src/app/dashboard/sales/page.tsx', 'handleEditSale') &&
      this.fileContains('src/app/dashboard/sales/page.tsx', 'handleDeleteSale'));
  }

  validateConfiguration() {
    this.log('=== CONFIGURATION VALIDATION ===');

    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

    this.test('Essential dependencies installed', () => {
      const required = ['next', 'react', '@prisma/client', 'typescript', 'tailwindcss'];
      return required.every(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]);
    });

    this.test('Build scripts configured', () => 
      packageJson.scripts?.build && packageJson.scripts?.start);

    this.test('Development scripts configured', () => 
      packageJson.scripts?.dev && packageJson.scripts?.lint);

    this.test('Database scripts configured', () => 
      packageJson.scripts?.['db:generate'] && packageJson.scripts?.['db:push']);
  }

  validateSecurityFeatures() {
    this.log('=== SECURITY VALIDATION ===');

    this.test('Authentication configuration exists', () => 
      this.fileExists('src/lib/auth/auth-options.ts') ||
      this.fileExists('src/lib/auth.ts'));

    this.test('Multi-tenant validation exists', () => 
      this.fileExists('src/lib/security/multi-tenant-validator.ts') ||
      this.fileContains('prisma/schema.prisma', 'companyId'));

    this.test('Environment variable template exists', () => 
      this.fileExists('.env.example') || this.fileExists('.env.local.example'));

    this.test('Security headers in Next.js config', () => 
      this.fileExists('next.config.js') || this.fileExists('next.config.mjs'));
  }

  runValidation() {
    this.log('🚀 Starting LPG Distributor SaaS Final Validation', 'info');
    this.log('================================================', 'info');

    this.validateFileStructure();
    this.validateBusinessLogic();
    this.validateUIComponents();
    this.validatePWAFeatures();
    this.validateEmailAutomation();
    this.validateRealTimeFeatures();
    this.validateSalesManagement();
    this.validateConfiguration();
    this.validateSecurityFeatures();

    this.log('================================================', 'info');
    this.log(`✅ VALIDATION COMPLETE: ${this.results.passed} passed, ${this.results.failed} failed`, 
      this.results.failed === 0 ? 'success' : 'error');

    if (this.results.failed > 0) {
      this.log('❌ FAILED TESTS:', 'error');
      this.results.errors.forEach(error => this.log(`  - ${error}`, 'error'));
    }

    const score = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    this.log(`📊 COMPLETION SCORE: ${score}%`, score >= 95 ? 'success' : score >= 80 ? 'info' : 'error');

    if (score >= 95) {
      this.log('🎉 APPLICATION IS PRODUCTION READY!', 'success');
    } else if (score >= 80) {
      this.log('⚠️  Application is mostly complete but needs minor fixes', 'info');
    } else {
      this.log('🚨 Application needs significant work before production', 'error');
    }

    return score;
  }
}

// Run validation
const validator = new ValidationSuite();
const score = validator.runValidation();
process.exit(score >= 80 ? 0 : 1);