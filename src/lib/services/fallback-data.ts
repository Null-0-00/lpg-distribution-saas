// Consolidated fallback data service to prevent duplication and ensure consistency

export interface Driver {
  id: number;
  name: string;
  phone: string;
  status: 'active' | 'on_break' | 'inactive';
  todaySales: number;
  totalRevenue: number;
  area: string;
  rating: number;
}

export interface LiveDataPoint {
  id: string;
  type: 'sale' | 'payment' | 'stock' | 'alert' | 'driver';
  message: string;
  value?: number;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  driverName?: string;
  location?: string;
}

export interface TrendData {
  period: string;
  sales: number;
  revenue: number;
  drivers: number;
  efficiency: number;
}

export interface DashboardAnalytics {
  weekSalesData: number[];
  topDrivers: Array<{
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  alerts: Array<{
    type: string;
    priority: string;
    message: string;
    timestamp: string;
    category: string;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    amount?: number;
  }>;
  performanceMetrics: {
    salesTrend: string;
    totalWeekSales: number;
    avgDailySales: number;
  };
}

export class FallbackDataService {
  // Static driver data used across components
  static readonly DRIVERS: Driver[] = [
    { 
      id: 1, 
      name: 'Rahman Ali', 
      phone: '+880 1712-345678', 
      status: 'active', 
      todaySales: 15, 
      totalRevenue: 7500, 
      area: 'Dhanmondi',
      rating: 4.8
    },
    { 
      id: 2, 
      name: 'Karim Hassan', 
      phone: '+880 1812-345679', 
      status: 'active', 
      todaySales: 12, 
      totalRevenue: 6000, 
      area: 'Gulshan',
      rating: 4.6
    },
    { 
      id: 3, 
      name: 'Hasan Ahmed', 
      phone: '+880 1912-345680', 
      status: 'on_break', 
      todaySales: 8, 
      totalRevenue: 4000, 
      area: 'Uttara',
      rating: 4.5
    },
    { 
      id: 4, 
      name: 'Ali Rahman', 
      phone: '+880 1512-345681', 
      status: 'active', 
      todaySales: 10, 
      totalRevenue: 5000, 
      area: 'Banani',
      rating: 4.7
    },
  ];

  static readonly LOCATIONS = ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur'];

  // Static live data feed
  static readonly LIVE_DATA_FEED: LiveDataPoint[] = [
    {
      id: '1',
      type: 'sale',
      message: 'New sale: 3 cylinders sold',
      value: 1500,
      timestamp: '2024-01-15T10:00:00.000Z',
      priority: 'medium',
      driverName: 'Rahman Ali',
      location: 'Dhanmondi'
    },
    {
      id: '2',
      type: 'payment',
      message: 'Payment received: ৳2,500',
      timestamp: '2024-01-15T09:55:00.000Z',
      priority: 'low'
    },
    {
      id: '3',
      type: 'alert',
      message: 'Low stock warning: 8 cylinders remaining',
      timestamp: '2024-01-15T09:52:00.000Z',
      priority: 'high'
    }
  ];

  // Dashboard analytics fallback
  static getDashboardAnalytics(): DashboardAnalytics {
    return {
      weekSalesData: [25, 30, 22, 35, 28, 40, 45],
      topDrivers: this.DRIVERS.map((driver, index) => ({
        name: driver.name,
        sales: driver.todaySales,
        revenue: driver.totalRevenue,
        percentage: index === 0 ? 100 : Math.round((driver.todaySales / this.DRIVERS[0].todaySales) * 100)
      })),
      alerts: [],
      recentActivity: [
        {
          type: 'sale',
          message: 'Rahman sold 5 cylinders - ৳2,500',
          timestamp: '2024-01-15T08:00:00.000Z',
          amount: 2500
        },
        {
          type: 'stock',
          message: 'Stock replenished: 50 full cylinders',
          timestamp: '2024-01-15T06:00:00.000Z'
        },
        {
          type: 'payment',
          message: 'Payment received from ABC Store: ৳15,000',
          timestamp: '2024-01-15T04:00:00.000Z',
          amount: 15000
        }
      ],
      performanceMetrics: {
        salesTrend: 'up',
        totalWeekSales: 225,
        avgDailySales: 32.1
      }
    };
  }

  // Trend data fallback with deterministic values
  static getTrendData(timeRange: '7d' | '30d' | '90d'): TrendData[] {
    const periods = timeRange === '7d' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === '30d'
      ? Array.from({length: 30}, (_, i) => `${i + 1}`)
      : Array.from({length: 12}, (_, i) => `Week ${i + 1}`);

    // Deterministic values to avoid hydration mismatches
    const staticValues = [25, 32, 18, 45, 38, 52, 41, 28, 35, 47, 22, 39];
    
    return periods.map((period, index) => ({
      period,
      sales: staticValues[index % staticValues.length] + 10,
      revenue: (staticValues[index % staticValues.length] * 500) + 5000,
      drivers: (staticValues[index % staticValues.length] % 8) + 2,
      efficiency: (staticValues[index % staticValues.length] % 30) + 70
    }));
  }

  // Get driver names only (for random selection in components that need it)
  static getDriverNames(): string[] {
    return this.DRIVERS.map(driver => driver.name);
  }

  // Get active drivers only
  static getActiveDrivers(): Driver[] {
    return this.DRIVERS.filter(driver => driver.status === 'active');
  }

  // Generate consistent random data using seed for deterministic results
  static generateSeededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Get deterministic data point for specific index (used for real-time updates)
  static getDataPointForIndex(index: number): LiveDataPoint {
    const types = ['sale', 'payment', 'stock', 'alert', 'driver'] as const;
    const drivers = this.getDriverNames();
    const baseId = 1000 + index;
    
    const typeIndex = index % types.length;
    const type = types[typeIndex];
    const driverIndex = index % drivers.length;
    const locationIndex = index % this.LOCATIONS.length;
    
    const messages = {
      sale: [
        `New sale: ${(index % 10) + 1} cylinders sold`,
        `Refill sale completed: ৳${((index % 20) * 100) + 500}`,
        `Package sale: ${(index % 5) + 1} × 12kg cylinders`
      ],
      payment: [
        `Payment received: ৳${((index % 50) * 100) + 1000}`,
        `Cash deposit: ৳${((index % 30) * 100) + 500}`,
        `Customer payment cleared`
      ],
      stock: [
        `Stock alert: ${((index % 50) + 10)} cylinders remaining`,
        `Inventory updated: New shipment received`,
        `Low stock warning: Immediate restocking needed`
      ],
      alert: [
        `System alert: Performance target achieved`,
        `Warning: Payment overdue by ${(index % 10) + 1} days`,
        `Alert: Driver route optimization suggested`
      ],
      driver: [
        `Driver check-in: Route started`,
        `Driver update: Delivery completed`,
        `Driver alert: Route deviation detected`
      ]
    };

    return {
      id: `${baseId}`,
      type,
      message: messages[type][index % messages[type].length],
      value: type === 'sale' ? ((index % 20) * 100) + 500 : undefined,
      timestamp: new Date(Date.now() - (index * 60 * 1000)).toISOString(),
      priority: ['high', 'medium', 'low'][index % 3] as any,
      driverName: ['driver', 'sale'].includes(type) ? drivers[driverIndex] : undefined,
      location: (index % 2 === 0) ? this.LOCATIONS[locationIndex] : undefined
    };
  }
}