"use client";

import { useState, useEffect } from 'react';
import { Calendar, FileText, TrendingUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface DriverReport {
  driverId: string;
  driverName: string;
  driverType: 'RETAIL' | 'WHOLESALE';
  packageSales: number;
  refillSales: number;
  totalSalesQty: number;
  totalSalesValue: number;
  discount: number;
  totalDeposited: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
  totalReceivables: number;
  changeInReceivables: number;
  changeInCashReceivables: number;
  changeInCylinderReceivables: number;
  salesCount: number;
  // Additional fields for formula-based calculations
  todaysCashReceivableChange: number;
  todaysCylinderReceivableChange: number;
  yesterdaysCashReceivables: number;
  yesterdaysCylinderReceivables: number;
  todaysTotalCashReceivables: number;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  particulars: string;
  category: string;
  user: string;
  expenseDate: string;
  isApproved: boolean;
}

interface Deposit {
  id: string;
  amount: number;
  description: string;
  particulars: string;
  user: string;
  depositDate: string;
  isApproved: boolean;
}

interface DailySalesReportData {
  date: string;
  driverReports: DriverReport[];
  totals: {
    packageSales: number;
    refillSales: number;
    totalSalesQty: number;
    totalSalesValue: number;
    discount: number;
    totalDeposited: number;
    totalCashReceivables: number;
    totalCylinderReceivables: number;
    totalReceivables: number;
    changeInReceivables: number;
    changeInCashReceivables: number;
    changeInCylinderReceivables: number;
  };
  expenses: Expense[];
  deposits: Deposit[];
  summary: {
    totalDeposited: number;
    totalExpenses: number;
    totalManualDeposits?: number;
    totalDriverCashDeposits?: number;
    availableCash: number;
  };
}

export default function DailySalesReportPage() {
  const { formatCurrency, formatDate, t } = useSettings();
  
  // Helper function to translate common English patterns
  const translateText = (text: string | null | undefined): string => {
    if (!text) return '';
    
    // Replace common English patterns with translations
    return text
      .replace(/Cash deposits by driver/g, t('cashDepositsByDriver'))
      .replace(/Driver Expense/gi, t('driverExpense'))
      .replace(/Fuel Expense/gi, t('fuelExpense'))
      .replace(/Maintenance Expense/gi, t('maintenanceExpense'))
      .replace(/Office Expense/gi, t('officeExpense'))
      .replace(/Transport Expense/gi, t('transportExpense'))
      .replace(/Miscellaneous Expense/gi, t('miscellaneousExpense'))
      .replace(/General Expense/gi, t('generalExpense'));
  };
  const [reportData, setReportData] = useState<DailySalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchReportData = async (date: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(`/api/reports/daily-sales?date=${date}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const errorText = await response.text();
        console.error('Daily sales report API error:', response.status, errorText);
        toast({
          title: t('error'),
          description: t('failedToLoadDailySalesReport'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load daily sales report:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadDailySalesReport'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    fetchReportData(selectedDate, true);
  };


  // All drivers are retail now, so this function is not needed
  // const getDriverTypeColor = (driverType: 'RETAIL' | 'WHOLESALE') => {
  //   return driverType === 'RETAIL' 
  //     ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  //     : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  // };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-muted-foreground">{t('loadingDailySalesReport')}</span>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">{t('noReportDataAvailable')}</p>
          <p className="text-sm">{t('tryAgainOrSelectDate')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dailySalesReport')}</h1>
          <p className="text-muted-foreground">{t('comprehensiveDailySalesReport')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalSalesValue')}</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(reportData.totals.totalSalesValue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalDeposited')}</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(reportData.totals.totalDeposited)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalExpenses')}</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(reportData.summary.totalExpenses)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('availableCash')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(reportData.summary.availableCash)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Sales Report Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t('dailySalesReport')} - {formatDate(selectedDate)}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('driver')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('packageSalesQty')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('refillSalesQty')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('totalSalesQty')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('totalSalesValue')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('discount')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('totalDeposited')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('totalCylindersReceivables')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('totalCashReceivables')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('changeInReceivablesCashCylinders')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {reportData.driverReports.map((driver) => (
                <tr key={driver.driverId} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {driver.driverName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('retailDriver')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                    {driver.packageSales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                    {driver.refillSales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-foreground">
                    {driver.totalSalesQty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                    {formatCurrency(driver.totalSalesValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                    {formatCurrency(driver.discount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                    {formatCurrency(driver.totalDeposited)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                    {driver.totalCylinderReceivables}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                    {formatCurrency(driver.totalCashReceivables)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex flex-col text-xs">
                      <span className={`font-medium ${
                        driver.changeInCashReceivables > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : driver.changeInCashReceivables < 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-foreground'
                      }`}>
                        {t('cash')}: {driver.changeInCashReceivables > 0 ? '+' : ''}{formatCurrency(driver.changeInCashReceivables)}
                      </span>
                      <span className={`font-medium ${
                        driver.changeInCylinderReceivables > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : driver.changeInCylinderReceivables < 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-foreground'
                      }`}>
                        {t('cylinders')}: {driver.changeInCylinderReceivables > 0 ? '+' : ''}{driver.changeInCylinderReceivables}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-muted font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {t('total').toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                  {reportData.totals.packageSales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                  {reportData.totals.refillSales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                  {reportData.totals.totalSalesQty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                  {formatCurrency(reportData.totals.totalSalesValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                  {formatCurrency(reportData.totals.discount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                  {formatCurrency(reportData.totals.totalDeposited)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                  {reportData.totals.totalCylinderReceivables}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground">
                  {formatCurrency(reportData.totals.totalCashReceivables)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex flex-col text-xs">
                    <span className={`font-medium ${
                      reportData.totals.changeInCashReceivables > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : reportData.totals.changeInCashReceivables < 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-foreground'
                    }`}>
                      {t('cash')}: {reportData.totals.changeInCashReceivables > 0 ? '+' : ''}{formatCurrency(reportData.totals.changeInCashReceivables)}
                    </span>
                    <span className={`font-medium ${
                      reportData.totals.changeInCylinderReceivables > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : reportData.totals.changeInCylinderReceivables < 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-foreground'
                    }`}>
                      {t('cylinders')}: {reportData.totals.changeInCylinderReceivables > 0 ? '+' : ''}{reportData.totals.changeInCylinderReceivables}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Deposits & Expenses Tables */}
      <div className="bg-card rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t('dailyDepositsExpenses')} - {formatDate(selectedDate)}
          </h2>
          <p className="text-sm text-muted-foreground">{t('detailedBreakdownDepositsExpenses')}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Deposits Table */}
          <div>
            <h3 className="text-md font-medium text-foreground mb-4">{t('deposits')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{t('particulars')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{t('description')}</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reportData.deposits && reportData.deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-muted/50">
                      <td className="px-3 py-2 text-sm text-foreground">
                        {translateText(deposit.particulars) || t('cashDepositsByDriver')}
                      </td>
                      <td className="px-3 py-2 text-sm text-foreground">{deposit.description}</td>
                      <td className="px-3 py-2 text-sm text-foreground text-right">{formatCurrency(deposit.amount)}</td>
                    </tr>
                  ))}
                  {(!reportData.deposits || reportData.deposits.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-sm text-muted-foreground">
                        {t('noDepositsFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-sm font-medium text-foreground">{t('totalDepositsCalculated')}</td>
                    <td className="px-3 py-2 text-sm font-bold text-foreground text-right">
                      {formatCurrency(reportData.deposits ? reportData.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) : 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Expenses Table */}
          <div>
            <h3 className="text-md font-medium text-foreground mb-4">{t('expenses')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{t('particulars')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{t('description')}</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reportData.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50">
                      <td className="px-3 py-2 text-sm text-foreground">
                        {translateText(expense.category || expense.particulars) || t('generalExpense')}
                      </td>
                      <td className="px-3 py-2 text-sm text-foreground">{expense.description}</td>
                      <td className="px-3 py-2 text-sm text-foreground text-right">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                  {reportData.expenses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-sm text-muted-foreground">
                        {t('noExpensesFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-sm font-medium text-foreground">{t('totalExpensesCalculated')}</td>
                    <td className="px-3 py-2 text-sm font-bold text-foreground text-right">
                      {formatCurrency(reportData.expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Available Cash Summary */}
      <div className="bg-card rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t('availableCash')} - {formatDate(selectedDate)}
          </h2>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">{t('totalAvailableCash')}:</span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(
                  reportData.summary.totalDeposited + 
                  (reportData.deposits ? reportData.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) : 0) - 
                  reportData.expenses.reduce((sum, expense) => sum + expense.amount, 0)
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('totalDepositsIncludingSales')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}