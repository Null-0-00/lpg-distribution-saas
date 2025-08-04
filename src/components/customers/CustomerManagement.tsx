'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Plus,
  Edit2,
  Trash2,
  User,
  Phone,
  X,
  AlertCircle,
  Check,
  Search,
  Filter,
} from 'lucide-react';

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
  phone?: string;
  alternatePhone?: string;
  address?: string;
  customerCode?: string;
  customerType: 'RETAIL' | 'COMMERCIAL' | 'INDUSTRIAL';
  isActive: boolean;
  notes?: string;
  area: Area;
  driver?: Driver;
  _count: {
    sales: number;
    customerReceivables: number;
  };
  customerReceivables?: {
    date: string;
    cashReceivables: number;
    cylinderReceivables: number;
    totalReceivables: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface CustomerFormData {
  areaId: string;
  driverId: string;
  name: string;
  phone: string;
  alternatePhone: string;
  address: string;
  customerCode: string;
  customerType: 'RETAIL' | 'COMMERCIAL' | 'INDUSTRIAL';
  isActive: boolean;
  notes: string;
}

interface CustomerManagementProps {
  selectedAreaId?: string;
  onAreaChange?: (areaId: string) => void;
  showAreaSelector?: boolean;
}

export default function CustomerManagement({
  selectedAreaId,
  onAreaChange,
  showAreaSelector = true,
}: CustomerManagementProps) {
  const { toast } = useToast();
  const { t, formatCurrency } = useSettings();

  const [areas, setAreas] = useState<Area[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [currentAreaId, setCurrentAreaId] = useState(selectedAreaId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [formData, setFormData] = useState<CustomerFormData>({
    areaId: '',
    driverId: '',
    name: '',
    phone: '',
    alternatePhone: '',
    address: '',
    customerCode: '',
    customerType: 'RETAIL',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    fetchAreas();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (currentAreaId) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setFilteredCustomers([]);
    }
  }, [currentAreaId]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, customerTypeFilter, activeFilter]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        const areasArray = Array.isArray(data) ? data : [];
        setAreas(areasArray);

        // Set first area as default if no area selected
        if (!currentAreaId && areasArray.length > 0) {
          const firstAreaId = areasArray[0].id;
          setCurrentAreaId(firstAreaId);
          onAreaChange?.(firstAreaId);
        }
      } else {
        console.error('Failed to fetch areas:', response.status);
        setAreas([]);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch(
        '/api/drivers?active=true&driverType=RETAIL'
      );
      if (response.ok) {
        const data = await response.json();
        // API returns { drivers: [...], pagination: {...}, summary: {...} }
        const driversArray = Array.isArray(data.drivers) ? data.drivers : [];
        setDrivers(driversArray);
      } else {
        console.error('Failed to fetch drivers:', response.status);
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const fetchCustomers = async () => {
    if (!currentAreaId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/customers?areaId=${currentAreaId}&includeReceivables=true`
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast({
          title: t('error'),
          description: 'Failed to fetch customers',
          variant: 'destructive',
        });
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

  const filterCustomers = () => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.customerCode
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.driver?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Customer type filter
    if (customerTypeFilter) {
      filtered = filtered.filter(
        (customer) => customer.customerType === customerTypeFilter
      );
    }

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter((customer) => customer.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((customer) => !customer.isActive);
    }

    setFilteredCustomers(filtered);
  };

  const handleAreaChange = (areaId: string) => {
    setCurrentAreaId(areaId);
    onAreaChange?.(areaId);
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        areaId: customer.area.id,
        driverId: customer.driver?.id || '',
        name: customer.name,
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        address: customer.address || '',
        customerCode: customer.customerCode || '',
        customerType: customer.customerType,
        isActive: customer.isActive,
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        areaId: currentAreaId,
        driverId: '',
        name: '',
        phone: '',
        alternatePhone: '',
        address: '',
        customerCode: '',
        customerType: 'RETAIL',
        isActive: true,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      areaId: '',
      driverId: '',
      name: '',
      phone: '',
      alternatePhone: '',
      address: '',
      customerCode: '',
      customerType: 'RETAIL',
      isActive: true,
      notes: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.areaId) {
      toast({
        title: t('error'),
        description: 'Name and area are required',
        variant: 'destructive',
      });
      return;
    }

    // Phone number validation for Bangladesh
    if (formData.phone && !/^(\+?88)?01[3-9]\d{8}$/.test(formData.phone)) {
      toast({
        title: t('error'),
        description: 'Please enter a valid Bangladesh phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const url = editingCustomer
        ? `/api/customers?id=${editingCustomer.id}`
        : '/api/customers';

      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: editingCustomer
            ? 'Customer updated successfully'
            : 'Customer created successfully',
        });

        await fetchCustomers();
        closeModal();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || 'Failed to save customer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: t('error'),
        description: 'Failed to save customer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    const hasTransactions =
      customer._count.sales > 0 || customer._count.customerReceivables > 0;

    const message = hasTransactions
      ? `"${customer.name}" has transaction history and will be deactivated instead of deleted. Continue?`
      : `Are you sure you want to permanently delete "${customer.name}"?`;

    if (!confirm(message)) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/customers?id=${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: t('success'),
          description: result.message || 'Customer deleted successfully',
        });

        await fetchCustomers();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || 'Failed to delete customer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: t('error'),
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return 'Retail';
      case 'COMMERCIAL':
        return 'Commercial';
      case 'INDUSTRIAL':
        return 'Industrial';
      default:
        return type;
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'COMMERCIAL':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'INDUSTRIAL':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            {t('customerManagementTitle')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('manageCustomersOrganizedByGeographicalAreas')}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={!currentAreaId}
          className="flex items-center rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="mr-1 h-4 w-4" />
          {t('addCustomer')}
        </button>
      </div>

      {/* Area Selector */}
      {showAreaSelector && (
        <div className="bg-card rounded-lg border p-4">
          <div className="mb-3">
            <label className="text-foreground text-sm font-medium">
              {t('selectAreaFirst')}
            </label>
            <p className="text-muted-foreground text-xs">
              {t('chooseAreaToViewAndManageCustomers')}
            </p>
          </div>
          <select
            value={currentAreaId}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
          >
            <option value="">{t('selectAnArea')}</option>
            {areas &&
              areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} {area.code && `(${area.code})`}
                </option>
              ))}
          </select>
        </div>
      )}

      {!currentAreaId ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-foreground mb-2 text-lg font-medium">
            {t('selectAnAreaTitle')}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('pleaseSelectAreaFirstToViewCustomers')}
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-card rounded-lg border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  {t('search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('searchCustomersCodesPhones')}
                    className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-3 focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  {t('customerType')}
                </label>
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="">{t('allTypes')}</option>
                  <option value="RETAIL">{t('retail')}</option>
                  <option value="COMMERCIAL">{t('commercial')}</option>
                  <option value="INDUSTRIAL">{t('industrial')}</option>
                </select>
              </div>

              <div>
                <label className="text-foreground mb-1 block text-sm font-medium">
                  {t('status')}
                </label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="all">{t('allStatus')}</option>
                  <option value="active">{t('activeOnly')}</option>
                  <option value="inactive">{t('inactiveOnly')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCustomerTypeFilter('');
                    setActiveFilter('all');
                  }}
                  className="border-border text-muted-foreground hover:bg-muted/50 flex items-center rounded-lg border px-3 py-2 text-sm"
                >
                  <Filter className="mr-1 h-4 w-4" />
                  {t('clear')}
                </button>
              </div>
            </div>

            <div className="text-muted-foreground mt-4 text-sm">
              {t('showingCustomersInArea')
                .replace('{count}', filteredCustomers.length.toString())
                .replace('{total}', customers.length.toString())
                .replace(
                  '{area}',
                  areas.find((a) => a.id === currentAreaId)?.name || ''
                )}
            </div>
          </div>

          {/* Customer List */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-4 shadow">
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center">
              <User className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-foreground mb-2 text-lg font-medium">
                {customers.length === 0
                  ? t('noCustomersFound')
                  : t('noMatchingCustomers')}
              </p>
              <p className="text-muted-foreground text-sm">
                {customers.length === 0
                  ? t('addFirstCustomerToGetStarted')
                  : t('tryAdjustingSearchOrFilter')}
              </p>
              {customers.length === 0 && (
                <button
                  onClick={() => openModal()}
                  className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t('addFirstCustomer')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers &&
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-card rounded-lg border p-4 shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-foreground font-medium">
                            {customer.name}
                          </h4>
                          {!customer.isActive && (
                            <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
                              {t('inactive')}
                            </span>
                          )}
                        </div>

                        {customer.customerCode && (
                          <p className="text-muted-foreground text-sm">
                            {t('code')}: {customer.customerCode}
                          </p>
                        )}

                        {customer.phone && (
                          <div className="text-muted-foreground mt-1 flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}

                        <div className="mt-2 flex items-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCustomerTypeColor(customer.customerType)}`}
                          >
                            {getCustomerTypeLabel(customer.customerType)}
                          </span>
                        </div>

                        <p className="text-muted-foreground mt-1 text-sm">
                          {t('driver')}:{' '}
                          {customer.driver?.name || t('notAssigned')}
                        </p>

                        {customer.customerReceivables &&
                          customer.customerReceivables.length > 0 && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">
                                {t('outstanding')}:{' '}
                              </span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(
                                  customer.customerReceivables[0]
                                    .totalReceivables
                                )}
                              </span>
                            </div>
                          )}

                        <div className="text-muted-foreground mt-2 text-xs">
                          {customer._count.sales}{' '}
                          {customer._count.sales === 1 ? t('sale') : t('sales')}{' '}
                          • {customer._count.customerReceivables}{' '}
                          {customer._count.customerReceivables === 1
                            ? t('receivable')
                            : t('receivables')}
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => openModal(customer)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          title={t('editCustomer')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                          title={t('confirmDeleteCustomer')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {editingCustomer ? t('editCustomer') : t('addNewCustomer')}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Area Selection */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('areaRequired')}
                </label>
                <select
                  value={formData.areaId}
                  onChange={(e) =>
                    setFormData({ ...formData, areaId: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="">{t('selectArea')}</option>
                  {areas &&
                    areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} {area.code && `(${area.code})`}
                      </option>
                    ))}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('customerName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('enterCustomerName')}
                />
              </div>

              {/* Driver Assignment */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('assignDriver')}
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) =>
                    setFormData({ ...formData, driverId: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="">{t('noDriverAssigned')}</option>
                  {drivers &&
                    drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                </select>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('optionalAssignDriverToServeCustomer')}
                </p>
              </div>

              {/* Customer Code */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('customerCode')}
                </label>
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={(e) =>
                    setFormData({ ...formData, customerCode: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('autoGeneratedIfEmpty')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder="01XXXXXXXXX"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('requiredForAutomatedMessaging')}
                </p>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('alternatePhone')}
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, alternatePhone: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder="01XXXXXXXXX (optional)"
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('customerType')}
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerType: e.target.value as
                        | 'RETAIL'
                        | 'COMMERCIAL'
                        | 'INDUSTRIAL',
                    })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                >
                  <option value="RETAIL">{t('retail')}</option>
                  <option value="COMMERCIAL">{t('commercial')}</option>
                  <option value="INDUSTRIAL">{t('industrial')}</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveCustomer"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActiveCustomer"
                  className="text-foreground text-sm"
                >
                  {t('activeCustomer')}
                </label>
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mt-4">
              <label className="text-foreground mb-2 block text-sm font-medium">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={2}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                placeholder="Customer address (optional)"
              />
            </div>

            {/* Notes - Full Width */}
            <div className="mt-4">
              <label className="text-foreground mb-2 block text-sm font-medium">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                placeholder="Additional notes about the customer (optional)"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  submitting || !formData.name.trim() || !formData.areaId
                }
                className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                )}
                {editingCustomer ? 'Update' : 'Create'} Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
