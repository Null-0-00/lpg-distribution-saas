"use client";

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Custom hooks
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useExpensePagination } from '@/hooks/useExpensePagination';

// Components
import { ExpenseErrorBoundary } from '@/components/expenses/ErrorBoundary';
import { MemoizedExpenseHeader } from '@/components/expenses/optimized/MemoizedExpenseHeader';
import { MonthNavigation } from '@/components/expenses/MonthNavigation';
import { MemoizedExpenseStatCards } from '@/components/expenses/optimized/MemoizedExpenseStatCards';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { MemoizedExpenseTable } from '@/components/expenses/optimized/MemoizedExpenseTable';
import { ExpenseForm } from '@/components/expenses/forms/ExpenseForm';
import { CategoryManagement } from '@/components/expenses/CategoryManagement';

// Types
import { ExpenseFormData, CategoryFormData } from '@/lib/validations/expense';

export default function ExpensesPage() {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role;

  // Month state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  });

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Initialize custom hooks
  const { filters, debouncedFilters, updateFilter, resetFilters, hasActiveFilters } = useExpenseFilters();
  
  const { 
    pagination, 
    goToPage, 
    changeLimit, 
    setTotalResults,
    updatePagination 
  } = useExpensePagination();

  const { 
    categories, 
    parentCategories, 
    loading: loadingCategories, 
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories({ 
    currentMonth 
  });

  const { 
    expenses, 
    summary, 
    loading: loadingExpenses, 
    isSubmitting,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    refetchExpenses
  } = useExpenses({ 
    currentMonth, 
    filters: debouncedFilters, 
    pagination 
  });

  // Month navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = direction === 'prev' ? prev.month - 1 : prev.month + 1;
      if (newMonth < 1) {
        return { month: 12, year: prev.year - 1 };
      } else if (newMonth > 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { ...prev, month: newMonth };
    });
  }, []);

  // Modal handlers
  const openAddExpenseModal = useCallback(() => {
    setIsAddExpenseModalOpen(true);
  }, []);

  const openCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(true);
  }, []);

  const openEditExpenseModal = useCallback((expense: any) => {
    setEditingExpense(expense);
    setIsEditExpenseModalOpen(true);
  }, []);

  // Form handlers
  const handleCreateExpense = async (data: ExpenseFormData) => {
    await createExpense(data);
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
      setEditingExpense(null);
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    await createCategory(data);
  };

  // Table handlers
  const handleDeleteExpense = useCallback((expenseId: string, description: string) => {
    deleteExpense(expenseId, description);
  }, [deleteExpense]);

  const handleApproveExpense = useCallback((expenseId: string) => {
    approveExpense(expenseId);
  }, [approveExpense]);

  const handleRejectExpense = useCallback((expenseId: string) => {
    rejectExpense(expenseId);
  }, [rejectExpense]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    goToPage(page);
  }, [goToPage]);

  const handleLimitChange = useCallback((limit: number) => {
    changeLimit(limit);
  }, [changeLimit]);

  // Filter handlers
  const handleFilterChange = useCallback((key: string, value: string) => {
    updateFilter(key as any, value);
  }, [updateFilter]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <ExpenseErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header */}
        <MemoizedExpenseHeader
          onAddExpense={openAddExpenseModal}
          onManageCategories={openCategoryModal}
        />

        {/* Month Navigation */}
        <MonthNavigation
          currentMonth={currentMonth}
          onNavigateMonth={navigateMonth}
        />

        {/* Summary Cards */}
        <MemoizedExpenseStatCards
          summary={summary}
          loading={loadingExpenses}
        />

        {/* Filters */}
        <ExpenseFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Expense Table */}
        <MemoizedExpenseTable
          expenses={expenses}
          loading={loadingExpenses}
          currentUserRole={currentUserRole || ''}
          pagination={pagination}
          onEditExpense={openEditExpenseModal}
          onDeleteExpense={handleDeleteExpense}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

        {/* Add Expense Modal */}
        <ExpenseForm
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          onSubmit={handleCreateExpense}
          parentCategories={parentCategories}
          title="Add New Expense"
          submitLabel="Add Expense"
          isSubmitting={isSubmitting}
        />

        {/* Edit Expense Modal */}
        <ExpenseForm
          isOpen={isEditExpenseModalOpen}
          onClose={() => {
            setIsEditExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSubmit={handleUpdateExpense}
          parentCategories={parentCategories}
          initialData={editingExpense ? {
            amount: editingExpense.amount,
            description: editingExpense.description,
            categoryId: editingExpense.category.id,
            expenseDate: editingExpense.expenseDate,
            receiptUrl: editingExpense.receiptUrl || '',
            notes: editingExpense.notes || ''
          } : undefined}
          title="Edit Expense"
          submitLabel="Update Expense"
          isSubmitting={isSubmitting}
        />

        {/* Category Management Modal */}
        <CategoryManagement
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          parentCategories={parentCategories}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
          loading={loadingCategories}
          isSubmitting={isSubmitting}
        />
      </div>
    </ExpenseErrorBoundary>
  );
}