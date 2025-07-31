'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { DynamicCombinedSaleForm as CombinedSaleForm } from '@/components/optimization/DynamicComponents';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface Sale {
  id: string;
  saleType: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  discount: number;
  netValue: number;
  paymentType: string;
  cashDeposited: number;
  cylindersDeposited: number;
  saleDate: string;
  driver: {
    name: string;
    phone?: string;
  };
  product: {
    name: string;
    size: string;
  };
  createdBy: string;
}

interface DailySalesEntry {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  packageSalesQty: number;
  refillSalesQty: number;
  totalSalesValue: number;
  totalDiscount: number;
  totalCashDeposited: number;
  totalCylinderDeposited: number;
  cylinderDepositsBySize: Record<string, number>;
  salesIds: string[];
  canEdit: boolean;
  canDelete: boolean;
}

interface DailySalesData {
  dailySummary: DailySalesEntry[];
  summary: {
    totalDrivers: number;
    totalPackageSales: number;
    totalRefillSales: number;
    totalSalesValue: number;
    totalDiscount: number;
    totalCashDeposited: number;
    totalCylinderDeposited: number;
    totalSalesEntries: number;
  };
}

export default function SalesPage() {
  const { formatCurrency, t } = useSettings();
  const [dailySalesData, setDailySalesData] = useState<DailySalesData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailySalesEntry | null>(
    null
  );
  const [editingEntryData, setEditingEntryData] = useState<any>(null);
  const [loadingEditData, setLoadingEditData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load daily sales data
  const loadSalesData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching daily sales summary for date:', today);

      const response = await fetch(`/api/sales/daily-summary?date=${today}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Daily sales data received:', data);
        console.log('Number of daily entries:', data.dailySummary?.length || 0);
        setDailySalesData(data);
        setLastUpdated(new Date());
      } else {
        const errorText = await response.text();
        console.error('Daily sales API error:', response.status, errorText);
        throw new Error(
          `Failed to load daily sales data: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.error('Failed to load daily sales:', error);
      toast({
        title: t('error'),
        description: `${t('failedToLoadDailySalesData')}. ${t('tryAgain')}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSalesData();

    // Set up automatic refresh every 30 seconds
    const interval = setInterval(() => {
      loadSalesData(true); // Pass true to indicate this is a refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle new sale creation
  const handleCreateSale = async (formData: any) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/sales/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: t('success'),
          description:
            result.message || `${t('combinedSaleCreatedSuccessfully')}!`,
        });
        setShowNewSaleForm(false);
        await loadSalesData(); // Reload data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Failed to create sale:', error);
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failedToCreateSale'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Load entry data for editing
  const loadEntryForEdit = async (entry: DailySalesEntry) => {
    try {
      setLoadingEditData(true);
      const response = await fetch(
        `/api/sales/details?salesIds=${entry.salesIds.join(',')}`
      );

      if (response.ok) {
        const data = await response.json();
        const sales = data.sales;

        // Transform sales data into form format
        const saleItems = sales.map((sale: any) => ({
          productId: sale.product.id || '',
          packageSale: sale.saleType === 'PACKAGE' ? sale.quantity : 0,
          refillSale: sale.saleType === 'REFILL' ? sale.quantity : 0,
          packagePrice: sale.saleType === 'PACKAGE' ? sale.unitPrice : 0,
          refillPrice: sale.saleType === 'REFILL' ? sale.unitPrice : 0,
        }));

        // Group by product if there are both package and refill sales for same product
        const groupedItems: { [key: string]: any } = {};
        saleItems.forEach((item: any) => {
          const key = item.productId;
          if (groupedItems[key]) {
            groupedItems[key].packageSale += item.packageSale;
            groupedItems[key].refillSale += item.refillSale;
            if (item.packagePrice > 0)
              groupedItems[key].packagePrice = item.packagePrice;
            if (item.refillPrice > 0)
              groupedItems[key].refillPrice = item.refillPrice;
          } else {
            groupedItems[key] = { ...item };
          }
        });

        // Convert old cylindersDeposited to new cylinderDeposits format by size
        const cylinderDepositsBySize: { [size: string]: number } = {};
        sales.forEach((sale: any) => {
          if (sale.cylindersDeposited > 0 && sale.product?.size) {
            const size = sale.product.size;
            cylinderDepositsBySize[size] =
              (cylinderDepositsBySize[size] || 0) + sale.cylindersDeposited;
          }
        });

        const formData = {
          driverId: entry.driverId,
          customerName: sales[0]?.customerName || '',
          saleItems: Object.values(groupedItems),
          paymentType: sales[0]?.paymentType || 'CASH',
          discount: sales.reduce(
            (sum: number, sale: any) => sum + sale.discount,
            0
          ),
          cashDeposited: sales.reduce(
            (sum: number, sale: any) => sum + sale.cashDeposited,
            0
          ),
          cylinderDeposits: cylinderDepositsBySize,
          notes: sales[0]?.notes || '',
        };

        setEditingEntryData(formData);
        setEditingEntry(entry);
      } else {
        throw new Error('Failed to load entry data');
      }
    } catch (error) {
      console.error('Failed to load entry data:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadEntryDataForEditing'),
        variant: 'destructive',
      });
    } finally {
      setLoadingEditData(false);
    }
  };

  // Handle entry edit submission
  const handleEditEntrySubmit = async (formData: any) => {
    if (!editingEntry) return;

    try {
      setSubmitting(true);

      // First delete the existing sales
      const deleteResponse = await fetch('/api/sales/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesIds: editingEntry.salesIds,
          date: editingEntry.date,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing sales');
      }

      // Then create new sales with updated data
      const createResponse = await fetch('/api/sales/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        toast({
          title: t('success'),
          description: `${t('salesEntryUpdatedSuccessfully')}!`,
        });
        setEditingEntry(null);
        setEditingEntryData(null);
        await loadSalesData(); // Reload data
      } else {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to update sales entry');
      }
    } catch (error) {
      console.error('Failed to update sales entry:', error);
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failedToUpdateSalesEntry'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk delete for a driver's daily sales
  const handleDeleteDailyEntry = async (entry: DailySalesEntry) => {
    if (
      !confirm(
        `${t('areYouSure')} ${t('deleteConfirmation')} ${entry.driverName} ${t('on')} ${entry.date}? ${t('thisWillDelete')} ${entry.salesIds.length} ${t('salesEntries')} ${t('cannotBeUndone')}.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/sales/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesIds: entry.salesIds,
          date: entry.date,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: t('success'),
          description: `${t('successfullyDeleted')} ${result.deletedCount} ${t('salesEntries')} ${t('for')} ${entry.driverName}`,
        });
        await loadSalesData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sales');
      }
    } catch (error) {
      console.error('Failed to delete daily sales:', error);
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failedToDeleteSales'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sales Table Skeleton */}
        <div className="bg-card border-border rounded-lg border shadow transition-colors">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {[...Array(9)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 w-20 bg-background rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(9)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {colIndex === 8 ? (
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const dailySummary = dailySalesData?.dailySummary || [];
  const summary = dailySalesData?.summary || {
    totalDrivers: 0,
    totalPackageSales: 0,
    totalRefillSales: 0,
    totalSalesValue: 0,
    totalCashDeposited: 0,
    totalCylinderDeposited: 0,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('salesManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('recordDailySales')} {t('trackPerformance')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => loadSalesData(true)}
            variant="outline"
            className="flex items-center"
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {t('refresh')}
          </Button>
          <Button
            onClick={() => setShowNewSaleForm(true)}
            className="flex items-center bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('create')} {t('sales')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('packageSale')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {summary.totalPackageSales}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('cylindersSold')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('refillSale')}</p>
              <p className="text-foreground text-2xl font-bold">
                {summary.totalRefillSales}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('refillSalesQty')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalRevenue')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(summary.totalSalesValue)}
              </p>
              <p className="text-muted-foreground text-xs">{t('totalSales')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('cash')} {t('deposits')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(summary.totalCashDeposited)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('cash')} {t('deposits')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card border-border rounded-lg border shadow transition-colors">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-foreground text-lg font-semibold">
              {t('todaysSales')}
            </h2>
            {refreshing && (
              <div className="text-muted-foreground flex items-center text-sm">
                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                {t('loading')}...
              </div>
            )}
            {lastUpdated && !refreshing && (
              <div className="text-muted-foreground text-sm">
                {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {t('filter')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('date')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('drivers')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('packageSale')} ({t('quantity')})
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('refillSale')} ({t('quantity')})
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('totalValue')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('discount')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('cash')} {t('deposits')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('cylinders')} {t('deposits')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {dailySummary.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-muted-foreground px-6 py-8 text-center"
                  >
                    {t('noDataFound')}. {t('create')} {t('newSale')}.
                  </td>
                </tr>
              ) : (
                dailySummary.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {entry.driverName}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {entry.packageSalesQty}
                      </span>
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                        {entry.refillSalesQty}
                      </span>
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {formatCurrency(entry.totalSalesValue)}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {formatCurrency(entry.totalDiscount)}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {formatCurrency(entry.totalCashDeposited)}
                    </td>
                    <td className="text-foreground px-6 py-4 text-sm">
                      {entry.totalCylinderDeposited > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(
                            entry.cylinderDepositsBySize || {}
                          ).map(([size, quantity]) => (
                            <div
                              key={size}
                              className="flex items-center space-x-2"
                            >
                              <span className="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {size}: {quantity}
                              </span>
                            </div>
                          ))}
                          {Object.keys(entry.cylinderDepositsBySize || {})
                            .length === 0 && (
                            <span className="text-muted-foreground text-xs">
                              {entry.totalCylinderDeposited} {t('cylinders')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {entry.canEdit || entry.canDelete ? (
                        <div className="flex space-x-2">
                          {entry.canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadEntryForEdit(entry)}
                              className="text-muted-foreground hover:text-foreground"
                              disabled={loadingEditData}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          {entry.canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDailyEntry(entry)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {t('readOnly')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Dialog */}
      <Dialog open={showNewSaleForm} onOpenChange={setShowNewSaleForm}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('create')} {t('sales')}
            </DialogTitle>
          </DialogHeader>
          <CombinedSaleForm
            onSubmit={handleCreateSale}
            onCancel={() => setShowNewSaleForm(false)}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Daily Entry Dialog */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={() => {
          setEditingEntry(null);
          setEditingEntryData(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('edit')} {t('sales')} - {editingEntry?.driverName}
            </DialogTitle>
          </DialogHeader>
          {loadingEditData ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('loadingData')}...</span>
            </div>
          ) : editingEntryData ? (
            <CombinedSaleForm
              onSubmit={handleEditEntrySubmit}
              onCancel={() => {
                setEditingEntry(null);
                setEditingEntryData(null);
              }}
              loading={submitting}
              initialData={editingEntryData}
            />
          ) : editingEntry ? (
            <div className="p-4 text-center">
              <p className="mb-4 text-gray-600">
                {t('operationFailed')} {t('loadingData')}.
              </p>
              <Button
                variant="outline"
                onClick={() => setEditingEntry(null)}
                className="mt-4"
              >
                {t('close')}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
