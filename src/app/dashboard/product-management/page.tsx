"use client";

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
  AlertCircle
} from 'lucide-react';

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cylinderSizes, setCylinderSizes] = useState<CylinderSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'products' | 'cylinder-sizes'>('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCylinderSizeModal, setShowCylinderSizeModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCylinderSize, setEditingCylinderSize] = useState<CylinderSize | null>(null);

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
    isActive: true
  });

  const [productForm, setProductForm] = useState({
    name: '', // Product name (e.g., LPG Cylinder, Cooking Gas, etc.)
    cylinderSizeId: '', // Reference to cylinder size
    currentPrice: 0,
    lowStockThreshold: 0,
    isActive: true,
    companyId: ''
  });

  const [cylinderSizeForm, setCylinderSizeForm] = useState({
    size: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCompanies();
    fetchProducts();
    fetchCylinderSizes();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies?includeProducts=true');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?showAll=true&inventory=true', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Frontend received:', data);
        data.products?.forEach((product: any) => {
          console.log(`Frontend: ${product.name}: isActive = ${product.isActive} (${typeof product.isActive})`);
        });
        setProducts(data.products || []);
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
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm)
      });

      if (response.ok) {
        setShowCompanyModal(false);
        setEditingCompany(null);
        resetCompanyForm();
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        fetchProducts();
        fetchCompanies(); // Refresh to update product counts
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all associated products.')) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
        fetchCompanies(); // Refresh to update product counts
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
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
      isActive: company.isActive ?? true
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
      companyId: product.companyId || ''
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
      isActive: true
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      cylinderSizeId: '',
      currentPrice: 0,
      lowStockThreshold: 0,
      isActive: true,
      companyId: ''
    });
  };

  const resetCylinderSizeForm = () => {
    setCylinderSizeForm({
      size: '',
      description: '',
      isActive: true
    });
  };

  const handleCylinderSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingCylinderSize ? 'PUT' : 'POST';
      const url = editingCylinderSize ? `/api/cylinder-sizes/${editingCylinderSize.id}` : '/api/cylinder-sizes';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cylinderSizeForm)
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
    if (confirm('Are you sure you want to delete this cylinder size?')) {
      try {
        const response = await fetch(`/api/cylinder-sizes/${cylinderSizeId}`, {
          method: 'DELETE'
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
      isActive: cylinderSize.isActive ?? true
    });
    setShowCylinderSizeModal(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    (company.code && company.code.toLowerCase().includes(companySearch.toLowerCase()))
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.size.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.company?.name.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredCylinderSizes = cylinderSizes.filter(cylinderSize =>
    cylinderSize.size.toLowerCase().includes(cylinderSizeSearch.toLowerCase()) ||
    (cylinderSize.description && cylinderSize.description.toLowerCase().includes(cylinderSizeSearch.toLowerCase()))
  );

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage companies and their product catalogs
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'cylinder-sizes', label: 'Cylinder Sizes', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
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
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCompanyModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Company</span>
              </button>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="bg-card rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        {company.name}
                      </h3>
                      {company.code && (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">
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

                  <div className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground">
                    {company.phone && (
                      <p>📞 {company.phone}</p>
                    )}
                    {company.email && (
                      <p>✉️ {company.email}</p>
                    )}
                    {company.address && (
                      <p>📍 {company.address}</p>
                    )}
                    <p className="font-medium">
                      Products: {company.products?.length || 0}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => openEditCompanyModal(company)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit Company"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Company"
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Active Products</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{products.filter(p => p.isActive).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">!</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {products.filter(p => p.inventory?.isLowStock).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">Σ</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Stock</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {products.reduce((sum, p) => sum + (p.inventory?.fullCylinders || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Companies</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{companies.filter(c => c.isActive).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cylinder Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Low Stock Alert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {product.company?.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {product.cylinderSize ? product.cylinderSize.size : product.size}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {product.currentPrice ? `৳${product.currentPrice.toLocaleString()}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {product.inventory ? (
                              <div className="space-y-1">
                                <div className={`font-medium ${
                                  product.inventory.isLowStock 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-foreground'
                                }`}>
                                  {product.inventory.fullCylinders} Full
                                </div>
                                <div className="text-xs text-gray-500 dark:text-muted-foreground">
                                  {product.inventory.emptyCylinders} Empty
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Loading...</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {product.lowStockThreshold ? `${product.lowStockThreshold} units` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleProductStatus(product.id, product.isActive)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors hover:opacity-80 ${
                              product.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                            }`}
                            title={`Click to ${product.isActive ? 'deactivate' : 'activate'} product`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Product"
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
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-muted-foreground">No products found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cylinder Sizes Tab */}
        {activeTab === 'cylinder-sizes' && (
          <div className="space-y-6">
            {/* Cylinder Sizes Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cylinder sizes..."
                    value={cylinderSizeSearch}
                    onChange={(e) => setCylinderSizeSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCylinderSizeModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Cylinder Size</span>
              </button>
            </div>

            {/* Cylinder Sizes Table */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cylinder Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCylinderSizes.map((cylinderSize) => (
                      <tr key={cylinderSize.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {cylinderSize.size}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {cylinderSize.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cylinderSize.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {cylinderSize.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {new Date(cylinderSize.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditCylinderSizeModal(cylinderSize)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Cylinder Size"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCylinderSize(cylinderSize.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Cylinder Size"
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
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-muted-foreground">No cylinder sizes found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h3>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyForm.name || ''}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Code
                </label>
                <input
                  type="text"
                  value={companyForm.code || ''}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={companyForm.phone || ''}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={companyForm.email || ''}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={companyForm.address || ''}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="companyActive"
                  checked={companyForm.isActive}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="companyActive" className="ml-2 block text-sm text-foreground">
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company *
                </label>
                <select
                  value={productForm.companyId}
                  onChange={(e) => setProductForm(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.filter(c => c.isActive).map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  placeholder="e.g., LPG Cylinder, Cooking Gas, Industrial Gas"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  Enter the product name (e.g., LPG Cylinder, Cooking Gas)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cylinder Type/Size *
                </label>
                <select
                  value={productForm.cylinderSizeId || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, cylinderSizeId: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                >
                  <option value="">Select Cylinder Size</option>
                  {cylinderSizes.filter(cs => cs.isActive).map(cylinderSize => (
                    <option key={cylinderSize.id} value={cylinderSize.id}>
                      {cylinderSize.size}{cylinderSize.description ? ` - ${cylinderSize.description}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  Select from available cylinder sizes. <span className="text-blue-600 cursor-pointer" onClick={() => setActiveTab('cylinder-sizes')}>Manage cylinder sizes</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Price (৳)
                  </label>
                  <input
                    type="number"
                    value={productForm.currentPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productActive"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="productActive" className="ml-2 block text-sm text-foreground">
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cylinder Size Modal */}
      {showCylinderSizeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {editingCylinderSize ? 'Edit Cylinder Size' : 'Add New Cylinder Size'}
            </h3>
            <form onSubmit={handleCylinderSizeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cylinder Size *
                </label>
                <input
                  type="text"
                  value={cylinderSizeForm.size || ''}
                  onChange={(e) => setCylinderSizeForm(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  placeholder="e.g., 12L, 35L, 5kg"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  Enter cylinder size (e.g., 12L, 35L, 5kg, 20L)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={cylinderSizeForm.description || ''}
                  onChange={(e) => setCylinderSizeForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cylinderSizeActive"
                  checked={cylinderSizeForm.isActive}
                  onChange={(e) => setCylinderSizeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="cylinderSizeActive" className="ml-2 block text-sm text-foreground">
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 transition-colors"
                >
                  {editingCylinderSize ? 'Update' : 'Create'} Cylinder Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}