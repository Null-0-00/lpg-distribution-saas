const fs = require('fs');
const path = require('path');

console.log('🧪 Complete Assets Translation Test...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Read the assets page
const pagePath = path.join(__dirname, 'src/app/dashboard/assets/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

// Extract Bengali translations section
const bengaliMatch = translationsContent.match(
  /const bengaliTranslations: Translations = \{([\s\S]*?)\n\};/
);

if (!bengaliMatch) {
  console.error('❌ Could not find Bengali translations object');
  process.exit(1);
}

const bengaliContent = bengaliMatch[1];

// All assets-related translations to test
const allAssetsTranslations = [
  // Core assets translations
  'assetsAndLiabilities',
  'companyAssets',
  'companyLiabilities',
  'addAssetsLiabilities',
  'netWorth',
  'depreciation',
  'assetName',
  'unitValue',
  'totalValue',
  'netValue',
  'fixedAsset',
  'currentAsset',
  'currentLiability',
  'longTermLiability',
  'editAsset',
  'deleteAsset',
  'editLiability',
  'deleteLiability',
  'assetDeletedSuccessfully',
  'liabilityDeletedSuccessfully',
  'areYouSureDeleteAsset',
  'areYouSureDeleteLiability',

  // New translations added
  'asset',
  'liabilityWord',
  'autoCalculated',
  'autoCalculatedFromInventory',
  'inventory',
  'setUnitPrice',
  'editable',
  'autoCalculatedCurrentAssets',
  'noAutoCalculatedAssetsFound',
  'autoCalculatedAssetsDescription',
  'updated',
  'created',
  'successfully',
  'failedToUpdateCreateEntry',
  'assetPlaceholder',
  'realTimeValuesLinkedToBusinessOperations',
];

console.log('🔍 Checking all assets translations:\n');

let allGood = true;
let translatedCount = 0;

allAssetsTranslations.forEach((key) => {
  const keyRegex = new RegExp(`\\s+${key}:\\s+'([^']+)'`, 'g');
  const match = keyRegex.exec(bengaliContent);

  if (match) {
    const translation = match[1];

    if (translation === key) {
      console.log(`❌ ${key}: Still has placeholder value`);
      allGood = false;
    } else if (translation.includes('TODO')) {
      console.log(`❌ ${key}: Still has TODO comment`);
      allGood = false;
    } else {
      console.log(`✅ ${key}: "${translation}"`);
      translatedCount++;
    }
  } else {
    console.log(`❌ ${key}: Not found in Bengali translations`);
    allGood = false;
  }
});

console.log(
  `\n📊 Translation Status: ${translatedCount}/${allAssetsTranslations.length} keys translated\n`
);

// Check page usage of translations
console.log('📄 Checking page component translation usage:\n');

const translationUsageChecks = [
  {
    key: 'asset',
    usage: "t('asset')",
    description: 'Asset word in success messages',
  },
  {
    key: 'liabilityWord',
    usage: "t('liabilityWord')",
    description: 'Liability word in success messages',
  },
  {
    key: 'autoCalculated',
    usage: "t('autoCalculated')",
    description: 'Auto-calculated text',
  },
  {
    key: 'autoCalculatedFromInventory',
    usage: "t('autoCalculatedFromInventory')",
    description: 'Auto-calculated from inventory text',
  },
  {
    key: 'currentAsset',
    usage: "t('currentAsset')",
    description: 'Current Asset labels',
  },
  {
    key: 'inventory',
    usage: "t('inventory')",
    description: 'Inventory labels',
  },
  {
    key: 'setUnitPrice',
    usage: "t('setUnitPrice')",
    description: 'Set unit price text',
  },
  {
    key: 'editable',
    usage: "t('editable')",
    description: 'Editable text',
  },
  {
    key: 'autoCalculatedCurrentAssets',
    usage: "t('autoCalculatedCurrentAssets')",
    description: 'Auto-Calculated Current Assets title',
  },
  {
    key: 'successfully',
    usage: "t('successfully')",
    description: 'Successfully text in messages',
  },
];

let usageGood = true;

translationUsageChecks.forEach((check) => {
  if (pageContent.includes(check.usage)) {
    console.log(`✅ ${check.description}: Translation call found`);
  } else {
    console.log(`❌ ${check.description}: Translation call missing`);
    usageGood = false;
  }
});

// Check for remaining hardcoded strings
console.log('\n🔍 Checking for remaining hardcoded English strings...\n');

const hardcodedPatterns = [
  {
    pattern: /'Asset.*successfully'/gi,
    description: 'Asset success messages',
  },
  {
    pattern: /'Liability.*successfully'/gi,
    description: 'Liability success messages',
  },
  {
    pattern: /'Auto-calculated'/gi,
    description: 'Auto-calculated text',
  },
  {
    pattern: /'Current Asset'/gi,
    description: 'Current Asset labels',
  },
  {
    pattern: /'Fixed Asset'/gi,
    description: 'Fixed Asset labels',
  },
  {
    pattern: /'Set unit price'/gi,
    description: 'Set unit price text',
  },
  {
    pattern: /'Editable'/gi,
    description: 'Editable text',
  },
];

let remainingHardcoded = [];

hardcodedPatterns.forEach((check) => {
  const matches = pageContent.match(check.pattern);
  if (matches) {
    matches.forEach((match) => {
      // Skip if it's already a translation call
      if (!match.includes('t(') && !match.includes('{t(')) {
        remainingHardcoded.push({
          text: match,
          type: check.description,
        });
      }
    });
  }
});

if (remainingHardcoded.length > 0) {
  console.log(
    `⚠️  Found ${remainingHardcoded.length} remaining hardcoded strings:`
  );
  remainingHardcoded.forEach((item) => {
    console.log(`   - ${item.type}: ${item.text}`);
  });
} else {
  console.log('✅ No hardcoded English strings found.');
}

// Final summary
console.log('\n📊 Final Summary:');
if (allGood && usageGood && remainingHardcoded.length === 0) {
  console.log(
    '🎉 Perfect! All assets translations are complete and properly implemented!'
  );
  console.log('✨ The assets page is now fully localized for Bengali users.');
  console.log(
    '🚀 Users can manage assets and liabilities with a complete Bengali interface.'
  );

  console.log('\n🌟 Features now available in Bengali:');
  console.log('   • Assets and liabilities management');
  console.log('   • Auto-calculated cylinder assets from inventory');
  console.log('   • Asset depreciation calculations');
  console.log('   • Success/error messages');
  console.log('   • Form labels and placeholders');
  console.log('   • Table headers and status indicators');
  console.log('   • Action buttons and confirmations');
} else {
  console.log('⚠️  Some issues still need attention:');
  if (!allGood) {
    console.log('   • Some translations are missing or incomplete');
  }
  if (!usageGood) {
    console.log('   • Some translation calls are missing in the component');
  }
  if (remainingHardcoded.length > 0) {
    console.log('   • Some hardcoded English strings remain');
  }
}

console.log('\n💡 Testing checklist:');
console.log('1. ✅ Navigate to http://localhost:3000/dashboard/assets');
console.log('2. ✅ Switch language to Bengali in settings');
console.log('3. ✅ Verify page title and headers display in Bengali');
console.log('4. ✅ Test adding new assets and liabilities');
console.log('5. ✅ Test editing existing assets and liabilities');
console.log('6. ✅ Test deleting assets and liabilities');
console.log('7. ✅ Verify all success/error messages appear in Bengali');
console.log('8. ✅ Check cylinder asset unit price editing');
console.log('9. ✅ Verify auto-calculated assets section displays correctly');
console.log('10. ✅ Test all form validations and error states');
