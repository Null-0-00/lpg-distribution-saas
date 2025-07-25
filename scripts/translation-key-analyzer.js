#!/usr/bin/env node

/**
 * Translation Key Analyzer
 *
 * This script analyzes translation key usage patterns and suggests missing keys
 * based on common UI patterns and component structures.
 */

const fs = require('fs');
const path = require('path');

class TranslationKeyAnalyzer {
  constructor() {
    this.srcDir = path.join(__dirname, '../src');
    this.translationsFile = path.join(
      __dirname,
      '../src/lib/i18n/translations.ts'
    );
    this.outputDir = path.join(__dirname, '../audit-results');

    this.existingKeys = new Set();
    this.suggestedKeys = new Map(); // key -> { contexts: [], priority: number }
    this.loadExistingKeys();
  }

  loadExistingKeys() {
    try {
      const content = fs.readFileSync(this.translationsFile, 'utf8');
      const interfaceMatch = content.match(
        /interface Translations \{([\s\S]*?)\}/
      );

      if (interfaceMatch) {
        const interfaceContent = interfaceMatch[1];
        const keyMatches = interfaceContent.match(/^\s*(\w+):\s*string;/gm);
        if (keyMatches) {
          keyMatches.forEach((match) => {
            const key = match.match(/^\s*(\w+):/)[1];
            this.existingKeys.add(key);
          });
        }
      }

      console.log(`Loaded ${this.existingKeys.size} existing translation keys`);
    } catch (error) {
      console.error('Error loading existing keys:', error.message);
    }
  }

  /**
   * Analyze common UI patterns and suggest missing keys
   */
  analyzeUIPatterns() {
    const patterns = [
      // Table-related keys
      {
        pattern: /Table|table/g,
        keys: [
          'tableHeaders',
          'noDataInTable',
          'sortBy',
          'filterTable',
          'rowsPerPage',
          'showingResults',
        ],
      },

      // Form-related keys
      {
        pattern: /Form|form|Input|input/g,
        keys: [
          'required',
          'optional',
          'pleaseSelect',
          'selectOption',
          'enterValue',
          'invalidInput',
          'fieldRequired',
        ],
      },

      // Button and action keys
      {
        pattern: /Button|button|onClick/g,
        keys: [
          'apply',
          'reset',
          'clear',
          'selectAll',
          'deselectAll',
          'continue',
          'finish',
          'skip',
        ],
      },

      // Status and state keys
      {
        pattern: /Status|status|State|state/g,
        keys: [
          'pending',
          'approved',
          'rejected',
          'draft',
          'published',
          'archived',
          'enabled',
          'disabled',
        ],
      },

      // Date and time keys
      {
        pattern: /Date|date|Time|time/g,
        keys: [
          'selectDate',
          'selectTime',
          'dateRange',
          'fromDate',
          'toDate',
          'startDate',
          'endDate',
          'dueDate',
        ],
      },

      // Navigation and pagination
      {
        pattern: /Page|page|Nav|nav/g,
        keys: [
          'firstPage',
          'lastPage',
          'goToPage',
          'itemsPerPage',
          'showMore',
          'showLess',
        ],
      },

      // Error and validation
      {
        pattern: /Error|error|Valid|valid/g,
        keys: [
          'validationError',
          'requiredField',
          'invalidFormat',
          'errorOccurred',
          'tryAgainLater',
        ],
      },

      // Loading and empty states
      {
        pattern: /Loading|loading|Empty|empty/g,
        keys: [
          'loadingPlease',
          'noItemsFound',
          'emptyState',
          'noResultsFound',
          'loadingFailed',
        ],
      },
    ];

    const allFiles = this.getAllFiles(this.srcDir);

    patterns.forEach(({ pattern, keys }) => {
      keys.forEach((key) => {
        if (!this.existingKeys.has(key)) {
          let contexts = [];
          let matchCount = 0;

          allFiles.forEach((file) => {
            try {
              const content = fs.readFileSync(file, 'utf8');
              if (pattern.test(content)) {
                matchCount++;
                contexts.push(path.relative(this.srcDir, file));
              }
            } catch (error) {
              // Skip files that can't be read
            }
          });

          if (matchCount > 0) {
            this.suggestedKeys.set(key, {
              contexts: contexts.slice(0, 5), // Limit contexts for readability
              priority: matchCount,
              category: this.categorizeKey(key),
            });
          }
        }
      });
    });
  }

  /**
   * Analyze specific page components for missing keys
   */
  analyzePageSpecificKeys() {
    const pageAnalysis = [
      {
        page: 'dashboard',
        path: 'src/app/dashboard/page.tsx',
        expectedKeys: [
          'welcomeMessage',
          'quickActions',
          'recentActivity',
          'systemStatus',
          'notifications',
        ],
      },
      {
        page: 'sales',
        path: 'src/app/dashboard/sales',
        expectedKeys: [
          'addSale',
          'editSale',
          'deleteSale',
          'saleDetails',
          'customerInfo',
          'paymentMethod',
          'saleStatus',
        ],
      },
      {
        page: 'inventory',
        path: 'src/app/dashboard/inventory',
        expectedKeys: [
          'stockLevel',
          'reorderPoint',
          'lastRestocked',
          'stockAlert',
          'inventoryValue',
          'stockMovement',
        ],
      },
      {
        page: 'drivers',
        path: 'src/app/dashboard/drivers',
        expectedKeys: [
          'driverInfo',
          'assignRoute',
          'driverPerformance',
          'driverStatus',
          'vehicleInfo',
        ],
      },
      {
        page: 'analytics',
        path: 'src/app/dashboard/analytics',
        expectedKeys: [
          'chartTitle',
          'dataRange',
          'analyticsFilter',
          'exportChart',
          'chartType',
          'dataSource',
        ],
      },
    ];

    pageAnalysis.forEach(({ page, path: pagePath, expectedKeys }) => {
      const fullPath = path.join(__dirname, '..', pagePath);

      expectedKeys.forEach((key) => {
        if (!this.existingKeys.has(key)) {
          this.suggestedKeys.set(key, {
            contexts: [pagePath],
            priority: 5, // High priority for page-specific keys
            category: `${page}Page`,
            pageSpecific: true,
          });
        }
      });
    });
  }

  /**
   * Analyze hardcoded strings and suggest translation keys
   */
  analyzeHardcodedStrings() {
    const allFiles = this.getAllFiles(this.srcDir);
    const hardcodedPatterns = [
      // Common button texts
      /["'](?:Add|Edit|Delete|Save|Cancel|Submit|Update|Create|Remove|View|Show|Hide)["']/g,

      // Common labels
      /["'](?:Name|Email|Phone|Address|Description|Status|Type|Category|Date|Time|Amount|Quantity|Price|Total)["']/g,

      // Common messages
      /["'](?:Loading|Error|Success|Warning|Please|Required|Optional|Invalid|Failed|Completed)[\w\s]*["']/g,

      // Table headers
      /["'](?:Actions|Created|Updated|Modified|Last|First|Full|Total|Count|Number|ID|Code)[\w\s]*["']/g,
    ];

    allFiles.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.srcDir, file);

        hardcodedPatterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const text = match[0].replace(/["']/g, '');
            const suggestedKey = this.textToKey(text);

            if (
              !this.existingKeys.has(suggestedKey) &&
              suggestedKey.length > 2
            ) {
              const existing = this.suggestedKeys.get(suggestedKey) || {
                contexts: [],
                priority: 0,
                category: 'common',
              };
              existing.contexts.push(`${relativePath} (${text})`);
              existing.priority += 1;
              existing.originalText = text;
              this.suggestedKeys.set(suggestedKey, existing);
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });
  }

  /**
   * Convert text to camelCase key
   */
  textToKey(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  /**
   * Categorize translation key
   */
  categorizeKey(key) {
    const categories = {
      form: [
        'required',
        'optional',
        'select',
        'enter',
        'input',
        'field',
        'validation',
      ],
      table: ['table', 'row', 'column', 'sort', 'filter', 'page', 'results'],
      action: [
        'add',
        'edit',
        'delete',
        'save',
        'cancel',
        'submit',
        'create',
        'update',
        'remove',
      ],
      status: [
        'pending',
        'approved',
        'rejected',
        'active',
        'inactive',
        'enabled',
        'disabled',
      ],
      message: [
        'error',
        'success',
        'warning',
        'info',
        'loading',
        'failed',
        'completed',
      ],
      navigation: [
        'page',
        'next',
        'previous',
        'first',
        'last',
        'go',
        'back',
        'forward',
      ],
      date: [
        'date',
        'time',
        'from',
        'to',
        'start',
        'end',
        'due',
        'created',
        'updated',
      ],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => key.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'common';
  }

  /**
   * Get all files to analyze
   */
  getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (
          !['node_modules', '.next', '.git', 'dist', 'build'].includes(item)
        ) {
          this.getAllFiles(fullPath, files);
        }
      } else if (
        ['.tsx', '.ts', '.jsx', '.js'].some((ext) => item.endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Generate suggested translation keys
   */
  generateSuggestions() {
    console.log('🔍 Analyzing UI patterns...');
    this.analyzeUIPatterns();

    console.log('📄 Analyzing page-specific keys...');
    this.analyzePageSpecificKeys();

    console.log('🔤 Analyzing hardcoded strings...');
    this.analyzeHardcodedStrings();

    // Sort suggestions by priority
    const sortedSuggestions = Array.from(this.suggestedKeys.entries()).sort(
      ([, a], [, b]) => b.priority - a.priority
    );

    return {
      totalSuggestions: sortedSuggestions.length,
      suggestions: sortedSuggestions,
      byCategory: this.groupByCategory(sortedSuggestions),
    };
  }

  /**
   * Group suggestions by category
   */
  groupByCategory(suggestions) {
    const grouped = {};

    suggestions.forEach(([key, data]) => {
      const category = data.category || 'common';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ key, ...data });
    });

    return grouped;
  }

  /**
   * Generate TypeScript interface additions
   */
  generateTypeScriptAdditions(suggestions) {
    let typescript = '\n// Suggested additions to Translations interface:\n';

    Object.entries(suggestions.byCategory).forEach(([category, keys]) => {
      typescript += `\n  // ${category.charAt(0).toUpperCase() + category.slice(1)} keys\n`;
      keys.slice(0, 10).forEach(({ key, originalText }) => {
        const comment = originalText ? ` // "${originalText}"` : '';
        typescript += `  ${key}: string;${comment}\n`;
      });
    });

    return typescript;
  }

  /**
   * Run the analysis and generate report
   */
  async run() {
    console.log('🚀 Starting Translation Key Analysis...\n');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const results = this.generateSuggestions();

    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      existingKeysCount: this.existingKeys.size,
      suggestedKeysCount: results.totalSuggestions,
      suggestions: results.suggestions.slice(0, 50), // Top 50 suggestions
      byCategory: results.byCategory,
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(this.outputDir, 'suggested-keys.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate TypeScript additions
    const tsAdditions = this.generateTypeScriptAdditions(results);
    fs.writeFileSync(
      path.join(this.outputDir, 'suggested-keys.ts'),
      tsAdditions
    );

    // Generate markdown report
    let markdown = `# Suggested Translation Keys\n\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- Existing Keys: ${this.existingKeys.size}\n`;
    markdown += `- Suggested Keys: ${results.totalSuggestions}\n\n`;

    markdown += `## Top Priority Suggestions\n\n`;
    markdown += `| Key | Priority | Category | Original Text | Contexts |\n`;
    markdown += `|-----|----------|----------|---------------|----------|\n`;

    results.suggestions.slice(0, 20).forEach(([key, data]) => {
      const contexts = data.contexts.slice(0, 2).join(', ');
      const originalText = data.originalText || '';
      markdown += `| ${key} | ${data.priority} | ${data.category} | ${originalText} | ${contexts} |\n`;
    });

    markdown += `\n## By Category\n\n`;
    Object.entries(results.byCategory).forEach(([category, keys]) => {
      markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${keys.length} keys)\n\n`;
      keys.slice(0, 10).forEach(({ key, priority, originalText }) => {
        const text = originalText ? ` - "${originalText}"` : '';
        markdown += `- \`${key}\` (priority: ${priority})${text}\n`;
      });
      markdown += `\n`;
    });

    fs.writeFileSync(path.join(this.outputDir, 'suggested-keys.md'), markdown);

    console.log('✅ Analysis completed!');
    console.log(
      `📊 Found ${results.totalSuggestions} suggested translation keys`
    );
    console.log(`📄 Reports saved to: ${this.outputDir}`);

    // Print top suggestions
    console.log('\n🎯 TOP 10 SUGGESTED KEYS:');
    results.suggestions.slice(0, 10).forEach(([key, data], index) => {
      console.log(
        `${index + 1}. ${key} (priority: ${data.priority}, category: ${data.category})`
      );
    });
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new TranslationKeyAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = TranslationKeyAnalyzer;
