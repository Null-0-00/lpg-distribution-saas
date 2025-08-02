/**
 * Test script to verify sales form theme compatibility
 * This script checks if the CombinedSaleForm component uses theme-compatible CSS classes
 */

const fs = require('fs');
const path = require('path');

const formPath = path.join(
  __dirname,
  'src/components/forms/CombinedSaleForm.tsx'
);

try {
  const formContent = fs.readFileSync(formPath, 'utf8');

  console.log('🔍 Checking CombinedSaleForm theme compatibility...\n');

  // Check for hardcoded colors that should be replaced
  const hardcodedPatterns = [
    { pattern: /text-gray-\d+/g, name: 'hardcoded gray text colors' },
    { pattern: /bg-gray-\d+/g, name: 'hardcoded gray background colors' },
    { pattern: /border-gray-\d+/g, name: 'hardcoded gray border colors' },
    {
      pattern: /text-red-\d+/g,
      name: 'hardcoded red text colors (should use text-destructive)',
    },
    { pattern: /bg-red-\d+/g, name: 'hardcoded red background colors' },
  ];

  let issuesFound = 0;

  hardcodedPatterns.forEach(({ pattern, name }) => {
    const matches = formContent.match(pattern);
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
  ];

  let themeClassesFound = 0;

  console.log('\n✅ Theme-compatible classes found:');
  themeCompatiblePatterns.forEach(({ pattern, name }) => {
    const matches = formContent.match(pattern);
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
      'The sales form should now properly adapt to light/dark theme changes.'
    );
  } else {
    console.log(
      '\n⚠️  Some theme compatibility issues remain and need to be addressed.'
    );
  }
} catch (error) {
  console.error('❌ Error reading form file:', error.message);
}
