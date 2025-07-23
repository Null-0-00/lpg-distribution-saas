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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Building2,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  territory?: string;
  contactInfo?: any;
  businessTerms?: any;
  supplierInfo?: any;
  analytics?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    purchases: number;
    shipments: number;
  };
  distributorAssignments: Array<{
    tenant: { id: string; name: string };
  }>;
  companyPricingTiers: Array<{
    id: string;
    tierName: string;
    discountPercent: number;
  }>;
}

interface CompanyFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  territory: string;
  contactInfo: string;
  businessTerms: string;
  supplierInfo: string;
  analytics: string;
}

export default function AdminCompaniesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterTerritory, setFilterTerritory] = useState<string>('all');
  const [territories, setTerritories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    territory: '',
    contactInfo: '',
    businessTerms: '',
    supplierInfo: '',
    analytics: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchCompanies();
  }, [
    session,
    status,
    router,
    page,
    searchTerm,
    filterActive,
    filterTerritory,
  ]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterActive !== 'all' && { isActive: filterActive }),
        ...(filterTerritory !== 'all' && { territory: filterTerritory }),
      });

      const response = await fetch(`/api/admin/companies?${params}`);
      const result = await response.json();

      if (result.success) {
        setCompanies(result.data.companies);
        setTotalPages(result.data.pagination.totalPages);
        setTerritories(result.data.territories);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch companies',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      territory: '',
      contactInfo: '',
      businessTerms: '',
      supplierInfo: '',
      analytics: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setSelectedCompany(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      code: company.code || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      territory: company.territory || '',
      contactInfo: company.contactInfo
        ? JSON.stringify(company.contactInfo, null, 2)
        : '',
      businessTerms: company.businessTerms
        ? JSON.stringify(company.businessTerms, null, 2)
        : '',
      supplierInfo: company.supplierInfo
        ? JSON.stringify(company.supplierInfo, null, 2)
        : '',
      analytics: company.analytics
        ? JSON.stringify(company.analytics, null, 2)
        : '',
    });
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        contactInfo: formData.contactInfo
          ? JSON.parse(formData.contactInfo)
          : null,
        businessTerms: formData.businessTerms
          ? JSON.parse(formData.businessTerms)
          : null,
        supplierInfo: formData.supplierInfo
          ? JSON.parse(formData.supplierInfo)
          : null,
        analytics: formData.analytics ? JSON.parse(formData.analytics) : null,
      };

      const url = selectedCompany
        ? `/api/admin/companies/${selectedCompany.id}`
        : '/api/admin/companies';

      const method = selectedCompany ? 'PUT' : 'POST';

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
        fetchCompanies();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save company',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save company',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (company: Company) => {
    try {
      const response = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !company.isActive }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Company ${company.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchCompanies();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update company status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company status',
        variant: 'destructive',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">
            Manage LPG companies and suppliers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search companies..."
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
            <Button variant="outline" onClick={fetchCompanies}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : companies.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No companies found</h3>
            <p className="text-muted-foreground">
              Get started by adding your first company.
            </p>
          </div>
        ) : (
          companies.map((company) => (
            <Card
              key={company.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5" />
                      {company.name}
                    </CardTitle>
                    {company.code && (
                      <CardDescription>Code: {company.code}</CardDescription>
                    )}
                  </div>
                  <Badge variant={company.isActive ? 'default' : 'secondary'}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.territory && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {company.territory}
                  </div>
                )}
                {company.phone && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </div>
                )}
                {company.email && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center">
                  <div>
                    <div className="font-semibold">
                      {company._count.products}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Products
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {company._count.purchases}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Purchases
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {company.distributorAssignments.length}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Distributors
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(company)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(company)}
                  >
                    {company.isActive ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Edit Company' : 'Create Company'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany
                ? 'Update company information and settings.'
                : 'Add a new LPG company to the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Company Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information (JSON)</Label>
              <Textarea
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
                placeholder='{"primaryContact": "John Doe", "department": "Sales"}'
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessTerms">Business Terms (JSON)</Label>
              <Textarea
                id="businessTerms"
                value={formData.businessTerms}
                onChange={(e) =>
                  setFormData({ ...formData, businessTerms: e.target.value })
                }
                placeholder='{"paymentTerms": "NET30", "creditLimit": 100000}'
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierInfo">Supplier Information (JSON)</Label>
              <Textarea
                id="supplierInfo"
                value={formData.supplierInfo}
                onChange={(e) =>
                  setFormData({ ...formData, supplierInfo: e.target.value })
                }
                placeholder='{"supplierType": "Primary", "contractDate": "2024-01-01"}'
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analytics">Analytics (JSON)</Label>
              <Textarea
                id="analytics"
                value={formData.analytics}
                onChange={(e) =>
                  setFormData({ ...formData, analytics: e.target.value })
                }
                placeholder='{"marketShare": 25, "growthRate": 15}'
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
                  : selectedCompany
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
