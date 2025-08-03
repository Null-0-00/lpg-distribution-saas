'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Area {
  id: string;
  name: string;
  code?: string;
}

interface Driver {
  id: string;
  name: string;
  phone?: string;
}

interface Customer {
  id: string;
  name: string;
  customerCode?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  customerType: string;
  isActive: boolean;
  notes?: string;
  areaId: string;
  driverId?: string;
}

interface CustomerFormProps {
  customer?: Customer | null;
  areas: Area[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function CustomerForm({
  customer,
  areas,
  onSave,
  onCancel,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    areaId: '',
    driverId: '',
    name: '',
    customerCode: '',
    phone: '',
    alternatePhone: '',
    address: '',
    customerType: 'RETAIL',
    isActive: true,
    notes: '',
  });

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        areaId: customer.areaId || '',
        driverId: customer.driverId || '',
        name: customer.name || '',
        customerCode: customer.customerCode || '',
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        address: customer.address || '',
        customerType: customer.customerType || 'RETAIL',
        isActive: customer.isActive,
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await fetch('/api/drivers?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.areaId) {
      newErrors.areaId = 'Please select an area';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (
      formData.phone &&
      !/^(\+?88)?01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid Bangladesh phone number';
    }

    if (
      formData.alternatePhone &&
      !/^(\+?88)?01[3-9]\d{8}$/.test(formData.alternatePhone.replace(/\s/g, ''))
    ) {
      newErrors.alternatePhone = 'Please enter a valid Bangladesh phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      customerCode: formData.customerCode.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      alternatePhone: formData.alternatePhone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      driverId: formData.driverId || undefined,
    };

    onSave(submitData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="areaId">Area *</Label>
          <Select
            value={formData.areaId}
            onValueChange={(value) => handleChange('areaId', value)}
          >
            <SelectTrigger className={errors.areaId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name} {area.code && `(${area.code})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.areaId && (
            <p className="mt-1 text-sm text-red-500">{errors.areaId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="driverId">Driver</Label>
          <Select
            value={formData.driverId}
            onValueChange={(value) => handleChange('driverId', value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingDrivers ? 'Loading...' : 'Select driver (optional)'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No driver assigned</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name} {driver.phone && `(${driver.phone})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Customer Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter customer name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="customerCode">Customer Code</Label>
          <Input
            id="customerCode"
            value={formData.customerCode}
            onChange={(e) =>
              handleChange('customerCode', e.target.value.toUpperCase())
            }
            placeholder="Auto-generated if empty"
          />
        </div>

        <div>
          <Label htmlFor="customerType">Customer Type</Label>
          <Select
            value={formData.customerType}
            onValueChange={(value) => handleChange('customerType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="WHOLESALE">Wholesale</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="01XXXXXXXXX"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="alternatePhone">Alternate Phone</Label>
          <Input
            id="alternatePhone"
            value={formData.alternatePhone}
            onChange={(e) => handleChange('alternatePhone', e.target.value)}
            placeholder="01XXXXXXXXX"
            className={errors.alternatePhone ? 'border-red-500' : ''}
          />
          {errors.alternatePhone && (
            <p className="mt-1 text-sm text-red-500">{errors.alternatePhone}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Customer address (optional)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes (optional)"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleChange('isActive', e.target.checked)}
          className="border-border rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
