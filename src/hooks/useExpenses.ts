import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  notes?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  category: {
    id: string;
    name: string;
    budget: number | null;
    parent?: {
      id: string;
      name: string;
    } | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesSummary {
  total: { count: number; amount: number };
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
}

interface UseExpensesProps {
  currentMonth: { month: number; year: number };
  filters: {
    status: string;
    categoryId: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  updatePagination?: (pagination: { page: number; limit: number; total: number; pages: number }) => void;
}

export const useExpenses = ({ currentMonth, filters, pagination, updatePagination }: UseExpensesProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpensesSummary>({
    total: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getMonthDateRange = (year: number, month: number) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0); // This gets the last day of the month
    
    // Use local date formatting to avoid timezone issues
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startFormatted = formatLocalDate(start);
    const endFormatted = formatLocalDate(end);
    
    console.log('🗓️ Date Range Calculation (Fixed):');
    console.log(`Input: Year=${year}, Month=${month}`);
    console.log(`Start: ${startFormatted}, End: ${endFormatted}`);
    
    return {
      start: startFormatted,
      end: endFormatted
    };
  };

  const fetchExpenses = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const monthRange = getMonthDateRange(currentMonth.year, currentMonth.month);
      
      // Debug: Log the current month range being applied
      console.log('🔍 Expense Filter Debug:');
      console.log('📅 Current Month:', `${currentMonth.month}/${currentMonth.year}`);
      console.log('📊 Date Range:', `${monthRange.start} to ${monthRange.end}`);
      console.log('🎯 Custom Date Range Active:', !!(filters.dateFrom && filters.dateTo));
      console.log('🔧 All Filters:', filters);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        month: currentMonth.month.toString(),
        year: currentMonth.year.toString(),
        // Apply month filtering by default, unless custom date range is specified
        ...(filters.dateFrom && filters.dateTo ? {} : {
          dateFrom: monthRange.start,
          dateTo: monthRange.end
        }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/expenses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      const data = await response.json();
      
      // Debug API response
      console.log('📡 API Response Debug:');
      console.log('📊 Expenses count:', data.expenses?.length || 0);
      console.log('📄 Pagination data:', data.pagination);
      console.log('📈 Summary data:', data.summary);
      
      setExpenses(data.expenses || []);
      setSummary(data.summary || {
        total: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
        approved: { count: 0, amount: 0 }
      });
      
      // Update pagination state if callback provided
      if (updatePagination && data.pagination) {
        updatePagination(data.pagination);
      }
      
      return {
        expenses: data.expenses || [],
        pagination: data.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses. Please try again.",
        variant: "destructive"
      });
      return { expenses: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    } finally {
      setLoading(false);
    }
  }, [currentMonth, filters, pagination.page, pagination.limit, toast]);

  const createExpense = async (expenseData: {
    amount: number;
    description: string;
    categoryId: string;
    expenseDate: string;
    receiptUrl?: string;
    notes?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }

      const data = await response.json();
      
      if (data.budgetWarning) {
        toast({
          title: "Budget Warning",
          description: data.budgetWarning,
          variant: "destructive"
        });
      }

      await fetchExpenses();
      
      const successMessage = data.expense?.isApproved 
        ? 'Expense created and approved successfully'
        : 'Expense created successfully and is pending approval';
      
      toast({
        title: "Success",
        description: successMessage,
        variant: "default"
      });

      return data.expense;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create expense",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExpense = async (expenseId: string, expenseData: {
    amount: number;
    description: string;
    categoryId: string;
    expenseDate: string;
    receiptUrl?: string;
    notes?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }

      await fetchExpenses();
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update expense",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (expenseId: string, description: string) => {
    if (!window.confirm(`Are you sure you want to delete "${description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }

      await fetchExpenses();
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  const approveExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve expense');
      }

      await fetchExpenses();
      
      toast({
        title: "Success",
        description: "Expense approved successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve expense",
        variant: "destructive"
      });
    }
  };

  const rejectExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/reject`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject expense');
      }

      await fetchExpenses();
      
      toast({
        title: "Success",
        description: "Expense rejected successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject expense",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    summary,
    loading,
    isSubmitting,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    refetchExpenses: fetchExpenses
  };
};