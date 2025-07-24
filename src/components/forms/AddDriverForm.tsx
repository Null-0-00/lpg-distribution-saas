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

const driverFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  licenseNumber: z
    .string()
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number too long')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address too long')
    .optional()
    .or(z.literal('')),
  area: z
    .string()
    .min(2, 'Area must be at least 2 characters')
    .max(50, 'Area too long')
    .optional()
    .or(z.literal('')),
  emergencyContact: z
    .string()
    .min(10, 'Emergency contact must be at least 10 digits')
    .max(15, 'Emergency contact too long')
    .optional()
    .or(z.literal('')),
  emergencyContactName: z
    .string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(50, 'Name too long')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    message: 'Status is required',
  }),
  driverType: z.enum(['RETAIL', 'SHIPMENT'], {
    message: 'Driver type is required',
  }),
  notes: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
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
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="name"
                placeholder="Enter full name"
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
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="phone"
                placeholder="Enter phone number"
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
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address (optional)"
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
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              placeholder="Enter license number"
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
          Driver Type
        </h3>

        <div className="space-y-2">
          <Label htmlFor="driverType">Driver Type *</Label>
          <Select
            value={watchedValues.driverType || 'RETAIL'}
            onValueChange={(value) =>
              setValue('driverType', value as 'RETAIL' | 'SHIPMENT')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select driver type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RETAIL">Retail Driver</SelectItem>
              <SelectItem value="SHIPMENT">Shipment Driver</SelectItem>
            </SelectContent>
          </Select>
          {errors.driverType && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.driverType.message}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {watchedValues.driverType === 'RETAIL'
              ? 'Retail drivers handle direct customer sales and deliveries'
              : 'Shipment drivers handle bulk transfers and warehouse operations'}
          </p>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          Location Information
        </h3>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Textarea
              id="address"
              placeholder="Enter full address"
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
          <Label htmlFor="area">Assigned Area</Label>
          <Input
            id="area"
            placeholder="Enter assigned area/route"
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
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Contact Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="emergencyContactName"
                placeholder="Enter emergency contact name"
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
            <Label htmlFor="emergencyContact">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
              <Input
                id="emergencyContact"
                placeholder="Enter emergency contact number"
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
          Status & Notes
        </h3>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watchedValues.status || 'ACTIVE'}
            onValueChange={(value) =>
              setValue('status', value as 'ACTIVE' | 'INACTIVE')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes or comments..."
            rows={3}
            {...register('notes')}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Driver' : 'Add Driver'}
        </Button>
      </div>
    </form>
  );
}
