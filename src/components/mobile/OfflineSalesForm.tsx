'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaleType, PaymentType } from '@prisma/client';
import { offlineStorage } from '@/lib/offline/storage';
import { MobileButton, MobileInput, MobileSelect, MobileTextarea, MobileCard } from '@/components/ui/mobile-optimized';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CloudOff, Loader2, AlertTriangle, Check, Mic } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const offlineSaleSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  productId: z.string().min(1, 'Product is required'),
  saleType: z.nativeEnum(SaleType),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Quantity too large'),
  unitPrice: z.number().min(0, 'Price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  paymentType: z.nativeEnum(PaymentType),
  cashDeposited: z.number().min(0, 'Cash deposited cannot be negative'),
  cylindersDeposited: z.number().int().min(0, 'Cylinders deposited cannot be negative'),
  notes: z.string().optional(),
});

interface Driver {
  id: string;
  name: string;
  phone?: string;
  route?: string;
}

interface Product {
  id: string;
  name: string;
  size: string;
  fullName: string;
  currentPrice: number;
  company: {
    id: string;
    name: string;
  };
  inventory?: {
    fullCylinders: number;
    isLowStock: boolean;
  };
}

interface OfflineSalesFormProps {
  onSubmit?: (data: z.infer<typeof offlineSaleSchema>) => Promise<void>;
  onCancel?: () => void;
}

export function OfflineSalesForm({ onSubmit, onCancel }: OfflineSalesFormProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { formatCurrency } = useSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<z.infer<typeof offlineSaleSchema>>({
    resolver: zodResolver(offlineSaleSchema),
    defaultValues: {
      discount: 0,
      cashDeposited: 0,
      cylindersDeposited: 0,
      paymentType: PaymentType.CASH,
      saleType: SaleType.PACKAGE
    }
  });

  const watchedValues = watch();
  const totalValue = (watchedValues.quantity || 0) * (watchedValues.unitPrice || 0);
  const netValue = totalValue - (watchedValues.discount || 0);

  // Load cached data for offline operation
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        setLoadingData(true);
        
        // Try to get data from cache first
        const cachedDrivers = await offlineStorage.getCachedData('active-drivers');
        const cachedProducts = await offlineStorage.getCachedData('products-inventory');
        
        if (cachedDrivers) {
          setDrivers(cachedDrivers);
        }
        
        if (cachedProducts) {
          setProducts(cachedProducts);
        }

        // If online, try to refresh data
        if (navigator.onLine) {
          try {
            const [driversRes, productsRes] = await Promise.all([
              fetch('/api/drivers?active=true&driverType=RETAIL'),
              fetch('/api/products?inventory=true')
            ]);

            if (driversRes.ok) {
              const driversData = await driversRes.json();
              setDrivers(driversData.drivers);
              await offlineStorage.cacheData('active-drivers', driversData.drivers, 'drivers', 86400000);
            }

            if (productsRes.ok) {
              const productsData = await productsRes.json();
              setProducts(productsData.products);
              await offlineStorage.cacheData('products-inventory', productsData.products, 'products', 3600000);
            }
          } catch (fetchError) {
            console.log('Failed to refresh data, using cached data');
          }
        }

        // Update sync status
        const syncStatus = await offlineStorage.getSyncStatus();
        setPendingSync(syncStatus.pendingItems);
        setLastSync(syncStatus.lastSync ? new Date(syncStatus.lastSync) : null);

      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadCachedData();

    // Listen for network changes
    const handleOnline = () => {
      setIsOnline(true);
      loadCachedData(); // Refresh data when coming online
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update unit price when product changes
  useEffect(() => {
    if (watchedValues.productId) {
      const product = products.find(p => p.id === watchedValues.productId);
      if (product) {
        setSelectedProduct(product);
        setValue('unitPrice', product.currentPrice);
      }
    }
  }, [watchedValues.productId, products, setValue]);

  // Auto-adjust cash deposited for cash payments
  useEffect(() => {
    if (watchedValues.paymentType === PaymentType.CASH && netValue > 0) {
      setValue('cashDeposited', netValue);
    }
  }, [watchedValues.paymentType, netValue, setValue]);

  const handleFormSubmit = async (data: z.infer<typeof offlineSaleSchema>) => {
    setLoading(true);
    
    try {
      const saleData = {
        ...data,
        timestamp: Date.now(),
        offline: !isOnline,
        deviceId: localStorage.getItem('deviceId') || 'unknown'
      };

      if (isOnline && onSubmit) {
        // Try online submission first
        try {
          await onSubmit(data);
          reset();
          setSelectedProduct(null);
          return;
        } catch (onlineError) {
          console.log('Online submission failed, storing offline');
        }
      }

      // Store offline
      const offlineId = await offlineStorage.storeOffline('sale', saleData);
      console.log('Sale stored offline with ID:', offlineId);

      // Update pending sync count
      const syncStatus = await offlineStorage.getSyncStatus();
      setPendingSync(syncStatus.pendingItems);

      // Reset form
      reset();
      setSelectedProduct(null);

      // Show success message
      alert(isOnline ? 
        'Sale created successfully!' : 
        'Sale saved offline. Will sync when connection is restored.'
      );

    } catch (error) {
      console.error('Failed to submit sale:', error);
      alert('Failed to save sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = (field: string) => (transcript: string) => {
    // Process voice input for different fields
    if (field === 'quantity') {
      const quantity = parseInt(transcript.replace(/\D/g, ''));
      if (!isNaN(quantity)) {
        setValue('quantity', quantity);
      }
    } else if (field === 'notes') {
      setValue('notes', transcript);
    }
  };

  const formatDriverOptions = () => {
    return drivers.map(driver => ({
      value: driver.id,
      label: `${driver.name}${driver.route ? ` - ${driver.route}` : ''}`
    }));
  };

  const formatProductOptions = () => {
    return products.map(product => ({
      value: product.id,
      label: `${product.fullName}${product.inventory ? ` (${product.inventory.fullCylinders} available)` : ''}`,
      disabled: product.inventory?.fullCylinders === 0
    }));
  };

  if (loadingData) {
    return (
      <MobileCard className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading form data...</p>
      </MobileCard>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Network Status */}
      <MobileCard padding="sm" className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          
          {pendingSync > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CloudOff className="h-3 w-3" />
              <span>{pendingSync} pending sync</span>
            </Badge>
          )}
        </div>
        
        {lastSync && (
          <p className="text-xs text-gray-500 mt-1">
            Last sync: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </MobileCard>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Driver Selection */}
        <MobileSelect
          label="Driver *"
          placeholder="Select a driver"
          options={formatDriverOptions()}
          value={watchedValues.driverId || ''}
          onChange={(value) => setValue('driverId', value)}
          error={errors.driverId?.message}
          searchable
        />

        {/* Product Selection */}
        <MobileSelect
          label="Product *"
          placeholder="Select a product"
          options={formatProductOptions()}
          value={watchedValues.productId || ''}
          onChange={(value) => setValue('productId', value)}
          error={errors.productId?.message}
          searchable
        />

        {/* Low Stock Warning */}
        {selectedProduct?.inventory?.isLowStock && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Warning: This product is running low on stock ({selectedProduct.inventory.fullCylinders} cylinders remaining).
            </AlertDescription>
          </Alert>
        )}

        {/* Sale Type and Quantity */}
        <div className="grid grid-cols-1 gap-4">
          <MobileSelect
            label="Sale Type *"
            options={[
              { value: SaleType.PACKAGE, label: 'Package Sale' },
              { value: SaleType.REFILL, label: 'Refill Sale' }
            ]}
            value={watchedValues.saleType || ''}
            onChange={(value) => setValue('saleType', value as SaleType)}
            error={errors.saleType?.message}
          />

          <MobileInput
            label="Quantity *"
            type="number"
            min="1"
            max="1000"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
            voiceInput
            onVoiceInput={handleVoiceInput('quantity')}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 gap-4">
          <MobileInput
            label="Unit Price *"
            type="number"
            min="0"
            step="0.01"
            {...register('unitPrice', { valueAsNumber: true })}
            error={errors.unitPrice?.message}
          />

          <MobileInput
            label="Discount"
            type="number"
            min="0"
            step="0.01"
            {...register('discount', { valueAsNumber: true })}
            error={errors.discount?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Net Value</label>
            <div className="h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
              <span className="text-lg font-semibold">{formatCurrency(netValue)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <MobileSelect
            label="Payment Type *"
            options={[
              { value: PaymentType.CASH, label: 'Cash' },
              { value: PaymentType.CREDIT, label: 'Credit' },
              { value: PaymentType.CYLINDER_CREDIT, label: 'Cylinder Credit' }
            ]}
            value={watchedValues.paymentType || ''}
            onChange={(value) => setValue('paymentType', value as PaymentType)}
            error={errors.paymentType?.message}
          />

          <div className="grid grid-cols-1 gap-4">
            <MobileInput
              label="Cash Deposited"
              type="number"
              min="0"
              step="0.01"
              {...register('cashDeposited', { valueAsNumber: true })}
              error={errors.cashDeposited?.message}
            />

            {watchedValues.saleType === SaleType.REFILL && (
              <MobileInput
                label="Cylinders Deposited"
                type="number"
                min="0"
                max={watchedValues.quantity || 0}
                {...register('cylindersDeposited', { valueAsNumber: true })}
                error={errors.cylindersDeposited?.message}
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <MobileTextarea
          label="Notes"
          placeholder="Additional notes or comments..."
          {...register('notes')}
          voiceInput
          onVoiceInput={handleVoiceInput('notes')}
        />

        {/* Credit Warnings */}
        {netValue > (watchedValues.cashDeposited || 0) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              This sale will create a cash receivable of {formatCurrency(netValue - (watchedValues.cashDeposited || 0))}.
            </AlertDescription>
          </Alert>
        )}

        {watchedValues.saleType === SaleType.REFILL && 
         (watchedValues.quantity || 0) > (watchedValues.cylindersDeposited || 0) && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This sale will create a cylinder receivable of {(watchedValues.quantity || 0) - (watchedValues.cylindersDeposited || 0)} cylinders.
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Mode Info */}
        {!isOnline && (
          <Alert className="border-blue-200 bg-blue-50">
            <CloudOff className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You're working offline. This sale will be saved locally and synced when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4 max-w-lg mx-auto">
            {onCancel && (
              <MobileButton 
                type="button" 
                variant="secondary" 
                size="lg"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </MobileButton>
            )}
            <MobileButton 
              type="submit" 
              variant="primary" 
              size="lg"
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : isOnline ? 'Create Sale' : 'Save Offline'}
            </MobileButton>
          </div>
        </div>
      </form>
    </div>
  );
}