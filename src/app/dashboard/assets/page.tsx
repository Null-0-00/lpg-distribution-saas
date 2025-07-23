'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  X,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface Asset {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  originalValue?: number;
  currentValue: number;
  description?: string;
  purchaseDate?: string;
  depreciationRate?: number;
  isAutoCalculated: boolean;
  totalDepreciation?: number;
}

interface Liability {
  id: string;
  name: string;
  category: string;
  amount: number;
  description?: string;
  dueDate?: string;
}

interface AssetsData {
  assets: Asset[];
  categorized: {
    FIXED: Asset[];
    CURRENT: Asset[];
  };
  totals: {
    FIXED: number;
    CURRENT: number;
    TOTAL: number;
  };
}

interface LiabilitiesData {
  liabilities: Liability[];
  categorized: {
    CURRENT: Liability[];
    LONG_TERM: Liability[];
  };
  totals: {
    CURRENT: number;
    LONG_TERM: number;
    TOTAL: number;
  };
  ownerEquity: {
    totalAssets: number;
    totalLiabilities: number;
    ownerEquity: number;
  };
}

export default function AssetsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useSettings();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [assetsData, setAssetsData] = useState<AssetsData | null>(null);
  const [liabilitiesData, setLiabilitiesData] =
    useState<LiabilitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'asset' | 'liability'>('asset');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    value: 0,
    amount: 0,
    dueDate: '',
    purchaseDate: '',
    depreciationRate: 0,
    description: '',
  });

  // Fetch assets and liabilities data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsResponse, liabilitiesResponse] = await Promise.all([
        fetch('/api/assets?includeAutoCalculated=true'),
        fetch('/api/liabilities'),
      ]);

      if (assetsResponse.ok && liabilitiesResponse.ok) {
        const assetsData = await assetsResponse.json();
        const liabilitiesData = await liabilitiesResponse.json();

        setAssetsData(assetsData);
        setLiabilitiesData(liabilitiesData);
        setAssets(assetsData.assets || []);
        setLiabilities(liabilitiesData.liabilities || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description:
          'Failed to load assets and liabilities data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalAssets = assetsData?.totals.TOTAL || 0;
  const totalLiabilities = liabilitiesData?.totals.TOTAL || 0;
  const netWorth = liabilitiesData?.ownerEquity.ownerEquity || 0;
  const totalDepreciation = assets.reduce(
    (sum, asset) => sum + (asset.totalDepreciation || 0),
    0
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      FIXED_ASSET:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      CURRENT_ASSET:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      CURRENT_LIABILITY:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      LONG_TERM_LIABILITY:
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Inventory:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Vehicles:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Equipment:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Property:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return (
      colors[category] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    );
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: { [key: string]: string } = {
      FIXED_ASSET: 'Fixed Asset',
      CURRENT_ASSET: 'Current Asset',
      CURRENT_LIABILITY: 'Current Liability',
      LONG_TERM_LIABILITY: 'Long-term Liability',
    };
    return displayNames[category] || category;
  };

  const openModal = (type: 'asset' | 'liability') => {
    setModalType(type);
    setFormData({
      name: '',
      category: type === 'asset' ? 'FIXED_ASSET' : 'CURRENT_LIABILITY',
      subCategory: '',
      value: 0,
      amount: 0,
      dueDate: '',
      purchaseDate: '',
      depreciationRate: 0,
      description: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: '',
      subCategory: '',
      value: 0,
      amount: 0,
      dueDate: '',
      purchaseDate: '',
      depreciationRate: 0,
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) return;

    try {
      const endpoint =
        modalType === 'asset' ? '/api/assets' : '/api/liabilities';
      const requestData =
        modalType === 'asset'
          ? {
              name: formData.name,
              category: formData.category,
              subCategory: formData.subCategory,
              value: formData.value,
              description: formData.description,
              purchaseDate: formData.purchaseDate,
              depreciationRate: formData.depreciationRate,
            }
          : {
              name: formData.name,
              category: formData.category,
              amount: formData.amount,
              description: formData.description,
              dueDate: formData.dueDate,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${modalType === 'asset' ? 'Asset' : 'Liability'} created successfully!`,
        });
        closeModal();
        fetchData(); // Refresh the data
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${modalType}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="text-muted-foreground">
            Loading assets and liabilities...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            Assets and Liabilities
          </h1>
          <p className="text-muted-foreground">
            Manage company assets and financial obligations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center rounded-lg px-4 py-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          <button
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => openModal('asset')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Add Assets/Liabilities
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">Total Assets</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalAssets / 1000000)}M
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">Total Liabilities</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalLiabilities / 1000000)}M
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">Net Worth</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(netWorth / 1000000)}M
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">Depreciation</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalDepreciation / 1000)}K
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            Company Assets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Asset Name
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Category
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Quantity
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Unit Value
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Total Value
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Depreciation
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Net Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-foreground text-sm font-medium">
                      {asset.name}
                    </div>
                    {asset.description && (
                      <div className="text-muted-foreground text-xs">
                        {asset.description}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(asset.category)}`}
                    >
                      {getCategoryDisplayName(asset.category)}
                    </span>
                    {asset.subCategory && (
                      <div className="text-muted-foreground mt-1 text-xs">
                        {asset.subCategory}
                      </div>
                    )}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                    {asset.isAutoCalculated ? 'Auto' : '1'}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                    {formatCurrency(asset.originalValue || asset.currentValue)}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {formatCurrency(asset.originalValue || asset.currentValue)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                    {formatCurrency(asset.totalDepreciation || 0)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                    {formatCurrency(asset.currentValue)}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground px-6 py-4 text-center"
                  >
                    No assets found. Click "Add Assets/Liabilities" to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liabilities Table */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            Company Liabilities
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Liability
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Category
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Amount
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Due Date
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Monthly Payment
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {liabilities.map((liability) => (
                <tr key={liability.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-foreground text-sm font-medium">
                      {liability.name}
                    </div>
                    {liability.description && (
                      <div className="text-muted-foreground text-xs">
                        {liability.description}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(liability.category)}`}
                    >
                      {getCategoryDisplayName(liability.category)}
                    </span>
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {formatCurrency(liability.amount)}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                    {liability.dueDate
                      ? new Date(liability.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                    N/A
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                      ACTIVE
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      className="mr-3 text-blue-600 hover:text-blue-900"
                      onClick={() => alert('Make Payment coming soon!')}
                    >
                      Pay
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => alert('View Details coming soon!')}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {liabilities.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground px-6 py-4 text-center"
                  >
                    No liabilities found. Click "Add Assets/Liabilities" to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Sheet Summary */}
      <div className="bg-card rounded-lg p-6 shadow">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Balance Sheet Summary
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Total Assets
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets / 1000000)}M
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
            <h4 className="font-semibold text-red-800 dark:text-red-200">
              Total Liabilities
            </h4>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities / 1000000)}M
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Net Equity
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(netWorth / 1000000)}M
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Add New Asset */}
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Quick Add Asset
          </h3>
          <p className="text-muted-foreground mb-4">
            Add a new asset to your company portfolio
          </p>
          <button
            onClick={() => openModal('asset')}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Asset
          </button>
        </div>

        {/* Add New Liability */}
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Quick Add Liability
          </h3>
          <p className="text-muted-foreground mb-4">
            Add a new liability to your company records
          </p>
          <button
            onClick={() => openModal('liability')}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Add Liability
          </button>
        </div>
      </div>

      {/* Auto-Calculated Current Assets */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h3 className="text-foreground text-lg font-semibold">
            Auto-Calculated Current Assets
          </h3>
          <p className="text-muted-foreground text-sm">
            Real-time values linked to business operations
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {assetsData?.categorized.CURRENT.filter(
              (asset) => asset.isAutoCalculated
            ).map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200">
                    {asset.name}
                  </h4>
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(asset.currentValue)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {asset.subCategory}
                </div>
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {asset.description}
                </div>
              </div>
            ))}

            {(!assetsData?.categorized.CURRENT.some(
              (asset) => asset.isAutoCalculated
            ) ||
              assetsData?.categorized.CURRENT.length === 0) && (
              <div className="text-muted-foreground col-span-full py-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No auto-calculated current assets found.</p>
                <p className="text-sm">
                  Auto-calculated assets like inventory and receivables will
                  appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Depreciation Management */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h3 className="text-foreground text-lg font-semibold">
            Asset Depreciation Schedule
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Asset
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Original Cost
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Depreciation Method
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Annual Rate
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Accumulated
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Current Value
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              <tr className="hover:bg-muted/50">
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                  Delivery Trucks
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {formatCurrency(2400000)}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  Straight Line
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  10%
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                  {formatCurrency(240000)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                  {formatCurrency(2160000)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    className="mr-3 text-blue-600 hover:text-blue-900"
                    onClick={() => alert('Update Depreciation coming soon!')}
                  >
                    Update
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                  Office Equipment
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {formatCurrency(150000)}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  Straight Line
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  20%
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                  {formatCurrency(30000)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                  {formatCurrency(120000)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    className="mr-3 text-blue-600 hover:text-blue-900"
                    onClick={() => alert('Update Depreciation coming soon!')}
                  >
                    Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Impact Analysis */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Asset Performance Analysis
          </h3>
          <div className="space-y-4">
            <div className="border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">
                Return on Assets (ROA)
              </h4>
              <div className="text-3xl font-bold text-green-600">4.5%</div>
              <p className="text-muted-foreground mt-1 text-sm">
                Net Income / Total Assets
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">
                Asset Turnover
              </h4>
              <div className="text-3xl font-bold text-blue-600">1.27x</div>
              <p className="text-muted-foreground mt-1 text-sm">
                Revenue / Total Assets
              </p>
            </div>
            <div className="border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">
                Working Capital
              </h4>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(500000)}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Current Assets - Current Liabilities
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Balance Sheet Impact
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Today's Asset Changes
              </span>
              <span className="text-sm font-bold text-green-600">
                +{formatCurrency(50000)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <span className="text-sm font-medium text-red-900 dark:text-red-200">
                Today's Liability Changes
              </span>
              <span className="text-sm font-bold text-red-600">
                -{formatCurrency(25000)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Net Equity Change
              </span>
              <span className="text-sm font-bold text-blue-600">
                +{formatCurrency(75000)}
              </span>
            </div>
            <div className="border-border mt-4 border-t p-3">
              <h4 className="text-foreground mb-2 text-sm font-medium">
                Recent Transactions
              </h4>
              <div className="text-muted-foreground space-y-2 text-xs">
                <div>• Added 50 new cylinders ({formatCurrency(60000)})</div>
                <div>• Paid loan installment ({formatCurrency(25000)})</div>
                <div>• Equipment depreciation ({formatCurrency(5000)})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Asset/Liability Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Add New {modalType === 'asset' ? 'Asset' : 'Liability'}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setModalType('asset')}
                  className={`rounded-md px-3 py-1 text-sm ${
                    modalType === 'asset'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Asset
                </button>
                <button
                  onClick={() => setModalType('liability')}
                  className={`rounded-md px-3 py-1 text-sm ${
                    modalType === 'liability'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Liability
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {modalType === 'asset' ? 'Asset' : 'Liability'} Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder={`Enter ${modalType} name`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {modalType === 'asset' ? (
                    <>
                      <option value="FIXED_ASSET">Fixed Asset</option>
                      <option value="CURRENT_ASSET">Current Asset</option>
                    </>
                  ) : (
                    <>
                      <option value="CURRENT_LIABILITY">
                        Current Liability
                      </option>
                      <option value="LONG_TERM_LIABILITY">
                        Long-term Liability
                      </option>
                    </>
                  )}
                </select>
              </div>

              {modalType === 'asset' ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Vehicles, Equipment, Inventory"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Asset Value (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Depreciation Rate (%)
                      </label>
                      <input
                        type="number"
                        value={formData.depreciationRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            depreciationRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Optional description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Optional description"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:bg-muted/50 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  !formData.category ||
                  (modalType === 'asset' && formData.value <= 0) ||
                  (modalType === 'liability' && formData.amount <= 0)
                }
                className={`rounded-lg px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                  modalType === 'asset' ? 'bg-blue-600' : 'bg-red-600'
                }`}
              >
                Add {modalType === 'asset' ? 'Asset' : 'Liability'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
