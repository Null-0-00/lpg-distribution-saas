'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Calculator,
  DollarSign,
  Package,
  User,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  code?: string;
}

interface Customer {
  id: string;
  name: string;
  customerCode?: string;
  phone?: string;
  driver?: {
    id: string;
    name: string;
  };
}

interface CustomerReceivablesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomerReceivablesForm({
  isOpen,
  onClose,
  onSuccess,
}: CustomerReceivablesFormProps) {
  const { toast } = useToast();
  const { t, formatCurrency } = useSettings();

  const [areas, setAreas] = useState<Area[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cashReceivables, setCashReceivables] = useState<number>(0);
  const [cylinderReceivables, setCylinderReceivables] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const totalReceivables = cashReceivables + cylinderReceivables;

  useEffect(() => {
    if (isOpen) {
      fetchAreas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedAreaId) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setSelectedCustomerId('');
    }
  }, [selectedAreaId]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/customers?areaId=${selectedAreaId}&activeOnly=true`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: t('error'),
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      toast({
        title: t('error'),
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (totalReceivables <= 0) {
      toast({
        title: t('error'),
        description: 'Please enter receivable amounts',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/customers/receivables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          cashReceivables,
          cylinderReceivables,
          notes,
        }),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: 'Customer receivables updated successfully',
        });

        // Reset form
        setSelectedAreaId('');
        setSelectedCustomerId('');
        setCashReceivables(0);
        setCylinderReceivables(0);
        setNotes('');

        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || 'Failed to update receivables',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating receivables:', error);
      toast({
        title: t('error'),
        description: 'Failed to update receivables',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedAreaId('');
    setSelectedCustomerId('');
    setCashReceivables(0);
    setCylinderReceivables(0);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Update Customer Receivables
          </h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Step 1: Select Area */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              <MapPin className="mr-1 inline h-4 w-4" />
              Step 1: Select Area *
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
            >
              <option value="">Choose area first...</option>
              {areas &&
                areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} {area.code && `(${area.code})`}
                  </option>
                ))}
            </select>
            <p className="text-muted-foreground mt-1 text-xs">
              Select the area to show customers in that region
            </p>
          </div>

          {/* Step 2: Select Customer */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              <User className="mr-1 inline h-4 w-4" />
              Step 2: Select Customer *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              disabled={!selectedAreaId || loading}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {!selectedAreaId
                  ? 'Select area first...'
                  : loading
                    ? 'Loading customers...'
                    : 'Choose customer...'}
              </option>
              {customers &&
                customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}{' '}
                    {customer.customerCode && `(${customer.customerCode})`} -{' '}
                    {customer.driver?.name || 'No driver'}
                  </option>
                ))}
            </select>
            {selectedAreaId && customers.length === 0 && !loading && (
              <p className="mt-1 text-xs text-yellow-600">
                No active customers found in this area
              </p>
            )}
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="bg-muted rounded-lg p-3">
              <div className="text-sm">
                <div className="text-foreground font-medium">
                  {selectedCustomer.name}
                </div>
                {selectedCustomer.customerCode && (
                  <div className="text-muted-foreground">
                    Code: {selectedCustomer.customerCode}
                  </div>
                )}
                <div className="text-muted-foreground">
                  Driver: {selectedCustomer.driver?.name || 'Not assigned'}
                </div>
                {selectedCustomer.phone && (
                  <div className="text-muted-foreground">
                    Phone: {selectedCustomer.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cash Receivables */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              <DollarSign className="mr-1 inline h-4 w-4" />
              Cash Receivables (৳)
            </label>
            <input
              type="number"
              value={cashReceivables || ''}
              onChange={(e) =>
                setCashReceivables(parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="0.00"
            />
          </div>

          {/* Cylinder Receivables */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              <Package className="mr-1 inline h-4 w-4" />
              Cylinder Receivables (৳)
            </label>
            <input
              type="number"
              value={cylinderReceivables || ''}
              onChange={(e) =>
                setCylinderReceivables(parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="0.00"
            />
          </div>

          {/* Total Display */}
          {totalReceivables > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex items-center">
                <Calculator className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-foreground text-sm font-medium">
                  Total Receivables: {formatCurrency(totalReceivables)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="Optional notes about this receivable update..."
            />
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-0.5 h-4 w-4 text-yellow-600" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> This will update the customer's
                receivables and automatically send them a notification message
                if they have a phone number.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting || !selectedCustomerId || totalReceivables <= 0
            }
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            )}
            Update Receivables
          </button>
        </div>
      </div>
    </div>
  );
}
