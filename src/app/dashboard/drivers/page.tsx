'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  User,
  TrendingUp,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  Calendar,
  DollarSign,
  Package,
  RotateCcw,
} from 'lucide-react';
import { AddDriverForm } from '@/components/forms/AddDriverForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RETAIL' | 'SHIPMENT'>(
    'ALL'
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  });
  const { toast } = useToast();
  const { data: session } = useSession();
  const {
    formatCurrency: settingsFormatCurrency,
    formatDate: settingsFormatDate,
    t,
  } = useSettings();

  // Add performance data hook
  const {
    drivers: performanceDrivers,
    summary,
    period,
    loading: performanceLoading,
    refreshData: refreshPerformanceData,
  } = useDriverPerformance();

  // Add daily sales data hook for retail drivers
  const {
    dailySales,
    summary: dailySalesSummary,
    period: dailySalesPeriod,
    loading: dailySalesLoading,
    refreshData: refreshDailySalesData,
  } = useDailySalesData({
    month: selectedMonth.month,
    year: selectedMonth.year,
    driverType: 'RETAIL',
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
          title: 'Error',
          description: 'Failed to fetch drivers',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    if (typeFilter === 'ALL') return true;
    return (driver.driverType || 'RETAIL') === typeFilter;
  });

  const activeDrivers = summary.totalDrivers;
  const totalSales = summary.totalPackageSales + summary.totalRefillSales;
  const totalRevenue = summary.totalRevenue;
  const totalReceivables =
    summary.totalCashReceivables + summary.totalCylinderReceivables;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
        title: 'Success',
        description: 'Driver added successfully!',
      });

      setShowAddDriverForm(false);
    } catch (error) {
      console.error('Failed to create driver:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add driver. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle driver deletion
  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete driver "${driverName}"? This action cannot be undone.`
      )
    ) {
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
        title: 'Success',
        description: 'Driver deleted successfully!',
      });
    } catch (error) {
      console.error('Failed to delete driver:', error);
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failedToDeleteDriver'),
        variant: 'destructive',
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
        description: t('driverUpdatedSuccessfully'),
      });

      setShowEditDriverForm(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to update driver:', error);
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failedToUpdateDriver'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('driverManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('driverManagement')} - {period.monthName} {period.year}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            onClick={refreshPerformanceData}
            disabled={performanceLoading}
          >
            <RotateCcw
              className={`mr-2 h-4 w-4 ${performanceLoading ? 'animate-spin' : ''}`}
            />
            {t('refreshData')}
          </button>
          <button
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => setShowAddDriverForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addDriver')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('activeDrivers')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {activeDrivers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalSalesThisMonth')}
              </p>
              <p className="text-foreground text-2xl font-bold">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalRevenue')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {settingsFormatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalReceivables')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {settingsFormatCurrency(totalReceivables)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Type Filter */}
      <div className="bg-card border-border rounded-lg border p-4 shadow transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            {t('filterByDriverType')}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('allDrivers')}
            </button>
            <button
              onClick={() => setTypeFilter('RETAIL')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                typeFilter === 'RETAIL'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('retailDrivers')}
            </button>
            <button
              onClick={() => setTypeFilter('SHIPMENT')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
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
      <div className="bg-card border-border rounded-lg border shadow transition-colors">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            {t('performance')} - {period.monthName} {period.year}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('performance')} {t('activeDrivers')} {t('thisMonth')}
          </p>
        </div>
        {performanceLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-muted-foreground">
              Loading driver performance...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('driver')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('area')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('refillSales')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('packageSales')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('cashReceivables')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('cylinderReceivables')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('status')}
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {performanceDrivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-muted-foreground px-6 py-8 text-center"
                    >
                      {t('noActiveDriversFoundForThisPeriod')}
                    </td>
                  </tr>
                ) : (
                  performanceDrivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-foreground text-sm font-medium">
                              {driver.name}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {driver.driverType === 'RETAIL'
                                ? t('retail')
                                : t('shipment')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground flex items-center text-sm">
                          <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                          {driver.area}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground text-sm font-medium">
                          {driver.totalRefillSales}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          units
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground text-sm font-medium">
                          {driver.totalPackageSales}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          units
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground text-sm font-medium">
                          {settingsFormatCurrency(driver.totalCashReceivables)}
                        </div>
                        {driver.totalCashReceivables > 0 && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400">
                            Outstanding
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground text-sm font-medium">
                          {driver.totalCylinderReceivables}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          cylinders
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(driver.status)}`}
                        >
                          {driver.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          className="mr-3 text-blue-600 transition-colors hover:text-blue-900"
                          onClick={() => handleViewDetails(driver)}
                        >
                          <div className="flex items-center">
                            <Eye className="mr-1 h-4 w-4" />
                            Details
                          </div>
                        </button>
                        <button
                          className="mr-3 text-green-600 transition-colors hover:text-green-900"
                          onClick={() => handleEditDriver(driver)}
                        >
                          <div className="flex items-center">
                            <Edit2 className="mr-1 h-4 w-4" />
                            Edit
                          </div>
                        </button>
                        {isAdmin && (
                          <button
                            className="text-red-600 transition-colors hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() =>
                              handleDeleteDriver(driver.id, driver.name)
                            }
                            disabled={deletingId === driver.id}
                          >
                            {deletingId === driver.id ? (
                              <div className="flex items-center">
                                <div className="mr-1 h-4 w-4 animate-spin rounded-full border-b-2 border-red-500"></div>
                                Deleting...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Trash2 className="mr-1 h-4 w-4" />
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
      <div className="bg-card border-border rounded-lg border shadow transition-colors">
        <div className="border-border border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Daily Sales - Retail Drivers
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Individual daily sales data for {dailySalesPeriod.monthName}{' '}
                {dailySalesPeriod.year}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="border-border bg-background text-foreground rounded-md border px-3 py-1 text-sm"
                value={`${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedMonth({
                    year: parseInt(year),
                    month: parseInt(month),
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
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <RotateCcw
                  className={`h-4 w-4 ${dailySalesLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {dailySalesLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center">
                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
                Loading daily sales data...
              </div>
            </div>
          ) : dailySales.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center">
              No daily sales data found for retail drivers in{' '}
              {dailySalesPeriod.monthName} {dailySalesPeriod.year}.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Date
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Driver
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Package Sales
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Refill Sales
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Total Sales
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    Sales Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {dailySales.map((sale) => (
                  <tr
                    key={`${sale.id || sale.saleDate}-${sale.driver?.id}`}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {settingsFormatDate(sale.saleDate)}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {sale.driver?.name}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {sale.packageSales}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {sale.refillSales}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {sale.totalSales}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Driver Name
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.name}
                  </p>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Driver Type
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.driverType === 'RETAIL'
                      ? 'Retail Driver'
                      : 'Shipment Driver'}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Phone Number
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* License and Address */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    License Number
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.licenseNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Route/Area
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.route || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <p className="rounded bg-gray-50 p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                  {selectedDriver.address || 'N/A'}
                </p>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <p className="text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(selectedDriver.status)}`}
                    >
                      {selectedDriver.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-sm font-medium">
                    Joining Date
                  </label>
                  <p className="text-foreground bg-muted rounded p-2 text-sm">
                    {selectedDriver.joiningDate
                      ? settingsFormatDate(selectedDriver.joiningDate)
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="border-t pt-4">
                <h4 className="text-foreground mb-3 text-lg font-semibold">
                  Performance Statistics
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedDriver.counts?.totalSales || 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Total Sales
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {settingsFormatCurrency(
                        (selectedDriver.counts?.totalSales || 0) * 500
                      )}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Total Revenue
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedDriver.counts?.receivableRecords || 0}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Receivable Records
                    </div>
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
