const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining hardcoded strings in assets page...\n');

// Read the assets page
const pagePath = path.join(__dirname, 'src/app/dashboard/assets/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Define additional replacements for any remaining hardcoded strings
const replacements = [
  {
    search: /Total Original Cost:/g,
    replace: "{t('originalCost')}:",
    description: 'Total Original Cost label',
  },
  {
    search: /"Add Depreciable Asset"/g,
    replace: "{t('addDepreciableAsset')}",
    description: 'Add Depreciable Asset button',
  },
  {
    search: /Add Depreciable Asset/g,
    replace: "{t('addDepreciableAsset')}",
    description: 'Add Depreciable Asset text',
  },
  {
    search: /"Straight Line"/g,
    replace: '"Straight Line"', // Keep as is since it's a technical term
    description: 'Depreciation method (technical term)',
  },
];

let changesMade = 0;

// Apply replacements
replacements.forEach((replacement) => {
  const matches = pageContent.match(replacement.search);
  if (matches) {
    console.log(
      `✅ ${replacement.description}: Found ${matches.length} instance(s)`
    );
    pageContent = pageContent.replace(replacement.search, replacement.replace);
    changesMade += matches.length;
  } else {
    console.log(`ℹ️  ${replacement.description}: No instances found`);
  }
});

// Write the updated content back to the file
if (changesMade > 0) {
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log(
    `\n🎉 Successfully updated ${changesMade} additional hardcoded strings!`
  );
} else {
  console.log('\n📝 No additional changes were needed.');
}

// Now let's check for any remaining English patterns
console.log('\n🔍 Checking for remaining hardcoded English patterns...\n');

const hardcodedPatterns = [
  {
    pattern: /'[A-Z][a-zA-Z\s]+'/g,
    description: 'Quoted English strings',
  },
  {
    pattern: />[A-Z][a-zA-Z\s]+</g,
    description: 'HTML content with English text',
  },
  {
    pattern: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g,
    description: 'Title case English phrases',
  },
];

let remainingIssues = [];

hardcodedPatterns.forEach((check) => {
  const matches = pageContent.match(check.pattern);
  if (matches) {
    matches.forEach((match) => {
      // Skip if it's already a translation call or a technical term
      if (
        !match.includes('t(') &&
        !match.includes('{t(') &&
        !match.includes('className') &&
        !match.includes('import') &&
        !match.includes('from') &&
        !match.includes('React') &&
        !match.includes('useState') &&
        !match.includes('useEffect') &&
        !match.includes('Building2') &&
        !match.includes('TrendingUp') &&
        !match.includes('DollarSign') &&
        !match.includes('Package') &&
        !match.includes('RefreshCw') &&
        !match.includes('Edit') &&
        !match.includes('Trash2') &&
        !match.includes('Save') &&
        !match.includes('XCircle') &&
        !match.includes('FIXED_ASSET') &&
        !match.includes('CURRENT_ASSET') &&
        !match.includes('CURRENT_LIABILITY') &&
        !match.includes('LONG_TERM_LIABILITY') &&
        !match.includes('Content-Type') &&
        !match.includes('PUT') &&
        !match.includes('POST') &&
        !match.includes('DELETE') &&
        !match.includes('ADMIN') &&
        !match.includes('API') &&
        match.length > 3
      ) {
        remainingIssues.push({
          text: match,
          type: check.description,
        });
      }
    });
  }
});

// Remove duplicates
remainingIssues = remainingIssues.filter(
  (item, index, self) => index === self.findIndex((t) => t.text === item.text)
);

if (remainingIssues.length > 0) {
  console.log(
    `⚠️  Found ${remainingIssues.length} potential remaining hardcoded strings:`
  );
  remainingIssues.slice(0, 15).forEach((item) => {
    console.log(`   - ${item.type}: ${item.text}`);
  });
  if (remainingIssues.length > 15) {
    console.log(`   ... and ${remainingIssues.length - 15} more`);
  }
} else {
  console.log('✅ No obvious remaining hardcoded patterns found.');
}

console.log('\n📊 Summary:');
console.log('✨ Assets page translation improvements completed!');
console.log('🚀 The page should now display much better in Bengali.');

console.log('\n💡 Final testing steps:');
console.log('1. Navigate to http://localhost:3000/dashboard/assets');
console.log('2. Switch language to Bengali in settings');
console.log('3. Verify all sections display in Bengali:');
console.log('   • Page title and navigation');
console.log(
  '   • Summary cards (Assets, Liabilities, Net Worth, Depreciation)'
);
console.log('   • Assets table with all headers and data');
console.log('   • Liabilities table with all headers and data');
console.log('   • Balance Sheet Summary section');
console.log('   • Quick Add Asset/Liability sections');
console.log('   • Auto-Calculated Current Assets section');
console.log('   • Asset Depreciation Schedule section');
console.log(
  '4. Test all functionality (add, edit, delete) with Bengali interface'
);
console.log('5. Verify all success/error messages appear in Bengali');

console.log('\n🎯 Key improvements made:');
console.log('• Balance Sheet Summary section fully translated');
console.log('• Quick Add Asset/Liability sections translated');
console.log('• Asset Depreciation Schedule section translated');
console.log('• All table headers and labels translated');
console.log('• Success/error messages use proper translation calls');
console.log('• Auto-calculated asset descriptions translated');
console.log('• Form placeholders and options translated');
