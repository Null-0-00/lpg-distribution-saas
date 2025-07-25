'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Fuel,
  Truck,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'ORDERED'
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED'
    | 'CANCELED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  totalAmount: number;
  notes?: string;
  company: {
    id: string;
    name: string;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
  };
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    size: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  purchaseType: 'PACKAGE' | 'REFILL';
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'outstanding' | 'received'
  >('all');

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders');
      const data = await response.json();
      setPurchaseOrders(data.purchaseOrders || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'RECEIVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredOrders = purchaseOrders.filter((order) => {
    switch (filter) {
      case 'pending':
        return ['PENDING', 'APPROVED', 'ORDERED'].includes(order.status);
      case 'outstanding':
        return order.status !== 'RECEIVED' && order.status !== 'CANCELED';
      case 'received':
        return order.status === 'RECEIVED';
      default:
        return true;
    }
  });

  const outstandingOrders = purchaseOrders.filter(
    (order) => order.status !== 'RECEIVED' && order.status !== 'CANCELED'
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Purchase Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all purchase orders and track outstanding shipments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {purchaseOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {
                  purchaseOrders.filter((o) =>
                    ['PENDING', 'APPROVED', 'ORDERED'].includes(o.status)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Outstanding
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {outstandingOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Received
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {purchaseOrders.filter((o) => o.status === 'RECEIVED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'outstanding', label: 'Outstanding' },
              { key: 'received', label: 'Received' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  filter === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredOrders.length} of {purchaseOrders.length} orders
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Create New Order
        </button>
      </div>

      {/* Purchase Orders Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
          >
            {/* Order Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    PO #{order.poNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.company.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(order.priority)}`}
                  >
                    {order.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Driver:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {order.driver.name}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Order Date:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>

                {order.expectedDeliveryDate && (
                  <div className="flex items-center text-sm">
                    <Truck className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Expected:
                    </span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {new Date(
                        order.expectedDeliveryDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Package className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Amount:
                  </span>
                  <span className="ml-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                    ৳{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Items
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.name} ({item.product.size})
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {item.purchaseType}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.quantity} × ৳{item.unitPrice}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ৳{item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Order Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Details
                </button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                  items
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No purchase orders
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? 'Get started by creating a new purchase order.'
              : `No orders found for ${filter} filter.`}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Purchase Order
            </button>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Create New Purchase Order
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <PurchaseOrderForm
                onSubmit={handleCreateOrder}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
