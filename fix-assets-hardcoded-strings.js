const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing hardcoded strings in assets page...\n');

// Read the assets page
const pagePath = path.join(__dirname, 'src/app/dashboard/assets/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Define replacements
const replacements = [
  {
    search: /Set unit price/g,
    replace: "{t('setUnitPrice')}",
    description: 'Set unit price text',
  },
  {
    search: /Editable/g,
    replace: "{t('editable')}",
    description: 'Editable text',
  },
  {
    search: /Auto-Calculated Current Assets/g,
    replace: "{t('autoCalculatedCurrentAssets')}",
    description: 'Auto-Calculated Current Assets title',
  },
  {
    search: /Real-time values linked to business operations/g,
    replace: "{t('realTimeValuesLinkedToBusinessOperations')}",
    description: 'Real-time values description',
  },
  {
    search: /No auto-calculated current assets found\./g,
    replace: "{t('noAutoCalculatedAssetsFound')}",
    description: 'No auto-calculated assets message',
  },
  {
    search:
      /Auto-calculated assets like inventory and receivables will appear here\./g,
    replace: "{t('autoCalculatedAssetsDescription')}",
    description: 'Auto-calculated assets description',
  },
  {
    search: /<option value="FIXED_ASSET">Fixed Asset<\/option>/g,
    replace: '<option value="FIXED_ASSET">{t(\'fixedAsset\')}</option>',
    description: 'Fixed Asset option',
  },
  {
    search: /<option value="CURRENT_ASSET">Current Asset<\/option>/g,
    replace: '<option value="CURRENT_ASSET">{t(\'currentAsset\')}</option>',
    description: 'Current Asset option',
  },
  {
    search: /placeholder="e\.g\., Vehicles, Equipment, Inventory"/g,
    replace: "placeholder={t('assetPlaceholder')}",
    description: 'Asset placeholder text',
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
  console.log(`\n🎉 Successfully updated ${changesMade} hardcoded strings!`);
  console.log('✨ The assets page should now display properly in Bengali.');
} else {
  console.log('\n📝 No changes were needed.');
}

console.log('\n💡 Next steps:');
console.log(
  '1. Test the assets page at http://localhost:3000/dashboard/assets'
);
console.log(
  '2. Switch language to Bengali and verify all text displays correctly'
);
console.log('3. Test all functionality with Bengali interface');
