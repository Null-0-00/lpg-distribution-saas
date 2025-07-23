import React, { memo, useMemo } from 'react';
import { ExpenseTable } from '../ExpenseTable';
import { Expense } from '@/hooks/useExpenses';

interface MemoizedExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  currentUserRole: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string, description: string) => void;
  onApproveExpense: (expenseId: string) => void;
  onRejectExpense: (expenseId: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const MemoizedExpenseTable = memo<MemoizedExpenseTableProps>(
  ({
    expenses,
    loading,
    currentUserRole,
    pagination,
    onEditExpense,
    onDeleteExpense,
    onApproveExpense,
    onRejectExpense,
    onPageChange,
    onLimitChange
  }) => {
    // Memoize expensive calculations
    const memoizedExpenses = useMemo(() => {
      return expenses.map(expense => ({
        ...expense,
        formattedAmount: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(expense.amount),
        formattedDate: new Date(expense.expenseDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));
    }, [expenses]);

    const memoizedPagination = useMemo(() => ({
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages
    }), [pagination.page, pagination.limit, pagination.total, pagination.pages]);

    return (
      <ExpenseTable
        expenses={memoizedExpenses}
        loading={loading}
        currentUserRole={currentUserRole}
        pagination={memoizedPagination}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        onApproveExpense={onApproveExpense}
        onRejectExpense={onRejectExpense}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );
  }
);

MemoizedExpenseTable.displayName = 'MemoizedExpenseTable';