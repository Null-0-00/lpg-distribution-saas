import { describe, it, expect } from '@jest/globals';
import { FallbackDataService } from '../fallback-data';

describe('FallbackDataService', () => {
  describe('DRIVERS', () => {
    it('should have correct number of drivers', () => {
      expect(FallbackDataService.DRIVERS).toHaveLength(4);
    });

    it('should have all required driver properties', () => {
      FallbackDataService.DRIVERS.forEach(driver => {
        expect(driver).toHaveProperty('id');
        expect(driver).toHaveProperty('name');
        expect(driver).toHaveProperty('phone');
        expect(driver).toHaveProperty('status');
        expect(driver).toHaveProperty('todaySales');
        expect(driver).toHaveProperty('totalRevenue');
        expect(driver).toHaveProperty('area');
        expect(driver).toHaveProperty('rating');
      });
    });

    it('should have valid driver data types', () => {
      FallbackDataService.DRIVERS.forEach(driver => {
        expect(typeof driver.id).toBe('number');
        expect(typeof driver.name).toBe('string');
        expect(typeof driver.phone).toBe('string');
        expect(['active', 'on_break', 'inactive']).toContain(driver.status);
        expect(typeof driver.todaySales).toBe('number');
        expect(typeof driver.totalRevenue).toBe('number');
        expect(typeof driver.area).toBe('string');
        expect(typeof driver.rating).toBe('number');
      });
    });
  });

  describe('LIVE_DATA_FEED', () => {
    it('should have correct number of default items', () => {
      expect(FallbackDataService.LIVE_DATA_FEED).toHaveLength(3);
    });

    it('should have all required data point properties', () => {
      FallbackDataService.LIVE_DATA_FEED.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('message');
        expect(item).toHaveProperty('timestamp');
        expect(item).toHaveProperty('priority');
      });
    });

    it('should have valid data types', () => {
      FallbackDataService.LIVE_DATA_FEED.forEach(item => {
        expect(typeof item.id).toBe('string');
        expect(['sale', 'payment', 'stock', 'alert', 'driver']).toContain(item.type);
        expect(typeof item.message).toBe('string');
        expect(typeof item.timestamp).toBe('string');
        expect(['high', 'medium', 'low']).toContain(item.priority);
      });
    });
  });

  describe('getDashboardAnalytics', () => {
    it('should return analytics with correct structure', () => {
      const analytics = FallbackDataService.getDashboardAnalytics();
      
      expect(analytics).toHaveProperty('weekSalesData');
      expect(analytics).toHaveProperty('topDrivers');
      expect(analytics).toHaveProperty('alerts');
      expect(analytics).toHaveProperty('recentActivity');
      expect(analytics).toHaveProperty('performanceMetrics');
    });

    it('should have 7 days of sales data', () => {
      const analytics = FallbackDataService.getDashboardAnalytics();
      expect(analytics.weekSalesData).toHaveLength(7);
      analytics.weekSalesData.forEach(sales => {
        expect(typeof sales).toBe('number');
        expect(sales).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have performance metrics with correct types', () => {
      const analytics = FallbackDataService.getDashboardAnalytics();
      const metrics = analytics.performanceMetrics;
      
      expect(typeof metrics.salesTrend).toBe('string');
      expect(typeof metrics.totalWeekSales).toBe('number');
      expect(typeof metrics.avgDailySales).toBe('number');
    });
  });

  describe('getTrendData', () => {
    it('should return correct number of periods for 7d', () => {
      const data = FallbackDataService.getTrendData('7d');
      expect(data).toHaveLength(7);
    });

    it('should return correct number of periods for 30d', () => {
      const data = FallbackDataService.getTrendData('30d');
      expect(data).toHaveLength(30);
    });

    it('should return correct number of periods for 90d', () => {
      const data = FallbackDataService.getTrendData('90d');
      expect(data).toHaveLength(12);
    });

    it('should have deterministic values', () => {
      const data1 = FallbackDataService.getTrendData('7d');
      const data2 = FallbackDataService.getTrendData('7d');
      
      expect(data1).toEqual(data2);
    });

    it('should have all required trend properties', () => {
      const data = FallbackDataService.getTrendData('7d');
      
      data.forEach(item => {
        expect(item).toHaveProperty('period');
        expect(item).toHaveProperty('sales');
        expect(item).toHaveProperty('revenue');
        expect(item).toHaveProperty('drivers');
        expect(item).toHaveProperty('efficiency');
        
        expect(typeof item.period).toBe('string');
        expect(typeof item.sales).toBe('number');
        expect(typeof item.revenue).toBe('number');
        expect(typeof item.drivers).toBe('number');
        expect(typeof item.efficiency).toBe('number');
      });
    });
  });

  describe('getDriverNames', () => {
    it('should return array of driver names', () => {
      const names = FallbackDataService.getDriverNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names).toHaveLength(4);
      names.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getActiveDrivers', () => {
    it('should return only active drivers', () => {
      const activeDrivers = FallbackDataService.getActiveDrivers();
      activeDrivers.forEach(driver => {
        expect(driver.status).toBe('active');
      });
    });

    it('should return correct number of active drivers', () => {
      const activeDrivers = FallbackDataService.getActiveDrivers();
      const expectedCount = FallbackDataService.DRIVERS.filter(d => d.status === 'active').length;
      expect(activeDrivers).toHaveLength(expectedCount);
    });
  });

  describe('getDataPointForIndex', () => {
    it('should return consistent data for same index', () => {
      const data1 = FallbackDataService.getDataPointForIndex(0);
      const data2 = FallbackDataService.getDataPointForIndex(0);
      
      // Timestamps can be slightly different, so we compare the rest of the object
      const { timestamp: ts1, ...rest1 } = data1;
      const { timestamp: ts2, ...rest2 } = data2;

      expect(rest1).toEqual(rest2);
    });

    it('should return different data for different indices', () => {
      const data1 = FallbackDataService.getDataPointForIndex(0);
      const data2 = FallbackDataService.getDataPointForIndex(1);
      
      expect(data1.id).not.toBe(data2.id);
    });

    it('should have all required properties', () => {
      const data = FallbackDataService.getDataPointForIndex(0);
      
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('priority');
    });

    it('should generate valid timestamps', () => {
      const data = FallbackDataService.getDataPointForIndex(0);
      const timestamp = new Date(data.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});