import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { ExpenseParentCategory, ExpenseCategory } from '@/hooks/useCategories';
import { expenseSchema, ExpenseFormData } from '@/lib/validations/expense';
import { useSettings } from '@/contexts/SettingsContext';
import { useSession } from 'next-auth/react';
import { z } from 'zod';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  parentCategories: ExpenseParentCategory[];
  initialData?: Partial<ExpenseFormData>;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentCategories = [],
  initialData,
  title,
  submitLabel,
  isSubmitting,
}) => {
  const { data: session } = useSession();
  const { t } = useSettings();

  // Check if user is admin (can select any date) or manager (restricted to today)
  const isAdmin = session?.user?.role === 'ADMIN';
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<
    ExpenseFormData & { parentCategoryId: string }
  >({
    amount: 0,
    description: '',
    parentCategoryId: '',
    categoryId: '',
    expenseDate: today,
    receiptUrl: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subCategories, setSubCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        parentCategoryId: (initialData as any).parentCategoryId || '',
      }));
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.parentCategoryId) {
      const parentCategory = parentCategories.find(
        (c) => c.id === formData.parentCategoryId
      );
      setSubCategories(parentCategory?.categories || []);
    } else {
      setSubCategories([]);
    }
  }, [formData.parentCategoryId, parentCategories]);

  const validateForm = () => {
    try {
      expenseSchema.parse(formData);
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
      amount: 0,
      description: '',
      parentCategoryId: '',
      categoryId: '',
      expenseDate: '',
      receiptUrl: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: keyof ExpenseFormData,
    value: string | number
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="bg-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg shadow-xl">
        <div className="border-border flex items-center justify-between border-b p-6">
          <h2 className="text-foreground text-xl font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Amount */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('amount')} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) =>
                handleInputChange('amount', parseFloat(e.target.value) || 0)
              }
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.amount ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t('amountPlaceholder')}
            />
            {errors.amount && (
              <p className="text-destructive mt-1 text-sm">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('description')}
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.description ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t('enterExpenseDescription')}
            />
            {errors.description && (
              <p className="text-destructive mt-1 text-sm">
                {errors.description}
              </p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('parentCategory')} *
            </label>
            <select
              value={formData.parentCategoryId}
              onChange={(e) =>
                handleInputChange(
                  'parentCategoryId' as keyof ExpenseFormData,
                  e.target.value
                )
              }
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.parentCategoryId ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">{t('selectParentCategory')}</option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.parentCategoryId && (
              <p className="text-destructive mt-1 text-sm">
                {errors.parentCategoryId}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('category')} *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              disabled={!formData.parentCategoryId}
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.categoryId ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">{t('selectCategory')}</option>
              {subCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-destructive mt-1 text-sm">
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Expense Date */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('expenseDate')} *
              {!isAdmin && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({t('fixedToToday')})
                </span>
              )}
            </label>
            <input
              type="date"
              value={formData.expenseDate}
              disabled={!isAdmin}
              onChange={(e) => handleInputChange('expenseDate', e.target.value)}
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.expenseDate ? 'border-destructive' : 'border-border'
              } ${!isAdmin ? 'bg-muted cursor-not-allowed' : ''}`}
            />
            {errors.expenseDate && (
              <p className="text-destructive mt-1 text-sm">
                {errors.expenseDate}
              </p>
            )}
          </div>

          {/* Receipt URL */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('receiptUrl')}
            </label>
            <input
              type="url"
              value={formData.receiptUrl || ''}
              onChange={(e) => handleInputChange('receiptUrl', e.target.value)}
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.receiptUrl ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t('receiptUrlPlaceholder')}
            />
            {errors.receiptUrl && (
              <p className="text-destructive mt-1 text-sm">
                {errors.receiptUrl}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className={`bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.notes ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t('additionalNotesComments')}
            />
            {errors.notes && (
              <p className="text-destructive mt-1 text-sm">{errors.notes}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-border flex justify-end space-x-3 border-t pt-4">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
