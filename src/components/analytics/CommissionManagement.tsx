'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';
import { Plus, Edit, Save, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  size: string;
  company: { name: string };
}

interface CommissionStructure {
  id: string;
  productId: string;
  month: number;
  year: number;
  commission: number;
  description?: string;
  product: Product;
}

interface FixedCostStructure {
  id: string;
  productId: string | null;
  month: number;
  year: number;
  costPerUnit: number;
  costType: 'MANUAL' | 'CALCULATED';
  description?: string;
  product?: Product;
}

interface CommissionManagementProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
}

export default function CommissionManagement({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
}: CommissionManagementProps) {
  const { t, formatCurrency } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [commissionStructures, setCommissionStructures] = useState<
    CommissionStructure[]
  >([]);
  const [fixedCostStructures, setFixedCostStructures] = useState<
    FixedCostStructure[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingCommission, setEditingCommission] = useState<string | null>(
    null
  );
  const [editingFixedCost, setEditingFixedCost] = useState<string | null>(null);
  const [newCommission, setNewCommission] = useState({
    productId: '',
    commission: 0,
    description: '',
  });
  const [newFixedCost, setNewFixedCost] = useState({
    productId: '',
    costPerUnit: 0,
    costType: 'MANUAL' as const,
    description: '',
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCommissionStructures(),
        fetchFixedCostStructures(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          // Handle case where data is wrapped in an object
          setProducts(data.products);
        } else {
          console.error('Products API returned invalid data structure:', data);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCommissionStructures = async () => {
    try {
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });
      const response = await fetch(`/api/commission-structures?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setCommissionStructures(data);
        } else {
          console.error(
            'Commission structures API returned invalid data structure:',
            data
          );
          setCommissionStructures([]);
        }
      } else {
        console.error(
          'Failed to fetch commission structures:',
          response.status
        );
        setCommissionStructures([]);
      }
    } catch (error) {
      console.error('Error fetching commission structures:', error);
      setCommissionStructures([]);
    }
  };

  const fetchFixedCostStructures = async () => {
    try {
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        includeGlobal: 'true',
      });
      const response = await fetch(`/api/fixed-cost-structures?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setFixedCostStructures(data);
        } else {
          console.error(
            'Fixed cost structures API returned invalid data structure:',
            data
          );
          setFixedCostStructures([]);
        }
      } else {
        console.error(
          'Failed to fetch fixed cost structures:',
          response.status
        );
        setFixedCostStructures([]);
      }
    } catch (error) {
      console.error('Error fetching fixed cost structures:', error);
      setFixedCostStructures([]);
    }
  };

  const saveCommissionStructure = async (data: any) => {
    const response = await fetch('/api/commission-structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        month: selectedMonth,
        year: selectedYear,
      }),
    });

    if (response.ok) {
      await fetchCommissionStructures();
      setNewCommission({ productId: '', commission: 0, description: '' });
      setEditingCommission(null);
    }
  };

  const saveFixedCostStructure = async (data: any) => {
    const response = await fetch('/api/fixed-cost-structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        month: selectedMonth,
        year: selectedYear,
      }),
    });

    if (response.ok) {
      await fetchFixedCostStructures();
      setNewFixedCost({
        productId: '',
        costPerUnit: 0,
        costType: 'MANUAL',
        description: '',
      });
      setEditingFixedCost(null);
    }
  };

  const getMonthName = (month: number) => {
    return months.find((m) => m.value === month)?.label || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commission & Fixed Cost Management</DialogTitle>
          <DialogDescription>
            Manage commission structures and fixed costs for{' '}
            {getMonthName(selectedMonth)} {selectedYear}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="commission" className="space-y-4">
          <TabsList>
            <TabsTrigger value="commission">Commission Structures</TabsTrigger>
            <TabsTrigger value="fixed-costs">Fixed Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Commission Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="commission-product">Product</Label>
                    <Select
                      value={newCommission.productId}
                      onValueChange={(value) =>
                        setNewCommission({ ...newCommission, productId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.size}) -{' '}
                            {product.company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="commission-amount">Commission Amount</Label>
                    <Input
                      id="commission-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newCommission.commission}
                      onChange={(e) =>
                        setNewCommission({
                          ...newCommission,
                          commission: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => saveCommissionStructure(newCommission)}
                      disabled={
                        !newCommission.productId ||
                        newCommission.commission === 0
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="commission-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="commission-description"
                    value={newCommission.description}
                    onChange={(e) =>
                      setNewCommission({
                        ...newCommission,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Commission Structures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commissionStructures.map((structure) => (
                    <div
                      key={structure.id}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {structure.product.name} ({structure.product.size})
                        </div>
                        <div className="text-sm text-gray-500">
                          {structure.product.company.name}
                        </div>
                        {structure.description && (
                          <div className="mt-1 text-sm text-gray-600">
                            {structure.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          {formatCurrency(structure.commission)} per unit
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCommission(structure.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixed-costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Fixed Cost Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="fixed-cost-product">{t('product')}</Label>
                    <Select
                      value={newFixedCost.productId}
                      onValueChange={(value) =>
                        setNewFixedCost({
                          ...newFixedCost,
                          productId: value === 'global' ? '' : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">
                          Global Fixed Cost
                        </SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.size}) -{' '}
                            {product.company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fixed-cost-amount">Cost Per Unit</Label>
                    <Input
                      id="fixed-cost-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newFixedCost.costPerUnit}
                      onChange={(e) =>
                        setNewFixedCost({
                          ...newFixedCost,
                          costPerUnit: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixed-cost-type">Cost Type</Label>
                    <Select
                      value={newFixedCost.costType}
                      onValueChange={(value: 'MANUAL') =>
                        setNewFixedCost({ ...newFixedCost, costType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual Entry</SelectItem>
                        <SelectItem value="CALCULATED">
                          Auto Calculated
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() =>
                        saveFixedCostStructure({
                          ...newFixedCost,
                          productId: newFixedCost.productId || null,
                        })
                      }
                      disabled={newFixedCost.costPerUnit === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fixed-cost-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="fixed-cost-description"
                    value={newFixedCost.description}
                    onChange={(e) =>
                      setNewFixedCost({
                        ...newFixedCost,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Fixed Cost Structures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fixedCostStructures.map((structure) => (
                    <div
                      key={structure.id}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {structure.product
                            ? `${structure.product.name} (${structure.product.size})`
                            : 'Global Fixed Cost'}
                        </div>
                        {structure.product && (
                          <div className="text-sm text-gray-500">
                            {structure.product.company.name}
                          </div>
                        )}
                        {structure.description && (
                          <div className="mt-1 text-sm text-gray-600">
                            {structure.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            structure.costType === 'MANUAL'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {formatCurrency(structure.costPerUnit)} per unit
                        </Badge>
                        <Badge variant="outline">{structure.costType}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFixedCost(structure.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
