'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, Eye, Filter, Package, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code?: string;
}

interface Product {
  id: string;
  name: string;
  size: string;
  fullCylinderWeight?: number;
  emptyCylinderWeight?: number;
  currentPrice: number;
  costPrice?: number;
  marketPrice?: number;
  lowStockThreshold: number;
  specifications?: any;
  performanceMetrics?: any;
  analytics?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: Company;
  _count: {
    sales: number;
    purchases: number;
    inventoryMovements: number;
  };
  distributorAssignments: Array<{
    tenant: { id: string; name: string };
  }>;
  productPricingTiers: Array<{
    id: string;
    tierName: string;
    price: number;
    marginPercent?: number;
  }>;
}

interface ProductFormData {
  companyId: string;
  name: string;
  size: string;
  fullCylinderWeight: string;
  emptyCylinderWeight: string;
  currentPrice: string;
  costPrice: string;
  marketPrice: string;
  lowStockThreshold: string;
  specifications: string;
  performanceMetrics: string;
  analytics: string;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    companyId: '',
    name: '',
    size: '',
    fullCylinderWeight: '',
    emptyCylinderWeight: '',
    currentPrice: '',
    costPrice: '',
    marketPrice: '',
    lowStockThreshold: '10',
    specifications: '',
    performanceMetrics: '',
    analytics: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchProducts();
  }, [session, status, router, page, searchTerm, filterActive, filterCompany]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterActive !== 'all' && { isActive: filterActive }),
        ...(filterCompany !== 'all' && { companyId: filterCompany })
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
        setTotalPages(result.data.pagination.totalPages);
        setCompanies(result.data.companies);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch products',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      name: '',
      size: '',
      fullCylinderWeight: '',
      emptyCylinderWeight: '',
      currentPrice: '',
      costPrice: '',
      marketPrice: '',
      lowStockThreshold: '10',
      specifications: '',
      performanceMetrics: '',
      analytics: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setSelectedProduct(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      companyId: product.company.id,
      name: product.name,
      size: product.size,
      fullCylinderWeight: product.fullCylinderWeight?.toString() || '',
      emptyCylinderWeight: product.emptyCylinderWeight?.toString() || '',
      currentPrice: product.currentPrice.toString(),
      costPrice: product.costPrice?.toString() || '',
      marketPrice: product.marketPrice?.toString() || '',
      lowStockThreshold: product.lowStockThreshold.toString(),
      specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '',
      performanceMetrics: product.performanceMetrics ? JSON.stringify(product.performanceMetrics, null, 2) : '',
      analytics: product.analytics ? JSON.stringify(product.analytics, null, 2) : ''
    });
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        companyId: formData.companyId,
        name: formData.name,
        size: formData.size,
        fullCylinderWeight: formData.fullCylinderWeight ? parseFloat(formData.fullCylinderWeight) : null,
        emptyCylinderWeight: formData.emptyCylinderWeight ? parseFloat(formData.emptyCylinderWeight) : null,
        currentPrice: parseFloat(formData.currentPrice),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        marketPrice: formData.marketPrice ? parseFloat(formData.marketPrice) : null,
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        specifications: formData.specifications ? JSON.parse(formData.specifications) : null,
        performanceMetrics: formData.performanceMetrics ? JSON.parse(formData.performanceMetrics) : null,
        analytics: formData.analytics ? JSON.parse(formData.analytics) : null
      };

      const url = selectedProduct 
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      
      const method = selectedProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        });
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        fetchProducts();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save product',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Product ${product.isActive ? 'deactivated' : 'activated'} successfully`
        });
        fetchProducts();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update product status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive'
      });
    }
  };


  if (status === 'loading' || !session) {
    return <div>Loading...</div>;
  }

  if (session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage product variants and pricing</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchProducts}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">Get started by adding your first product.</p>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      {product.company.name} • {product.size}
                    </CardDescription>
                  </div>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="font-semibold">{formatCurrency(product.currentPrice)}</span>
                  </div>
                  {product.costPrice && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost Price</span>
                      <span className="text-sm">{formatCurrency(product.costPrice)}</span>
                    </div>
                  )}
                  {product.marketPrice && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Market Price</span>
                      <span className="text-sm">{formatCurrency(product.marketPrice)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center border-t pt-4">
                  <div>
                    <div className="font-semibold">{product._count.sales}</div>
                    <div className="text-xs text-muted-foreground">Sales</div>
                  </div>
                  <div>
                    <div className="font-semibold">{product._count.purchases}</div>
                    <div className="text-xs text-muted-foreground">Purchases</div>
                  </div>
                  <div>
                    <div className="font-semibold">{product.distributorAssignments.length}</div>
                    <div className="text-xs text-muted-foreground">Distributors</div>
                  </div>
                </div>

                {product.productPricingTiers.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Pricing Tiers</div>
                    {product.productPricingTiers.slice(0, 2).map((tier) => (
                      <div key={tier.id} className="flex justify-between text-sm">
                        <span>{tier.tierName}</span>
                        <span>{formatCurrency(tier.price)}</span>
                      </div>
                    ))}
                    {product.productPricingTiers.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{product.productPricingTiers.length - 2} more tiers
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.isActive ? <Trash2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Create Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Update product information and settings.'
                : 'Add a new product variant to the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Company *</Label>
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} {company.code && `(${company.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g., 12L, 35L"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullCylinderWeight">Full Weight (kg)</Label>
                <Input
                  id="fullCylinderWeight"
                  type="number"
                  step="0.1"
                  value={formData.fullCylinderWeight}
                  onChange={(e) => setFormData({ ...formData, fullCylinderWeight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emptyCylinderWeight">Empty Weight (kg)</Label>
                <Input
                  id="emptyCylinderWeight"
                  type="number"
                  step="0.1"
                  value={formData.emptyCylinderWeight}
                  onChange={(e) => setFormData({ ...formData, emptyCylinderWeight: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketPrice">Market Price</Label>
                <Input
                  id="marketPrice"
                  type="number"
                  step="0.01"
                  value={formData.marketPrice}
                  onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Specifications (JSON)</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder='{"material": "Steel", "valveType": "Auto", "safety": "BCGA approved"}'
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performanceMetrics">Performance Metrics (JSON)</Label>
              <Textarea
                id="performanceMetrics"
                value={formData.performanceMetrics}
                onChange={(e) => setFormData({ ...formData, performanceMetrics: e.target.value })}
                placeholder='{"salesVelocity": 150, "marketShare": 15, "profitMargin": 25}'
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analytics">Analytics (JSON)</Label>
              <Textarea
                id="analytics"
                value={formData.analytics}
                onChange={(e) => setFormData({ ...formData, analytics: e.target.value })}
                placeholder='{"monthlyTrends": [], "seasonalPatterns": {}}'
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (selectedProduct ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}