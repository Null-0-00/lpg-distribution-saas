'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CompanyStep } from './steps/CompanyStep';
import { ProductStep } from './steps/ProductStep';
import { InventoryStep } from './steps/InventoryStep';
import { EmptyCylindersStep } from './steps/EmptyCylindersStep';
import { DriversStep } from './steps/DriversStep';
import { ReceivablesStep } from './steps/ReceivablesStep';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export interface OnboardingData {
  companies: Array<{ name: string }>;
  cylinderSizes: Array<{ size: string; description?: string }>;
  products: Array<{
    name: string;
    companyId: string;
    cylinderSizeId: string;
    currentPrice: number;
  }>;
  inventory: Array<{
    productId: string;
    fullCylinders: number;
  }>;
  emptyCylinders: Array<{
    cylinderSizeId: string;
    quantity: number;
  }>;
  drivers: Array<{
    name: string;
    phone?: string;
    driverType?: string;
  }>;
  receivables: Array<{
    driverId: string;
    cashReceivables: number;
    cylinderReceivables: number;
    cylinderReceivablesBySizes?: Array<{
      cylinderSizeId: string;
      size: string;
      quantity: number;
    }>;
  }>;
}

const STEPS = [
  'companies',
  'products',
  'inventory',
  'emptyCylinders',
  'drivers',
  'receivables',
] as const;

type Step = (typeof STEPS)[number];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const { t } = useSettings();
  const [currentStep, setCurrentStep] = useState<Step>('companies');
  const [onboardingStatus, setOnboardingStatus] = useState<{
    completed: boolean;
    loading: boolean;
  }>({ completed: false, loading: true });
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companies: [],
    cylinderSizes: [],
    products: [],
    inventory: [],
    emptyCylinders: [],
    drivers: [],
    receivables: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check onboarding status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkOnboardingStatus();
    }
  }, [isOpen]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus({
          completed: data.completed,
          loading: false,
        });

        // If onboarding is already completed, close the modal
        if (data.completed) {
          onClose();
        }
      } else {
        setOnboardingStatus({ completed: false, loading: false });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus({ completed: false, loading: false });
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 'companies':
        return t('companyNames');
      case 'products':
        return t('productSetup');
      case 'inventory':
        return t('inventoryQuantities');
      case 'emptyCylinders':
        return t('emptyCylinders');
      case 'drivers':
        return t('driversSetup');
      case 'receivables':
        return t('receivablesSetup');
      default:
        return '';
    }
  };

  const updateOnboardingData = <K extends keyof OnboardingData>(
    key: K,
    data: OnboardingData[K]
  ) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'companies':
        return onboardingData.companies.length > 0;
      case 'products':
        return (
          onboardingData.products.length > 0 &&
          onboardingData.cylinderSizes.length > 0
        );
      case 'inventory':
        return onboardingData.inventory.length > 0;
      case 'emptyCylinders':
        return onboardingData.emptyCylinders.length > 0;
      case 'drivers':
        return onboardingData.drivers.length > 0;
      case 'receivables':
        return onboardingData.receivables.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (response.ok) {
        onComplete();
        onClose();
      } else {
        const errorData = await response.text();
        console.error('Onboarding API error:', errorData);
        throw new Error(`Failed to complete onboarding: ${errorData}`);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'companies':
        return (
          <CompanyStep
            data={onboardingData.companies}
            onUpdate={(companies) =>
              updateOnboardingData('companies', companies)
            }
          />
        );
      case 'products':
        return (
          <ProductStep
            companies={onboardingData.companies}
            cylinderSizes={onboardingData.cylinderSizes}
            products={onboardingData.products}
            onUpdateSizes={(sizes) =>
              updateOnboardingData('cylinderSizes', sizes)
            }
            onUpdateProducts={(products) =>
              updateOnboardingData('products', products)
            }
          />
        );
      case 'inventory':
        return (
          <InventoryStep
            products={onboardingData.products}
            inventory={onboardingData.inventory}
            onUpdate={(inventory) =>
              updateOnboardingData('inventory', inventory)
            }
          />
        );
      case 'emptyCylinders':
        return (
          <EmptyCylindersStep
            cylinderSizes={onboardingData.cylinderSizes}
            emptyCylinders={onboardingData.emptyCylinders}
            onUpdate={(emptyCylinders) =>
              updateOnboardingData('emptyCylinders', emptyCylinders)
            }
          />
        );
      case 'drivers':
        return (
          <DriversStep
            drivers={onboardingData.drivers}
            onUpdate={(drivers) => updateOnboardingData('drivers', drivers)}
          />
        );
      case 'receivables':
        return (
          <ReceivablesStep
            drivers={onboardingData.drivers}
            receivables={onboardingData.receivables}
            cylinderSizes={onboardingData.cylinderSizes}
            onUpdate={(receivables) =>
              updateOnboardingData('receivables', receivables)
            }
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Don't render modal if onboarding is already completed
  if (onboardingStatus.completed) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        {/* Fixed Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b p-6">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {t('welcomeToOnboarding')}
            </DialogTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('setupYourBusinessData')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Fixed Progress Section */}
        <div className="flex-shrink-0 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium">
              {getStepTitle(currentStep)}
            </div>
            <div className="text-muted-foreground text-sm">
              {currentStepIndex + 1} {t('of')} {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Scrollable Content Area */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-4">{renderCurrentStep()}</div>
        </div>

        {/* Fixed Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('previous')}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('skipOnboarding')}
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleFinish}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? t('completing') : t('completeSetup')}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {t('next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
