const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing translation errors...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

console.log('1. Removing duplicate properties from interface...');

// Remove duplicate properties from the interface
const interfaceStart = content.indexOf('export interface Translations {');
const interfaceEnd = content.indexOf('\nconst englishTranslations');

if (interfaceStart !== -1 && interfaceEnd !== -1) {
  const interfaceContent = content.substring(interfaceStart, interfaceEnd);

  // Remove duplicate current, dueSoon, overdue, paid, cashReceivables
  const cleanedInterface = interfaceContent
    .replace(
      /\n  current: string;\n  dueSoon: string;\n  overdue: string;\n  paid: string;\n[\s\S]*?customerRecords: string;\n  statusBreakdown: string;\n  current: string;\n  dueSoon: string;\n  overdue: string;\n  paid: string;\n  cashReceivables: string;/g,
      '\n  customerRecords: string;\n  statusBreakdown: string;'
    )
    .replace(
      /\n  cashReceivables: string;\n[\s\S]*?cashReceivables: string;/g,
      '\n  cashReceivables: string;'
    );

  content =
    content.substring(0, interfaceStart) +
    cleanedInterface +
    content.substring(interfaceEnd);
}

console.log('2. Adding missing translation keys to interface...');

// Add missing keys to the interface
const missingKeys = [
  'failedToLoadAssetsLiabilities',
  'fixedAsset',
  'currentAsset',
  'failedToUpdateAsset',
  'failedToUpdateLiability',
  'failedToCreateAsset',
  'failedToCreateLiability',
  'areYouSureDeleteAsset',
  'assetDeletedSuccessfully',
  'failedToDeleteAsset',
  'unitValueUpdatedSuccessfully',
  'failedToUpdateUnitValue',
  'areYouSureDeleteLiability',
  'liabilityDeletedSuccessfully',
  'failedToDeleteLiability',
  'assetsAndLiabilities',
  'addAssetsLiabilities',
  'netWorth',
  'depreciation',
  'companyAssets',
  'assetName',
  'unitValue',
  'netValue',
  'auto',
  'editAsset',
  'deleteAsset',
  'companyLiabilities',
  'liability',
  'monthlyPayment',
  'notAvailable',
  'failedToSaveCompany',
  'failedToSaveProduct',
  'areYouSureDeleteCompany',
  'areYouSureDeleteProduct',
  'failedToDeleteProduct',
  'areYouSureDeleteCylinderSize',
  'searchCompanies',
  'addCompany',
  'editCompany',
  'deleteCompany',
  'activeProducts',
  'totalStock',
  'companies',
  'searchProducts',
  'created',
  'full',
  'empty',
  'clickToDeactivate',
  'clickToActivate',
  'editProduct',
  'deleteProduct',
  'searchCylinderSizes',
  'productNamePlaceholder',
  'cylinderSizePlaceholder',
  'optionalDescription',
  'failedToFetchCylinderSizes',
  'areYouSureDeleteCustomerReceivable',
];

// Find the end of the interface
const interfaceEndPattern = /\n}\n/;
const interfaceEndMatch = content.match(interfaceEndPattern);

if (interfaceEndMatch) {
  const insertPosition = content.indexOf(interfaceEndMatch[0]);
  const keysToAdd = missingKeys.map((key) => `  ${key}: string;`).join('\n');
  content =
    content.substring(0, insertPosition) +
    '\n' +
    keysToAdd +
    content.substring(insertPosition);
}

console.log('3. Fixing English translations...');

// Fix English translations - remove duplicates and add missing keys
const englishStart = content.indexOf(
  'const englishTranslations: Translations = {'
);
const englishEnd = content.indexOf('\n};\n\nconst bengaliTranslations');

if (englishStart !== -1 && englishEnd !== -1) {
  let englishContent = content.substring(englishStart, englishEnd);

  // Remove duplicate properties
  englishContent = englishContent
    .replace(
      /\n  current: 'Current',\n  dueSoon: 'Due Soon',\n  overdue: 'Overdue',\n  paid: 'Paid',[\s\S]*?current: 'Current',\n  dueSoon: 'Due Soon',\n  overdue: 'Overdue',\n  paid: 'Paid',/g,
      ''
    )
    .replace(
      /\n  cashReceivables: 'Cash Receivables',[\s\S]*?cashReceivables: 'Cash Receivables',/g,
      "\n  cashReceivables: 'Cash Receivables',"
    )
    .replace(
      /\n  addProduct: 'Add Product',[\s\S]*?addProduct: 'Add Product',/g,
      "\n  addProduct: 'Add Product',"
    )
    .replace(
      /\n  totalProducts: 'Total Products',[\s\S]*?totalProducts: 'Total Products',/g,
      "\n  totalProducts: 'Total Products',"
    )
    .replace(
      /\n  lowStock: 'Low Stock',[\s\S]*?lowStock: 'Low Stock',/g,
      "\n  lowStock: 'Low Stock',"
    )
    .replace(
      /\n  productName: 'Product Name',[\s\S]*?productName: 'Product Name',/g,
      "\n  productName: 'Product Name',"
    )
    .replace(
      /\n  cylinderSize: 'Cylinder Size',[\s\S]*?cylinderSize: 'Cylinder Size',/g,
      "\n  cylinderSize: 'Cylinder Size',"
    )
    .replace(
      /\n  currentPrice: 'Current Price',[\s\S]*?currentPrice: 'Current Price',/g,
      "\n  currentPrice: 'Current Price',"
    )
    .replace(
      /\n  currentStock: 'Current Stock',[\s\S]*?currentStock: 'Current Stock',/g,
      "\n  currentStock: 'Current Stock',"
    )
    .replace(
      /\n  lowStockAlert: 'Low Stock Alert',[\s\S]*?lowStockAlert: 'Low Stock Alert',/g,
      "\n  lowStockAlert: 'Low Stock Alert',"
    )
    .replace(
      /\n  actions: 'Actions',[\s\S]*?actions: 'Actions',/g,
      "\n  actions: 'Actions',"
    )
    .replace(
      /\n  active: 'Active',[\s\S]*?active: 'Active',/g,
      "\n  active: 'Active',"
    )
    .replace(
      /\n  inactive: 'Inactive',[\s\S]*?inactive: 'Inactive',/g,
      "\n  inactive: 'Inactive',"
    )
    .replace(
      /\n  cylinderSizes: 'Cylinder Sizes',[\s\S]*?cylinderSizes: 'Cylinder Sizes',/g,
      "\n  cylinderSizes: 'Cylinder Sizes',"
    )
    .replace(
      /\n  loading: 'Loading\.\.\.',[\s\S]*?loading: 'Loading\.\.\.',/g,
      "\n  loading: 'Loading...',"
    )
    .replace(
      /\n  units: 'units',[\s\S]*?units: 'units',/g,
      "\n  units: 'units',"
    )
    .replace(
      /\n  product: 'product',[\s\S]*?product: 'product',/g,
      "\n  product: 'product',"
    )
    .replace(
      /\n  unknownError: 'Unknown error',[\s\S]*?unknownError: 'Unknown error',/g,
      "\n  unknownError: 'Unknown error',"
    )
    .replace(
      /\n  noCashReceivables: 'No cash receivables',[\s\S]*?noCashReceivables: 'No cash receivables',/g,
      "\n  noCashReceivables: 'No cash receivables',"
    )
    .replace(
      /\n  noCylinderReceivables: 'No cylinder receivables',[\s\S]*?noCylinderReceivables: 'No cylinder receivables',/g,
      "\n  noCylinderReceivables: 'No cylinder receivables',"
    );

  // Add missing English translations
  const englishTranslations = {
    failedToLoadAssetsLiabilities: 'Failed to load assets and liabilities',
    fixedAsset: 'Fixed Asset',
    currentAsset: 'Current Asset',
    failedToUpdateAsset: 'Failed to update asset',
    failedToUpdateLiability: 'Failed to update liability',
    failedToCreateAsset: 'Failed to create asset',
    failedToCreateLiability: 'Failed to create liability',
    areYouSureDeleteAsset: 'Are you sure you want to delete this asset?',
    assetDeletedSuccessfully: 'Asset deleted successfully',
    failedToDeleteAsset: 'Failed to delete asset',
    unitValueUpdatedSuccessfully: 'Unit value updated successfully',
    failedToUpdateUnitValue: 'Failed to update unit value',
    areYouSureDeleteLiability:
      'Are you sure you want to delete this liability?',
    liabilityDeletedSuccessfully: 'Liability deleted successfully',
    failedToDeleteLiability: 'Failed to delete liability',
    assetsAndLiabilities: 'Assets and Liabilities',
    addAssetsLiabilities: 'Add Assets/Liabilities',
    netWorth: 'Net Worth',
    depreciation: 'Depreciation',
    companyAssets: 'Company Assets',
    assetName: 'Asset Name',
    unitValue: 'Unit Value',
    netValue: 'Net Value',
    auto: 'Auto',
    editAsset: 'Edit Asset',
    deleteAsset: 'Delete Asset',
    companyLiabilities: 'Company Liabilities',
    liability: 'Liability',
    monthlyPayment: 'Monthly Payment',
    notAvailable: 'Not Available',
    failedToSaveCompany: 'Failed to save company',
    failedToSaveProduct: 'Failed to save product',
    areYouSureDeleteCompany: 'Are you sure you want to delete this company?',
    areYouSureDeleteProduct: 'Are you sure you want to delete this product?',
    failedToDeleteProduct: 'Failed to delete product',
    areYouSureDeleteCylinderSize:
      'Are you sure you want to delete this cylinder size?',
    searchCompanies: 'Search companies...',
    addCompany: 'Add Company',
    editCompany: 'Edit Company',
    deleteCompany: 'Delete Company',
    activeProducts: 'Active Products',
    totalStock: 'Total Stock',
    companies: 'Companies',
    searchProducts: 'Search products...',
    created: 'Created',
    full: 'Full',
    empty: 'Empty',
    clickToDeactivate: 'Click to deactivate',
    clickToActivate: 'Click to activate',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    searchCylinderSizes: 'Search cylinder sizes...',
    productNamePlaceholder:
      'Enter product name (e.g., LPG Cylinder, Cooking Gas)',
    cylinderSizePlaceholder: 'Enter cylinder size (e.g., 12L, 35L)',
    optionalDescription: 'Optional description',
    failedToFetchCylinderSizes: 'Failed to fetch cylinder sizes',
    areYouSureDeleteCustomerReceivable:
      'Are you sure you want to delete this customer receivable?',
  };

  // Add the missing translations before the closing brace
  const missingEnglishKeys = Object.entries(englishTranslations)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');

  englishContent = englishContent.replace(
    /\n}$/,
    '\n' + missingEnglishKeys + '\n}'
  );

  content =
    content.substring(0, englishStart) +
    englishContent +
    content.substring(englishEnd);
}

console.log('4. Fixing Bengali translations...');

// Fix Bengali translations - remove duplicates and add missing keys
const bengaliStart = content.indexOf(
  'const bengaliTranslations: Translations = {'
);
const bengaliEnd = content.lastIndexOf('\n};\n');

if (bengaliStart !== -1 && bengaliEnd !== -1) {
  let bengaliContent = content.substring(bengaliStart, bengaliEnd);

  // Remove duplicate properties
  bengaliContent = bengaliContent
    .replace(
      /\n  current: 'বর্তমান',\n  dueSoon: 'শীঘ্রই দেয়',\n  overdue: 'বকেয়া',\n  paid: 'পরিশোধিত',[\s\S]*?current: 'বর্তমান',\n  dueSoon: 'শীঘ্রই দেয়',\n  overdue: 'বকেয়া',\n  paid: 'পরিশোধিত',/g,
      ''
    )
    .replace(
      /\n  cashReceivables: 'নগদ বাকি',[\s\S]*?cashReceivables: 'নগদ বাকি',/g,
      "\n  cashReceivables: 'নগদ বাকি',"
    )
    .replace(
      /\n  addProduct: 'পণ্য যোগ করুন',[\s\S]*?addProduct: 'পণ্য যোগ করুন',/g,
      "\n  addProduct: 'পণ্য যোগ করুন',"
    )
    .replace(
      /\n  totalProducts: 'মোট পণ্য',[\s\S]*?totalProducts: 'মোট পণ্য',/g,
      "\n  totalProducts: 'মোট পণ্য',"
    )
    .replace(
      /\n  lowStock: 'কম স্টক',[\s\S]*?lowStock: 'কম স্টক',/g,
      "\n  lowStock: 'কম স্টক',"
    )
    .replace(
      /\n  productName: 'পণ্যের নাম',[\s\S]*?productName: 'পণ্যের নাম',/g,
      "\n  productName: 'পণ্যের নাম',"
    )
    .replace(
      /\n  cylinderSize: 'সিলিন্ডারের আকার',[\s\S]*?cylinderSize: 'সিলিন্ডারের আকার',/g,
      "\n  cylinderSize: 'সিলিন্ডারের আকার',"
    )
    .replace(
      /\n  currentPrice: 'বর্তমান দাম',[\s\S]*?currentPrice: 'বর্তমান দাম',/g,
      "\n  currentPrice: 'বর্তমান দাম',"
    )
    .replace(
      /\n  currentStock: 'বর্তমান স্টক',[\s\S]*?currentStock: 'বর্তমান স্টক',/g,
      "\n  currentStock: 'বর্তমান স্টক',"
    )
    .replace(
      /\n  lowStockAlert: 'কম স্টক সতর্কতা',[\s\S]*?lowStockAlert: 'কম স্টক সতর্কতা',/g,
      "\n  lowStockAlert: 'কম স্টক সতর্কতা',"
    )
    .replace(
      /\n  actions: 'কার্যক্রম',[\s\S]*?actions: 'কার্যক্রম',/g,
      "\n  actions: 'কার্যক্রম',"
    )
    .replace(
      /\n  active: 'সক্রিয়',[\s\S]*?active: 'সক্রিয়',/g,
      "\n  active: 'সক্রিয়',"
    )
    .replace(
      /\n  inactive: 'নিষ্ক্রিয়',[\s\S]*?inactive: 'নিষ্ক্রিয়',/g,
      "\n  inactive: 'নিষ্ক্রিয়',"
    )
    .replace(
      /\n  cylinderSizes: 'সিলিন্ডারের আকার',[\s\S]*?cylinderSizes: 'সিলিন্ডারের আকার',/g,
      "\n  cylinderSizes: 'সিলিন্ডারের আকার',"
    )
    .replace(
      /\n  loading: 'লোড হচ্ছে\.\.\.',[\s\S]*?loading: 'লোড হচ্ছে\.\.\.',/g,
      "\n  loading: 'লোড হচ্ছে...',"
    )
    .replace(
      /\n  units: 'ইউনিট',[\s\S]*?units: 'ইউনিট',/g,
      "\n  units: 'ইউনিট',"
    )
    .replace(
      /\n  product: 'পণ্য',[\s\S]*?product: 'পণ্য',/g,
      "\n  product: 'পণ্য',"
    )
    .replace(
      /\n  unknownError: 'অজানা ত্রুটি',[\s\S]*?unknownError: 'অজানা ত্রুটি',/g,
      "\n  unknownError: 'অজানা ত্রুটি',"
    )
    .replace(
      /\n  noCashReceivables: 'কোনো নগদ বাকি নেই',[\s\S]*?noCashReceivables: 'কোনো নগদ বাকি নেই',/g,
      "\n  noCashReceivables: 'কোনো নগদ বাকি নেই',"
    )
    .replace(
      /\n  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',[\s\S]*?noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',/g,
      "\n  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',"
    );

  // Add missing Bengali translations
  const bengaliTranslations = {
    failedToLoadAssetsLiabilities: 'সম্পদ এবং দায় লোড করতে ব্যর্থ',
    fixedAsset: 'স্থায়ী সম্পদ',
    currentAsset: 'চলতি সম্পদ',
    failedToUpdateAsset: 'সম্পদ আপডেট করতে ব্যর্থ',
    failedToUpdateLiability: 'দায় আপডেট করতে ব্যর্থ',
    failedToCreateAsset: 'সম্পদ তৈরি করতে ব্যর্থ',
    failedToCreateLiability: 'দায় তৈরি করতে ব্যর্থ',
    areYouSureDeleteAsset: 'আপনি কি নিশ্চিত যে এই সম্পদটি মুছে ফেলতে চান?',
    assetDeletedSuccessfully: 'সম্পদ সফলভাবে মুছে ফেলা হয়েছে',
    failedToDeleteAsset: 'সম্পদ মুছতে ব্যর্থ',
    unitValueUpdatedSuccessfully: 'একক মূল্য সফলভাবে আপডেট করা হয়েছে',
    failedToUpdateUnitValue: 'একক মূল্য আপডেট করতে ব্যর্থ',
    areYouSureDeleteLiability: 'আপনি কি নিশ্চিত যে এই দায়টি মুছে ফেলতে চান?',
    liabilityDeletedSuccessfully: 'দায় সফলভাবে মুছে ফেলা হয়েছে',
    failedToDeleteLiability: 'দায় মুছতে ব্যর্থ',
    assetsAndLiabilities: 'সম্পদ এবং দায়',
    addAssetsLiabilities: 'সম্পদ/দায় যোগ করুন',
    netWorth: 'নেট মূল্য',
    depreciation: 'অবচয়',
    companyAssets: 'কোম্পানির সম্পদ',
    assetName: 'সম্পদের নাম',
    unitValue: 'একক মূল্য',
    netValue: 'নেট মূল্য',
    auto: 'স্বয়ংক্রিয়',
    editAsset: 'সম্পদ সম্পাদনা',
    deleteAsset: 'সম্পদ মুছুন',
    companyLiabilities: 'কোম্পানির দায়',
    liability: 'দায়',
    monthlyPayment: 'মাসিক পেমেন্ট',
    notAvailable: 'উপলব্ধ নেই',
    failedToSaveCompany: 'কোম্পানি সংরক্ষণ করতে ব্যর্থ',
    failedToSaveProduct: 'পণ্য সংরক্ষণ করতে ব্যর্থ',
    areYouSureDeleteCompany: 'আপনি কি নিশ্চিত যে এই কোম্পানিটি মুছে ফেলতে চান?',
    areYouSureDeleteProduct: 'আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?',
    failedToDeleteProduct: 'পণ্য মুছতে ব্যর্থ',
    areYouSureDeleteCylinderSize:
      'আপনি কি নিশ্চিত যে এই সিলিন্ডারের আকারটি মুছে ফেলতে চান?',
    searchCompanies: 'কোম্পানি খুঁজুন...',
    addCompany: 'কোম্পানি যোগ করুন',
    editCompany: 'কোম্পানি সম্পাদনা',
    deleteCompany: 'কোম্পানি মুছুন',
    activeProducts: 'সক্রিয় পণ্য',
    totalStock: 'মোট স্টক',
    companies: 'কোম্পানি',
    searchProducts: 'পণ্য খুঁজুন...',
    created: 'তৈরি',
    full: 'পূর্ণ',
    empty: 'খালি',
    clickToDeactivate: 'নিষ্ক্রিয় করতে ক্লিক করুন',
    clickToActivate: 'সক্রিয় করতে ক্লিক করুন',
    editProduct: 'পণ্য সম্পাদনা',
    deleteProduct: 'পণ্য মুছুন',
    searchCylinderSizes: 'সিলিন্ডারের আকার খুঁজুন...',
    productNamePlaceholder:
      'পণ্যের নাম লিখুন (যেমন, এলপিজি সিলিন্ডার, রান্নার গ্যাস)',
    cylinderSizePlaceholder:
      'সিলিন্ডারের আকার লিখুন (যেমন, ১২ লিটার, ৩৫ লিটার)',
    optionalDescription: 'ঐচ্ছিক বিবরণ',
    failedToFetchCylinderSizes: 'সিলিন্ডারের আকার আনতে ব্যর্থ',
    areYouSureDeleteCustomerReceivable:
      'আপনি কি নিশ্চিত যে এই গ্রাহক বাকি মুছে ফেলতে চান?',
  };

  // Add the missing translations before the closing brace
  const missingBengaliKeys = Object.entries(bengaliTranslations)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');

  bengaliContent = bengaliContent.replace(
    /\n}$/,
    '\n' + missingBengaliKeys + '\n}'
  );

  content =
    content.substring(0, bengaliStart) +
    bengaliContent +
    content.substring(bengaliEnd);
}

console.log('5. Writing fixed translations file...');

// Write the fixed content back to the file
fs.writeFileSync(translationsPath, content, 'utf8');

console.log('✅ Translation errors fixed successfully!');
console.log('\n📊 Summary:');
console.log('- Removed duplicate properties from interface');
console.log('- Added missing translation keys to interface');
console.log('- Fixed duplicate properties in English translations');
console.log('- Fixed duplicate properties in Bengali translations');
console.log('- Added missing English translations');
console.log('- Added missing Bengali translations');
console.log('\n🎯 Next steps:');
console.log('1. Run npm run type-check to verify fixes');
console.log('2. Test the application to ensure translations work correctly');
