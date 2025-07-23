"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Filter, Download, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { CombinedSaleForm } from '@/components/forms/CombinedSaleForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [dailySalesData, setDailySalesData] = useState<DailySalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailySalesEntry | null>(null);
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
          'Cache-Control': 'no-cache'
        }
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
        throw new Error(`Failed to load daily sales data: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to load daily sales:', error);
      toast({
        title: "Error",
        description: "Failed to load daily sales data. Please try again.",
        variant: "destructive"
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
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || "Combined sale created successfully!"
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
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sale",
        variant: "destructive"
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
      const response = await fetch(`/api/sales/details?salesIds=${entry.salesIds.join(',')}`);
      
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
            if (item.packagePrice > 0) groupedItems[key].packagePrice = item.packagePrice;
            if (item.refillPrice > 0) groupedItems[key].refillPrice = item.refillPrice;
          } else {
            groupedItems[key] = { ...item };
          }
        });
        
        // Convert old cylindersDeposited to new cylinderDeposits format by size
        const cylinderDepositsBySize: { [size: string]: number } = {};
        sales.forEach((sale: any) => {
          if (sale.cylindersDeposited > 0 && sale.product?.size) {
            const size = sale.product.size;
            cylinderDepositsBySize[size] = (cylinderDepositsBySize[size] || 0) + sale.cylindersDeposited;
          }
        });

        const formData = {
          driverId: entry.driverId,
          customerName: sales[0]?.customerName || '',
          saleItems: Object.values(groupedItems),
          paymentType: sales[0]?.paymentType || 'CASH',
          discount: sales.reduce((sum: number, sale: any) => sum + sale.discount, 0),
          cashDeposited: sales.reduce((sum: number, sale: any) => sum + sale.cashDeposited, 0),
          cylinderDeposits: cylinderDepositsBySize,
          notes: sales[0]?.notes || ''
        };
        
        setEditingEntryData(formData);
        setEditingEntry(entry);
      } else {
        throw new Error('Failed to load entry data');
      }
    } catch (error) {
      console.error('Failed to load entry data:', error);
      toast({
        title: "Error",
        description: "Failed to load entry data for editing",
        variant: "destructive"
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
          date: editingEntry.date
        })
      });
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing sales');
      }
      
      // Then create new sales with updated data
      const createResponse = await fetch('/api/sales/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (createResponse.ok) {
        const result = await createResponse.json();
        toast({
          title: "Success",
          description: "Sales entry updated successfully!"
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
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sales entry",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk delete for a driver's daily sales
  const handleDeleteDailyEntry = async (entry: DailySalesEntry) => {
    if (!confirm(`Are you sure you want to delete all sales for ${entry.driverName} on ${entry.date}? This will delete ${entry.salesIds.length} sales entries and cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/sales/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          salesIds: entry.salesIds,
          date: entry.date
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Successfully deleted ${result.deletedCount} sales entries for ${entry.driverName}`
        });
        await loadSalesData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sales');
      }
    } catch (error) {
      console.error('Failed to delete daily sales:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sales",
        variant: "destructive"
      });
    }
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading sales data...</span>
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
    totalCylinderDeposited: 0 
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('salesManagement')}</h1>
          <p className="text-muted-foreground">Record and track daily sales performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => loadSalesData(true)}
            variant="outline"
            className="flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowNewSaleForm(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('create')} {t('sales')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('packageSale')}</p>
              <p className="text-2xl font-bold text-foreground">{summary.totalPackageSales}</p>
              <p className="text-xs text-muted-foreground">Cylinders sold</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">{t('refillSale')}</p>
              <p className="text-2xl font-bold text-foreground">{summary.totalRefillSales}</p>
              <p className="text-xs text-muted-foreground">Cylinders refilled</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalSalesValue)}</p>
              <p className="text-xs text-muted-foreground">Sales value</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6 border border-border transition-colors">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Cash Collected</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalCashDeposited)}</p>
              <p className="text-xs text-muted-foreground">Cash deposited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-lg shadow border border-border transition-colors">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">Today's Sales</h2>
            {refreshing && (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Refreshing...
              </div>
            )}
            {lastUpdated && !refreshing && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('drivers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('packageSale')} ({t('quantity')})</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('refillSale')} ({t('quantity')})</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('totalValue')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('discount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Cash Deposited</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Cylinder Deposited</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dailySummary.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    {t('noDataFound')}. {t('create')} {t('sales')} {t('add')}.
                  </td>
                </tr>
              ) : (
                dailySummary.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {entry.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {entry.packageSalesQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {entry.refillSalesQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {formatCurrency(entry.totalSalesValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatCurrency(entry.totalDiscount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatCurrency(entry.totalCashDeposited)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entry.totalCylinderDeposited}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                        <span className="text-muted-foreground text-xs">Read only</span>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('create')} {t('sales')}</DialogTitle>
          </DialogHeader>
          <CombinedSaleForm
            onSubmit={handleCreateSale}
            onCancel={() => setShowNewSaleForm(false)}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Daily Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => { setEditingEntry(null); setEditingEntryData(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sales Entry - {editingEntry?.driverName}</DialogTitle>
          </DialogHeader>
          {loadingEditData ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading entry data...</span>
            </div>
          ) : editingEntryData ? (
            <CombinedSaleForm
              onSubmit={handleEditEntrySubmit}
              onCancel={() => { setEditingEntry(null); setEditingEntryData(null); }}
              loading={submitting}
              initialData={editingEntryData}
            />
          ) : editingEntry ? (
            <div className="p-4 text-center">
              <p className="text-gray-600 mb-4">Failed to load entry data for editing.</p>
              <Button 
                variant="outline" 
                onClick={() => setEditingEntry(null)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}