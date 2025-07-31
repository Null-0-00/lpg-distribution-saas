'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  X,
  RefreshCw,
  Edit,
  Trash2,
  Save,
  XCircle,
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
  details?: {
    quantity?: number;
    unitPrice?: number;
    isEditable?: boolean;
  };
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

interface FullCylinderData {
  company: string;
  size: string;
  quantity: number;
}

interface EmptyCylinderData {
  size: string;
  emptyCylinders: number;
  emptyCylindersInHand: number;
}

interface CylindersSummaryData {
  fullCylinders: FullCylinderData[];
  emptyCylinders: EmptyCylinderData[];
  totals: {
    fullCylinders: number;
    emptyCylinders: number;
    emptyCylindersInHand: number;
  };
  totalCylinderReceivables: number;
  lastUpdated: string;
}

export default function AssetsPage() {
  const { toast } = useToast();
  const { formatCurrency, t } = useSettings();
  const { data: session } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [assetsData, setAssetsData] = useState<AssetsData | null>(null);
  const [liabilitiesData, setLiabilitiesData] =
    useState<LiabilitiesData | null>(null);
  const [cylindersSummaryData, setCylindersSummaryData] =
    useState<CylindersSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingUnitValue, setEditingUnitValue] = useState<number>(0);
  const [editingLiability, setEditingLiability] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(
    null
  );

  // State for cylinder unit prices
  const [cylinderUnitPrices, setCylinderUnitPrices] = useState<{
    [key: string]: number;
  }>({});

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
      const [assetsResponse, liabilitiesResponse, cylindersResponse] =
        await Promise.all([
          fetch('/api/assets?includeAutoCalculated=true'),
          fetch('/api/liabilities'),
          fetch('/api/inventory/cylinders-summary'),
        ]);

      if (assetsResponse.ok && liabilitiesResponse.ok) {
        const assetsData = await assetsResponse.json();
        const liabilitiesData = await liabilitiesResponse.json();

        setAssetsData(assetsData);
        setLiabilitiesData(liabilitiesData);
        setAssets(assetsData.assets || []);
        setLiabilities(liabilitiesData.liabilities || []);

        if (cylindersResponse.ok) {
          const cylindersData = await cylindersResponse.json();
          setCylindersSummaryData(cylindersData);
        }
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadAssetsLiabilities'),
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

  // Helper functions for cylinder calculations using useCallback
  const getCylinderUnitPrice = useCallback(
    (cylinderKey: string): number => {
      return cylinderUnitPrices[cylinderKey] || 0;
    },
    [cylinderUnitPrices]
  );

  const calculateCylinderValue = useCallback(
    (quantity: number, cylinderKey: string): number => {
      return quantity * (cylinderUnitPrices[cylinderKey] || 0);
    },
    [cylinderUnitPrices]
  );

  const updateCylinderUnitPrice = useCallback(
    (cylinderKey: string, unitPrice: number) => {
      setCylinderUnitPrices((prev) => ({
        ...prev,
        [cylinderKey]: unitPrice,
      }));
    },
    []
  );

  // Calculate cylinder asset values
  const totalCylinderAssets = useMemo(() => {
    let total = 0;

    // Add full cylinders value
    cylindersSummaryData?.fullCylinders?.forEach((item) => {
      const cylinderKey = `full-${item.company}-${item.size}`;
      const unitPrice = cylinderUnitPrices[cylinderKey] || 0;
      total += item.quantity * unitPrice;
    });

    // Add empty cylinders value
    cylindersSummaryData?.emptyCylinders?.forEach((item) => {
      const cylinderKey = `empty-${item.size}`;
      const unitPrice = cylinderUnitPrices[cylinderKey] || 0;
      total += item.emptyCylindersInHand * unitPrice;
    });

    return total;
  }, [cylindersSummaryData, cylinderUnitPrices]);

  const totalAssets = (assetsData?.totals.TOTAL || 0) + totalCylinderAssets;
  const totalLiabilities = liabilitiesData?.totals.TOTAL || 0;
  const netWorth = totalAssets - totalLiabilities;
  const totalDepreciation = assets
    .filter(
      (asset) =>
        !asset.isAutoCalculated &&
        asset.depreciationRate &&
        asset.depreciationRate > 0
    )
    .reduce((sum, asset) => {
      const purchaseDate = asset.purchaseDate
        ? new Date(asset.purchaseDate)
        : null;
      const currentDate = new Date();
      const yearsOwned = purchaseDate
        ? Math.max(
            0,
            (currentDate.getTime() - purchaseDate.getTime()) /
              (1000 * 60 * 60 * 24 * 365)
          )
        : 0;
      const originalValue = asset.originalValue || asset.currentValue;
      return (
        sum + originalValue * ((asset.depreciationRate || 0) / 100) * yearsOwned
      );
    }, 0);

  const isAdmin = session?.user?.role === 'ADMIN';

  // Helper function to translate asset names and descriptions
  const translateAssetName = (name: string): string => {
    const translations: { [key: string]: string } = {
      'Cash Receivables': t('cashReceivablesAsset'),
      'Cash in Hand': t('cashInHandAsset'),
    };

    // Handle cylinder names with dynamic company and size
    if (name.startsWith('Full Cylinders - ')) {
      const parts = name.replace('Full Cylinders - ', '');
      return `${t('fullCylinders')} - ${parts}`;
    }
    if (name.startsWith('Empty Cylinders - ')) {
      const parts = name.replace('Empty Cylinders - ', '');
      return `${t('emptyCylinders')} - ${parts}`;
    }

    return translations[name] || name;
  };

  const translateAssetDescription = (
    description: string | undefined
  ): string => {
    if (!description) return '';
    const translations: { [key: string]: string } = {
      'Outstanding cash receivables from drivers': t(
        'outstandingCashReceivablesFromDrivers'
      ),
      'Available cash calculated from deposits minus expenses': t(
        'availableCashCalculatedFromDeposits'
      ),
    };
    return translations[description] || description;
  };

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
      FIXED_ASSET: t('fixedAsset'),
      CURRENT_ASSET: t('currentAsset'),
      CURRENT_LIABILITY: t('currentLiability'),
      LONG_TERM_LIABILITY: t('longTermLiability'),
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
    setEditingItem(null);
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
      const isEditing = editingItem !== null;
      const method = isEditing ? 'PUT' : 'POST';

      const requestData =
        modalType === 'asset'
          ? {
              ...(isEditing && { id: editingItem.id }),
              name: formData.name,
              category: formData.category,
              subCategory: formData.subCategory,
              value: formData.value,
              description: formData.description,
              purchaseDate: formData.purchaseDate,
              depreciationRate: formData.depreciationRate,
            }
          : {
              ...(isEditing && { id: editingItem.id }),
              name: formData.name,
              category: formData.category,
              amount: formData.amount,
              description: formData.description,
              dueDate: formData.dueDate,
            };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: `${modalType === 'asset' ? t('asset') : t('liabilityWord')} ${isEditing ? t('updated') : t('created')} ${t('successfully')}!`,
        });
        closeModal();
        fetchData(); // refresh the data
      } else {
        const error = await response.json();
        throw new Error(error.message || t('failedToUpdateCreateEntry'));
      }
    } catch (error) {
      console.error(
        `Error ${editingItem ? 'updating' : 'creating'} entry:`,
        error
      );
      toast({
        title: t('error'),
        description: `${editingItem ? (modalType === 'asset' ? t('failedToUpdateAsset') : t('failedToUpdateLiability')) : modalType === 'asset' ? t('failedToCreateAsset') : t('failedToCreateLiability')}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm(t('areYouSureDeleteAsset'))) return;

    try {
      const response = await fetch(`/api/assets?id=${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('assetDeletedSuccessfully'),
        });
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteAsset'),
        variant: 'destructive',
      });
    }
  };

  const handleStartEditUnitValue = (asset: Asset) => {
    setEditingAsset(asset.id);
    setEditingUnitValue(asset.details?.unitPrice || 0);
  };

  const handleSaveUnitValue = async (assetId: string) => {
    try {
      // Check if this is a cylinder asset
      if (assetId.startsWith('full-') || assetId.startsWith('empty-')) {
        // Handle cylinder unit price update
        updateCylinderUnitPrice(assetId, editingUnitValue);
        toast({
          title: t('success'),
          description: t('unitValueUpdatedSuccessfully'),
        });
        setEditingAsset(null);
        return;
      }

      // Handle regular asset unit price update
      const response = await fetch('/api/assets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: assetId,
          unitValue: editingUnitValue,
        }),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('unitValueUpdatedSuccessfully'),
        });
        setEditingAsset(null);
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update unit value');
      }
    } catch (error) {
      console.error('Error updating unit value:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateUnitValue'),
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setEditingUnitValue(0);
    setEditingLiability(null);
    setEditingItem(null);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingItem(asset);
    setModalType('asset');
    setFormData({
      name: asset.name,
      category: asset.category,
      subCategory: asset.subCategory || '',
      value: asset.originalValue || asset.currentValue,
      amount: 0,
      dueDate: '',
      purchaseDate: asset.purchaseDate || '',
      depreciationRate: asset.depreciationRate || 0,
      description: asset.description || '',
    });
    setIsModalOpen(true);
  };

  const handleEditLiability = (liability: Liability) => {
    setEditingItem(liability);
    setModalType('liability');
    setFormData({
      name: liability.name,
      category: liability.category,
      subCategory: '',
      value: 0,
      amount: liability.amount,
      dueDate: liability.dueDate || '',
      purchaseDate: '',
      depreciationRate: 0,
      description: liability.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    if (!confirm(t('areYouSureDeleteLiability'))) return;

    try {
      const response = await fetch(`/api/liabilities?id=${liabilityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('liabilityDeletedSuccessfully'),
        });
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete liability');
      }
    } catch (error) {
      console.error('Error deleting liability:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteLiability'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="text-muted-foreground">{t('loadingData')}...</span>
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
            {t('assetsAndLiabilities')}
          </h1>
          <p className="text-muted-foreground">{t('manageCompanyAssets')}</p>
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
            {t('refresh')}
          </button>
          <button
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => openModal('asset')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            {t('addAssetsLiabilities')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('assets')}</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalAssets)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('pending')}</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalLiabilities)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('netWorth')}</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('depreciation')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(totalDepreciation)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            {t('companyAssets')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('assetName')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('category')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('quantity')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('unitValue')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('totalValue')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('depreciation')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('netValue')}
                </th>
                {isAdmin && (
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {/* Render regular assets */}
              {assets.map((asset) => {
                // Calculate depreciation for each asset
                const purchaseDate = asset.purchaseDate
                  ? new Date(asset.purchaseDate)
                  : null;
                const currentDate = new Date();
                const yearsOwned = purchaseDate
                  ? Math.max(
                      0,
                      (currentDate.getTime() - purchaseDate.getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    )
                  : 0;
                const originalValue = asset.originalValue || asset.currentValue;
                const accumulatedDepreciation =
                  asset.depreciationRate &&
                  asset.depreciationRate > 0 &&
                  !asset.isAutoCalculated
                    ? originalValue *
                      ((asset.depreciationRate || 0) / 100) *
                      yearsOwned
                    : 0;
                const depreciatedCurrentValue =
                  asset.depreciationRate &&
                  asset.depreciationRate > 0 &&
                  !asset.isAutoCalculated
                    ? Math.max(0, originalValue - accumulatedDepreciation)
                    : asset.currentValue;

                return (
                  <tr key={asset.id} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-foreground text-sm font-medium">
                        {translateAssetName(asset.name)}
                      </div>
                      {asset.description && (
                        <div className="text-muted-foreground text-xs">
                          {translateAssetDescription(asset.description)}
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
                      {asset.isAutoCalculated
                        ? asset.details?.quantity || t('auto')
                        : '1'}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {asset.isAutoCalculated &&
                      asset.details?.isEditable &&
                      isAdmin ? (
                        editingAsset === asset.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingUnitValue}
                              onChange={(e) =>
                                setEditingUnitValue(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded border px-2 py-1 text-sm"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleSaveUnitValue(asset.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>
                              {formatCurrency(asset.details?.unitPrice || 0)}
                            </span>
                            <button
                              onClick={() => handleStartEditUnitValue(asset)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        formatCurrency(
                          asset.originalValue || asset.currentValue
                        )
                      )}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {formatCurrency(
                        asset.originalValue || asset.currentValue
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                      {formatCurrency(accumulatedDepreciation)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(depreciatedCurrentValue)}
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {!asset.isAutoCalculated && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="text-blue-600 hover:text-blue-800"
                              title={t('editAsset')}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-800"
                              title={t('deleteAsset')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {asset.isAutoCalculated && (
                          <span className="text-xs text-gray-500">
                            {t('autoCalculated')}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Render cylinder assets from inventory */}
              {cylindersSummaryData?.fullCylinders?.map((item, index) => {
                const cylinderKey = `full-${item.company}-${item.size}`;
                const unitPrice = getCylinderUnitPrice(cylinderKey);
                const totalValue = calculateCylinderValue(
                  item.quantity,
                  cylinderKey
                );

                return (
                  <tr key={cylinderKey} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-foreground text-sm font-medium">
                        {t('fullCylinders')} - {item.company} {item.size}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {t('autoCalculatedFromInventory')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {t('currentAsset')}
                      </span>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {t('inventory')}
                      </div>
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {item.quantity}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {isAdmin ? (
                        editingAsset === cylinderKey ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingUnitValue}
                              onChange={(e) =>
                                setEditingUnitValue(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded border px-2 py-1 text-sm"
                              step="0.01"
                              placeholder="0"
                            />
                            <button
                              onClick={() => handleSaveUnitValue(cylinderKey)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{formatCurrency(unitPrice)}</span>
                            <button
                              onClick={() => {
                                setEditingAsset(cylinderKey);
                                setEditingUnitValue(unitPrice);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        <div>
                          <span>{formatCurrency(unitPrice)}</span>
                          {unitPrice === 0 && (
                            <div className="text-muted-foreground text-xs">
                              {t('setUnitPrice')}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                      {formatCurrency(0)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(totalValue)}
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="text-xs text-blue-500">
                          {t('editable')}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}

              {cylindersSummaryData?.emptyCylinders?.map((item, index) => {
                const cylinderKey = `empty-${item.size}`;
                const unitPrice = getCylinderUnitPrice(cylinderKey);
                const totalValue = calculateCylinderValue(
                  item.emptyCylindersInHand,
                  cylinderKey
                );

                return (
                  <tr key={cylinderKey} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-foreground text-sm font-medium">
                        {t('emptyCylinders')} - {item.size}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {t('autoCalculatedFromInventory')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {t('currentAsset')}
                      </span>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {t('inventory')}
                      </div>
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {item.emptyCylindersInHand}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {isAdmin ? (
                        editingAsset === cylinderKey ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingUnitValue}
                              onChange={(e) =>
                                setEditingUnitValue(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded border px-2 py-1 text-sm"
                              step="0.01"
                              placeholder="0"
                            />
                            <button
                              onClick={() => handleSaveUnitValue(cylinderKey)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{formatCurrency(unitPrice)}</span>
                            <button
                              onClick={() => {
                                setEditingAsset(cylinderKey);
                                setEditingUnitValue(unitPrice);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        <div>
                          <span>{formatCurrency(unitPrice)}</span>
                          {unitPrice === 0 && (
                            <div className="text-muted-foreground text-xs">
                              {t('setUnitPrice')}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                      {formatCurrency(0)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(totalValue)}
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="text-xs text-blue-500">
                          {t('editable')}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}

              {assets.length === 0 &&
                !cylindersSummaryData?.fullCylinders?.length &&
                !cylindersSummaryData?.emptyCylinders?.length && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 7}
                      className="text-muted-foreground px-6 py-4 text-center"
                    >
                      No assets found. Click "{t('addAssetsLiabilities')}" to
                      get started.
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
            {t('companyLiabilities')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('liability')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('category')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('amount')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('dueDate')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('monthlyPayment')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('status')}
                </th>
                {isAdmin && (
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('actions')}
                  </th>
                )}
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
                      : t('notAvailable')}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                    {t('notAvailable')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t('active').toUpperCase()}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditLiability(liability)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit liability"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLiability(liability.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete liability"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {liabilities.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="text-muted-foreground px-6 py-4 text-center"
                  >
                    No liabilities found. Click "{t('addAssetsLiabilities')}" to
                    get started.
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
          {t('balanceSheetSummary')}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              {t('totalAssets')}
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
            <h4 className="font-semibold text-red-800 dark:text-red-200">
              {t('totalLiabilities')}
            </h4>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              {t('netEquity')}
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(netWorth)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Add New Asset */}
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('quickAddAsset')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('addNewAssetToPortfolio')}
          </p>
          <button
            onClick={() => openModal('asset')}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('addAsset')}
          </button>
        </div>

        {/* Add New Liability */}
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('quickAddLiability')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('addNewLiabilityToRecords')}
          </p>
          <button
            onClick={() => openModal('liability')}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            {t('addLiability')}
          </button>
        </div>
      </div>

      {/* {t('autoCalculatedCurrentAssets')} */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h3 className="text-foreground text-lg font-semibold">
            {t('autoCalculatedCurrentAssets')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('realTimeValuesLinkedToBusinessOperations')}
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
                    {translateAssetName(asset.name)}
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
                  {translateAssetDescription(asset.description)}
                </div>
              </div>
            ))}

            {(!assetsData?.categorized.CURRENT.some(
              (asset) => asset.isAutoCalculated
            ) ||
              assetsData?.categorized.CURRENT.length === 0) && (
              <div className="text-muted-foreground col-span-full py-8 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>{t('noAutoCalculatedAssetsFound')}</p>
                <p className="text-sm">
                  {t('autoCalculatedAssetsDescription')}
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
            {t('assetDepreciationSchedule')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('assetsWithDepreciationRates')}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Asset
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('originalCost')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('purchaseDate')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('depreciationMethod')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('annualRate')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('yearsOwned')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('accumulated')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Current Value
                </th>
                {isAdmin && (
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                    {t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {assets
                .filter(
                  (asset) =>
                    !asset.isAutoCalculated &&
                    asset.depreciationRate &&
                    asset.depreciationRate > 0
                )
                .map((asset) => {
                  const purchaseDate = asset.purchaseDate
                    ? new Date(asset.purchaseDate)
                    : null;
                  const currentDate = new Date();
                  const yearsOwned = purchaseDate
                    ? Math.max(
                        0,
                        (currentDate.getTime() - purchaseDate.getTime()) /
                          (1000 * 60 * 60 * 24 * 365)
                      )
                    : 0;
                  const originalValue =
                    asset.originalValue || asset.currentValue;
                  const accumulatedDepreciation =
                    originalValue *
                    ((asset.depreciationRate || 0) / 100) *
                    yearsOwned;
                  const currentValue = Math.max(
                    0,
                    originalValue - accumulatedDepreciation
                  );

                  return (
                    <tr key={asset.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-foreground text-sm font-medium">
                          {translateAssetName(asset.name)}
                        </div>
                        {asset.subCategory && (
                          <div className="text-muted-foreground text-xs">
                            {asset.subCategory}
                          </div>
                        )}
                        {asset.description && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {asset.description}
                          </div>
                        )}
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                        {formatCurrency(originalValue)}
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {purchaseDate
                          ? purchaseDate.toLocaleDateString()
                          : t('notAvailable')}
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        Straight Line
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {asset.depreciationRate}%
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {yearsOwned.toFixed(1)} years
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                        {formatCurrency(accumulatedDepreciation)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                        {formatCurrency(currentValue)}
                      </td>
                      {isAdmin && (
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit Depreciation Settings"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-800"
                              title={t('deleteAsset')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              {assets.filter(
                (asset) =>
                  !asset.isAutoCalculated &&
                  asset.depreciationRate &&
                  asset.depreciationRate > 0
              ).length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className="text-muted-foreground px-6 py-8 text-center"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Package className="h-12 w-12 text-gray-300" />
                      <p>{t('noAssetsWithDepreciationFound')}</p>
                      <p className="text-sm">
                        {t('addAssetsWithPurchaseDates')}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={() => openModal('asset')}
                          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          {t('addDepreciableAsset')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {assets.filter(
          (asset) =>
            !asset.isAutoCalculated &&
            asset.depreciationRate &&
            asset.depreciationRate > 0
        ).length > 0 && (
          <div className="bg-muted/30 px-6 py-4">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="text-center">
                <span className="text-muted-foreground">
                  {t('originalCost')}:
                </span>
                <div className="text-foreground font-semibold">
                  {formatCurrency(
                    assets
                      .filter(
                        (asset) =>
                          !asset.isAutoCalculated &&
                          asset.depreciationRate &&
                          asset.depreciationRate > 0
                      )
                      .reduce(
                        (sum, asset) =>
                          sum + (asset.originalValue || asset.currentValue),
                        0
                      )
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">
                  Total {t('depreciation')}:
                </span>
                <div className="font-semibold text-red-600">
                  {formatCurrency(
                    assets
                      .filter(
                        (asset) =>
                          !asset.isAutoCalculated &&
                          asset.depreciationRate &&
                          asset.depreciationRate > 0
                      )
                      .reduce((sum, asset) => {
                        const purchaseDate = asset.purchaseDate
                          ? new Date(asset.purchaseDate)
                          : null;
                        const currentDate = new Date();
                        const yearsOwned = purchaseDate
                          ? Math.max(
                              0,
                              (currentDate.getTime() - purchaseDate.getTime()) /
                                (1000 * 60 * 60 * 24 * 365)
                            )
                          : 0;
                        const originalValue =
                          asset.originalValue || asset.currentValue;
                        return (
                          sum +
                          originalValue *
                            ((asset.depreciationRate || 0) / 100) *
                            yearsOwned
                        );
                      }, 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">Net Book Value:</span>
                <div className="font-semibold text-green-600">
                  {formatCurrency(
                    assets
                      .filter(
                        (asset) =>
                          !asset.isAutoCalculated &&
                          asset.depreciationRate &&
                          asset.depreciationRate > 0
                      )
                      .reduce((sum, asset) => {
                        const purchaseDate = asset.purchaseDate
                          ? new Date(asset.purchaseDate)
                          : null;
                        const currentDate = new Date();
                        const yearsOwned = purchaseDate
                          ? Math.max(
                              0,
                              (currentDate.getTime() - purchaseDate.getTime()) /
                                (1000 * 60 * 60 * 24 * 365)
                            )
                          : 0;
                        const originalValue =
                          asset.originalValue || asset.currentValue;
                        const accumulatedDepreciation =
                          originalValue *
                          ((asset.depreciationRate || 0) / 100) *
                          yearsOwned;
                        return (
                          sum +
                          Math.max(0, originalValue - accumulatedDepreciation)
                        );
                      }, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Asset/Liability Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {editingItem ? t('edit') : 'Add New'}{' '}
                {modalType === 'asset' ? 'Asset' : 'Liability'}
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
                  onClick={() => {
                    setModalType('asset');
                    setFormData((prev) => ({
                      ...prev,
                      category: 'FIXED_ASSET',
                    }));
                  }}
                  className={`rounded-md px-3 py-1 text-sm ${
                    modalType === 'asset'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Asset
                </button>
                <button
                  onClick={() => {
                    setModalType('liability');
                    setFormData((prev) => ({
                      ...prev,
                      category: 'CURRENT_LIABILITY',
                    }));
                  }}
                  className={`rounded-md px-3 py-1 text-sm ${
                    modalType === 'liability'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('liability')}
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
                  {t('category')}
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
                      <option value="FIXED_ASSET">{t('fixedAsset')}</option>
                      <option value="CURRENT_ASSET">{t('currentAsset')}</option>
                    </>
                  ) : (
                    <>
                      <option value="CURRENT_LIABILITY">
                        Current {t('liability')}
                      </option>
                      <option value="LONG_TERM_LIABILITY">
                        Long-term {t('liability')}
                      </option>
                    </>
                  )}
                </select>
              </div>

              {modalType === 'asset' ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sub {t('category')}
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
                      placeholder={t('assetPlaceholder')}
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
                        {t('depreciation')} Rate (%)
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
                      Total {t('amount')} (৳)
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
                      {t('dueDate')}
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
                {editingItem ? 'Update' : 'Add'}{' '}
                {modalType === 'asset' ? 'Asset' : 'Liability'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
