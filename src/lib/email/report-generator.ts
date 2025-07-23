import { PrismaClient } from '@prisma/client';
import { MonthlyReportData } from './email-service';

const prisma = new PrismaClient();

export class ReportGenerator {
  async generateMonthlyReport(
    tenantId: string,
    year: number,
    month: number
  ): Promise<MonthlyReportData> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: tenantId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Generate all report sections
    const [salesSummary, topDrivers, inventoryStatus, financialMetrics] =
      await Promise.all([
        this.generateSalesSummary(tenantId, startDate, endDate),
        this.generateTopDrivers(tenantId, startDate, endDate),
        this.generateInventoryStatus(tenantId),
        this.generateFinancialMetrics(tenantId, startDate, endDate),
      ]);

    return {
      company,
      period: {
        month,
        year,
        startDate,
        endDate,
      },
      salesSummary,
      topDrivers,
      inventoryStatus,
      financialMetrics,
    };
  }

  private async generateSalesSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    const salesData = await prisma.dailySales.findMany({
      where: {
        tenantId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        driver: true,
        product: true,
      },
    });

    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce(
      (sum, sale) => sum + sale.netValue,
      0
    );
    const totalQuantity = salesData.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );
    const totalCashCollected = salesData.reduce(
      (sum, sale) => sum + sale.cashDeposited,
      0
    );

    // Calculate average daily sales
    const daysInMonth = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgDailySales = totalQuantity / daysInMonth;

    return {
      totalSales,
      totalRevenue,
      totalQuantity,
      totalCashCollected,
      avgDailySales,
    };
  }

  private async generateTopDrivers(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    const driverSales = await prisma.dailySales.groupBy({
      by: ['driverId'],
      where: {
        tenantId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        netValue: true,
      },
    });

    // Get driver details and format data
    const topDriversData = await Promise.all(
      driverSales
        .sort((a, b) => (b._count.id || 0) - (a._count.id || 0))
        .slice(0, 5)
        .map(async (driverSale) => {
          const driver = await prisma.driver.findUnique({
            where: { id: driverSale.driverId },
          });

          return {
            driver: driver!,
            totalSales: driverSale._count.id || 0,
            totalRevenue: driverSale._sum.netRevenue || 0,
          };
        })
    );

    return topDriversData;
  }

  private async generateInventoryStatus(tenantId: string) {
    const inventoryData = await prisma.inventoryRecord.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      take: 10, // Get recent records for each product
    });

    const currentStock = inventoryData.map((inventory) => ({
      productId: inventory.productId,
      fullCylinders: inventory.fullCylinders,
      emptyCylinders: inventory.emptyCylinders,
    }));

    // Calculate low stock alerts (products with less than 10 full cylinders)
    const lowStockAlerts = currentStock.filter(
      (stock) => stock.fullCylinders < 10
    ).length;

    return {
      currentStock,
      lowStockAlerts,
    };
  }

  private async generateFinancialMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Get sales revenue
    const salesRevenue = await prisma.dailySales.aggregate({
      where: {
        tenantId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        netRevenue: true,
        totalRevenue: true,
      },
    });

    // Get expenses
    const expenses = await prisma.expense.aggregate({
      where: {
        tenantId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        isApproved: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Get current receivables balance
    const receivables = await prisma.receivableRecord.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      take: 1,
    });

    const totalRevenue = salesRevenue._sum.netRevenue || 0;
    const expensesTotal = expenses._sum.amount || 0;
    const grossProfit = totalRevenue * 0.25; // Assuming 25% margin
    const netProfit = grossProfit - expensesTotal;
    const receivablesBalance =
      receivables.length > 0
        ? receivables[0].totalCashReceivables +
          receivables[0].totalCylinderReceivables
        : 0;

    return {
      grossProfit,
      netProfit,
      receivablesBalance,
      expensesTotal,
    };
  }
}

export async function generateAndEmailMonthlyReports() {
  const generator = new ReportGenerator();

  // Get all active companies
  const companies = await prisma.company.findMany({
    where: { isActive: true },
  });

  const currentDate = new Date();
  const lastMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
  const year =
    currentDate.getMonth() === 0
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear();

  for (const company of companies) {
    try {
      // Generate report
      const reportData = await generator.generateMonthlyReport(
        company.id,
        year,
        lastMonth
      );

      // Get admin users for this company
      const adminUsers = await prisma.user.findMany({
        where: {
          tenantId: company.id,
          role: 'ADMIN',
          isActive: true,
          email: { not: null },
        },
      });

      const recipients = adminUsers
        .map((user) => user.email)
        .filter((email) => email !== null) as string[];

      if (recipients.length > 0) {
        // Email service would be called here
        console.log(`Monthly report generated for ${company.name}`, {
          recipients: recipients.length,
          period: `${lastMonth}/${year}`,
          totalSales: reportData.salesSummary.totalSales,
          totalRevenue: reportData.salesSummary.totalRevenue,
        });
      }
    } catch (error) {
      console.error(`Failed to generate report for ${company.name}:`, error);
    }
  }
}
