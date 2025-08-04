'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Calculator,
  Search,
  Filter,
  CalendarDays,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  code?: string;
}

interface Driver {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
  customerCode?: string;
  area: Area;
  driver?: Driver;
}

interface CustomerAggregation {
  id: string;
  name: string;
  customerCode?: string;
  areaName: string;
  areaCode?: string;
  driverName?: string;
  totalCash: number;
  totalCylinder: number;
  totalOutstanding: number;
  recordCount: number;
  lastUpdated?: string;
}

interface CustomerReceivablesDisplayProps {
  onUpdateReceivables: () => void;
}

export default function CustomerReceivablesDisplay({
  onUpdateReceivables,
}: CustomerReceivablesDisplayProps) {
  const { toast } = useToast();
  const { t, formatCurrency, formatDate } = useSettings();

  const [areas, setAreas] = useState<Area[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customerAggregations, setCustomerAggregations] = useState<
    CustomerAggregation[]
  >([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    CustomerAggregation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [hasBalanceOnly, setHasBalanceOnly] = useState(false);

  useEffect(() => {
    fetchAreas();
    fetchDrivers();
    fetchReceivables();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [
    customerAggregations,
    searchTerm,
    selectedAreaId,
    selectedDriverId,
    hasBalanceOnly,
  ]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas?activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setAreas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
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
        setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedAreaId) params.append('areaId', selectedAreaId);
      if (selectedDriverId) params.append('driverId', selectedDriverId);
      if (hasBalanceOnly) params.append('hasBalance', 'true');

      const response = await fetch(`/api/customers/receivables?${params}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Customer Aggregations API response:', data);
        // API returns { receivables: [...], customerAggregations: [...], summary: {...} }
        setCustomerAggregations(
          Array.isArray(data.customerAggregations)
            ? data.customerAggregations
            : []
        );
      } else {
        toast({
          title: t('error'),
          description: 'Failed to fetch customer receivables',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching customer receivables:', error);
      toast({
        title: t('error'),
        description: 'Failed to fetch customer receivables',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = Array.isArray(customerAggregations)
      ? customerAggregations
      : [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.customerCode?.toLowerCase().includes(term) ||
          customer.areaName.toLowerCase().includes(term) ||
          customer.driverName?.toLowerCase().includes(term)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleRefresh = () => {
    fetchReceivables();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAreaId('');
    setSelectedDriverId('');
    setHasBalanceOnly(false);
  };

  const totalCashReceivables = Array.isArray(filteredCustomers)
    ? filteredCustomers.reduce(
        (sum, customer) => sum + Number(customer.totalCash),
        0
      )
    : 0;
  const totalCylinderReceivables = Array.isArray(filteredCustomers)
    ? filteredCustomers.reduce(
        (sum, customer) => sum + Number(customer.totalCylinder),
        0
      )
    : 0;
  const totalReceivables = Array.isArray(filteredCustomers)
    ? filteredCustomers.reduce(
        (sum, customer) => sum + Number(customer.totalOutstanding),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            {t('customerReceivables')} {t('summary')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('trackAndUpdateCustomerOutstandingBalances')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center">
            <TrendingUp className="mr-3 h-8 w-8 text-green-500" />
            <div>
              <p className="text-muted-foreground text-sm">
                {t('total')} {t('customers')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {Array.isArray(filteredCustomers)
                  ? filteredCustomers.length
                  : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center">
            <Calculator className="mr-3 h-8 w-8 text-blue-500" />
            <div>
              <p className="text-muted-foreground text-sm">
                {t('cashReceivables')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalCashReceivables)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center">
            <Eye className="mr-3 h-8 w-8 text-orange-500" />
            <div>
              <p className="text-muted-foreground text-sm">
                {t('cylinderReceivables')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalCylinderReceivables)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center">
            <Users className="mr-3 h-8 w-8 text-purple-500" />
            <div>
              <p className="text-muted-foreground text-sm">
                {t('totalReceivables')}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalReceivables)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label className="text-foreground mb-1 block text-sm font-medium">
              {t('search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers, codes..."
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-3 focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <div className="min-w-[140px]">
            <label className="text-foreground mb-1 block text-sm font-medium">
              {t('area')}
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
            >
              <option value="">
                {t('all')} {t('area')}
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} {area.code && `(${area.code})`}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[140px]">
            <label className="text-foreground mb-1 block text-sm font-medium">
              {t('driver')}
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
            >
              <option value="">
                {t('all')} {t('drivers')}
              </option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              {t('filter')}
            </label>
            <label className="flex h-[42px] items-center">
              <input
                type="checkbox"
                checked={hasBalanceOnly}
                onChange={(e) => setHasBalanceOnly(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-foreground text-sm">Has Balance</span>
            </label>
          </div>

          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              {t('actions')}
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
              >
                <Filter className="mr-1 h-4 w-4" />
                {t('apply')}
              </button>
              <button
                onClick={clearFilters}
                className="border-border text-muted-foreground hover:bg-muted/50 flex items-center rounded-lg border px-3 py-2 text-sm"
              >
                {t('clear')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Receivables Table */}
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="text-muted-foreground mt-2 text-sm">
                {t('loading')} {t('customerReceivables')}...
              </p>
            </div>
          ) : !Array.isArray(filteredCustomers) ||
            filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-foreground mb-2 text-lg font-medium">
                {t('noReceivablesFound')}
              </p>
              <p className="text-muted-foreground text-sm">
                {!Array.isArray(customerAggregations) ||
                customerAggregations.length === 0
                  ? t('noReceivablesFound')
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                    {t('customer')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                    {t('area')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                    {t('driver')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-right text-sm font-medium">
                    {t('cashReceivables')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-right text-sm font-medium">
                    {t('cylinderReceivables')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-right text-sm font-medium">
                    {t('totalReceivables')}
                  </th>
                  <th className="text-foreground px-4 py-3 text-center text-sm font-medium">
                    {t('records')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {Array.isArray(filteredCustomers) &&
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="text-foreground font-medium">
                            {customer.name}
                          </div>
                          {customer.customerCode && (
                            <div className="text-muted-foreground text-xs">
                              Code: {customer.customerCode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-foreground px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                          {customer.areaName}
                          {customer.areaCode && (
                            <span className="text-muted-foreground ml-1">
                              ({customer.areaCode})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {customer.driverName || 'Not assigned'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span
                          className={
                            Number(customer.totalCash) > 0
                              ? 'font-medium text-red-600'
                              : 'text-foreground'
                          }
                        >
                          {formatCurrency(Number(customer.totalCash))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span
                          className={
                            Number(customer.totalCylinder) > 0
                              ? 'font-medium text-orange-600'
                              : 'text-foreground'
                          }
                        >
                          {formatCurrency(Number(customer.totalCylinder))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span
                          className={
                            Number(customer.totalOutstanding) > 0
                              ? 'font-bold text-red-600'
                              : 'text-foreground'
                          }
                        >
                          {formatCurrency(Number(customer.totalOutstanding))}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-center text-sm">
                        {Number(customer.recordCount) || 0}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {Array.isArray(filteredCustomers) && filteredCustomers.length > 0 && (
        <div className="text-muted-foreground text-sm">
          Showing {filteredCustomers.length} of{' '}
          {Array.isArray(customerAggregations)
            ? customerAggregations.length
            : 0}{' '}
          customers with receivables
        </div>
      )}
    </div>
  );
}
