'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  MapPin,
} from 'lucide-react';

export default function DriverAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedDriver, setSelectedDriver] = useState('all');

  const driverMetrics = [
    {
      id: 1,
      name: 'Rahman Ali',
      photo: '/avatars/rahman.jpg',
      totalSales: 450,
      revenue: 225000,
      efficiency: 95,
      customerRating: 4.8,
      targetAchievement: 112,
      avgSalesPerDay: 15.2,
      territories: ['Dhanmondi', 'New Market'],
      strengths: ['High customer satisfaction', 'Consistent performance'],
      improvements: ['Route optimization'],
      trend: 'up',
    },
    {
      id: 2,
      name: 'Karim Hassan',
      photo: '/avatars/karim.jpg',
      totalSales: 380,
      revenue: 190000,
      efficiency: 87,
      customerRating: 4.6,
      targetAchievement: 95,
      avgSalesPerDay: 12.8,
      territories: ['Gulshan', 'Banani'],
      strengths: ['Territory knowledge', 'Time management'],
      improvements: ['Sales techniques', 'Customer engagement'],
      trend: 'up',
    },
    {
      id: 3,
      name: 'Hasan Ahmed',
      photo: '/avatars/hasan.jpg',
      totalSales: 320,
      revenue: 160000,
      efficiency: 78,
      customerRating: 4.3,
      targetAchievement: 80,
      avgSalesPerDay: 10.8,
      territories: ['Uttara', 'Mirpur'],
      strengths: ['Product knowledge'],
      improvements: ['Sales volume', 'Customer relationships', 'Efficiency'],
      trend: 'down',
    },
    {
      id: 4,
      name: 'Ali Rahman',
      photo: '/avatars/ali.jpg',
      totalSales: 340,
      revenue: 170000,
      efficiency: 82,
      customerRating: 4.5,
      targetAchievement: 85,
      avgSalesPerDay: 11.5,
      territories: ['Wari', 'Old Dhaka'],
      strengths: ['Local connections', 'Reliability'],
      improvements: ['Digital adoption', 'Reporting accuracy'],
      trend: 'stable',
    },
  ];

  const topPerformer = driverMetrics[0];
  const totalRevenue = driverMetrics.reduce(
    (sum, driver) => sum + driver.revenue,
    0
  );
  const avgEfficiency =
    driverMetrics.reduce((sum, driver) => sum + driver.efficiency, 0) /
    driverMetrics.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Driver Performance Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of driver performance and efficiency
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Drivers</option>
            {driverMetrics.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <Award className="text-gold-500 h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold">{topPerformer.name}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold">
                ৳{(totalRevenue / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Efficiency</p>
              <p className="text-lg font-bold">{avgEfficiency.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-lg font-bold">{driverMetrics.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Performance Matrix */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Driver Performance Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Target Achievement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Customer Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {driverMetrics.map((driver) => (
                <tr key={driver.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-600">
                            {driver.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.territories.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {driver.totalSales}
                    </div>
                    <div className="text-sm text-gray-500">
                      {driver.avgSalesPerDay}/day avg
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ৳{(driver.revenue / 1000).toFixed(0)}K
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${driver.efficiency >= 90 ? 'bg-green-500' : driver.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${driver.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {driver.efficiency}%
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        driver.targetAchievement >= 100
                          ? 'bg-green-100 text-green-800'
                          : driver.targetAchievement >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {driver.targetAchievement}%
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {driver.customerRating}
                      </span>
                      <span className="ml-1 text-yellow-400">★</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {driver.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {driver.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {driver.trend === 'stable' && (
                      <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() =>
                        alert(`View ${driver.name} details coming soon!`)
                      }
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">
            Top Performers This Month
          </h3>
          <div className="space-y-4">
            {driverMetrics
              .sort((a, b) => b.targetAchievement - a.targetAchievement)
              .slice(0, 3)
              .map((driver, index) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index === 0
                          ? 'bg-yellow-400'
                          : index === 1
                            ? 'bg-gray-400'
                            : 'bg-orange-400'
                      }`}
                    >
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {driver.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {driver.targetAchievement}% target achieved
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ৳{(driver.revenue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-600">
                      {driver.totalSales} sales
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Performance Insights</h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-medium text-green-800">🎯 Strengths</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Rahman Ali consistently exceeds targets</li>
                <li>• Average customer satisfaction is 4.5+ stars</li>
                <li>• Territory coverage is well distributed</li>
              </ul>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-2 font-medium text-yellow-800">
                ⚠️ Areas for Improvement
              </h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Hasan Ahmed needs sales technique training</li>
                <li>• Route optimization can improve efficiency</li>
                <li>• Digital adoption varies across drivers</li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-800">
                📈 Recommendations
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Implement peer mentoring program</li>
                <li>• Provide mobile sales tools training</li>
                <li>• Set up territory-specific incentives</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Territory Analysis */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">
          Territory Performance Analysis
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Dhanmondi', 'Gulshan', 'Uttara', 'Wari'].map(
            (territory, index) => {
              const territoryData = {
                Dhanmondi: {
                  sales: 450,
                  revenue: 225000,
                  efficiency: 95,
                  growth: 12,
                },
                Gulshan: {
                  sales: 380,
                  revenue: 190000,
                  efficiency: 87,
                  growth: 8,
                },
                Uttara: {
                  sales: 320,
                  revenue: 160000,
                  efficiency: 78,
                  growth: -5,
                },
                Wari: {
                  sales: 340,
                  revenue: 170000,
                  efficiency: 82,
                  growth: 3,
                },
              }[territory] || {
                sales: 0,
                revenue: 0,
                efficiency: 0,
                growth: 0,
              };

              return (
                <div key={territory} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{territory}</h4>
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sales:</span>
                      <span className="font-medium">{territoryData.sales}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">
                        ৳{(territoryData.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium">
                        {territoryData.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growth:</span>
                      <span
                        className={`font-medium ${territoryData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {territoryData.growth >= 0 ? '+' : ''}
                        {territoryData.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
