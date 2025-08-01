import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ExpenseCategory, ExpenseParentCategory } from '@/hooks/useCategories';
import { categorySchema, CategoryFormData } from '@/lib/validations/expense';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  parentCategories: ExpenseParentCategory[];
  initialData?: Partial<CategoryFormData>;
  editingCategory?: ExpenseCategory | null;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentCategories,
  initialData,
  editingCategory,
  title,
  submitLabel,
  isSubmitting,
}) => {
  const { t } = useTranslation({ component: 'CategoryForm' });
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: '',
    budget: undefined,
    isParent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    } else if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        parentId: editingCategory.parentId || '',
        budget: editingCategory.budget || undefined,
        isParent: false,
      });
    }
  }, [initialData, editingCategory]);

  const validateForm = () => {
    try {
      categorySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      budget: undefined,
      isParent: false,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: keyof CategoryFormData,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }

    // Clear parentId when isParent is true
    if (field === 'isParent' && value === true) {
      setFormData((prev) => ({
        ...prev,
        parentId: '',
        budget: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="bg-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg shadow-xl">
        <div className="border-border flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Category Type */}
          {!editingCategory && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('categoryType')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={!formData.isParent}
                    onChange={() => handleInputChange('isParent', false)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('subCategoryWithBudget')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="categoryType"
                    checked={formData.isParent}
                    onChange={() => handleInputChange('isParent', true)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('parentCategoryGroupingOnly')}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('enterCategoryName')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('description')}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.description
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('enterCategoryDescription')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Parent Category (only for sub-categories) */}
          {!formData.isParent && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('parentCategory')}
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => handleInputChange('parentId', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.parentId
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">{t('noParentCategory')}</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.parentId}
                </p>
              )}
            </div>
          )}

          {/* Budget (only for sub-categories) */}
          {!formData.isParent && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('monthlyBudget')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget || ''}
                onChange={(e) =>
                  handleInputChange(
                    'budget',
                    parseFloat(e.target.value) || null
                  )
                }
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.budget
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.budget}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('leaveEmptyForNoBudgetLimit')}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground border-border hover:bg-muted/50 rounded-md border px-4 py-2 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  {t('submitting')}
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
