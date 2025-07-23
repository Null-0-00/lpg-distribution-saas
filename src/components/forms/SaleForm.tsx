'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const saleFormSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  productId: z.string().min(1, 'Product is required'),
  customerName: z.string().optional(),
  saleType: z.nativeEnum(SaleType),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity too large'),
  unitPrice: z.number().min(0, 'Price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  paymentType: z.nativeEnum(PaymentType),
  cashDeposited: z.number().min(0, 'Cash deposited cannot be negative'),
  cylindersDeposited: z
    .number()
    .int()
    .min(0, 'Cylinders deposited cannot be negative'),
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

interface SaleFormProps {
  onSubmit: (data: z.infer<typeof saleFormSchema>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SaleForm({
  onSubmit,
  onCancel,
  loading = false,
}: SaleFormProps) {
  const { formatCurrency } = useSettings();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      discount: 0,
      cashDeposited: 0,
      cylindersDeposited: 0,
      paymentType: PaymentType.CASH,
      saleType: SaleType.PACKAGE,
    },
  });

  const watchedValues = watch();
  const totalValue =
    (watchedValues.quantity || 0) * (watchedValues.unitPrice || 0);
  const netValue = totalValue - (watchedValues.discount || 0);

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

  // Update unit price when product changes
  useEffect(() => {
    if (watchedValues.productId) {
      const product = products.find((p) => p.id === watchedValues.productId);
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

  const handleFormSubmit = async (data: z.infer<typeof saleFormSchema>) => {
    try {
      await onSubmit(data);
      reset();
      setSelectedProduct(null);
    } catch (submitError) {
      // Error handling is done in parent component
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
        <Label htmlFor="driverId">Driver *</Label>
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

      {/* Product Selection */}
      <div className="space-y-2">
        <Label htmlFor="productId">Product *</Label>
        <Select
          value={watchedValues.productId || ''}
          onValueChange={(value) => setValue('productId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{product.fullName}</span>
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
        {errors.productId && (
          <p className="text-sm text-red-600">{errors.productId.message}</p>
        )}
      </div>

      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          {...register('customerName')}
          placeholder="Enter customer name (for receivables tracking)"
        />
        {errors.customerName && (
          <p className="text-sm text-red-600">{errors.customerName.message}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Required for credit sales to track receivables by customer
        </p>
      </div>

      {/* Low Stock Warning */}
      {selectedProduct?.inventory?.isLowStock && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Warning: This product is running low on stock (
            {selectedProduct.inventory.fullCylinders} cylinders remaining).
          </AlertDescription>
        </Alert>
      )}

      {/* Sale Type and Quantity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="saleType">Sale Type *</Label>
          <Select
            value={watchedValues.saleType || ''}
            onValueChange={(value) => setValue('saleType', value as SaleType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SaleType.PACKAGE}>Package Sale</SelectItem>
              <SelectItem value={SaleType.REFILL}>Refill Sale</SelectItem>
            </SelectContent>
          </Select>
          {errors.saleType && (
            <p className="text-sm text-red-600">{errors.saleType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="1000"
            {...register('quantity', { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            {...register('unitPrice', { valueAsNumber: true })}
          />
          {errors.unitPrice && (
            <p className="text-sm text-red-600">{errors.unitPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Total Value</Label>
          <div className="rounded-md border bg-gray-50 p-2 font-semibold">
            {formatCurrency(totalValue)}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Discount</Label>
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

        <div className="space-y-2">
          <Label>Net Value</Label>
          <div className="rounded-md border bg-gray-50 p-2 font-semibold">
            {formatCurrency(netValue)}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
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
              <SelectItem value={PaymentType.CREDIT}>Credit</SelectItem>
              <SelectItem value={PaymentType.CYLINDER_CREDIT}>
                Cylinder Credit
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentType && (
            <p className="text-sm text-red-600">{errors.paymentType.message}</p>
          )}
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

          {watchedValues.saleType === SaleType.REFILL && (
            <div className="space-y-2">
              <Label htmlFor="cylindersDeposited">Cylinders Deposited</Label>
              <Input
                id="cylindersDeposited"
                type="number"
                min="0"
                max={watchedValues.quantity || 0}
                {...register('cylindersDeposited', { valueAsNumber: true })}
              />
              {errors.cylindersDeposited && (
                <p className="text-sm text-red-600">
                  {errors.cylindersDeposited.message}
                </p>
              )}
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
      {netValue > (watchedValues.cashDeposited || 0) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This sale will create a cash receivable of{' '}
            {formatCurrency(netValue - (watchedValues.cashDeposited || 0))}
            {watchedValues.customerName
              ? ` for customer: ${watchedValues.customerName}`
              : ' (Customer name recommended for tracking)'}
            .
          </AlertDescription>
        </Alert>
      )}

      {watchedValues.saleType === SaleType.REFILL &&
        (watchedValues.quantity || 0) >
          (watchedValues.cylindersDeposited || 0) && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This sale will create a cylinder receivable of{' '}
              {(watchedValues.quantity || 0) -
                (watchedValues.cylindersDeposited || 0)}{' '}
              cylinders
              {watchedValues.customerName
                ? ` for customer: ${watchedValues.customerName}`
                : ' (Customer name recommended for tracking)'}
              .
            </AlertDescription>
          </Alert>
        )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Sale
        </Button>
      </div>
    </form>
  );
}
