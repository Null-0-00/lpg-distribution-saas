'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
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
import { Plus, X, Truck } from 'lucide-react';

interface DriversStepProps {
  drivers: Array<{
    name: string;
    phone?: string;
    driverType?: string;
  }>;
  onUpdate: (
    drivers: Array<{
      name: string;
      phone?: string;
      driverType?: string;
    }>
  ) => void;
}

export function DriversStep({ drivers, onUpdate }: DriversStepProps) {
  const { t } = useSettings();
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverType, setNewDriverType] = useState('RETAIL');
  const [errors, setErrors] = useState<string[]>([]);

  const addDriver = () => {
    if (!newDriverName.trim()) {
      setErrors([t('driverNameRequired')]);
      return;
    }

    if (
      drivers.some(
        (driver) => driver.name.toLowerCase() === newDriverName.toLowerCase()
      )
    ) {
      setErrors([t('driverAlreadyExists')]);
      return;
    }

    const newDrivers = [
      ...drivers,
      {
        name: newDriverName.trim(),
        phone: newDriverPhone.trim() || undefined,
        driverType: newDriverType,
      },
    ];
    onUpdate(newDrivers);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverType('RETAIL');
    setErrors([]);
  };

  const removeDriver = (index: number) => {
    const newDrivers = drivers.filter((_, i) => i !== index);
    onUpdate(newDrivers);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDriver();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <Truck className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('addYourDrivers')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('addDriversWhoWillSellProducts')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('addNewDriver')}</CardTitle>
          <CardDescription>{t('enterDriverInformation')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="driverName">{t('driverName')} *</Label>
              <Input
                id="driverName"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('enterDriverName')}
                className={errors.length > 0 ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">
                {t('phone')} ({t('optional')})
              </Label>
              <Input
                id="driverPhone"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('enterPhoneNumber')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverType">{t('driverType')} *</Label>
              <Select value={newDriverType} onValueChange={setNewDriverType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectDriverType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETAIL">{t('retailDriver')}</SelectItem>
                  <SelectItem value="SHIPMENT">
                    {t('shipmentDriver')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={addDriver}
              disabled={!newDriverName.trim()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('addDriver')}
            </Button>
          </div>
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </CardContent>
      </Card>

      {drivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {t('addedDrivers')}
              <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800">
                {drivers.length}
              </span>
            </CardTitle>
            <CardDescription>{t('driversInYourTeam')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drivers.map((driver, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                      <Truck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {driver.phone && <span>{driver.phone}</span>}
                        {driver.phone && driver.driverType && ' • '}
                        {driver.driverType && (
                          <span>
                            {driver.driverType === 'RETAIL'
                              ? t('retailDriver')
                              : t('shipmentDriver')}
                          </span>
                        )}
                        {!driver.phone && !driver.driverType && (
                          <span>{t('noContactInfo')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDriver(index)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {drivers.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <Truck className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('noDriversAdded')}</p>
          <p className="text-sm">{t('addAtLeastOneDriver')}</p>
        </div>
      )}
    </div>
  );
}
