import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useSession } from 'next-auth/react';

interface ExpenseHeaderProps {
  onAddExpense: () => void;
  onManageCategories: () => void;
}

export const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({
  onAddExpense,
  onManageCategories,
}) => {
  const { t } = useSettings();
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role;
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold">
          {t('expenseManagement')}
        </h1>
        <p className="text-muted-foreground">
          {t('trackExpensesAndManageBudgets')}
        </p>
      </div>
      <div className="flex space-x-2">
        {currentUserRole === 'ADMIN' && (
          <button
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            onClick={onManageCategories}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('manageCategories')}
          </button>
        )}
        <button
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={onAddExpense}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addExpense')}
        </button>
      </div>
    </div>
  );
};
