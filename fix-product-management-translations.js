const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Product Management page translations...');

// First, let's add the missing translation keys to the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const productManagementPath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);

// New translation keys needed for product management
const newTranslationKeys = {
  // Product Management specific
  addCompany: 'Add Company',
  addProduct: 'Add Product',
  searchCompanies: 'Search companies...',
  searchProducts: 'Search products...',
  totalProducts: 'Total Products',
  activeProducts: 'Active Products',
  lowStock: 'Low Stock',
  totalStock: 'Total Stock',
  companies: 'Companies',
  productName: 'Product Name',
  cylinderSize: 'Cylinder Size',
  currentPrice: 'Current Price',
  currentStock: 'Current Stock',
  lowStockAlert: 'Low Stock Alert',
  created: 'Created',
  actions: 'Actions',
  active: 'Active',
  inactive: 'Inactive',
  editCompany: 'Edit Company',
  deleteCompany: 'Delete Company',
  editProduct: 'Edit Product',
  deleteProduct: 'Delete Product',
  cylinderSizes: 'Cylinder Sizes',
  full: 'Full',
  empty: 'Empty',
  loading: 'Loading...',
  units: 'units',
  clickToDeactivate: 'Click to deactivate',
  clickToActivate: 'Click to activate',
  product: 'product',
  areYouSureDeleteCompany:
    'Are you sure you want to delete this company? This will also delete all associated products.',
  areYouSureDeleteProduct: 'Are you sure you want to delete this product?',
  areYouSureDeleteCylinderSize:
    'Are you sure you want to delete this cylinder size?',
  failedToSaveCompany: 'Failed to save company',
  failedToSaveProduct: 'Failed to save product',
  failedToDeleteProduct: 'Failed to delete product',
  unknownError: 'Unknown error',
  companyCreatedUpdatedSuccessfully: 'Company created/updated successfully',
  productCreatedUpdatedSuccessfully: 'Product created/updated successfully',
  productDeletedSuccessfully: 'Product deleted successfully',
  refreshingList: 'refreshing list...',
  productListRefreshed: 'Product list refreshed',
  productListRefreshedAfterDeletion: 'Product list refreshed after deletion',
  errorFetchingCompanies: 'Error fetching companies',
  errorFetchingProducts: 'Error fetching products',
  errorFetchingCylinderSizes: 'Error fetching cylinder sizes',
  errorSavingCompany: 'Error saving company',
  errorSavingProduct: 'Error saving product',
  errorDeletingCompany: 'Error deleting company',
  errorDeletingProduct: 'Error deleting product',
  errorDeletingCylinderSize: 'Error deleting cylinder size',
  errorTogglingProductStatus: 'Error toggling product status',
  errorSavingCylinderSize: 'Error saving cylinder size',
};

// Bengali translations for the new keys
const bengaliTranslations = {
  addCompany: 'কোম্পানি যোগ করুন',
  addProduct: 'পণ্য যোগ করুন',
  searchCompanies: 'কোম্পানি খুঁজুন...',
  searchProducts: 'পণ্য খুঁজুন...',
  totalProducts: 'মোট পণ্য',
  activeProducts: 'সক্রিয় পণ্য',
  lowStock: 'কম স্টক',
  totalStock: 'মোট স্টক',
  companies: 'কোম্পানি',
  productName: 'পণ্যের নাম',
  cylinderSize: 'সিলিন্ডারের আকার',
  currentPrice: 'বর্তমান দাম',
  currentStock: 'বর্তমান স্টক',
  lowStockAlert: 'কম স্টক সতর্কতা',
  created: 'তৈরি',
  actions: 'কার্যক্রম',
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',
  editCompany: 'কোম্পানি সম্পাদনা',
  deleteCompany: 'কোম্পানি মুছুন',
  editProduct: 'পণ্য সম্পাদনা',
  deleteProduct: 'পণ্য মুছুন',
  cylinderSizes: 'সিলিন্ডারের আকার',
  full: 'পূর্ণ',
  empty: 'খালি',
  loading: 'লোড হচ্ছে...',
  units: 'ইউনিট',
  clickToDeactivate: 'নিষ্ক্রিয় করতে ক্লিক করুন',
  clickToActivate: 'সক্রিয় করতে ক্লিক করুন',
  product: 'পণ্য',
  areYouSureDeleteCompany:
    'আপনি কি নিশ্চিত যে এই কোম্পানিটি মুছে ফেলতে চান? এটি সমস্ত সংশ্লিষ্ট পণ্যও মুছে ফেলবে।',
  areYouSureDeleteProduct: 'আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?',
  areYouSureDeleteCylinderSize:
    'আপনি কি নিশ্চিত যে এই সিলিন্ডারের আকারটি মুছে ফেলতে চান?',
  failedToSaveCompany: 'কোম্পানি সংরক্ষণ করতে ব্যর্থ',
  failedToSaveProduct: 'পণ্য সংরক্ষণ করতে ব্যর্থ',
  failedToDeleteProduct: 'পণ্য মুছতে ব্যর্থ',
  unknownError: 'অজানা ত্রুটি',
  companyCreatedUpdatedSuccessfully: 'কোম্পানি সফলভাবে তৈরি/আপডেট হয়েছে',
  productCreatedUpdatedSuccessfully: 'পণ্য সফলভাবে তৈরি/আপডেট হয়েছে',
  productDeletedSuccessfully: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে',
  refreshingList: 'তালিকা রিফ্রেশ করা হচ্ছে...',
  productListRefreshed: 'পণ্যের তালিকা রিফ্রেশ হয়েছে',
  productListRefreshedAfterDeletion:
    'মুছে ফেলার পর পণ্যের তালিকা রিফ্রেশ হয়েছে',
  errorFetchingCompanies: 'কোম্পানি আনতে ত্রুটি',
  errorFetchingProducts: 'পণ্য আনতে ত্রুটি',
  errorFetchingCylinderSizes: 'সিলিন্ডারের আকার আনতে ত্রুটি',
  errorSavingCompany: 'কোম্পানি সংরক্ষণে ত্রুটি',
  errorSavingProduct: 'পণ্য সংরক্ষণে ত্রুটি',
  errorDeletingCompany: 'কোম্পানি মুছতে ত্রুটি',
  errorDeletingProduct: 'পণ্য মুছতে ত্রুটি',
  errorDeletingCylinderSize: 'সিলিন্ডারের আকার মুছতে ত্রুটি',
  errorTogglingProductStatus: 'পণ্যের স্থিতি পরিবর্তনে ত্রুটি',
  errorSavingCylinderSize: 'সিলিন্ডারের আকার সংরক্ষণে ত্রুটি',
};

console.log('📖 Reading translations file...');
let translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Add new keys to English translations
console.log('➕ Adding new translation keys to English section...');
const englishTranslationsEndPattern =
  /(\s+\/\/ All missing translation keys - English[\s\S]*?)(\n\s*};)/;
const englishMatch = translationsContent.match(englishTranslationsEndPattern);

if (englishMatch) {
  let newEnglishKeys = '';
  Object.entries(newTranslationKeys).forEach(([key, value]) => {
    newEnglishKeys += `  ${key}: '${value}',\n`;
  });

  translationsContent = translationsContent.replace(
    englishTranslationsEndPattern,
    `$1\n  // Product Management translations\n${newEnglishKeys}$2`
  );
} else {
  // If the pattern doesn't match, add before the closing brace of englishTranslations
  const englishEndPattern =
    /(const englishTranslations: Translations = \{[\s\S]*?)(\n};)/;
  const englishEndMatch = translationsContent.match(englishEndPattern);

  if (englishEndMatch) {
    let newEnglishKeys = '';
    Object.entries(newTranslationKeys).forEach(([key, value]) => {
      newEnglishKeys += `  ${key}: '${value}',\n`;
    });

    translationsContent = translationsContent.replace(
      englishEndPattern,
      `$1\n  // Product Management translations\n${newEnglishKeys}$2`
    );
  }
}

// Add new keys to Bengali translations
console.log('➕ Adding new translation keys to Bengali section...');
const bengaliTranslationsEndPattern =
  /(const bengaliTranslations: Translations = \{[\s\S]*?)(\n};)/;
const bengaliMatch = translationsContent.match(bengaliTranslationsEndPattern);

if (bengaliMatch) {
  let newBengaliKeys = '';
  Object.entries(bengaliTranslations).forEach(([key, value]) => {
    newBengaliKeys += `  ${key}: '${value}',\n`;
  });

  translationsContent = translationsContent.replace(
    bengaliTranslationsEndPattern,
    `$1\n  // Product Management translations\n${newBengaliKeys}$2`
  );
}

// Write updated translations file
console.log('💾 Writing updated translations file...');
fs.writeFileSync(translationsPath, translationsContent);

console.log('📝 Updating Product Management page component...');
let pageContent = fs.readFileSync(productManagementPath, 'utf8');

// Replace hardcoded strings with translation calls
const replacements = [
  // Tab labels
  [
    "{ id: 'cylinder-sizes', label: 'Cylinder Sizes', icon: Settings }",
    "{ id: 'cylinder-sizes', label: t('cylinderSizes'), icon: Settings }",
  ],

  // Placeholders
  ['placeholder="Search companies..."', 'placeholder={t("searchCompanies")}'],
  ['placeholder="Search products..."', 'placeholder={t("searchProducts")}'],

  // Button texts
  ['<span>Add Company</span>', '<span>{t("addCompany")}</span>'],
  ['<span>Add Product</span>', '<span>{t("addProduct")}</span>'],

  // Table headers
  ['Product Name', '{t("productName")}'],
  ['Cylinder Size', '{t("cylinderSize")}'],
  ['Current Price', '{t("currentPrice")}'],
  ['Current Stock', '{t("currentStock")}'],
  ['Low Stock Alert', '{t("lowStockAlert")}'],
  ['Created', '{t("created")}'],
  ['Actions', '{t("actions")}'],

  // Stats labels
  ['Total Products', '{t("totalProducts")}'],
  ['Active Products', '{t("activeProducts")}'],
  ['Low Stock', '{t("lowStock")}'],
  ['Total Stock', '{t("totalStock")}'],
  ['Companies', '{t("companies")}'],

  // Status texts
  [
    "{product.isActive ? 'Active' : 'Inactive'}",
    '{product.isActive ? t("active") : t("inactive")}',
  ],

  // Tooltips
  ['title="Edit Company"', 'title={t("editCompany")}'],
  ['title="Delete Company"', 'title={t("deleteCompany")}'],
  ['title="Edit Product"', 'title={t("editProduct")}'],
  ['title="Delete Product"', 'title={t("deleteProduct")}'],

  // Stock display
  [
    '{product.inventory.fullCylinders} Full',
    '{product.inventory.fullCylinders} {t("full")}',
  ],
  [
    '{product.inventory.emptyCylinders} Empty',
    '{product.inventory.emptyCylinders} {t("empty")}',
  ],
  ['Loading...', '{t("loading")}'],
  [
    '`${product.lowStockThreshold} units`',
    '`${product.lowStockThreshold} ${t("units")}`',
  ],

  // Confirmation messages
  [
    "'Are you sure you want to delete this company? This will also delete all associated products.'",
    't("areYouSureDeleteCompany")',
  ],
  [
    "'Are you sure you want to delete this product?'",
    't("areYouSureDeleteProduct")',
  ],
  [
    "'Are you sure you want to delete this cylinder size?'",
    't("areYouSureDeleteCylinderSize")',
  ],

  // Error messages
  [
    "`Failed to save company: ${errorData.error || 'Unknown error'}`",
    '`${t("failedToSaveCompany")}: ${errorData.error || t("unknownError")}`',
  ],
  [
    "`Failed to save product: ${errorData.error || 'Unknown error'}`",
    '`${t("failedToSaveProduct")}: ${errorData.error || t("unknownError")}`',
  ],
  [
    "`Failed to delete product: ${errorData.error || 'Unknown error'}`",
    '`${t("failedToDeleteProduct")}: ${errorData.error || t("unknownError")}`',
  ],

  // Click to activate/deactivate tooltip
  [
    "`Click to ${product.isActive ? 'deactivate' : 'activate'} product`",
    '`${product.isActive ? t("clickToDeactivate") : t("clickToActivate")} ${t("product")}`',
  ],
];

// Apply replacements
replacements.forEach(([search, replace]) => {
  if (pageContent.includes(search)) {
    pageContent = pageContent.replace(
      new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replace
    );
    console.log(`✅ Replaced: ${search.substring(0, 50)}...`);
  }
});

// Write updated page content
fs.writeFileSync(productManagementPath, pageContent);

console.log('\n🎉 Product Management translations fixed successfully!');
console.log('✨ The page should now display properly in Bengali.');
console.log(
  `📊 Added ${Object.keys(newTranslationKeys).length} new translation keys.`
);

console.log('\n📋 Summary of changes:');
console.log('✅ Added translation keys for buttons, labels, and messages');
console.log('✅ Replaced hardcoded English text with translation calls');
console.log('✅ Added proper Bengali translations for all UI elements');
console.log('✅ Fixed table headers, status indicators, and tooltips');
console.log('✅ Localized error messages and confirmation dialogs');
