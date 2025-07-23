"use client";

import { useState, useEffect } from 'react';
import { 
  Ship, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowUpDown,
  Filter,
  Download,
  Truck,
  X,
  Calculator,
  Eye,
  Building,
  Calendar,
  User,
  FileText,
  ShoppingCart,
  DollarSign,
  Info,
  Fuel
} from 'lucide-react';
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
  company?: Company;
}

interface ShipmentLineItem {
  id?: string;
  productId: string;
  product?: Product;
  purchaseType: 'PACKAGE' | 'REFILL';
  quantity: number;
  gasPrice: number; // Price per unit for gas/refill
  cylinderPrice?: number; // Price per unit for cylinder (package only)
  totalGasCost: number;
  totalCylinderCost: number;
  totalLineCost: number;
}

interface Shipment {
  id: string;
  shipmentType: 'INCOMING_FULL' | 'INCOMING_EMPTY' | 'OUTGOING_FULL' | 'OUTGOING_EMPTY' | 'EMPTY_CYLINDER_DELIVERY' | 'EMPTY_CYLINDER_PICKUP';
  company?: Company; // Optional for empty cylinder transactions
  product: Product;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  shipmentDate: string;
  invoiceNumber?: string;
  vehicleNumber?: string;
  notes?: string;
  status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  lineItems?: ShipmentLineItem[];
}

export default function ShipmentsPage() {
  const { formatCurrency, formatDate, t } = useSettings();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cylinderSizes, setCylinderSizes] = useState<{id: string, size: string, description?: string, isActive?: boolean}[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'outgoing' | 'outstanding' | 'completed'>('outgoing');
  const [showModal, setShowModal] = useState(false);
  const [showEmptyCylinderModal, setShowEmptyCylinderModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [filter, setFilter] = useState({
    company: '',
    product: '',
    shipmentType: '',
    dateFrom: '',
    dateTo: ''
  });

  const [formData, setFormData] = useState({
    companyId: '',
    driverId: '',
    shipmentDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    vehicleNumber: '',
    notes: '',
    expectedDeliveryDate: '',
    paymentTerms: 'COD',
    priority: 'NORMAL'
  });

  const [lineItems, setLineItems] = useState<ShipmentLineItem[]>([]);
  const [currentLineItem, setCurrentLineItem] = useState({
    productId: '',
    purchaseType: 'PACKAGE' as 'PACKAGE' | 'REFILL',
    quantity: 0,
    gasPrice: 0,
    cylinderPrice: 0,
    discount: 0,
    taxRate: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emptyCylinderData, setEmptyCylinderData] = useState({
    cylinderSizeId: '',
    quantity: 0,
    unitPrice: 0,
    transactionType: 'BUY' as 'BUY' | 'SELL',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchShipments();
    fetchCompanies();
    fetchProducts();
    fetchCylinderSizes();
    fetchDrivers();
  }, [filter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      
      const response = await fetch(`/api/shipments?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
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

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?driverType=SHIPMENT');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.companyId) errors.companyId = 'Company is required';
    if (!formData.driverId) errors.driverId = 'Driver is required';
    if (!formData.shipmentDate) errors.shipmentDate = 'Shipment date is required';
    if (lineItems.length === 0) errors.lineItems = 'At least one line item is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLineItem = () => {
    const errors: Record<string, string> = {};

    if (!currentLineItem.productId) errors.productId = 'Product is required';
    if (currentLineItem.quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (currentLineItem.gasPrice <= 0) errors.gasPrice = 'Gas price must be greater than 0';
    if (currentLineItem.purchaseType === 'PACKAGE' && currentLineItem.cylinderPrice <= 0) {
      errors.cylinderPrice = 'Cylinder price is required for package purchases';
    }

    return errors;
  };

  const addLineItem = () => {
    const errors = validateLineItem();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const product = products.find(p => p.id === currentLineItem.productId);
    if (!product) return;

    const subtotalGas = currentLineItem.quantity * currentLineItem.gasPrice;
    const subtotalCylinder = currentLineItem.purchaseType === 'PACKAGE' 
      ? currentLineItem.quantity * currentLineItem.cylinderPrice 
      : 0;
    const subtotal = subtotalGas + subtotalCylinder;
    const discountAmount = (subtotal * currentLineItem.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * currentLineItem.taxRate) / 100;

    const newLineItem: ShipmentLineItem = {
      id: `temp-${Date.now()}`,
      productId: currentLineItem.productId,
      product,
      purchaseType: currentLineItem.purchaseType,
      quantity: currentLineItem.quantity,
      gasPrice: currentLineItem.gasPrice,
      cylinderPrice: currentLineItem.purchaseType === 'PACKAGE' ? currentLineItem.cylinderPrice : 0,
      totalGasCost: subtotalGas,
      totalCylinderCost: subtotalCylinder,
      totalLineCost: taxableAmount + taxAmount
    };

    setLineItems(prev => [...prev, newLineItem]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0,
      discount: 0,
      taxRate: 0
    });
    setFormErrors({});
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const editLineItem = (index: number) => {
    const item = lineItems[index];
    setCurrentLineItem({
      productId: item.productId,
      purchaseType: item.purchaseType,
      quantity: item.quantity,
      gasPrice: item.gasPrice,
      cylinderPrice: item.cylinderPrice || 0,
      discount: 0, // Reset discount and tax since they're calculated
      taxRate: 0
    });
    // Remove the item being edited so it can be re-added with changes
    removeLineItem(index);
  };

  const getTotalCost = () => {
    return lineItems.reduce((sum, item) => sum + item.totalLineCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShipment) {
        // Handle edit: Delete existing shipments and create new ones
        await handleEditSubmit();
      } else {
        // Handle create: Create new shipments
        await handleCreateSubmit();
      }
    } catch (error) {
      console.error('Error saving shipment:', error);
      setFormErrors({ submit: 'Failed to save purchase order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
    const response = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        lineItems,
        totalCost: getTotalCost()
      })
    });

    if (response.ok) {
      setShowModal(false);
      resetForm();
      fetchShipments();
    } else {
      throw new Error('Failed to create shipment');
    }
  };

  const handleEditSubmit = async () => {
    if (!editingShipment) return;
    
    // Find all shipments in the same group for deletion
    const isEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(editingShipment.shipmentType);
    let groupKey: string;
    
    if (editingShipment.invoiceNumber) {
      groupKey = `${editingShipment.invoiceNumber}-${new Date(editingShipment.shipmentDate).toDateString()}`;
    } else if (isEmptyTransaction && !editingShipment.company) {
      groupKey = `${new Date(editingShipment.shipmentDate).toDateString()}-EMPTY-CYLINDER-${editingShipment.id}`;
    } else if (editingShipment.company) {
      groupKey = `${new Date(editingShipment.shipmentDate).toDateString()}-${editingShipment.company.name}`;
    } else {
      groupKey = `${new Date(editingShipment.shipmentDate).toDateString()}-NO-COMPANY-${editingShipment.id}`;
    }
    
    const groupedShipments = shipments.filter(s => {
      const sIsEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(s.shipmentType);
      let sKey: string;
      
      if (s.invoiceNumber) {
        sKey = `${s.invoiceNumber}-${new Date(s.shipmentDate).toDateString()}`;
      } else if (sIsEmptyTransaction && !s.company) {
        sKey = `${new Date(s.shipmentDate).toDateString()}-EMPTY-CYLINDER-${s.id}`;
      } else if (s.company) {
        sKey = `${new Date(s.shipmentDate).toDateString()}-${s.company.name}`;
      } else {
        sKey = `${new Date(s.shipmentDate).toDateString()}-NO-COMPANY-${s.id}`;
      }
      
      return sKey === groupKey;
    });

    // Delete all shipments in the group
    const deletePromises = groupedShipments.map(shipment => 
      fetch(`/api/shipments/${shipment.id}`, { method: 'DELETE' })
    );
    
    const deleteResults = await Promise.all(deletePromises);
    const deleteFailed = deleteResults.some(result => !result.ok);
    
    if (deleteFailed) {
      throw new Error('Failed to delete existing shipments');
    }

    // Create new shipments with updated data
    const response = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        lineItems,
        totalCost: getTotalCost()
      })
    });

    if (response.ok) {
      setShowModal(false);
      resetForm();
      fetchShipments();
    } else {
      throw new Error('Failed to create updated shipments');
    }
  };

  const handleMarkFulfilled = async (shipmentId: string) => {
    if (!confirm('Mark this shipment as completed? This will update the inventory and cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Shipment completed successfully:', result.message);
        fetchShipments();
      } else {
        const error = await response.json();
        console.error('Error marking shipment as completed:', error.error);
        alert('Failed to complete shipment: ' + error.error);
      }
    } catch (error) {
      console.error('Error marking shipment as fulfilled:', error);
      alert('Failed to complete shipment. Please try again.');
    }
  };

  const handleDelete = async (shipmentId: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;
    
    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchShipments();
      } else {
        const errorData = await response.json();
        alert(`Error deleting shipment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('Failed to delete shipment. Please try again.');
    }
  };

  const handleEmptyCylinderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentType: emptyCylinderData.transactionType === 'BUY' ? 'INCOMING_EMPTY' : 'OUTGOING_EMPTY',
          companyId: null, // Empty cylinder transactions might not have a company
          cylinderSizeId: emptyCylinderData.cylinderSizeId,
          quantity: emptyCylinderData.quantity,
          unitCost: emptyCylinderData.unitPrice,
          totalCost: emptyCylinderData.quantity * emptyCylinderData.unitPrice,
          shipmentDate: emptyCylinderData.date,
          notes: `Empty Cylinder ${emptyCylinderData.transactionType}: ${emptyCylinderData.notes}`,
          invoiceNumber: '',
          vehicleNumber: ''
        })
      });

      if (response.ok) {
        setShowEmptyCylinderModal(false);
        resetEmptyCylinderForm();
        fetchShipments();
      }
    } catch (error) {
      console.error('Error saving empty cylinder transaction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      driverId: '',
      shipmentDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      vehicleNumber: '',
      notes: '',
      expectedDeliveryDate: '',
      paymentTerms: 'COD',
      priority: 'NORMAL'
    });
    setLineItems([]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0,
      discount: 0,
      taxRate: 0
    });
    setFormErrors({});
    setStep(1);
    setShowPreview(false);
    setEditingShipment(null); // Clear editing state
  };

  const resetEmptyCylinderForm = () => {
    setEmptyCylinderData({
      cylinderSizeId: '',
      quantity: 0,
      unitPrice: 0,
      transactionType: 'BUY',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openEditModal = async (shipment: Shipment) => {
    setEditingShipment(shipment);
    
    // Find all shipments in the same group (same invoice + date or same date + company)
    const isEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(shipment.shipmentType);
    let groupKey: string;
    
    if (shipment.invoiceNumber) {
      groupKey = `${shipment.invoiceNumber}-${new Date(shipment.shipmentDate).toDateString()}`;
    } else if (isEmptyTransaction && !shipment.company) {
      groupKey = `${new Date(shipment.shipmentDate).toDateString()}-EMPTY-CYLINDER-${shipment.id}`;
    } else if (shipment.company) {
      groupKey = `${new Date(shipment.shipmentDate).toDateString()}-${shipment.company.name}`;
    } else {
      groupKey = `${new Date(shipment.shipmentDate).toDateString()}-NO-COMPANY-${shipment.id}`;
    }
    
    const groupedShipments = shipments.filter(s => {
      const sIsEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(s.shipmentType);
      let sKey: string;
      
      if (s.invoiceNumber) {
        sKey = `${s.invoiceNumber}-${new Date(s.shipmentDate).toDateString()}`;
      } else if (sIsEmptyTransaction && !s.company) {
        sKey = `${new Date(s.shipmentDate).toDateString()}-EMPTY-CYLINDER-${s.id}`;
      } else if (s.company) {
        sKey = `${new Date(s.shipmentDate).toDateString()}-${s.company.name}`;
      } else {
        sKey = `${new Date(s.shipmentDate).toDateString()}-NO-COMPANY-${s.id}`;
      }
      
      return sKey === groupKey;
    });
    
    // Extract driver info from notes (format: "TYPE: Gas: ৳X/unit | Driver: NAME | notes")
    const driverMatch = shipment.notes?.match(/Driver:\s*([^|]+)/);
    const driverName = driverMatch ? driverMatch[1].trim() : '';
    const matchingDriver = drivers.find(d => d.name === driverName);
    
    // Parse notes to extract original notes (remove auto-generated parts)
    const notesMatch = shipment.notes?.match(/\|\s*([^|]*?)$/);
    const originalNotes = notesMatch ? notesMatch[1].trim() : '';
    
    // Set form data from the first shipment (they all have the same basic info)
    setFormData({
      companyId: shipment.company?.id || '',
      driverId: matchingDriver?.id || '',
      shipmentDate: shipment.shipmentDate.split('T')[0], // Convert to YYYY-MM-DD format
      invoiceNumber: shipment.invoiceNumber || '',
      vehicleNumber: shipment.vehicleNumber || '',
      notes: originalNotes,
      expectedDeliveryDate: '',
      paymentTerms: 'COD',
      priority: 'NORMAL'
    });
    
    // Convert grouped shipments to line items format
    const editLineItems: ShipmentLineItem[] = groupedShipments.map(s => {
      // Parse purchase type from notes (starts with "PACKAGE:" or "REFILL:")
      const isPrefillPurchase = s.notes?.startsWith('REFILL:');
      const purchaseType = isPrefillPurchase ? 'REFILL' : 'PACKAGE';
      
      // Parse prices from notes
      const gasPriceMatch = s.notes?.match(/Gas:\s*৳([\d.]+)\/unit/);
      const cylinderPriceMatch = s.notes?.match(/Cylinder:\s*৳([\d.]+)\/unit/);
      
      const gasPrice = gasPriceMatch ? parseFloat(gasPriceMatch[1]) : 0;
      const cylinderPrice = cylinderPriceMatch ? parseFloat(cylinderPriceMatch[1]) : 0;
      
      const totalGasCost = s.quantity * gasPrice;
      const totalCylinderCost = purchaseType === 'PACKAGE' ? s.quantity * cylinderPrice : 0;
      
      return {
        id: s.id,
        productId: s.product.id,
        product: s.product,
        purchaseType: purchaseType as 'PACKAGE' | 'REFILL',
        quantity: s.quantity,
        gasPrice: gasPrice,
        cylinderPrice: cylinderPrice,
        totalGasCost: totalGasCost,
        totalCylinderCost: totalCylinderCost,
        totalLineCost: s.totalCost || (totalGasCost + totalCylinderCost)
      };
    });
    
    setLineItems(editLineItems);
    setStep(1); // Start from first step
    setShowModal(true);
  };

  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      switch (activeTab) {
        case 'outgoing':
          // Show all shipments (both pending and completed purchase orders appear here)
          return shipment.shipmentType === 'INCOMING_FULL' || 
                 shipment.shipmentType.includes('OUTGOING') || 
                 shipment.shipmentType.includes('PICKUP');
        case 'outstanding':
          // Show only pending/in_transit purchase orders (CRUD operations allowed)
          return ['PENDING', 'IN_TRANSIT'].includes(shipment.status || 'PENDING');
        case 'completed':
          // Show only completed purchase orders (no CRUD operations)
          return (shipment.status || 'PENDING') === 'COMPLETED';
        default:
          return true;
      }
    });
  };

  const getGroupedShipments = () => {
    const filteredShipments = getFilteredShipments();
    const grouped = new Map<string, Shipment[]>();

    filteredShipments.forEach(shipment => {
      if (!shipment) return;
      
      // Check if this is an empty cylinder transaction
      const isEmptyCylinderTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(shipment.shipmentType);
      
      // Group by invoice number and date, or just date if no invoice
      // For empty cylinder transactions without company, use a special grouping key
      let key: string;
      if (shipment.invoiceNumber) {
        key = `${shipment.invoiceNumber}-${new Date(shipment.shipmentDate).toDateString()}`;
      } else if (isEmptyCylinderTransaction && !shipment.company) {
        key = `${new Date(shipment.shipmentDate).toDateString()}-EMPTY-CYLINDER-${shipment.id}`;
      } else if (shipment.company) {
        key = `${new Date(shipment.shipmentDate).toDateString()}-${shipment.company.name}`;
      } else {
        // Fallback for other cases without company
        key = `${new Date(shipment.shipmentDate).toDateString()}-NO-COMPANY-${shipment.id}`;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(shipment);
    });

    return Array.from(grouped.entries()).map(([key, shipments]) => {
      if (!shipments || shipments.length === 0 || !shipments[0]) {
        return {
          key,
          shipments: [],
          invoiceNumber: '',
          date: '',
          company: { id: '', name: 'Unknown Company', contactPerson: '', phone: '' },
          totalItems: 0,
          totalCost: 0,
          driverName: 'Unknown'
        };
      }
      
      const firstShipment = shipments[0];
      const isEmptyCylinderTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(firstShipment.shipmentType);
      
      return {
        key,
        shipments,
        invoiceNumber: firstShipment.invoiceNumber || '',
        date: firstShipment.shipmentDate || '',
        company: firstShipment.company || { 
          id: '', 
          name: isEmptyCylinderTransaction ? 'Empty Cylinder Transaction' : 'Direct Transaction', 
          contactPerson: '', 
          phone: '' 
        },
        totalItems: shipments.reduce((sum, s) => sum + (s.quantity || 0), 0),
        totalCost: shipments.reduce((sum, s) => sum + (s.totalCost || 0), 0),
        driverName: firstShipment.notes?.match(/Driver: ([^|]+)/)?.[1]?.trim() || 'Unknown'
      };
    });
  };

  const getShipmentTypeLabel = (type: string) => {
    const labels = {
      'OUTGOING_FULL': 'Outgoing Full Cylinders',
      'OUTGOING_EMPTY': 'Outgoing Empty Cylinders',
      'INCOMING_FULL': 'Incoming Full Cylinders',
      'INCOMING_EMPTY': 'Incoming Empty Cylinders',
      'EMPTY_CYLINDER_DELIVERY': 'Empty Cylinder Delivery',
      'EMPTY_CYLINDER_PICKUP': 'Empty Cylinder Pickup'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const parsePurchaseInfo = (shipment: Shipment) => {
    const notes = shipment.notes || '';
    
    // Parse purchase type from notes (starts with "PACKAGE:" or "REFILL:")
    const isRefillPurchase = notes.startsWith('REFILL:');
    const purchaseType = isRefillPurchase ? 'REFILL' : 'PACKAGE';
    
    // Parse prices from notes
    const gasPriceMatch = notes.match(/Gas:\s*৳([\d.]+)\/unit/);
    const cylinderPriceMatch = notes.match(/Cylinder:\s*৳([\d.]+)\/unit/);
    
    const gasPrice = gasPriceMatch ? parseFloat(gasPriceMatch[1]) : 0;
    const cylinderPrice = cylinderPriceMatch ? parseFloat(cylinderPriceMatch[1]) : 0;
    
    const totalGasCost = shipment.quantity * gasPrice;
    const totalCylinderCost = purchaseType === 'PACKAGE' ? shipment.quantity * cylinderPrice : 0;
    
    return {
      purchaseType,
      gasPrice,
      cylinderPrice,
      totalGasCost,
      totalCylinderCost,
      hasBreakdown: gasPrice > 0 // Only show breakdown if we have price data
    };
  };

  const getPurchaseTypeBadge = (purchaseType: 'PACKAGE' | 'REFILL') => {
    const colors = {
      'PACKAGE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'REFILL': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    const icons = {
      'PACKAGE': Package,
      'REFILL': Fuel
    };
    
    const Icon = icons[purchaseType];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[purchaseType]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {purchaseType}
      </span>
    );
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_TRANSIT': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />; // Default to pending
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const safeStatus = status || 'PENDING';
    
    const colors = {
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'IN_TRANSIT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'DELIVERED': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[safeStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(safeStatus)}
        <span className="ml-1 capitalize">{safeStatus.replace('_', ' ').toLowerCase()}</span>
      </span>
    );
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('shipmentsManagement')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('trackPurchaseOrdersAndShipments')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingShipment(null); // Clear editing state for new purchase
                  resetForm(); // Reset form to defaults
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{t('newPurchase')}</span>
              </button>
              <button
                onClick={() => setShowEmptyCylinderModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Package className="h-5 w-5" />
                <span>{t('emptyCylinderBuySell')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'outgoing', label: t('allShipments'), icon: ArrowUpDown },
              { id: 'outstanding', label: t('outstandingOrders'), icon: Clock },
              { id: 'completed', label: t('completedOrders'), icon: CheckCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('company')}
              </label>
              <select
                value={filter.company}
                onChange={(e) => setFilter(prev => ({ ...prev, company: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
              >
                <option value="">{t('allCompanies')}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('product')}
              </label>
              <select
                value={filter.product}
                onChange={(e) => setFilter(prev => ({ ...prev, product: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
              >
                <option value="">{t('allProducts')}</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('fromDate')}
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('toDate')}
              </label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ company: '', product: '', shipmentType: '', dateFrom: '', dateTo: '' })}
                className="bg-gray-500 hover:bg-muted text-white px-4 py-2 rounded-md transition-colors"
              >
                {t('clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Card-based Shipments Display */}
        <div className="space-y-6">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('loadingShipments')}</p>
            </div>
          ) : (
            <>
              {getGroupedShipments().length === 0 ? (
                <div className="p-8 text-center">
                  <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noShipmentsFound')}</p>
                </div>
              ) : (
                getGroupedShipments().map(({ key, shipments, invoiceNumber, date, company, totalItems, totalCost, driverName }) => (
                  <div key={key} className="bg-card rounded-lg shadow-sm border border-border">
                    {/* Card Header */}
                    <div className="p-4 border-b border-border bg-muted">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('driver')}: {driverName}</p>
                          {invoiceNumber && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('invoice')}: {invoiceNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body - Items */}
                    <div className="divide-y divide-border">
                      {shipments.map((shipment) => {
                        const purchaseInfo = parsePurchaseInfo(shipment);
                        return (
                          <div key={shipment.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h4 className="text-md font-medium text-foreground">
                                    {shipment.product.name} ({shipment.product.size})
                                  </h4>
                                  {getStatusBadge(shipment.status)}
                                  {getPurchaseTypeBadge(purchaseInfo.purchaseType as 'PACKAGE' | 'REFILL')}
                                </div>
                                
                                {/* Enhanced pricing breakdown */}
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t('quantity')}: <span className="font-medium">{shipment.quantity} {t('units')}</span></span>
                                    {purchaseInfo.hasBreakdown ? (
                                      <>
                                        <span>{t('gas')}: <span className="font-medium">{formatCurrency(purchaseInfo.gasPrice)}/{t('unit')}</span></span>
                                        {purchaseInfo.purchaseType === 'PACKAGE' && purchaseInfo.cylinderPrice > 0 && (
                                          <span>{t('cylinder')}: <span className="font-medium">{formatCurrency(purchaseInfo.cylinderPrice)}/{t('unit')}</span></span>
                                        )}
                                      </>
                                    ) : (
                                      <span>{t('unitCost')}: <span className="font-medium">{formatCurrency(shipment.unitCost || 0)}</span></span>
                                    )}
                                  </div>
                                  
                                  {/* Cost breakdown */}
                                  {purchaseInfo.hasBreakdown ? (
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span>{t('gasCost')}: <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(purchaseInfo.totalGasCost)}</span></span>
                                      {purchaseInfo.purchaseType === 'PACKAGE' && purchaseInfo.totalCylinderCost > 0 && (
                                        <span>{t('cylinderCost')}: <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(purchaseInfo.totalCylinderCost)}</span></span>
                                      )}
                                      <span>{t('total')}: <span className="font-medium text-foreground">{formatCurrency(shipment.totalCost || 0)}</span></span>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      <span>{t('total')}: <span className="font-medium text-foreground">{formatCurrency(shipment.totalCost || 0)}</span></span>
                                    </div>
                                  )}
                                </div>
                                
                                {shipment.vehicleNumber && (
                                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {t('vehicle')}: {shipment.vehicleNumber}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                              {shipment.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleMarkFulfilled(shipment.id)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title={t('markAsFulfilled')}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                              )}
                              {/* Only show Edit/Delete for outstanding (pending/in_transit) orders */}
                              {['PENDING', 'IN_TRANSIT'].includes(shipment.status || 'PENDING') && (
                                <>
                                  <button
                                    onClick={() => openEditModal(shipment)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title={t('edit')}
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(shipment.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 border-t border-border bg-muted">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {t('totalItems')}: {totalItems}
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {t('totalCost')}: {formatCurrency(totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-card border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {editingShipment ? t('editPurchaseOrder') : t('createNewPurchaseOrder')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('step')} {step} {t('of')} 3</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-muted/80 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-muted p-6 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 mb-4">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <h4 className="text-lg font-semibold text-foreground">{t('orderInformation')}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('company')} *
                          </label>
                          <select
                            value={formData.companyId}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, companyId: e.target.value }));
                              setCurrentLineItem(prev => ({ ...prev, productId: '' }));
                              setFormErrors(prev => ({ ...prev, companyId: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.companyId ? 'border-red-500' : 'border-border'
                            }`}
                          >
                            <option value="">{t('selectCompany')}</option>
                            {companies.map(company => (
                              <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                          </select>
                          {formErrors.companyId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.companyId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('driver')} *
                          </label>
                          <select
                            value={formData.driverId}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, driverId: e.target.value }));
                              setFormErrors(prev => ({ ...prev, driverId: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.driverId ? 'border-red-500' : 'border-border'
                            }`}
                          >
                            <option value="">{t('selectDriver')}</option>
                            {drivers.filter(driver => driver.status === 'ACTIVE').map(driver => (
                              <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                          </select>
                          {formErrors.driverId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.driverId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('shipmentDate')} *
                          </label>
                          <input
                            type="date"
                            value={formData.shipmentDate}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, shipmentDate: e.target.value }));
                              setFormErrors(prev => ({ ...prev, shipmentDate: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.shipmentDate ? 'border-red-500' : 'border-border'
                            }`}
                          />
                          {formErrors.shipmentDate && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.shipmentDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('expectedDeliveryDate')}
                          </label>
                          <input
                            type="date"
                            value={formData.expectedDeliveryDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('invoiceNumber')}
                          </label>
                          <input
                            type="text"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={t('enterInvoiceNumber')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('paymentTerms')}
                          </label>
                          <select
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="COD">{t('cashOnDelivery')}</option>
                            <option value="NET30">{t('net30Days')}</option>
                            <option value="NET60">{t('net60Days')}</option>
                            <option value="ADVANCE">{t('advancePayment')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('priority')}
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="LOW">{t('low')}</option>
                            <option value="NORMAL">{t('normal')}</option>
                            <option value="HIGH">{t('high')}</option>
                            <option value="URGENT">{t('urgent')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('vehicleNumber')}
                          </label>
                          <input
                            type="text"
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={t('enterVehicleNumber')}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          {t('notes')}
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          rows={3}
                          placeholder={t('enterAdditionalNotes')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Line Items */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Add Line Item Section */}
                    <div className="bg-muted p-6 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 mb-4">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        <h4 className="text-lg font-semibold text-foreground">{t('addLineItem')}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('product')} *
                          </label>
                          <select
                            value={currentLineItem.productId}
                            onChange={(e) => {
                              setCurrentLineItem(prev => ({ ...prev, productId: e.target.value }));
                              setFormErrors(prev => ({ ...prev, productId: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.productId ? 'border-red-500' : 'border-border'
                            }`}
                            disabled={!formData.companyId}
                          >
                            <option value="">{formData.companyId ? t('selectProduct') : t('selectCompanyFirst')}</option>
                            {products
                              .filter(product => !formData.companyId || product.company?.id === formData.companyId)
                              .map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.size})
                                </option>
                              ))}
                          </select>
                          {formErrors.productId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.productId}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('type')} *
                          </label>
                          <select
                            value={currentLineItem.purchaseType}
                            onChange={(e) => setCurrentLineItem(prev => ({ ...prev, purchaseType: e.target.value as any }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="PACKAGE">{t('package')}</option>
                            <option value="REFILL">{t('refill')}</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('quantity')} *
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.quantity}
                            onChange={(e) => {
                              setCurrentLineItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }));
                              setFormErrors(prev => ({ ...prev, quantity: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.quantity ? 'border-red-500' : 'border-border'
                            }`}
                            min="1"
                            placeholder="0"
                          />
                          {formErrors.quantity && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('gasPrice')} *
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.gasPrice}
                            onChange={(e) => {
                              setCurrentLineItem(prev => ({ ...prev, gasPrice: parseFloat(e.target.value) || 0 }));
                              setFormErrors(prev => ({ ...prev, gasPrice: '' }));
                            }}
                            className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formErrors.gasPrice ? 'border-red-500' : 'border-border'
                            }`}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                          {formErrors.gasPrice && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.gasPrice}</p>
                          )}
                        </div>
                        
                        {currentLineItem.purchaseType === 'PACKAGE' && (
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              {t('cylinderPrice')} *
                            </label>
                            <input
                              type="number"
                              value={currentLineItem.cylinderPrice}
                              onChange={(e) => {
                                setCurrentLineItem(prev => ({ ...prev, cylinderPrice: parseFloat(e.target.value) || 0 }));
                                setFormErrors(prev => ({ ...prev, cylinderPrice: '' }));
                              }}
                              className={`w-full border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                formErrors.cylinderPrice ? 'border-red-500' : 'border-border'
                              }`}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                            {formErrors.cylinderPrice && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.cylinderPrice}</p>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('discount')} (%)
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.discount}
                            onChange={(e) => setCurrentLineItem(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('taxRate')} (%)
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.taxRate}
                            onChange={(e) => setCurrentLineItem(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      {/* Live calculation preview */}
                      {currentLineItem.quantity > 0 && currentLineItem.gasPrice > 0 && (
                        <div className="mt-4 bg-card p-4 rounded-lg border border-border">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calculator className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-muted-foreground">{t('lineTotalPreview')}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">{t('gasCost')}:</span>
                              <div className="font-semibold">{formatCurrency(currentLineItem.quantity * currentLineItem.gasPrice)}</div>
                            </div>
                            {currentLineItem.purchaseType === 'PACKAGE' && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">{t('cylinderCost')}:</span>
                                <div className="font-semibold">{formatCurrency(currentLineItem.quantity * currentLineItem.cylinderPrice)}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">{t('discount')}:</span>
                              <div className="font-semibold text-green-600">-{formatCurrency(((currentLineItem.quantity * currentLineItem.gasPrice) + (currentLineItem.purchaseType === 'PACKAGE' ? currentLineItem.quantity * currentLineItem.cylinderPrice : 0)) * currentLineItem.discount / 100)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">{t('total')}:</span>
                              <div className="font-bold text-lg text-blue-600">{formatCurrency((() => {
                                const subtotal = (currentLineItem.quantity * currentLineItem.gasPrice) + (currentLineItem.purchaseType === 'PACKAGE' ? currentLineItem.quantity * currentLineItem.cylinderPrice : 0);
                                const discount = subtotal * currentLineItem.discount / 100;
                                const taxable = subtotal - discount;
                                const tax = taxable * currentLineItem.taxRate / 100;
                                return taxable + tax;
                              })())}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <Info className="inline h-4 w-4 mr-1" />
                          {currentLineItem.purchaseType === 'PACKAGE' 
                            ? t('packageInfo') 
                            : t('refillInfo')
                          }
                        </div>
                        <button
                          type="button"
                          onClick={addLineItem}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('addItem')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    {lineItems.length > 0 && (
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border">
                          <h4 className="text-lg font-semibold text-foreground">{t('purchaseItems')} ({lineItems.length})</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('product')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('type')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('qty')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('gasCost')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('cylinderCost')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('lineTotal')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('action')}</th>
                              </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                              {lineItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">{item.product?.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.product?.size}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.purchaseType === 'PACKAGE' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    }`}>
                                      {item.purchaseType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {formatCurrency(item.totalGasCost)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                    {item.purchaseType === 'PACKAGE' ? formatCurrency(item.totalCylinderCost) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                                    {formatCurrency(item.totalLineCost)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => editLineItem(index)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                                        title={t('editItem')}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>{t('edit')}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeLineItem(index)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
                                        title={t('removeItem')}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span>{t('remove')}</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-muted px-6 py-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-foreground">{t('totalPurchaseValue')}:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(getTotalCost())}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {formErrors.lineItems && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{formErrors.lineItems}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-muted p-6 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 mb-4">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <h4 className="text-lg font-semibold text-foreground">{t('orderPreview')}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <h5 className="font-semibold text-foreground mb-3">{t('orderInformation')}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('company')}:</span>
                              <span className="font-medium">{companies.find(c => c.id === formData.companyId)?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('driver')}:</span>
                              <span className="font-medium">{drivers.find(d => d.id === formData.driverId)?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('shipmentDate')}:</span>
                              <span className="font-medium">{formatDate(formData.shipmentDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('paymentTerms')}:</span>
                              <span className="font-medium">{formData.paymentTerms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('priority')}:</span>
                              <span className={`font-medium ${formData.priority === 'URGENT' ? 'text-red-600' : formData.priority === 'HIGH' ? 'text-orange-600' : 'text-green-600'}`}>
                                {formData.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <h5 className="font-semibold text-foreground mb-3">{t('orderSummary')}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('totalItems')}:</span>
                              <span className="font-medium">{lineItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('totalQuantity')}:</span>
                              <span className="font-medium">{lineItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-blue-600">
                              <span>{t('totalValue')}:</span>
                              <span>{formatCurrency(getTotalCost())}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formErrors.submit && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{formErrors.submit}</p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-muted px-6 py-4 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground bg-input border border-border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      {t('previous')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground bg-input border border-border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1) {
                          if (formData.companyId && formData.driverId && formData.shipmentDate) {
                            setStep(2);
                          } else {
                            setFormErrors({
                              companyId: !formData.companyId ? t('companyRequired') : '',
                              driverId: !formData.driverId ? t('driverRequired') : '',
                              shipmentDate: !formData.shipmentDate ? t('shipmentDateRequired') : ''
                            });
                          }
                        } else if (step === 2) {
                          if (lineItems.length > 0) {
                            setStep(3);
                          } else {
                            setFormErrors({ lineItems: t('atLeastOneLineItemRequired') });
                          }
                        }
                      }}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('next')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('creating')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>{editingShipment ? t('updatePurchaseOrder') : t('createPurchaseOrder')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty Cylinder Buy/Sell Modal */}
      {showEmptyCylinderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-foreground mb-4">
              {t('emptyCylinderBuySell')}
            </h3>
            <form onSubmit={handleEmptyCylinderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('transactionType')}
                </label>
                <select
                  value={emptyCylinderData.transactionType}
                  onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, transactionType: e.target.value as any }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                >
                  <option value="BUY">{t('buyEmptyCylinders')}</option>
                  <option value="SELL">{t('sellEmptyCylinders')}</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {emptyCylinderData.transactionType === 'BUY' 
                    ? t('addEmptyCylindersToInventory') 
                    : t('removeEmptyCylindersFromInventory')
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('cylinderSize')}
                </label>
                <select
                  value={emptyCylinderData.cylinderSizeId}
                  onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, cylinderSizeId: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                >
                  <option value="">{t('selectCylinderSize')}</option>
                  {cylinderSizes.filter(cs => cs.isActive !== false).map(cylinderSize => (
                    <option key={cylinderSize.id} value={cylinderSize.id}>
                      {cylinderSize.size}{cylinderSize.description ? ` - ${cylinderSize.description}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('emptyCylindersNote')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('quantity')}
                  </label>
                  <input
                    type="number"
                    value={emptyCylinderData.quantity}
                    onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t('unitPrice')}
                  </label>
                  <input
                    type="number"
                    value={emptyCylinderData.unitPrice}
                    onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('transactionDate')}
                </label>
                <input
                  type="date"
                  value={emptyCylinderData.date}
                  onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('notes')}
                </label>
                <textarea
                  value={emptyCylinderData.notes}
                  onChange={(e) => setEmptyCylinderData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 bg-input text-foreground"
                  rows={3}
                  placeholder={t('enterTransactionDetails')}
                />
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>{t('totalCost')}:</strong> {formatCurrency(emptyCylinderData.quantity * emptyCylinderData.unitPrice)}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmptyCylinderModal(false);
                    resetEmptyCylinderForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-md hover:bg-muted/80 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
                >
                  {emptyCylinderData.transactionType === 'BUY' ? t('buy') : t('sell')} {t('emptyCylinders')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
