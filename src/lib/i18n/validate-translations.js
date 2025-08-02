// Simple validation script for translations
const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsContent = fs.readFileSync(
  path.join(__dirname, 'translations.ts'),
  'utf8'
);

// Extract the translation objects using regex
const englishMatch = translationsContent.match(
  /const englishTranslations: Translations = \{([\s\S]*?)\};/m
);
const bengaliMatch = translationsContent.match(
  /const bengaliTranslations: Translations = \{([\s\S]*?)\};/m
);

if (!englishMatch || !bengaliMatch) {
  console.error('Could not find translation objects');
  process.exit(1);
}

// Parse the keys (simplified approach)
const extractKeys = (objStr) => {
  const keys = [];
  const lines = objStr.split('\n');
  lines.forEach((line) => {
    const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (match) {
      keys.push(match[1]);
    }
  });
  return keys;
};

const englishKeys = extractKeys(englishMatch[1]);
const bengaliKeys = extractKeys(bengaliMatch[1]);

console.log('English translations:', englishKeys.length, 'keys');
console.log('Bengali translations:', bengaliKeys.length, 'keys');

// Find missing keys
const missingInBengali = englishKeys.filter(
  (key) => !bengaliKeys.includes(key)
);
const missingInEnglish = bengaliKeys.filter(
  (key) => !englishKeys.includes(key)
);

console.log('\nMissing in Bengali:', missingInBengali.length);
if (missingInBengali.length > 0) {
  console.log(missingInBengali.slice(0, 10).join(', '));
  if (missingInBengali.length > 10) {
    console.log(`... and ${missingInBengali.length - 10} more`);
  }
}

console.log('\nMissing in English:', missingInEnglish.length);
if (missingInEnglish.length > 0) {
  console.log(missingInEnglish.join(', '));
}

// Check for potential duplicates
const englishSet = new Set(englishKeys);
const bengaliSet = new Set(bengaliKeys);

console.log('\nPotential duplicates:');
console.log('English duplicates:', englishKeys.length - englishSet.size);
console.log('Bengali duplicates:', bengaliKeys.length - bengaliSet.size);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`English: ${englishKeys.length} unique keys`);
console.log(`Bengali: ${bengaliKeys.length} unique keys`);
console.log(`Missing Bengali translations: ${missingInBengali.length}`);
console.log(`Missing English translations: ${missingInEnglish.length}`);
console.log(
  `Translation completeness: ${((bengaliKeys.length / englishKeys.length) * 100).toFixed(1)}%`
);
