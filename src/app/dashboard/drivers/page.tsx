"use client";

import { useState, useEffect } from 'react';
import { Truck, User, TrendingUp, MapPin, Phone, Plus, Trash2, Edit2, Eye, X, Calendar, DollarSign, Package, RotateCcw } from 'lucide-react';
import { AddDriverForm } from '@/components/forms/AddDriverForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useDriverPerformance } from '@/hooks/useDriverPerformance';
import { useDailySalesData } from '@/hooks/useDailySalesData';
import { useSettings } from '@/contexts/SettingsContext';

interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
  driverType: 'RETAIL' | 'SHIPMENT';
  route?: string;
  joiningDate?: string;
  leavingDate?: string;
  createdAt: string;
  counts?: {
    totalSales: number;
    receivableRecords: number;
    inventoryMovements: number;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showEditDriverForm, setShowEditDriverForm] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RETAIL' | 'SHIPMENT'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  });
  const { toast } = useToast();
  const { data: session } = useSession();
  const { formatCurrency: settingsFormatCurrency, formatDate: settingsFormatDate, t } = useSettings();

  // Add performance data hook
  const { 
    drivers: performanceDrivers, 
    summary, 
    period, 
    loading: performanceLoading,
    refreshData: refreshPerformanceData
  } = useDriverPerformance();

  // Add daily sales data hook for retail drivers
  const { 
    dailySales, 
    summary: dailySalesSummary,
    period: dailySalesPeriod,
    loading: dailySalesLoading,
    refreshData: refreshDailySalesData
  } = useDailySalesData({ 
    month: selectedMonth.month,
    year: selectedMonth.year,
    driverType: 'RETAIL' 
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch drivers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    if (typeFilter === 'ALL') return true;
    return (driver.driverType || 'RETAIL') === typeFilter;
  });

  const activeDrivers = summary.totalDrivers;
  const totalSales = summary.totalPackageSales + summary.totalRefillSales;
  const totalRevenue = summary.totalRevenue;
  const totalReceivables = summary.totalCashReceivables + summary.totalCylinderReceivables;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Handle new driver creation
  const handleCreateDriver = async (formData: any) => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          route: formData.area,
          driverType: formData.driverType,
          joiningDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create driver');
      }

      const result = await response.json();
      
      // Refresh the drivers list
      await fetchDrivers();
      
      toast({
        title: "Success",
        description: "Driver added successfully!"
      });
      
      setShowAddDriverForm(false);
    } catch (error) {
      console.error('Failed to create driver:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add driver. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle driver deletion
  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (!confirm(`Are you sure you want to delete driver "${driverName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(driverId);
      
      const response = await fetch(`/api/drivers?id=${driverId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete driver');
      }

      // Refresh the drivers list
      await fetchDrivers();
      
      toast({
        title: "Success",
        description: "Driver deleted successfully!"
      });
      
    } catch (error) {
      console.error('Failed to delete driver:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('failedToDeleteDriver'),
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Handle driver details view
  const handleViewDetails = (driver: any) => {
    setSelectedDriver(driver);
    setShowDriverDetails(true);
  };

  // Handle driver edit
  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver);
    setShowEditDriverForm(true);
  };

  // Handle driver update
  const handleUpdateDriver = async (formData: any) => {
    if (!selectedDriver) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/drivers/${selectedDriver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          route: formData.area,
          driverType: formData.driverType,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update driver');
      }

      // Refresh the drivers list
      await fetchDrivers();
      
      toast({
        title: t('success'),
        description: t('driverUpdatedSuccessfully')
      });
      
      setShowEditDriverForm(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to update driver:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('failedToUpdateDriver'),
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('driverManagement')}</h1>
          <p className="text-muted-foreground">
            {t('driverManagement')} - {period.monthName} {period.year}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors"
            onClick={refreshPerformanceData}
            disabled={performanceLoading}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${performanceLoading ? 'animate-spin' : ''}`} />
            {t('refreshData')}
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => setShowAddDriverForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addDriver')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('activeDrivers')}</p>
              <p className="text-2xl font-bold text-foreground">{activeDrivers}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalSalesThisMonth')}</p>
              <p className="text-2xl font-bold text-foreground">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
              <p className="text-2xl font-bold text-foreground">{settingsFormatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('totalReceivables')}</p>
              <p className="text-2xl font-bold text-foreground">{settingsFormatCurrency(totalReceivables)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Type Filter */}
      <div className="bg-card rounded-lg shadow border border-border transition-colors p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{t('filterByDriverType')}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                typeFilter === 'ALL' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('allDrivers')}
            </button>
            <button
              onClick={() => setTypeFilter('RETAIL')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                typeFilter === 'RETAIL' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('retailDrivers')}
            </button>
            <button
              onClick={() => setTypeFilter('SHIPMENT')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                typeFilter === 'SHIPMENT' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('shipmentDrivers')}
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-card rounded-lg shadow border border-border transition-colors">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{t('performance')} - {period.monthName} {period.year}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('performance')} {t('activeDrivers')} {t('thisMonth')}
          </p>
        </div>
        {performanceLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading driver performance...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('driver')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('area')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('refillSales')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('packageSales')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('cashReceivables')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('cylinderReceivables')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {performanceDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                      {t('noActiveDriversFoundForThisPeriod')}
                    </td>
                  </tr>
                ) : (
                  performanceDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{driver.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {driver.driverType === 'RETAIL' ? t('retail') : t('shipment')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {driver.area}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {driver.totalRefillSales}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {driver.totalPackageSales}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {settingsFormatCurrency(driver.totalCashReceivables)}
                        </div>
                        {driver.totalCashReceivables > 0 && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400">
                            Outstanding
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {driver.totalCylinderReceivables}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          cylinders
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                          onClick={() => handleViewDetails(driver)}
                        >
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </div>
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3 transition-colors"
                          onClick={() => handleEditDriver(driver)}
                        >
                          <div className="flex items-center">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </div>
                        </button>
                        {isAdmin && (
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteDriver(driver.id, driver.name)}
                            disabled={deletingId === driver.id}
                          >
                            {deletingId === driver.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-1"></div>
                                Deleting...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </div>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Sales Table for Retail Drivers */}
      <div className="bg-card rounded-lg shadow border border-border transition-colors">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Daily Sales - Retail Drivers</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Individual daily sales data for {dailySalesPeriod.monthName} {dailySalesPeriod.year}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground"
                value={`${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedMonth({ 
                    year: parseInt(year), 
                    month: parseInt(month) 
                  });
                }}
              >
                <option value="2025-07">July 2025</option>
                <option value="2025-06">June 2025</option>
                <option value="2025-05">May 2025</option>
                <option value="2025-04">April 2025</option>
                <option value="2025-03">March 2025</option>
                <option value="2025-02">February 2025</option>
                <option value="2025-01">January 2025</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
                <option value="2024-10">October 2024</option>
              </select>
              <button
                onClick={refreshDailySalesData}
                disabled={dailySalesLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${dailySalesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {dailySalesLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                Loading daily sales data...
              </div>
            </div>
          ) : dailySales.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No daily sales data found for retail drivers in {dailySalesPeriod.monthName} {dailySalesPeriod.year}.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Package Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Refill Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sales Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailySales.map((sale) => (
                  <tr key={`${sale.id || sale.saleDate}-${sale.driver?.id}`} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {settingsFormatDate(sale.saleDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {sale.driver?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {sale.packageSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {sale.refillSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {sale.totalSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {settingsFormatCurrency(sale.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Driver Dialog */}
      <Dialog open={showAddDriverForm} onOpenChange={setShowAddDriverForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <AddDriverForm
            onSubmit={handleCreateDriver}
            onCancel={() => setShowAddDriverForm(false)}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={showEditDriverForm} onOpenChange={setShowEditDriverForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <AddDriverForm
              onSubmit={handleUpdateDriver}
              onCancel={() => {
                setShowEditDriverForm(false);
                setSelectedDriver(null);
              }}
              loading={submitting}
              initialData={{
                name: selectedDriver.name,
                phone: selectedDriver.phone || '',
                email: selectedDriver.email || '',
                licenseNumber: selectedDriver.licenseNumber || '',
                address: selectedDriver.address || '',
                area: selectedDriver.route || '',
                driverType: selectedDriver.driverType,
                status: selectedDriver.status,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Details Dialog */}
      <Dialog open={showDriverDetails} onOpenChange={setShowDriverDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Driver Details
              <button 
                onClick={() => setShowDriverDetails(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Driver Name
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Driver Type
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.driverType === 'RETAIL' ? 'Retail Driver' : 'Shipment Driver'}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Phone Number
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* License and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    License Number
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.licenseNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Route/Area
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.route || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedDriver.address || 'N/A'}
                </p>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <p className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDriver.status)}`}>
                      {selectedDriver.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Joining Date
                  </label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded">
                    {selectedDriver.joiningDate ? settingsFormatDate(selectedDriver.joiningDate) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-foreground mb-3">Performance Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedDriver.counts?.totalSales || 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Sales</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {settingsFormatCurrency((selectedDriver.counts?.totalSales || 0) * 500)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Total Revenue</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedDriver.counts?.receivableRecords || 0}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Receivable Records</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}