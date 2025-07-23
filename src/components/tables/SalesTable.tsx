'use client';

import { useState } from 'react';
import { SaleType, PaymentType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/formatters';

interface Sale {
  id: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  discount: number;
  netValue: number;
  paymentType: PaymentType;
  cashDeposited: number;
  cylindersDeposited: number;
  isOnCredit: boolean;
  isCylinderCredit: boolean;
  saleDate: string;
  notes?: string;
  driver: {
    name: string;
    phone?: string;
  };
  product: {
    name: string;
    size: string;
  };
  createdBy: string;
}

interface SalesTableProps {
  sales: Sale[];
  loading?: boolean;
  onView?: (sale: Sale) => void;
  onEdit?: (sale: Sale) => void;
  onDelete?: (sale: Sale) => void;
  onRefresh?: () => void;
}

export function SalesTable({ 
  sales, 
  loading = false, 
  onView, 
  onEdit, 
  onDelete,
  onRefresh 
}: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Filter sales based on search and filters
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSaleType = saleTypeFilter === 'all' || sale.saleType === saleTypeFilter;
    const matchesPayment = paymentFilter === 'all' || sale.paymentType === paymentFilter;

    return matchesSearch && matchesSaleType && matchesPayment;
  });

  const formatDate = (dateString: string) => format(new Date(dateString), 'MMM dd, yyyy HH:mm');

  const getSaleTypeLabel = (type: SaleType) => {
    return type === SaleType.PACKAGE ? 'Package' : 'Refill';
  };

  const getPaymentTypeLabel = (type: PaymentType) => {
    switch (type) {
      case PaymentType.CASH: return 'Cash';
      case PaymentType.CREDIT: return 'Credit';
      case PaymentType.CYLINDER_CREDIT: return 'Cylinder Credit';
      default: return type;
    }
  };

  const getStatusColor = (sale: Sale) => {
    if (sale.isOnCredit || sale.isCylinderCredit) {
      return 'text-orange-600 bg-orange-50';
    }
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (sale: Sale) => {
    if (sale.isOnCredit && sale.isCylinderCredit) {
      return 'Cash & Cylinder Credit';
    } else if (sale.isOnCredit) {
      return 'Cash Credit';
    } else if (sale.isCylinderCredit) {
      return 'Cylinder Credit';
    }
    return 'Paid';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading sales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sale Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={SaleType.PACKAGE}>Package</SelectItem>
              <SelectItem value={SaleType.REFILL}>Refill</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value={PaymentType.CASH}>Cash</SelectItem>
              <SelectItem value={PaymentType.CREDIT}>Credit</SelectItem>
              <SelectItem value={PaymentType.CYLINDER_CREDIT}>Cylinder Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver & Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity & Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No sales found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {getSaleTypeLabel(sale.saleType)} Sale
                        </span>
                        <span className="text-xs text-gray-500">
                          {getPaymentTypeLabel(sale.paymentType)}
                        </span>
                        {sale.discount > 0 && (
                          <span className="text-xs text-orange-600">
                            Discount: {formatCurrency(sale.discount)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {sale.driver.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {sale.product.name} ({sale.product.size}L)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {sale.quantity} × {formatCurrency(sale.unitPrice)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Total: {formatCurrency(sale.netValue)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale)}`}>
                          {getStatusText(sale)}
                        </span>
                        <div className="text-xs text-gray-500">
                          Cash: {formatCurrency(sale.cashDeposited)}
                          {sale.saleType === SaleType.REFILL && (
                            <div>Cylinders: {sale.cylindersDeposited}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {formatDate(sale.saleDate)}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {sale.createdBy}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(sale)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(sale)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(sale)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredSales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Sales</div>
            <div className="text-2xl font-bold text-gray-900">{filteredSales.length}</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Quantity</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.netValue, 0))}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Cash Collected</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.cashDeposited, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}