/**
 * Test script to verify assets page forms theme compatibility
 * This script checks if the assets page forms use theme-compatible CSS classes
 */

const fs = require('fs');
const path = require('path');

const assetsPagePath = path.join(
  __dirname,
  'src/app/dashboard/assets/page.tsx'
);

try {
  if (!fs.existsSync(assetsPagePath)) {
    console.log('⚠️  Assets page file not found');
    return;
  }

  const content = fs.readFileSync(assetsPagePath, 'utf8');
  console.log('🔍 Checking Assets page forms theme compatibility...\n');

  // Check for hardcoded colors that should be replaced
  const hardcodedPatterns = [
    { pattern: /text-gray-\d+/g, name: 'hardcoded gray text colors' },
    { pattern: /bg-gray-\d+/g, name: 'hardcoded gray background colors' },
    { pattern: /border-gray-\d+/g, name: 'hardcoded gray border colors' },
    { pattern: /text-red-\d+/g, name: 'hardcoded red text colors' },
    { pattern: /bg-red-\d+/g, name: 'hardcoded red background colors' },
    { pattern: /bg-blue-\d+/g, name: 'hardcoded blue background colors' },
    { pattern: /text-blue-\d+/g, name: 'hardcoded blue text colors' },
    {
      pattern: /focus:ring-blue-\d+/g,
      name: 'hardcoded blue focus ring colors',
    },
  ];

  let issuesFound = 0;

  hardcodedPatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`❌ Found ${matches.length} instances of ${name}:`);
      // Show unique matches only
      const uniqueMatches = [...new Set(matches)];
      uniqueMatches.forEach((match) => console.log(`   - ${match}`));
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
    {
      pattern: /focus:ring-primary/g,
      name: 'theme-compatible focus ring colors',
    },
  ];

  let themeClassesFound = 0;

  console.log('\n✅ Theme-compatible classes found:');
  themeCompatiblePatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`   - ${matches.length} instances of ${name}`);
      themeClassesFound += matches.length;
    }
  });

  // Check for specific form elements that were problematic
  const formElementPatterns = [
    {
      pattern:
        /className="w-full rounded-lg border border-border bg-background/g,
      name: 'theme-compatible input fields',
    },
    {
      pattern: /className="mb-2 block text-sm font-medium text-foreground"/g,
      name: 'theme-compatible labels',
    },
  ];

  console.log('\n🎯 Fixed form elements:');
  formElementPatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
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
      'The assets page forms should now properly adapt to light/dark theme changes.'
    );
  } else {
    console.log(
      '\n⚠️  Some theme compatibility issues remain and need to be addressed.'
    );
    console.log(
      'Focus on the modal forms for asset and liability creation/editing.'
    );
  }
} catch (error) {
  console.error('❌ Error reading assets page file:', error.message);
}
