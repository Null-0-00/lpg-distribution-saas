import { NextRequest, NextResponse } from 'next/server';
import {
  LPGBusinessThinking,
  MCPBusinessAnalytics,
  MCPProblemSolver,
} from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const { testType, params } = await request.json();

    switch (testType) {
      case 'inventory':
        const lpgThinking = new LPGBusinessThinking();
        const inventoryResult = await lpgThinking.analyzeInventoryCalculation(
          params.packageSales || 10,
          params.refillSales || 20,
          params.currentFull || 100,
          params.currentEmpty || 50,
          params.packagePurchases || 30,
          params.refillPurchases || 40
        );
        return NextResponse.json(inventoryResult);

      case 'receivables':
        const receivablesThinking = new LPGBusinessThinking();
        const receivablesResult =
          await receivablesThinking.analyzeReceivablesCalculation(
            params.currentCashReceivables || 5000,
            params.currentCylinderReceivables || 2000,
            params.driverSalesRevenue || 8000,
            params.cashDeposits || 6000,
            params.discounts || 200,
            params.driverRefillSales || 3000,
            params.cylinderDeposits || 2500
          );
        return NextResponse.json(receivablesResult);

      case 'analytics':
        const analytics = new MCPBusinessAnalytics();
        const analyticsResult = await analytics.analyzeDriverPerformance(
          params.driverId || 'driver-123',
          params.salesData || [
            {
              date: new Date(),
              packageSales: 10,
              refillSales: 15,
              revenue: 2500,
              cashDeposits: 2000,
            },
            {
              date: new Date(),
              packageSales: 12,
              refillSales: 18,
              revenue: 3000,
              cashDeposits: 2500,
            },
          ],
          params.targetMetrics || {
            dailyPackageTarget: 15,
            dailyRefillTarget: 20,
            dailyRevenueTarget: 3500,
          }
        );
        return NextResponse.json(analyticsResult);

      case 'problem-solving':
        const problemSolver = new MCPProblemSolver();
        const problemResult = await problemSolver.diagnoseDataInconsistency(
          params.issue || {
            type: 'inventory_mismatch',
            description: 'Cylinder count discrepancy detected',
            affectedTenantId: 'tenant-123',
            reportedValues: { fullCylinders: 95, emptyCylinders: 45 },
            expectedValues: { fullCylinders: 100, emptyCylinders: 50 },
          }
        );
        return NextResponse.json(problemResult);

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('MCP test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MCP Sequential Thinking Test Endpoint',
    availableTests: [
      'inventory',
      'receivables',
      'analytics',
      'problem-solving',
    ],
    usage: 'POST with { testType: string, params?: object }',
  });
}
