const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/lib/i18n/translations.ts', 'utf8');

console.log('Fixing duplicate translation keys...\n');

// List of keys that are duplicated and need to be removed from the Customer Management sections
const duplicateKeys = [
  'description',
  'selectDriver',
  'customerName',
  'address',
  'retail',
  'notes',
  'active',
];

// Remove duplicates from interface
duplicateKeys.forEach((key) => {
  // Remove from Customer Management Tab section in interface
  const interfaceRegex = new RegExp(`\\s*${key}: string;\\n`, 'g');
  content = content.replace(interfaceRegex, '');
});

// Remove duplicates from English translations
duplicateKeys.forEach((key) => {
  // Remove duplicate entries from English translations
  const englishRegex = new RegExp(`\\s*${key}: '[^']*',\\n`, 'g');
  let matches = content.match(englishRegex);
  if (matches && matches.length > 1) {
    // Keep the first occurrence, remove the rest
    for (let i = 1; i < matches.length; i++) {
      content = content.replace(matches[i], '');
    }
  }
});

// Remove duplicates from Bengali translations
duplicateKeys.forEach((key) => {
  // Remove duplicate entries from Bengali translations
  const bengaliRegex = new RegExp(`\\s*${key}: '[^']*',\\n`, 'g');
  let matches = content.match(bengaliRegex);
  if (matches && matches.length > 1) {
    // Keep the first occurrence, remove the rest
    for (let i = 1; i < matches.length; i++) {
      content = content.replace(matches[i], '');
    }
  }
});

// Write the fixed content back
fs.writeFileSync('src/lib/i18n/translations.ts', content);

console.log('✅ Fixed duplicate translation keys');
console.log('🔍 Run "npx tsc --noEmit" to verify fixes');
