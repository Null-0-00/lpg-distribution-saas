const fs = require('fs');
const path = require('path');

console.log('🧪 Testing onboarding translations...\n');

// Read the translations file
const filePath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Extract Bengali translations section
const bengaliMatch = content.match(
  /const bengaliTranslations: Translations = \{([\s\S]*?)\n\};/
);

if (!bengaliMatch) {
  console.error('❌ Could not find Bengali translations object');
  process.exit(1);
}

const bengaliContent = bengaliMatch[1];

// Key onboarding translations to test
const keyOnboardingTranslations = [
  'welcomeToOnboarding',
  'setupYourBusinessData',
  'companyNames',
  'productSetup',
  'inventoryQuantities',
  'driversSetup',
  'receivablesSetup',
  'skipOnboarding',
  'completing',
  'completeSetup',
  'addCompanyNames',
  'addNewCompany',
  'enterCompanyName',
  'addYourDrivers',
  'enterDriverName',
  'setupReceivables',
  'driverReceivables',
];

console.log('🔍 Checking key onboarding translations:\n');

let allGood = true;

keyOnboardingTranslations.forEach((key) => {
  // Look for the key in Bengali translations
  const keyRegex = new RegExp(`\\s+${key}:\\s+'([^']+)'`, 'g');
  const match = keyRegex.exec(bengaliContent);

  if (match) {
    const translation = match[1];

    // Check if it's still a placeholder (same as key name)
    if (translation === key) {
      console.log(`❌ ${key}: Still has placeholder value`);
      allGood = false;
    } else if (translation.includes('TODO')) {
      console.log(`❌ ${key}: Still has TODO comment`);
      allGood = false;
    } else {
      console.log(`✅ ${key}: "${translation}"`);
    }
  } else {
    console.log(`❌ ${key}: Not found in Bengali translations`);
    allGood = false;
  }
});

console.log('\n📊 Summary:');
if (allGood) {
  console.log('🎉 All key onboarding translations are properly set!');
  console.log(
    '✨ The onboarding flow should now display correctly in Bengali.'
  );
} else {
  console.log('⚠️  Some onboarding translations still need attention.');
}

// Additional check for any remaining placeholder patterns
const placeholderPattern = /(\w+):\s+'\1',/g;
const placeholders = [];
let match;

while ((match = placeholderPattern.exec(bengaliContent)) !== null) {
  placeholders.push(match[1]);
}

if (placeholders.length > 0) {
  console.log(
    `\n⚠️  Found ${placeholders.length} potential placeholder translations:`
  );
  placeholders.slice(0, 10).forEach((key) => {
    console.log(`   - ${key}`);
  });
  if (placeholders.length > 10) {
    console.log(`   ... and ${placeholders.length - 10} more`);
  }
} else {
  console.log('\n✅ No placeholder translations found in Bengali section.');
}
