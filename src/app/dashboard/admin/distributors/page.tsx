'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  DollarSign,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Package,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Settings,
} from 'lucide-react';

// Distributor Assignments - Territory & Pricing Management (Prompt 12)
interface Distributor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  territory: string;
  pricingTier: 'PREMIUM' | 'STANDARD' | 'BASIC';
  isActive: boolean;
  assignedCompanies: string[];
  assignedProducts: string[];
  monthlyTarget: number;
  currentRevenue: number;
  lastActivity: string;
  joinDate: string;
}

interface PricingTier {
  id: string;
  name: string;
  discountPercentage: number;
  minimumOrder: number;
  paymentTerms: string;
  description: string;
}

interface TerritoryAssignment {
  distributorId: string;
  territory: string;
  area: string;
  population: number;
  estimatedPotential: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([
    {
      id: '1',
      name: 'Rahman Trading Co.',
      businessName: 'Rahman Enterprise',
      email: 'rahman@trading.com',
      phone: '+880 1712 345 678',
      territory: 'Dhaka North',
      pricingTier: 'PREMIUM',
      isActive: true,
      assignedCompanies: ['1', '2'], // Aygaz, Jamuna
      assignedProducts: ['1', '2', '3'],
      monthlyTarget: 500000,
      currentRevenue: 425000,
      lastActivity: '2024-01-16',
      joinDate: '2023-01-15',
    },
    {
      id: '2',
      name: 'Karim Gas Agency',
      businessName: 'K.G. Agency Ltd.',
      email: 'karim@gasagency.com',
      phone: '+880 1812 567 890',
      territory: 'Dhaka South',
      pricingTier: 'STANDARD',
      isActive: true,
      assignedCompanies: ['2', '3'], // Jamuna, Petrobangla
      assignedProducts: ['3', '4', '5'],
      monthlyTarget: 350000,
      currentRevenue: 295000,
      lastActivity: '2024-01-15',
      joinDate: '2023-03-20',
    },
    {
      id: '3',
      name: 'Hasan Brothers',
      businessName: 'Hasan Bros Gas Dist.',
      email: 'hasan@brothers.com',
      phone: '+880 1912 789 012',
      territory: 'Chittagong',
      pricingTier: 'BASIC',
      isActive: true,
      assignedCompanies: ['1', '3'], // Aygaz, Petrobangla
      assignedProducts: ['1', '4', '6'],
      monthlyTarget: 280000,
      currentRevenue: 265000,
      lastActivity: '2024-01-14',
      joinDate: '2023-06-10',
    },
  ]);

  const [pricingTiers] = useState<PricingTier[]>([
    {
      id: 'PREMIUM',
      name: 'Premium Tier',
      discountPercentage: 8.5,
      minimumOrder: 1000000,
      paymentTerms: '45 days',
      description: 'Highest volume distributors with best margins',
    },
    {
      id: 'STANDARD',
      name: 'Standard Tier',
      discountPercentage: 6.0,
      minimumOrder: 500000,
      paymentTerms: '30 days',
      description: 'Regular distributors with moderate volumes',
    },
    {
      id: 'BASIC',
      name: 'Basic Tier',
      discountPercentage: 3.5,
      minimumOrder: 200000,
      paymentTerms: '15 days',
      description: 'Entry level distributors with basic terms',
    },
  ]);

  const [companies] = useState([
    { id: '1', name: 'Aygaz' },
    { id: '2', name: 'Jamuna Gas' },
    { id: '3', name: 'Petrobangla' },
  ]);

  const [territories] = useState([
    'Dhaka North',
    'Dhaka South',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
  ]);

  const [editingDistributor, setEditingDistributor] =
    useState<Distributor | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] =
    useState<Distributor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<
    'ALL' | 'PREMIUM' | 'STANDARD' | 'BASIC'
  >('ALL');
  const [selectedTab, setSelectedTab] = useState<
    'distributors' | 'territories' | 'pricing'
  >('distributors');

  const filteredDistributors = distributors.filter((distributor) => {
    const matchesSearch =
      distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterTier === 'ALL' || distributor.pricingTier === filterTier;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateDistributor = (distributorData: Partial<Distributor>) => {
    if (editingDistributor) {
      setDistributors(
        distributors.map((d) =>
          d.id === editingDistributor.id ? { ...d, ...distributorData } : d
        )
      );
    }
    setEditingDistributor(null);
  };

  const handleAssignmentUpdate = (
    distributorId: string,
    assignments: {
      companies: string[];
      products: string[];
      territory: string;
      pricingTier: string;
    }
  ) => {
    setDistributors(
      distributors.map((d) =>
        d.id === distributorId
          ? {
              ...d,
              assignedCompanies: assignments.companies,
              assignedProducts: assignments.products,
              territory: assignments.territory,
              pricingTier: assignments.pricingTier as
                | 'PREMIUM'
                | 'STANDARD'
                | 'BASIC',
            }
          : d
      )
    );
    setShowAssignmentModal(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800';
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800';
      case 'BASIC':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Distributor Assignments
          </h1>
          <p className="text-gray-600">
            Territory management and pricing tier assignments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            Admin Only
          </div>
          <button
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            onClick={() => setShowAssignmentModal(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Bulk Assignment
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Distributors</p>
              <p className="text-2xl font-bold">
                {distributors.filter((d) => d.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Territories Covered</p>
              <p className="text-2xl font-bold">
                {[...new Set(distributors.map((d) => d.territory))].length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                ৳
                {distributors
                  .reduce((sum, d) => sum + d.currentRevenue, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Target Achievement</p>
              <p className="text-2xl font-bold">
                {(
                  (distributors.reduce((sum, d) => sum + d.currentRevenue, 0) /
                    distributors.reduce((sum, d) => sum + d.monthlyTarget, 0)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setSelectedTab('distributors')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                selectedTab === 'distributors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Distributors
            </button>
            <button
              onClick={() => setSelectedTab('territories')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                selectedTab === 'territories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Territory Management
            </button>
            <button
              onClick={() => setSelectedTab('pricing')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                selectedTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Pricing Tiers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'distributors' && (
            <>
              {/* Search and Filter */}
              <div className="mb-6 flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search distributors or territories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4"
                  />
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value as any)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="STANDARD">Standard</option>
                  <option value="BASIC">Basic</option>
                </select>
              </div>

              {/* Distributors Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Distributor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Territory
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Pricing Tier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Companies
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Performance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDistributors.map((distributor) => {
                      const performancePercentage =
                        (distributor.currentRevenue /
                          distributor.monthlyTarget) *
                        100;
                      return (
                        <tr key={distributor.id} className="hover:bg-muted/50">
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center">
                              <Building2 className="mr-3 h-8 w-8 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {distributor.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {distributor.businessName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {distributor.territory}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTierColor(distributor.pricingTier)}`}
                            >
                              {distributor.pricingTier}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {distributor.assignedCompanies
                                .map(
                                  (companyId) =>
                                    companies.find((c) => c.id === companyId)
                                      ?.name
                                )
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm">
                              <div
                                className={`font-medium ${getPerformanceColor(distributor.currentRevenue, distributor.monthlyTarget)}`}
                              >
                                {performancePercentage.toFixed(1)}%
                              </div>
                              <div className="text-gray-500">
                                ৳{distributor.currentRevenue.toLocaleString()} /
                                ৳{distributor.monthlyTarget.toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                distributor.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {distributor.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedDistributor(distributor);
                                  setShowAssignmentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setEditingDistributor(distributor)
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedTab === 'territories' && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Territory Coverage Map
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {territories.map((territory) => {
                  const territoryDistributors = distributors.filter(
                    (d) => d.territory === territory
                  );
                  const totalRevenue = territoryDistributors.reduce(
                    (sum, d) => sum + d.currentRevenue,
                    0
                  );
                  return (
                    <div key={territory} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {territory}
                        </h4>
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Distributors: {territoryDistributors.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Revenue: ৳{totalRevenue.toLocaleString()}
                        </div>
                        <div className="space-y-1">
                          {territoryDistributors.map((d) => (
                            <div
                              key={d.id}
                              className="rounded bg-gray-100 px-2 py-1 text-xs"
                            >
                              {d.name} ({d.pricingTier})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'pricing' && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Pricing Tiers Configuration
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {pricingTiers.map((tier) => {
                  const tierDistributors = distributors.filter(
                    (d) => d.pricingTier === tier.id
                  );
                  return (
                    <div key={tier.id} className="rounded-lg border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold">{tier.name}</h4>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getTierColor(tier.id)}`}
                        >
                          {tierDistributors.length} distributors
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Discount:
                          </span>
                          <span className="text-sm font-medium">
                            {tier.discountPercentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Min. Order:
                          </span>
                          <span className="text-sm font-medium">
                            ৳{tier.minimumOrder.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Payment Terms:
                          </span>
                          <span className="text-sm font-medium">
                            {tier.paymentTerms}
                          </span>
                        </div>
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs text-gray-500">
                            {tier.description}
                          </p>
                        </div>

                        <div className="mt-4">
                          <h5 className="mb-2 text-sm font-medium">
                            Distributors in this tier:
                          </h5>
                          <div className="space-y-1">
                            {tierDistributors.map((d) => (
                              <div
                                key={d.id}
                                className="rounded bg-gray-50 px-2 py-1 text-xs"
                              >
                                {d.name} - {d.territory}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedDistributor
                  ? `Edit Assignments - ${selectedDistributor.name}`
                  : 'Bulk Assignment Management'}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedDistributor(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedDistributor) {
                  const formData = new FormData(e.target as HTMLFormElement);
                  const assignments = {
                    companies: Array.from(
                      formData.getAll('companies')
                    ) as string[],
                    products: Array.from(
                      formData.getAll('products')
                    ) as string[],
                    territory: formData.get('territory') as string,
                    pricingTier: formData.get('pricingTier') as string,
                  };
                  handleAssignmentUpdate(selectedDistributor.id, assignments);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Territory Assignment
                  </label>
                  <select
                    name="territory"
                    required
                    defaultValue={selectedDistributor?.territory || ''}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Territory</option>
                    {territories.map((territory) => (
                      <option key={territory} value={territory}>
                        {territory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pricing Tier
                  </label>
                  <select
                    name="pricingTier"
                    required
                    defaultValue={selectedDistributor?.pricingTier || ''}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Pricing Tier</option>
                    {pricingTiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} ({tier.discountPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assigned Companies
                  </label>
                  <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
                    {companies.map((company) => (
                      <label key={company.id} className="flex items-center">
                        <input
                          type="checkbox"
                          name="companies"
                          value={company.id}
                          defaultChecked={selectedDistributor?.assignedCompanies.includes(
                            company.id
                          )}
                          className="mr-2"
                        />
                        <span className="text-sm">{company.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Access
                  </label>
                  <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="products"
                        value="1"
                        defaultChecked={selectedDistributor?.assignedProducts.includes(
                          '1'
                        )}
                        className="mr-2"
                      />
                      <span className="text-sm">12kg LPG Cylinders</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="products"
                        value="2"
                        defaultChecked={selectedDistributor?.assignedProducts.includes(
                          '2'
                        )}
                        className="mr-2"
                      />
                      <span className="text-sm">35kg Commercial Cylinders</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="products"
                        value="3"
                        defaultChecked={selectedDistributor?.assignedProducts.includes(
                          '3'
                        )}
                        className="mr-2"
                      />
                      <span className="text-sm">5kg Small Cylinders</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedDistributor(null);
                  }}
                  className="hover:bg-muted/50 rounded-md border border-gray-300 px-4 py-2 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Update Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
