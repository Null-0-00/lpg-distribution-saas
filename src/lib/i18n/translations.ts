import {
  TranslationValidator,
  TranslationFallbackSystem,
  translationLogger,
  TranslationError,
  TranslationErrorType,
  ValidationResult,
  ConsistencyReport,
} from './translation-validator';

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
  cash: string;

  // Dashboard and reports
  cashDepositsByDriver: string;
  driverExpense: string;
  loadingData: string;
  noDataAvailable: string;
  tryAgain: string;
  performance: string;
  month: string;
  year: string;
  allDrivers: string;
  totalRevenue: string;
  revenue: string;

  // Common UI elements
  activeDrivers: string;
  activeUsers: string;
  addDriver: string;
  addExpense: string;
  additionalNotesComments: string;
  addNewDriver: string;
  addUser: string;
  administrator: string;
  administrators: string;
  ago: string;
  alerts: string;
  allCalculationsUpdatedRealTime: string;
  allCategories: string;
  allCylinders: string;
  allGood: string;
  allStatus: string;
  anErrorOccurred: string;
  approved: string;
  approvedExpenses: string;
  approveExpense: string;
  area: string;
  areYouSureDeleteDriver: string;
  assetsLiabilities: string;
  assignedArea: string;
  automatedCalculationsExactFormulas: string;
  balanceSheet: string;
  businessFormulaImplementation: string;
  cashReceivables: string;
  changesLog: string;
  checkStock: string;
  clear: string;
  company: string;
  completeSystemAccessAndUserManagement: string;
  confirmDeleteUser: string;
  contactName: string;
  contactNumber: string;
  create: string;
  criticalAlert: string;
  currency: string;
  currentFullCylinderInventory: string;
  currentStock: string;
  currentStockHealth: string;
  customers: string;
  cylinderReceivables: string;
  cylindersReceived: string;
  cylindersSold: string;
  cylindersSummaryApiError: string;
  cylindersSummaryDataReceived: string;
  cylindersSummaryResponseStatus: string;
  dailyCalculations: string;
  dailyInventoryTracking: string;
  dailySalesRetailDrivers: string;
  dataSources: string;
  day: string;
  days: string;
  deleteExpense: string;
  deleteUser: string;
  deleting: string;
  details: string;
  driver: string;
  driverAddedSuccessfully: string;
  driverDeletedSuccessfully: string;
  driverDetails: string;
  driverManagement: string;
  driverName: string;
  driverType: string;
  driverUpdatedSuccessfully: string;
  editDriver: string;
  editExpense: string;
  editUser: string;
  emailAddress: string;
  emergencyContact: string;
  emptyCylinderInventoryAvailability: string;
  emptyCylinders: string;
  emptyCylindersBuySell: string;
  emptyCylindersInHand: string;
  enterAssignedAreaRoute: string;
  enterEmailAddress: string;
  enterEmergencyContactName: string;
  enterEmergencyContactNumber: string;
  enterFullAddress: string;
  enterFullName: string;
  enterLicenseNumber: string;
  enterPhoneNumber: string;
  error: string;
  errorFetchingCylindersSummaryData: string;
  errorFetchingDailyInventoryData: string;
  errorFetchingInventoryData: string;
  expense: string;
  expenseManagement: string;
  exportFunctionalityComingSoon: string;
  failedToCreateUser: string;
  failedToDeleteDriver: string;
  failedToDeleteUser: string;
  failedToFetchUsers: string;
  failedToLoadInventoryData: string;
  failedToUpdateDriver: string;
  failedToUpdateUser: string;
  fetchingCylindersSummaryData: string;
  filterByDriverType: string;
  financialReports: string;
  fri: string;
  from: string;
  fullAccess: string;
  fullCylinders: string;
  fullName: string;
  generalSettings: string;
  getStartedByAddingFirstExpense: string;
  hour: string;
  hours: string;
  individualDailySalesData: string;
  info: string;
  inventoryControl: string;
  inventoryManagement: string;
  joiningDate: string;
  justNow: string;
  kPending: string;
  language: string;
  last7Days: string;
  lastMonth: string;
  lastLogin: string;
  lastUpdated: string;
  latest: string;
  licenseNumber: string;
  loadingDailySalesData: string;
  loadingDriverPerformance: string;
  loadingInventoryData: string;
  loadingText: string;
  locationInformation: string;
  login: string;
  lpgDistributorManagementSystem: string;
  manageBudgets: string;
  manageCategories: string;
  manageCompanyAssets: string;
  manageDriversAndAssignments: string;
  manageLiabilities: string;
  manageLpgDistributionBusiness: string;
  manager: string;
  managers: string;
  manageSystemRoles: string;
  manageSystemUsers: string;
  manageTeam: string;
  mon: string;
  monitorCylinderStock: string;
  needAdminPrivileges: string;
  never: string;
  newSale: string;
  noActiveDriversFoundForThisPeriod: string;
  noDailyInventoryDataAvailable: string;
  noDailySalesDataFound: string;
  noDataFound: string;
  noEmptyCylindersInInventory: string;
  noFullCylindersInInventory: string;
  notApplicable: string;
  note: string;
  noUsersFound: string;
  operationFailed: string;
  operations: string;
  outstanding: string;
  packagePurchase: string;
  packageRefillPurchase: string;
  packageRefillSales: string;
  packageSale: string;
  packageSalesQty: string;
  parentCategory: string;
  pay: string;
  paymentReceived: string;
  pending: string;
  pendingApproval: string;
  performanceStatistics: string;
  permissions: string;
  personalInformation: string;
  phoneNumber: string;
  pleaseLogInToAccessUserManagement: string;
  producentsWithLowStockWarning: string;
  productsBelowMinimumThreshold: string;
  productsInCriticalStock: string;
  productsInGoodStock: string;
  productsOutOfStock: string;
  purchase: string;
  rahmanSoldCylinders: string;
  realTimeInventoryTracking: string;
  receivableManagement: string;
  receivableRecords: string;
  recentActivity: string;
  recordDailySales: string;
  refillPurchase: string;
  refillSale: string;
  refillSalesQty: string;
  refreshData: string;
  rejectExpense: string;
  reportsAnalytics: string;
  retail: string;
  retailDriver: string;
  sale: string;
  retailDriverDescription: string;
  retailDrivers: string;
  retry: string;
  return: string;
  rolePermissions: string;
  routeArea: string;
  salesInventoryAndDriverManagement: string;
  salesManagement: string;
  salesTrend: string;
  salesValue: string;
  sat: string;
  saveError: string;
  saveSuccess: string;
  searchExpenses: string;
  selectDriverType: string;
  selectStatus: string;
  shipment: string;
  shipmentDriverDescription: string;
  shipmentDrivers: string;
  size: string;
  statusAndNotes: string;
  stock: string;
  stockReplenished: string;
  submittedBy: string;
  success: string;
  sumAllDriversSalesForDate: string;
  sumCompletedEmptyCylinderShipments: string;
  sumCompletedShipmentsFromShipmentsPage: string;
  sun: string;
  systemUsers: string;
  tasks: string;
  teamAccess: string;
  thisActionCannotBeUndone: string;
  thisMonth: string;
  thu: string;
  timezone: string;
  to: string;
  today: string;
  todaysEmptyCylinders: string;
  todaysFullCylinders: string;
  todaysPurchases: string;
  todaysSales: string;
  topDriverPerformance: string;
  totalCylinderReceivables: string;
  totalCylinders: string;
  totalCylindersReceivables: string;
  totalReceivables: string;
  totalSales: string;
  totalSalesQty: string;
  totalSalesThisMonth: string;
  totalUsers: string;
  trackCustomerCredits: string;
  trackCustomerPayments: string;
  trackExpenses: string;
  trackExpensesAndManageBudgets: string;
  trackPerformance: string;
  tue: string;
  unknown: string;
  updateDriver: string;
  updateExpense: string;
  updatePayment: string;
  updateUser: string;
  updating: string;
  urgent: string;
  user: string;
  userDetails: string;
  userManagement: string;
  viewComprehensiveReports: string;
  viewDetails: string;
  viewingExpensesFor: string;
  viewReceipt: string;
  viewReports: string;
  warning: string;
  wed: string;
  week: string;
  yesterday: string;
  yesterdaysEmpty: string;
  yesterdaysFull: string;
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

  // Sales form specific translations
  selectADriver: string;
  enterCustomerName: string;
  customerNamePlaceholder: string;
  saleItems: string;
  itemNumber: string;
  selectAProduct: string;
  packagePrice: string;
  refillPrice: string;
  itemTotal: string;
  saleSummary: string;
  paymentType: string;
  paymentTypeRequired: string;
  bankTransfer: string;
  mfs: string;
  mobileFinancialService: string;
  credit: string;
  cylinderCredit: string;
  cashDeposited: string;
  cylinderDeposits: string;
  cylinderDepositsBySize: string;
  cylindersDeposited: string;
  maxQuantity: string;
  additionalNotes: string;
  additionalNotesPlaceholder: string;
  totalQuantityLabel: string;
  totalValueLabel: string;
  totalDiscountLabel: string;
  netValueLabel: string;
  cashReceivableWarning: string;
  customerNameRecommended: string;
  cylinderReceivableWarning: string;
  lowStockWarning: string;
  cylindersRemaining: string;
  lowStockAlert: string;
  loadingFormData: string;

  // Form validation messages
  driverRequired: string;
  productRequired: string;
  packageSaleCannotBeNegative: string;
  refillSaleCannotBeNegative: string;
  packagePriceCannotBeNegative: string;
  refillPriceCannotBeNegative: string;
  quantityAndPriceRequired: string;
  atLeastOneSaleItemRequired: string;
  discountCannotBeNegative: string;
  cashDepositedCannotBeNegative: string;
  cylinderDepositsCannotBeNegative: string;
  available: string;
  for: string;

  // Sales page specific translations
  readOnly: string;
  areYouSure: string;
  deleteConfirmation: string;
  salesEntries: string;
  cannotBeUndone: string;
  successfullyDeleted: string;
  on: string;
  thisWillDelete: string;
  failedToLoadDailySalesData: string;
  combinedSaleCreatedSuccessfully: string;
  failedToCreateSale: string;
  failedToLoadEntryDataForEditing: string;
  salesEntryUpdatedSuccessfully: string;
  failedToUpdateSalesEntry: string;
  failedToDeleteSales: string;

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

  // Analytics page specific translations
  comprehensiveProfitabilityAnalysis: string;
  visualRepresentationProfitByProduct: string;
  individualDriverPerformanceMetrics: string;
  comparativeAnalysisRevenueByDriver: string;
  monthlyRevenue: string;
  allExpenses: string;
  totalProfit: string;
  buyingPrice: string;
  commission: string;
  fixedCost: string;
  breakevenPrice: string;
  sellingPrice: string;
  costPerUnit: string;
  failedToLoadData: string;
  errorLoadingData: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;

  // Month names for driver page
  july2025: string;
  june2025: string;
  may2025: string;
  april2025: string;
  march2025: string;
  february2025: string;
  january2025: string;
  december2024: string;
  november2024: string;
  october2024: string;

  // High priority missing keys from audit
  selectTime: string;

  // Dashboard error messages and loading states
  failedToLoadDashboardData: string;
  failedToLoadDashboardDataRefresh: string;
  errorLoadingCombinedDashboardData: string;
  sessionExpiredRedirectingToLogin: string;

  // Mobile dashboard specific
  realTimeOverview: string;
  orders: string;
  stockLevel: string;
  liveActivity: string;
  last15Minutes: string;
  targetProgress: string;
  performanceIndicators: string;
  inventoryHealth: string;
  attentionNeeded: string;
  good: string;
  collectionRate: string;
  profitMargin: string;
  salesDetails: string;
  viewDetailedSalesBreakdown: string;
  salesBreakdown: string;
  detailedSalesAnalytics: string;
  averageOrderValue: string;
  driverPerformance: string;
  topPerformersAndRankings: string;
  driverRankings: string;
  performanceLeaderboard: string;
  detailedViewAndTrends: string;
  vsYesterday: string;

  // Dashboard layout specific
  lpgDistributor: string;
  welcomeBack: string;
  role: string;
  loadingDashboard: string;

  // Dashboard fallback data and performance metrics
  fallbackDriverName1: string;
  fallbackDriverName2: string;
  fallbackDriverName3: string;
  fallbackDriverName4: string;
  salesCount: string;
  revenueAmount: string;
  performancePercentage: string;
  chartDataFallback: string;
  weeklyPerformance: string;
  dailyAverage: string;
  monthlyTarget: string;
  quarterlyGrowth: string;

  // Dashboard API and activity messages
  unknownDriver: string;
  completedSale: string;
  driverCompletedSale: string;
  salesTrendUp: string;
  salesTrendDown: string;

  // Driver management interface translations

  // AddDriverForm translations

  // Form validation messages for drivers

  // Driver deletion confirmation

  // Dashboard notifications and alerts

  // Inventory console messages

  // Form validation messages
  addressMustBeAtLeast10Characters: string;
  addressTooLong: string;
  areaMustBeAtLeast2Characters: string;
  areaTooLong: string;
  driverTypeIsRequired: string;
  emergencyContactMustBeAtLeast10Digits: string;
  emergencyContactNameMustBeAtLeast2Characters: string;
  emergencyContactTooLong: string;
  invalidEmailAddress: string;
  licenseNumberMustBeAtLeast5Characters: string;
  licenseNumberTooLong: string;
  nameMustBeAtLeast2Characters: string;
  nameTooLong: string;
  phoneNumberMustBeAtLeast10Digits: string;
  phoneNumberTooLong: string;
  statusIsRequired: string;

  // Language and locale related
  all: string;
  bn: string;
  en: string;
  locale: string;
  key: string;
  value: string;

  // Alert types and notifications
  allAlerts: string;
  critical: string;
  criticalAlerts: string;
  infoAlerts: string;
  warningAlerts: string;
  inventoryAlert: string;
  performanceAlert: string;
  stockAlert: string;
  systemNotification: string;

  // Data and metrics
  completionPercentage: string;
  dashboardDataUpdated: string;
  dataNotFound: string;
  isComplete: string;
  liveDataFeed: string;
  metricsLastUpdated: string;
  missingKeys: string;
  newSalesActivity: string;
  optional: string;
  recentSaleActivity: string;
  totalKeys: string;
  translatedKeys: string;

  // Inventory and stock statuses
  lowStock: string;
  outOfStock: string;
  overduePayments: string;
  overstock: string;

  // Performance trends
  performanceTrendDown: string;
  performanceTrendStable: string;
  performanceTrendUp: string;
  salesTrendStable: string;
  targetAchieved: string;
  topPerformer: string;

  // Operations and actions
  deleteDriver: string;
  failedToLoadAlerts: string;
  failedToLoadInventoryAlerts: string;
  movementAnomaly: string;
  operationSuccessful: string;
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
  revenue: 'Revenue',
  loadingData: 'Loading data...',
  noDataAvailable: 'No data available',
  tryAgain: 'Try again',
  performance: 'Performance',
  allDrivers: 'All Drivers',
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

  // All missing translation keys - English
  activeDrivers: 'Active Drivers',
  activeUsers: 'Active Users',
  addDriver: 'Add Driver',
  addExpense: 'Add Expense',
  additionalNotesComments: 'Additional Notes/Comments',
  addNewDriver: 'Add New Driver',
  addUser: 'Add User',
  administrator: 'Administrator',
  administrators: 'Administrators',
  ago: 'ago',
  alerts: 'Alerts',
  allCalculationsUpdatedRealTime: 'All calculations updated in real-time',
  allCategories: 'All Categories',
  allCylinders: 'All Cylinders',
  allGood: 'All Good',
  allStatus: 'All Status',
  anErrorOccurred: 'An error occurred',
  approved: 'Approved',
  approvedExpenses: 'Approved Expenses',
  approveExpense: 'Approve Expense',
  area: 'Area',
  areYouSureDeleteDriver: 'Are you sure you want to delete this driver?',
  assetsLiabilities: 'Assets & Liabilities',
  assignedArea: 'Assigned Area',
  automatedCalculationsExactFormulas:
    'Automated calculations with exact formulas',
  balanceSheet: 'Balance Sheet',
  businessFormulaImplementation: 'Business formula implementation',
  cashReceivables: 'Cash Receivables',
  changesLog: 'Changes Log',
  checkStock: 'Check Stock',
  clear: 'Clear',
  company: 'Company',
  completeSystemAccessAndUserManagement:
    'Complete system access and user management',
  confirmDeleteUser: 'Confirm Delete User',
  contactName: 'Contact Name',
  contactNumber: 'Contact Number',
  create: 'Create',
  criticalAlert: 'Critical Alert',
  currency: 'Currency',
  currentFullCylinderInventory: 'Current Full Cylinder Inventory',
  currentStock: 'Current Stock',
  currentStockHealth: 'Current Stock Health',
  customers: 'Customers',
  cylinderReceivables: 'Cylinder Receivables',
  cylindersReceived: 'Cylinders Received',
  cylindersSold: 'Cylinders Sold',
  cylindersSummaryApiError: 'Cylinders summary API error',
  cylindersSummaryDataReceived: 'Cylinders summary data received',
  cylindersSummaryResponseStatus: 'Cylinders summary response status',
  dailyCalculations: 'Daily Calculations',
  dailyInventoryTracking: 'Daily Inventory Tracking',
  dailySalesRetailDrivers: 'Daily Sales - Retail Drivers',
  dataSources: 'Data Sources',
  day: 'Day',
  days: 'Days',
  deleteExpense: 'Delete Expense',
  deleteUser: 'Delete User',
  deleting: 'Deleting',
  details: 'Details',
  driver: 'Driver',
  driverAddedSuccessfully: 'Driver added successfully',
  driverDeletedSuccessfully: 'Driver deleted successfully',
  driverDetails: 'Driver Details',
  driverManagement: 'Driver Management',
  driverName: 'Driver Name',
  driverType: 'Driver Type',
  driverUpdatedSuccessfully: 'Driver updated successfully',
  editDriver: 'Edit Driver',
  editExpense: 'Edit Expense',
  editUser: 'Edit User',
  emailAddress: 'Email Address',
  emergencyContact: 'Emergency Contact',
  emptyCylinderInventoryAvailability: 'Empty Cylinder Inventory Availability',
  emptyCylindersBuySell: 'Empty Cylinders Buy/Sell',
  emptyCylindersInHand: 'Empty Cylinders in Hand',
  enterAssignedAreaRoute: 'Enter assigned area/route',
  enterEmailAddress: 'Enter email address',
  enterEmergencyContactName: 'Enter emergency contact name',
  enterEmergencyContactNumber: 'Enter emergency contact number',
  enterFullAddress: 'Enter full address',
  enterFullName: 'Enter full name',
  enterLicenseNumber: 'Enter license number',
  enterPhoneNumber: 'Enter phone number',
  errorFetchingCylindersSummaryData: 'Error fetching cylinders summary data',
  errorFetchingDailyInventoryData: 'Error fetching daily inventory data',
  errorFetchingInventoryData: 'Error fetching inventory data',
  expense: 'Expense',
  expenseManagement: 'Expense Management',
  exportFunctionalityComingSoon: 'Export functionality coming soon',
  failedToCreateUser: 'Failed to create user',
  failedToDeleteDriver: 'Failed to delete driver',
  failedToDeleteUser: 'Failed to delete user',
  failedToFetchUsers: 'Failed to fetch users',
  failedToLoadInventoryData: 'Failed to load inventory data',
  failedToUpdateDriver: 'Failed to update driver',
  failedToUpdateUser: 'Failed to update user',
  fetchingCylindersSummaryData: 'Fetching cylinders summary data',
  filterByDriverType: 'Filter by driver type',
  financialReports: 'Financial Reports',
  fri: 'Fri',
  from: 'From',
  fullAccess: 'Full Access',
  fullName: 'Full Name',
  generalSettings: 'General Settings',
  getStartedByAddingFirstExpense: 'Get started by adding your first expense',
  hour: 'Hour',
  hours: 'Hours',
  individualDailySalesData: 'Individual daily sales data',
  inventoryControl: 'Inventory Control',
  inventoryManagement: 'Inventory Management',
  joiningDate: 'Joining Date',
  justNow: 'Just now',
  kPending: 'Pending',
  language: 'Language',
  last7Days: 'Last 7 Days',
  lastLogin: 'Last Login',
  lastUpdated: 'Last Updated',
  latest: 'Latest',
  licenseNumber: 'License Number',
  loadingDailySalesData: 'Loading daily sales data',
  loadingDriverPerformance: 'Loading driver performance',
  loadingInventoryData: 'Loading inventory data',
  loadingText: 'Loading...',
  locationInformation: 'Location Information',
  login: 'Login',
  lpgDistributorManagementSystem: 'LPG Distributor Management System',
  manageBudgets: 'Manage Budgets',
  manageCategories: 'Manage Categories',
  manageCompanyAssets: 'Manage Company Assets',
  manageDriversAndAssignments: 'Manage Drivers and Assignments',
  manageLiabilities: 'Manage Liabilities',
  manageLpgDistributionBusiness: 'Manage LPG distribution business',
  manager: 'Manager',
  managers: 'Managers',
  manageSystemRoles: 'Manage System Roles',
  manageSystemUsers: 'Manage System Users',
  manageTeam: 'Manage Team',
  mon: 'Mon',
  monitorCylinderStock: 'Monitor cylinder stock',
  needAdminPrivileges: 'Need admin privileges',
  never: 'Never',
  newSale: 'New Sale',
  noActiveDriversFoundForThisPeriod: 'No active drivers found for this period',
  noDailyInventoryDataAvailable: 'No daily inventory data available',
  noDailySalesDataFound: 'No daily sales data found',
  noDataFound: 'No data found',
  noEmptyCylindersInInventory: 'No empty cylinders in inventory',
  noFullCylindersInInventory: 'No full cylinders in inventory',
  notApplicable: 'Not Applicable',
  note: 'Note',
  noUsersFound: 'No users found',
  operationFailed: 'Operation failed',
  operations: 'Operations',
  outstanding: 'Outstanding',
  packagePurchase: 'Package Purchase',
  packageRefillPurchase: 'Package + Refill Purchase',
  packageRefillSales: 'Package + Refill Sales',
  packageSale: 'Package Sale',
  packageSalesQty: 'Package Sales Qty',
  parentCategory: 'Parent Category',
  pay: 'Pay',
  paymentReceived: 'Payment Received',
  pending: 'Pending',
  pendingApproval: 'Pending Approval',
  performanceStatistics: 'Performance Statistics',
  permissions: 'Permissions',
  personalInformation: 'Personal Information',
  phoneNumber: 'Phone Number',
  pleaseLogInToAccessUserManagement: 'Please log in to access user management',
  producentsWithLowStockWarning: 'Products with low stock warning',
  productsBelowMinimumThreshold: 'Products below minimum threshold',
  productsInCriticalStock: 'Products in critical stock',
  productsInGoodStock: 'Products in good stock',
  productsOutOfStock: 'Products out of stock',
  rahmanSoldCylinders: 'Rahman sold cylinders',
  realTimeInventoryTracking: 'Real-time inventory tracking',
  receivableManagement: 'Receivable Management',
  receivableRecords: 'Receivable Records',
  recentActivity: 'Recent Activity',
  recordDailySales: 'Record daily sales',
  refillPurchase: 'Refill Purchase',
  refillSale: 'Refill Sale',
  refillSalesQty: 'Refill Sales Qty',
  refreshData: 'Refresh Data',
  rejectExpense: 'Reject Expense',
  reportsAnalytics: 'Reports & Analytics',
  retail: 'Retail',
  retailDriverDescription: 'Manages daily sales and customer deliveries',
  retry: 'Retry',
  rolePermissions: 'Role & Permissions',
  routeArea: 'Route/Area',
  salesInventoryAndDriverManagement: 'Sales, inventory, and driver management',
  salesManagement: 'Sales Management',
  salesTrend: 'Sales Trend',
  salesValue: 'Sales Value',
  sat: 'Sat',
  saveError: 'Save Error',
  saveSuccess: 'Save Success',
  searchExpenses: 'Search expenses',
  selectDriverType: 'Select driver type',
  selectStatus: 'Select status',
  shipment: 'Shipment',
  shipmentDriverDescription: 'Handles bulk deliveries and transfers',
  size: 'Size',
  statusAndNotes: 'Status and Notes',
  stockReplenished: 'Stock replenished',
  submittedBy: 'Submitted by',
  sumAllDriversSalesForDate: 'Sum all drivers sales for date',
  sumCompletedEmptyCylinderShipments: 'Sum completed empty cylinder shipments',
  sumCompletedShipmentsFromShipmentsPage:
    'Sum completed shipments from shipments page',
  sun: 'Sun',
  systemUsers: 'System Users',
  tasks: 'Tasks',
  teamAccess: 'Team Access',
  thisActionCannotBeUndone: 'This action cannot be undone',
  thu: 'Thu',
  timezone: 'Timezone',
  to: 'To',
  todaysEmptyCylinders: "Today's Empty Cylinders",
  todaysFullCylinders: "Today's Full Cylinders",
  todaysPurchases: "Today's Purchases",
  todaysSales: "Today's Sales",
  topDriverPerformance: 'Top Driver Performance',
  totalCylinderReceivables: 'Total Cylinder Receivables',
  totalCylinders: 'Total Cylinders',
  totalCylindersReceivables: 'Total Cylinders Receivables',
  totalSalesQty: 'Total Sales Qty',
  totalSalesThisMonth: 'Total Sales This Month',
  totalUsers: 'Total Users',
  trackCustomerCredits: 'Track customer credits',
  trackCustomerPayments: 'Track customer payments',
  trackExpenses: 'Track expenses',
  trackExpensesAndManageBudgets: 'Track expenses and manage budgets',
  trackPerformance: 'Track performance',
  tue: 'Tue',
  unknown: 'Unknown',
  updateDriver: 'Update Driver',
  updateExpense: 'Update Expense',
  updatePayment: 'Update Payment',
  updateUser: 'Update User',
  updating: 'Updating',
  urgent: 'Urgent',
  user: 'User',
  userDetails: 'User Details',
  userManagement: 'User Management',
  viewComprehensiveReports: 'View comprehensive reports',
  viewDetails: 'View Details',
  viewingExpensesFor: 'Viewing expenses for',
  viewReceipt: 'View Receipt',
  viewReports: 'View Reports',
  wed: 'Wed',
  yesterdaysEmpty: "Yesterday's Empty",
  yesterdaysFull: "Yesterday's Full",
  info: 'Information',

  // Missing properties from interface
  cashDepositsByDriver: 'Cash Deposits by Driver',
  driverExpense: 'Driver Expense',
  return: 'Return',
  fuelExpense: 'Fuel Expense',
  maintenanceExpense: 'Maintenance Expense',
  officeExpense: 'Office Expense',
  transportExpense: 'Transport Expense',
  miscellaneousExpense: 'Miscellaneous Expense',
  generalExpense: 'General Expense',

  // Form validation messages
  addressMustBeAtLeast10Characters: 'Address must be at least 10 characters',
  addressTooLong: 'Address is too long',
  areaMustBeAtLeast2Characters: 'Area must be at least 2 characters',
  areaTooLong: 'Area is too long',
  driverTypeIsRequired: 'Driver type is required',
  emergencyContactMustBeAtLeast10Digits:
    'Emergency contact must be at least 10 digits',
  emergencyContactNameMustBeAtLeast2Characters:
    'Emergency contact name must be at least 2 characters',
  emergencyContactTooLong: 'Emergency contact is too long',
  invalidEmailAddress: 'Invalid email address',
  licenseNumberMustBeAtLeast5Characters:
    'License number must be at least 5 characters',
  licenseNumberTooLong: 'License number is too long',
  nameMustBeAtLeast2Characters: 'Name must be at least 2 characters',
  nameTooLong: 'Name is too long',
  phoneNumberMustBeAtLeast10Digits: 'Phone number must be at least 10 digits',
  phoneNumberTooLong: 'Phone number is too long',
  statusIsRequired: 'Status is required',

  // Language and locale related
  all: 'All',
  bn: 'Bengali',
  en: 'English',
  locale: 'Locale',
  key: 'Key',
  value: 'Value',

  // Alert types and notifications
  allAlerts: 'All Alerts',
  critical: 'Critical',
  criticalAlerts: 'Critical Alerts',
  infoAlerts: 'Information Alerts',
  warningAlerts: 'Warning Alerts',
  inventoryAlert: 'Inventory Alert',
  performanceAlert: 'Performance Alert',
  stockAlert: 'Stock Alert',
  systemNotification: 'System Notification',

  // Data and metrics
  completionPercentage: 'Completion Percentage',
  dashboardDataUpdated: 'Dashboard Data Updated',
  dataNotFound: 'Data Not Found',
  isComplete: 'Is Complete',
  liveDataFeed: 'Live Data Feed',
  metricsLastUpdated: 'Metrics Last Updated',
  missingKeys: 'Missing Keys',
  newSalesActivity: 'New Sales Activity',
  optional: 'Optional',
  recentSaleActivity: 'Recent Sale Activity',
  totalKeys: 'Total Keys',
  translatedKeys: 'Translated Keys',

  // Inventory and stock statuses
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
  overduePayments: 'Overdue Payments',
  overstock: 'Overstock',

  // Performance trends
  performanceTrendDown: 'Performance Trend Down',
  performanceTrendStable: 'Performance Trend Stable',
  performanceTrendUp: 'Performance Trend Up',
  salesTrendStable: 'Sales Trend Stable',
  targetAchieved: 'Target Achieved',
  topPerformer: 'Top Performer',

  // Operations and actions
  deleteDriver: 'Delete Driver',
  failedToLoadAlerts: 'Failed To Load Alerts',
  failedToLoadInventoryAlerts: 'Failed To Load Inventory Alerts',
  movementAnomaly: 'Movement Anomaly',
  operationSuccessful: 'Operation Successful',

  // Report related
  failedToLoadDailySalesReport: 'Failed to load daily sales report',
  loadingDailySalesReport: 'Loading daily sales report',
  noReportDataAvailable: 'No report data available',
  tryAgainOrSelectDate: 'Try again or select date',
  comprehensiveDailySalesReport: 'Comprehensive Daily Sales Report',
  totalSalesValue: 'Total Sales Value',
  totalDeposited: 'Total Deposited',
  totalExpenses: 'Total Expenses',
  availableCash: 'Available Cash',
  totalCashReceivables: 'Total Cash Receivables',
  changeInReceivablesCashCylinders: 'Change in Receivables (Cash & Cylinders)',
  dailyDepositsExpenses: 'Daily Deposits & Expenses',
  detailedBreakdownDepositsExpenses: 'Detailed Breakdown - Deposits & Expenses',
  deposits: 'Deposits',
  particulars: 'Particulars',
  noDepositsFound: 'No deposits found',
  totalDepositsCalculated: 'Total deposits calculated',
  noExpensesFound: 'No expenses found',
  totalExpensesCalculated: 'Total expenses calculated',
  totalAvailableCash: 'Total Available Cash',
  totalDepositsIncludingSales: 'Total Deposits (Including Sales)',

  // Sales form related
  customerName: 'Customer Name',
  selectADriver: 'Select a Driver',
  enterCustomerName: 'Enter Customer Name',
  customerNamePlaceholder: 'Enter customer name (optional)',
  saleItems: 'Sale Items',
  itemNumber: 'Item Number',
  selectAProduct: 'Select a Product',
  packagePrice: 'Package Price',
  refillPrice: 'Refill Price',
  itemTotal: 'Item Total',
  saleSummary: 'Sale Summary',
  paymentType: 'Payment Type',
  paymentTypeRequired: 'Payment type is required',
  bankTransfer: 'Bank Transfer',
  mfs: 'MFS',
  mobileFinancialService: 'Mobile Financial Service',
  credit: 'Credit',
  cylinderCredit: 'Cylinder Credit',
  cashDeposited: 'Cash Deposited',
  cylinderDeposits: 'Cylinder Deposits',
  cylinderDepositsBySize: 'Cylinder Deposits by Size',
  cylindersDeposited: 'Cylinders Deposited',
  maxQuantity: 'Max Quantity',
  additionalNotes: 'Additional Notes',
  additionalNotesPlaceholder: 'Enter any additional notes or comments',
  totalQuantityLabel: 'Total Quantity',
  totalValueLabel: 'Total Value',
  totalDiscountLabel: 'Total Discount',
  netValueLabel: 'Net Value',
  cashReceivableWarning: 'Cash receivable will increase',
  customerNameRecommended: 'Customer name is recommended for credit sales',
  cylinderReceivableWarning: 'Cylinder receivable will increase',
  lowStockWarning: 'Low stock warning',
  cylindersRemaining: 'cylinders remaining',
  lowStockAlert: 'Low Stock Alert',
  loadingFormData: 'Loading form data',
  driverRequired: 'Driver is required',
  productRequired: 'Product is required',
  packageSaleCannotBeNegative: 'Package sale cannot be negative',
  refillSaleCannotBeNegative: 'Refill sale cannot be negative',
  packagePriceCannotBeNegative: 'Package price cannot be negative',
  refillPriceCannotBeNegative: 'Refill price cannot be negative',
  quantityAndPriceRequired: 'Quantity and price are required',
  atLeastOneSaleItemRequired: 'At least one sale item is required',
  discountCannotBeNegative: 'Discount cannot be negative',
  cashDepositedCannotBeNegative: 'Cash deposited cannot be negative',
  cylinderDepositsCannotBeNegative: 'Cylinder deposits cannot be negative',
  available: 'Available',
  for: 'for',
  readOnly: 'Read Only',
  areYouSure: 'Are you sure?',
  deleteConfirmation: 'Delete Confirmation',
  salesEntries: 'Sales Entries',
  cannotBeUndone: 'This action cannot be undone',
  successfullyDeleted: 'Successfully deleted',
  on: 'on',
  thisWillDelete: 'This will delete',
  failedToLoadDailySalesData: 'Failed to load daily sales data',
  combinedSaleCreatedSuccessfully: 'Combined sale created successfully',
  failedToCreateSale: 'Failed to create sale',
  failedToLoadEntryDataForEditing: 'Failed to load entry data for editing',
  salesEntryUpdatedSuccessfully: 'Sales entry updated successfully',
  failedToUpdateSalesEntry: 'Failed to update sales entry',
  failedToDeleteSales: 'Failed to delete sales',

  // Admin and user management
  adminPanel: 'Admin Panel',
  systemAdministration: 'System Administration',
  viewDistributorDashboard: 'View Distributor Dashboard',
  signOut: 'Sign Out',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  systemTheme: 'System Theme',

  // Shipments management
  shipmentsManagement: 'Shipments Management',
  trackPurchaseOrdersAndShipments: 'Track Purchase Orders and Shipments',
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
  loadingShipments: 'Loading Shipments',
  noShipmentsFound: 'No Shipments Found',
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
  enterInvoiceNumber: 'Enter Invoice Number',
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
  enterVehicleNumber: 'Enter Vehicle Number',
  enterAdditionalNotes: 'Enter Additional Notes',
  addLineItem: 'Add Line Item',
  selectProduct: 'Select Product',
  selectCompanyFirst: 'Select Company First',
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
  shipmentDateRequired: 'Shipment date is required',
  atLeastOneLineItemRequired: 'At least one line item is required',
  creating: 'Creating',
  updatePurchaseOrder: 'Update Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',
  transactionType: 'Transaction Type',
  buyEmptyCylinders: 'Buy Empty Cylinders',
  sellEmptyCylinders: 'Sell Empty Cylinders',
  addEmptyCylindersToInventory: 'Add Empty Cylinders to Inventory',
  removeEmptyCylindersFromInventory: 'Remove Empty Cylinders from Inventory',
  cylinderSize: 'Cylinder Size',
  selectCylinderSize: 'Select Cylinder Size',
  emptyCylindersNote: 'Empty Cylinders Note',
  transactionDate: 'Transaction Date',
  enterTransactionDetails: 'Enter Transaction Details',
  buy: 'Buy',
  sell: 'Sell',

  // Analytics and performance
  comprehensiveProfitabilityAnalysis: 'Comprehensive Profitability Analysis',
  visualRepresentationProfitByProduct:
    'Visual Representation - Profit by Product',
  individualDriverPerformanceMetrics: 'Individual Driver Performance Metrics',
  comparativeAnalysisRevenueByDriver:
    'Comparative Analysis - Revenue by Driver',
  monthlyRevenue: 'Monthly Revenue',
  allExpenses: 'All Expenses',
  totalProfit: 'Total Profit',
  buyingPrice: 'Buying Price',
  commission: 'Commission',
  fixedCost: 'Fixed Cost',
  breakevenPrice: 'Breakeven Price',
  sellingPrice: 'Selling Price',
  costPerUnit: 'Cost per Unit',
  failedToLoadData: 'Failed to Load Data',
  errorLoadingData: 'Error Loading Data',

  // Date and time
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
  july2025: 'July 2025',
  june2025: 'June 2025',
  may2025: 'May 2025',
  april2025: 'April 2025',
  march2025: 'March 2025',
  february2025: 'February 2025',
  january2025: 'January 2025',
  december2024: 'December 2024',
  november2024: 'November 2024',
  october2024: 'October 2024',
  selectTime: 'Select Time',

  // Dashboard and live data
  failedToLoadDashboardData: 'Failed to Load Dashboard Data',
  failedToLoadDashboardDataRefresh: 'Failed to Load Dashboard Data - Refresh',
  errorLoadingCombinedDashboardData: 'Error Loading Combined Dashboard Data',
  sessionExpiredRedirectingToLogin: 'Session Expired - Redirecting to Login',
  realTimeOverview: 'Real-time Overview',
  orders: 'Orders',
  stockLevel: 'Stock Level',
  liveActivity: 'Live Activity',
  last15Minutes: 'Last 15 Minutes',
  targetProgress: 'Target Progress',
  performanceIndicators: 'Performance Indicators',
  inventoryHealth: 'Inventory Health',
  attentionNeeded: 'Attention Needed',
  good: 'Good',
  collectionRate: 'Collection Rate',
  profitMargin: 'Profit Margin',

  // Final batch of missing properties
  salesDetails: 'Sales Details',
  viewDetailedSalesBreakdown: 'View Detailed Sales Breakdown',
  salesBreakdown: 'Sales Breakdown',
  detailedSalesAnalytics: 'Detailed Sales Analytics',
  averageOrderValue: 'Average Order Value',
  driverPerformance: 'Driver Performance',
  topPerformersAndRankings: 'Top Performers and Rankings',
  driverRankings: 'Driver Rankings',
  performanceLeaderboard: 'Performance Leaderboard',
  detailedViewAndTrends: 'Detailed View and Trends',
  vsYesterday: 'vs Yesterday',
  lpgDistributor: 'LPG Distributor',
  welcomeBack: 'Welcome Back',
  role: 'Role',
  loadingDashboard: 'Loading Dashboard',
  fallbackDriverName1: 'Driver 1',
  fallbackDriverName2: 'Driver 2',
  fallbackDriverName3: 'Driver 3',
  fallbackDriverName4: 'Driver 4',
  salesCount: 'Sales Count',
  revenueAmount: 'Revenue Amount',
  performancePercentage: 'Performance Percentage',
  chartDataFallback: 'Chart Data',
  weeklyPerformance: 'Weekly Performance',
  dailyAverage: 'Daily Average',
  monthlyTarget: 'Monthly Target',
  quarterlyGrowth: 'Quarterly Growth',
  unknownDriver: 'Unknown Driver',
  completedSale: 'Completed Sale',
  driverCompletedSale: 'Driver completed sale',
  salesTrendUp: 'Sales trend up',
  salesTrendDown: 'Sales trend down',
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
  revenue: 'আয়',
  loadingData: 'ডেটা লোড হচ্ছে...',
  noDataAvailable: 'কোনো ডেটা উপলব্ধ নেই',
  tryAgain: 'আবার চেষ্টা করুন',
  performance: 'কর্মক্ষমতা',
  allDrivers: 'সব চালক',
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
  operationSuccessful: 'অপারেশন সফল',
  operationFailed: 'অপারেশন ব্যর্থ',

  // Specific Features
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

  // Sales form specific translations
  selectADriver: 'একজন চালক নির্বাচন করুন',
  enterCustomerName: 'গ্রাহকের নাম লিখুন',
  customerNamePlaceholder: 'গ্রাহকের নাম লিখুন (প্রাপ্য ট্র্যাকিংয়ের জন্য)',
  saleItems: 'বিক্রয় আইটেম',
  itemNumber: 'আইটেম',
  selectAProduct: 'একটি পণ্য নির্বাচন করুন',
  packagePrice: 'প্যাকেজ মূল্য',
  refillPrice: 'রিফিল মূল্য',
  itemTotal: 'আইটেম মোট',
  saleSummary: 'বিক্রয় সারসংক্ষেপ',
  paymentType: 'পেমেন্টের ধরন',
  paymentTypeRequired: 'পেমেন্টের ধরন প্রয়োজন',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  mfs: 'এমএফএস',
  mobileFinancialService: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস',
  credit: 'ক্রেডিট',
  cylinderCredit: 'সিলিন্ডার ক্রেডিট',
  cashDeposited: 'নগদ জমা',
  cylinderDeposits: 'সিলিন্ডার জমা',
  cylinderDepositsBySize: 'সাইজ অনুযায়ী সিলিন্ডার জমা',
  cylindersDeposited: 'সিলিন্ডার জমা দেওয়া',
  maxQuantity: 'সর্বোচ্চ',
  additionalNotes: 'অতিরিক্ত নোট',
  additionalNotesPlaceholder: 'অতিরিক্ত নোট বা মন্তব্য...',
  totalQuantityLabel: 'মোট পরিমাণ',
  totalValueLabel: 'মোট মূল্য',
  totalDiscountLabel: 'মোট ছাড়',
  netValueLabel: 'নেট মূল্য',
  cashReceivableWarning: 'এই বিক্রয়ে নগদ প্রাপ্য তৈরি হবে',
  customerNameRecommended: 'ট্র্যাকিংয়ের জন্য গ্রাহকের নাম সুপারিশ করা হয়',
  cylinderReceivableWarning: 'এই বিক্রয়ে সিলিন্ডার প্রাপ্য তৈরি হবে:',
  cylindersRemaining: 'সিলিন্ডার বাকি',
  lowStockAlert: 'কম স্টক!',
  loadingFormData: 'ফর্ম ডেটা লোড হচ্ছে...',

  // Form validation messages
  driverRequired: 'চালক প্রয়োজন',
  productRequired: 'পণ্য প্রয়োজন',
  packageSaleCannotBeNegative: 'প্যাকেজ বিক্রয় নেগেটিভ হতে পারে না',
  refillSaleCannotBeNegative: 'রিফিল বিক্রয় নেগেটিভ হতে পারে না',
  packagePriceCannotBeNegative: 'প্যাকেজ মূল্য নেগেটিভ হতে পারে না',
  refillPriceCannotBeNegative: 'রিফিল মূল্য নেগেটিভ হতে পারে না',
  quantityAndPriceRequired:
    'প্রতিটি আইটেমের পরিমাণ > ০ এবং সংশ্লিষ্ট মূল্য > ০ থাকতে হবে',
  atLeastOneSaleItemRequired: 'কমপক্ষে একটি বিক্রয় আইটেম প্রয়োজন',
  discountCannotBeNegative: 'ছাড় নেগেটিভ হতে পারে না',
  cashDepositedCannotBeNegative: 'নগদ জমা নেগেটিভ হতে পারে না',
  cylinderDepositsCannotBeNegative: 'সিলিন্ডার জমা নেগেটিভ হতে পারে না',
  available: 'উপলব্ধ',
  for: 'জন্য',

  // Sales page specific translations
  readOnly: 'শুধুমাত্র পড়ার জন্য',
  areYouSure: 'আপনি কি নিশ্চিত',
  deleteConfirmation: 'এর সব বিক্রয় মুছে দিতে চান',
  salesEntries: 'বিক্রয় এন্ট্রি',
  cannotBeUndone: 'এবং এটি পূর্বাবস্থায় ফেরানো যাবে না',
  successfullyDeleted: 'সফলভাবে মুছে ফেলা হয়েছে',
  on: 'তারিখে',
  thisWillDelete: 'এটি মুছে দেবে',
  failedToLoadDailySalesData: 'দৈনিক বিক্রয় ডেটা লোড করতে ব্যর্থ',
  combinedSaleCreatedSuccessfully: 'সম্মিলিত বিক্রয় সফলভাবে তৈরি হয়েছে',
  failedToCreateSale: 'বিক্রয় তৈরি করতে ব্যর্থ',
  failedToLoadEntryDataForEditing:
    'সম্পাদনার জন্য এন্ট্রি ডেটা লোড করতে ব্যর্থ',
  salesEntryUpdatedSuccessfully: 'বিক্রয় এন্ট্রি সফলভাবে আপডেট হয়েছে',
  failedToUpdateSalesEntry: 'বিক্রয় এন্ট্রি আপডেট করতে ব্যর্থ',
  failedToDeleteSales: 'বিক্রয় মুছতে ব্যর্থ',

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

  // Analytics page specific translations
  comprehensiveProfitabilityAnalysis: 'ব্যাপক লাভজনকতা বিশ্লেষণ',
  visualRepresentationProfitByProduct:
    'পণ্য অনুযায়ী লাভের ভিজ্যুয়াল উপস্থাপনা',
  individualDriverPerformanceMetrics: 'ব্যক্তিগত চালক পারফরম্যান্স মেট্রিক্স',
  comparativeAnalysisRevenueByDriver: 'চালক অনুযায়ী আয়ের তুলনামূলক বিশ্লেষণ',
  monthlyRevenue: 'মাসিক আয়',
  allExpenses: 'সকল খরচ',
  totalProfit: 'মোট লাভ',
  buyingPrice: 'ক্রয় মূল্য',
  commission: 'কমিশন',
  fixedCost: 'স্থির খরচ',
  breakevenPrice: 'সমতা মূল্য',
  sellingPrice: 'বিক্রয় মূল্য',
  costPerUnit: 'প্রতি ইউনিট খরচ',
  failedToLoadData: 'ডেটা লোড করতে ব্যর্থ',
  errorLoadingData: 'ডেটা লোড করতে ত্রুটি',
  january: 'জানুয়ারি',
  february: 'ফেব্রুয়ারি',
  march: 'মার্চ',
  april: 'এপ্রিল',
  may: 'মে',
  june: 'জুন',
  july: 'জুলাই',
  august: 'আগস্ট',
  september: 'সেপ্টেম্বর',
  october: 'অক্টোবর',
  november: 'নভেম্বর',
  december: 'ডিসেম্বর',

  // Dashboard error messages and loading states
  failedToLoadDashboardData: 'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ',
  failedToLoadDashboardDataRefresh:
    'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ। অনুগ্রহ করে পৃষ্ঠা রিফ্রেশ করুন।',
  errorLoadingCombinedDashboardData: 'সম্মিলিত ড্যাশবোর্ড ডেটা লোড করতে ত্রুটি',
  sessionExpiredRedirectingToLogin:
    'সেশনের মেয়াদ শেষ, লগইনে পুনঃনির্দেশিত হচ্ছে',

  // Mobile dashboard specific
  realTimeOverview: 'রিয়েল-টাইম ওভারভিউ',
  orders: 'অর্ডার',
  stockLevel: 'স্টক লেভেল',
  liveActivity: 'লাইভ কার্যকলাপ',
  last15Minutes: 'শেষ ১৫ মিনিট',
  targetProgress: 'লক্ষ্য অগ্রগতি',
  performanceIndicators: 'পারফরম্যান্স সূচক',
  inventoryHealth: 'ইনভেন্টরি স্বাস্থ্য',
  attentionNeeded: 'মনোযোগ প্রয়োজন',
  good: 'ভাল',
  collectionRate: 'সংগ্রহের হার',
  profitMargin: 'লাভের মার্জিন',
  salesDetails: 'বিক্রয় বিবরণ',
  viewDetailedSalesBreakdown: 'বিস্তারিত বিক্রয় বিভাজন দেখুন',
  salesBreakdown: 'বিক্রয় বিভাজন',
  detailedSalesAnalytics: 'বিস্তারিত বিক্রয় বিশ্লেষণ',
  averageOrderValue: 'গড় অর্ডার মূল্য',
  driverPerformance: 'চালক পারফরম্যান্স',
  topPerformersAndRankings: 'শীর্ষ পারফরমার এবং র‍্যাঙ্কিং',
  driverRankings: 'চালক র‍্যাঙ্কিং',
  performanceLeaderboard: 'পারফরম্যান্স লিডারবোর্ড',
  detailedViewAndTrends: 'বিস্তারিত দৃশ্য এবং প্রবণতা',
  vsYesterday: 'গতকালের তুলনায়',

  // Dashboard layout specific
  lpgDistributor: 'এলপিজি ডিস্ট্রিবিউটর',
  welcomeBack: 'স্বাগতম',
  role: 'ভূমিকা',
  loadingDashboard: 'লোড হচ্ছে...',

  // Dashboard fallback data and performance metrics
  fallbackDriverName1: 'রহমান আলী',
  translatedKeys: '',
  fallbackDriverName2: 'করিম হাসান',
  fallbackDriverName3: 'হাসান আহমেদ',
  fallbackDriverName4: 'আলী রহমান',
  salesCount: 'বিক্রয়',
  revenueAmount: 'আয়',
  performancePercentage: 'পারফরম্যান্স',
  chartDataFallback: 'নমুনা চার্ট ডেটা',
  weeklyPerformance: 'সাপ্তাহিক পারফরম্যান্স',
  dailyAverage: 'দৈনিক গড়',
  monthlyTarget: 'মাসিক লক্ষ্য',
  quarterlyGrowth: 'ত্রৈমাসিক বৃদ্ধি',

  // Dashboard API and activity messages
  unknownDriver: 'অজানা চালক',
  completedSale: 'বিক্রয় সম্পন্ন',
  driverCompletedSale: 'চালক বিক্রয় সম্পন্ন করেছেন',
  salesTrendUp: 'বৃদ্ধি',
  salesTrendDown: 'হ্রাস',

  // Driver management interface translations
  driverDetails: 'চালকের বিবরণ',
  addNewDriver: 'নতুন চালক যোগ করুন',
  editDriver: 'চালক সম্পাদনা করুন',
  updateDriver: 'চালক আপডেট করুন',
  deleteDriver: 'চালক মুছুন',
  driverName: 'চালকের নাম',
  driverType: 'চালকের ধরন',
  phoneNumber: 'ফোন নম্বর',
  emailAddress: 'ইমেইল ঠিকানা',
  licenseNumber: 'লাইসেন্স নম্বর',
  routeArea: 'রুট/এলাকা',
  joiningDate: 'যোগদানের তারিখ',
  performanceStatistics: 'পারফরম্যান্স পরিসংখ্যান',
  details: 'বিবরণ',
  deleting: 'মুছে ফেলা হচ্ছে...',
  salesValue: 'বিক্রয় মূল্য',
  noDailySalesDataFound:
    'খুচরা চালকদের জন্য কোন দৈনিক বিক্রয় ডেটা পাওয়া যায়নি',
  loadingDailySalesData: 'দৈনিক বিক্রয় ডেটা লোড হচ্ছে...',
  loadingDriverPerformance: 'চালকের পারফরম্যান্স লোড হচ্ছে...',

  // AddDriverForm translations
  personalInformation: 'ব্যক্তিগত তথ্য',
  fullName: 'পূর্ণ নাম',
  enterFullName: 'পূর্ণ নাম লিখুন',
  enterPhoneNumber: 'ফোন নম্বর লিখুন',
  enterEmailAddress: 'ইমেইল ঠিকানা লিখুন (ঐচ্ছিক)',
  optional: 'ঐচ্ছিক',
  enterLicenseNumber: 'লাইসেন্স নম্বর লিখুন',
  locationInformation: 'অবস্থানের তথ্য',
  enterFullAddress: 'সম্পূর্ণ ঠিকানা লিখুন',
  assignedArea: 'নির্ধারিত এলাকা',
  enterAssignedAreaRoute: 'নির্ধারিত এলাকা/রুট লিখুন',
  emergencyContact: 'জরুরি যোগাযোগ',
  contactName: 'যোগাযোগের নাম',
  enterEmergencyContactName: 'জরুরি যোগাযোগের নাম লিখুন',
  contactNumber: 'যোগাযোগ নম্বর',
  enterEmergencyContactNumber: 'জরুরি যোগাযোগ নম্বর লিখুন',
  statusAndNotes: 'অবস্থা ও নোট',
  selectStatus: 'অবস্থা নির্বাচন করুন',
  additionalNotesComments: 'অতিরিক্ত নোট বা মন্তব্য...',
  retailDriverDescription:
    'খুচরা চালকরা সরাসরি গ্রাহক বিক্রয় এবং ডেলিভারি পরিচালনা করেন',
  shipmentDriverDescription:
    'চালান চালকরা বাল্ক ট্রান্সফার এবং গুদাম অপারেশন পরিচালনা করেন',
  selectDriverType: 'চালকের ধরন নির্বাচন করুন',

  // Form validation messages for drivers
  nameMustBeAtLeast2Characters: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে',
  nameTooLong: 'নাম খুব বড়',
  phoneNumberMustBeAtLeast10Digits: 'ফোন নম্বর কমপক্ষে ১০ সংখ্যার হতে হবে',
  phoneNumberTooLong: 'ফোন নম্বর খুব বড়',
  invalidEmailAddress: 'অবৈধ ইমেইল ঠিকানা',
  licenseNumberMustBeAtLeast5Characters:
    'লাইসেন্স নম্বর কমপক্ষে ৫ অক্ষরের হতে হবে',
  licenseNumberTooLong: 'লাইসেন্স নম্বর খুব বড়',
  addressMustBeAtLeast10Characters: 'ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে',
  addressTooLong: 'ঠিকানা খুব বড়',
  areaMustBeAtLeast2Characters: 'এলাকা কমপক্ষে ২ অক্ষরের হতে হবে',
  areaTooLong: 'এলাকা খুব বড়',
  emergencyContactMustBeAtLeast10Digits:
    'জরুরি যোগাযোগ কমপক্ষে ১০ সংখ্যার হতে হবে',
  emergencyContactTooLong: 'জরুরি যোগাযোগ খুব বড়',
  emergencyContactNameMustBeAtLeast2Characters:
    'জরুরি যোগাযোগের নাম কমপক্ষে ২ অক্ষরের হতে হবে',
  statusIsRequired: 'অবস্থা প্রয়োজন',
  driverTypeIsRequired: 'চালকের ধরন প্রয়োজন',

  // Driver deletion confirmation
  areYouSureDeleteDriver: 'আপনি কি নিশ্চিত যে চালক মুছে ফেলতে চান',
  thisActionCannotBeUndone: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  driverDeletedSuccessfully: 'চালক সফলভাবে মুছে ফেলা হয়েছে!',
  driverAddedSuccessfully: 'চালক সফলভাবে যোগ করা হয়েছে!',

  // Month names for driver page
  july2025: 'জুলাই ২০২৫',
  june2025: 'জুন ২০২৫',
  may2025: 'মে ২০২৫',
  april2025: 'এপ্রিল ২০২৫',
  march2025: 'মার্চ ২০২৫',
  february2025: 'ফেব্রুয়ারি ২০২৫',
  january2025: 'জানুয়ারি ২০২৫',
  december2024: 'ডিসেম্বর ২০২৪',
  november2024: 'নভেম্বর ২০২৪',
  october2024: 'অক্টোবর ২০২৪',
  salesTrendStable: 'স্থিতিশীল',
  performanceTrendUp: 'উন্নতি',
  performanceTrendDown: 'অবনতি',
  performanceTrendStable: 'স্থিতিশীল',
  recentSaleActivity: 'সাম্প্রতিক বিক্রয় কার্যকলাপ',
  dashboardDataUpdated: 'ড্যাশবোর্ড ডেটা আপডেট হয়েছে',
  metricsLastUpdated: 'মেট্রিক্স সর্বশেষ আপডেট',
  liveDataFeed: 'লাইভ ডেটা ফিড',
  performanceAlert: 'পারফরম্যান্স সতর্কতা',
  stockAlert: 'স্টক সতর্কতা',
  systemNotification: 'সিস্টেম বিজ্ঞপ্তি',

  // Dashboard notifications and alerts
  newSalesActivity: 'নতুন বিক্রয় কার্যকলাপ',
  inventoryAlert: 'ইনভেন্টরি সতর্কতা',
  overduePayments: 'বকেয়া পেমেন্ট',
  targetAchieved: 'লক্ষ্য অর্জিত!',
  topPerformer: 'শীর্ষ পারফরমার',
  lowStock: 'কম স্টক',
  outOfStock: 'স্টক শেষ',
  overstock: 'অতিরিক্ত স্টক',
  movementAnomaly: 'চলাচলের অস্বাভাবিকতা',
  critical: 'গুরুতর',
  all: 'সব',
  allAlerts: 'সব সতর্কতা',
  criticalAlerts: 'গুরুতর সতর্কতা',
  warningAlerts: 'সতর্কতা সতর্কতা',
  infoAlerts: 'তথ্য সতর্কতা',
  failedToLoadInventoryAlerts: 'ইনভেন্টরি সতর্কতা লোড করতে ব্যর্থ',
  failedToLoadAlerts: 'সতর্কতা লোড করতে ব্যর্থ',

  // Inventory console messages
  fetchingCylindersSummaryData: 'সিলিন্ডার সারসংক্ষেপ ডেটা আনা হচ্ছে...',
  cylindersSummaryResponseStatus: 'সিলিন্ডার সারসংক্ষেপ রেসপন্স স্ট্যাটাস:',
  cylindersSummaryDataReceived: 'সিলিন্ডার সারসংক্ষেপ ডেটা পাওয়া গেছে:',
  cylindersSummaryApiError: 'সিলিন্ডার সারসংক্ষেপ API ত্রুটি:',
  errorFetchingInventoryData: 'ইনভেন্টরি ডেটা আনতে ত্রুটি:',
  errorFetchingDailyInventoryData: 'দৈনিক ইনভেন্টরি ডেটা আনতে ত্রুটি:',
  errorFetchingCylindersSummaryData: 'সিলিন্ডার সারসংক্ষেপ ডেটা আনতে ত্রুটি:',

  // Missing properties - providing Bengali translations (unique only)
  activeUsers: 'সক্রিয় ব্যবহারকারী',
  addUser: 'ব্যবহারকারী যোগ করুন',
  administrator: 'প্রশাসক',
  administrators: 'প্রশাসকগণ',
  ago: 'আগে',
  allCategories: 'সব ক্যাটেগরি',
  allStatus: 'সব স্ট্যাটাস',
  anErrorOccurred: 'একটি ত্রুটি ঘটেছে',
  approved: 'অনুমোদিত',
  approvedExpenses: 'অনুমোদিত খরচ',
  approveExpense: 'খরচ অনুমোদন করুন',
  changesLog: 'পরিবর্তনের লগ',
  clear: 'পরিষ্কার',
  completeSystemAccessAndUserManagement:
    'সম্পূর্ণ সিস্টেম অ্যাক্সেস এবং ব্যবহারকারী ব্যবস্থাপনা',
  confirmDeleteUser: 'ব্যবহারকারী মুছে ফেলার নিশ্চিতকরণ',
  customers: 'গ্রাহকগণ',
  dailySalesRetailDrivers: 'খুচরা চালকের দৈনিক বিক্রয়',
  day: 'দিন',
  days: 'দিনসমূহ',
  deleteExpense: 'খরচ মুছুন',
  deleteUser: 'ব্যবহারকারী মুছুন',
  driverManagement: 'চালক ব্যবস্থাপনা',
  driverUpdatedSuccessfully: 'চালক সফলভাবে আপডেট হয়েছে',
  editExpense: 'খরচ সম্পাদনা করুন',
  editUser: 'ব্যবহারকারী সম্পাদনা করুন',
  expense: 'খরচ',
  expenseManagement: 'খরচ ব্যবস্থাপনা',
  failedToCreateUser: 'ব্যবহারকারী তৈরি করতে ব্যর্থ',
  failedToDeleteDriver: 'চালক মুছতে ব্যর্থ',
  failedToDeleteUser: 'ব্যবহারকারী মুছতে ব্যর্থ',
  failedToFetchUsers: 'ব্যবহারকারী আনতে ব্যর্থ',
  failedToUpdateDriver: 'চালক আপডেট করতে ব্যর্থ',
  failedToUpdateUser: 'ব্যবহারকারী আপডেট করতে ব্যর্থ',
  getStartedByAddingFirstExpense: 'প্রথম খরচ যোগ করে শুরু করুন',
  hour: 'ঘন্টা',
  hours: 'ঘন্টাসমূহ',
  individualDailySalesData: 'ব্যক্তিগত দৈনিক বিক্রয় ডেটা',
  justNow: 'এইমাত্র',
  lastLogin: 'শেষ লগইন',
  lastUpdated: 'সর্বশেষ আপডেট',
  manageCategories: 'ক্যাটেগরি ব্যবস্থাপনা',
  manager: 'ম্যানেজার',
  managers: 'ম্যানেজারগণ',
  needAdminPrivileges: 'প্রশাসনিক অধিকার প্রয়োজন',
  never: 'কখনও না',
  noUsersFound: 'কোন ব্যবহারকারী পাওয়া যায়নি',
  operations: 'অপারেশনসমূহ',
  pleaseLogInToAccessUserManagement:
    'ব্যবহারকারী ব্যবস্থাপনা অ্যাক্সেস করতে লগইন করুন',
  receivableManagement: 'প্রাপ্য ব্যবস্থাপনা',
  receivableRecords: 'প্রাপ্য রেকর্ডসমূহ',
  rejectExpense: 'খরচ প্রত্যাখ্যান করুন',
  rolePermissions: 'ভূমিকার অনুমতি',
  salesInventoryAndDriverManagement: 'বিক্রয়, ইনভেন্টরি এবং চালক ব্যবস্থাপনা',
  searchExpenses: 'খরচ অনুসন্ধান করুন',
  submittedBy: 'দ্বারা জমা',
  systemUsers: 'সিস্টেম ব্যবহারকারী',
  tasks: 'কাজসমূহ',
  totalUsers: 'মোট ব্যবহারকারী',
  trackExpensesAndManageBudgets: 'খরচ ট্র্যাক করুন এবং বাজেট ব্যবস্থাপনা করুন',
  updateUser: 'ব্যবহারকারী আপডেট করুন',
  updating: 'আপডেট হচ্ছে',
  user: 'ব্যবহারকারী',
  userDetails: 'ব্যবহারকারীর বিস্তারিত',
  userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
  viewDetails: 'বিস্তারিত দেখুন',
  viewingExpensesFor: 'খরচ দেখা হচ্ছে',
  viewReceipt: 'রসিদ দেখুন',

  // Final missing properties
  filterByDriverType: 'চালকের ধরন অনুযায়ী ফিল্টার করুন',
  from: 'থেকে',
  fullAccess: 'সম্পূর্ণ অ্যাক্সেস',
  inventoryManagement: 'ইনভেন্টরি ব্যবস্থাপনা',
  login: 'লগইন',
  noActiveDriversFoundForThisPeriod:
    'এই সময়ের জন্য কোন সক্রিয় চালক পাওয়া যায়নি',
  notApplicable: 'প্রযোজ্য নয়',
  outstanding: 'বকেয়া',
  packageSalesQty: 'প্যাকেজ বিক্রয় পরিমাণ',
  parentCategory: 'প্যারেন্ট ক্যাটেগরি',
  pay: 'পেমেন্ট',
  pendingApproval: 'অনুমোদনের অপেক্ষায়',
  permissions: 'অনুমতি',
  refillSalesQty: 'রিফিল বিক্রয় পরিমাণ',
  refreshData: 'ডেটা রিফ্রেশ করুন',
  return: 'ফেরত',
  selectTime: 'সময় নির্বাচন করুন',
  to: 'পর্যন্ত',
  totalSalesQty: 'মোট বিক্রয় পরিমাণ',
  totalSalesThisMonth: 'এই মাসের মোট বিক্রয়',
  unknown: 'অজানা',
  updateExpense: 'খরচ আপডেট করুন',

  // Interface properties that were not duplicated
  bn: 'বাংলা',
  en: 'ইংরেজি',
  locale: 'লোকেল',
  key: 'কী',
  value: 'মান',
  completionPercentage: 'সম্পূর্ণতার শতকরা',
  dataNotFound: 'ডেটা পাওয়া যায়নি',
  isComplete: 'সম্পূর্ণ',
  missingKeys: 'অনুপস্থিত কী',
  totalKeys: 'মোট কী',
};

const translationMap: Record<string, Translations> = {
  en: englishTranslations,
  bn: bengaliTranslations,
  'en-US': englishTranslations,
  'bn-BD': bengaliTranslations,
};

// Initialize enhanced translation system
export const translationValidator = new TranslationValidator(
  translationMap,
  'en'
);
export const translationFallbackSystem = new TranslationFallbackSystem(
  translationMap,
  ['en', 'bn']
);

// Enhanced translation function with comprehensive validation and fallback
export function getTranslation(
  language: string,
  key: keyof Translations,
  component?: string
): string {
  return translationFallbackSystem.getTranslation(key, language, component);
}

// Enhanced t function with better error handling
export function t(key: keyof Translations): string {
  return translationFallbackSystem.getTranslation(key, 'en');
}

// Enhanced translation validation functions using the new system
export function validateTranslationKey(key: string): boolean {
  return translationValidator.validateKey(key);
}

export function validateTranslationCompleteness(language: string): {
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  translatedKeys: number;
  completionPercentage: number;
} {
  const missingKeys = translationValidator.generateMissingKeys(language);
  const allKeys = Object.keys(englishTranslations);
  const translatedKeys = allKeys.length - missingKeys.length;

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    totalKeys: allKeys.length,
    translatedKeys,
    completionPercentage: Math.round((translatedKeys / allKeys.length) * 100),
  };
}

// New enhanced validation functions
export function validateTranslation(
  key: string,
  value: string,
  locale: string
): ValidationResult {
  return translationValidator.validateTranslation(key, value, locale);
}

export function checkTranslationConsistency(): ConsistencyReport {
  return translationValidator.checkConsistency();
}

export function getTranslationErrors(): TranslationError[] {
  return translationLogger.getErrors();
}

export function getTranslationErrorStats(): Record<
  TranslationErrorType,
  number
> {
  return translationLogger.getErrorStats();
}

export function clearTranslationErrors(): void {
  translationLogger.clearErrors();
}

export function generateMissingTranslationKeys(targetLocale: string): string[] {
  return translationValidator.generateMissingKeys(targetLocale);
}

// Get available languages
export function getAvailableLanguages(): string[] {
  return Object.keys(translationMap);
}

// Get translation statistics for all languages
export function getTranslationStats(): Record<
  string,
  {
    isComplete: boolean;
    totalKeys: number;
    translatedKeys: number;
    completionPercentage: number;
    missingKeys: string[];
  }
> {
  const stats: Record<string, any> = {};

  Object.keys(translationMap).forEach((language) => {
    stats[language] = validateTranslationCompleteness(language);
  });

  return stats;
}

// Export enhanced translation system components
export {
  TranslationValidator,
  TranslationFallbackSystem,
  translationLogger,
  TranslationErrorType,
} from './translation-validator';

export type {
  TranslationError,
  ValidationResult,
  ConsistencyReport,
} from './translation-validator';

// Export default translations for backward compatibility
export const translations = englishTranslations;
