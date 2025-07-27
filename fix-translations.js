const fs = require('fs');

console.log('Reading translations file...');
const content = fs.readFileSync('src/lib/i18n/translations.ts', 'utf8');

// Extract both sections manually
const enMatch = content.match(
  /const englishTranslations[^=]*=\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s
);
const bnMatch = content.match(
  /const bengaliTranslations[^=]*=\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s
);

if (!enMatch || !bnMatch) {
  console.log(
    'Could not find both englishTranslations and bengaliTranslations sections'
  );
  process.exit(1);
}

function extractUniqueKeys(sectionContent) {
  const lines = sectionContent.split('\n');
  const keys = new Map();

  for (const line of lines) {
    const trimmed = line.trim();
    const keyMatch = trimmed.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+),?\s*$/
    );
    if (keyMatch) {
      const key = keyMatch[1];
      let value = keyMatch[2];
      if (value.endsWith(',')) {
        value = value.slice(0, -1);
      }
      if (!keys.has(key)) {
        keys.set(key, value);
      }
    }
  }

  return keys;
}

console.log('Extracting unique keys...');
const enKeys = extractUniqueKeys(enMatch[1]);
const bnKeys = extractUniqueKeys(bnMatch[1]);

console.log('EN keys found:', enKeys.size);
console.log('BN keys found:', bnKeys.size);

// Generate deduplicated content
console.log('Generating new content...');
let newContent = '// LPG Distributor SaaS - Translations\n\n';
newContent += 'export interface Translations {\n';
for (const key of enKeys.keys()) {
  newContent += '  ' + key + ': string;\n';
}
newContent += '}\n\n';

newContent += 'export const en: Translations = {\n';
for (const [key, value] of enKeys) {
  newContent += '  ' + key + ': ' + value + ',\n';
}
newContent += '};\n\n';

newContent += 'export const bn: Translations = {\n';
for (const [key, value] of bnKeys) {
  newContent += '  ' + key + ': ' + value + ',\n';
}
newContent += '};\n';

console.log('Writing fixed file...');
fs.writeFileSync('src/lib/i18n/translations.ts', newContent);
console.log('Fixed translations file with deduplicated keys');
