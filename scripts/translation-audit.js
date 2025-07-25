#!/usr/bin/env node

/**
 * Translation Audit and Analysis Tool
 *
 * This script provides comprehensive translation auditing capabilities:
 * 1. Scans for hardcoded text in JSX components
 * 2. Identifies missing translation keys across all pages
 * 3. Analyzes translation coverage for each navigation page
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  pagesDir: path.join(__dirname, '../src/app/dashboard'),
  componentsDir: path.join(__dirname, '../src/components'),
  translationsFile: path.join(__dirname, '../src/lib/i18n/translations.ts'),
  outputDir: path.join(__dirname, '../audit-results'),

  // File patterns to scan
  filePatterns: ['.tsx', '.ts', '.jsx', '.js'],

  // Directories to exclude from scanning
  excludeDirs: ['node_modules', '.next', '.git', 'dist', 'build'],

  // Patterns that indicate hardcoded text (case-insensitive)
  hardcodedPatterns: [
    // JSX text content
    />\s*[A-Z][a-zA-Z\s]{2,}\s*</g,
    // String literals in JSX attributes
    /(?:placeholder|title|alt|aria-label|label)\s*=\s*["'][A-Z][a-zA-Z\s]{2,}["']/gi,
    // Common hardcoded phrases
    /["'][A-Z][a-zA-Z\s]*(?:Management|Report|Dashboard|Settings|Analysis|Total|Add|Edit|Delete|Save|Cancel)[a-zA-Z\s]*["']/gi,
  ],

  // Navigation pages to analyze
  navigationPages: [
    'dashboard',
    'sales',
    'analytics',
    'reports/daily-sales',
    'inventory',
    'shipments',
    'drivers',
    'users',
    'receivables',
    'assets',
    'expenses',
    'reports',
    'product-management',
    'settings',
  ],
};

class TranslationAuditor {
  constructor() {
    this.results = {
      hardcodedText: [],
      missingKeys: [],
      pageAnalysis: [],
      summary: {
        totalFiles: 0,
        filesWithIssues: 0,
        totalHardcodedStrings: 0,
        totalMissingKeys: 0,
        overallCoverage: 0,
      },
    };

    this.translationKeys = new Set();
    this.usedKeys = new Set();
    this.loadTranslationKeys();
  }

  /**
   * Load existing translation keys from the translations file
   */
  loadTranslationKeys() {
    try {
      const translationsContent = fs.readFileSync(
        CONFIG.translationsFile,
        'utf8'
      );

      // Extract interface keys
      const interfaceMatch = translationsContent.match(
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

      console.log(`Loaded ${this.translationKeys.size} translation keys`);
    } catch (error) {
      console.error('Error loading translation keys:', error.message);
    }
  }

  /**
   * Get all files to scan
   */
  getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(item)) {
          this.getAllFiles(fullPath, files);
        }
      } else if (
        CONFIG.filePatterns.some((pattern) => item.endsWith(pattern))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze a single file for hardcoded text and translation usage
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(CONFIG.srcDir, filePath);

    const fileResult = {
      path: relativePath,
      hardcodedStrings: [],
      usedTranslationKeys: [],
      missingTranslationCalls: [],
      issues: [],
    };

    // Check for translation hook usage
    const hasTranslationHook = /useSettings|const\s+{\s*t\s*}/.test(content);
    const hasTranslationImport = /from\s+['"].*translations['"]/.test(content);

    // Find hardcoded text patterns
    CONFIG.hardcodedPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const hardcodedText = match[0];

        // Skip if it's likely a translation key usage
        if (
          hardcodedText.includes('t(') ||
          hardcodedText.includes('getTranslation')
        ) {
          continue;
        }

        // Skip common technical terms and short strings
        if (this.isLikelyTechnical(hardcodedText) || hardcodedText.length < 5) {
          continue;
        }

        fileResult.hardcodedStrings.push({
          text: hardcodedText.trim(),
          line: this.getLineNumber(content, match.index),
          pattern: index,
          context: this.getContext(content, match.index),
        });
      }
    });

    // Find translation key usage
    const translationUsagePattern = /t\(['"`](\w+)['"`]\)/g;
    let match;
    while ((match = translationUsagePattern.exec(content)) !== null) {
      const key = match[1];
      fileResult.usedTranslationKeys.push(key);
      this.usedKeys.add(key);

      // Check if key exists in translations
      if (!this.translationKeys.has(key)) {
        fileResult.missingTranslationCalls.push({
          key,
          line: this.getLineNumber(content, match.index),
          context: this.getContext(content, match.index),
        });
      }
    }

    // Check if file should use translations but doesn't
    if (
      this.isComponentFile(filePath) &&
      !hasTranslationHook &&
      fileResult.hardcodedStrings.length > 0
    ) {
      fileResult.issues.push(
        'Component has hardcoded text but no translation hook'
      );
    }

    return fileResult;
  }

  /**
   * Check if text is likely technical and should not be translated
   */
  isLikelyTechnical(text) {
    const technicalPatterns = [
      /^[A-Z_]+$/, // ALL_CAPS constants
      /^\d+$/, // Numbers only
      /^[a-z]+\.[a-z]+/, // Property access
      /^\/[a-z]/, // Paths
      /^https?:/, // URLs
      /^[a-z]+:[a-z]+/, // Protocols
      /^className|^style|^onClick/, // React props
      /^console\.|^window\.|^document\./, // Browser APIs
    ];

    return technicalPatterns.some((pattern) => pattern.test(text.trim()));
  }

  /**
   * Check if file is a React component
   */
  isComponentFile(filePath) {
    return filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
  }

  /**
   * Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get context around a match
   */
  getContext(content, index, contextLength = 50) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }

  /**
   * Analyze translation coverage for a specific page
   */
  analyzePageCoverage(pagePath) {
    const fullPagePath = path.join(CONFIG.pagesDir, pagePath);

    if (!fs.existsSync(fullPagePath)) {
      return {
        page: pagePath,
        exists: false,
        coverage: 0,
        issues: ['Page directory not found'],
      };
    }

    const pageFiles = this.getAllFiles(fullPagePath);
    let totalElements = 0;
    let translatedElements = 0;
    let hardcodedCount = 0;
    const issues = [];

    pageFiles.forEach((file) => {
      const fileResult = this.analyzeFile(file);
      totalElements +=
        fileResult.hardcodedStrings.length +
        fileResult.usedTranslationKeys.length;
      translatedElements += fileResult.usedTranslationKeys.length;
      hardcodedCount += fileResult.hardcodedStrings.length;

      if (fileResult.hardcodedStrings.length > 0) {
        issues.push(
          `${path.relative(fullPagePath, file)}: ${fileResult.hardcodedStrings.length} hardcoded strings`
        );
      }

      if (fileResult.missingTranslationCalls.length > 0) {
        issues.push(
          `${path.relative(fullPagePath, file)}: ${fileResult.missingTranslationCalls.length} missing translation keys`
        );
      }
    });

    const coverage =
      totalElements > 0 ? (translatedElements / totalElements) * 100 : 100;

    return {
      page: pagePath,
      exists: true,
      totalFiles: pageFiles.length,
      totalElements,
      translatedElements,
      hardcodedCount,
      coverage: Math.round(coverage * 100) / 100,
      issues,
      status:
        coverage >= 95 ? 'complete' : coverage >= 70 ? 'partial' : 'missing',
    };
  }

  /**
   * Run complete audit
   */
  async runAudit() {
    console.log('🔍 Starting Translation Audit...\n');

    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Get all files to analyze
    const allFiles = this.getAllFiles(CONFIG.srcDir);
    this.results.summary.totalFiles = allFiles.length;

    console.log(`📁 Analyzing ${allFiles.length} files...`);

    // Analyze each file
    const fileResults = [];
    for (const file of allFiles) {
      const result = this.analyzeFile(file);
      fileResults.push(result);

      if (
        result.hardcodedStrings.length > 0 ||
        result.missingTranslationCalls.length > 0
      ) {
        this.results.summary.filesWithIssues++;
      }

      this.results.summary.totalHardcodedStrings +=
        result.hardcodedStrings.length;
      this.results.summary.totalMissingKeys +=
        result.missingTranslationCalls.length;
    }

    // Analyze page coverage
    console.log('\n📊 Analyzing page coverage...');
    for (const page of CONFIG.navigationPages) {
      const pageAnalysis = this.analyzePageCoverage(page);
      this.results.pageAnalysis.push(pageAnalysis);
      console.log(`  ${page}: ${pageAnalysis.coverage}% coverage`);
    }

    // Calculate overall coverage
    const totalCoverage = this.results.pageAnalysis.reduce(
      (sum, page) => sum + page.coverage,
      0
    );
    this.results.summary.overallCoverage =
      Math.round((totalCoverage / this.results.pageAnalysis.length) * 100) /
      100;

    // Find unused translation keys
    const unusedKeys = Array.from(this.translationKeys).filter(
      (key) => !this.usedKeys.has(key)
    );

    // Compile results
    this.results.hardcodedText = fileResults.filter(
      (f) => f.hardcodedStrings.length > 0
    );
    this.results.missingKeys = fileResults.filter(
      (f) => f.missingTranslationCalls.length > 0
    );
    this.results.unusedKeys = unusedKeys;

    // Generate reports
    await this.generateReports();

    console.log('\n✅ Audit completed!');
    this.printSummary();
  }

  /**
   * Generate detailed reports
   */
  async generateReports() {
    // Main audit report
    const auditReport = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      pageAnalysis: this.results.pageAnalysis,
      hardcodedTextFiles: this.results.hardcodedText.length,
      missingKeyFiles: this.results.missingKeys.length,
      unusedKeysCount: this.results.unusedKeys?.length || 0,
    };

    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'audit-summary.json'),
      JSON.stringify(auditReport, null, 2)
    );

    // Detailed hardcoded text report
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'hardcoded-text.json'),
      JSON.stringify(this.results.hardcodedText, null, 2)
    );

    // Missing keys report
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'missing-keys.json'),
      JSON.stringify(this.results.missingKeys, null, 2)
    );

    // Page coverage report
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'page-coverage.json'),
      JSON.stringify(this.results.pageAnalysis, null, 2)
    );

    // Generate markdown report
    await this.generateMarkdownReport();

    console.log(`📄 Reports generated in: ${CONFIG.outputDir}`);
  }

  /**
   * Generate human-readable markdown report
   */
  async generateMarkdownReport() {
    let markdown = `# Translation Audit Report

Generated: ${new Date().toLocaleString()}

## Summary

- **Total Files Analyzed**: ${this.results.summary.totalFiles}
- **Files with Issues**: ${this.results.summary.filesWithIssues}
- **Total Hardcoded Strings**: ${this.results.summary.totalHardcodedStrings}
- **Total Missing Keys**: ${this.results.summary.totalMissingKeys}
- **Overall Coverage**: ${this.results.summary.overallCoverage}%
- **Unused Translation Keys**: ${this.results.unusedKeys?.length || 0}

## Page Coverage Analysis

| Page | Coverage | Status | Issues |
|------|----------|--------|--------|
`;

    this.results.pageAnalysis.forEach((page) => {
      const statusEmoji =
        page.status === 'complete'
          ? '✅'
          : page.status === 'partial'
            ? '⚠️'
            : '❌';
      markdown += `| ${page.page} | ${page.coverage}% | ${statusEmoji} ${page.status} | ${page.issues.length} |\n`;
    });

    markdown += `\n## Top Issues by Page\n\n`;

    this.results.pageAnalysis
      .filter((page) => page.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 10)
      .forEach((page) => {
        markdown += `### ${page.page}\n`;
        markdown += `- Coverage: ${page.coverage}%\n`;
        markdown += `- Issues:\n`;
        page.issues.forEach((issue) => {
          markdown += `  - ${issue}\n`;
        });
        markdown += `\n`;
      });

    if (this.results.unusedKeys && this.results.unusedKeys.length > 0) {
      markdown += `## Unused Translation Keys (${this.results.unusedKeys.length})\n\n`;
      markdown += '```\n';
      this.results.unusedKeys.slice(0, 20).forEach((key) => {
        markdown += `${key}\n`;
      });
      if (this.results.unusedKeys.length > 20) {
        markdown += `... and ${this.results.unusedKeys.length - 20} more\n`;
      }
      markdown += '```\n\n';
    }

    markdown += `## Recommendations\n\n`;

    if (this.results.summary.totalHardcodedStrings > 0) {
      markdown += `1. **Replace Hardcoded Text**: ${this.results.summary.totalHardcodedStrings} hardcoded strings found across ${this.results.hardcodedText.length} files\n`;
    }

    if (this.results.summary.totalMissingKeys > 0) {
      markdown += `2. **Add Missing Translation Keys**: ${this.results.summary.totalMissingKeys} missing keys need to be added to translations.ts\n`;
    }

    if (this.results.summary.overallCoverage < 90) {
      markdown += `3. **Improve Coverage**: Overall coverage is ${this.results.summary.overallCoverage}%, target should be 95%+\n`;
    }

    const lowCoveragePages = this.results.pageAnalysis.filter(
      (p) => p.coverage < 70
    );
    if (lowCoveragePages.length > 0) {
      markdown += `4. **Priority Pages**: Focus on ${lowCoveragePages.map((p) => p.page).join(', ')} (coverage < 70%)\n`;
    }

    fs.writeFileSync(path.join(CONFIG.outputDir, 'audit-report.md'), markdown);
  }

  /**
   * Print summary to console
   */
  printSummary() {
    console.log('\n📊 AUDIT SUMMARY');
    console.log('================');
    console.log(`Total Files: ${this.results.summary.totalFiles}`);
    console.log(`Files with Issues: ${this.results.summary.filesWithIssues}`);
    console.log(
      `Hardcoded Strings: ${this.results.summary.totalHardcodedStrings}`
    );
    console.log(`Missing Keys: ${this.results.summary.totalMissingKeys}`);
    console.log(`Overall Coverage: ${this.results.summary.overallCoverage}%`);
    console.log(`Unused Keys: ${this.results.unusedKeys?.length || 0}`);

    console.log('\n🎯 TOP PRIORITY PAGES:');
    this.results.pageAnalysis
      .filter((p) => p.coverage < 80)
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 5)
      .forEach((page) => {
        console.log(
          `  ${page.page}: ${page.coverage}% (${page.hardcodedCount} hardcoded strings)`
        );
      });
  }
}

// CLI interface
if (require.main === module) {
  const auditor = new TranslationAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = TranslationAuditor;
