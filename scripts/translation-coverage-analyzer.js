#!/usr/bin/env node

/**
 * Translation Coverage Analyzer
 *
 * This script analyzes translation coverage for each navigation page,
 * providing detailed insights into translation completeness and quality.
 */

const fs = require('fs');
const path = require('path');

class TranslationCoverageAnalyzer {
  constructor() {
    this.srcDir = path.join(__dirname, '../src');
    this.dashboardDir = path.join(__dirname, '../src/app/dashboard');
    this.componentsDir = path.join(__dirname, '../src/components');
    this.translationsFile = path.join(
      __dirname,
      '../src/lib/i18n/translations.ts'
    );
    this.outputDir = path.join(__dirname, '../audit-results');

    this.translationKeys = new Set();
    this.englishTranslations = new Map();
    this.bengaliTranslations = new Map();

    this.loadTranslations();

    // Navigation pages configuration
    this.navigationPages = [
      {
        name: 'Dashboard',
        path: 'dashboard',
        components: ['dashboard'],
        priority: 'high',
      },
      {
        name: 'Sales',
        path: 'dashboard/sales',
        components: ['sales'],
        priority: 'high',
      },
      {
        name: 'Analytics',
        path: 'dashboard/analytics',
        components: ['analytics'],
        priority: 'medium',
      },
      {
        name: 'Daily Sales Report',
        path: 'dashboard/reports',
        components: ['reports', 'daily-sales'],
        priority: 'high',
      },
      {
        name: 'Inventory',
        path: 'dashboard/inventory',
        components: ['inventory'],
        priority: 'high',
      },
      {
        name: 'Shipments',
        path: 'dashboard/shipments',
        components: ['shipments', 'purchase-orders'],
        priority: 'high',
      },
      {
        name: 'Drivers',
        path: 'dashboard/drivers',
        components: ['drivers'],
        priority: 'high',
      },
      {
        name: 'Users',
        path: 'dashboard/users',
        components: ['users'],
        priority: 'medium',
      },
      {
        name: 'Receivables',
        path: 'dashboard/receivables',
        components: ['receivables'],
        priority: 'medium',
      },
      {
        name: 'Assets',
        path: 'dashboard/assets',
        components: ['assets'],
        priority: 'medium',
      },
      {
        name: 'Expenses',
        path: 'dashboard/expenses',
        components: ['expenses'],
        priority: 'medium',
      },
      {
        name: 'Reports',
        path: 'dashboard/reports',
        components: ['reports'],
        priority: 'medium',
      },
      {
        name: 'Product Management',
        path: 'dashboard/product-management',
        components: ['product-management'],
        priority: 'low',
      },
      {
        name: 'Settings',
        path: 'dashboard/settings',
        components: ['settings'],
        priority: 'low',
      },
    ];
  }

  /**
   * Load translation data from the translations file
   */
  loadTranslations() {
    try {
      const content = fs.readFileSync(this.translationsFile, 'utf8');

      // Extract interface keys
      const interfaceMatch = content.match(
        /interface Translations \{([\s\S]*?)\}/
      );
      if (interfaceMatch) {
        const interfaceContent = interfaceMatch[1];
        const keyMatches = interfaceContent.match(/^\s*(\w+):\s*string;/gm);
        if (keyMatches) {
          keyMatches.forEach((match) => {
            const key = match.match(/^\s*(\w+):/)[1];
            this.translationKeys.add(key);
          });
        }
      }

      // Extract English translations
      const englishMatch = content.match(
        /const englishTranslations: Translations = \{([\s\S]*?)\};/
      );
      if (englishMatch) {
        this.parseTranslationObject(englishMatch[1], this.englishTranslations);
      }

      // Extract Bengali translations
      const bengaliMatch = content.match(
        /const bengaliTranslations: Translations = \{([\s\S]*?)\};/
      );
      if (bengaliMatch) {
        this.parseTranslationObject(bengaliMatch[1], this.bengaliTranslations);
      }

      console.log(`Loaded ${this.translationKeys.size} translation keys`);
      console.log(`English translations: ${this.englishTranslations.size}`);
      console.log(`Bengali translations: ${this.bengaliTranslations.size}`);
    } catch (error) {
      console.error('Error loading translations:', error.message);
    }
  }

  /**
   * Parse translation object from string content
   */
  parseTranslationObject(content, translationMap) {
    const lines = content.split('\n');

    lines.forEach((line) => {
      const match = line.match(/^\s*(\w+):\s*['"`](.*?)['"`],?\s*$/);
      if (match) {
        const [, key, value] = match;
        translationMap.set(key, value);
      }
    });
  }

  /**
   * Get all files in a directory recursively
   */
  getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extensions));
      } else if (extensions.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze a single file for translation usage
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.srcDir, filePath);

    const analysis = {
      path: relativePath,
      usedTranslationKeys: [],
      hardcodedStrings: [],
      missingTranslationHook: false,
      translationCalls: 0,
      issues: [],
    };

    // Check for translation hook usage
    const hasTranslationHook = /useSettings|const\s+{\s*t\s*}/.test(content);
    analysis.missingTranslationHook =
      !hasTranslationHook && this.isComponentFile(filePath);

    // Find translation key usage
    const translationPattern = /t\(['"`](\w+)['"`]\)/g;
    let match;
    while ((match = translationPattern.exec(content)) !== null) {
      const key = match[1];
      analysis.usedTranslationKeys.push(key);
      analysis.translationCalls++;

      // Check if key exists
      if (!this.translationKeys.has(key)) {
        analysis.issues.push(`Missing translation key: ${key}`);
      }
    }

    // Find potential hardcoded strings
    const hardcodedPatterns = [
      // JSX text content (more specific)
      />\s*([A-Z][a-zA-Z\s]{3,})\s*</g,
      // Common UI text patterns
      /['"`]([A-Z][a-zA-Z\s]*(?:Management|Report|Dashboard|Settings|Analysis|Total|Add|Edit|Delete|Save|Cancel|Loading|Error|Success)[a-zA-Z\s]*)['"`]/g,
      // Form labels and placeholders
      /(?:placeholder|title|alt|aria-label)\s*=\s*['"`]([A-Z][a-zA-Z\s]{3,})['"`]/g,
    ];

    hardcodedPatterns.forEach((pattern) => {
      let hardcodedMatch;
      while ((hardcodedMatch = pattern.exec(content)) !== null) {
        const text = hardcodedMatch[1].trim();

        // Skip if it's likely technical or too short
        if (this.isLikelyTechnical(text) || text.length < 4) {
          continue;
        }

        analysis.hardcodedStrings.push({
          text,
          line: this.getLineNumber(content, hardcodedMatch.index),
          context: this.getContext(content, hardcodedMatch.index, 30),
        });
      }
    });

    return analysis;
  }

  /**
   * Check if text is likely technical and shouldn't be translated
   */
  isLikelyTechnical(text) {
    const technicalPatterns = [
      /^[A-Z_]+$/, // ALL_CAPS
      /^\d+$/, // Numbers only
      /^[a-z]+\.[a-z]+/, // Property access
      /^\//, // Paths
      /^https?:/, // URLs
      /^className|^style|^onClick/, // React props
      /^console\.|^window\.|^document\./, // Browser APIs
      /^[a-z]+:[a-z]+/, // Protocols
    ];

    const commonTechnical = [
      'div',
      'span',
      'button',
      'input',
      'form',
      'table',
      'tr',
      'td',
      'th',
    ];

    return (
      technicalPatterns.some((pattern) => pattern.test(text)) ||
      commonTechnical.includes(text.toLowerCase())
    );
  }

  /**
   * Check if file is a React component
   */
  isComponentFile(filePath) {
    return filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
  }

  /**
   * Get line number for character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get context around a match
   */
  getContext(content, index, length = 50) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }

  /**
   * Analyze translation coverage for a specific page
   */
  analyzePageCoverage(pageConfig) {
    const pagePath = path.join(this.srcDir, 'app', pageConfig.path);

    const coverage = {
      name: pageConfig.name,
      path: pageConfig.path,
      priority: pageConfig.priority,
      exists: fs.existsSync(pagePath),
      files: [],
      summary: {
        totalFiles: 0,
        filesWithTranslations: 0,
        totalTranslationCalls: 0,
        totalHardcodedStrings: 0,
        totalIssues: 0,
        coverage: 0,
      },
      issues: [],
      recommendations: [],
    };

    if (!coverage.exists) {
      coverage.issues.push('Page directory does not exist');
      return coverage;
    }

    // Get all files for this page
    const pageFiles = this.getAllFiles(pagePath);
    coverage.summary.totalFiles = pageFiles.length;

    // Analyze each file
    pageFiles.forEach((file) => {
      const fileAnalysis = this.analyzeFile(file);
      coverage.files.push(fileAnalysis);

      if (fileAnalysis.translationCalls > 0) {
        coverage.summary.filesWithTranslations++;
      }

      coverage.summary.totalTranslationCalls += fileAnalysis.translationCalls;
      coverage.summary.totalHardcodedStrings +=
        fileAnalysis.hardcodedStrings.length;
      coverage.summary.totalIssues += fileAnalysis.issues.length;

      // Collect file-level issues
      if (
        fileAnalysis.missingTranslationHook &&
        fileAnalysis.hardcodedStrings.length > 0
      ) {
        coverage.issues.push(
          `${fileAnalysis.path}: Missing translation hook but has hardcoded text`
        );
      }

      fileAnalysis.issues.forEach((issue) => {
        coverage.issues.push(`${fileAnalysis.path}: ${issue}`);
      });
    });

    // Calculate coverage percentage
    const totalTextElements =
      coverage.summary.totalTranslationCalls +
      coverage.summary.totalHardcodedStrings;
    coverage.summary.coverage =
      totalTextElements > 0
        ? Math.round(
            (coverage.summary.totalTranslationCalls / totalTextElements) *
              100 *
              100
          ) / 100
        : 100;

    // Generate recommendations
    this.generatePageRecommendations(coverage);

    return coverage;
  }

  /**
   * Generate recommendations for a page
   */
  generatePageRecommendations(coverage) {
    if (coverage.summary.coverage < 50) {
      coverage.recommendations.push(
        'CRITICAL: Very low translation coverage - prioritize immediate attention'
      );
    } else if (coverage.summary.coverage < 80) {
      coverage.recommendations.push(
        'MEDIUM: Moderate translation coverage - needs improvement'
      );
    } else if (coverage.summary.coverage < 95) {
      coverage.recommendations.push(
        'LOW: Good coverage but some hardcoded text remains'
      );
    }

    if (coverage.summary.totalHardcodedStrings > 10) {
      coverage.recommendations.push(
        `Replace ${coverage.summary.totalHardcodedStrings} hardcoded strings with translation keys`
      );
    }

    const filesWithoutTranslations =
      coverage.summary.totalFiles - coverage.summary.filesWithTranslations;
    if (filesWithoutTranslations > 0) {
      coverage.recommendations.push(
        `${filesWithoutTranslations} files have no translation usage - review if translations needed`
      );
    }

    if (coverage.summary.totalIssues > 0) {
      coverage.recommendations.push(
        `Fix ${coverage.summary.totalIssues} translation-related issues`
      );
    }
  }

  /**
   * Run comprehensive coverage analysis
   */
  async runAnalysis() {
    console.log('🔍 Starting Translation Coverage Analysis...\n');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const results = {
      timestamp: new Date().toISOString(),
      pages: [],
      summary: {
        totalPages: this.navigationPages.length,
        pagesAnalyzed: 0,
        averageCoverage: 0,
        highPriorityPages: 0,
        criticalIssues: 0,
      },
    };

    // Analyze each page
    for (const pageConfig of this.navigationPages) {
      console.log(`📄 Analyzing ${pageConfig.name}...`);
      const pageCoverage = this.analyzePageCoverage(pageConfig);
      results.pages.push(pageCoverage);

      if (pageCoverage.exists) {
        results.summary.pagesAnalyzed++;
      }

      if (pageConfig.priority === 'high') {
        results.summary.highPriorityPages++;
      }

      if (pageCoverage.summary.coverage < 50) {
        results.summary.criticalIssues++;
      }
    }

    // Calculate average coverage
    const validPages = results.pages.filter((p) => p.exists);
    results.summary.averageCoverage =
      validPages.length > 0
        ? Math.round(
            (validPages.reduce((sum, p) => sum + p.summary.coverage, 0) /
              validPages.length) *
              100
          ) / 100
        : 0;

    // Generate reports
    await this.generateReports(results);

    console.log('\n✅ Coverage analysis completed!');
    this.printSummary(results);

    return results;
  }

  /**
   * Generate detailed reports
   */
  async generateReports(results) {
    // JSON report
    fs.writeFileSync(
      path.join(this.outputDir, 'coverage-analysis.json'),
      JSON.stringify(results, null, 2)
    );

    // Markdown report
    let markdown = `# Translation Coverage Analysis Report\n\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- **Total Pages**: ${results.summary.totalPages}\n`;
    markdown += `- **Pages Analyzed**: ${results.summary.pagesAnalyzed}\n`;
    markdown += `- **Average Coverage**: ${results.summary.averageCoverage}%\n`;
    markdown += `- **High Priority Pages**: ${results.summary.highPriorityPages}\n`;
    markdown += `- **Critical Issues**: ${results.summary.criticalIssues}\n\n`;

    // Coverage overview table
    markdown += `## Page Coverage Overview\n\n`;
    markdown += `| Page | Priority | Coverage | Status | Files | Issues |\n`;
    markdown += `|------|----------|----------|--------|-------|--------|\n`;

    results.pages.forEach((page) => {
      const status =
        page.summary.coverage >= 95
          ? '✅ Complete'
          : page.summary.coverage >= 80
            ? '⚠️ Good'
            : page.summary.coverage >= 50
              ? '🔶 Needs Work'
              : '❌ Critical';

      markdown += `| ${page.name} | ${page.priority} | ${page.summary.coverage}% | ${status} | ${page.summary.totalFiles} | ${page.summary.totalIssues} |\n`;
    });

    // Critical pages section
    const criticalPages = results.pages.filter((p) => p.summary.coverage < 50);
    if (criticalPages.length > 0) {
      markdown += `\n## Critical Pages (Coverage < 50%)\n\n`;
      criticalPages.forEach((page) => {
        markdown += `### ${page.name} (${page.summary.coverage}%)\n`;
        markdown += `- **Hardcoded Strings**: ${page.summary.totalHardcodedStrings}\n`;
        markdown += `- **Translation Calls**: ${page.summary.totalTranslationCalls}\n`;
        markdown += `- **Issues**: ${page.summary.totalIssues}\n`;
        markdown += `- **Recommendations**:\n`;
        page.recommendations.forEach((rec) => {
          markdown += `  - ${rec}\n`;
        });
        markdown += `\n`;
      });
    }

    // High priority pages section
    const highPriorityPages = results.pages.filter(
      (p) => p.priority === 'high'
    );
    markdown += `\n## High Priority Pages\n\n`;
    highPriorityPages.forEach((page) => {
      markdown += `### ${page.name}\n`;
      markdown += `- **Coverage**: ${page.summary.coverage}%\n`;
      markdown += `- **Files**: ${page.summary.totalFiles}\n`;
      markdown += `- **Hardcoded Strings**: ${page.summary.totalHardcodedStrings}\n`;
      markdown += `- **Issues**: ${page.summary.totalIssues}\n`;
      if (page.recommendations.length > 0) {
        markdown += `- **Top Recommendation**: ${page.recommendations[0]}\n`;
      }
      markdown += `\n`;
    });

    // Action items
    markdown += `## Recommended Action Items\n\n`;
    markdown += `1. **Immediate**: Fix critical pages with < 50% coverage\n`;
    markdown += `2. **High Priority**: Improve high-priority pages to 95%+ coverage\n`;
    markdown += `3. **Medium Priority**: Address remaining hardcoded strings\n`;
    markdown += `4. **Low Priority**: Review and optimize translation key usage\n\n`;

    fs.writeFileSync(path.join(this.outputDir, 'coverage-report.md'), markdown);

    // CSV export for spreadsheet analysis
    let csv =
      'Page,Priority,Coverage,Files,Hardcoded Strings,Translation Calls,Issues\n';
    results.pages.forEach((page) => {
      csv += `"${page.name}",${page.priority},${page.summary.coverage},${page.summary.totalFiles},${page.summary.totalHardcodedStrings},${page.summary.totalTranslationCalls},${page.summary.totalIssues}\n`;
    });

    fs.writeFileSync(path.join(this.outputDir, 'coverage-data.csv'), csv);

    console.log(`📄 Reports generated in: ${this.outputDir}`);
  }

  /**
   * Print summary to console
   */
  printSummary(results) {
    console.log('\n📊 COVERAGE ANALYSIS SUMMARY');
    console.log('============================');
    console.log(`Average Coverage: ${results.summary.averageCoverage}%`);
    console.log(
      `Pages Analyzed: ${results.summary.pagesAnalyzed}/${results.summary.totalPages}`
    );
    console.log(`Critical Issues: ${results.summary.criticalIssues}`);

    console.log('\n🎯 TOP PRIORITY ACTIONS:');

    const criticalPages = results.pages
      .filter((p) => p.summary.coverage < 50)
      .sort((a, b) => a.summary.coverage - b.summary.coverage);

    if (criticalPages.length > 0) {
      console.log('  CRITICAL PAGES:');
      criticalPages.slice(0, 3).forEach((page) => {
        console.log(
          `    ${page.name}: ${page.summary.coverage}% (${page.summary.totalHardcodedStrings} hardcoded strings)`
        );
      });
    }

    const highPriorityLowCoverage = results.pages
      .filter((p) => p.priority === 'high' && p.summary.coverage < 90)
      .sort((a, b) => a.summary.coverage - b.summary.coverage);

    if (highPriorityLowCoverage.length > 0) {
      console.log('  HIGH PRIORITY PAGES:');
      highPriorityLowCoverage.slice(0, 3).forEach((page) => {
        console.log(`    ${page.name}: ${page.summary.coverage}% coverage`);
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new TranslationCoverageAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = TranslationCoverageAnalyzer;
