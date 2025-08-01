import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import {
  AVAILABLE_PAGES,
  PagePermission,
  PAGE_CATEGORIES,
} from '@/lib/types/page-permissions';
import { useTranslation } from '@/hooks/useTranslation';

interface PagePermissionsSelectorProps {
  selectedPermissions: string[];
  onPermissionChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PagePermissionsSelector: React.FC<
  PagePermissionsSelectorProps
> = ({ selectedPermissions, onPermissionChange, disabled = false }) => {
  const { t } = useTranslation({ component: 'PagePermissionsSelector' });
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
          className="flex items-center justify-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
        >
          <Check className="mr-2 h-4 w-4" />
          Select All
        </button>
        <button
          type="button"
          onClick={selectNoPages}
          disabled={disabled}
          className="flex items-center justify-center rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Select None
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
            <div
              key={category}
              className="rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between rounded-t-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="mr-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <Shield className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({categoryPages.length} pages)
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
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectionState === 'all'
                      ? 'All'
                      : selectionState === 'partial'
                        ? 'Some'
                        : 'None'}
                  </span>
                </label>
              </div>

              {isExpanded && (
                <div className="space-y-2 rounded-b-lg bg-white p-3 dark:bg-gray-900">
                  {categoryPages.map((page) => (
                    <label
                      key={page.id}
                      className="flex items-start space-x-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(page.id)}
                        onChange={() => handlePermissionToggle(page.id)}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {page.description}
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

      <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Selected:</strong> {selectedPermissions.length} of{' '}
          {AVAILABLE_PAGES.length} pages
        </div>
      </div>
    </div>
  );
};
