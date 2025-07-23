"use client";

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

export default function PurchaseOrderForm({ onSubmit, onCancel, initialData }: PurchaseOrderFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();

  const [formData, setFormData] = useState({
    companyId: initialData?.companyId || '',
    driverId: initialData?.driverId || '',
    shipmentDate: initialData?.shipmentDate || new Date().toISOString().split('T')[0],
    invoiceNumber: initialData?.invoiceNumber || '',
    vehicleNumber: initialData?.vehicleNumber || '',
    notes: initialData?.notes || ''
  });

  const [lineItems, setLineItems] = useState<PurchaseOrderItem[]>(initialData?.lineItems || []);
  const [currentLineItem, setCurrentLineItem] = useState({
    productId: '',
    purchaseType: 'PACKAGE' as 'PACKAGE' | 'REFILL',
    quantity: 0,
    gasPrice: 0,
    cylinderPrice: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, productsRes, driversRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/products'),
        fetch('/api/drivers?driverType=SHIPMENT')
      ]);

      const [companiesData, productsData, driversData] = await Promise.all([
        companiesRes.json(),
        productsRes.json(),
        driversRes.json()
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
    if (!currentLineItem.productId || currentLineItem.quantity <= 0 || currentLineItem.gasPrice <= 0) {
      alert('Please fill in all required fields for the line item');
      return;
    }

    if (currentLineItem.purchaseType === 'PACKAGE' && currentLineItem.cylinderPrice <= 0) {
      alert('Please enter cylinder price for package purchases');
      return;
    }

    const product = products.find(p => p.id === currentLineItem.productId);
    if (!product) return;

    const totalGasCost = currentLineItem.quantity * currentLineItem.gasPrice;
    const totalCylinderCost = currentLineItem.purchaseType === 'PACKAGE' 
      ? currentLineItem.quantity * currentLineItem.cylinderPrice 
      : 0;

    const newLineItem: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      productId: currentLineItem.productId,
      product,
      purchaseType: currentLineItem.purchaseType,
      quantity: currentLineItem.quantity,
      gasPrice: currentLineItem.gasPrice,
      cylinderPrice: currentLineItem.purchaseType === 'PACKAGE' ? currentLineItem.cylinderPrice : 0,
      totalGasCost,
      totalCylinderCost,
      totalLineCost: totalGasCost + totalCylinderCost
    };

    setLineItems(prev => [...prev, newLineItem]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0
    });
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
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
      totalCost: getTotalCost()
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company and Driver Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Company *
          </label>
          <select
            value={formData.companyId}
            onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
            required
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Driver Name *
          </label>
          <select
            value={formData.driverId}
            onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
            required
          >
            <option value="">Select Driver</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Shipment Date *
          </label>
          <input
            type="date"
            value={formData.shipmentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, shipmentDate: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
            placeholder="Enter invoice number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Vehicle Number
          </label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
            placeholder="Enter vehicle number"
          />
        </div>
      </div>

      {/* Add Line Item */}
      <div className="border border-border rounded-lg p-4">
        <h4 className="text-md font-medium text-foreground mb-4">Add Purchase Item</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Product
            </label>
            <select
              value={currentLineItem.productId}
              onChange={(e) => setCurrentLineItem(prev => ({ ...prev, productId: e.target.value }))}
              className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground text-sm"
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Type
            </label>
            <select
              value={currentLineItem.purchaseType}
              onChange={(e) => setCurrentLineItem(prev => ({ ...prev, purchaseType: e.target.value as any }))}
              className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground text-sm"
            >
              <option value="PACKAGE">Package</option>
              <option value="REFILL">Refill</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Qty
            </label>
            <input
              type="number"
              value={currentLineItem.quantity}
              onChange={(e) => setCurrentLineItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground text-sm"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Gas Price
            </label>
            <input
              type="number"
              value={currentLineItem.gasPrice}
              onChange={(e) => setCurrentLineItem(prev => ({ ...prev, gasPrice: parseFloat(e.target.value) || 0 }))}
              className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground text-sm"
              min="0"
              step="0.01"
            />
          </div>

          {currentLineItem.purchaseType === 'PACKAGE' && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Cylinder Price
              </label>
              <input
                type="number"
                value={currentLineItem.cylinderPrice}
                onChange={(e) => setCurrentLineItem(prev => ({ ...prev, cylinderPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground text-sm"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              type="button"
              onClick={addLineItem}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <h4 className="text-md font-medium text-foreground p-4 border-b border-border">
            Purchase Items
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Gas Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cylinder Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Line Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {lineItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.product?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.purchaseType === 'PACKAGE' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {item.purchaseType === 'PACKAGE' ? <Package className="h-3 w-3 mr-1" /> : <Fuel className="h-3 w-3 mr-1" />}
                        {item.purchaseType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatCurrency(item.totalGasCost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {item.purchaseType === 'PACKAGE' ? formatCurrency(item.totalCylinderCost) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
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
                  <td colSpan={5} className="px-4 py-3 text-sm font-medium text-foreground text-right">
                    Total Purchase Value:
                  </td>
                  <td className="px-4 py-3 text-lg font-bold text-foreground">
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
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
          rows={3}
          placeholder="Enter any additional notes..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-md hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          disabled={lineItems.length === 0 || !formData.driverId}
        >
          Create Purchase Order
        </button>
      </div>
    </form>
  );
}
