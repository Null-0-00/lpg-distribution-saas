'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaleType, PaymentType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertTriangle,
  Plus,
  Minus,
  Package,
  RefreshCw,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface SaleItem {
  productId: string;
  packageSale: number;
  refillSale: number;
  packagePrice: number;
  refillPrice: number;
}

const combinedSaleFormSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  customerName: z.string().optional(),
  saleItems: z
    .array(
      z
        .object({
          productId: z.string().min(1, 'Product is required'),
          packageSale: z.number().min(0, 'Package sale cannot be negative'),
          refillSale: z.number().min(0, 'Refill sale cannot be negative'),
          packagePrice: z.number().min(0, 'Package price cannot be negative'),
          refillPrice: z.number().min(0, 'Refill price cannot be negative'),
        })
        .refine(
          (item) => {
            // If there's a package sale, price must be > 0
            if (item.packageSale > 0 && item.packagePrice <= 0) {
              return false;
            }
            // If there's a refill sale, price must be > 0
            if (item.refillSale > 0 && item.refillPrice <= 0) {
              return false;
            }
            // At least one sale (package or refill) must have quantity > 0
            if (item.packageSale === 0 && item.refillSale === 0) {
              return false;
            }
            return true;
          },
          {
            message:
              'Each item must have quantity > 0 and corresponding price > 0',
          }
        )
    )
    .min(1, 'At least one sale item is required'),
  paymentType: z.nativeEnum(PaymentType),
  discount: z.number().min(0, 'Discount cannot be negative'),
  cashDeposited: z.number().min(0, 'Cash deposited cannot be negative'),
  cylinderDeposits: z
    .record(
      z.string(),
      z.number().int().min(0, 'Cylinder deposits cannot be negative')
    )
    .optional(),
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

interface CombinedSaleFormProps {
  onSubmit: (data: z.infer<typeof combinedSaleFormSchema>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<z.infer<typeof combinedSaleFormSchema>>;
}

export function CombinedSaleForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: CombinedSaleFormProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { formatCurrency, t } = useSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof combinedSaleFormSchema>>({
    resolver: zodResolver(combinedSaleFormSchema),
    defaultValues: initialData || {
      paymentType: PaymentType.CASH,
      discount: 0,
      cashDeposited: 0,
      cylinderDeposits: {},
      saleItems: [
        {
          productId: '',
          packageSale: 0,
          refillSale: 0,
          packagePrice: 0,
          refillPrice: 0,
        },
      ],
    },
  });

  const watchedValues = watch();
  const saleItems = watchedValues.saleItems || [];

  // Calculate totals and collect sizes
  const calculateTotals = () => {
    let totalValue = 0;
    let totalRefillQuantity = 0;
    let totalPackageQuantity = 0;
    let totalQuantity = 0;
    const refillQuantitiesBySize: { [size: string]: number } = {};

    saleItems.forEach((item) => {
      const packageValue = (item.packageSale || 0) * (item.packagePrice || 0);
      const refillValue = (item.refillSale || 0) * (item.refillPrice || 0);

      totalValue += packageValue + refillValue;
      totalPackageQuantity += item.packageSale || 0;
      totalRefillQuantity += item.refillSale || 0;
      totalQuantity += (item.packageSale || 0) + (item.refillSale || 0);

      // Track refill quantities by cylinder size
      if (item.refillSale > 0 && item.productId) {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.size) {
          refillQuantitiesBySize[product.size] =
            (refillQuantitiesBySize[product.size] || 0) + item.refillSale;
        }
      }
    });

    const totalDiscount = watchedValues.discount || 0;
    const netValue = totalValue - totalDiscount;

    return {
      totalValue,
      totalDiscount,
      netValue,
      totalRefillQuantity,
      totalPackageQuantity,
      totalQuantity,
      refillQuantitiesBySize,
    };
  };

  const totals = calculateTotals();

  // Load drivers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [driversRes, productsRes] = await Promise.all([
          fetch('/api/drivers?active=true&driverType=RETAIL'),
          fetch('/api/products?inventory=true'),
        ]);

        if (driversRes.ok && productsRes.ok) {
          const driversData = await driversRes.json();
          const productsData = await productsRes.json();
          setDrivers(driversData.drivers);
          setProducts(productsData.products);
        }
      } catch (loadError) {
        console.error('Failed to load form data:', loadError);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Handle product selection change
  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      setValue(`saleItems.${index}.productId`, productId);

      if (productId) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          setValue(`saleItems.${index}.packagePrice`, product.currentPrice);
          setValue(`saleItems.${index}.refillPrice`, product.currentPrice);
        }
      }
    },
    [setValue, products]
  );

  // Auto-adjust cash deposited for cash payments
  useEffect(() => {
    if (watchedValues.paymentType === PaymentType.CASH && totals.netValue > 0) {
      setValue('cashDeposited', totals.netValue);
    }
  }, [watchedValues.paymentType, totals.netValue, setValue]);

  const addSaleItem = () => {
    const newItem = {
      productId: '',
      packageSale: 0,
      refillSale: 0,
      packagePrice: 0,
      refillPrice: 0,
    };
    setValue('saleItems', [...saleItems, newItem]);
  };

  const removeSaleItem = (index: number) => {
    if (saleItems.length > 1) {
      setValue(
        'saleItems',
        saleItems.filter((_, i) => i !== index)
      );
    }
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const handleFormSubmit = async (
    data: z.infer<typeof combinedSaleFormSchema>
  ) => {
    try {
      await onSubmit(data);
      reset();
    } catch (submitError) {
      throw submitError;
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Driver Selection */}
      <div className="space-y-2">
        <Label htmlFor="driverId">{t('drivers')} *</Label>
        <Select
          value={watchedValues.driverId || ''}
          onValueChange={(value) => setValue('driverId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a driver" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{driver.name}</span>
                  {driver.route && (
                    <span className="text-sm text-gray-500">
                      {driver.route}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.driverId && (
          <p className="text-sm text-red-600">{errors.driverId.message}</p>
        )}
      </div>

      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customerName">{t('customerName')}</Label>
        <Input
          id="customerName"
          {...register('customerName')}
          placeholder="Enter customer name (for receivables tracking)"
        />
        {errors.customerName && (
          <p className="text-sm text-red-600">{errors.customerName.message}</p>
        )}
      </div>

      {/* Sale Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            Sale Items
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSaleItem}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('add')}
          </Button>
        </div>

        {saleItems.map((item, index) => {
          const product = getProductById(item.productId);

          return (
            <div
              key={index}
              className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <h4 className="flex items-center font-medium text-gray-900 dark:text-white">
                  <Package className="mr-2 h-4 w-4" />
                  Item {index + 1}
                </h4>
                {saleItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSaleItem(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>{t('productManagement')} *</Label>
                <Select
                  value={item.productId || ''}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {product.fullName}
                          </span>
                          {product.inventory && (
                            <span
                              className={`text-sm ${product.inventory.isLowStock ? 'text-red-500' : 'text-green-600'}`}
                            >
                              {product.inventory.fullCylinders} available
                              {product.inventory.isLowStock && ' (Low Stock!)'}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.saleItems?.[index]?.productId && (
                  <p className="text-sm text-red-600">
                    {errors.saleItems[index]?.productId?.message}
                  </p>
                )}
              </div>

              {/* Low Stock Warning */}
              {product?.inventory?.isLowStock && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Warning: This product is running low on stock (
                    {product.inventory.fullCylinders} cylinders remaining).
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Package Sale */}
                <div className="space-y-2">
                  <Label>{t('packageSale')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    {...register(`saleItems.${index}.packageSale`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.saleItems?.[index]?.packageSale && (
                    <p className="text-sm text-red-600">
                      {errors.saleItems[index]?.packageSale?.message}
                    </p>
                  )}
                </div>

                {/* Refill Sale */}
                <div className="space-y-2">
                  <Label>{t('refillSale')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    {...register(`saleItems.${index}.refillSale`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.saleItems?.[index]?.refillSale && (
                    <p className="text-sm text-red-600">
                      {errors.saleItems[index]?.refillSale?.message}
                    </p>
                  )}
                </div>

                {/* Package Price */}
                <div className="space-y-2">
                  <Label>Package Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`saleItems.${index}.packagePrice`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.saleItems?.[index]?.packagePrice && (
                    <p className="text-sm text-red-600">
                      {errors.saleItems[index]?.packagePrice?.message}
                    </p>
                  )}
                </div>

                {/* Refill Price */}
                <div className="space-y-2">
                  <Label>Refill Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`saleItems.${index}.refillPrice`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.saleItems?.[index]?.refillPrice && (
                    <p className="text-sm text-red-600">
                      {errors.saleItems[index]?.refillPrice?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Item Total Value */}
              <div className="space-y-2">
                <Label>Item Total</Label>
                <div className="rounded-md border border-gray-300 bg-white p-2 text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {formatCurrency(
                    (item.packageSale || 0) * (item.packagePrice || 0) +
                      (item.refillSale || 0) * (item.refillPrice || 0)
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {errors.saleItems && (
          <p className="text-sm text-red-600">{errors.saleItems.message}</p>
        )}
      </div>

      {/* Totals Summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
          Sale Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('total')} {t('quantity')}:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {totals.totalQuantity}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Total Value:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalValue)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Total Discount:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalDiscount)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Net Value:</span>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.netValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type *</Label>
            <Select
              value={watchedValues.paymentType || ''}
              onValueChange={(value) =>
                setValue('paymentType', value as PaymentType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentType.CASH}>Cash</SelectItem>
                <SelectItem value={PaymentType.BANK_TRANSFER}>
                  Bank Transfer
                </SelectItem>
                <SelectItem value={PaymentType.MFS}>
                  MFS (Mobile Financial Service)
                </SelectItem>
                <SelectItem value={PaymentType.CREDIT}>Credit</SelectItem>
                <SelectItem value={PaymentType.CYLINDER_CREDIT}>
                  Cylinder Credit
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentType && (
              <p className="text-sm text-red-600">
                {errors.paymentType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">{t('discount')}</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              {...register('discount', { valueAsNumber: true })}
            />
            {errors.discount && (
              <p className="text-sm text-red-600">{errors.discount.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cashDeposited">Cash Deposited</Label>
            <Input
              id="cashDeposited"
              type="number"
              min="0"
              step="0.01"
              {...register('cashDeposited', { valueAsNumber: true })}
            />
            {errors.cashDeposited && (
              <p className="text-sm text-red-600">
                {errors.cashDeposited.message}
              </p>
            )}
          </div>

          {Object.keys(totals.refillQuantitiesBySize).length > 0 && (
            <div className="col-span-1 space-y-4 md:col-span-2">
              <Label className="text-base font-semibold">
                Cylinder Deposits by Size
              </Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(totals.refillQuantitiesBySize).map(
                  ([size, maxQuantity]) => (
                    <div key={size} className="space-y-2">
                      <Label htmlFor={`cylinderDeposit-${size}`}>
                        {size} Cylinders Deposited
                        <span className="ml-1 text-sm text-gray-500">
                          (max: {maxQuantity})
                        </span>
                      </Label>
                      <Input
                        id={`cylinderDeposit-${size}`}
                        type="number"
                        min="0"
                        max={maxQuantity}
                        value={watchedValues.cylinderDeposits?.[size] || 0}
                        onChange={(e) => {
                          const currentDeposits =
                            watchedValues.cylinderDeposits || {};
                          setValue('cylinderDeposits', {
                            ...currentDeposits,
                            [size]: parseInt(e.target.value) || 0,
                          });
                        }}
                      />
                      {errors.cylinderDeposits?.[size] && (
                        <p className="text-sm text-red-600">
                          {errors.cylinderDeposits[size]?.message}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or comments..."
          {...register('notes')}
        />
      </div>

      {/* Credit Warnings */}
      {totals.netValue > (watchedValues.cashDeposited || 0) && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            This sale will create a cash receivable of{' '}
            {formatCurrency(
              totals.netValue - (watchedValues.cashDeposited || 0)
            )}
            {watchedValues.customerName
              ? ` for customer: ${watchedValues.customerName}`
              : ' (Customer name recommended for tracking)'}
            .
          </AlertDescription>
        </Alert>
      )}

      {(() => {
        const totalCylinderDeposits = Object.values(
          watchedValues.cylinderDeposits || {}
        ).reduce((sum, count) => sum + count, 0);
        const hasCylinderReceivables =
          totals.totalRefillQuantity > totalCylinderDeposits;

        if (totals.totalRefillQuantity > 0 && hasCylinderReceivables) {
          const receivablesBySizeList = Object.entries(
            totals.refillQuantitiesBySize
          )
            .map(([size, refillQty]) => {
              const deposited = watchedValues.cylinderDeposits?.[size] || 0;
              const receivable = refillQty - deposited;
              return receivable > 0 ? `${receivable} x ${size}` : null;
            })
            .filter(Boolean);

          return (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                This sale will create cylinder receivables:{' '}
                {receivablesBySizeList.join(', ')}
                {watchedValues.customerName
                  ? ` for customer: ${watchedValues.customerName}`
                  : ' (Customer name recommended for tracking)'}
                .
              </AlertDescription>
            </Alert>
          );
        }
        return null;
      })()}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('create')} {t('sales')}
        </Button>
      </div>
    </form>
  );
}
