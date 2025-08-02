import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import {
  AVAILABLE_PAGES,
  PagePermission,
  PAGE_CATEGORIES,
} from '@/lib/types/page-permissions';
import { useSettings } from '@/contexts/SettingsContext';

const getDescriptionKey = (pageId: string): string => {
  const descriptionMap: Record<string, string> = {
    dashboard: 'mainDashboardOverview',
    'daily-sales-report': 'viewDailySalesReports',
    inventory: 'manageInventoryAndStockLevels',
    analytics: 'businessAnalyticsAndInsights',
    sales: 'manageSalesTransactions',
    receivables: 'trackCustomerReceivables',
    expenses: 'manageBusinessExpenses',
    shipments: 'trackShipmentsAndDeliveries',
    assets: 'manageCompanyAssets',
    drivers: 'manageDriversAndAssignments',
    'product-management': 'manageProductsAndPricing',
    reports: 'generateBusinessReports',
    users: 'manageSystemUsers',
    settings: 'systemSettingsAndConfiguration',
  };
  return descriptionMap[pageId] || pageId;
};

const getPageTranslationKey = (pageId: string): string => {
  const pageKeyMap: Record<string, string> = {
    dashboard: 'dashboardPage',
    'daily-sales-report': 'dailySalesReportPage',
    inventory: 'inventoryPage',
    analytics: 'analyticsPage',
    sales: 'salesPage',
    receivables: 'receivablesPage',
    expenses: 'expensesPage',
    shipments: 'shipmentsPage',
    assets: 'assetsPage',
    drivers: 'driversPage',
    'product-management': 'productManagementPage',
    reports: 'reportsPage',
    users: 'usersPage',
    settings: 'settingsPage',
  };
  return pageKeyMap[pageId] || `${pageId}Page`;
};

interface PagePermissionsSelectorProps {
  selectedPermissions: string[];
  onPermissionChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PagePermissionsSelector: React.FC<
  PagePermissionsSelectorProps
> = ({ selectedPermissions, onPermissionChange, disabled = false }) => {
  const { t } = useSettings();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Overview',
    'Operations',
  ]);

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories((prev) => prev.filter((c) => c !== category));
    } else {
      setExpandedCategories((prev) => [...prev, category]);
    }
  };

  const handlePermissionToggle = (pageId: string) => {
    if (disabled) return;

    if (selectedPermissions.includes(pageId)) {
      onPermissionChange(selectedPermissions.filter((p) => p !== pageId));
    } else {
      onPermissionChange([...selectedPermissions, pageId]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (disabled) return;

    const categoryPages = AVAILABLE_PAGES.filter(
      (page) => page.category === category
    );
    const categoryPageIds = categoryPages.map((page) => page.id);
    const allCategoryPagesSelected = categoryPageIds.every((pageId) =>
      selectedPermissions.includes(pageId)
    );

    if (allCategoryPagesSelected) {
      // Remove all category permissions
      onPermissionChange(
        selectedPermissions.filter((p) => !categoryPageIds.includes(p))
      );
    } else {
      // Add all category permissions
      const newPermissions = [...selectedPermissions];
      categoryPageIds.forEach((pageId) => {
        if (!newPermissions.includes(pageId)) {
          newPermissions.push(pageId);
        }
      });
      onPermissionChange(newPermissions);
    }
  };

  const selectAllPages = () => {
    if (disabled) return;
    onPermissionChange(AVAILABLE_PAGES.map((page) => page.id));
  };

  const selectNoPages = () => {
    if (disabled) return;
    onPermissionChange([]);
  };

  const getCategorySelectionState = (category: string) => {
    const categoryPages = AVAILABLE_PAGES.filter(
      (page) => page.category === category
    );
    const selectedCategoryPages = categoryPages.filter((page) =>
      selectedPermissions.includes(page.id)
    );

    if (selectedCategoryPages.length === 0) return 'none';
    if (selectedCategoryPages.length === categoryPages.length) return 'all';
    return 'partial';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={selectAllPages}
          disabled={disabled}
          className="flex items-center justify-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          <Check className="mr-2 h-4 w-4" />
          {t('selectAll')}
        </button>
        <button
          type="button"
          onClick={selectNoPages}
          disabled={disabled}
          className="bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('selectNone')}
        </button>
      </div>

      <div className="space-y-3">
        {PAGE_CATEGORIES.map((category) => {
          const categoryPages = AVAILABLE_PAGES.filter(
            (page) => page.category === category
          );
          const isExpanded = expandedCategories.includes(category);
          const selectionState = getCategorySelectionState(category);

          return (
            <div key={category} className="border-border rounded-lg border">
              <div className="bg-muted/50 flex items-center justify-between rounded-t-lg p-3">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="hover:bg-muted mr-2 rounded p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <Shield className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-foreground font-medium">
                    {t(category.toLowerCase() as any)}
                  </span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    ({categoryPages.length} {t('pages')})
                  </span>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectionState === 'all'}
                    ref={(input) => {
                      if (input)
                        input.indeterminate = selectionState === 'partial';
                    }}
                    onChange={() => handleCategoryToggle(category)}
                    disabled={disabled}
                    className="border-border h-4 w-4 rounded text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-muted-foreground ml-2 text-sm">
                    {selectionState === 'all'
                      ? t('all')
                      : selectionState === 'partial'
                        ? t('some')
                        : t('none')}
                  </span>
                </label>
              </div>

              {isExpanded && (
                <div className="bg-card space-y-2 rounded-b-lg p-3">
                  {categoryPages.map((page) => (
                    <label
                      key={page.id}
                      className="hover:bg-muted/50 flex items-start space-x-3 rounded p-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(page.id)}
                        onChange={() => handlePermissionToggle(page.id)}
                        disabled={disabled}
                        className="border-border mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground text-sm font-medium">
                          {t(getPageTranslationKey(page.id) as any)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t(getDescriptionKey(page.id) as any)}
                        </div>
                        <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                          {page.path}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
        <div className="text-sm text-blue-800 dark:text-blue-400">
          <strong>{t('selected')}:</strong> {selectedPermissions.length}{' '}
          {t('of')} {AVAILABLE_PAGES.length} {t('pages')}
        </div>
      </div>
    </div>
  );
};
