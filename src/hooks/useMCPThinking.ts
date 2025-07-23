import { useState, useCallback } from 'react';
import { LPGBusinessThinking, MCPBusinessAnalytics, MCPProblemSolver, SequentialThinkingResult } from '@/lib/mcp';

export function useLPGBusinessThinking() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SequentialThinkingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzer = new LPGBusinessThinking();

  const analyzeInventory = useCallback(async (
    packageSales: number,
    refillSales: number,
    currentFull: number,
    currentEmpty: number,
    packagePurchases: number,
    refillPurchases: number
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await analyzer.analyzeInventoryCalculation(
        packageSales,
        refillSales,
        currentFull,
        currentEmpty,
        packagePurchases,
        refillPurchases
      );
      setResult(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzer]);

  const analyzeReceivables = useCallback(async (
    currentCashReceivables: number,
    currentCylinderReceivables: number,
    driverSalesRevenue: number,
    cashDeposits: number,
    discounts: number,
    driverRefillSales: number,
    cylinderDeposits: number
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await analyzer.analyzeReceivablesCalculation(
        currentCashReceivables,
        currentCylinderReceivables,
        driverSalesRevenue,
        cashDeposits,
        discounts,
        driverRefillSales,
        cylinderDeposits
      );
      setResult(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzer]);

  const analyzeFinancialReport = useCallback(async (
    reportType: 'income' | 'balance' | 'cashflow',
    dateRange: { start: Date; end: Date },
    tenantId: string
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await analyzer.analyzeFinancialReportGeneration(reportType, dateRange, tenantId);
      setResult(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzer]);

  return {
    isProcessing,
    result,
    error,
    analyzeInventory,
    analyzeReceivables,
    analyzeFinancialReport,
    clearResult: () => setResult(null),
    clearError: () => setError(null),
  };
}

export function useBusinessAnalytics() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SequentialThinkingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analytics = new MCPBusinessAnalytics();

  const analyzeDriverPerformance = useCallback(async (
    driverId: string,
    salesData: Array<{
      date: Date;
      packageSales: number;
      refillSales: number;
      revenue: number;
      cashDeposits: number;
    }>,
    targetMetrics: {
      dailyPackageTarget: number;
      dailyRefillTarget: number;
      dailyRevenueTarget: number;
    }
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await analytics.analyzeDriverPerformance(driverId, salesData, targetMetrics);
      setResult(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [analytics]);

  return {
    isProcessing,
    result,
    error,
    analyzeDriverPerformance,
    clearResult: () => setResult(null),
    clearError: () => setError(null),
  };
}

export function useProblemSolver() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SequentialThinkingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solver = new MCPProblemSolver();

  const diagnoseDataInconsistency = useCallback(async (issue: {
    type: 'inventory_mismatch' | 'receivables_discrepancy' | 'financial_imbalance' | 'multi_tenant_leak';
    description: string;
    affectedTenantId: string;
    reportedValues: Record<string, any>;
    expectedValues: Record<string, any>;
  }) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const analysis = await solver.diagnoseDataInconsistency(issue);
      setResult(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [solver]);

  return {
    isProcessing,
    result,
    error,
    diagnoseDataInconsistency,
    clearResult: () => setResult(null),
    clearError: () => setError(null),
  };
}