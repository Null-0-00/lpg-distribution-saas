'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  X,
  Plus,
  Edit2,
  Trash2,
  Users,
  User,
  Package,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface CustomerReceivable {
  id: string;
  customerName: string;
  receivableType: 'CASH' | 'CYLINDER';
  amount: number;
  quantity: number;
  dueDate: string;
  status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'PAID';
  notes?: string;
}

interface DriverReceivable {
  id: string;
  driverName: string;
  totalCashReceivables: number; // From sales data
  totalCylinderReceivables: number; // From sales data
  cylinderSizeBreakdown: Record<string, number>; // From sales data - non-editable
  totalReceivables: number;
  salesCashReceivables: number; // For validation
  salesCylinderReceivables: number; // For validation
  customerCashTotal: number; // For validation
  customerCylinderTotal: number; // For validation
  hasValidationError: boolean;
  customerBreakdown: CustomerReceivable[];
}

interface ValidationError {
  driverId: string;
  driverName: string;
  cashMismatch: { customer: number; sales: number; difference: number } | null;
  cylinderMismatch: {
    customer: number;
    sales: number;
    difference: number;
  } | null;
  sizeValidationErrors: Array<{
    size: string;
    customer: number;
    expected: number;
  }> | null;
}

export default function ReceivablesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    formatCurrency,
    formatDate: globalFormatDate,
    formatDateTime,
    settings,
    t,
  } = useSettings();

  // Debug: Log current settings
  if (process.env.NODE_ENV === 'development') {
    console.log('Current settings:', settings);
  }
  const [driverReceivables, setDriverReceivables] = useState<
    DriverReceivable[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'receivables' | 'changes'>(
    'receivables'
  );
  const [changesLoading, setChangesLoading] = useState(false);
  const [receivablesChanges, setReceivablesChanges] = useState<any[]>([]);
  const [cylinderSizes, setCylinderSizes] = useState<
    Array<{ id: string; size: string }>
  >([]);

  const currentUserRole = session?.user?.role || 'MANAGER';

  // Helper function to format dates using global settings
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('noDate');
    try {
      // Debug logging (only during development)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'Formatting date:',
          dateString,
          typeof dateString,
          'Settings:',
          settings
        );
      }

      // Parse the date string - API returns YYYY-MM-DD format
      let date: Date;
      if (
        typeof dateString === 'string' &&
        dateString.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        // Explicit parsing for YYYY-MM-DD format to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed

        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Parsed date components:',
            { year, month: month - 1, day },
            'Result:',
            date
          );
        }
      } else {
        date = new Date(dateString);
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return t('invalidDate');
      }

      // Use global settings formatDate function with additional debugging
      const formatted = globalFormatDate(date);
      if (process.env.NODE_ENV === 'development') {
        console.log('Final formatted date:', formatted);
      }
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return t('invalidDate');
    }
  };

  // Helper function to format timestamps with date and time using global settings
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return t('noTimestamp');
    try {
      const date = new Date(timestamp);
      // Use global settings formatDateTime function
      return formatDateTime(date);
    } catch (error) {
      return t('invalidTimestamp');
    }
  };

  // Remove all the hardcoded demo data

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCylinderReturnModalOpen, setIsCylinderReturnModalOpen] =
    useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerReceivable | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerReceivable | null>(null);

  const [customerFormData, setCustomerFormData] = useState({
    customerName: '',
    receivableType: 'CASH' as 'CASH' | 'CYLINDER',
    amount: 0,
    quantity: 0,
    size: '',
    dueDate: '',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: '',
  });

  const [cylinderReturnData, setCylinderReturnData] = useState({
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    // Always auto-recalculate receivables on page load for fresh data
    const initializePage = async () => {
      console.log('🔄 Auto-recalculating receivables on page load...');
      try {
        const recalcResponse = await fetch(
          '/api/receivables/recalculate?days=3',
          {
            method: 'POST',
          }
        );

        if (recalcResponse.ok) {
          const result = await recalcResponse.json();
          console.log('✅ Auto-recalculation completed:', result.message);
          console.log('⚡ Performance:', result.performance);
        } else {
          console.warn(
            '⚠️ Auto-recalculation failed, continuing with existing data'
          );
        }
      } catch (error) {
        console.warn('⚠️ Auto-recalculation error:', error);
      }

      // Then fetch the updated data
      await fetchReceivables();
    };

    initializePage();
    fetchCylinderSizes();
  }, []);

  useEffect(() => {
    if (activeTab === 'changes') {
      fetchReceivablesChanges();
    }
  }, [activeTab]);

  const fetchCylinderSizes = async () => {
    try {
      const response = await fetch('/api/cylinder-sizes');
      if (response.ok) {
        const data = await response.json();
        setCylinderSizes(data.cylinderSizes || []);
      }
    } catch (error) {
      console.error(t('failedToFetchCylinderSizes'), error);
    }
  };

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receivables/customers', {
        cache: 'no-store', // Force fresh data but allow browser caching
        headers: {
          'Cache-Control': 'no-cache', // Force fresh data during debugging
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Debug: Check date formats in customer breakdown (development only)
        if (
          process.env.NODE_ENV === 'development' &&
          data.driverReceivables?.length > 0
        ) {
          console.log('Receivables API response:', data);
          data.driverReceivables.forEach((driver: any) => {
            if (driver.customerBreakdown?.length > 0) {
              driver.customerBreakdown.forEach((customer: any) => {
                if (customer.dueDate) {
                  console.log(
                    'Customer due date:',
                    customer.customerName,
                    customer.dueDate,
                    typeof customer.dueDate
                  );
                }
              });
            }
          });
        }

        setDriverReceivables(data.driverReceivables || []);
        setValidationErrors(data.validationErrors || []);
      } else {
        toast({
          title: t('error'),
          description: t('failedToFetchReceivables'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching receivables:', error);
      toast({
        title: t('error'),
        description: t('failedToFetchReceivables'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateReceivables = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/receivables/recalculate', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: t('success'),
          description:
            result.message || t('receivablesRecalculatedSuccessfully'),
        });
        // Refresh the receivables data
        await fetchReceivables();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || t('failedToRecalculateReceivables'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error recalculating receivables:', error);
      toast({
        title: t('error'),
        description: t('failedToRecalculateReceivables'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchReceivablesChanges = async () => {
    try {
      setChangesLoading(true);
      const response = await fetch('/api/receivables/changes');
      if (response.ok) {
        const data = await response.json();
        console.log('Changes API response:', data);
        setReceivablesChanges(data.changes || []);
      } else {
        const errorText = await response.text();
        console.error('Changes API error:', response.status, errorText);
        toast({
          title: t('error'),
          description: t('failedToFetchReceivablesChanges'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching receivables changes:', error);
      toast({
        title: t('error'),
        description: t('failedToFetchReceivablesChanges'),
        variant: 'destructive',
      });
    } finally {
      setChangesLoading(false);
    }
  };

  // Calculate totals
  const totalCashReceivables = driverReceivables.reduce(
    (sum, driver) => sum + driver.totalCashReceivables,
    0
  );
  const totalCylinderReceivables = driverReceivables.reduce(
    (sum, driver) => sum + driver.totalCylinderReceivables,
    0
  );
  const overdueCustomers = driverReceivables.flatMap((driver) =>
    driver.customerBreakdown.filter((customer) => customer.status === 'OVERDUE')
  );
  const overdueAmount = overdueCustomers.reduce(
    (sum, customer) => sum + customer.amount,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'DUE_SOON':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return t('current');
      case 'DUE_SOON':
        return t('dueSoon');
      case 'OVERDUE':
        return t('overdue');
      case 'PAID':
        return t('paid');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return <CheckCircle className="h-4 w-4" />;
      case 'DUE_SOON':
        return <Clock className="h-4 w-4" />;
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const openCustomerModal = (
    driverId: string,
    customer?: CustomerReceivable
  ) => {
    setSelectedDriver(driverId);
    if (customer) {
      setEditingCustomer(customer);
      setCustomerFormData({
        customerName: customer.customerName,
        receivableType: customer.receivableType,
        amount: customer.amount,
        quantity: customer.quantity,
        size: (customer as any).size || '',
        dueDate: customer.dueDate,
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setCustomerFormData({
        customerName: '',
        receivableType: 'CASH',
        amount: 0,
        quantity: 0,
        size: '',
        dueDate: '',
        notes: '',
      });
    }
    setIsCustomerModalOpen(true);
  };

  const openPaymentModal = (customer: CustomerReceivable) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: customer.amount,
      paymentMethod: 'cash',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const openCylinderReturnModal = (customer: CustomerReceivable) => {
    setSelectedCustomer(customer);
    setCylinderReturnData({
      quantity: customer.quantity,
      notes: '',
    });
    setIsCylinderReturnModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!selectedDriver || !customerFormData.customerName) return;

    try {
      setSubmitting(true);

      const url = editingCustomer
        ? `/api/receivables/customers/${editingCustomer.id}`
        : '/api/receivables/customers';

      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: selectedDriver,
          customerName: customerFormData.customerName,
          receivableType: customerFormData.receivableType,
          amount: customerFormData.amount,
          quantity: customerFormData.quantity,
          size:
            customerFormData.receivableType === 'CYLINDER'
              ? customerFormData.size
              : null,
          dueDate: customerFormData.dueDate,
          notes: customerFormData.notes,
        }),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: editingCustomer
            ? t('customerReceivableUpdatedSuccessfully')
            : t('customerReceivableAddedSuccessfully'),
        });

        // Refresh the receivables list
        await fetchReceivables();
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }

        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
        setSelectedDriver(null);
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || t('failedToSaveCustomerReceivable'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving customer receivable:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveCustomerReceivable'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (driverId: string, customerId: string) => {
    if (!confirm(t('areYouSureDeleteCustomerReceivable'))) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/receivables/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('customerReceivableDeletedSuccessfully'),
        });

        // Refresh the receivables list
        await fetchReceivables();
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description:
            errorData.error || 'Failed to delete customer receivable',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting customer receivable:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteCustomerReceivable'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || paymentData.amount <= 0) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/receivables/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerReceivableId: selectedCustomer.id,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
        }),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('paymentRecordedSuccessfully'),
        });

        // Refresh the receivables list
        await fetchReceivables();
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }

        setIsPaymentModalOpen(false);
        setSelectedCustomer(null);
        setPaymentData({ amount: 0, paymentMethod: 'cash', notes: '' });
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || 'Failed to record payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: t('error'),
        description: t('failedToRecordPayment'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCylinderReturn = async () => {
    if (!selectedCustomer || cylinderReturnData.quantity <= 0) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/receivables/cylinder-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerReceivableId: selectedCustomer.id,
          quantity: cylinderReturnData.quantity,
          notes: cylinderReturnData.notes,
        }),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('cylinderReturnRecordedSuccessfully'),
        });

        // Refresh the receivables list
        await fetchReceivables();
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }

        setIsCylinderReturnModalOpen(false);
        setSelectedCustomer(null);
        setCylinderReturnData({ quantity: 0, notes: '' });
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || 'Failed to record cylinder return',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error recording cylinder return:', error);
      toast({
        title: t('error'),
        description: t('failedToRecordCylinderReturn'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('receivableManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('drivers')} {t('receivables')} {t('customers')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">
              {t('users')} {t('type')}:
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                currentUserRole === 'ADMIN'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
              }`}
            >
              {currentUserRole}
            </span>
          </div>
          <button
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            onClick={recalculateReceivables}
            disabled={submitting}
            title="Receivables are automatically recalculated on every page load. Click to manually recalculate again."
          >
            {submitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            {t('recalculate')} {t('receivables')}
          </button>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center rounded-lg px-4 py-2"
            onClick={() =>
              toast({
                title: t('comingSoon'),
                description: t('exportReportFunctionality'),
                variant: 'default',
              })
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {t('exportReport')}
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
          <div className="mb-2 flex items-center">
            <AlertCircle className="text-destructive mr-2 h-5 w-5" />
            <span className="text-foreground font-medium">
              ⚠️ বৈধতা ত্রুটি: {t('customerReceivablesDontMatch')}
              sales-based totals
            </span>
          </div>
          <div className="ml-7 space-y-2">
            <p className="text-muted-foreground mb-2 text-xs">
              {t('driverTotalReceivablesFromSales')}.{' '}
              {t('customerReceivableTotalsMustEqual')}.
            </p>
            {validationErrors.map((error) => (
              <div
                key={error.driverId}
                className="bg-muted/50 rounded p-2 text-sm"
              >
                <strong className="text-foreground">{error.driverName}:</strong>
                {error.cashMismatch && (
                  <div className="ml-2 mt-1">
                    <span className="text-muted-foreground">
                      💰 {t('cashMismatch')}: {t('customerTotal')}{' '}
                      {formatCurrency(error.cashMismatch.customer)} ≠{' '}
                      {t('salesTotal')}{' '}
                      {formatCurrency(error.cashMismatch.sales)}
                      <span className="font-bold">
                        {' '}
                        ({t('difference')}:{' '}
                        {formatCurrency(
                          Math.abs(error.cashMismatch.difference)
                        )}
                        )
                      </span>
                    </span>
                  </div>
                )}
                {error.cylinderMismatch && (
                  <div className="ml-2 mt-1">
                    <span className="text-muted-foreground">
                      🛢️ {t('cylinderMismatch')}: {t('customerTotal')}{' '}
                      {error.cylinderMismatch.customer} ≠ {t('salesTotal')}{' '}
                      {error.cylinderMismatch.sales}
                      <span className="font-bold">
                        {' '}
                        ({t('difference')}:{' '}
                        {Math.abs(error.cylinderMismatch.difference)})
                      </span>
                    </span>
                  </div>
                )}
                {error.sizeValidationErrors &&
                  error.sizeValidationErrors.length > 0 && (
                    <div className="ml-2 mt-1">
                      <span className="text-muted-foreground">
                        📏 সাইজ অনুযায়ী বৈধতা ত্রুটি:
                      </span>
                      <div className="ml-4 mt-1 space-y-1">
                        {error.sizeValidationErrors.map((sizeError, index) => (
                          <div
                            key={index}
                            className="text-muted-foreground text-xs"
                          >
                            • {sizeError.size}: গ্রাহক রেকর্ড{' '}
                            {sizeError.customer} ≠ প্রত্যাশিত{' '}
                            {sizeError.expected}
                            <span className="font-bold">
                              {' '}
                              (পার্থক্য:{' '}
                              {Math.abs(
                                sizeError.expected - sizeError.customer
                              )}
                              )
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {overdueCustomers.length > 0 && (
        <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
          <div className="flex items-center">
            <AlertCircle className="text-destructive mr-2 h-5 w-5" />
            <span className="text-foreground font-medium">
              {overdueCustomers.length} {t('customersWithOverduePayments')}
              totaling {formatCurrency(overdueAmount)} {t('requireImmediate')}
              attention
            </span>
          </div>
        </div>
      )}

      {/* System Information Banner */}
      <div className="border-border bg-muted/30 rounded-lg border p-4">
        <div className="flex items-start">
          <AlertCircle className="mr-2 mt-0.5 h-5 w-5 text-blue-500" />
          <div className="text-foreground">
            <div className="mb-2 font-medium">
              📋 {t('receivablesManagementSystemRules')}:
            </div>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • <strong>{t('driverTotalReceivables')}:</strong>{' '}
                {t('automaticallyCalculatedFromSales')}
              </li>
              <li>
                •{' '}
                <strong>
                  {t('customers')} {t('receivables')}:
                </strong>{' '}
                {t('customerReceivablesManuallyManaged')}
              </li>
              <li>
                • <strong>⚡ Auto Recalculation:</strong> Receivables are
                automatically recalculated fresh on every page load for
                up-to-date values
              </li>
              <li>
                • <strong>{t('validation')}:</strong>{' '}
                {t('customerTotalsMustEqualDriverSales')}
              </li>
              <li>
                • <strong>{t('payments')}:</strong>{' '}
                {t('paymentsAutomaticallyAdded')}
              </li>
              <li>
                • <strong>{t('changesLog')}:</strong>{' '}
                {t('changesLogAllReceivableActions')}
              </li>
            </ul>
            {currentUserRole === 'MANAGER' && (
              <div className="mt-2 text-sm">
                <strong>{t('managerAccess')}:</strong>{' '}
                {t('youCanRecordPayments')}
                returns, but only admins can add/edit customers.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('salesCashReceivables')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalCashReceivables)}
              </p>
              <p className="text-xs text-blue-500">{t('fromSalesData')}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('pending')}</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(overdueAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('salesCylinderReceivables')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {totalCylinderReceivables}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {t('fromSalesData')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('activeDrivers')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {driverReceivables.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('receivables')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'receivables'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent'
              }`}
            >
              {t('receivableManagement')}
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'changes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent'
              }`}
            >
              {t('changesLog')}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'receivables' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {/* Skeleton for driver cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg shadow">
                  {/* Driver Header Skeleton */}
                  <div className="border-border bg-muted border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-5 w-5 animate-pulse rounded bg-gray-300"></div>
                        <div className="h-6 w-32 animate-pulse rounded bg-gray-300"></div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex space-x-4 text-sm">
                          <div className="h-4 w-40 animate-pulse rounded bg-gray-300"></div>
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-300"></div>
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                        </div>
                        <div className="h-8 w-24 animate-pulse rounded-md bg-gray-300"></div>
                      </div>
                    </div>
                  </div>

                  {/* Tables Skeleton */}
                  <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
                    {/* Cash Receivables Table Skeleton */}
                    <div>
                      <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-300"></div>
                      <div className="border-border overflow-x-auto rounded-lg border">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3">
                                <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-14 animate-pulse rounded bg-gray-300"></div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-border divide-y">
                            {[1, 2].map((j) => (
                              <tr key={j}>
                                <td className="px-4 py-4">
                                  <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-18 h-4 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex space-x-2">
                                    <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
                                    <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                                    <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Cylinder Receivables Table Skeleton */}
                    <div>
                      <div className="mb-3 h-5 w-36 animate-pulse rounded bg-gray-300"></div>
                      <div className="border-border overflow-x-auto rounded-lg border">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3">
                                <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                              </th>
                              <th className="px-4 py-3">
                                <div className="h-4 w-14 animate-pulse rounded bg-gray-300"></div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-border divide-y">
                            {[1, 2].map((j) => (
                              <tr key={j}>
                                <td className="px-4 py-4">
                                  <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-18 h-4 animate-pulse rounded bg-gray-300"></div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex space-x-2">
                                    <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                                    <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                                    <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : driverReceivables.length === 0 ? (
            <div className="bg-card rounded-lg p-8 shadow">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-2 text-lg font-medium">
                  {t('noReceivablesFound')}
                </p>
                <p className="text-sm">
                  Customer receivables will appear here once they are created.
                </p>
              </div>
            </div>
          ) : (
            driverReceivables.map((driver) => (
              <div key={driver.id} className="bg-card rounded-lg shadow">
                {/* Driver Header */}
                <div className="border-border bg-muted border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-gray-500" />
                      <h3 className="text-foreground text-lg font-semibold">
                        {driver.driverName}
                      </h3>
                      {driver.hasValidationError && (
                        <AlertCircle className="ml-2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-muted-foreground text-sm">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {t('salesCashReceivables')}:{' '}
                          {formatCurrency(driver.totalCashReceivables)}
                        </span>
                        <span className="mx-2">|</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {t('cylinderReceivable')}:{' '}
                          {driver.totalCylinderReceivables}{' '}
                          {(() => {
                            // Use actual cylinder size breakdown from sales data (not customer entries)
                            const breakdown = Object.entries(
                              driver.cylinderSizeBreakdown || {}
                            )
                              .filter(([_, qty]) => qty > 0)
                              .map(([size, qty]) => `${size}: ${qty}`)
                              .join(', ');

                            return breakdown ? `(${breakdown})` : '';
                          })()}
                        </span>
                        <span className="mx-2">|</span>
                        <span className="text-xs">
                          {t('customerRecords')}:{' '}
                          {driver.customerBreakdown?.filter(
                            (c) => c.status === 'CURRENT'
                          ).length || 0}
                        </span>
                        <span className="mx-1">|</span>
                        <span className="text-xs text-green-600">
                          {t('active')}:{' '}
                          {driver.customerBreakdown?.filter(
                            (c) => c.status === 'CURRENT'
                          ).length || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => openCustomerModal(driver.id)}
                        className="flex items-center rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        {t('add')} {t('customers')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Summary */}
                {driver.customerBreakdown &&
                  driver.customerBreakdown.length > 0 && (
                    <div className="bg-muted border-t border-gray-200 px-6 py-2 dark:border-gray-600">
                      <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>{t('statusBreakdown')}:</span>
                        <span className="text-green-600">
                          {t('current')}:{' '}
                          {
                            driver.customerBreakdown.filter(
                              (c) => c.status === 'CURRENT'
                            ).length
                          }
                        </span>
                        <span className="text-yellow-600">
                          {t('dueSoon')}:{' '}
                          {
                            driver.customerBreakdown.filter(
                              (c) => c.status === 'DUE_SOON'
                            ).length
                          }
                        </span>
                        <span className="text-red-600">
                          {t('overdue')}:{' '}
                          {
                            driver.customerBreakdown.filter(
                              (c) => c.status === 'OVERDUE'
                            ).length
                          }
                        </span>
                        <span className="text-gray-600">
                          {t('paid')}:{' '}
                          {
                            driver.customerBreakdown.filter(
                              (c) => c.status === 'PAID'
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  )}

                {/* Customer Breakdown - Two Tables Side by Side */}
                <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
                  {/* Cash Receivables Table */}
                  <div>
                    <h4 className="text-foreground mb-3 text-sm font-medium">
                      {t('cashReceivables')}
                    </h4>
                    <div className="border-border overflow-x-auto rounded-lg border">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('customers')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('amount')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('date')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {driver.customerBreakdown.filter(
                            (c) =>
                              c.receivableType === 'CASH' &&
                              c.status === 'CURRENT'
                          ).length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                {t('noCashReceivables')}
                              </td>
                            </tr>
                          ) : (
                            driver.customerBreakdown
                              .filter(
                                (c) =>
                                  c.receivableType === 'CASH' &&
                                  c.status === 'CURRENT'
                              )
                              .map((customer) => (
                                <tr
                                  key={customer.id}
                                  className="hover:bg-muted/50"
                                >
                                  <td className="whitespace-nowrap px-4 py-4">
                                    <div className="text-foreground text-sm font-medium">
                                      {customer.customerName}
                                    </div>
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                    {formatCurrency(customer.amount)}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                    {formatDate(customer.dueDate)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          openPaymentModal(customer)
                                        }
                                        className="text-sm text-green-600 hover:text-green-900 dark:text-green-400"
                                      >
                                        {t('pay')}
                                      </button>
                                      <button
                                        onClick={() =>
                                          openCustomerModal(driver.id, customer)
                                        }
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCustomer(
                                            driver.id,
                                            customer.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}

                          {/* Total Row for Cash Receivables */}
                          {driver.customerBreakdown.filter(
                            (c) =>
                              c.receivableType === 'CASH' &&
                              c.status === 'CURRENT'
                          ).length > 0 && (
                            <tr className="bg-muted font-bold">
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                {t('total')}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-right text-sm">
                                {formatCurrency(
                                  driver.customerBreakdown
                                    .filter(
                                      (c) =>
                                        c.receivableType === 'CASH' &&
                                        c.status === 'CURRENT'
                                    )
                                    .reduce((sum, c) => sum + c.amount, 0)
                                )}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                -
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                -
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cylinder Receivables Table */}
                  <div>
                    <h4 className="text-foreground mb-3 text-sm font-medium">
                      {t('cylinderReceivables')}
                    </h4>
                    <div className="border-border overflow-x-auto rounded-lg border">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('customers')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('quantity')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('size')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('date')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {driver.customerBreakdown.filter(
                            (c) =>
                              c.receivableType === 'CYLINDER' &&
                              c.status === 'CURRENT'
                          ).length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                {t('noCylinderReceivables')}
                              </td>
                            </tr>
                          ) : (
                            driver.customerBreakdown
                              .filter(
                                (c) =>
                                  c.receivableType === 'CYLINDER' &&
                                  c.status === 'CURRENT'
                              )
                              .map((customer) => (
                                <tr
                                  key={customer.id}
                                  className="hover:bg-muted/50"
                                >
                                  <td className="whitespace-nowrap px-4 py-4">
                                    <div className="text-foreground text-sm font-medium">
                                      {customer.customerName}
                                    </div>
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-4 py-4 text-center text-sm">
                                    {customer.quantity}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                    {(customer as any).size || '-'}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                    {formatDate(customer.dueDate)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          openCylinderReturnModal(customer)
                                        }
                                        className="text-sm text-purple-600 hover:text-purple-900 dark:text-purple-400"
                                      >
                                        {t('return')}
                                      </button>
                                      <button
                                        onClick={() =>
                                          openCustomerModal(driver.id, customer)
                                        }
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCustomer(
                                            driver.id,
                                            customer.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}

                          {/* Total Row for Cylinder Receivables */}
                          {driver.customerBreakdown.filter(
                            (c) =>
                              c.receivableType === 'CYLINDER' &&
                              c.status === 'CURRENT'
                          ).length > 0 && (
                            <tr className="bg-muted font-bold">
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                {t('total')}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-center text-sm">
                                {driver.customerBreakdown
                                  .filter(
                                    (c) =>
                                      c.receivableType === 'CYLINDER' &&
                                      c.status === 'CURRENT'
                                  )
                                  .reduce((sum, c) => sum + c.quantity, 0)}
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                -
                              </td>
                              <td className="text-foreground whitespace-nowrap px-4 py-4 text-sm">
                                -
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Changes Log Tab */}
      {activeTab === 'changes' && (
        <div className="bg-card rounded-lg shadow">
          <div className="border-border border-b px-6 py-4">
            <h2 className="text-foreground text-lg font-semibold">
              {t('receivablesChangesLog')}
            </h2>
            <p className="text-muted-foreground text-sm">
              Recent changes to customer receivables
            </p>
          </div>

          {changesLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-14 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="w-18 h-4 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      <div className="h-4 w-10 animate-pulse rounded bg-gray-300"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-12 animate-pulse rounded-full bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-14 animate-pulse rounded bg-gray-300"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : receivablesChanges.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-2 text-lg font-medium">
                {t('noChangesRecorded')}
              </p>
              <p className="text-sm">
                Receivables changes will appear here once actions are taken.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Debug: Changes array length = {receivablesChanges.length}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      Amount/Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {receivablesChanges.map((change, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {formatTimestamp(change.timestamp)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            change.action === 'CREATE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : change.action === 'PAYMENT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : change.action === 'RETURN'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : change.action === 'UPDATE'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                                    : change.action === 'DELETE'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                      : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {change.action}
                        </span>
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {change.driverName}
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {change.customerName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            change.receivableType === 'CASH'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}
                        >
                          {change.receivableType}
                        </span>
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {change.receivableType === 'CASH'
                          ? formatCurrency(change.amount)
                          : change.quantity}
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {change.userName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {editingCustomer
                  ? t('editCustomerReceivable')
                  : t('addCustomerReceivable')}
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('customers')} {t('name')} *
                </label>
                <input
                  type="text"
                  value={customerFormData.customerName}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      customerName: e.target.value,
                    })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('customerNamePlaceholder')}
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('receivableType')} *
                </label>
                <select
                  value={customerFormData.receivableType}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      receivableType: e.target.value as 'CASH' | 'CYLINDER',
                    })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="CASH">{t('cashReceivable')}</option>
                  <option value="CYLINDER">{t('cylinderReceivable')}</option>
                </select>
              </div>

              {customerFormData.receivableType === 'CASH' && (
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    {t('amount')} (৳) *
                  </label>
                  <input
                    type="number"
                    value={customerFormData.amount}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                    placeholder={t('enterPaymentAmount')}
                  />
                </div>
              )}

              {customerFormData.receivableType === 'CYLINDER' && (
                <>
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Cylinder Size *
                    </label>
                    <select
                      value={customerFormData.size}
                      onChange={(e) =>
                        setCustomerFormData({
                          ...customerFormData,
                          size: e.target.value,
                        })
                      }
                      className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                    >
                      <option value="">Select cylinder size</option>
                      {cylinderSizes.map((size) => (
                        <option key={size.id} value={size.size}>
                          {size.size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={customerFormData.quantity}
                      onChange={(e) =>
                        setCustomerFormData({
                          ...customerFormData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                      placeholder={t('enterNumberOfCylinders')}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('dueDate')}
                </label>
                <input
                  type="date"
                  value={customerFormData.dueDate}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      dueDate: e.target.value,
                    })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('notes')}
                </label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('enterNotes')}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveCustomer}
                disabled={
                  submitting ||
                  !customerFormData.customerName ||
                  (customerFormData.receivableType === 'CASH' &&
                    customerFormData.amount <= 0) ||
                  (customerFormData.receivableType === 'CYLINDER' &&
                    (customerFormData.quantity <= 0 || !customerFormData.size))
                }
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                )}
                {editingCustomer ? t('updatePayment') : t('add')}{' '}
                {t('customers')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {t('recordPayment')}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-muted mb-4 rounded-lg p-3">
              <div className="text-muted-foreground text-sm">
                <strong>Customer:</strong> {selectedCustomer.customerName}
              </div>
              <div className="text-muted-foreground text-sm">
                <strong>Outstanding:</strong>{' '}
                {formatCurrency(selectedCustomer.amount)}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Payment Amount (৳) *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  max={selectedCustomer.amount}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('enterPaymentAmount')}
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="bank_transfer">{t('bankTransfer')}</option>
                  <option value="cheque">Cheque</option>
                  <option value="digital_payment">Digital Payment</option>
                </select>
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  rows={3}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder="Add payment notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={
                  submitting ||
                  paymentData.amount <= 0 ||
                  paymentData.amount > selectedCustomer.amount
                }
                className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                )}
                {t('recordPayment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cylinder Return Modal */}
      {isCylinderReturnModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {t('recordCylinderReturn')}
              </h3>
              <button
                onClick={() => setIsCylinderReturnModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-muted mb-4 rounded-lg p-3">
              <div className="text-muted-foreground text-sm">
                <strong>Customer:</strong> {selectedCustomer.customerName}
              </div>
              <div className="text-muted-foreground text-sm">
                <strong>Cylinders Outstanding:</strong>{' '}
                {selectedCustomer.quantity}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Cylinders Returned *
                </label>
                <input
                  type="number"
                  value={cylinderReturnData.quantity}
                  onChange={(e) =>
                    setCylinderReturnData({
                      ...cylinderReturnData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max={selectedCustomer.quantity}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('enterNumberOfCylinders')}
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Notes
                </label>
                <textarea
                  value={cylinderReturnData.notes}
                  onChange={(e) =>
                    setCylinderReturnData({
                      ...cylinderReturnData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder="Add return notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCylinderReturnModalOpen(false)}
                className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCylinderReturn}
                disabled={
                  submitting ||
                  cylinderReturnData.quantity <= 0 ||
                  cylinderReturnData.quantity > selectedCustomer.quantity
                }
                className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                )}
                {t('recordReturn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
