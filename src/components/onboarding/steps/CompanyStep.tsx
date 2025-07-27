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
import { Plus, X, Building2 } from 'lucide-react';

interface CompanyStepProps {
  data: Array<{ name: string }>;
  onUpdate: (companies: Array<{ name: string }>) => void;
}

export function CompanyStep({ data, onUpdate }: CompanyStepProps) {
  const { t } = useSettings();
  const [newCompanyName, setNewCompanyName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const addCompany = () => {
    if (!newCompanyName.trim()) {
      setErrors([t('companyNameRequired')]);
      return;
    }

    if (
      data.some(
        (company) => company.name.toLowerCase() === newCompanyName.toLowerCase()
      )
    ) {
      setErrors([t('companyAlreadyExists')]);
      return;
    }

    const newCompanies = [...data, { name: newCompanyName.trim() }];
    onUpdate(newCompanies);
    setNewCompanyName('');
    setErrors([]);
  };

  const removeCompany = (index: number) => {
    const newCompanies = data.filter((_, i) => i !== index);
    onUpdate(newCompanies);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCompany();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('addCompanyNames')}</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          {t('addCompaniesYouDistributeFor')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('addNewCompany')}</CardTitle>
          <CardDescription>{t('enterCompanyNamesLikeAygaz')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">{t('companyName')}</Label>
            <div className="flex gap-2">
              <Input
                id="companyName"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('enterCompanyName')}
                className={errors.length > 0 ? 'border-red-500' : ''}
              />
              <Button
                onClick={addCompany}
                disabled={!newCompanyName.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('add')}
              </Button>
            </div>
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {t('addedCompanies')}
              <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                {data.length}
              </span>
            </CardTitle>
            <CardDescription>{t('companiesYouDistributeFor')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.map((company, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{company.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompany(index)}
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

      {data.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          <Building2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>{t('noCompaniesAdded')}</p>
          <p className="text-sm">{t('addAtLeastOneCompany')}</p>
        </div>
      )}
    </div>
  );
}
