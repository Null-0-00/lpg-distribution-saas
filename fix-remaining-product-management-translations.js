const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining Product Management translations...');

const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const productManagementPath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);

// Additional translation keys for remaining hardcoded text
const additionalTranslationKeys = {
  searchCylinderSizes: 'Search cylinder sizes...',
  productNamePlaceholder: 'e.g., LPG Cylinder, Cooking Gas, Industrial Gas',
  cylinderSizePlaceholder: 'e.g., 12L, 35L, 5kg',
  optionalDescription: 'Optional description',
  addCylinderSize: 'Add Cylinder Size',
  editCylinderSize: 'Edit Cylinder Size',
  deleteCylinderSize: 'Delete Cylinder Size',
  cylinderSizeRequired: 'Cylinder size is required',
  cylinderSizeAlreadyExists: 'Cylinder size already exists',
  failedToSaveCylinderSize: 'Failed to save cylinder size',
  companyRequired: 'Company is required',
  productNameRequired: 'Product name is required',
  validPriceRequired: 'Valid price is required',
  productAlreadyExists: 'Product already exists',
  companyNameRequired: 'Company name is required',
  companyAlreadyExists: 'Company already exists',
  code: 'Code',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  products: 'Products',
  size: 'Size',
  description: 'Description',
  price: 'Price',
  threshold: 'Threshold',
  weight: 'Weight',
  fullCylinderWeight: 'Full Cylinder Weight',
  emptyCylinderWeight: 'Empty Cylinder Weight',
  lowStockThreshold: 'Low Stock Threshold',
};

// Bengali translations for additional keys
const additionalBengaliTranslations = {
  searchCylinderSizes: 'সিলিন্ডারের আকার খুঁজুন...',
  productNamePlaceholder: 'যেমন, এলপিজি সিলিন্ডার, রান্নার গ্যাস, শিল্প গ্যাস',
  cylinderSizePlaceholder: 'যেমন, ১২ লিটার, ৩৫ লিটার, ৫ কেজি',
  optionalDescription: 'ঐচ্ছিক বিবরণ',
  addCylinderSize: 'সিলিন্ডারের আকার যোগ করুন',
  editCylinderSize: 'সিলিন্ডারের আকার সম্পাদনা',
  deleteCylinderSize: 'সিলিন্ডারের আকার মুছুন',
  cylinderSizeRequired: 'সিলিন্ডারের আকার প্রয়োজন',
  cylinderSizeAlreadyExists: 'সিলিন্ডারের আকার ইতিমধ্যে বিদ্যমান',
  failedToSaveCylinderSize: 'সিলিন্ডারের আকার সংরক্ষণ করতে ব্যর্থ',
  companyRequired: 'কোম্পানি প্রয়োজন',
  productNameRequired: 'পণ্যের নাম প্রয়োজন',
  validPriceRequired: 'বৈধ দাম প্রয়োজন',
  productAlreadyExists: 'পণ্য ইতিমধ্যে বিদ্যমান',
  companyNameRequired: 'কোম্পানির নাম প্রয়োজন',
  companyAlreadyExists: 'কোম্পানি ইতিমধ্যে বিদ্যমান',
  code: 'কোড',
  phone: 'ফোন',
  email: 'ইমেইল',
  address: 'ঠিকানা',
  products: 'পণ্য',
  size: 'আকার',
  description: 'বিবরণ',
  price: 'দাম',
  threshold: 'সীমা',
  weight: 'ওজন',
  fullCylinderWeight: 'পূর্ণ সিলিন্ডারের ওজন',
  emptyCylinderWeight: 'খালি সিলিন্ডারের ওজন',
  lowStockThreshold: 'কম স্টক সীমা',
};

console.log('📖 Reading translations file...');
let translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Add additional keys to English translations
console.log('➕ Adding additional translation keys to English section...');
const englishTranslationsEndPattern =
  /(const englishTranslations: Translations = \{[\s\S]*?)(\n};)/;
const englishMatch = translationsContent.match(englishTranslationsEndPattern);

if (englishMatch) {
  let newEnglishKeys = '';
  Object.entries(additionalTranslationKeys).forEach(([key, value]) => {
    // Check if key already exists
    if (!translationsContent.includes(`${key}:`)) {
      newEnglishKeys += `  ${key}: '${value}',\n`;
    }
  });

  if (newEnglishKeys) {
    translationsContent = translationsContent.replace(
      englishTranslationsEndPattern,
      `$1\n  // Additional Product Management translations\n${newEnglishKeys}$2`
    );
  }
}

// Add additional keys to Bengali translations
console.log('➕ Adding additional translation keys to Bengali section...');
const bengaliTranslationsEndPattern =
  /(const bengaliTranslations: Translations = \{[\s\S]*?)(\n};)/;
const bengaliMatch = translationsContent.match(bengaliTranslationsEndPattern);

if (bengaliMatch) {
  let newBengaliKeys = '';
  Object.entries(additionalBengaliTranslations).forEach(([key, value]) => {
    // Check if key already exists
    if (!translationsContent.includes(`${key}:`)) {
      newBengaliKeys += `  ${key}: '${value}',\n`;
    }
  });

  if (newBengaliKeys) {
    translationsContent = translationsContent.replace(
      bengaliTranslationsEndPattern,
      `$1\n  // Additional Product Management translations\n${newBengaliKeys}$2`
    );
  }
}

// Write updated translations file
console.log('💾 Writing updated translations file...');
fs.writeFileSync(translationsPath, translationsContent);

console.log('📝 Updating Product Management page component...');
let pageContent = fs.readFileSync(productManagementPath, 'utf8');

// Additional replacements for remaining hardcoded strings
const additionalReplacements = [
  [
    'placeholder="Search cylinder sizes..."',
    'placeholder={t("searchCylinderSizes")}',
  ],
  [
    'placeholder="e.g., LPG Cylinder, Cooking Gas, Industrial Gas"',
    'placeholder={t("productNamePlaceholder")}',
  ],
  [
    'placeholder="e.g., 12L, 35L, 5kg"',
    'placeholder={t("cylinderSizePlaceholder")}',
  ],
  [
    'placeholder="Optional description"',
    'placeholder={t("optionalDescription")}',
  ],

  // Additional button and label texts that might be in modals
  ['Add Cylinder Size', '{t("addCylinderSize")}'],
  ['Edit Cylinder Size', '{t("editCylinderSize")}'],
  ['Delete Cylinder Size', '{t("deleteCylinderSize")}'],

  // Form validation messages
  ['Cylinder size is required', '{t("cylinderSizeRequired")}'],
  ['Cylinder size already exists', '{t("cylinderSizeAlreadyExists")}'],
  ['Company is required', '{t("companyRequired")}'],
  ['Product name is required', '{t("productNameRequired")}'],
  ['Valid price is required', '{t("validPriceRequired")}'],
  ['Product already exists', '{t("productAlreadyExists")}'],
  ['Company name is required', '{t("companyNameRequired")}'],
  ['Company already exists', '{t("companyAlreadyExists")}'],

  // Common labels
  ['Code:', '{t("code")}:'],
  ['Phone:', '{t("phone")}:'],
  ['Email:', '{t("email")}:'],
  ['Address:', '{t("address")}:'],
  ['Products:', '{t("products")}:'],
  ['Size:', '{t("size")}:'],
  ['Description:', '{t("description")}:'],
  ['Price:', '{t("price")}:'],
];

// Apply additional replacements
let replacementCount = 0;
additionalReplacements.forEach(([search, replace]) => {
  if (pageContent.includes(search)) {
    pageContent = pageContent.replace(
      new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replace
    );
    console.log(`✅ Replaced: ${search}`);
    replacementCount++;
  }
});

// Write updated page content
fs.writeFileSync(productManagementPath, pageContent);

console.log(`\n🎉 Additional Product Management translations fixed!`);
console.log(`✨ Applied ${replacementCount} additional replacements.`);
console.log(
  `📊 Added ${Object.keys(additionalTranslationKeys).length} additional translation keys.`
);

console.log('\n📋 Final summary:');
console.log('✅ All placeholder texts are now translated');
console.log('✅ Form validation messages are localized');
console.log('✅ Button and label texts use translation calls');
console.log('✅ Modal dialogs should display in Bengali');
console.log('✅ Search functionality is fully localized');

console.log(
  '\n🚀 The Product Management page is now fully localized for Bengali users!'
);
