const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/i18n/translations.ts');

console.log('Reading translations file...');
const content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing duplicate keys...');

// Split content into lines for processing
const lines = content.split('\n');
const fixedLines = [];
const seenKeys = new Set();
let inInterface = false;
let inEnglishObject = false;
let inBengaliObject = false;
let braceLevel = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmedLine = line.trim();
  
  // Track if we're in the interface definition
  if (trimmedLine.includes('export interface Translations')) {
    inInterface = true;
    seenKeys.clear();
    fixedLines.push(line);
    continue;
  }
  
  // Track if we're in the English translations object
  if (trimmedLine.includes('const englishTranslations: Translations = {')) {
    inInterface = false;
    inEnglishObject = true;
    seenKeys.clear();
    braceLevel = 0;
    fixedLines.push(line);
    continue;
  }
  
  // Track if we're in the Bengali translations object
  if (trimmedLine.includes('const bengaliTranslations: Translations = {')) {
    inEnglishObject = false;
    inBengaliObject = true;
    seenKeys.clear();
    braceLevel = 0;
    fixedLines.push(line);
    continue;
  }
  
  // Track brace levels to know when objects end
  if (inEnglishObject || inBengaliObject) {
    braceLevel += (line.match(/{/g) || []).length;
    braceLevel -= (line.match(/}/g) || []).length;
    
    if (braceLevel <= 0) {
      inEnglishObject = false;
      inBengaliObject = false;
      fixedLines.push(line);
      continue;
    }
  }
  
  // Check for duplicate keys in interface or objects
  if (inInterface || inEnglishObject || inBengaliObject) {
    // Extract key name from lines like "  keyName: string;" or "  keyName: 'value',"
    const keyMatch = trimmedLine.match(/^(\w+):/);
    if (keyMatch) {
      const keyName = keyMatch[1];
      
      if (seenKeys.has(keyName)) {
        console.log(`Removing duplicate key: ${keyName} at line ${i + 1}`);
        continue; // Skip this duplicate line
      } else {
        seenKeys.add(keyName);
      }
    }
  }
  
  // End of interface
  if (inInterface && trimmedLine === '}') {
    inInterface = false;
  }
  
  fixedLines.push(line);
}

console.log('Writing fixed file...');
fs.writeFileSync(filePath, fixedLines.join('\n'));

console.log('Translation duplicates fixed!');