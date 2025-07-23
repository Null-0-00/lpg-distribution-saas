import {
  DailySales,
  MonthlyInventory,
  Driver,
  Product,
  Company,
} from '@prisma/client';

export interface MonthlyReportData {
  company: Company;
  period: {
    month: number;
    year: number;
    startDate: Date;
    endDate: Date;
  };
  salesSummary: {
    totalSales: number;
    totalRevenue: number;
    totalQuantity: number;
    totalCashCollected: number;
    avgDailySales: number;
  };
  topDrivers: Array<{
    driver: Driver;
    totalSales: number;
    totalRevenue: number;
  }>;
  inventoryStatus: {
    currentStock: Array<{
      product: Product;
      fullCylinders: number;
      emptyCylinders: number;
    }>;
    lowStockAlerts: number;
  };
  financialMetrics: {
    grossProfit: number;
    netProfit: number;
    receivablesBalance: number;
    expensesTotal: number;
  };
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendMonthlyReport(
    reportData: MonthlyReportData,
    recipients: string[]
  ): Promise<boolean> {
    try {
      const htmlContent = this.generateMonthlyReportHTML(reportData);
      const subject = `Monthly Business Report - ${this.getMonthName(reportData.period.month)} ${reportData.period.year}`;

      const emailData = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: recipients,
        subject,
        html: htmlContent,
        attachments: await this.generateReportAttachments(reportData),
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Failed to send monthly report:', error);
      return false;
    }
  }

  private generateMonthlyReportHTML(data: MonthlyReportData): string {
    const {
      company,
      period,
      salesSummary,
      topDrivers,
      inventoryStatus,
      financialMetrics,
    } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Business Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .section { padding: 25px; border-bottom: 1px solid #eee; }
    .section:last-child { border-bottom: none; }
    .section h2 { color: #0ea5e9; margin-bottom: 20px; font-size: 22px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #0ea5e9; }
    .metric-value { font-size: 24px; font-weight: bold; color: #0ea5e9; margin-bottom: 5px; }
    .metric-label { color: #64748b; font-size: 14px; }
    .driver-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .driver-table th, .driver-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .driver-table th { background: #f1f5f9; color: #374151; font-weight: 600; }
    .inventory-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .alert.warning { background: #fffbeb; border-color: #fcd34d; }
    .alert.success { background: #f0fdf4; border-color: #86efac; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    .logo { max-width: 150px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Monthly Business Report</h1>
      <p>${company.name} - ${this.getMonthName(period.month)} ${period.year}</p>
      <p>Report Period: ${period.startDate.toLocaleDateString()} to ${period.endDate.toLocaleDateString()}</p>
    </div>

    <!-- Sales Performance -->
    <div class="section">
      <h2>📈 Sales Performance</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${salesSummary.totalSales}</div>
          <div class="metric-label">Total Sales Entries</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${salesSummary.totalQuantity}</div>
          <div class="metric-label">Cylinders Sold</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">৳${salesSummary.totalRevenue.toLocaleString()}</div>
          <div class="metric-label">Total Revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">৳${salesSummary.totalCashCollected.toLocaleString()}</div>
          <div class="metric-label">Cash Collected</div>
        </div>
      </div>
      <p><strong>Average Daily Sales:</strong> ${salesSummary.avgDailySales.toFixed(1)} cylinders per day</p>
    </div>

    <!-- Top Drivers -->
    <div class="section">
      <h2>🏆 Top Performing Drivers</h2>
      <table class="driver-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Driver Name</th>
            <th>Total Sales</th>
            <th>Revenue Generated</th>
            <th>Avg. per Sale</th>
          </tr>
        </thead>
        <tbody>
          ${topDrivers
            .map(
              (driver, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${driver.driver.name}</td>
              <td>${driver.totalSales}</td>
              <td>৳${driver.totalRevenue.toLocaleString()}</td>
              <td>৳${(driver.totalRevenue / driver.totalSales).toFixed(0)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Inventory Status -->
    <div class="section">
      <h2>📦 Inventory Status</h2>
      ${
        inventoryStatus.lowStockAlerts > 0
          ? `
        <div class="alert warning">
          <strong>⚠️ Low Stock Alert:</strong> ${inventoryStatus.lowStockAlerts} products are below minimum threshold.
        </div>
      `
          : `
        <div class="alert success">
          <strong>✅ Inventory Status:</strong> All products are adequately stocked.
        </div>
      `
      }
      
      <h3>Current Stock Levels:</h3>
      ${inventoryStatus.currentStock
        .map(
          (item) => `
        <div class="inventory-item">
          <span><strong>${item.product.name} (${item.product.size}L)</strong></span>
          <span>Full: ${item.fullCylinders} | Empty: ${item.emptyCylinders}</span>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Financial Summary -->
    <div class="section">
      <h2>💰 Financial Summary</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">৳${financialMetrics.grossProfit.toLocaleString()}</div>
          <div class="metric-label">Gross Profit</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">৳${financialMetrics.netProfit.toLocaleString()}</div>
          <div class="metric-label">Net Profit</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">৳${financialMetrics.receivablesBalance.toLocaleString()}</div>
          <div class="metric-label">Receivables Balance</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">৳${financialMetrics.expensesTotal.toLocaleString()}</div>
          <div class="metric-label">Total Expenses</div>
        </div>
      </div>
      
      <p><strong>Profit Margin:</strong> ${((financialMetrics.netProfit / salesSummary.totalRevenue) * 100).toFixed(1)}%</p>
    </div>

    <!-- Key Insights -->
    <div class="section">
      <h2>💡 Key Insights & Recommendations</h2>
      <ul>
        ${this.generateInsights(data)
          .map((insight) => `<li>${insight}</li>`)
          .join('')}
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This report was automatically generated by LPG Distributor SaaS</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <p>© 2024 LPG Distributor Management System</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private generateInsights(data: MonthlyReportData): string[] {
    const insights: string[] = [];
    const { salesSummary, topDrivers, inventoryStatus, financialMetrics } =
      data;

    // Sales insights
    if (salesSummary.avgDailySales > 20) {
      insights.push(
        '🎯 Excellent daily sales performance - maintaining strong market presence'
      );
    } else if (salesSummary.avgDailySales < 10) {
      insights.push(
        '⚠️ Consider reviewing sales strategies to improve daily performance'
      );
    }

    // Driver performance insights
    if (topDrivers.length > 0) {
      const topDriver = topDrivers[0];
      insights.push(
        `🏆 ${topDriver.driver.name} leads with ${topDriver.totalSales} sales - consider recognizing top performers`
      );
    }

    // Inventory insights
    if (inventoryStatus.lowStockAlerts > 0) {
      insights.push(
        `📦 ${inventoryStatus.lowStockAlerts} products need restocking - plan inventory replenishment`
      );
    }

    // Financial insights
    const profitMargin =
      (financialMetrics.netProfit / salesSummary.totalRevenue) * 100;
    if (profitMargin > 15) {
      insights.push(
        '💰 Strong profit margins indicate healthy business operations'
      );
    } else if (profitMargin < 5) {
      insights.push('💡 Consider optimizing costs to improve profit margins');
    }

    // Receivables insights
    const receivablesRatio =
      (financialMetrics.receivablesBalance / salesSummary.totalRevenue) * 100;
    if (receivablesRatio > 20) {
      insights.push(
        '🔄 High receivables balance - focus on collection strategies'
      );
    }

    return insights;
  }

  private async generateReportAttachments(
    data: MonthlyReportData
  ): Promise<any[]> {
    // Generate CSV export of sales data
    const csvData = this.generateSalesCSV(data);

    return [
      {
        filename: `sales-report-${data.period.month}-${data.period.year}.csv`,
        content: csvData,
        contentType: 'text/csv',
      },
    ];
  }

  private generateSalesCSV(data: MonthlyReportData): string {
    const headers = ['Metric', 'Value'];

    const rows = [
      ['Total Sales', data.salesSummary.totalSales.toString()],
      ['Total Revenue', data.salesSummary.totalRevenue.toString()],
      ['Total Quantity', data.salesSummary.totalQuantity.toString()],
      ['Cash Collected', data.salesSummary.totalCashCollected.toString()],
      ['Average Daily Sales', data.salesSummary.avgDailySales.toFixed(1)],
      ['Gross Profit', data.financialMetrics.grossProfit.toString()],
      ['Net Profit', data.financialMetrics.netProfit.toString()],
      [
        'Receivables Balance',
        data.financialMetrics.receivablesBalance.toString(),
      ],
      ['Total Expenses', data.financialMetrics.expensesTotal.toString()],
    ];

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  }

  private async sendEmail(emailData: any): Promise<boolean> {
    // In a real implementation, this would use a service like:
    // - Nodemailer with SMTP
    // - SendGrid API
    // - AWS SES
    // - Resend API

    console.log('Email would be sent with configuration:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachments: emailData.attachments?.length > 0,
    });

    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success rate simulation
      }, 1000);
    });
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }
}

export async function getEmailConfig(): Promise<EmailConfig> {
  // In production, these would come from environment variables
  return {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@lpgdistributor.com',
    fromName: process.env.FROM_NAME || 'LPG Distributor System',
  };
}
