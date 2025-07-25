'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2, User, Phone, MapPin, Mail } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

// Create a function to generate schema with translations
const createDriverFormSchema = (t: (key: any) => string) =>
  z.object({
    name: z
      .string()
      .min(2, t('nameMustBeAtLeast2Characters'))
      .max(50, t('nameTooLong')),
    phone: z
      .string()
      .min(10, t('phoneNumberMustBeAtLeast10Digits'))
      .max(15, t('phoneNumberTooLong')),
    email: z
      .string()
      .email(t('invalidEmailAddress'))
      .optional()
      .or(z.literal('')),
    licenseNumber: z
      .string()
      .min(5, t('licenseNumberMustBeAtLeast5Characters'))
      .max(20, t('licenseNumberTooLong'))
      .optional()
      .or(z.literal('')),
    address: z
      .string()
      .min(10, t('addressMustBeAtLeast10Characters'))
      .max(200, t('addressTooLong'))
      .optional()
      .or(z.literal('')),
    area: z
      .string()
      .min(2, t('areaMustBeAtLeast2Characters'))
      .max(50, t('areaTooLong'))
      .optional()
      .or(z.literal('')),
    emergencyContact: z
      .string()
      .min(10, t('emergencyContactMustBeAtLeast10Digits'))
      .max(15, t('emergencyContactTooLong'))
      .optional()
      .or(z.literal('')),
    emergencyContactName: z
      .string()
      .min(2, t('emergencyContactNameMustBeAtLeast2Characters'))
      .max(50, t('nameTooLong'))
      .optional()
      .or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
      message: t('statusIsRequired'),
    }),
    driverType: z.enum(['RETAIL', 'SHIPMENT'], {
      message: t('driverTypeIsRequired'),
    }),
    notes: z.string().optional(),
  });

type DriverFormData = {
  name: string;
  phone: string;
  email?: string;
  licenseNumber?: string;
  address?: string;
  area?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  driverType: 'RETAIL' | 'SHIPMENT';
  notes?: string;
};

interface AddDriverFormProps {
  onSubmit: (data: DriverFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<DriverFormData>;
}

export function AddDriverForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: AddDriverFormProps) {
  const { t } = useSettings();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(createDriverFormSchema(t)),
    defaultValues: {
      status: 'ACTIVE',
      driverType: 'RETAIL',
      email: '',
      notes: '',
      ...initialData,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: DriverFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in parent component
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('personalInformation')}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName')} *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="name"
                placeholder={t('enterFullName')}
                className="pl-10"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phoneNumber')} *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="phone"
                placeholder={t('enterPhoneNumber')}
                className="pl-10"
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder={t('enterEmailAddress')}
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">{t('licenseNumber')}</Label>
            <Input
              id="licenseNumber"
              placeholder={t('enterLicenseNumber')}
              {...register('licenseNumber')}
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.licenseNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Driver Type */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('driverType')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="driverType">{t('driverType')} *</Label>
          <Select
            value={watchedValues.driverType || 'RETAIL'}
            onValueChange={(value) =>
              setValue('driverType', value as 'RETAIL' | 'SHIPMENT')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectDriverType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RETAIL">{t('retailDriver')}</SelectItem>
              <SelectItem value="SHIPMENT">{t('shipmentDrivers')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.driverType && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.driverType.message}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {watchedValues.driverType === 'RETAIL'
              ? t('retailDriverDescription')
              : t('shipmentDriverDescription')}
          </p>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('locationInformation')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="address">{t('address')}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Textarea
              id="address"
              placeholder={t('enterFullAddress')}
              className="resize-none pl-10"
              rows={3}
              {...register('address')}
            />
          </div>
          {errors.address && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">{t('assignedArea')}</Label>
          <Input
            id="area"
            placeholder={t('enterAssignedAreaRoute')}
            {...register('area')}
          />
          {errors.area && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.area.message}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('emergencyContact')}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">{t('contactName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="emergencyContactName"
                placeholder={t('enterEmergencyContactName')}
                className="pl-10"
                {...register('emergencyContactName')}
              />
            </div>
            {errors.emergencyContactName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">{t('contactNumber')}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="emergencyContact"
                placeholder={t('enterEmergencyContactNumber')}
                className="pl-10"
                {...register('emergencyContact')}
              />
            </div>
            {errors.emergencyContact && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.emergencyContact.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status and Notes */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          {t('statusAndNotes')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="status">{t('status')} *</Label>
          <Select
            value={watchedValues.status || 'ACTIVE'}
            onValueChange={(value) =>
              setValue('status', value as 'ACTIVE' | 'INACTIVE')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">{t('active')}</SelectItem>
              <SelectItem value="INACTIVE">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t('notes')}</Label>
          <Textarea
            id="notes"
            placeholder={t('additionalNotesComments')}
            rows={3}
            {...register('notes')}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? t('updateDriver') : t('addDriver')}
        </Button>
      </div>
    </form>
  );
}
