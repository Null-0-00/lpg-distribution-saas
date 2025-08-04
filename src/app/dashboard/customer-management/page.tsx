'use client';

import { useState } from 'react';
import {
  Users,
  MapPin,
  Calculator,
  Settings,
  TrendingUp,
  Phone,
  MessageSquare,
  BarChart3,
  Plus,
} from 'lucide-react';
import AreaManagement from '@/components/areas/AreaManagement';
import CustomerManagement from '@/components/customers/CustomerManagement';
import CustomerReceivablesForm from '@/components/customers/CustomerReceivablesForm';
import CustomerReceivablesDisplay from '@/components/customers/CustomerReceivablesDisplay';
import MessagingMetrics from '@/components/messaging/MessagingMetrics';
import MessageLog from '@/components/messaging/MessageLog';
import { useSettings } from '@/contexts/SettingsContext';

type TabType = 'areas' | 'customers' | 'receivables' | 'messaging';

export default function CustomerManagementPage() {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('areas');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [isReceivablesFormOpen, setIsReceivablesFormOpen] = useState(false);

  const tabs = [
    {
      id: 'areas' as TabType,
      name: t('areaManagement'),
      icon: MapPin,
      description: t('organizeCustomersByGeographicalAreas'),
    },
    {
      id: 'customers' as TabType,
      name: t('customerManagementTab'),
      icon: Users,
      description: t('addAndManageCustomers'),
    },
    {
      id: 'receivables' as TabType,
      name: t('customerReceivables'),
      icon: Calculator,
      description: t('updateCustomerReceivables'),
    },
    {
      id: 'messaging' as TabType,
      name: t('messagingSettings'),
      icon: MessageSquare,
      description: t('configureAutomatedMessages'),
    },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
  };

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    // Auto-switch to customers tab when area is selected
    if (activeTab === 'areas') {
      setActiveTab('customers');
    }
  };

  const handleReceivablesSuccess = () => {
    // Could trigger a refresh or show success message
    console.log('Receivables updated successfully');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('customerAndAreaManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('manageAreasCustomersAndAutomatedMessaging')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-muted-foreground text-sm">
              {t('automatedMessagingEnabled')}
            </span>
          </div>
        </div>
      </div>

      {/* Workflow Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start">
          <Phone className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              {t('automatedCustomerMessagingWorkflow')}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <p>
                • <strong>Step 1:</strong>{' '}
                {t('createAndManageAreasForGeographicalOrganization')}
              </p>
              <p>
                • <strong>Step 2:</strong>{' '}
                {t('addCustomersToAreasWithPhoneNumbers')}
              </p>
              <p>
                • <strong>Step 3:</strong>{' '}
                {t('updateCustomerReceivablesMessagesAutomaticallySent')}
              </p>
              <p>
                • <strong>Messaging:</strong>{' '}
                {t('whatsappSmsNotificationsSentOnReceivablesChange')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'areas' && (
            <AreaManagement
              onAreaSelect={handleAreaSelect}
              selectedAreaId={selectedAreaId}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              selectedAreaId={selectedAreaId}
              onAreaChange={setSelectedAreaId}
              showAreaSelector={true}
            />
          )}

          {activeTab === 'receivables' && (
            <CustomerReceivablesDisplay onUpdateReceivables={() => {}} />
          )}

          {activeTab === 'messaging' && (
            <div className="space-y-6">
              {/* Messaging Metrics */}
              <div className="bg-card rounded-lg border p-6">
                <MessagingMetrics />
              </div>

              {/* Message Log */}
              <div className="bg-card rounded-lg border p-6">
                <MessageLog />
              </div>

              {/* Messaging Configuration */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-foreground mb-4 text-lg font-semibold">
                  {t('messagingConfiguration')}
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-foreground mb-3 font-medium">
                      {t('whatsappSettings')}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <span className="text-sm">
                          {t('receivablesUpdates')}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {t('active')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <span className="text-sm">
                          {t('paymentConfirmations')}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {t('active')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <span className="text-sm">
                          {t('cylinderReturnConfirmations')}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {t('active')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-foreground mb-3 font-medium">
                      {t('smsSettings')}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <span className="text-sm">{t('backupMessaging')}</span>
                        <span className="text-sm font-medium text-blue-600">
                          {t('active')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <span className="text-sm">
                          {t('bangladeshProviders')}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {t('configured')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <span className="text-sm">{t('messageTemplates')}</span>
                        <span className="text-sm font-medium text-blue-600">
                          {t('bengaliEnglish')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-start">
                    <Settings className="mr-2 mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        {t('messagingSystemStatus')}
                      </p>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                        {t('allMessagingServicesConfiguredAndRunning')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Receivables Form Modal */}
      <CustomerReceivablesForm
        isOpen={isReceivablesFormOpen}
        onClose={() => setIsReceivablesFormOpen(false)}
        onSuccess={handleReceivablesSuccess}
      />
    </div>
  );
}
