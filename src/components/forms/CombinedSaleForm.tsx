'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaleType, PaymentType } from '@prisma/client';
import { useSession } from 'next-auth/react';
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

// Create schema function that uses translations
const createCombinedSaleFormSchema = (t: (key: any) => string) =>
  z.object({
    driverId: z.string().min(1, t('driverRequired')),
    customerName: z.string().optional(),
    saleDate: z.string().optional(), // Optional for managers (will be auto-set to today), required for admins
    saleItems: z
      .array(
        z
          .object({
            productId: z.string().min(1, t('productRequired')),
            packageSale: z.number().min(0, t('packageSaleCannotBeNegative')),
            refillSale: z.number().min(0, t('refillSaleCannotBeNegative')),
            packagePrice: z.number().min(0, t('packagePriceCannotBeNegative')),
            refillPrice: z.number().min(0, t('refillPriceCannotBeNegative')),
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
              message: t('quantityAndPriceRequired'),
            }
          )
      )
      .min(1, t('atLeastOneSaleItemRequired')),
    paymentType: z.nativeEnum(PaymentType),
    discount: z.number().min(0, t('discountCannotBeNegative')),
    cashDeposited: z.number().min(0, t('cashDepositedCannotBeNegative')),
    cylinderDeposits: z
      .record(
        z.string(),
        z.number().int().min(0, t('cylinderDepositsCannotBeNegative'))
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
  onSubmit: (
    data: z.infer<ReturnType<typeof createCombinedSaleFormSchema>>
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<
    z.infer<ReturnType<typeof createCombinedSaleFormSchema>>
  >;
}

export function CombinedSaleForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: CombinedSaleFormProps) {
  const { data: session } = useSession();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { formatCurrency, t } = useSettings();

  // Check if user is admin (can select any date) or manager (restricted to today)
  const isAdmin = session?.user?.role === 'ADMIN';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Create schema with translations
  const combinedSaleFormSchema = createCombinedSaleFormSchema(t);

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
      saleDate: today, // Default to today for both admin and manager
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
          fetch(`/api/drivers?active=true&driverType=RETAIL&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }),
          fetch(`/api/products?inventory=true&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }),
        ]);

        if (driversRes.ok && productsRes.ok) {
          const driversData = await driversRes.json();
          const productsData = await productsRes.json();
          console.log(
            'CombinedSaleForm: Products loaded:',
            productsData.products?.length || 0
          );
          console.log(
            'CombinedSaleForm: Products data:',
            productsData.products
          );
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
    data: z.infer<ReturnType<typeof createCombinedSaleFormSchema>>
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
        <span className="ml-2">{t('loadingFormData')}</span>
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
            <SelectValue placeholder={t('selectADriver')} />
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
          placeholder={t('customerNamePlaceholder')}
        />
        {errors.customerName && (
          <p className="text-sm text-red-600">{errors.customerName.message}</p>
        )}
      </div>

      {/* Sale Date */}
      <div className="space-y-2">
        <Label htmlFor="saleDate">
          {t('saleDate')} *
          {!isAdmin && (
            <span className="ml-1 text-xs text-gray-500">
              ({t('fixedToToday')})
            </span>
          )}
        </Label>
        <Input
          id="saleDate"
          type="date"
          {...register('saleDate')}
          disabled={!isAdmin} // Managers cannot change the date
          className={!isAdmin ? 'cursor-not-allowed bg-gray-100' : ''}
        />
        {errors.saleDate && (
          <p className="text-sm text-red-600">{errors.saleDate.message}</p>
        )}
      </div>

      {/* Sale Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('saleItems')}
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
                  {t('itemNumber')} {index + 1}
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
                <Label>{t('product')} *</Label>
                <Select
                  value={item.productId || ''}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAProduct')} />
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
                              {product.inventory.fullCylinders} {t('available')}
                              {product.inventory.isLowStock &&
                                ` (${t('lowStockAlert')})`}
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
                    {t('lowStockWarning')} ({product.inventory.fullCylinders}{' '}
                    {t('cylindersRemaining')}).
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
                  <Label>{t('packagePrice')}</Label>
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
                  <Label>{t('refillPrice')}</Label>
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
                <Label>{t('itemTotal')}</Label>
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
          {t('saleSummary')}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('totalQuantityLabel')}:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {totals.totalQuantity}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('totalValueLabel')}:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalValue)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('totalDiscountLabel')}:
            </span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totals.totalDiscount)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('netValueLabel')}:
            </span>
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
            <Label htmlFor="paymentType">{t('paymentType')} *</Label>
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
                <SelectItem value={PaymentType.CASH}>{t('cash')}</SelectItem>
                <SelectItem value={PaymentType.BANK_TRANSFER}>
                  {t('bankTransfer')}
                </SelectItem>
                <SelectItem value={PaymentType.MFS}>
                  {t('mfs')} ({t('mobileFinancialService')})
                </SelectItem>
                <SelectItem value={PaymentType.CREDIT}>
                  {t('credit')}
                </SelectItem>
                <SelectItem value={PaymentType.CYLINDER_CREDIT}>
                  {t('cylinderCredit')}
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
            <Label htmlFor="cashDeposited">{t('cashDeposited')}</Label>
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
                {t('cylinderDepositsBySize')}
              </Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(totals.refillQuantitiesBySize).map(
                  ([size, maxQuantity]) => (
                    <div key={size} className="space-y-2">
                      <Label htmlFor={`cylinderDeposit-${size}`}>
                        {size} {t('cylindersDeposited')}
                        <span className="ml-1 text-sm text-gray-500">
                          ({t('maxQuantity')}: {maxQuantity})
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
        <Label htmlFor="notes">{t('additionalNotes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('additionalNotesPlaceholder')}
          {...register('notes')}
        />
      </div>

      {/* Credit Warnings */}
      {totals.netValue > (watchedValues.cashDeposited || 0) && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {t('cashReceivableWarning')}{' '}
            {formatCurrency(
              totals.netValue - (watchedValues.cashDeposited || 0)
            )}
            {watchedValues.customerName
              ? ` ${t('for')} ${t('customerName')}: ${watchedValues.customerName}`
              : ` (${t('customerNameRecommended')})`}
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
                {t('cylinderReceivableWarning')}{' '}
                {receivablesBySizeList.join(', ')}
                {watchedValues.customerName
                  ? ` ${t('for')} ${t('customerName')}: ${watchedValues.customerName}`
                  : ` (${t('customerNameRecommended')})`}
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
