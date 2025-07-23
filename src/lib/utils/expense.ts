import { Expense } from '@/hooks/useExpenses';
import { ExpenseCategory } from '@/hooks/useCategories';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getMonthDateRange = (year: number, month: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

export const calculateBudgetUtilization = (
  spent: number,
  budget: number | null
): number | null => {
  if (!budget || budget <= 0) return null;
  return (spent / budget) * 100;
};

export const isOverBudget = (spent: number, budget: number | null): boolean => {
  if (!budget || budget <= 0) return false;
  return spent > budget;
};

export const getRemainingBudget = (
  spent: number,
  budget: number | null
): number | null => {
  if (!budget || budget <= 0) return null;
  return Math.max(0, budget - spent);
};

export const sortExpensesByDate = (
  expenses: Expense[],
  direction: 'asc' | 'desc' = 'desc'
): Expense[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.expenseDate).getTime();
    const dateB = new Date(b.expenseDate).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const sortExpensesByAmount = (
  expenses: Expense[],
  direction: 'asc' | 'desc' = 'desc'
): Expense[] => {
  return [...expenses].sort((a, b) => {
    return direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
  });
};

export const filterExpensesByStatus = (
  expenses: Expense[],
  status: 'all' | 'pending' | 'approved'
): Expense[] => {
  if (status === 'all') return expenses;
  return expenses.filter((expense) =>
    status === 'approved' ? expense.isApproved : !expense.isApproved
  );
};

export const filterExpensesByCategory = (
  expenses: Expense[],
  categoryId: string
): Expense[] => {
  if (!categoryId) return expenses;
  return expenses.filter((expense) => expense.category.id === categoryId);
};

export const filterExpensesByDateRange = (
  expenses: Expense[],
  dateFrom: string,
  dateTo: string
): Expense[] => {
  if (!dateFrom || !dateTo) return expenses;

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.expenseDate);
    return expenseDate >= fromDate && expenseDate <= toDate;
  });
};

export const searchExpenses = (
  expenses: Expense[],
  searchTerm: string
): Expense[] => {
  if (!searchTerm.trim()) return expenses;

  const lowercaseSearch = searchTerm.toLowerCase();
  return expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(lowercaseSearch) ||
      expense.category.name.toLowerCase().includes(lowercaseSearch) ||
      expense.user.name.toLowerCase().includes(lowercaseSearch) ||
      expense.notes?.toLowerCase().includes(lowercaseSearch)
  );
};

export const getExpenseStatusColor = (isApproved: boolean): string => {
  return isApproved
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
};

export const getCategoryBudgetStatus = (category: ExpenseCategory) => {
  const utilization = category.budgetUtilization || 0;

  if (utilization >= 100) {
    return { status: 'over', color: 'text-red-600 dark:text-red-400' };
  } else if (utilization >= 80) {
    return { status: 'warning', color: 'text-yellow-600 dark:text-yellow-400' };
  } else {
    return { status: 'good', color: 'text-green-600 dark:text-green-400' };
  }
};

export const generateExpenseReport = (expenses: Expense[]) => {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const approvedAmount = expenses
    .filter((expense) => expense.isApproved)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = expenses
    .filter((expense) => !expense.isApproved)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const categoryBreakdown = expenses.reduce(
    (acc, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, amount: 0 };
      }
      acc[categoryName].count++;
      acc[categoryName].amount += expense.amount;
      return acc;
    },
    {} as Record<string, { count: number; amount: number }>
  );

  return {
    totalExpenses: expenses.length,
    totalAmount,
    approvedAmount,
    pendingAmount,
    categoryBreakdown,
  };
};

export const validateExpenseForm = (
  formData: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.categoryId) {
    errors.categoryId = 'Category is required';
  }

  if (!formData.expenseDate) {
    errors.expenseDate = 'Expense date is required';
  }

  if (formData.receiptUrl && !isValidUrl(formData.receiptUrl)) {
    errors.receiptUrl = 'Invalid URL format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
