'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Package, Cylinder } from 'lucide-react';

interface ProductStepProps {
  companies: Array<{ name: string }>;
  cylinderSizes: Array<{ size: string; description?: string }>;
  products: Array<{
    name: string;
    companyId: string;
    cylinderSizeId: string;
    currentPrice: number;
  }>;
  onUpdateSizes: (sizes: Array<{ size: string; description?: string }>) => void;
  onUpdateProducts: (
    products: Array<{
      name: string;
      companyId: string;
      cylinderSizeId: string;
      currentPrice: number;
    }>
  ) => void;
}

export function ProductStep({
  companies,
  cylinderSizes,
  products,
  onUpdateSizes,
  onUpdateProducts,
}: ProductStepProps) {
  const { t } = useSettings();

  // Cylinder size state
  const [newCylinderSize, setNewCylinderSize] = useState('');
  const [newCylinderDescription, setNewCylinderDescription] = useState('');
  const [cylinderErrors, setCylinderErrors] = useState<string[]>([]);

  // Product state
  const [newProductName, setNewProductName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCylinderSizeId, setSelectedCylinderSizeId] = useState('');
  const [productErrors, setProductErrors] = useState<string[]>([]);

  const addCylinderSize = () => {
    if (!newCylinderSize.trim()) {
      setCylinderErrors([t('cylinderSizeRequired')]);
      return;
    }

    if (
      cylinderSizes.some(
        (size) => size.size.toLowerCase() === newCylinderSize.toLowerCase()
      )
    ) {
      setCylinderErrors([t('cylinderSizeAlreadyExists')]);
      return;
    }

    const newSizes = [
      ...cylinderSizes,
      {
        size: newCylinderSize.trim(),
        description: newCylinderDescription.trim() || undefined,
      },
    ];
    onUpdateSizes(newSizes);
    setNewCylinderSize('');
    setNewCylinderDescription('');
    setCylinderErrors([]);
  };

  const removeCylinderSize = (index: number) => {
    const newSizes = cylinderSizes.filter((_, i) => i !== index);
    onUpdateSizes(newSizes);
  };

  const addProduct = () => {
    const errors: string[] = [];

    if (!newProductName.trim()) {
      errors.push(t('productNameRequired'));
    }
    if (!selectedCompanyId) {
      errors.push(t('companyRequired'));
    }
    if (!selectedCylinderSizeId) {
      errors.push(t('cylinderSizeRequired'));
    }

    if (errors.length > 0) {
      setProductErrors(errors);
      return;
    }

    if (
      products.some(
        (product) =>
          product.name.toLowerCase() === newProductName.toLowerCase() &&
          product.companyId === selectedCompanyId &&
          product.cylinderSizeId === selectedCylinderSizeId
      )
    ) {
      setProductErrors([t('productAlreadyExists')]);
      return;
    }

    const newProducts = [
      ...products,
      {
        name: newProductName.trim(),
        companyId: selectedCompanyId,
        cylinderSizeId: selectedCylinderSizeId,
        currentPrice: 0, // Default price, can be set later in product management
      },
    ];
    onUpdateProducts(newProducts);
    setNewProductName('');
    setSelectedCompanyId('');
    setSelectedCylinderSizeId('');
    setProductErrors([]);
  };

  const removeProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    onUpdateProducts(newProducts);
  };

  const getCompanyName = (companyId: string) => {
    const companyIndex = parseInt(companyId);
    return companies[companyIndex]?.name || '';
  };

  const getCylinderSize = (cylinderSizeId: string) => {
    const sizeIndex = parseInt(cylinderSizeId);
    return cylinderSizes[sizeIndex]?.size || '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Package className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('setupProductsAndSizes')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('configureCylinderSizesAndProducts')}
        </p>
      </div>

      <Tabs defaultValue="sizes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sizes" className="flex items-center gap-2">
            <Cylinder className="h-4 w-4" />
            {t('cylinderSizes')}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('products')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('addCylinderSize')}</CardTitle>
              <CardDescription>{t('addSizesLike12L20L')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cylinderSize">{t('size')} *</Label>
                  <Input
                    id="cylinderSize"
                    value={newCylinderSize}
                    onChange={(e) => setNewCylinderSize(e.target.value)}
                    placeholder={t('enterSizeLike12L')}
                    className={
                      cylinderErrors.length > 0 ? 'border-red-500' : ''
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cylinderDescription">
                    {t('description')} ({t('optional')})
                  </Label>
                  <Input
                    id="cylinderDescription"
                    value={newCylinderDescription}
                    onChange={(e) => setNewCylinderDescription(e.target.value)}
                    placeholder={t('enterDescription')}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={addCylinderSize}
                  disabled={!newCylinderSize.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('addSize')}
                </Button>
              </div>
              {cylinderErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </CardContent>
          </Card>

          {cylinderSizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {t('cylinderSizes')}
                  <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">
                    {cylinderSizes.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {cylinderSizes.map((size, index) => (
                    <div
                      key={index}
                      className="bg-muted flex items-center justify-between rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Cylinder className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <span className="font-medium">{size.size}</span>
                          {size.description && (
                            <p className="text-muted-foreground text-sm">
                              {size.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCylinderSize(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('addProduct')}</CardTitle>
              <CardDescription>
                {t('addProductsForEachCompany')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="productName">{t('productName')} *</Label>
                  <Input
                    id="productName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder={t('enterProductName')}
                    className={productErrors.length > 0 ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('company')} *</Label>
                  <Select
                    value={selectedCompanyId}
                    onValueChange={setSelectedCompanyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCompany')} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cylinderSize">{t('cylinderSize')} *</Label>
                  <Select
                    value={selectedCylinderSizeId}
                    onValueChange={setSelectedCylinderSizeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCylinderSize')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cylinderSizes.map((size, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {size.size}{' '}
                          {size.description && `(${size.description})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={addProduct}
                  disabled={
                    !newProductName.trim() ||
                    !selectedCompanyId ||
                    !selectedCylinderSizeId
                  }
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('addProduct')}
                </Button>
              </div>
              {productErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </CardContent>
          </Card>

          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {t('addedProducts')}
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                    {products.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="bg-muted flex items-center justify-between rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {getCompanyName(product.companyId)} •{' '}
                            {getCylinderSize(product.cylinderSizeId)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {(cylinderSizes.length === 0 || products.length === 0) && (
        <div className="text-muted-foreground py-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('addCylinderSizesAndProducts')}</p>
          <p className="text-sm">{t('bothRequiredToProceed')}</p>
        </div>
      )}
    </div>
  );
}
