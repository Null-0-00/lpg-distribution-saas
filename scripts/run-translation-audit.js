#!/usr/bin/env node

/**
 * Translation Audit Runner
 *
 * Main script that orchestrates all translation audit tools:
 * 1. Translation Audit (hardcoded text detection)
 * 2. Translation Key Analyzer (missing key suggestions)
 * 3. Translation Coverage Analyzer (page-by-page coverage)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import our audit tools
const TranslationAuditor = require('./translation-audit');
const TranslationKeyAnalyzer = require('./translation-key-analyzer');
const TranslationCoverageAnalyzer = require('./translation-coverage-analyzer');

class TranslationAuditRunner {
  constructor() {
    this.outputDir = path.join(__dirname, '../audit-results');
    this.startTime = Date.now();
  }

  /**
   * Ensure output directory exists
   */
  setupOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Clear previous results
    const files = fs.readdirSync(this.outputDir);
    files.forEach((file) => {
      fs.unlinkSync(path.join(this.outputDir, file));
    });

    console.log(`📁 Output directory prepared: ${this.outputDir}`);
  }

  /**
   * Run all audit tools
   */
  async runCompleteAudit() {
    console.log('🚀 Starting Comprehensive Translation Audit...\n');
    console.log('='.repeat(60));

    this.setupOutputDirectory();

    const results = {
      timestamp: new Date().toISOString(),
      duration: 0,
      tools: {
        hardcodedTextAudit: null,
        keyAnalysis: null,
        coverageAnalysis: null,
      },
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        recommendations: [],
      },
    };

    try {
      // 1. Run hardcoded text audit
      console.log('\n🔍 STEP 1: Scanning for hardcoded text...');
      console.log('-'.repeat(40));
      const auditor = new TranslationAuditor();
      await auditor.runAudit();
      results.tools.hardcodedTextAudit = {
        completed: true,
        hardcodedStrings: auditor.results.summary.totalHardcodedStrings,
        filesWithIssues: auditor.results.summary.filesWithIssues,
        overallCoverage: auditor.results.summary.overallCoverage,
      };

      // 2. Run translation key analysis
      console.log('\n🔤 STEP 2: Analyzing missing translation keys...');
      console.log('-'.repeat(40));
      const keyAnalyzer = new TranslationKeyAnalyzer();
      await keyAnalyzer.run();
      const keyResults = keyAnalyzer.generateSuggestions();
      results.tools.keyAnalysis = {
        completed: true,
        suggestedKeys: keyResults.totalSuggestions,
        existingKeys: keyAnalyzer.existingKeys.size,
      };

      // 3. Run coverage analysis
      console.log('\n📊 STEP 3: Analyzing page coverage...');
      console.log('-'.repeat(40));
      const coverageAnalyzer = new TranslationCoverageAnalyzer();
      const coverageResults = await coverageAnalyzer.runAnalysis();
      results.tools.coverageAnalysis = {
        completed: true,
        averageCoverage: coverageResults.summary.averageCoverage,
        criticalPages: coverageResults.summary.criticalIssues,
        totalPages: coverageResults.summary.totalPages,
      };

      // Calculate summary
      results.summary.totalIssues =
        results.tools.hardcodedTextAudit.hardcodedStrings +
        results.tools.keyAnalysis.suggestedKeys +
        results.tools.coverageAnalysis.criticalPages;

      results.summary.criticalIssues =
        results.tools.coverageAnalysis.criticalPages;

      // Generate recommendations
      this.generateRecommendations(results);

      // Generate consolidated report
      await this.generateConsolidatedReport(results);
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      throw error;
    }

    results.duration = Date.now() - this.startTime;

    console.log('\n✅ COMPREHENSIVE AUDIT COMPLETED!');
    console.log('='.repeat(60));
    this.printFinalSummary(results);

    return results;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Critical coverage issues
    if (results.tools.coverageAnalysis.criticalPages > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: `Fix ${results.tools.coverageAnalysis.criticalPages} pages with < 50% translation coverage`,
        impact: 'High - affects user experience',
        effort: 'High',
      });
    }

    // Hardcoded text issues
    if (results.tools.hardcodedTextAudit.hardcodedStrings > 50) {
      recommendations.push({
        priority: 'HIGH',
        action: `Replace ${results.tools.hardcodedTextAudit.hardcodedStrings} hardcoded strings with translation keys`,
        impact: 'Medium - improves maintainability',
        effort: 'Medium',
      });
    }

    // Missing translation keys
    if (results.tools.keyAnalysis.suggestedKeys > 20) {
      recommendations.push({
        priority: 'MEDIUM',
        action: `Add ${results.tools.keyAnalysis.suggestedKeys} suggested translation keys`,
        impact: 'Medium - improves completeness',
        effort: 'Low',
      });
    }

    // Overall coverage
    if (results.tools.coverageAnalysis.averageCoverage < 90) {
      recommendations.push({
        priority: 'MEDIUM',
        action: `Improve overall coverage from ${results.tools.coverageAnalysis.averageCoverage}% to 95%+`,
        impact: 'Medium - ensures consistency',
        effort: 'Medium',
      });
    }

    // Low coverage but not critical
    if (
      results.tools.coverageAnalysis.averageCoverage < 80 &&
      results.tools.coverageAnalysis.criticalPages === 0
    ) {
      recommendations.push({
        priority: 'HIGH',
        action:
          'Focus on systematic translation implementation across all pages',
        impact: 'High - prevents technical debt',
        effort: 'High',
      });
    }

    results.summary.recommendations = recommendations;
  }

  /**
   * Generate consolidated report
   */
  async generateConsolidatedReport(results) {
    const reportPath = path.join(
      this.outputDir,
      'CONSOLIDATED-AUDIT-REPORT.md'
    );

    let report = `# Comprehensive Translation Audit Report

Generated: ${new Date().toLocaleString()}
Duration: ${Math.round(results.duration / 1000)}s

## Executive Summary

This comprehensive audit analyzed the translation system across all navigation pages of the LPG Distributor Management System.

### Key Findings

- **Overall Translation Coverage**: ${results.tools.coverageAnalysis.averageCoverage}%
- **Total Issues Found**: ${results.summary.totalIssues}
- **Critical Pages**: ${results.tools.coverageAnalysis.criticalPages} pages with < 50% coverage
- **Hardcoded Strings**: ${results.tools.hardcodedTextAudit.hardcodedStrings} instances found
- **Suggested New Keys**: ${results.tools.keyAnalysis.suggestedKeys} recommendations

### Audit Tools Results

#### 1. Hardcoded Text Detection ✅
- **Files Analyzed**: Scanned entire src/ directory
- **Hardcoded Strings Found**: ${results.tools.hardcodedTextAudit.hardcodedStrings}
- **Files with Issues**: ${results.tools.hardcodedTextAudit.filesWithIssues}
- **Current Coverage**: ${results.tools.hardcodedTextAudit.overallCoverage}%

#### 2. Translation Key Analysis ✅
- **Existing Keys**: ${results.tools.keyAnalysis.existingKeys}
- **Suggested New Keys**: ${results.tools.keyAnalysis.suggestedKeys}
- **Analysis**: Identified missing keys based on UI patterns and hardcoded text

#### 3. Page Coverage Analysis ✅
- **Pages Analyzed**: ${results.tools.coverageAnalysis.totalPages}
- **Average Coverage**: ${results.tools.coverageAnalysis.averageCoverage}%
- **Critical Issues**: ${results.tools.coverageAnalysis.criticalPages} pages need immediate attention

## Priority Action Items

`;

    // Add recommendations
    results.summary.recommendations.forEach((rec, index) => {
      report += `### ${index + 1}. ${rec.priority} PRIORITY\n`;
      report += `**Action**: ${rec.action}\n`;
      report += `**Impact**: ${rec.impact}\n`;
      report += `**Effort**: ${rec.effort}\n\n`;
    });

    report += `## Implementation Roadmap

### Phase 1: Critical Issues (Week 1)
- Fix pages with < 50% translation coverage
- Focus on high-priority navigation pages
- Implement translation hooks where missing

### Phase 2: Systematic Improvement (Week 2-3)
- Replace hardcoded strings with translation keys
- Add missing translation keys to translations.ts
- Test language switching functionality

### Phase 3: Quality Assurance (Week 4)
- Review Bengali translations for accuracy
- Test UI layout with different text lengths
- Implement automated translation validation

### Phase 4: Maintenance (Ongoing)
- Set up automated translation auditing
- Create developer guidelines
- Monitor translation coverage in CI/CD

## Detailed Reports

The following detailed reports have been generated:

1. **audit-summary.json** - Complete audit data in JSON format
2. **hardcoded-text.json** - Detailed hardcoded text findings
3. **missing-keys.json** - Missing translation key details
4. **page-coverage.json** - Page-by-page coverage analysis
5. **suggested-keys.json** - Recommended new translation keys
6. **coverage-analysis.json** - Comprehensive coverage data
7. **audit-report.md** - Human-readable audit summary
8. **coverage-report.md** - Detailed coverage analysis
9. **suggested-keys.md** - Translation key recommendations

## Next Steps

1. **Review this report** with the development team
2. **Prioritize critical pages** identified in the coverage analysis
3. **Implement missing translation keys** from the suggestions
4. **Replace hardcoded text** systematically across components
5. **Test translation functionality** thoroughly
6. **Set up monitoring** to prevent regression

---

*This audit was generated automatically by the Translation Audit Tools.*
*For questions or issues, refer to the detailed reports in the audit-results directory.*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Consolidated report generated: ${reportPath}`);
  }

  /**
   * Print final summary
   */
  printFinalSummary(results) {
    console.log(`⏱️  Duration: ${Math.round(results.duration / 1000)}s`);
    console.log(
      `📊 Overall Coverage: ${results.tools.coverageAnalysis.averageCoverage}%`
    );
    console.log(`🔍 Total Issues: ${results.summary.totalIssues}`);
    console.log(`⚠️  Critical Issues: ${results.summary.criticalIssues}`);

    console.log('\n🎯 TOP RECOMMENDATIONS:');
    results.summary.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
    });

    console.log(`\n📁 All reports saved to: ${this.outputDir}`);
    console.log('📋 See CONSOLIDATED-AUDIT-REPORT.md for complete analysis');
  }

  /**
   * Run specific audit tool
   */
  async runSpecificTool(toolName) {
    this.setupOutputDirectory();

    switch (toolName) {
      case 'hardcoded':
        console.log('🔍 Running hardcoded text audit...');
        const auditor = new TranslationAuditor();
        await auditor.runAudit();
        break;

      case 'keys':
        console.log('🔤 Running translation key analysis...');
        const keyAnalyzer = new TranslationKeyAnalyzer();
        await keyAnalyzer.run();
        break;

      case 'coverage':
        console.log('📊 Running coverage analysis...');
        const coverageAnalyzer = new TranslationCoverageAnalyzer();
        await coverageAnalyzer.runAnalysis();
        break;

      default:
        console.error(
          '❌ Unknown tool. Available tools: hardcoded, keys, coverage'
        );
        process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TranslationAuditRunner();

  try {
    if (args.length === 0) {
      // Run complete audit
      await runner.runCompleteAudit();
    } else if (args[0] === '--tool' && args[1]) {
      // Run specific tool
      await runner.runSpecificTool(args[1]);
    } else if (args[0] === '--help' || args[0] === '-h') {
      console.log(`
Translation Audit Runner

Usage:
  node run-translation-audit.js                    # Run complete audit
  node run-translation-audit.js --tool hardcoded   # Run hardcoded text audit only
  node run-translation-audit.js --tool keys        # Run key analysis only
  node run-translation-audit.js --tool coverage    # Run coverage analysis only
  node run-translation-audit.js --help             # Show this help

Available tools:
  - hardcoded: Scan for hardcoded text in JSX components
  - keys: Analyze and suggest missing translation keys
  - coverage: Analyze translation coverage by page

Output:
  All results are saved to audit-results/ directory
      `);
    } else {
      console.error('❌ Invalid arguments. Use --help for usage information.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TranslationAuditRunner;
