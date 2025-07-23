'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Fuel } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Company {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  cylinderType: string;
  weightKg: number;
  size?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}

interface PurchaseOrderItem {
  id?: string;
  productId: string;
  product?: Product;
  purchaseType: 'PACKAGE' | 'REFILL';
  quantity: number;
  gasPrice: number;
  cylinderPrice?: number;
  totalGasCost: number;
  totalCylinderCost: number;
  totalLineCost: number;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function PurchaseOrderForm({
  onSubmit,
  onCancel,
  initialData,
}: PurchaseOrderFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();

  const [formData, setFormData] = useState({
    companyId: initialData?.companyId || '',
    driverId: initialData?.driverId || '',
    shipmentDate:
      initialData?.shipmentDate || new Date().toISOString().split('T')[0],
    invoiceNumber: initialData?.invoiceNumber || '',
    vehicleNumber: initialData?.vehicleNumber || '',
    notes: initialData?.notes || '',
  });

  const [lineItems, setLineItems] = useState<PurchaseOrderItem[]>(
    initialData?.lineItems || []
  );
  const [currentLineItem, setCurrentLineItem] = useState({
    productId: '',
    purchaseType: 'PACKAGE' as 'PACKAGE' | 'REFILL',
    quantity: 0,
    gasPrice: 0,
    cylinderPrice: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, productsRes, driversRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/products'),
        fetch('/api/drivers?driverType=SHIPMENT'),
      ]);

      const [companiesData, productsData, driversData] = await Promise.all([
        companiesRes.json(),
        productsRes.json(),
        driversRes.json(),
      ]);

      setCompanies(companiesData.companies || []);
      setProducts(productsData.products || []);
      setDrivers(driversData.drivers?.filter((d: Driver) => true) || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    if (
      !currentLineItem.productId ||
      currentLineItem.quantity <= 0 ||
      currentLineItem.gasPrice <= 0
    ) {
      alert('Please fill in all required fields for the line item');
      return;
    }

    if (
      currentLineItem.purchaseType === 'PACKAGE' &&
      currentLineItem.cylinderPrice <= 0
    ) {
      alert('Please enter cylinder price for package purchases');
      return;
    }

    const product = products.find((p) => p.id === currentLineItem.productId);
    if (!product) return;

    const totalGasCost = currentLineItem.quantity * currentLineItem.gasPrice;
    const totalCylinderCost =
      currentLineItem.purchaseType === 'PACKAGE'
        ? currentLineItem.quantity * currentLineItem.cylinderPrice
        : 0;

    const newLineItem: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      productId: currentLineItem.productId,
      product,
      purchaseType: currentLineItem.purchaseType,
      quantity: currentLineItem.quantity,
      gasPrice: currentLineItem.gasPrice,
      cylinderPrice:
        currentLineItem.purchaseType === 'PACKAGE'
          ? currentLineItem.cylinderPrice
          : 0,
      totalGasCost,
      totalCylinderCost,
      totalLineCost: totalGasCost + totalCylinderCost,
    };

    setLineItems((prev) => [...prev, newLineItem]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0,
    });
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalCost = () => {
    return lineItems.reduce((sum, item) => sum + item.totalLineCost, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.driverId) {
      alert('Please select a driver');
      return;
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    onSubmit({
      ...formData,
      lineItems,
      totalCost: getTotalCost(),
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company and Driver Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Company *
          </label>
          <select
            value={formData.companyId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, companyId: e.target.value }))
            }
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
            required
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Driver Name *
          </label>
          <select
            value={formData.driverId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, driverId: e.target.value }))
            }
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
            required
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Invoice */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Shipment Date *
          </label>
          <input
            type="date"
            value={formData.shipmentDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, shipmentDate: e.target.value }))
            }
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Invoice Number
          </label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                invoiceNumber: e.target.value,
              }))
            }
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
            placeholder="Enter invoice number"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Vehicle Number
          </label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                vehicleNumber: e.target.value,
              }))
            }
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
            placeholder="Enter vehicle number"
          />
        </div>
      </div>

      {/* Add Line Item */}
      <div className="border-border rounded-lg border p-4">
        <h4 className="text-md text-foreground mb-4 font-medium">
          Add Purchase Item
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              Product
            </label>
            <select
              value={currentLineItem.productId}
              onChange={(e) =>
                setCurrentLineItem((prev) => ({
                  ...prev,
                  productId: e.target.value,
                }))
              }
              className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              value={currentLineItem.purchaseType}
              onChange={(e) =>
                setCurrentLineItem((prev) => ({
                  ...prev,
                  purchaseType: e.target.value as any,
                }))
              }
              className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="PACKAGE">Package</option>
              <option value="REFILL">Refill</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              Qty
            </label>
            <input
              type="number"
              value={currentLineItem.quantity}
              onChange={(e) =>
                setCurrentLineItem((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0,
                }))
              }
              className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 text-sm"
              min="1"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              Gas Price
            </label>
            <input
              type="number"
              value={currentLineItem.gasPrice}
              onChange={(e) =>
                setCurrentLineItem((prev) => ({
                  ...prev,
                  gasPrice: parseFloat(e.target.value) || 0,
                }))
              }
              className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 text-sm"
              min="0"
              step="0.01"
            />
          </div>

          {currentLineItem.purchaseType === 'PACKAGE' && (
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                Cylinder Price
              </label>
              <input
                type="number"
                value={currentLineItem.cylinderPrice}
                onChange={(e) =>
                  setCurrentLineItem((prev) => ({
                    ...prev,
                    cylinderPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 text-sm"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              type="button"
              onClick={addLineItem}
              className="flex w-full items-center justify-center space-x-1 rounded-md bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <div className="border-border overflow-hidden rounded-lg border">
          <h4 className="text-md text-foreground border-border border-b p-4 font-medium">
            Purchase Items
          </h4>
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Gas Cost
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cylinder Cost
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Line Total
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-border divide-y">
                {lineItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {item.product?.name}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.purchaseType === 'PACKAGE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {item.purchaseType === 'PACKAGE' ? (
                          <Package className="mr-1 h-3 w-3" />
                        ) : (
                          <Fuel className="mr-1 h-3 w-3" />
                        )}
                        {item.purchaseType}
                      </span>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {item.quantity}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {formatCurrency(item.totalGasCost)}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {item.purchaseType === 'PACKAGE'
                        ? formatCurrency(item.totalCylinderCost)
                        : '-'}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {formatCurrency(item.totalLineCost)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td
                    colSpan={5}
                    className="text-foreground px-4 py-3 text-right text-sm font-medium"
                  >
                    Total Purchase Value:
                  </td>
                  <td className="text-foreground px-4 py-3 text-lg font-bold">
                    {formatCurrency(getTotalCost())}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-muted-foreground mb-1 block text-sm font-medium">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
          rows={3}
          placeholder="Enter any additional notes..."
        />
      </div>

      {/* Form Actions */}
      <div className="border-border flex justify-end space-x-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground bg-muted border-border hover:bg-secondary rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          disabled={lineItems.length === 0 || !formData.driverId}
        >
          Create Purchase Order
        </button>
      </div>
    </form>
  );
}
