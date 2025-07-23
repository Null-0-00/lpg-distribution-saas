'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Users,
  Building2,
  Package,
  MapPin,
  Calendar,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface Company {
  id: string;
  name: string;
  code?: string;
}

interface Product {
  id: string;
  name: string;
  size: string;
}

interface Assignment {
  id: string;
  territory?: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  tenant: Tenant;
  company?: Company;
  product?: Product;
  assignedByUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface AssignmentFormData {
  tenantId: string;
  companyId: string;
  productId: string;
  territory: string;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
}

export default function AdminDistributorAssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [distributors, setDistributors] = useState<Tenant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [territories, setTerritories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterTerritory, setFilterTerritory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    tenantId: '',
    companyId: '',
    productId: '',
    territory: '',
    effectiveDate: new Date().toISOString().split('T')[0] ?? '',
    expiryDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchAssignments();
  }, [
    session,
    status,
    router,
    page,
    filterTenant,
    filterCompany,
    filterTerritory,
    filterActive,
  ]);

  useEffect(() => {
    if (formData.companyId) {
      fetchProducts(formData.companyId);
    } else {
      setAvailableProducts([]);
    }
  }, [formData.companyId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filterTenant !== 'all' && { tenantId: filterTenant }),
        ...(filterCompany !== 'all' && { companyId: filterCompany }),
        ...(filterTerritory !== 'all' && { territory: filterTerritory }),
        ...(filterActive !== 'all' && { isActive: filterActive }),
      });

      const response = await fetch(
        `/api/admin/distributor-assignments?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setAssignments(result.data.assignments);
        setTotalPages(result.data.pagination.totalPages);
        setDistributors(result.data.distributors);
        setCompanies(result.data.companies);
        setTerritories(result.data.territories);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch assignments',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (companyId: string) => {
    try {
      const response = await fetch(
        `/api/admin/products?companyId=${companyId}&limit=100`
      );
      const result = await response.json();

      if (result.success) {
        setAvailableProducts(result.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      companyId: '',
      productId: '',
      territory: '',
      effectiveDate: new Date().toISOString().split('T')[0] ?? '',
      expiryDate: '',
      notes: '',
    });
    setAvailableProducts([]);
  };

  const handleCreate = () => {
    resetForm();
    setSelectedAssignment(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setFormData({
      tenantId: assignment.tenant.id,
      companyId: assignment.company?.id ?? '',
      productId: assignment.product?.id ?? '',
      territory: assignment.territory ?? '',
      effectiveDate: assignment.effectiveDate.split('T')[0] ?? '',
      expiryDate: assignment.expiryDate?.split('T')[0] ?? '',
      notes: assignment.notes ?? '',
    });
    setSelectedAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        tenantId: formData.tenantId,
        companyId: formData.companyId || null,
        productId: formData.productId || null,
        territory: formData.territory || null,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || null,
        notes: formData.notes || null,
      };

      const url = selectedAssignment
        ? `/api/admin/distributor-assignments/${selectedAssignment.id}`
        : '/api/admin/distributor-assignments';

      const method = selectedAssignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        fetchAssignments();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save assignment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (assignment: Assignment) => {
    try {
      const response = await fetch(
        `/api/admin/distributor-assignments/${assignment.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !assignment.isActive }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Assignment ${assignment.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchAssignments();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update assignment status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update assignment status',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === 'loading' || !session) {
    return <div>Loading...</div>;
  }

  if (session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Distributor Assignments</h1>
          <p className="text-muted-foreground">
            Manage company and product assignments to distributors
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Select value={filterTenant} onValueChange={setFilterTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by distributor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distributors</SelectItem>
                {distributors.map((distributor) => (
                  <SelectItem key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </SelectItem>
                ))}
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

            <Select value={filterTerritory} onValueChange={setFilterTerritory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by territory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Territories</SelectItem>
                {territories.map((territory) => (
                  <SelectItem key={territory} value={territory}>
                    {territory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button variant="outline" onClick={fetchAssignments}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No assignments found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first distributor assignment.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      {assignment.tenant.name}
                    </CardTitle>
                    <CardDescription>
                      @{assignment.tenant.subdomain}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={assignment.isActive ? 'default' : 'secondary'}
                  >
                    {assignment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Company:</span>
                    <span>{assignment.company.name}</span>
                    {assignment.company.code && (
                      <Badge variant="outline" className="text-xs">
                        {assignment.company.code}
                      </Badge>
                    )}
                  </div>
                )}

                {assignment.product && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Product:</span>
                    <span>
                      {assignment.product.name} ({assignment.product.size})
                    </span>
                  </div>
                )}

                {assignment.territory && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Territory:</span>
                    <span>{assignment.territory}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Effective:</span>
                  <span>{formatDate(assignment.effectiveDate)}</span>
                  {assignment.expiryDate && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span>{formatDate(assignment.expiryDate)}</span>
                    </>
                  )}
                </div>

                {assignment.notes && (
                  <div className="text-muted-foreground bg-muted/30 rounded p-2 text-sm">
                    {assignment.notes}
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-2">
                  <div className="text-muted-foreground text-xs">
                    Created by {assignment.assignedByUser.name}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(assignment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}
            </DialogTitle>
            <DialogDescription>
              {selectedAssignment
                ? 'Update distributor assignment details.'
                : 'Assign companies and products to distributors.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantId">Distributor *</Label>
              <Select
                value={formData.tenantId}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenantId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distributor" />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((distributor) => (
                    <SelectItem key={distributor.id} value={distributor.id}>
                      {distributor.name} (@{distributor.subdomain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Company (Optional)</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      companyId: value,
                      productId: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} {company.code && `(${company.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">Product (Optional)</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                  disabled={!formData.companyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="territory">Territory</Label>
              <Input
                id="territory"
                value={formData.territory}
                onChange={(e) =>
                  setFormData({ ...formData, territory: e.target.value })
                }
                placeholder="e.g., Dhaka North, Chittagong"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes or conditions"
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
                {submitting
                  ? 'Saving...'
                  : selectedAssignment
                    ? 'Update'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
