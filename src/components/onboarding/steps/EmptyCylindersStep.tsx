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
import { Cylinder } from 'lucide-react';

interface EmptyCylindersStepProps {
  cylinderSizes: Array<{ size: string; description?: string }>;
  emptyCylinders: Array<{
    cylinderSizeId: string;
    quantity: number;
  }>;
  onUpdate: (
    emptyCylinders: Array<{
      cylinderSizeId: string;
      quantity: number;
    }>
  ) => void;
}

export function EmptyCylindersStep({
  cylinderSizes,
  emptyCylinders,
  onUpdate,
}: EmptyCylindersStepProps) {
  const { t } = useSettings();

  useEffect(() => {
    if (cylinderSizes.length > 0 && emptyCylinders.length === 0) {
      const initialEmptyCylinders = cylinderSizes.map((_, index) => ({
        cylinderSizeId: index.toString(),
        quantity: 0,
      }));
      onUpdate(initialEmptyCylinders);
    }
  }, [cylinderSizes, emptyCylinders, onUpdate]);

  const updateQuantity = (sizeIndex: number, quantity: number) => {
    const updatedEmptyCylinders = emptyCylinders.map((item, index) =>
      index === sizeIndex ? { ...item, quantity: Math.max(0, quantity) } : item
    );
    onUpdate(updatedEmptyCylinders);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Cylinder className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('setEmptyCylinderInventory')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('enterCurrentEmptyCylinderQuantities')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('emptyCylinderInventory')}
          </CardTitle>
          <CardDescription>{t('enterQuantityForEachSize')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ {t('emptyCylinderNote')}</strong>
            </p>
          </div>
          <div className="space-y-4">
            {cylinderSizes.map((size, index) => (
              <div
                key={index}
                className="bg-muted grid grid-cols-1 gap-4 rounded-lg p-4 md:grid-cols-2"
              >
                <div className="space-y-1">
                  <Label className="font-medium">{size.size}</Label>
                  {size.description && (
                    <p className="text-muted-foreground text-sm">
                      {size.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`empty-quantity-${index}`}>
                    {t('emptyCylinders')}
                  </Label>
                  <Input
                    id={`empty-quantity-${index}`}
                    type="number"
                    min="0"
                    value={emptyCylinders[index]?.quantity || 0}
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

      {cylinderSizes.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <Cylinder className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('noCylinderSizesAvailable')}</p>
          <p className="text-sm">{t('addCylinderSizesFirst')}</p>
        </div>
      )}

      {emptyCylinders.length > 0 && (
        <div className="text-muted-foreground text-center text-sm">
          <p>
            {t('totalSizes')}: {cylinderSizes.length}
          </p>
          <p>
            {t('totalEmptyCylinders')}:{' '}
            {emptyCylinders.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
      )}
    </div>
  );
}
