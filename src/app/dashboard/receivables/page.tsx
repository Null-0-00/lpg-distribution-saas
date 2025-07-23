"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreditCard, AlertCircle, TrendingUp, Clock, CheckCircle, Download, X, Plus, Edit2, Trash2, Users, User, Package, FileText } from 'lucide-react';
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
  totalCashReceivables: number;        // From sales data
  totalCylinderReceivables: number;    // From sales data
  totalReceivables: number;
  salesCashReceivables: number;        // For validation
  salesCylinderReceivables: number;    // For validation
  customerCashTotal: number;           // For validation
  customerCylinderTotal: number;       // For validation
  hasValidationError: boolean;
  customerBreakdown: CustomerReceivable[];
}

interface ValidationError {
  driverId: string;
  driverName: string;
  cashMismatch: { customer: number; sales: number; difference: number } | null;
  cylinderMismatch: { customer: number; sales: number; difference: number } | null;
}

export default function ReceivablesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { formatCurrency, formatDate: globalFormatDate, formatDateTime, settings } = useSettings();
  
  // Debug: Log current settings
  if (process.env.NODE_ENV === 'development') {
    console.log('Current settings:', settings);
  }
  const [driverReceivables, setDriverReceivables] = useState<DriverReceivable[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'receivables' | 'changes'>('receivables');
  const [changesLoading, setChangesLoading] = useState(false);
  const [receivablesChanges, setReceivablesChanges] = useState<any[]>([]);
  
  const currentUserRole = session?.user?.role || 'MANAGER';
  
  // Helper function to format dates using global settings
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    try {
      // Debug logging (only during development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Formatting date:', dateString, typeof dateString, 'Settings:', settings);
      }
      
      // Parse the date string - API returns YYYY-MM-DD format
      let date: Date;
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Explicit parsing for YYYY-MM-DD format to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Parsed date components:', { year, month: month-1, day }, 'Result:', date);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      // Use global settings formatDate function with additional debugging
      const formatted = globalFormatDate(date);
      if (process.env.NODE_ENV === 'development') {
        console.log('Final formatted date:', formatted);
      }
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid date';
    }
  };

  // Helper function to format timestamps with date and time using global settings
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return 'No timestamp';
    try {
      const date = new Date(timestamp);
      // Use global settings formatDateTime function
      return formatDateTime(date);
    } catch (error) {
      return 'Invalid timestamp';
    }
  };
  
  // Remove all the hardcoded demo data

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCylinderReturnModalOpen, setIsCylinderReturnModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerReceivable | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerReceivable | null>(null);

  const [customerFormData, setCustomerFormData] = useState({
    customerName: '',
    receivableType: 'CASH' as 'CASH' | 'CYLINDER',
    amount: 0,
    quantity: 0,
    dueDate: '',
    notes: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  const [cylinderReturnData, setCylinderReturnData] = useState({
    quantity: 0,
    notes: ''
  });

  useEffect(() => {
    fetchReceivables();
  }, []);

  useEffect(() => {
    if (activeTab === 'changes') {
      fetchReceivablesChanges();
    }
  }, [activeTab]);

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receivables/customers', {
        cache: 'no-store', // Force fresh data but allow browser caching
        headers: {
          'Cache-Control': 'no-cache' // Force fresh data during debugging
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Debug: Check date formats in customer breakdown (development only)
        if (process.env.NODE_ENV === 'development' && data.driverReceivables?.length > 0) {
          console.log('Receivables API response:', data);
          data.driverReceivables.forEach((driver: any) => {
            if (driver.customerBreakdown?.length > 0) {
              driver.customerBreakdown.forEach((customer: any) => {
                if (customer.dueDate) {
                  console.log('Customer due date:', customer.customerName, customer.dueDate, typeof customer.dueDate);
                }
              });
            }
          });
        }
        
        setDriverReceivables(data.driverReceivables || []);
        setValidationErrors(data.validationErrors || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch receivables",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching receivables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch receivables",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateReceivables = async () => {
    if (currentUserRole !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "Only administrators can recalculate receivables.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/receivables/recalculate', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || "Receivables recalculated successfully"
        });
        // Refresh the receivables data
        await fetchReceivables();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to recalculate receivables",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error recalculating receivables:', error);
      toast({
        title: "Error",
        description: "Failed to recalculate receivables",
        variant: "destructive"
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
          title: "Error",
          description: "Failed to fetch receivables changes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching receivables changes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch receivables changes",
        variant: "destructive"
      });
    } finally {
      setChangesLoading(false);
    }
  };

  // Calculate totals
  const totalCashReceivables = driverReceivables.reduce((sum, driver) => sum + driver.totalCashReceivables, 0);
  const totalCylinderReceivables = driverReceivables.reduce((sum, driver) => sum + driver.totalCylinderReceivables, 0);
  const overdueCustomers = driverReceivables.flatMap(driver => 
    driver.customerBreakdown.filter(customer => customer.status === 'OVERDUE')
  );
  const overdueAmount = overdueCustomers.reduce((sum, customer) => sum + customer.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'DUE_SOON': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CURRENT': return <CheckCircle className="h-4 w-4" />;
      case 'DUE_SOON': return <Clock className="h-4 w-4" />;
      case 'OVERDUE': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const openCustomerModal = (driverId: string, customer?: CustomerReceivable) => {
    if (currentUserRole !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add or edit customer receivables.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedDriver(driverId);
    if (customer) {
      setEditingCustomer(customer);
      setCustomerFormData({
        customerName: customer.customerName,
        receivableType: customer.receivableType,
        amount: customer.amount,
        quantity: customer.quantity,
        dueDate: customer.dueDate,
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerFormData({
        customerName: '',
        receivableType: 'CASH',
        amount: 0,
        quantity: 0,
        dueDate: '',
        notes: ''
      });
    }
    setIsCustomerModalOpen(true);
  };

  const openPaymentModal = (customer: CustomerReceivable) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: customer.amount,
      paymentMethod: 'cash',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const openCylinderReturnModal = (customer: CustomerReceivable) => {
    setSelectedCustomer(customer);
    setCylinderReturnData({
      quantity: customer.quantity,
      notes: ''
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
          dueDate: customerFormData.dueDate,
          notes: customerFormData.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingCustomer ? "Customer receivable updated successfully" : "Customer receivable added successfully"
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
          title: "Error",
          description: errorData.error || "Failed to save customer receivable",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving customer receivable:', error);
      toast({
        title: "Error",
        description: "Failed to save customer receivable",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (driverId: string, customerId: string) => {
    if (currentUserRole !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete customer receivables.",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm('Are you sure you want to delete this customer receivable?')) return;

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/receivables/customers/${customerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer receivable deleted successfully"
        });
        
        // Refresh the receivables list
        await fetchReceivables();
        if (activeTab === 'changes') {
          await fetchReceivablesChanges();
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete customer receivable",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting customer receivable:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer receivable",
        variant: "destructive"
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
          notes: paymentData.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment recorded successfully"
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
          title: "Error",
          description: errorData.error || "Failed to record payment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
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
          notes: cylinderReturnData.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cylinder return recorded successfully"
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
          title: "Error",
          description: errorData.error || "Failed to record cylinder return",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error recording cylinder return:', error);
      toast({
        title: "Error",
        description: "Failed to record cylinder return",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Receivables Management</h1>
          <p className="text-muted-foreground">Driver-based receivables with customer breakdown</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">User Role:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              currentUserRole === 'ADMIN' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
            }`}>
              {currentUserRole}
            </span>
          </div>
          {currentUserRole === 'ADMIN' && (
            <button 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              onClick={recalculateReceivables}
              disabled={submitting}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Recalculate
            </button>
          )}
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => toast({
              title: "Coming Soon",
              description: "Export Report functionality is under development",
              variant: "default"
            })}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              Driver receivables validation errors detected - Customer totals don't match sales totals
            </span>
          </div>
          <div className="ml-7 space-y-1">
            {validationErrors.map(error => (
              <div key={error.driverId} className="text-sm text-red-700 dark:text-red-300">
                <strong>{error.driverName}:</strong>
                {error.cashMismatch && (
                  <span className="ml-2">
                    Cash: Customer {formatCurrency(error.cashMismatch.customer)} vs Sales {formatCurrency(error.cashMismatch.sales)}
                    (diff: {formatCurrency(error.cashMismatch.difference)})
                  </span>
                )}
                {error.cylinderMismatch && (
                  <span className="ml-2">
                    Cylinders: Customer {error.cylinderMismatch.customer} vs Sales {error.cylinderMismatch.sales}
                    (diff: {error.cylinderMismatch.difference})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {overdueCustomers.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              {overdueCustomers.length} customer(s) with overdue payments totaling {formatCurrency(overdueAmount)} require immediate attention
            </span>
          </div>
        </div>
      )}

      {/* Permission Notice for Managers */}
      {currentUserRole === 'MANAGER' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Manager Access: You can record payments and cylinder returns, but only administrators can add, edit, or delete customer receivables.
            </span>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Cash Receivables</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCashReceivables)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Overdue Amount</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(overdueAmount)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Cylinder Receivables</p>
              <p className="text-2xl font-bold text-foreground">{totalCylinderReceivables}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Active Drivers</p>
              <p className="text-2xl font-bold text-foreground">{driverReceivables.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('receivables')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'receivables'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Receivables Management
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'changes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Changes Log
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'receivables' && (
        <div className="space-y-4">
        {loading ? (
          <div className="bg-card rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-muted-foreground">Loading receivables...</span>
            </div>
          </div>
        ) : driverReceivables.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No receivables found</p>
              <p className="text-sm">Customer receivables will appear here once they are created.</p>
            </div>
          </div>
        ) : (
          driverReceivables.map((driver) => (
          <div key={driver.id} className="bg-card rounded-lg shadow">
            {/* Driver Header */}
            <div className="px-6 py-4 border-b border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">{driver.driverName}</h3>
                  {driver.hasValidationError && (
                    <AlertCircle className="h-5 w-5 text-red-500 ml-2" title="Receivables totals don't match" />
                  )}
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Cash Receivable: {formatCurrency(driver.totalCashReceivables)}</span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">Cylinder Receivable: {driver.totalCylinderReceivables}</span>
                    <span className="mx-2">|</span>
                    <span className="text-xs">Total Records: {driver.customerBreakdown?.length || 0}</span>
                    <span className="mx-1">|</span>
                    <span className="text-xs">Current: {driver.customerBreakdown?.filter(c => c.status === 'CURRENT').length || 0}</span>
                  </div>
                  {currentUserRole === 'ADMIN' && (
                    <button
                      onClick={() => openCustomerModal(driver.id)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Customer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Summary */}
            {driver.customerBreakdown && driver.customerBreakdown.length > 0 && (
              <div className="px-6 py-2 bg-muted border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Status Breakdown:</span>
                  <span className="text-green-600">Current: {driver.customerBreakdown.filter(c => c.status === 'CURRENT').length}</span>
                  <span className="text-yellow-600">Due Soon: {driver.customerBreakdown.filter(c => c.status === 'DUE_SOON').length}</span>
                  <span className="text-red-600">Overdue: {driver.customerBreakdown.filter(c => c.status === 'OVERDUE').length}</span>
                  <span className="text-gray-600">Paid: {driver.customerBreakdown.filter(c => c.status === 'PAID').length}</span>
                </div>
              </div>
            )}

            {/* Customer Breakdown - Two Tables Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
              {/* Cash Receivables Table */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Cash Receivables</h4>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {driver.customerBreakdown.filter(c => c.receivableType === 'CASH' && c.status === 'CURRENT').length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No cash receivables
                          </td>
                        </tr>
                      ) : (
                        driver.customerBreakdown
                          .filter(c => c.receivableType === 'CASH' && c.status === 'CURRENT')
                          .map((customer) => (
                            <tr key={customer.id} className="hover:bg-muted/50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">{customer.customerName}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                                {formatCurrency(customer.amount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                {formatDate(customer.dueDate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openPaymentModal(customer)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 text-sm"
                                  >
                                    Pay
                                  </button>
                                  {currentUserRole === 'ADMIN' && (
                                    <>
                                      <button
                                        onClick={() => openCustomerModal(driver.id, customer)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCustomer(driver.id, customer.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                      
                      {/* Total Row for Cash Receivables */}
                      {driver.customerBreakdown.filter(c => c.receivableType === 'CASH' && c.status === 'CURRENT').length > 0 && (
                        <tr className="bg-muted font-bold">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            TOTAL
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-foreground">
                            {formatCurrency(driver.customerBreakdown
                              .filter(c => c.receivableType === 'CASH' && c.status === 'CURRENT')
                              .reduce((sum, c) => sum + c.amount, 0))}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            -
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
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
                <h4 className="text-sm font-medium text-foreground mb-3">Cylinder Receivables</h4>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {driver.customerBreakdown.filter(c => c.receivableType === 'CYLINDER' && c.status === 'CURRENT').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No cylinder receivables
                          </td>
                        </tr>
                      ) : (
                        driver.customerBreakdown
                          .filter(c => c.receivableType === 'CYLINDER' && c.status === 'CURRENT')
                          .map((customer) => (
                            <tr key={customer.id} className="hover:bg-muted/50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">{customer.customerName}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-foreground">
                                {customer.quantity}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                {customer.size || '-'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                {formatDate(customer.dueDate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openCylinderReturnModal(customer)}
                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 text-sm"
                                  >
                                    Return
                                  </button>
                                  {currentUserRole === 'ADMIN' && (
                                    <>
                                      <button
                                        onClick={() => openCustomerModal(driver.id, customer)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCustomer(driver.id, customer.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                      
                      {/* Total Row for Cylinder Receivables */}
                      {driver.customerBreakdown.filter(c => c.receivableType === 'CYLINDER' && c.status === 'CURRENT').length > 0 && (
                        <tr className="bg-muted font-bold">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            TOTAL
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-foreground">
                            {driver.customerBreakdown
                              .filter(c => c.receivableType === 'CYLINDER' && c.status === 'CURRENT')
                              .reduce((sum, c) => sum + c.quantity, 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                            -
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
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
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Receivables Changes Log</h2>
            <p className="text-sm text-muted-foreground">Recent changes to customer receivables</p>
          </div>
          
          {changesLoading ? (
            <div className="px-6 py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-muted-foreground">Loading changes...</span>
              </div>
            </div>
          ) : receivablesChanges.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No changes recorded</p>
              <p className="text-sm">Receivables changes will appear here once actions are taken.</p>
              <p className="text-xs text-gray-400 mt-2">Debug: Changes array length = {receivablesChanges.length}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount/Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receivablesChanges.map((change, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatTimestamp(change.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          change.action === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          change.action === 'PAYMENT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                          change.action === 'RETURN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          change.action === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                          change.action === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {change.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {change.driverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {change.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          change.receivableType === 'CASH' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {change.receivableType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {change.receivableType === 'CASH' ? formatCurrency(change.amount) : change.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingCustomer ? 'Edit Customer Receivable' : 'Add Customer Receivable'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerFormData.customerName}
                  onChange={(e) => setCustomerFormData({...customerFormData, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Receivable Type *
                </label>
                <select
                  value={customerFormData.receivableType}
                  onChange={(e) => setCustomerFormData({...customerFormData, receivableType: e.target.value as 'CASH' | 'CYLINDER'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="CASH">Cash Receivable</option>
                  <option value="CYLINDER">Cylinder Receivable</option>
                </select>
              </div>
              
              {customerFormData.receivableType === 'CASH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    value={customerFormData.amount}
                    onChange={(e) => setCustomerFormData({...customerFormData, amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter amount"
                  />
                </div>
              )}
              
              {customerFormData.receivableType === 'CYLINDER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={customerFormData.quantity}
                    onChange={(e) => setCustomerFormData({...customerFormData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter quantity"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={customerFormData.dueDate}
                  onChange={(e) => setCustomerFormData({...customerFormData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData({...customerFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2 text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                disabled={submitting || !customerFormData.customerName || (customerFormData.receivableType === 'CASH' && customerFormData.amount <= 0) || (customerFormData.receivableType === 'CYLINDER' && customerFormData.quantity <= 0)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {editingCustomer ? 'Update' : 'Add'} Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Record Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-3 bg-muted rounded-lg mb-4">
              <div className="text-sm text-muted-foreground">
                <strong>Customer:</strong> {selectedCustomer.customerName}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Outstanding:</strong> {formatCurrency(selectedCustomer.amount)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (৳) *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                  max={selectedCustomer.amount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter payment amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="digital_payment">Digital Payment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add payment notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={submitting || paymentData.amount <= 0 || paymentData.amount > selectedCustomer.amount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cylinder Return Modal */}
      {isCylinderReturnModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Record Cylinder Return</h3>
              <button
                onClick={() => setIsCylinderReturnModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-3 bg-muted rounded-lg mb-4">
              <div className="text-sm text-muted-foreground">
                <strong>Customer:</strong> {selectedCustomer.customerName}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Cylinders Outstanding:</strong> {selectedCustomer.quantity}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cylinders Returned *
                </label>
                <input
                  type="number"
                  value={cylinderReturnData.quantity}
                  onChange={(e) => setCylinderReturnData({...cylinderReturnData, quantity: parseInt(e.target.value) || 0})}
                  min="1"
                  max={selectedCustomer.quantity}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter number of cylinders"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={cylinderReturnData.notes}
                  onChange={(e) => setCylinderReturnData({...cylinderReturnData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add return notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCylinderReturnModalOpen(false)}
                className="px-4 py-2 text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={handleCylinderReturn}
                disabled={submitting || cylinderReturnData.quantity <= 0 || cylinderReturnData.quantity > selectedCustomer.quantity}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                Record Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}