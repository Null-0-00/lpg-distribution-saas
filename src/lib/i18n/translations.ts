export interface Translations {
  // Navigation
  dashboard: string;
  sales: string;
  drivers: string;
  shipments: string;
  receivables: string;
  assets: string;
  expenses: string;
  settings: string;
  inventory: string;
  users: string;
  reports: string;
  productManagement: string;
  dailySalesReport: string;
  analytics: string;

  // Common Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  total: string;
  actions: string;
  loading: string;
  noData: string;
  refresh: string;
  export: string;
  view: string;
  print: string;
  download: string;
  upload: string;
  submit: string;
  next: string;
  previous: string;
  close: string;
  back: string;
  forward: string;
  confirm: string;
  logout: string;

  // Forms
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  amount: string;
  date: string;
  notes: string;
  status: string;
  type: string;
  category: string;
  active: string;
  inactive: string;

  // Sales & Inventory
  quantity: string;
  unitPrice: string;
  discount: string;
  totalValue: string;
  packageSales: string;
  refillSales: string;
  cylinder: string;
  cylinders: string;
  product: string;
  products: string;
  fullCylinders: string;
  emptyCylinders: string;
  stock: string;
  purchase: string;
  sale: string;
  retailDriver: string;
  shipmentDrivers: string;
  retailDrivers: string;

  // Financial
  cash: string;
  totalSales: string;
  totalRevenue: string;
  totalReceivables: string;
  thisMonth: string;
  lastMonth: string;
  today: string;
  yesterday: string;
  week: string;
  month: string;
  year: string;

  // Messages
  error: string;
  success: string;
  warning: string;
  info: string;
  tryAgain: string;
  dataNotFound: string;
  loadingData: string;
  noDataAvailable: string;
  operationSuccessful: string;
  operationFailed: string;
  lastUpdated: string;

  // Specific Features
  inventoryManagement: string;
  driverManagement: string;
  userManagement: string;
  expenseManagement: string;
  receivableManagement: string;
  filterByDriverType: string;
  refreshData: string;
  failedToDeleteDriver: string;
  driverUpdatedSuccessfully: string;
  failedToUpdateDriver: string;
  totalSalesThisMonth: string;
  noActiveDriversFoundForThisPeriod: string;
  packageSalesQty: string;
  refillSalesQty: string;
  totalSalesQty: string;
  urgent: string;

  // Dashboard specific
  salesManagement: string;
  recordDailySales: string;
  trackPerformance: string;
  inventoryControl: string;
  monitorCylinderStock: string;
  alerts: string;
  allGood: string;
  manageDriversAndAssignments: string;
  manageTeam: string;
  manageSystemUsers: string;
  manageSystemRoles: string;
  teamAccess: string;
  trackCustomerPayments: string;
  trackCustomerCredits: string;
  kPending: string;
  assetsLiabilities: string;
  manageCompanyAssets: string;
  manageLiabilities: string;
  balanceSheet: string;
  trackExpenses: string;
  manageBudgets: string;
  pending: string;
  financialReports: string;
  viewComprehensiveReports: string;
  reportsAnalytics: string;
  loadingText: string;
  manageLpgDistributionBusiness: string;
  retry: string;
  revenue: string;
  tasks: string;
  newSale: string;
  checkStock: string;
  addExpense: string;
  updatePayment: string;
  viewReports: string;
  recentActivity: string;
  rahmanSoldCylinders: string;
  stockReplenished: string;
  paymentReceived: string;
  salesTrend: string;
  last7Days: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  topDriverPerformance: string;
  lpgDistributorManagementSystem: string;

  // Additional missing keys from TypeScript errors
  addDriver: string;
  activeDrivers: string;
  allDrivers: string;
  performance: string;
  driver: string;
  area: string;
  cashReceivables: string;
  cylinderReceivables: string;
  retail: string;
  shipment: string;
  noDataFound: string;
  create: string;
  packageSale: string;
  refillSale: string;
  currency: string;
  timezone: string;
  language: string;
  saveSuccess: string;
  saveError: string;
  generalSettings: string;
  loadingInventoryData: string;
  failedToLoadInventoryData: string;
  realTimeInventoryTracking: string;
  exportFunctionalityComingSoon: string;
  criticalAlert: string;
  productsOutOfStock: string;
  lowStockWarning: string;
  productsBelowMinimumThreshold: string;
  currentStock: string;
  todaysSales: string;
  cylindersSold: string;
  todaysPurchases: string;
  cylindersReceived: string;
  totalCylinders: string;
  allCylinders: string;
  currentFullCylinderInventory: string;
  company: string;
  size: string;
  noFullCylindersInInventory: string;
  emptyCylinderInventoryAvailability: string;
  emptyCylindersInHand: string;
  noEmptyCylindersInInventory: string;
  note: string;
  totalCylinderReceivables: string;
  totalCylindersReceivables: string;
  dailyInventoryTracking: string;
  automatedCalculationsExactFormulas: string;
  packagePurchase: string;
  refillPurchase: string;
  emptyCylindersBuySell: string;
  latest: string;
  noDailyInventoryDataAvailable: string;
  businessFormulaImplementation: string;
  dailyCalculations: string;
  todaysFullCylinders: string;
  yesterdaysFull: string;
  todaysEmptyCylinders: string;
  yesterdaysEmpty: string;
  dataSources: string;
  packageRefillSales: string;
  sumAllDriversSalesForDate: string;
  packageRefillPurchase: string;
  sumCompletedShipmentsFromShipmentsPage: string;
  sumCompletedEmptyCylinderShipments: string;
  allCalculationsUpdatedRealTime: string;
  currentStockHealth: string;
  productsInGoodStock: string;
  producentsWithLowStockWarning: string;
  productsInCriticalStock: string;

  // Dashboard and reports
  cashDepositsByDriver: string;
  driverExpense: string;
  fuelExpense: string;
  maintenanceExpense: string;
  officeExpense: string;
  transportExpense: string;
  miscellaneousExpense: string;
  generalExpense: string;
  failedToLoadDailySalesReport: string;
  loadingDailySalesReport: string;
  noReportDataAvailable: string;
  tryAgainOrSelectDate: string;
  comprehensiveDailySalesReport: string;
  totalSalesValue: string;
  totalDeposited: string;
  totalExpenses: string;
  availableCash: string;
  totalCashReceivables: string;
  changeInReceivablesCashCylinders: string;
  dailyDepositsExpenses: string;
  detailedBreakdownDepositsExpenses: string;
  deposits: string;
  particulars: string;
  noDepositsFound: string;
  totalDepositsCalculated: string;
  noExpensesFound: string;
  totalExpensesCalculated: string;
  totalAvailableCash: string;
  totalDepositsIncludingSales: string;

  // Sales and inventory forms
  customerName: string;

  // Settings and admin
  adminPanel: string;
  systemAdministration: string;
  viewDistributorDashboard: string;
  signOut: string;
  lightMode: string;
  darkMode: string;
  systemTheme: string;

  // Shipments and purchase orders
  shipmentsManagement: string;
  trackPurchaseOrdersAndShipments: string;
  newPurchase: string;
  emptyCylinderBuySell: string;
  allShipments: string;
  outstandingOrders: string;
  completedOrders: string;
  allCompanies: string;
  allProducts: string;
  fromDate: string;
  toDate: string;
  clearFilters: string;
  loadingShipments: string;
  noShipmentsFound: string;
  invoice: string;
  units: string;
  gas: string;
  unit: string;
  unitCost: string;
  gasCost: string;
  cylinderCost: string;
  vehicle: string;
  markAsFulfilled: string;
  totalItems: string;
  totalCost: string;
  editPurchaseOrder: string;
  createNewPurchaseOrder: string;
  step: string;
  of: string;
  orderInformation: string;
  selectCompany: string;
  selectDriver: string;
  shipmentDate: string;
  expectedDeliveryDate: string;
  invoiceNumber: string;
  enterInvoiceNumber: string;
  paymentTerms: string;
  cashOnDelivery: string;
  net30Days: string;
  net60Days: string;
  advancePayment: string;
  priority: string;
  low: string;
  normal: string;
  high: string;
  vehicleNumber: string;
  enterVehicleNumber: string;
  enterAdditionalNotes: string;
  addLineItem: string;
  selectProduct: string;
  selectCompanyFirst: string;
  package: string;
  refill: string;
  gasPrice: string;
  cylinderPrice: string;
  taxRate: string;
  lineTotalPreview: string;
  packageInfo: string;
  refillInfo: string;
  addItem: string;
  purchaseItems: string;
  qty: string;
  lineTotal: string;
  action: string;
  editItem: string;
  removeItem: string;
  remove: string;
  totalPurchaseValue: string;
  orderPreview: string;
  orderSummary: string;
  totalQuantity: string;
  companyRequired: string;
  driverRequired: string;
  shipmentDateRequired: string;
  atLeastOneLineItemRequired: string;
  creating: string;
  updatePurchaseOrder: string;
  createPurchaseOrder: string;

  // Empty cylinder transactions
  transactionType: string;
  buyEmptyCylinders: string;
  sellEmptyCylinders: string;
  addEmptyCylindersToInventory: string;
  removeEmptyCylindersFromInventory: string;
  cylinderSize: string;
  selectCylinderSize: string;
  emptyCylindersNote: string;
  transactionDate: string;
  enterTransactionDetails: string;
  buy: string;
  sell: string;
}

const englishTranslations: Translations = {
  // Navigation
  dashboard: 'Dashboard',
  sales: 'Sales',
  drivers: 'Drivers',
  shipments: 'Shipments',
  receivables: 'Receivables',
  assets: 'Assets',
  expenses: 'Expenses',
  settings: 'Settings',
  inventory: 'Inventory',
  users: 'Users',
  reports: 'Reports',
  productManagement: 'Product Management',
  dailySalesReport: 'Daily Sales Report',
  analytics: 'Analytics',

  // Common Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  total: 'Total',
  actions: 'Actions',
  loading: 'Loading',
  noData: 'No Data',
  refresh: 'Refresh',
  export: 'Export',
  view: 'View',
  print: 'Print',
  download: 'Download',
  upload: 'Upload',
  submit: 'Submit',
  next: 'Next',
  previous: 'Previous',
  close: 'Close',
  back: 'Back',
  forward: 'Forward',
  confirm: 'Confirm',
  logout: 'Logout',

  // Forms
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  description: 'Description',
  amount: 'Amount',
  date: 'Date',
  notes: 'Notes',
  status: 'Status',
  type: 'Type',
  category: 'Category',
  active: 'Active',
  inactive: 'Inactive',

  // Sales & Inventory
  quantity: 'Quantity',
  unitPrice: 'Unit Price',
  discount: 'Discount',
  totalValue: 'Total Value',
  packageSales: 'Package Sales',
  refillSales: 'Refill Sales',
  cylinder: 'Cylinder',
  cylinders: 'Cylinders',
  product: 'Product',
  products: 'Products',
  fullCylinders: 'Full Cylinders',
  emptyCylinders: 'Empty Cylinders',
  stock: 'Stock',
  purchase: 'Purchase',
  sale: 'Sale',
  retailDriver: 'Retail Driver',
  shipmentDrivers: 'Shipment Drivers',
  retailDrivers: 'Retail Drivers',

  // Financial
  cash: 'Cash',
  totalSales: 'Total Sales',
  totalRevenue: 'Total Revenue',
  totalReceivables: 'Total Receivables',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Week',
  month: 'Month',
  year: 'Year',

  // Messages
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
  tryAgain: 'Try Again',
  dataNotFound: 'Data Not Found',
  loadingData: 'Loading Data',
  noDataAvailable: 'No Data Available',
  operationSuccessful: 'Operation Successful',
  operationFailed: 'Operation Failed',
  lastUpdated: 'Last Updated',

  // Specific Features
  inventoryManagement: 'Inventory Management',
  driverManagement: 'Driver Management',
  userManagement: 'User Management',
  expenseManagement: 'Expense Management',
  receivableManagement: 'Receivable Management',
  filterByDriverType: 'Filter by Driver Type',
  refreshData: 'Refresh Data',
  failedToDeleteDriver: 'Failed to Delete Driver',
  driverUpdatedSuccessfully: 'Driver Updated Successfully',
  failedToUpdateDriver: 'Failed to Update Driver',
  totalSalesThisMonth: 'Total Sales This Month',
  noActiveDriversFoundForThisPeriod: 'No Active Drivers Found for This Period',
  packageSalesQty: 'Package Sales Qty',
  refillSalesQty: 'Refill Sales Qty',
  totalSalesQty: 'Total Sales Qty',
  urgent: 'Urgent',

  // Dashboard specific
  salesManagement: 'Sales Management',
  recordDailySales: 'Record daily sales',
  trackPerformance: 'and track performance',
  inventoryControl: 'Inventory Control',
  monitorCylinderStock: 'Monitor cylinder stock levels',
  alerts: 'alerts',
  allGood: 'All Good',
  manageDriversAndAssignments: 'Manage drivers and assignments',
  manageTeam: 'Manage Team',
  manageSystemUsers: 'Manage system users',
  manageSystemRoles: 'and roles',
  teamAccess: 'Team Access',
  trackCustomerPayments: 'Track customer payments',
  trackCustomerCredits: 'and credits',
  kPending: 'K Pending',
  assetsLiabilities: 'Assets & Liabilities',
  manageCompanyAssets: 'Manage company assets',
  manageLiabilities: 'and liabilities',
  balanceSheet: 'Balance Sheet',
  trackExpenses: 'Track expenses',
  manageBudgets: 'and budgets',
  pending: 'Pending',
  financialReports: 'Financial Reports',
  viewComprehensiveReports: 'View comprehensive financial reports',
  reportsAnalytics: 'Reports & Analytics',
  loadingText: 'Loading dashboard data...',
  manageLpgDistributionBusiness:
    'Manage your LPG distribution business efficiently',
  retry: 'Retry',
  revenue: 'Revenue',
  tasks: 'Tasks',
  newSale: 'New Sale',
  checkStock: 'Check Stock',
  addExpense: 'Add Expense',
  updatePayment: 'Update Payment',
  viewReports: 'View Reports',
  recentActivity: 'Recent Activity',
  rahmanSoldCylinders: 'Rahman sold 15 cylinders',
  stockReplenished: 'Stock replenished - 100 cylinders',
  paymentReceived: 'Payment received from customer',
  salesTrend: 'Sales Trend',
  last7Days: 'Last 7 Days',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
  topDriverPerformance: 'Top Driver Performance',
  lpgDistributorManagementSystem: 'LPG Distributor Management System',

  // Additional missing keys from TypeScript errors
  addDriver: 'Add Driver',
  activeDrivers: 'Active Drivers',
  allDrivers: 'All Drivers',
  performance: 'Performance',
  driver: 'Driver',
  area: 'Area',
  cashReceivables: 'Cash Receivables',
  cylinderReceivables: 'Cylinder Receivables',
  retail: 'Retail',
  shipment: 'Shipment',
  noDataFound: 'No Data Found',
  create: 'Create',
  packageSale: 'Package Sale',
  refillSale: 'Refill Sale',
  currency: 'Currency',
  timezone: 'Timezone',
  language: 'Language',
  saveSuccess: 'Settings saved successfully',
  saveError: 'Failed to save settings',
  generalSettings: 'General Settings',
  loadingInventoryData: 'Loading inventory data...',
  failedToLoadInventoryData: 'Failed to load inventory data',
  realTimeInventoryTracking: 'Real-time Inventory Tracking',
  exportFunctionalityComingSoon: 'Export functionality coming soon',
  criticalAlert: 'Critical Alert',
  productsOutOfStock: 'products out of stock',
  lowStockWarning: 'Low Stock Warning',
  productsBelowMinimumThreshold: 'products below minimum threshold',
  currentStock: 'Current Stock',
  todaysSales: "Today's Sales",
  cylindersSold: 'cylinders sold',
  todaysPurchases: "Today's Purchases",
  cylindersReceived: 'cylinders received',
  totalCylinders: 'Total Cylinders',
  allCylinders: 'All Cylinders',
  currentFullCylinderInventory: 'Current Full Cylinder Inventory',
  company: 'Company',
  size: 'Size',
  noFullCylindersInInventory: 'No full cylinders in inventory',
  emptyCylinderInventoryAvailability: 'Empty Cylinder Inventory Availability',
  emptyCylindersInHand: 'empty cylinders in hand',
  noEmptyCylindersInInventory: 'No empty cylinders in inventory',
  note: 'Note',
  totalCylinderReceivables: 'Total Cylinder Receivables',
  totalCylindersReceivables: 'Total Cylinders Receivables',
  dailyInventoryTracking: 'Daily Inventory Tracking',
  automatedCalculationsExactFormulas:
    'Automated calculations using exact business formulas',
  packagePurchase: 'Package Purchase',
  refillPurchase: 'Refill Purchase',
  emptyCylindersBuySell: 'Empty Cylinders Buy/Sell',
  latest: 'Latest',
  noDailyInventoryDataAvailable: 'No daily inventory data available',
  businessFormulaImplementation: 'Business Formula Implementation',
  dailyCalculations: 'Daily Calculations',
  todaysFullCylinders: "Today's Full Cylinders",
  yesterdaysFull: "Yesterday's Full",
  todaysEmptyCylinders: "Today's Empty Cylinders",
  yesterdaysEmpty: "Yesterday's Empty",
  dataSources: 'Data Sources',
  packageRefillSales: 'Package & Refill Sales',
  sumAllDriversSalesForDate: 'Sum of all drivers sales for the date',
  packageRefillPurchase: 'Package & Refill Purchase',
  sumCompletedShipmentsFromShipmentsPage:
    'Sum of completed shipments from shipments page',
  sumCompletedEmptyCylinderShipments:
    'Sum of completed empty cylinder shipments',
  allCalculationsUpdatedRealTime: 'All calculations are updated in real-time',
  currentStockHealth: 'Current Stock Health',
  productsInGoodStock: 'products in good stock',
  producentsWithLowStockWarning: 'products with low stock warning',
  productsInCriticalStock: 'products in critical stock',

  // Dashboard and reports
  cashDepositsByDriver: 'Cash Deposits by Driver',
  driverExpense: 'Driver Expense',
  fuelExpense: 'Fuel Expense',
  maintenanceExpense: 'Maintenance Expense',
  officeExpense: 'Office Expense',
  transportExpense: 'Transport Expense',
  miscellaneousExpense: 'Miscellaneous Expense',
  generalExpense: 'General Expense',
  failedToLoadDailySalesReport: 'Failed to load daily sales report',
  loadingDailySalesReport: 'Loading daily sales report...',
  noReportDataAvailable: 'No report data available',
  tryAgainOrSelectDate: 'Try again or select a different date',
  comprehensiveDailySalesReport: 'Comprehensive Daily Sales Report',
  totalSalesValue: 'Total Sales Value',
  totalDeposited: 'Total Deposited',
  totalExpenses: 'Total Expenses',
  availableCash: 'Available Cash',
  totalCashReceivables: 'Total Cash Receivables',
  changeInReceivablesCashCylinders: 'Change in Receivables (Cash & Cylinders)',
  dailyDepositsExpenses: 'Daily Deposits & Expenses',
  detailedBreakdownDepositsExpenses:
    'Detailed breakdown of deposits and expenses',
  deposits: 'Deposits',
  particulars: 'Particulars',
  noDepositsFound: 'No deposits found for this date',
  totalDepositsCalculated: 'Total deposits (calculated)',
  noExpensesFound: 'No expenses found for this date',
  totalExpensesCalculated: 'Total expenses (calculated)',
  totalAvailableCash: 'Total Available Cash',
  totalDepositsIncludingSales: 'Total deposits including sales',

  // Sales and inventory forms
  customerName: 'Customer Name',

  // Settings and admin
  adminPanel: 'Admin Panel',
  systemAdministration: 'System Administration',
  viewDistributorDashboard: 'View Distributor Dashboard',
  signOut: 'Sign Out',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  systemTheme: 'System Theme',

  // Shipments and purchase orders
  shipmentsManagement: 'Shipments Management',
  trackPurchaseOrdersAndShipments: 'Track purchase orders and shipments',
  newPurchase: 'New Purchase',
  emptyCylinderBuySell: 'Empty Cylinder Buy/Sell',
  allShipments: 'All Shipments',
  outstandingOrders: 'Outstanding Orders',
  completedOrders: 'Completed Orders',
  allCompanies: 'All Companies',
  allProducts: 'All Products',
  fromDate: 'From Date',
  toDate: 'To Date',
  clearFilters: 'Clear Filters',
  loadingShipments: 'Loading shipments...',
  noShipmentsFound: 'No shipments found',
  invoice: 'Invoice',
  units: 'Units',
  gas: 'Gas',
  unit: 'Unit',
  unitCost: 'Unit Cost',
  gasCost: 'Gas Cost',
  cylinderCost: 'Cylinder Cost',
  vehicle: 'Vehicle',
  markAsFulfilled: 'Mark as Fulfilled',
  totalItems: 'Total Items',
  totalCost: 'Total Cost',
  editPurchaseOrder: 'Edit Purchase Order',
  createNewPurchaseOrder: 'Create New Purchase Order',
  step: 'Step',
  of: 'of',
  orderInformation: 'Order Information',
  selectCompany: 'Select Company',
  selectDriver: 'Select Driver',
  shipmentDate: 'Shipment Date',
  expectedDeliveryDate: 'Expected Delivery Date',
  invoiceNumber: 'Invoice Number',
  enterInvoiceNumber: 'Enter invoice number',
  paymentTerms: 'Payment Terms',
  cashOnDelivery: 'Cash on Delivery',
  net30Days: 'Net 30 Days',
  net60Days: 'Net 60 Days',
  advancePayment: 'Advance Payment',
  priority: 'Priority',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  vehicleNumber: 'Vehicle Number',
  enterVehicleNumber: 'Enter vehicle number',
  enterAdditionalNotes: 'Enter additional notes',
  addLineItem: 'Add Line Item',
  selectProduct: 'Select Product',
  selectCompanyFirst: 'Select company first',
  package: 'Package',
  refill: 'Refill',
  gasPrice: 'Gas Price',
  cylinderPrice: 'Cylinder Price',
  taxRate: 'Tax Rate',
  lineTotalPreview: 'Line Total Preview',
  packageInfo: 'Package Info',
  refillInfo: 'Refill Info',
  addItem: 'Add Item',
  purchaseItems: 'Purchase Items',
  qty: 'Qty',
  lineTotal: 'Line Total',
  action: 'Action',
  editItem: 'Edit Item',
  removeItem: 'Remove Item',
  remove: 'Remove',
  totalPurchaseValue: 'Total Purchase Value',
  orderPreview: 'Order Preview',
  orderSummary: 'Order Summary',
  totalQuantity: 'Total Quantity',
  companyRequired: 'Company is required',
  driverRequired: 'Driver is required',
  shipmentDateRequired: 'Shipment date is required',
  atLeastOneLineItemRequired: 'At least one line item is required',
  creating: 'Creating...',
  updatePurchaseOrder: 'Update Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',

  // Empty cylinder transactions
  transactionType: 'Transaction Type',
  buyEmptyCylinders: 'Buy Empty Cylinders',
  sellEmptyCylinders: 'Sell Empty Cylinders',
  addEmptyCylindersToInventory: 'Add empty cylinders to inventory',
  removeEmptyCylindersFromInventory: 'Remove empty cylinders from inventory',
  cylinderSize: 'Cylinder Size',
  selectCylinderSize: 'Select cylinder size',
  emptyCylindersNote: 'Empty cylinders transaction note',
  transactionDate: 'Transaction Date',
  enterTransactionDetails: 'Enter transaction details',
  buy: 'Buy',
  sell: 'Sell',
};

const bengaliTranslations: Translations = {
  // Navigation
  dashboard: 'ড্যাশবোর্ড',
  sales: 'বিক্রয়',
  drivers: 'চালক',
  shipments: 'চালান',
  receivables: 'প্রাপ্য',
  assets: 'সম্পদ',
  expenses: 'খরচ',
  settings: 'সেটিংস',
  inventory: 'তালিকা',
  users: 'ব্যবহারকারী',
  reports: 'রিপোর্ট',
  productManagement: 'পণ্য ব্যবস্থাপনা',
  dailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট',
  analytics: 'বিশ্লেষণ',

  // Common Actions
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  delete: 'মুছুন',
  edit: 'সম্পাদনা',
  add: 'যোগ করুন',
  search: 'অনুসন্ধান',
  filter: 'ফিল্টার',
  total: 'মোট',
  actions: 'কার্য',
  loading: 'লোড হচ্ছে',
  noData: 'কোন তথ্য নেই',
  refresh: 'রিফ্রেশ',
  export: 'এক্সপোর্ট',
  view: 'দেখুন',
  print: 'প্রিন্ট',
  download: 'ডাউনলোড',
  upload: 'আপলোড',
  submit: 'জমা দিন',
  next: 'পরবর্তী',
  previous: 'পূর্ববর্তী',
  close: 'বন্ধ',
  back: 'পিছনে',
  forward: 'এগিয়ে',
  confirm: 'নিশ্চিত করুন',
  logout: 'লগআউট',

  // Forms
  name: 'নাম',
  email: 'ইমেইল',
  phone: 'ফোন',
  address: 'ঠিকানা',
  description: 'বিবরণ',
  amount: 'পরিমাণ',
  date: 'তারিখ',
  notes: 'নোট',
  status: 'অবস্থা',
  type: 'ধরন',
  category: 'বিভাগ',
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',

  // Sales & Inventory
  quantity: 'পরিমাণ',
  unitPrice: 'একক মূল্য',
  discount: 'ছাড়',
  totalValue: 'মোট মূল্য',
  packageSales: 'প্যাকেজ বিক্রয়',
  refillSales: 'রিফিল বিক্রয়',
  cylinder: 'সিলিন্ডার',
  cylinders: 'সিলিন্ডার',
  product: 'পণ্য',
  products: 'পণ্যসমূহ',
  fullCylinders: 'পূর্ণ সিলিন্ডার',
  emptyCylinders: 'খালি সিলিন্ডার',
  stock: 'স্টক',
  purchase: 'ক্রয়',
  sale: 'বিক্রয়',
  retailDriver: 'খুচরা চালক',
  shipmentDrivers: 'চালান চালক',
  retailDrivers: 'খুচরা চালক',

  // Financial
  cash: 'নগদ',
  totalSales: 'মোট বিক্রয়',
  totalRevenue: 'মোট আয়',
  totalReceivables: 'মোট প্রাপ্য',
  thisMonth: 'এই মাস',
  lastMonth: 'গত মাস',
  today: 'আজ',
  yesterday: 'গতকাল',
  week: 'সপ্তাহ',
  month: 'মাস',
  year: 'বছর',

  // Messages
  error: 'ত্রুটি',
  success: 'সফল',
  warning: 'সতর্কতা',
  info: 'তথ্য',
  tryAgain: 'আবার চেষ্টা করুন',
  dataNotFound: 'তথ্য পাওয়া যায়নি',
  loadingData: 'তথ্য লোড হচ্ছে',
  noDataAvailable: 'কোন তথ্য উপলব্ধ নেই',
  operationSuccessful: 'অপারেশন সফল',
  operationFailed: 'অপারেশন ব্যর্থ',
  lastUpdated: 'সর্বশেষ আপডেট',

  // Specific Features
  inventoryManagement: 'তালিকা ব্যবস্থাপনা',
  driverManagement: 'চালক ব্যবস্থাপনা',
  userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
  expenseManagement: 'খরচ ব্যবস্থাপনা',
  receivableManagement: 'প্রাপ্য ব্যবস্থাপনা',
  filterByDriverType: 'চালকের ধরন অনুযায়ী ফিল্টার',
  refreshData: 'তথ্য রিফ্রেশ করুন',
  failedToDeleteDriver: 'চালক মুছতে ব্যর্থ',
  driverUpdatedSuccessfully: 'চালক সফলভাবে আপডেট হয়েছে',
  failedToUpdateDriver: 'চালক আপডেট করতে ব্যর্থ',
  totalSalesThisMonth: 'এই মাসের মোট বিক্রয়',
  noActiveDriversFoundForThisPeriod:
    'এই সময়ের জন্য কোন সক্রিয় চালক পাওয়া যায়নি',
  packageSalesQty: 'প্যাকেজ বিক্রয় পরিমাণ',
  refillSalesQty: 'রিফিল বিক্রয় পরিমাণ',
  totalSalesQty: 'মোট বিক্রয় পরিমাণ',
  urgent: 'জরুরি',

  // Dashboard specific
  salesManagement: 'বিক্রয় ব্যবস্থাপনা',
  recordDailySales: 'দৈনিক বিক্রয় রেকর্ড করুন',
  trackPerformance: 'এবং পারফরম্যান্স ট্র্যাক করুন',
  inventoryControl: 'ইনভেন্টরি নিয়ন্ত্রণ',
  monitorCylinderStock: 'সিলিন্ডার স্টক পর্যবেক্ষণ করুন',
  alerts: 'সতর্কতা',
  allGood: 'সব ঠিক আছে',
  manageDriversAndAssignments: 'চালক এবং অ্যাসাইনমেন্ট পরিচালনা করুন',
  manageTeam: 'দল পরিচালনা',
  manageSystemUsers: 'সিস্টেম ব্যবহারকারী পরিচালনা',
  manageSystemRoles: 'এবং ভূমিকা',
  teamAccess: 'দলের অ্যাক্সেস',
  trackCustomerPayments: 'গ্রাহক পেমেন্ট ট্র্যাক করুন',
  trackCustomerCredits: 'এবং ক্রেডিট',
  kPending: 'হাজার বাকি',
  assetsLiabilities: 'সম্পদ ও দায়',
  manageCompanyAssets: 'কোম্পানির সম্পদ পরিচালনা',
  manageLiabilities: 'এবং দায়',
  balanceSheet: 'ব্যালেন্স শীট',
  trackExpenses: 'খরচ ট্র্যাক করুন',
  manageBudgets: 'এবং বাজেট',
  pending: 'বাকি',
  financialReports: 'আর্থিক রিপোর্ট',
  viewComprehensiveReports: 'বিস্তৃত আর্থিক রিপোর্ট দেখুন',
  reportsAnalytics: 'রিপোর্ট ও বিশ্লেষণ',
  loadingText: 'ড্যাশবোর্ড ডেটা লোড হচ্ছে...',
  manageLpgDistributionBusiness:
    'আপনার এলপিজি বিতরণ ব্যবসা দক্ষতার সাথে পরিচালনা করুন',
  retry: 'আবার চেষ্টা করুন',
  revenue: 'আয়',
  tasks: 'কাজ',
  newSale: 'নতুন বিক্রয়',
  checkStock: 'স্টক চেক করুন',
  addExpense: 'খরচ যোগ করুন',
  updatePayment: 'পেমেন্ট আপডেট করুন',
  viewReports: 'রিপোর্ট দেখুন',
  recentActivity: 'সাম্প্রতিক কার্যকলাপ',
  rahmanSoldCylinders: 'রহমান ১৫টি সিলিন্ডার বিক্রি করেছেন',
  stockReplenished: 'স্টক পুনরায় পূরণ - ১০০টি সিলিন্ডার',
  paymentReceived: 'গ্রাহকের কাছ থেকে পেমেন্ট পেয়েছি',
  salesTrend: 'বিক্রয়ের প্রবণতা',
  last7Days: 'গত ৭ দিন',
  mon: 'সোম',
  tue: 'মঙ্গল',
  wed: 'বুধ',
  thu: 'বৃহঃ',
  fri: 'শুক্র',
  sat: 'শনি',
  sun: 'রবি',
  topDriverPerformance: 'শীর্ষ চালকের পারফরম্যান্স',
  lpgDistributorManagementSystem: 'এলপিজি ডিস্ট্রিবিউটর ম্যানেজমেন্ট সিস্টেম',

  // Additional missing keys from TypeScript errors
  addDriver: 'চালক যোগ করুন',
  activeDrivers: 'সক্রিয় চালক',
  allDrivers: 'সব চালক',
  performance: 'পারফরম্যান্স',
  driver: 'চালক',
  area: 'এলাকা',
  cashReceivables: 'নগদ প্রাপ্য',
  cylinderReceivables: 'সিলিন্ডার প্রাপ্য',
  retail: 'খুচরা',
  shipment: 'চালান',
  noDataFound: 'কোন তথ্য পাওয়া যায়নি',
  create: 'তৈরি করুন',
  packageSale: 'প্যাকেজ বিক্রয়',
  refillSale: 'রিফিল বিক্রয়',
  currency: 'মুদ্রা',
  timezone: 'সময় অঞ্চল',
  language: 'ভাষা',
  saveSuccess: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
  saveError: 'সেটিংস সংরক্ষণ করতে ব্যর্থ',
  generalSettings: 'সাধারণ সেটিংস',
  loadingInventoryData: 'ইনভেন্টরি ডেটা লোড হচ্ছে...',
  failedToLoadInventoryData: 'ইনভেন্টরি ডেটা লোড করতে ব্যর্থ',
  realTimeInventoryTracking: 'রিয়েল-টাইম ইনভেন্টরি ট্র্যাকিং',
  exportFunctionalityComingSoon: 'এক্সপোর্ট ফিচার শীঘ্রই আসছে',
  criticalAlert: 'জরুরি সতর্কতা',
  productsOutOfStock: 'পণ্য স্টক শেষ',
  lowStockWarning: 'কম স্টকের সতর্কতা',
  productsBelowMinimumThreshold: 'পণ্য ন্যূনতম সীমার নিচে',
  currentStock: 'বর্তমান স্টক',
  todaysSales: 'আজকের বিক্রয়',
  cylindersSold: 'সিলিন্ডার বিক্রি',
  todaysPurchases: 'আজকের ক্রয়',
  cylindersReceived: 'সিলিন্ডার পাওয়া',
  totalCylinders: 'মোট সিলিন্ডার',
  allCylinders: 'সব সিলিন্ডার',
  currentFullCylinderInventory: 'বর্তমান পূর্ণ সিলিন্ডার ইনভেন্টরি',
  company: 'কোম্পানি',
  size: 'আকার',
  noFullCylindersInInventory: 'ইনভেন্টরিতে কোন পূর্ণ সিলিন্ডার নেই',
  emptyCylinderInventoryAvailability: 'খালি সিলিন্ডার ইনভেন্টরির উপলব্ধতা',
  emptyCylindersInHand: 'হাতে খালি সিলিন্ডার',
  noEmptyCylindersInInventory: 'ইনভেন্টরিতে কোন খালি সিলিন্ডার নেই',
  note: 'নোট',
  totalCylinderReceivables: 'মোট সিলিন্ডার প্রাপ্য',
  totalCylindersReceivables: 'মোট সিলিন্ডার প্রাপ্য',
  dailyInventoryTracking: 'দৈনিক ইনভেন্টরি ট্র্যাকিং',
  automatedCalculationsExactFormulas:
    'সঠিক ব্যবসায়িক সূত্র ব্যবহার করে স্বয়ংক্রিয় গণনা',
  packagePurchase: 'প্যাকেজ ক্রয়',
  refillPurchase: 'রিফিল ক্রয়',
  emptyCylindersBuySell: 'খালি সিলিন্ডার কেনাবেচা',
  latest: 'সর্বশেষ',
  noDailyInventoryDataAvailable: 'দৈনিক ইনভেন্টরি ডেটা উপলব্ধ নেই',
  businessFormulaImplementation: 'ব্যবসায়িক সূত্র বাস্তবায়ন',
  dailyCalculations: 'দৈনিক গণনা',
  todaysFullCylinders: 'আজকের পূর্ণ সিলিন্ডার',
  yesterdaysFull: 'গতকালের পূর্ণ',
  todaysEmptyCylinders: 'আজকের খালি সিলিন্ডার',
  yesterdaysEmpty: 'গতকালের খালি',
  dataSources: 'ডেটা উৎস',
  packageRefillSales: 'প্যাকেজ ও রিফিল বিক্রয়',
  sumAllDriversSalesForDate: 'তারিখের জন্য সব চালকের বিক্রয়ের যোগফল',
  packageRefillPurchase: 'প্যাকেজ ও রিফিল ক্রয়',
  sumCompletedShipmentsFromShipmentsPage:
    'চালান পাতা থেকে সম্পূর্ণ চালানের যোগফল',
  sumCompletedEmptyCylinderShipments: 'সম্পূর্ণ খালি সিলিন্ডার চালানের যোগফল',
  allCalculationsUpdatedRealTime: 'সব গণনা রিয়েল-টাইমে আপডেট হয়',
  currentStockHealth: 'বর্তমান স্টকের অবস্থা',
  productsInGoodStock: 'ভাল স্টকে পণ্য',
  producentsWithLowStockWarning: 'কম স্টক সতর্কতা সহ পণ্য',
  productsInCriticalStock: 'গুরুতর স্টকে পণ্য',

  // Dashboard and reports
  cashDepositsByDriver: 'চালক অনুযায়ী নগদ জমা',
  driverExpense: 'চালক খরচ',
  fuelExpense: 'জ্বালানি খরচ',
  maintenanceExpense: 'রক্ষণাবেক্ষণ খরচ',
  officeExpense: 'অফিস খরচ',
  transportExpense: 'পরিবহন খরচ',
  miscellaneousExpense: 'বিবিধ খরচ',
  generalExpense: 'সাধারণ খরচ',
  failedToLoadDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড করতে ব্যর্থ',
  loadingDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড হচ্ছে...',
  noReportDataAvailable: 'কোন রিপোর্ট ডেটা উপলব্ধ নেই',
  tryAgainOrSelectDate: 'আবার চেষ্টা করুন বা অন্য তারিখ নির্বাচন করুন',
  comprehensiveDailySalesReport: 'বিস্তৃত দৈনিক বিক্রয় রিপোর্ট',
  totalSalesValue: 'মোট বিক্রয় মূল্য',
  totalDeposited: 'মোট জমা',
  totalExpenses: 'মোট খরচ',
  availableCash: 'উপলব্ধ নগদ',
  totalCashReceivables: 'মোট নগদ প্রাপ্য',
  changeInReceivablesCashCylinders: 'প্রাপ্যে পরিবর্তন (নগদ ও সিলিন্ডার)',
  dailyDepositsExpenses: 'দৈনিক জমা ও খরচ',
  detailedBreakdownDepositsExpenses: 'জমা ও খরচের বিস্তারিত বিভাজন',
  deposits: 'জমা',
  particulars: 'বিবরণ',
  noDepositsFound: 'এই তারিখের জন্য কোন জমা পাওয়া যায়নি',
  totalDepositsCalculated: 'মোট জমা (গণনাকৃত)',
  noExpensesFound: 'এই তারিখের জন্য কোন খরচ পাওয়া যায়নি',
  totalExpensesCalculated: 'মোট খরচ (গণনাকৃত)',
  totalAvailableCash: 'মোট উপলব্ধ নগদ',
  totalDepositsIncludingSales: 'বিক্রয় সহ মোট জমা',

  // Sales and inventory forms
  customerName: 'গ্রাহকের নাম',

  // Settings and admin
  adminPanel: 'অ্যাডমিন প্যানেল',
  systemAdministration: 'সিস্টেম প্রশাসন',
  viewDistributorDashboard: 'ডিস্ট্রিবিউটর ড্যাশবোর্ড দেখুন',
  signOut: 'সাইন আউট',
  lightMode: 'হালকা মোড',
  darkMode: 'অন্ধকার মোড',
  systemTheme: 'সিস্টেম থিম',

  // Shipments and purchase orders
  shipmentsManagement: 'চালান ব্যবস্থাপনা',
  trackPurchaseOrdersAndShipments: 'ক্রয় অর্ডার ও চালান ট্র্যাক করুন',
  newPurchase: 'নতুন ক্রয়',
  emptyCylinderBuySell: 'খালি সিলিন্ডার কেনাবেচা',
  allShipments: 'সব চালান',
  outstandingOrders: 'বকেয়া অর্ডার',
  completedOrders: 'সম্পূর্ণ অর্ডার',
  allCompanies: 'সব কোম্পানি',
  allProducts: 'সব পণ্য',
  fromDate: 'শুরুর তারিখ',
  toDate: 'শেষ তারিখ',
  clearFilters: 'ফিল্টার পরিষ্কার করুন',
  loadingShipments: 'চালান লোড হচ্ছে...',
  noShipmentsFound: 'কোন চালান পাওয়া যায়নি',
  invoice: 'চালান',
  units: 'ইউনিট',
  gas: 'গ্যাস',
  unit: 'ইউনিট',
  unitCost: 'ইউনিট খরচ',
  gasCost: 'গ্যাস খরচ',
  cylinderCost: 'সিলিন্ডার খরচ',
  vehicle: 'যানবাহন',
  markAsFulfilled: 'সম্পূর্ণ হিসেবে চিহ্নিত করুন',
  totalItems: 'মোট আইটেম',
  totalCost: 'মোট খরচ',
  editPurchaseOrder: 'ক্রয় অর্ডার সম্পাদনা করুন',
  createNewPurchaseOrder: 'নতুন ক্রয় অর্ডার তৈরি করুন',
  step: 'ধাপ',
  of: 'এর',
  orderInformation: 'অর্ডার তথ্য',
  selectCompany: 'কোম্পানি নির্বাচন করুন',
  selectDriver: 'চালক নির্বাচন করুন',
  shipmentDate: 'চালানের তারিখ',
  expectedDeliveryDate: 'প্রত্যাশিত ডেলিভারি তারিখ',
  invoiceNumber: 'চালান নম্বর',
  enterInvoiceNumber: 'চালান নম্বর লিখুন',
  paymentTerms: 'পেমেন্ট শর্তাবলী',
  cashOnDelivery: 'ডেলিভারিতে নগদ',
  net30Days: 'নেট ৩০ দিন',
  net60Days: 'নেট ৬০ দিন',
  advancePayment: 'অগ্রিম পেমেন্ট',
  priority: 'অগ্রাধিকার',
  low: 'কম',
  normal: 'স্বাভাবিক',
  high: 'উচ্চ',
  vehicleNumber: 'যানবাহন নম্বর',
  enterVehicleNumber: 'যানবাহন নম্বর লিখুন',
  enterAdditionalNotes: 'অতিরিক্ত নোট লিখুন',
  addLineItem: 'লাইন আইটেম যোগ করুন',
  selectProduct: 'পণ্য নির্বাচন করুন',
  selectCompanyFirst: 'প্রথমে কোম্পানি নির্বাচন করুন',
  package: 'প্যাকেজ',
  refill: 'রিফিল',
  gasPrice: 'গ্যাসের দাম',
  cylinderPrice: 'সিলিন্ডারের দাম',
  taxRate: 'করের হার',
  lineTotalPreview: 'লাইন মোট প্রিভিউ',
  packageInfo: 'প্যাকেজ তথ্য',
  refillInfo: 'রিফিল তথ্য',
  addItem: 'আইটেম যোগ করুন',
  purchaseItems: 'ক্রয় আইটেম',
  qty: 'পরিমাণ',
  lineTotal: 'লাইন মোট',
  action: 'কার্য',
  editItem: 'আইটেম সম্পাদনা করুন',
  removeItem: 'আইটেম সরান',
  remove: 'সরান',
  totalPurchaseValue: 'মোট ক্রয় মূল্য',
  orderPreview: 'অর্ডার প্রিভিউ',
  orderSummary: 'অর্ডার সারসংক্ষেপ',
  totalQuantity: 'মোট পরিমাণ',
  companyRequired: 'কোম্পানি প্রয়োজন',
  driverRequired: 'চালক প্রয়োজন',
  shipmentDateRequired: 'চালানের তারিখ প্রয়োজন',
  atLeastOneLineItemRequired: 'কমপক্ষে একটি লাইন আইটেম প্রয়োজন',
  creating: 'তৈরি হচ্ছে...',
  updatePurchaseOrder: 'ক্রয় অর্ডার আপডেট করুন',
  createPurchaseOrder: 'ক্রয় অর্ডার তৈরি করুন',

  // Empty cylinder transactions
  transactionType: 'লেনদেনের ধরন',
  buyEmptyCylinders: 'খালি সিলিন্ডার কিনুন',
  sellEmptyCylinders: 'খালি সিলিন্ডার বিক্রি করুন',
  addEmptyCylindersToInventory: 'ইনভেন্টরিতে খালি সিলিন্ডার যোগ করুন',
  removeEmptyCylindersFromInventory: 'ইনভেন্টরি থেকে খালি সিলিন্ডার সরান',
  cylinderSize: 'সিলিন্ডারের আকার',
  selectCylinderSize: 'সিলিন্ডারের আকার নির্বাচন করুন',
  emptyCylindersNote: 'খালি সিলিন্ডার লেনদেনের নোট',
  transactionDate: 'লেনদেনের তারিখ',
  enterTransactionDetails: 'লেনদেনের বিবরণ লিখুন',
  buy: 'কিনুন',
  sell: 'বিক্রি করুন',
};

const translationMap: Record<string, Translations> = {
  en: englishTranslations,
  bn: bengaliTranslations,
  'en-US': englishTranslations,
  'bn-BD': bengaliTranslations,
};

export function getTranslation(
  language: string,
  key: keyof Translations
): string {
  const translations = translationMap[language] || englishTranslations;
  return translations[key] || englishTranslations[key] || key;
}

// Keep the simple t function for backward compatibility
export function t(key: keyof Translations): string {
  return englishTranslations[key] || key;
}

// Export default translations for backward compatibility
export const translations = englishTranslations;
