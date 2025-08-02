import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  budget: number | null;
  isActive: boolean;
  currentMonthSpending: number;
  budgetUtilization: number | null;
  isOverBudget: boolean;
  remainingBudget: number | null;
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseParentCategory {
  id: string;
  name: string;
  description?: string;
  categories: ExpenseCategory[];
}

interface UseCategoriesProps {
  currentMonth: { month: number; year: number };
}

export const useCategories = ({ currentMonth }: UseCategoriesProps) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<
    ExpenseParentCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: currentMonth.month.toString(),
        year: currentMonth.year.toString(),
        includeInactive: 'true',
      });

      const response = await fetch(`/api/expense-categories?${params}`);
      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentMonth, toast]);

  const fetchParentCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/expense-parent-categories');
      if (!response.ok) throw new Error('Failed to fetch parent categories');

      const data = await response.json();
      setParentCategories(data.parentCategories || []);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load parent categories. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const createCategory = async (categoryData: {
    name: string;
    description?: string;
    parentId?: string;
    budget?: number;
    isParent?: boolean;
  }) => {
    try {
      setIsSubmitting(true);

      if (categoryData.isParent) {
        // Create parent category
        const response = await fetch('/api/expense-parent-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryData.name,
            description: categoryData.description || '',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 'Failed to create parent category'
          );
        }

        await fetchParentCategories();

        toast({
          title: 'Success',
          description: 'Parent category created successfully',
          variant: 'default',
        });
      } else {
        // Create sub-category
        const response = await fetch('/api/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryData.name,
            description: categoryData.description || '',
            parentId: categoryData.parentId || null,
            budget: categoryData.budget || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create category');
        }

        await fetchCategories();

        toast({
          title: 'Success',
          description: 'Category created successfully',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async (
    categoryId: string,
    data: Partial<{
      name: string;
      description?: string;
      parentId?: string;
      budget?: number | null;
      isParent?: boolean;
    }>
  ) => {
    try {
      setIsSubmitting(true);

      const isParentCategory =
        data.isParent ||
        parentCategories.some((parent) => parent.id === categoryId);

      let endpoint;
      let categoryData;

      if (isParentCategory) {
        // Update parent category
        endpoint = `/api/expense-parent-categories/${categoryId}`;
        categoryData = {
          name: data.name!,
          description: data.description,
        };
      } else {
        // Update regular category
        endpoint = `/api/expense-categories/${categoryId}`;
        categoryData = {
          name: data.name!,
          description: data.description,
          budget: data.budget,
          isActive: true,
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }

      // Refresh appropriate data
      if (isParentCategory) {
        await fetchParentCategories();
      } else {
        await fetchCategories();
      }

      toast({
        title: 'Success',
        description: `${isParentCategory ? 'Parent category' : 'Category'} updated successfully`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (
    categoryId: string,
    categoryName: string,
    isParent: boolean = false
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const endpoint = isParent
        ? `/api/expense-parent-categories/${categoryId}`
        : `/api/expense-categories/${categoryId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Refresh appropriate data
      if (isParent) {
        await fetchParentCategories();
      } else {
        await fetchCategories();
      }

      toast({
        title: 'Success',
        description: `${isParent ? 'Parent category' : 'Category'} deleted successfully`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getActiveCategories = () => {
    return categories.filter((category) => category.isActive);
  };

  const getCategoriesByParent = (parentId?: string) => {
    return categories.filter((category) => category.parentId === parentId);
  };

  const getBudgetSummary = () => {
    const totalBudget = categories.reduce(
      (sum, cat) => sum + (cat.budget || 0),
      0
    );
    const totalSpending = categories.reduce(
      (sum, cat) => sum + cat.currentMonthSpending,
      0
    );
    const overBudgetCategories = categories.filter(
      (cat) => cat.isOverBudget
    ).length;

    return {
      totalBudget,
      totalSpending,
      remainingBudget: Math.max(0, totalBudget - totalSpending),
      budgetUtilization:
        totalBudget > 0 ? (totalSpending / totalBudget) * 100 : null,
      overBudgetCategories,
      isOverTotalBudget: totalSpending > totalBudget,
    };
  };

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [fetchCategories, fetchParentCategories]);

  return {
    categories,
    parentCategories,
    loading,
    isSubmitting,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    getCategoriesByParent,
    getBudgetSummary,
    refetchCategories: fetchCategories,
    refetchParentCategories: fetchParentCategories,
  };
};
