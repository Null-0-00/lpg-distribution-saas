const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

// Extract all properties from the Translations interface
function extractInterfaceProperties(content) {
  const interfaceMatch = content.match(/export interface Translations \{([\s\S]*?)\}/);
  if (!interfaceMatch) {
    throw new Error('Could not find Translations interface');
  }
  
  const interfaceContent = interfaceMatch[1];
  const properties = [];
  
  // Match property definitions (property: string;)
  const propertyRegex = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*string\s*;/gm;
  let match;
  
  while ((match = propertyRegex.exec(interfaceContent)) !== null) {
    properties.push(match[1]);
  }
  
  return properties;
}

// Extract existing properties from a translation object
function extractExistingProperties(content, objectName) {
  const objectMatch = content.match(new RegExp(`const ${objectName}: Translations = \\{([\\s\\S]*?)\\};`));
  if (!objectMatch) {
    throw new Error(`Could not find ${objectName} object`);
  }
  
  const objectContent = objectMatch[1];
  const properties = [];
  
  // Match property definitions (property: 'value',)
  const propertyRegex = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:/gm;
  let match;
  
  while ((match = propertyRegex.exec(objectContent)) !== null) {
    properties.push(match[1]);
  }
  
  return properties;
}

// Generate default English values for missing properties
function generateEnglishValue(propertyName) {
  // Convert camelCase to readable text
  const readable = propertyName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Special cases for common patterns
  if (propertyName.includes('Placeholder')) {
    return `Enter ${readable.replace(' Placeholder', '').toLowerCase()}...`;
  }
  if (propertyName.includes('Required')) {
    return `${readable.replace(' Required', '')} is required`;
  }
  if (propertyName.includes('Failed')) {
    return `Failed to ${readable.replace('Failed To ', '').toLowerCase()}`;
  }
  if (propertyName.includes('Loading')) {
    return `Loading ${readable.replace('Loading ', '').toLowerCase()}...`;
  }
  if (propertyName.includes('Error')) {
    return `Error: ${readable.replace(' Error', '').toLowerCase()}`;
  }
  if (propertyName.includes('Success')) {
    return `${readable.replace(' Success', '')} successful`;
  }
  
  return readable;
}

// Generate Bengali placeholder for missing properties
function generateBengaliValue(propertyName) {
  return `${propertyName}_bn`; // Placeholder that indicates it needs Bengali translation
}

try {
  console.log('Analyzing translations file...');
  
  // Extract all required properties from interface
  const allProperties = extractInterfaceProperties(content);
  console.log(`Found ${allProperties.length} properties in interface`);
  
  // Extract existing properties from both translation objects
  const englishProperties = extractExistingProperties(content, 'englishTranslations');
  const bengaliProperties = extractExistingProperties(content, 'bengaliTranslations');
  
  console.log(`English translations has ${englishProperties.length} properties`);
  console.log(`Bengali translations has ${bengaliProperties.length} properties`);
  
  // Find missing properties
  const missingEnglish = allProperties.filter(prop => !englishProperties.includes(prop));
  const missingBengali = allProperties.filter(prop => !bengaliProperties.includes(prop));
  
  console.log(`Missing from English: ${missingEnglish.length} properties`);
  console.log(`Missing from Bengali: ${missingBengali.length} properties`);
  
  if (missingEnglish.length === 0 && missingBengali.length === 0) {
    console.log('No missing properties found!');
    return;
  }
  
  // Generate additions for English translations
  let englishAdditions = '';
  if (missingEnglish.length > 0) {
    englishAdditions = '\n  // Auto-generated missing properties\n';
    missingEnglish.forEach(prop => {
      const value = generateEnglishValue(prop);
      englishAdditions += `  ${prop}: '${value}',\n`;
    });
  }
  
  // Generate additions for Bengali translations
  let bengaliAdditions = '';
  if (missingBengali.length > 0) {
    bengaliAdditions = '\n  // Auto-generated missing properties (need Bengali translation)\n';
    missingBengali.forEach(prop => {
      const value = generateBengaliValue(prop);
      bengaliAdditions += `  ${prop}: '${value}', // TODO: Add Bengali translation\n`;
    });
  }
  
  // Update the content
  let updatedContent = content;
  
  // Add missing properties to English translations
  if (englishAdditions) {
    updatedContent = updatedContent.replace(
      /(const englishTranslations: Translations = \{[\s\S]*?)(\n\};)/,
      `$1${englishAdditions}$2`
    );
  }
  
  // Add missing properties to Bengali translations
  if (bengaliAdditions) {
    updatedContent = updatedContent.replace(
      /(const bengaliTranslations: Translations = \{[\s\S]*?)(\n\};)/,
      `$1${bengaliAdditions}$2`
    );
  }
  
  // Write the updated content
  fs.writeFileSync(translationsPath, updatedContent);
  
  console.log('✅ Successfully updated translations file!');
  console.log(`Added ${missingEnglish.length} properties to English translations`);
  console.log(`Added ${missingBengali.length} properties to Bengali translations`);
  
} catch (error) {
  console.error('❌ Error fixing translations:', error.message);
  process.exit(1);
}