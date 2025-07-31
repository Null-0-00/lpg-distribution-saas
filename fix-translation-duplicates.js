const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing duplicate identifiers in translations file...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

// Find all duplicate keys that need to be removed
const duplicateKeys = [
  'receivables',
  'inventory', 
  'active',
  'cash',
  'cashReceivables',
  'emptyCylinders',
  'fullCylinders',
  'monthlyPayment',
  'created',
  'autoCalculated',
  'addAsset',
  'addLiability',
  'outstandingCashReceivablesFromDrivers',
  'availableCashCalculatedFromDeposits',
  'purchaseDate'
];

console.log('🔍 Looking for duplicate keys in interface...\n');

// Remove duplicate keys from the interface definition
duplicateKeys.forEach(key => {
  // Find all occurrences of the key in the interface
  const interfaceRegex = new RegExp(`^\\s*${key}:\\s*string;\\s*$`, 'gm');
  const matches = content.match(interfaceRegex);
  
  if (matches && matches.length > 1) {
    console.log(`✅ Found ${matches.length} instances of '${key}' in interface`);
    
    // Keep only the first occurrence, remove the rest
    let count = 0;
    content = content.replace(interfaceRegex, (match) => {
      count++;
      if (count === 1) {
        return match; // Keep the first occurrence
      } else {
        console.log(`   - Removing duplicate #${count} of '${key}'`);
        return ''; // Remove subsequent occurrences
      }
    });
  }
});

console.log('\n🔍 Looking for duplicate keys in Bengali translations...\n');

// Remove duplicate keys from Bengali translations
duplicateKeys.forEach(key => {
  // Find all occurrences in Bengali translations
  const bengaliRegex = new RegExp(`^\\s*${key}:\\s*'[^']*',?\\s*$`, 'gm');
  const matches = content.match(bengaliRegex);
  
  if (matches && matches.length > 1) {
    console.log(`✅ Found ${matches.length} instances of '${key}' in Bengali translations`);
    
    // Keep only the first occurrence, remove the rest
    let count = 0;
    content = content.replace(bengaliRegex, (match) => {
      count++;
      if (count === 1) {
        return match; // Keep the first occurrence
      } else {
        console.log(`   - Removing duplicate #${count} of '${key}'`);
        return ''; // Remove subsequent occurrences
      }
    });
  }
});

// Clean up any empty lines that might have been created
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Add missing keys to English translations
console.log('\n🔍 Adding missing keys to English translations...\n');

const missingKeys = [
  'asset',
  'liabilityWord', 
  'autoCalculatedFromInventory',
  'setUnitPrice',
  'editable',
  'autoCalculatedCurrentAssets',
  'noAutoCalculatedAssetsFound',
  'autoCalculatedAssetsDescription',
  'updated',
  'successfully',
  'failedToUpdateCreateEntry',
  'assetPlaceholder',
  'realTimeValuesLinkedToBusinessOperations',
  'balanceSheetSummary',
  'totalAssets',
  'totalLiabilities', 
  'netEquity',
  'quickAddAsset',
  'addNewAssetToPortfolio',
  'quickAddLiability',
  'addNewLiabilityToRecords',
  'cashReceivablesAsset',
  'cashInHandAsset',
  'assetDepreciationSchedule',
  'assetsWithDepreciationRates',
  'originalCost',
  'depreciationMethod',
  'annualRate',
  'yearsOwned',
  'accumulated',
  'currentValue',
  'noAssetsWithDepreciationFound',
  'addAssetsWithPurchaseDates',
  'addDepreciableAsset',
  'loan'
];

// Find the English translations object
const englishMatch = content.match(/(const englishTranslations: Translations = \{)([\s\S]*?)(\n\};)/);

if (englishMatch) {
  let englishContent = englishMatch[2];
  
  // Add missing keys to English translations
  missingKeys.forEach(key => {
    if (!englishContent.includes(`${key}:`)) {
      console.log(`✅ Adding missing key '${key}' to English translations`);
      
      // Add the key with a placeholder value
      const keyLine = `  ${key}: '${key}',\n`;
      englishContent = englishContent.trim() + ',\n' + keyLine;
    }
  });
  
  // Replace the English translations section
  content = content.replace(
    /(const englishTranslations: Translations = \{)([\s\S]*?)(\n\};)/,
    `$1\n${englishContent.trim()}\n$3`
  );
}

// Write the fixed content back
fs.writeFileSync(translationsPath, content, 'utf8');

console.log('\n🎉 Fixed translation file!');
console.log('✨ Removed duplicate identifiers');
console.log('🔧 Added missing English translation keys');
console.log('📝 Cleaned up formatting');

console.log('\n💡 Next steps:');
console.log('1. Run type check to verify fixes');
console.log('2. Test the assets page functionality');
console.log('3. Verify Bengali translations display correctly');