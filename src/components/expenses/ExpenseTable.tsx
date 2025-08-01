import React from 'react';
import {
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Expense } from '@/hooks/useExpenses';
import { ExpensePagination } from './ExpensePagination';
import { useSettings } from '@/contexts/SettingsContext';

interface ExpenseTableProps {
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

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  loading,
  currentUserRole,
  pagination,
  onEditExpense,
  onDeleteExpense,
  onApproveExpense,
  onRejectExpense,
  onPageChange,
  onLimitChange,
}) => {
  const { formatCurrency, formatDate, t } = useSettings();

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="bg-muted mb-4 h-4 w-1/4 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-muted h-12 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 shadow">
        <div className="py-8 text-center">
          <div className="text-muted-foreground mx-auto h-12 w-12">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M8 16a6 6 0 116 6v0a6 6 0 01-6-6zM40 16a6 6 0 11-6 6v0a6 6 0 016-6zM16 28a6 6 0 116 6v0a6 6 0 01-6-6zM32 28a6 6 0 116 6v0a6 6 0 01-6-6z"
              />
            </svg>
          </div>
          <h3 className="text-foreground mt-2 text-sm font-medium">
            {t('noExpensesFound')}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('getStartedByAddingFirstExpense')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow">
      <div className="border-border border-b px-6 py-4">
        <h3 className="text-foreground text-lg font-medium">
          {t('expenses')} ({pagination.total})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-muted">
            <tr>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('date')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('description')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('category')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('parentCategory')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('amount')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('submittedBy')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-border divide-y">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/50">
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {formatDate(expense.expenseDate)}
                </td>
                <td className="text-foreground px-6 py-4 text-sm">
                  <div
                    className="max-w-xs truncate"
                    title={expense.description}
                  >
                    {expense.description}
                  </div>
                  {expense.notes && (
                    <div className="text-muted-foreground mt-1 text-xs">
                      {expense.notes}
                    </div>
                  )}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {expense.category.name}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {expense.category.parent?.name || t('notApplicable')}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      expense.isApproved
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {expense.isApproved ? t('approved') : t('pending')}
                  </span>
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {expense.user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {expense.receiptUrl && (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title={t('viewReceipt')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => onEditExpense(expense)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title={t('editExpense')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        onDeleteExpense(expense.id, expense.description)
                      }
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title={t('deleteExpense')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {currentUserRole === 'ADMIN' && !expense.isApproved && (
                      <>
                        <button
                          onClick={() => onApproveExpense(expense.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title={t('approveExpense')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRejectExpense(expense.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('rejectExpense')}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExpensePagination
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};
