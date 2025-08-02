import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Folder, Tag } from 'lucide-react';
import { ExpenseCategory, ExpenseParentCategory } from '@/hooks/useCategories';
import { CategoryForm } from './forms/CategoryForm';
import { CategoryFormData } from '@/lib/validations/expense';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  parentCategories: ExpenseParentCategory[];
  onCreateCategory: (data: CategoryFormData) => Promise<void>;
  onUpdateCategory: (
    categoryId: string,
    data: Partial<CategoryFormData>
  ) => Promise<void>;
  onDeleteCategory: (
    categoryId: string,
    categoryName: string,
    isParent?: boolean
  ) => Promise<void>;
  loading: boolean;
  isSubmitting: boolean;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  isOpen,
  onClose,
  categories,
  parentCategories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  loading,
  isSubmitting,
}) => {
  const { t } = useTranslation({ component: 'CategoryManagement' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [editingParentCategory, setEditingParentCategory] =
    useState<ExpenseParentCategory | null>(null);

  const handleCreateCategory = async (data: CategoryFormData) => {
    await onCreateCategory(data);
    setShowCategoryForm(false);
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } else if (editingParentCategory) {
      await onUpdateCategory(editingParentCategory.id, data);
      setEditingParentCategory(null);
    }
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
  };

  const handleEditParentCategory = (parentCategory: ExpenseParentCategory) => {
    setEditingParentCategory(parentCategory);
  };

  const handleDeleteCategory = async (category: ExpenseCategory) => {
    await onDeleteCategory(category.id, category.name);
  };

  const handleDeleteParentCategory = async (
    parentCategory: ExpenseParentCategory
  ) => {
    await onDeleteCategory(parentCategory.id, parentCategory.name, true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return t('noParent');
    const parent = parentCategories.find((p) => p.id === parentId);
    return parent ? parent.name : t('unknownParent');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
        <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg shadow-xl">
          <div className="border-border flex items-center justify-between border-b p-6">
            <h2 className="text-foreground text-xl font-semibold">
              {t('categoryManagement')}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Add Category Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center rounded-lg px-4 py-2 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('addNewCategory')}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="text-muted-foreground ml-2">
                  {t('loadingCategories')}
                </span>
              </div>
            ) : (
              <>
                {/* Parent Categories Section */}
                <div className="mb-8">
                  <h3 className="text-foreground mb-4 flex items-center text-lg font-semibold">
                    <Folder className="mr-2 h-5 w-5" />
                    {t('parentCategories')} ({parentCategories.length})
                  </h3>

                  {parentCategories.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center">
                      {t('noParentCategoriesFound')}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {parentCategories.map((parent) => (
                        <div
                          key={parent.id}
                          className="bg-muted border-border rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Folder className="mr-2 h-5 w-5 text-blue-600" />
                              <h4 className="text-foreground font-medium">
                                {parent.name}
                              </h4>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditParentCategory(parent)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                title={t('editParentCategory')}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteParentCategory(parent)
                                }
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                title={t('deleteParentCategory')}
                                disabled={
                                  parent.categories &&
                                  parent.categories.length > 0
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {parent.description && (
                            <p className="text-muted-foreground mt-1 text-sm">
                              {parent.description}
                            </p>
                          )}
                          <div className="text-muted-foreground mt-2 text-sm">
                            {parent.categories?.length || 0}{' '}
                            {t('subCategories')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Categories Section */}
                <div>
                  <h3 className="text-foreground mb-4 flex items-center text-lg font-semibold">
                    <Tag className="mr-2 h-5 w-5" />
                    {t('subCategoriesTitle')} ({categories.length})
                  </h3>

                  {categories.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center">
                      {t('noSubCategoriesFound')}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="border-border w-full border-collapse border ">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('name')}
                            </th>
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('parent')}
                            </th>
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('budget')}
                            </th>
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('spentThisMonth')}
                            </th>
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('status')}
                            </th>
                            <th className="border-border border px-4 py-2 text-left text-sm font-medium text-gray-900  dark:text-white">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-muted/50">
                              <td className="border-border border px-4 py-2 ">
                                <div>
                                  <div className="text-foreground font-medium">
                                    {category.name}
                                  </div>
                                  {category.description && (
                                    <div className="text-muted-foreground text-sm">
                                      {category.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="border-border border px-4 py-2 text-sm text-gray-600  dark:text-gray-400">
                                {getParentName(category.parentId || null)}
                              </td>
                              <td className="border-border border px-4 py-2 text-sm text-gray-600  dark:text-gray-400">
                                {category.budget
                                  ? formatCurrency(category.budget)
                                  : t('noBudget')}
                              </td>
                              <td className="border-border border px-4 py-2 text-sm text-gray-600  dark:text-gray-400">
                                {formatCurrency(category.currentMonthSpending)}
                              </td>
                              <td className="border-border border px-4 py-2 ">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    category.isActive
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}
                                >
                                  {category.isActive
                                    ? t('active')
                                    : t('inactive')}
                                </span>
                                {category.isOverBudget && (
                                  <span className="ml-1 inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                                    {t('overBudget')}
                                  </span>
                                )}
                              </td>
                              <td className="border-border border px-4 py-2 ">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditCategory(category)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    title={t('editCategory')}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                    title={t('deleteCategory')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={
          showCategoryForm || !!editingCategory || !!editingParentCategory
        }
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
          setEditingParentCategory(null);
        }}
        onSubmit={
          editingCategory || editingParentCategory
            ? handleUpdateCategory
            : handleCreateCategory
        }
        parentCategories={parentCategories}
        editingCategory={editingCategory}
        title={
          editingCategory
            ? t('editCategory')
            : editingParentCategory
              ? t('editParentCategory')
              : t('addNewCategory')
        }
        submitLabel={
          editingCategory
            ? t('updateCategory')
            : editingParentCategory
              ? t('updateParentCategory')
              : t('createCategory')
        }
        isSubmitting={isSubmitting}
      />
    </>
  );
};
