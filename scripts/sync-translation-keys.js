const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/i18n/translations.ts');

console.log('Reading translations file...');
const content = fs.readFileSync(filePath, 'utf8');

// Extract keys from English translations
const englishMatch = content.match(
  /const englishTranslations: Translations = \{([\s\S]*?)\n\};/
);
if (!englishMatch) {
  console.error('Could not find English translations object');
  process.exit(1);
}

const englishContent = englishMatch[1];
const englishKeys = new Set();

// Extract all keys from English translations
const keyMatches = englishContent.match(/^\s*(\w+):/gm);
if (keyMatches) {
  keyMatches.forEach((match) => {
    const key = match.trim().replace(':', '');
    englishKeys.add(key);
  });
}

console.log(`Found ${englishKeys.size} keys in English translations`);

// Extract keys from Bengali translations
const bengaliMatch = content.match(
  /const bengaliTranslations: Translations = \{([\s\S]*?)\n\};/
);
if (!bengaliMatch) {
  console.error('Could not find Bengali translations object');
  process.exit(1);
}

const bengaliContent = bengaliMatch[1];
const bengaliKeys = new Set();

// Extract all keys from Bengali translations
const bengaliKeyMatches = bengaliContent.match(/^\s*(\w+):/gm);
if (bengaliKeyMatches) {
  bengaliKeyMatches.forEach((match) => {
    const key = match.trim().replace(':', '');
    bengaliKeys.add(key);
  });
}

console.log(`Found ${bengaliKeys.size} keys in Bengali translations`);

// Find missing keys
const missingKeys = [];
englishKeys.forEach((key) => {
  if (!bengaliKeys.has(key)) {
    missingKeys.push(key);
  }
});

console.log(`Missing ${missingKeys.length} keys in Bengali translations`);

if (missingKeys.length > 0) {
  console.log(
    'Missing keys:',
    missingKeys.slice(0, 10).join(', '),
    missingKeys.length > 10 ? '...' : ''
  );

  // For now, let's just add placeholder translations for missing keys
  let updatedContent = content;

  // Find the end of Bengali translations object
  const bengaliEndMatch = content.match(
    /(const bengaliTranslations: Translations = \{[\s\S]*?)\n\};/
  );
  if (bengaliEndMatch) {
    let bengaliObjectContent = bengaliEndMatch[1];

    // Add missing keys with placeholder values
    missingKeys.forEach((key) => {
      bengaliObjectContent += `\n  ${key}: '${key}', // TODO: Add Bengali translation`;
    });

    updatedContent = content.replace(
      /const bengaliTranslations: Translations = \{[\s\S]*?\n\};/,
      bengaliObjectContent + '\n};'
    );

    console.log('Writing updated file...');
    fs.writeFileSync(filePath, updatedContent);
    console.log('Added placeholder translations for missing keys');
  }
} else {
  console.log('All keys are present in Bengali translations');
}
