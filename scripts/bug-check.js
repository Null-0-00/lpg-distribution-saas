#!/usr/bin/env node

/**
 * LPG Distributor SaaS - Comprehensive Bug Check
 * Analyzes the entire project for bugs, issues, and potential problems
 */

const fs = require('fs');
const path = require('path');

class BugChecker {
  constructor() {
    this.bugs = [];
    this.warnings = [];
    this.suggestions = [];
    this.criticalIssues = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'critical' ? '🚨' : type === 'bug' ? '🐛' : type === 'warning' ? '⚠️' : type === 'suggestion' ? '💡' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  addBug(file, line, issue, severity = 'medium') {
    this.bugs.push({ file, line, issue, severity });
  }

  addWarning(file, issue) {
    this.warnings.push({ file, issue });
  }

  addSuggestion(file, suggestion) {
    this.suggestions.push({ file, suggestion });
  }

  addCritical(file, issue) {
    this.criticalIssues.push({ file, issue });
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(__dirname, filePath));
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    } catch (error) {
      return null;
    }
  }

  checkTypeScriptErrors() {
    this.log('🔍 Checking TypeScript compilation errors...');
    
    const { execSync } = require('child_process');
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      this.log('✅ TypeScript compilation successful');
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      const lines = errorOutput.split('\n');
      
      lines.forEach(line => {
        if (line.includes('error TS')) {
          const match = line.match(/(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)/);
          if (match) {
            const [, file, lineNum, , errorCode, message] = match;
            this.addBug(file, lineNum, `${errorCode}: ${message}`, 'high');
          }
        }
      });
    }
  }

  checkLintingIssues() {
    this.log('🔍 Checking ESLint issues...');
    
    const { execSync } = require('child_process');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.log('✅ No linting issues found');
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      const lines = errorOutput.split('\n');
      
      lines.forEach(line => {
        if (line.includes('Error:') || line.includes('Warning:')) {
          const match = line.match(/(.+?):(\d+):(\d+)\s+(Error|Warning):\s+(.+)/);
          if (match) {
            const [, file, lineNum, , severity, message] = match;
            if (severity === 'Error') {
              this.addBug(file, lineNum, message, 'medium');
            } else {
              this.addWarning(file, message);
            }
          }
        }
      });
    }
  }

  checkMissingFiles() {
    this.log('🔍 Checking for missing critical files...');

    const criticalFiles = [
      '.env.example',
      'prisma/schema.prisma',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'package.json',
      'tsconfig.json'
    ];

    criticalFiles.forEach(file => {
      if (!this.fileExists(file)) {
        this.addCritical(file, 'Critical file is missing');
      }
    });
  }

  checkDependencyIssues() {
    this.log('🔍 Checking dependency issues...');

    const packageJson = this.readFile('package.json');
    if (!packageJson) {
      this.addCritical('package.json', 'Package.json file not found');
      return;
    }

    try {
      const pkg = JSON.parse(packageJson);
      
      // Check for missing peer dependencies
      if (!pkg.dependencies?.react) {
        this.addCritical('package.json', 'React dependency missing');
      }
      
      if (!pkg.dependencies?.next) {
        this.addCritical('package.json', 'Next.js dependency missing');
      }

      // Check for version conflicts
      if (pkg.dependencies?.react && pkg.dependencies?.['react-dom']) {
        const reactVersion = pkg.dependencies.react;
        const reactDomVersion = pkg.dependencies['react-dom'];
        if (reactVersion !== reactDomVersion) {
          this.addWarning('package.json', 'React and React-DOM version mismatch');
        }
      }

      // Check for security vulnerabilities in dependencies
      const vulnerableDeps = ['lodash@<4.17.21', 'axios@<0.21.1'];
      Object.keys(pkg.dependencies || {}).forEach(dep => {
        if (dep === 'lodash' && pkg.dependencies[dep].includes('^4.17.20')) {
          this.addWarning('package.json', 'Potentially vulnerable lodash version');
        }
      });

    } catch (error) {
      this.addBug('package.json', 1, 'Invalid JSON syntax');
    }
  }

  checkDatabaseSchemaIssues() {
    this.log('🔍 Checking database schema issues...');

    const schema = this.readFile('prisma/schema.prisma');
    if (!schema) {
      this.addCritical('prisma/schema.prisma', 'Database schema file missing');
      return;
    }

    // Check for missing essential models
    const requiredModels = ['Company', 'User', 'Driver', 'Product', 'DailySales'];
    requiredModels.forEach(model => {
      if (!schema.includes(`model ${model}`)) {
        this.addBug('prisma/schema.prisma', 0, `Missing essential model: ${model}`, 'high');
      }
    });

    // Check for multi-tenant isolation
    if (!schema.includes('companyId')) {
      this.addCritical('prisma/schema.prisma', 'Multi-tenant isolation (companyId) missing');
    }

    // Check for proper indexing
    if (!schema.includes('@@index')) {
      this.addWarning('prisma/schema.prisma', 'No database indexes defined - may cause performance issues');
    }

    // Check for missing relations
    if (schema.includes('model DailySales') && !schema.includes('driver   Driver')) {
      this.addBug('prisma/schema.prisma', 0, 'DailySales model missing driver relation', 'medium');
    }
  }

  checkAPIEndpointIssues() {
    this.log('🔍 Checking API endpoint issues...');

    const apiDir = 'src/app/api';
    if (!this.fileExists(apiDir)) {
      this.addCritical(apiDir, 'API directory missing');
      return;
    }

    // Check critical API endpoints
    const criticalEndpoints = [
      'src/app/api/sales/route.ts',
      'src/app/api/dashboard/metrics/route.ts'
    ];

    criticalEndpoints.forEach(endpoint => {
      if (!this.fileExists(endpoint)) {
        this.addBug(endpoint, 0, 'Critical API endpoint missing', 'high');
      } else {
        const content = this.readFile(endpoint);
        if (content) {
          // Check for proper error handling
          if (!content.includes('try') || !content.includes('catch')) {
            this.addWarning(endpoint, 'Missing error handling in API endpoint');
          }

          // Check for authentication
          if (!content.includes('session') && !content.includes('auth')) {
            this.addWarning(endpoint, 'No authentication check in API endpoint');
          }

          // Check for input validation
          if (!content.includes('validate') && !content.includes('schema')) {
            this.addSuggestion(endpoint, 'Consider adding input validation');
          }
        }
      }
    });
  }

  checkSecurityIssues() {
    this.log('🔍 Checking security issues...');

    // Check for exposed secrets
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production'
    ];

    sensitiveFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addWarning(file, 'Environment file exists - ensure it\'s not committed to git');
      }
    });

    // Check for .env.example
    if (!this.fileExists('.env.example') && !this.fileExists('.env.local.example')) {
      this.addWarning('root', 'No .env.example file found - developers won\'t know required environment variables');
    }

    // Check for hardcoded secrets
    const checkFiles = [
      'src/lib/auth/auth-options.ts',
      'src/app/api/auth/[...nextauth]/route.ts'
    ];

    checkFiles.forEach(file => {
      const content = this.readFile(file);
      if (content) {
        if (content.includes('your-secret-key-here') || content.includes('secret123')) {
          this.addCritical(file, 'Hardcoded secret key found - security risk');
        }
        
        if (content.includes('console.log') && content.includes('password')) {
          this.addBug(file, 0, 'Potential password logging in console', 'high');
        }
      }
    });
  }

  checkPerformanceIssues() {
    this.log('🔍 Checking performance issues...');

    // Check for large bundle size indicators
    const componentFiles = this.getFilesInDirectory('src/components', '.tsx');
    componentFiles.forEach(file => {
      const content = this.readFile(file);
      if (content) {
        // Check for large imports
        const importCount = (content.match(/^import/gm) || []).length;
        if (importCount > 20) {
          this.addWarning(file, `High number of imports (${importCount}) - may affect bundle size`);
        }

        // Check for inefficient re-renders
        if (content.includes('useEffect') && !content.includes('deps')) {
          this.addSuggestion(file, 'useEffect without dependency array may cause performance issues');
        }
      }
    });

    // Check for missing memoization in expensive operations
    const dashboardFile = this.readFile('src/app/dashboard/page.tsx');
    if (dashboardFile) {
      if (dashboardFile.includes('map') && !dashboardFile.includes('useMemo')) {
        this.addSuggestion('src/app/dashboard/page.tsx', 'Consider using useMemo for expensive calculations');
      }
    }
  }

  checkBusinessLogicIssues() {
    this.log('🔍 Checking business logic issues...');

    // Check sales form validation
    const salesForm = this.readFile('src/components/forms/SaleForm.tsx');
    if (salesForm) {
      if (!salesForm.includes('validation') && !salesForm.includes('schema')) {
        this.addBug('src/components/forms/SaleForm.tsx', 0, 'Sales form missing validation logic', 'medium');
      }

      // Check for proper business rules
      if (!salesForm.includes('quantity') || !salesForm.includes('price')) {
        this.addBug('src/components/forms/SaleForm.tsx', 0, 'Sales form missing essential fields', 'high');
      }
    }

    // Check business validator
    const validator = this.readFile('src/lib/business/BusinessValidator.ts');
    if (validator) {
      if (!validator.includes('validateSale')) {
        this.addBug('src/lib/business/BusinessValidator.ts', 0, 'Missing sale validation method', 'medium');
      }
    } else {
      this.addWarning('src/lib/business/BusinessValidator.ts', 'Business validation logic file missing');
    }
  }

  checkMobileCompatibility() {
    this.log('🔍 Checking mobile compatibility issues...');

    const layout = this.readFile('src/app/layout.tsx');
    if (layout) {
      if (!layout.includes('viewport')) {
        this.addWarning('src/app/layout.tsx', 'Missing viewport meta tag for mobile compatibility');
      }

      if (!layout.includes('apple-mobile-web-app')) {
        this.addWarning('src/app/layout.tsx', 'Missing Apple mobile web app meta tags');
      }
    }

    // Check PWA manifest
    const manifest = this.readFile('public/manifest.json');
    if (manifest) {
      try {
        const manifestData = JSON.parse(manifest);
        if (!manifestData.icons || manifestData.icons.length === 0) {
          this.addWarning('public/manifest.json', 'PWA manifest missing icons');
        }
        if (!manifestData.start_url) {
          this.addWarning('public/manifest.json', 'PWA manifest missing start_url');
        }
      } catch (error) {
        this.addBug('public/manifest.json', 1, 'Invalid JSON in PWA manifest');
      }
    } else {
      this.addWarning('public/manifest.json', 'PWA manifest file missing');
    }
  }

  checkDocumentationIssues() {
    this.log('🔍 Checking documentation issues...');

    const readmeFiles = ['README.md', 'docs/README.md'];
    let hasReadme = false;

    readmeFiles.forEach(file => {
      if (this.fileExists(file)) {
        hasReadme = true;
        const content = this.readFile(file);
        if (content && content.length < 500) {
          this.addWarning(file, 'README file is very short - consider adding more documentation');
        }
      }
    });

    if (!hasReadme) {
      this.addWarning('root', 'No README.md file found - add documentation for developers');
    }

    // Check for API documentation
    if (!this.fileExists('docs/api') && !this.fileExists('docs/API.md')) {
      this.addSuggestion('docs', 'Consider adding API documentation');
    }
  }

  getFilesInDirectory(dir, extension = '') {
    const files = [];
    try {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        const walk = (dirPath) => {
          const items = fs.readdirSync(dirPath);
          items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              walk(itemPath);
            } else if (!extension || item.endsWith(extension)) {
              files.push(path.relative(__dirname, itemPath));
            }
          });
        };
        walk(fullPath);
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    return files;
  }

  runBugCheck() {
    this.log('🚀 Starting Comprehensive Bug Check for LPG Distributor SaaS', 'info');
    this.log('================================================================', 'info');

    this.checkMissingFiles();
    this.checkDependencyIssues();
    this.checkTypeScriptErrors();
    this.checkLintingIssues();
    this.checkDatabaseSchemaIssues();
    this.checkAPIEndpointIssues();
    this.checkSecurityIssues();
    this.checkPerformanceIssues();
    this.checkBusinessLogicIssues();
    this.checkMobileCompatibility();
    this.checkDocumentationIssues();

    this.generateReport();
  }

  generateReport() {
    this.log('================================================================', 'info');
    this.log('🐛 BUG CHECK COMPLETE', 'info');
    
    const totalIssues = this.criticalIssues.length + this.bugs.length + this.warnings.length;
    
    if (this.criticalIssues.length > 0) {
      this.log(`🚨 CRITICAL ISSUES: ${this.criticalIssues.length}`, 'critical');
      this.criticalIssues.forEach(issue => {
        this.log(`  🚨 ${issue.file}: ${issue.issue}`, 'critical');
      });
    }

    if (this.bugs.length > 0) {
      this.log(`🐛 BUGS FOUND: ${this.bugs.length}`, 'bug');
      this.bugs.forEach(bug => {
        const severity = bug.severity === 'high' ? '🔴' : bug.severity === 'medium' ? '🟡' : '🟢';
        this.log(`  ${severity} ${bug.file}:${bug.line || '?'} - ${bug.issue}`, 'bug');
      });
    }

    if (this.warnings.length > 0) {
      this.log(`⚠️ WARNINGS: ${this.warnings.length}`, 'warning');
      this.warnings.forEach(warning => {
        this.log(`  ⚠️ ${warning.file}: ${warning.issue}`, 'warning');
      });
    }

    if (this.suggestions.length > 0) {
      this.log(`💡 SUGGESTIONS: ${this.suggestions.length}`, 'suggestion');
      this.suggestions.forEach(suggestion => {
        this.log(`  💡 ${suggestion.file}: ${suggestion.suggestion}`, 'suggestion');
      });
    }

    this.log('================================================================', 'info');
    
    if (totalIssues === 0) {
      this.log('🎉 NO ISSUES FOUND - PROJECT IS CLEAN!', 'info');
    } else {
      const healthScore = Math.max(0, 100 - (this.criticalIssues.length * 25) - (this.bugs.length * 10) - (this.warnings.length * 2));
      this.log(`📊 PROJECT HEALTH SCORE: ${healthScore}/100`, healthScore >= 80 ? 'info' : 'warning');
      
      if (this.criticalIssues.length > 0) {
        this.log('🚨 ACTION REQUIRED: Fix critical issues before deployment', 'critical');
      } else if (this.bugs.length > 0) {
        this.log('🐛 RECOMMENDATION: Fix bugs for better stability', 'warning');
      } else {
        this.log('✅ PROJECT IS STABLE: Only minor warnings found', 'info');
      }
    }

    return {
      critical: this.criticalIssues.length,
      bugs: this.bugs.length,
      warnings: this.warnings.length,
      suggestions: this.suggestions.length,
      healthScore: Math.max(0, 100 - (this.criticalIssues.length * 25) - (this.bugs.length * 10) - (this.warnings.length * 2))
    };
  }
}

// Run bug check
const bugChecker = new BugChecker();
const results = bugChecker.runBugCheck();
process.exit(results.critical > 0 ? 2 : results.bugs > 0 ? 1 : 0);