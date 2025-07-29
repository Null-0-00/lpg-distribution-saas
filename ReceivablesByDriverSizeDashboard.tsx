// React Component: Receivables by Driver and Size Dashboard
// This shows how to display and manage cylinder receivables tracking

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Package, TrendingUp, Filter } from 'lucide-react';

interface CylinderReceivable {
  size: string;
  quantity: number;
  customerName: string;
  createdAt: string;
}

interface DriverReceivables {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverType: string;
  cylinderReceivables: CylinderReceivable[];
  totalCylinders: number;
}

interface SizeReceivables {
  size: string;
  drivers: Array<{
    driverId: string;
    driverName: string;
    quantity: number;
  }>;
  totalQuantity: number;
  driverCount: number;
}

interface ReceivablesData {
  byDriver: DriverReceivables[];
  bySize: SizeReceivables[];
  summary: {
    totalDriversWithReceivables: number;
    totalCylinderSizes: number;
    totalCylinderReceivables: number;
    averageReceivablesPerDriver: number;
  };
}

export function ReceivablesByDriverSizeDashboard() {
  const [data, setData] = useState<ReceivablesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchDriver, setSearchDriver] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [activeTab, setActiveTab] = useState('by-driver');

  // Fetch receivables data
  useEffect(() => {
    fetchReceivablesData();
  }, [searchDriver, filterSize]);

  const fetchReceivablesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchDriver) params.append('driver', searchDriver);
      if (filterSize) params.append('size', filterSize);

      const response = await fetch(
        `/api/receivables/driver-size-breakdown?${params}`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching receivables data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchDriver('');
    setFilterSize('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading receivables data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        No receivables data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cylinder Receivables Tracking</h1>
          <p className="text-muted-foreground">
            Track cylinder receivables by driver and size
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalDriversWithReceivables}
            </div>
            <p className="text-muted-foreground text-xs">with receivables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cylinder Sizes
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalCylinderSizes}
            </div>
            <p className="text-muted-foreground text-xs">different sizes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receivables
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalCylinderReceivables}
            </div>
            <p className="text-muted-foreground text-xs">cylinders owed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average per Driver
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.averageReceivablesPerDriver}
            </div>
            <p className="text-muted-foreground text-xs">cylinders/driver</p>
          </CardContent>
        </Card>
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
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
                <Input
                  placeholder="Search by driver name..."
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Select value={filterSize} onValueChange={setFilterSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by cylinder size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sizes</SelectItem>
                  {data.bySize.map((size) => (
                    <SelectItem key={size.size} value={size.size}>
                      {size.size} ({size.totalQuantity} cylinders)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-driver">By Driver</TabsTrigger>
          <TabsTrigger value="by-size">By Size</TabsTrigger>
        </TabsList>

        {/* By Driver Tab */}
        <TabsContent value="by-driver" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.byDriver.map((driver) => (
              <Card key={driver.driverId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{driver.driverName}</span>
                    <Badge variant="secondary">
                      {driver.totalCylinders} total
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {driver.driverPhone && <span>{driver.driverPhone} • </span>}
                    <span className="capitalize">
                      {driver.driverType?.toLowerCase()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {driver.cylinderReceivables.map((receivable, index) => (
                      <div
                        key={index}
                        className="bg-muted flex items-center justify-between rounded p-2"
                      >
                        <span className="font-medium">{receivable.size}</span>
                        <Badge variant="outline">
                          {receivable.quantity} cylinders
                        </Badge>
                      </div>
                    ))}
                    {driver.cylinderReceivables.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No cylinder receivables
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* By Size Tab */}
        <TabsContent value="by-size" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.bySize.map((size) => (
              <Card key={size.size}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{size.size}</span>
                    <Badge variant="secondary">
                      {size.totalQuantity} total
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {size.driverCount} driver{size.driverCount !== 1 ? 's' : ''}{' '}
                    with receivables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {size.drivers.map((driver, index) => (
                      <div
                        key={index}
                        className="bg-muted flex items-center justify-between rounded p-2"
                      >
                        <span className="font-medium">{driver.driverName}</span>
                        <Badge variant="outline">
                          {driver.quantity} cylinders
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Usage in your main dashboard or receivables page:
// <ReceivablesByDriverSizeDashboard />
