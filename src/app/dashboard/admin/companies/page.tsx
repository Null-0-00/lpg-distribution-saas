"use client";

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

// Company & Product Management - Admin Interface (Prompt 12)
interface Company {
  id: string;
  name: string;
  type: 'LPG_SUPPLIER' | 'LOCAL_DISTRIBUTOR';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  isActive: boolean;
  productsCount: number;
  distributorsCount: number;
  monthlyVolume: number;
  lastOrderDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  companyId: string;
  name: string;
  size: string;
  fullName: string;
  currentPrice: number;
  costPrice: number;
  margin: number;
  isActive: boolean;
  lowStockThreshold: number;
  description?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Aygaz',
      type: 'LPG_SUPPLIER',
      contactPerson: 'Ahmet Yılmaz',
      email: 'sales@aygaz.com.tr',
      phone: '+90 212 123 4567',
      address: 'Istanbul, Turkey',
      taxId: 'TR12345678901',
      paymentTerms: '30 days',
      creditLimit: 5000000,
      isActive: true,
      productsCount: 8,
      distributorsCount: 25,
      monthlyVolume: 15000,
      lastOrderDate: '2024-01-15',
      createdAt: '2023-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jamuna Gas',
      type: 'LPG_SUPPLIER',
      contactPerson: 'Rahman Ahmed',
      email: 'orders@jamunagas.com',
      phone: '+880 2 123 4567',
      address: 'Dhaka, Bangladesh',
      taxId: 'BD98765432109',
      paymentTerms: '15 days',
      creditLimit: 3000000,
      isActive: true,
      productsCount: 6,
      distributorsCount: 18,
      monthlyVolume: 12000,
      lastOrderDate: '2024-01-14',
      createdAt: '2023-02-15',
      updatedAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'Petrobangla',
      type: 'LPG_SUPPLIER',
      contactPerson: 'Karim Hassan',
      email: 'supply@petrobangla.org.bd',
      phone: '+880 2 987 6543',
      address: 'Dhaka, Bangladesh',
      taxId: 'BD11223344556',
      paymentTerms: '45 days',
      creditLimit: 8000000,
      isActive: true,
      productsCount: 10,
      distributorsCount: 35,
      monthlyVolume: 25000,
      lastOrderDate: '2024-01-16',
      createdAt: '2023-01-10',
      updatedAt: '2024-01-16'
    }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      companyId: '1',
      name: '12kg LPG Cylinder',
      size: '12kg',
      fullName: 'Aygaz 12kg LPG Cylinder',
      currentPrice: 850,
      costPrice: 750,
      margin: 13.3,
      isActive: true,
      lowStockThreshold: 20
    },
    {
      id: '2',
      companyId: '1',
      name: '35kg Commercial Cylinder',
      size: '35kg',
      fullName: 'Aygaz 35kg Commercial Cylinder',
      currentPrice: 2100,
      costPrice: 1850,
      margin: 13.5,
      isActive: true,
      lowStockThreshold: 10
    },
    {
      id: '3',
      companyId: '2',
      name: '12kg LPG Cylinder',
      size: '12kg',
      fullName: 'Jamuna 12kg LPG Cylinder',
      currentPrice: 820,
      costPrice: 720,
      margin: 13.9,
      isActive: true,
      lowStockThreshold: 15
    }
  ]);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LPG_SUPPLIER' | 'LOCAL_DISTRIBUTOR'>('ALL');
  const [selectedTab, setSelectedTab] = useState<'companies' | 'products'>('companies');

  // Filter companies based on search and type
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || company.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSaveCompany = (companyData: Partial<Company>) => {
    if (editingCompany) {
      // Update existing company
      setCompanies(companies.map(c => 
        c.id === editingCompany.id 
          ? { ...c, ...companyData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Add new company
      const newCompany: Company = {
        id: Date.now().toString(),
        ...companyData as Company,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCompanies([...companies, newCompany]);
    }
    setEditingCompany(null);
    setShowAddForm(false);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      setCompanies(companies.filter(c => c.id !== companyId));
      // Also remove associated products
      setProducts(products.filter(p => p.companyId !== companyId));
    }
  };

  const getCompanyProducts = (companyId: string) => {
    return products.filter(p => p.companyId === companyId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company & Product Management</h1>
          <p className="text-gray-600">Admin-only interface for managing LPG suppliers and products</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Admin Only
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => {
              setEditingCompany(null);
              setShowAddForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold">{companies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Distributors</p>
              <p className="text-2xl font-bold">{companies.reduce((sum, c) => sum + c.distributorsCount, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Volume</p>
              <p className="text-2xl font-bold">{companies.reduce((sum, c) => sum + c.monthlyVolume, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setSelectedTab('companies')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                selectedTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Companies ({companies.length})
            </button>
            <button
              onClick={() => setSelectedTab('products')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                selectedTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'companies' ? (
            <>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies or contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ALL">All Types</option>
                  <option value="LPG_SUPPLIER">LPG Suppliers</option>
                  <option value="LOCAL_DISTRIBUTOR">Local Distributors</option>
                </select>
              </div>

              {/* Companies Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.taxId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.type === 'LPG_SUPPLIER' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {company.type === 'LPG_SUPPLIER' ? 'Supplier' : 'Distributor'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{company.contactPerson}</div>
                          <div className="text-sm text-gray-500">{company.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.productsCount} products
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.monthlyVolume.toLocaleString()} units/month
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ৳{company.creditLimit.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setEditingCompany(company)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCompany(company.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Products Tab */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Product Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {companies.map((company) => {
                    const companyProducts = getCompanyProducts(company.id);
                    return (
                      <div key={company.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{company.name}</h4>
                          <span className="text-sm text-gray-500">{companyProducts.length} products</span>
                        </div>
                        <div className="space-y-2">
                          {companyProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <div>
                                <div className="text-sm font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">৳{product.currentPrice} (Margin: {product.margin.toFixed(1)}%)</div>
                              </div>
                              <div className="flex space-x-1">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button className="w-full mt-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                            + Add Product
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Company Edit/Add Modal */}
      {(editingCompany || showAddForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button 
                onClick={() => {
                  setEditingCompany(null);
                  setShowAddForm(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const companyData = {
                name: formData.get('name') as string,
                type: formData.get('type') as 'LPG_SUPPLIER' | 'LOCAL_DISTRIBUTOR',
                contactPerson: formData.get('contactPerson') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
                taxId: formData.get('taxId') as string,
                paymentTerms: formData.get('paymentTerms') as string,
                creditLimit: Number(formData.get('creditLimit')),
                isActive: formData.get('isActive') === 'on',
                productsCount: editingCompany?.productsCount || 0,
                distributorsCount: editingCompany?.distributorsCount || 0,
                monthlyVolume: Number(formData.get('monthlyVolume')) || 0,
                lastOrderDate: editingCompany?.lastOrderDate || new Date().toISOString().split('T')[0]
              };
              handleSaveCompany(companyData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingCompany?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingCompany?.type || 'LPG_SUPPLIER'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="LPG_SUPPLIER">LPG Supplier</option>
                    <option value="LOCAL_DISTRIBUTOR">Local Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    name="contactPerson"
                    type="text"
                    required
                    defaultValue={editingCompany?.contactPerson || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingCompany?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={editingCompany?.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                  <input
                    name="taxId"
                    type="text"
                    defaultValue={editingCompany?.taxId || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    name="paymentTerms"
                    type="text"
                    placeholder="e.g., 30 days"
                    defaultValue={editingCompany?.paymentTerms || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (৳)</label>
                  <input
                    name="creditLimit"
                    type="number"
                    min="0"
                    defaultValue={editingCompany?.creditLimit || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Volume</label>
                  <input
                    name="monthlyVolume"
                    type="number"
                    min="0"
                    defaultValue={editingCompany?.monthlyVolume || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={editingCompany?.address || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingCompany?.isActive !== false}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Company</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCompany(null);
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}