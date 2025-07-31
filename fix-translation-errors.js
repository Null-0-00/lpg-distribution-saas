const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing translation errors...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

console.log('1. Removing duplicate properties in Bengali translations...\n');

// Remove duplicate properties in Bengali translations
const duplicatesToRemove = [
  {
    key: 'outstandingCashReceivablesFromDrivers',
    pattern: /\s+outstandingCashReceivablesFromDrivers:\s*'[^']*',?\s*\n/g,
  },
  {
    key: 'availableCashCalculatedFromDeposits',
    pattern: /\s+availableCashCalculatedFromDeposits:\s*'[^']*',?\s*\n/g,
  },
  {
    key: 'cashInHand',
    pattern: /\s+cashInHand:\s*'[^']*',?\s*\n/g,
  },
];

duplicatesToRemove.forEach(({ key, pattern }) => {
  const matches = content.match(pattern);
  if (matches && matches.length > 1) {
    console.log(
      `✅ Found ${matches.length} instances of '${key}' - keeping first, removing duplicates`
    );

    let count = 0;
    content = content.replace(pattern, (match) => {
      count++;
      if (count === 1) {
        return match; // Keep the first occurrence
      } else {
        console.log(`   - Removing duplicate #${count}`);
        return ''; // Remove subsequent occurrences
      }
    });
  }
});

console.log('\n2. Adding missing keys to Bengali translations...\n');

// Find the Bengali translations object
const bengaliMatch = content.match(
  /(const bengaliTranslations: Translations = \{)([\s\S]*?)(\n\};)/
);

if (bengaliMatch) {
  let bengaliContent = bengaliMatch[2];

  // Add missing keys
  const missingKeys = [
    { key: 'emptyCylinders', value: 'খালি সিলিন্ডার' },
    { key: 'fullCylinders', value: 'পূর্ণ সিলিন্ডার' },
  ];

  missingKeys.forEach(({ key, value }) => {
    if (!bengaliContent.includes(`${key}:`)) {
      console.log(`✅ Adding missing key '${key}' to Bengali translations`);
      bengaliContent = bengaliContent.trim() + `,\n  ${key}: '${value}'`;
    }
  });

  // Replace the Bengali translations section
  content = content.replace(
    /(const bengaliTranslations: Translations = \{)([\s\S]*?)(\n\};)/,
    `$1\n${bengaliContent.trim()}\n$3`
  );
}

console.log('\n3. Cleaning up formatting...\n');

// Clean up any multiple empty lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Clean up any trailing commas before closing braces
content = content.replace(/,(\s*\n\s*\})/g, '$1');

// Write the fixed content back
fs.writeFileSync(translationsPath, content, 'utf8');

console.log('🎉 Fixed translation errors!');
console.log('✨ Removed duplicate properties');
console.log('🔧 Added missing keys');
console.log('📝 Cleaned up formatting');

console.log('\n💡 Next steps:');
console.log('1. Run type check to verify fixes');
console.log('2. Test the assets page functionality');
console.log('3. Verify Bengali translations display correctly');
