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
import { Package2 } from 'lucide-react';

interface InventoryStepProps {
  products: Array<{
    name: string;
    companyId: string;
    cylinderSizeId: string;
    currentPrice: number;
  }>;
  inventory: Array<{
    productId: string;
    fullCylinders: number;
  }>;
  onUpdate: (
    inventory: Array<{
      productId: string;
      fullCylinders: number;
    }>
  ) => void;
}

export function InventoryStep({
  products,
  inventory,
  onUpdate,
}: InventoryStepProps) {
  const { t } = useSettings();

  useEffect(() => {
    if (products.length > 0 && inventory.length === 0) {
      const initialInventory = products.map((_, index) => ({
        productId: index.toString(),
        fullCylinders: 0,
      }));
      onUpdate(initialInventory);
    }
  }, [products, inventory, onUpdate]);

  const updateQuantity = (productIndex: number, quantity: number) => {
    const updatedInventory = inventory.map((item, index) =>
      index === productIndex
        ? { ...item, fullCylinders: Math.max(0, quantity) }
        : item
    );
    onUpdate(updatedInventory);
  };

  const getCompanyName = (companyId: string) => {
    // This is a placeholder - in real implementation you'd have company data
    return `${t('company')} ${parseInt(companyId) + 1}`;
  };

  const getCylinderSize = (cylinderSizeId: string) => {
    // This is a placeholder - in real implementation you'd have cylinder size data
    return `${t('size')} ${parseInt(cylinderSizeId) + 1}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <Package2 className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('setInitialInventory')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('enterCurrentFullCylinderQuantities')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('fullCylinderInventory')}
          </CardTitle>
          <CardDescription>{t('enterQuantityForEachProduct')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-muted grid grid-cols-1 gap-4 rounded-lg p-4 md:grid-cols-2"
              >
                <div className="space-y-1">
                  <Label className="font-medium">{product.name}</Label>
                  <p className="text-muted-foreground text-sm">
                    {getCompanyName(product.companyId)} •{' '}
                    {getCylinderSize(product.cylinderSizeId)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>
                    {t('fullCylinders')}
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    value={inventory[index]?.fullCylinders || 0}
                    onChange={(e) =>
                      updateQuantity(index, parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {products.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <Package2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('noProductsAvailable')}</p>
          <p className="text-sm">{t('addProductsFirst')}</p>
        </div>
      )}

      {inventory.length > 0 && (
        <div className="text-muted-foreground text-center text-sm">
          <p>
            {t('totalProducts')}: {products.length}
          </p>
          <p>
            {t('totalFullCylinders')}:{' '}
            {inventory.reduce((sum, item) => sum + item.fullCylinders, 0)}
          </p>
        </div>
      )}
    </div>
  );
}
