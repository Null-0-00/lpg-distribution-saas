'use client';

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
  Fuel,
  RefreshCw,
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
  shipmentType:
    | 'INCOMING_FULL'
    | 'INCOMING_EMPTY'
    | 'OUTGOING_FULL'
    | 'OUTGOING_EMPTY'
    | 'EMPTY_CYLINDER_DELIVERY'
    | 'EMPTY_CYLINDER_PICKUP';
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
  const [cylinderSizes, setCylinderSizes] = useState<
    { id: string; size: string; description?: string; isActive?: boolean }[]
  >([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'outgoing' | 'outstanding' | 'completed'
  >('outgoing');
  const [showModal, setShowModal] = useState(false);
  const [showEmptyCylinderModal, setShowEmptyCylinderModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [filter, setFilter] = useState({
    company: '',
    product: '',
    shipmentType: '',
    dateFrom: '',
    dateTo: '',
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
    priority: 'NORMAL',
  });

  const [lineItems, setLineItems] = useState<ShipmentLineItem[]>([]);
  const [currentLineItem, setCurrentLineItem] = useState({
    productId: '',
    purchaseType: 'PACKAGE' as 'PACKAGE' | 'REFILL',
    quantity: 0,
    gasPrice: 0,
    cylinderPrice: 0,
    discount: 0,
    taxRate: 0,
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
    notes: '',
  });

  const [inventoryValidation, setInventoryValidation] = useState<{
    isValid: boolean;
    available: number;
    message?: string;
    isChecking: boolean;
  }>({
    isValid: true,
    available: 0,
    message: '',
    isChecking: false,
  });

  const [isEmptyCylinderSubmitting, setIsEmptyCylinderSubmitting] =
    useState(false);

  // Helper function to translate inventory validation messages
  const translateInventoryMessage = (message: string | undefined): string => {
    if (!message) return '';

    // Handle "No empty cylinders of size X available" message
    const noEmptyMatch = message.match(
      /No empty cylinders of size (\w+) available/
    );
    if (noEmptyMatch) {
      const size = noEmptyMatch[1];
      return t('noEmptyCylindersOfSizeAvailable').replace('{size}', size);
    }

    // Handle "Insufficient empty cylinders of size X" message
    const insufficientMatch = message.match(
      /Insufficient empty cylinders of size (\w+)/
    );
    if (insufficientMatch) {
      const size = insufficientMatch[1];
      const requiredMatch = message.match(/Required: (\d+)/);
      const availableMatch = message.match(/Available: (\d+)/);
      const required = requiredMatch ? requiredMatch[1] : '0';
      const available = availableMatch ? availableMatch[1] : '0';
      return `${size} সাইজের পর্যাপ্ত খালি সিলিন্ডার নেই। প্রয়োজন: ${required}টি, উপলব্ধ: ${available}টি`;
    }

    // Return original message if no translation pattern matches
    return message;
  };

  useEffect(() => {
    fetchShipments();
    fetchCompanies();
    fetchProducts();
    fetchCylinderSizes();
    fetchDrivers();
  }, [filter]);

  // Validate inventory when empty cylinder form data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      validateEmptyCylinderInventory();
    }, 500); // Debounce for 500ms to avoid too many API calls

    return () => clearTimeout(debounceTimer);
  }, [
    emptyCylinderData.cylinderSizeId,
    emptyCylinderData.quantity,
    emptyCylinderData.transactionType,
  ]);

  // Refresh companies when modal is shown
  useEffect(() => {
    if (showModal) {
      console.log('Modal opened, refreshing companies list...');
      fetchCompanies();
    }
  }, [showModal]);

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
      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/companies?_t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched companies:', data.companies?.length || 0);
        setCompanies(data.companies || []);
      } else {
        console.error(
          'Failed to fetch companies:',
          response.status,
          response.statusText
        );
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
    if (!formData.shipmentDate)
      errors.shipmentDate = 'Shipment date is required';
    if (lineItems.length === 0)
      errors.lineItems = 'At least one line item is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLineItem = () => {
    const errors: Record<string, string> = {};

    if (!currentLineItem.productId) errors.productId = 'Product is required';
    if (currentLineItem.quantity <= 0)
      errors.quantity = 'Quantity must be greater than 0';
    if (currentLineItem.gasPrice <= 0)
      errors.gasPrice = 'Gas price must be greater than 0';
    if (
      currentLineItem.purchaseType === 'PACKAGE' &&
      currentLineItem.cylinderPrice <= 0
    ) {
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

    const product = products.find((p) => p.id === currentLineItem.productId);
    if (!product) return;

    const subtotalGas = currentLineItem.quantity * currentLineItem.gasPrice;
    const subtotalCylinder =
      currentLineItem.purchaseType === 'PACKAGE'
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
      cylinderPrice:
        currentLineItem.purchaseType === 'PACKAGE'
          ? currentLineItem.cylinderPrice
          : 0,
      totalGasCost: subtotalGas,
      totalCylinderCost: subtotalCylinder,
      totalLineCost: taxableAmount + taxAmount,
    };

    setLineItems((prev) => [...prev, newLineItem]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0,
      discount: 0,
      taxRate: 0,
    });
    setFormErrors({});
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
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
      taxRate: 0,
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

      // Handle different types of errors with Bengali messages
      let errorMessage = '';
      const errorString =
        error instanceof Error ? error.message : String(error);

      if (
        errorString.includes(
          'Insufficient cylinder inventory for refill purchases'
        )
      ) {
        errorMessage = 'রিফিল ক্রয় ব্যর্থ: পর্যাপ্ত খালি সিলিন্ডার স্টক নেই';
      } else if (
        errorString.includes('Product not found or missing cylinder size')
      ) {
        errorMessage =
          'পণ্য পাওয়া যায়নি অথবা সিলিন্ডার সাইজের তথ্য অনুপস্থিত';
      } else if (errorString.includes('Driver not found or inactive')) {
        errorMessage = 'চালক পাওয়া যায়নি অথবা নিষ্ক্রিয়';
      } else if (errorString.includes('Company not found')) {
        errorMessage = 'কোম্পানি পাওয়া যায়নি';
      } else if (errorString.includes('Missing required fields')) {
        errorMessage = 'প্রয়োজনীয় তথ্য অনুপস্থিত। সকল ক্ষেত্র পূরণ করুন';
      } else {
        errorMessage = `ক্রয় অর্ডার সংরক্ষণ ব্যর্থ: ${errorString}`;
      }

      setFormErrors({
        submit: errorMessage,
      });
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
        totalCost: getTotalCost(),
      }),
    });

    if (response.ok) {
      setShowModal(false);
      resetForm();
      fetchShipments();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create shipment');
    }
  };

  const handleEditSubmit = async () => {
    if (!editingShipment) return;

    // Find all shipments in the same group for deletion
    const isEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(
      editingShipment.shipmentType
    );
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

    const groupedShipments = shipments.filter((s) => {
      const sIsEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(
        s.shipmentType
      );
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
    const deletePromises = groupedShipments.map((shipment) =>
      fetch(`/api/shipments/${shipment.id}`, { method: 'DELETE' })
    );

    const deleteResults = await Promise.all(deletePromises);
    const deleteFailed = deleteResults.some((result) => !result.ok);

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
        totalCost: getTotalCost(),
      }),
    });

    if (response.ok) {
      setShowModal(false);
      resetForm();
      fetchShipments();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create updated shipments');
    }
  };

  const handleMarkFulfilled = async (shipmentId: string) => {
    if (
      !confirm(
        'Mark this shipment as completed? This will update the inventory and cannot be undone.'
      )
    )
      return;

    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
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
        method: 'DELETE',
      });

      if (response.ok) {
        fetchShipments();
      } else {
        const errorData = await response.json();
        alert(
          `Error deleting shipment: ${errorData.error || t('unknownError')}`
        );
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('Failed to delete shipment. Please try again.');
    }
  };

  const handleEmptyCylinderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsEmptyCylinderSubmitting(true);

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentType:
            emptyCylinderData.transactionType === 'BUY'
              ? 'INCOMING_EMPTY'
              : 'OUTGOING_EMPTY',
          companyId: null, // Empty cylinder transactions might not have a company
          cylinderSizeId: emptyCylinderData.cylinderSizeId,
          quantity: emptyCylinderData.quantity,
          unitCost: emptyCylinderData.unitPrice,
          totalCost: emptyCylinderData.quantity * emptyCylinderData.unitPrice,
          shipmentDate: emptyCylinderData.date,
          notes: `Empty Cylinder ${emptyCylinderData.transactionType}: ${emptyCylinderData.notes}`,
          invoiceNumber: '',
          vehicleNumber: '',
        }),
      });

      if (response.ok) {
        setShowEmptyCylinderModal(false);
        resetEmptyCylinderForm();
        fetchShipments();
      } else {
        const errorData = await response.json();

        // Handle different types of errors with Bengali messages
        let errorMessage = '';
        if (
          errorData.error ===
          'Insufficient empty cylinder inventory for shipment'
        ) {
          errorMessage = `খালি সিলিন্ডার বিক্রয় ব্যর্থ: ${errorData.details ? errorData.details.join(', ') : 'পর্যাপ্ত স্টক নেই'}`;
        } else if (
          errorData.error ===
          'Product missing cylinder size information for validation'
        ) {
          errorMessage = 'পণ্যের সিলিন্ডার সাইজের তথ্য পাওয়া যাচ্ছে না';
        } else if (
          errorData.error === 'Cannot determine cylinder size for validation'
        ) {
          errorMessage = 'সিলিন্ডার সাইজ নির্ধারণ করা যাচ্ছে না';
        } else {
          errorMessage = `লেনদেন ব্যর্থ: ${errorData.error || 'অজানা ত্রুটি'}`;
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving empty cylinder transaction:', error);
      alert('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setIsEmptyCylinderSubmitting(false);
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
      priority: 'NORMAL',
    });
    setLineItems([]);
    setCurrentLineItem({
      productId: '',
      purchaseType: 'PACKAGE',
      quantity: 0,
      gasPrice: 0,
      cylinderPrice: 0,
      discount: 0,
      taxRate: 0,
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
      notes: '',
    });
    setInventoryValidation({
      isValid: true,
      available: 0,
      message: '',
      isChecking: false,
    });
    setIsEmptyCylinderSubmitting(false);
  };

  const validateEmptyCylinderInventory = async () => {
    if (
      !emptyCylinderData.cylinderSizeId ||
      emptyCylinderData.quantity <= 0 ||
      emptyCylinderData.transactionType === 'BUY'
    ) {
      setInventoryValidation({
        isValid: true,
        available: 0,
        message: '',
        isChecking: false,
      });
      return;
    }

    setInventoryValidation((prev) => ({
      ...prev,
      isChecking: true,
    }));

    try {
      const response = await fetch('/api/cylinder-inventory/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cylinderSizeId: emptyCylinderData.cylinderSizeId,
          quantity: emptyCylinderData.quantity,
          transactionType: emptyCylinderData.transactionType,
        }),
      });

      const validation = await response.json();

      setInventoryValidation({
        isValid: validation.isValid,
        available: validation.available,
        message: validation.message,
        isChecking: false,
      });
    } catch (error) {
      console.error('Error validating inventory:', error);
      setInventoryValidation({
        isValid: false,
        available: 0,
        message: 'Unable to validate inventory',
        isChecking: false,
      });
    }
  };

  const openEditModal = async (shipment: Shipment) => {
    setEditingShipment(shipment);

    // Refresh data to ensure latest companies, products, and drivers
    await Promise.all([fetchCompanies(), fetchProducts(), fetchDrivers()]);

    // Find all shipments in the same group (same invoice + date or same date + company)
    const isEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(
      shipment.shipmentType
    );
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

    const groupedShipments = shipments.filter((s) => {
      const sIsEmptyTransaction = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'].includes(
        s.shipmentType
      );
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
    const matchingDriver = drivers.find((d) => d.name === driverName);

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
      priority: 'NORMAL',
    });

    // Convert grouped shipments to line items format
    const editLineItems: ShipmentLineItem[] = groupedShipments.map((s) => {
      // Parse purchase type from notes (starts with "PACKAGE:" or "REFILL:")
      const isPrefillPurchase = s.notes?.startsWith('REFILL:');
      const purchaseType = isPrefillPurchase ? 'REFILL' : 'PACKAGE';

      // Parse prices from notes
      const gasPriceMatch = s.notes?.match(/Gas:\s*৳([\d.]+)\/unit/);
      const cylinderPriceMatch = s.notes?.match(/Cylinder:\s*৳([\d.]+)\/unit/);

      const gasPrice = gasPriceMatch ? parseFloat(gasPriceMatch[1]) : 0;
      const cylinderPrice = cylinderPriceMatch
        ? parseFloat(cylinderPriceMatch[1])
        : 0;

      const totalGasCost = s.quantity * gasPrice;
      const totalCylinderCost =
        purchaseType === 'PACKAGE' ? s.quantity * cylinderPrice : 0;

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
        totalLineCost: s.totalCost || totalGasCost + totalCylinderCost,
      };
    });

    setLineItems(editLineItems);
    setStep(1); // Start from first step
    setShowModal(true);
  };

  const getFilteredShipments = () => {
    return shipments.filter((shipment) => {
      switch (activeTab) {
        case 'outgoing':
          // Show all shipments (both pending and completed purchase orders appear here)
          return (
            shipment.shipmentType === 'INCOMING_FULL' ||
            shipment.shipmentType.includes('OUTGOING') ||
            shipment.shipmentType.includes('PICKUP')
          );
        case 'outstanding':
          // Show only pending/in_transit purchase orders (CRUD operations allowed)
          return ['PENDING', 'IN_TRANSIT'].includes(
            shipment.status || 'PENDING'
          );
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

    filteredShipments.forEach((shipment) => {
      if (!shipment) return;

      // Check if this is an empty cylinder transaction
      const isEmptyCylinderTransaction = [
        'INCOMING_EMPTY',
        'OUTGOING_EMPTY',
      ].includes(shipment.shipmentType);

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
          company: {
            id: '',
            name: t('unknownCompany'),
            contactPerson: '',
            phone: '',
          },
          totalItems: 0,
          totalCost: 0,
          driverName: t('unknownDriver'),
        };
      }

      const firstShipment = shipments[0];
      const isEmptyCylinderTransaction = [
        'INCOMING_EMPTY',
        'OUTGOING_EMPTY',
      ].includes(firstShipment.shipmentType);

      return {
        key,
        shipments,
        invoiceNumber: firstShipment.invoiceNumber || '',
        date: firstShipment.shipmentDate || '',
        company: firstShipment.company || {
          id: '',
          name: isEmptyCylinderTransaction
            ? `${t('emptyCylinderTransaction')} - ${
                firstShipment.shipmentType === 'INCOMING_EMPTY'
                  ? t('cylinderBuyTransaction')
                  : t('cylinderSellTransaction')
              }`
            : t('directTransaction'),
          contactPerson: '',
          phone: '',
        },
        totalItems: shipments.reduce((sum, s) => sum + (s.quantity || 0), 0),
        totalCost: shipments.reduce((sum, s) => sum + (s.totalCost || 0), 0),
        driverName:
          firstShipment.notes?.match(/Driver: ([^|]+)/)?.[1]?.trim() ||
          t('unknownDriver'),
      };
    });
  };

  const getShipmentTypeLabel = (type: string) => {
    const labels = {
      OUTGOING_FULL: 'Outgoing Full Cylinders',
      OUTGOING_EMPTY: 'Outgoing Empty Cylinders',
      INCOMING_FULL: 'Incoming Full Cylinders',
      INCOMING_EMPTY: 'Incoming Empty Cylinders',
      EMPTY_CYLINDER_DELIVERY: 'Empty Cylinder Delivery',
      EMPTY_CYLINDER_PICKUP: 'Empty Cylinder Pickup',
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
    const cylinderPrice = cylinderPriceMatch
      ? parseFloat(cylinderPriceMatch[1])
      : 0;

    const totalGasCost = shipment.quantity * gasPrice;
    const totalCylinderCost =
      purchaseType === 'PACKAGE' ? shipment.quantity * cylinderPrice : 0;

    return {
      purchaseType,
      gasPrice,
      cylinderPrice,
      totalGasCost,
      totalCylinderCost,
      hasBreakdown: gasPrice > 0, // Only show breakdown if we have price data
    };
  };

  const getPurchaseTypeBadge = (purchaseType: 'PACKAGE' | 'REFILL') => {
    const colors = {
      PACKAGE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      REFILL:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    const icons = {
      PACKAGE: Package,
      REFILL: Fuel,
    };

    const Icon = icons[purchaseType];

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[purchaseType]}`}
      >
        <Icon className="mr-1 h-3 w-3" />
        {purchaseType}
      </span>
    );
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />; // Default to pending
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const safeStatus = status || 'PENDING';

    const colors = {
      COMPLETED:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      IN_TRANSIT:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELIVERED:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[safeStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
      >
        {getStatusIcon(safeStatus)}
        <span className="ml-1 capitalize">
          {safeStatus.replace('_', ' ').toLowerCase()}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                {t('shipmentsManagement')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('trackPurchaseOrdersAndShipments')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingShipment(null); // Clear editing state for new purchase
                  resetForm(); // Reset form to defaults
                  // Refresh companies list to ensure latest data
                  fetchCompanies();
                  fetchProducts();
                  fetchDrivers();
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>{t('newPurchase')}</span>
              </button>
              <button
                onClick={() => setShowEmptyCylinderModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                <Package className="h-5 w-5" />
                <span>{t('emptyCylinderBuySell')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border mb-6 border-b">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'outgoing', label: t('allShipments'), icon: ArrowUpDown },
              { id: 'outstanding', label: t('outstandingOrders'), icon: Clock },
              {
                id: 'completed',
                label: t('completedOrders'),
                icon: CheckCircle,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
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
        <div className="bg-card mb-6 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                {t('company')}
              </label>
              <select
                value={filter.company}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, company: e.target.value }))
                }
                className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
              >
                <option value="">{t('allCompanies')}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                {t('product')}
              </label>
              <select
                value={filter.product}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, product: e.target.value }))
                }
                className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
              >
                <option value="">{t('allProducts')}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                {t('fromDate')}
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                {t('toDate')}
              </label>
              <input
                type="date"
                value={filter.dateTo}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilter({
                    company: '',
                    product: '',
                    shipmentType: '',
                    dateFrom: '',
                    dateTo: '',
                  })
                }
                className="hover:bg-muted rounded-md bg-gray-500 px-4 py-2 text-white transition-colors"
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
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('loadingShipments')}
              </p>
            </div>
          ) : (
            <>
              {getGroupedShipments().length === 0 ? (
                <div className="p-8 text-center">
                  <Ship className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('noShipmentsFound')}
                  </p>
                </div>
              ) : (
                getGroupedShipments().map(
                  ({
                    key,
                    shipments,
                    invoiceNumber,
                    date,
                    company,
                    totalItems,
                    totalCost,
                    driverName,
                  }) => (
                    <div
                      key={key}
                      className="bg-card border-border rounded-lg border shadow-sm"
                    >
                      {/* Card Header */}
                      <div className="border-border bg-muted border-b p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-foreground text-lg font-semibold">
                              {company.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('driver')}: {driverName}
                            </p>
                            {invoiceNumber && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('invoice')}: {invoiceNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Body - Items */}
                      <div className="divide-border divide-y">
                        {shipments.map((shipment) => {
                          const purchaseInfo = parsePurchaseInfo(shipment);
                          return (
                            <div
                              key={shipment.id}
                              className="hover:bg-muted/50 p-4 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h4 className="text-md text-foreground font-medium">
                                      {shipment.product.name} (
                                      {shipment.product.size})
                                    </h4>
                                    {getStatusBadge(shipment.status)}
                                    {getPurchaseTypeBadge(
                                      purchaseInfo.purchaseType as
                                        | 'PACKAGE'
                                        | 'REFILL'
                                    )}
                                  </div>

                                  {/* Enhanced pricing breakdown */}
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span>
                                        {t('quantity')}:{' '}
                                        <span className="font-medium">
                                          {shipment.quantity} {t('units')}
                                        </span>
                                      </span>
                                      {purchaseInfo.hasBreakdown ? (
                                        <>
                                          <span>
                                            {t('gas')}:{' '}
                                            <span className="font-medium">
                                              {formatCurrency(
                                                purchaseInfo.gasPrice
                                              )}
                                              /{t('unit')}
                                            </span>
                                          </span>
                                          {purchaseInfo.purchaseType ===
                                            'PACKAGE' &&
                                            purchaseInfo.cylinderPrice > 0 && (
                                              <span>
                                                {t('cylinder')}:{' '}
                                                <span className="font-medium">
                                                  {formatCurrency(
                                                    purchaseInfo.cylinderPrice
                                                  )}
                                                  /{t('unit')}
                                                </span>
                                              </span>
                                            )}
                                        </>
                                      ) : (
                                        <span>
                                          {t('unitCost')}:{' '}
                                          <span className="font-medium">
                                            {formatCurrency(
                                              shipment.unitCost || 0
                                            )}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Cost breakdown */}
                                    {purchaseInfo.hasBreakdown ? (
                                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>
                                          {t('gasCost')}:{' '}
                                          <span className="font-medium text-green-600 dark:text-green-400">
                                            {formatCurrency(
                                              purchaseInfo.totalGasCost
                                            )}
                                          </span>
                                        </span>
                                        {purchaseInfo.purchaseType ===
                                          'PACKAGE' &&
                                          purchaseInfo.totalCylinderCost >
                                            0 && (
                                            <span>
                                              {t('cylinderCost')}:{' '}
                                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(
                                                  purchaseInfo.totalCylinderCost
                                                )}
                                              </span>
                                            </span>
                                          )}
                                        <span>
                                          {t('total')}:{' '}
                                          <span className="text-foreground font-medium">
                                            {formatCurrency(
                                              shipment.totalCost || 0
                                            )}
                                          </span>
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span>
                                          {t('total')}:{' '}
                                          <span className="text-foreground font-medium">
                                            {formatCurrency(
                                              shipment.totalCost || 0
                                            )}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {shipment.vehicleNumber && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                      {t('vehicle')}: {shipment.vehicleNumber}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 flex items-center space-x-2">
                                  {shipment.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() =>
                                        handleMarkFulfilled(shipment.id)
                                      }
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title={t('markAsFulfilled')}
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                  )}
                                  {/* Only show Edit/Delete for outstanding (pending/in_transit) orders */}
                                  {['PENDING', 'IN_TRANSIT'].includes(
                                    shipment.status || 'PENDING'
                                  ) && (
                                    <>
                                      <button
                                        onClick={() => openEditModal(shipment)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        title={t('edit')}
                                      >
                                        <Edit className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete(shipment.id)
                                        }
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
                      <div className="border-border bg-muted border-t p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground text-sm font-medium">
                            {t('totalItems')}: {totalItems}
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {t('totalCost')}: {formatCurrency(totalCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-card max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-card border-border border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-600 p-2">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      {editingShipment
                        ? t('editPurchaseOrder')
                        : t('createNewPurchaseOrder')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('step')} {step} {t('of')} 3
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="hover:bg-muted/80 rounded-lg p-2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="bg-muted mt-4 h-2 rounded-full">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-muted border-border rounded-lg border p-6">
                      <div className="mb-4 flex items-center space-x-2">
                        <Building className="text-muted-foreground h-5 w-5" />
                        <h4 className="text-foreground text-lg font-semibold">
                          {t('orderInformation')}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="text-muted-foreground text-sm font-medium">
                              {t('company')} *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Refreshing companies list...');
                                fetchCompanies();
                              }}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                              title="Refresh companies list"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Refresh
                            </button>
                          </div>
                          <select
                            value={formData.companyId}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                companyId: e.target.value,
                              }));
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                productId: '',
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                companyId: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.companyId
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                          >
                            <option value="">{t('selectCompany')}</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.companyId && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.companyId}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('driver')} *
                          </label>
                          <select
                            value={formData.driverId}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                driverId: e.target.value,
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                driverId: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.driverId
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                          >
                            <option value="">{t('selectDriver')}</option>
                            {drivers
                              .filter((driver) => driver.status === 'ACTIVE')
                              .map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                          </select>
                          {formErrors.driverId && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.driverId}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('shipmentDate')} *
                          </label>
                          <input
                            type="date"
                            value={formData.shipmentDate}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                shipmentDate: e.target.value,
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                shipmentDate: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.shipmentDate
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                          />
                          {formErrors.shipmentDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.shipmentDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('expectedDeliveryDate')}
                          </label>
                          <input
                            type="date"
                            value={formData.expectedDeliveryDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                expectedDeliveryDate: e.target.value,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('invoiceNumber')}
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
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder={t('enterInvoiceNumber')}
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('paymentTerms')}
                          </label>
                          <select
                            value={formData.paymentTerms}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentTerms: e.target.value,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="COD">{t('cashOnDelivery')}</option>
                            <option value="NET30">{t('net30Days')}</option>
                            <option value="NET60">{t('net60Days')}</option>
                            <option value="ADVANCE">
                              {t('advancePayment')}
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('priority')}
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                priority: e.target.value,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="LOW">{t('low')}</option>
                            <option value="NORMAL">{t('normal')}</option>
                            <option value="HIGH">{t('high')}</option>
                            <option value="URGENT">{t('urgent')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('vehicleNumber')}
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
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder={t('enterVehicleNumber')}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-muted-foreground mb-2 block text-sm font-medium">
                          {t('notes')}
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                    <div className="bg-muted border-border rounded-lg border p-6">
                      <div className="mb-4 flex items-center space-x-2">
                        <ShoppingCart className="text-muted-foreground h-5 w-5" />
                        <h4 className="text-foreground text-lg font-semibold">
                          {t('addLineItem')}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('product')} *
                          </label>
                          <select
                            value={currentLineItem.productId}
                            onChange={(e) => {
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                productId: e.target.value,
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                productId: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.productId
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                            disabled={!formData.companyId}
                          >
                            <option value="">
                              {formData.companyId
                                ? t('selectProduct')
                                : t('selectCompanyFirst')}
                            </option>
                            {products
                              .filter(
                                (product) =>
                                  !formData.companyId ||
                                  product.company?.id === formData.companyId
                              )
                              .map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.size})
                                </option>
                              ))}
                          </select>
                          {formErrors.productId && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.productId}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('type')} *
                          </label>
                          <select
                            value={currentLineItem.purchaseType}
                            onChange={(e) =>
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                purchaseType: e.target.value as any,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PACKAGE">{t('package')}</option>
                            <option value="REFILL">{t('refill')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('quantity')} *
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.quantity}
                            onChange={(e) => {
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                quantity: parseInt(e.target.value) || 0,
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                quantity: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.quantity
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                            min="1"
                            placeholder="0"
                          />
                          {formErrors.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.quantity}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('gasPrice')} *
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.gasPrice}
                            onChange={(e) => {
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                gasPrice: parseFloat(e.target.value) || 0,
                              }));
                              setFormErrors((prev) => ({
                                ...prev,
                                gasPrice: '',
                              }));
                            }}
                            className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.gasPrice
                                ? 'border-red-500'
                                : 'border-border'
                            }`}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                          {formErrors.gasPrice && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.gasPrice}
                            </p>
                          )}
                        </div>

                        {currentLineItem.purchaseType === 'PACKAGE' && (
                          <div>
                            <label className="text-muted-foreground mb-2 block text-sm font-medium">
                              {t('cylinderPrice')} *
                            </label>
                            <input
                              type="number"
                              value={currentLineItem.cylinderPrice}
                              onChange={(e) => {
                                setCurrentLineItem((prev) => ({
                                  ...prev,
                                  cylinderPrice:
                                    parseFloat(e.target.value) || 0,
                                }));
                                setFormErrors((prev) => ({
                                  ...prev,
                                  cylinderPrice: '',
                                }));
                              }}
                              className={`bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                                formErrors.cylinderPrice
                                  ? 'border-red-500'
                                  : 'border-border'
                              }`}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                            {formErrors.cylinderPrice && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.cylinderPrice}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('discount')} (%)
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.discount}
                            onChange={(e) =>
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                discount: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground mb-2 block text-sm font-medium">
                            {t('taxRate')} (%)
                          </label>
                          <input
                            type="number"
                            value={currentLineItem.taxRate}
                            onChange={(e) =>
                              setCurrentLineItem((prev) => ({
                                ...prev,
                                taxRate: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Live calculation preview */}
                      {currentLineItem.quantity > 0 &&
                        currentLineItem.gasPrice > 0 && (
                          <div className="bg-card border-border mt-4 rounded-lg border p-4">
                            <div className="mb-2 flex items-center space-x-2">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              <span className="text-muted-foreground text-sm font-medium">
                                {t('lineTotalPreview')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t('gasCost')}:
                                </span>
                                <div className="font-semibold">
                                  {formatCurrency(
                                    currentLineItem.quantity *
                                      currentLineItem.gasPrice
                                  )}
                                </div>
                              </div>
                              {currentLineItem.purchaseType === 'PACKAGE' && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {t('cylinderCost')}:
                                  </span>
                                  <div className="font-semibold">
                                    {formatCurrency(
                                      currentLineItem.quantity *
                                        currentLineItem.cylinderPrice
                                    )}
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t('discount')}:
                                </span>
                                <div className="font-semibold text-green-600">
                                  -
                                  {formatCurrency(
                                    ((currentLineItem.quantity *
                                      currentLineItem.gasPrice +
                                      (currentLineItem.purchaseType ===
                                      'PACKAGE'
                                        ? currentLineItem.quantity *
                                          currentLineItem.cylinderPrice
                                        : 0)) *
                                      currentLineItem.discount) /
                                      100
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t('total')}:
                                </span>
                                <div className="text-lg font-bold text-blue-600">
                                  {formatCurrency(
                                    (() => {
                                      const subtotal =
                                        currentLineItem.quantity *
                                          currentLineItem.gasPrice +
                                        (currentLineItem.purchaseType ===
                                        'PACKAGE'
                                          ? currentLineItem.quantity *
                                            currentLineItem.cylinderPrice
                                          : 0);
                                      const discount =
                                        (subtotal * currentLineItem.discount) /
                                        100;
                                      const taxable = subtotal - discount;
                                      const tax =
                                        (taxable * currentLineItem.taxRate) /
                                        100;
                                      return taxable + tax;
                                    })()
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <Info className="mr-1 inline h-4 w-4" />
                          {currentLineItem.purchaseType === 'PACKAGE'
                            ? t('packageInfo')
                            : t('refillInfo')}
                        </div>
                        <button
                          type="button"
                          onClick={addLineItem}
                          className="flex items-center space-x-2 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('addItem')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    {lineItems.length > 0 && (
                      <div className="bg-card border-border overflow-hidden rounded-lg border">
                        <div className="bg-muted border-border border-b px-6 py-4">
                          <h4 className="text-foreground text-lg font-semibold">
                            {t('purchaseItems')} ({lineItems.length})
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="divide-border min-w-full divide-y">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('product')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('type')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('qty')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('gasCost')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('cylinderCost')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('lineTotal')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                  {t('action')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-card divide-border divide-y">
                              {lineItems.map((item, index) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-foreground text-sm font-medium">
                                      {item.product?.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.product?.size}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        item.purchaseType === 'PACKAGE'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      }`}
                                    >
                                      {item.purchaseType}
                                    </span>
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    {item.quantity}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                                    {formatCurrency(item.totalGasCost)}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                                    {item.purchaseType === 'PACKAGE'
                                      ? formatCurrency(item.totalCylinderCost)
                                      : '-'}
                                  </td>
                                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-bold">
                                    {formatCurrency(item.totalLineCost)}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => editLineItem(index)}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        title={t('editItem')}
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>{t('edit')}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeLineItem(index)}
                                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                        <div className="bg-muted border-border border-t px-6 py-4">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground text-lg font-semibold">
                              {t('totalPurchaseValue')}:
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(getTotalCost())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {formErrors.lineItems && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-red-800 dark:text-red-200">
                          {formErrors.lineItems}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-muted border-border rounded-lg border p-6">
                      <div className="mb-4 flex items-center space-x-2">
                        <Eye className="text-muted-foreground h-5 w-5" />
                        <h4 className="text-foreground text-lg font-semibold">
                          {t('orderPreview')}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="bg-card border-border rounded-lg border p-4">
                          <h5 className="text-foreground mb-3 font-semibold">
                            {t('orderInformation')}
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('company')}:
                              </span>
                              <span className="font-medium">
                                {
                                  companies.find(
                                    (c) => c.id === formData.companyId
                                  )?.name
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('driver')}:
                              </span>
                              <span className="font-medium">
                                {
                                  drivers.find(
                                    (d) => d.id === formData.driverId
                                  )?.name
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('shipmentDate')}:
                              </span>
                              <span className="font-medium">
                                {formatDate(formData.shipmentDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('paymentTerms')}:
                              </span>
                              <span className="font-medium">
                                {formData.paymentTerms}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('priority')}:
                              </span>
                              <span
                                className={`font-medium ${formData.priority === 'URGENT' ? 'text-red-600' : formData.priority === 'HIGH' ? 'text-orange-600' : 'text-green-600'}`}
                              >
                                {formData.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-card border-border rounded-lg border p-4">
                          <h5 className="text-foreground mb-3 font-semibold">
                            {t('orderSummary')}
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('totalItems')}:
                              </span>
                              <span className="font-medium">
                                {lineItems.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('totalQuantity')}:
                              </span>
                              <span className="font-medium">
                                {lineItems.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0
                                )}
                              </span>
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
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-red-800 dark:text-red-200">
                          {formErrors.submit}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-muted border-border border-t px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="text-muted-foreground bg-input border-border hover:bg-muted/50 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
                    className="text-muted-foreground bg-input border-border hover:bg-muted/50 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
                          if (
                            formData.companyId &&
                            formData.driverId &&
                            formData.shipmentDate
                          ) {
                            setStep(2);
                          } else {
                            setFormErrors({
                              companyId: !formData.companyId
                                ? t('companyRequired')
                                : '',
                              driverId: !formData.driverId
                                ? t('driverRequired')
                                : '',
                              shipmentDate: !formData.shipmentDate
                                ? t('shipmentDateRequired')
                                : '',
                            });
                          }
                        } else if (step === 2) {
                          if (lineItems.length > 0) {
                            setStep(3);
                          } else {
                            setFormErrors({
                              lineItems: t('atLeastOneLineItemRequired'),
                            });
                          }
                        }
                      }}
                      className="rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      {t('next')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          <span>{t('creating')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {editingShipment
                              ? t('updatePurchaseOrder')
                              : t('createPurchaseOrder')}
                          </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-card mx-4 w-full max-w-md rounded-lg p-6">
            <h3 className="text-foreground mb-4 text-lg font-medium">
              {t('emptyCylinderBuySell')}
            </h3>
            <form onSubmit={handleEmptyCylinderSubmit} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-sm font-medium">
                  {t('transactionType')}
                </label>
                <select
                  value={emptyCylinderData.transactionType}
                  onChange={(e) =>
                    setEmptyCylinderData((prev) => ({
                      ...prev,
                      transactionType: e.target.value as any,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="BUY">{t('buyEmptyCylinders')}</option>
                  <option value="SELL">{t('sellEmptyCylinders')}</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {emptyCylinderData.transactionType === 'BUY'
                    ? t('addEmptyCylindersToInventory')
                    : t('removeEmptyCylindersFromInventory')}
                </p>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-sm font-medium">
                  {t('cylinderSize')}
                </label>
                <select
                  value={emptyCylinderData.cylinderSizeId}
                  onChange={(e) =>
                    setEmptyCylinderData((prev) => ({
                      ...prev,
                      cylinderSizeId: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">{t('selectCylinderSize')}</option>
                  {cylinderSizes
                    .filter((cs) => cs.isActive !== false)
                    .map((cylinderSize) => (
                      <option key={cylinderSize.id} value={cylinderSize.id}>
                        {cylinderSize.size}
                        {cylinderSize.description
                          ? ` - ${cylinderSize.description}`
                          : ''}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('emptyCylindersNote')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground mb-1 block text-sm font-medium">
                    {t('quantity')}
                  </label>
                  <input
                    type="number"
                    value={emptyCylinderData.quantity}
                    onChange={(e) =>
                      setEmptyCylinderData((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className={`border-border bg-input text-foreground w-full rounded-md border px-3 py-2 ${
                      !inventoryValidation.isValid &&
                      emptyCylinderData.transactionType === 'SELL'
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    required
                    min="1"
                  />
                  {/* Inventory validation feedback */}
                  {emptyCylinderData.transactionType === 'SELL' &&
                    emptyCylinderData.quantity > 0 &&
                    emptyCylinderData.cylinderSizeId && (
                      <div className="mt-1">
                        {inventoryValidation.isChecking ? (
                          <div className="flex items-center text-xs text-blue-600">
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            {t('checkingInventory')}
                          </div>
                        ) : !inventoryValidation.isValid ? (
                          <div className="flex items-center text-xs text-red-600">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {translateInventoryMessage(
                              inventoryValidation.message
                            ) ||
                              `${t('only')} ${inventoryValidation.available}টি ${t('availableText')}`}
                          </div>
                        ) : inventoryValidation.available ===
                          emptyCylinderData.quantity ? (
                          <div className="flex items-center text-xs text-yellow-600">
                            <Info className="mr-1 h-3 w-3" />
                            {`${t('usingAllAvailable')} (${inventoryValidation.available}টি)`}
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {`${inventoryValidation.available}টি ${t('availableText')}`}
                          </div>
                        )}
                      </div>
                    )}
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-sm font-medium">
                    {t('unitPrice')}
                  </label>
                  <input
                    type="number"
                    value={emptyCylinderData.unitPrice}
                    onChange={(e) =>
                      setEmptyCylinderData((prev) => ({
                        ...prev,
                        unitPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-sm font-medium">
                  {t('transactionDate')}
                </label>
                <input
                  type="date"
                  value={emptyCylinderData.date}
                  onChange={(e) =>
                    setEmptyCylinderData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-sm font-medium">
                  {t('notes')}
                </label>
                <textarea
                  value={emptyCylinderData.notes}
                  onChange={(e) =>
                    setEmptyCylinderData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2"
                  rows={3}
                  placeholder={t('enterTransactionDetails')}
                />
              </div>

              <div className="bg-muted rounded-md p-3">
                <p className="text-muted-foreground text-sm">
                  <strong>{t('totalCost')}:</strong>{' '}
                  {formatCurrency(
                    emptyCylinderData.quantity * emptyCylinderData.unitPrice
                  )}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmptyCylinderModal(false);
                    resetEmptyCylinderForm();
                  }}
                  className="text-muted-foreground bg-muted border-border hover:bg-muted/80 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={
                    isEmptyCylinderSubmitting ||
                    (emptyCylinderData.transactionType === 'SELL' &&
                      !inventoryValidation.isValid &&
                      emptyCylinderData.quantity > 0 &&
                      !!emptyCylinderData.cylinderSizeId)
                  }
                  className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors ${
                    isEmptyCylinderSubmitting ||
                    (emptyCylinderData.transactionType === 'SELL' &&
                      !inventoryValidation.isValid &&
                      emptyCylinderData.quantity > 0 &&
                      !!emptyCylinderData.cylinderSizeId)
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isEmptyCylinderSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {emptyCylinderData.transactionType === 'BUY'
                        ? t('purchasing')
                        : t('selling')}
                    </>
                  ) : (
                    <>
                      {emptyCylinderData.transactionType === 'BUY'
                        ? t('buy')
                        : t('sell')}{' '}
                      {t('emptyCylinders')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
