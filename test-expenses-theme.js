/**
 * Test script to verify expenses forms theme compatibility
 * This script checks if the expenses forms use theme-compatible CSS classes
 */

const fs = require('fs');
const path = require('path');

const expenseFormPath = path.join(
  __dirname,
  'src/components/expenses/forms/ExpenseForm.tsx'
);
const categoryFormPath = path.join(
  __dirname,
  'src/components/expenses/forms/CategoryForm.tsx'
);
const categoryManagementPath = path.join(
  __dirname,
  'src/components/expenses/CategoryManagement.tsx'
);

const files = [
  { path: expenseFormPath, name: 'ExpenseForm' },
  { path: categoryFormPath, name: 'CategoryForm' },
  { path: categoryManagementPath, name: 'CategoryManagement' },
];

try {
  console.log('🔍 Checking Expenses forms theme compatibility...\n');

  let totalIssues = 0;
  let totalThemeClasses = 0;

  files.forEach(({ path: filePath, name }) => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${name}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Checking ${name}...`);

    // Check for hardcoded colors that should be replaced
    const hardcodedPatterns = [
      { pattern: /text-gray-\d+/g, name: 'hardcoded gray text colors' },
      { pattern: /bg-gray-\d+/g, name: 'hardcoded gray background colors' },
      { pattern: /border-gray-\d+/g, name: 'hardcoded gray border colors' },
      {
        pattern: /text-red-\d+/g,
        name: 'hardcoded red text colors (should use text-destructive)',
      },
      { pattern: /border-red-\d+/g, name: 'hardcoded red border colors' },
      { pattern: /bg-blue-\d+/g, name: 'hardcoded blue background colors' },
      { pattern: /text-blue-\d+/g, name: 'hardcoded blue text colors' },
    ];

    let fileIssues = 0;

    hardcodedPatterns.forEach(({ pattern, name: patternName }) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  ❌ Found ${matches.length} instances of ${patternName}`);
        fileIssues += matches.length;
      }
    });

    // Check for theme-compatible classes
    const themeCompatiblePatterns = [
      { pattern: /text-foreground/g, name: 'theme-compatible text colors' },
      {
        pattern: /text-muted-foreground/g,
        name: 'theme-compatible muted text colors',
      },
      { pattern: /bg-background/g, name: 'theme-compatible background colors' },
      {
        pattern: /bg-muted/g,
        name: 'theme-compatible muted background colors',
      },
      { pattern: /border-border/g, name: 'theme-compatible border colors' },
      {
        pattern: /text-destructive/g,
        name: 'theme-compatible destructive text colors',
      },
      {
        pattern: /border-destructive/g,
        name: 'theme-compatible destructive border colors',
      },
      {
        pattern: /bg-primary/g,
        name: 'theme-compatible primary background colors',
      },
      {
        pattern: /text-primary-foreground/g,
        name: 'theme-compatible primary text colors',
      },
      {
        pattern: /focus:ring-primary/g,
        name: 'theme-compatible focus ring colors',
      },
    ];

    let fileThemeClasses = 0;

    themeCompatiblePatterns.forEach(({ pattern, name: patternName }) => {
      const matches = content.match(pattern);
      if (matches) {
        fileThemeClasses += matches.length;
      }
    });

    console.log(`  ✅ ${fileThemeClasses} theme-compatible classes found`);
    console.log(`  📊 Issues: ${fileIssues}\n`);

    totalIssues += fileIssues;
    totalThemeClasses += fileThemeClasses;
  });

  console.log('📊 Overall Summary:');
  console.log(`   - Total issues found: ${totalIssues}`);
  console.log(`   - Total theme-compatible classes: ${totalThemeClasses}`);

  if (totalIssues === 0) {
    console.log('\n🎉 All theme compatibility issues have been fixed!');
    console.log(
      'The expenses forms should now properly adapt to light/dark theme changes.'
    );
  } else {
    console.log(
      '\n⚠️  Some theme compatibility issues remain and need to be addressed.'
    );
  }
} catch (error) {
  console.error('❌ Error reading expenses form files:', error.message);
}
