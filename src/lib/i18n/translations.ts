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
  create: string;
  update: string;
  submit: string;
  close: string;
  view: string;
  export: string;
  clear: string;
  apply: string;
  confirm: string;
  yes: string;
  no: string;
  back: string;
  next: string;
  previous: string;

  // Forms
  name: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  active: string;
  inactive: string;
  type: string;
  description: string;
  amount: string;
  date: string;
  notes: string;
  required: string;
  optional: string;
  select: string;
  enter: string;
  customerName: string;
  licenseNumber: string;
  route: string;
  area: string;
  joiningDate: string;

  // Sales & Inventory
  packageSale: string;
  refillSale: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalValue: string;
  netValue: string;
  cashDeposited: string;
  cylindersDeposited: string;
  cylinder: string;
  cylinders: string;
  available: string;
  lowStock: string;
  criticalStock: string;
  salesValue: string;
  fullCylinders: string;
  emptyCylinders: string;

  // Drivers
  addDriver: string;
  driverName: string;
  driverType: string;
  retail: string;
  shipment: string;
  performance: string;
  retailDriver: string;
  shipmentDriver: string;
  allDrivers: string;
  activeDrivers: string;

  // Financial
  revenue: string;
  receivables: string;
  cashReceivables: string;
  cylinderReceivables: string;
  totalSales: string;
  cash: string;
  credit: string;
  payment: string;
  balance: string;

  // Time periods
  today: string;
  thisWeek: string;
  thisMonth: string;
  thisYear: string;
  yesterday: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;

  // Status
  pending: string;
  approved: string;
  rejected: string;
  completed: string;
  failed: string;
  success: string;
  error: string;
  warning: string;

  // Settings
  currency: string;
  timezone: string;
  language: string;
  generalSettings: string;

  // Messages
  saveSuccess: string;
  saveError: string;
  deleteSuccess: string;
  deleteError: string;
  loadError: string;
  noDataFound: string;
  welcomeBack: string;
  lastUpdated: string;
  pleaseTryAgain: string;

  // Management
  salesManagement: string;
  driverManagement: string;
  expenseManagement: string;
  inventoryManagement: string;

  // Theme
  lightMode: string;
  darkMode: string;
  systemTheme: string;

  // Admin
  adminPanel: string;
  systemAdministration: string;
  viewDistributorDashboard: string;
  signOut: string;

  // Dashboard Cards
  recordDailySales: string;
  trackPerformance: string;
  monitorCylinderStock: string;
  manageDriversAndAssignments: string;
  manageSystemUsers: string;
  manageSystemRoles: string;
  trackCustomerPayments: string;
  trackCustomerCredits: string;
  manageCompanyAssets: string;
  manageLiabilities: string;
  trackExpenses: string;
  manageBudgets: string;
  viewComprehensiveReports: string;
  manageTeam: string;
  teamAccess: string;
  balanceSheet: string;
  reportsAnalytics: string;
  inventoryControl: string;
  userManagement: string;
  assetsLiabilities: string;
  financialReports: string;

  // Actions
  newSale: string;
  checkStock: string;
  addExpense: string;
  updatePayment: string;
  viewReports: string;

  // Status
  allGood: string;
  alerts: string;
  kPending: string;
  thisMonth: string;

  // Dashboard
  recentActivity: string;
  salesTrend: string;
  last7Days: string;
  topDriverPerformance: string;
  lpgDistributorManagementSystem: string;
  lastUpdated: string;
  manageLpgDistributionBusiness: string;

  // Dashboard Missing Translations
  tasks: string;
  urgent: string;
  retry: string;
  loadingText: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;

  // Fallback Activity Messages
  rahmanSoldCylinders: string;
  stockReplenished: string;
  paymentReceived: string;
  fullCylindersText: string;
  abcStore: string;

  // Daily Sales Report
  dailySalesReport: string;
  comprehensiveDailySalesReport: string;
  totalSalesValue: string;
  totalDeposited: string;
  totalExpenses: string;
  availableCash: string;
  driver: string;
  packageSalesQty: string;
  refillSalesQty: string;
  totalSalesQty: string;
  discount: string;
  totalCylindersReceivables: string;
  totalCashReceivables: string;
  changeInReceivablesCashCylinders: string;
  retailDriver: string;
  cash: string;
  cylinders: string;
  deposits: string;
  expenses: string;
  particulars: string;
  description: string;
  amount: string;
  noDepositsFound: string;
  noExpensesFound: string;
  totalDepositsCalculated: string;
  totalExpensesCalculated: string;
  totalAvailableCash: string;
  totalDepositsIncludingSales: string;
  loadingDailySalesReport: string;
  noReportDataAvailable: string;
  tryAgainOrSelectDate: string;
  error: string;
  failedToLoadDailySalesReport: string;
  tryAgain: string;
  refresh: string;
  generalExpense: string;
  cashDepositsByDriver: string;
  dailyDepositsExpenses: string;
  detailedBreakdownDepositsExpenses: string;

  // Common expense categories for replacement
  driverExpense: string;
  fuelExpense: string;
  maintenanceExpense: string;
  officeExpense: string;
  transportExpense: string;
  miscellaneousExpense: string;

  // Inventory Management
  inventoryManagement: string;
  realTimeInventoryTracking: string;
  refresh: string;
  export: string;
  exportFunctionalityComingSoon: string;
  criticalAlert: string;
  productsOutOfStock: string;
  lowStockWarning: string;
  productsBelowMinimumThreshold: string;
  fullCylinders: string;
  emptyCylinders: string;
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
  quantity: string;
  noFullCylindersInInventory: string;
  emptyCylinderInventoryAvailability: string;
  emptyCylindersInHand: string;
  noEmptyCylindersInInventory: string;
  note: string;
  totalCylinderReceivables: string;
  cylinders: string;
  dailyInventoryTracking: string;
  automatedCalculationsExactFormulas: string;
  date: string;
  packageSalesQty: string;
  refillSalesQty: string;
  totalSalesQty: string;
  packagePurchase: string;
  refillPurchase: string;
  emptyCylindersBuySell: string;
  latest: string;
  noDailyInventoryDataAvailable: string;
  businessFormulaImplementation: string;
  dailyCalculations: string;
  todaysFullCylinders: string;
  yesterdaysFullPackagePurchase: string;
  todaysEmptyCylinders: string;
  yesterdaysEmptyRefillSales: string;
  totalCylindersFormula: string;
  fullPlusEmptyCylinders: string;
  dataSources: string;
  packageRefillSales: string;
  sumAllDriversSales: string;
  packageRefillPurchase: string;
  sumCompletedShipments: string;
  emptyCylindersBuySellData: string;
  sumCompletedEmptyShipments: string;
  allCalculationsUpdatedRealTime: string;
  currentStockHealth: string;
  productsInGoodStock: string;
  productsWithLowStockWarning: string;
  productsInCriticalStock: string;
  loadingInventoryData: string;
  failedToLoadInventoryData: string;
  tryAgain: string;
  yesterdaysFull: string;
  totalSales: string;
  yesterdaysEmpty: string;
  refillSales: string;
  sumAllDriversSalesForDate: string;
  sumCompletedShipmentsFromShipmentsPage: string;
  sumCompletedEmptyCylinderShipments: string;

  // Shipments Management
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
  unit: string;
  gas: string;
  cylinder: string;
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
  urgent: string;
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
  totalValue: string;
  previous: string;
  cancel: string;
  next: string;
  creating: string;
  updatePurchaseOrder: string;
  createPurchaseOrder: string;
  transactionType: string;
  buyEmptyCylinders: string;
  sellEmptyCylinders: string;
  addEmptyCylindersToInventory: string;
  removeEmptyCylindersFromInventory: string;
  cylinderSize: string;
  selectCylinderSize: string;
  emptyCylindersNote: string;
  unitPrice: string;
  transactionDate: string;
  enterTransactionDetails: string;
  buy: string;
  sell: string;

  // Validation Messages
  companyRequired: string;
  driverRequired: string;
  shipmentDateRequired: string;
  atLeastOneLineItemRequired: string;
  productRequired: string;
  quantityMustBeGreaterThanZero: string;
  gasPriceMustBeGreaterThanZero: string;
  cylinderPriceRequiredForPackage: string;
  failedToSavePurchaseOrder: string;
  markShipmentAsCompletedConfirm: string;
  failedToCompleteShipment: string;
  failedToCompleteShipmentTryAgain: string;
  confirmDeleteShipment: string;
  errorDeletingShipment: string;
  unknownError: string;
  failedToDeleteShipmentTryAgain: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    sales: 'Sales',
    drivers: 'Drivers',
    shipments: 'Shipments',
    receivables: 'Receivables',
    assets: 'Assets & Liabilities',
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
    loading: 'Loading...',
    noData: 'No data available',
    refresh: 'Refresh',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    close: 'Close',
    view: 'View',
    export: 'Export',
    clear: 'Clear',
    apply: 'Apply',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',

    // Forms
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    type: 'Type',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    notes: 'Notes',
    required: 'Required',
    optional: 'Optional',
    select: 'Select',
    enter: 'Enter',
    customerName: 'Customer Name',
    licenseNumber: 'License Number',
    route: 'Route',
    area: 'Area',
    joiningDate: 'Joining Date',

    // Sales & Inventory
    packageSale: 'Package Sale',
    refillSale: 'Refill Sale',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    discount: 'Discount',
    totalValue: 'Total Value',
    netValue: 'Net Value',
    cashDeposited: 'Cash Deposited',
    cylindersDeposited: 'Cylinders Deposited',
    cylinder: 'Cylinder',
    cylinders: 'Cylinders',
    available: 'Available',
    lowStock: 'Low Stock',
    criticalStock: 'Critical Stock',
    salesValue: 'Sales Value',
    fullCylinders: 'Full Cylinders',
    emptyCylinders: 'Empty Cylinders',

    // Drivers
    addDriver: 'Add Driver',
    driverName: 'Driver Name',
    driverType: 'Driver Type',
    retail: 'Retail',
    shipment: 'Shipment',
    performance: 'Performance',
    retailDriver: 'Retail Driver',
    shipmentDriver: 'Shipment Driver',
    allDrivers: 'All Drivers',
    activeDrivers: 'Active Drivers',

    // Financial
    revenue: 'Revenue',
    receivables: 'Receivables',
    cashReceivables: 'Cash Receivables',
    cylinderReceivables: 'Cylinder Receivables',
    totalSales: 'Total Sales',
    cash: 'Cash',
    credit: 'Credit',
    payment: 'Payment',
    balance: 'Balance',

    // Time periods
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    yesterday: 'Yesterday',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',

    // Status
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    failed: 'Failed',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',

    // Settings
    currency: 'Currency',
    timezone: 'Timezone',
    language: 'Language',
    generalSettings: 'General Settings',

    // Messages
    saveSuccess: 'Saved successfully',
    saveError: 'Error saving data',
    deleteSuccess: 'Deleted successfully',
    deleteError: 'Error deleting item',
    loadError: 'Error loading data',
    noDataFound: 'No data found',
    welcomeBack: 'Welcome back',
    lastUpdated: 'Last updated',
    pleaseTryAgain: 'Please try again',

    // Management
    salesManagement: 'Sales Management',
    driverManagement: 'Driver Management',
    expenseManagement: 'Expense Management',
    inventoryManagement: 'Inventory Management',

    // Theme
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    systemTheme: 'System theme',

    // Admin
    adminPanel: 'Admin Panel',
    systemAdministration: 'System Administration',
    viewDistributorDashboard: 'View Distributor Dashboard',
    signOut: 'Sign Out',

    // Dashboard Cards
    recordDailySales: 'Record daily sales',
    trackPerformance: 'track performance',
    monitorCylinderStock: 'Monitor cylinder stock levels',
    manageDriversAndAssignments: 'Manage drivers and assignments',
    manageSystemUsers: 'Manage system users',
    manageSystemRoles: 'and roles',
    trackCustomerPayments: 'Track customer payments',
    trackCustomerCredits: 'and credits',
    manageCompanyAssets: 'Manage company assets',
    manageLiabilities: 'and liabilities',
    trackExpenses: 'Track expenses',
    manageBudgets: 'and manage budgets',
    viewComprehensiveReports: 'View comprehensive financial reports',
    manageTeam: 'Manage team',
    teamAccess: 'Team access',
    balanceSheet: 'Balance sheet',
    reportsAnalytics: 'Reports & analytics',
    inventoryControl: 'Inventory Control',
    userManagement: 'User Management',
    assetsLiabilities: 'Assets & Liabilities',
    financialReports: 'Financial Reports',

    // Actions
    newSale: 'New Sale',
    checkStock: 'Check Stock',
    addExpense: 'Add Expense',
    updatePayment: 'Update Payment',
    viewReports: 'View Reports',

    // Status
    allGood: 'All good',
    alerts: 'alerts',
    kPending: 'K pending',
    thisMonth: 'this month',

    // Dashboard
    recentActivity: 'Recent Activity',
    salesTrend: 'Sales Trend',
    last7Days: 'Last 7 Days',
    topDriverPerformance: 'Top Driver Performance',
    lpgDistributorManagementSystem: 'LPG Distributor Management System',
    lastUpdated: 'Last updated',
    manageLpgDistributionBusiness:
      'Manage your LPG distribution business efficiently',

    // Dashboard Missing Translations
    tasks: 'Tasks',
    urgent: 'Urgent',
    retry: 'Retry',
    loadingText: 'Loading...',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',

    // Fallback Activity Messages
    rahmanSoldCylinders: 'Rahman sold 5 cylinders',
    stockReplenished: 'Stock replenished: 50 full cylinders',
    paymentReceived: 'Payment received from ABC Store',
    fullCylindersText: 'full cylinders',
    abcStore: 'ABC Store',

    // Daily Sales Report
    dailySalesReport: 'Daily Sales Report',
    comprehensiveDailySalesReport:
      'Comprehensive daily sales and cash flow report',
    totalSalesValue: 'Total Sales Value',
    totalDeposited: 'Total Deposited',
    totalExpenses: 'Total Expenses',
    availableCash: 'Available Cash',
    driver: 'Driver',
    packageSalesQty: 'Package Sales (Qty)',
    refillSalesQty: 'Refill Sales (Qty)',
    totalSalesQty: 'Total Sales (Qty)',
    discount: 'Discount',
    totalCylindersReceivables: 'Total Cylinders Receivables',
    totalCashReceivables: 'Total Cash Receivables',
    changeInReceivablesCashCylinders: 'Change in Receivables (Cash/Cylinders)',
    retailDriver: 'Retail Driver',
    cash: 'Cash',
    cylinders: 'Cylinders',
    deposits: 'Deposits',
    expenses: 'Expenses',
    particulars: 'Particulars',
    description: 'Description',
    amount: 'Amount',
    noDepositsFound: 'No deposits found for this date',
    noExpensesFound: 'No expenses found for this date',
    totalDepositsCalculated: 'Total Deposits',
    totalExpensesCalculated: 'Total Expenses',
    totalAvailableCash: 'Total Available Cash',
    totalDepositsIncludingSales:
      'Total deposits (including sales) minus total expenses',
    loadingDailySalesReport: 'Loading daily sales report...',
    noReportDataAvailable: 'No report data available',
    tryAgainOrSelectDate: 'Please try again or select a different date.',
    error: 'Error',
    failedToLoadDailySalesReport:
      'Failed to load daily sales report. Please try again.',
    tryAgain: 'Please try again.',
    refresh: 'Refresh',
    generalExpense: 'General Expense',
    cashDepositsByDriver: 'Cash deposits by driver',
    dailyDepositsExpenses: 'Daily Deposits & Expenses',
    detailedBreakdownDepositsExpenses:
      'Detailed breakdown of all deposits and expenses',

    // Common expense categories for replacement
    driverExpense: 'Driver Expense',
    fuelExpense: 'Fuel Expense',
    maintenanceExpense: 'Maintenance Expense',
    officeExpense: 'Office Expense',
    transportExpense: 'Transport Expense',
    miscellaneousExpense: 'Miscellaneous Expense',

    // Inventory Management
    inventoryManagement: 'Inventory Management',
    realTimeInventoryTracking:
      'Real-time inventory tracking and stock monitoring',
    refresh: 'Refresh',
    export: 'Export',
    exportFunctionalityComingSoon: 'Export functionality coming soon!',
    criticalAlert: 'Critical Alert',
    productsOutOfStock: 'products are out of stock',
    lowStockWarning: 'Low Stock Warning',
    productsBelowMinimumThreshold: 'products are below minimum threshold',
    fullCylinders: 'Full Cylinders',
    emptyCylinders: 'Empty Cylinders',
    currentStock: 'Current stock',
    todaysSales: "Today's Sales",
    cylindersSold: 'Cylinders sold',
    todaysPurchases: "Today's Purchases",
    cylindersReceived: 'Cylinders received',
    totalCylinders: 'Total Cylinders',
    allCylinders: 'All cylinders',
    currentFullCylinderInventory:
      'Current full cylinder inventory by company and size',
    company: 'Company',
    size: 'Size',
    quantity: 'Quantity',
    noFullCylindersInInventory: 'No full cylinders in inventory.',
    emptyCylinderInventoryAvailability:
      'Empty cylinder inventory and availability',
    emptyCylindersInHand: 'Empty Cylinders in Hand',
    noEmptyCylindersInInventory: 'No empty cylinders in inventory.',
    note: 'Note',
    totalCylinderReceivables: 'Total cylinder receivables',
    cylinders: 'cylinders',
    dailyInventoryTracking: 'Daily Inventory Tracking',
    automatedCalculationsExactFormulas:
      'Automated calculations with exact business formulas',
    date: 'Date',
    packageSalesQty: 'Package Sales (Qty)',
    refillSalesQty: 'Refill Sales (Qty)',
    totalSalesQty: 'Total Sales (Qty)',
    packagePurchase: 'Package Purchase',
    refillPurchase: 'Refill Purchase',
    emptyCylindersBuySell: 'Empty Cylinders Buy/Sell',
    latest: 'Latest',
    noDailyInventoryDataAvailable: 'No daily inventory data available.',
    businessFormulaImplementation: 'Business Formula Implementation',
    dailyCalculations: 'Daily Calculations',
    todaysFullCylinders: "Today's Full Cylinders =",
    yesterdaysFullPackagePurchase:
      " Yesterday's Full + Package Purchase + Refill Purchase - Total Sales",
    todaysEmptyCylinders: "Today's Empty Cylinders =",
    yesterdaysEmptyRefillSales:
      " Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell",
    totalCylindersFormula: 'Total Cylinders =',
    fullPlusEmptyCylinders: ' Full Cylinders + Empty Cylinders',
    dataSources: 'Data Sources',
    packageRefillSales: 'Package/Refill Sales:',
    sumAllDriversSales: ' SUM(all drivers sales for date)',
    packageRefillPurchase: 'Package/Refill Purchase:',
    sumCompletedShipments:
      ' SUM(COMPLETED shipments from Shipments page for date)',
    emptyCylindersBuySellData: 'Empty Cylinders Buy/Sell:',
    sumCompletedEmptyShipments:
      ' SUM(COMPLETED empty cylinder shipments for date)',
    allCalculationsUpdatedRealTime:
      ' All calculations are updated in real-time when shipments are marked as COMPLETED.',
    currentStockHealth: 'Current Stock Health',
    productsInGoodStock: 'Products in Good Stock',
    productsWithLowStockWarning: 'Products with Low Stock Warning',
    productsInCriticalStock: 'Products in Critical Stock',
    loadingInventoryData: 'Loading inventory data...',
    failedToLoadInventoryData: 'Failed to load inventory data',
    tryAgain: 'Try Again',
    yesterdaysFull: "Yesterday's Full",
    totalSales: 'Total Sales',
    yesterdaysEmpty: "Yesterday's Empty",
    refillSales: 'Refill Sales',
    sumAllDriversSalesForDate: 'SUM(all drivers sales for date)',
    sumCompletedShipmentsFromShipmentsPage:
      'SUM(COMPLETED shipments from Shipments page for date)',
    sumCompletedEmptyCylinderShipments:
      'SUM(COMPLETED empty cylinder shipments for date)',

    // Shipments Management
    shipmentsManagement: 'Shipments Management',
    trackPurchaseOrdersAndShipments:
      'Track purchase orders and shipments. Outstanding orders can be edited/deleted, completed orders are view-only.',
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
    noShipmentsFound: 'No shipments found for the selected criteria.',
    invoice: 'Invoice',
    units: 'units',
    unit: 'unit',
    gas: 'Gas',
    cylinder: 'Cylinder',
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
    selectCompany: 'Select a company...',
    selectDriver: 'Select a driver...',
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
    urgent: 'Urgent',
    vehicleNumber: 'Vehicle Number',
    enterVehicleNumber: 'Enter vehicle number',
    enterAdditionalNotes:
      'Enter any additional notes or special instructions...',
    addLineItem: 'Add Line Item',
    selectProduct: 'Select Product',
    selectCompanyFirst: 'Select Company First',
    package: 'Package',
    refill: 'Refill',
    gasPrice: 'Gas Price',
    cylinderPrice: 'Cylinder Price',
    taxRate: 'Tax Rate',
    lineTotalPreview: 'Line Total Preview',
    packageInfo: 'Package: Both cylinder and gas costs are recorded separately',
    refillInfo:
      'Refill: Only gas/refill cost, empty cylinders go out of inventory',
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
    totalValue: 'Total Value',
    previous: 'Previous',
    cancel: 'Cancel',
    next: 'Next',
    creating: 'Creating...',
    updatePurchaseOrder: 'Update Purchase Order',
    createPurchaseOrder: 'Create Purchase Order',
    transactionType: 'Transaction Type',
    buyEmptyCylinders: 'Buy Empty Cylinders',
    sellEmptyCylinders: 'Sell Empty Cylinders',
    addEmptyCylindersToInventory: 'Add empty cylinders to inventory',
    removeEmptyCylindersFromInventory: 'Remove empty cylinders from inventory',
    cylinderSize: 'Cylinder Size',
    selectCylinderSize: 'Select Cylinder Size',
    emptyCylindersNote:
      'Empty cylinders are categorized by size only, independent of company',
    unitPrice: 'Unit Price',
    transactionDate: 'Transaction Date',
    enterTransactionDetails: 'Enter transaction details...',
    buy: 'Buy',
    sell: 'Sell',

    // Validation Messages
    companyRequired: 'Company is required',
    driverRequired: 'Driver is required',
    shipmentDateRequired: 'Shipment date is required',
    atLeastOneLineItemRequired: 'At least one line item is required',
    productRequired: 'Product is required',
    quantityMustBeGreaterThanZero: 'Quantity must be greater than 0',
    gasPriceMustBeGreaterThanZero: 'Gas price must be greater than 0',
    cylinderPriceRequiredForPackage:
      'Cylinder price is required for package purchases',
    failedToSavePurchaseOrder:
      'Failed to save purchase order. Please try again.',
    markShipmentAsCompletedConfirm:
      'Mark this shipment as completed? This will update the inventory and cannot be undone.',
    failedToCompleteShipment: 'Failed to complete shipment',
    failedToCompleteShipmentTryAgain:
      'Failed to complete shipment. Please try again.',
    confirmDeleteShipment: 'Are you sure you want to delete this shipment?',
    errorDeletingShipment: 'Error deleting shipment',
    unknownError: 'Unknown error',
    failedToDeleteShipmentTryAgain:
      'Failed to delete shipment. Please try again.',
  },

  bn: {
    // Navigation
    dashboard: 'ড্যাশবোর্ড',
    sales: 'বিক্রয়',
    drivers: 'চালক',
    shipments: 'চালান',
    receivables: 'পাওনা',
    assets: 'সম্পদ',
    expenses: 'খরচ',
    settings: 'সেটিংস',
    inventory: 'মজুদ',
    users: 'ব্যবহারকারী',
    reports: 'প্রতিবেদন',
    productManagement: 'পণ্য ব্যবস্থাপনা',
    dailySalesReport: 'দৈনিক বিক্রয় প্রতিবেদন',
    analytics: 'বিশ্লেষণ',

    // Common Actions
    save: 'সেভ করুন',
    cancel: 'বাতিল করুন',
    delete: 'ডিলিট করুন',
    edit: 'এডিট করুন',
    add: 'যোগ করুন',
    search: 'অনুসন্ধান করুন',
    filter: 'ফিল্টার করুন',
    total: 'মোট',
    actions: 'কার্যক্রম',
    loading: 'লোড হচ্ছে',
    noData: 'কোনো ডেটা পাওয়া যায়নি',
    refresh: 'রিফ্রেশ করুন',
    create: 'তৈরি করুন',
    update: 'হালনাগাদ করুন',
    submit: 'জমা দিন',
    close: 'বন্ধ করুন',
    view: 'দেখুন',
    export: 'এক্সপোর্ট করুন',
    clear: 'পরিষ্কার করুন',
    apply: 'প্রয়োগ করুন',
    confirm: 'নিশ্চিত করুন',
    yes: 'হ্যাঁ',
    no: 'না',
    back: 'ফিরে যান',
    next: 'পরবর্তী',
    previous: 'পূর্ববর্তী',

    // Forms
    name: 'নাম',
    phone: 'ফোন নম্বর',
    email: 'ইমেইল',
    address: 'ঠিকানা',
    status: 'অবস্থা',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    type: 'ধরণ',
    description: 'বিবরণ',
    amount: 'পরিমাণ',
    date: 'তারিখ',
    notes: 'মন্তব্য',
    required: 'আবশ্যক',
    optional: 'ঐচ্ছিক',
    select: 'নির্বাচন করুন',
    enter: 'লিখুন',
    customerName: 'গ্রাহকের নাম',
    licenseNumber: 'লাইসেন্স নম্বর',
    route: 'রুট',
    area: 'এলাকা',
    joiningDate: 'যোগদানের তারিখ',

    // Sales & Inventory
    packageSale: 'প্যাকেজ বিক্রয়',
    refillSale: 'রিফিল বিক্রয়',
    quantity: 'পরিমাণ',
    unitPrice: 'একক মূল্য',
    discount: 'ছাড়',
    totalValue: 'মোট মূল্য',
    netValue: 'নীট মূল্য',
    cashDeposited: 'নগদ জমা',
    cylindersDeposited: 'সিলিন্ডার জমা',
    cylinder: 'সিলিন্ডার',
    cylinders: 'সিলিন্ডার',
    available: 'উপলব্ধ',
    lowStock: 'স্বল্প মজুদ',
    criticalStock: 'জরুরি মজুদ',
    salesValue: 'বিক্রয় মূল্য',
    fullCylinders: 'ভর্তি সিলিন্ডার',
    emptyCylinders: 'খালি সিলিন্ডার',

    // Drivers
    addDriver: 'ড্রাইভার যোগ করুন',
    driverName: 'ড্রাইভারের নাম',
    driverType: 'ড্রাইভারের প্রকার',
    retail: 'খুচরা',
    shipment: 'চালান',
    performance: 'কর্মক্ষমতা',
    retailDriver: 'খুচরা ড্রাইভার',
    shipmentDriver: 'চালান ড্রাইভার',
    allDrivers: 'সকল ড্রাইভার',
    activeDrivers: 'সক্রিয় ড্রাইভার',

    // Financial
    revenue: 'আয়',
    receivables: 'পাওনা',
    cashReceivables: 'নগদ প্রাপ্য',
    cylinderReceivables: 'সিলিন্ডার প্রাপ্য',
    totalSales: 'মোট বিক্রয়',
    cash: 'নগদ',
    credit: 'বাকী',
    payment: 'পরিশোধ',
    balance: 'ব্যালেন্স',

    // Time periods
    today: 'আজ',
    thisWeek: 'এই সপ্তাহ',
    thisMonth: 'এই মাস',
    thisYear: 'এই বছর',
    yesterday: 'গতকাল',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    monthly: 'মাসিক',
    yearly: 'বার্ষিক',

    // Status
    pending: 'অপেক্ষমান',
    approved: 'অনুমোদিত',
    rejected: 'প্রত্যাখ্যাত',
    completed: 'সম্পন্ন',
    failed: 'ব্যর্থ',
    success: 'সফল',
    error: 'ত্রুটি',
    warning: 'সতর্কতা',

    // Settings
    currency: 'মুদ্রা',
    timezone: 'সময় অঞ্চল',
    language: 'ভাষা',
    generalSettings: 'সাধারণ সেটিংস',

    // Messages
    saveSuccess: 'সফলভাবে সংরক্ষিত',
    saveError: 'ডেটা সংরক্ষণে ত্রুটি',
    deleteSuccess: 'সফলভাবে মুছে ফেলা হয়েছে',
    deleteError: 'আইটেম মুছে ফেলতে ত্রুটি',
    loadError: 'ডেটা লোড করতে ত্রুটি',
    noDataFound: 'কোনো ডেটা পাওয়া যায়নি',
    welcomeBack: 'আবার স্বাগতম',
    lastUpdated: 'সর্বশেষ আপডেট',
    pleaseTryAgain: 'অনুগ্রহ করে আবার চেষ্টা করুন',

    // Management
    salesManagement: 'বিক্রয় ব্যবস্থাপনা',
    driverManagement: 'ড্রাইভার ব্যবস্থাপনা',
    expenseManagement: 'খরচ ব্যবস্থাপনা',
    inventoryManagement: 'মজুদ ব্যবস্থাপনা',

    // Theme
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড',
    systemTheme: 'সিস্টেম থিম',

    // Admin
    adminPanel: 'অ্যাডমিন প্যানেল',
    systemAdministration: 'সিস্টেম প্রশাসন',
    viewDistributorDashboard: 'ডিস্ট্রিবিউটর ড্যাশবোর্ড দেখুন',
    signOut: 'সাইন আউট',

    // Dashboard Cards
    recordDailySales: 'দৈনিক বিক্রয় রেকর্ড করুন',
    trackPerformance: 'এবং কর্মক্ষমতা ট্র্যাক করুন',
    monitorCylinderStock: 'সিলিন্ডার স্টক লেভেল মনিটর করুন',
    manageDriversAndAssignments: 'ড্রাইভার এবং অ্যাসাইনমেন্ট পরিচালনা করুন',
    manageSystemUsers: 'সিস্টেম ব্যবহারকারী পরিচালনা করুন',
    manageSystemRoles: 'এবং ভূমিকা',
    trackCustomerPayments: 'গ্রাহক পেমেন্ট ট্র্যাক করুন',
    trackCustomerCredits: 'এবং ক্রেডিট',
    manageCompanyAssets: 'কোম্পানির সম্পদ পরিচালনা করুন',
    manageLiabilities: 'এবং দায়বদ্ধতা',
    trackExpenses: 'খরচ ট্র্যাক করুন',
    manageBudgets: 'এবং বাজেট পরিচালনা করুন',
    viewComprehensiveReports: 'ব্যাপক আর্থিক প্রতিবেদন দেখুন',
    manageTeam: 'টিম পরিচালনা করুন',
    teamAccess: 'টিম অ্যাক্সেস',
    balanceSheet: 'ব্যালেন্স শিট',
    reportsAnalytics: 'প্রতিবেদন এবং বিশ্লেষণ',
    inventoryControl: 'মজুদ নিয়ন্ত্রণ',
    userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
    assetsLiabilities: 'সম্পদ এবং দায়বদ্ধতা',
    financialReports: 'আর্থিক প্রতিবেদন',

    // Actions
    newSale: 'নতুন বিক্রয়',
    checkStock: 'স্টক চেক করুন',
    addExpense: 'খরচ যোগ করুন',
    updatePayment: 'পেমেন্ট আপডেট করুন',
    viewReports: 'প্রতিবেদন দেখুন',

    // Status
    allGood: 'সব ঠিক আছে',
    alerts: 'সতর্কতা',
    kPending: 'হাজার অপেক্ষমান',
    thisMonth: 'এই মাসে',

    // Dashboard
    recentActivity: 'সাম্প্রতিক কার্যকলাপ',
    salesTrend: 'বিক্রয় প্রবণতা',
    last7Days: 'গত ৭ দিন',
    topDriverPerformance: 'শীর্ষ ড্রাইভার পারফরম্যান্স',
    lpgDistributorManagementSystem: 'এলপিজি ডিস্ট্রিবিউটর ম্যানেজমেন্ট সিস্টেম',
    lastUpdated: 'সর্বশেষ আপডেট',
    manageLpgDistributionBusiness:
      'আপনার এলপিজি বিতরণ ব্যবসা দক্ষতার সাথে পরিচালনা করুন',

    // Dashboard Missing Translations
    tasks: 'কাজ',
    urgent: 'জরুরি',
    retry: 'পুনরায় চেষ্টা করুন',
    loadingText: 'লোড হচ্ছে...',
    mon: 'সোম',
    tue: 'মঙ্গল',
    wed: 'বুধ',
    thu: 'বৃহ',
    fri: 'শুক্র',
    sat: 'শনি',
    sun: 'রবি',

    // Fallback Activity Messages
    rahmanSoldCylinders: 'রহমান ৫টি সিলিন্ডার বিক্রি করেছেন',
    stockReplenished: 'স্টক পুনরায় পূরণ: ৫০টি ভর্তি সিলিন্ডার',
    paymentReceived: 'এবিসি স্টোর থেকে পেমেন্ট গৃহীত',
    fullCylindersText: 'ভর্তি সিলিন্ডার',
    abcStore: 'এবিসি স্টোর',

    // Daily Sales Report
    dailySalesReport: 'দৈনিক বিক্রয় প্রতিবেদন',
    comprehensiveDailySalesReport:
      'ব্যাপক দৈনিক বিক্রয় এবং নগদ প্রবাহ প্রতিবেদন',
    totalSalesValue: 'মোট বিক্রয় মূল্য',
    totalDeposited: 'মোট জমা',
    totalExpenses: 'মোট খরচ',
    availableCash: 'উপলব্ধ নগদ',
    driver: 'চালক',
    packageSalesQty: 'প্যাকেজ বিক্রয় (পরিমাণ)',
    refillSalesQty: 'রিফিল বিক্রয় (পরিমাণ)',
    totalSalesQty: 'মোট বিক্রয় (পরিমাণ)',
    discount: 'ছাড়',
    totalCylindersReceivables: 'মোট সিলিন্ডার প্রাপ্য',
    totalCashReceivables: 'মোট নগদ প্রাপ্য',
    changeInReceivablesCashCylinders: 'প্রাপ্যে পরিবর্তন (নগদ/সিলিন্ডার)',
    retailDriver: 'খুচরা চালক',
    cash: 'নগদ',
    cylinders: 'সিলিন্ডার',
    deposits: 'জমা',
    expenses: 'খরচ',
    particulars: 'বিবরণ',
    description: 'বর্ণনা',
    amount: 'পরিমাণ',
    noDepositsFound: 'এই তারিখের জন্য কোনো জমা পাওয়া যায়নি',
    noExpensesFound: 'এই তারিখের জন্য কোনো খরচ পাওয়া যায়নি',
    totalDepositsCalculated: 'মোট জমা',
    totalExpensesCalculated: 'মোট খরচ',
    totalAvailableCash: 'মোট উপলব্ধ নগদ',
    totalDepositsIncludingSales: 'মোট জমা (বিক্রয় সহ) বিয়োগ মোট খরচ',
    loadingDailySalesReport: 'দৈনিক বিক্রয় প্রতিবেদন লোড হচ্ছে...',
    noReportDataAvailable: 'কোনো প্রতিবেদন ডেটা উপলব্ধ নেই',
    tryAgainOrSelectDate:
      'অনুগ্রহ করে আবার চেষ্টা করুন বা একটি ভিন্ন তারিখ নির্বাচন করুন।',
    error: 'ত্রুটি',
    failedToLoadDailySalesReport:
      'দৈনিক বিক্রয় প্রতিবেদন লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    tryAgain: 'অনুগ্রহ করে আবার চেষ্টা করুন।',
    refresh: 'রিফ্রেশ',
    generalExpense: 'সাধারণ খরচ',
    cashDepositsByDriver: 'চালকের নগদ জমা',
    dailyDepositsExpenses: 'দৈনিক জমা এবং খরচ',
    detailedBreakdownDepositsExpenses: 'সমস্ত জমা এবং খরচের বিস্তারিত বিভাজন',

    // Common expense categories for replacement
    driverExpense: 'চালক খরচ',
    fuelExpense: 'জ্বালানি খরচ',
    maintenanceExpense: 'রক্ষণাবেক্ষণ খরচ',
    officeExpense: 'অফিস খরচ',
    transportExpense: 'পরিবহন খরচ',
    miscellaneousExpense: 'বিবিধ খরচ',

    // Inventory Management
    inventoryManagement: 'মজুদ ব্যবস্থাপনা',
    realTimeInventoryTracking: 'রিয়েল-টাইম মজুদ ট্র্যাকিং এবং স্টক মনিটরিং',
    refresh: 'রিফ্রেশ',
    export: 'এক্সপোর্ট',
    exportFunctionalityComingSoon: 'এক্সপোর্ট বৈশিষ্ট্য শীঘ্রই আসছে!',
    criticalAlert: 'জরুরি সতর্কতা',
    productsOutOfStock: 'পণ্য স্টক শেষ',
    lowStockWarning: 'কম স্টক সতর্কতা',
    productsBelowMinimumThreshold: 'পণ্য সর্বনিম্ন সীমার নিচে',
    fullCylinders: 'ভর্তি সিলিন্ডার',
    emptyCylinders: 'খালি সিলিন্ডার',
    currentStock: 'বর্তমান স্টক',
    todaysSales: 'আজকের বিক্রয়',
    cylindersSold: 'সিলিন্ডার বিক্রিত',
    todaysPurchases: 'আজকের ক্রয়',
    cylindersReceived: 'সিলিন্ডার গৃহীত',
    totalCylinders: 'মোট সিলিন্ডার',
    allCylinders: 'সব সিলিন্ডার',
    currentFullCylinderInventory:
      'কোম্পানী এবং আকার অনুযায়ী বর্তমান ভর্তি সিলিন্ডার মজুদ',
    company: 'কোম্পানী',
    size: 'আকার',
    quantity: 'পরিমাণ',
    noFullCylindersInInventory: 'মজুদে কোনো ভর্তি সিলিন্ডার নেই।',
    emptyCylinderInventoryAvailability: 'খালি সিলিন্ডার মজুদ এবং প্রাপ্যতা',
    emptyCylindersInHand: 'হাতে খালি সিলিন্ডার',
    noEmptyCylindersInInventory: 'মজুদে কোনো খালি সিলিন্ডার নেই।',
    note: 'মন্তব্য',
    totalCylinderReceivables: 'মোট সিলিন্ডার প্রাপ্য',
    cylinders: 'সিলিন্ডার',
    dailyInventoryTracking: 'দৈনিক মজুদ ট্র্যাকিং',
    automatedCalculationsExactFormulas:
      'সঠিক ব্যবসায়িক সূত্র সহ স্বয়ংক্রিয় গণনা',
    date: 'তারিখ',
    packageSalesQty: 'প্যাকেজ বিক্রয় (পরিমাণ)',
    refillSalesQty: 'রিফিল বিক্রয় (পরিমাণ)',
    totalSalesQty: 'মোট বিক্রয় (পরিমাণ)',
    packagePurchase: 'প্যাকেজ ক্রয়',
    refillPurchase: 'রিফিল ক্রয়',
    emptyCylindersBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
    latest: 'সর্বশেষ',
    noDailyInventoryDataAvailable: 'কোনো দৈনিক মজুদ ডেটা উপলব্ধ নেই।',
    businessFormulaImplementation: 'ব্যবসায়িক সূত্র বাস্তবায়ন',
    dailyCalculations: 'দৈনিক গণনা',
    todaysFullCylinders: 'আজকের ভর্তি সিলিন্ডার =',
    yesterdaysFullPackagePurchase:
      ' গতকালের ভর্তি + প্যাকেজ ক্রয় + রিফিল ক্রয় - মোট বিক্রয়',
    todaysEmptyCylinders: 'আজকের খালি সিলিন্ডার =',
    yesterdaysEmptyRefillSales:
      ' গতকালের খালি + রিফিল বিক্রয় + খালি সিলিন্ডার ক্রয়/বিক্রয়',
    totalCylindersFormula: 'মোট সিলিন্ডার =',
    fullPlusEmptyCylinders: ' ভর্তি সিলিন্ডার + খালি সিলিন্ডার',
    dataSources: 'ডেটা উৎস',
    packageRefillSales: 'প্যাকেজ/রিফিল বিক্রয়:',
    sumAllDriversSales: ' তারিখের জন্য সব চালকের বিক্রয়ের সমষ্টি',
    packageRefillPurchase: 'প্যাকেজ/রিফিল ক্রয়:',
    sumCompletedShipments:
      ' শিপমেন্ট পেজ থেকে তারিখের জন্য সম্পন্ন শিপমেন্টের সমষ্টি',
    emptyCylindersBuySellData: 'খালি সিলিন্ডার ক্রয়/বিক্রয়:',
    sumCompletedEmptyShipments:
      ' তারিখের জন্য সম্পন্ন খালি সিলিন্ডার শিপমেন্টের সমষ্টি',
    allCalculationsUpdatedRealTime:
      ' শিপমেন্ট সম্পন্ন হিসাবে চিহ্নিত হলে সব গণনা রিয়েল-টাইমে আপডেট হয়।',
    currentStockHealth: 'বর্তমান স্টক স্বাস্থ্য',
    productsInGoodStock: 'ভাল স্টকে পণ্য',
    productsWithLowStockWarning: 'কম স্টক সতর্কতা সহ পণ্য',
    productsInCriticalStock: 'জরুরি স্টকে পণ্য',
    loadingInventoryData: 'মজুদ ডেটা লোড হচ্ছে...',
    failedToLoadInventoryData: 'মজুদ ডেটা লোড করতে ব্যর্থ',
    tryAgain: 'আবার চেষ্টা করুন',
    yesterdaysFull: 'গতকালের ভর্তি',
    totalSales: 'মোট বিক্রয়',
    yesterdaysEmpty: 'গতকালের খালি',
    refillSales: 'রিফিল বিক্রয়',
    sumAllDriversSalesForDate: 'তারিখের জন্য সমস্ত চালকের বিক্রয়ের সমষ্টি',
    sumCompletedShipmentsFromShipmentsPage:
      'শিপমেন্ট পেজ থেকে তারিখের জন্য সম্পন্ন শিপমেন্টের সমষ্টি',
    sumCompletedEmptyCylinderShipments:
      'তারিখের জন্য সম্পন্ন খালি সিলিন্ডার শিপমেন্টের সমষ্টি',

    // Shipments Management
    shipmentsManagement: 'শিপমেন্ট ব্যবস্থাপনা',
    trackPurchaseOrdersAndShipments:
      'ক্রয় আদেশ এবং শিপমেন্ট ট্র্যাক করুন। অসম্পূর্ণ অর্ডার সম্পাদনা/মুছে ফেলা যায়, সম্পন্ন অর্ডার শুধুমাত্র দেখার জন্য।',
    newPurchase: 'নতুন ক্রয়',
    emptyCylinderBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
    allShipments: 'সব শিপমেন্ট',
    outstandingOrders: 'অসম্পূর্ণ অর্ডার',
    completedOrders: 'সম্পন্ন অর্ডার',
    allCompanies: 'সব কোম্পানী',
    allProducts: 'সব পণ্য',
    fromDate: 'শুরুর তারিখ',
    toDate: 'শেষ তারিখ',
    clearFilters: 'ফিল্টার পরিষ্কার করুন',
    loadingShipments: 'শিপমেন্ট লোড হচ্ছে...',
    noShipmentsFound: 'নির্বাচিত মানদণ্ডের জন্য কোনো শিপমেন্ট পাওয়া যায়নি।',
    invoice: 'ইনভয়েস',
    units: 'ইউনিট',
    unit: 'ইউনিট',
    gas: 'গ্যাস',
    cylinder: 'সিলিন্ডার',
    unitCost: 'একক খরচ',
    gasCost: 'গ্যাস খরচ',
    cylinderCost: 'সিলিন্ডার খরচ',
    vehicle: 'গাড়ি',
    markAsFulfilled: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
    totalItems: 'মোট আইটেম',
    totalCost: 'মোট খরচ',
    editPurchaseOrder: 'ক্রয় আদেশ সম্পাদনা করুন',
    createNewPurchaseOrder: 'নতুন ক্রয় আদেশ তৈরি করুন',
    step: 'ধাপ',
    of: 'এর',
    orderInformation: 'অর্ডার তথ্য',
    selectCompany: 'একটি কোম্পানী নির্বাচন করুন...',
    selectDriver: 'একটি চালক নির্বাচন করুন...',
    shipmentDate: 'শিপমেন্ট তারিখ',
    expectedDeliveryDate: 'প্রত্যাশিত ডেলিভারি তারিখ',
    invoiceNumber: 'ইনভয়েস নম্বর',
    enterInvoiceNumber: 'ইনভয়েস নম্বর লিখুন',
    paymentTerms: 'পেমেন্ট শর্তাবলী',
    cashOnDelivery: 'ডেলিভারিতে নগদ',
    net30Days: 'নেট ৩০ দিন',
    net60Days: 'নেট ৬০ দিন',
    advancePayment: 'অগ্রিম পেমেন্ট',
    priority: 'অগ্রাধিকার',
    low: 'কম',
    normal: 'স্বাভাবিক',
    high: 'উচ্চ',
    urgent: 'জরুরি',
    vehicleNumber: 'গাড়ির নম্বর',
    enterVehicleNumber: 'গাড়ির নম্বর লিখুন',
    enterAdditionalNotes: 'কোনো অতিরিক্ত মন্তব্য বা বিশেষ নির্দেশনা লিখুন...',
    addLineItem: 'লাইন আইটেম যোগ করুন',
    selectProduct: 'পণ্য নির্বাচন করুন',
    selectCompanyFirst: 'প্রথমে কোম্পানী নির্বাচন করুন',
    package: 'প্যাকেজ',
    refill: 'রিফিল',
    gasPrice: 'গ্যাসের দাম',
    cylinderPrice: 'সিলিন্ডারের দাম',
    taxRate: 'কর হার',
    lineTotalPreview: 'লাইন মোট প্রিভিউ',
    packageInfo:
      'প্যাকেজ: সিলিন্ডার এবং গ্যাস উভয় খরচ আলাদাভাবে রেকর্ড করা হয়',
    refillInfo:
      'রিফিল: শুধুমাত্র গ্যাস/রিফিল খরচ, খালি সিলিন্ডার ইনভেন্টরি থেকে বের হয়ে যায়',
    addItem: 'আইটেম যোগ করুন',
    purchaseItems: 'ক্রয় আইটেম',
    qty: 'পরিমাণ',
    lineTotal: 'লাইন মোট',
    action: 'কার্যক্রম',
    editItem: 'আইটেম সম্পাদনা করুন',
    removeItem: 'আইটেম সরান',
    remove: 'সরান',
    totalPurchaseValue: 'মোট ক্রয় মূল্য',
    orderPreview: 'অর্ডার প্রিভিউ',
    orderSummary: 'অর্ডার সারসংক্ষেপ',
    totalQuantity: 'মোট পরিমাণ',
    totalValue: 'মোট মূল্য',
    previous: 'পূর্ববর্তী',
    cancel: 'বাতিল',
    next: 'পরবর্তী',
    creating: 'তৈরি করা হচ্ছে...',
    updatePurchaseOrder: 'ক্রয় আদেশ আপডেট করুন',
    createPurchaseOrder: 'ক্রয় আদেশ তৈরি করুন',
    transactionType: 'লেনদেনের ধরণ',
    buyEmptyCylinders: 'খালি সিলিন্ডার কিনুন',
    sellEmptyCylinders: 'খালি সিলিন্ডার বিক্রি করুন',
    addEmptyCylindersToInventory: 'ইনভেন্টরিতে খালি সিলিন্ডার যোগ করুন',
    removeEmptyCylindersFromInventory: 'ইনভেন্টরি থেকে খালি সিলিন্ডার সরান',
    cylinderSize: 'সিলিন্ডারের আকার',
    selectCylinderSize: 'সিলিন্ডারের আকার নির্বাচন করুন',
    emptyCylindersNote:
      'খালি সিলিন্ডার শুধুমাত্র আকার অনুযায়ী শ্রেণীবদ্ধ, কোম্পানী নিরপেক্ষ',
    unitPrice: 'একক দাম',
    transactionDate: 'লেনদেনের তারিখ',
    enterTransactionDetails: 'লেনদেনের বিবরণ লিখুন...',
    buy: 'কিনুন',
    sell: 'বিক্রি করুন',

    // Validation Messages
    companyRequired: 'কোম্পানী আবশ্যক',
    driverRequired: 'চালক আবশ্যক',
    shipmentDateRequired: 'শিপমেন্ট তারিখ আবশ্যক',
    atLeastOneLineItemRequired: 'কমপক্ষে একটি লাইন আইটেম আবশ্যক',
    productRequired: 'পণ্য আবশ্যক',
    quantityMustBeGreaterThanZero: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে',
    gasPriceMustBeGreaterThanZero: 'গ্যাসের দাম ০ এর চেয়ে বেশি হতে হবে',
    cylinderPriceRequiredForPackage:
      'প্যাকেজ ক্রয়ের জন্য সিলিন্ডারের দাম আবশ্যক',
    failedToSavePurchaseOrder:
      'ক্রয় আদেশ সংরক্ষণ করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    markShipmentAsCompletedConfirm:
      'এই শিপমেন্টটি সম্পন্ন হিসাবে চিহ্নিত করবেন? এটি ইনভেন্টরি আপডেট করবে এবং পূর্বাবস্থায় ফেরানো যাবে না।',
    failedToCompleteShipment: 'শিপমেন্ট সম্পন্ন করতে ব্যর্থ',
    failedToCompleteShipmentTryAgain:
      'শিপমেন্ট সম্পন্ন করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    confirmDeleteShipment:
      'আপনি কি নিশ্চিত যে আপনি এই শিপমেন্টটি মুছে ফেলতে চান?',
    errorDeletingShipment: 'শিপমেন্ট মুছে ফেলতে ত্রুটি',
    unknownError: 'অজানা ত্রুটি',
    failedToDeleteShipmentTryAgain:
      'শিপমেন্ট মুছে ফেলতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  },
};

export function getTranslation(
  language: string,
  key: keyof Translations
): string {
  const lang = translations[language] || translations.en;
  return lang[key] || translations.en[key] || key;
}
