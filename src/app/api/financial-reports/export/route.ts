import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, format, dateRange, reportData } = await request.json();

    if (!reportType || !format || !reportData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let exportData: any;
    let filename: string;

    switch (format) {
      case 'pdf':
        exportData = await generatePDF(reportType, reportData, dateRange);
        filename = `${reportType}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
        break;
      case 'excel':
        exportData = await generateExcel(reportType, reportData, dateRange);
        filename = `${reportType}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
        break;
      case 'csv':
        exportData = await generateCSV(reportType, reportData, dateRange);
        filename = `${reportType}_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    // For now, return the data as JSON with export info
    // In production, you'd use libraries like jsPDF, xlsx, etc.
    return NextResponse.json({
      success: true,
      filename,
      downloadUrl: `/api/financial-reports/download/${filename}`,
      format,
      size: JSON.stringify(exportData).length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export financial report' },
      { status: 500 }
    );
  }
}

async function generatePDF(
  reportType: string,
  reportData: any,
  dateRange: any
) {
  // This would use a PDF generation library like jsPDF or Puppeteer
  const pdfContent = {
    title: `${reportType.replace('-', ' ').toUpperCase()}`,
    period: `${dateRange.startDate} to ${dateRange.endDate}`,
    company: 'LPG Distributor',
    generatedAt: new Date().toISOString(),
    data: reportData,
    layout: getPDFLayout(reportType, reportData),
  };

  return pdfContent;
}

async function generateExcel(
  reportType: string,
  reportData: any,
  dateRange: any
) {
  // This would use a library like xlsx or exceljs
  const workbook = {
    sheets: getExcelSheets(reportType, reportData),
    metadata: {
      title: reportType.replace('-', ' ').toUpperCase(),
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      generatedAt: new Date().toISOString(),
      format: 'xlsx',
    },
  };

  return workbook;
}

async function generateCSV(
  reportType: string,
  reportData: any,
  dateRange: any
) {
  // Generate CSV data based on report type
  const csvData = getCSVData(reportType, reportData);

  return {
    headers: csvData.headers,
    rows: csvData.rows,
    metadata: {
      title: reportType.replace('-', ' ').toUpperCase(),
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      generatedAt: new Date().toISOString(),
    },
  };
}

function getPDFLayout(reportType: string, reportData: any) {
  switch (reportType) {
    case 'income-statement':
      return {
        sections: [
          {
            title: 'Revenue',
            items: Object.entries(
              reportData.revenue?.current?.byType || {}
            ).map(([type, data]: [string, any]) => ({
              label: type,
              value: data.amount,
            })),
          },
          {
            title: 'Cost of Goods Sold',
            items: [
              {
                label: 'Total COGS',
                value: reportData.costOfGoodsSold?.current?.total || 0,
              },
            ],
          },
          {
            title: 'Operating Expenses',
            items: Object.entries(
              reportData.operatingExpenses?.current?.byCategory || {}
            ).map(([category, data]: [string, any]) => ({
              label: category,
              value: data.amount,
            })),
          },
          {
            title: 'Summary',
            items: [
              {
                label: 'Gross Profit',
                value: reportData.grossProfit?.current || 0,
              },
              {
                label: 'Net Income',
                value: reportData.netIncome?.current || 0,
              },
              {
                label: 'Gross Margin',
                value: `${reportData.margins?.grossMargin || 0}%`,
              },
              {
                label: 'Net Margin',
                value: `${reportData.margins?.netMargin || 0}%`,
              },
            ],
          },
        ],
      };

    case 'balance-sheet':
      return {
        sections: [
          {
            title: 'Assets',
            items: [
              {
                label: 'Current Assets',
                value: reportData.assets?.current?.totalCurrentAssets || 0,
              },
              {
                label: 'Fixed Assets',
                value: reportData.assets?.current?.totalFixedAssets || 0,
              },
              {
                label: 'Total Assets',
                value: reportData.totals?.current?.totalAssets || 0,
              },
            ],
          },
          {
            title: 'Liabilities',
            items: [
              {
                label: 'Total Liabilities',
                value: reportData.liabilities?.current?.total || 0,
              },
            ],
          },
          {
            title: 'Equity',
            items: [
              {
                label: 'Owner Equity',
                value: reportData.equity?.current?.total || 0,
              },
              {
                label: 'Total Liabilities + Equity',
                value:
                  reportData.totals?.current?.totalLiabilitiesAndEquity || 0,
              },
            ],
          },
        ],
      };

    case 'cash-flow':
      return {
        sections: [
          {
            title: 'Operating Activities',
            items: [
              {
                label: 'Cash from Sales',
                value:
                  reportData.operatingActivities?.current?.cashFromSales || 0,
              },
              {
                label: 'Cash for Inventory',
                value:
                  reportData.operatingActivities?.current?.cashForInventory ||
                  0,
              },
              {
                label: 'Cash for Expenses',
                value:
                  reportData.operatingActivities?.current?.cashForExpenses || 0,
              },
              {
                label: 'Net Operating Cash',
                value: reportData.operatingActivities?.current?.total || 0,
              },
            ],
          },
          {
            title: 'Investing Activities',
            items: [
              {
                label: 'Asset Purchases',
                value:
                  reportData.investingActivities?.current?.assetPurchases || 0,
              },
              {
                label: 'Net Investing Cash',
                value: reportData.investingActivities?.current?.total || 0,
              },
            ],
          },
          {
            title: 'Financing Activities',
            items: [
              {
                label: 'Owner Drawings',
                value:
                  reportData.financingActivities?.current?.ownerDrawings || 0,
              },
              {
                label: 'Net Financing Cash',
                value: reportData.financingActivities?.current?.total || 0,
              },
            ],
          },
          {
            title: 'Cash Summary',
            items: [
              {
                label: 'Beginning Cash',
                value: reportData.cashBalances?.current?.beginning || 0,
              },
              {
                label: 'Net Change',
                value: reportData.netCashFlow?.current || 0,
              },
              {
                label: 'Ending Cash',
                value: reportData.cashBalances?.current?.ending || 0,
              },
            ],
          },
        ],
      };

    default:
      return { sections: [] };
  }
}

function getExcelSheets(reportType: string, reportData: any) {
  const sheets: any = {};

  switch (reportType) {
    case 'income-statement':
      sheets['Income Statement'] = {
        headers: ['Description', 'Amount', 'Percentage'],
        rows: [
          ...Object.entries(reportData.revenue?.current?.byType || {}).map(
            ([type, data]: [string, any]) => [
              `Revenue - ${type}`,
              data.amount,
              '',
            ]
          ),
          ['Total Revenue', reportData.revenue?.current?.total || 0, '100%'],
          ['', '', ''],
          [
            'Cost of Goods Sold',
            reportData.costOfGoodsSold?.current?.total || 0,
            '',
          ],
          [
            'Gross Profit',
            reportData.grossProfit?.current || 0,
            `${reportData.margins?.grossMargin || 0}%`,
          ],
          ['', '', ''],
          ...Object.entries(
            reportData.operatingExpenses?.current?.byCategory || {}
          ).map(([category, data]: [string, any]) => [
            category,
            data.amount,
            '',
          ]),
          [
            'Total Operating Expenses',
            reportData.operatingExpenses?.current?.total || 0,
            '',
          ],
          ['', '', ''],
          [
            'Net Income',
            reportData.netIncome?.current || 0,
            `${reportData.margins?.netMargin || 0}%`,
          ],
        ],
      };
      break;

    case 'balance-sheet':
      sheets['Balance Sheet'] = {
        headers: ['Account', 'Amount'],
        rows: [
          ['ASSETS', ''],
          ['Current Assets:', ''],
          [
            '  Inventory',
            reportData.assets?.current?.currentAssets?.inventory || 0,
          ],
          [
            '  Receivables',
            reportData.assets?.current?.currentAssets?.totalReceivables || 0,
          ],
          [
            'Total Current Assets',
            reportData.assets?.current?.totalCurrentAssets || 0,
          ],
          ['', ''],
          ['Fixed Assets:', ''],
          ...Object.entries(reportData.assets?.current?.fixedAssets || {}).map(
            ([category, data]: [string, any]) => [`  ${category}`, data.value]
          ),
          [
            'Total Fixed Assets',
            reportData.assets?.current?.totalFixedAssets || 0,
          ],
          ['', ''],
          ['TOTAL ASSETS', reportData.totals?.current?.totalAssets || 0],
          ['', ''],
          ['LIABILITIES', ''],
          ...Object.entries(
            reportData.liabilities?.current?.byCategory || {}
          ).map(([category, data]: [string, any]) => [category, data.amount]),
          ['Total Liabilities', reportData.liabilities?.current?.total || 0],
          ['', ''],
          ['EQUITY', ''],
          ['Initial Capital', reportData.equity?.current?.initialCapital || 0],
          [
            'Retained Earnings',
            reportData.equity?.current?.retainedEarnings || 0,
          ],
          ['Owner Drawings', -(reportData.equity?.current?.ownerDrawings || 0)],
          ['Total Equity', reportData.equity?.current?.total || 0],
          ['', ''],
          [
            'TOTAL LIABILITIES + EQUITY',
            reportData.totals?.current?.totalLiabilitiesAndEquity || 0,
          ],
        ],
      };
      break;

    case 'cash-flow':
      sheets['Cash Flow'] = {
        headers: ['Activity', 'Amount'],
        rows: [
          ['OPERATING ACTIVITIES', ''],
          [
            'Cash from Sales',
            reportData.operatingActivities?.current?.cashFromSales || 0,
          ],
          [
            'Cash for Inventory',
            reportData.operatingActivities?.current?.cashForInventory || 0,
          ],
          [
            'Cash for Expenses',
            reportData.operatingActivities?.current?.cashForExpenses || 0,
          ],
          [
            'Receivables Change',
            reportData.operatingActivities?.current?.receivablesChange || 0,
          ],
          [
            'Net Operating Cash Flow',
            reportData.operatingActivities?.current?.total || 0,
          ],
          ['', ''],
          ['INVESTING ACTIVITIES', ''],
          [
            'Asset Purchases',
            reportData.investingActivities?.current?.assetPurchases || 0,
          ],
          [
            'Asset Sales',
            reportData.investingActivities?.current?.assetSales || 0,
          ],
          [
            'Net Investing Cash Flow',
            reportData.investingActivities?.current?.total || 0,
          ],
          ['', ''],
          ['FINANCING ACTIVITIES', ''],
          [
            'Capital Contributions',
            reportData.financingActivities?.current?.capitalContributions || 0,
          ],
          [
            'Loan Proceeds',
            reportData.financingActivities?.current?.loanProceeds || 0,
          ],
          [
            'Owner Drawings',
            reportData.financingActivities?.current?.ownerDrawings || 0,
          ],
          [
            'Net Financing Cash Flow',
            reportData.financingActivities?.current?.total || 0,
          ],
          ['', ''],
          ['NET CHANGE IN CASH', reportData.netCashFlow?.current || 0],
          [
            'Beginning Cash Balance',
            reportData.cashBalances?.current?.beginning || 0,
          ],
          [
            'Ending Cash Balance',
            reportData.cashBalances?.current?.ending || 0,
          ],
        ],
      };
      break;
  }

  return sheets;
}

function getCSVData(reportType: string, reportData: any) {
  switch (reportType) {
    case 'income-statement':
      return {
        headers: ['Description', 'Amount', 'Percentage'],
        rows: [
          ['Total Revenue', reportData.revenue?.current?.total || 0, '100%'],
          [
            'Cost of Goods Sold',
            reportData.costOfGoodsSold?.current?.total || 0,
            '',
          ],
          [
            'Gross Profit',
            reportData.grossProfit?.current || 0,
            `${reportData.margins?.grossMargin || 0}%`,
          ],
          [
            'Total Operating Expenses',
            reportData.operatingExpenses?.current?.total || 0,
            '',
          ],
          [
            'Net Income',
            reportData.netIncome?.current || 0,
            `${reportData.margins?.netMargin || 0}%`,
          ],
        ],
      };

    case 'balance-sheet':
      return {
        headers: ['Account', 'Amount'],
        rows: [
          ['Total Assets', reportData.totals?.current?.totalAssets || 0],
          ['Total Liabilities', reportData.liabilities?.current?.total || 0],
          ['Total Equity', reportData.equity?.current?.total || 0],
          [
            'Total Liabilities + Equity',
            reportData.totals?.current?.totalLiabilitiesAndEquity || 0,
          ],
        ],
      };

    case 'cash-flow':
      return {
        headers: ['Activity', 'Amount'],
        rows: [
          [
            'Operating Cash Flow',
            reportData.operatingActivities?.current?.total || 0,
          ],
          [
            'Investing Cash Flow',
            reportData.investingActivities?.current?.total || 0,
          ],
          [
            'Financing Cash Flow',
            reportData.financingActivities?.current?.total || 0,
          ],
          ['Net Cash Flow', reportData.netCashFlow?.current || 0],
          ['Beginning Cash', reportData.cashBalances?.current?.beginning || 0],
          ['Ending Cash', reportData.cashBalances?.current?.ending || 0],
        ],
      };

    default:
      return { headers: [], rows: [] };
  }
}
