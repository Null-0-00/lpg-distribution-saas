import {
  SequentialThinkingProcessor,
  SequentialThinkingResult,
} from './sequential-thinking';

export class MCPBusinessAnalytics extends SequentialThinkingProcessor {
  constructor() {
    super(25);
  }

  async analyzeDriverPerformance(
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
  ): Promise<SequentialThinkingResult> {
    this.reset();
    this.setContext(`Driver Performance Analysis: ${driverId}`);

    this.addThought({
      thought: `Analyzing performance for driver ${driverId} with ${salesData.length} days of data against targets: Package ${targetMetrics.dailyPackageTarget}, Refill ${targetMetrics.dailyRefillTarget}, Revenue ${targetMetrics.dailyRevenueTarget}`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 12,
    });

    const totalPackageSales = salesData.reduce(
      (sum, day) => sum + day.packageSales,
      0
    );
    const totalRefillSales = salesData.reduce(
      (sum, day) => sum + day.refillSales,
      0
    );
    const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
    const totalCashDeposits = salesData.reduce(
      (sum, day) => sum + day.cashDeposits,
      0
    );

    this.addThought({
      thought: `Total performance: Package Sales: ${totalPackageSales}, Refill Sales: ${totalRefillSales}, Revenue: ${totalRevenue}, Cash Deposits: ${totalCashDeposits}`,
      nextThoughtNeeded: true,
      thoughtNumber: 2,
      totalThoughts: 12,
    });

    const avgPackagePerDay = totalPackageSales / salesData.length;
    const avgRefillPerDay = totalRefillSales / salesData.length;
    const avgRevenuePerDay = totalRevenue / salesData.length;

    this.addThought({
      thought: `Daily averages: Package: ${avgPackagePerDay.toFixed(2)}, Refill: ${avgRefillPerDay.toFixed(2)}, Revenue: ${avgRevenuePerDay.toFixed(2)}`,
      nextThoughtNeeded: true,
      thoughtNumber: 3,
      totalThoughts: 12,
    });

    const packagePerformanceRatio =
      avgPackagePerDay / targetMetrics.dailyPackageTarget;
    const refillPerformanceRatio =
      avgRefillPerDay / targetMetrics.dailyRefillTarget;
    const revenuePerformanceRatio =
      avgRevenuePerDay / targetMetrics.dailyRevenueTarget;

    this.addThought({
      thought: `Performance ratios vs targets: Package ${(packagePerformanceRatio * 100).toFixed(1)}%, Refill ${(refillPerformanceRatio * 100).toFixed(1)}%, Revenue ${(revenuePerformanceRatio * 100).toFixed(1)}%`,
      nextThoughtNeeded: true,
      thoughtNumber: 4,
      totalThoughts: 12,
    });

    const consistencyScore = this.calculateConsistencyScore(salesData);
    this.addThought({
      thought: `Consistency analysis: Score ${consistencyScore.toFixed(2)} (0-1 scale, higher is more consistent)`,
      nextThoughtNeeded: true,
      thoughtNumber: 5,
      totalThoughts: 12,
    });

    const cashCollectionRatio = totalCashDeposits / totalRevenue;
    this.addThought({
      thought: `Cash collection efficiency: ${(cashCollectionRatio * 100).toFixed(1)}% of revenue collected as cash deposits`,
      nextThoughtNeeded: true,
      thoughtNumber: 6,
      totalThoughts: 12,
    });

    const strongestArea = this.identifyStrongestPerformanceArea(
      packagePerformanceRatio,
      refillPerformanceRatio,
      revenuePerformanceRatio
    );
    const weakestArea = this.identifyWeakestPerformanceArea(
      packagePerformanceRatio,
      refillPerformanceRatio,
      revenuePerformanceRatio
    );

    this.addThought({
      thought: `Performance assessment: Strongest area: ${strongestArea}, Weakest area: ${weakestArea}`,
      nextThoughtNeeded: true,
      thoughtNumber: 7,
      totalThoughts: 12,
    });

    const recommendations = this.generatePerformanceRecommendations(
      packagePerformanceRatio,
      refillPerformanceRatio,
      revenuePerformanceRatio,
      cashCollectionRatio
    );
    this.addThought({
      thought: `Generated ${recommendations.length} recommendations for improvement`,
      nextThoughtNeeded: true,
      thoughtNumber: 8,
      totalThoughts: 12,
    });

    const trendAnalysis = this.analyzeTrends(salesData);
    this.addThought({
      thought: `Trend analysis: ${trendAnalysis.direction} trend with ${trendAnalysis.strength} strength over ${salesData.length} days`,
      nextThoughtNeeded: true,
      thoughtNumber: 9,
      totalThoughts: 12,
    });

    const overallRating = this.calculateOverallRating(
      packagePerformanceRatio,
      refillPerformanceRatio,
      revenuePerformanceRatio,
      consistencyScore
    );
    this.addThought({
      thought: `Overall performance rating: ${overallRating}/10 based on target achievement, consistency, and cash collection`,
      nextThoughtNeeded: true,
      thoughtNumber: 10,
      totalThoughts: 12,
    });

    const result = {
      driverId,
      period: {
        start: salesData[0]?.date,
        end: salesData[salesData.length - 1]?.date,
        totalDays: salesData.length,
      },
      performance: {
        totals: {
          totalPackageSales,
          totalRefillSales,
          totalRevenue,
          totalCashDeposits,
        },
        averages: { avgPackagePerDay, avgRefillPerDay, avgRevenuePerDay },
        ratios: {
          packagePerformanceRatio,
          refillPerformanceRatio,
          revenuePerformanceRatio,
          cashCollectionRatio,
        },
        consistency: consistencyScore,
        overallRating,
      },
      insights: {
        strongestArea,
        weakestArea,
        recommendations,
        trendAnalysis,
      },
    };

    this.addThought({
      thought: `Analysis complete: Driver performance comprehensively evaluated with actionable insights and specific recommendations`,
      nextThoughtNeeded: false,
      thoughtNumber: 11,
      totalThoughts: 12,
    });

    const exportResult = this.export();
    return {
      ...exportResult,
      finalResult: result,
    };
  }

  private calculateConsistencyScore(
    salesData: Array<{ revenue: number }>
  ): number {
    if (salesData.length < 2) return 1;

    const revenues = salesData.map((d) => d.revenue);
    const mean = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
    const variance =
      revenues.reduce((sum, rev) => sum + Math.pow(rev - mean, 2), 0) /
      revenues.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

  private identifyStrongestPerformanceArea(
    packageRatio: number,
    refillRatio: number,
    revenueRatio: number
  ): string {
    const ratios = {
      Package: packageRatio,
      Refill: refillRatio,
      Revenue: revenueRatio,
    };
    return Object.entries(ratios).reduce((a, b) =>
      ratios[a[0] as keyof typeof ratios] > ratios[b[0] as keyof typeof ratios]
        ? a
        : b
    )[0];
  }

  private identifyWeakestPerformanceArea(
    packageRatio: number,
    refillRatio: number,
    revenueRatio: number
  ): string {
    const ratios = {
      Package: packageRatio,
      Refill: refillRatio,
      Revenue: revenueRatio,
    };
    return Object.entries(ratios).reduce((a, b) =>
      ratios[a[0] as keyof typeof ratios] < ratios[b[0] as keyof typeof ratios]
        ? a
        : b
    )[0];
  }

  private generatePerformanceRecommendations(
    packageRatio: number,
    refillRatio: number,
    revenueRatio: number,
    cashRatio: number
  ): string[] {
    const recommendations: string[] = [];

    if (packageRatio < 0.8)
      recommendations.push(
        'Focus on increasing package sales through customer acquisition'
      );
    if (refillRatio < 0.8)
      recommendations.push(
        'Improve refill sales by strengthening customer relationships'
      );
    if (revenueRatio < 0.8)
      recommendations.push(
        'Review pricing strategy and upselling opportunities'
      );
    if (cashRatio < 0.7)
      recommendations.push(
        'Improve cash collection processes and payment terms'
      );

    return recommendations;
  }

  private analyzeTrends(salesData: Array<{ date: Date; revenue: number }>): {
    direction: string;
    strength: string;
  } {
    if (salesData.length < 3)
      return { direction: 'insufficient data', strength: 'none' };

    const firstHalf = salesData.slice(0, Math.floor(salesData.length / 2));
    const secondHalf = salesData.slice(Math.floor(salesData.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;

    const change = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

    let direction: string;
    let strength: string;

    if (Math.abs(change) < 0.05) direction = 'stable';
    else if (change > 0) direction = 'improving';
    else direction = 'declining';

    if (Math.abs(change) < 0.1) strength = 'weak';
    else if (Math.abs(change) < 0.25) strength = 'moderate';
    else strength = 'strong';

    return { direction, strength };
  }

  private calculateOverallRating(
    packageRatio: number,
    refillRatio: number,
    revenueRatio: number,
    consistency: number
  ): number {
    const avgPerformance = (packageRatio + refillRatio + revenueRatio) / 3;
    const weightedScore = avgPerformance * 0.7 + consistency * 0.3;
    return Math.round(Math.min(10, Math.max(0, weightedScore * 10)) * 10) / 10;
  }
}
