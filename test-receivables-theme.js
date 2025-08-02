/**
 * Test script to verify receivables page theme compatibility
 * This script checks if the receivables page uses theme-compatible CSS classes
 */

const fs = require('fs');
const path = require('path');

const receivablesPath = path.join(
  __dirname,
  'src/app/dashboard/receivables/page.tsx'
);

try {
  const receivablesContent = fs.readFileSync(receivablesPath, 'utf8');

  console.log('🔍 Checking Receivables page theme compatibility...\n');

  // Check for hardcoded colors that should be replaced
  const hardcodedPatterns = [
    { pattern: /bg-red-\d+/g, name: 'hardcoded red background colors' },
    { pattern: /bg-blue-\d+/g, name: 'hardcoded blue background colors' },
    { pattern: /bg-green-\d+/g, name: 'hardcoded green background colors' },
    { pattern: /bg-yellow-\d+/g, name: 'hardcoded yellow background colors' },
    { pattern: /text-red-\d+/g, name: 'hardcoded red text colors' },
    { pattern: /text-blue-\d+/g, name: 'hardcoded blue text colors' },
    { pattern: /text-green-\d+/g, name: 'hardcoded green text colors' },
    { pattern: /text-yellow-\d+/g, name: 'hardcoded yellow text colors' },
    { pattern: /border-red-\d+/g, name: 'hardcoded red border colors' },
    { pattern: /border-blue-\d+/g, name: 'hardcoded blue border colors' },
  ];

  let issuesFound = 0;

  hardcodedPatterns.forEach(({ pattern, name }) => {
    const matches = receivablesContent.match(pattern);
    if (matches) {
      console.log(`❌ Found ${matches.length} instances of ${name}:`);
      matches.forEach((match) => console.log(`   - ${match}`));
      issuesFound += matches.length;
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
    { pattern: /bg-muted/g, name: 'theme-compatible muted background colors' },
    { pattern: /border-border/g, name: 'theme-compatible border colors' },
    {
      pattern: /text-destructive/g,
      name: 'theme-compatible destructive text colors',
    },
    {
      pattern: /bg-destructive/g,
      name: 'theme-compatible destructive background colors',
    },
    {
      pattern: /bg-primary/g,
      name: 'theme-compatible primary background colors',
    },
    {
      pattern: /text-primary-foreground/g,
      name: 'theme-compatible primary text colors',
    },
  ];

  let themeClassesFound = 0;

  console.log('\n✅ Theme-compatible classes found:');
  themeCompatiblePatterns.forEach(({ pattern, name }) => {
    const matches = receivablesContent.match(pattern);
    if (matches) {
      console.log(`   - ${matches.length} instances of ${name}`);
      themeClassesFound += matches.length;
    }
  });

  // Check for specific sections that were problematic
  const problematicSections = [
    {
      pattern: /border-destructive\/20 bg-destructive\/10/g,
      name: 'theme-compatible error banners',
    },
    {
      pattern: /border-border bg-muted\/30/g,
      name: 'theme-compatible info banners',
    },
  ];

  console.log('\n🎯 Fixed problematic sections:');
  problematicSections.forEach(({ pattern, name }) => {
    const matches = receivablesContent.match(pattern);
    if (matches) {
      console.log(`   - ${matches.length} instances of ${name}`);
      themeClassesFound += matches.length;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`   - Issues found: ${issuesFound}`);
  console.log(`   - Theme-compatible classes: ${themeClassesFound}`);

  if (issuesFound === 0) {
    console.log('\n🎉 All theme compatibility issues have been fixed!');
    console.log(
      'The receivables page should now properly adapt to light/dark theme changes.'
    );
  } else {
    console.log(
      '\n⚠️  Some theme compatibility issues remain and need to be addressed.'
    );
  }
} catch (error) {
  console.error('❌ Error reading receivables file:', error.message);
}
