'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useSettings();
  const [formData, setFormData] = useState({
    // Tenant Info
    tenantName: '',
    subdomain: '',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    subscriptionPlan: 'PROFESSIONAL',

    // Admin User Info
    userName: '',
    userEmail: '',
    userPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/onboard-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t('businessOnboardedSuccessfully'),
          description: `${formData.tenantName} has been created with admin user ${formData.userEmail}`,
        });

        // Reset form
        setFormData({
          tenantName: '',
          subdomain: '',
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          subscriptionPlan: 'PROFESSIONAL',
          userName: '',
          userEmail: '',
          userPassword: '',
        });
      } else {
        toast({
          title: t('error'),
          description: result.error || t('failedToOnboardBusiness'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('networkErrorOccurred'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{t('manualBusinessOnboarding')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('businessInformation')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenantName">{t('businessName')} *</Label>
                  <Input
                    id="tenantName"
                    value={formData.tenantName}
                    onChange={(e) =>
                      handleInputChange('tenantName', e.target.value)
                    }
                    placeholder={t('businessNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subdomain">{t('subdomain')} *</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) =>
                      handleInputChange(
                        'subdomain',
                        e.target.value.toLowerCase()
                      )
                    }
                    placeholder={t('subdomainPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">{t('currency')}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleInputChange('currency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">{t('timezone')}</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      handleInputChange('timezone', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subscriptionPlan">{t('plan')}</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) =>
                      handleInputChange('subscriptionPlan', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREEMIUM">{t('freemium')}</SelectItem>
                      <SelectItem value="PROFESSIONAL">
                        {t('professional')}
                      </SelectItem>
                      <SelectItem value="ENTERPRISE">
                        {t('enterprise')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Admin User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('adminUser')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">{t('adminName')} *</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) =>
                      handleInputChange('userName', e.target.value)
                    }
                    placeholder={t('adminNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="userEmail">{t('adminEmail')} *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) =>
                      handleInputChange('userEmail', e.target.value)
                    }
                    placeholder={t('adminEmailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="userPassword">{t('adminPassword')} *</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={formData.userPassword}
                  onChange={(e) =>
                    handleInputChange('userPassword', e.target.value)
                  }
                  placeholder={t('strongPassword')}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('creatingBusiness') : t('onboardBusiness')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
