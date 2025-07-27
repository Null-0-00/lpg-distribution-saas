'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, X } from 'lucide-react';

interface CylinderReceivableBySize {
  cylinderSizeId: string;
  size: string;
  quantity: number;
}

interface ReceivablesStepProps {
  drivers: Array<{
    name: string;
    phone?: string;
    driverType?: string;
  }>;
  receivables: Array<{
    driverId: string;
    cashReceivables: number;
    cylinderReceivables: number;
    cylinderReceivablesBySizes?: CylinderReceivableBySize[];
  }>;
  cylinderSizes?: Array<{
    size: string;
    description?: string;
  }>;
  onUpdate: (
    receivables: Array<{
      driverId: string;
      cashReceivables: number;
      cylinderReceivables: number;
      cylinderReceivablesBySizes?: CylinderReceivableBySize[];
    }>
  ) => void;
}

export function ReceivablesStep({
  drivers,
  receivables,
  cylinderSizes: propCylinderSizes,
  onUpdate,
}: ReceivablesStepProps) {
  const { t, formatCurrency } = useSettings();
  const [cylinderSizes, setCylinderSizes] = useState<
    Array<{ id: string; size: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter to only show retail drivers (shipment drivers don't have customer receivables)
  const retailDrivers = drivers.filter(
    (driver) => driver.driverType === 'RETAIL' || !driver.driverType
  );

  // Fetch available cylinder sizes or use props
  useEffect(() => {
    if (propCylinderSizes && propCylinderSizes.length > 0) {
      // During onboarding, use cylinder sizes from props
      const formattedSizes = propCylinderSizes.map((size, index) => ({
        id: `temp-${index}`, // Temporary ID for onboarding
        size: size.size,
      }));
      setCylinderSizes(formattedSizes);
      setLoading(false);
    } else {
      // For existing users, fetch from API
      const fetchCylinderSizes = async () => {
        try {
          const response = await fetch('/api/cylinder-sizes');
          if (response.ok) {
            const data = await response.json();
            setCylinderSizes(data.cylinderSizes || []);
          }
        } catch (error) {
          console.error('Failed to fetch cylinder sizes:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCylinderSizes();
    }
  }, [propCylinderSizes]);

  useEffect(() => {
    if (retailDrivers.length > 0 && receivables.length === 0) {
      const initialReceivables = retailDrivers.map((retailDriver) => ({
        driverId: drivers.findIndex((d) => d === retailDriver).toString(),
        cashReceivables: 0,
        cylinderReceivables: 0,
        cylinderReceivablesBySizes: [],
      }));
      onUpdate(initialReceivables);
    }
  }, [drivers, retailDrivers, receivables, onUpdate]);

  const updateCashReceivables = (retailDriverIndex: number, amount: number) => {
    const updatedReceivables = [...receivables];
    if (updatedReceivables[retailDriverIndex]) {
      updatedReceivables[retailDriverIndex] = {
        ...updatedReceivables[retailDriverIndex],
        cashReceivables: Math.max(0, amount),
      };
      onUpdate(updatedReceivables);
    }
  };

  const updateCylinderReceivables = (
    retailDriverIndex: number,
    amount: number
  ) => {
    const updatedReceivables = [...receivables];
    if (updatedReceivables[retailDriverIndex]) {
      updatedReceivables[retailDriverIndex] = {
        ...updatedReceivables[retailDriverIndex],
        cylinderReceivables: Math.max(0, amount),
      };
      onUpdate(updatedReceivables);
    }
  };

  const addCylinderSizeReceivable = (retailDriverIndex: number) => {
    const updatedReceivables = [...receivables];
    if (updatedReceivables[retailDriverIndex]) {
      const existingSizes =
        updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes || [];
      const availableSize = cylinderSizes.find(
        (size) =>
          !existingSizes.some((existing) => existing.cylinderSizeId === size.id)
      );

      if (availableSize) {
        updatedReceivables[retailDriverIndex] = {
          ...updatedReceivables[retailDriverIndex],
          cylinderReceivablesBySizes: [
            ...existingSizes,
            {
              cylinderSizeId: availableSize.id,
              size: availableSize.size,
              quantity: 0,
            },
          ],
        };
        onUpdate(updatedReceivables);
      }
    }
  };

  const updateCylinderSizeReceivable = (
    retailDriverIndex: number,
    sizeIndex: number,
    quantity: number
  ) => {
    const updatedReceivables = [...receivables];
    if (
      updatedReceivables[retailDriverIndex] &&
      updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes
    ) {
      const sizesArray = [
        ...updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes!,
      ];
      sizesArray[sizeIndex] = {
        ...sizesArray[sizeIndex],
        quantity: Math.max(0, quantity),
      };

      updatedReceivables[retailDriverIndex] = {
        ...updatedReceivables[retailDriverIndex],
        cylinderReceivablesBySizes: sizesArray,
      };

      // Update total cylinder receivables
      const totalBySizes = sizesArray.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      updatedReceivables[retailDriverIndex].cylinderReceivables = totalBySizes;

      onUpdate(updatedReceivables);
    }
  };

  const removeCylinderSizeReceivable = (
    retailDriverIndex: number,
    sizeIndex: number
  ) => {
    const updatedReceivables = [...receivables];
    if (
      updatedReceivables[retailDriverIndex] &&
      updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes
    ) {
      const sizesArray = [
        ...updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes!,
      ];
      sizesArray.splice(sizeIndex, 1);

      updatedReceivables[retailDriverIndex] = {
        ...updatedReceivables[retailDriverIndex],
        cylinderReceivablesBySizes: sizesArray,
      };

      // Update total cylinder receivables
      const totalBySizes = sizesArray.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      updatedReceivables[retailDriverIndex].cylinderReceivables = totalBySizes;

      onUpdate(updatedReceivables);
    }
  };

  const changeCylinderSize = (
    retailDriverIndex: number,
    sizeIndex: number,
    newSizeId: string
  ) => {
    const updatedReceivables = [...receivables];
    if (
      updatedReceivables[retailDriverIndex] &&
      updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes
    ) {
      const sizesArray = [
        ...updatedReceivables[retailDriverIndex].cylinderReceivablesBySizes!,
      ];
      const newSize = cylinderSizes.find((size) => size.id === newSizeId);

      if (newSize) {
        sizesArray[sizeIndex] = {
          ...sizesArray[sizeIndex],
          cylinderSizeId: newSize.id,
          size: newSize.size,
        };

        updatedReceivables[retailDriverIndex] = {
          ...updatedReceivables[retailDriverIndex],
          cylinderReceivablesBySizes: sizesArray,
        };

        onUpdate(updatedReceivables);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CreditCard className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('setupReceivables')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('enterCurrentReceivablesForEachDriver')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('driverReceivables')}</CardTitle>
          <CardDescription>
            {t('enterCashAndCylinderReceivables')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {retailDrivers.map((driver, index) => (
              <div key={index} className="bg-muted space-y-4 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-medium">{driver.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {driver.phone && <span>{driver.phone}</span>}
                      {driver.phone && driver.driverType && ' • '}
                      <span className="font-medium text-emerald-600">
                        {driver.driverType === 'RETAIL'
                          ? t('retailDriver')
                          : t('retailDriver')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`cash-${index}`}>
                      {t('cashReceivables')} ({t('currency')})
                    </Label>
                    <Input
                      id={`cash-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={receivables[index]?.cashReceivables || 0}
                      onChange={(e) =>
                        updateCashReceivables(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                    <p className="text-muted-foreground text-xs">
                      {t('amountOwedByCustomers')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`cylinder-${index}`}>
                        {t('cylinderReceivables')} ({t('quantity')})
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCylinderSizeReceivable(index)}
                        disabled={loading || !cylinderSizes.length}
                        className="text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {t('addSize')}
                      </Button>
                    </div>

                    {/* Size-wise cylinder receivables */}
                    {receivables[index]?.cylinderReceivablesBySizes?.map(
                      (sizeReceivable, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="flex items-center gap-2 rounded-md bg-gray-50 p-2 dark:bg-gray-800"
                        >
                          <Select
                            value={sizeReceivable.cylinderSizeId}
                            onValueChange={(value) =>
                              changeCylinderSize(index, sizeIndex, value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cylinderSizes.map((size) => (
                                <SelectItem key={size.id} value={size.id}>
                                  {size.size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            min="0"
                            value={sizeReceivable.quantity}
                            onChange={(e) =>
                              updateCylinderSizeReceivable(
                                index,
                                sizeIndex,
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="flex-1"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeCylinderSizeReceivable(index, sizeIndex)
                            }
                            className="h-8 w-8 p-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    )}

                    {/* Total display */}
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {t('total')}:{' '}
                      {receivables[index]?.cylinderReceivables || 0}{' '}
                      {t('cylinders')}
                    </div>

                    <p className="text-muted-foreground text-xs">
                      {t('cylindersOwedByCustomersBySize')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {retailDrivers.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <CreditCard className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('noRetailDriversAvailable')}</p>
          <p className="text-sm">{t('addRetailDriversFirst')}</p>
        </div>
      )}

      {receivables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('receivablesSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    receivables.reduce(
                      (sum, item) => sum + item.cashReceivables,
                      0
                    )
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('totalCashReceivables')}
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-600">
                  {receivables.reduce(
                    (sum, item) => sum + item.cylinderReceivables,
                    0
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('totalCylinderReceivables')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
