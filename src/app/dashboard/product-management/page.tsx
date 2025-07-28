'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Package,
  Search,
  Eye,
  EyeOff,
  Check,
  X,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Company {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  _count?: {
    products: number;
  };
}

interface CylinderSize {
  id: string;
  size: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  size: string; // Size field from schema
  cylinderSizeId?: string;
  cylinderSize?: CylinderSize;
  fullCylinderWeight?: number;
  emptyCylinderWeight?: number;
  currentPrice?: number;
  lowStockThreshold?: number;
  isActive: boolean;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
  inventory?: {
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
    isLowStock: boolean;
  };
}

export default function ProductManagementPage() {
  const { t } = useSettings();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cylinderSizes, setCylinderSizes] = useState<CylinderSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'companies' | 'products' | 'cylinder-sizes'
  >('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCylinderSizeModal, setShowCylinderSizeModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCylinderSize, setEditingCylinderSize] =
    useState<CylinderSize | null>(null);

  // Search
  const [companySearch, setCompanySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cylinderSizeSearch, setCylinderSizeSearch] = useState('');

  // Forms
  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const [productForm, setProductForm] = useState({
    name: '', // Product name (e.g., LPG Cylinder, Cooking Gas, etc.)
    cylinderSizeId: '', // Reference to cylinder size
    currentPrice: 0,
    lowStockThreshold: 0,
    isActive: true,
    companyId: '',
  });

  const [cylinderSizeForm, setCylinderSizeForm] = useState({
    size: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCompanies();
    fetchProducts();
    fetchCylinderSizes();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching companies...');
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(
        `/api/companies?includeProducts=true&_t=${Date.now()}`,
        {
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Companies fetched:', data.companies?.length || 0);
        setCompanies(data.companies || []);
      } else {
        console.error(
          '❌ Failed to fetch companies:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching products...');
      // Add timestamp for cache-busting
      const response = await fetch(
        `/api/products?showAll=true&inventory=true&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Products fetched:', data.products?.length || 0);
        console.log('Frontend received:', data);
        data.products?.forEach((product: any) => {
          console.log(
            `Frontend: ${product.name}: isActive = ${product.isActive} (${typeof product.isActive})`
          );
        });
        setProducts(data.products || []);
      } else {
        console.error(
          '❌ Failed to fetch products:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCylinderSizes = async () => {
    try {
      const response = await fetch('/api/cylinder-sizes');
      if (response.ok) {
        const data = await response.json();
        setCylinderSizes(data.cylinderSizes || []);
      }
    } catch (error) {
      console.error('Error fetching cylinder sizes:', error);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCompany ? 'PUT' : 'POST';
      const url = editingCompany
        ? `/api/companies/${editingCompany.id}`
        : '/api/companies';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      if (response.ok) {
        console.log(
          '✅ Company created/updated successfully, refreshing list...'
        );
        setShowCompanyModal(false);
        setEditingCompany(null);
        resetCompanyForm();
        await fetchCompanies();
        console.log('✅ Company list refreshed');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save company:', errorData);
        alert(
          `${t('failedToSaveCompany')}: ${errorData.error || t('unknownError')}`
        );
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        console.log(
          '✅ Product created/updated successfully, refreshing list...'
        );
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        await fetchProducts();
        await fetchCompanies(); // Refresh to update product counts
        console.log('✅ Product list refreshed');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save product:', errorData);
        alert(
          `${t('failedToSaveProduct')}: ${errorData.error || t('unknownError')}`
        );
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm(t('areYouSureDeleteCompany'))) return;

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t('areYouSureDeleteProduct'))) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Product deleted successfully, refreshing list...');
        await fetchProducts();
        await fetchCompanies(); // Refresh to update product counts
        console.log('✅ Product list refreshed after deletion');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete product:', errorData);
        alert(
          `${t('failedToDeleteProduct')}: ${errorData.error || t('unknownError')}`
        );
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchProducts();
        fetchCompanies(); // Refresh to update product counts
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const openEditCompanyModal = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name || '',
      code: company.code || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      isActive: company.isActive ?? true,
    });
    setShowCompanyModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '', // Product name
      cylinderSizeId: product.cylinderSizeId || '', // Reference to cylinder size
      currentPrice: product.currentPrice || 0,
      lowStockThreshold: product.lowStockThreshold || 0,
      isActive: product.isActive ?? true,
      companyId: product.companyId || '',
    });
    setShowProductModal(true);
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      isActive: true,
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      cylinderSizeId: '',
      currentPrice: 0,
      lowStockThreshold: 0,
      isActive: true,
      companyId: '',
    });
  };

  const resetCylinderSizeForm = () => {
    setCylinderSizeForm({
      size: '',
      description: '',
      isActive: true,
    });
  };

  const handleCylinderSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCylinderSize ? 'PUT' : 'POST';
      const url = editingCylinderSize
        ? `/api/cylinder-sizes/${editingCylinderSize.id}`
        : '/api/cylinder-sizes';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cylinderSizeForm),
      });

      if (response.ok) {
        setShowCylinderSizeModal(false);
        setEditingCylinderSize(null);
        resetCylinderSizeForm();
        fetchCylinderSizes();
      }
    } catch (error) {
      console.error('Error saving cylinder size:', error);
    }
  };

  const handleDeleteCylinderSize = async (cylinderSizeId: string) => {
    if (confirm(t('areYouSureDeleteCylinderSize'))) {
      try {
        const response = await fetch(`/api/cylinder-sizes/${cylinderSizeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCylinderSizes();
        }
      } catch (error) {
        console.error('Error deleting cylinder size:', error);
      }
    }
  };

  const openEditCylinderSizeModal = (cylinderSize: CylinderSize) => {
    setEditingCylinderSize(cylinderSize);
    setCylinderSizeForm({
      size: cylinderSize.size || '',
      description: cylinderSize.description || '',
      isActive: cylinderSize.isActive ?? true,
    });
    setShowCylinderSizeModal(true);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      (company.code &&
        company.code.toLowerCase().includes(companySearch.toLowerCase()))
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.size.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.company?.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCylinderSizes = cylinderSizes.filter(
    (cylinderSize) =>
      cylinderSize.size
        .toLowerCase()
        .includes(cylinderSizeSearch.toLowerCase()) ||
      (cylinderSize.description &&
        cylinderSize.description
          .toLowerCase()
          .includes(cylinderSizeSearch.toLowerCase()))
  );

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">
            {t('productManagement')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('company')} {t('products')}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-border mb-6 border-b">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'companies', label: t('company'), icon: Building2 },
              { id: 'products', label: t('products'), icon: Package },
              {
                id: 'cylinder-sizes',
                label: t('cylinderSizes'),
                icon: Settings,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            {/* Companies Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
                  <input
                    type="text"
                    placeholder={t('searchCompanies')}
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="border-border bg-input text-foreground rounded-md border py-2 pl-10 pr-4"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCompanyModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>{t('addCompany')}</span>
              </button>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-card rounded-lg p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-foreground text-lg font-medium">
                        {company.name}
                      </h3>
                      {company.code && (
                        <p className="dark:text-muted-foreground text-sm text-gray-500">
                          Code: {company.code}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {company.isActive ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="dark:text-muted-foreground space-y-2 text-sm text-gray-600">
                    {company.phone && <p>📞 {company.phone}</p>}
                    {company.email && <p>✉️ {company.email}</p>}
                    {company.address && <p>📍 {company.address}</p>}
                    <p className="font-medium">
                      Products: {company.products?.length || 0}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => openEditCompanyModal(company)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={t('editCompany')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title={t('deleteCompany')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="dark:text-muted-foreground text-sm font-medium text-gray-600">
                      {t('totalProducts')}
                    </p>
                    <p className="text-foreground text-2xl font-bold">
                      {products.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-3">
                    <p className="dark:text-muted-foreground text-sm font-medium text-gray-600">
                      {t('activeProducts')}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {products.filter((p) => p.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      !
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="dark:text-muted-foreground text-sm font-medium text-gray-600">
                      {t('lowStock')}
                    </p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {products.filter((p) => p.inventory?.isLowStock).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-sm font-bold text-blue-600">Σ</span>
                  </div>
                  <div className="ml-3">
                    <p className="dark:text-muted-foreground text-sm font-medium text-gray-600">
                      {t('totalStock')}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {products.reduce(
                        (sum, p) => sum + (p.inventory?.fullCylinders || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-3">
                    <p className="dark:text-muted-foreground text-sm font-medium text-gray-600">
                      {t('companies')}
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {companies.filter((c) => c.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
                  <input
                    type="text"
                    placeholder={t('searchProducts')}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="border-border bg-input text-foreground rounded-md border py-2 pl-10 pr-4"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                <Plus className="h-5 w-5" />
                <span>{t('addProduct')}</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-card overflow-hidden rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('productName')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Company
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('cylinderSize')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('currentPrice')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('currentStock')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('lowStockAlert')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('created')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm font-medium">
                            {product.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {product.company?.name || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {product.cylinderSize
                              ? product.cylinderSize.size
                              : product.size}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {product.currentPrice
                              ? `৳${product.currentPrice.toLocaleString()}`
                              : '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {product.inventory ? (
                              <div className="space-y-1">
                                <div
                                  className={`font-medium ${
                                    product.inventory.isLowStock
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {product.inventory.fullCylinders} {t('full')}
                                </div>
                                <div className="dark:text-muted-foreground text-xs text-gray-500">
                                  {product.inventory.emptyCylinders}{' '}
                                  {t('empty')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                {t('loading')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {product.lowStockThreshold
                              ? `${product.lowStockThreshold} ${t('units')}`
                              : '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            onClick={() =>
                              toggleProductStatus(product.id, product.isActive)
                            }
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold transition-colors hover:opacity-80 ${
                              product.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                            }`}
                            title={`${product.isActive ? t('clickToDeactivate') : t('clickToActivate')} ${t('product')}`}
                          >
                            {product.isActive ? t('active') : t('inactive')}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t('editProduct')}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('deleteProduct')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center">
                    <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="dark:text-muted-foreground text-gray-500">
                      No products found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* {t("cylinderSize")}s Tab */}
        {activeTab === 'cylinder-sizes' && (
          <div className="space-y-6">
            {/* {t("cylinderSize")}s Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
                  <input
                    type="text"
                    placeholder={t('searchCylinderSizes')}
                    value={cylinderSizeSearch}
                    onChange={(e) => setCylinderSizeSearch(e.target.value)}
                    className="border-border bg-input text-foreground rounded-md border py-2 pl-10 pr-4"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCylinderSizeModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                <Plus className="h-5 w-5" />
                <span>Add {t('cylinderSize')}</span>
              </button>
            </div>

            {/* {t("cylinderSize")}s Table */}
            <div className="bg-card overflow-hidden rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('cylinderSize')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {t('created')}
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCylinderSizes.map((cylinderSize) => (
                      <tr key={cylinderSize.id} className="hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm font-medium">
                            {cylinderSize.size}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {cylinderSize.description || '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              cylinderSize.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {cylinderSize.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-foreground text-sm">
                            {new Date(
                              cylinderSize.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() =>
                                openEditCylinderSizeModal(cylinderSize)
                              }
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={`Edit ${t('cylinderSize')}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCylinderSize(cylinderSize.id)
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={`Delete ${t('cylinderSize')}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCylinderSizes.length === 0 && (
                  <div className="p-8 text-center">
                    <Settings className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="dark:text-muted-foreground text-gray-500">
                      No cylinder sizes found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-card mx-4 w-full max-w-md rounded-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-medium">
              {editingCompany ? t('editCompany') : t('addNewCompany')}
            </h3>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyForm.name || ''}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Code
                </label>
                <input
                  type="text"
                  value={companyForm.code || ''}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="text"
                  value={companyForm.phone || ''}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={companyForm.email || ''}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <textarea
                  value={companyForm.address || ''}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="companyActive"
                  checked={companyForm.isActive}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="companyActive"
                  className="text-foreground ml-2 block text-sm"
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompanyModal(false);
                    setEditingCompany(null);
                    resetCompanyForm();
                  }}
                  className="border-border hover:bg-muted rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-card mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-medium">
              {editingProduct ? t('editProduct') : t('addNewProduct')}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company *
                </label>
                <select
                  value={productForm.companyId}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      companyId: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select Company</option>
                  {companies
                    .filter((c) => c.isActive)
                    .map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('productName')} *
                </label>
                <input
                  type="text"
                  value={productForm.name || ''}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  placeholder={t('productNamePlaceholder')}
                  required
                />
                <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                  {t('enterProductNameExample')}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cylinder Type/Size *
                </label>
                <select
                  value={productForm.cylinderSizeId || ''}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      cylinderSizeId: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select {t('cylinderSize')}</option>
                  {cylinderSizes
                    .filter((cs) => cs.isActive)
                    .map((cylinderSize) => (
                      <option key={cylinderSize.id} value={cylinderSize.id}>
                        {cylinderSize.size}
                        {cylinderSize.description
                          ? ` - ${cylinderSize.description}`
                          : ''}
                      </option>
                    ))}
                </select>
                <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                  Select from available cylinder sizes.{' '}
                  <span
                    className="cursor-pointer text-blue-600"
                    onClick={() => setActiveTab('cylinder-sizes')}
                  >
                    Manage cylinder sizes
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('currentPrice')} (৳)
                  </label>
                  <input
                    type="number"
                    value={productForm.currentPrice}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        currentPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('lowStock')} Threshold
                  </label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        lowStockThreshold: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productActive"
                  checked={productForm.isActive}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="productActive"
                  className="text-foreground ml-2 block text-sm"
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="border-border hover:bg-muted rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* {t("cylinderSize")} Modal */}
      {showCylinderSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-card mx-4 w-full max-w-md rounded-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-medium">
              {editingCylinderSize
                ? 'Edit {t("cylinderSize")}'
                : 'Add New {t("cylinderSize")}'}
            </h3>
            <form onSubmit={handleCylinderSizeSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('cylinderSize')} *
                </label>
                <input
                  type="text"
                  value={cylinderSizeForm.size || ''}
                  onChange={(e) =>
                    setCylinderSizeForm((prev) => ({
                      ...prev,
                      size: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  placeholder={t('cylinderSizePlaceholder')}
                  required
                />
                <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                  Enter cylinder size (e.g., 12L, 35L, 5kg, 20L)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={cylinderSizeForm.description || ''}
                  onChange={(e) =>
                    setCylinderSizeForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  placeholder={t('optionalDescription')}
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cylinderSizeActive"
                  checked={cylinderSizeForm.isActive}
                  onChange={(e) =>
                    setCylinderSizeForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="cylinderSizeActive"
                  className="text-foreground ml-2 block text-sm"
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCylinderSizeModal(false);
                    setEditingCylinderSize(null);
                    resetCylinderSizeForm();
                  }}
                  className="border-border hover:bg-muted rounded-md border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  {editingCylinderSize ? 'Update' : 'Create'}{' '}
                  {t('cylinderSize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
