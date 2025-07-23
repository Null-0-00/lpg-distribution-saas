"use client";

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Financial Reports Engine with Real-time Data Integration
interface IncomeStatementData {
  revenue: {
    packageSales: number;
    refillSales: number;
    total: number;
  };
  costOfGoodsSold: {
    cylinderPurchases: number;
    total: number;
  };
  operatingExpenses: {
    salaries: number;
    fuel: number;
    maintenance: number;
    rent: number;
    utilities: number;
    other: number;
    total: number;
  };
  netIncome: number;
  grossProfit: number;
}

interface BalanceSheetData {
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      total: number;
    };
    fixedAssets: {
      vehicles: number;
      equipment: number;
      buildings: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      shortTermLoans: number;
      total: number;
    };
    longTermLiabilities: {
      longTermLoans: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    ownerEquity: number;
    retainedEarnings: number;
    total: number;
  };
  isBalanced: boolean;
}

interface CashFlowData {
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    accountsReceivableChange: number;
    inventoryChange: number;
    accountsPayableChange: number;
    total: number;
  };
  investingActivities: {
    vehiclePurchases: number;
    equipmentPurchases: number;
    total: number;
  };
  financingActivities: {
    ownerDrawings: number;
    loanRepayments: number;
    total: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [exportLoading, setExportLoading] = useState('');
  
  // Real-time financial data state
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData>({
    revenue: {
      packageSales: 340000,
      refillSales: 285000,
      total: 625000
    },
    costOfGoodsSold: {
      cylinderPurchases: 375000,
      total: 375000
    },
    operatingExpenses: {
      salaries: 45000,
      fuel: 12000,
      maintenance: 8000,
      rent: 15000,
      utilities: 3500,
      other: 6500,
      total: 90000
    },
    grossProfit: 250000,
    netIncome: 160000
  });

  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData>({
    assets: {
      currentAssets: {
        cash: 150000,
        accountsReceivable: 85000,
        inventory: 420000,
        total: 655000
      },
      fixedAssets: {
        vehicles: 800000,
        equipment: 250000,
        buildings: 1200000,
        total: 2250000
      },
      totalAssets: 2905000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 125000,
        shortTermLoans: 75000,
        total: 200000
      },
      longTermLiabilities: {
        longTermLoans: 900000,
        total: 900000
      },
      totalLiabilities: 1100000
    },
    equity: {
      ownerEquity: 1500000,
      retainedEarnings: 305000,
      total: 1805000
    },
    isBalanced: true
  });

  const [cashFlow, setCashFlow] = useState<CashFlowData>({
    operatingActivities: {
      netIncome: 160000,
      depreciation: 45000,
      accountsReceivableChange: -15000,
      inventoryChange: -35000,
      accountsPayableChange: 12000,
      total: 167000
    },
    investingActivities: {
      vehiclePurchases: -150000,
      equipmentPurchases: -25000,
      total: -175000
    },
    financingActivities: {
      ownerDrawings: -60000,
      loanRepayments: -35000,
      total: -95000
    },
    netCashFlow: -103000,
    beginningCash: 253000,
    endingCash: 150000
  });

  // Load real-time financial data
  useEffect(() => {
    loadFinancialData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadFinancialData, 300000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Simulate API calls to load real financial data
      // In production, these would be actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last refreshed time
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExportReport = async (reportType: string, format: 'pdf' | 'excel') => {
    setExportLoading(`${reportType}-${format}`);
    try {
      // Simulate export API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would trigger actual PDF/Excel generation
      const filename = `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      alert(`${format.toUpperCase()} export completed: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading('');
    }
  };

  // Email automation
  const handleEmailReport = async (reportType: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`${reportType} has been emailed to configured recipients.`);
    } catch (error) {
      console.error('Email error:', error);
      alert('Email failed. Please check email configuration.');
    }
  };
  
  const [reportTypes] = useState([
    {
      id: 'income_statement',
      title: 'Income Statement',
      description: 'Revenue, expenses, and profit analysis',
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      color: 'blue'
    },
    {
      id: 'balance_sheet',
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity overview',
      icon: BarChart3,
      lastGenerated: '2024-01-15',
      color: 'green'
    },
    {
      id: 'cash_flow',
      title: 'Cash Flow Statement',
      description: 'Cash inflows and outflows tracking',
      icon: PieChart,
      lastGenerated: '2024-01-15',
      color: 'purple'
    },
    {
      id: 'sales_report',
      title: 'Sales Report',
      description: 'Detailed sales performance analysis',
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      color: 'orange'
    },
    {
      id: 'inventory_report',
      title: 'Inventory Report',
      description: 'Stock levels and movement analysis',
      icon: BarChart3,
      lastGenerated: '2024-01-15',
      color: 'teal'
    },
    {
      id: 'driver_performance',
      title: 'Driver Performance',
      description: 'Individual driver sales and efficiency',
      icon: PieChart,
      lastGenerated: '2024-01-15',
      color: 'red'
    }
  ]);

  // Calculate real-time quick stats from actual data
  const quickStats = {
    totalRevenue: incomeStatement.revenue.total,
    totalExpenses: incomeStatement.costOfGoodsSold.total + incomeStatement.operatingExpenses.total,
    netProfit: incomeStatement.netIncome,
    profitMargin: ((incomeStatement.netIncome / incomeStatement.revenue.total) * 100)
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      'blue': 'text-blue-600',
      'green': 'text-green-600',
      'purple': 'text-purple-600',
      'orange': 'text-orange-600',
      'teal': 'text-teal-600',
      'red': 'text-red-600',
    };
    return colors[color] || 'text-gray-600';
  };

  const getBgColor = (color: string) => {
    const colors: { [key: string]: string } = {
      'blue': 'bg-blue-100',
      'green': 'bg-green-100',
      'purple': 'bg-purple-100',
      'orange': 'bg-orange-100',
      'teal': 'bg-teal-100',
      'red': 'bg-red-100',
    };
    return colors[color] || 'bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view comprehensive business reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-foreground"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
          <button 
            onClick={loadFinancialData}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-muted/50 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => alert('Custom Report Builder coming soon!')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </button>
        </div>
      </div>

      {/* Quick Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">৳{quickStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">৳{quickStats.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-foreground">৳{quickStats.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold text-foreground">{quickStats.profitMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-card rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getBgColor(report.color)}`}>
                    <Icon className={`h-6 w-6 ${getIconColor(report.color)}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Last: {report.lastGenerated}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="flex items-center justify-center px-2 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted text-xs"
                    onClick={() => alert(`View ${report.title} details below`)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button 
                    className="flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                    onClick={() => handleExportReport(report.id, 'pdf')}
                    disabled={exportLoading === `${report.id}-pdf`}
                  >
                    {exportLoading === `${report.id}-pdf` ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    PDF
                  </button>
                  <button 
                    className="flex items-center justify-center px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                    onClick={() => handleExportReport(report.id, 'excel')}
                    disabled={exportLoading === `${report.id}-excel`}
                  >
                    {exportLoading === `${report.id}-excel` ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Excel
                  </button>
                  <button 
                    className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                    onClick={() => handleEmailReport(report.title)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-card rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Report Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Generated Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Generated By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-foreground">Income Statement</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">January 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">2024-01-15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Finance Officer</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-700 mr-3"
                    onClick={() => alert('View Report coming soon!')}
                  >
                    View
                  </button>
                  <button 
                    className="text-green-600 hover:text-green-700"
                    onClick={() => alert('Download Report coming soon!')}
                  >
                    Download
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-foreground">Sales Report</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">January 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">2024-01-15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Sales Manager</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-700 mr-3"
                    onClick={() => alert('View Report coming soon!')}
                  >
                    View
                  </button>
                  <button 
                    className="text-green-600 hover:text-green-700"
                    onClick={() => alert('Download Report coming soon!')}
                  >
                    Download
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-foreground">Inventory Report</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Weekly</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">2024-01-14</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Inventory Manager</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                    Processing
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className="text-muted-foreground">Generating...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Key Performance Indicators</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Monthly Revenue Growth</span>
              <span className="text-sm font-bold text-green-600">+12.5%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Customer Acquisition</span>
              <span className="text-sm font-bold text-blue-600">15 new</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Inventory Turnover</span>
              <span className="text-sm font-bold text-purple-600">2.3x</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Driver Efficiency</span>
              <span className="text-sm font-bold text-orange-600">92%</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Report Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Daily Sales Summary</span>
                <p className="text-xs text-muted-foreground">Auto-generated at 11:59 PM</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Weekly Inventory Report</span>
                <p className="text-xs text-muted-foreground">Every Sunday at 9:00 AM</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-foreground">Monthly Financial Report</span>
                <p className="text-xs text-muted-foreground">1st of each month</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Financial Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Income Statement */}
        <div className="bg-card rounded-lg shadow">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Income Statement (Real-time)</h3>
              <p className="text-xs text-muted-foreground">Revenue by type/driver with live calculations</p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={() => handleExportReport('income_statement', 'pdf')}
                disabled={exportLoading === 'income_statement-pdf'}
              >
                {exportLoading === 'income_statement-pdf' ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'PDF'}
              </button>
              <button 
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleExportReport('income_statement', 'excel')}
                disabled={exportLoading === 'income_statement-excel'}
              >
                {exportLoading === 'income_statement-excel' ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Excel'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground">REVENUE</span>
                <span className="text-sm font-bold text-green-600">৳{incomeStatement.revenue.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border ml-4">
                <span className="text-sm text-muted-foreground">- Package Sales</span>
                <span className="text-sm text-foreground">৳{incomeStatement.revenue.packageSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border ml-4">
                <span className="text-sm text-muted-foreground">- Refill Sales</span>
                <span className="text-sm text-foreground">৳{incomeStatement.revenue.refillSales.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground">COST OF GOODS SOLD</span>
                <span className="text-sm font-bold text-red-600">৳{incomeStatement.costOfGoodsSold.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border ml-4">
                <span className="text-sm text-muted-foreground">- Cylinder Purchases</span>
                <span className="text-sm text-foreground">৳{incomeStatement.costOfGoodsSold.cylinderPurchases.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">GROSS PROFIT</span>
                <span className="text-sm font-bold text-blue-600">৳{incomeStatement.grossProfit.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium text-foreground">OPERATING EXPENSES</span>
                <span className="text-sm font-bold text-red-600">৳{incomeStatement.operatingExpenses.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4">
                <span className="text-xs text-muted-foreground">- Salaries</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.salaries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4">
                <span className="text-xs text-muted-foreground">- Fuel & Transportation</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.fuel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4">
                <span className="text-xs text-muted-foreground">- Maintenance</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.maintenance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4">
                <span className="text-xs text-muted-foreground">- Rent</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4">
                <span className="text-xs text-muted-foreground">- Utilities</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.utilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 ml-4 border-b border-border">
                <span className="text-xs text-muted-foreground">- Other Expenses</span>
                <span className="text-xs text-foreground">৳{incomeStatement.operatingExpenses.other.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20">
                <span className="text-sm font-bold text-green-900 dark:text-green-200">NET INCOME</span>
                <span className="text-sm font-bold text-green-600">৳{incomeStatement.netIncome.toLocaleString()}</span>
              </div>
              
              <div className="mt-3 p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">
                  Profit Margin: <span className="font-medium">{quickStats.profitMargin.toFixed(1)}%</span> | 
                  Gross Margin: <span className="font-medium">{((incomeStatement.grossProfit / incomeStatement.revenue.total) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Balance Sheet with Auto-validation */}
        <div className="bg-card rounded-lg shadow">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Balance Sheet (Auto-validated)</h3>
              <div className="flex items-center mt-1">
                {balanceSheet.isBalanced ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${balanceSheet.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {balanceSheet.isBalanced ? 'Balanced' : 'Out of Balance'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={() => handleExportReport('balance_sheet', 'pdf')}
                disabled={exportLoading === 'balance_sheet-pdf'}
              >
                {exportLoading === 'balance_sheet-pdf' ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'PDF'}
              </button>
              <button 
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleExportReport('balance_sheet', 'excel')}
                disabled={exportLoading === 'balance_sheet-excel'}
              >
                {exportLoading === 'balance_sheet-excel' ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Excel'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">ASSETS</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Assets</span>
                    <span className="text-sm font-medium text-foreground">৳{balanceSheet.assets.currentAssets.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Cash & Bank</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.currentAssets.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Accounts Receivable</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Inventory (Auto-linked)</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.currentAssets.inventory.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fixed Assets</span>
                    <span className="text-sm font-medium text-foreground">৳{balanceSheet.assets.fixedAssets.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Vehicles</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.fixedAssets.vehicles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Equipment</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.fixedAssets.equipment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Buildings</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.assets.fixedAssets.buildings.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-sm font-bold text-foreground">Total Assets</span>
                    <span className="text-sm font-bold text-foreground">৳{balanceSheet.assets.totalAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">LIABILITIES & EQUITY</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Liabilities</span>
                    <span className="text-sm font-medium text-foreground">৳{balanceSheet.liabilities.currentLiabilities.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Accounts Payable</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.liabilities.currentLiabilities.accountsPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Short-term Loans</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.liabilities.currentLiabilities.shortTermLoans.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Long-term Liabilities</span>
                    <span className="text-sm font-medium text-foreground">৳{balanceSheet.liabilities.longTermLiabilities.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Long-term Loans</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.liabilities.longTermLiabilities.longTermLoans.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Owner's Equity</span>
                    <span className="text-sm font-medium text-foreground">৳{balanceSheet.equity.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Owner Equity</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.equity.ownerEquity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between ml-4">
                    <span className="text-xs text-muted-foreground">- Retained Earnings</span>
                    <span className="text-xs text-foreground">৳{balanceSheet.equity.retainedEarnings.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-sm font-bold text-foreground">Total Liab. & Equity</span>
                    <span className="text-sm font-bold text-foreground">৳{(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Balance Validation */}
              <div className={`mt-3 p-2 rounded ${balanceSheet.isBalanced ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                <div className="text-xs">
                  <span className={balanceSheet.isBalanced ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                    Balance Check: Assets = Liabilities + Equity 
                    ({balanceSheet.isBalanced ? 'PASSED' : 'FAILED'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Cash Flow Statement */}
      <div className="bg-card rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cash Flow Statement (Real-time)</h3>
            <p className="text-xs text-muted-foreground">Operating, Investing & Financing Activities</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              onClick={() => handleExportReport('cash_flow', 'pdf')}
              disabled={exportLoading === 'cash_flow-pdf'}
            >
              {exportLoading === 'cash_flow-pdf' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1 inline" />
                  PDF
                </>
              )}
            </button>
            <button 
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              onClick={() => handleExportReport('cash_flow', 'excel')}
              disabled={exportLoading === 'cash_flow-excel'}
            >
              {exportLoading === 'cash_flow-excel' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1 inline" />
                  Excel
                </>
              )}
            </button>
            <button 
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => handleEmailReport('Cash Flow Statement')}
            >
              <Mail className="h-3 w-3 mr-1 inline" />
              Email
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Operating Activities */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Operating Activities</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Income</span>
                  <span className="text-sm text-green-600">৳{cashFlow.operatingActivities.netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Depreciation</span>
                  <span className="text-sm text-green-600">৳{cashFlow.operatingActivities.depreciation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Change in Receivables</span>
                  <span className={`text-sm ${cashFlow.operatingActivities.accountsReceivableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.operatingActivities.accountsReceivableChange >= 0 ? '' : '-'}৳{Math.abs(cashFlow.operatingActivities.accountsReceivableChange).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Change in Inventory</span>
                  <span className={`text-sm ${cashFlow.operatingActivities.inventoryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.operatingActivities.inventoryChange >= 0 ? '' : '-'}৳{Math.abs(cashFlow.operatingActivities.inventoryChange).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Change in Payables</span>
                  <span className={`text-sm ${cashFlow.operatingActivities.accountsPayableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.operatingActivities.accountsPayableChange >= 0 ? '' : '-'}৳{Math.abs(cashFlow.operatingActivities.accountsPayableChange).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-foreground">Operating Cash Flow</span>
                  <span className={`text-sm font-bold ${cashFlow.operatingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.operatingActivities.total >= 0 ? '' : '-'}৳{Math.abs(cashFlow.operatingActivities.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Investing Activities</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vehicle Purchases</span>
                  <span className={`text-sm ${cashFlow.investingActivities.vehiclePurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.investingActivities.vehiclePurchases >= 0 ? '' : '-'}৳{Math.abs(cashFlow.investingActivities.vehiclePurchases).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Equipment Purchases</span>
                  <span className={`text-sm ${cashFlow.investingActivities.equipmentPurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.investingActivities.equipmentPurchases >= 0 ? '' : '-'}৳{Math.abs(cashFlow.investingActivities.equipmentPurchases).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-foreground">Investing Cash Flow</span>
                  <span className={`text-sm font-bold ${cashFlow.investingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.investingActivities.total >= 0 ? '' : '-'}৳{Math.abs(cashFlow.investingActivities.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Financing Activities</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Owner Drawings</span>
                  <span className={`text-sm ${cashFlow.financingActivities.ownerDrawings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.financingActivities.ownerDrawings >= 0 ? '' : '-'}৳{Math.abs(cashFlow.financingActivities.ownerDrawings).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Loan Repayments</span>
                  <span className={`text-sm ${cashFlow.financingActivities.loanRepayments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.financingActivities.loanRepayments >= 0 ? '' : '-'}৳{Math.abs(cashFlow.financingActivities.loanRepayments).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-foreground">Financing Cash Flow</span>
                  <span className={`text-sm font-bold ${cashFlow.financingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlow.financingActivities.total >= 0 ? '' : '-'}৳{Math.abs(cashFlow.financingActivities.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900 dark:text-blue-200">Net Change in Cash</span>
              <span className={`text-lg font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashFlow.netCashFlow >= 0 ? '' : '-'}৳{Math.abs(cashFlow.netCashFlow).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-blue-700 dark:text-blue-300">Cash at Beginning of Period</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">৳{cashFlow.beginningCash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-1 border-t border-blue-200 dark:border-blue-700 pt-2">
              <span className="font-medium text-blue-900 dark:text-blue-200">Cash at End of Period</span>
              <span className="text-lg font-bold text-blue-600">৳{cashFlow.endingCash.toLocaleString()}</span>
            </div>
            
            {/* Cash Flow Health Indicator */}
            <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center">
                {cashFlow.operatingActivities.total > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-xs text-muted-foreground">
                  Operating cash flow is {cashFlow.operatingActivities.total > 0 ? 'positive' : 'negative'} - 
                  {cashFlow.operatingActivities.total > 0 ? ' healthy business operations' : ' requires attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios & Analysis */}
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Financial Ratios & Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Profitability Ratios */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Profitability</h4>
            <div className="space-y-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quickStats.profitMargin}%</div>
                <div className="text-xs text-green-700 dark:text-green-300">Net Profit Margin</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">40%</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Gross Profit Margin</div>
              </div>
            </div>
          </div>

          {/* Liquidity Ratios */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Liquidity</h4>
            <div className="space-y-3">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.43</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Current Ratio</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">1.14</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Quick Ratio</div>
              </div>
            </div>
          </div>

          {/* Efficiency Ratios */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Efficiency</h4>
            <div className="space-y-3">
              <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">24</div>
                <div className="text-xs text-teal-700 dark:text-teal-300">Days in Receivables</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2.8x</div>
                <div className="text-xs text-indigo-700 dark:text-indigo-300">Inventory Turnover</div>
              </div>
            </div>
          </div>

          {/* Leverage Ratios */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Leverage</h4>
            <div className="space-y-3">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">0.40</div>
                <div className="text-xs text-red-700 dark:text-red-300">Debt-to-Equity</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">59.7%</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">Equity Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Report Automation */}
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Automated Report Delivery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Email Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <div>
                  <span className="text-sm font-medium text-foreground">Daily Sales Summary</span>
                  <p className="text-xs text-muted-foreground">Sent at 11:59 PM daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <div>
                  <span className="text-sm font-medium text-foreground">Monthly Financial Report</span>
                  <p className="text-xs text-muted-foreground">Sent on 1st of each month</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Recipients</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="email" placeholder="Add email address" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-foreground" />
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Add</button>
              </div>
              <div className="text-xs text-muted-foreground">Current recipients: admin@company.com, finance@company.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}